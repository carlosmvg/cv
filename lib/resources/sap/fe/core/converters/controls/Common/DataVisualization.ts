import { ConverterContext } from "../../templates/BaseConverter";
import {
	ChartDefinitionTypeTypes,
	LineItem,
	Chart,
	PresentationVariantTypeTypes,
	SelectionPresentationVariantTypeTypes,
	UIAnnotationTerms,
	SelectionVariantTypeTypes
} from "@sap-ux/vocabularies-types";

import { EntityType } from "@sap-ux/vocabularies-types";

import { createDefaultTableVisualization, createTableVisualization, TableVisualization } from "./Table";
import { ChartVisualization, createChartVisualization } from "./Chart";

export type DataVisualizationAnnotations =
	| LineItem
	| Chart
	| PresentationVariantTypeTypes
	| SelectionVariantTypeTypes
	| SelectionPresentationVariantTypeTypes;
// | ChartDefinitionTypeTypes;

export type AnnotationVisualizationInfo = {
	annotation?: DataVisualizationAnnotations;
	path: string;
};

export type ActualVisualizationAnnotations = LineItem | ChartDefinitionTypeTypes;

type VisualizationAndPath = {
	visualization: ActualVisualizationAnnotations;
	annotationPath: string;
	selectionVariantPath?: string;
};

export type DataVisualizationDefinition = {
	visualizations: (TableVisualization | ChartVisualization)[];
	annotationPath: string;
};

const getVisualizationsFromPresentationVariant = function(
	presentationVariantAnnotation: PresentationVariantTypeTypes,
	visualizationPath: string,
	converterContext: ConverterContext
): VisualizationAndPath[] {
	const visualizationAnnotations: VisualizationAndPath[] = [];
	const visualizations = presentationVariantAnnotation.Visualizations || [];
	const baseVisualizationPath = visualizationPath.split("@")[0];
	if (visualizations) {
		// Only allow one line item / chart
		let hasLineItem = false;
		let hasChart = false;
		let hasVisualization = false; // used to allow only first visualization in OP
		visualizations.forEach(visualization => {
			switch (visualization.$target.term) {
				case UIAnnotationTerms.LineItem:
					if (!hasLineItem) {
						if (!(converterContext.getTemplateConverterType() === "ObjectPage" && hasVisualization)) {
							visualizationAnnotations.push({
								visualization: visualization.$target as ActualVisualizationAnnotations,
								annotationPath: `${baseVisualizationPath}${visualization.value}`
							});
							hasLineItem = true;
							hasVisualization = true;
						}
					}
					break;
				case UIAnnotationTerms.Chart:
					if (
						!hasChart &&
						sap.ui.Device &&
						sap.ui.Device.system.desktop &&
						((converterContext.getTemplateConverterType() === "AnalyticalListPage" &&
							!converterContext.getManifestWrapper().getViewConfiguration()) ||
							(converterContext.getTemplateConverterType() === "ObjectPage" && !hasVisualization))
					) {
						visualizationAnnotations.push({
							visualization: visualization.$target as ActualVisualizationAnnotations,
							annotationPath: `${baseVisualizationPath}${visualization.value}`
						});
						hasChart = true;
						hasVisualization = true;
					}
					break;
			}
		});
	}
	return visualizationAnnotations;
};

export function isPresentationCompliant(presentationVariant: PresentationVariantTypeTypes): Boolean {
	return (
		presentationVariant &&
		presentationVariant.Visualizations &&
		!!presentationVariant.Visualizations.find(visualization => {
			return visualization.$target.term === UIAnnotationTerms.LineItem;
		})
	);
}
export function isPresentationALPCompliant(presentationVariant: PresentationVariantTypeTypes): Boolean {
	let bHasTable = false,
		bHasChart = false;
	if (presentationVariant && presentationVariant.Visualizations) {
		const aVisualizations = presentationVariant.Visualizations;
		aVisualizations.map(oVisualization => {
			if (oVisualization.$target.term === UIAnnotationTerms.LineItem) {
				bHasTable = true;
			}
			if (oVisualization.$target.term === UIAnnotationTerms.Chart) {
				bHasChart = true;
			}
		});
	}
	return bHasChart && bHasTable;
}

