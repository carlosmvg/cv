/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Rectangle class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Rectangle = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Rectangle";
		this.x = parameters.x || 0;
		this.y = parameters.y || 0;
		this.width = parameters.width || 100;
		this.height = parameters.height || 100;

		this.setMaterial(parameters.material);
	};

	Rectangle.prototype = Object.assign(Object.create(Element.prototype), { constructor: Rectangle });

	Rectangle.prototype.tagName = function() {
		return "rect";
	};

	Rectangle.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		var hw = this.width * 0.5;
		var hh = this.height * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x + hw, this.y + hh, hw + strokeDelta, hh + strokeDelta);
	};

	Rectangle.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("x", this.x);
		setAttributeFunc("y", this.y);
		setAttributeFunc("width", this.width);
		setAttributeFunc("height", this.height);
	};

	return Rectangle;
});
