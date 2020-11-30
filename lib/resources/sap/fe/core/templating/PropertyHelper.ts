import { Property } from "@sap-ux/annotation-converter";
import { annotationExpression, BindingPart, equals, or } from "sap/fe/core/helpers/BindingExpression";
import { PathAnnotationExpression } from "@sap-ux/vocabularies-types";

/**
 * Check whether the property has the Core.Computed annotation or not.
 *
 * @param {Property} oProperty the target property
 * @returns {boolean} true if it's computed
 */
export const isComputed = function(oProperty: Property): boolean {
	return !!oProperty.annotations?.Core?.Computed;
};

/**
 * Check whether the property has the Core.Immutable annotation or not.
 *
 * @param {Property} oProperty the target property
 * @returns {boolean} true if it's immutable
 */
export const isImmutable = function(oProperty: Property): boolean {
	return !!oProperty.annotations?.Core?.Immutable;
};

/**
 * Check whether the property is a key or not.
 *
 * @param {Property} oProperty the target property
 * @returns {boolean} true if it's a key
 */
export const isKey = function(oProperty: Property): boolean {
	return oProperty.isKey;
};

/**
 * Check whether the property has a semantic object defined or not.
 *
 * @param {Property} oProperty the target property
 * @returns {boolean} true if it has a semantic object
 */
export const hasSemanticObject = function(oProperty: Property): boolean {
	return !!oProperty.annotations?.Common?.SemanticObject;
};

/**
 * Create the binding expression to check if the property is non editable or not.
 *
 * @param {Property} oProperty the target property
 * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's non editable
 */
export const isNonEditableExpression = function(oProperty: Property): BindingPart<boolean> {
	return or(isReadOnlyExpression(oProperty), isDisabledExpression(oProperty));
};

/**
 * Create the binding expression to check if the property is read only or not.
 *
 * @param {Property} oProperty the target property
 * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's read only
 */
export const isReadOnlyExpression = function(oProperty: Property): BindingPart<boolean> {
	const oFieldControlValue = oProperty.annotations?.Common?.FieldControl;
	if (typeof oFieldControlValue === "object") {
		return !!oFieldControlValue && equals(annotationExpression(oFieldControlValue) as BindingPart<number>, 1);
	}
	return oFieldControlValue === "Common.FieldControlType/ReadOnly";
};

/**
 * Create the binding expression to check if the property is disabled or not.
 *
 * @param {Property} oProperty the target property
 * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's disabled
 */
export const isDisabledExpression = function(oProperty: Property): BindingPart<boolean> {
	const oFieldControlValue = oProperty.annotations?.Common?.FieldControl;
	if (typeof oFieldControlValue === "object") {
		return !!oFieldControlValue && equals(annotationExpression(oFieldControlValue) as BindingPart<number>, 0);
	}
	return oFieldControlValue === "Common.FieldControlType/Inapplicable";
};

export const isPathExpression = function<T>(expression: any): expression is PathAnnotationExpression<T> {
	return !!expression && expression.type !== undefined && expression.type === "Path";
};

/**
 * Retrieves the associated unit property for that property if it exists.
 *
 * @param {Property} oProperty the target property
 * @returns {Property | undefined} the unit property if it exists
 */
export const getAssociatedUnitProperty = function(oProperty: Property): Property | undefined {
	return isPathExpression(oProperty.annotations?.Measures?.Unit)
		? ((oProperty.annotations?.Measures?.Unit.$target as unknown) as Property)
		: undefined;
};

/**
 * Check whether the property has a value help annotation defined or not.
 *
 * @param {Property} oProperty the target property
 * @returns {boolean} true if it has a value help
 */
export const hasValueHelp = function(oProperty: Property): boolean {
	return (
		!!oProperty.annotations?.Common?.ValueList ||
		!!oProperty.annotations?.Common?.ValueListReferences ||
		!!oProperty.annotations?.Common?.ValueListWithFixedValues ||
		!!oProperty.annotations?.Common?.ValueListMapping
	);
};
