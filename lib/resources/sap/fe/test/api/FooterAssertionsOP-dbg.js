sap.ui.define(
	["./FooterAssertionsBase", "sap/fe/test/Utils", "sap/m/library", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"],
	function(FooterAssertionsBase, Utils, mLibrary, OpaBuilder, FEBuilder) {
		"use strict";

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.OverflowToolbarBuilder} oOverflowToolbarBuilder the OverflowToolbarBuilder instance to operate on
		 * @param {string} [vFooterDescription] the footer description (optional), used to log message
		 * @returns {sap.fe.test.api.FooterAssertionsOP} the instance
		 * @class
		 * @private
		 */
		var FooterAssertionsOP = function(oOverflowToolbarBuilder, vFooterDescription) {
			return FooterAssertionsBase.call(this, oOverflowToolbarBuilder, vFooterDescription);
		};
		FooterAssertionsOP.prototype = Object.create(FooterAssertionsBase.prototype);
		FooterAssertionsOP.prototype.constructor = FooterAssertionsOP;
		FooterAssertionsOP.prototype.isAction = false;

		var DraftIndicatorState = mLibrary.DraftIndicatorState;

		function _checkDraftState(oOverflowToolbarBuilder, sState) {
			return oOverflowToolbarBuilder
				.hasContent(function(oObject) {
					return oObject.getMetadata().getName() === "sap.m.DraftIndicator" && oObject.getState() === sState;
				})
				.description("Draft Indicator on footer bar is in " + sState + " state")
				.execute();
		}

		/**
		 * Checks the state of the footer action Apply.
		 *
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
		FooterAssertionsOP.prototype.iCheckApply = function(mState) {
			var oOverflowToolbarBuilder = this.getBuilder();

			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(OpaBuilder.Matchers.resourceBundle("text", "sap.fe.templates", "T_COMMON_OBJECT_PAGE_APPLY_DRAFT"), mState)
					.description(Utils.formatMessage("Checking footer action Apply with state='{0}'", mState))
					.execute()
			);
		};

		/**
		 * Checks for draft state 'Clear'.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		FooterAssertionsOP.prototype.iCheckDraftStateClear = function() {
			return this.prepareResult(_checkDraftState(this.getBuilder(), DraftIndicatorState.Clear));
		};

		/**
		 * Checks for draft state 'Saved'.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		FooterAssertionsOP.prototype.iCheckDraftStateSaved = function() {
			return this.prepareResult(_checkDraftState(this.getBuilder(), DraftIndicatorState.Saved));
		};

		return FooterAssertionsOP;
	}
);
