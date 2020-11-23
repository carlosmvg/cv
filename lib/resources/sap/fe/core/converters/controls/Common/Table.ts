import {
	CriticalityType,
	LineItem,
	PresentationVariantTypeTypes,
	SelectionVariantType,
	SelectOptionType,
	UIAnnotationTypes,
	EnumValue,
	PathAnnotationExpression,
	DataFieldAbstractTypes
} from "@sap-ux/vocabularies-types";
import {
	ActionType,
	CreationMode,
	ManifestTableColumn,
	NavigationSettingsConfiguration,
	SelectionMode,
	TableManifestConfiguration,
	VisualizationType,
	NavigationTargetConfiguration,
	ManifestWrapper
} from "../../ManifestSettings";
import { EntitySet, EntityType, NavigationProperty, Property } from "@sap-ux/annotation-converter";
import { ConverterContext } from "../../templates/BaseConverter";
import { TableID } from "../../helpers/ID";
import { NavigationPropertyRestrictionTypes } from "@sap-ux/vocabularies-types/dist/generated/Capabilities";
import { AnnotationAction, BaseAction, getActionsFromManifest, isActionNavigable } from "sap/fe/core/converters/controls/Common/Action";
import { ConfigurableObject, CustomElement, insertCustomElements, Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { isDataFieldForActionAbstract, isDataFieldTypes } from "sap/fe/core/converters/annotations/DataField";
import {
	annotationExpression,
	BindingExpression,
	bindingExpression,
	BindingPart,
	compileBinding,
	formatResult,
	ifElse,
	PureBindingPart
} from "sap/fe/core/helpers/BindingExpression";
import { Draft } from "sap/fe/core/converters/helpers/BindingHelper";
import { $$MessageType, library } from "sap/ui/core";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import tableFormatters from "sap/fe/core/formatters/TableFormatter";

const MessageType = library.MessageType;

export type TableAnnotationConfiguration = {
	autoBindOnInit: boolean;
	collection: string;
	enableControlVM?: boolean;
	filterId?: string;
	id: string;
	isEntitySet: boolean;
	navigationPath: string;
	p13nMode?: string;
	row?: {
		action?: string;
		press?: string;
		rowHighlighting: BindingExpression<$$MessageType>;
		rowNavigated: BindingExpression<boolean>;
	};
	selectionMode: string;
	show?: {
		create?: string | boolean;
		delete?: string | boolean;
		update?: string | boolean;
	};
	threshold: number;
	entityName: string;

	/** Create new entries */
	create: CreateBehaviour | CreateBehaviourExternal;
};

/**
 * New entries are created within the app (default case)
 */
type CreateBehaviour = {
	mode: CreationMode;
	append: Boolean;
	newAction?: string;
	navigateToTarget?: string;
};

/**
 * New entries are created by navigating to some target
 */
type CreateBehaviourExternal = {
	mode: "External";
	outbound: string;
	outboundDetail: NavigationTargetConfiguration["outboundDetail"];
	navigationSettings: NavigationSettingsConfiguration;
};

type TableCapabilityRestriction = {
	isDeletable: boolean;
	isUpdatable: boolean;
};

export type TableFiltersConfiguration = {
	paths: [
		{
			annotationPath: string;
		}
	];
	showCounts?: boolean;
};

export type SelectionVariantConfiguration = {
	propertyNames: string[];
	text: string;
};

export type TableControlConfiguration = {
	enableAutoScroll: boolean;
	createAtEnd: boolean;
	creationMode: CreationMode;
	disableAddRowButtonForEmptyData?: boolean;
	enableExport?: boolean;
	headerVisible?: boolean;
	filters?: Record<string, TableFiltersConfiguration>;
	type?: string;
};

enum ColumnType {
	Default = "Default", // Default Type
	Annotation = "Annotation"
}

export type BaseTableColumn = ConfigurableObject & {
	id: string;
	width?: string;
	template: string;
	name: string;
	visible: BindingExpression<boolean>;
	personalizationOnly: boolean;
	type: ColumnType; //Origin of the source where we are getting the templated information from,
	isNavigable?: boolean;
};

export type CustomTableColumn = BaseTableColumn & {
	creationTemplate?: string;
	header?: string;
};

export type AnnotationTableColumn = BaseTableColumn & {
	annotationPath: string;
};

type TableColumn = CustomTableColumn | AnnotationTableColumn;

export type CustomColumn = CustomElement<TableColumn>;

export type TableVisualization = {
	type: VisualizationType.Table;
	annotation: TableAnnotationConfiguration;
	control: TableControlConfiguration;
	columns: TableColumn[];
	actions: BaseAction[];
};

/**
 * Returns an array of all annotation based and manifest based table actions.
 *
 * @param {LineItem} lineItemAnnotation
 * @param {string} visualizationPath
 * @param {ConverterContext} converterContext
 * @param {NavigationSettingsConfiguration} navigationSettings
 * @returns {TableAction} the complete table actions
 */
export function getTableActions(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings?: NavigationSettingsConfiguration
): BaseAction[] {
	return insertCustomElements(
		getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext),
		getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, navigationSettings, true),
		{ isNavigable: "overwrite", enableOnSelect: "overwrite" }
	);
}

