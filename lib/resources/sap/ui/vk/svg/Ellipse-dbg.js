/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Ellipse class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Ellipse = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Ellipse";
		this.cx = parameters.cx || 0;
		this.cy = parameters.cy || 0;

		this.rx = parameters.major || parameters.radius || 50;
		this.ry = parameters.minor || parameters.radius || 50;

		this.setMaterial(parameters.material);
	};

	Ellipse.prototype = Object.assign(Object.create(Element.prototype), { constructor: Ellipse });

	Ellipse.prototype.tagName = function() {
		return "ellipse";
	};

	Ellipse.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		this._expandBoundingBoxCR(boundingBox, matrixWorld, this.cx, this.cy, this.rx + strokeDelta, this.ry + strokeDelta);
	};

	Ellipse.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("cx", this.cx);
		setAttributeFunc("cy", this.cy);
		setAttributeFunc("rx", this.rx);
		setAttributeFunc("ry", this.ry);
	};

	return Ellipse;
});
