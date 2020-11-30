import { AnnotationTerm, ApplyAnnotationExpression, PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import { AnyAnnotation, ConverterOutput, EntitySet, EntityType } from "@sap-ux/annotation-converter";
import { Context } from "sap/ui/model";
import { BaseManifestSettings, createManifestWrapper, ManifestWrapper } from "sap/fe/core/converters/ManifestSettings";
import { ConverterContext, TemplateConverterType } from "sap/fe/core/converters/templates/BaseConverter";
import { AnnotationHelper, ODataMetaModel } from "sap/ui/model/odata/v4";
import { convertTypes } from "sap/fe/core/converters/MetaModelConverter";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

/**
 * Check whether an expression is a PathExpression.
 *
 * @param expression
 * @returns {boolean}
 */
const isPathExpression = function<T>(expression: any): expression is PathAnnotationExpression<T> {
	return expression.type !== undefined && expression.type === "Path";
};

/**
 * Checks whether an object is an annotation term.
 *
 * @param {string|AnnotationTerm<object>} vAnnotationPath
 * @returns {boolean}
 */
const isAnnotationTerm = function(vAnnotationPath: string | AnnotationTerm<any>): vAnnotationPath is AnnotationTerm<any> {
	return typeof vAnnotationPath === "object";
};

/**
 * Create a ConverterContext object that will be used within the converters.
 *
 * @param {ConverterOutput} oConvertedTypes the converted annotation and service types
 * @param {Context} oBaseContext the base ODataMetaModel context for this object
 * @param {BaseManifestSettings} oManifestSettings the manifestSettings that applies to this page
 * @param {EntitySet} currentEntitySet the entitySet to template against
 * @param {TemplateConverterType} templateType the type of template we're looking at right now
 *
 * @returns {ConverterContext} a converter context for the converters
 */
export function createConverterContext(
	oConvertedTypes: ConverterOutput,
	oBaseContext: Context,
	oManifestSettings: BaseManifestSettings,
	currentEntitySet: EntitySet,
	templateType: TemplateConverterType
): ConverterContext {
	const oManifestWrapper = createManifestWrapper(oManifestSettings);
	const getBindingExpression = function<T>(
		annotationValue: any | PathAnnotationExpression<any> | ApplyAnnotationExpression<any> | undefined,
		defaultValue?: T
	): BindingExpression<T> {
		if (!annotationValue) {
			return defaultValue;
		} else if (isPathExpression(annotationValue)) {
			return AnnotationHelper.format({ $Path: annotationValue.path }, { context: oBaseContext });
		} else {
			return AnnotationHelper.format(annotationValue, { context: oBaseContext });
		}
	};

	const getInverseBindingExpression = function<T>(
		annotationValue: T | PathAnnotationExpression<T> | ApplyAnnotationExpression<T> | undefined,
		defaultValue?: boolean
	): BindingExpression<boolean> {
		if (!annotationValue) {
			return defaultValue;
		} else if (typeof annotationValue === "boolean") {
			return !annotationValue;
		}
		const bindingExpression = getBindingExpression(annotationValue);
		// for path based values
		return `{= !$${bindingExpression} }`;
	};

	const getEntityTypeFromFullyQualifiedName = function(fullyQualifiedName: string): EntityType | undefined {
		const targetEntityType = oConvertedTypes.entityTypes.find(entityType => {
			if (fullyQualifiedName.startsWith(entityType.fullyQualifiedName)) {
				const replaceAnnotation = fullyQualifiedName.replace(entityType.fullyQualifiedName, "");
				return replaceAnnotation.startsWith("/") || replaceAnnotation.startsWith("@");
			}
			return false;
		});
		return targetEntityType;
	};

	const getAnnotationEntityType = function(annotation: AnnotationTerm<any>): EntityType {
		const annotationPath = annotation.fullyQualifiedName;
		const targetEntityType = getEntityTypeFromFullyQualifiedName(annotationPath);
		if (!targetEntityType) {
			throw new Error("Cannot find Entity Type for " + annotation.fullyQualifiedName);
		}
		return targetEntityType;
	};

	const getManifestControlConfiguration = function(vAnnotationPath: string | AnnotationTerm<any>): any {
		if (isAnnotationTerm(vAnnotationPath)) {
			return oManifestWrapper.getControlConfiguration(
				getRelativeAnnotationPath(vAnnotationPath.fullyQualifiedName, currentEntitySet.entityType)
			);
		}
		return oManifestWrapper.getControlConfiguration(vAnnotationPath);
	};

	//
	// const getPageManifestSettings = function(): BaseManifestSettings {
	// 	return oManifestSettings;
	// };

	const getAbsoluteAnnotationPath = function(sAnnotationPath: string): string {
		if (sAnnotationPath[0] === "/") {
			return sAnnotationPath;
		}
		return oBaseContext.getPath(sAnnotationPath);
	};

	const getEntitySet = function(): EntitySet {
		return currentEntitySet;
	};

	const getEntitySetForEntityType = function(entityType: EntityType): EntitySet | undefined {
		return oConvertedTypes.entitySets.find(entitySet => entitySet.entityType === entityType);
	};

	const getEntityTypeAnnotation = function(annotationPath: string): AnyAnnotation {
		if (annotationPath.indexOf("@") === -1) {
			annotationPath = "@" + annotationPath;
		}
		return currentEntitySet.entityType.resolvePath(annotationPath);
	};

	const getAnnotationPathFromFullyQualifiedName = function(fullyQualifiedName: string): string {
		const targetEntityType = getEntityTypeFromFullyQualifiedName(fullyQualifiedName);
		if (!targetEntityType) {
			return fullyQualifiedName;
		} else {
			const targetEntitySet = getEntitySetForEntityType(targetEntityType);
			if (!targetEntitySet) {
				return fullyQualifiedName;
			}
			return fullyQualifiedName.replace(targetEntityType.fullyQualifiedName, "/" + targetEntitySet.name + "/");
		}
	};

	const getTemplateConverterType = function(): TemplateConverterType {
		return templateType;
	};

	const getRelativeAnnotationPath = function(annotationPath: string, entityType: EntityType): string {
		return annotationPath.replace(entityType.fullyQualifiedName, "");
	};

	const getEntitySetBasedAnnotationPath = function(annotationPath: string): string {
		const entityTypeFQN = currentEntitySet.entityType.fullyQualifiedName;
		return "/" + annotationPath.replace(entityTypeFQN, currentEntitySet.name + "/");
	};

	const getManifestWrapper = function(): ManifestWrapper {
		return oManifestWrapper;
	};

	return {
		getBindingExpression,
		getInverseBindingExpression,
		getAnnotationEntityType,
		getManifestControlConfiguration,
		getAbsoluteAnnotationPath,
		getAnnotationPathFromFullyQualifiedName,
		getEntitySet,
		getEntitySetForEntityType,
		getEntityTypeAnnotation,
		getTemplateConverterType,
		getRelativeAnnotationPath,
		getEntitySetBasedAnnotationPath,
		getManifestWrapper
	};
}

/**
 * Create the converter context necessary for a macro based on a metamodel context.
 *
 * @param sEntitySetName
 * @param oMetaModelContext
 * @param sTemplateType
 * @returns {ConverterContext} the current converter context
 */
export function createConverterContextForMacro(
	sEntitySetName: string,
	oMetaModelContext: Context,
	sTemplateType: TemplateConverterType
): ConverterContext {
	const oConverterOutput = convertTypes((oMetaModelContext.getModel() as unknown) as ODataMetaModel);
	const targetEntitySet = oConverterOutput.entitySets.find(entitySet => entitySet.name === sEntitySetName) as EntitySet;
	return createConverterContext(oConverterOutput, oMetaModelContext, {} as BaseManifestSettings, targetEntitySet, sTemplateType);
}