/**
 * Returns an array off all columns, annotation based as well as manifest based.
 * They are sorted and some properties of can be overwritten through the manifest (check out the overwritableKeys).
 *
 * @param {LineItem} lineItemAnnotation Collection of data fields for representation in a table or list
 * @param {string} visualizationPath
 * @param {ConverterContext} converterContext
 * @param {NavigationSettingsConfiguration} navigationSettings
 * @returns {TableColumn} Returns all table columns that should be available, regardless of templating or personalization or their origin
 */
export function getTableColumns(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings?: NavigationSettingsConfiguration
): TableColumn[] {
	return insertCustomElements(
		getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext),
		getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, navigationSettings),
		{ width: "overwrite", isNavigable: "overwrite" }
	);
}

export function createTableVisualization(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	presentationVariantAnnotation?: PresentationVariantTypeTypes
): TableVisualization {
	const tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext);
	const { navigationPropertyPath } = splitPath(visualizationPath);
	const entitySet = converterContext.getEntitySet();
	const entityName: string = entitySet.name,
		isEntitySet: boolean = navigationPropertyPath.length === 0;
	const navigationOrCollectionName = isEntitySet ? entityName : navigationPropertyPath;
	const navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationOrCollectionName);
	return {
		type: VisualizationType.Table,
		annotation: getTableAnnotationConfiguration(
			lineItemAnnotation,
			visualizationPath,
			converterContext,
			tableManifestConfig,
			presentationVariantAnnotation
		),
		control: tableManifestConfig,
		actions: getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings),
		columns: getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings)
	};
}

export function createDefaultTableVisualization(converterContext: ConverterContext): TableVisualization {
	const tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext);
	return {
		type: VisualizationType.Table,
		annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig),
		control: tableManifestConfig,
		actions: [],
		columns: getColumnsFromEntityType(converterContext.getEntitySet().entityType, [], converterContext)
	};
}

/**
 * Loop through the datafield of a lineitem to find the actions that will be put in the toolbar
 * And check if they require a context or not.
 *
 * @param lineItemAnnotation
 * @returns {boolean} if it's the case
 */
function hasActionRequiringContext(lineItemAnnotation: LineItem): boolean {
	return lineItemAnnotation.some(dataField => {
		if (dataField.$Type === UIAnnotationTypes.DataFieldForAction) {
			return dataField.Inline !== true;
		} else if (dataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation) {
			return dataField.Inline !== true && dataField.RequiresContext;
		}
	});
}

/**
 * Evaluate if the visualization path is deletable or updatable
 * The algorithm is as follow
 * - Evaluate if there is a NavigationRestrictions.Deletable or NavigationRestrictions.Updatable on the full navigationPath
 * - Go down the entity set of the path evaluating the same element and for the last part evaluate the DeleteRestrictions.Deletable or UpdateRestrictions.Updatable there.
 *
 * @param visualizationPath
 * @param converterContext
 * @returns {TableCapabilityRestriction} the table capabilities
 */
