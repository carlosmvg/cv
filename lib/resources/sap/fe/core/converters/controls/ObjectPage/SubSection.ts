import { ActionType, ManifestSubSection, SectionType } from "../../ManifestSettings";
import {
	AnnotationTerm,
	DataFieldAbstractTypes,
	FacetTypes,
	FieldGroup,
	Identification,
	ReferenceFacetTypes,
	StatusInfo,
	UIAnnotationTerms,
	UIAnnotationTypes
} from "@sap-ux/vocabularies-types";
import { CommunicationAnnotationTerms } from "@sap-ux/vocabularies-types/dist/generated/Communication";
import { CustomSubSectionID, FormID, SubSectionID } from "../../helpers/ID";
import { ConverterContext } from "../../templates/BaseConverter";
import { createFormDefinition, FormDefinition, isReferenceFacet } from "../Common/Form";
import { DataVisualizationDefinition, getDataVisualizationConfiguration } from "../Common/DataVisualization";
import { ConfigurableObject, CustomElement, insertCustomElements, Placement } from "../../helpers/ConfigurableObject";
import {
	ConverterAction,
	CustomAction,
	getActionsFromManifest,
	getEnabledBinding,
	isActionNavigable
} from "sap/fe/core/converters/controls/Common/Action";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

export enum SubSectionType {
	Unknown = "Unknown", // Default Type
	Form = "Form",
	DataVisualization = "DataVisualization",
	XMLFragment = "XMLFragment",
	Placeholder = "Placeholder"
}

type ObjectPageSubSection =
	| UnsupportedSubSection
	| FormSubSection
	| DataVisualizationSubSection
	| ContactSubSection
	| XMLFragmentSubSection
	| PlaceholderFragmentSubSection;

type BaseSubSection = {
	id: string;
	key: string;
	title: BindingExpression<string>;
	annotationPath: string;
	type: SubSectionType;
	visible: BindingExpression<boolean>;
};

type UnsupportedSubSection = BaseSubSection & {
	text: string;
};

type DataVisualizationSubSection = BaseSubSection & {
	type: SubSectionType.DataVisualization;
	presentation: DataVisualizationDefinition;
};

type ContactSubSection = UnsupportedSubSection & {};

type XMLFragmentSubSection = Omit<BaseSubSection, "annotationPath"> & {
	type: SubSectionType.XMLFragment;
	fragmentName: string;
	actions: Record<string, CustomAction>;
};

type PlaceholderFragmentSubSection = Omit<BaseSubSection, "annotationPath"> & {
	type: SubSectionType.Placeholder;
	actions: Record<string, CustomAction>;
};

export type FormSubSection = BaseSubSection & {
	type: SubSectionType.Form;
	formDefinition: FormDefinition;
	actions: ConverterAction[];
};

export type ObjectPageSection = ConfigurableObject & {
	id: string;
	title: BindingExpression<string>;
	visible: BindingExpression<boolean>;
	subSections: ObjectPageSubSection[];
};

export type CustomObjectPageSection = CustomElement<ObjectPageSection>;

export type CustomObjectPageSubSection = CustomElement<ObjectPageSubSection>;

const targetTerms: string[] = [
	UIAnnotationTerms.LineItem,
	UIAnnotationTerms.PresentationVariant,
	UIAnnotationTerms.SelectionPresentationVariant
];

// TODO: Need to handle Table case inside createSubSection function if CollectionFacet has Table ReferenceFacet
const hasTable = (facets: any[] = []) => {
	return facets.some(facetType => targetTerms.indexOf(facetType?.Target?.$target?.term) > -1);
};

/**
 * Create subsections based on facet definition.
 *
 * @param facetCollection
 * @param converterContext
 * @returns {ObjectPageSubSection[]} the current subections
 */
