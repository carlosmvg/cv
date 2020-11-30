sap.ui.define([
	"myCV/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("myCV.controller.Home", {

		/**
		 * Initializes the model
		 */
		onInit: function() {
			this.setModel("/local/header.json");
		}

	});
});
