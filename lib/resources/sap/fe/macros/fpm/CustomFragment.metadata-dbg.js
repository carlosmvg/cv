/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["sap/fe/macros/MacroMetadata"], function(MacroMetadata) {
	"use strict";

	/**
	 * @classdesc
	 * Content of a custom fragment
	 *
	 * @class sap.fe.macros.fpm.CustomFragment
	 * @hideconstructor
	 * @private
	 * @sap-restricted
	 * @experimental
	 */
	var CustomFragment = MacroMetadata.extend("sap.fe.macros.fpm.CustomFragment", {
		/**
		 * Name
		 */
		name: "CustomFragment",
		/**
		 * Namespace
		 */
		namespace: "sap.fe.macros.fpm",
		/**
		 * Fragment source
		 */
		fragment: "sap.fe.macros.fpm.CustomFragment",

		/**
		 * Metadata
		 */
		metadata: {
			/**
			 * Properties.
			 */
			properties: {
				/**
				 * ID of the custom fragment
				 */
				id: {
					type: "string",
					required: true
				},
				/**
				 *  Name of the custom fragment
				 */
				fragmentName: {
					type: "string",
					required: true
				}
			},
			events: {}
		},
		create: function(oProps, oAggregations) {
			oProps.fragmentInstanceName = oProps.fragmentName + "-JS".replace(/\//g, ".");

			return oProps;
		}
	});

	return CustomFragment;
});
