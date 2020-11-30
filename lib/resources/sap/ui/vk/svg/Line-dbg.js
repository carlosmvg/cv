/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Line class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Line = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Line";
		this.x1 = parameters.x1 || 0;
		this.y1 = parameters.y1 || 0;
		this.x2 = parameters.x2 != null ? parameters.x2 : 100;
		this.y2 = parameters.y2 != null ? parameters.y2 : 100;

		this.setMaterial(parameters.material);
	};

	Line.prototype = Object.assign(Object.create(Element.prototype), { constructor: Line });

	Line.prototype.tagName = function() {
		return "line";
	};

	Line.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x1, this.y1, strokeDelta, strokeDelta);
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x2, this.y2, strokeDelta, strokeDelta);
	};

	Line.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("x1", this.x1);
		setAttributeFunc("y1", this.y1);
		setAttributeFunc("x2", this.x2);
		setAttributeFunc("y2", this.y2);
	};

	return Line;
});