export function getCapabilityRestriction(visualizationPath: string, converterContext: ConverterContext): TableCapabilityRestriction {
	const { navigationPropertyPath } = splitPath(visualizationPath);
	const navigationPropertyPathParts = navigationPropertyPath.split("/");
	const oCapabilityRestriction = { isDeletable: true, isUpdatable: true };
	let currentEntitySet: EntitySet | null = converterContext.getEntitySet();
	while (
		(oCapabilityRestriction.isDeletable || oCapabilityRestriction.isUpdatable) &&
		currentEntitySet &&
		navigationPropertyPathParts.length > 0
	) {
		const pathsToCheck: string[] = [];
		navigationPropertyPathParts.reduce((paths, navigationPropertyPathPart) => {
			if (paths.length > 0) {
				paths += "/";
			}
			paths += navigationPropertyPathPart;
			pathsToCheck.push(paths);
			return paths;
		}, "");
		let hasRestrictedPathOnDelete = false,
			hasRestrictedPathOnUpdate = false;
		currentEntitySet.annotations.Capabilities?.NavigationRestrictions?.RestrictedProperties.forEach(
			(restrictedNavProp: NavigationPropertyRestrictionTypes) => {
				if (restrictedNavProp?.NavigationProperty?.type === "NavigationPropertyPath") {
					if (restrictedNavProp.DeleteRestrictions?.Deletable === false) {
						hasRestrictedPathOnDelete =
							hasRestrictedPathOnDelete || pathsToCheck.indexOf(restrictedNavProp.NavigationProperty.value) !== -1;
					} else if (restrictedNavProp.UpdateRestrictions?.Updatable === false) {
						hasRestrictedPathOnUpdate =
							hasRestrictedPathOnUpdate || pathsToCheck.indexOf(restrictedNavProp.NavigationProperty.value) !== -1;
					}
				}
			}
		);
		oCapabilityRestriction.isDeletable = !hasRestrictedPathOnDelete;
		oCapabilityRestriction.isUpdatable = !hasRestrictedPathOnUpdate;
		const navPropName = navigationPropertyPathParts.shift();
		if (navPropName) {
			const navProp: NavigationProperty = currentEntitySet.entityType.navigationProperties.find(
				navProp => navProp.name == navPropName
			) as NavigationProperty;
			if (navProp && !navProp.containsTarget && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navPropName)) {
				currentEntitySet = currentEntitySet.navigationPropertyBinding[navPropName];
			} else {
				// Contained navProp means no entitySet to report to
				currentEntitySet = null;
			}
		}
	}
	if (currentEntitySet !== null && currentEntitySet.annotations) {
		if (oCapabilityRestriction.isDeletable) {
			// If there is still an entityset, check the entityset deletable status
			oCapabilityRestriction.isDeletable = currentEntitySet.annotations.Capabilities?.DeleteRestrictions?.Deletable !== false;
		}
		if (oCapabilityRestriction.isUpdatable) {
			// If there is still an entityset, check the entityset updatable status
			oCapabilityRestriction.isUpdatable = currentEntitySet.annotations.Capabilities?.UpdateRestrictions?.Updatable !== false;
		}
	}
	return oCapabilityRestriction;
}

function getSelectionMode(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	isEntitySet: boolean
): string {
	if (!lineItemAnnotation) {
		return SelectionMode.None;
	}
	const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
	let selectionMode = tableManifestSettings.tableSettings?.selectionMode;
	if (selectionMode && selectionMode === SelectionMode.None) {
		if (getCapabilityRestriction(visualizationPath, converterContext).isDeletable) {
			return "{= ${ui>/editMode} === 'Editable' ? '" + SelectionMode.Multi + "' : 'None'}";
		} else {
			selectionMode = SelectionMode.None;
		}
	} else if (!selectionMode || selectionMode === SelectionMode.Auto) {
		selectionMode = SelectionMode.Multi;
	}
	if (hasActionRequiringContext(lineItemAnnotation)) {
		return selectionMode;
	} else if (getCapabilityRestriction(visualizationPath, converterContext).isDeletable) {
		if (!isEntitySet) {
			return "{= ${ui>/editMode} === 'Editable' ? '" + selectionMode + "' : 'None'}";
		} else {
			return selectionMode;
		}
	}
	return SelectionMode.None;
}

/**
 * Method to retrieve all table actions from annotations.
 *
 * @param lineItemAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns {Record<BaseAction, BaseAction>} the table annotation actions
 */
