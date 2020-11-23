/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/fe/templates/ListComponent"],
	function(ListComponent) {
		"use strict";

		var ListReportComponent = ListComponent.extend("sap.fe.templates.ListReport.Component", {
			metadata: {
				properties: {
					/**
					 * Defines if and on which level variants can be configured:
					 * 		None: no variant configuration at all
					 * 		Page: one variant configuration for the whole page
					 * 		Control: variant configuration on control level
					 */

					/**
					 * Define different Page views to display
					 */
					views: {
						type: "object"
					}
				},
				library: "sap.fe.templates",
				manifest: "json"
			}
		});
		return ListReportComponent;
	},
	/* bExport= */ true
);
