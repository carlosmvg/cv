/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[],
	function() {
		"use strict";
		var FEHelper = {
			getTargetCollection: function(oContext) {
				var sPath = oContext.getPath();
				if (
					oContext.getObject("$kind") === "EntitySet" ||
					oContext.getObject("$kind") === "Action" ||
					oContext.getObject("0/$kind") === "Action"
				) {
					return sPath;
				}
				sPath =
					"/" +
					sPath
						.split("/")
						.filter(Boolean)
						.join("/$NavigationPropertyBinding/");
				return "/" + oContext.getObject(sPath);
			}
		};
		return FEHelper;
	},
	/* bExport= */ true
);
