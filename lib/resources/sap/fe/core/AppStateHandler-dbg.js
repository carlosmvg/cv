/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[
		"sap/ui/mdc/p13n/StateUtil",
		"sap/ui/base/Object",
		"sap/fe/core/library",
		"sap/fe/navigation/library",
		"sap/fe/core/CommonUtils",
		"sap/ui/fl/apply/api/ControlVariantApplyAPI",
		"sap/base/Log",
		"sap/base/util/merge"
	],
	function(StateUtil, BaseObject, CoreLibrary, NavLibrary, CommonUtils, ControlVariantApplyAPI, Log, merge) {
		"use strict";

		var NavType = NavLibrary.NavType,
			VariantManagement = CoreLibrary.VariantManagement;
		return BaseObject.extend("sap.fe.core.AppStateHandler", {
			constructor: function() {
				this.bIsAppStateReady = false;
				this.sNavType = null;
				this.bNoRouteChange = false;
				this.bIsInitialSearch = false;
				this.mInnerAppDataForFCL = {};
				this.mInnerAppDataForLR = {};
				this.mInnerAppDataForOP = {};
				this.getAppData = Promise.resolve();
				Log.info("APPSTATE : Appstate handler initialized");
				return BaseObject.apply(this, arguments);
			},
			/**
			 * Creates an appstate on every filter change and also variant change.
			 *
			 * @static
			 * @param {object} oController Instance of the controller passed
			 * @param oEvent
			 * @private
			 * @sap-restricted
			 */
			createAppState: function(oController, oEvent) {
				/* currently we are passing the controller of the view for which we need to create the app state but in future this can also be used to create
			appstate for storing the control level data by passing the control */
				var oComponent = oController.getOwnerComponent();
				this.bNoRouteChange = false;
				if (this._isListBasedComponent(oComponent) && this._getIsAppStateReady()) {
					this._fnCreateAppStateForLR(oController, oEvent);
					Log.info("APPSTATE: AppState for LR created");
				} else if (oComponent.isA("sap.fe.templates.ObjectPage.Component") && this._getIsAppStateReady()) {
					//code for storing appstate for OP and SUB OP to be placed here
					this._fnCreateAppStateForOP(oController, oEvent);
					Log.info("APPSTATE: AppState for OP created");
				}
			},

			/**
			 * Applies an appstate by fetching appdata and passing it to _applyAppstateToPage.
			 * @function
			 * @static
			 * @memberof sap.fe.core.AppStateHandler
			 * @param {object} oController Instance of the controller passed
			 * @private
			 * @sap-restricted
			 **/
			applyAppState: function(oController) {
				var that = this;
				var oAppComponent = CommonUtils.getAppComponent(oController.getView());
				that._setIsAppStateReady(false, oController);
				var oNavigationService = oAppComponent.getNavigationService();
				that.getAppData = oNavigationService
					.parseNavigation()
					.done(function(oAppData, oStartupParameters, sNavType) {
						Log.info("APPSTATE: Parse Navigation is done");
						that.sNavType = sNavType;
						if (sNavType) {
							that._applyAppStateToPage(oController, oAppData, oStartupParameters, sNavType);
						} else {
							//if navtype is not iAppState then set the app state ready to true
							that._setIsAppStateReady(true, oController);
							Log.info("APPSTATE: Set Appstate ready is done after navtype is null");
						}
					})
					.fail(function() {
						Log.info("APPSTATE: Parse Navigation is failed");
						that._setIsAppStateReady(true, oController);
						Log.info("APPSTATE: Set Appstate ready is done after parsenavigation fails");
						//Log.warning("app state could not be parsed - continuing with empty state");
					});
			},

			/**
			 * Applies appstate to the page.
			 * @function
			 * @static
			 * @memberof sap.fe.core.AppStateHandler
			 * @param {object} oController Instance of the controller passed
			 * @param {object} oAppData Object containing the appdata fetched from parse navigation promise
			 * @param {object} oStartupParameters Object containing the startupparameters of the component fetched from parse navigation promise
			 * @param {sap.fe.navigation.NavType} sNavType Type of the navigation
			 * @private
			 * @sap-restricted
			 **/
			_applyAppStateToPage: function(oController, oAppData, oStartupParameters, sNavType) {
				var that = this,
					oConditions,
					oFilterBar,
					oAppComponent = CommonUtils.getAppComponent(oController.getView()),
					oMetaModel = oAppComponent.getMetaModel(),
					oViewData = oController.getView().getViewData(),
					sEntitySet = oViewData.entitySet,
					oComponent = oController.getOwnerComponent();

				if (sNavType !== NavType.iAppState && this._isListBasedComponent(oComponent)) {
					oConditions = {};
					oFilterBar = oController.getView().byId(
						oController
							.getView()
							.getContent()[0]
							.data("filterBarId")
					);
					if (oAppData.oSelectionVariant) {
						Log.info("APPSTATE: selection variant is present");
						var aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sEntitySet);
						CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oAppData);
						CommonUtils.addSelectionVariantToConditions(oAppData.oSelectionVariant, oConditions, oMetaModel, sEntitySet);
						var oVariant, oVariantKey;
						switch (oController.getView().getViewData().variantManagement) {
							case VariantManagement.Page:
								Log.info("APPSTATE: Entered Page level VM for applyappstatetopage");
								oVariant = oController.getView().byId("fe::PageVariantManagement");
								if (oAppData.bNavSelVarHasDefaultsOnly) {
									oVariantKey = oVariant.getDefaultVariantKey();
								} else {
									oVariantKey = oVariant.getStandardVariantKey();
								}
								if (oVariantKey === null) {
									oVariantKey = oVariant.getId();
								}
								ControlVariantApplyAPI.activateVariant({
									element: oAppComponent,
									variantReference: oVariantKey
								})
									.then(function() {
										Log.info("APPSTATE: Activate variant done");
										if (
											!(
												oAppData.bNavSelVarHasDefaultsOnly &&
												oVariant.getDefaultVariantKey() !== oVariant.getStandardVariantKey()
											)
										) {
											that._fnClearFilterAndReplaceWithAppState(oConditions, oController, oFilterBar, oVariant);
											Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
										} else {
											that._setIsAppStateReady(true, oController);
											Log.info("APPSTATE: _setIsAppStateReady done");
										}
									})
									.catch(function(oError) {
										Log.error("APPSTATE: Activate variant error", oError);
									});
								break;
							case VariantManagement.Control:
								Log.info("APPSTATE: Entered Control level VM for applyappstatetopage");
								oVariant = oController.getView().byId(
									oController
										.getView()
										.getContent()[0]
										.data("filterBarVariantId")
								);
								if (oAppData.bNavSelVarHasDefaultsOnly) {
									oVariantKey = oVariant.getDefaultVariantKey();
								} else {
									oVariantKey = oVariant.getStandardVariantKey();
								}
								if (oVariantKey === null) {
									oVariantKey = oVariant.getId();
								}
								ControlVariantApplyAPI.activateVariant({
									element: oAppComponent,
									variantReference: oVariantKey
								})
									.then(function() {
										Log.info("APPSTATE: Activate variant done");
										if (
											!(
												oAppData.bNavSelVarHasDefaultsOnly &&
												oVariant.getDefaultVariantKey() !== oVariant.getStandardVariantKey()
											)
										) {
											that._fnClearFilterAndReplaceWithAppState(oConditions, oController, oFilterBar, oVariant);
											Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
										} else {
											that._setIsAppStateReady(true, oController);
											Log.info("APPSTATE: _setIsAppStateReady done");
										}
									})
									.catch(function() {
										Log.info("APPSTATE: Activate variant failed");
										that._setIsAppStateReady(true, oController);
										Log.info("APPSTATE: _setIsAppStateReady done");
										//Log.warning("Activate Variant failed");
									});
								break;
							case VariantManagement.None:
								Log.info("APPSTATE: Entered None VM for applyappstatetopage");
								that._fnClearFilterAndReplaceWithAppState(oConditions, oController, oFilterBar);
								Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
								break;
							default:
								that._fnClearFilterAndReplaceWithAppState(oConditions, oController, oFilterBar);
								Log.error(
									"Variant Management not correctly defined, variable wrongly set to: " +
										oController.getView().getViewData().variantManagement
								);
								break;
						}
					} else {
						that._setIsAppStateReady(true, oController);
						Log.info("APPSTATE: _setIsAppStateReady for no selection variant is done");
					}
				} else if (this._isListBasedComponent(oComponent)) {
					Log.info("APPSTATE: Applying appstate to LR");
					this._fnApplyAppStatetoLR(oController, oAppData);
				} else {
					Log.info("APPSTATE: Applying appstate to OP");
					this._fnApplyAppStatetoOP(oController, oAppData);
				}
			},

			/**
			 * Creates key to store app data
			 * @function
			 * @static
			 * @memberof sap.fe.core.AppStateHandler
			 * @param {Array} aEntitySet Array of EntitySets to be concatenated
			 * @param {sControl} sControl name of the control for which the appdata needs to be stored
			 * @returns {string} key for the app state data
			 * @private
			 * @sap-restricted
			 **/

			createKeyForAppStateData: function(sView, aEntitySet, sControl) {
				/* EG: sView = OP
					aEntitySet = ["SalesOrderManage","_Item"]
					sControl = Table
					Now the key should be "OP_SalesOrderManage/_Item/Table" which means we are storing appdata for the OP table _Item
			*/
				var sKey = "";
				sKey = sKey + sView + "_" + aEntitySet[0] + "/";
				if (aEntitySet.length > 1) {
					for (var i = 1; i < aEntitySet.length; i++) {
						sKey = sKey + aEntitySet[i] + "/";
					}
				}
				sKey = sKey + sControl;
				return sKey;
			},

			_setIsAppStateReady: function(bIsAppStateReady, oController, bGoPressed) {
				this.bIsAppStateReady = bIsAppStateReady;
				if (oController && this._isListBasedComponent(oController.getOwnerComponent()) && bIsAppStateReady) {
					Log.info("APPSTATE: LR component for _setIsAppstateReady");
					var sNavType = this._getNavType();
					if (sNavType !== null && sNavType !== NavType.iAppState) {
						this.createAppState(oController);
					}
					var oFilterBar = oController.getView().byId(
						oController
							.getView()
							.getContent()[0]
							.data("filterBarId")
					);
					var bHasNoVM = oController.getView().getViewData().variantManagement === VariantManagement.None;
					var bInitialLoad = bHasNoVM && oController.getView().getViewData().initialLoad;
					var bLiveMode = oController.getView().getViewData().liveMode;
					oFilterBar.setSuspendSelection(false);
					// if liveMode is active, search is handled by filterbar itself
					if (
						!bLiveMode &&
						(bGoPressed ||
							sNavType === NavType.xAppState ||
							sNavType === NavType.URLParams ||
							(sNavType === NavType.initial && bInitialLoad) ||
							(sNavType === null && bInitialLoad))
					) {
						if (sNavType === NavType.iAppState) {
							this.bIsInitialSearch = true;
						}
						this._triggerSearch(oFilterBar);
						Log.info("APPSTATE: Search is triggered");
					}
				}
			},
			_getIsAppStateReady: function() {
				return this.bIsAppStateReady;
			},
			_triggerSearch: function(oFilterBar) {
				oFilterBar.triggerSearch();
			},
			removeSensitiveDataForIAppState: function(oData, oMetaModel, sEntitySet) {
				var aPropertyAnnotations;
				var sKey = "LR_" + sEntitySet + "/FilterBar";
				var oFilterData = oData.appState[sKey].filter;
				var aKeys = Object.keys(oFilterData);
				aKeys.map(function(sProp) {
					if (sProp !== "$editState") {
						aPropertyAnnotations = oMetaModel && oMetaModel.getObject("/" + sEntitySet + "/" + sProp + "@");
						if (aPropertyAnnotations) {
							if (
								aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] ||
								aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] ||
								aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]
							) {
								delete oFilterData[sProp];
							}
						}
					}
				});
				oData.appState[sKey].filter = oFilterData;
				Log.info("APPSTATE: Returning non sensitive data");
				return oData;
			},
			_fnCreateAppStateForLR: function(oController, oEvent) {
				//if we are in LR and also if appstate is ready and also navtype is iAppState then only create an appstate
				var that = this;
				return new Promise(function(resolve) {
					var oAppComponent = CommonUtils.getAppComponent(oController.getView());
					var oViewData = oController.getView().getViewData();
					var oModel = oController.getView().getModel();
					var oMetaModel = oModel && oModel.getMetaModel();
					var sEntitySet = oViewData.entitySet;
					var bIsFclEnabled = oAppComponent.getRootViewController().isFclEnabled();
					var oRouterProxy = oAppComponent.getRouterProxy();
					var sHash = oRouterProxy.getHash();
					var sTemplate = "LR";
					var sFilterBarKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "FilterBar");
					var mInnerAppData = {};
					if (bIsFclEnabled) {
						that.mInnerAppDataForFCL = that.mInnerAppDataForFCL || {};
						mInnerAppData = merge({}, that.mInnerAppDataForFCL);
					}

					if (oController._isMultiMode()) {
						var sTabBarKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "TabBar");
						var oTabBar = oController._getMultiModeControl();
						mInnerAppData[sTabBarKey] = {
							selectedKey: oTabBar.getSelectedKey()
						};
					}
					var sVariantKey, sTableKey, oVariant, oVariantFilterBar, oVariantReportTable;
					var oFilterBar = oController.getView().byId(
						oController
							.getView()
							.getContent()[0]
							.data("filterBarId")
					);

					StateUtil.retrieveExternalState(oFilterBar)
						.then(function(mExtConditions) {
							Log.info("APPSTATE: Retrieve external state done");
							var oNavigationService = oAppComponent.getNavigationService();
							Log.info("APPSTATE: Get navigation service done");
							mInnerAppData[sFilterBarKey] = mExtConditions;
							switch (oController.getView().getViewData().variantManagement) {
								case VariantManagement.Page:
									Log.info("APPSTATE: Page level VM for createappstate for LR");
									oVariant = oController.getView().byId("fe::PageVariantManagement");
									sVariantKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "Variant");
									var sVariantId = oVariant.getModified()
										? oVariant.getStandardVariantKey()
										: oVariant.getCurrentVariantKey();
									//Sometimes getCurrentVariantKey and getStandardKey return null while creating i-appstate initially while loading app. So setting the variant id to standard in that case
									sVariantId = that.fnCheckForNullVariantId(oVariant, sVariantId);
									mInnerAppData[sVariantKey] = {
										"variantId": sVariantId
									};
									break;
								case VariantManagement.Control:
									Log.info("APPSTATE: Control level VM for createappstate for LR");
									sTableKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "@UI.LineItem");
									oVariantFilterBar = oController.getView().byId(
										oController
											.getView()
											.getContent()[0]
											.data("filterBarVariantId")
									);
									oVariantReportTable = oController._getCurrentTable().getVariant();
									var sTableVariantId = oVariantReportTable.getCurrentVariantKey();
									//Sometimes getCurrentVariantKey and getStandardKey return null while creating i-appstate initially while loading app. So setting the variant id to standard in that case
									sTableVariantId = that.fnCheckForNullVariantId(oVariantReportTable, sTableVariantId);
									var sFilterBarVariantId = oVariantFilterBar.getModified()
										? oVariantFilterBar.getStandardVariantKey()
										: oVariantFilterBar.getCurrentVariantKey();
									sFilterBarVariantId = that.fnCheckForNullVariantId(oVariantFilterBar, sFilterBarVariantId);
									mInnerAppData[sFilterBarKey].variantId = sFilterBarVariantId;
									mInnerAppData[sTableKey] = {
										"variantId": sTableVariantId
									};
									break;
								case VariantManagement.None:
									Log.info("APPSTATE: None level VM for createappstate for LR");
									break;
								default:
									Log.error(
										"Variant Management not correctly defined, variable wrongly set to: " +
											oController.getView().getViewData().variantManagement
									);
									break;
							}
							if (oViewData.liveMode === false) {
								if (
									oEvent &&
									(oEvent.getId() === "search" ||
										oEvent
											.getSource()
											.getMetadata()
											.getName() === "sap.m.IconTabBar")
								) {
									mInnerAppData[sFilterBarKey].GoPressed = true;
								} else if (
									oEvent &&
									oEvent
										.getSource()
										.getId()
										.indexOf("::LineItem::VM") > -1
								) {
									if (bIsFclEnabled) {
										mInnerAppData[sFilterBarKey].GoPressed = that.mInnerAppDataForFCL[sFilterBarKey].GoPressed;
									} else {
										mInnerAppData[sFilterBarKey].GoPressed = that.mInnerAppDataForLR[sFilterBarKey].GoPressed;
									}
								} else if (oEvent) {
									mInnerAppData[sFilterBarKey].GoPressed = false;
								} else {
									mInnerAppData[sFilterBarKey].GoPressed =
										oViewData.variantManagement === VariantManagement.None && oViewData.initialLoad;
								}
							}
							var oStoreData = {
								appState: mInnerAppData
							};
							oStoreData = that.removeSensitiveDataForIAppState(oStoreData, oMetaModel, sEntitySet, bIsFclEnabled);
							var oAppState = oNavigationService.storeInnerAppStateWithImmediateReturn(oStoreData, true, sEntitySet, true);
							Log.info("APPSTATE: Appstate stored for LR");
							var sAppStateKey = oAppState.appStateKey;
							var sNewHash = oNavigationService.replaceInnerAppStateKey(sHash, sAppStateKey);
							oRouterProxy.navToHash(sNewHash);
							Log.info("APPSTATE: navToHash for LR");
							if (bIsFclEnabled) {
								that.mInnerAppDataForFCL = merge({}, mInnerAppData);
							} else {
								that.mInnerAppDataForLR = merge({}, mInnerAppData);
							}
							resolve({ appState: mInnerAppData });
						})
						.catch(function(oError) {
							Log.info("APPSTATE: Retrieve External State failed", oError);
							Log.warning("Retrieve External State failed");
							if (that._getIsAppStateReady() === false) {
								that._setIsAppStateReady(true, oController);
								Log.info("APPSTATE: _setIsAppStateReady for Retrieve External State failed is done");
							}
						});
				});
			},
			_fnCreateAppStateForOP: function(oController, oEvent) {
				var that = this;
				return new Promise(function(resolve, reject) {
					var oAppComponent = CommonUtils.getAppComponent(oController.getView());
					var oViewData = oController.getView().getViewData();
					var sEntitySet = oViewData.entitySet;
					var bIsFclEnabled = oAppComponent.getRootViewController().isFclEnabled();
					var oRouterProxy = oAppComponent.getRouterProxy();
					var sHash = oRouterProxy.getHash();
					var sSelectedSection;
					var sNavigationProperty;
					var sTemplate = "OP";
					var sSectionKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "Section");
					var oLocalEvent = merge({}, oEvent);
					var oNavigationService = oAppComponent.getNavigationService();
					var mInnerAppOPData = {};
					if (bIsFclEnabled) {
						mInnerAppOPData = merge({}, that.mInnerAppDataForFCL);
					} else {
						mInnerAppOPData = merge({}, that.mInnerAppDataForOP);
					}
					//var oObjectPageLayout = oController.getView().byId("fe::op");
					if (oLocalEvent && oLocalEvent.getSource().isA("sap.uxap.ObjectPageLayout")) {
						sSelectedSection = oLocalEvent.getParameter("section").getId();
						mInnerAppOPData[sSectionKey] = {
							"selectedSection": sSelectedSection
						};
						Log.info("APPSTATE: section store for createappstate for OP done");
					}
					if (oLocalEvent && oLocalEvent.getSource().isA("sap.ui.fl.variants.VariantManagement")) {
						var sTableId = oLocalEvent
							.getSource()
							.getId()
							.split("::VM")[0];
						sNavigationProperty = oController
							.getView()
							.byId(sTableId)
							.getRowsBindingInfo().path;
						var sQualifier = "";
						if (sTableId.indexOf("LineItem::") > -1) {
							sQualifier = sTableId.split("::")[sTableId.split("::").length - 1];
						}
						var sTableKey;
						if (sQualifier) {
							sTableKey = that.createKeyForAppStateData(
								sTemplate,
								[sEntitySet, sNavigationProperty],
								"@UI.LineItem#" + sQualifier
							);
						} else {
							sTableKey = that.createKeyForAppStateData(sTemplate, [sEntitySet, sNavigationProperty], "@UI.LineItem");
						}
						var sTableVariantId = oLocalEvent.getSource().getCurrentVariantKey();
						//Sometimes getCurrentVariantKey and getStandardKey return null while creating i-appstate initially loading app. So setting the variant id to standard in that case
						sTableVariantId = that.fnCheckForNullVariantId(oLocalEvent.getSource(), sTableVariantId);
						mInnerAppOPData[sTableKey] = {
							"variantId": sTableVariantId
						};
						Log.info("APPSTATE: variant store for createappstate for OP done");
					}
					var oStoreData = {
						appState: mInnerAppOPData
					};
					var oAppState = oNavigationService.storeInnerAppStateWithImmediateReturn(oStoreData, true, sEntitySet, true);
					Log.info("APPSTATE: appstate store for createappstate for OP done");
					var sAppStateKey = oAppState.appStateKey;
					var sNewHash = oNavigationService.replaceInnerAppStateKey(sHash, sAppStateKey);
					if (sNewHash !== sHash) {
						oRouterProxy.navToHash(sNewHash);
						Log.info("APPSTATE: hash change for createappstate for OP done");
						that.bNoRouteChange = true;
					}
					if (bIsFclEnabled) {
						that.mInnerAppDataForFCL = merge({}, mInnerAppOPData);
					} else {
						that.mInnerAppDataForOP = merge({}, mInnerAppOPData);
					}
					resolve(oStoreData);
				});
			},
			_fnApplyAppStatetoLR: function(oController, oAppData) {
				var that = this,
					sTemplate,
					oFilterBar,
					oAppComponent = CommonUtils.getAppComponent(oController.getView()),
					oViewData = oController.getView().getViewData(),
					sEntitySet = oViewData.entitySet,
					bIsFclEnabled = oAppComponent.getRootViewController().isFclEnabled();
				if (bIsFclEnabled) {
					Log.info("APPSTATE: _fnApplyAppStatetoLR for FCL app ");
					if (oAppData && oAppData.appState) {
						that.mInnerAppDataForFCL = merge({}, oAppData.appState, that.mInnerAppDataForFCL);
					}
				} else if (oAppData && oAppData.appState) {
					Log.info("APPSTATE: _fnApplyAppStatetoLR for non-FCL app ");
					that.mInnerAppDataForLR = merge({}, oAppData.appState, that.mInnerAppDataForLR);
				}
				sTemplate = "LR";
				var sFilterBarKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "FilterBar");
				var sVariantKey, sTableKey;
				oFilterBar = oController.getView().byId(
					oController
						.getView()
						.getContent()[0]
						.data("filterBarId")
				);
				var oVariant;

				if (oAppData && oAppData.appState) {
					if (oController._isMultiMode()) {
						var sTabBarKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "TabBar");
						var oTabBar = oController._getMultiModeControl();
						if (oTabBar && oAppData.appState[sTabBarKey]) {
							oTabBar.setSelectedKey(oAppData.appState[sTabBarKey].selectedKey);
							oController._updateTableControl();
							oController._updateMultiTableHiddenStatus();
						}
					}
					Log.info("APPSTATE: appstate present");
					//First apply the variant from the appdata
					switch (oController.getView().getViewData().variantManagement) {
						case VariantManagement.Page:
							Log.info("APPSTATE: Page level VM for _fnApplyAppStatetoLR");
							oVariant = oController.getView().byId("fe::PageVariantManagement");
							sVariantKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "Variant");
							if (oAppData.appState[sVariantKey] && oAppData.appState[sVariantKey].variantId) {
								Log.info("APPSTATE: variant id is present");
								ControlVariantApplyAPI.activateVariant({
									element: oAppComponent,
									variantReference: oAppData.appState[sVariantKey].variantId
								})
									.then(function() {
										Log.info("APPSTATE: Variant applied");
										that._fnClearFilterAndReplaceWithAppState(
											oAppData.appState[sFilterBarKey].filter,
											oController,
											oFilterBar,
											oVariant,
											oAppData.appState[sFilterBarKey].GoPressed
										);
										Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
									})
									.catch(function() {
										Log.info("APPSTATE: Variant not applied");
										that._fnClearFilterAndReplaceWithAppState(
											oAppData.appState[sFilterBarKey].filter,
											oController,
											oFilterBar,
											oVariant,
											oAppData.appState[sFilterBarKey].GoPressed
										);
										Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
										//Log.warning("Activate Variant failed");
									});
							} else {
								Log.info("APPSTATE: variant id is not present");
								if (oAppData.appState[sFilterBarKey] && oAppData.appState[sFilterBarKey].filter) {
									Log.info("APPSTATE: filter is present");
									that._fnClearFilterAndReplaceWithAppState(
										oAppData.appState[sFilterBarKey].filter,
										oController,
										oFilterBar,
										oVariant,
										oAppData.appState[sFilterBarKey].GoPressed
									);
									Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
								}
							}
							break;
						case VariantManagement.Control:
							Log.info("APPSTATE: Control level VM for _fnApplyAppStatetoLR");
							oVariant = oController.getView().byId(
								oController
									.getView()
									.getContent()[0]
									.data("filterBarVariantId")
							);
							sTableKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "@UI.LineItem");
							if (
								oAppData.appState[sFilterBarKey] &&
								oAppData.appState[sFilterBarKey].variantId &&
								oAppData.appState[sTableKey] &&
								oAppData.appState[sTableKey].variantId
							) {
								Log.info("APPSTATE: variant id is present");
								Promise.all([
									ControlVariantApplyAPI.activateVariant({
										element: oAppComponent,
										variantReference: oAppData.appState[sFilterBarKey].variantId
									}),
									ControlVariantApplyAPI.activateVariant({
										element: oAppComponent,
										variantReference: oAppData.appState[sTableKey].variantId
									})
								])
									.then(function() {
										Log.info("APPSTATE: Variant applied");
										that._fnClearFilterAndReplaceWithAppState(
											oAppData.appState[sFilterBarKey].filter,
											oController,
											oFilterBar,
											oVariant,
											oAppData.appState[sFilterBarKey].GoPressed
										);
										Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
									})
									.catch(function() {
										Log.info("APPSTATE: Variant not applied");
										that._fnClearFilterAndReplaceWithAppState(
											oAppData.appState[sFilterBarKey].filter,
											oController,
											oFilterBar,
											oVariant,
											oAppData.appState[sFilterBarKey].GoPressed
										);
										Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
										//Log.warning("Activate Variant failed");
									});
							} else {
								Log.info("APPSTATE: variant id is not present");
								if (oAppData.appState[sFilterBarKey] && oAppData.appState[sFilterBarKey].filter) {
									Log.info("APPSTATE: filter is present");
									that._fnClearFilterAndReplaceWithAppState(
										oAppData.appState[sFilterBarKey].filter,
										oController,
										oFilterBar,
										oVariant,
										oAppData.appState[sFilterBarKey].GoPressed
									);
									Log.info("APPSTATE: _fnClearFilterAndReplaceWithAppState done");
								}
							}
							break;
						case VariantManagement.None:
							Log.info("APPSTATE: None VM for _fnApplyAppStatetoLR");
							if (oAppData.appState[sFilterBarKey] && oAppData.appState[sFilterBarKey].filter) {
								Log.info("APPSTATE: filter is present");
								StateUtil.applyExternalState(oFilterBar, {
									filter: oAppData.appState[sFilterBarKey].filter
								})
									.then(function() {
										Log.info("APPSTATE: applyExternalState done");
										that._setIsAppStateReady(true, oController, oAppData.appState[sFilterBarKey].GoPressed);
										Log.info("APPSTATE: _setIsAppStateReady done");
									})
									.catch(function() {
										Log.info("APPSTATE: applyExternalState fail");
										//Log.warning("Apply External State Failed");
										that._setIsAppStateReady(true, oController, oAppData.appState[sFilterBarKey].GoPressed);
										Log.info("APPSTATE: _setIsAppStateReady done");
									});
							}
							break;
						default:
							that._fnClearFilterAndReplaceWithAppState(oAppData.appState[sFilterBarKey].filter, oController, oFilterBar);
							Log.error(
								"Variant Management not correctly defined, variable wrongly set to: " +
									oController.getView().getViewData().variantManagement
							);
							break;
					}
				}
			},
			_fnApplyAppStatetoOP: function(oController, oAppData) {
				var that = this,
					sTemplate,
					oAppComponent = CommonUtils.getAppComponent(oController.getView()),
					oViewData = oController.getView().getViewData(),
					sEntitySet = oViewData.entitySet,
					bIsFclEnabled = oAppComponent.getRootViewController().isFclEnabled();
				sTemplate = "OP";
				if (bIsFclEnabled) {
					if (oAppData && oAppData.appState) {
						that.mInnerAppDataForFCL = merge({}, oAppData.appState, that.mInnerAppDataForFCL);
					}
				} else if (oAppData && oAppData.appState) {
					that.mInnerAppDataForOP = merge({}, oAppData.appState, that.mInnerAppDataForOP);
				}
				var aTables = oController._findTables();
				var sSectionKey = that.createKeyForAppStateData(sTemplate, [sEntitySet], "Section");
				var oObjectPageLayout = oController.getView().byId("fe::ObjectPage");
				var aAppStateDataKeys = (oAppData && oAppData.appState && Object.keys(oAppData.appState)) || [];
				var aActivateVariantPromises = [];
				var sQualifier, oVariantTable, sNavigationProperty;
				var fnRetrieveTableVariant = function() {
					for (var j = 0; j < aTables.length; j++) {
						if (aTables[j].getRowsBindingInfo().path === sNavigationProperty) {
							var sId = aTables[j].getId();
							if (sQualifier) {
								if (sId.indexOf("LineItem::") > -1 && sId.split("::")[sId.split("::").length - 1] === sQualifier) {
									oVariantTable = aTables[j];
									break;
								}
							} else if (aTables[j].getId().indexOf("LineItem::") === -1) {
								oVariantTable = aTables[j];
								break;
							}
						}
					}
				};
				var fnApplySectionAndSetAppStateReady = function() {
					if (oAppData && oAppData.appState && oAppData.appState[sSectionKey]) {
						Log.info("APPSTATE: section is present");
						oObjectPageLayout.setSelectedSection(oAppData.appState[sSectionKey].selectedSection);
						that._setIsAppStateReady(true);
						Log.info("APPSTATE: _setIsAppStateReady done");
					} else {
						Log.info("APPSTATE: section is not present");
						that._setIsAppStateReady(true);
						Log.info("APPSTATE: _setIsAppStateReady done");
					}
				};
				for (var i = 0; i < aAppStateDataKeys.length; i++) {
					if (aAppStateDataKeys[i].indexOf("OP_" + sEntitySet) > -1 && aAppStateDataKeys[i].indexOf("@UI.LineItem") > -1) {
						var sTableKey = aAppStateDataKeys[i];
						sNavigationProperty = aAppStateDataKeys[i].split("/")[aAppStateDataKeys[i].split("/").length - 2];
						if (sTableKey.indexOf("#") > -1) {
							sQualifier = sTableKey.split("#")[1];
							fnRetrieveTableVariant();
						} else {
							fnRetrieveTableVariant();
						}
						if (oVariantTable) {
							aActivateVariantPromises.push(
								ControlVariantApplyAPI.activateVariant({
									element: oVariantTable,
									variantReference: oAppData.appState[sTableKey].variantId
								})
							);
						}
					}
				}
				if (aActivateVariantPromises.length) {
					Log.info("APPSTATE: variant is present");
					Promise.all(aActivateVariantPromises)
						.then(function() {
							Log.info("APPSTATE: variant is applied");
							fnApplySectionAndSetAppStateReady();
							Log.info("APPSTATE: fnApplySectionAndSetAppStateReady done");
						})
						.catch(function() {
							Log.info("APPSTATE: variant is not applied");
							fnApplySectionAndSetAppStateReady();
							Log.info("APPSTATE: fnApplySectionAndSetAppStateReady done");
							//Log.warning("Activate Variant failed");
						});
				} else {
					Log.info("APPSTATE: variant is not present");
					fnApplySectionAndSetAppStateReady();
					Log.info("APPSTATE: fnApplySectionAndSetAppStateReady done");
				}
			},
			_fnClearFilterAndReplaceWithAppState: function(oConditions, oController, oFilterBar, oVariant, GoPressed) {
				var oAppComponent = CommonUtils.getAppComponent(oController.getView()),
					oMetaModel = oAppComponent.getMetaModel(),
					oViewData = oController.getView().getViewData(),
					sEntitySet = oViewData.entitySet;
				var oEntityType = oMetaModel.getObject("/" + sEntitySet + "/");
				var that = this;
				var oClearConditions = {};
				var oObj;
				for (var sKey in oEntityType) {
					oObj = oEntityType[sKey];
					if (oObj) {
						if (oObj.$kind === "Property") {
							//Remove non filterable properties
							if (
								that.sNavType === NavType.iAppState &&
								!CommonUtils.isPropertyFilterable(oMetaModel, "/" + sEntitySet, sKey, false)
							) {
								continue;
							}
							oClearConditions[sKey] = [];
						}
					}
				}

				//After applying the variant , clear all the filterable properties
				//TODO: Currently we are fetching all the filterable properties from the entitytype and explicitly clearing the state by setting its value to []
				//This is just a workaround till StateUtil provides an api to clear the state.
				StateUtil.applyExternalState(oFilterBar, {
					filter: oClearConditions
				})
					.then(function() {
						Log.info("APPSTATE: applyExternalState done for clear conditions");
						//Now apply the filters fetched from the appstate
						var oState = {
							filter: oConditions
						};

						oState.items = Object.keys(oConditions).reduce(function(aCumulativeItems, sPropertyName) {
							if (
								!oMetaModel.getObject("/" + sEntitySet + "/" + sPropertyName + "@com.sap.vocabularies.UI.v1.HiddenFilter")
							) {
								aCumulativeItems.push({
									name: sPropertyName
								});
							}
							return aCumulativeItems;
						}, []);

						StateUtil.applyExternalState(oFilterBar, oState)
							.then(function() {
								Log.info("APPSTATE: applyExternalState done for actual conditions");
								if (oVariant && oVariant.getStandardVariantKey() !== oVariant.getCurrentVariantKey()) {
									Log.info("APPSTATE: variant is not standard");
									oVariant.setModified(false);
									Log.info("APPSTATE: variant is modified as false");
								}
								that._setIsAppStateReady(true, oController, GoPressed); //once the filters are applied and appstate is applied then set appstate ready to true
								Log.info("APPSTATE: _setIsAppStateReady done");
							})
							.catch(function() {
								//Log.warning("Apply External State failed");
								Log.info("APPSTATE: applyExternalState failed for actual conditions");
								that._setIsAppStateReady(true, oController, GoPressed);
								Log.info("APPSTATE: _setIsAppStateReady done");
							});
					})
					.catch(function(oError) {
						Log.info("APPSTATE: applyExternalState failed for clear conditions", oError);
					});
			},
			_getNavType: function() {
				return this.sNavType;
			},

			/**
			 * To check is route is changed by change in the iAPPState.
			 *
			 * @returns {boolean}
			 **/
			checkIfRouteChangedByIApp: function() {
				return this.bNoRouteChange;
			},
			/**
			 * Reset the route changed by iAPPState.
			 **/
			resetRouteChangedByIApp: function() {
				if (this.bNoRouteChange) {
					this.bNoRouteChange = false;
				}
			},
			fnCheckForNullVariantId: function(oVariant, sVariantId) {
				if (sVariantId === null) {
					sVariantId = oVariant.getId();
				}
				return sVariantId;
			},
			_isListBasedComponent: function(oComponent) {
				return (
					oComponent.isA("sap.fe.templates.ListReport.Component") ||
					oComponent.isA("sap.fe.templates.AnalyticalListPage.Component")
				);
			}
		});
	},
	/* bExport= */
	true
);
