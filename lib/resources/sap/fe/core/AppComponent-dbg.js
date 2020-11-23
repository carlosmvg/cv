/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// ----------------------------------------------------------------------------------
// Provides base class sap.fe.core.AppComponent for all generic app components
// ----------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/core/UIComponent",
		"sap/m/NavContainer",
		"sap/f/FlexibleColumnLayout",
		"sap/fe/core/controllerextensions/Routing",
		"sap/fe/core/RouterProxy",
		"sap/fe/core/AppStateHandler",
		"sap/base/Log",
		"sap/base/util/merge",
		"sap/fe/core/controllerextensions/EditFlow"
	],
	function(UIComponent, NavContainer, FlexibleColumnLayout, Routing, RouterProxy, AppStateHandler, Log, merge, EditFlow) {
		"use strict";

		var NAVCONF = {
			FCL: {
				VIEWNAME: "sap.fe.templates.RootContainer.view.Fcl",
				ROUTERCLASS: "sap.f.routing.Router"
			},
			NAVCONTAINER: {
				VIEWNAME: "sap.fe.templates.RootContainer.view.NavContainer",
				ROUTERCLASS: "sap.m.routing.Router"
			}
		};

		var AppComponent = UIComponent.extend("sap.fe.core.AppComponent", {
			metadata: {
				config: {
					fullWidth: true
				},
				manifest: {
					"sap.ui5": {
						services: {
							resourceModel: {
								factoryName: "sap.fe.core.services.ResourceModelService",
								"startup": "waitFor",
								"settings": {
									"bundles": ["sap.fe.core.messagebundle"],
									"modelName": "sap.fe.i18n"
								}
							},
							draftModelService: {
								"factoryName": "sap.fe.core.services.DraftModelService",
								"startup": "waitFor"
							},
							routingService: {
								factoryName: "sap.fe.core.services.RoutingService",
								"startup": "waitFor"
							},
							shellServices: {
								factoryName: "sap.fe.core.services.ShellServices",
								startup: "waitFor"
							},
							ShellUIService: {
								factoryName: "sap.ushell.ui5service.ShellUIService"
							},
							navigationService: {
								factoryName: "sap.fe.core.services.NavigationService",
								startup: "waitFor"
							},
							asyncComponentService: {
								factoryName: "sap.fe.core.services.AsyncComponentService",
								"startup": "waitFor"
							}
						},
						rootView: {
							viewName: NAVCONF.NAVCONTAINER.VIEWNAME,
							type: "XML",
							async: true,
							id: "appRootView"
						},
						routing: {
							config: {
								controlId: "appContent",
								routerClass: NAVCONF.NAVCONTAINER.ROUTERCLASS,
								viewType: "XML",
								controlAggregation: "pages",
								async: true,
								containerOptions: {
									propagateModel: true
								}
							}
						}
					}
				},
				designtime: "sap/fe/core/designtime/AppComponent.designtime",

				library: "sap.fe.core"
			},

			_oRouterProxy: null,

			_isFclEnabled: function() {
				var oManifestUI5 = this.getMetadata().getManifestEntry("/sap.ui5", true);
				return NAVCONF.FCL.VIEWNAME === oManifestUI5.rootView.viewName;
			},

			/**
			 * Get a reference to the RouterProxy.
			 *
			 * @function
			 * @name sap.fe.core.AppComponent#getRouterProxy
			 * @memberof sap.fe.core.AppComponent
			 * @returns {oObject} reference to the outerProxy
			 *
			 * @sap-restricted
			 * @final
			 */
			getRouterProxy: function() {
				return this._oRouterProxy;
			},

			/**
			 * Get a reference to the AppStateHandler.
			 *
			 * @function
			 * @name sap.fe.core.AppComponent#getAppStateHandler
			 * @memberof sap.fe.core.AppComponent
			 * @returns {oObject} reference to the AppStateHandler
			 *
			 * @sap-restricted
			 * @final
			 */
			getAppStateHandler: function() {
				return this._oAppStateHandler;
			},

			/**
			 * Get a reference to the nav/FCL Controller.
			 *
			 * @function
			 * @name sap.fe.core.AppComponent#getRootViewController
			 * @memberof sap.fe.core.AppComponent
			 * @returns {oObject} reference to the FCL Controller
			 *
			 * @sap-restricted
			 * @final
			 */
			getRootViewController: function() {
				return this.getRootControl().getController();
			},

			/**
			 * Get the NavContainer control or the FCL control.
			 *
			 * @function
			 * @name sap.fe.core.AppComponent#getRootContainer
			 * @memberof sap.fe.core.AppComponent
			 * @returns {oObject} reference to  NavContainer control or the FCL control
			 *
			 * @sap-restricted
			 * @final
			 */
			getRootContainer: function() {
				return this.getRootControl().getContent()[0];
			},

			init: function() {
				this.bInitializeRouting = true;
				this._oRouting = new Routing();
				this._oRouterProxy = new RouterProxy();
				this._oAppStateHandler = new AppStateHandler();
				var that = this;
				var oModel = this.getModel();
				if (oModel) {
					oModel
						.getMetaModel()
						.requestObject("/$EntityContainer/")
						.catch(
							function(oError) {
								// Error handling for erroneous metadata request
								var oRootContainer = this.getRootContainer(),
									oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

								that._oRouting.navigateToMessagePage(
									oResourceBundle.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"),
									{
										title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
										description: oError.message,
										navContainer: oRootContainer
									}
								);
							}.bind(this)
						);
				}

				var oManifestUI5 = this.getMetadata().getManifestEntry("/sap.ui5", true);
				if (
					oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME &&
					oManifestUI5.routing.config.routerClass === NAVCONF.FCL.ROUTERCLASS
				) {
					Log.info('Rootcontainer: "' + NAVCONF.FCL.VIEWNAME + '" - Routerclass: "' + NAVCONF.FCL.ROUTERCLASS + '"');
				} else if (
					oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME &&
					oManifestUI5.routing.config.routerClass === NAVCONF.NAVCONTAINER.ROUTERCLASS
				) {
					Log.info(
						'Rootcontainer: "' + NAVCONF.NAVCONTAINER.VIEWNAME + '" - Routerclass: "' + NAVCONF.NAVCONTAINER.ROUTERCLASS + '"'
					);
				} else {
					throw Error(
						"\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n" +
							"Current values are :(" +
							oManifestUI5.rootView.viewName +
							"/" +
							oManifestUI5.routing.config.routerClass +
							")\n" +
							"Expected values are \n" +
							"\t - (" +
							NAVCONF.NAVCONTAINER.VIEWNAME +
							"/" +
							NAVCONF.NAVCONTAINER.ROUTERCLASS +
							")\n" +
							"\t - (" +
							NAVCONF.FCL.VIEWNAME +
							"/" +
							NAVCONF.FCL.ROUTERCLASS +
							")"
					);
				}

				// the init function configures the routing according to the settings above
				// it will call the createContent function to instantiate the RootView and add it to the UIComponent aggregations
				UIComponent.prototype.init.apply(that, arguments);
			},
			onServicesStarted: function() {
				//router must be started once the rootcontainer is initialized
				//starting of the router
				var that = this;
				if (this.bInitializeRouting) {
					this._oRouting
						.initializeRouting(this)
						.then(function() {
							that.getRouterProxy().init(that, that._isFclEnabled());
						})
						.catch(function(err) {
							Log.error("cannot cannot initialize routing: " + err);
						});

					if (this.getModel()) {
						var oDraftModelService = this.getDraftModelService();
						if (oDraftModelService.isDraftModel()) {
							that.setModel(oDraftModelService.getDraftAccessModel(), "$draft");
						}
					}
					if (this.getRootViewController() && this.getRootViewController().attachShellTitleHandler) {
						this.getRootViewController().attachShellTitleHandler();
					} else {
						this.getRootControl().attachAfterInit(function() {
							if (that.getRootViewController() && that.getRootViewController().attachShellTitleHandler) {
								that.getRootViewController().attachShellTitleHandler();
							}
						});
					}
				}
			},
			exit: function() {
				this._oRouting.fireOnAfterNavigation();
				this._oRouterProxy.exit();
				EditFlow.onExitApplication(this.getId());
			},
			getMetaModel: function() {
				return this.getModel().getMetaModel();
			},
			exitApplication: function() {
				this._oRouting.fireOnAfterNavigation();
				EditFlow.onExitApplication(this.getId());
			},
			destroy: function() {
				this.exitApplication();
				//WORKAROUND for sticky discard request : due to async callback, request triggered by the exitApplication will be send after the UIComponent.prototype.destroy
				//so we need to copy the Requestor headers as it will be destroy
				var oMainModel = this.oModels[undefined];
				var oHeaders = jQuery.extend({}, oMainModel.oRequestor.mHeaders);
				// As we need to cleanup the application / handle the dirty object we need to call our cleanup before the models are destroyed
				UIComponent.prototype.destroy.apply(this, arguments);
				oMainModel.oRequestor.mHeaders = oHeaders;
			}
		});

		return AppComponent;
	}
);
