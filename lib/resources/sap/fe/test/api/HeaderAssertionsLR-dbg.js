sap.ui.define(
	[
		"./HeaderLR",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"./ShareUtilsHelper"
	],
	function(HeaderLR, Utils, OpaBuilder, FEBuilder, FieldBuilder, ShareUtilsHelper) {
		"use strict";

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder the FEBuilder instance to operate on
		 * @param {string} [vHeaderDescription] the header description (optional), used to log message
		 * @returns {sap.fe.test.api.HeaderAssertions} the instance
		 * @class
		 * @private
		 */
		var HeaderAssertionsLR = function(oHeaderBuilder, vHeaderDescription) {
			return HeaderLR.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAssertionsLR.prototype = Object.create(HeaderLR.prototype);
		HeaderAssertionsLR.prototype.constructor = HeaderAssertionsLR;
		HeaderAssertionsLR.prototype.isAction = false;

		/**
		 * Checks the state of header toolbar actions. The action is identified either by id or by a string representing
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
		HeaderAssertionsLR.prototype.iCheckAction = function(vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(this.createActionMatcher(vActionIdentifier), mState)
					.description(Utils.formatMessage("Checking custom header action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the state of the Save as Tile action.
		 *
		 * @param {object} [mState] the state of the action. Available states are
		 * <code><pre>
		 * 	{
		 * 		enabled: true|false,
		 * 		visible: true|false
		 * 	}
		 * </pre></code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertionsLR.prototype.iCheckSaveAsTile = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				sShareId = "fe::Share";

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(ShareUtilsHelper.createSaveAsTileCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		/**
		 * Checks the state of the Send Email action.
		 *
		 * @param {object} [mState] the state of the action. Available states are
		 * <code><pre>
		 * 	{
		 * 		enabled: true|false,
		 * 		visible: true|false
		 * 	}
		 * </pre></code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertionsLR.prototype.iCheckSendEmail = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId),
				sShareId = "fe::Share";

			if (mState && mState.visible === false) {
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), mState)
					.description(Utils.formatMessage("Checking header '{0}' Share button with state='{1}'", this.getIdentifier(), mState));
			} else {
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(ShareUtilsHelper.createSendEmailCheckBuilder(mState));
			}

			return this.prepareResult(oOverflowToolbarBuilder.execute());
		};

		return HeaderAssertionsLR;
	}
);
