/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

// Provides the Design Time Metadata for the sap.ui.comp.smartvariants.SmartVariantManagement control.
sap.ui.define([], function() {
	"use strict";
	return {
		actions: {
			settings: function () {
					return {
						name: "VARIANT_MANAGEMENT_MANAGEDIALOG",
						handler: function(oControl, mPropertyBag) {
							return new Promise(function (resolve, reject) {
								if (oControl.isA("sap.ui.comp.smartvariants.SmartVariantManagement")) {
									if (!oControl.getShowShare()) {
										reject("share not enabled");
										return;
									}
									var fCallBack = function(aData) {
										resolve(aData);
									};
									oControl.openManageViewsDialogForKeyUser(mPropertyBag.styleClass, fCallBack);
								} else {
									reject("wrong conrol type");
								}
							});
						}
					};
				}

		},
		aggregations: {
			personalizableControls: {
				propagateMetadata : function () {
					return {
						actions: "not-adaptable"
					};
				}
			}
		},
		annotations: {},
		properties: {
			persistencyKey: {
				ignore: true
			},
			entitySet: {
				ignore: true
			},
			adaptationInfo: {
				ignore: true
			}
		},
		customData: {}
	};
});
