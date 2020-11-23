/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/templates/ExtensionAPI"], function(ExtensionAPI) {
	"use strict";

	/**
	 * Extension API for the Fiori elements V4 List Report.
	 *
	 * @class
	 * @alias sap.fe.templates.ListReport.ExtensionAPI
	 * @extends sap.fe.templates.ExtensionAPI
	 * @public
	 * @since 1.79.0
	 */
	var extensionAPI = ExtensionAPI.extend("sap.fe.templates.ListReport.ExtensionAPI", {
		/**
		 * Refreshes the List Report.
		 * This method currently only supports triggering the search (click on GO button)
		 * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
		 * current shown data considering the current filters entered by the user.
		 * Please note: the Promise is resolved once the search was triggered and not once the data is returned.
		 *
		 * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
		 * @returns {Promise} resolved once the data is refreshed or rejected if the request failed
		 *
		 * @public
		 */
		refresh: function() {
			var oFilterBar = this._controller._getFilterBarControl();
			return oFilterBar.waitForInitialization().then(function() {
				oFilterBar.triggerSearch();
			});
		}
	});

	return extensionAPI;
});
