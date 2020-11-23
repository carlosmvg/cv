sap.ui.define(
	[
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/core/helpers/StableIdHelper"
	],
	function(BaseAPI, Utils, OpaBuilder, FEBuilder, OverflowToolbarBuilder, StableIdHelper) {
		"use strict";

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder the FEBuilder builder instance to operate on
		 * @param {string} [vHeaderDescription] the Header description (optional), used to log message
		 * @returns {sap.fe.test.api.HeaderAPI} the instance
		 * @class
		 * @private
		 */
		var HeaderLR = function(oHeaderBuilder, vHeaderDescription) {
			if (!Utils.isOfType(oHeaderBuilder, FEBuilder)) {
				throw new Error("oHeaderBuilder parameter must be a FEBuilder instance");
			}
			this._sPageId = vHeaderDescription.id;
			return BaseAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderLR.prototype = Object.create(BaseAPI.prototype);
		HeaderLR.prototype.constructor = HeaderLR;

		/**
		 * Helper method to for creating an OverflowToolbarBuilder for the actions of the header title.
		 * Since there´s no stable id for the OverflowToolbar, it´s identified by checking the parent controls and
		 * the Page Id.
		 *
		 * @param {string} sPageId id of page control.
		 * @returns {object} OverflowToolbarBuilder object
		 *
		 * @private
		 * @sap-restricted
		 */
		HeaderLR.prototype.createOverflowToolbarBuilder = function(sPageId) {
			return OverflowToolbarBuilder.create(this.getOpaInstance())
				.hasType("sap.m.OverflowToolbar")
				.has(function(oOverflowToolbar) {
					return (
						oOverflowToolbar
							.getParent()
							.getMetadata()
							.getName() === "sap.f.DynamicPageTitle" &&
						oOverflowToolbar
							.getParent()
							.getParent()
							.getMetadata()
							.getName() === "sap.f.DynamicPage" &&
						oOverflowToolbar
							.getParent()
							.getParent()
							.getId()
							.endsWith(sPageId)
					);
				});
		};

		return HeaderLR;
	}
);
