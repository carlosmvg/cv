sap.ui.define(["./BaseAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(
	BaseAPI,
	Utils,
	OpaBuilder,
	FEBuilder
) {
	"use strict";
	/**
	 * Constructor.
	 *
	 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder the FEBuilder builder instance to operate on
	 * @param {string} [vFormDescription] the Form description (optional), used to log message
	 * @returns {sap.fe.test.api.FormAPI} the instance
	 * @class
	 * @private
	 */
	var FormAPI = function(oFormBuilder, vFormDescription) {
		if (!Utils.isOfType(oFormBuilder, FEBuilder)) {
			throw new Error("oFormBuilder parameter must be a FEBuilder instance");
		}
		return BaseAPI.call(this, oFormBuilder, vFormDescription);
	};
	FormAPI.prototype = Object.create(BaseAPI.prototype);
	FormAPI.prototype.constructor = FormAPI;
	return FormAPI;
});