export function createSubSections(facetCollection: FacetTypes[], converterContext: ConverterContext): ObjectPageSubSection[] {
	// First we determine which sub section we need to create
	const facetsToCreate = facetCollection.reduce((facetsToCreate: FacetTypes[], facetDefinition) => {
		switch (facetDefinition.$Type) {
			case UIAnnotationTypes.ReferenceFacet:
				facetsToCreate.push(facetDefinition);
				break;
			case UIAnnotationTypes.CollectionFacet:
				// TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
				// first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
				if (
					hasTable(facetDefinition.Facets) ||
					!facetDefinition.Facets.every(facetType => facetType.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet")
				) {
					facetDefinition.Facets.forEach(facetType => facetsToCreate.push(facetType));
				} else {
					//Second case if a collection facet has all reference facet then sub-section should be created only for parent collection facet not for all child reference facets.
					facetsToCreate.push(facetDefinition);
				}
				break;
			case UIAnnotationTypes.ReferenceURLFacet:
				// Not supported
				break;
		}
		return facetsToCreate;
	}, []);

	// Then we create the actual subsections
	return facetsToCreate.map(facet => createSubSection(facet, converterContext, ""));
}

// function isTargetForCompliant(annotationPath: AnnotationPath) {
// 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
// }
const getSubSectionKey = (facetDefinition: FacetTypes, fallback: string): string => {
	return facetDefinition.ID?.toString() || facetDefinition.Label?.toString() || fallback;
};

/**
 * Retrieves the action form a facet.
 *
 * @param facetDefinition
 * @param converterContext
 * @returns {ConverterAction[]} the current facet actions
 */
function getFacetActions(facetDefinition: FacetTypes, converterContext: ConverterContext): ConverterAction[] {
	let actions = new Array<ConverterAction>();
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			actions = (facetDefinition.Facets.filter(facetDefinition => isReferenceFacet(facetDefinition)) as ReferenceFacetTypes[]).reduce(
				(actions: ConverterAction[], facetDefinition) => createFormActionReducer(actions, facetDefinition, converterContext),
				[]
			);
			break;
		case UIAnnotationTypes.ReferenceFacet:
			actions = createFormActionReducer([], facetDefinition as ReferenceFacetTypes, converterContext);
			break;
	}
	return actions;
}

/**
 * Create a subsection based on a FacetTypes.
 *
 * @param facetDefinition
 * @param converterContext
 * @param subSectionTitle
 * @returns {ObjectPageSubSection} one sub section definition
 */
export function createSubSection(
	facetDefinition: FacetTypes,
	converterContext: ConverterContext,
	subSectionTitle: string
): ObjectPageSubSection {
	const subSectionID = SubSectionID({ Facet: facetDefinition });
	const subSection: BaseSubSection = {
		id: subSectionID,
		key: getSubSectionKey(facetDefinition, subSectionID),
		title: converterContext.getBindingExpression(facetDefinition.Label as string),
		type: SubSectionType.Unknown,
		annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
		visible: converterContext.getInverseBindingExpression<boolean>(facetDefinition.annotations?.UI?.Hidden, true)
	};
	if (subSectionTitle && subSectionTitle !== "") {
		subSection.title = subSectionTitle;
	}
	let unsupportedText = "";
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			// TODO If we get a collection facet a this point it should only contains form elements hopefully
			if (facetDefinition.Facets && hasTable(facetDefinition.Facets)) {
				return createSubSection(facetDefinition.Facets[0], converterContext, subSection.title as string);
			}
			const formCollectionSubSection: FormSubSection = {
				...subSection,
				type: SubSectionType.Form,
				formDefinition: createFormDefinition(facetDefinition),
				actions: getFacetActions(facetDefinition, converterContext)
			};
			return formCollectionSubSection;
		case UIAnnotationTypes.ReferenceFacet:
			if (!facetDefinition.Target.$target) {
				unsupportedText = `Unable to find annotationPath ${facetDefinition.Target.value}`;
			} else {
				switch (facetDefinition.Target.$target.term) {
					case UIAnnotationTerms.LineItem:
					case UIAnnotationTerms.Chart:
					case UIAnnotationTerms.PresentationVariant:
					case UIAnnotationTerms.SelectionPresentationVariant:
						const dataVisualizationSubSection: DataVisualizationSubSection = {
							...subSection,
							type: SubSectionType.DataVisualization,
							presentation: getDataVisualizationConfiguration(
								{
									annotation: facetDefinition.Target.$target,
									path: facetDefinition.Target.value
								},
								converterContext
							)
						};
						return dataVisualizationSubSection;

					case UIAnnotationTerms.FieldGroup:
					case UIAnnotationTerms.Identification:
					case UIAnnotationTerms.DataPoint:
					case UIAnnotationTerms.StatusInfo:
					case CommunicationAnnotationTerms.Contact:
						// All those element belong to a form facet
						const formElementSubSection: FormSubSection = {
							...subSection,
							type: SubSectionType.Form,
							formDefinition: createFormDefinition(facetDefinition),
							actions: getFacetActions(facetDefinition, converterContext)
						};
						return formElementSubSection;

					default:
						unsupportedText = `For ${facetDefinition.Target.$target.term} Fragment`;
						break;
				}
			}
			break;
		case UIAnnotationTypes.ReferenceURLFacet:
			unsupportedText = "For Reference URL Facet";
			break;
	}
	// If we reach here we ended up with an unsupported SubSection type
	const unsupportedSubSection: UnsupportedSubSection = {
		...subSection,
		text: unsupportedText
	};
	return unsupportedSubSection;
}

