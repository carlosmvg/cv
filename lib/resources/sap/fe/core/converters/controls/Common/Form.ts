import { FacetTypes, ReferenceFacetTypes, UIAnnotationTypes } from "@sap-ux/vocabularies-types";
import { FormID } from "../../helpers/ID";

export type FormDefinition = {
	id: string;
	useFormContainerLabels: boolean;
	hasFacetsNotPartOfPreview: boolean;
};

export function isReferenceFacet(facetDefinition: FacetTypes): facetDefinition is ReferenceFacetTypes {
	return facetDefinition.$Type === UIAnnotationTypes.ReferenceFacet;
}

export function createFormDefinition(facetDefinition: FacetTypes): FormDefinition {
	switch (facetDefinition.$Type) {
		case UIAnnotationTypes.CollectionFacet:
			// Keep only valid children
			const formCollectionDefinition = {
				id: FormID({ Facet: facetDefinition }),
				useFormContainerLabels: true,
				hasFacetsNotPartOfPreview: facetDefinition.Facets.some(childFacet => childFacet.annotations?.UI?.PartOfPreview === false)
			};
			return formCollectionDefinition;
		case UIAnnotationTypes.ReferenceFacet:
			const formDefinition = {
				id: FormID({ Facet: facetDefinition }),
				useFormContainerLabels: false,
				hasFacetsNotPartOfPreview: facetDefinition.annotations?.UI?.PartOfPreview === false
			};
			return formDefinition;
		default:
			throw new Error("Cannot create form based on ReferenceURLFacet");
	}
}
