sap.ui.define(
	["sap/m/VBox", "sap/m/VBoxRenderer", "sap/ui/core/StashedControlSupport"],
	function(VBox, VBoxRenderer, StashedControlSupport) {
		"use strict";

		var StashableVBox = VBox.extend("sap.fe.templates.ObjectPage.controls.StashableVBox", {
			metadata: {
				designtime: "sap/fe/templates/ObjectPage/designtime/StashableVBox.designtime"
			},
			renderer: {
				render: function(oRm, oControl) {
					VBoxRenderer.render.apply(this, [oRm, oControl]);
				}
			}
		});

		StashedControlSupport.mixInto(StashableVBox);

		return StashableVBox;
	},
	/* bExport= */ true
);
