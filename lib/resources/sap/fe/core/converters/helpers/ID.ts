import { IDPart, StableIdHelper } from "sap/fe/core/helpers";

const BASE_ID: IDPart[] = ["fe"];

/**
 * Shortcut to the stableIdHelper providing a "curry" like method where the last parameter is missing.
 *
 * @param sFixedPart
 * @returns {Function} a shorcut function with the fixed ID part
 */
export function IDGenerator(...sFixedPart: IDPart[]) {
	return function(...sIDPart: IDPart[]) {
		return StableIdHelper.generate(BASE_ID.concat(...sFixedPart, ...sIDPart));
	};
}

/**
 * Those are all helpers to centralize ID generation in the code for different elements
 */
export const HeaderFacetID = IDGenerator("HeaderFacet");
export const CustomHeaderFacetID = IDGenerator("HeaderFacetCustomContainer");
export const SectionID = IDGenerator("FacetSection");
export const CustomSectionID = IDGenerator("CustomSection");
export const SubSectionID = IDGenerator("FacetSubSection");
export const CustomSubSectionID = IDGenerator("CustomSubSection");
export const FormID = IDGenerator("Form");
export const TableID = IDGenerator("table");
export const FilterBarID = IDGenerator("FilterBar");
export const FilterVariantManagementID = function(sFilterID: string) {
	return StableIdHelper.generate([sFilterID, "VariantManagement"]);
};
export const ChartID = IDGenerator("Chart");
export const CustomActionID = function(sActionID: string) {
	return StableIdHelper.generate(["CustomAction", sActionID]);
};
