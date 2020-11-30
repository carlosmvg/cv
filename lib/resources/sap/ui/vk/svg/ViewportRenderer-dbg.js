/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
], function() {
	"use strict";

	/**
	 * Viewport renderer.
	 * @namespace
	 */
	var ViewportRenderer = {};

	ViewportRenderer.render = function(rm, viewport) {
		rm.write("<div");
		rm.writeControlData(viewport);
		rm.addClass("sapVizKitViewport");
		rm.writeClasses();
		rm.writeAttribute("tabindex", 0);
		rm.writeAttribute("aria-label", "Image");
		rm.addStyle("width", viewport.getWidth());
		rm.addStyle("height", viewport.getHeight());
		rm.addStyle("background-image", "linear-gradient(" + viewport.getBackgroundColorTop() + "," + viewport.getBackgroundColorBottom() + ")");
		rm.writeStyles();
		rm.write(">");

		rm.write("<svg xmlns=\"http://www.w3.org/2000/svg\"");
		rm.writeAttribute("width", "100%");
		rm.writeAttribute("height", "100%");
		rm.writeAttribute("viewBox", viewport._getViewBox().join(" "));
		rm.write(">");

		// hotspots highlighting effect
		rm.write("\
			<defs>\
				<filter id='halo'>\
					<feGaussianBlur in='SourceAlpha' result='Outline' stdDeviation='4' />\
					<feColorMatrix in='Outline' result='ColorOutline' type='matrix' values='0 0 0 0 0, 0 0 0 0 0.75, 0 0 0 0 1, 0 0 0 3 0' />\
					<feMerge>\
						<feMergeNode in='ColorOutline' />\
						<feMergeNode in='SourceGraphic' />\
					</feMerge>\
				</filter>\
			</defs>\
		");
		// <feMorphology in='SourceAlpha' result='Outline' operator='dilate' radius='4' />\

		var scene = viewport.getScene();
		if (scene) {
			var vsm = viewport._getViewStateManagerSVG();
			scene.getRootElement().render(rm, vsm ? vsm._mask : (-1 | 0));
		}

		viewport._selectionRect.render(rm, 0 | 0); // hidden rectangle for rectangular selection

		rm.write("</svg>");

		var i, l;

		// Render gizmos of active tools
		var tools = viewport.getTools();
		for (i = 0, l = tools.length; i < l; i++) { // loop over all oTools
			var tool = sap.ui.getCore().byId(tools[ i ]); // get control for associated control
			var gizmo = tool.getGizmoForContainer(viewport);
			if (gizmo && gizmo.hasDomElement()) {
				rm.renderControl(gizmo);
			}
		}

		var content = viewport.getContent();
		for (i = 0, l = content.length; i < l; i++) {
			rm.renderControl(content[ i ]);
		}

		rm.write("</div>");
	};

	return ViewportRenderer;

}, /* bExport = */ true);
