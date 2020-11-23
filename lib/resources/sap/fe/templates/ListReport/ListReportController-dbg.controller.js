/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/fe/core/controllerextensions/Routing",
		"sap/fe/core/controllerextensions/FlexibleColumnLayout",
		"sap/fe/core/controllerextensions/EditFlow",
		"sap/fe/macros/field/FieldRuntime",
		"sap/fe/macros/CommonHelper",
		"sap/fe/core/AnnotationHelper",
		"sap/fe/core/actions/messageHandling",
		"sap/base/Log",
		"sap/base/util/ObjectPath",
		"sap/fe/navigation/SelectionVariant",
		"sap/m/MessageBox",
		"sap/fe/core/CommonUtils",
		"sap/fe/navigation/library",
		"sap/fe/core/FEHelper",
		"sap/ui/mdc/p13n/StateUtil",
		"sap/fe/macros/table/Utils",
		"sap/fe/macros/ResourceModel",
		"sap/fe/core/controllerextensions/RoutingListener",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/fe/macros/chart/ChartRuntime",
		"sap/fe/templates/controls/Share/ShareUtils",
		"sap/base/util/merge",
		"sap/fe/templates/ListReport/ExtensionAPI",
		"sap/fe/macros/filter/FilterUtils",
		"sap/fe/macros/chart/ChartUtils"
	],
	function(
		Controller,
		JSONModel,
		Routing,
		FlexibleColumnLayoutExt,
		EditFlow,
		FieldRuntime,
		CommonHelper,
		AnnotationHelper,
		messageHandling,
		Log,
		ObjectPath,
		SelectionVariant,
		MessageBox,
		CommonUtils,
		NavLibrary,
		FEHelper,
		StateUtil,
		TableUtils,
		ResourceModel,
		RoutingListener,
		Filter,
		FilterOperator,
		ChartRuntime,
		ShareUtils,
		merge,
		ExtensionAPI,
		FilterUtils,
		ChartUtils
	) {
		"use strict";

		return Controller.extend("sap.fe.templates.ListReport.ListReportController", {
			routingListener: RoutingListener,

			getExtensionAPI: function() {
				if (!this.extensionAPI) {
					this.extensionAPI = new ExtensionAPI(this);
				}
				return this.extensionAPI;
			},

			constructor: function() {
				Controller.apply(this, arguments);
				this.routing = new Routing();
				this.fcl = new FlexibleColumnLayoutExt();
				this.editFlow = new EditFlow();
			},

			//appState : AppState, The AppState is currently deactivated

			// TODO: get rid of this
			// it's currently needed to show the transient messages after the table request fails
			// we assume that the table should show those messages in the future
			messageHandling: messageHandling,

			onInit: function() {
				var that = this;
				this.routing.configure(this.getView(), this.fcl);
				this.fcl.configure(this.getView(), this.routing);
				this.editFlow.configure(this.getView(), this.routing);
				this._oAppComponent = CommonUtils.getAppComponent(this.getView());
				var aTables = this._getTables();
				var aListReportPromises = [];

				aTables.forEach(function(oTable) {
					//disable QuickFilter by default (Enable QuickFilter only if search is triggered)
					var oQuickFilterControl = oTable.getQuickFilter();
					if (oQuickFilterControl) {
						oQuickFilterControl.setEnabled(false);
					}
					if (that._isMultiMode()) {
						var oUpdateCounts = function() {
							that._updateCounts();
						};
						TableUtils.addEventToBindingInfo(oTable, "dataRequested", oUpdateCounts);
						aListReportPromises.push(oTable.initialized());
					}
				});
				aListReportPromises.push(this._getFilterBarControl().waitForInitialization());

				// set filter bar to disabled until app state is loaded
				// TODO: there seems to be a big in the filter layout - to be checked
				//this.oFilterBar.setEnabled(false);

				// disable for now - TODO: enable with actions again
				//this.setShareModel();

				// store the controller for later use
				// Set internal UI model and model from transaction controller
				this.getView().setModel(this.editFlow.getTransactionHelper().getUIStateModel(), "ui");
				this.getView().setModel(
					this.editFlow.getUIStateModel({
						sessionOn: false,
						appliedFilters: "",
						filterBarExpanded: true
					}),
					"localUI"
				);

				// Store conditions from filter bar
				// this is later used before navigation to get conditions applied on the filter bar
				this.filterBarConditions = {};
				// request a new appState Model for the view
				/*
						// The AppState is currently deactivated
						this.appState.requestAppStateModel(this.getView().getId()).then(function(oAppStateModel){
							that.getView().setModel(oAppStateModel, "sap.fe.appState");

							// This is only a workaround as the controls do not yet support binding the appState
							var oAppState = oAppStateModel.getData();
							if (oAppState && oAppState.filterBar) {
								// an app state exists, apply it
								that.applyAppStateToFilterBar().then(function() {
									// enable filterbar once the app state is applied
									that.oFilterBar.setEnabled(true);
								});
							} else {
								that.oFilterBar.setEnabled(true);
							}

							// attach to further app state changed
							//oAppStateModel.bindList("/").attachChange(that.applyAppStateToFilterBar.bind(that));
						});
						*/

				// As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
				// happen after the routeMatch event has been processed (otherwise the router gets broken)
				this._oAppComponent.getRouterProxy().waitForRouteMatchBeforeNavigation();
				Promise.all(aListReportPromises)
					.then(function() {
						aTables.forEach(function(oTable) {
							//disable QuickFilter by default (Enable QuickFilter only if search is triggered)
							var oQuickFilterControl = oTable.getQuickFilter();
							if (oQuickFilterControl) {
								oQuickFilterControl.bindProperty("enabled", "localUI>/isPendingFilters", function(bValue) {
									return bValue !== true;
								});
							}
						});
						that._updateMultiTableHiddenStatus();
						that._oAppComponent.getAppStateHandler().applyAppState(that);
					})
					.catch(function(oError) {
						Log.error("Error while getting the chart", oError);
					});
			},
			onExit: function() {
				delete this.filterBarConditions;
				delete this._oListReportControl;
				delete this._bMultiMode;
				this.editFlow.destroy();
			},
			onAfterBinding: function(oBindingContext, mParameters) {
				if (this.routing.isUIStateDirty()) {
					var oTableBinding = this._getTableBinding();
					var oLocalUIModel = this.getView().getModel("localUI");
					if (oTableBinding) {
						oTableBinding.refresh();
						if (oLocalUIModel) {
							// clear any previous selection to disable bound actions
							oLocalUIModel.setProperty("/$contexts", {});
						}
					}
					this.routing.setUIStateProcessed();
				}
				var aTables = this._getTables();
				var aIBNActions = [];
				aTables.forEach(function(oTable) {
					aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
				});
				CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
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
			onPageReady: function(mParameters) {
				var oLastFocusedControl = mParameters.lastFocusedControl;
				var oView = this.getView();
				// set the focus to the first action button, or to the first editable input if in editable mode
				if (oLastFocusedControl && oLastFocusedControl.controlId && oLastFocusedControl.focusInfo) {
					var oFocusControl = oView.byId(oLastFocusedControl.controlId);
					if (oFocusControl) {
						oFocusControl.applyFocusInfo(oLastFocusedControl.focusInfo);
					}
				}
			},
			_getPageTitleInformation: function() {
				var that = this;
				return new Promise(function(resolve, reject) {
					var oTitleInfo = { title: "", subtitle: "", intent: "", icon: "" };
					oTitleInfo.title = that
						.getView()
						.getContent()[0]
						.data().ListReportTitle;
					oTitleInfo.subtitle = that
						.getView()
						.getContent()[0]
						.data().ListReportSubtitle;
					resolve(oTitleInfo);
				});
			},
			_getFilterBarControl: function() {
				return this.getView().byId(this._getFilterBarControlId());
			},
			_getFilterBarControlId: function() {
				return this.getView()
					.getContent()[0]
					.data("filterBarId");
			},
			_getChartControlId: function() {
				return this.getView()
					.getContent()[0]
					.data("singleChartId");
			},

			_getChartControl: function() {
				return this.getView().byId(this._getChartControlId());
			},
			_getMultiModeControl: function() {
				return this.getView().byId("fe::TabMultipleMode");
			},
			_getTableControlId: function() {
				return this.getView()
					.getContent()[0]
					.data("singleTableId");
			},
			_getCurrentTable: function() {
				if (!this._oListReportControl) {
					var oMultiModeTab = this._getMultiModeControl();
					if (oMultiModeTab) {
						this._oListReportControl = this.getView().byId(
							oMultiModeTab.getSelectedKey() || oMultiModeTab.getItems()[0].getKey()
						);
					} else {
						this._oListReportControl = this.getView().byId(this._getTableControlId());
					}
				}
				return this._oListReportControl;
			},
			_getTableBinding: function(sTableId) {
				var oTableControl = sTableId ? this.getView().byId(sTableId) : this._getCurrentTable(),
					oBinding = oTableControl && oTableControl._getRowBinding();

				return oBinding;
			},
			_getTables: function() {
				var that = this;
				if (this._isMultiMode()) {
					var aTables = [];
					var oTabMultiMode = this._getMultiModeControl();
					oTabMultiMode.getItems().forEach(function(oItem) {
						var oTable = that.getView().byId(oItem.getKey());
						if (oTable) {
							aTables.push(oTable);
						}
					});
					return aTables;
				}
				return [this._getCurrentTable()];
			},
			/**
			 * Method to merge selected contexts and filters.
			 *
			 * @param {object|Array} aContexts Array or single Context
			 * @param {object} filterBarConditions FilterBar conditions
			 * @returns {object} Selection Variant Object
			 */
			_getMergedContext: function(aContexts, filterBarConditions) {
				var oFilterBarSV, aAttributes;
				oFilterBarSV = CommonUtils.addExternalStateFiltersToSelectionVariant(new SelectionVariant(), filterBarConditions);
				// Get single from array if necessary
				if (aContexts && aContexts.length) {
					var oMetaModel = this.getView()
						.getModel()
						.getMetaModel();

					aAttributes = aContexts.map(function(oC) {
						return {
							contextData: oC.getObject(),
							entitySet: oMetaModel.getMetaPath(oC.getPath()).replace(/^\/*/, "")
						};
					});
					aAttributes = CommonUtils.removeSensitiveData(aAttributes, oMetaModel);
				}
				return {
					selectionVariant: oFilterBarSV,
					attributes: aAttributes
				};
			},
			/**
			 * Method to know if ListReport is configured with Multiple Table mode.
			 *
			 * @function
			 * @name _isMultiMode
			 * @returns {boolean} Is Multiple Table mode set?
			 */
			_isMultiMode: function() {
				if (!this._oListReportControl) {
					this._bMultiMode = !!this._getMultiModeControl();
				}
				return this._bMultiMode;
			},

			// This is only a workaround as the filterBar does not yet support binding the appState
			/*
		 // The AppState is currently deactivated
		createAppStateFromFilterBar: function() {
			var sFilterBarAppState = this.oFilterBar.getAppState();

			if (!sFilterBarAppState) {
				// no app state exists and filter bar does not have any app state relevant changes, there is
				// no need to generate an app state
				return;
			}

			var oAppState = {
				filterBar: sFilterBarAppState
			};

			this.getView().getModel("sap.fe.appState").setData(oAppState);
		},

		// This is only a workaround as the filterBar does not yet support binding the appState
		applyAppStateToFilterBar: function() {
			var	oAppState = this.getView().getModel("sap.fe.appState").getData();

			if (oAppState && oAppState.filterBar) {
				return this.oFilterBar.setAppState(oAppState.filterBar);
			}
		},
		*/
			_setShareModel: function() {
				// TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
				// this method is currently not called anymore from the init method

				var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
				//var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
				//var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

				//shareModel: Holds all the sharing relevant information and info used in XML view
				var oShareInfo = {
					bookmarkTitle: document.title, //To name the bookmark according to the app title.
					bookmarkCustomUrl: function() {
						var sHash = window.hasher.getHash();
						return sHash ? "#" + sHash : window.location.href;
					},
					/*
								To be activated once the FLP shows the count - see comment above
								bookmarkServiceUrl: function() {
									//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
									// we should use table.getListBindingInfo instead of the binding
									var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
									return oBinding ? fnGetDownloadUrl(oBinding) : "";
								},*/
					isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
				};

				var oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
				oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
			},

			/**
			 * Hidden tables must be marked as hidden to avoid sending
			 * requests when FilterBar is changed or LR is initialized
			 * Best workflow would be to suspend table binding but
			 * if the user switch quickly between tabs the batch response of previous
			 * is recevied when previous tab is already disabled (binding is suspended) and
			 * generates error.
			 * A temporary solution (if we find better workflow) is to set a customData and don't trigger
			 * rebindTable if this customData is set to true.
			 */
			_updateMultiTableHiddenStatus: function() {
				var oDisplayedTable = this._getCurrentTable();
				if (this._isMultiMode() && oDisplayedTable) {
					var sDisplayTableId = oDisplayedTable.getId();
					var aTables = this._getTables();
					aTables.forEach(function(oTable) {
						var sTableId = oTable.getId();
						oTable.data("tableHidden", sTableId !== sDisplayTableId);
					});
				}
			},
			_updateTableControl: function() {
				this._oListReportControl = undefined;
				this._getCurrentTable();
			},
			_updateCounts: function() {
				this._updateMutliModeCounts();
			},
			_updateMutliModeCounts: function() {
				var that = this;
				var aBindingPromises = [];
				var oMutliModeControl = this._getMultiModeControl();
				if (oMutliModeControl && oMutliModeControl.data("showCounts") === "true") {
					var oDisplayedTable = this._getCurrentTable();
					var sDisplayedTableId = oDisplayedTable.getId();
					var aCompliantTabs = [];
					var aItems = oMutliModeControl.getItems();
					aItems.forEach(function(oItem) {
						var oTable = that.getView().byId(oItem.getKey());
						if (oTable && (oItem.data("outdatedCounts") || oTable.getId() === sDisplayedTableId)) {
							aCompliantTabs.push({
								table: oTable,
								item: oItem
							});
						}
					});

					aBindingPromises = aCompliantTabs.map(function(mTab) {
						mTab.item.setCount("...");
						var oTable = mTab.table;
						var oFilterInfos = TableUtils.getFiltersInfoforSV(oTable, mTab.item.data("selectionVariant"));
						return TableUtils.getListBindingForCount(oTable, that.getView().getBindingContext(), {
							batchGroupId: oTable.getId() === sDisplayedTableId ? oTable.data("batchGroupId") : "$auto",
							additionalFilters: oFilterInfos.filters
						});
					});

					Promise.all(aBindingPromises)
						.then(function(aCounts) {
							for (var k in aCounts) {
								var oItem = aCompliantTabs[k].item;
								oItem.setCount(TableUtils.getCountFormatted(aCounts[k]));
								oItem.data("outdatedCounts", false);
							}
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the values for the icon tab bar", oError);
						});
				}
			},
			handlers: {
				onShareListReportActionButtonPress: function(oEvent, oController) {
					var oControl = oController.getView().byId("fe::Share");
					if (oControl && (oControl.getVisible() || (oControl.getEnabled && oControl.getEnabled()))) {
						ShareUtils.onShareActionButtonPressImpl(oControl, oController, null);
					}
				},
				onTabMultiModeChange: function(oEvent) {
					this._updateTableControl();
					this._updateMultiTableHiddenStatus();
					var oFilterBar = this._getFilterBarControl();
					var oLocalModel = this.getView().getModel("localUI");
					var oDisplayedTable = this._getCurrentTable();
					if (
						oFilterBar &&
						oLocalModel.getProperty("/isPendingFilters") !== true && // No pending filters into FitlerBar
						(!oDisplayedTable.getRowBinding() || // first time the tab/table is displayed
							oDisplayedTable.data("outdatedRows") === true) // Search has been triggered on a different tab
					) {
						oDisplayedTable.rebindTable();
						oDisplayedTable.data("outdatedRows", false);
					}
					var oLocalEvent = merge({}, oEvent);
					this._oAppComponent.getAppStateHandler().createAppState(this, oLocalEvent);
				},
				onFiltersChanged: function(oEvent) {
					var that = this;
					var oFilterBar = oEvent.getSource(),
						oModel = this.getView().getModel("localUI");
					oModel.setProperty("/appliedFilters", oFilterBar.getAssignedFiltersText().filtersText);
					oModel.setProperty("/isPendingFilters", true);
					var oLocalEvent = merge({}, oEvent);
					var oTable = this._getCurrentTable();
					Promise.all([oFilterBar.waitForInitialization(), oTable.initialized()])
						.then(function() {
							if (oLocalEvent.getParameter("conditionsBased")) {
								that._oAppComponent.getAppStateHandler().createAppState(that, oLocalEvent);
							}
						})
						.catch(function(oError) {
							Log.error("Error while waiting for filterbar and table", oError);
						});
				},
				onVariantSelected: function(oEvent) {
					var oLocalEvent = merge({}, oEvent);
					this._oAppComponent.getAppStateHandler().createAppState(this, oLocalEvent);
				},
				onVariantSaved: function(oEvent) {
					var that = this;
					var oLocalEvent = merge({}, oEvent);
					//TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
					setTimeout(function() {
						that._oAppComponent.getAppStateHandler().createAppState(that, oLocalEvent);
					}, 500);
				},
				onSearch: function(oEvent) {
					var sDisplayedTableId = this._getCurrentTable().getId();
					var oLocalModel = this.getView().getModel("localUI");
					oLocalModel.setProperty("/isPendingFilters", false);
					oLocalModel.setProperty("/filterBarExpanded", false);
					if (this._isMultiMode()) {
						var aTables = this._getTables();
						var oMutliModeControl = this._getMultiModeControl();
						if (oMutliModeControl && oMutliModeControl.data("showCounts") === "true") {
							var aItems = oMutliModeControl.getItems();
							aItems.forEach(function(oItem) {
								oItem.data("outdatedCounts", true);
							});
						}
						aTables.forEach(function(oTable) {
							oTable.data("outdatedRows", oTable.getId() !== sDisplayedTableId);
						});
					}
					var oAppStateHandler = this._oAppComponent.getAppStateHandler();
					var that = this;
					var oFilterBar = oEvent.getSource();
					var oMdcChart = this._getChartControl();
					if (oMdcChart) {
						var oModel = oMdcChart.getModel("localUI");
						//clearing previous selections
						oModel.setProperty("/$contexts", {});
					}
					// store filter bar conditions to use later while navigation
					StateUtil.retrieveExternalState(oFilterBar)
						.then(function(oExternalState) {
							that.filterBarConditions = oExternalState.filter;
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the external state", oError);
						});
					if (this.getView().getViewData().liveMode === false && oAppStateHandler.bIsInitialSearch === false) {
						var oLocalEvent = merge({}, oEvent);
						this._oAppComponent.getAppStateHandler().createAppState(this, oLocalEvent);
					}
					if (oAppStateHandler.bIsInitialSearch === true) {
						oAppStateHandler.bIsInitialSearch = false;
					}
				},
				onFieldValueChange: function(oEvent) {
					this.editFlow.syncTask(oEvent.getParameter("promise"));
					FieldRuntime.handleChange(oEvent);
				},
				onDataFieldForIntentBasedNavigation: function(
					oController,
					sSemanticObject,
					sAction,
					sMappings,
					vContext,
					bRequiresContext,
					bInline
				) {
					// 1. Also consider FilterBar conditions
					// 2. convert them into SV
					// 3. Merge both oContext and SV from FilterBar (2)
					// if there is no FilterBar conditions then simply use oContext to create a SelectionVariant
					var oSelectionVariantAndAttributes = {};

					if (bInline === "true" && (bRequiresContext === "false" || bRequiresContext === "undefined")) {
						sap.m.MessageBox.show(ResourceModel.getText("M_COMMON_NAVIGATION_CONTEXT_MESSAGE"), {
							title: ResourceModel.getText("M_COMMON_NAVIGATION_ERROR_TITLE")
						});
					} else {
						if (vContext && vContext.length) {
							oSelectionVariantAndAttributes = oController._getMergedContext(vContext, oController.filterBarConditions);
							if (sMappings != "undefined") {
								oSelectionVariantAndAttributes.semanticObjectMapping = sMappings;
							}
						}
						oSelectionVariantAndAttributes.entitySet = oController.getView().getViewData().entitySet;
						CommonUtils.navigateToExternalApp(
							oController.getView(),
							oSelectionVariantAndAttributes,
							sSemanticObject,
							sAction,
							null
						);
					}
				},
				/**
				 * Triggers an outbound navigation on Chevron Press.
				 *
				 * @param {object} oController
				 * @param {string} sOutboundTarget name of the outbound target (needs to be defined in the manifest)
				 * @param {sap.ui.model.odata.v4.Context} oContext that contain the data for the target app

				 * @returns {Promise} Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
				 * @sap-restricted
				 * @final
				 */
				onChevronPressNavigateOutBound: function(oController, sOutboundTarget, oContext) {
					var oOutbounds = oController.routing.getOutbounds(),
						oSelectionVariantAndAttributes = {},
						oDisplayOutbound = oOutbounds[sOutboundTarget];
					if (oDisplayOutbound) {
						if (oContext) {
							oSelectionVariantAndAttributes = oController._getMergedContext([oContext], oController.filterBarConditions);
						}
						oSelectionVariantAndAttributes.entitySet = oController.getView().getViewData().entitySet;
						CommonUtils.navigateToExternalApp(
							oController.getView(),
							oSelectionVariantAndAttributes,
							oDisplayOutbound.semanticObject,
							oDisplayOutbound.action,
							CommonHelper.showNavigateErrorMessage
						);

						return Promise.resolve();
					} else {
						throw new Error("outbound target " + sOutboundTarget + " not found in cross navigation definition of manifest");
					}
				},
				onChartSelectionChanged: function(oEvent) {
					var oMdcChart = oEvent.getSource(),
						oTable = this._getCurrentTable(),
						oDataContext = oEvent.getParameter("dataContext");
					if (oDataContext && oDataContext.data) {
						// update action buttons enablement / disablement
						ChartRuntime.fnUpdateChart(oEvent);
						// update selections on selection or deselection
						ChartUtils.setChartFilters(oMdcChart);
					}
					if (oTable) {
						oTable.rebindTable();
					}
				}
			}
		});
	}
);
