sap.ui.define(["./FooterAPI", "sap/fe/test/Utils", "sap/m/library", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(
	FooterAPI,
	Utils,
	mLibrary,
	OpaBuilder,
	FEBuilder
) {
	"use strict";

	/**
	 * Constructor.
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder the OverflowToolbarBuilder instance to operate on
	 * @param {string} [vFooterDescription] the footer description (optional), used to log message
	 * @returns {sap.fe.test.api.FooterAssertionsBase} the instance
	 * @class
	 * @private
	 */
	var FooterAssertionsBase = function(oOverflowToolbarBuilder, vFooterDescription) {
		return FooterAPI.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterAssertionsBase.prototype = Object.create(FooterAPI.prototype);
	FooterAssertionsBase.prototype.constructor = FooterAssertionsBase;
	FooterAssertionsBase.prototype.isAction = false;

	/**
	 * Checks the state of footer actions. The action is identified either by id or by a string representing
	 * the label of the action.
	 *
	 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] the action identifier or its label
	 * @param {object} [mState] available action states are:
	 * <code><pre>
	 * 	{
	 * 		visible: true|false,
	 * 		enabled: true|false
	 * 	}
	 * </pre></code>
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterAssertionsBase.prototype.iCheckAction = function(vActionIdentifier, mState) {
		var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
			oOverflowToolbarBuilder = this.getBuilder();

		return this.prepareResult(
			oOverflowToolbarBuilder
				.hasContent(this.createActionMatcher(vActionIdentifier), mState)
				.description(Utils.formatMessage("Checking footer action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
				.execute()
		);
	};

	/**
	 * Checks the state of footer bar.
	 *
	 * @param {object} [mState] available state is:
	 * <code><pre>
	 * 	{
	 * 		visible: true|false
	 * 	}
	 * </pre></code>
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterAssertionsBase.prototype.iCheckState = function(mState) {
		var oOverflowToolbarBuilder = this.getBuilder();
		return this.prepareResult(
			oOverflowToolbarBuilder
				.hasState(mState)
				.description(Utils.formatMessage("Checking footer with state='{0}'", mState))
				.execute()
		);
	};

	return FooterAssertionsBase;
});
