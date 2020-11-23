sap.ui.define(
	[
		"./BaseAPI",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/DialogBuilder",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/actions/Action"
	],
	function(BaseAPI, Utils, FEBuilder, TableBuilder, DialogBuilder, OpaBuilder, Action) {
		"use strict";

		/**
		 * A column identifier
		 *
		 * @typedef {object} ColumnIdentifier
		 * @property {string} name the technical name of the column
		 *
		 * @name sap.fe.test.api.ColumnIdentifier
		 * @private
		 */

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.TableBuilder} oTableBuilder the table builder instance to operate on
		 * @param {string} [vTableDescription] the table description (optional), used to log message
		 * @returns {sap.fe.test.api.TableAPI} the instance
		 * @class
		 * @private
		 */
		var TableAPI = function(oTableBuilder, vTableDescription) {
			if (!Utils.isOfType(oTableBuilder, TableBuilder)) {
				throw new Error("oTableBuilder parameter must be an TableBuilder instance");
			}
			return BaseAPI.call(this, oTableBuilder, vTableDescription);
		};
		TableAPI.prototype = Object.create(BaseAPI.prototype);
		TableAPI.prototype.constructor = TableAPI;

		TableAPI.prototype.createRowMatchers = function(mRowValues, mRowState, vAdditionalMatchers) {
			var aArguments = Utils.parseArguments([Object, Object, [Array, Function]], arguments),
				aRowMatchers = [];
			if (Utils.isOfType(aArguments[0], Object)) {
				aRowMatchers.push(TableBuilder.Row.Matchers.cellValues(aArguments[0]));
			}
			if (Utils.isOfType(aArguments[1], Object)) {
				aRowMatchers.push(TableBuilder.Row.Matchers.states(aArguments[1]));
			}
			if (!Utils.isOfType(aArguments[2], [null, undefined])) {
				aRowMatchers = aRowMatchers.concat(aArguments[2]);
			}
			return aRowMatchers;
		};

		/**
		 * Opens the column adaptation dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iOpenColumnAdaptation = function() {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenColumnAdaptation()
					.description(
						Utils.formatMessage("Opening the column adaptation dialog for '{0}' (if not open yet)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Closes the column adaptation dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iConfirmColumnAdaptation = function() {
			return this.prepareResult(
				TableBuilder.createAdaptationDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(
						Utils.formatMessage("Closing the column adaptation dialog for '{0}' (if currently open)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Opens the column sorting dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iOpenColumnSorting = function() {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenColumnSorting()
					.description(Utils.formatMessage("Opening the column sorting dialog for '{0}' (if not open yet)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Closes the column sorting dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iConfirmColumnSorting = function() {
			return this.prepareResult(
				TableBuilder.createSortingDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(
						Utils.formatMessage("Closing the column sorting dialog for '{0}' (if currently open)", this.getIdentifier())
					)
					.execute()
			);
		};

		/**
		 * Opens the table filtering personalization dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iOpenFilterDialog = function() {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doOpenFilterDialog()
					.description(Utils.formatMessage("Opening the filter dialog for '{0}' (if not open yet)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Closes the filter personalization dialog.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		TableAPI.prototype.iConfirmFilterDialog = function() {
			return this.prepareResult(
				TableBuilder.createFilteringDialogBuilder(this.getOpaInstance())
					.doPressFooterButton(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "p13nDialog.OK"))
					.description(Utils.formatMessage("Closing the filter dialog for '{0}' (if currently open)", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Helper method to personalize table. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the field identifier
		 * @param {object} [mState] the state of the personalization field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		selected: true|false
		 * 	}
		 * </pre></code>
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] actions to be executed on found field
		 * @param {string} sDescription the description of the check or adaptation
		 * @param {sap.ui.test.OpaBuilder} oDialogBuilder dialog builder
		 * @param {Function} fnOpenDialog callback for opening the dialog
		 * @param {Function} fnCloseDialog callback  for closing the dialog
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @sap-restricted
		 */
		TableAPI.prototype.personalization = function(
			vColumnIdentifier,
			mState,
			vActions,
			sDescription,
			oDialogBuilder,
			fnOpenDialog,
			fnCloseDialog
		) {
			var aArguments = Utils.parseArguments(
					[[String, Object], Object, [Function, Array, Action], String, OpaBuilder, Function, Function],
					arguments
				),
				oBuilder = FEBuilder.create(this.getOpaInstance()),
				bDialogOpen,
				oAdaptColumnBuilder = FEBuilder.create(this.getOpaInstance())
					.hasType("sap.m.ColumnListItem")
					.isDialogElement();

			oDialogBuilder = aArguments[4];
			fnOpenDialog = aArguments[5];
			fnCloseDialog = aArguments[6];

			vColumnIdentifier = aArguments[0];
			if (Utils.isOfType(vColumnIdentifier, String)) {
				// oAdaptColumnBuilder.has(OpaBuilder.Matchers.bindingProperties(undefined, { label: vColumnIdentifier }));
				oAdaptColumnBuilder.hasSome(
					OpaBuilder.Matchers.bindingProperties(undefined, { label: vColumnIdentifier }),
					OpaBuilder.Matchers.bindingProperties(undefined, { name: vColumnIdentifier })
				);
			} else {
				oAdaptColumnBuilder.has(
					OpaBuilder.Matchers.bindingProperties(undefined, {
						name: vColumnIdentifier.name
					})
				);
			}

			mState = aArguments[1];
			if (!Utils.isOfType(mState, [null, undefined])) {
				oAdaptColumnBuilder.hasState(mState);
			}

			vActions = aArguments[2];
			if (!Utils.isOfType(vActions, [null, undefined])) {
				oDialogBuilder.do(vActions);
			}

			sDescription = aArguments[3];
			return this.prepareResult(
				oBuilder
					.success(function() {
						bDialogOpen = FEBuilder.controlsExist(oDialogBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oDialogBuilder.success(fnCloseDialog);
						}
						return oDialogBuilder
							.has(OpaBuilder.Matchers.children(oAdaptColumnBuilder))
							.has(FEBuilder.Matchers.atIndex(0))
							.checkNumberOfMatches(1)
							.description(sDescription)
							.execute();
					})
					.execute()
			);
		};

		/**
		 * Helper method to adapt columns fields. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open adaptation dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the field identifier
		 * @param {object} [mState] the state of the adaptation field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		selected: true|false
		 * 	}
		 * </pre></code>
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] actions to be executed on found adaptation field
		 * @param {string} sDescription the description of the check or adaptation
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @sap-restricted
		 */
		TableAPI.prototype.columnAdaptation = function(vColumnIdentifier, mState, vActions, sDescription) {
			return this.personalization(
				vColumnIdentifier,
				mState,
				vActions,
				sDescription,
				TableBuilder.createAdaptationDialogBuilder(this.getOpaInstance()),
				this.iOpenColumnAdaptation.bind(this),
				this.iConfirmColumnAdaptation.bind(this)
			);
		};

		/**
		 * Helper method to sort columns fields. If no actions are given, this function can be used for checking only.
		 * During execution it checks for an already open sorting dialog. If it does not exist, it is opened before
		 * the check/interaction of the columns, and closed/confirmed directly afterwards.
		 *
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the field identifier
		 * @param {object} [mState] the state of the adaptation field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		selected: true|false,
		 * 		sortOrder: "Ascending"|"Descending"|"None"
		 * 	}
		 * </pre></code>
		 * @param {Function|Array|sap.ui.test.actions.Action} [vActions] actions to be executed on found adaptation field
		 * @param {string} sDescription the description of the check or adaptation
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @sap-restricted
		 */
		TableAPI.prototype.columnSorting = function(vColumnIdentifier, mState, vActions, sDescription) {
			return this.personalization(
				vColumnIdentifier,
				mState,
				vActions,
				sDescription,
				TableBuilder.createSortingDialogBuilder(this.getOpaInstance()),
				this.iOpenColumnSorting.bind(this),
				this.iConfirmColumnSorting.bind(this)
			);
		};

		return TableAPI;
	}
);