function createFormActionReducer(
	actions: ConverterAction[],
	facetDefinition: ReferenceFacetTypes,
	converterContext: ConverterContext
): ConverterAction[] {
	const referenceTarget: AnnotationTerm<any> = facetDefinition.Target.$target;
	let manifestActions: Record<string, CustomAction> = {};
	let dataFieldCollection: DataFieldAbstractTypes[] = [];
	if (referenceTarget) {
		switch (referenceTarget.term) {
			case UIAnnotationTerms.FieldGroup:
				dataFieldCollection = (referenceTarget as FieldGroup).Data;
				manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(referenceTarget).actions);
				break;
			case UIAnnotationTerms.Identification:
			case UIAnnotationTerms.StatusInfo:
				dataFieldCollection = referenceTarget as Identification | StatusInfo;
				break;
		}
	}

	return dataFieldCollection.reduce((actions, dataField: DataFieldAbstractTypes) => {
		switch (dataField.$Type) {
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
				if (dataField.RequiresContext === true) {
					throw new Error("Requires Context should not be true for form action : " + dataField.Label);
				} else {
					let aMappings = [];
					if (dataField.Mapping) {
						aMappings = getSemanticObjectMapping(dataField.Mapping);
					}
					actions.push({
						type: ActionType.DataFieldForIntentBasedNavigation,
						id: FormID({ Facet: facetDefinition }, dataField),
						key: KeyHelper.generateKeyFromDataField(dataField),
						text: dataField.Label as string,
						annotationPath: "",
						visible: converterContext.getInverseBindingExpression(dataField.annotations?.UI?.Hidden, true),
						press:
							".handlers.onDataFieldForIntentBasedNavigation($controller, '" +
							dataField.SemanticObject +
							"','" +
							dataField.Action +
							"', '" +
							JSON.stringify(aMappings) +
							"', undefined ," +
							dataField.RequiresContext +
							")",
						customData: "{ semanticObject: '" + dataField.SemanticObject + "', action: '" + dataField.Action + "' }"
					});
				}
				break;
			case UIAnnotationTypes.DataFieldForAction:
				const formManifestActionsConfiguration: any = converterContext.getManifestControlConfiguration(referenceTarget).actions;
				const sActionName: string = "DataFieldForAction::" + dataField.Action.replace(/\//g, "::");
				actions.push({
					type: ActionType.DataFieldForAction,
					id: FormID({ Facet: facetDefinition }, dataField),
					key: KeyHelper.generateKeyFromDataField(dataField),
					text: dataField.Label as string,
					annotationPath: "",
					enabled: getEnabledBinding(dataField.ActionTarget, converterContext),
					visible: converterContext.getInverseBindingExpression(dataField.annotations?.UI?.Hidden, true),
					press:
						".editFlow.onCallAction('" +
						dataField.Action +
						"', { contexts: ${$view>/#fe::ObjectPage/}.getBindingContext(), invocationGrouping : '" +
						(dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated") +
						"', label: '" +
						dataField.Label +
						"', model: ${$source>/}.getModel(), isNavigable: " +
						isActionNavigable(formManifestActionsConfiguration && formManifestActionsConfiguration[sActionName]) +
						"})" //TODO: need to move this from here so that we won't mix manifest actions and annotation actions code
				});
				break;
		}
		actions = insertCustomElements(actions, manifestActions);
		return actions;
	}, actions);
}

export function createCustomSubSections(
	manifestSubSections: Record<string, ManifestSubSection>
): Record<string, CustomObjectPageSubSection> {
	const subSections: Record<string, CustomObjectPageSubSection> = {};
	Object.keys(manifestSubSections).forEach(
		subSectionKey => (subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey))
	);
	return subSections;
}

export function createCustomSubSection(manifestSubSection: ManifestSubSection, subSectionKey: string): CustomObjectPageSubSection {
	let position = manifestSubSection.position;
	if (!position) {
		position = {
			placement: Placement.After
		};
	}
	switch (manifestSubSection.type) {
		case SectionType.XMLFragment:
			return {
				id: manifestSubSection.id || CustomSubSectionID(subSectionKey),
				actions: getActionsFromManifest(manifestSubSection.actions),
				key: subSectionKey,
				title: manifestSubSection.title,
				type: SubSectionType.XMLFragment,
				position: position,
				visible: manifestSubSection.visible,
				fragmentName: manifestSubSection.name || ""
			};
		case SectionType.Default:
		default:
			return {
				id: manifestSubSection.id || CustomSubSectionID(subSectionKey),
				actions: getActionsFromManifest(manifestSubSection.actions),
				key: subSectionKey,
				title: manifestSubSection.title,
				position: position,
				visible: manifestSubSection.visible,
				type: SubSectionType.Placeholder
			};
	}
}

function getSemanticObjectMapping(aMappings: any[]): any[] {
	const aSemanticObjectMappings: any[] = [];
	aMappings.forEach(oMapping => {
		const oSOMapping = {
			"LocalProperty": {
				"$PropertyPath": oMapping.LocalProperty.value
			},
			"SemanticObjectProperty": oMapping.SemanticObjectProperty
		};
		aSemanticObjectMappings.push(oSOMapping);
	});
	return aSemanticObjectMappings;
}
