sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("enel.ptw.view.Router", {
		/**
		 * Initialize the router
		 */
		initialize: function() {
			this.getRouter().initialize();
		},

		/**
		 * Get router instance for this view
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Navigate back according to history
		 * @param {number} nBack Back steps count
		 */
		navBack: function(nBack = -1) {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(nBack);
			} else {
				this.navTo("Home", {}, true /*no history*/);
			}
		},

		/**
		 * Navigate to view
		 * Shorthand use for this.getRouter().navTo()
		 * @param  {...any} args Arguments for navTo
		 */
		navTo: function(...args) {
			this.getRouter().navTo(...args);
		}
	});
});
