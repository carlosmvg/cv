/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the NodeProxy class.
sap.ui.define([
	"../NodeProxy",
	"../cssColorToColor",
	"../colorToCSSColor",
	"../abgrToColor",
	"../colorToABGR"
], function(
	NodeProxyBase,
	cssColorToColor,
	colorToCSSColor,
	abgrToColor,
	colorToABGR
) {
	"use strict";

	/**
	 * Constructor for a new NodeProxy.
	 *
	 * @class
	 * Provides a proxy object to the node in the node hierarchy.
	 *
	 * Objects of this type should only be created with the {@link sap.ui.vk.NodeHierarchy#createNodeProxy sap.ui.vk.NodeHierarchy.createNodeProxy} method.
	 * and destroyed with the {@link sap.ui.vk.NodeHierarchy#destroyNodeProxy sap.ui.vk.NodeHierarchy.destroyNodeProxy} method.
	 *
	 * @public
	 * @author SAP SE
	 * @version 1.82.0
	 * @extends sap.ui.vk.NodeProxy
	 * @alias sap.ui.vk.svg.NodeProxy
	 */
	var NodeProxy = NodeProxyBase.extend("sap.ui.vk.svg.NodeProxy", /** @lends sap.ui.vk.svg.NodeProxy.prototype */ {
		metadata: {
		},

		constructor: function(nodeHierarchy, svgElement) {
			NodeProxyBase.call(this);

			this._element = svgElement; // SVG element
			this._nodeHierarchy = nodeHierarchy;
		}
	});

	NodeProxy.prototype.destroy = function() {
		this._element = null;

		NodeProxyBase.prototype.destroy.call(this);
	};

	NodeProxy.prototype.getNodeHierarchy = function() {
		return this._nodeHierarchy;
	};

	NodeProxy.prototype.getNodeRef = function() {
		return this._element;
	};

	NodeProxy.prototype.getNodeId = function() {
		return this._element;
	};

	NodeProxy.prototype.getVeIds = function() {
		return this._element.veids || [];
	};

	NodeProxy.prototype.getVeId = function() {
		return this._element.sid;
	};

	NodeProxy.prototype.getName = function() {
		return this._element.name || ("<" + this._element.type + ">");
	};

	NodeProxy.prototype.getOpacity = function() {
		return this._element.opacity;
	};

	NodeProxy.prototype.setOpacity = function(value) {
		this.setProperty("opacity", value, true);
		return this;
	};

	NodeProxy.prototype.getTintColorABGR = function() {
		return this._element.tintColor;
	};

	NodeProxy.prototype.setTintColorABGR = function(value) {
		this.setProperty("tintColorABGR", value, true);
		this.setProperty("tintColor", colorToCSSColor(abgrToColor(value)), true);
		return this;
	};

	NodeProxy.prototype.getTintColor = function() {
		return colorToCSSColor(abgrToColor(this._element.tintColor));
	};

	NodeProxy.prototype.setTintColor = function(value) {
		var abgr = colorToABGR(cssColorToColor(value));
		this.setProperty("tintColorABGR", abgr, true);
		this.setProperty("tintColor", value, true);
		return this;
	};

	NodeProxy.prototype.getNodeMetadata = function() {
		return this._element.metadata || {};
	};

	NodeProxy.prototype.getHasChildren = function() {
		return this._element.children.length > 0;
	};

	NodeProxy.prototype.getClosed = function() {
		return !!this._element.closed;
	};

	return NodeProxy;
});
