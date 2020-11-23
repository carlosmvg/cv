import { FacetTypes, HeaderFacets } from "@sap-ux/vocabularies-types";
import { ManifestSection, ManifestSubSection, SectionType } from "../ManifestSettings";
import { PageDefinition } from "../TemplateConverter";
import { EntitySet, EntityType } from "@sap-ux/annotation-converter";
import { createCustomSubSections, createSubSections, CustomObjectPageSection, ObjectPageSection } from "../controls/ObjectPage/SubSection";
import { getHeaderFacetsFromAnnotations, getHeaderFacetsFromManifest, ObjectPageHeaderFacet } from "../controls/ObjectPage/HeaderFacet";
import { ConverterContext } from "./BaseConverter";
import { CustomSectionID, SectionID } from "../helpers/ID";
import { insertCustomElements, Placement, Position } from "../helpers/ConfigurableObject";
import { BaseAction, getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import { getHeaderDefaultActions, getFooterDefaultActions } from "sap/fe/core/converters/objectPage/HeaderAndFooterAction";

type ObjectPageDefinition = PageDefinition & {
	headerFacets: ObjectPageHeaderFacet[];
	headerSection?: ObjectPageSection;
	headerActions: BaseAction[];
	sections: ObjectPageSection[];
	footerActions: BaseAction[];
};

const getSectionKey = (facetDefinition: FacetTypes, fallback: string): string => {
	return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
};

/**
 * Create a section that represents the editable header part, it is only visible in edit mode.
 *
 * @param headerFacets
 * @param converterContext
 * @returns {ObjectPageSection} the section representing the editable header parts
 */
function createEditableHeaderSection(headerFacets: HeaderFacets, converterContext: ConverterContext): ObjectPageSection {
	const headerSection: ObjectPageSection = {
		id: "",
		key: "EditableHeaderContent",
		title: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_HEADER_SECTION}",
		visible: "{= ${ui>/editMode} === 'Editable' }",
		subSections: createSubSections(headerFacets, converterContext)
	};
	return headerSection;
}

/**
 * Create an annotation based section.
 *
 * @param facet
 * @param converterContext
 * @returns {ObjectPageSection} the current section
 */
function createSection(facet: FacetTypes, converterContext: ConverterContext): ObjectPageSection {
	const sectionID = SectionID({ Facet: facet });
	const section: ObjectPageSection = {
		id: sectionID,
		key: getSectionKey(facet, sectionID),
		title: converterContext.getBindingExpression(facet.Label),
		visible: converterContext.getInverseBindingExpression(facet.annotations?.UI?.Hidden, true),
		subSections: createSubSections([facet], converterContext)
	};
	return section;
}

/**
 * Create a manifest based custom section.
 *
 * @param customSectionDefinition
 * @param sectionKey
 *
 * @returns {CustomObjectPageSection} the current custom section
 */
function createCustomSection(customSectionDefinition: ManifestSection, sectionKey: string): CustomObjectPageSection {
	const customSectionID = customSectionDefinition.id || CustomSectionID(sectionKey);
	let position: Position | undefined = customSectionDefinition.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	let manifestSubSections: Record<string, ManifestSubSection>;
	if (!customSectionDefinition.subSections) {
		// If there is no subSection defined, we add the content of the custom section as subsections
		// and make sure to set the visibility to 'true', as the actual visibility is handled by the section itself
		manifestSubSections = {
			[sectionKey]: {
				...customSectionDefinition,
				position: undefined,
				visible: true
			}
		};
	} else {
		manifestSubSections = customSectionDefinition.subSections;
	}
	const subSections = createCustomSubSections(manifestSubSections);

	const customSection: CustomObjectPageSection = {
		id: customSectionID,
		key: sectionKey,
		title: customSectionDefinition.title,
		visible: customSectionDefinition.visible !== undefined ? customSectionDefinition.visible : true,
		position: position,
		subSections: insertCustomElements([], subSections, { "title": "overwrite", "actions": "merge" })
	};
	return customSection;
}

export default {
	convertPage(entitySet: EntitySet, converterContext: ConverterContext): ObjectPageDefinition {
		const customSections: Record<string, CustomObjectPageSection> = {};
		const manifestWrapper = converterContext.getManifestWrapper();
		let headerSection: ObjectPageSection | undefined;
		const manifestCustomSections = manifestWrapper.getSections();
		const entityType: EntityType = entitySet.entityType;

		// Retrieve all header facets (from annotations & custom)
		const headerFacets = insertCustomElements(
			getHeaderFacetsFromAnnotations(entitySet, converterContext),
			getHeaderFacetsFromManifest(manifestWrapper.getHeaderFacets())
		);

		// Retrieve the page header actions
		const headerActions = insertCustomElements(
			getHeaderDefaultActions(entitySet, converterContext),
			getActionsFromManifest(manifestWrapper.getHeaderActions()),
			{ isNavigable: "overwrite" }
		);
		// Retrieve the page footer actions
		const footerActions = insertCustomElements(
			getFooterDefaultActions(entitySet, manifestWrapper.getViewLevel(), converterContext),
			getActionsFromManifest(manifestWrapper.getFooterActions()),
			{ isNavigable: "overwrite" }
		);

		if (manifestWrapper.isHeaderEditable() && entityType.annotations.UI?.HeaderFacets) {
			headerSection = createEditableHeaderSection(entityType.annotations.UI?.HeaderFacets, converterContext);
		}

		// For each UI.Facet we will create a section
		const objectPageSections: ObjectPageSection[] =
			entityType.annotations?.UI?.Facets?.map((facetDefinition: FacetTypes) => {
				let annotationSection = createSection(facetDefinition, converterContext);
				if (manifestCustomSections[annotationSection.key]) {
					// Add potential override coming from the manifest
					const manifestSectionOverride = manifestCustomSections[annotationSection.key];
					if (
						(manifestSectionOverride.hasOwnProperty("type") && manifestSectionOverride.type === SectionType.XMLFragment) ||
						manifestSectionOverride.type === SectionType.Default
					) {
						// Fully replace the section by a custom section if a type is defined
						annotationSection = createCustomSection(manifestSectionOverride, annotationSection.key);
						delete manifestCustomSections[annotationSection.key];
					}
				}
				return annotationSection;
			}) || [];

		Object.keys(manifestCustomSections).forEach(manifestSectionKey => {
			const customSection: ManifestSection = manifestCustomSections[manifestSectionKey];
			customSections[manifestSectionKey] = createCustomSection(customSection, manifestSectionKey);
		});

		return {
			template: "ObjectPage",
			headerFacets: headerFacets,
			headerSection: headerSection,
			headerActions: headerActions,
			sections: insertCustomElements(objectPageSections, customSections, {
				"title": "overwrite",
				"visible": "overwrite",
				"subSections": {
					"actions": "merge",
					"title": "overwrite"
				}
			}),
			footerActions: footerActions
		};
	}
};
