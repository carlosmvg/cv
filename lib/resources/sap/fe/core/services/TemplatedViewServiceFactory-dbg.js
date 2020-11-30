sap.ui.define(
	[
		"sap/ui/core/service/Service",
		"sap/ui/core/service/ServiceFactory",
		"sap/ui/core/service/ServiceFactoryRegistry",
		"sap/ui/model/base/ManagedObjectModel",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/core/mvc/View",
		"sap/ui/core/Component",
		"sap/ui/model/json/JSONModel",
		"sap/base/Log",
		"sap/fe/core/TemplateModel",
		"sap/fe/core/converters/TemplateConverter",
		"sap/fe/core/helpers/DynamicAnnotationPathHelper",
		"sap/ui/core/cache/CacheManager",
		"sap/base/strings/hash",
		"sap/ui/VersionInfo"
	],
	function(
		Service,
		ServiceFactory,
		ServiceFactoryRegistry,
		ManagedObjectModel,
		ResourceModel,
		View,
		Component,
		JSONModel,
		Log,
		TemplateModel,
		TemplateConverter,
		DynamicAnnotationPathHelper,
		CacheManager,
		hash,
		VersionInfo
	) {
		"use strict";

		function MetaPath(name, initialPath) {
			this.name = name;
			this.currentPath = initialPath || "";
			this.lastPath = "";
			this.set = function(sNewPath) {
				while (sNewPath.indexOf("../") === 0) {
					this.currentPath = this.currentPath.substr(0, this.currentPath.lastIndexOf(this.lastPath) - 1);
					this.lastPath = this.currentPath.substr(this.currentPath.lastIndexOf("/") + 1);
					sNewPath = sNewPath.substr(3);
				}
				if (sNewPath) {
					this.lastPath = sNewPath;
				}
				this.currentPath += sNewPath;
				Log.info(this.name + " is now : " + this.currentPath);
			};
			this.get = function() {
				return this.currentPath;
			};
			this.delete = function() {
				this.currentPath = "";
				Log.info(this.name + " has been deleted");
			};
		}

		var TemplatedViewService = Service.extend("sap.fe.core.services.TemplatedViewService", {
			initPromise: null,
			init: function() {
				var that = this;
				var aServiceDependencies = [];
				var oContext = this.getContext();
				var oComponent = oContext.scopeObject;
				var oAppComponent = Component.getOwnerComponentFor(oComponent);
				var oMetaModel = oAppComponent.getMetaModel();
				var sStableId = oAppComponent.getMetadata().getComponentName() + "::" + oAppComponent.getLocalId(oComponent.getId());
				var aEnhanceI18n = oComponent.getEnhanceI18n() || [];
				var sAppNamespace;

				if (aEnhanceI18n) {
					sAppNamespace = oAppComponent.getMetadata().getComponentName();
					for (var i = 0; i < aEnhanceI18n.length; i++) {
						aEnhanceI18n[i] = sAppNamespace + "." + aEnhanceI18n[i].replace(".properties", "");
					}
				}

				var sCacheIdentifier =
					oAppComponent.getMetadata().getName() +
					"_" +
					sStableId +
					"_" +
					sap.ui
						.getCore()
						.getConfiguration()
						.getLanguageTag();
				aServiceDependencies.push(
					ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService")
						.createInstance({
							scopeType: "component",
							scopeObject: oComponent,
							settings: {
								bundles: ["sap.fe.core.messagebundle", "sap.fe.templates.messagebundle"],
								enhanceI18n: aEnhanceI18n,
								modelName: "sap.fe.i18n"
							}
						})
						.then(function(oResourceModelService) {
							return oResourceModelService.getResourceModel();
						})
				);

				aServiceDependencies.push(
					ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService")
						.createInstance({
							settings: {
								metaModel: oMetaModel
							}
						})
						.then(function(oCacheHandlerService) {
							return oCacheHandlerService.validateCacheKey(sCacheIdentifier);
						})
				);
				aServiceDependencies.push(
					VersionInfo.load()
						.then(function(oInfo) {
							var sTimestamp = "";
							if (!oInfo.libraries) {
								sTimestamp = sap.ui.buildinfo.buildtime;
							} else {
								oInfo.libraries.forEach(function(oLibrary) {
									sTimestamp += oLibrary.buildTimestamp;
								});
							}
							return sTimestamp;
						})
						.catch(function() {
							return "<NOVALUE>";
						})
				);

				var sPageModelCacheKey = "";
				this.initPromise = Promise.all(aServiceDependencies)
					.then(function(aDependenciesResult) {
						var sCacheKey = aDependenciesResult[1];
						var sVersionInfo = aDependenciesResult[2];
						var oManifestContent = oAppComponent.getManifest();
						var sManifestHash = hash(
							JSON.stringify({
								sapApp: oManifestContent["sap.app"],
								viewData: oComponent.getViewData()
							})
						);
						sPageModelCacheKey = sCacheKey + "-" + sManifestHash + "-" + sVersionInfo + "-" + sStableId + "-pageModel";
						return Promise.all(aDependenciesResult.concat([CacheManager.get(sPageModelCacheKey)]));
					})
					.then(function(aDependenciesResult) {
						var oResourceModel = aDependenciesResult[0];
						var sCacheKey = aDependenciesResult[1];
						var oPageModelCache = aDependenciesResult[3];
						return that.createView(oResourceModel, sStableId, sCacheKey, sPageModelCacheKey, oPageModelCache);
					})
					.then(function(sCacheKey) {
						var oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(
							oMetaModel
						);
						oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier);
					});
			},
			createView: function(oResourceModel, sStableId, sCacheKey, sPageModelCacheKey, oPageModelCache) {
				var that = this;
				var oContext = this.getContext(),
					mServiceSettings = oContext.settings,
					sConverterType = mServiceSettings.converterType,
					oComponent = oContext.scopeObject,
					sEntitySet = oComponent.getProperty("entitySet"),
					oAppComponent = Component.getOwnerComponentFor(oComponent),
					oMetaModel = oAppComponent.getMetaModel(),
					oManifestContent = oAppComponent.getManifest(),
					oDeviceModel = new JSONModel(sap.ui.Device).setDefaultBindingMode("OneWay"),
					oManifestModel = new JSONModel(oManifestContent),
					oMetaPathModel = new JSONModel({
						currentPath: new MetaPath(),
						navigationPath: new MetaPath("NavigationPath")
					}),
					bError = false,
					oPageConfig,
					oPageModel,
					oViewDataModel,
					oViewSettings,
					mViewData;

				this.oFactory = oContext.factory;

				function getViewSettings() {
					var oViewSettings = {
						type: "XML",
						preprocessors: {
							xml: {
								bindingContexts: {
									entitySet: sEntitySet ? oMetaModel.createBindingContext("/" + sEntitySet) : null,
									converterContext: oPageModel.createBindingContext("/", null, { noResolve: true }),
									viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
								},
								models: {
									entitySet: oMetaModel,
									"sap.fe.i18n": oResourceModel,
									"sap.ui.mdc.metaModel": oMetaModel,
									"sap.fe.deviceModel": oDeviceModel, // TODO: discuss names here
									manifest: oManifestModel,
									converterContext: oPageModel,
									viewData: oViewDataModel,
									metaPath: oMetaPathModel
								}
							}
						},
						id: sStableId,
						viewName: mServiceSettings.viewName,
						viewData: mViewData,
						cache: { keys: [sCacheKey] },
						models: {
							"sap.fe.i18n": oResourceModel
						},
						height: "100%"
					};
					return oViewSettings;
				}
				function createErrorPage(reason) {
					// just replace the view name and add an additional model containing the reason, but
					// keep the other settings
					Log.error(reason.message, reason);
					oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
					oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);

					return oComponent.runAsOwner(function() {
						return View.create(oViewSettings).then(function(oView) {
							that.oView = oView;
							that.oView.setModel(new ManagedObjectModel(that.oView), "$view");
							oComponent.setAggregation("rootControl", that.oView);
							return sCacheKey;
						});
					});
				}
				return oAppComponent
					.getService("routingService")
					.then(function(oRoutingService) {
						// Retrieve the viewLevel for the component
						var oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
						var mOutbounds =
							oManifestContent["sap.app"] &&
							oManifestContent["sap.app"].crossNavigation &&
							oManifestContent["sap.app"].crossNavigation.outbounds;
						var mNavigation = oComponent.getNavigation() || {};
						Object.keys(mNavigation).forEach(function(navigationObjectKey) {
							var navigationObject = mNavigation[navigationObjectKey];
							var outboundConfig;
							if (
								navigationObject.detail &&
								navigationObject.detail.outbound &&
								mOutbounds[navigationObject.detail.outbound]
							) {
								outboundConfig = mOutbounds[navigationObject.detail.outbound];
								navigationObject.detail.outboundDetail = {
									semanticObject: outboundConfig.semanticObject,
									action: outboundConfig.action,
									parameters: outboundConfig.parameters
								};
							}
							if (
								navigationObject.create &&
								navigationObject.create.outbound &&
								mOutbounds[navigationObject.create.outbound]
							) {
								outboundConfig = mOutbounds[navigationObject.create.outbound];
								navigationObject.create.outboundDetail = {
									semanticObject: outboundConfig.semanticObject,
									action: outboundConfig.action,
									parameters: outboundConfig.parameters
								};
							}
						});
						mViewData = {
							navigation: mNavigation,
							viewLevel: oTargetInfo.viewLevel,
							stableId: sStableId
						};

						if (oComponent.getViewData) {
							Object.assign(mViewData, oComponent.getViewData());
						}
						oViewDataModel = new JSONModel(mViewData);
						if (mViewData && mViewData.controlConfiguration) {
							Object.keys(mViewData.controlConfiguration).forEach(function(sAnnotationPath) {
								if (sAnnotationPath.indexOf("[") !== -1) {
									var sTargetAnnotationPath = DynamicAnnotationPathHelper.resolveDynamicExpression(
										sAnnotationPath,
										oMetaModel
									);
									mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
								}
							});
						}
						if (!!oPageModelCache) {
							oPageModel = oPageModelCache;
						} else {
							try {
								oPageConfig = TemplateConverter.convertPage(sConverterType, oMetaModel, mViewData);
								oPageModel = oPageModelCache = new TemplateModel(oPageConfig, oMetaModel);
							} catch (error) {
								bError = true;
								oPageModel = new JSONModel();
								oViewSettings = getViewSettings();
								return createErrorPage(error);
							}
						}
						if (!bError) {
							oViewSettings = getViewSettings();
							// Setting the pageModel on the component for potential reuse
							oComponent.setModel(oPageModel, "_pageModel");
							return oComponent.runAsOwner(function() {
								return View.create(oViewSettings)
									.catch(createErrorPage)
									.then(function(oView) {
										that.oView = oView;
										that.oView.setModel(new ManagedObjectModel(that.oView), "$view");
										oComponent.setAggregation("rootControl", that.oView);
										return sCacheKey;
									})
									.catch(Log.error);
							});
						}
					})
					.catch(function(error) {
						Log.error(error.message, error);
						throw new Error("Error while creating view : " + error);
					});
			},
			getView: function() {
				return this.oView;
			},
			exit: function() {
				// Deregister global instance
				this.oFactory.removeGlobalInstance();
			}
		});

		return ServiceFactory.extend("sap.fe.core.services.TemplatedViewServiceFactory", {
			_oInstanceRegistry: {},
			createInstance: function(oServiceContext) {
				var oTemplatedViewService = new TemplatedViewService(Object.assign({ factory: this }, oServiceContext));
				return oTemplatedViewService.initPromise.then(function() {
					return oTemplatedViewService;
				});
			},
			removeGlobalInstance: function() {
				this._oInstanceRegistry = {};
			}
		});
	},
	true
);
