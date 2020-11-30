/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// Provides the Design Time Metadata for the sap.fe.templates.ObjectPage.controls.StashableVBox control
sap.ui.define([], function() {
	"use strict";
	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates");
	return {
		actions: {
			remove: {
				changeType: "stashControl"
			},
			reveal: {
				changeType: "unstashControl"
			}
		},
		name: {
			singular: function() {
				return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD");
			},
			plural: function() {
				return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD_PLURAL");
			}
		},
		palette: {
			group: "LAYOUT",
			icons: {
				svg: "sap/m/designtime/VBox.icon.svg"
			}
		},
		templates: {
			create: "sap/m/designtime/VBox.create.fragment.xml"
		}
	};
});
