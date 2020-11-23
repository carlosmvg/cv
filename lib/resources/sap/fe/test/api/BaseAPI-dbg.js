sap.ui.define(["sap/fe/test/Utils", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder"], function(Utils, OpaBuilder, FEBuilder) {
	"use strict";

	/**
	 * An action identifier
	 *
	 * @typedef {object} ActionIdentifier
	 * @property {string} service the name of the service
	 * @property {string} action the name of the action
	 * @property {boolean} [unbound] define whether the action is a bound action (default: false)
	 *
	 * @name sap.fe.test.api.ActionIdentifier
	 * @private
	 */

	/**
	 * A field identifier
	 *
	 * @typedef {object} FieldIdentifier
	 * @property {string} [fieldGroup] the name of the field-group containing the field
	 * @property {string} dataField the name of the field
	 *
	 * @name sap.fe.test.api.FieldIdentifier
	 * @private
	 */

	function _findParentChainFunction(oResult, sChainKeyword) {
		var oAnd = oResult.and;
		if (sChainKeyword in oAnd) {
			return _findParentChainFunction(oAnd[sChainKeyword], sChainKeyword);
		}
		return oAnd;
	}

	var BaseApi = function(oOpaBuilder, vIdentifier) {
		this._oBuilder = oOpaBuilder;
		this._vIdentifier = vIdentifier;
	};

	/**
	 * Defines whether the current API is meant for actions (<code>true</code>) or assertions (<code>false</code>).
	 * It is used to enable parent chaining via <code>and.when</code> or <code>and.then</code> respectively.
	 *
	 * @type {boolean} define whether class is meant for actions, undefined will not add a parent chain keyword
	 * @public
	 * @sap-restricted
	 */
	BaseApi.prototype.isAction = undefined;

	/**
	 * Returns a new builder instance based on given one.
	 *
	 * @returns {object} an OpaBuilder instance
	 * @public
	 * @sap-restricted
	 */
	BaseApi.prototype.getBuilder = function() {
		// TODO uses internal OpaBuilder function - OpaBuilder needs some kind of copy-constructor or -function
		return new this._oBuilder.constructor(this.getOpaInstance(), this._oBuilder.build());
	};

	/**
	 * Returns the underlying Opa5 instance.
	 *
	 * @returns {sap.ui.test.Opa5} an OPA instance
	 * @public
	 * @sap-restricted
	 */
	BaseApi.prototype.getOpaInstance = function() {
		// TODO uses internal function
		return this._oBuilder._getOpaInstance();
	};

	BaseApi.prototype.getIdentifier = function() {
		return this._vIdentifier;
	};

	BaseApi.prototype.prepareResult = function(oWaitForResult) {
		var oParentChain = _findParentChainFunction(oWaitForResult, this.isAction ? "when" : "then");
		oWaitForResult.and = this;
		if (!Utils.isOfType(this.isAction, [null, undefined])) {
			oWaitForResult.and[this.isAction ? "when" : "then"] = oParentChain;
		}
		return oWaitForResult;
	};

	/**
	 * Create a matcher for actions.
	 *
	 * @param {object | string} vActionIdentifier Identifier to be used for the matcher.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * 	{
	 * 		service: <service-name>,
	 * 		action: <service-name>
	 *  }
	 * </pre></code>
	 * if passed as string, the content will be checked with property 'text'
	 *
	 * @returns {object} a matcher
	 *
	 * @private
	 * @experimental
	 */
	BaseApi.prototype.createActionMatcher = function(vActionIdentifier) {
		var vMatcher;

		if (!Utils.isOfType(vActionIdentifier, String)) {
			if (typeof vActionIdentifier.service === "string" && typeof vActionIdentifier.action === "string") {
				vActionIdentifier.id = vActionIdentifier.service + (vActionIdentifier.unbound ? "::" : ".") + vActionIdentifier.action;
				vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", vActionIdentifier.id)));
			} else {
				throw new Error(
					"not supported service and action parameters for creating a control id: " +
						vActionIdentifier.service +
						"/" +
						vActionIdentifier.action
				);
			}
		} else {
			vMatcher = OpaBuilder.Matchers.properties({ text: vActionIdentifier });
		}
		return vMatcher;
	};

	/**
	 * Create a matcher for fields.
	 *
	 * @param {object | string} vFieldIdentifier Identifier to be used for the matcher.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * 	{
	 * 		dataField: <field-name>
	 *  }
	 * </pre></code>
	 * if passed as string, the content of the field will be checked with property 'value' or 'text'
	 *
	 * @param {string} sDataFieldType Added as prefix for the id. Can be values like 'DataField',
	 * 'DataFieldWithUrl', 'DataFieldWithNavigationPath', etc.
	 *
	 * @returns {object} a matcher
	 *
	 * @private
	 * @experimental
	 */
	BaseApi.prototype.createFieldMatcher = function(vFieldIdentifier, sDataFieldType) {
		var vMatcher;
		if (!Utils.isOfType(vFieldIdentifier, String)) {
			if (typeof vFieldIdentifier.dataField === "string") {
				vFieldIdentifier.id = sDataFieldType + "::" + vFieldIdentifier.dataField + "::Field";
				vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", vFieldIdentifier.id)));
			} else {
				throw new Error("not supported property parameter for creating a control id for a field: " + vFieldIdentifier.dataField);
			}
		} else {
			// vMatcher = OpaBuilder.Matchers.properties({ value: vFieldIdentifier });
			vMatcher = OpaBuilder.Matchers.some(
				OpaBuilder.Matchers.properties({ value: vFieldIdentifier }),
				OpaBuilder.Matchers.properties({ text: vFieldIdentifier })
			);
		}
		return vMatcher;
	};

	/**
	 * Create a matcher for FormElements (sap.ui.layout.form.FormElement).
	 *
	 * @param {object | string} vFormElementIdentifier Identifier of the field to be used for the matcher.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * 	{
	 * 		dataField: <field-name>
	 *  }
	 * </pre></code>
	 * if passed as string, the content of the field will be checked with property 'value' or 'text'
	 *
	 * @param {string} sDataFieldType Added as prefix for the id. Can be values like 'DataField',
	 * 'DataFieldWithUrl', 'DataFieldWithNavigationPath', etc.
	 *
	 * @returns {object} a matcher
	 *
	 * @private
	 * @experimental
	 */
	BaseApi.prototype.createFormElementMatcher = function(vFormElementIdentifier, sDataFieldType) {
		var vMatcher,
			sFormElement = vFormElementIdentifier;
		if (!Utils.isOfType(vFormElementIdentifier, String)) {
			if (vFormElementIdentifier.dataField && typeof vFormElementIdentifier.dataField === "string") {
				vFormElementIdentifier.id = "FormElement::" + sDataFieldType + "::" + vFormElementIdentifier.dataField;
				vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", vFormElementIdentifier.id)));
			} else {
				throw new Error("not supported parameter for creating a control id for a FormElement");
			}
		} else {
			vMatcher = OpaBuilder.Matchers.aggregationMatcher("fields", function(oElement) {
				// Do not use label, but content of field: to not mess up with the createFieldMatcher!!!
				if (typeof oElement.getValue === "function") {
					return sFormElement === oElement.getValue();
				} else if (typeof oElement.getText === "function") {
					return sFormElement === oElement.getText();
				} else {
					return false;
				}
			});
		}
		return vMatcher;
	};

	/**
	 * Create a matcher for FieldGroups (sap.ui.layout.form.FormContainer).
	 *
	 * @param {object | string} vFieldGroupIdentifier Identifier of the field-group to be used for the matcher.
	 * if passed as an object, the following pattern will be considered:
	 * <code><pre>
	 * 	{
	 * 		fieldGroup: <fieldgroup-name>
	 *  }
	 * </pre></code>
	 * if passed as string, the content of the field will be checked with property 'title'
	 *
	 * @returns {object} a matcher
	 *
	 * @private
	 * @experimental
	 */
	BaseApi.prototype.createFieldGroupMatcher = function(vFieldGroupIdentifier) {
		var vMatcher;
		if (!Utils.isOfType(vFieldGroupIdentifier, String)) {
			if (vFieldGroupIdentifier.fieldGroup && typeof vFieldGroupIdentifier.fieldGroup === "string") {
				vFieldGroupIdentifier.id = "FormContainer::" + vFieldGroupIdentifier.fieldGroup;
				vMatcher = FEBuilder.Matchers.id(new RegExp(Utils.formatMessage("{0}$", vFieldGroupIdentifier.id)));
			} else if (vFieldGroupIdentifier.fieldGroupValue && typeof vFieldGroupIdentifier.fieldGroupValue === "string") {
				vMatcher = OpaBuilder.Matchers.properties({ title: vFieldGroupIdentifier.fieldGroupValue });
			} else {
				throw new Error("not supported parameter for creating a control id for a FieldGroup");
			}
		} else {
			vMatcher = OpaBuilder.Matchers.properties({ title: vFieldGroupIdentifier });
		}
		return vMatcher;
	};

	return BaseApi;
});
