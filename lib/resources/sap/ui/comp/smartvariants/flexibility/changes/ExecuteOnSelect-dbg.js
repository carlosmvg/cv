/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'sap/base/util/merge',
	"sap/base/Log"
], function(merge, Log) {
	"use strict";

	/**
	 * Change handler for handling the execute on select on variants.
	 *
	 * @constructor
	 * @private
	 * @since 1.81
	 * @alias sap.ui.comp.smartvariants.flexibility.changes.ExecuteOnSelect
	 */
	var ExecuteOnSelect = {};


	ExecuteOnSelect.applyChange = function(oChange, oVariantManagement, mPropertyBag) {
		var oChangeContent = oChange.getContent();
		if (!oChangeContent) {
			Log.error("Change does not contain sufficient information to be applied");
			return;
		}

		var oModifier = mPropertyBag.modifier;
		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));
		if (!mPersoInfo.executeOnSelect) {
			mPersoInfo.executeOnSelect = {};
		}

		if (oVariantManagement.getExecuteOnSelectForStandardVariant) {
			var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
			if (oItem) {
				oChange.setRevertData({
					key: oItem.getKey(),
					selected: oItem.getExecuteOnSelection()
				});
				oItem.setExecuteOnSelection(oChangeContent.selected);
			} else if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {

				oChange.setRevertData({
					key: oItem.getKey(),
					selected: oVariantManagement.getExecuteOnSelectForStandardVariant()
				});

				oVariantManagement.setExecuteOnSelectForStandardVariant(oChangeContent.selected);
			}

		} else {
			if (mPersoInfo.executeOnSelect.hasOwnProperty(oChangeContent.key)) {
				oChange.setRevertData({
					key: oChangeContent.key,
					selected: mPersoInfo.executeOnSelect[oChangeContent.key]
				});
			}
		}

		mPersoInfo.executeOnSelect[oChangeContent.key] = oChangeContent.selected;
		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);
	};


	ExecuteOnSelect.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		if (!oSpecificChangeInfo.content) {
			throw new Error("oSpecificChangeInfo.content should be filled");
		}
		if (!oSpecificChangeInfo.content.hasOwnProperty("key")) {
			throw new Error("In oSpecificChangeInfo.content.key attribute is required");
		}
		if (!oSpecificChangeInfo.content.hasOwnProperty("selected")) {
			throw new Error("In oSpecificChangeInfo.content.selected attribute is required");
		}

	};

	ExecuteOnSelect.revertChange = function(oChange, oVariantManagement, mPropertyBag) {

		var oModifier = mPropertyBag.modifier;
		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));

		var oChangeContent = oChange.getRevertData();
		if (oChangeContent) {

			if (oVariantManagement.setExecuteOnSelectForStandardVariant) {
				var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
				if (oItem) {
					oItem.setExecuteOnSelection(oChangeContent.selected);
				} else if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {
					oVariantManagement.setExecuteOnSelectForStandardVariant(oChangeContent.selected);
				}
			}

			oChange.resetRevertData();

			mPersoInfo.executeOnSelect[oChangeContent.key] = oChangeContent.selected;
		} else {
			oChangeContent = oChange.getContent();
			if (mPersoInfo.executeOnSelect && mPersoInfo.executeOnSelect.hasOwnProperty(oChangeContent.key)) {
				delete mPersoInfo.executeOnSelect[oChangeContent.key];
			}

		}

		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);
	};

	return ExecuteOnSelect;
},
/* bExport= */true);