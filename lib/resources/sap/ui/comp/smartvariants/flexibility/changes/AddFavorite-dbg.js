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
	 * Change handler for adding the favorite flag to the variant.
	 *
	 * @constructor
	 * @private
	 * @since 1.50.0
	 * @alias sap.ui.comp.smartvariants.flexibility.changes.AddFavorite
	 */
	var AddFavorite = {};


	AddFavorite.applyChange = function(oChange, oVariantManagement, mPropertyBag) {
		var oChangeContent = oChange.getContent();
		if (!oChangeContent) {
			Log.error("Change does not contain sufficient information to be applied");
			return;
		}
		var oModifier = mPropertyBag.modifier;

		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));
		if (!mPersoInfo.addFavorites) {
			mPersoInfo.addFavorites = {};
		}

		if (oVariantManagement.setStandardFavorite) {

			if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {

				oChange.setRevertData({
					key: oChangeContent.key,
					visible: oVariantManagement.getStandardFavorite()
				});

				oVariantManagement.setStandardFavorite(oChangeContent.visible);

			} else {
				var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
				if (oItem) {

					oChange.setRevertData({
						key: oChangeContent.key,
						visible: oItem.getFavorite()
					});

					oItem.setFavorite(oChangeContent.visible);
				}
			}
		} else {
			if (mPersoInfo.addFavorites.hasOwnProperty(oChangeContent.key)) {
				oChange.setRevertData({
					key: oChangeContent.key,
					visible: mPersoInfo.addFavorites[oChangeContent.key]
				});
			}
		}

		mPersoInfo.addFavorites[oChangeContent.key] = oChangeContent.visible;
		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);
	};


	AddFavorite.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		if (!oSpecificChangeInfo.hasOwnProperty("content")) {
			throw new Error("oSpecificChangeInfo.content should be filled");
		}
		if (!oSpecificChangeInfo.content.hasOwnProperty("key")) {
			throw new Error("In oSpecificChangeInfo.content.key attribute is required");
		}
		if (!oSpecificChangeInfo.content.hasOwnProperty("visible")) {
			throw new Error("In oSpecificChangeInfo.content.visible attribute  attribute is required");
		}
	};

	AddFavorite.revertChange = function(oChange, oVariantManagement, mPropertyBag) {

		var oModifier = mPropertyBag.modifier;
		var mPersoInfo = merge({}, oModifier.getProperty(oVariantManagement, "adaptationInfo"));

		var oChangeContent = oChange.getRevertData();
		if (oChangeContent) {

			if (oVariantManagement.setStandardFavorite) {
				if (oChangeContent.key === oVariantManagement.STANDARDVARIANTKEY) {
					oVariantManagement.setStandardFavorite(oChangeContent.visible);
				} else {
					var oItem = oVariantManagement.getItemByKey(oChangeContent.key);
					if (oItem) {
						oItem.setFavorite(oChangeContent.visible);
					}
				}
			}

			oChange.resetRevertData();

			mPersoInfo.addFavorites[oChangeContent.key] = oChangeContent.visible;
		} else {
			oChangeContent = oChange.getContent();
			if (mPersoInfo.addFavorites && mPersoInfo.addFavorites.hasOwnProperty(oChangeContent.key)) {
				delete mPersoInfo.addFavorites[oChangeContent.key];
			}
		}

		oModifier.setProperty(oVariantManagement, "adaptationInfo", mPersoInfo);

	};

	return AddFavorite;
},
/* bExport= */true);