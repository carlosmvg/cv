/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Curve class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Curve = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Curve";
		this.points = new Float32Array(parameters.points || [ 0, 0, 100, 0, 100, 100, 0, 100 ]);
		this.closed = parameters.closed || false;

		this.setMaterial(parameters.material);
	};

	Curve.prototype = Object.assign(Object.create(Element.prototype), { constructor: Curve });

	Curve.prototype.tagName = function() {
		return "path";
	};

	Curve.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		var points = this.points;
		for (var i = 0, l = points.length - 1; i < l; i += 2) {
			this._expandBoundingBoxCE(boundingBox, matrixWorld, points[ i ], points[ i + 1 ], strokeDelta, strokeDelta);
		}
	};

	Curve.prototype._setSpecificAttributes = function(setAttributeFunc) {
		var points = this.points;
		var d = [ "M", points[ 0 ], points[ 1 ] ];
		for (var i = 2, l = points.length - 5; i < l; i += 6) {
			d.push("C", points[ i ], points[ i + 1 ], points[ i + 2 ], points[ i + 3 ], points[ i + 4 ], points[ i + 5 ]);
		}
		if (this.closed) {
			d.push("Z");
		}
		setAttributeFunc("d", d.join(" "));
		// setAttributeFunc("stroke-linecap", "butt");
		setAttributeFunc("stroke-linejoin", "round");
	};

	return Curve;
});
