import { AnnotationTerm, ApplyAnnotationExpression, IfAnnotationExpression, PathAnnotationExpression } from "@sap-ux/vocabularies-types";
import { ManifestWrapper } from "../ManifestSettings";
import { AnyAnnotation, EntitySet, EntityType } from "@sap-ux/annotation-converter";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

export type TemplateConverterType = "ListReport" | "ObjectPage" | "AnalyticalListPage" | "Default";

export type ConverterContext = {
	/**
	 * Function to retrieve the binding expression based on a potential dynamic annotation value
	 *
	 * @param annotationValue
	 * @param defaultValue
	 */
	getBindingExpression<T>(
		annotationValue: any | PathAnnotationExpression<any> | ApplyAnnotationExpression<any> | IfAnnotationExpression<any> | undefined,
		defaultValue?: T
	): BindingExpression<T>;
	/**
	 * Function to retrieve the inverse binding expression based on a potential dynamic annotation value
	 *
	 * @param annotationValue
	 * @param defaultValue
	 */
	getInverseBindingExpression<T>(
		annotationValue: T | PathAnnotationExpression<T> | ApplyAnnotationExpression<T> | IfAnnotationExpression<T> | undefined,
		defaultValue?: boolean
	): BindingExpression<boolean>;

	/**
	 * Retrieve the entityType associated with an annotation object
	 *
	 * @param annotation
	 * @returns {EntityType} the entity type the annotation refers to
	 */
	getAnnotationEntityType(annotation: AnnotationTerm<any>): EntityType;

	/**
	 * Retrieve the manifest settings defined for a specific control within controlConfiguration
	 *
	 * @param annotationPath
	 */
	getManifestControlConfiguration(annotationPath: string | AnnotationTerm<any>): any;

	/**
	 * Create an absolute annotation path based on the current meta model context
	 *
	 * @param annotationPath
	 */
	getAbsoluteAnnotationPath(annotationPath: string): string;

	/**
	 * Retrieve the current entitySet
	 */
	getEntitySet(): EntitySet;

	/**
	 * Get the entity set associated to an entitytype (assuming there is only one...)
	 *
	 * @param entityType
	 */
	getEntitySetForEntityType(entityType: EntityType): EntitySet | undefined;

	/**
	 * Retrieve an annotation from an entitytype based on an annotation path
	 *
	 * @param annotationPath
	 */
	getEntityTypeAnnotation(annotationPath: string): AnyAnnotation;

	/**
	 * Retrieve the type of template we're working on (LR / OP)
	 */
	getTemplateConverterType(): TemplateConverterType;

	/**
	 * Retrieve a relative annotation path between an annotationpath and an entity type
	 *
	 * @param annotationPath
	 * @param entityType
	 */
	getRelativeAnnotationPath(annotationPath: string, entityType: EntityType): string;

	/**
	 * Retrieve the correct annotation path based on the fully qualified name
	 * Fully qualified names are entityType based, while the annotation path except to start from entity set
	 *
	 * @param {string} fullyQualifiedName the fully qualified name
	 * @returns {string} the equivalent annotation path EntitySet based
	 */
	getAnnotationPathFromFullyQualifiedName(fullyQualifiedName: string): string;

	/**
	 * Transform an entityType based path to an entitySet based one (ui5 templating generally expect an entitySetBasedPath)
	 *
	 * @param annotationPath
	 */
	getEntitySetBasedAnnotationPath(annotationPath: string): string;

	/**
	 * Retrieve the manifest wrapper for the current context
	 *
	 * @returns {ManifestWrapper}
	 */
	getManifestWrapper(): ManifestWrapper;
};