function getTableAnnotationActions(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext
): BaseAction[] {
	const tableActions: BaseAction[] = [];
	if (lineItemAnnotation) {
		const absolutePath = converterContext.getAbsoluteAnnotationPath(visualizationPath);
		lineItemAnnotation.forEach((dataField: DataFieldAbstractTypes, index) => {
			let tableAction: AnnotationAction | undefined;
			if (
				isDataFieldForActionAbstract(dataField) &&
				!(dataField.annotations?.UI?.Hidden === true) &&
				!dataField.Inline &&
				!dataField.Determining
			) {
				const annotationPath = absolutePath + "/" + index;
				switch (dataField.$Type) {
					case "com.sap.vocabularies.UI.v1.DataFieldForAction":
						tableAction = {
							type: ActionType.DataFieldForAction,
							annotationPath: annotationPath,
							key: "DataFieldForAction::" + dataField.Action.replace(/\//g, "::"),
							isNavigable: true
						};
						break;

					case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
						tableAction = {
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
			if (tableAction) {
				tableActions.push(tableAction);
			}
		});
	}
	return tableActions;
}

function getCriticalityBindingByEnum(CriticalityEnum: EnumValue<CriticalityType>) {
	let criticalityProperty;
	switch (CriticalityEnum) {
		case "UI.CriticalityType/Negative":
			criticalityProperty = MessageType.Error;
			break;
		case "UI.CriticalityType/Critical":
			criticalityProperty = MessageType.Warning;
			break;
		case "UI.CriticalityType/Positive":
			criticalityProperty = MessageType.Success;
			break;
		case "UI.CriticalityType/Neutral":
		default:
			criticalityProperty = MessageType.None;
	}
	return criticalityProperty;
}

function getHighlightRowBinding(
	criticalityAnnotation: PathAnnotationExpression<CriticalityType> | EnumValue<CriticalityType> | undefined,
	isDraftRoot: boolean
): BindingPart<$$MessageType> {
	let defaultHighlightRowDefinition: BindingPart<any> = MessageType.None;
	if (criticalityAnnotation) {
		if (typeof criticalityAnnotation === "object") {
			defaultHighlightRowDefinition = annotationExpression(criticalityAnnotation);
		} else {
			// Enum Value so we get the corresponding static part
			defaultHighlightRowDefinition = getCriticalityBindingByEnum(criticalityAnnotation);
		}
	}
	return ifElse(
		isDraftRoot && Draft.IsNewObject,
		MessageType.Information,
		formatResult([defaultHighlightRowDefinition], tableFormatters.rowHighlighting)
	);
}

function _getCreationBehaviour(
	lineItemAnnotation: LineItem | undefined,
	tableManifestConfiguration: TableControlConfiguration,
	converterContext: ConverterContext,
	navigationSettings: NavigationSettingsConfiguration
): TableAnnotationConfiguration["create"] {
	const navigation = navigationSettings?.create || navigationSettings?.detail;

	// cross-app
	if (navigation?.outbound && navigation.outboundDetail && navigationSettings?.create) {
		return {
			mode: "External",
			outbound: navigation.outbound,
			outboundDetail: navigation.outboundDetail,
			navigationSettings: navigationSettings
		};
	}

	let newAction;
	if (lineItemAnnotation) {
		// in-app
		const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
		const targetAnnotations = converterContext.getEntitySetForEntityType(targetEntityType)?.annotations;
		newAction = targetAnnotations?.Common?.DraftRoot?.NewAction || targetAnnotations?.Session?.StickySessionSupported?.NewAction; // TODO: Is there really no 'NewAction' on DraftNode? targetAnnotations?.Common?.DraftNode?.NewAction

		if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
			// A combination of 'CreationRow' and 'NewAction' does not make sense
			// TODO: Or does it?
			throw Error(`Creation mode '${CreationMode.CreationRow}' can not be used with a custom 'new' action (${newAction})`);
		}
		if (navigation?.route) {
			// route specified
			return {
				mode: tableManifestConfiguration.creationMode,
				append: tableManifestConfiguration.createAtEnd,
				newAction: newAction,
				navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
			};
		}
	}

	// no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
	if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
		tableManifestConfiguration.creationMode = CreationMode.Inline;
	}

	return {
		mode: tableManifestConfiguration.creationMode,
		append: tableManifestConfiguration.createAtEnd,
		newAction: newAction
	};
}

const _getRowConfigurationProperty = function(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings: NavigationSettingsConfiguration,
	targetPath: string
) {
	let pressProperty, navigationTarget;
	let criticalityProperty: BindingPart<$$MessageType> = MessageType.None;
	const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
	if (navigationSettings && lineItemAnnotation) {
		navigationTarget = navigationSettings.display?.target || navigationSettings.detail?.outbound;
		if (navigationTarget) {
			pressProperty =
				".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
		} else if ((navigationTarget = navigationSettings.detail?.route)) {
			if (targetEntityType) {
				const targetEntitySet = converterContext.getEntitySetForEntityType(targetEntityType);
				if (targetEntitySet) {
					const targetAnnotations = targetEntitySet.annotations;
					criticalityProperty = getHighlightRowBinding(
						lineItemAnnotation.annotations?.UI?.Criticality,
						!!targetAnnotations.Common?.DraftRoot || !!targetAnnotations.Common?.DraftNode
					);
					pressProperty =
						".routing.navigateForwardToContext(${$parameters>bindingContext}, { targetPath: '" +
						targetPath +
						"', editable : " +
						(targetAnnotations?.Common?.DraftRoot || targetAnnotations?.Common?.DraftNode
							? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')"
							: "undefined") +
						"})"; //Need to access to DraftRoot and DraftNode !!!!!!!
				}
			}
		}
	}
	const rowNavigatedExpression: PureBindingPart<boolean> = ifElse(
		converterContext.getManifestWrapper().isFclEnabled(),
		formatResult([bindingExpression("/deepestPath", "fclnavigated")], tableFormatters.fclNavigatedRow, targetEntityType),
		false
	);
	return {
		press: pressProperty,
		action: pressProperty ? "Navigation" : undefined,
		rowHighlighting: compileBinding(criticalityProperty),
		rowNavigated: compileBinding(rowNavigatedExpression)
	};
};

/**
 * Retrieve the columns from the entityType.
 *
 * @param entityType
 * @param annotationColumns
 * @param converterContext
 * @returns {TableColumn[]} the column from the entityType
 */
const getColumnsFromEntityType = function(
	entityType: EntityType,
	annotationColumns: AnnotationTableColumn[] = [],
	converterContext: ConverterContext
): TableColumn[] {
	const tableColumns: TableColumn[] = [];
	entityType.entityProperties.forEach((property: Property) => {
		// Catch already existing columns - which were added before by LineItem Annotations
		const exists = annotationColumns.some(column => {
			return column.name === property.name;
		});

		if (!exists) {
			const entityName = (converterContext.getEntitySetForEntityType(entityType) || entityType).name;
			tableColumns.push({
				key: "DataField::" + property.name,
				type: ColumnType.Annotation,
				annotationPath: "/" + entityName + "/" + property.name,
				personalizationOnly: true,
				name: property.name,
				visible: converterContext.getInverseBindingExpression(property.annotations?.UI?.Hidden, true),
				template: "sap.fe.macros.table.ColumnProperty"
			} as AnnotationTableColumn);
		}
	});
	return tableColumns;
};

/**
 * Returns boolean true for valid columns, false for invalid columns.
 *
 * @param {DataFieldAbstractTypes} dataField Different DataField types defined in the annotations
 * @returns {boolean} True for valid columns, false for invalid columns
 * @private
 */
const _isValidColumn = function(dataField: DataFieldAbstractTypes) {
	switch (dataField.$Type) {
		case "com.sap.vocabularies.UI.v1.DataFieldForAction":
		case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
			return !!dataField.Inline;
		case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
		case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
			return false;
		case "com.sap.vocabularies.UI.v1.DataField":
		case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
		case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
		case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
			return true;
		default:
		// Todo: Replace with proper Log statement once available
		//  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
	}
};

/**
 * Getting the Column Name
 * If it points to a DataField with one property or DataPoint with one property it will use the property name
 * here to be consistent with the existing flex changes.
 *
 * @param {DataFieldAbstractTypes} dataField Different DataField types defined in the annotations
 * @returns {string} Returns name of annotation columns
 * @private
 */
const _getAnnotationColumnName = function(dataField: DataFieldAbstractTypes) {
	// This is needed as we have flexibility changes already that we have to check against
	if (isDataFieldTypes(dataField)) {
		return dataField.Value?.path;
	} else if (dataField.$Type === UIAnnotationTypes.DataFieldForAnnotation && dataField.Target?.$target?.Value?.path) {
		// This is for removing duplicate properties. For example the Progress Property if removed if it already is defined as a DataPoint
		return dataField.Target.$target.Value.path;
	} else {
		return KeyHelper.generateKeyFromDataField(dataField);
	}
};

/**
 * Returns line items from metadata annotations.
 *
 * @param lineItemAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns {TableColumn[]} the columns from the annotations
 */
const getColumnsFromAnnotations = function(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext
): TableColumn[] {
	const entityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
	const annotationColumns: AnnotationTableColumn[] = [];
	if (lineItemAnnotation) {
		// Get columns from the LineItem Annotation

		lineItemAnnotation.forEach((lineItem, lineItemIndex) => {
			if (!_isValidColumn(lineItem)) {
				return;
			}

			const annotationReference = converterContext.getAbsoluteAnnotationPath(visualizationPath) + "/" + lineItemIndex;
			annotationColumns.push({
				annotationPath: annotationReference,
				type: ColumnType.Annotation,
				key: KeyHelper.generateKeyFromDataField(lineItem),
				width: lineItem.annotations?.HTML5?.CssDefaults?.width || undefined,
				personalizationOnly: false,
				name: _getAnnotationColumnName(lineItem),
				visible: converterContext.getInverseBindingExpression(lineItem.annotations?.UI?.Hidden, true),
				isNavigable: true
			} as AnnotationTableColumn);
		});
	}

	// Get columns from the Properties of EntityType
	let tableColumns = getColumnsFromEntityType(entityType, annotationColumns, converterContext);
	tableColumns = tableColumns.concat(annotationColumns);

	return tableColumns;
};

/**
 * Returns table column definitions from manifest.
 *
 * @param columns
 * @param navigationSettings
 * @returns {Record<string, CustomColumn>} the columns from the manifest
 */
const getColumnsFromManifest = function(
	columns: Record<string, ManifestTableColumn>,
	navigationSettings?: NavigationSettingsConfiguration
): Record<string, CustomColumn> {
	const internalColumns: Record<string, CustomColumn> = {};
	for (const key in columns) {
		const manifestColumn = columns[key];
		KeyHelper.isKeyValid(key);
		internalColumns[key] = {
			key: key,
			id: "CustomColumn::" + key,
			name: "CustomColumn::" + key,
			header: manifestColumn.header,
			width: manifestColumn.width || undefined,
			type: ColumnType.Default,
			personalizationOnly: false,
			template: manifestColumn.template || "undefined",
			visible: true,
			position: {
				anchor: manifestColumn.position?.anchor,
				placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
			},
			isNavigable: isActionNavigable(manifestColumn, navigationSettings, true)
		};
	}
	return internalColumns;
};

export function getP13nMode(visualizationPath: string, converterContext: ConverterContext): string | undefined {
	const manifestWrapper: ManifestWrapper = converterContext.getManifestWrapper();
	const tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const hasVariantManagement: boolean = ["Page", "Control"].indexOf(manifestWrapper.getVariantManagement()) > -1;
	let personalization: any = true;
	const aPersonalization: string[] = [];
	if (tableManifestSettings?.tableSettings?.personalization !== undefined) {
		personalization = tableManifestSettings.tableSettings.personalization;
	}
	const isTableInObjectPage = converterContext.getTemplateConverterType() === "ObjectPage";
	if (hasVariantManagement && personalization) {
		if (personalization === true) {
			// Filtering in p13n supported only on ObjectPage.
			return isTableInObjectPage ? "Sort,Column,Filter" : "Sort,Column";
		} else if (typeof personalization === "object") {
			if (personalization.column) {
				aPersonalization.push("Column");
			}
			if (personalization.sort) {
				aPersonalization.push("Sort");
			}
			if (personalization.filter && isTableInObjectPage) {
				aPersonalization.push("Filter");
			}
			return aPersonalization.join(",");
		}
	}
	return undefined;
}

function getDeleteHidden(currentEntitySet: EntitySet, navigationPath: string) {
	let isDeleteHidden: any = false;
	if (navigationPath) {
		// Check if UI.DeleteHidden is pointing to parent path
		const deleteHiddenAnnotation = currentEntitySet.navigationPropertyBinding[navigationPath]?.annotations?.UI?.DeleteHidden;
		if (deleteHiddenAnnotation && (deleteHiddenAnnotation as any).path) {
			if ((deleteHiddenAnnotation as any).path.indexOf("/") > 0) {
				const aSplitHiddenPath = (deleteHiddenAnnotation as any).path.split("/");
				const sNavigationPath = aSplitHiddenPath[0];
				const partnerName = (currentEntitySet as any).entityType.navigationProperties.find(
					(navProperty: any) => navProperty.name === navigationPath
				).partner;
				if (partnerName === sNavigationPath) {
					isDeleteHidden = deleteHiddenAnnotation;
				}
			} else {
				isDeleteHidden = false;
			}
		} else {
			isDeleteHidden = deleteHiddenAnnotation;
		}
	} else {
		isDeleteHidden = currentEntitySet.annotations?.UI?.DeleteHidden;
	}
	return isDeleteHidden;
}

/**
 * Returns visibility for Delete button
 * @param isListReport
 * @param converterContext
 * @param navigationPath
 * @param sTemplateType
 * @param isTargetDeletable
 */

export function getDeleteVisible(
	isListReport: boolean,
	converterContext: ConverterContext,
	navigationPath: string,
	sTemplateType: string,
	isTargetDeletable: boolean
): string | undefined | boolean {
	const currentEntitySet: EntitySet | null = converterContext.getEntitySet();
	const isDeleteHidden: any = getDeleteHidden(currentEntitySet, navigationPath);

	if (isDeleteHidden === true || isTargetDeletable === false || sTemplateType === "AnalyticalListPage") {
		return false;
	} else if (!isListReport) {
		if (isDeleteHidden) {
			return "{= !${" + (navigationPath ? navigationPath + "/" : "") + isDeleteHidden.path + "} && ${ui>/editMode} === 'Editable'}";
		} else {
			return "{= ${ui>/editMode} === 'Editable'}";
		}
	} else {
		return true;
	}
}

function getInsertable(currentEntitySet: EntitySet, navigationPath: string): boolean {
	let isInsertable: boolean = true;
	let hasNavigationInsertRestriction: boolean = false;
	const RestrictedProperties = currentEntitySet?.annotations?.Capabilities?.NavigationRestrictions?.RestrictedProperties;
	if (navigationPath && RestrictedProperties) {
		const restrictedProperty = RestrictedProperties.find(
			restrictedProperty =>
				restrictedProperty?.NavigationProperty?.type === "NavigationPropertyPath" &&
				restrictedProperty?.NavigationProperty?.value === navigationPath &&
				restrictedProperty?.InsertRestrictions
		);
		if (restrictedProperty) {
			isInsertable = restrictedProperty?.InsertRestrictions?.Insertable !== false;
			hasNavigationInsertRestriction = true;
		}
	}
	if (navigationPath && !hasNavigationInsertRestriction) {
		isInsertable =
			currentEntitySet?.navigationPropertyBinding[navigationPath]?.annotations?.Capabilities?.InsertRestrictions?.Insertable !==
			false;
	} else if (!navigationPath) {
		isInsertable = currentEntitySet?.annotations?.Capabilities?.InsertRestrictions?.Insertable !== false;
	}
	return isInsertable;
}

function getCreateHidden(currentEntitySet: EntitySet, navigationPath: string) {
	let isCreateHidden: any = false;
	if (navigationPath) {
		// Check if UI.CreateHidden is pointing to parent path
		const createHiddenAnnotation = currentEntitySet.navigationPropertyBinding[navigationPath]?.annotations?.UI?.CreateHidden;
		if (createHiddenAnnotation && (createHiddenAnnotation as any).path) {
			if ((createHiddenAnnotation as any).path.indexOf("/") > 0) {
				const aSplitHiddenPath = (createHiddenAnnotation as any).path.split("/");
				const sNavigationPath = aSplitHiddenPath[0];
				const partnerName = (currentEntitySet as any).entityType.navigationProperties.find(
					(navProperty: any) => navProperty.name === navigationPath
				).partner;
				if (partnerName === sNavigationPath) {
					isCreateHidden = createHiddenAnnotation;
				}
			} else {
				isCreateHidden = false;
			}
		} else {
			isCreateHidden = createHiddenAnnotation;
		}
	} else {
		isCreateHidden = currentEntitySet.annotations?.UI?.CreateHidden;
	}
	return isCreateHidden;
}

/**
 * Returns visibility for Create button
 *
 * @param isListReport
 * @param converterContext
 * @param navigationPath
 * @param sTemplateType
 * @returns {*} Expression or Boolean value of createhidden
 */

export function getCreateVisible(
	isListReport: boolean,
	converterContext: ConverterContext,
	navigationPath: string,
	sTemplateType: string
): string | undefined | boolean {
	const currentEntitySet: EntitySet | null = converterContext.getEntitySet();
	const isCreateHidden: any = getCreateHidden(currentEntitySet, navigationPath);
	const isInsertable: boolean = getInsertable(currentEntitySet, navigationPath);

	if (isCreateHidden === true || isInsertable === false || sTemplateType === "AnalyticalListPage") {
		return false;
	} else if (!isListReport) {
		if (isCreateHidden) {
			return "{= !${" + (navigationPath ? navigationPath + "/" : "") + isCreateHidden.path + "} && ${ui>/editMode} === 'Editable'}";
		} else {
			return "{= ${ui>/editMode} === 'Editable'}";
		}
	} else {
		return true;
	}
}

export function getTableAnnotationConfiguration(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	tableManifestConfiguration: TableControlConfiguration,
	presentationVariantAnnotation?: PresentationVariantTypeTypes
): TableAnnotationConfiguration {
	// Need to get the target
	const { navigationPropertyPath } = splitPath(visualizationPath);
	const entitySet = converterContext.getEntitySet();
	const pageManifestSettings: ManifestWrapper = converterContext.getManifestWrapper();
	const entityName: string = entitySet.name,
		isEntitySet: boolean = navigationPropertyPath.length === 0,
		p13nMode: string | undefined = getP13nMode(visualizationPath, converterContext),
		id = TableID(isEntitySet ? entityName : navigationPropertyPath, "LineItem");
	const selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet);
	const sTemplateType = converterContext.getTemplateConverterType();
	const isALP = sTemplateType === "AnalyticalListPage";
	const isListReport = sTemplateType === "ListReport";
	const targetCapabilities = getCapabilityRestriction(visualizationPath, converterContext);
	const isTargetDeletable = targetCapabilities.isDeletable;
	let threshold = isEntitySet ? 30 : 10;
	if (presentationVariantAnnotation && presentationVariantAnnotation.MaxItems) {
		threshold = presentationVariantAnnotation.MaxItems as number;
	}

	const navigationOrCollectionName = isEntitySet ? entityName : navigationPropertyPath;
	const navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationOrCollectionName);

	return {
		id: id,
		entityName: entityName,
		collection: "/" + entityName + (!isEntitySet ? "/" + navigationPropertyPath : ""),
		navigationPath: navigationPropertyPath,
		isEntitySet: isEntitySet,
		row: _getRowConfigurationProperty(
			lineItemAnnotation,
			visualizationPath,
			converterContext,
			navigationSettings,
			navigationOrCollectionName
		),
		p13nMode: p13nMode,
		show: {
			"delete": getDeleteVisible(isListReport, converterContext, navigationPropertyPath, sTemplateType, isTargetDeletable),
			create: getCreateVisible(isListReport, converterContext, navigationPropertyPath, sTemplateType),
			update: getUpdatable(sTemplateType)
		},
		create: _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings),
		selectionMode: selectionMode,
		autoBindOnInit: !isListReport && !isALP,
		enableControlVM: pageManifestSettings.getVariantManagement() === "Control" && !!p13nMode,
		threshold: threshold
	};
}

