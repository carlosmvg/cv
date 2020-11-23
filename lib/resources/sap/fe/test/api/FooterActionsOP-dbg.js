sap.ui.define(["./FooterActionsBase", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(
	FooterActionsBase,
	Utils,
	OpaBuilder,
	FEBuilder
) {
	"use strict";

	/**
	 * Constructor.
	 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder the OverflowToolbarBuilder instance to operate on
	 * @param {string} [vFooterDescription] the footer description (optional), used to log message
	 * @returns {sap.fe.test.api.FooterActionsOP} the instance
	 * @class
	 * @private
	 */
	var FooterActionsOP = function(oOverflowToolbarBuilder, vFooterDescription) {
		return FooterActionsBase.call(this, oOverflowToolbarBuilder, vFooterDescription);
	};
	FooterActionsOP.prototype = Object.create(FooterActionsBase.prototype);
	FooterActionsOP.prototype.constructor = FooterActionsOP;
	FooterActionsOP.prototype.isAction = true;

	/**
	 * Execute the Save action in the ObjectPage footer bar.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterActionsOP.prototype.iExecuteSave = function() {
		var oOverflowToolbarBuilder = this.getBuilder(),
			sSaveId = "fe::FooterBar::StandardAction::Save";

		return this.prepareResult(
			oOverflowToolbarBuilder
				.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sSaveId))), OpaBuilder.Actions.press())
				.description("Pressing save action on footer bar")
				.execute()
		);
	};

	/**
	 * Execute the Apply action in the Sub-ObjectPage footer bar.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterActionsOP.prototype.iExecuteApply = function() {
		var oOverflowToolbarBuilder = this.getBuilder();

		return this.prepareResult(
			oOverflowToolbarBuilder
				.doOnContent(
					OpaBuilder.Matchers.resourceBundle("text", "sap.fe.templates", "T_COMMON_OBJECT_PAGE_APPLY_DRAFT"),
					OpaBuilder.Actions.press()
				)
				.description("Pressing apply action on footer bar")
				.execute()
		);
	};

	/**
	 * Execute the Cancel action in the ObjectPage footer bar.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterActionsOP.prototype.iExecuteCancel = function() {
		var oOverflowToolbarBuilder = this.getBuilder(),
			sSaveId = "fe::FooterBar::StandardAction::Cancel";

		return this.prepareResult(
			oOverflowToolbarBuilder
				.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sSaveId))), OpaBuilder.Actions.press())
				.description("Pressing cancel action on footer bar")
				.execute()
		);
	};

	/**
	 * Confirm the Cancel action after pressing draft cancel.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FooterActionsOP.prototype.iConfirmCancel = function() {
		return this.prepareResult(
			OpaBuilder.create(this)
				.hasType("sap.m.Popover")
				.isDialogElement()
				.doOnChildren(
					OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),
					OpaBuilder.Actions.press()
				)
				.description("Confirming discard changes")
				.execute()
		);
	};

	return FooterActionsOP;
});
