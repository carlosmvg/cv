sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/Component",
		"sap/ui/core/routing/HashChanger",
		"sap/fe/core/CommonUtils",
		"sap/fe/macros/SizeHelper",
		"sap/base/Log"
	],
	function(JSONModel, Controller, Component, HashChanger, CommonUtils, SizeHelper, Log) {
		"use strict";

		return Controller.extend("sap.fe.templates.RootContainer.controller.BaseController", {
			onInit: function() {
				var oAppComponent = Component.getOwnerComponentFor(this.getView());
				this.oRouter = oAppComponent.getRouter();
				SizeHelper.init();
			},
			attachShellTitleHandler: function() {
				var oAppComponent = Component.getOwnerComponentFor(this.getView());
				var oRouter = oAppComponent.getRouter();
				oRouter.attachRouteMatched(this.shellTitleHandler, this);
			},
			onExit: function() {
				this.oRouter.detachRouteMatched(this.shellTitleHandler, this);
				SizeHelper.exit();
			},
			/**
			 * Function waiting for the Right most view to be ready.
			 *
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 * @param {*} oEvent reference an Event parameter coming from routeMatched event
			 * @returns {Promise}
			 */
			waitForRightMostViewReady: function(oEvent) {
				return new Promise(function(resolve) {
					var aContainers = oEvent.getParameter("views"),
						// There can also be reuse components in the view, remove them before processing.
						aFEContainers = aContainers.filter(function(oContainer) {
							var oComponentInstance = oContainer.getComponentInstance(),
								oRootControl = oComponentInstance.getRootControl(),
								oComponent = Component.getOwnerComponentFor(oRootControl);
							return oComponent.isA("sap.fe.core.TemplateComponent");
						}),
						oRightMostFEComponentInstance = aFEContainers[aFEContainers.length - 1].getComponentInstance(),
						oView = oRightMostFEComponentInstance.getRootControl();
					if (oRightMostFEComponentInstance.isPageReady()) {
						resolve(oView);
					} else {
						oRightMostFEComponentInstance.attachEventOnce("pageReady", function() {
							resolve(oView);
						});
					}
				});
			},

			/**
			 * This function is updating the shell title after each navigation.
			 *
			 * @param oEvent
			 * @name sap.fe.templates.RootContainer.controller.BaseController#shellTitleHandler
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 */
			shellTitleHandler: function(oEvent) {
				var that = this;
				if (!that.oShellTitlePromise) {
					that.oShellTitlePromise = that
						.waitForRightMostViewReady(oEvent)
						.then(function(oView) {
							var oAppComponent = CommonUtils.getAppComponent(oView);
							var oData = { oView: oView, oAppComponent: oAppComponent };

							that.computeTitleHierarchy(oData);

							var oLastFocusedControl = oAppComponent.getRouterProxy().getFocusControlForCurrentHash();

							if (oView.getController() && oView.getController().onPageReady) {
								oView.getParent().onPageReady({ lastFocusedControl: oLastFocusedControl });
							}
							that.oShellTitlePromise = null;
						})
						.catch(function() {
							Log.error("An error occurs while computing the title hierarchy and calling focus method");
							that.oShellTitlePromise = null;
						});
				}
			},

			/**
			 * This function returns the TitleHierarchy cache ( or initializes it if undefined).
			 *
			 * @name sap.fe.templates.RootContainer.controller.BaseController#getTitleHierarchyCache
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 *
			 * @returns {object}  returns the TitleHierarchy cache
			 */
			getTitleHierarchyCache: function() {
				if (!this.oTitleHierarchyCache) {
					this.oTitleHierarchyCache = {};
				}
				return this.oTitleHierarchyCache;
			},

			/**
			 * This function returns a titleInfo object.
			 *
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 * @param {*} title
			 * @param {*} subtitle
			 * @param {*} sIntent intent path to be redirected to
			 * @returns {object}  oTitleinformation
			 */
			_computeTitleInfo: function(title, subtitle, sIntent) {
				var aParts = sIntent.split("/");
				if (aParts[aParts.length - 1].indexOf("?") === -1) {
					sIntent += "?restoreHistory=true";
				} else {
					sIntent += "&restoreHistory=true";
				}
				return {
					title: title,
					subtitle: subtitle,
					intent: sIntent,
					icon: ""
				};
			},

			/**
			 * This function is updating the cache to store Title Information
			 *
			 * @name sap.fe.templates.RootContainer.controller.BaseController#addNewEntryINCacheTitle
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 * @param {*} sPath path of the context to retrieve title information from MetaModel
			 * @param {*} oAppComponent reference to the oAppComponent
			 *
			 * @returns {promise}  oTitleinformation returned as promise
			 */

			addNewEntryInCacheTitle: function(sPath, oAppComponent) {
				var oTitleModel = this.getView().getModel("title");
				if (!oTitleModel) {
					var sServiceUrl = oAppComponent.getMetadata().getManifestEntry("/sap.app/dataSources/mainService/uri");
					oTitleModel = new sap.ui.model.odata.v4.ODataModel({
						serviceUrl: sServiceUrl,
						synchronizationMode: "None"
					});
				}
				var that = this;
				var sEntityPath = sPath.replace(/ *\([^)]*\) */g, "");
				var oTitle = oAppComponent.getMetaModel().getProperty(sEntityPath + "/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value");
				var sTypeName = oAppComponent.getMetaModel().getProperty(sEntityPath + "/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName");
				var oBindingViewContext = oTitleModel.createBindingContext(sPath);
				var oPropertyBinding = oTitleModel.bindProperty(oTitle["$Path"], oBindingViewContext);
				oAppComponent.getRootControl().setModel(oTitleModel, "title");
				oPropertyBinding.initialize();
				return new Promise(function(resolve, reject) {
					var sAppSpecificHash = HashChanger.getInstance().hrefForAppSpecificHash("");
					var sIntent = sAppSpecificHash + sPath.slice(1);
					var fnChange = function(oEvent) {
						var oTitleHierarchyCache = that.getTitleHierarchyCache();
						oTitleHierarchyCache[sPath] = that._computeTitleInfo(sTypeName, oEvent.getSource().getValue(), sIntent);
						resolve(oTitleHierarchyCache[sPath]);
						oPropertyBinding.detachChange(fnChange);
					};
					oPropertyBinding.attachChange(fnChange);
				});
			},
			/**
			 * Ensure that the ushell service receives all elements
			 * (title, subtitle, intent, icon) as strings.
			 *
			 * Annotation HeaderInfo allows for binding of title and description
			 * (which are used here as title and subtitle) to any element in the entity
			 * (being possibly types like boolean, timestamp, double, etc.)
			 *
			 * Creates a new hierarchy and converts non-string types to string.
			 *
			 * @param {*} aHierarchy Shell title hierarchy
			 * @returns {*} Copy of shell title hierarchy containing all elements as strings
			 */
			ensureHierarchyElementsAreStrings: function(aHierarchy) {
				var aHierarchyShell = [];
				for (var level in aHierarchy) {
					var oHierarchy = aHierarchy[level];
					var oShellHierarchy = {};
					for (var key in oHierarchy) {
						oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
					}
					aHierarchyShell.push(oShellHierarchy);
				}
				return aHierarchyShell;
			},

			/**
			 * This function is updating the shell title after each navigation.
			 *
			 * @memberof sap.fe.templates.RootContainer.controller.BaseController
			 * @param {*} oData object containing reference to view and to oAppComponent
			 */
			computeTitleHierarchy: function(oData) {
				var that = this,
					oView = oData.oView,
					oAppComponent = oData.oAppComponent,
					oContext = oView.getBindingContext(),
					oCurrentPage = oView.getParent(),
					aTitleInformationPromises = [],
					sAppSpecificHash = HashChanger.getInstance().hrefForAppSpecificHash(""),
					sAppTitle = oAppComponent.getMetadata().getManifestEntry("sap.app").title || "",
					sAppSubTitle = oAppComponent.getMetadata().getManifestEntry("sap.app").appSubTitle || "",
					sAppRootPath = sAppSpecificHash,
					oPageTitleInformationPromise,
					sNewPath;

				if (this.bIsComputingTitleHierachy === true) {
					Log.warning("computeTitleHierarchy already running ... this call is canceled");
					return;
				}
				this.bIsComputingTitleHierachy = true;

				if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
					if (oContext) {
						sNewPath = oContext.getPath();
						var aPathParts = sNewPath.split("/"),
							sTargetType,
							sPath = "",
							iNbPathParts = aPathParts.length;
						aPathParts.splice(-1, 1);

						aPathParts.forEach(function(sPathPart, i) {
							if (i === 0) {
								var aRoutes = oAppComponent.getManifestEntry("/sap.ui5/routing/routes"),
									aTargets = oAppComponent.getManifestEntry("/sap.ui5/routing/targets");
								var fnTargetTypeEval = function(sTarget) {
									if (typeof aRoutes[this.index].target === "string") {
										return sTarget === aRoutes[this.index].target;
									} else if (typeof aRoutes[this.index].target === "object") {
										for (var k = 0; k < aRoutes[this.index].target.length; k++) {
											return sTarget === aRoutes[this.index].target[k];
										}
									}
								};
								for (var j = 0; j < aRoutes.length; j++) {
									var oRoute = oAppComponent.getRouter().getRoute(aRoutes[j].name);
									if (oRoute.match(aPathParts[i])) {
										var sTarget = Object.keys(aTargets).find(fnTargetTypeEval, { index: j });
										sTargetType = oAppComponent.getRouter().getTarget(sTarget)._oOptions.name;
										break;
									}
								}
								if (sTargetType === "sap.fe.templates.ListReport") {
									aTitleInformationPromises.push(
										Promise.resolve(that._computeTitleInfo(sAppTitle, sAppSubTitle, sAppRootPath))
									);
								}
							} else if (i < iNbPathParts) {
								sPath += "/" + sPathPart;
								if (!that.getTitleHierarchyCache()[sPath]) {
									aTitleInformationPromises.push(that.addNewEntryInCacheTitle(sPath, oAppComponent));
								} else {
									aTitleInformationPromises.push(Promise.resolve(that.getTitleHierarchyCache()[sPath]));
								}
							}
						});
					}
					oPageTitleInformationPromise = oCurrentPage._getPageTitleInformation().then(function(oPageTitleInformation) {
						var sPageHash = HashChanger.getInstance().getHash();
						var aParts = sPageHash.split("/");
						if (aParts[aParts.length - 1].indexOf("?") === -1) {
							sPageHash += "?restoreHistory=true";
						} else {
							sPageHash += "&restoreHistory=true";
						}

						oPageTitleInformation.intent = sAppSpecificHash + sPageHash;
						if (oContext) {
							that.getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
						} else {
							that.getTitleHierarchyCache()[sAppRootPath] = oPageTitleInformation;
						}
						return oPageTitleInformation;
					});
					aTitleInformationPromises.push(oPageTitleInformationPromise);
				} else {
					aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
				}
				Promise.all(aTitleInformationPromises)
					.then(function(aTitleInfoHierarchy) {
						// workaround for shell which is expecting all elements being of type string
						var aTitleInfoHierarchyShell = that.ensureHierarchyElementsAreStrings(aTitleInfoHierarchy);
						var sTitle = aTitleInfoHierarchyShell[aTitleInfoHierarchy.length - 1].title;
						oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell.reverse());
						oAppComponent.getShellServices().setTitle(sTitle);
					})
					.catch(function(sErrorMessage) {
						Log.error(sErrorMessage);
					})
					.finally(function() {
						that.bIsComputingTitleHierachy = false;
					})
					.catch(function(sErrorMessage) {
						Log.error(sErrorMessage);
					});
			}
		});
	}
);
