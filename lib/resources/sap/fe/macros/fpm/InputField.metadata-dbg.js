/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["sap/fe/macros/MacroMetadata"], function(MacroMetadata) {
	"use strict";

	/**
	 * @classdesc
	 * Content of an InputField
	 *
	 * @class sap.fe.macros.fpm.InputField
	 * @hideconstructor
	 * @private
	 * @sap-restricted
	 * @experimental
	 */
	var CustomSection = MacroMetadata.extend("sap.fe.macros.fpm.InputField", {
		/**
		 * Name
		 */
		name: "InputField",
		/**
		 * Namespace
		 */
		namespace: "sap.fe.macros.fpm",
		/**
		 * Fragment source
		 */
		fragment: "sap.fe.macros.fpm.InputField",

		/**
		 * Metadata
		 */
		metadata: {
			/**
			 * Define macro stereotype for documentation purpose
			 */
			stereotype: "xmlmacro",
			/**
			 * Properties.
			 */
			properties: {
				/**
				 * Entity set
				 */
				entitySet: {
					type: "sap.ui.model.Context",
					required: true
				},
				/**
				 * Property
				 */
				property: {
					type: "sap.ui.model.Context",
					required: true
				},
				/**
				 * Input Field ID
				 */
				id: {
					type: "string",
					required: true
				}
			},
			events: {
				/**
				 * Event handler for change event
				 */
				onChange: {
					type: "function"
				}
			}
		}
	});

	return CustomSection;
});
