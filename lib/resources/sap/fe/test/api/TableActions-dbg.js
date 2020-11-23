sap.ui.define(
	[
		"./TableAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/ui/test/matchers/Interactable",
		"sap/fe/test/builder/VMBuilder",
		"sap/ui/core/SortOrder",
		"sap/ui/core/Core",
		"sap/fe/test/builder/MdcFilterFieldBuilder"
	],
	function(TableAPI, Utils, OpaBuilder, FEBuilder, Interactable, VMBuilder, SortOrder, Core, FilterFieldBuilder) {
		"use strict";

		/**
		 * Constructor.
		 * @param {sap.fe.test.builder.TableBuilder} oBuilderInstance the table builder instance to operate on
		 * @param {string} [vTableDescription] the table description (optional), used to log message
		 * @returns {sap.fe.test.api.TableActions} the instance
		 * @class
		 * @private
		 */
		var Actions = function(oBuilderInstance, vTableDescription) {
			return TableAPI.call(this, oBuilderInstance, vTableDescription);
		};
		Actions.prototype = Object.create(TableAPI.prototype);
		Actions.prototype.constructor = Actions;
		Actions.prototype.isAction = true;

		/**
		 * Press the specified column. The given value map must match exactly one row and column name should exist.
		 * @param {object} [mRowValues] a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @param {string | int} vColumn the column name or index
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iPressCell = function(mRowValues, vColumn) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doClickOnCell(this.createRowMatchers(mRowValues), vColumn)
					.description(
						Utils.formatMessage(
							"Pressing cell of table '{0}' with row value = '{1}' and column {2} = '{3}' ",
							this.getIdentifier(),
							mRowValues,
							isNaN(vColumn) ? "header" : "index",
							vColumn
						)
					)
					.execute()
			);
		};

		/**
		 * Selects the specified rows.
		 *
		 * @param {object} [mRowValues] a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @param {object} [mRowState] a map of states. Supported row states are
		 * <code><pre>
		 * 	{
		 * 		selected: true|false,
		 * 		focused: true|false
		 * 	}
		 * </pre></code>
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		Actions.prototype.iSelectRows = function(mRowValues, mRowState) {
			var aArguments = Utils.parseArguments([Object, Object], arguments),
				oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.doSelect(this.createRowMatchers(aArguments[0], aArguments[1]))
					.description(
						Utils.formatMessage(
							"Selecting rows of table '{0}' with values='{1}' and state='{2}'",
							this.getIdentifier(),
							aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Press the specified row. The given value map must match exactly one row.
		 *
		 * @param {object} [mRowValues] a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iPressRow = function(mRowValues) {
			var oTableBuilder = this.getBuilder();
			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doNavigate(this.createRowMatchers(mRowValues))
					.description(Utils.formatMessage("Pressing row of table '{0}' with values='{1}'", this.getIdentifier(), mRowValues))
					.execute()
			);
		};

		/**
		 * Changes the specified row. The given value map must match exactly one row. The target columns are independent of
		 * the once defined in the current value map, which is just used for identifying the row only.
		 * If only one parameter is provided, it must be the <code>mTargetValues</code> and <code>mRowValues</code> is considered undefined.
		 * If <code>mRowValues</code> are not defined, then the targetValues are inserted in the creationRow.
		 *
		 * @param {object} [mRowValues]  a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @param {object} mTargetValues a map of columns (either name or index) to its new value. The columns do not need to match the ones defined in <code>mRowValues</code>.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iChangeRow = function(mRowValues, mTargetValues) {
			var oTableBuilder = this.getBuilder(),
				bIsCreationRow = false;

			if (arguments.length === 1) {
				bIsCreationRow = true;
				mTargetValues = mRowValues;
			}

			if (!bIsCreationRow) {
				oTableBuilder.checkNumberOfMatches(1).doEditValues(this.createRowMatchers(mRowValues), mTargetValues);
			} else {
				oTableBuilder.checkNumberOfMatches(1).doEditCreationRowValues(mTargetValues);
			}

			return this.prepareResult(
				oTableBuilder
					.description(
						Utils.formatMessage(
							"Changing row values of table '{0}' with old values='{1}' to new values='{2}'",
							this.getIdentifier(),
							bIsCreationRow ? "<CreationRow>" : mRowValues,
							mTargetValues
						)
					)
					.execute()
			);
		};

		/**
		 * Executes a table actions. The action is identified either by id or by a string representing
		 * the label of the action.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} [vActionIdentifier] the action identifier or its label
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		Actions.prototype.iExecuteAction = function(vActionIdentifier) {
			var aArguments = Utils.parseArguments([[Object, String]], arguments),
				oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(this.createActionMatcher(vActionIdentifier))
					.description(Utils.formatMessage("Executing table action '{0}'", aArguments[0]))
					.execute()
			);
		};

		/**
		 * Execute the table delete action.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		Actions.prototype.iExecuteDelete = function() {
			var oTableBuilder = this.getBuilder(),
				sDeleteId = "::StandardAction::Delete";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sDeleteId))))
					.description(Utils.formatMessage("Pressing delete action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Select Table QuickFilter Item. The QuickFilter item is identified either by a string representing
		 * the text of item or by object matching with key.
		 * If <code>vItemIdentifier</code>.
		 *
		 * @param {object | string} [vItemIdentifier] if passed as an object, the following pattern will be considered:
		 * <code><pre>
		 * 	{
		 * 		<annotationPath>: <name of the key>
		 *  }
		 * </pre></code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		Actions.prototype.iSelectQuickFilterItem = function(vItemIdentifier) {
			var oPropertyMatcher;
			if (Utils.isOfType(vItemIdentifier, String)) {
				oPropertyMatcher = { text: vItemIdentifier };
			} else if (Utils.isOfType(vItemIdentifier, Object)) {
				oPropertyMatcher = { key: vItemIdentifier.annotationPath };
			}
			return this.prepareResult(
				this.getBuilder()
					.doSelectQuickFilter(OpaBuilder.Matchers.properties(oPropertyMatcher))
					.description(
						Utils.formatMessage(
							"Selecting on table '{0}' quickFilter Item  with text '{1}'",
							this.getIdentifier(),
							vItemIdentifier
						)
					)
					.execute()
			);
		};

		/**
		 * Execute the table create action.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iExecuteCreate = function() {
			var oTableBuilder = this.getBuilder(),
				sCreateId = "::StandardAction::Create";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sCreateId))))
					.description(Utils.formatMessage("Pressing create action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Execute the table paste action.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iExecutePaste = function() {
			var oTableBuilder = this.getBuilder(),
				sPasteId = "::StandardAction::Paste";

			return this.prepareResult(
				oTableBuilder
					.doExecuteAction(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sPasteId))))
					.description(Utils.formatMessage("Pressing paste action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Execute the table inline create action.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iExecuteInlineCreate = function() {
			var oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.doOnChildren(
						OpaBuilder.create(this)
							.hasType("sap.ui.table.CreationRow")
							.has(FEBuilder.Matchers.bound())
							.checkNumberOfMatches(1)
							.doPress("applyBtn")
					)
					.description(Utils.formatMessage("Pressing inline create action of table '{0}'", this.getIdentifier()))
					.execute()
			);
		};

		/**
		 * Executes an inline action on table rows/columns. The given row value map must match exactly one row. To identify the action to be executed
		 * the column index or the label of the action button can be provided.
		 *
		 * @param {object} mRowValues a map of columns (either name or index) to its value, e.g. <code>{ 0: "Max", "Last Name": "Mustermann" }</code>
		 * @param {string | int} vColumn the column name or index
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iExecuteInlineAction = function(mRowValues, vColumn) {
			var aArguments = Utils.parseArguments([Object, [String, Number]], arguments),
				oTableBuilder = this.getBuilder();

			return this.prepareResult(
				oTableBuilder
					.checkNumberOfMatches(1)
					.doExecuteInlineAction(this.createRowMatchers(aArguments[0]), aArguments[1])
					.description(
						Utils.formatMessage(
							"Pressing inline action of table '{0}' for row '{1}' and action " +
								(Utils.isOfType(aArguments[1], Number) ? "with column index '{2}'" : "'{2}'"),
							this.getIdentifier(),
							aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		/**
		 * Executes a keyboard shortcut.
		 * If only <code>sShortcut</code> is defined, the shortcut is executed on the table directly.
		 * If additionally <code>mRowValues</code> and <code>vColumn</code> are defined, the shortcut is executed on table cell level.
		 *
		 * @param {string} sShortcut the shortcut pattern
		 * @param {object} [mRowValues] a map of columns (either name or index) to its value
		 * @param {string | int} [vColumn]  the column name or index
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iExecuteKeyboardShortcut = function(sShortcut, mRowValues, vColumn) {
			return this.prepareResult(
				this.getBuilder()
					.doPressKeyboardShortcut(sShortcut, mRowValues, vColumn)
					.description(
						Utils.formatMessage(
							mRowValues && vColumn
								? "Execute keyboard shortcut '{1}' on column '{3}' of row with values '{2}' of table '{0}'"
								: "Execute keyboard shortcut '{1}' on table '{0}'",
							this.getIdentifier(),
							sShortcut,
							mRowValues,
							vColumn
						)
					)
					.execute()
			);
		};

		/**
		 * Saves a variant under given name, or overwrites the current one.
		 *
		 * @param {string} [sVariantName] the name of the new variant. If omitted, the current variant will be overwritten.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iSaveVariant = function(sVariantName) {
			var fnSuccessFunction = Utils.isOfType(sVariantName, String)
				? function(oTable) {
						return VMBuilder.create(this)
							.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
							.doSaveAs(sVariantName)
							.description(Utils.formatMessage("Saving variant for '{0}' as '{1}'", this.getIdentifier(), sVariantName))
							.execute();
				  }
				: function(oTable) {
						return VMBuilder.create(this)
							.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
							.doSave()
							.description(Utils.formatMessage("Saving current variant for '{0}'", this.getIdentifier()))
							.execute();
				  };

			return this.prepareResult(
				this.getBuilder()
					.success(fnSuccessFunction.bind(this))
					.execute()
			);
		};

		/**
		 * Removes the variant of given name.
		 *
		 * @param {string} sVariantName the name of the variant to remove. If omitted, the current variant will be overwritten.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iRemoveVariant = function(sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function(oTable) {
							return VMBuilder.create(this)
								.hasId(oTable.getId() + "::VM")
								.doRemoveVariant(sVariantName)
								.description(Utils.formatMessage("Removing variant '{1}' for '{0}'", this.getIdentifier(), sVariantName))
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Select the variant of given name.
		 *
		 * @param {string} sVariantName the name of the variant to remove. If omitted, the current variant will be overwritten.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iSelectVariant = function(sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function(oTable) {
							return VMBuilder.create(this)
								.hasId(oTable.getId() + "::VM")
								.doSelectVariant(sVariantName)
								.description(Utils.formatMessage("Selecting variant '{1}' for '{0}'", this.getIdentifier(), sVariantName))
								.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Sets the variant as the default.
		 *
		 * @param {string} sVariantName the name of the variant. If omitted, sets the Standard variant as default
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iSetDefaultVariant = function(sVariantName) {
			return this.prepareResult(
				this.getBuilder()
					.success(
						function(oTable) {
							return sVariantName
								? VMBuilder.create(this)
										.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
										.doSetVariantAsDefault(sVariantName)
										.description(
											Utils.formatMessage(
												"Setting variant '{1}' as default for '{0}'",
												this.getIdentifier(),
												sVariantName
											)
										)
										.execute()
								: VMBuilder.create(this)
										.hasId(oTable.getId ? oTable.getId() + "::VM" : oTable[0].getId() + "::VM")
										.doResetDefaultVariant()
										.description(
											Utils.formatMessage("Setting Standard variant as default for '{0}'", this.getIdentifier())
										)
										.execute();
						}.bind(this)
					)
					.execute()
			);
		};

		/**
		 * Adds a field as column in table.
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the column to add
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iAddAdaptationColumn = function(vColumnIdentifier) {
			return this.columnAdaptation(
				vColumnIdentifier,
				{ selected: false },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Adding column '{1}' to table '{0}'", this.getIdentifier(), vColumnIdentifier)
			);
		};

		/**
		 * Removes a field as column in table.
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the column to remove
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iRemoveAdaptationColumn = function(vColumnIdentifier) {
			return this.columnAdaptation(
				vColumnIdentifier,
				{ selected: true },
				OpaBuilder.Actions.press("selectMulti"),
				Utils.formatMessage("Removing field '{1}' to table '{0}'", this.getIdentifier(), vColumnIdentifier)
			);
		};

		/**
		 * Adds a field to sorting in table.
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the column to add
		 * @param {sap.ui.core.SortOrder} [sSortOrder] the columns sort order, default is {@link sap.ui.core.SortOrder.Ascending}
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iChangeSortOrder = function(vColumnIdentifier, sSortOrder) {
			var oOpaInstance = this.getOpaInstance(),
				aActions = [],
				oMdcResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc"),
				fnSortOrderAction = function(oColumnListItem) {
					var oChildBuilder = OpaBuilder.create(oOpaInstance).hasType("sap.m.Select"),
						vControls = OpaBuilder.Matchers.children(oChildBuilder)(oColumnListItem);
					// this function is not used in case of sSortOrder === SortOrder.None, so this case isn't handled
					return OpaBuilder.Actions.executor(
						OpaBuilder.Actions.enterText(
							sSortOrder === SortOrder.Ascending
								? oMdcResourceBundle.getText("sort.PERSONALIZATION_DIALOG_OPTION_ASCENDING")
								: oMdcResourceBundle.getText("sort.PERSONALIZATION_DIALOG_OPTION_DESCENDING")
						)
					)(vControls);
				};
			sSortOrder = sSortOrder || SortOrder.Ascending;
			switch (sSortOrder) {
				case SortOrder.Ascending:
					aActions.push(
						OpaBuilder.Actions.conditional(
							OpaBuilder.Matchers.properties({ selected: false }),
							OpaBuilder.Actions.press("selectMulti")
						)
					);
					aActions.push(fnSortOrderAction);
					break;
				case SortOrder.Descending:
					aActions.push(
						OpaBuilder.Actions.conditional(
							OpaBuilder.Matchers.properties({ selected: false }),
							OpaBuilder.Actions.press("selectMulti")
						)
					);
					aActions.push(fnSortOrderAction);
					break;
				case SortOrder.None:
					aActions.push(
						OpaBuilder.Actions.conditional(
							OpaBuilder.Matchers.properties({ selected: true }),
							OpaBuilder.Actions.press("selectMulti")
						)
					);
					break;
				default:
					throw new Error("unhandled switch case: " + sSortOrder);
			}
			return this.columnSorting(
				vColumnIdentifier,
				undefined,
				aActions,
				Utils.formatMessage("Setting sort of '{1}' from table '{0}' to '{2}'", this.getIdentifier(), vColumnIdentifier, sSortOrder)
			);
		};

		/**
		 * Adds a filter condition to the filter field.
		 * @param {string | sap.fe.test.api.ColumnIdentifier} vColumnIdentifier the column to filter
		 * @param {string | object} vValue the filter field condition value
		 * @param {boolean} [bClearFirst] Set to <code>true</code> to clear previous set filters first, else all previous set filters will be kept.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iChangeFilterField = function(vColumnIdentifier, vValue, bClearFirst) {
			var oFilterFieldBuilder = FilterFieldBuilder.create(this.getOpaInstance())
					.isDialogElement()
					.hasType("sap.ui.mdc.filterbar.p13n.FilterColumnLayout")
					.hasAggregation("cells", FEBuilder.Matchers.states({ text: vColumnIdentifier, controlType: "sap.m.Label" }))
					.has(OpaBuilder.Matchers.aggregationAtIndex("cells", 1)),
				bDialogOpen,
				sDescription = Utils.formatMessage(
					"Changing the filter field '{0}' of table '{1}' by adding '{2}' (was cleared first: {3})",
					vColumnIdentifier,
					this.getIdentifier(),
					vValue,
					bClearFirst
				),
				fnOpenDialog = this.iOpenFilterDialog.bind(this),
				fnCloseDialog = this.iConfirmFilterDialog.bind(this);

			return this.prepareResult(
				FEBuilder.create(this.getOpaInstance())
					.success(function() {
						bDialogOpen = FEBuilder.controlsExist(oFilterFieldBuilder);
						if (!bDialogOpen) {
							fnOpenDialog();
							oFilterFieldBuilder.success(fnCloseDialog);
						}
						return oFilterFieldBuilder
							.doChangeValue(vValue, bClearFirst)
							.description(sDescription)
							.execute();
					})
					.execute()
			);
		};

		/**
		 * Pastes data in the table.
		 *
		 * @param {string[][]} aData the data to be pasted
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @public
		 * @sap-restricted
		 */
		Actions.prototype.iPasteData = function(aData) {
			return this.prepareResult(
				this.getBuilder()
					.doPasteData(aData)
					.description(Utils.formatMessage("Pasting {0} rows on table '{1}'", aData.length, this.getIdentifier()))
					.execute()
			);
		};

		return Actions;
	}
);
