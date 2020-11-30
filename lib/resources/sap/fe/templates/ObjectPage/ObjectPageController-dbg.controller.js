/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/fe/core/controllerextensions/Routing",
		"sap/fe/core/controllerextensions/RoutingListener",
		"sap/fe/core/controllerextensions/FlexibleColumnLayout",
		"sap/fe/core/controllerextensions/EditFlow",
		"sap/ui/model/odata/v4/ODataListBinding",
		"sap/fe/macros/field/FieldRuntime",
		"sap/base/Log",
		"sap/base/util/merge",
		"sap/fe/core/CommonUtils",
		"sap/fe/navigation/SelectionVariant",
		"sap/fe/macros/CommonHelper",
		"sap/fe/macros/table/Utils",
		"sap/m/MessageBox",
		"sap/fe/core/BusyLocker",
		"sap/fe/core/actions/messageHandling",
		"sap/fe/core/FEHelper",
		"sap/fe/macros/ResourceModel",
		"sap/m/Link",
		"sap/fe/macros/chart/ChartRuntime",
		"sap/fe/templates/controls/Share/ShareUtils",
		"sap/fe/templates/ObjectPage/ExtensionAPI",
		"sap/fe/core/helpers/PasteHelper"
	],
	function(
		Controller,
		JSONModel,
		Routing,
		RoutingListener,
		Fcl,
		EditFlow,
		ODataListBinding,
		FieldRuntime,
		Log,
		merge,
		CommonUtils,
		SelectionVariant,
		CommonHelper,
		TableUtils,
		MessageBox,
		BusyLocker,
		messageHandling,
		FEHelper,
		ResourceModel,
		Link,
		ChartRuntime,
		ShareUtils,
		ExtensionAPI,
		FEPasteHelper
	) {
		"use strict";

		var iMessages;

		return Controller.extend("sap.fe.templates.ObjectPage.ObjectPageController", {
			routingListener: RoutingListener,

			constructor: function() {
				Controller.apply(this, arguments);
				this.routing = new Routing();
				this.fcl = new Fcl();
				this.editFlow = new EditFlow();
			},

			getExtensionAPI: function() {
				if (!this.extensionAPI) {
					this.extensionAPI = new ExtensionAPI(this);
				}
				return this.extensionAPI;
			},

			onInit: function() {
				var that = this,
					oObjectPage = this.byId("fe::ObjectPage");
				this.routing.configure(this.getView(), this.fcl);
				this.fcl.configure(this.getView(), this.routing);
				this.editFlow.configure(this.getView(), this.routing);
				this._oAppComponent = CommonUtils.getAppComponent(this.getView());
				this.getView().setModel(this.editFlow.getTransactionHelper().getUIStateModel(), "ui");
				this.getView().setModel(
					this.editFlow.getUIStateModel({
						sessionOn: false,
						batchGroups: that._getBatchGroupsForView()
					}),
					"localUI"
				);
				// Adding model to store related apps data
				var oRelatedAppsModel = new JSONModel({
					visibility: false,
					items: null
				});

				this.getView().setModel(oRelatedAppsModel, "relatedAppsModel");

				var oCreationRowModel = new JSONModel({});
				this.getView().setModel(oCreationRowModel, "creationRowModel");
				if (oObjectPage.getEnableLazyLoading()) {
					//Attaching the event to make the subsection context binding active when it is visible.
					oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
				}
			},

			onExit: function() {
				this.getView()
					.getModel("relatedAppsModel")
					.destroy();
				this.getView()
					.getModel("creationRowModel")
					.destroy();
				this.editFlow.destroy();
			},
			_getTableBinding: function(oTable) {
				return oTable && oTable.getRowBinding();
			},
			onAfterRendering: function(oEvent) {
				var that = this;
				this.getView()
					.getModel("sap.fe.i18n")
					.getResourceBundle()
					.then(function(response) {
						that.oResourceBundle = response;
					})
					.catch(function(oError) {
						Log.error("Error while retrieving the resource bundle", oError);
					});
			},

			onBeforeBinding: function(oContext, mParameters) {
				// TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
				var that = this,
					aTables = this._findTables(),
					oFastCreationRow,
					oObjectPage = this.byId("fe::ObjectPage"),
					oBinding = mParameters.listBinding,
					oLocalUIModel = that.getView().getModel("localUI"),
					aBatchGroups = oLocalUIModel.getProperty("/batchGroups");
				aBatchGroups.push("$auto");
				if (
					oObjectPage.getBindingContext() &&
					oObjectPage.getBindingContext().hasPendingChanges() &&
					!aBatchGroups.some(
						oObjectPage
							.getBindingContext()
							.getModel()
							.hasPendingChanges.bind(oObjectPage.getBindingContext().getModel())
					)
				) {
					/* 	In case there are pending changes for the creation row and no others we need to reset the changes
						TODO: this is just a quick solution, this needs to be reworked
				 	*/

					oObjectPage
						.getBindingContext()
						.getBinding()
						.resetChanges();
				}

				// For now we have to set the binding context to null for every fast creation row
				// TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
				for (var i = 0; i < aTables.length; i++) {
					oFastCreationRow = aTables[i].getCreationRow();
					if (oFastCreationRow) {
						oFastCreationRow.setBindingContext(null);
					}
				}

				// Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
				var fnScrollToPresentSection = function(oEvent) {
					if (!mParameters.bPersistOPScroll) {
						oObjectPage.setSelectedSection(null);
						oObjectPage.detachModelContextChange(fnScrollToPresentSection);
					}
				};

				oObjectPage.attachModelContextChange(fnScrollToPresentSection);

				//Set the Binding for Paginators using ListBinding ID
				if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
					var oPaginator = that.byId("fe::Paginator");
					if (oPaginator) {
						oPaginator.setListBinding(oBinding);
					}
				}

				if (!mParameters.editable) {
					if (oLocalUIModel.getProperty("/sessionOn") === true) {
						oLocalUIModel.setProperty("/sessionOn", false);
					}
				}

				if (oObjectPage.getEnableLazyLoading()) {
					var aSections = oObjectPage.getSections(),
						bUseIconTabBar = oObjectPage.getUseIconTabBar(),
						iSkip = 2;
					for (var iSection = 0; iSection < aSections.length; iSection++) {
						var oSection = aSections[iSection];
						var aSubSections = oSection.getSubSections();
						for (var iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
							if (iSkip < 1 || (bUseIconTabBar && iSection > 0)) {
								var oSubSection = aSubSections[iSubSection];
								oSubSection.setBindingContext(null);
							}
						}
					}
				}
			},

			_handleSubSectionEnteredViewPort: function(oEvent) {
				var oSubSection = oEvent.getParameter("subSection");
				oSubSection.setBindingContext(undefined);
			},

			onAfterBinding: function(oBindingContext, mParameters) {
				var oObjectPage = this.byId("fe::ObjectPage"),
					that = this,
					oModel = oBindingContext.getModel(),
					aTables = this._findTables(),
					oFinalUIState;
				// Here the fieldValidy is emptied for all tables.
				that.getView()
					.getModel("creationRowModel")
					.setProperty("/fieldValidity", {});
				// TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
				// binding with ownRequest
				oBindingContext = oObjectPage.getBindingContext();
				var aIBNActions = [];
				oObjectPage.getSections().forEach(function(oSection) {
					oSection.getSubSections().forEach(function(oSubSection) {
						aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
					});
				});
				aTables.forEach(function(oTable) {
					aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
					// temporary workaround for BCP: 2080218004
					// Need to fix with BLI: FIORITECHP1-15274
					// only for edit mode, we clear the table cache
					// Workaround starts here!!
					var oTableRowBinding = oTable.getRowBinding();
					if (oTableRowBinding) {
						that.editFlow
							.getProgrammingModel(oTableRowBinding)
							.then(function(programmingModel) {
								if (programmingModel === "Sticky") {
									// apply for both edit and display mode in sticky
									oTableRowBinding.removeCachesAndMessages("");
								}
							})
							.catch(function(oError) {
								Log.error("Error while clearing table binding cache.", oError);
							});
					}
					// Workaround ends here!!
				});
				CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
				// Compute Edit Mode
				oFinalUIState = this.editFlow.computeEditMode(oBindingContext);

				// update related apps once Data is received in case of binding cache is not available
				// TODO: this is only a temp solution since we need to call _updateRelatedApps method only after data for Object Page is received (if there is no binding)
				if (oBindingContext.getBinding().oCache) {
					that._updateRelatedApps();
				} else {
					var fnUpdateRelatedApps = function() {
						that._updateRelatedApps();
						oBindingContext.getBinding().detachDataReceived(fnUpdateRelatedApps);
					};
					oBindingContext.getBinding().attachDataReceived(fnUpdateRelatedApps);
				}

				// TODO: this should be moved into an init event of the MDC tables (not yet existing) and should be part
				// of any controller extension
				/**
				 * @param oTable
				 * @param oListBinding
				 */
				function enableFastCreationRow(oTable, oListBinding) {
					var oFastCreationRow = oTable.getCreationRow(),
						oFastCreationListBinding,
						oFastCreationContext;

					if (oFastCreationRow) {
						oFinalUIState
							.then(function() {
								if (oFastCreationRow.getVisible()) {
									oFastCreationListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
										$$updateGroupId: "doNotSubmit",
										$$groupId: "doNotSubmit"
									});
									// Workaround suggested by OData model v4 colleagues
									oFastCreationListBinding.refreshInternal = function() {};
									/*
                                                                oFastCreationListBinding.hasPendingChanges = function() {
									return false;
								};
                                                                */

									oFastCreationContext = oFastCreationListBinding.create();
									oFastCreationRow.setBindingContext(oFastCreationContext);

									// this is needed to avoid console error
									oFastCreationContext.created().catch(function() {
										Log.trace("transient fast creation context deleted");
									});
								}
							})
							.catch(function(oError) {
								Log.error("Error while computing the final UI state", oError);
							});
					}
				}

				// this should not be needed at the all
				/**
				 * @param oTable
				 */
				function handleTableModifications(oTable) {
					var oBinding = that._getTableBinding(oTable),
						fnHandleTablePatchEvents = function() {
							enableFastCreationRow(oTable, oBinding);
						};

					if (!oBinding) {
						Log.error("Expected binding missing for table: " + oTable.getId());
						return;
					}

					if (oBinding.oContext) {
						fnHandleTablePatchEvents();
					} else {
						var fnHandleChange = function() {
							if (oBinding.oContext) {
								fnHandleTablePatchEvents();
								oBinding.detachChange(fnHandleChange);
							}
						};
						oBinding.attachChange(fnHandleChange);
					}
				}

				// take care on message handling, draft indicator (in case of draft)
				var transactionHelper = this.editFlow.getTransactionHelper(),
					oTransactionStateModel = transactionHelper.getUIStateModel();
				oTransactionStateModel.setProperty("/draftStatus", "Clear");

				//Attach the patch sent and patch completed event to the object page binding so that we can react
				var oBinding = (oBindingContext.getBinding && oBindingContext.getBinding()) || oBindingContext;
				oBinding.attachEvent("patchSent", this.editFlow.handlePatchSent, this);
				oBinding.attachEvent("patchCompleted", this.editFlow.handlePatchCompleted, this);

				aTables.forEach(function(oTable) {
					// access binding only after table is bound
					TableUtils.whenBound(oTable)
						.then(handleTableModifications)
						.catch(function(oError) {
							Log.error("Error while waiting for the table to be bound", oError);
						});
				});

				// should be called only after binding is ready hence calling it in onAfterBinding
				oObjectPage._triggerVisibleSubSectionsEvents();
				this._oAppComponent.getAppStateHandler().applyAppState(this);
			},

			onPageReady: function(mParameters) {
				this._clearTableSelection();
				var oLastFocusedControl = mParameters.lastFocusedControl;
				if (oLastFocusedControl && oLastFocusedControl.controlId && oLastFocusedControl.focusInfo) {
					var oView = this.getView();
					var oFocusControl = oView.byId(oLastFocusedControl.controlId);
					if (oFocusControl) {
						oFocusControl.applyFocusInfo(oLastFocusedControl.focusInfo);
						return;
					}
				}
				var oObjectPage = this.byId("fe::ObjectPage");
				// set the focus to the first action button, or to the first editable input if in editable mode
				var isInDisplayMode = oObjectPage.getModel("ui").getProperty("/editMode") === "Display";
				var firstElementClickable;
				if (isInDisplayMode) {
					var aActions = oObjectPage.getHeaderTitle().getActions();
					if (aActions.length) {
						firstElementClickable = aActions.find(function(action) {
							// do we need && action.mProperties["enabled"] ?
							return action.mProperties["visible"];
						});
						if (firstElementClickable) {
							firstElementClickable.focus();
						}
					}
				} else {
					var firstEditableInput = oObjectPage._getFirstEditableInput();
					if (firstEditableInput) {
						firstEditableInput.focus();
					}
				}
				this._checkDataPointTitleForExternalNavigation();
			},
			_getPageTitleInformation: function() {
				var oObjectPage = this.byId("fe::ObjectPage");
				var oTitleInfo = {
					title: oObjectPage.data("ObjectPageTitle") || "",
					subtitle: "",
					intent: "",
					icon: ""
				};
				var oObjectPageSubtitle = oObjectPage.getCustomData().find(function(oCustomData) {
					return oCustomData.getKey() === "ObjectPageSubtitle";
				});

				// TODO we should not need to care about resolving the binding manually
				if (oObjectPageSubtitle && oObjectPageSubtitle.getBinding("value") !== undefined) {
					if (oObjectPageSubtitle.getBinding("value").isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
						return oObjectPageSubtitle
							.getBinding("value")
							.requestValue()
							.then(function(sValue) {
								oTitleInfo.subtitle = sValue;
								return oTitleInfo;
							});
					} else if (oObjectPageSubtitle.getBinding("value").isA("sap.ui.model.resource.ResourcePropertyBinding")) {
						oTitleInfo.subtitle = oObjectPageSubtitle.getBinding("value").getValue();
						return Promise.resolve(oTitleInfo);
					}
				} else {
					// Fallback when a hardcoded HeaderInfo Title annotation is used
					if (oTitleInfo.subtitle === "" && oObjectPageSubtitle && oObjectPageSubtitle.mProperties.value) {
						oTitleInfo.subtitle = oObjectPageSubtitle.mProperties.value;
					}
					return Promise.resolve(oTitleInfo);
				}
			},

			_executeHeaderShortcut: function(sId) {
				var sButtonId = this.getView().getId() + "--" + sId,
					oButton = this.byId("fe::ObjectPage")
						.getHeaderTitle()
						.getActions()
						.find(function(oElement) {
							return oElement.getId() === sButtonId;
						});
				CommonUtils.fireButtonPress(oButton);
			},

			_executeFooterShortcut: function(sId) {
				var sButtonId = this.getView().getId() + "--" + sId,
					oButton = this.byId("fe::ObjectPage")
						.getFooter()
						.getContent()
						.find(function(oElement) {
							return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
						});
				CommonUtils.fireButtonPress(oButton);
			},

			_executeTabShortCut: function(oExecution) {
				var oObjectPage = this.byId("fe::ObjectPage"),
					iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection())),
					aSections = oObjectPage.getSections(),
					iSectionIndexMax = aSections.length - 1,
					sCommand = oExecution.oSource.getCommand(),
					newSection;
				if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
					if (sCommand === "NextTab") {
						if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
							newSection = aSections[++iSelectedSectionIndex];
						}
					} else {
						// PreviousTab
						if (iSelectedSectionIndex !== 0) {
							newSection = aSections[--iSelectedSectionIndex];
						}
					}
					if (newSection) {
						oObjectPage.setSelectedSection(newSection);
						newSection.focus();
					}
				}
			},

			_getFooterVisibility: function(oEvent) {
				iMessages = oEvent.getParameter("iMessageLength");
				var oLocalUIModel = this.getView().getModel("localUI");
				// as per UX guidelines, the footer bar must not be visible when the dialog is open
				iMessages > 0 && !oLocalUIModel.getProperty("/bIsCreateDialogOpen")
					? oLocalUIModel.setProperty("/showMessageFooter", true)
					: oLocalUIModel.setProperty("/showMessageFooter", false);
			},

			_showMessagePopover: function(oMessageButton) {
				var oMessagePopover = oMessageButton.oMessagePopover,
					oItemBinding = oMessagePopover.getBinding("items");
				if (oItemBinding.getLength() > 0) {
					oMessagePopover.openBy(oMessageButton);
				}
			},

			_editDocument: function(oContext) {
				var that = this;
				var oModel = this.getView().getModel("ui");
				BusyLocker.lock(oModel);
				return this.editFlow.editDocument
					.apply(this.editFlow, [oContext, this.getView().getViewData().prepareOnEdit])
					.finally(function() {
						that._clearTableSelection();
						BusyLocker.unlock(oModel);
					});
			},

			_saveDocument: function(oContext) {
				var that = this,
					oModel = this.getView().getModel("ui"),
					aWaitCreateDocuments = [];
				// indicates if we are creating a new row in the OP
				var bExecuteSideEffectsOnError = false;
				BusyLocker.lock(oModel);
				this._findTables().forEach(function(oTable) {
					var oBinding = that._getTableBinding(oTable);
					var mParameters = {
						creationMode: oTable.data("creationMode"),
						creationRow: oTable.getCreationRow(),
						createAtEnd: oTable.data("createAtEnd") === "true"
					};
					var bCreateDocument =
						mParameters.creationRow &&
						mParameters.creationRow.getBindingContext() &&
						Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
					if (bCreateDocument) {
						// the bSkipSideEffects is a parameter created when we click the save key. If we press this key
						// we don't execute the handleSideEffects funciton to avoid batch redundancy
						mParameters.bSkipSideEffects = true;
						bExecuteSideEffectsOnError = true;
						aWaitCreateDocuments.push(that.editFlow.createDocument(oBinding, mParameters));
					}
				});
				return Promise.all(aWaitCreateDocuments).then(function() {
					return that.editFlow
						.saveDocument(oContext, bExecuteSideEffectsOnError)
						.then(function() {
							var oMessageButton = that.getView().byId("fe::FooterBar::MessageButton");
							var oDelegateOnAfter = {
								onAfterRendering: function(oEvent) {
									that._showMessagePopover(oMessageButton);
									oMessageButton.removeEventDelegate(that._oDelegateOnAfter);
									delete that._oDelegateOnAfter;
								}
							};
							that._oDelegateOnAfter = oDelegateOnAfter;
							oMessageButton.addEventDelegate(oDelegateOnAfter, that);
						})
						.catch(function(err) {
							var oMessageButton = that.getView().byId("fe::FooterBar::MessageButton");
							if (oMessageButton) {
								that._showMessagePopover(oMessageButton);
							}
						})
						.finally(function() {
							BusyLocker.unlock(oModel);
						});
				});
			},

			_cancelDocument: function(oContext, mParameters) {
				var that = this;
				return this.editFlow.cancelDocument(oContext, mParameters).finally(function() {
					that._clearTableSelection();
				});
			},

			_applyDocument: function(oContext) {
				var that = this;
				return this.editFlow.applyDocument(oContext).catch(function(err) {
					Log.error(err);
					var oMessageButton = that.getView().byId("fe::FooterBar::MessageButton");
					if (oMessageButton) {
						that._showMessagePopover(oMessageButton);
					}
				});
			},

			_updateRelatedApps: function() {
				var oObjectPage = this.byId("fe::ObjectPage");
				if (CommonUtils.resolveStringtoBoolean(oObjectPage.data("showRelatedApps"))) {
					CommonUtils.updateRelatedAppsDetails(oObjectPage);
				}
			},

			_findTableInSubSection: function(aParentElement, aSubsection, aTables) {
				for (var element = 0; element < aParentElement.length; element++) {
					var oParent = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent(),
						oViewSwitchContainerItem =
							oParent.getMetadata instanceof Function &&
							oParent.getMetadata().getName() === "sap.fe.templates.controls.ViewSwitchContainer" &&
							oParent.getItems().length &&
							oParent.getItems()[0],
						oElement = oViewSwitchContainerItem && oViewSwitchContainerItem.getContent();

					if (oElement && oElement.isA("sap.ui.mdc.Table")) {
						aTables.push(oElement);
						if (
							oElement.getType().isA("sap.ui.mdc.table.GridTableType") &&
							!aSubsection.hasStyleClass("sapUxAPObjectPageSubSectionFitContainer")
						) {
							aSubsection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
						}
					}
				}
			},

			//TODO: This is needed for two workarounds - to be removed again
			_findTables: function() {
				var oObjectPage = this.byId("fe::ObjectPage"),
					aTables = [];
				var aSections = oObjectPage.getSections();
				for (var section = 0; section < aSections.length; section++) {
					var aSubsections = aSections[section].getSubSections();
					for (var subSection = 0; subSection < aSubsections.length; subSection++) {
						this._findTableInSubSection(aSubsections[subSection].getBlocks(), aSubsections[subSection], aTables);
						this._findTableInSubSection(aSubsections[subSection].getMoreBlocks(), aSubsections[subSection], aTables);
					}
				}

				return aTables;
			},

			/**
			 * Chart Context is resolved for 1:n microcharts.
			 *
			 * @param {sap.ui.model.Context} oChartContext 'Context of the MicroChart'
			 * @param {string} sChartPath 'sCollectionPath of the the chart'
			 * @returns {Array} Array of Attributes of the chart Context
			 */
			_getChartContextData: function(oChartContext, sChartPath) {
				var oChartContextData = [];
				var oContextData = oChartContext.getObject();
				if (oChartContext && sChartPath) {
					if (oContextData[sChartPath]) {
						oChartContextData = oContextData[sChartPath];
						delete oContextData[sChartPath];
						oChartContextData.push(oContextData);
					} else {
						oChartContextData = [oChartContext.getObject()];
					}
					return oChartContextData;
				}
			},

			/**
			 * Method to merge selected contexts and filters.
			 *
			 * @function
			 * @name _mergeMultipleContexts
			 * @param {object} oPageContext Page context
			 * @param {object|Array} aLineContext Selected Contexts
			 * @param {string} sChartPath Collection name of the chart
			 * @returns {object} Selection Variant Object
			 */
			_mergeMultipleContexts: function(oPageContext, aLineContext, sChartPath) {
				var that = this;
				var aAttributes = [],
					aPageAttributes = [],
					oMetaModel,
					oContext,
					sMetaPathLine,
					sMetaPathPage,
					sPathLine,
					oPageLevelSV,
					sPagePath;

				sPagePath = oPageContext.getPath();
				oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
				sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

				// Get single line context if necessary
				if (aLineContext && aLineContext.length) {
					oContext = aLineContext[0];
					sPathLine = oContext.getPath();
					sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");

					aLineContext.map(function(oSingleContext) {
						if (sChartPath) {
							var oChartContextData = that._getChartContextData(oSingleContext, sChartPath);
							if (oChartContextData) {
								aAttributes = oChartContextData.map(function(oChartContextData) {
									return {
										contextData: oChartContextData,
										entitySet: sMetaPathPage + "/" + sChartPath
									};
								});
							}
						} else {
							aAttributes.push({
								contextData: oSingleContext.getObject(),
								entitySet: sMetaPathLine
							});
						}
					});
				}
				aPageAttributes.push({
					contextData: oPageContext.getObject(),
					entitySet: sMetaPathPage
				});
				// Adding Page Context to selection variant
				aPageAttributes = CommonUtils.removeSensitiveData(aPageAttributes, oMetaModel);
				oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, that.getView());
				aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);
				return {
					selectionVariant: oPageLevelSV,
					attributes: aAttributes
				};
			},

			_getBatchGroupsForView: function() {
				var that = this,
					oViewData = that.getView().getViewData(),
					oConfigurations = oViewData.controlConfiguration,
					aConfigurations = oConfigurations && Object.keys(oConfigurations),
					aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];

				if (aConfigurations && aConfigurations.length > 0) {
					aConfigurations.forEach(function(sKey) {
						var oConfiguration = oConfigurations[sKey];
						if (oConfiguration.requestGroupId === "LongRunners") {
							aBatchGroups.push("$auto.LongRunners");
						}
					});
				}
				return aBatchGroups;
			},

			/*
			 * Reset Breadcrumb links
			 *
			 * @function
			 * @param {sap.m.Breadcrumbs} [oSource] parent control
			 * @description Used when context of the objectpage changes.
			 *              This event callback is attached to modelContextChange
			 *              event of the Breadcrumb control to catch context change.
			 *              Then element binding and hrefs are updated for each Link.
			 *
			 * @sap-restricted
			 * @experimental
			 */
			_setBreadcrumbLinks: function(oSource) {
				var oContext = oSource.getBindingContext();
				var oAppComponent = CommonUtils.getAppComponent(this.getView());
				if (oContext) {
					var sNewPath = oContext.getPath(),
						aPathParts = sNewPath.split("/"),
						sPath = "";
					aPathParts.shift();
					aPathParts.splice(-1, 1);
					aPathParts.forEach(function(sPathPart, i) {
						sPath += "/" + sPathPart;
						var oRootViewController = oAppComponent.getRootViewController();
						var oTitleHierarchyCache = oRootViewController.getTitleHierarchyCache();
						var pWaitForTitleHiearchyInfo;
						if (!oTitleHierarchyCache[sPath]) {
							pWaitForTitleHiearchyInfo = oRootViewController.addNewEntryInCacheTitle(sPath, oAppComponent);
						} else {
							pWaitForTitleHiearchyInfo = Promise.resolve(oTitleHierarchyCache[sPath]);
						}
						pWaitForTitleHiearchyInfo
							.then(function(oTitleHiearchyInfo) {
								var oLink = oSource.getLinks()[i] ? oSource.getLinks()[i] : new Link();
								// sCurrentEntity is a fallback value in case of empty title
								oLink.setText(oTitleHiearchyInfo.subtitle || oTitleHiearchyInfo.title);
								oLink.setHref(oTitleHiearchyInfo.intent);
								if (!oSource.getLinks()[i]) {
									oSource.addLink(oLink);
								}
							})
							.catch(function(oError) {
								Log.error("Error while computing the title hierarchy", oError);
							});
					});
				}
			},
			_checkDataPointTitleForExternalNavigation: function() {
				var oView = this.getView();
				var oLocalUIModel = oView.getModel("localUI");
				var oAppComponent = CommonUtils.getAppComponent(oView);
				var oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(
					oView.getViewData(),
					this.routing.getOutbounds()
				);
				var oShellServices = oAppComponent.getShellServices();
				var oPageContext = oView && oView.getBindingContext();
				oLocalUIModel.setProperty("/isHeaderDPLinkVisible", {});
				if (oPageContext) {
					oPageContext
						.requestObject()
						.then(function(oData) {
							fnGetLinks(oDataPoints, oData);
						})
						.catch(function(oError) {
							Log.error("Cannot retrieve the links from the shell service", oError);
						});
				}
				/**
				 * @param oError
				 */
				function fnOnError(oError) {
					Log.error(oError);
				}
				/**
				 * @param aSupportedLinks
				 */
				function fnSetLinkEnablement(aSupportedLinks) {
					var sLinkId = this.id;
					// process viable links from getLinks for all datapoints having outbound
					if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
						oLocalUIModel.setProperty("/isHeaderDPLinkVisible/" + sLinkId, true);
					}
				}
				/**
				 * @param oDataPoints
				 * @param oPageData
				 */
				function fnGetLinks(oDataPoints, oPageData) {
					for (var sId in oDataPoints) {
						var oDataPoint = oDataPoints[sId];
						var oParams = {};
						var oLink = oView.byId(sId);
						if (!oLink) {
							// for data points configured in app descriptor but not annotated in the header
							continue;
						}
						var oLinkContext = oLink.getBindingContext();
						var oLinkData = oLinkContext && oLinkContext.getObject();
						var oMixedContext = merge({}, oPageData, oLinkData);
						// process semantic object mappings
						if (oDataPoint.semanticObjectMapping) {
							var aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
							for (var item in aSemanticObjectMapping) {
								var oMapping = aSemanticObjectMapping[item];
								var sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
								var sMappedProperty = oMapping["SemanticObjectProperty"];
								if (sMainProperty !== sMappedProperty) {
									if (oMixedContext.hasOwnProperty(sMainProperty)) {
										var oNewMapping = {};
										oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
										oMixedContext = merge({}, oMixedContext, oNewMapping);
										delete oMixedContext[sMainProperty];
									}
								}
							}
						}

						if (oMixedContext) {
							for (var sKey in oMixedContext) {
								if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
									oParams[sKey] = oMixedContext[sKey];
								}
							}
						}
						// validate if a link must be rendered
						oShellServices
							.isNavigationSupported([
								{
									target: {
										semanticObject: oDataPoint.semanticObject,
										action: oDataPoint.action
									},
									params: oParams
								}
							])
							.then(
								fnSetLinkEnablement.bind({
									id: sId
								})
							)
							.catch(fnOnError);
					}
				}
			},
			_clearTableSelection: function() {
				var that = this;
				var aTables = this._findTables();
				var oLocalUIModel = this.getView().getModel("localUI");
				aTables.forEach(function(oTable) {
					var sTableId = that.getView().getLocalId(oTable.getId());
					var selectedCtx = (oTable && oTable.getSelectedContexts()) || [];
					if (selectedCtx.length > 0) {
						// clear selected contexts in the table
						oTable.clearSelection();
						if (oLocalUIModel) {
							// disable bound actions
							oLocalUIModel.setProperty("/$contexts/" + sTableId, {});
						}
					}
				});
			},
			_onPasteInTable: function(oEvent, bCreateAtEnd) {
				// If we're not in edit mode, we can't paste anything
				if (
					this.getView()
						.getModel("ui")
						.getProperty("/editMode") !== "Editable"
				) {
					return;
				}

				var aRawPastedData = oEvent.getParameter("data"),
					oTable = oEvent.getSource(),
					bPasteEnabled = oTable.data()["pasteEnabled"],
					that = this,
					oResourceModel;

				// We enable paste if bPasteEnabled === null, because in that case, create is allowed
				if (bPasteEnabled !== false && bPasteEnabled !== undefined) {
					FEPasteHelper.parseDataForTablePaste(aRawPastedData, oTable)
						.then(function(aParsedData) {
							if (aParsedData && aParsedData.length > 0) {
								return that.editFlow.createMultipleDocuments(oTable.getRowBinding(), aParsedData, bCreateAtEnd);
							}
						})
						.catch(function(oError) {
							Log.error("Error while pasting data", oError);
						});
				} else {
					oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
					MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
						title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
					});
				}
			},
			_onPasteTableButtonPressed: function(oTable) {
				var oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates");
				MessageBox.information(oResourceModel.getText("T_OP_CONTROLLER_TABLE_PASTE_BUTTON_ACTION_MESSAGE"), {
					onClose: function(oEvent) {
						if (oTable) {
							// Set the focus on the inner table to allow paste
							oTable.getAggregation("_content").applyFocusInfo({ preventScroll: true });
						}
					}
				});
			},
			handlers: {
				onFieldValueChange: function(oEvent) {
					this.editFlow.syncTask(oEvent.getParameter("promise"));
					FieldRuntime.handleChange(oEvent);
				},
				onTableContextChange: function(oEvent) {
					var that = this;
					var oSource = oEvent.getSource();
					var oTable;
					this._findTables().some(function(_oTable) {
						if (_oTable.getRowBinding() === oSource) {
							oTable = _oTable;
							return true;
						}
						return false;
					});

					var bEnableAutoScroll = oTable.data("enableAutoScroll");

					if (typeof bEnableAutoScroll === "string") {
						bEnableAutoScroll = bEnableAutoScroll === "true" ? true : false;
					}

					if (bEnableAutoScroll && this.editFlow.getCurrentActionPromise()) {
						var aTableContexts = oSource.getContexts(0);
						//if contexts are not fully loaded the getcontexts function above will trigger a new change event call
						if (!aTableContexts[0]) {
							return;
						}
						this.editFlow
							.getCurrentActionPromise()
							.then(function(oActionResponse) {
								if (!oActionResponse) {
									return;
								}
								var oActionData = oActionResponse.oData;
								var aKeys = oActionResponse.keys;
								var iNewItemp = -1;
								aTableContexts.find(function(oTableContext, i) {
									var oTableData = oTableContext.getObject();
									var bCompare = aKeys.every(function(sKey) {
										return oTableData[sKey] === oActionData[sKey];
									});
									if (bCompare) {
										iNewItemp = i;
									}
									return bCompare;
								});
								if (iNewItemp !== -1) {
									oTable.scrollToIndex(iNewItemp);
									that.editFlow.deleteCurrentActionPromise();
								}
							})
							.catch(function(err) {
								Log.error("An error occurs while scrolling to the newly created Item: " + err);
							});
					}
				},

				onShareObjectPageActionButtonPress: function(oEvent, oController) {
					var oControl = oController.getView().byId("fe::Share");
					oController
						._getPageTitleInformation()
						.then(function(pageTitleInfo) {
							if (oControl && (oControl.getVisible() || (oControl.getEnabled && oControl.getEnabled()))) {
								ShareUtils.onShareActionButtonPressImpl(oControl, oController, pageTitleInfo);
							}
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the page title information", oError);
						});
				},
				onRelatedAppsItemPressed: function(oEvent, oController) {
					var oControl = oEvent.getSource(),
						oBindingContext = oController && oController.getView() && oController.getView().getBindingContext();

					oController.editFlow
						.getProgrammingModel(oBindingContext)
						.then(function(programmingModel) {
							var aCustomData = oControl.getCustomData(),
								targetSemObject,
								targetAction;

							for (var i = 0; i < aCustomData.length; i++) {
								var key = aCustomData[i].getKey();
								var value = aCustomData[i].getValue();
								if (key == "targetSemObject") {
									targetSemObject = value;
								} else if (key == "targetAction") {
									targetAction = value;
								}
							}
							var oTarget = {
								semanticObject: targetSemObject,
								action: targetAction
							};

							var oContext = oController
								.getView()
								.getAggregation("content")[0]
								.getBindingContext();
							var oMetaModel = oController
								.getView()
								.getModel()
								.getMetaModel();
							var aAttributes = [
								{
									contextData: oContext.getObject(),
									entitySet: oMetaModel.getMetaPath(oContext.getPath()).replace(/^\/*/, "")
								}
							];
							aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);

							// Incident 2070145088 (v4) & 1980445541 (v2)
							CommonUtils.navigateToExternalApp(
								oController.getView(),
								{
									selectionVariant: new SelectionVariant(),
									attributes: aAttributes
								},
								oTarget.semanticObject,
								oTarget.action,
								null,
								CommonUtils.isStickyEditMode(oControl, programmingModel)
							);
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the programming model", oError);
						});
				},
				/**
				 * Invokes an action - bound/unbound and sets the page dirty.
				 *
				 * @param oView
				 * @param {string} sActionName The name of the action to be called
				 * @param {map} [mParameters] contains the following attributes:
				 * @param {sap.ui.model.odata.v4.Context} [mParameters.contexts] contexts Mandatory for a bound action, Either one context or an array with contexts for which the action shall be called
				 * @param {sap.ui.model.odata.v4.ODataModel} [mParameters.model] oModel Mandatory for an unbound action, An instance of an OData v4 model
				 * @returns {Promise}
				 * @sap-restricted
				 * @final
				 */
				onCallActionFromFooter: function(oView, sActionName, mParameters) {
					var oController = oView.getController();
					var that = oController;
					return oController.editFlow
						.onCallAction(sActionName, mParameters)
						.then(function() {
							var oMessageButton = that.getView().byId("fe::FooterBar::MessageButton");
							if (oMessageButton.isActive()) {
								that._showMessagePopover(oMessageButton);
							} else if (iMessages) {
								that._oDelegateOnAfter = {
									onAfterRendering: function(oEvent) {
										that._showMessagePopover(oMessageButton);
										oMessageButton.removeEventDelegate(that._oDelegateOnAfter);
										delete that._oDelegateOnAfter;
									}
								};
								oMessageButton.addEventDelegate(that._oDelegateOnAfter, that);
							}
						})
						.catch(function(err) {
							var oMessageButton = that.getView().byId("fe::FooterBar::MessageButton");
							if (oMessageButton) {
								that._showMessagePopover(oMessageButton);
							}
						});
				},
				onDataPointTitlePressed: function(oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
					oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
					var oControl = oController && oController.getView();
					var oTargetInfo = oManifestOutbound[sControlConfig];
					var aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo);
					var oDataPointOrChartBindingContext = oSource.getBindingContext();
					var oPageBindingContext = oController.getView().getBindingContext();
					var oMixedAttributes = oController._mergeMultipleContexts(
						oPageBindingContext,
						[oDataPointOrChartBindingContext],
						sCollectionPath
					);
					if (aSemanticObjectMapping.length > 0) {
						oMixedAttributes.semanticObjectMapping = aSemanticObjectMapping;
					}
					oController.editFlow
						.getProgrammingModel(oPageBindingContext)
						.then(function(sProgrammingModel) {
							CommonUtils.navigateToExternalApp(
								oController.getView(),
								oMixedAttributes,
								oTargetInfo.semanticObject,
								oTargetInfo.action,
								null,
								CommonUtils.isStickyEditMode(oControl, sProgrammingModel)
							);
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the programming model", oError);
						});
				},

				onDataFieldForIntentBasedNavigation: function(
					oController,
					sSemanticObject,
					sAction,
					sMappings,
					aLineContexts,
					bRequiresContext,
					bInline
				) {
					var oControl = oController && oController.getView(),
						oBindingContext = oControl && oControl.getBindingContext();

					if (bInline === "true" && (bRequiresContext === "false" || bRequiresContext === "undefined")) {
						MessageBox.show(ResourceModel.getText("M_COMMON_NAVIGATION_CONTEXT_MESSAGE"), {
							title: ResourceModel.getText("M_COMMON_NAVIGATION_ERROR_TITLE")
						});
					} else {
						oController.editFlow
							.getProgrammingModel(oBindingContext)
							.then(function(programmingModel) {
								var oSelectionVariantAndAttributes;
								var mPageContext;
								if (
									oController
										.getView()
										.getAggregation("content")[0]
										.getBindingContext()
								) {
									mPageContext = oController
										.getView()
										.getAggregation("content")[0]
										.getBindingContext(); // In OP we will always pass pagecontext when requirescontext is true
								}
								// Line context is considered if a context is selected in the table and also requirescontext is true
								if (aLineContexts && !Array.isArray(aLineContexts)) {
									aLineContexts = [aLineContexts];
								}
								oSelectionVariantAndAttributes = oController._mergeMultipleContexts(mPageContext, aLineContexts);

								if (sMappings != "undefined") {
									oSelectionVariantAndAttributes.semanticObjectMapping = sMappings;
								}
								// Opening the IBN link in new tab if application is in sticky edit mode
								CommonUtils.navigateToExternalApp(
									oController.getView(),
									oSelectionVariantAndAttributes,
									sSemanticObject,
									sAction,
									null,
									CommonUtils.isStickyEditMode(oControl, programmingModel)
								);
							})
							.catch(function(oError) {
								Log.error("Error while retrieving the programming model", oError);
							});
					}
				},

				/**
				 * Triggers an outbound navigation on Chevron Press.
				 *
				 * @param oController
				 * @param {string} sOutboundTarget name of the outbound target (needs to be defined in the manifest)
				 * @param {sap.ui.model.odata.v4.Context} oContext that contain the data for the target app
				 * @returns {Promise} Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
				 */
				onChevronPressNavigateOutBound: function(oController, sOutboundTarget, oContext) {
					var oControl = oController && oController.getView(),
						oBindingContext = oControl && oControl.getBindingContext();

					return oController.editFlow.getProgrammingModel(oBindingContext).then(function(programmingModel) {
						var oOutbounds = oController.routing.getOutbounds(),
							oSelectionVariantAndAttributes,
							oDisplayOutbound = oOutbounds[sOutboundTarget],
							mPageContext = oController
								.getView()
								.getAggregation("content")[0]
								.getBindingContext();

						if (oDisplayOutbound) {
							if (oContext) {
								oSelectionVariantAndAttributes = oController._mergeMultipleContexts(mPageContext, [oContext]);
							}
							// Opening the IBN link in new tab if application is in sticky edit mode
							CommonUtils.navigateToExternalApp(
								oController.getView(),
								oSelectionVariantAndAttributes,
								oDisplayOutbound.semanticObject,
								oDisplayOutbound.action,
								CommonHelper.showNavigateErrorMessage,
								CommonUtils.isStickyEditMode(oControl, programmingModel)
							);

							return Promise.resolve();
						} else {
							throw new Error("outbound target " + sOutboundTarget + " not found in cross navigation definition of manifest");
						}
					});
				},
				onNavigateChange: function(oEvent) {
					//will be called always when we click on a section tab
					this._oAppComponent.getAppStateHandler().createAppState(this, oEvent);
					this.bSectionNavigated = true;
				},
				onVariantSelected: function(oEvent) {
					this._oAppComponent.getAppStateHandler().createAppState(this, oEvent);
				},
				onVariantSaved: function(oEvent) {
					var that = this;
					var oLocalEvent = merge({}, oEvent); //using merge to create a copy of oEvent because it is undefined once we enter setTimeOut
					//TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
					setTimeout(function() {
						that._oAppComponent.getAppStateHandler().createAppState(that, oLocalEvent);
					}, 500);
				},
				navigateToSubSection: function(oController, vDetailConfig) {
					var oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig,
						oObjectPage = oController.getView().byId("fe::ObjectPage"),
						oSection,
						oSubSection;
					if (oDetailConfig.sectionId) {
						oSection = oController.getView().byId(oDetailConfig.sectionId);
						oSubSection = oDetailConfig.subSectionId
							? oController.getView().byId(oDetailConfig.subSectionId)
							: oSection && oSection.getSubSections() && oSection.getSubSections()[0];
					} else if (oDetailConfig.subSectionId) {
						oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
						oSection = oSubSection && oSubSection.getParent();
					}
					if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
						oController
							.getView()
							.getModel("sap.fe.i18n")
							.getResourceBundle()
							.then(function(oResourceBundle) {
								var sTitle = CommonUtils.getTranslatedText(
									"T_OP_CONTROLLER_OBJECT_PAGE_INPAGE_NAV_ERROR",
									oResourceBundle,
									null,
									oController.getView().getViewData().entitySet
								);
								MessageBox.error(sTitle);
							})
							.catch(function(error) {
								Log.error(error);
							});
					} else {
						oObjectPage.scrollToSection(oSubSection.getId());
						// trigger iapp state change
						oObjectPage.fireNavigate({
							section: oSection,
							subSection: oSubSection
						});
					}
				},
				onChartSelectionChanged: function(oEvent) {
					ChartRuntime.fnUpdateChart(oEvent);
				}
			}
		});
	}
);
