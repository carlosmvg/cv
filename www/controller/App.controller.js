sap.ui.define([
	"myCV/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("myCV.controller.App", {
		onInit: function() {
			sap.ui.getCore().getEventBus().subscribe("app", "init", this.initApp, this);

			console.log("onInit App");
		},

		initApp: function() {
			console.log("iniciando...");
			this.initialize();
		}
	});
});
