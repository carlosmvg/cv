sap.ui.define(["./FormAPI", "sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(
	FormAPI,
	Utils,
	OpaBuilder,
	FEBuilder
) {
	"use strict";
	/**
	 * Constructor.
	 *
	 * @param {sap.fe.test.builder.FEBuilder} oFormBuilder the FEBuilder instance to operate on
	 * @param {string} [vFormDescription] the Form description (optional), used to log message
	 * @returns {sap.fe.test.api.FormActions} the instance
	 * @class
	 * @private
	 */
	var FormActions = function(oFormBuilder, vFormDescription) {
		return FormAPI.call(this, oFormBuilder, vFormDescription);
	};
	FormActions.prototype = Object.create(FormAPI.prototype);
	FormActions.prototype.constructor = FormActions;
	FormActions.prototype.isAction = true;

	function _getBuilderForFormElement(vOpaInstance, vLinkIdentifier, vAction) {
		return FEBuilder.create(vOpaInstance) // identifying the FormElement
			.hasType("sap.ui.layout.form.FormElement")
			.hasSome(
				vOpaInstance.createFormElementMatcher(vLinkIdentifier, "DataField"),
				vOpaInstance.createFormElementMatcher(vLinkIdentifier, "DataFieldWithNavigationPath"),
				vOpaInstance.createFormElementMatcher(vLinkIdentifier, "DataFieldWithUrl")
			)
			.doOnAggregation(
				"fields",
				OpaBuilder.Matchers.some(
					vOpaInstance.createFieldMatcher(vLinkIdentifier, "DataField"),
					vOpaInstance.createFieldMatcher(vLinkIdentifier, "DataFieldWithUrl"),
					FEBuilder.Matchers.type("sap.m.Link") // representing DataFieldWithNavigationPath (no stable id available)
				),
				vAction
			);
		// .execute();	// TODO: without execute() negative tests will fail;  with execute() navigations to other UIs fail
	}

	function _getBuilderForFieldGroup(vOpaInstance, vLinkIdentifier) {
		return FEBuilder.create(vOpaInstance) // identifying the FieldGroup
			.hasType("sap.ui.layout.form.FormContainer")
			.has(vOpaInstance.createFieldGroupMatcher(vLinkIdentifier));
	}

	function _executeShowMoreShowLess(vOpaInstance, bShowMore) {
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
			OpaBuilder.create(vOpaInstance)
				.hasId(new RegExp(Utils.formatMessage("{0}$", sButtonSuffix)))
				.has(function(oElement) {
					return oElement.getId().substring(oElement.getId().lastIndexOf("::") + 2) === sSubSectionId + sButtonSuffix;
				})
				.doPress()
				.description(Utils.formatMessage("Pressing '{0}' action", sButtonSuffix))
				.execute()
		);
	}

	/**
	 * Execute an action assigned to a form (sub-section). The action is identified either by id or by a string representing
	 * the label of the action.
	 *
	 * @param {string | sap.fe.test.api.ActionIdentifier} vActionIdentifier the action identifier or its label
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FormActions.prototype.iExecuteAction = function(vActionIdentifier) {
		var oFormBuilder = this.getBuilder();
		return this.prepareResult(
			oFormBuilder
				.doOnAggregation("actions", this.createActionMatcher(vActionIdentifier), OpaBuilder.Actions.press())
				.description(Utils.formatMessage("Pressing action '{0}'", vActionIdentifier))
				.execute()
		);
	};

	/**
	 * Execute the Show-More action of a form (sub-section).
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FormActions.prototype.iExecuteShowMore = function() {
		return _executeShowMoreShowLess(this, true);
	};

	/**
	 * Execute the Show-Less action of a form (sub-section).
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FormActions.prototype.iExecuteShowLess = function() {
		return _executeShowMoreShowLess(this, false);
	};

	/**
	 * Click a link assigned to a form. The link is identified by id.
	 *
	 * @param {object|string} vLinkIdentifier The link to be clicked. If passed as an object use the following pattern:
	 * <code><pre>
	 * 	{
	 * 		<[fieldGroup]>: <name of the field-group>
	 * 		<dataField>: <name of field related to the link>
	 *  }
	 * </pre></code>
	 * If passed as string, the content of the field (link) will be checked.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FormActions.prototype.iClickLink = function(vLinkIdentifier) {
		var oFormBuilder = this.getBuilder();

		function getMatcher(oContext, vLinkIdentifier) {
			if (!Utils.isOfType(vLinkIdentifier, String)) {
				return vLinkIdentifier.fieldGroup
					? _getBuilderForFieldGroup(oContext, vLinkIdentifier).doOnChildren(
							_getBuilderForFormElement(oContext, vLinkIdentifier, OpaBuilder.Actions.press())
					  )
					: _getBuilderForFormElement(oContext, vLinkIdentifier, OpaBuilder.Actions.press());
			} else {
				// simple string, check for text property on sap.m.Link
				return OpaBuilder.create(oContext)
					.hasType("sap.m.Link")
					.hasProperties({ text: vLinkIdentifier })
					.doPress();
				// .execute();  	// TODO: without execute() negative tests will fail;  with execute() navigations to other UIs fail
			}
		}

		return this.prepareResult(
			oFormBuilder // on the SubForm
				.doOnChildren(getMatcher(this, vLinkIdentifier))
				.description(Utils.formatMessage("Pressing link '{0}'", vLinkIdentifier))
				.execute()
		);
	};

	/**
	 * Change a field assigned to a form. The field is identified by id.
	 *
	 * @param {object|string} vFieldIdentifier The link to be clicked. If passed as an object use the following pattern:
	 * <code><pre>
	 * 	{
	 * 		<dataField>: <name of field related to the link>
	 *  }
	 * @param {string | object} [vValue] Value(s) to be set in the field.
	 *
	 * @returns {object} an object extending a jQuery promise.
	 *
	 * @private
	 * @experimental
	 */
	FormActions.prototype.iChangeField = function(vFieldIdentifier, vValue) {
		var oFormBuilder = this.getBuilder();

		function getMatcher(oContext, vFieldIdentifier) {
			if (!Utils.isOfType(vFieldIdentifier, String)) {
				return vFieldIdentifier.fieldGroup
					? _getBuilderForFieldGroup(oContext, vFieldIdentifier).doOnChildren(
							_getBuilderForFormElement(oContext, vFieldIdentifier, OpaBuilder.Actions.enterText(vValue))
					  )
					: _getBuilderForFormElement(oContext, vFieldIdentifier, OpaBuilder.Actions.enterText(vValue));
			} else {
				// TODO: check for simple fields outside of FormElements (e.g on customSections)
				return undefined;
				// return OpaBuilder.create(oContext)
				// 	.hasType("sap.m.Link")
				// 	.hasProperties({ text: vFieldIdentifier })
				// 	.doPress();
			}
		}

		return this.prepareResult(
			oFormBuilder // on the SubForm
				.doOnChildren(getMatcher(this, vFieldIdentifier))
				.description(Utils.formatMessage("Entering value '{0}' into field '{1}'", vValue, vFieldIdentifier))
				.execute()
		);
	};

	return FormActions;
});
