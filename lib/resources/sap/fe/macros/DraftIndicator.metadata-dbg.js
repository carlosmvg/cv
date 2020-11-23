/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["./MacroMetadata"], function(MacroMetadata) {
	"use strict";

	/**
	 * /**
	 * @classdesc
	 * Macro for creating a DraftIndicator based on provided OData v4 metadata.
	 *
	 *
	 * Usage example:
	 * <pre>
	 * &lt;macro:DraftIndicator
	 *   id="SomeID"
	 * /&gt;
	 * </pre>
	 *
	 * Macro for creating a DraftIndicator based on provided OData v4 metadata.
	 * @class sap.fe.macros.DraftIndicator
	 * @hideconstructor
	 * @private
	 * @sap-restricted
	 * @experimental
	 */
	var DraftIndicator = MacroMetadata.extend("sap.fe.macros.DraftIndicator", {
		/**
		 * Name of the macro control.
		 */
		name: "DraftIndicator",
		/**
		 * Namespace of the macro control
		 */
		namespace: "sap.fe.macros",
		/**
		 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
		 */
		fragment: "sap.fe.macros.DraftIndicator",

		/**
		 * The metadata describing the macro control.
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
				 * ID of the DraftIndicator
				 */
				id: {
					type: "string"
				},
				/**
				 * Manadatory field DraftIndicator
				 */
				DraftIndicatorType: {
					type: "sap.ui.mdc.DraftIndicatorType",
					required: true,
					defaultValue: "IconAndText"
				},
				/**
				 * Mandatory context to the EntitySet
				 */
				entitySet: {
					type: "sap.ui.model.Context",
					required: true,
					$kind: "EntitySet"
				}
			}
		}
	});

	return DraftIndicator;
});
