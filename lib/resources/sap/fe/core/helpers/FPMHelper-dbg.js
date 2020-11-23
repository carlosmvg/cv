sap.ui.define(["sap/fe/core/CommonUtils"], function(CommonUtils) {
	"use strict";
	var FPMHelper = {
		actionWrapper: function(oEvent, sModule, sMethod, oParameters) {
			var oSource = oEvent.getSource(),
				oView = CommonUtils.getParentViewOfControl(oSource),
				oBindingContext = oSource.getBindingContext(),
				oExtensionAPI,
				aSelectedContexts;

			if (oParameters !== undefined) {
				aSelectedContexts = oParameters.contexts || [];
			} else if (oBindingContext !== undefined) {
				aSelectedContexts = [oBindingContext];
			} else {
				aSelectedContexts = [];
			}

			if (
				oView.getControllerName() === "sap.fe.templates.ObjectPage.ObjectPageController" ||
				oView.getControllerName() === "sap.fe.templates.ListReport.ListReportController"
			) {
				oExtensionAPI = oView.getController().getExtensionAPI();
			}

			sap.ui.require([sModule], function(module) {
				// - we bind the action to the extensionAPI of the controller so it has the same scope as a custom section
				// - we provide the context as API, maybe if needed further properties
				module[sMethod].bind(oExtensionAPI)(oBindingContext, aSelectedContexts);
			});
		}
	};
	return FPMHelper;
});
