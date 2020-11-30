/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/ui/base/Object", "sap/fe/core/CommonUtils", "sap/fe/macros/DelegateUtil", "sap/base/Log", "sap/ui/core/Component"],
	function(BaseObject, CommonUtils, DelegateUtil, Log, Component) {
		"use strict";
		/**
		 * Common Extension API for all Fiori elements V4 pages.
		 *
		 * @class
		 * @alias sap.fe.templates.ExtensionAPI
		 * @public
		 * @extends sap.ui.base.Object
		 * @since 1.79.0
		 */
		var extensionAPI = BaseObject.extend("sap.fe.templates.ExtensionAPI", {
			constructor: function(oController) {
				this._controller = oController;
				this._view = oController.getView();
			},
			/**
			 * Get access to models managed by Fiori elements.<br>
			 * The following models can be accessed:
			 * <ul>
			 * <li>undefined: the undefined model returns the UI5 OData v4 model bound to this page</li>
			 * <li>i18n / further data models defined in the manifest</li>
			 * <li>ui: returns a UI5 JSON model containing UI information. Only the following properties are public,
			 * don't rely on any other property as it might change in the future
			 * 	<ul>
			 *     <li>editMode: contains either 'Editable' or 'Display'</li>
			 *  </ul>
			 * </li>
			 * </ul>.
			 *
			 * @alias sap.fe.templates.ExtensionAPI#getModel
			 * @param {string} sModelName name of the model
			 * @returns {sap.ui.model.Model} the required model
			 * @public
			 */
			getModel: function(sModelName) {
				var oAppComponent;
				if (sModelName && sModelName !== "ui") {
					oAppComponent = CommonUtils.getAppComponent(this._view);
					if (!oAppComponent.getManifestEntry("sap.ui5").models[sModelName]) {
						// don't allow access to our internal models
						return null;
					}
				}
				return this._view.getModel(sModelName);
			},
			/**
			 * Add any control as dependent to this Fiori elements page.
			 *
			 * @alias sap.fe.templates.ExtensionAPI#addDependent
			 * @param {sap.ui.core.Control} oControl Control to be added as dependent
			 * @public
			 */
			addDependent: function(oControl) {
				this._view.addDependent(oControl);
			},
			/**
			 * Remove a dependent control from this Fiori elements page.
			 *
			 * @alias sap.fe.templates.ExtensionAPI#removeDependent
			 * @param {sap.ui.core.Control} oControl Control to be added as dependent
			 * @public
			 */
			removeDependent: function(oControl) {
				this._view.removeDependent(oControl);
			},
			/**
			 * Navigate to another target.
			 *
			 * @alias sap.fe.templates.ExtensionAPI#navigateToTarget
			 * @param {string} sTarget Name of the target route
			 * @param {sap.ui.model.Context} [oContext] context instance
			 * @public
			 */
			navigateToTarget: function(sTarget, oContext) {
				this._controller.routingListener.navigateToTarget(oContext, sTarget);
			},
			/**
			 * Load a fragment and go through the template preprocessor with the entityset context.
			 *
			 * @alias sap.fe.templates.ExtensionAPI#loadFragment
			 * @param {object} mSettings the settings object
			 * @param {string} mSettings.id the id of the fragment itself
			 * @param {string} mSettings.name the name of the fragment to load
			 * @param {object} mSettings.controller the controller to attach to the fragment.
			 * @returns {Promise<Element[]|sap.ui.core.Element[]>} the fragment definition
			 *
			 * @experimental This method is only for experimental use!
			 * @public
			 */
			loadFragment: function(mSettings) {
				var that = this;
				var oTemplateComponent = Component.getOwnerComponentFor(this._view);
				var oMetaModel = this.getModel().getMetaModel(),
					oPreprocessorSettings = {
						bindingContexts: {
							"entitySet": oMetaModel.createBindingContext("/" + oTemplateComponent.getEntitySet())
						},
						models: {
							"entitySet": oMetaModel
						}
					};
				var oTemplatePromise = DelegateUtil.templateControlFragment(
					mSettings.name,
					oPreprocessorSettings,
					mSettings.controller,
					false,
					mSettings.id
				);
				oTemplatePromise
					.then(function(oFragment) {
						that.addDependent(oFragment);
					})
					.catch(function(oError) {
						Log.error(oError);
					});
				return oTemplatePromise;
			}
		});
		return extensionAPI;
	}
);