function getUpdatable(sTemplateType: string) {
	if (sTemplateType === "AnalyticalListPage" || sTemplateType === "ListReport") {
		return "Display";
	}
	// updatable will be handled at the property level
	return "{ui>/editMode}";
}
/**
 * Split the visualization path into the navigation property path and annotation.
 *
 * @param visualizationPath
 * @returns {object}
 */
function splitPath(visualizationPath: string) {
	let [navigationPropertyPath, annotationPath] = visualizationPath.split("@");

	if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
		// Drop trailing slash
		navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
	}
	return { navigationPropertyPath, annotationPath };
}

export function getSelectionVariantConfiguration(
	selectionVariantPath: string,
	converterContext: ConverterContext
): SelectionVariantConfiguration | undefined {
	const selection: SelectionVariantType = converterContext.getEntityTypeAnnotation(selectionVariantPath) as SelectionVariantType;

	if (selection) {
		const propertyNames: string[] = [];
		selection.SelectOptions?.forEach((selectOption: SelectOptionType) => {
			const propertyName: any = selectOption.PropertyName;
			const PropertyPath: string = propertyName.value;
			if (propertyNames.indexOf(PropertyPath) === -1) {
				propertyNames.push(PropertyPath);
			}
		});
		return {
			text: selection.Text as string,
			propertyNames: propertyNames
		};
	}
	return undefined;
}