export function getDefaultLineItem(entityType: EntityType): LineItem | undefined {
	return entityType.annotations.UI?.LineItem;
}
export function getDefaultChart(entityType: EntityType): Chart | undefined {
	return entityType.annotations.UI?.Chart;
}
export function getDefaultPresentationVariant(entityType: EntityType): PresentationVariantTypeTypes | undefined {
	return entityType.annotations?.UI?.PresentationVariant;
}

export function getDataVisualizationConfiguration(
	visualization: AnnotationVisualizationInfo,
	converterContext: ConverterContext
): DataVisualizationDefinition {
	let visualizationAnnotations: VisualizationAndPath[] = [];
	let presentationVariantAnnotation: PresentationVariantTypeTypes;
	let presentationPath: string = "";
	let chartVisualization, tableVisualization;
	const sTerm = visualization && visualization.annotation && visualization.annotation.term;
	if (sTerm) {
		switch (sTerm) {
			case UIAnnotationTerms.LineItem:
			case UIAnnotationTerms.Chart:
				visualizationAnnotations.push({
					visualization: visualization.annotation as ActualVisualizationAnnotations,
					annotationPath: visualization.path
				});
				break;
			case UIAnnotationTerms.PresentationVariant:
				presentationVariantAnnotation = visualization.annotation as PresentationVariantTypeTypes;
				visualizationAnnotations = visualizationAnnotations.concat(
					getVisualizationsFromPresentationVariant(
						visualization.annotation as PresentationVariantTypeTypes,
						visualization.path,
						converterContext
					)
				);
				break;
			case UIAnnotationTerms.SelectionPresentationVariant:
				presentationVariantAnnotation = (visualization.annotation as SelectionPresentationVariantTypeTypes).PresentationVariant;
				// Presentation can be inline or outside the SelectionPresentationVariant
				presentationPath = converterContext.getRelativeAnnotationPath(
					presentationVariantAnnotation.fullyQualifiedName,
					converterContext.getAnnotationEntityType(visualization.annotation)
				);
				if (!isPresentationCompliant(presentationVariantAnnotation)) {
					const entityType = converterContext.getEntitySet().entityType;
					const defaultLineItemAnnotation = getDefaultLineItem(entityType) as LineItem;
					if (defaultLineItemAnnotation) {
						visualizationAnnotations.push({
							visualization: defaultLineItemAnnotation,
							annotationPath: converterContext.getRelativeAnnotationPath(
								defaultLineItemAnnotation.fullyQualifiedName,
								entityType
							)
						});
					}
				} else {
					visualizationAnnotations = visualizationAnnotations.concat(
						getVisualizationsFromPresentationVariant(presentationVariantAnnotation, visualization.path, converterContext)
					);
				}
				break;
		}
		visualizationAnnotations.map(visualizationAnnotation => {
			const { visualization, annotationPath } = visualizationAnnotation;
			switch (visualization.term) {
				case UIAnnotationTerms.Chart:
					chartVisualization = createChartVisualization(
						visualization as ChartDefinitionTypeTypes,
						annotationPath,
						converterContext
					);
					break;
				case UIAnnotationTerms.LineItem:
				default:
					tableVisualization = createTableVisualization(
						visualization as LineItem,
						annotationPath,
						converterContext,
						presentationVariantAnnotation
					);
					break;
			}
		});
	} else {
		tableVisualization = [createDefaultTableVisualization(converterContext)];
	}
	const aVisualizations: any = [];
	const sPath = sTerm === UIAnnotationTerms.SelectionPresentationVariant ? presentationPath : visualization.path;
	if (chartVisualization) {
		aVisualizations.push(chartVisualization);
	}
	if (tableVisualization) {
		aVisualizations.push(tableVisualization);
	}
	return {
		visualizations: aVisualizations,
		annotationPath: converterContext.getAbsoluteAnnotationPath(sPath)
	};
}
