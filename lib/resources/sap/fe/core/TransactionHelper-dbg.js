sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/fe/core/AnnotationHelper",
		"sap/fe/core/actions/draft",
		"sap/fe/core/actions/sticky",
		"sap/fe/core/actions/operations",
		"sap/fe/core/model/DraftModel",
		"sap/ui/model/json/JSONModel",
		"sap/fe/core/actions/messageHandling",
		"sap/m/Popover",
		"sap/m/VBox",
		"sap/m/CheckBox",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/m/Dialog",
		"sap/ui/model/BindingMode",
		"sap/base/Log",
		"sap/ui/core/message/Message",
		"sap/fe/core/CommonUtils",
		"sap/fe/core/BusyLocker",
		"sap/fe/core/helpers/SideEffectsUtil",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/XMLTemplateProcessor",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox"
	],
	function(
		BaseObject,
		AnnotationHelper,
		draft,
		sticky,
		operations,
		DraftModel,
		JSONModel,
		messageHandling,
		Popover,
		VBox,
		CheckBox,
		Text,
		Button,
		MessageToast,
		Dialog,
		BindingMode,
		Log,
		Message,
		CommonUtils,
		BusyLocker,
		SideEffectsUtil,
		XMLPreprocessor,
		XMLTemplateProcessor,
		Fragment,
		MessageBox
	) {
		"use strict";

		/* Constants for Programming models */
		var enumProgrammingModel = {
			DRAFT: "Draft",
			STICKY: "Sticky",
			NON_DRAFT: "NonDraft"
		};

		/* Make sure that the mParameters is not the oEvent */
		function getParameters(mParameters) {
			if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
				mParameters = {};
			}
			return mParameters || {};
		}

		return BaseObject.extend("sap.fe.core.TransactionHelper", {
			_bIsModified: false,
			_bCreateMode: false,
			_oAppComponent: null,
			_oResourceBundle: null,

			initialize: function(oAppComponent) {
				this._oAppComponent = oAppComponent;
			},

			destroy: function() {
				this.getUIStateModel().destroy();
				BaseObject.prototype.destroy.apply(this, arguments);
			},

			getProgrammingModel: function(oBinding) {
				var that = this;

				if (!this.sProgrammingModel) {
					var oModel = oBinding.getModel();
					return DraftModel.upgradeOnDemand(oModel).then(function(bIsDraft) {
						if (bIsDraft) {
							that.sProgrammingModel = enumProgrammingModel.DRAFT;
						} else {
							// if the entity set of the binding is not sticky we have to scan through all entity sets as sticky is annotated only on the root
							that.sProgrammingModel = AnnotationHelper.isStickySessionSupported(oModel.getMetaModel())
								? enumProgrammingModel.STICKY
								: enumProgrammingModel.NON_DRAFT;
						}

						return that.sProgrammingModel;
					});
				} else {
					return Promise.resolve(this.sProgrammingModel);
				}
			},

			/**
			 * Returns the UI State model and creates it if not yet existing.
			 *
			 * @function
			 * @name sap.fe.core.TransactionHelper#getUIStateModel
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @returns {sap.ui.model.json.JSONModel} Instance of the UI-State Model
			 *
			 * @sap-restricted
			 * @final
			 */
			getUIStateModel: function() {
				if (!this.uiModel) {
					this.uiModel = new JSONModel({
						editMode: "Display",
						busy: false,
						busyLocal: {},
						draftStatus: "Clear"
					});
					// we expose it as an OneWay-Binding model
					this.uiModel.setDefaultBindingMode(BindingMode.OneWay);
				}
				return this.uiModel;
			},

			/**
			 * Sets the UI State model to be used.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.json.JSONModel} oUIStateModel Instance of the UI-State Model
			 * @sap-restricted
			 * @final
			 */
			setUIStateModel: function(oUIStateModel) {
				this.uiModel = oUIStateModel;
			},

			// Slim Busy Helper Functions
			isBusy: function(sMode, sLocalId) {
				var oUIModel = this.getUIStateModel();
				return BusyLocker.isLocked(oUIModel, sMode === "Global" ? undefined : sLocalId);
			},
			busyHandler: function(sMode, sLocalId, bOn) {
				var sCommand = bOn ? "lock" : "unlock";
				if (sMode === "Global" || sMode === "Local") {
					BusyLocker[sCommand](this.getUIStateModel(), sMode === "Global" ? "/busy" : "/busyLocal/" + sLocalId);
				}
			},
			busyOn: function(sMode, sLocalId) {
				this.busyHandler(sMode, sLocalId, true);
			},
			busyOff: function(sMode, sLocalId) {
				this.busyHandler(sMode, sLocalId, false);
			},

			/**
			 * Creates a new document.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.ODataListBinding} oMainListBinding OData v4 ListBinding object
			 * @param {object} [mParameters] Optional, can contain the following attributes:
			 * @param {boolean} [mParameters.refreshList] control if the list shall be refreshed immediately after creating the instance
			 * @param {map} [mParameters.data] a map of data that should be sent within the POST
			 * @param {string} [mParameters.busyMode] Global (default), Local, None TODO: to be refactored
			 * @param {map} [mParameters.keepTransientContextOnFailed] if set the context stays in the list if the POST failed and POST will be repeated with next change
			 * @param oResourceBundle
			 * @returns {Promise} Promise resolves with New Binding Context
			 * @sap-restricted
			 * @final
			 */
			createDocument: function(oMainListBinding, mParameters, oResourceBundle) {
				var oNewDocumentContext,
					that = this,
					bSkipRefresh,
					sBindingName,
					oModel = oMainListBinding.getModel(),
					oMetaModel = oModel.getMetaModel(),
					sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
					sNewAction =
						!oMainListBinding.isRelative() &&
						(oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction") ||
							oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction")),
					oCreationPromise,
					mBindingParameters = { "$$patchWithoutSideEffects": true },
					sMessagesPath = oMetaModel.getObject(sMetaPath + "/@com.sap.vocabularies.Common.v1.Messages/$Path");

				if (sMessagesPath) {
					mBindingParameters["$select"] = sMessagesPath;
				}

				mParameters = getParameters(mParameters);

				if (!oMainListBinding) {
					return Promise.reject("Binding required for new document creation");
				}

				if (mParameters.busyMode === "Local") {
					// in case of local busy mode we use the list binding name
					// there's no APY yet so we have to use the .sId TODO provide a public method?
					sBindingName = oMainListBinding.sId;
				}

				bSkipRefresh = !mParameters.refreshList;

				that.busyOn(mParameters.busyMode, sBindingName);
				var oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

				if (sNewAction) {
					oCreationPromise = this.onCallAction(sNewAction, {
						contexts: oMainListBinding.getHeaderContext(),
						showActionParameterDialog: true,
						label: oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"),
						bindingParameters: mBindingParameters,
						parentControl: mParameters.parentControl,
						bIsCreateAction: true
					});
				} else {
					var bIsNewPageCreation = mParameters.creationMode !== "CreationRow" && mParameters.creationMode !== "Inline";
					var aNonComputedVisibleKeyFields = bIsNewPageCreation
						? CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath)
						: [];
					if (aNonComputedVisibleKeyFields.length > 0) {
						var oTransientListBinding = oModel.bindList(oMainListBinding.getPath(), oMainListBinding.getContext(), [], [], {
							$$updateGroupId: "submitLater",
							$$groupId: "submitLater"
						});
						oTransientListBinding.refreshInternal = function() {};
						oNewDocumentContext = oTransientListBinding.create(mParameters.data, bSkipRefresh);
						mParameters.keepTransientContextOnFailed = true;
						oCreationPromise = this._launchDialogWithKeyFields(
							oMainListBinding,
							oTransientListBinding,
							oNewDocumentContext,
							aNonComputedVisibleKeyFields,
							oModel,
							mParameters
						);
						oCreationPromise.catch(function() {
							Log.trace("transient creation context deleted");
						});
					} else {
						oNewDocumentContext = oMainListBinding.create(mParameters.data, bSkipRefresh, mParameters.createAtEnd);
						that.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters, oResourceBundleCore);
						oCreationPromise = oNewDocumentContext.created();
					}
				}

				return oCreationPromise
					.then(function(oResult) {
						if (!oMainListBinding.isRelative()) {
							// the create mode shall currently only be set on creating a root document
							that._bCreateMode = true;
						}
						oNewDocumentContext = oNewDocumentContext || (oResult && oResult.response);

						// TODO: where does this one coming from???
						if (oResult && oResult.bConsiderDocumentModified) {
							that.handleDocumentModifications();
						}
						return messageHandling.showUnboundMessages().then(function() {
							return oNewDocumentContext;
						});
					})
					.catch(function(oError) {
						return messageHandling.showUnboundMessages().then(function() {
							// for instance, on cancel of create dialog, the promise is rejected
							// a return here would restore the promise chain and result in errors while routing
							// solution -  reject here as well
							if (oError && oError.bDeleteTransientContext && oNewDocumentContext.isTransient()) {
								// This is a workaround suggested by model as Context.delete results in an error
								// TODO: remove the $direct once model resolves this issue
								// this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
								oNewDocumentContext.delete("$direct");
							}
							return Promise.reject(oError);
						});
					})
					.finally(function() {
						that.busyOff(mParameters.busyMode, sBindingName);
					});
			},

			/**
			 * Find the active contexts of the documents, only for the draft roots.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.Context[]} aContexts contexts Either one context or an array with contexts to be deleted
			 * @param bFindActiveContexts

			 * @returns {Array} Array of the active contexts
			 */
			findActiveDraftRootContexts: function(aContexts, bFindActiveContexts) {
				if (!bFindActiveContexts) {
					return Promise.resolve();
				}

				var activeContexts = aContexts.reduce(function(aResult, oContext) {
					var oMetaModel = oContext.getModel().getMetaModel();
					var sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
					if (oMetaModel.getObject(sMetaPath + "@com.sap.vocabularies.Common.v1.DraftRoot")) {
						var bIsActiveEntity = oContext.getObject().IsActiveEntity,
							bHasActiveEntity = oContext.getObject().HasActiveEntity,
							oActiveContext;
						if (!bIsActiveEntity && bHasActiveEntity) {
							oActiveContext = oContext
								.getModel()
								.bindContext(oContext.getPath() + "/SiblingEntity")
								.getBoundContext();
							aResult.push(oActiveContext);
						}
					}
					return aResult;
				}, []);
				return Promise.all(
					activeContexts.map(function(oContext) {
						return oContext.requestCanonicalPath().then(function() {
							return oContext;
						});
					})
				);
			},

			afterDeleteProcess: function(oLocalUIModel, mParameters, checkBox, aContexts, oResourceBundle) {
				if (oLocalUIModel.getProperty("/$contexts/" + mParameters.id + "/deleteEnabled") != undefined) {
					if (checkBox.isCheckBoxVisible === true && checkBox.isCheckBoxSelected === false) {
						//if unsaved objects are not deleted then we need to set the enabled to true and update the model data for next deletion
						oLocalUIModel.setProperty("/$contexts/" + mParameters.id + "/deleteEnabled", true);
						var obj = Object.assign(oLocalUIModel.getProperty("/$contexts/" + mParameters.id), {});
						obj.selectedContexts = obj.selectedContexts.filter(function(element) {
							return obj.deletableContexts.indexOf(element) === -1;
						});
						obj.deletableContexts = [];
						obj.selectedContexts = [];
						obj.numberOfSelectedContexts = obj.selectedContexts.length;
						oLocalUIModel.setProperty("/$contexts/" + mParameters.id, obj);
					} else {
						oLocalUIModel.setProperty("/$contexts/" + mParameters.id + "/deleteEnabled", false);
						oLocalUIModel.setProperty("/$contexts/" + mParameters.id + "/selectedContexts", []);
						oLocalUIModel.setProperty("/$contexts/" + mParameters.id + "/numberOfSelectedContexts", 0);
					}
				}
				if (aContexts.length === 1) {
					MessageToast.show(
						CommonUtils.getTranslatedText(
							"C_TRANSACTION_HELPER_OBJECT_PAGE_DELETE_TOAST_SINGULAR",
							oResourceBundle,
							null,
							mParameters.entitySetName
						)
					);
				} else {
					MessageToast.show(
						CommonUtils.getTranslatedText(
							"C_TRANSACTION_HELPER_OBJECT_PAGE_DELETE_TOAST_PLURAL",
							oResourceBundle,
							null,
							mParameters.entitySetName
						)
					);
				}
			},

			/**
			 * Delete one or multiple document(s).
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} vContexts contexts Either one context or an array with contexts to be deleted
			 * @param {object} mParameters Optional, can contain the following attributes:
			 * @param {string} mParameters.title Title of the object to be deleted
			 * @param {string} mParameters.description Description of the object to be deleted
			 * @param {string} mParameters.numberOfSelectedContexts Number of objects selected
			 * @param oLocalUIModel
			 * @param oResourceBundle
			 * @returns {Promise}
			 */
			deleteDocument: function(vContexts, mParameters, oLocalUIModel, oResourceBundle) {
				var oUIModel = this.getUIStateModel(),
					fnReject,
					fnResolve,
					aDeletableContexts = [],
					isCheckBoxVisible = false,
					isLockedTextVisible = false,
					cannotBeDeletedTextVisible = false,
					isCheckBoxSelected,
					that = this;
				var oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

				var aParams,
					oDeleteMessage = {
						title: oResourceBundleCore.getText("C_COMMON_OBJECT_PAGE_DELETE")
					};
				BusyLocker.lock(oUIModel);
				if (!Array.isArray(vContexts)) {
					vContexts = [vContexts];
				}
				this.getProgrammingModel(vContexts[0])
					.then(function(sProgrammingModel) {
						if (mParameters) {
							if (!mParameters.numberOfSelectedContexts) {
								if (sProgrammingModel === "Draft") {
									for (var i = 0; i < vContexts.length; i++) {
										var oContextData = vContexts[i].getObject();
										if (
											oContextData.IsActiveEntity === true &&
											oContextData.HasDraftEntity === true &&
											oContextData.DraftAdministrativeData &&
											oContextData.DraftAdministrativeData.InProcessByUser
										) {
											MessageBox.show(
												oResourceBundleCore.getText(
													"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED"
												),
												{
													title: oResourceBundleCore.getText("OBJECT_PAGE_DELETE"),
													onClose: fnReject
												}
											);
											return;
										}
									}
								}
								mParameters = getParameters(mParameters);
								if (mParameters.title) {
									if (mParameters.description) {
										aParams = [mParameters.title, mParameters.description];
										oDeleteMessage.text = CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO",
											oResourceBundle,
											aParams,
											mParameters.entitySetName
										);
									} else {
										oDeleteMessage.text = CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
											oResourceBundle,
											null,
											mParameters.entitySetName
										);
									}
								} else {
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_GENERIC_DELETE",
										oResourceBundle
									);
								}
								aDeletableContexts = vContexts;
							} else {
								oDeleteMessage = {
									title: oResourceBundleCore.getText("OBJECT_PAGE_DELETE")
								};
								if (
									mParameters.numberOfSelectedContexts === 1 &&
									mParameters.numberOfSelectedContexts === vContexts.length
								) {
									aDeletableContexts = vContexts;
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
										oResourceBundle,
										null,
										mParameters.entitySetName
									);
								} else if (mParameters.numberOfSelectedContexts === 1 && mParameters.unSavedContexts.length === 1) {
									//only one unsaved object
									aDeletableContexts = mParameters.unSavedContexts;
									var sLastChangedByUser = aDeletableContexts[0].getObject()["DraftAdministrativeData"]
										? aDeletableContexts[0].getObject()["DraftAdministrativeData"]["LastChangedByUserDescription"]
										: "";
									aParams = [sLastChangedByUser];
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_CHANGES",
										oResourceBundle,
										aParams
									);
								} else if (mParameters.numberOfSelectedContexts === mParameters.unSavedContexts.length) {
									//only multiple unsaved objects
									aDeletableContexts = mParameters.unSavedContexts;
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS",
										oResourceBundle
									);
								} else if (
									mParameters.numberOfSelectedContexts ===
									vContexts.concat(mParameters.unSavedContexts.concat(mParameters.lockedContexts)).length
								) {
									//only unsaved, locked ,deletable objects but not non-deletable objects
									aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
									oDeleteMessage.text =
										aDeletableContexts.length === 1
											? CommonUtils.getTranslatedText(
													"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
													oResourceBundle,
													null,
													mParameters.entitySetName
											  )
											: CommonUtils.getTranslatedText(
													"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL",
													oResourceBundle,
													null,
													mParameters.entitySetName
											  );
								} else {
									//if non-deletable objects exists along with any of unsaved ,deletable objects
									aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
									cannotBeDeletedTextVisible = true;
									oDeleteMessage.text =
										aDeletableContexts.length === 1
											? CommonUtils.getTranslatedText(
													"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE",
													oResourceBundle,
													null,
													mParameters.entitySetName
											  )
											: CommonUtils.getTranslatedText(
													"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE",
													oResourceBundle,
													null,
													mParameters.entitySetName
											  );
									oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE",
										oResourceBundle,
										[
											mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length,
											mParameters.numberOfSelectedContexts
										]
									);
								}
								if (mParameters.lockedContexts.length > 0) {
									//setting the locked text if locked objects exist
									isLockedTextVisible = true;
									oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED",
										oResourceBundle,
										[mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]
									);
								}
								if (
									mParameters.unSavedContexts.length > 0 &&
									mParameters.unSavedContexts.length !== mParameters.numberOfSelectedContexts
								) {
									if (
										(cannotBeDeletedTextVisible || isLockedTextVisible) &&
										aDeletableContexts.length === mParameters.unSavedContexts.length
									) {
										//if only unsaved and either or both of locked and non-deletable objects exist then we hide the check box
										isCheckBoxVisible = false;
										aDeletableContexts = mParameters.unSavedContexts;
										if (mParameters.unSavedContexts.length === 1) {
											oDeleteMessage.text = CommonUtils.getTranslatedText(
												"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR",
												oResourceBundle
											);
										} else {
											oDeleteMessage.text = CommonUtils.getTranslatedText(
												"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL",
												oResourceBundle
											);
										}
									} else {
										if (mParameters.unSavedContexts.length === 1) {
											oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText(
												"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR",
												oResourceBundle
											);
										} else {
											oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText(
												"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL",
												oResourceBundle
											);
										}
										isCheckBoxVisible = true;
									}
								}
								if (cannotBeDeletedTextVisible && isLockedTextVisible) {
									//if both locked and non-deletable objects exist along with deletable objects
									oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_OBJECT_PAGE_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED_AND_NON_DELETABLE",
										oResourceBundle,
										[
											mParameters.numberOfSelectedContexts -
												vContexts.concat(mParameters.unSavedContexts).length -
												mParameters.lockedContexts.length,
											mParameters.lockedContexts.length,
											mParameters.numberOfSelectedContexts
										]
									);
								}
							}
						}
						var oContent = new VBox({
							items: [
								new Text({
									text: oDeleteMessage.nonDeletableText,
									visible: isLockedTextVisible || cannotBeDeletedTextVisible
								}),
								new Text({
									text: oDeleteMessage.text
								}),
								new CheckBox({
									text: oDeleteMessage.checkBoxText,
									selected: true,
									select: function(oEvent) {
										var selected = oEvent.getSource().getSelected();
										if (selected) {
											aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
											isCheckBoxSelected = true;
										} else {
											aDeletableContexts = vContexts;
											isCheckBoxSelected = false;
										}
									},
									visible: isCheckBoxVisible
								})
							]
						});
						var sTitle = mParameters.numberOfSelectedContexts
							? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_PAGE_DELETE_DIALOG", oResourceBundle, [
									mParameters.numberOfSelectedContexts
							  ])
							: oResourceBundleCore.getText("C_COMMON_OBJECT_PAGE_DELETE");
						var oDialog = new Dialog({
							title: sTitle,
							state: "Warning",
							content: [oContent],
							beginButton: new Button({
								text: oResourceBundleCore.getText("C_COMMON_OBJECT_PAGE_DELETE"),
								type: "Emphasized",
								press: function() {
									BusyLocker.lock(oUIModel);
									var aContexts = aDeletableContexts;
									oDialog.close();
									return that
										.findActiveDraftRootContexts(aContexts, mParameters.bFindActiveContexts)
										.then(function(activeContexts) {
											//make sure to fetch the active contexts before deleting the drafts
											return Promise.all(
												aContexts.map(function(oContext) {
													//delete the draft
													return draft.deleteDraft(oContext).catch(function(oError) {
														return messageHandling.showUnboundMessages().then(function() {
															return Promise.reject();
														});
													});
												})
											).then(function() {
												var checkBox = {
													"isCheckBoxVisible": isCheckBoxVisible,
													"isCheckBoxSelected": isCheckBoxSelected
												};
												if (activeContexts && activeContexts.length) {
													return Promise.all(
														activeContexts.map(function(oContext) {
															return oContext.delete();
														})
													).then(function() {
														that.afterDeleteProcess(
															oLocalUIModel,
															mParameters,
															checkBox,
															aContexts,
															oResourceBundle
														);
														return messageHandling.showUnboundMessages().then(fnResolve);
													});
												} else {
													that.afterDeleteProcess(
														oLocalUIModel,
														mParameters,
														checkBox,
														aContexts,
														oResourceBundle
													);
													return messageHandling.showUnboundMessages().then(fnResolve);
												}
											});
										})
										.finally(function() {
											BusyLocker.unlock(oUIModel);
										});
								}
							}),
							endButton: new Button({
								text: CommonUtils.getTranslatedText("C_COMMON_OBJECT_PAGE_CANCEL", oResourceBundle),
								press: function() {
									oDialog.close();
									fnReject();
								}
							}),
							afterClose: function() {
								oDialog.destroy();
							}
						});
						oDialog.addStyleClass("sapUiContentPadding");
						oDialog.open();
					})
					.finally(function() {
						BusyLocker.unlock(oUIModel);
					})
					.catch(function() {
						Log.warning("Couldn't get Programming model");
						fnReject();
					});

				return new Promise(function(resolve, reject) {
					fnReject = reject;
					fnResolve = resolve;
				});
			},

			/**
			 * Edit a document.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document
			 * @param {boolean} bPrepareOnEdit Also call the prepare action for Draft based document
			 * @param {object} oView object of current view
			 * @returns {Promise} Promise resolves with the new Draft Context in case of draft programming model
			 * @sap-restricted
			 * @final
			 */
			editDocument: function(oContext, bPrepareOnEdit, oView) {
				this._bIsModified = false;
				var that = this;
				var oUIModel = this.getUIStateModel();
				if (!oContext) {
					return Promise.reject(new Error("Binding context to active document is required"));
				}
				BusyLocker.lock(oUIModel);
				return this.getProgrammingModel(oContext)
					.then(function(sProgrammingModel) {
						switch (sProgrammingModel) {
							case enumProgrammingModel.DRAFT:
								// store the active context as it can be used in case of deleting the draft
								that.activeContext = oContext;
								return draft.createDraftFromActiveDocument(oContext, {
									bPreserveChanges: true,
									bPrepareOnEdit: bPrepareOnEdit,
									oView: oView
								});
							case enumProgrammingModel.NON_DRAFT:
								return oContext;
							case enumProgrammingModel.STICKY:
								return sticky.editDocumentInStickySession(oContext);
						}
					})
					.then(function(oNewContext) {
						oUIModel.setProperty("/editMode", "Editable");
						oUIModel.setProperty("/isEditable", true);
						that._bCreateMode = false;
						return messageHandling.showUnboundMessages().then(function() {
							return oNewContext;
						});
					})
					.catch(function(err) {
						return messageHandling.showUnboundMessages().then(function() {
							return Promise.reject(err);
						});
					})
					.finally(function() {
						BusyLocker.unlock(oUIModel);
					});
			},

			/**
			 * Update document.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @returns {Promise} Promise resolves with ???
			 *
			 * @sap-restricted
			 * @final
			 */
			updateDocument: function() {
				return Promise.resolve();
			},

			/**
			 * Cancel edit of a document.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} oContext Context of the document to be canceled / deleted
			 * @param {object} [mParameters] Optional, can contain the following attributes:
			 * @param {sap.m.Button} mParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
			 * @param oResourceBundle
			 * @returns {Promise} Promise resolves with ???
			 * @sap-restricted
			 * @final
			 */
			cancelDocument: function(oContext, mParameters, oResourceBundle) {
				var that = this,
					oUIModel = that.getUIStateModel(),
					sProgrammingModel;
				//context must always be passed - mandatory parameter
				if (!oContext) {
					return Promise.reject("No context exists. Pass a meaningful context");
				}

				BusyLocker.lock(oUIModel);

				mParameters = getParameters(mParameters);
				var oParamsContext = oContext,
					oCancelButton = mParameters.cancelButton,
					oModel = oParamsContext.getModel(),
					sCanonicalPath;

				return this.getProgrammingModel(oContext)
					.then(function(sPModel) {
						sProgrammingModel = sPModel;
						if (sPModel === enumProgrammingModel.DRAFT) {
							var draftDataContext = oModel
								.bindContext(oParamsContext.getPath() + "/DraftAdministrativeData")
								.getBoundContext();
							if (!that._bIsModified) {
								return draftDataContext.requestObject().then(function(draftAdminData) {
									that._bIsModified = !(draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime);
								});
							}
							//} else if (sPModel === "Sticky") {
							// Using bIsModified for now.
						} else if (sPModel === enumProgrammingModel.NON_DRAFT) {
							that._bIsModified = oParamsContext.hasPendingChanges();
						}
					})
					.then(function() {
						return that._showDiscardPopover(oCancelButton, that._bIsModified, oResourceBundle);
					})
					.then(function() {
						// eslint-disable-next-line default-case
						switch (sProgrammingModel) {
							case enumProgrammingModel.DRAFT:
								return oParamsContext.requestObject("HasActiveEntity").then(function(bHasActiveEntity) {
									var oDeletePromise;
									if (!bHasActiveEntity) {
										if (oParamsContext && oParamsContext.hasPendingChanges()) {
											oParamsContext.getBinding().resetChanges();
										}
										oDeletePromise = draft.deleteDraft(oParamsContext);
										return oDeletePromise;
									} else {
										var oActiveContext =
											that.activeContext ||
											oModel.bindContext(oParamsContext.getPath() + "/SiblingEntity").getBoundContext();
										return oActiveContext
											.requestCanonicalPath()
											.then(function(sPath) {
												sCanonicalPath = sPath;
												if (oParamsContext && oParamsContext.hasPendingChanges()) {
													oParamsContext.getBinding().resetChanges();
												}
												oDeletePromise = draft.deleteDraft(oParamsContext);
												return oDeletePromise;
											})
											.then(function() {
												//oParamsContext.delete() in the previous promise doesnt return anything upon success.
												if (oActiveContext.getPath() !== sCanonicalPath) {
													// the active context is using the sibling entity - this path is not accessible anymore as we deleted the draft
													// document - therefore we need to create a new context with the canonical path
													oActiveContext = oModel.bindContext(sCanonicalPath).getBoundContext();
												}
												// request for HasDraftEntity and the DraftAdministrativeData
												// this is needed for the draft indicator to show (actually hide itself) the updated state after discard
												oActiveContext.requestSideEffects([
													{
														$PropertyPath: "HasDraftEntity"
													},
													{
														$NavigationPropertyPath: "DraftAdministrativeData"
													}
												]);
												return oActiveContext;
											});
									}
								});

							case enumProgrammingModel.STICKY:
								return sticky.discardDocument(oContext).then(function(oContext) {
									if (oContext) {
										if (oContext.hasPendingChanges()) {
											oContext.getBinding().resetChanges();
										}
										if (!that._bCreateMode) {
											oContext.refresh();
											return oContext;
										}
									}
									return false;
								});

							case enumProgrammingModel.NON_DRAFT:
								if (oParamsContext === oContext && that._bIsModified) {
									oContext.getBinding().resetChanges();
								}
								break;
						}
					})
					.then(function(context) {
						that._bIsModified = false;
						that._removeContextsFromPages();
						oUIModel.setProperty("/editMode", "Display");
						oUIModel.setProperty("/isEditable", false);
						// remove existing bound transition messages
						messageHandling.removeBoundTransitionMessages();
						// show unbound messages
						return messageHandling.showUnboundMessages().then(function() {
							return context;
						});
					})
					.catch(function(err) {
						return messageHandling.showUnboundMessages().then(function() {
							return Promise.reject(err);
						});
					})
					.finally(function() {
						BusyLocker.unlock(oUIModel);
					});
			},

			/**
			 * Save document.
			 *
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} oContext Context of the document that should be saved
			 * @param oResourceBundle
			 * @param bExecuteSideEffectsOnError
			 * @returns {Promise} Promise resolves with ???
			 * @sap-restricted
			 * @final
			 */
			saveDocument: function(oContext, oResourceBundle, bExecuteSideEffectsOnError) {
				var oUIModel = this.getUIStateModel(),
					oModel,
					that = this;

				if (!oContext) {
					return Promise.reject(new Error("Binding context to draft document is required"));
				}
				// in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
				// is sent to the backend
				messageHandling.removeBoundTransitionMessages();

				BusyLocker.lock(oUIModel);
				return this.getProgrammingModel(oContext)
					.then(function(sProgrammingModel) {
						switch (sProgrammingModel) {
							case enumProgrammingModel.DRAFT:
								return draft.activateDocument(oContext);
							case enumProgrammingModel.STICKY:
								return sticky.activateDocument(oContext);
							case enumProgrammingModel.NON_DRAFT:
								//This is submitting the in saved changes to backend
								oModel = oContext.getModel();
								oModel.submitBatch(oModel.getUpdateGroupId());
								return oContext;
							/* oUIModel.setProperty("/editMode", 'Display');
						 break; */
						}
					})
					.then(function(oActiveDocument) {
						that._bIsModified = false;
						that._removeContextsFromPages();

						oUIModel.setProperty("/editMode", "Display");
						oUIModel.setProperty("/isEditable", false);
						MessageToast.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_SAVED", oResourceBundle));
						return messageHandling.showUnboundMessages().then(function() {
							return oActiveDocument;
						});
					})
					.catch(function(err) {
						var oListBinding = Array.isArray(oContext) ? oContext[0].getBinding() : null;
						if (!CommonUtils.hasTransientContext(oListBinding) && bExecuteSideEffectsOnError) {
							SideEffectsUtil.requestSideEffects(oListBinding.getPath(), oContext);
						}
						return messageHandling.showUnboundMessages().then(function() {
							return Promise.reject(err);
						});
					})
					.finally(function() {
						BusyLocker.unlock(oUIModel);
					});
			},

			/**
			 * Calls a bound/unbound action.
			 *
			 * @function
			 * @static
			 * @name sap.fe.core.TransactionHelper.onCallAction
			 * @memberof sap.fe.core.TransactionHelper
			 * @param {string} sActionName The name of the action to be called
			 * @param {map} [mParameters] contains the following attributes:
			 * @param {sap.ui.model.odata.v4.Context} [mParameters.contexts] contexts Mandatory for a bound action, Either one context or an array with contexts for which the action shall be called
			 * @param {sap.ui.model.odata.v4.ODataModel} [mParameters.model] oModel Mandatory for an unbound action, An instance of an OData v4 model
			 * @param {string} [mParameters.invocationGrouping] [Isolated] mode how actions shall be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets (TODO: create enum)
			 * @param {string} [mParameters.label] a human-readable label for the action
			 * @param {boolean} [mParameters.bGetBoundContext] if specified the action promise returns the bound context
			 * @returns {Promise} Promise resolves with an array of response objects (TODO: to be changed)
			 * @sap-restricted
			 * @final
			 **/
			onCallAction: function(sActionName, mParameters) {
				mParameters = getParameters(mParameters);
				var oUIModel = this.getUIStateModel(),
					that = this,
					oContext,
					oModel,
					oPromise,
					sName,
					mBindingParameters = mParameters.bindingParameters;
				if (!sActionName) {
					return Promise.reject("Provide name of action to be executed");
				}
				// action imports are not directly obtained from the metaModel by it is present inside the entityContainer
				// and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
				// split() on its name was required
				sName = sActionName.split("/")[1];
				sActionName = sName || sActionName;
				oContext = sName ? undefined : mParameters.contexts;
				//checking whether the context is an array with more than 0 length or not an array(create action)
				if (oContext && ((Array.isArray(oContext) && oContext.length) || !Array.isArray(oContext))) {
					oContext = Array.isArray(oContext) ? oContext[0] : oContext;
					oModel = oContext.getModel();
				}
				if (mParameters.model) {
					oModel = mParameters.model;
				}
				if (!oModel) {
					return Promise.reject("Pass a context for a bound action or pass the model for an unbound action");
				}
				// get the binding parameters $select and $expand for the side effect on this action
				// also gather additional property paths to be requested such as text associations
				var mSideEffectsParameters = that._getBindingParameters(sActionName, oContext) || {},
					oAppComponent = that._getAppComponent();
				if (oContext && oModel) {
					oPromise = new Promise(function(resolve, reject) {
						var oApplicableContextDialog;
						var oController = {
							onClose: function() {
								// User cancels action
								oApplicableContextDialog.close();
								resolve();
							},
							onContinue: function() {
								// Users continues the action with the bound contexts
								oApplicableContextDialog.close();
								resolve(mParameters.applicableContext);
							}
						};
						var fnOpenAndFillDialog = function() {
							var oDialogContent,
								nNotApplicable = mParameters.notApplicableContext.length,
								aNotApplicableItems = [];
							for (var i = 0; i < mParameters.notApplicableContext.length; i++) {
								oDialogContent = mParameters.notApplicableContext[i].getObject();
								aNotApplicableItems.push(oDialogContent);
							}
							var oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
							var oTotals = new JSONModel({ total: nNotApplicable, label: mParameters.label });
							oApplicableContextDialog.setModel(oNotApplicableItemsModel, "notApplicable");
							oApplicableContextDialog.setModel(oTotals, "totals");
							oApplicableContextDialog.open();
						};

						if (mParameters.notApplicableContext && mParameters.notApplicableContext.length >= 1) {
							// Show the contexts that are not applicable and will not therefore be processed
							var sFragmentName = "sap.fe.core.controls.ActionPartial";
							var oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
							var oMetaModel = oModel.getMetaModel();
							var sCanonicalPath = mParameters.contexts[0].getCanonicalPath();
							var sEntitySet = sCanonicalPath.substr(0, sCanonicalPath.indexOf("(")) + "/";
							Promise.resolve(
								XMLPreprocessor.process(
									oDialogFragment,
									{ name: sFragmentName },
									{
										bindingContexts: {
											entityType: oMetaModel.createBindingContext(sEntitySet)
										},
										models: {
											entityType: oMetaModel
										}
									}
								)
							)
								.then(function(oFragment) {
									return Fragment.load({ definition: oFragment, controller: oController });
								})
								.then(function(oPopover) {
									oApplicableContextDialog = oPopover;
									mParameters.parentControl.addDependent(oPopover);
									fnOpenAndFillDialog();
								})
								.catch(reject);
						} else {
							resolve(mParameters.contexts);
						}
					}).then(function(contextToProcess) {
						if (contextToProcess) {
							return operations.callBoundAction(sActionName, contextToProcess, oModel, {
								invocationGrouping: mParameters.invocationGrouping,
								label: mParameters.label,
								showActionParameterDialog: true,
								mBindingParameters: mBindingParameters,
								entitySetName: mParameters.entitySetName,
								additionalSideEffect: mSideEffectsParameters,
								onSubmitted: function() {
									BusyLocker.lock(oUIModel);
								},
								onResponse: function() {
									BusyLocker.unlock(oUIModel);
								},
								parentControl: mParameters.parentControl,
								ownerComponent: oAppComponent,
								localUIModel: mParameters.localUIModel,
								operationAvailableMap: mParameters.operationAvailableMap,
								prefix: mParameters.prefix,
								bIsCreateAction: mParameters.bIsCreateAction,
								bGetBoundContext: mParameters.bGetBoundContext
							});
						} else {
							return null;
						}
					});
				} else {
					// TODO: confirm if action import needs side effects
					oPromise = operations.callActionImport(sActionName, oModel, {
						label: mParameters.label,
						showActionParameterDialog: true,
						bindingParameters: mBindingParameters,
						entitySetName: mParameters.entitySetName,
						onSubmitted: function() {
							BusyLocker.lock(oUIModel);
						},
						onResponse: function() {
							BusyLocker.unlock(oUIModel);
						},
						parentControl: mParameters.parentControl,
						localUIModel: mParameters.localUIModel,
						operationAvailableMap: mParameters.operationAvailableMap,
						prefix: mParameters.prefix,
						ownerComponent: oAppComponent
					});
				}
				return oPromise
					.then(function(oResult) {
						// Succeeded
						return messageHandling.showUnboundMessages().then(function() {
							return oResult;
						});
					})
					.catch(function(err) {
						return messageHandling.showUnboundMessages().then(function() {
							return Promise.reject(err);
						});
					});
			},

			// Ugly Workaround to overcome mdc field issue, we remove the binding context before
			// switching to display mode to avoid the field reads additional values for non existing
			// drafts or sticky sessions in the backend
			// This logic has to be moved and should be ideally not be needed at all
			_removeContextsFromPages: function() {
				var aPages = [];
				if (this._oAppComponent._isFclEnabled()) {
					aPages = aPages.concat(this._oAppComponent.getRootContainer().getMidColumnPages() || []);
					aPages = aPages.concat(this._oAppComponent.getRootContainer().getEndColumnPages() || []);
				} else {
					aPages = this._oAppComponent.getRootContainer().getPages() || [];
				}

				for (var i = 0; i < aPages.length; i++) {
					if (aPages[i].getBindingContext()) {
						aPages[i].setBindingContext(null);
					}
				}
			},

			/**
			 * Get the query parameters for bound action from side effect, if annotated for provided action
			 * TODO: Add support for $expand when the backend supports it.
			 * @function
			 * @static
			 * @name sap.fe.core.TransactionHelper._getBindingParameters
			 * @memberof sap.fe.core.TransactionHelper
			 * @param {string} sActionName The name of the bound action for which to get the side effects
			 * @param {sap.ui.model.odata.v4.Context} oContext Binding Context of the view
			 * @returns {map} Map of query parameters with $select and $expand
			 * @private
			 * @sap-restricted
			 */
			_getBindingParameters: function(sActionName, oContext) {
				var oMetaModel = oContext && oContext.getModel().getMetaModel(),
					oMetaModelContext = oMetaModel && oMetaModel.getMetaContext(oContext.getPath()),
					oAnnotations = oMetaModelContext && oMetaModel.getObject(sActionName + "@", oMetaModelContext),
					aSideEffects = SideEffectsUtil.getSideEffects(oAnnotations),
					sBindingParameter,
					aTargetEntities = [],
					aTargetProperties = [],
					aTriggerActions = [],
					sEntityType,
					aAdditionalPropertyPaths = [];

				// If there are no side effects found, nothing to do here
				if (aSideEffects.length === 0) {
					return {};
				}

				// Collect the target properties, target entities and trigger actions
				aSideEffects.forEach(function(oSideEffect) {
					aTargetProperties = aTargetProperties.concat(oSideEffect.TargetProperties);
					aTargetEntities = aTargetEntities.concat(oSideEffect.TargetEntities);
					aTriggerActions = aTriggerActions.concat(oSideEffect.TriggerAction);
				});

				// Get binding parameter name from the action
				sBindingParameter = oMetaModel.getObject(sActionName + "/@$ui5.overload/0/$Parameter/0/$Name", oMetaModelContext);

				aTargetProperties = SideEffectsUtil.removeBindingPaths(aTargetProperties, "$PropertyPath", sBindingParameter, sActionName);
				aTargetEntities = SideEffectsUtil.removeBindingPaths(
					aTargetEntities,
					"$NavigationPropertyPath",
					sBindingParameter,
					sActionName
				);

				aAdditionalPropertyPaths = aAdditionalPropertyPaths.concat(aTargetProperties).concat(aTargetEntities);

				// replace empty nav prop path with prop path *
				aAdditionalPropertyPaths = SideEffectsUtil.replaceEmptyNavigationPaths(aAdditionalPropertyPaths);

				// '/EntityType' for this view
				sEntityType = oMetaModel.getMetaPath(oContext.getPath());
				// Add additional text associations for the target properties
				aAdditionalPropertyPaths = SideEffectsUtil.addTextProperties(aAdditionalPropertyPaths, oMetaModel, sEntityType);
				return {
					pathExpressions: aAdditionalPropertyPaths,
					triggerActions: aTriggerActions
				};
			},
			/**
			 * Handles validation error at the time of discard action.
			 *
			 * @function
			 * @name sap.fe.core.TransactionHelper#handleValidationError
			 * @memberof sap.fe.core.TransactionHelper
			 * @static
			 * @sap-restricted
			 * @final
			 */
			handleValidationError: function() {
				var oMessageManager = sap.ui.getCore().getMessageManager(),
					errorToRemove = oMessageManager
						.getMessageModel()
						.getData()
						.filter(function(error) {
							// only needs to handle validation messages, technical and persistent errors needs not to be checked here.
							if (error.validation) {
								return error;
							}
						});
				oMessageManager.removeMessages(errorToRemove);
			},
			/**
			 * Shows a popover if it needs to be shown.
			 * TODO: Popover is shown if user has modified any data.
			 * TODO: Popover is shown if there's a difference from draft admin data.
			 * @static
			 * @name sap.fe.core.TransactionHelper._showDiscardPopover
			 * @memberof sap.fe.core.TransactionHelper
			 * @param {sap.ui.core.Control} oCancelButton The control which will open the popover
			 * @param bIsModified
			 * @param oResourceBundle
			 * @returns {Promise} Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
			 * @sap-restricted
			 * @final
			 */
			_showDiscardPopover: function(oCancelButton, bIsModified, oResourceBundle) {
				// TODO: Implement this popover as a fragment as in v2??
				var that = this;
				that._bContinueDiscard = false;
				// to be implemented
				return new Promise(function(resolve, reject) {
					if (!oCancelButton) {
						reject("Cancel button not found");
					}
					//Show popover only when data is changed.
					if (bIsModified) {
						var fnOnAfterDiscard = function() {
							oCancelButton.setEnabled(true);
							if (that._bContinueDiscard) {
								resolve();
							} else {
								reject("Discard operation was rejected. Document has not been discarded");
							}
							that._oPopover.detachAfterClose(fnOnAfterDiscard);
						};
						if (!that._oPopover) {
							var oText = new Text({
									//This text is the same as LR v2.
									//TODO: Display message provided by app developer???
									text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE", oResourceBundle)
								}),
								oButton = new Button({
									text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", oResourceBundle),
									width: "100%",
									press: function() {
										that.handleValidationError();
										that._bContinueDiscard = true;
										that._oPopover.close();
									},
									ariaLabelledBy: oText
								});
							that._oPopover = new Popover({
								showHeader: false,
								placement: "Top",
								content: [
									new VBox({
										items: [oText, oButton]
									})
								],
								beforeOpen: function() {
									// make sure to NOT trigger multiple cancel flows
									oCancelButton.setEnabled(false);
									that._oPopover.setInitialFocus(oButton);
								}
							});
							that._oPopover.addStyleClass("sapUiContentPadding");
						}
						that._oPopover.attachAfterClose(fnOnAfterDiscard);
						that._oPopover.openBy(oCancelButton);
					} else {
						that.handleValidationError();
						resolve();
					}
				});
			},
			/**
			 * Sets the document to modified state on patch event.
			 *
			 * @function
			 * @static
			 * @name sap.fe.core.TransactionHelper.handleDocumentModifications
			 * @memberof sap.fe.core.TransactionHelper
			 * @sap-restricted
			 * @final
			 */
			handleDocumentModifications: function() {
				this._bIsModified = true;
			},

			/**
			 * Retrieves the owner component.
			 *
			 * @function
			 * @static
			 * @private
			 * @name sap.fe.core.TransactionHelper._getOwnerComponent
			 * @memberof sap.fe.core.TransactionHelper
			 * @returns {sap.fe.core.AppComponent} the app component
			 * @sap-restricted
			 * @final
			 **/
			_getAppComponent: function() {
				return this._oAppComponent;
			},

			/**
			 * retrieves the Routing controller extention associated with the owner component
			 * @function
			 * @static
			 * @private
			 * @name sap.fe.core.TransactionHelper._getRouting
			 * @memberof sap.fe.core.TransactionHelper
			 * @sap-restricted
			 * @final
			 **/

			_getRouting: function() {
				return this._getAppComponent()._oRouting;
			},

			_launchDialogWithKeyFields: function(oListBinding, oTransientListBinding, oTransientContext, mFields, oModel, mParameters) {
				var that = this;
				var oDialog,
					oParentControl = mParameters.parentControl;
				return new Promise(function(resolve, reject) {
					var sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
					var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
						oResourceBundle = oParentControl.getController().oResourceBundle,
						oMetaModel = oModel.getMetaModel(),
						aImmutableFields = [],
						oAppComponent = that._getAppComponent(),
						oEntitySetContext = oMetaModel.createBindingContext(oListBinding.getPath()),
						sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath());
					for (var i in mFields) {
						aImmutableFields.push(oMetaModel.createBindingContext(sMetaPath + "/" + mFields[i]));
					}
					var oImmutableCtx = new JSONModel(aImmutableFields);
					oImmutableCtx = oImmutableCtx.createBindingContext("/");
					return Promise.resolve(
						XMLPreprocessor.process(
							oFragment,
							{ name: sFragmentName },
							{
								bindingContexts: {
									entitySet: oEntitySetContext,
									fields: oImmutableCtx
								},
								models: {
									entitySet: oEntitySetContext.getModel(),
									fields: oImmutableCtx.getModel()
								}
							}
						)
					).then(function(oFragment) {
						var aFieldPromises = [],
							aFormElements = [],
							oCreateButton,
							/*
								remove earlier values of the field
								in the field promises list as presence
								of even one rejection of a previous value would result in the promise to be rejected always on create button pressed
							*/
							fnCheckFieldPromise = function(aFieldPromises, sId) {
								for (var i in aFieldPromises) {
									if (aFieldPromises[i].id === sId) {
										aFieldPromises.splice(i, 1);
									}
								}
							},
							validateRequiredProperties = function(oProcessedField) {
								oProcessedField = oProcessedField || [];
								var bEnabled = true;
								for (i = 0; i < aFormElements.length; i++) {
									var oField = aFormElements[i].getFields()[0];
									// currently changed field
									if (oProcessedField.id === oField.getId()) {
										bEnabled = !!oProcessedField.hasValue;
									} else {
										// check if other fields in the dialog are filled
										var sValue = oField.getValue();
										if (oField.getProperty("required") && !sValue) {
											bEnabled = false;
										}
									}
								}
								oCreateButton.setEnabled(bEnabled);
							},
							fnEnableCreateButton = function(oField, vValue) {
								// if the field has a valuehelp value is set after the promise is resolved. But this means that there is a value in the field
								// create button must be enabled in this case
								var bHasValue = typeof vValue === "object" ? true : vValue;
								validateRequiredProperties({
									id: oField.getId(),
									hasValue: bHasValue
								});
							},
							oController = {
								/*
									fired on focus out from field or on selecting a value from the valuehelp.
									the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
								handleChange: function(oEvent) {
									var sFieldId = oEvent.getParameter("id");
									var sValue = oEvent.getParameter("value");
									oFieldPromise = oEvent.getParameter("promise");
									var oField = oEvent.getSource();
									fnCheckFieldPromise(aFieldPromises, sFieldId);
									var oFieldPromise = {
										id: sFieldId,
										promise: oFieldPromise
									};
									aFieldPromises.push(oFieldPromise);
									var vValue = sValue === undefined ? oFieldPromise : sValue;
									fnEnableCreateButton(oField, vValue);
								},
								/*
									fired on key press. the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
								handleLiveChange: function(oEvent) {
									var oField = oEvent.getSource();
									var sValue = oEvent.getParameter("value");
									fnEnableCreateButton(oField, sValue);
								}
							};
						return Fragment.load({ definition: oFragment, controller: oController }).then(function(oDialogContent) {
							oDialog = new Dialog({
								title: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE", oResourceBundle),
								content: [oDialogContent],
								escapeHandler: function() {
									oDialog.close();
									return reject({
										bDeleteTransientContext: true
									});
								},
								beginButton: {
									text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE", oResourceBundle),
									type: "Emphasized",
									press: function(oEvent) {
										var oCreateButton = oEvent.getSource();
										oCreateButton.setEnabled(false);
										BusyLocker.lock(oDialog);
										return Promise.all(
											aFieldPromises.map(function(oProm) {
												return oProm.promise;
											})
										)
											.then(function() {
												mParameters.dialog = oDialog;
												that.onAfterCreateCompletion(
													oTransientListBinding,
													oTransientContext,
													mParameters,
													oResourceBundle
												);
												oModel.submitBatch("submitLater");
												return oTransientContext.created();
											})
											.then(function() {
												oDialog.close();
												return resolve(oTransientContext);
											})
											.finally(function() {
												BusyLocker.unlock(oDialog);
												oCreateButton.setEnabled(true);
												messageHandling.showUnboundMessages();
											});
									}
								},
								endButton: {
									text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
									press: function() {
										oDialog.close();
										return reject({
											bDeleteTransientContext: true
										});
									}
								},
								afterClose: function() {
									// show footer as per UX guidelines when dialog is not open
									oDialog.getModel("localUI").setProperty("/bIsCreateDialogOpen", false);
									oDialog.destroy();
								}
							});
							aFormElements = oDialogContent
								.getAggregation("form")
								.getAggregation("formContainers")[0]
								.getAggregation("formElements");
							if (oParentControl && oParentControl.addDependent) {
								// if there is a parent control specified add the dialog as dependent
								oParentControl.addDependent(oDialog);
							}
							oCreateButton = oDialog.getBeginButton();
							oDialog.setBindingContext(oTransientContext);
							return CommonUtils.setUserDefaults(oAppComponent, aImmutableFields, oTransientContext)
								.then(function() {
									validateRequiredProperties();
									// footer must not be visible when the dialog is open as per UX guidelines
									oDialog.getModel("localUI").setProperty("/bIsCreateDialogOpen", true);
									oDialog.open();
									return Promise.resolve();
								})
								.catch(function(oError) {
									return messageHandling.showUnboundMessages().then(function() {
										return Promise.reject(oError);
									});
								});
						});
					});
				});
			},
			onAfterCreateCompletion: function(oListBinding, oNewDocumentContext, mParameters, oResourceBundle) {
				// Workaround suggested by OData model v4 colleagues
				var fnCreateCompleted = function(oEvent) {
					var oContext = oEvent.getParameter("context"),
						oMessageManager = sap.ui.getCore().getMessageManager(),
						sTarget,
						aMessages,
						oMessage,
						bBoundMessageExists;
					if (oContext === oNewDocumentContext) {
						oListBinding.detachCreateCompleted(fnCreateCompleted, this);
						if (!oEvent.getParameter("success")) {
							if (mParameters.keepTransientContextOnFailed) {
								var oDialog = mParameters.dialog;
								// the context shall stay as a transient one in the list binding
								// this one is automatically sent from the model once the user changed any property
								// we have to attach to the events to ensure the table is busy and errors are shown
								/*	TODO: this is just a temp solution
										as long as we don't have the row highlighting to identify the transient entries
										we add a bound message if no one exists so far (means the backend did not return
										a bound message) explaining why a few functions don't work and how to resolve them.
									*/
								// get the target of the transient context
								sTarget = oNewDocumentContext.getPath();
								// check if bound message already exists for the transient context
								aMessages = oMessageManager.getMessageModel().getData();
								bBoundMessageExists = false;
								for (var i = 0; i < aMessages.length; i++) {
									if (aMessages[0].target === sTarget) {
										bBoundMessageExists = true;
										break;
									}
								}
								if (!bBoundMessageExists) {
									// add a bound message for this transient context
									oMessage = new Message({
										message: CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_TRANSIENT_CONTEXT_MESSAGE",
											oResourceBundle
										),
										description: CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_TRANSIENT_CONTEXT_DESCRIPTION",
											oResourceBundle
										),
										target: sTarget,
										persistent: false,
										type: "Error"
									});
									oMessageManager.addMessages(oMessage);
									oNewDocumentContext
										.created()
										.then(
											function() {
												oMessageManager.removeMessages(oMessage);
											},
											function() {
												oMessageManager.removeMessages(oMessage);
											}
										)
										.catch(function(oError) {
											Log.error("Cannot find a created new document context", oError);
										});
								}
								var fnCreateCompleteRepeat = function(oEvent) {
									if (oEvent.getParameter("context") === oNewDocumentContext) {
										messageHandling.showUnboundMessages();
										if (oEvent.getParameter("success")) {
											oListBinding.detachCreateCompleted(fnCreateCompleteRepeat, this);
										}
									}
								};
								oListBinding.attachCreateCompleted(fnCreateCompleteRepeat);
								setTimeout(function() {
									messageHandling.showUnboundMessages();
								}, 0);
								if (oDialog) {
									BusyLocker.unlock(oDialog);
									oDialog.getBeginButton().setEnabled(true);
								}
							} else {
								// the context is deleted
								// this is needed to avoid console errors TO be checked with model colleagues
								oContext
									.created()
									.then(undefined, function() {
										Log.trace("transient creation context deleted");
									})
									.catch(function(oError) {
										Log.trace("transient creation context deletion error", oError);
									});
								oContext.delete();

								// if current state is transient (...), browser will come back to previous state
								var oRouting = this._getRouting();
								oRouting.navigateBackFromTransientState(this._getAppComponent(), {
									unLockObject: this.getUIStateModel()
								});
							}
						}
					}
				};
				// TODO: this shall be improved so we only attach once to the events
				oListBinding.attachCreateCompleted(fnCreateCompleted, this);
			}
		});
	}
);
