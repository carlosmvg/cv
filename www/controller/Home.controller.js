sap.ui.define([
	"myCV/controller/BaseController"
], function(Controller) {
	"use strict";

	return Controller.extend("myCV.controller.Home", {
		onInit: function() {
			console.log("onInit Home");
		}
	});
});
