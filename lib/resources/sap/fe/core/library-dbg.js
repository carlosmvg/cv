/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

/**
 * @namespace reserved for Fiori Elements
 * @name sap.fe
 * @public
 */

/**
 * @namespace reserved for Fiori Elements
 * @name sap.fe.core
 * @private
 * @sap-restricted
 * @experimental
 */

/**
 * Initialization Code and shared classes of library sap.fe.core
 */
sap.ui.define(
	[
		"sap/fe/core/services/TemplatedViewServiceFactory",
		"sap/fe/core/services/ResourceModelServiceFactory",
		"sap/fe/core/services/CacheHandlerServiceFactory",
		"sap/fe/core/services/DraftModelServiceFactory",
		"sap/fe/core/services/NavigationServiceFactory",
		"sap/fe/core/services/RoutingServiceFactory",
		"sap/fe/core/services/ShellServicesFactory",
		"sap/fe/core/services/AsyncComponentServiceFactory",
		"sap/ui/core/service/ServiceFactoryRegistry",
		"sap/ui/core/Core", // implicit dependency, provides sap.ui.getCore()
		"sap/ui/core/library", // library dependency
		"sap/fe/navigation/library", // library dependency
		"sap/ui/fl/library", // library dependency
		"sap/ui/mdc/library" // library dependency
	],
	function(
		TemplatedViewServiceFactory,
		ResourceModelServiceFactory,
		CacheHandlerServiceFactory,
		DraftModelService,
		NavigationService,
		RoutingServiceFactory,
		ShellServicesFactory,
		AsyncComponentServiceFactory,
		ServiceFactoryRegistry
		// AppStateService
	) {
		"use strict";

		/**
		 * @namespace
		 * @name sap.fe.core.actions
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		/**
		 * @namespace
		 * @name sap.fe.core.controllerextensions
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		/**
		 * @namespace
		 * @name sap.fe.core.model
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		/**
		 * @namespace
		 * @name sap.fe.core.navigation
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		/**
		 * Fiori Elements Core Library
		 *
		 * @namespace
		 * @name sap.fe.core
		 * @private
		 * @sap-restricted
		 * @experimental
		 */

		// library dependencies
		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "sap.fe.core",
			dependencies: ["sap.ui.core", "sap.fe.navigation", "sap.ui.fl", "sap.ui.mdc"],
			types: ["sap.fe.core.CreationMode", "sap.fe.core.VariantManagement"],
			interfaces: [],
			controls: [],
			elements: [],
			version: "1.82.1",
			noLibraryCSS: true
		});

		/**
		 * Available values for creation mode.
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 */
		sap.fe.core.CreationMode = {
			/**
			 * New Page.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			NewPage: "NewPage",
			/**
			 * Sync.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Sync: "Sync",
			/**
			 * Async.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Async: "Async",
			/**
			 * Deferred.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Deferred: "Deferred",
			/**
			 * Inline.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Inline: "Inline",
			/**
			 * Creation row.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			CreationRow: "CreationRow",
			/**
			 * External (by outbound navigation).
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			External: "External"
		};
		/**
		 * Available values for Variant Management.
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 */
		sap.fe.core.VariantManagement = {
			/**
			 * No variant management at all.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			None: "None",

			/**
			 * One variant configuration for the whole page.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Page: "Page",

			/**
			 * Variant management on control level.
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			Control: "Control"
		};
		/**
		 * Available constants.
		 *
		 * @readonly
		 * @enum {string}
		 * @private
		 * @sap-restricted
		 */
		sap.fe.core.Constants = {
			/**
			 * Indicates cancelling of an action dialog
			 * @constant
			 * @type {string}
			 * @public
			 * @sap-restricted
			 */
			CancelActionDialog: "cancel"
		};

		ServiceFactoryRegistry.register("sap.fe.core.services.TemplatedViewService", new TemplatedViewServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.core.services.ResourceModelService", new ResourceModelServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.core.services.CacheHandlerService", new CacheHandlerServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.core.services.DraftModelService", new DraftModelService());
		ServiceFactoryRegistry.register("sap.fe.core.services.NavigationService", new NavigationService());
		ServiceFactoryRegistry.register("sap.fe.core.services.RoutingService", new RoutingServiceFactory());
		ServiceFactoryRegistry.register("sap.fe.core.services.ShellServices", new ShellServicesFactory());
		ServiceFactoryRegistry.register("sap.fe.core.services.AsyncComponentService", new AsyncComponentServiceFactory());

		return sap.fe.core;
	}
);
