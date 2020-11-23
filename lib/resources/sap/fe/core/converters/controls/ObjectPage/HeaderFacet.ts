import { ManifestHeaderFacet } from "sap/fe/core/converters/ManifestSettings";
import {
	ConfigurableObject,
	ConfigurableRecord,
	CustomElement,
	Placement,
	Position
} from "sap/fe/core/converters/helpers/ConfigurableObject";
import { EntitySet } from "@sap-ux/annotation-converter";
import { FacetTypes } from "@sap-ux/vocabularies-types";
import { ConverterContext } from "sap/fe/core/converters/templates/BaseConverter";
import { CustomHeaderFacetID, HeaderFacetID } from "sap/fe/core/converters/helpers/ID";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Definitions: Header Facet Types, Generic OP Header Facet, Manifest Properties for Custom Header Facet
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export enum HeaderFacetType {
	Annotation = "Annotation",
	XMLFragment = "XMLFragment"
}

export enum FlexDesignTimeType {
	Default = "Default",
	NotAdaptable = "not-adaptable", // disable all actions on that instance
	NotAdaptableTree = "not-adaptable-tree", // disable all actions on that instance and on all children of that instance
	NotAdaptableVisibility = "not-adaptable-visibility" // disable all actions that influence the visibility, namely reveal and remove
}

export type FlexSettings = {
	designtime?: FlexDesignTimeType;
};

export type ObjectPageHeaderFacet = ConfigurableObject & {
	type: HeaderFacetType;
	id: string;
	annotationPath?: string;
};

export type CustomObjectPageHeaderFacet = CustomElement<ObjectPageHeaderFacet> & {
	visible: BindingExpression<boolean>;
	fragmentName: string;
	title?: string;
	subTitle?: string;
	stashed?: boolean;
	flexSettings?: FlexSettings;
	binding?: string;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collect All Header Facets: Custom (via Manifest) and Annotation Based (via Metamodel)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieve header facets from annotations.
 *
 * @param {EntitySet} entitySet with annotations for this object
 * @param {ConverterContext} converterContext for this object
 *
 * @returns {ObjectPageHeaderFacet} header facets from annotations
 */
export function getHeaderFacetsFromAnnotations(entitySet: EntitySet, converterContext: ConverterContext): ObjectPageHeaderFacet[] {
	return (
		entitySet.entityType?.annotations?.UI?.HeaderFacets?.map(facetCollection => createHeaderFacet(facetCollection, converterContext)) ??
		[]
	);
}

/**
 * Retrieve custom header facets from manifest.
 *
 * @param {ConfigurableRecord<ManifestHeaderFacet>} manifestCustomHeaderFacets settings for this object
 *
 * @returns {Record<string, CustomObjectPageHeaderFacet>} header facets from manifest
 */
export function getHeaderFacetsFromManifest(
	manifestCustomHeaderFacets: ConfigurableRecord<ManifestHeaderFacet>
): Record<string, CustomObjectPageHeaderFacet> {
	const customHeaderFacets: Record<string, CustomObjectPageHeaderFacet> = {};

	Object.keys(manifestCustomHeaderFacets).forEach(manifestHeaderFacetKey => {
		const customHeaderFacet: ManifestHeaderFacet = manifestCustomHeaderFacets[manifestHeaderFacetKey];
		customHeaderFacets[manifestHeaderFacetKey] = createCustomHeaderFacet(customHeaderFacet, manifestHeaderFacetKey);
	});

	return customHeaderFacets;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert & Build Annotation Based Header Facets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Create an annotation based header facet.
 *
 * @param {FacetTypes} facetDefinition of this object
 * @param {ConverterContext} converterContext for this object
 *
 * @returns {ObjectPageHeaderFacet} Annotation based header facet created
 */
function createHeaderFacet(facetDefinition: FacetTypes, converterContext: ConverterContext): ObjectPageHeaderFacet {
	const headerFacetID = HeaderFacetID({ Facet: facetDefinition });
	const getHeaderFacetKey = (facetDefinition: FacetTypes, fallback: string): string => {
		return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
	};

	return {
		type: HeaderFacetType.Annotation,
		id: headerFacetID,
		key: getHeaderFacetKey(facetDefinition, headerFacetID),
		annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName) + "/"
	};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Convert & Build Manifest Based Header Facets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateBinding(requestGroupId?: string): string | undefined {
	if (!requestGroupId) {
		return undefined;
	}
	const groupId =
		["Heroes", "Decoration", "Workers", "LongRunners"].indexOf(requestGroupId) !== -1 ? "$auto." + requestGroupId : requestGroupId;

	return "{ path : '', parameters : { $$groupId : '" + groupId + "' } }";
}

/**
 * Create a manifest based custom header facet.
 *
 * @param {ManifestHeaderFacet} customHeaderFacetDefinition for this object
 * @param {string} headerFacetKey of this object
 *
 * @returns {CustomObjectPageHeaderFacet} manifest based custom header facet created
 */
function createCustomHeaderFacet(customHeaderFacetDefinition: ManifestHeaderFacet, headerFacetKey: string): CustomObjectPageHeaderFacet {
	const customHeaderFacetID = CustomHeaderFacetID(headerFacetKey);

	let position: Position | undefined = customHeaderFacetDefinition.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	return {
		type: customHeaderFacetDefinition.type,
		id: customHeaderFacetID,
		key: headerFacetKey,
		position: position,
		visible: customHeaderFacetDefinition.visible,
		fragmentName: customHeaderFacetDefinition.name,
		title: customHeaderFacetDefinition.title,
		subTitle: customHeaderFacetDefinition.subTitle,
		stashed: customHeaderFacetDefinition.stashed || false,
		flexSettings: { ...{ designtime: FlexDesignTimeType.Default }, ...customHeaderFacetDefinition.flexSettings },
		binding: generateBinding(customHeaderFacetDefinition.requestGroupId)
	};
}
