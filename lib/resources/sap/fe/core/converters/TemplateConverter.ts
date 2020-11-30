import { BaseManifestSettings } from "./ManifestSettings";
import * as ListReportConverter from "./templates/ListReportConverter";
import ObjectPageConverter from "./templates/ObjectPageConverter";
import { convertTypes } from "./MetaModelConverter";
import { ODataMetaModel } from "sap/ui/model/odata/v4";
import { TemplateConverterType } from "./templates/BaseConverter";
import { EntitySet } from "@sap-ux/annotation-converter";
import { createConverterContext } from "sap/fe/core/converters/ConverterContext";

/**
 * @typedef PageDefinition
 */
export type PageDefinition = {
	template: string;
};

/**
 * Based on a template type, convert the metamodel and manifest definition into a json structure for the page.
 *
 * @param {TemplateConverterType} sTemplateType the template type
 * @param {ODataMetaModel} oMetaModel the odata model metaModel
 * @param {BaseManifestSettings} oManifestSettings current manifest settings
 * @returns {PageDefinition} the target page definition
 */
export function convertPage(sTemplateType: TemplateConverterType, oMetaModel: ODataMetaModel, oManifestSettings: BaseManifestSettings) {
	const oConverterOutput = convertTypes(oMetaModel);
	const sTargetEntitySetName = oManifestSettings.entitySet;
	const oTargetEntitySet = oConverterOutput.entitySets.find((entitySet: EntitySet) => entitySet.name === sTargetEntitySetName);

	if (oTargetEntitySet) {
		const oContext = oMetaModel.createBindingContext("/" + sTargetEntitySetName);
		let oConvertedPage;
		switch (sTemplateType) {
			case "ListReport":
			case "AnalyticalListPage":
				oConvertedPage = ListReportConverter.convertPage(
					oTargetEntitySet,
					createConverterContext(oConverterOutput, oContext, oManifestSettings, oTargetEntitySet, sTemplateType)
				);
				break;
			case "ObjectPage":
				oConvertedPage = ObjectPageConverter.convertPage(
					oTargetEntitySet,
					createConverterContext(oConverterOutput, oContext, oManifestSettings, oTargetEntitySet, sTemplateType)
				);
				break;
		}
		return oConvertedPage;
	}
}
