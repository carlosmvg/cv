sap.ui.define(
	[
		"./HeaderAPI",
		"sap/fe/test/Utils",
		"sap/ui/test/OpaBuilder",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"./ShareUtilsHelper"
	],
	function(HeaderAPI, Utils, OpaBuilder, FEBuilder, FieldBuilder, ShareUtilsHelper) {
		"use strict";

		/**
		 * Constructor.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oHeaderBuilder the FEBuilder instance to operate on
		 * @param {string} [vHeaderDescription] the header description (optional), used to log message
		 * @returns {sap.fe.test.api.HeaderAssertions} the instance
		 * @class
		 * @private
		 */
		var HeaderAssertions = function(oHeaderBuilder, vHeaderDescription) {
			this._sObjectPageLayoutId = vHeaderDescription.id;
			this._sHeaderId = vHeaderDescription.headerId;
			this._sHeaderContentId = vHeaderDescription.headerContentId;
			this._sViewId = vHeaderDescription.viewId;
			this._sPaginatorId = vHeaderDescription.paginatorId;
			this._sBreadCrumbId = vHeaderDescription.breadCrumbId;
			return HeaderAPI.call(this, oHeaderBuilder, vHeaderDescription);
		};
		HeaderAssertions.prototype = Object.create(HeaderAPI.prototype);
		HeaderAssertions.prototype.constructor = HeaderAssertions;
		HeaderAssertions.prototype.isAction = false;

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
		HeaderAssertions.prototype.iCheckAction = function(vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId);
			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(this.createActionMatcher(vActionIdentifier), mState)
					.description(Utils.formatMessage("Checking custom header action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks the state of the header toolbar edit action.
		 *
		 * @param {object} [mState] available states are:
		 * <code><pre>
		 * 	{
		 * 		visible: true|false,
		 * 		enabled: true|false,
		 * 		focused:	 true|false
		 * 	}
		 * </pre></code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckEdit = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
				sEditId = "fe::StandardAction::Edit";

			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sEditId))), mState)
					.description(Utils.formatMessage("Checking header Edit action '{0}' with state='{1}'", sEditId, mState))
					.execute()
			);
		};

		/**
		 * Checks the state of the header toolbar delete action.
		 *
		 * @param {object} [mState] available states are:
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
		HeaderAssertions.prototype.iCheckDelete = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
				sDeleteId = "fe::StandardAction::Delete";

			return this.prepareResult(
				oOverflowToolbarBuilder
					.hasContent(FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", sDeleteId))), mState)
					.description(Utils.formatMessage("Checking header Delete action '{0}' with state='{1}'", sDeleteId, mState))
					.execute()
			);
		};

		/**
		 * Checks the number of menu items in the Related Apps action.
		 * Precondition: The Related Apps menu is already opened (e.g. using HeaderAction iExecuteRelatedApps).
		 *
		 * @param {number} [iExpectedNumberOfMenuItems] the expected number of menu items
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckRelatedAppsMenuItems = function(iExpectedNumberOfMenuItems) {
			return this.prepareResult(
				OpaBuilder.create(this)
					.hasType("sap.ui.unified.Menu")
					.isDialogElement()
					.hasProperties({ visible: true })
					.hasAggregationLength("items", iExpectedNumberOfMenuItems)
					.description(Utils.formatMessage("Seeing Related Apps dropdown with '{0}' entries ", iExpectedNumberOfMenuItems))
					.execute()
			);
		};

		/**
		 * Checks the number of items available in the Object Page header.
		 *
		 * @param {number} iNumberOfItems the expected number of items
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckNumberOfHeaderContentItems = function(iNumberOfItems) {
			var oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);

			return this.prepareResult(
				oHeaderContentBuilder
					.has(function(oOPHeaderContent) {
						return oOPHeaderContent.getContent()[0].getItems().length === iNumberOfItems;
					})
					.description(Utils.formatMessage("Checking number of header content with '{0}' items", iNumberOfItems))
					.execute()
			);
		};

		/**
		 * Checks a field within a field group of the Object Page header.
		 *
		 * @param {object} vFieldIdentifier the field to be checked
		 * Use the following pattern:
		 * <code><pre>
		 * 	{
		 * 		<field>: <name of the field within the field group>
		 * 		<fieldGroup>: <field group id used in facet definition>
		 *  }
		 * </pre></code>
		 * @param {string|Array|object} [vValue] The value to check. If it is an array, the first entry is considered as
		 * value and the second as description. If it is an object it has the following pattern:
		 * <code><pre>
		 * 	{
		 * 		value: <string>, 		// optional
		 * 		description: <string> 	// optional
		 * 	}
		 * </pre></code>
		 * @param {object} [mFieldState] the state of the field. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		visible: true|false,
		 * 		enabled: true|false
		 * 	}
		 * </pre></code>
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckFieldInFieldGroup = function(vFieldIdentifier, vValue, mFieldState) {
			var aArguments = Utils.parseArguments([Object, [Array, String], Object], arguments),
				sFieldId = this.getFieldGroupFieldId(vFieldIdentifier, this._sViewId);

			return this.prepareResult(
				FieldBuilder.create(this)
					.hasId(sFieldId)
					.hasValue(aArguments[1])
					.hasState(aArguments[2])
					.description(
						Utils.formatMessage(
							"Seeing field '{0}' with value '{1}' and state='{2}'",
							aArguments[0],
							aArguments[1],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks a Data Point within the Object Page header.
		 *
		 * @param {string} sTitle The title of the Data Point to be checked.
		 * @param {string} sValue the expected value of the Data Point
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckDataPoint = function(sTitle, sValue) {
			var oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);

			return this.prepareResult(
				oHeaderContentBuilder
					.doOnChildren(
						OpaBuilder.create(this)
							.hasType("sap.m.ObjectNumber")
							// TODO non breaking space is used, so it needs to be covered - is this a default behavior?
							.hasProperties({ number: sValue.replace(/ /g, String.fromCharCode(160)) })
							.has(function(oObjectNumber) {
								return oObjectNumber.getParent();
							})
							.hasAggregationProperties("items", { text: sTitle })
					)
					.description(Utils.formatMessage("Seeing header data point '{0}' with value '{1}'", sTitle, sValue))
					.execute()
			);
		};

		/**
		 * Checks the title of the Object Page and of controls within the Object Page header.
		 *
		 * @param {string} sTitle The title of the Object Page header to be checked.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckTitle = function(sTitle) {
			var oHeaderTitleBuilder = this.getObjectPageDynamicHeaderTitleBuilder(this._sObjectPageLayoutId);

			return this.prepareResult(
				oHeaderTitleBuilder
					.doOnChildren(
						OpaBuilder.create(this)
							.hasType("sap.m.Title")
							.hasProperties({ text: sTitle })
					)
					.description("Seeing Object Page header title '" + sTitle + "'")
					.execute()
			);
		};

		/**
		 * Checks the state of the paginator down button.
		 *
		 * @param {object} mState the state of the paginator down button. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		visible: true|false,
		 * 		enabled: true|false
		 * 	}
		 * </pre></code>
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckPaginatorDown = function(mState) {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-down-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					mState
				)
					.description(Utils.formatMessage("Checking paginator down action with state='{0}'", mState))
					.execute()
			);
		};

		/**
		 * Checks the state of the paginator up button.
		 *
		 * @param {object} mState the state of the paginator up button. The following states are supported:
		 * <code><pre>
		 * 	{
		 * 		visible: true|false,
		 * 		enabled: true|false
		 * 	}
		 * </pre></code>
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckPaginatorUp = function(mState) {
			return this.prepareResult(
				this.createPaginatorBuilder(
					OpaBuilder.Matchers.properties({ icon: "sap-icon://navigation-up-arrow" }),
					this._sViewId + "--" + this._sPaginatorId,
					mState
				)
					.description(Utils.formatMessage("Checking paginator up action with state='{0}'", mState))
					.execute()
			);
		};

		/**
		 * Checks a MicroChart shown in the header of an ObjectPage.
		 *
		 * @param {object|string} vMicroChartIdentifier Id/Type or Title of MicroChart
		 * In case of string you need to pass the title of the Micro Chart as Identifier. Otherwise an object with content
		 *
		 * <code><pre>
		 * 	{
		 * 		chartId: <ID>
		 * 		chartType: <Type>
		 * 	}
		 * </pre></code>
		 *
		 * is needed. <ID> is the ID of the chart defined within the metadata. <Type> can be one of the chart types defined
		 * within sap.suite.ui.microchart, e.g. BulletMicroChart, ComparisonMicroChart or RadialMicroChart
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckMicroChart = function(vMicroChartIdentifier) {
			var oOpaBuilder = OpaBuilder.create(this.getOpaInstance());

			if (!Utils.isOfType(vMicroChartIdentifier, String)) {
				oOpaBuilder.hasId(
					this._sViewId +
						"--" +
						this._sHeaderId +
						"::MicroChart::" +
						vMicroChartIdentifier.chartId +
						"::" +
						vMicroChartIdentifier.chartType
				);
				oOpaBuilder.description(
					Utils.formatMessage(
						"Seeing Micro Chart of type '{0}' with identifier '{1}'",
						vMicroChartIdentifier.chartType,
						vMicroChartIdentifier.chartId
					)
				);
			} else {
				oOpaBuilder.hasProperties({ chartTitle: vMicroChartIdentifier });
				oOpaBuilder.description(Utils.formatMessage("Seeing Micro Chart with title '{0}'", vMicroChartIdentifier));
			}
			return this.prepareResult(oOpaBuilder.execute());
		};

		/**
		 * Checks for a Custom Facet in the Object Page Header.
		 *
		 * @param {sap.fe.test.api.HeaderFacetIdentifier} vFacetIdentifier The Identifier of the Header Facet to be checked.
		 * @param {object} [mState] the state of the facet. Available states are
		 * <code><pre>
		 * 	{
		 * 		visible: true|false,
		 * 		stashed: true|false
		 * 	}
		 * </pre></code>
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckHeaderFacet = function(vFacetIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);

			return this.prepareResult(
				oHeaderContentBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							FEBuilder.create(this.getOpaInstance())
								.hasId(
									vFacetIdentifier.custom
										? new RegExp("fe::HeaderFacetCustomContainer::" + vFacetIdentifier.facetId + "$")
										: new RegExp("fe::HeaderFacetContainer::" + vFacetIdentifier.facetId + "$")
								)
								.hasState(mState)
						)
					)
					.description(Utils.formatMessage("Checking Header Facet '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Checks a specific Breadcrumb link on the object page.
		 *
		 * @param {string} [sLink] Text property of the link to be tested
		 * The given text within sLink is checked for availability within the links aggregation of the breadcrumb control.
		 * If sLink is provided as empty string (""), the breadcrumb control is checked for availability with empty links aggregation -
		 * this is the case for the main object page which does not show breadcrumb links.
		 * If sLink is not provided at all, the breadcrumb control is checked for non-existence which is the case for flexible column layout
		 * showing multiple floorplans at the same time.
		 *
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		HeaderAssertions.prototype.iCheckBreadCrumb = function(sLink) {
			var oFEBuilder = FEBuilder.create(this.getOpaInstance()).hasId(this._sBreadCrumbId);

			if (sLink !== undefined && sLink.length > 0) {
				oFEBuilder.hasAggregationProperties("links", { text: sLink });
				oFEBuilder.description(Utils.formatMessage("Checking breadcrumb link '{0}'", sLink));
			} else if (sLink !== undefined && sLink.length === 0) {
				oFEBuilder.hasAggregationLength("links", 0);
				oFEBuilder.hasState({ visible: true });
				oFEBuilder.description("Checking for existing but empty breadcrumbs");
			} else if (sLink === undefined) {
				oFEBuilder.hasState({ visible: false });
				oFEBuilder.description("Checking for non-existent breadcrumbs");
			}

			return this.prepareResult(oFEBuilder.execute());
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
		HeaderAssertions.prototype.iCheckSaveAsTile = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
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
		HeaderAssertions.prototype.iCheckSendEmail = function(mState) {
			var oOverflowToolbarBuilder = this.createOverflowToolbarBuilder(this._sObjectPageLayoutId),
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

		/**
		 * Checks the state of a link located in the Object Page header.
		 *
		 * @param {object|string} vLinkIdentifier The link to be clicked. If passed as an object use the following pattern:
		 * <code><pre>
		 * 	{
		 * 		<dataField>: <name of field related to the link>
		 *  }
		 * </pre></code>
		 * @param {object} [mState] the states to check. Available states are:
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
		HeaderAssertions.prototype.iCheckLink = function(vLinkIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oHeaderContentBuilder = this.getObjectPageDynamicHeaderContentBuilder(this._sHeaderContentId);
			return this.prepareResult(
				oHeaderContentBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							FieldBuilder.create()
								.hasSome(
									this.createFieldMatcher(vLinkIdentifier, "DataField"),
									this.createFieldMatcher(vLinkIdentifier, "DataFieldWithUrl")
									// FEBuilder.Matchers.type("sap.m.Link")
								)
								.hasType("sap.m.Link")
								.hasState(aArguments[1])
						)
					)
					.description(Utils.formatMessage("Checking link '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		return HeaderAssertions;
	}
);
