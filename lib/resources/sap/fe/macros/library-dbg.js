/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

/**
 * @namespace reserved for Fiori Elements
 * @name sap.fe.macros
 * @private
 * @experimental
 * @sap-restricted
 */

/**
 * Initialization Code and shared classes of library sap.fe.core
 */
sap.ui.define(
	[
		"sap/ui/core/Fragment",
		"sap/ui/core/XMLTemplateProcessor",
		"sap/fe/macros/macroLibrary",
		"sap/ui/core/Core", // implicit dependency, provides sap.ui.getCore()
		"sap/ui/core/library" // library dependency
	],
	function(Fragment, XMLTemplateProcessor, macroLibrary) {
		"use strict";

		/**
		 * Fiori Elements Macros Library
		 *
		 * @namespace
		 * @name sap.fe.macros
		 * @private
		 * @experimental
		 * @sap-restricted
		 */

		/**
		 * @namespace
		 * @name sap.fe.macros.fpm
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		// library dependencies
		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "sap.fe.macros",
			dependencies: ["sap.ui.core"],
			types: ["sap.fe.macros.NavigationType", "sap.fe.macros.DraftIndicatorType", "sap.fe.macros.DraftIndicatorState"],
			interfaces: [],
			controls: [],
			elements: [],
			version: "1.82.1",
			noLibraryCSS: true
		});

		/**
		 * Available values for Semantic Key style.
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 * @experimental
		 */
		sap.fe.macros.SemanticKeyStyle = {
			/**
			 * Object Identifier
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			ObjectIdentifier: "ObjectIdentifier",
			/**
			 * Label.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Label: "Label"
		};
		sap.fe.macros.NavigationType = {
			/**
			 * For External Navigation
			 * @public
			 */
			External: "External",

			/**
			 * For In-Page Navigation
			 * @public
			 */
			InPage: "InPage",

			/**
			 * For No Navigation
			 * @public
			 */
			None: "None"
		};
		/**
		 * Type Of Draft Indicator
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 */
		sap.fe.macros.DraftIndicatorType = {
			/**
			 * DraftIndicator For List Report
			 * @public
			 */
			IconAndText: "IconAndText",

			/**
			 * DraftIndicator For Object Page
			 * @public
			 */
			IconOnly: "IconOnly"
		};
		/**
		 * Available values for DraftIndicator State.
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 */
		sap.fe.macros.DraftIndicatorState = {
			/**
			 * Draft With No Changes Yet
			 * @public
			 */
			NoChanges: "NoChanges",
			/**
			 * Draft With Changes
			 * @public
			 */
			WithChanges: "WithChanges",
			/**
			 * Draft With Active Instance
			 * @public
			 */
			Active: "Active"
		};

		Fragment.registerType("CUSTOM", {
			init: function(mSettings) {
				this._sExplicitId = this.getId();
				this._oContainingView = this;
				this.oController = mSettings.containingView.getController() && mSettings.containingView.getController().getExtensionAPI();
				this._aContent = XMLTemplateProcessor.parseTemplate(mSettings.fragmentContent, this);
			}
		});

		return sap.fe.macros;
	}
);
