/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/fe/core/actions/messageHandling",
		"sap/fe/core/actions/sticky",
		"sap/fe/core/TransactionHelper",
		"sap/base/Log",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/ui/model/json/JSONModel",
		"sap/fe/core/CommonUtils",
		"sap/fe/core/BusyLocker",
		"sap/base/util/merge",
		"sap/fe/core/helpers/SideEffectsUtil",
		"sap/fe/core/library",
		"sap/ui/model/odata/v4/ODataListBinding"
	],
	function(
		BaseObject,
		messageHandling,
		sticky,
		TransactionHelper,
		Log,
		Text,
		Button,
		Dialog,
		JSONModel,
		CommonUtils,
		BusyLocker,
		mergeObjects,
		SideEffectsUtil,
		FELibrary,
		ODataListBinding
	) {
		"use strict";

		var CreationMode = FELibrary.CreationMode,
			mTransactionHelpers = {}, // Map AppID --> TransactionHelper
			Constants = FELibrary.Constants;

		var Extension = BaseObject.extend("sap.fe.core.controllerextensions.EditFlow", {
			configure: function(oView, oRoutingInstance) {
				this.oView = oView;
				this.oRouting = oRoutingInstance;
			},

			onExit: function() {
				this.getUIStateModel().destroy();
			},

			/**
			 * Performs a task in sync with other tasks created via this function.
			 * Returns the task promise chain.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.EditFlow#syncTask
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @static
			 * @param {Promise|Function} [vTask] Optional, a promise or function to be executed and waitFor
			 * @returns {Promise} Promise resolves with ???
			 *
			 * @sap-restricted
			 * @final
			 */
			syncTask: function(vTask) {
				var fnNewTask;
				if (vTask instanceof Promise) {
					fnNewTask = function() {
						return vTask;
					};
				} else if (typeof vTask === "function") {
					fnNewTask = vTask;
				}

				this._pTasks = this._pTasks || Promise.resolve();
				if (!!fnNewTask) {
					this._pTasks = this._pTasks.then(fnNewTask).catch(function() {
						return Promise.resolve();
					});
				}

				return this._pTasks;
			},

			getProgrammingModel: function(oContext) {
				return this.getTransactionHelper().getProgrammingModel(oContext);
			},

			/**
			 * Create new document.
			 *
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {sap.ui.model.odata.v4.ODataListBinding|string} vListBinding  ODataListBinding object or the binding path for a temporary listbinding
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {string} mParameters.creationMode the creation mode to be used
			 *                    NewPage - the created document is shown in a new page, depending on metadata Sync, Async or Deferred is used
			 *                    Sync - the creation is triggered, once the document is created the navigation is done
			 *                    Async - the creation and the navigation to the instance is done in parallel
			 *                    Deferred - the creation is done at the target page
			 *                    Inline - The creation is done inline (in a table)
			 *                    CreationRow - The creation is done with the special creation row
			 * @param {object} mParameters.creationRow instance of the creation row (TODO: get rid but use list bindings only)
			 * @returns {string} the draft admin owner string to be shown
			 */
			createDocument: function(vListBinding, mParameters) {
				var that = this,
					transactionHelper = this.getTransactionHelper(),
					oLockObject = transactionHelper.getUIStateModel(),
					oTable,
					iCountTableItems,
					oResourceBundle = that.oView.getController().oResourceBundle,
					bShouldBusyLock =
						!mParameters ||
						(mParameters.creationMode !== CreationMode.Inline &&
							mParameters.creationMode !== CreationMode.CreationRow &&
							mParameters.creationMode !== CreationMode.External);

				if (mParameters.creationMode === CreationMode.External) {
					// Create by navigating to an external target
					// TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
					return this.syncTask().then(function() {
						var oController = that.oView.getController();
						oController.handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined);
					});
				}

				if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
					oTable = mParameters.creationRow.getParent();
					if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
						var oCreationRowModel = that.oView.getModel("creationRowModel");
						oCreationRowModel.setProperty("/fieldValidity/" + oTable.data("navigationPath"), {});
					}
				}
				if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
					oTable = this.oView.byId(mParameters.tableId);
				}

				function handleSideEffects(oListBinding, oCreationPromise) {
					oCreationPromise
						.then(function(oNewContext) {
							var oBindingContext = that.oView.getBindingContext();
							// if there are transient contexts, we must avoid requesting side effects
							// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
							// if list binding is refreshed, transient contexts might be lost
							if (!CommonUtils.hasTransientContext(oListBinding)) {
								SideEffectsUtil.requestSideEffects(oListBinding.getPath(), oBindingContext);
							}
						})
						.catch(function(oError) {
							Log.error("Error while creating the document", oError);
						});
				}

				bShouldBusyLock && BusyLocker.lock(oLockObject);
				return this.syncTask()
					.then(function() {
						var sProgrammingModel, oListBinding, oModel;

						mParameters = mParameters || {};

						if (vListBinding && typeof vListBinding === "object") {
							// we already get a list binding use this one
							oListBinding = vListBinding;
						} else if (typeof vListBinding === "string") {
							oListBinding = new ODataListBinding(that.oView.getModel(), vListBinding);
							mParameters.creationMode = CreationMode.Sync;
							mParameters.noHistoryEntry = true;
							delete mParameters.createAtEnd;
						} else {
							throw new Error("Binding object or path expected");
						}

						oModel = oListBinding.getModel();
						iCountTableItems = oListBinding.iMaxLength || 0;
						var sCreationMode = mParameters.creationMode;

						// TODO: we will delete this once the UI change for the SD app is created and delivered
						// fow now get the inplace creation mode from the manifest, TODO: shall be a UI change
						if (
							(!sCreationMode || sCreationMode === CreationMode.NewPage) &&
							that.oView.getViewData()._creationMode === "Inplace"
						) {
							sCreationMode = CreationMode.Inline;
						}

						return transactionHelper
							.getProgrammingModel(oListBinding)
							.then(function(programmingModel) {
								sProgrammingModel = programmingModel;
								if (sCreationMode && sCreationMode !== CreationMode.NewPage) {
									// use the passed creation mode
									return sCreationMode;
								} else {
									// we need to determine the creation mode
									switch (sProgrammingModel) {
										case "Draft":
										case "Sticky":
											var oMetaModel = oModel.getMetaModel();
											// NewAction is not yet supported for NavigationProperty collection
											if (!oListBinding.isRelative()) {
												var sPath = oListBinding.getPath(),
													// if NewAction with parameters is present, then creation is 'Deferred'
													// in the absence of NewAction or NewAction with parameters, creation is async
													sNewAction =
														sProgrammingModel === "Draft"
															? oMetaModel.getObject(
																	sPath + "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction"
															  )
															: oMetaModel.getObject(
																	sPath +
																		"@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction"
															  );
												if (sNewAction) {
													var aParameters =
														oMetaModel.getObject("/" + sNewAction + "/@$ui5.overload/0/$Parameter") || [];
													// binding parameter (eg: _it) is not considered
													if (aParameters.length > 1) {
														return CreationMode.Deferred;
													}
												}
											}
											var sMetaPath = oMetaModel.getMetaPath(oListBinding.getHeaderContext().getPath());
											var aNonComputedVisibleKeyFields = CommonUtils.getNonComputedVisibleFields(
												oMetaModel,
												sMetaPath
											);
											if (aNonComputedVisibleKeyFields.length > 0) {
												return CreationMode.Deferred;
											}
											return CreationMode.Async;

										case "NonDraft":
											// TODO: to be checked - for now create them now and then navigate we might also switch to async
											return CreationMode.Sync;
									}
								}
							})
							.then(function(sCreationMode) {
								var oCreation,
									mArgs,
									oCreationRow = mParameters.creationRow,
									oCreationRowContext,
									oValidationCheck = Promise.resolve(),
									oPayload,
									sMetaPath,
									oMetaModel = oModel.getMetaModel();

								if (sCreationMode !== CreationMode.Deferred) {
									if (sCreationMode === CreationMode.CreationRow) {
										oCreationRowContext = oCreationRow.getBindingContext();
										sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
										// prefill data from creation row
										oPayload = oCreationRowContext.getObject();
										mParameters.data = {};
										Object.keys(oPayload).forEach(function(sPropertyPath) {
											var oProperty = oMetaModel.getObject(sMetaPath + "/" + sPropertyPath);
											// ensure navigation properties are not part of the payload, deep create not supported
											if (oProperty && oProperty.$kind === "NavigationProperty") {
												return;
											}
											mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
										});
										oValidationCheck = that.checkForValidationErrors(oCreationRowContext);
									}
									if (sCreationMode === CreationMode.CreationRow || sCreationMode === CreationMode.Inline) {
										// in case the creation failed we keep the failed context
										mParameters.keepTransientContextOnFailed = true;
										// busy handling shall be done locally only
										mParameters.busyMode = "Local";

										if (sCreationMode === CreationMode.CreationRow) {
											// currently the mdc table would also lock the creation row - therefore don't
											// lock at all for now
											mParameters.busyMode = "None";
										}
										if (sCreationMode === CreationMode.Inline) {
											// As the transient lines are not fully implemented and some input from UX is missing
											// we deactivate it for Inline and keep it only for the CreationRow which is anyway
											// not yet final
											mParameters.keepTransientContextOnFailed = false;
										}
										// take care on message handling, draft indicator (in case of draft)
										// Attach the create sent and create completed event to the object page binding so that we can react
										that.handleCreateEvents(oListBinding);
									}

									oCreation = oValidationCheck.then(function() {
										if (!mParameters.parentControl) {
											mParameters.parentControl = that.oView;
										}
										return transactionHelper.createDocument(oListBinding, mParameters, oResourceBundle);
									});
								}

								var oNavigation;
								switch (sCreationMode) {
									case CreationMode.Deferred:
										oNavigation = that.oRouting.navigateForwardToContext(oListBinding, {
											deferredContext: true,
											noHistoryEntry: mParameters.noHistoryEntry,
											editable: true
										});
										break;
									case CreationMode.Async:
										oNavigation = that.oRouting.navigateForwardToContext(oListBinding, {
											asyncContext: oCreation,
											noHistoryEntry: mParameters.noHistoryEntry,
											editable: true
										});
										break;
									case CreationMode.Sync:
										mArgs = {
											noHistoryEntry: mParameters.noHistoryEntry,
											editable: true
										};
										if (sProgrammingModel == "Sticky") {
											mArgs.transient = true;
										}
										oNavigation = oCreation.then(function(oNewDocumentContext) {
											if (!oNewDocumentContext) {
												var oResourceBundle, oNavContainer;
												oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
												oNavContainer = CommonUtils.getAppComponent(that.oView).getRootControl();
												return that.oRouting.navigateToMessagePage(
													oResourceBundle.getText("SAPFE_DATA_RECEIVED_ERROR"),
													{
														title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
														description: oResourceBundle.getText(
															"C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION"
														),
														navContainer: oNavContainer
													}
												);
											} else {
												return that.oRouting.navigateForwardToContext(oNewDocumentContext, mArgs);
											}
										});
										break;
									case CreationMode.Inline:
										oNavigation = handleSideEffects(oListBinding, oCreation);
										break;
									case CreationMode.CreationRow:
										// the creation row shall be cleared once the validation check was successful and
										// therefore the POST can be sent async to the backend
										oNavigation = oValidationCheck
											.then(function() {
												var oCreationRowListBinding = oCreationRowContext.getBinding(),
													oNewTransientContext;

												if (!mParameters.bSkipSideEffects) {
													handleSideEffects(oListBinding, oCreation);
												}

												oNewTransientContext = oCreationRowListBinding.create();
												oCreationRow.setBindingContext(oNewTransientContext);

												// this is needed to avoid console errors TO be checked with model colleagues
												oNewTransientContext.created().catch(function() {
													Log.trace("transient fast creation context deleted");
												});
												return oCreationRowContext.delete("$direct");
											})
											.catch(function(oError) {
												Log.error("CreationRow navigation error: ", oError);
											});
										break;
									default:
										oNavigation = Promise.reject("Unhandled creationMode " + sCreationMode);
										break;
								}

								var oLocalUIModel = that.oView.getModel("localUI");
								if (sProgrammingModel === "Sticky") {
									oLocalUIModel.setProperty("/sessionOn", true);
								}
								if (oCreation) {
									return Promise.all([oCreation, oNavigation]).then(function(aParams) {
										that.setEditMode("Editable", true);
										var oNewDocumentContext = aParams[0];
										if (oNewDocumentContext) {
											that.oRouting.setUIStateCreation();

											if (sProgrammingModel === "Sticky") {
												that._handleStickyOn(oNewDocumentContext);
											}
										}
									});
								}
							});
					})
					.finally(function() {
						if (oTable && oTable.isA("sap.ui.mdc.Table")) {
							switch (mParameters.createAtEnd) {
								case true:
									if (oTable.data("tableType") === "ResponsiveTable" && oTable.getThreshold()) {
										oTable.scrollToIndex(oTable.getThreshold());
									} else {
										oTable.scrollToIndex(iCountTableItems + 1);
									}
									break;
								case false:
									oTable.scrollToIndex(0);
									break;
							}
						}
						bShouldBusyLock && BusyLocker.unlock(oLockObject);
					});
			},

			createMultipleDocuments: function(oListBinding, aData, bCreateAtEnd) {
				var that = this,
					transactionHelper = this.getTransactionHelper(),
					oLockObject = transactionHelper.getUIStateModel(),
					oResourceBundle = that.oView.getController().oResourceBundle;

				BusyLocker.lock(oLockObject);
				return this.syncTask()
					.then(function() {
						var oModel = oListBinding.getModel(),
							oMetaModel = oModel.getMetaModel(),
							sMetaPath;

						if (oListBinding.getContext()) {
							sMetaPath = oMetaModel.getMetaPath(oListBinding.getContext().getPath() + "/" + oListBinding.getPath());
						} else {
							sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath());
						}

						that.handleCreateEvents(oListBinding);

						// Iterate on all items and store the corresponding creation promise
						var aCreationPromises = aData.map(function(mPropertyValues) {
							var mParameters = { data: {} };

							mParameters.keepTransientContextOnFailed = true;
							mParameters.busyMode = "None";
							mParameters.creationMode = "CreationRow";
							mParameters.parentControl = that.oView;
							mParameters.createAtEnd = bCreateAtEnd;

							// Remove navigation properties as we don't support deep create
							for (var sPropertyPath in mPropertyValues) {
								var oProperty = oMetaModel.getObject(sMetaPath + "/" + sPropertyPath);
								if (oProperty && oProperty.$kind !== "NavigationProperty") {
									mParameters.data[sPropertyPath] = mPropertyValues[sPropertyPath];
								}
							}

							return transactionHelper.createDocument(oListBinding, mParameters, oResourceBundle);
						});

						return Promise.all(aCreationPromises);
					})
					.then(function() {
						var oBindingContext = that.oView.getBindingContext();

						// if there are transient contexts, we must avoid requesting side effects
						// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
						// if list binding is refreshed, transient contexts might be lost
						if (!CommonUtils.hasTransientContext(oListBinding)) {
							SideEffectsUtil.requestSideEffects(oListBinding.getPath(), oBindingContext);
						}
					})
					.catch(function(err) {
						Log.error("Error while creating multiple documents.");
						return Promise.reject(err);
					})
					.finally(function() {
						BusyLocker.unlock(oLockObject);
					});
			},

			editDocument: function(oContext, bPrepareOnEdit) {
				var that = this,
					transactionHelper = this.getTransactionHelper();
				return transactionHelper.editDocument(oContext, bPrepareOnEdit, that.oView).then(function(oNewDocumentContext) {
					return transactionHelper.getProgrammingModel(oContext).then(function(sProgrammingModel) {
						var bNoHashChange;

						if (sProgrammingModel === "Sticky") {
							var oLocalUIModel = that.oView.getModel("localUI");
							oLocalUIModel.setProperty("/sessionOn", true);
							bNoHashChange = true;
						}
						that.setEditMode("Editable", false);

						if (oNewDocumentContext !== oContext) {
							return that.handleNewContext(oNewDocumentContext, true, bNoHashChange, true, true, true).then(function() {
								if (sProgrammingModel === "Sticky") {
									// The stickyOn handler must be set after the navigation has been done,
									// as the URL may change in the case of FCL
									that._handleStickyOn(oNewDocumentContext);
								}
							});
						}
					});
				});
			},

			/*
			 * Saves a new document after checking it
			 *
			 * @name saveDocument
			 * @param {object} oContext
			 * @param {boolean} bExecuteSideEffectsOnError  	indicates if we have created a new item in the OP in order to not execute the handleSideEffects method if an item has not been created and the save fails
			 * @returns {promise}
			 */
			saveDocument: function(oContext, bExecuteSideEffectsOnError) {
				var that = this,
					transactionHelper = this.getTransactionHelper(),
					oResourceBundle = that.oView.getController().oResourceBundle;
				// first of all wait until all key-match-requests are done
				return (
					this.syncTask()
						// submit any open changes if there any (although there are validation/parse errors)
						.then(this._submitOpenChanges.bind(this, oContext))
						// check if there are any validation/parse errors
						.then(this.checkForValidationErrors.bind(this, oContext))
						// and finally if all user changes are submitted and valid save the document
						.then(transactionHelper.saveDocument.bind(transactionHelper, oContext, oResourceBundle, bExecuteSideEffectsOnError))
						.then(function(oActiveDocumentContext) {
							return transactionHelper.getProgrammingModel(oContext).then(function(sProgrammingModel) {
								var bNoHashChange;

								if (sProgrammingModel === "Sticky") {
									var oLocalUIModel = that.oView.getModel("localUI");
									oLocalUIModel.setProperty("/sessionOn", false);

									that._handleStickyOff(oContext);

									if (oContext.getPath() === oActiveDocumentContext.getPath()) {
										bNoHashChange = true;
									}
								}
								that.setEditMode("Display", false);

								if (oActiveDocumentContext !== oContext) {
									that.handleNewContext(oActiveDocumentContext, true, bNoHashChange, false, true, false);
								}
							});
						})
				);
			},

			cancelDocument: function(oContext, mParameters) {
				var that = this,
					transactionHelper = this.getTransactionHelper(),
					oResourceBundle = that.oView.getController().oResourceBundle;
				return this.syncTask()
					.then(transactionHelper.cancelDocument.bind(transactionHelper, oContext, mParameters, oResourceBundle))
					.then(function(oActiveDocumentContext) {
						return transactionHelper.getProgrammingModel(oContext).then(function(sProgrammingModel) {
							var bNoHashChange;

							if (sProgrammingModel === "Sticky") {
								var oLocalUIModel = that.oView.getModel("localUI");
								oLocalUIModel.setProperty("/sessionOn", false);
								that._handleStickyOff(oContext);
								bNoHashChange = true;
							}
							that.setEditMode("Display", false);

							//in case of a new document, the value of hasActiveEntity is returned. navigate back.
							if (!oActiveDocumentContext) {
								that.oRouting.setUIStateDirty();
								that.oRouting.navigateBackFromContext(oContext);
							} else {
								//active context is returned in case of cancel of existing document
								return that.handleNewContext(oActiveDocumentContext, true, bNoHashChange, false, true, true);
							}
						});
					});
			},

			deleteSingleDocument: function(oContext, mParameters) {
				var that = this;
				if (!mParameters) {
					mParameters = {
						bFindActiveContexts: false
					};
				} else {
					mParameters.bFindActiveContexts = false;
				}
				return this._deleteDocumentTransaction(oContext, mParameters).then(function() {
					// Single objet deletion is triggered from an OP header button (not from a list)
					// --> Mark UI dirty and navigate back to dismiss the OP
					that.oRouting.setUIStateDirty();
					that.oRouting.navigateBackFromContext(oContext);
				});
			},

			deleteMultipleDocuments: function(aContexts, mParameters) {
				var that = this;
				var oTable = that.oView.byId(mParameters.controlId);
				if (!oTable || !oTable.isA("sap.ui.mdc.Table")) {
					throw new Error("parameter controlId missing or incorrect");
				}
				var oListBinding = oTable.getRowBinding();
				var oTransactionHelper = this.getTransactionHelper();
				mParameters.bFindActiveContexts = true;
				BusyLocker.lock(oTransactionHelper.getUIStateModel());
				return this._deleteDocumentTransaction(aContexts, mParameters)
					.then(function() {
						var oResult;

						// Multiple object deletion is triggered from a list
						// First clear the selection in the table as it's not valid any more
						oTable.clearSelection();

						// Then refresh the list-binding (LR), or require side-effects (OP)
						var oBindingContext = that.oView.getBindingContext();
						if (oListBinding.isRoot()) {
							// keep promise chain pending until refresh of listbinding is completed
							oResult = new Promise(function(resolve) {
								oListBinding.attachEventOnce("dataReceived", function() {
									resolve();
								});
							});
							oListBinding.refresh();
						} else if (oBindingContext) {
							// if there are transient contexts, we must avoid requesting side effects
							// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
							// if list binding is refreshed, transient contexts might be lost
							if (!CommonUtils.hasTransientContext(oListBinding)) {
								SideEffectsUtil.requestSideEffects(oListBinding.getPath(), oBindingContext);
							}
						}

						// deleting at least one object should also set the UI to dirty
						that.oRouting.setUIStateDirty();

						// Finally, check if the current state can be impacted by the deletion, i.e. if there's
						// an OP displaying a deleted object. If yes navigate back to dismiss the OP
						var oAppComponent = CommonUtils.getAppComponent(that.oView);
						var oRouterProxy = oAppComponent.getRouterProxy();
						for (var index = 0; index < aContexts.length; index++) {
							if (oRouterProxy.isCurrentStateImpactedBy(aContexts[index].getPath())) {
								that.oRouting.navigateBackFromContext(aContexts[index]);
								break;
							}
						}

						return oResult;
					})
					.finally(function() {
						BusyLocker.unlock(oTransactionHelper.getUIStateModel());
					});
			},

			_deleteDocumentTransaction: function(oContext, mParameters) {
				var that = this,
					oLocalUIModel = this.oView.getModel("localUI"),
					oResourceBundle = this.oView.getController().oResourceBundle,
					transactionHelper = this.getTransactionHelper();

				mParameters = mParameters || {};

				return this.syncTask()
					.then(transactionHelper.deleteDocument.bind(transactionHelper, oContext, mParameters, oLocalUIModel, oResourceBundle))
					.then(function() {
						var oLocalUIModel = that.oView.getModel("localUI");
						oLocalUIModel.setProperty("/sessionOn", false);
					});
			},

			applyDocument: function(oContext) {
				var that = this,
					oUIModel = this.getTransactionHelper().getUIStateModel();

				BusyLocker.lock(oUIModel);

				return (
					this._submitOpenChanges(oContext)
						// check if there are any validation/parse errors
						.then(this.checkForValidationErrors.bind(this, oContext))
						.then(function() {
							messageHandling.showUnboundMessages();
							that.oRouting.navigateBackFromContext(oContext);
							return true;
						})
						.finally(function() {
							BusyLocker.unlock(oUIModel);
						})
				);
			},

			_submitOpenChanges: function(oContext) {
				var oModel = oContext.getModel();

				//Currently we are using only 1 updateGroupId, hence submitting the batch directly here
				return oModel.submitBatch("$auto").then(function() {
					if (oModel.hasPendingChanges("$auto")) {
						// the submit was not successful
						return Promise.reject("submit of open changes failed");
					}
				});
			},

			_handleStickyOn: function(oContext) {
				var that = this,
					oAppComponent = CommonUtils.getAppComponent(this.oView);

				if (!oAppComponent.getRouterProxy().hasNavigationGuard()) {
					var sHashTracker = oAppComponent.getRouterProxy().getHash(),
						oLocalUIModel = this.oView.getModel("localUI");

					// Set a guard in the RouterProxy
					// A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
					// the new hash, and the guard cannot be found in the managed history of the router proxy
					setTimeout(function() {
						oAppComponent.getRouterProxy().setNavigationGuard();
					}, 0);

					// Setting back navigation on shell service, to get the dicard message box in case of sticky
					oAppComponent.getShellServices().setBackNavigation(that.onBackNavigationInSession.bind(that));

					this.fnDirtyStateProvider = function(oNavigationContext) {
						var sTargetHash = oNavigationContext.innerAppRoute,
							oRouterProxy = oAppComponent.getRouterProxy(),
							bDirty,
							bSessionON = oLocalUIModel.getProperty("/sessionOn");

						// This if block is a workaround to not show the data loss popover in case of explace navigation
						// TODO : We need to remove the below if block once FLP provide the solution to FIORITECHP1-14400
						if (oLocalUIModel.getProperty("/IBN_OpenInNewTable")) {
							oLocalUIModel.setProperty("/IBN_OpenInNewTable", false);
							return;
						}

						if (!bSessionON) {
							// If the sticky session was terminated before hand.
							// Eexample in case of navigating away from application using IBN.
							return;
						}

						if (!oRouterProxy.isNavigationFinalized()) {
							// If navigation is currently happening in RouterProxy, it's a transient state
							// (not dirty)
							bDirty = false;
							sHashTracker = sTargetHash;
						} else if (sHashTracker === sTargetHash) {
							// the hash didn't change so either the user attempts to refresh or to leave the app
							bDirty = true;
						} else if (oRouterProxy.checkHashWithGuard(sTargetHash) || oRouterProxy.isGuardCrossAllowedByUser()) {
							// the user attempts to navigate within the root object
							// or crossing the guard has already been allowed by the RouterProxy
							sHashTracker = sTargetHash;
							bDirty = false;
						} else {
							// the user attempts to navigate within the app, for example back to the list report
							bDirty = true;
						}

						if (bDirty) {
							// the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
							// change this due to compatibility reasons we set it back to not-dirty
							setTimeout(function() {
								oAppComponent.getShellServices().setDirtyFlag(false);
							}, 0);
						}

						return bDirty;
					};

					oAppComponent.getShellServices().registerDirtyStateProvider(this.fnDirtyStateProvider);

					var i18nModel = this.oView.getModel("sap.fe.i18n");

					this.fnHandleSessionTimeout = function() {
						// remove transient messages since we will showing our own message
						messageHandling.removeBoundTransitionMessages();
						messageHandling.removeUnboundTransitionMessages();

						var oDialog = new Dialog({
							title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
							state: "Warning",
							content: new Text({ text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}" }),
							beginButton: new Button({
								text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
								type: "Emphasized",
								press: function() {
									// remove sticky handling after navigation since session has already been terminated
									that._handleStickyOff();
									that.oRouting.navigateBackFromContext(oContext);
								}
							}),
							afterClose: function() {
								oDialog.destroy();
							}
						});
						oDialog.addStyleClass("sapUiContentPadding");
						oDialog.setModel(i18nModel, "sap.fe.i18n");
						that.oView.addDependent(oDialog);
						oDialog.open();
					};
					// handle session timeout
					this.oView.getModel().attachSessionTimeout(this.fnHandleSessionTimeout);

					this.fnStickyDiscardAfterNavigation = function() {
						var sCurrentHash = oAppComponent.getRouterProxy().getHash();
						// either current hash is empty so the user left the app or he navigated away from the object
						if (!sCurrentHash || !oAppComponent.getRouterProxy().checkHashWithGuard(sCurrentHash)) {
							that.fnStickyDiscard(oContext);
						}
					};
					this.oRouting.attachOnAfterNavigation(this.fnStickyDiscardAfterNavigation);
				}
			},
			_handleStickyOff: function() {
				var oAppComponent = CommonUtils.getAppComponent(this.oView);

				if (oAppComponent.getRouterProxy) {
					// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
					// sap.fe.core.AppComponent, hence the 'if' above
					oAppComponent.getRouterProxy().discardNavigationGuard();
				}

				if (this.fnDirtyStateProvider) {
					oAppComponent.getShellServices().deregisterDirtyStateProvider(this.fnDirtyStateProvider);
					this.fnDirtyStateProvider = null;
				}

				if (this.oView.getModel() && this.fnHandleSessionTimeout) {
					this.oView.getModel().detachSessionTimeout(this.fnHandleSessionTimeout);
				}

				this.oRouting.detachOnAfterNavigation(this.fnStickyDiscardAfterNavigation);
				this.fnStickyDiscardAfterNavigation = null;

				this.setEditMode("Display", false);

				if (oAppComponent) {
					// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
					// sap.fe.core.AppComponent, hence the 'if' above
					oAppComponent.getShellServices().setBackNavigation();
				}
			},

			handleNewContext: function(oContext, bNoHistoryEntry, bNoHashChange, bEditable, bPersistOPScroll, bUseHash) {
				this.oRouting.setUIStateDirty();

				return this.oRouting.navigateToContext(oContext, {
					noHistoryEntry: bNoHistoryEntry,
					noHashChange: bNoHashChange,
					editable: bEditable,
					bPersistOPScroll: bPersistOPScroll,
					useHash: bUseHash
				});
			},

			/**
			 * create a new promise to wait for an Action to be executed
			 * @function
			 * @name createActionPromise
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 *
			 * @returns {Function} the resolver function . It can be used to externally resolve the promise
			 */

			createActionPromise: function(sActionName) {
				var that = this,
					fResolver,
					fRejector;
				this.oActionPromise = new Promise(function(resolve, reject) {
					fResolver = resolve;
					fRejector = reject;
				}).then(function(oResponse) {
					return that._getActionResponseDataAndKeys(sActionName, oResponse);
				});
				return { fResolver: fResolver, fRejector: fRejector };
			},

			/**
			 * Get the getCurrentActionPromise object.
			 *
			 * @function
			 * @name getCurrentActionPromise
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 *
			 * @returns {Promise} return a the Promise
			 */
			getCurrentActionPromise: function() {
				return this.oActionPromise;
			},

			/**
			 * Delete a previously created promise.
			 *
			 * @function
			 * @name deleteCurrentActionPromise
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 */
			deleteCurrentActionPromise: function() {
				this.oActionPromise = null;
			},

			/**
			 * Invokes an action - bound/unbound and sets the page dirty.
			 *
			 * @static
			 * @name sap.fe.core.controllerextensions.EditFlow.onCallAction
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {string} sActionName The name of the action to be called
			 * @param {map} [mParameters] contains the following attributes:
			 * @param {sap.ui.model.odata.v4.Context} [mParameters.contexts] contexts Mandatory for a bound action, Either one context or an array with contexts for which the action shall be called
			 * @param {sap.ui.model.odata.v4.ODataModel} [mParameters.model] oModel Mandatory for an unbound action, An instance of an OData v4 model
			 * @param {boolean} [mParameters.bStaticAction] boolean value for static action, undefined for other actions
			 * @param {boolean} [mParameters.isNavigable] boolean value indicating whether the action is navigatable or not
			 * @returns {Promise}
			 * @sap-restricted
			 * @final
			 **/
			onCallAction: function(sActionName, mParameters) {
				var that = this,
					oTable,
					transactionHelper = this.getTransactionHelper(),
					oControl,
					oBindingContext,
					aParts,
					sEntityType;
				var oView = this.oView;
				mParameters.localUIModel = that.oView.getModel("localUI");

				if (!mParameters.parentControl) {
					mParameters.parentControl = this.oView;
				}

				if (mParameters.bStaticAction) {
					oTable = this.oView.byId(mParameters.prefix);
					if (sActionName && sActionName.indexOf("(") > -1) {
						// overloaded action bound to a different entity type
						aParts = sActionName.split("(");
						sActionName = aParts[0];
						sEntityType = aParts[1].slice(0, -1);

						if (sEntityType.indexOf("Collection(") > -1) {
							return Promise.reject(sActionName + " bound to a collection " + sEntityType + " is not supported");
						}

						// search for context in control tree hierarchy
						oControl = oTable;
						while (oControl) {
							oBindingContext = oControl.getBindingContext();
							if (
								oBindingContext &&
								oBindingContext
									.getModel()
									.getMetaModel()
									.getMetaContext(oBindingContext.getPath())
									.getObject("$Type") === sEntityType
							) {
								mParameters.contexts = oBindingContext;
								break;
							} else {
								// check parent
								oControl = oControl.getParent();
							}
						}
						if (!mParameters.contexts) {
							return Promise.reject("Context not found for entity type " + sEntityType);
						}
					} else {
						if (oTable.isTableBound()) {
							mParameters.contexts = oTable.getRowBinding().getHeaderContext();
						} else {
							var sBindingPath = oTable.getRowsBindingInfo().path,
								oListBinding = new ODataListBinding(that.oView.getModel(), sBindingPath);
							mParameters.contexts = oListBinding.getHeaderContext();
						}
					}
				}
				var oCurrentActionCallBacks = this.createActionPromise(sActionName);

				if (mParameters.isNavigable) {
					mParameters.bGetBoundContext = false;
				} else {
					mParameters.bGetBoundContext = true;
				}
				return this.syncTask()
					.then(transactionHelper.onCallAction.bind(transactionHelper, sActionName, mParameters))
					.then(function(oResponse) {
						// if the returned context for the bound action is different than the context on which action was called,
						// refresh the corresponding list binding
						return that
							.refreshListIfRequired(that._getActionResponseDataAndKeys(sActionName, oResponse), mParameters.contexts[0])
							.then(function() {
								return oResponse;
							});
					})
					.then(function(oResponse) {
						oCurrentActionCallBacks.fResolver(oResponse);
						/*
					 We set the (upper) pages to dirty after an execution of an action
					 TODO: get rid of this workaround
					 This workaround is only needed as long as the model does not support the synchronization.
					 Once this is supported we don't need to set the pages to dirty anymore as the context itself
					 is already refreshed (it's just not reflected in the object page)
					 we explicitly don't call this method from the list report but only call it from the object page
					 as if it is called in the list report it's not needed - as we anyway will remove this logic
					 we can live with this
					 we need a context to set the upper pages to dirty - if there are more than one we use the
					 first one as they are anyway siblings
					 */
						if (mParameters.contexts) {
							that.oRouting.setUIStateDirty();
						}
						if (mParameters.isNavigable) {
							var vContext = oResponse;
							if (Array.isArray(vContext) && vContext.length === 1) {
								vContext = vContext[0];
							}
							if (vContext && !Array.isArray(vContext)) {
								var oMetaModel = oView.getModel().getMetaModel();
								var sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
								var oActionContext = oMetaModel.createBindingContext(
									sContextMetaPath + "/" + sActionName + "/@$ui5.overload/0"
								);
								var sActionReturnType =
									oActionContext.getObject() && oActionContext.getObject().$ReturnType
										? oActionContext.getObject().$ReturnType.$Type
										: null;
								var sContextReturnType = oMetaModel.getObject(sContextMetaPath + "/$Type");
								if (sContextReturnType != undefined && sContextReturnType === sActionReturnType) {
									that.oRouting.navigateForwardToContext(vContext, {
										noHistoryEntry: false
									});
								}
							}
						}
					})
					.catch(function(err) {
						// Dialog cancel is handled as promise.reject()
						// Catch it here to prevent an error log entry
						oCurrentActionCallBacks.fRejector();
						if (err == Constants.CancelActionDialog) {
							Log.trace("Dialog cancelled.");
						} else {
							Log.error("Error in EditFlow.onCallAction:" + err);
						}
					});
			},

			/**
			 * Method to format the text of draft admin owner.
			 *
			 * @function
			 * @name formatDraftOwnerText
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {string} sDraftInProcessByUser DraftInProcessByUser property of Draft DraftAdministrativeData
			 * @param {string} sDraftInProcessByUserDesc DraftInProcessByUserDesc property of Draft DraftAdministrativeData
			 * @param {string} sDraftLastChangedByUser DraftLastChangedByUser property of Draft DraftAdministrativeData
			 * @param {string} sDraftLastChangedByUserDesc DraftLastChangedByUserDesc property of Draft DraftAdministrativeData
			 * @param {string} sFlag flag to differanciate between the point of method calls
			 * @returns {string} the draft admin owner string to be shown
			 */
			formatDraftOwnerText: function(
				sDraftInProcessByUser,
				sDraftInProcessByUserDesc,
				sDraftLastChangedByUser,
				sDraftLastChangedByUserDesc,
				sFlag
			) {
				var sDraftOwnerDescription = "";

				var sUserDescription =
					sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;
				if (sFlag) {
					sDraftOwnerDescription += sDraftInProcessByUser
						? CommonUtils.getTranslatedText("C_EDIT_FLOW_GENERIC_LOCKED_OBJECT_POPOVER_TEXT") + " "
						: CommonUtils.getTranslatedText("C_EDIT_FLOW_LAST_CHANGE_USER_TEXT") + " ";
				}
				sDraftOwnerDescription += sUserDescription
					? CommonUtils.getTranslatedText("C_EDIT_FLOW_OWNER", null, [sUserDescription])
					: CommonUtils.getTranslatedText("C_EDIT_FLOW_ANOTHER_USER");
				return sDraftOwnerDescription;
			},

			formatDraftOwnerTextInline: function(
				sDraftInProcessByUser,
				sDraftLastChangedByUser,
				sDraftInProcessByUserDesc,
				sDraftLastChangedByUserDesc
			) {
				return this.formatDraftOwnerText(
					sDraftInProcessByUser,
					sDraftInProcessByUserDesc,
					sDraftLastChangedByUser,
					sDraftLastChangedByUserDesc,
					false
				);
			},
			formatDraftOwnerTextInPopover: function(
				sDraftInProcessByUser,
				sDraftLastChangedByUser,
				sDraftInProcessByUserDesc,
				sDraftLastChangedByUserDesc
			) {
				return this.formatDraftOwnerText(
					sDraftInProcessByUser,
					sDraftInProcessByUserDesc,
					sDraftLastChangedByUser,
					sDraftLastChangedByUserDesc,
					true
				);
			},

			/**
			 * Handles the patchSent event: shows messages and in case of draft updates draft indicator.
			 *
			 * @param oEvent
			 * @returns {Promise}
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 */
			handlePatchSent: function(oEvent) {
				var that = this;
				if (that.editFlow) {
					that = that.editFlow;
				}
				var transactionHelper = that.getTransactionHelper(),
					oTransactionStateModel = transactionHelper.getUIStateModel(),
					oBinding = oEvent.getSource();
				transactionHelper.handleDocumentModifications();
				// for the time being until the model does the synchronization we set the context to dirty
				// therefore the list report is refreshed. once the model does the synchronization this coding
				// needs to be removed
				that.oRouting.setUIStateDirty();
				return transactionHelper.getProgrammingModel(oBinding).then(function(sProgrammingModel) {
					if (sProgrammingModel === "Draft") {
						oTransactionStateModel.setProperty("/draftStatus", "Saving");
					}
				});
			},

			/**
			 * Handles the patchCompleted event: shows messages and in case of draft updates draft indicator.
			 *
			 * @param oEvent
			 * @returns {Promise}
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 */
			handlePatchCompleted: function(oEvent) {
				var that = this;
				if (that.editFlow) {
					that = that.editFlow;
				}
				var transactionHelper = that.getTransactionHelper(),
					oTransactionStateModel = transactionHelper.getUIStateModel(),
					oBinding = oEvent.getSource(),
					bSuccess = oEvent.getParameter("success");
				messageHandling.showUnboundMessages();
				return transactionHelper.getProgrammingModel(oBinding).then(function(sProgrammingModel) {
					if (sProgrammingModel === "Draft") {
						oTransactionStateModel.setProperty("/draftStatus", bSuccess ? "Saved" : "Clear");
					}
				});
			},

			/**
			 * Handles the create event: shows messages and in case of draft updates draft indicator.
			 *
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {object} oBinding odata list binding object
			 */
			handleCreateEvents: function(oBinding) {
				var that = this;
				if (that.editFlow) {
					that = that.editFlow;
				}
				var transactionHelper = that.getTransactionHelper(),
					oTransactionStateModel = transactionHelper.getUIStateModel();

				oTransactionStateModel.setProperty("/draftStatus", "Clear");

				oBinding = (oBinding.getBinding && oBinding.getBinding()) || oBinding;
				oBinding.attachEvent("createSent", function() {
					transactionHelper.handleDocumentModifications();
					transactionHelper
						.getProgrammingModel(oBinding)
						.then(function(sProgrammingModel) {
							if (sProgrammingModel === "Draft") {
								oTransactionStateModel.setProperty("/draftStatus", "Saving");
							}
						})
						.catch(Log.error);
				});
				oBinding.attachEvent("createCompleted", function(oEvent) {
					var bSuccess = oEvent.getParameter("success");
					transactionHelper
						.getProgrammingModel(oBinding)
						.then(function(sProgrammingModel) {
							if (sProgrammingModel === "Draft") {
								oTransactionStateModel.setProperty("/draftStatus", bSuccess ? "Saved" : "Clear");
							}
						})
						.catch(Log.error);
					messageHandling.showUnboundMessages();
				});
			},

			/**
			 * Handles the errors from the table in list report and object page.
			 *
			 * @function
			 * @name handleErrorOfTable
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {object} oEvent Event object
			 */
			handleErrorOfTable: function(oEvent) {
				if (oEvent.getParameter("error")) {
					// show the unbound messages but with a timeout as the messages are otherwise not yet in the message model
					setTimeout(messageHandling.showUnboundMessages, 0);
				}
			},

			/**
			 * Method to retrieve the UI State Model (public API of the model to be described).
			 *
			 * @param oInitialData
			 * @function
			 * @name getUIStateModel
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @returns {sap.ui.model.json.JSONModel} One-Way-Binding UI State Model
			 */
			getUIStateModel: function(oInitialData) {
				if (!this.editFlowStateModel) {
					// create a local state model
					this.editFlowStateModel = new JSONModel({
						createMode: false
					});
				}
				if (oInitialData) {
					this.editFlowStateModel.setData(mergeObjects(this.editFlowStateModel.getData(), oInitialData));
				}
				return this.editFlowStateModel;
			},

			/**
			 * The method decided if a document is to be shown in display or edit mode
			 * @function
			 * @name computeEditMode
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {sap.ui.model.odata.v4.Context} context The context to be displayed / edited
			 * @returns {Promise} Promise resolves once the edit mode is computed
			 */

			computeEditMode: function(oContext) {
				var that = this;

				return new Promise(function(resolve, reject) {
					var oEditFlowStateModel = that.getUIStateModel();

					that.getTransactionHelper()
						.getProgrammingModel(oContext)
						.then(function(sProgrammingModel) {
							if (sProgrammingModel === "Draft") {
								oContext
									.requestObject("IsActiveEntity")
									.then(function(bIsActiveEntity) {
										if (bIsActiveEntity === false) {
											// in case the document is draft set it in edit mode
											that.setEditMode("Editable");
											oContext
												.requestObject("HasActiveEntity")
												.then(function(bHasActiveEntity) {
													// the create mode is only relevant for the local state model
													if (bHasActiveEntity) {
														oEditFlowStateModel.setProperty("/createMode", false);
													} else {
														oEditFlowStateModel.setProperty("/createMode", true);
													}
													resolve();
												})
												.catch(function(oError) {
													Log.error("Error while requesting the HasActiveEntity property", oError);
												});
										} else {
											// active document, stay on display mode
											that.setEditMode("Display");
											resolve();
										}
									})
									.catch(function(oError) {
										Log.error("Error while requesting the IsActiveEntity property", oError);
									});
							} else {
								// in sticky or non-draft nothing to be computed
								resolve();
							}
						})
						.catch(reject);
				});
			},

			/**
			 * Sets the edit mode.
			 *
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {string} sEditMode
			 * @param {boolean} bCreationMode createMode flag to identify the creation mode
			 */
			setEditMode: function(sEditMode, bCreationMode) {
				var oEditFlowStateModel = this.getUIStateModel(),
					oTransactionStateModel = this.getTransactionHelper().getUIStateModel();

				if (sEditMode) {
					// the edit mode has to be set globally
					oTransactionStateModel.setProperty("/editMode", sEditMode);
					oTransactionStateModel.setProperty("/isEditable", sEditMode === "Editable");
				}

				if (bCreationMode !== undefined) {
					// the creation mode is only relevant for the local state model
					oEditFlowStateModel.setProperty("/createMode", bCreationMode);
				}
			},

			/**
			 * Checks if there are validation (parse) errors for controls bound to a given context
			 * @function
			 * @name hasValidationError
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {sap.ui.model.odata.v4.Context} context which should be checked
			 * @returns {Promise} Promise resolves if there are no validation errors and rejects if there are any
			 */

			checkForValidationErrors: function(oContext) {
				return this.syncTask().then(function() {
					var sPath = oContext.getPath(),
						aMessages = sap.ui
							.getCore()
							.getMessageManager()
							.getMessageModel()
							.getData(),
						oControl,
						oMessage;

					for (var i = 0; i < aMessages.length; i++) {
						oMessage = aMessages[i];
						if (oMessage.validation) {
							oControl = sap.ui.getCore().byId(oMessage.getControlId());
							if (
								oControl &&
								oControl.getBindingContext() &&
								oControl
									.getBindingContext()
									.getPath()
									.indexOf(sPath) === 0
							) {
								return Promise.reject("validation errors exist");
							}
						}
					}
				});
			},

			getTransactionHelper: function() {
				if (!this._oTransactionHelper) {
					var oAppComponent = CommonUtils.getAppComponent(this.oView),
						sAppComponentId = oAppComponent.getId();

					// check if a transactionHelper is already created for this app
					// TODO use factory pattern
					if (!mTransactionHelpers[sAppComponentId]) {
						var oHelper = new TransactionHelper();
						oHelper.initialize(oAppComponent);
						mTransactionHelpers[sAppComponentId] = oHelper;
					}

					this._oTransactionHelper = mTransactionHelpers[sAppComponentId];
				}

				return this._oTransactionHelper;
			},
			/**
			 * @description Method to bring discard popover in case of exiting sticky session.
			 *
			 * @function
			 * @name onBackNavigationInSession
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 */
			onBackNavigationInSession: function() {
				var that = this,
					oView = that.oView,
					oAppComponent = CommonUtils.getAppComponent(oView),
					oRouterProxy = oAppComponent.getRouterProxy();

				if (oRouterProxy.checkIfBackIsOutOfGuard()) {
					var oBindingContext = oView && oView.getBindingContext();

					that.getTransactionHelper()
						.getProgrammingModel(oBindingContext)
						.then(function(programmingModel) {
							CommonUtils.processDataLossConfirmation(
								function() {
									that.fnStickyDiscard(oBindingContext);
									history.back();
								},
								oView,
								programmingModel
							);
						})
						.catch(function(oError) {
							Log.error("Error while getting the programmingModel", oError);
						});
					return;
				}
				history.back();
			},
			fnStickyDiscard: function(oContext) {
				sticky.discardDocument(oContext);
				this._handleStickyOff();
			},
			/**
			 * Wrapper to call the onTableContextChange from the view controller if it exists.
			 * @function
			 * @name onTableContextChange
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {object} oEvent
			 */
			onTableContextChange: function(oEvent) {
				var oController = this.getView().getController();
				if (oController.handlers.onTableContextChange) {
					oController.handlers.onTableContextChange.apply(oController, [oEvent]);
				}
			},

			/**
			 * @function
			 * @name _getActionResponseDataAndKeys
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {string} sActionName The name of the action executed
			 * @param {object} oResponse The bound action's response data or response context
			 * @returns {object} Object with data and key fields' names of the response
			 */
			_getActionResponseDataAndKeys: function(sActionName, oResponse) {
				if (Array.isArray(oResponse)) {
					if (oResponse.length === 1) {
						oResponse = oResponse[0];
					} else {
						return null;
					}
				}
				if (!oResponse) {
					return null;
				}
				var oView = this.oView,
					oMetaModel = oView
						.getModel()
						.getMetaModel()
						.getData(),
					sActionReturnType =
						oMetaModel && oMetaModel[sActionName] && oMetaModel[sActionName][0] && oMetaModel[sActionName][0].$ReturnType
							? oMetaModel[sActionName][0].$ReturnType.$Type
							: null,
					aKey = sActionReturnType && oMetaModel[sActionReturnType] ? oMetaModel[sActionReturnType].$Key : null;

				return {
					oData: oResponse.getObject(),
					keys: aKey
				};
			},

			/**
			 * @function
			 * @name refreshListIfRequired
			 * @memberof sap.fe.core.controllerextensions.EditFlow
			 * @param {object} oResponse The bound action's response data and key fields' names
			 * @param {sap.ui.model.odata.v4.Context} oContext The bound context on which action was executed
			 * @returns {Promise} Always resolves to param oResponse
			 */
			refreshListIfRequired: function(oResponse, oContext) {
				if (!oContext || !oResponse || !oResponse.oData) {
					return Promise.resolve();
				}
				var oBinding = oContext.getBinding();
				// refresh only lists
				if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
					var oContextData = oResponse.oData,
						aKeys = oResponse.keys,
						oCurrentData = oContext.getObject(),
						bReturnedContextIsSame = true;
					// ensure context is in the response
					if (Object.keys(oContextData).length) {
						// check if context in response is different than the bound context
						bReturnedContextIsSame = aKeys.every(function(sKey) {
							return oCurrentData[sKey] === oContextData[sKey];
						});
						if (!bReturnedContextIsSame) {
							return new Promise(function(resolve, reject) {
								if (oBinding.isRoot()) {
									oBinding.attachEventOnce("dataReceived", function() {
										resolve();
									});
									oBinding.refresh();
								} else {
									oBinding
										.getContext()
										.requestSideEffects([{ $NavigationPropertyPath: oBinding.getPath() }])
										.then(
											function() {
												resolve();
											},
											function() {
												Log.error("Error while refreshing the table");
												resolve();
											}
										)
										.catch(function(e) {
											Log.error("Error while refreshing the table", e);
										});
								}
							});
						}
					}
				}
				// resolve with oResponse to not disturb the promise chain afterwards
				return Promise.resolve();
			}
		});

		/**
		 * Deletes the TransactionHelper for a given application.
		 *
		 * @param sAppId
		 */
		Extension.onExitApplication = function(sAppId) {
			var oTransactionHelper = mTransactionHelpers[sAppId];
			oTransactionHelper && oTransactionHelper.destroy();
			delete mTransactionHelpers[sAppId];
		};

		return Extension;
	}
);
