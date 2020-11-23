/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/ui/base/Object",
		"sap/ui/model/json/JSONModel",
		"sap/f/FlexibleColumnLayoutSemanticHelper",
		"sap/fe/core/CommonUtils",
		"sap/ui/core/Component"
	],
	function(BaseObject, JSONModel, FlexibleColumnLayoutSemanticHelper, CommonUtils) {
		"use strict";

		/**
		 * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for Flexible control Layout
		 *
		 * @namespace
		 * @alias sap.fe.core.controllerextensions.FlexibleColumnLayout
		 *
		 **/
		var Extension = BaseObject.extend("sap.fe.core.controllerextensions.FlexibleColumnLayout", {
			oTargetsAggregation: {},
			mTargetsFromRoutePattern: {},
			FCLLevel: 0,

			configure: function(oView, oRouting) {
				this.oView = oView;
				this.oRouting = oRouting;
			},

			getFCLLevel: function() {
				return this.FCLLevel;
			},

			setFCLLevel: function(level) {
				this.FCLLevel = level;
			},

			/**
			 * Return a referent to the AppComponent using the controlerExtention mechanisms (this.base).
			 *
			 * @name sap.fe.core.controllerextensions.FlexibleColumnLayout#_getOwnerComponent
			 * @memberof sap.fe.core.controllerextensions.FlexibleColumnLayout
			 * @returns {state} reference to the AppComponent
			 *
			 * @sap-restricted
			 */
			_getOwnerComponent: function() {
				return CommonUtils.getAppComponent(this.oView);
			},

			/**
			 * Triggers navigation when entering in fullscreen mode
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.FlexibleColumnLayout#handleFullScreen
			 * @memberof sap.fe.core.controllerextensions.FlexibleColumnLayout
			 * @param {*} oEvent Event sent to the function
			 *
			 * @sap-restricted
			 * @final
			 */

			handleFullScreen: function(oEvent) {
				var oAppComponent = this._getOwnerComponent();
				var oFclController = oAppComponent.getRootViewController();
				var oRouterProxy = oAppComponent.getRouterProxy();
				var sNextLayout = oEvent
					.getSource()
					.getModel("fclhelper")
					.getProperty("/actionButtonsInfo/fullScreen");
				if (!oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME]) {
					oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME] = {};
				}
				oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME].layout = sNextLayout;
				oRouterProxy.navTo(oFclController.getCurrentRouteName(), oFclController.getCurrentArgument());
			},

			/**
			 * Triggers navigation when exit from fullscreen mode.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.FlexibleColumnLayout#handleExitFullScreen
			 * @memberof sap.fe.core.controllerextensions.lexibleFlexibleColumnLayoutColumnLayout
			 * @param {*} oEvent Event sent to the function
			 *
			 * @sap-restricted
			 * @final
			 */
			handleExitFullScreen: function(oEvent) {
				var oAppComponent = this._getOwnerComponent();
				var oFclController = oAppComponent.getRootViewController();
				var oRouterProxy = oAppComponent.getRouterProxy();

				var sNextLayout = oEvent
					.getSource()
					.getModel("fclhelper")
					.getProperty("/actionButtonsInfo/exitFullScreen");
				if (!oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME]) {
					oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME] = {};
				}
				oFclController.getCurrentArgument()[oFclController.SQUERYKEYNAME].layout = sNextLayout;
				//oRouter.navTo(currentRouteName, currentArguments);
				oRouterProxy.navTo(oFclController.getCurrentRouteName(), oFclController.getCurrentArgument());
			},

			/**
			 * Triggers navigation when closing a FCL column.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.FlexibleColumnLayout#handleClose
			 * @memberof sap.fe.core.controllerextensions.FlexibleColumnLayout
			 * @param {*} oEvent Event sent to the function
			 *
			 * @sap-restricted
			 * @final
			 */
			handleClose: function(oEvent) {
				var oContext = oEvent.getSource().getBindingContext();
				this.oRouting.navigateBackFromContext(oContext, { noPreservationCache: true });
			}
		});

		return Extension;
	}
);
