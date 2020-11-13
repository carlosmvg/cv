sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("myCV.controller.App", {
		onInit: function() {
			console.log("onInit");
			sap.ui.getCore().getEventBus().subscribe("app", "init", this.initApp, this);
		},

		initApp: function() {
			console.log("iniciando...");
			
		}
	});
});
