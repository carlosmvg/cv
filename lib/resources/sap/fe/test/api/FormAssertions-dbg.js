sap.ui.define(
	["./FormAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/builder/MacroFieldBuilder"],
	function(FormAPI, Utils, OpaBuilder, FEBuilder, MacroFieldBuilder) {
		"use strict";
		/**
		 * Constructor.
		 *
		 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder the FEBuilder instance to operate on
		 * @param {string} [vFormDescription] the Form description (optional), used to log message
		 * @returns {sap.fe.test.api.FormAssertions} the instance
		 * @class
		 * @private
		 */
		var FormAssertions = function(oFormBuilder, vFormDescription) {
			return FormAPI.call(this, oFormBuilder, vFormDescription);
		};
		FormAssertions.prototype = Object.create(FormAPI.prototype);
		FormAssertions.prototype.constructor = FormAssertions;
		FormAssertions.prototype.isAction = false;

		function _checkShowMoreShowLess(vOpaInstance, bShowMore, mState) {
			var oFormBuilder = vOpaInstance.getBuilder(),
				sSubSectionId,
				sButtonSuffix = bShowMore ? "--seeMore" : "--seeLess";

			oFormBuilder
				.has(function(oElement) {
					sSubSectionId = oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2);
					return true;
				})
				.execute();

			return vOpaInstance.prepareResult(
				FEBuilder.create(vOpaInstance)
					.hasId(new RegExp(Utils.formatMessage("{0}$", sButtonSuffix)))
					.has(function(oElement) {
						// check whether the control is in the correct SubSection
						return oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2) === sSubSectionId + sButtonSuffix;
					})
					.hasState(mState)
					.description(Utils.formatMessage("Checking '{0}' action with state='{1}'", sButtonSuffix, mState))
					.execute()
			);
		}

		function _getBuilderForFieldElement(vOpaInstance, vFieldIdentifier) {
			return MacroFieldBuilder.create(vOpaInstance)
				.hasSome(
					vOpaInstance.createFieldMatcher(vFieldIdentifier, "DataField"),
					vOpaInstance.createFieldMatcher(vFieldIdentifier, "DataFieldWithUrl"),
					FEBuilder.Matchers.type("sap.m.Link") // representing DataFieldWithNavigationPath (no stable id available)
				)
				.has(function(oElement) {
					// do not check for -inner controls
					return oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2) !== "Field-inner";
				});
		}

		function _getBuilderForFormElement(vOpaInstance, vFieldIdentifier) {
			return FEBuilder.create(vOpaInstance) // identifying the FormElement
				.hasType("sap.ui.layout.form.FormElement")
				.hasSome(
					vOpaInstance.createFormElementMatcher(vFieldIdentifier, "DataField"),
					vOpaInstance.createFormElementMatcher(vFieldIdentifier, "DataFieldWithNavigationPath"),
					vOpaInstance.createFormElementMatcher(vFieldIdentifier, "DataFieldWithUrl")
				);
		}

		function _getBuilderForFieldGroup(vOpaInstance, vFieldIdentifier) {
			return FEBuilder.create(vOpaInstance) // identifying the FieldGroup
				.hasType("sap.ui.layout.form.FormContainer")
				.has(vOpaInstance.createFieldGroupMatcher(vFieldIdentifier));
		}

		/**
		 * Checks a form within an Object Page.
		 *
		 * @param {object} mFormState the state of the Form.
		 * @returns {object} an object extending a jQuery promise.
		 *
		 * @private
		 * @experimental
		 */
		FormAssertions.prototype.iCheckState = function(mFormState) {
			var oFormBuilder = this.getBuilder();
			return this.prepareResult(
				oFormBuilder
					.hasState(mFormState)
					.description(
						Utils.formatMessage(
							"Checking Form '{0}'{1}",
							this.getIdentifier(),
							mFormState ? Utils.formatMessage(" having state '{0}'", mFormState) : ""
						)
					)
					.execute()
			);
		};

		/**
		 * Checks the state of actions within a sub-section. The action is identified either by id
		 * or by a string representing the label of the action.
		 *
		 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier an action identifier
		 * @param {object} [mState] the states to check. Available action states are:
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
		FormAssertions.prototype.iCheckAction = function(vActionIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oFormBuilder = this.getBuilder();

			return this.prepareResult(
				oFormBuilder
					.hasAggregation("actions", [this.createActionMatcher(vActionIdentifier), FEBuilder.Matchers.states(mState)])
					.description(Utils.formatMessage("Checking custom action '{0}' with state='{1}'", aArguments[0], aArguments[1]))
					.execute()
			);
		};

		/**
		 * Check the Show-More action of a form (sub-section).
		 *
		 * @param {object} [mState] the states to check. Available action states are:
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
		FormAssertions.prototype.iCheckShowMore = function(mState) {
			return _checkShowMoreShowLess(this, true, mState);
		};

		/**
		 * Check the Show-Less action of a form (sub-section).
		 *
		 * @param {object} [mState] the states to check. Available action states are:
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
		FormAssertions.prototype.iCheckShowLess = function(mState) {
			return _checkShowMoreShowLess(this, false, mState);
		};

		/**
		 * Checks the content and state of form fields. The field is identified either by id or by a string representing
		 * the content of the field.
		 *
		 * @param {string | sap.fe.test.api.FieldIdentifier} vFieldIdentifier a field identifier
		 * @param {string | object} [vValue] Expected value(s) of the field.
		 * if passed as an object, the following pattern will be considered:
		 * <code><pre>
		 * 	{
		 * 		value: <string>, 		// optional
		 * 		description: <string> 	// optional
		 *  }
		 * </pre></code>
		 * @param {object} [mState] the states to check. Available field states are:
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
		FormAssertions.prototype.iCheckField = function(vFieldIdentifier, vValue, mState) {
			var aArguments = Utils.parseArguments([[Object, String], [String, Array, Object], Object], arguments),
				oFormBuilder = this.getBuilder();

			return this.prepareResult(
				oFormBuilder
					.has(
						OpaBuilder.Matchers.childrenMatcher(
							vFieldIdentifier.fieldGroup
								? _getBuilderForFieldGroup(this, vFieldIdentifier).has(
										OpaBuilder.Matchers.childrenMatcher(
											_getBuilderForFormElement(this, vFieldIdentifier).has(
												OpaBuilder.Matchers.childrenMatcher(
													_getBuilderForFieldElement(this, vFieldIdentifier)
														.hasValue(vValue)
														.hasState(mState)
												)
											)
										)
								  )
								: _getBuilderForFormElement(this, vFieldIdentifier).has(
										OpaBuilder.Matchers.childrenMatcher(
											_getBuilderForFieldElement(this, vFieldIdentifier)
												.hasValue(vValue)
												.hasState(mState)
										)
								  )
						)
					)
					.description(
						Utils.formatMessage(
							"Checking field '{0}' with value '{1}' and state='{2}'",
							aArguments[0].dataField ? aArguments[0].dataField : aArguments[0],
							aArguments[1],
							aArguments[2]
						)
					)
					.execute()
			);
		};

		/**
		 * Checks whether or not the field within a form is link.
		 * The field is identified either by id or by a string representing the content of the field.
		 *
		 * @param {string | sap.fe.test.api.FieldIdentifier} vLinkIdentifier a field identifier
		 * @param {object} [mState] the states to check. Available field states are:
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
		FormAssertions.prototype.iCheckLink = function(vLinkIdentifier, mState) {
			var aArguments = Utils.parseArguments([[Object, String], Object], arguments),
				oFormBuilder = this.getBuilder();

			function checkOnFormElement(oContext, vLinkIdentifier, mState) {
				return _getBuilderForFormElement(oContext, vLinkIdentifier).has(
					OpaBuilder.Matchers.childrenMatcher(
						MacroFieldBuilder.create()
							.hasType("sap.m.Link")
							.hasState(mState)
					)
				);
			}

			function getMatcher(oContext, vLinkIdentifier, mState) {
				if (!Utils.isOfType(vLinkIdentifier, String)) {
					return vLinkIdentifier.fieldGroup
						? _getBuilderForFieldGroup(oContext, vLinkIdentifier).has(
								OpaBuilder.Matchers.childrenMatcher(checkOnFormElement(this, vLinkIdentifier, mState))
						  )
						: checkOnFormElement(oContext, vLinkIdentifier, mState);
				} else {
					// simple string, check for text property on sap.m.Link
					return FEBuilder.create(oContext)
						.hasType("sap.m.Link")
						.hasProperties({ text: vLinkIdentifier })
						.hasState(mState);
				}
			}

			return this.prepareResult(
				oFormBuilder
					.has(OpaBuilder.Matchers.childrenMatcher(getMatcher(this, vLinkIdentifier, mState)))
					.description(
						Utils.formatMessage(
							"Checking link of field '{0}' with state='{1}'",
							aArguments[0].dataField ? aArguments[0].dataField : aArguments[0],
							aArguments[1]
						)
					)
					.execute()
			);
		};

		return FormAssertions;
	}
);
