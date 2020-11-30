sap.ui.define([
	"myCV/Router"
], function(Router) {
	"use strict";

	return Router.extend("myCV.controller.BaseController", {

		/**
		 * Returns the selected model
		 * @param {String} sModelName model name
		 */
		getModel: function(sModelName) {
			return this.getView().getModel(sModelName);
		},

		/**
		 * Set the selected model with the content
		 * @param {Object} oData model content / path of the content
		 * @param {String} sModelName model name
		 */
		setModel: function(oData, sModelName) {
			if (!this.getModel(sModelName)) {
				// If the model doesn't exist it will be created
				const oModel = new sap.ui.model.json.JSONModel(oData);
				this.getView().setModel(oModel, sModelName);
			} else if (oData) {
				// If it exists, replace all data
				this.getModel(sModelName).setData(oData);
			}
			return this.getModel(sModelName);
		},

	});
});
