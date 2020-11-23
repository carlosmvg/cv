import { ConverterContext } from "../../templates/BaseConverter";
import {
	ChartManifestConfiguration,
	ChartPersonalizationManifestSettings,
	ManifestWrapper,
	VisualizationType,
	ActionType
} from "../../ManifestSettings";
import { ChartDefinitionTypeTypes, DataFieldAbstractTypes } from "@sap-ux/vocabularies-types";
import { AnnotationAction, BaseAction, getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import { isDataFieldForActionAbstract } from "sap/fe/core/converters/annotations/DataField";
import { ChartID, FilterBarID } from "../../helpers/ID";
import { insertCustomElements } from "sap/fe/core/converters/helpers/ConfigurableObject";

/**
 * @typedef ChartVisualization
 */
export type ChartVisualization = {
	type: VisualizationType.Chart;
	id: string;
	collection: string;
	entityName: string;
	p13nMode?: string;
	navigationPath: string;
	annotationPath: string;
	filterId?: string;
	vizProperties: string;
	actions: BaseAction[];
};

/**
 * Method to retrieve all chart actions from annotations.
 *
 * @param chartAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns {BaseAction[]} the table annotation actions
 */
function getChartActionsFromAnnotations(
	chartAnnotation: ChartDefinitionTypeTypes,
	visualizationPath: string,
	converterContext: ConverterContext
): BaseAction[] {
	const chartActions: BaseAction[] = [];
	if (chartAnnotation) {
		const absolutePath = converterContext.getAbsoluteAnnotationPath(visualizationPath);
		const aActions = chartAnnotation.Actions || [];
		aActions.forEach((dataField: DataFieldAbstractTypes, index) => {
			let chartAction: AnnotationAction | undefined;
			if (
				isDataFieldForActionAbstract(dataField) &&
				!(dataField.annotations?.UI?.Hidden === true) &&
				!dataField.Inline &&
				!dataField.Determining
			) {
				const annotationPath = absolutePath + "/Actions/" + index;
				switch (dataField.$Type) {
					case "com.sap.vocabularies.UI.v1.DataFieldForAction":
						chartAction = {
							type: ActionType.DataFieldForAction,
							annotationPath: annotationPath,
							key: "DataFieldForAction::" + dataField.Action.replace(/\//g, "::")
						};
						break;

					case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
						chartAction = {
							type: ActionType.DataFieldForIntentBasedNavigation,
							annotationPath: annotationPath,
							key:
								"DataFieldForIntentBasedNavigation::" +
								dataField.SemanticObject +
								"::" +
								dataField.Action +
								(dataField.RequiresContext ? "::RequiresContext" : "")
						};
						break;
				}
			}
			if (chartAction) {
				chartActions.push(chartAction);
			}
		});
	}
	return chartActions;
}

export function getChartActions(
	chartAnnotation: ChartDefinitionTypeTypes,
	visualizationPath: string,
	converterContext: ConverterContext
): BaseAction[] {
	return insertCustomElements(
		getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext),
		getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions),
		{ enableOnSelect: "overwrite" }
	);
}

export function getP13nMode(visualizationPath: string, converterContext: ConverterContext): string | undefined {
	const manifestWrapper: ManifestWrapper = converterContext.getManifestWrapper();
	const chartManifestSettings: ChartManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const hasVariantManagement: boolean = ["Page", "Control"].indexOf(manifestWrapper.getVariantManagement()) > -1;
	let personalization: ChartPersonalizationManifestSettings = true;
	const aPersonalization: string[] = [];
	if (chartManifestSettings?.chartSettings?.personalization !== undefined) {
		personalization = chartManifestSettings.chartSettings.personalization;
	}
	if (hasVariantManagement && personalization) {
		if (personalization === true) {
			return "Sort,Type,Item";
		} else if (typeof personalization === "object") {
			if (personalization.type) {
				aPersonalization.push("Type");
			}
			if (personalization.item) {
				aPersonalization.push("Item");
			}
			if (personalization.sort) {
				aPersonalization.push("Sort");
			}
			return aPersonalization.join(",");
		}
	}
	return undefined;
}

/**
 * Create the ChartVisualization configuration that will be used to display a chart via Chart Macro.
 *
 * @param {ChartDefinitionTypeTypes} chartAnnotation the target chart annotation
 * @param {string} visualizationPath the current visualization annotation path
 * @param {ConverterContext} converterContext the converter context
 * @returns {ChartVisualization} the chart visualization based on the annotation
 */
export function createChartVisualization(
	chartAnnotation: ChartDefinitionTypeTypes,
	visualizationPath: string,
	converterContext: ConverterContext
): ChartVisualization {
	const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
	let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
	if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
		// Drop trailing slash
		navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
	}
	const entitySet = converterContext.getEntitySet();
	const isEntitySet: boolean = navigationPropertyPath.length === 0;
	const entityName: string = isEntitySet ? entitySet.name : entitySet.navigationPropertyBinding[navigationPropertyPath].name;
	const sFilterbarId = isEntitySet ? FilterBarID(entityName) : undefined;
	const oVizProperties = {
		"legendGroup": {
			"layout": {
				"position": "bottom"
			}
		}
	};
	return {
		type: VisualizationType.Chart,
		id: ChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
		collection: "/" + entitySet.name + (!isEntitySet ? "/" + navigationPropertyPath : ""),
		entityName: entityName,
		p13nMode: getP13nMode(visualizationPath, converterContext),
		navigationPath: navigationPropertyPath,
		annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
		filterId: sFilterbarId,
		vizProperties: JSON.stringify(oVizProperties),
		actions: chartActions
	};
}
