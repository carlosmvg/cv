/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/fe/core/TemplateComponent", "sap/fe/core/library"],
	function(TemplateComponent, CoreLibrary) {
		"use strict";

		var VariantManagement = CoreLibrary.VariantManagement,
			ListBasedComponent = TemplateComponent.extend("sap.fe.templates.ListComponent", {
				metadata: {
					properties: {
						initialLoad: {
							type: "boolean",
							defaultValue: false
						},
						variantManagement: {
							type: "sap.fe.core.VariantManagement",
							defaultValue: VariantManagement.Page
						}
					},
					manifest: {
						"sap.ui": {
							"technology": "UI5",
							"deviceTypes": {
								"desktop": true,
								"tablet": true,
								"phone": true
							},
							"supportedThemes": [
								"sap_fiori_3",
								"sap_hcb",
								"sap_bluecrystal",
								"sap_belize",
								"sap_belize_plus",
								"sap_belize_hcw"
							]
						},
						"sap.ui5": {
							"services": {
								"templatedViewService": {
									"factoryName": "sap.fe.core.services.TemplatedViewService",
									"startup": "waitFor",
									"settings": {
										"viewName": "sap.fe.templates.ListReport.ListReport",
										"converterType": "ListReport",
										"errorViewName": "sap.fe.core.services.view.TemplatingErrorPage"
									}
								},
								"draftModelService": {
									"factoryName": "sap.fe.core.services.DraftModelService",
									"startup": "waitFor"
								},
								"asyncComponentService": {
									"factoryName": "sap.fe.core.services.AsyncComponentService",
									"startup": "waitFor"
								}
							},
							"commands": {
								"Create": {
									"name": "Create",
									"shortcut": "Ctrl+Enter"
								},
								"DeleteEntry": {
									"name": "DeleteEntry",
									"shortcut": "Delete"
								},
								"TableSettings": {
									"name": "TableSettings",
									"shortcut": "Ctrl+,"
								},
								"Share": {
									"name": "Share",
									"shortcut": "Shift+Ctrl+S"
								}
							},
							"handleValidation": true,
							"dependencies": {
								"minUI5Version": "1.82.2",
								"libs": {
									"sap.f": {},
									"sap.fe.macros": {
										"lazy": true
									},
									"sap.m": {},
									"sap.suite.ui.microchart": {
										"lazy": true
									},
									"sap.ui.core": {},
									"sap.ui.layout": {},
									"sap.ui.mdc": {},
									"sap.ushell": {
										"lazy": true
									},
									"sap.ui.fl": {}
								}
							},
							"contentDensities": {
								"compact": true,
								"cozy": true
							}
						}
					},
					library: "sap.fe.templates"
				},
				onBeforeBinding: function(oContext) {},
				onAfterBinding: function(oContext, mParameters) {
					TemplateComponent.prototype.onAfterBinding.apply(this, arguments);
					// for now we just forward this to the list report controller
					this.getRootControl()
						.getController()
						.onAfterBinding(oContext, mParameters);
				},
				// liveMode should be kept as default on false, this should not be adjustable by the app developer
				getViewData: function() {
					var oViewData = TemplateComponent.prototype.getViewData.apply(this, arguments);
					oViewData.liveMode = false;
					return oViewData;
				}
			});
		return ListBasedComponent;
	},
	/* bExport= */ true
);
