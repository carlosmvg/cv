sap.ui.define(
	["sap/m/HBox", "sap/m/HBoxRenderer", "sap/ui/core/StashedControlSupport"],
	function(HBox, HBoxRenderer, StashedControlSupport) {
		"use strict";

		var StashableHBox = HBox.extend("sap.fe.templates.ObjectPage.controls.StashableHBox", {
			metadata: {
				designtime: "sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"
			},
			renderer: {
				render: function(oRm, oControl) {
					HBoxRenderer.render.apply(this, [oRm, oControl]);
				}
			}
		});

		StashedControlSupport.mixInto(StashableHBox);

		return StashableHBox;
	},
	/* bExport= */ true
);
