/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

// Provides control sap.ui.comp.navpopover.SmartLink.
sap.ui.define([
	'sap/ui/core/Renderer', 'sap/m/LinkRenderer'
], function(Renderer, LinkRenderer) {
	"use strict";

	var SmartLinkRenderer = Renderer.extend(LinkRenderer);

	SmartLinkRenderer.apiVersion = 2;

	SmartLinkRenderer.render = function(oRm, oControl) {
		if (oControl.getIgnoreLinkRendering()) {
			var oReplaceControl = oControl._getInnerControl();
			if (oReplaceControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.renderControl(oReplaceControl);
				oRm.close("div");
			}
		} else {
			LinkRenderer.render.apply(this, arguments);
		}
	};

	SmartLinkRenderer.writeText = function(oRm, oControl) {
		if (!oControl.getUom()) {
			oRm.text(oControl.getText());
			return;
		}
		oRm.openStart("span");
		oRm.openEnd();
		oRm.text(oControl.getText());
		oRm.close("span");

		oRm.openStart("span");
		oRm.style("display", "inline-block");
		oRm.style("min-width", "2.5em");
		oRm.style("width", "3.0em");
		oRm.style("text-align", "start");
		oRm.openEnd();
		oRm.text(oControl.getUom());
		oRm.close("span");
	};

	return SmartLinkRenderer;

}, /* bExport= */true);
