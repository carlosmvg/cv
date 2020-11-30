import { VisualizationType, ViewPathConfiguration, MultipleViewsConfiguration } from "../ManifestSettings";

import { EntitySet } from "@sap-ux/annotation-converter";
import { ConverterContext } from "./BaseConverter";
import {
	DataVisualizationDefinition,
	getDataVisualizationConfiguration,
	DataVisualizationAnnotations,
	isPresentationCompliant,
	isPresentationALPCompliant,
	getDefaultLineItem,
	getDefaultChart,
	getDefaultPresentationVariant
} from "../controls/Common/DataVisualization";
import {
	LineItem,
	PresentationVariantTypeTypes,
	SelectionVariantTypeTypes,
	SelectionPresentationVariantTypeTypes
} from "@sap-ux/vocabularies-types/dist/generated/UI";
import { EntityType, PropertyPath, UIAnnotationTerms } from "@sap-ux/vocabularies-types";
import { FilterBarID, FilterVariantManagementID, TableID } from "../helpers/ID";
import {
	getSelectionVariantConfiguration,
	SelectionVariantConfiguration,
	TableVisualization
} from "sap/fe/core/converters/controls/Common/Table";
import { BaseAction, getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import { insertCustomElements } from "sap/fe/core/converters/helpers/ConfigurableObject";

type ViewAnnotationsTypeTypes = SelectionPresentationVariantTypeTypes | SelectionVariantTypeTypes;
type VariantManagementDefinition = {
	id: string;
	targetControlIds: string;
};

type MultipleViewConfiguration = ViewPathConfiguration & {
	annotation?: DataVisualizationAnnotations;
};

type SingleViewConfiguration = {
	annotation?: DataVisualizationAnnotations;
};

type ViewConfiguration = MultipleViewConfiguration | SingleViewConfiguration;

type FilterSelectionField = {
	readablePath: string;
	templatingPath: string;
};

export type ListReportDefinition = {
	singleTableId?: string; // only with single Table mode
	singleChartId?: string; // only with single Table mode
	showTabCounts?: boolean; // only with multi Table mode
	headerActions: BaseAction[];
	selectionFields: FilterSelectionField[];
	views: ListReportViewDefinition[];
	filterBarId: string;
	variantManagement: VariantManagementDefinition;
	fitContent: boolean;
	isAlp: boolean;
};

export type ListReportViewDefinition = {
	selectionVariantPath?: string; // only with on multi Table mode
	title?: string; // only with multi Table mode
	presentation: DataVisualizationDefinition;
	tableControlId: string;
	chartControlId: string;
};

type ContentAreaID = {
	chartId: string;
	tableId: string;
};
/**
 * Retrieve the configuration for the selection fields that will be used within the filter bar
 * This configuration takes into account annotation and the selection variants.
 *
 * @param entityType
 * @param selectionVariants
 * @param converterContext
 * @returns {FilterSelectionField[]} an array of selection fields
 */
export const getSelectionFields = function(
	entityType: EntityType,
	selectionVariants: SelectionVariantConfiguration[],
	converterContext: ConverterContext
): FilterSelectionField[] {
	const selectionFields: FilterSelectionField[] = [];
	const oSelectionVariantFields: any = {};
	selectionVariants.forEach((selectionVariant: SelectionVariantConfiguration) => {
		selectionVariant.propertyNames.forEach((propertyName: string) => {
			if (!oSelectionVariantFields[propertyName]) {
				oSelectionVariantFields[propertyName] = true;
			}
		});
	});
	entityType.annotations?.UI?.SelectionFields?.forEach((selection: PropertyPath) => {
		const selectionFieldValue: string = selection.value;
		if (!oSelectionVariantFields[selectionFieldValue]) {
			selectionFields.push({
				readablePath: selectionFieldValue,
				templatingPath: converterContext.getEntitySetBasedAnnotationPath(selection.fullyQualifiedName + "/$PropertyPath")
			});
		}
	});
	return selectionFields;
};

/**
 * Find a visualization annotation that can be used for rendering the list report.
 *
 * @param entityType
 * @returns {LineItem | PresentationVariantTypeTypes | undefined} one compliant annotation for rendering the list report
 */
function getCompliantVisualizationAnnotation(entityType: EntityType): LineItem | PresentationVariantTypeTypes | undefined {
	const presentationVariant = getDefaultPresentationVariant(entityType);
	if (presentationVariant) {
		if (isPresentationCompliant(presentationVariant)) {
			return presentationVariant;
		}
	}
	const defaultLineItem = getDefaultLineItem(entityType);
	if (defaultLineItem) {
		return defaultLineItem;
	}
	return undefined;
}

const getView = function(
	viewConfiguration: ViewConfiguration,
	entityType: EntityType,
	converterContext: ConverterContext
): ListReportViewDefinition {
	const presentation: DataVisualizationDefinition = getDataVisualizationConfiguration(
		{
			annotation: viewConfiguration.annotation,
			path: viewConfiguration.annotation
				? converterContext.getRelativeAnnotationPath(viewConfiguration.annotation.fullyQualifiedName, entityType)
				: ""
		},
		converterContext
	);
	let tableControlId = "";
	let chartControlId = "";
	let title = "";
	let selectionVariantPath = "";
	const isMultipleViewConfiguration = function(config: ViewConfiguration): config is MultipleViewConfiguration {
		return (config as MultipleViewConfiguration).key !== undefined;
	};
	const config = viewConfiguration;

	if (isMultipleViewConfiguration(config)) {
		// key exists only on multi tables mode
		const viewAnnotation = converterContext.getEntityTypeAnnotation(config.annotationPath);
		title = converterContext.getBindingExpression<string>((viewAnnotation as ViewAnnotationsTypeTypes).Text) || "";
		/**
		 * Need to loop on views and more precisely to table into views since
		 * multi table mode get specific configuation (hidden filters or Table Id)
		 */
		presentation.visualizations.forEach((visualizationDefinition, index) => {
			switch (visualizationDefinition.type) {
				case VisualizationType.Table:
					const tableVisualization = presentation.visualizations[index] as TableVisualization;
					const filters = tableVisualization.control.filters || {};
					filters.hiddenFilters = filters.hiddenFilters || { paths: [] };
					if (!config.keepPreviousPresonalization) {
						// Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
						tableVisualization.annotation.id = TableID(config.key, "LineItem");
					}

					if (
						viewConfiguration &&
						viewConfiguration.annotation &&
						viewConfiguration.annotation.term === UIAnnotationTerms.SelectionPresentationVariant
					) {
						selectionVariantPath = (viewConfiguration.annotation as SelectionPresentationVariantTypeTypes).SelectionVariant.fullyQualifiedName.split(
							"@"
						)[1];
					} else {
						selectionVariantPath = config.annotationPath;
					}
					/**
					 * Provide Selection Variant to hiddenFilters in order to set the SV filters to the table
					 * MDC Table override Obinding Fitler and from SAP FE the only method where we are able to add
					 * additionnal filter is 'rebindTable' into Table delegate
					 * In order to avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related
					 * to the Tab (multi table mode) can be passed to macro table via parameter/context named fitlers
					 * and key hiddenFilters
					 */
					filters.hiddenFilters.paths.push({ annotationPath: selectionVariantPath });
					tableVisualization.control.filters = filters;
					break;
				case VisualizationType.Chart:
					// Not currently managed
					break;
				default:
					break;
			}
		});
	}

	presentation.visualizations.forEach(visualizationDefinition => {
		if (visualizationDefinition.type === VisualizationType.Table) {
			tableControlId = visualizationDefinition.annotation.id;
		} else if (visualizationDefinition.type === VisualizationType.Chart) {
			chartControlId = visualizationDefinition.id;
		}
	});
	return { presentation, tableControlId, chartControlId, title, selectionVariantPath };
};

const getViews = function(
	entityType: EntityType,
	converterContext: ConverterContext,
	settingsViews: MultipleViewsConfiguration | undefined
): ListReportViewDefinition[] {
	let viewConfigs: ViewConfiguration[] = [];
	if (settingsViews) {
		settingsViews.paths.forEach((path, index) => {
			const targetAnnotation = converterContext.getEntityTypeAnnotation(path.annotationPath) as DataVisualizationAnnotations;
			if (targetAnnotation) {
				const annotation =
					targetAnnotation.term === UIAnnotationTerms.SelectionVariant
						? (getDefaultLineItem(entityType) as LineItem)
						: targetAnnotation;
				viewConfigs.push({
					annotation,
					...settingsViews.paths[index]
				});
			}
		});
	} else {
		if (converterContext.getTemplateConverterType() === "AnalyticalListPage") {
			viewConfigs = getAlpViewConfig(entityType, viewConfigs);
		} else {
			viewConfigs.push({ annotation: getCompliantVisualizationAnnotation(entityType) });
		}
	}
	return viewConfigs.map(viewConfig => getView(viewConfig, entityType, converterContext));
};
function getAlpViewConfig(entityType: EntityType, viewConfigs: ViewConfiguration[]): ViewConfiguration[] {
	const presentation = getDefaultPresentationVariant(entityType);
	const isCompliant = presentation && isPresentationALPCompliant(presentation);
	if (!isCompliant) {
		const chart = getDefaultChart(entityType);
		const table = getDefaultLineItem(entityType);
		if (chart) {
			viewConfigs.push({
				annotation: chart
			});
		}
		if (table) {
			viewConfigs.push({
				annotation: table
			});
		}
	} else {
		viewConfigs.push({
			annotation: presentation
		});
	}
	return viewConfigs;
}
/**
 * Create the ListReportDefinition for the current entityset.
 *
 * @param entitySet
 * @param converterContext
 * @returns {ListReportDefinition} the list report definition based on annotation + manifest
 */
export const convertPage = function(entitySet: EntitySet, converterContext: ConverterContext): ListReportDefinition {
	const entityType = entitySet.entityType;
	const sTemplateType = converterContext.getTemplateConverterType();
	const manifestWrapper = converterContext.getManifestWrapper();
	const viewsDefinition: MultipleViewsConfiguration | undefined = manifestWrapper.getViewConfiguration();
	const views: ListReportViewDefinition[] = getViews(entityType, converterContext, viewsDefinition);
	const showTabCounts = viewsDefinition?.showCounts;

	let singleTableId = "";
	let singleChartId = "";
	let bFitContent = false;
	// Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
	const selectionVariantConfigs: SelectionVariantConfiguration[] = [];
	const selectionVariantPaths: string[] = [];
	const filterBarId = FilterBarID(entitySet.name);
	const filterVariantManagementID = FilterVariantManagementID(filterBarId);
	const targetControlIds = [filterBarId];
	views.forEach(view => {
		view.presentation.visualizations.forEach(visualizationDefinition => {
			if (visualizationDefinition.type === VisualizationType.Table) {
				const tableFilters = visualizationDefinition.control.filters;
				for (const key in tableFilters) {
					if (Array.isArray(tableFilters[key].paths)) {
						const paths = tableFilters[key].paths;
						paths.forEach(path => {
							if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
								selectionVariantPaths.push(path.annotationPath);
								const selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
								if (selectionVariantConfig) {
									selectionVariantConfigs.push(selectionVariantConfig);
								}
							}
						});
					}
				}
				targetControlIds.push(visualizationDefinition.annotation.id);
				if (visualizationDefinition.control.type === "GridTable") {
					bFitContent = sTemplateType === "AnalyticalListPage";
				}
			}
		});
	});
	const oConfig = getContentAreaId(sTemplateType, views);
	if (oConfig) {
		singleChartId = oConfig.chartId;
		singleTableId = oConfig.tableId;
	}
	const selectionFields = getSelectionFields(entityType, selectionVariantConfigs, converterContext);

	// Sort header actions according to position attributes in manifest
	const headerActions = insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions()));

	return {
		singleTableId,
		singleChartId,
		showTabCounts,
		headerActions,
		selectionFields,
		views: views,
		filterBarId,
		variantManagement: {
			id: filterVariantManagementID,
			targetControlIds: targetControlIds.join(",")
		},
		fitContent: bFitContent,
		isAlp: converterContext.getTemplateConverterType() === "AnalyticalListPage"
	};
};

function getContentAreaId(sTemplateType: string, views: ListReportViewDefinition[]): ContentAreaID | undefined {
	let singleTableId = "",
		singleChartId = "";
	if (views.length === 1) {
		singleTableId = views[0].tableControlId;
		singleChartId = views[0].chartControlId;
	} else if (sTemplateType === "AnalyticalListPage" && views.length === 2) {
		views.map(oView => {
			if (oView.chartControlId) {
				singleChartId = oView.chartControlId;
			} else if (oView.tableControlId) {
				singleTableId = oView.tableControlId;
			}
		});
	}
	if (singleTableId || singleChartId) {
		return {
			chartId: singleChartId,
			tableId: singleTableId
		};
	}
	return undefined;
}
