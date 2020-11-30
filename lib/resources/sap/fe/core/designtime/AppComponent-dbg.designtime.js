sap.ui.define(
	[],
	function() {
		"use strict";
		// To enable all actions, remove the propagateMetadata function. Or, remove this file and its entry in AppComponent.js referring 'designTime'.
		return {
			actions: "not-adaptable",
			aggregations: {
				rootControl: {
					actions: "not-adaptable",
					propagateMetadata: function(oElement) {
						// white list of controls for which we want to enable DesignTime
						var mWhiteList = {
							"sap.fe.templates.ObjectPage.controls.StashableVBox": true,
							"sap.fe.templates.ObjectPage.controls.StashableHBox": true,
							"sap.m.FlexBox": true,
							"sap.ui.layout.form.Form": true,
							"sap.ui.layout.form.FormContainer": true,
							"sap.ui.layout.form.FormElement": true
						};
						if (
							oElement.getMetadata().getName() === "sap.m.FlexBox" &&
							oElement.getId().indexOf("--fe::HeaderContentContainer") < 0
						) {
							mWhiteList["sap.m.FlexBox"] = false;
						}
						if (mWhiteList[oElement.getMetadata().getName()]) {
							return {};
						} else {
							return {
								actions: "not-adaptable"
							};
						}
					}
				}
			}
		};
	},
	false
);
