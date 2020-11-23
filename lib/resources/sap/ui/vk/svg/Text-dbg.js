/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Text class.
sap.ui.define([
	"./Element"
], function(
	Element
) {
	"use strict";

	var Text = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Text";
		this.text = parameters.text || "";
		this.fontFamily = parameters.fontFamily || "";
		this.fontSize = parameters.fontSize || 12;
		this.x = parameters.x || 0;
		this.y = parameters.y || 0;

		this.setMaterial(parameters.material);
	};

	Text.prototype = Object.assign(Object.create(Element.prototype), { constructor: Text });

	Text.prototype.tagName = function() {
		return "text";
	};

	// canvas for measuring text
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	Text.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		context.font = this.fontSize + "px " + this.fontFamily;
		var metrics = context.measureText(this.text);
		var hw = metrics.width * 0.5;
		var hh = (metrics.actualBoundingBoxAscent || this.fontSize) * 0.5;
		this._expandBoundingBoxCE(boundingBox, matrixWorld, this.x + hw, this.y - hh, hw + strokeDelta, hh + strokeDelta);
	};

	Text.prototype._setSpecificAttributes = function(setAttributeFunc) {
		setAttributeFunc("x", this.x);
		setAttributeFunc("y", this.y);
		setAttributeFunc("font-family", this.fontFamily);
		setAttributeFunc("font-size", this.fontSize);
	};

	Text.prototype._getTextContent = function(rm) {
		return this.text;
	};

	return Text;
});
