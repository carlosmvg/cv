import { DataFieldAbstractTypes, DataFieldForActionAbstractTypes, DataFieldTypes } from "@sap-ux/vocabularies-types";

/**
 * Identify if the given dataFieldAbstract passed is a "DataFieldForActionAbstract" (has Inline defined).
 *
 * @param {DataFieldAbstractTypes} dataField a datafield to evalute
 * @returns {boolean} validate that dataField is a DataFieldForActionAbstractTypes
 */
export function isDataFieldForActionAbstract(dataField: DataFieldAbstractTypes): dataField is DataFieldForActionAbstractTypes {
	return (dataField as DataFieldForActionAbstractTypes).hasOwnProperty("Action");
}

/**
 * Identify if the given dataFieldAbstract passed is a "DataField" (has a Value).
 *
 * @param {DataFieldAbstractTypes} dataField a dataField to evaluate
 * @returns {boolean} validate that dataField is a DataFieldTypes
 */
export function isDataFieldTypes(dataField: DataFieldAbstractTypes): dataField is DataFieldTypes {
	return (dataField as DataFieldTypes).hasOwnProperty("Value");
}
