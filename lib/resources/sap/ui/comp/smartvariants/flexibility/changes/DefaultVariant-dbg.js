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
	 * Change handler for handling the defaultDefaultVariant change on variants.
	 *
	 * @constructor
	 * @private
	 * @since 1.81
	 * @alias sap.ui.comp.smartvariants.flexibility.changes.DefaultVariant
	 */
	var DefaultVariant = {};


	DefaultVariant.applyChange = function(oChange, oVariantManagement, mPropertyBag) {
		var oChangeContent = oChange.getContent();
		if (!oChangeContent) {
			Log.error("Change does not contain sufficient information to be applied");
			return;
		}

		var oModifier = mPropertyBag.modifier;
		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));


		if (oVariantManagement.getDefaultVariantKey) {
			oChange.setRevertData({
				key: oVariantManagement.getDefaultVariantKey()
			});

			if (oVariantManagement.getItemByKey) {
				var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
				if (oItem) {
					oVariantManagement.setDefaultVariantKey(oItem.getKey());
				} else if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {
					oVariantManagement.setDefaultVariantKey(oChangeContent.key);
				}
			}
		}


		mPersoInfo.defaultVariant = oChangeContent.key;
		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);
	};


	DefaultVariant.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		if (!oSpecificChangeInfo.hasOwnProperty("content")) {
			throw new Error("oSpecificChangeInfo.content should be filled");
		}
		if (!oSpecificChangeInfo.content.hasOwnProperty("key")) {
			throw new Error("In oSpecificChangeInfo.content.key attribute is required");
		}
	};

	DefaultVariant.revertChange = function(oChange, oVariantManagement, mPropertyBag) {

		var oModifier = mPropertyBag.modifier;
		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));

		var oChangeContent = oChange.getRevertData();
		if (oChangeContent) {

			if (oVariantManagement.setDefaultVariantKey) {
				var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
				if (oItem) {
					oVariantManagement.setDefaultVariantKey(oItem.getKey());
				} else if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {
					oVariantManagement.setDefaultVariantKey(oChangeContent.key);
				}
			}

			mPersoInfo.defaultVariant = oChangeContent.key;
			oChange.resetRevertData();

		} else {

			if (mPersoInfo.defaultVariant) {
				delete mPersoInfo.defaultVariant;
			}
		}

		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);
	};

	return DefaultVariant;
},
/* bExport= */true);