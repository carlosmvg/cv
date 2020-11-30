/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/templates/ExtensionAPI", "sap/fe/core/helpers/SideEffectsUtil"], function(ExtensionAPI, SideEffectsUtil) {
	"use strict";

	/**
	 * Extension API for the Fiori elements V4 Object Page.
	 *
	 * @class
	 * @alias sap.fe.templates.ObjectPage.ExtensionAPI
	 * @extends sap.fe.templates.ExtensionAPI
	 * @public
	 * @since 1.79.0
	 */
	var extensionAPI = ExtensionAPI.extend("sap.fe.templates.ObjectPage.ExtensionAPI", {
		/**
		 * Refresh the whole object page or portions of it.
		 *
		 * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
		 * @param {string | string[]} [vPath] path or array of paths referring to entities or properties to be refreshed
		 * If omitted the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
		 * without navigations
		 * @returns {Promise} resolved once the data is refreshed or rejected if the request failed
		 *
		 * @public
		 */
		refresh: function(vPath) {
			var oBindingContext = this._view.getBindingContext(),
				oMetaModel = oBindingContext.getModel().getMetaModel(),
				aPaths,
				aSideEffects = [],
				sPath,
				sBaseEntitySet,
				sKind;

			if (vPath === undefined || vPath === null) {
				// we just add an empty path which should refresh the page with all dependent bindings
				aSideEffects.push({
					$NavigationPropertyPath: ""
				});
			} else {
				aPaths = Array.isArray(vPath) ? vPath : [vPath];
				sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();

				for (var i = 0; i < aPaths.length; i++) {
					sPath = aPaths[i];
					if (sPath === "") {
						// an empty path shall refresh the entity without dependencies which means * for the model
						aSideEffects.push({
							$PropertyPath: "*"
						});
					} else {
						sKind = oMetaModel.getObject("/" + sBaseEntitySet + "/" + sPath + "/$kind");

						if (sKind === "NavigationProperty") {
							aSideEffects.push({
								$NavigationPropertyPath: sPath
							});
						} else if (sKind) {
							aSideEffects.push({
								$PropertyPath: sPath
							});
						} else {
							return Promise.reject(sPath + " is not a valid path to be refreshed");
						}
					}
				}
				// add also the text properties
				aSideEffects = SideEffectsUtil.addTextProperties(aSideEffects, oMetaModel, sBaseEntitySet);
			}

			return oBindingContext.requestSideEffects(aSideEffects);
		}
	});

	return extensionAPI;
});
