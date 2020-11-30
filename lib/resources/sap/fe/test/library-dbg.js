/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

/**
 * @namespace reserved for Fiori Elements
 * @name sap.fe.templates
 * @private
 * @experimental
 * @sap-restricted
 */

/**
 * Initialization Code and shared classes of library sap.fe.templates
 */
sap.ui.define(
	[
		"sap/ui/core/Core", // implicit dependency, provides sap.ui.getCore()
		"sap/ui/core/library" // library dependency
	],
	function() {
		"use strict";

		/**
		 * Fiori Elements Templates Library
		 *
		 * @namespace
		 * @name sap.fe.templates
		 * @private
		 * @experimental
		 */

		// library dependencies
		sap.ui.getCore().initLibrary({
			name: "sap.fe.test",
			dependencies: ["sap.ui.core"],
			types: [],
			interfaces: [],
			controls: [],
			elements: [],
			version: "1.82.1",
			noLibraryCSS: true
		});

		return sap.fe.test;
	}
);