export function getTableManifestConfiguration(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext
): TableControlConfiguration {
	const tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const tableSettings = tableManifestSettings.tableSettings;
	let quickSelectionVariant: any;
	const quickFilterPaths: { annotationPath: string }[] = [];
	let enableExport = true;
	let creationMode = CreationMode.NewPage;
	let filters;
	let enableAutoScroll = false;
	let createAtEnd = true;
	let disableAddRowButtonForEmptyData = false;
	let hideTableTitle = false;
	let tableType = "ResponsiveTable";

	if (tableSettings && lineItemAnnotation) {
		const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
		tableSettings?.quickVariantSelection?.paths?.forEach((path: { annotationPath: string }) => {
			quickSelectionVariant = targetEntityType.resolvePath("@" + path.annotationPath);
			// quickSelectionVariant = converterContext.getEntityTypeAnnotation(path.annotationPath);
			if (quickSelectionVariant) {
				quickFilterPaths.push({ annotationPath: path.annotationPath });
			}
			filters = {
				quickFilters: {
					showCounts: tableSettings?.quickVariantSelection?.showCounts,
					paths: quickFilterPaths
				}
			};
		});

		enableExport = tableSettings.enableExport !== undefined ? tableSettings.enableExport : true;
		creationMode = tableSettings.creationMode?.name || creationMode;
		enableAutoScroll = tableSettings.enableAutoScroll;
		createAtEnd = tableSettings.creationMode?.createAtEnd !== undefined ? tableSettings.creationMode?.createAtEnd : true;
		disableAddRowButtonForEmptyData = !!tableSettings.creationMode?.disableAddRowButtonForEmptyData;
		hideTableTitle = !!tableSettings.quickVariantSelection?.hideTableTitle;
		tableType = tableSettings.type;
	}
	return {
		enableAutoScroll: enableAutoScroll,
		filters: filters,
		type: tableType,
		headerVisible: !(quickSelectionVariant && hideTableTitle),
		enableExport: enableExport,
		creationMode: creationMode,
		createAtEnd: createAtEnd,
		disableAddRowButtonForEmptyData: disableAddRowButtonForEmptyData
	};
}
