sap.ui.define(["./FooterAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(
	FooterAPI,
	Utils,
	OpaBuilder,
	FEBuilder
) {
	"use strict";

	/**
	 * Constructor.
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder the OverflowToolbarBuilder instance to operate on
	 * @param {string} [vFooterDescription] the footer description (optional), used to log message
	 * @returns {sap.fe.test.api.FooterActionsBase} the instance
	 * @class
	 * @private
	 */
	var FooterActionsBase = function(oOverflowToolbarBuilder, vFooterDescription) {
		return FooterAPI.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterActionsBase.prototype = Object.create(FooterAPI.prototype);
	FooterActionsBase.prototype.constructor = FooterActionsBase;
	FooterActionsBase.prototype.isAction = true;

	/**
	 * Execute a footer action. The action is identified either by id or by a string representing
	 * the label of the action.
	 *
	 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] the action identifier or its label
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterActionsBase.prototype.iExecuteAction = function(vActionIdentifier) {
		var aArguments = Utils.parseArguments([[Object, String]], arguments),
			oOverflowToolbarBuilder = this.getBuilder();

		return this.prepareResult(
			oOverflowToolbarBuilder
				.doOnContent(this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
				.description(Utils.formatMessage("Executing footer action '{0}'", aArguments[0]))
				.execute()
		);
	};

	return FooterActionsBase;
});
