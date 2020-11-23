import { Context } from "sap/ui/model/odata/v4";
import { convertMetaModelContext } from "sap/fe/core/converters/MetaModelConverter";
import {
	and,
	BindingExpression,
	BindingPart,
	compileBinding,
	equals,
	ifElse,
	isConstant,
	or,
	bindingExpression,
	constant
} from "sap/fe/core/helpers/BindingExpression";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import {
	hasSemanticObject,
	hasValueHelp,
	isComputed,
	isDisabledExpression,
	isImmutable,
	isKey,
	isNonEditableExpression,
	isReadOnlyExpression,
	getAssociatedUnitProperty,
	isPathExpression
} from "sap/fe/core/templating/PropertyHelper";
import { PropertyPath, AnnotationTerm } from "@sap-ux/vocabularies-types";
import { EntitySet, Property } from "@sap-ux/annotation-converter";
import { PathAnnotationExpression } from "@sap-ux/vocabularies-types/types/Edm";
import { UpdateRestrictionsType } from "@sap-ux/vocabularies-types/dist/generated/Capabilities";

export type PropertyOrPath<P> = string | P | PathAnnotationExpression<P>;

/**
 * Create the expression to generate an "editable" boolean value.
 *
 * @param {PropertyPath} oPropertyPath the input property
 * @param {boolean} bAsObject whether or not this should be returned as an object or a binding string
 * @returns {string} the binding string
 */
export const getEditableExpression = function(
	oPropertyPath: PropertyOrPath<Property>,
	bAsObject: boolean = false
): BindingExpression<boolean> | BindingPart<boolean> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return compileBinding(false);
	}
	const oProperty: Property = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	// Editability depends on the field control expression
	// If the Field control is statically in ReadOnly or Inapplicable (disabled) -> not editable
	// If the property is a key -> not editable except in creation if not computed
	// If the property is computed -> not editable
	// If the property is immutable -> not editable except in creation
	// If the property has a SemanticObject and no ValueList defined -> not editable
	// If the Field control is a path resolving to ReadOnly or Inapplicable (disabled) (<= 1) -> not editable
	// Else, to be editable you need
	// immutable and key while in the creation row
	// ui/isEditable
	const editableExpression = ifElse(
		or(
			isComputed(oProperty),
			isKey(oProperty),
			isImmutable(oProperty),
			hasSemanticObject(oProperty) && !hasValueHelp(oProperty),
			isNonEditableExpression(oProperty)
		),
		ifElse(isImmutable(oProperty) || (isKey(oProperty) && !isComputed(oProperty)), UI.IsTransientBinding, false),
		UI.IsEditable
	);
	if (bAsObject) {
		return editableExpression;
	}
	return compileBinding(editableExpression);
};
export const getUpdatableExpression = function(
	oUpdateRestrictions: AnnotationTerm<any>,
	oPropertyPath: PropertyOrPath<Property>
): BindingPart<boolean> {
	let oUpdatable: BindingPart<boolean> = true;
	// if the field comes from a navigation entity, then the entity must be added to the path of updatable
	const sPath = isPathExpression(oPropertyPath) ? oPropertyPath.path : "";
	const sSource = sPath.indexOf("/") > -1 ? sPath.split("/")[0] : "";
	if (typeof oUpdateRestrictions.Updatable === "boolean") {
		oUpdatable = constant(oUpdateRestrictions.Updatable);
	} else if (oUpdateRestrictions.Updatable?.$Path) {
		const sUpdatablePath = (sSource ? sSource + "/" : "") + oUpdateRestrictions.Updatable?.$Path;
		oUpdatable = bindingExpression(sUpdatablePath);
	}
	return equals(oUpdatable, constant(true));
};
/**
 * Create the expression to generate an "enabled" boolean value.
 *
 * @param {PropertyPath} oPropertyPath the input property
 * @param {boolean} bAsObject whether or not this should be returned as an object or a binding string
 * @returns {string} the binding string
 */
export const getEnabledExpression = function(
	oPropertyPath: PropertyOrPath<Property>,
	bAsObject: boolean = false
): BindingExpression<boolean> | BindingPart<boolean> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return compileBinding(true);
	}
	const oProperty = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	// Enablement depends on the field control expression
	// If the Field control is statically in Inapplicable (disabled) -> not enabled
	const enabledExpression = ifElse(isDisabledExpression(oProperty), false, true);
	if (bAsObject) {
		return enabledExpression;
	}
	return compileBinding(enabledExpression);
};

/**
 * Create the expression to generate an "editMode" enum value.
 * @param {PropertyPath} oPropertyPath the input property
 * @param {string} sStaticEditMode a potentially static outside editmode
 * @param {string} sUsageContext the context in which this is used
 * @param {boolean} bAsObject return this as a BindingPart
 * @param oUpdateRestrictions
 * @returns {BindingExpression<string> | BindingPart<string>} the binding string or part
 */
