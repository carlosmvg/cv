/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// Provides ControllerMetadata
sap.ui.define(["sap/ui/base/Metadata", "sap/base/util/merge", "sap/ui/core/mvc/ControllerMetadata"], function(
	Metadata,
	merge,
	ControllerMetadata
) {
	"use strict";

	/**
	 * Dedicated metadata for the FE controller extensions.
	 *
	 * @alias sap.fe.core.controllerextensions.ControllerExtensionMetadata
	 * @extends sap.ui.core.mvc.ControllerMetadata
	 * @param {string} sClassName the target class name
	 * @param {object} oClassInfo the content of the class definition
	 * @private
	 */
	var ControllerExtensionMetadata = function(sClassName, oClassInfo) {
		// call super constructor
		ControllerMetadata.apply(this, arguments);

		// propagate static functions to subclasses of ControllerExtension
		if (this.isA("sap.ui.core.mvc.ControllerExtension") && this.getParent().getClass().override) {
			this.getClass().override = this.getParent().getClass().override;
		}
	};

	// chain the prototypes
	ControllerExtensionMetadata.prototype = Object.create(ControllerMetadata.prototype);
	ControllerExtensionMetadata.prototype.constructor = ControllerExtensionMetadata;
	/**
	 * Called after new settings have been applied.
	 *
	 * Typically, this method is used to do some cleanup (e.g. uniqueness)
	 * or to calculate an optimized version of some data.
	 *
	 * @private
	 */
	ControllerExtensionMetadata.prototype.afterApplySettings = function() {
		Metadata.prototype.afterApplySettings.call(this);
		if (this._oParent) {
			var mParentMethods = this._oParent._mMethods ? this._oParent._mMethods : {};
			//allow change of visibility but not the other attributes
			for (var sMethod in mParentMethods) {
				if (this._mMethods[sMethod]) {
					var bPublic = this._mMethods[sMethod].public;
					//copy parent method definition as final/overrideExecution should not be overridden
					this._mMethods[sMethod] = merge({}, mParentMethods[sMethod]);
					if (bPublic !== undefined) {
						this._mMethods[sMethod].public = bPublic;
					}
					if (!this.isMethodPublic(sMethod) && this._mMethods[sMethod].public !== mParentMethods[sMethod].public) {
						//if visibility changed to private delete from public methods
						this._aAllPublicMethods.splice(this._aAllPublicMethods.indexOf(sMethod), 1);
					}
				} else {
					this._mMethods[sMethod] = mParentMethods[sMethod];
				}
			}
		}

		//flag each extension as final (but not the class ControllerExtension itself)
		if (this._oParent && this._oParent.isA("sap.ui.core.mvc.ControllerExtension")) {
			this._bFinal = true;
		}
	};

	return ControllerExtensionMetadata;
});
