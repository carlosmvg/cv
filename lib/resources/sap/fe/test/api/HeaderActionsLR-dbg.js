sap.ui.define(
	["./HeaderLR", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "./ShareUtilsHelper"],
	function(HeaderLR, Utils, OpaBuilder, FEBuilder, ShareUtilsHelper) {
		"use strict";

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder the FEBuilder instance to operate on
		 * @param {string} [vHeaderDescription] the Header description (optional), used to log message
		 * @returns {sap.fe.test.api.HeaderActions} the instance
		 * @class
		 * @private
		 */
		var HeaderActionsLR = function(oHeaderBuilder, vHeaderDescription) {
			return HeaderLR.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderActionsLR.prototype = Object.create(HeaderLR.prototype);
		HeaderActionsLR.prototype.constructor = HeaderActionsLR;
		HeaderActionsLR.prototype.isAction = true;

		/**
		 * Execute a header toolbar action. The action is identified either by id or by a string representing
		 * the label of the action.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] the action identifier or its label
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderActionsLR.prototype.iExecuteAction = function(vActionIdentifier) {
			var aArguments = Utils.parseArguments([[Object, String]], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Executing custom header action '{0}'", aArguments[0]))
					.execute()
			);
		};

		/**
		 * Execute the <code>Save as Tile</code> action.
		 *
		 * @param {string} sBookmarkTitle the title of the new tile
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderActionsLR.prototype.iExecuteSaveAsTile = function(sBookmarkTitle) {
			var sShareId = "fe::Share",
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(ShareUtilsHelper.createSaveAsTileExecutorBuilder(sBookmarkTitle))
					.execute()
			);
		};

		/**
		 * Execute the Send E-Mail action.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderActionsLR.prototype.iExecuteSendEmail = function() {
			var sShareId = "fe::Share",
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sPageId);

			return this.prepareResult(
				oOverflowToolbarBuilder
					.doOnContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sShareId))), OpaBuilder.Actions.press())
					.description(Utils.formatMessage("Pressing header '{0}' Share button", this.getIdentifier()))
					.success(ShareUtilsHelper.createSendEmailExecutorBuilder())
					.execute()
			);
		};

		return HeaderActionsLR;
	}
);