export const getEditMode = function(
	oPropertyPath: PropertyOrPath<Property>,
	sStaticEditMode: string = "",
	sUsageContext: string = "",
	bAsObject: boolean = false,
	oUpdateRestrictions?: AnnotationTerm<UpdateRestrictionsType>
): BindingExpression<string> | BindingPart<string> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return "Display";
	}
	const oProperty = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	// if the property is not enabled => Disabled
	// if the property is enabled && not editable => ReadOnly
	// if the property is enabled && editable => Editable
	// If there is an associated unit, and it has a field control also use consider the following
	// if the unit field control is readonly -> EditableReadOnly
	// otherwise -> Editable
	if (sStaticEditMode === "Display" || sStaticEditMode === "ReadOnly" || sStaticEditMode === "Disabled") {
		return compileBinding(sStaticEditMode);
	}
	let editableExpression = getEditableExpression(oPropertyPath, true) as BindingPart<boolean>;
	if (sStaticEditMode === "Editable") {
		// If we're statically Editable this means we expect to be creatable
		editableExpression = ifElse(or(isComputed(oProperty), hasSemanticObject(oProperty) && !hasValueHelp(oProperty)), false, true);
	} else if (sUsageContext === "CreationRow") {
		editableExpression = ifElse(
			or(isComputed(oProperty), hasSemanticObject(oProperty) && !hasValueHelp(oProperty), isNonEditableExpression(oProperty)),
			false,
			UI.IsEditable
		);
	}
	const enabledExpression = getEnabledExpression(oPropertyPath, true) as BindingPart<boolean>;
	const unitProperty = getAssociatedUnitProperty(oProperty);
	let resultExpression: BindingPart<string> = "Editable";
	if (unitProperty) {
		resultExpression = ifElse(or(isReadOnlyExpression(unitProperty), isComputed(unitProperty)), "EditableReadOnly", "Editable");
	}
	const readOnlyExpression = isReadOnlyExpression(oProperty);

	let editModeExpression = ifElse(
		enabledExpression,
		ifElse(
			editableExpression,
			resultExpression,
			ifElse(and(!isConstant(readOnlyExpression) && readOnlyExpression, UI.IsEditable), "ReadOnly", "Display")
		),
		"Disabled"
	);
	if (oUpdateRestrictions) {
		// if the property is from a non-updatable entity => Read only mode, previously calculated edit Mode is ignored
		// if the property is from an updatable entity => previously calculated edit Mode expression
		const oUpdatableExp = getUpdatableExpression(oUpdateRestrictions, oPropertyPath);
		editModeExpression = ifElse(oUpdatableExp, editModeExpression, "Display");
	}
	if (bAsObject) {
		return editModeExpression;
	}
	return compileBinding(editModeExpression);
};

export const getFieldDisplay = function(
	oPropertyPath: PropertyOrPath<Property>,
	oEntityPath: PropertyOrPath<EntitySet>,
	sStaticEditMode: string = "",
	sUsageContext: string = "",
	oUpdateRestrictions?: AnnotationTerm<UpdateRestrictionsType>
): BindingExpression<string> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return "Display";
	}
	const oProperty = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	const oEntitySet = (isPathExpression(oEntityPath) && oEntityPath.$target) || (oEntityPath as EntitySet);
	const oTextAnnotation = oProperty.annotations?.Common?.Text;
	const oTextArrangementAnnotation =
		oTextAnnotation?.annotations?.UI?.TextArrangement || oEntitySet?.entityType?.annotations?.UI?.TextArrangement;

	let sDisplayValue = oTextAnnotation ? "DescriptionValue" : "Value";
	if (oTextAnnotation && oTextArrangementAnnotation) {
		if (oTextArrangementAnnotation === "UI.TextArrangementType/TextOnly") {
			sDisplayValue = "Description";
		} else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextLast") {
			sDisplayValue = "ValueDescription";
		} else {
			//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
			sDisplayValue = "DescriptionValue";
		}
	}

	if (hasValueHelp(oProperty)) {
		// Predefined display mode
		return compileBinding(sDisplayValue);
	} else {
		if (sDisplayValue !== "Description" && sUsageContext === "VHTable") {
			sDisplayValue = "Value";
		}
		return compileBinding(
			ifElse(
				equals(getEditMode(oPropertyPath, sStaticEditMode, sUsageContext, true, oUpdateRestrictions), "Editable"),
				"Value",
				sDisplayValue
			)
		);
	}
};

/**
 * Formatter helper to retrieve the converterContext from the metamodel context.
 *
 * @param {Context} oContext the original metamodel context
 * @param {object} oInterface the current templating context
 * @returns {object} the converter context representing that object
 */
export const getConverterContext = function(oContext: Context, oInterface: any): object | null {
	if (oInterface && oInterface.context) {
		return convertMetaModelContext(oInterface.context);
	}
	return null;
};
getConverterContext.requiresIContext = true;
