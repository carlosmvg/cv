import { ConfigurableRecord, Position, Positionable } from "./helpers/ConfigurableObject";
import { merge } from "sap/base/util";
import { FlexSettings, HeaderFacetType } from "sap/fe/core/converters/controls/ObjectPage/HeaderFacet";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

export enum SectionType {
	Default = "Default", // TBD
	XMLFragment = "XMLFragment"
}

export enum ActionType {
	DataFieldForAction = "ForAction",
	DataFieldForIntentBasedNavigation = "ForNavigation",
	Default = "Default",
	Primary = "Primary",
	Secondary = "Secondary",
	DefaultApply = "DefaultApply"
}

export enum VisualizationType {
	Table = "Table",
	Chart = "Chart"
}

export enum VariantManagementType {
	Page = "Page",
	Control = "Control",
	None = "None"
}

export enum CreationMode {
	NewPage = "NewPage",
	Inline = "Inline",
	CreationRow = "CreationRow"
}

/**
 * @typedef BaseManifestSettings
 */
export type BaseManifestSettings = {
	content?: {
		header?: {
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
			actions?: ConfigurableRecord<ManifestAction>;
		};
		footer?: {
			actions?: ConfigurableRecord<ManifestAction>;
		};
	};
	controlConfiguration?: {
		[annotationPath: string]: ControlManifestConfiguration;
	} & {
		"@com.sap.vocabularies.UI.v1.Facets"?: FacetsControlConfiguration;
		"@com.sap.vocabularies.UI.v1.HeaderFacets"?: HeaderFacetsControlConfiguration;
	};
	entitySet: string;
	navigation: {
		[navigationPath: string]: NavigationSettingsConfiguration;
	};
	viewLevel: number;
	fclEnabled: boolean;
	variantManagement?: VariantManagementType;
};

export type NavigationTargetConfiguration = {
	outbound?: string;
	outboundDetail?: {
		semanticObject: string;
		action: string;
		parameters?: any;
	};
	route?: string;
};

/**
 * @typedef NavigationSettingsConfiguration
 */
export type NavigationSettingsConfiguration = {
	create?: NavigationTargetConfiguration;
	detail?: NavigationTargetConfiguration;
	display?: {
		outbound?: string;
		target?: string; // for compatibility
		route?: string;
	};
};

type HeaderFacetsControlConfiguration = {
	facets: ConfigurableRecord<ManifestHeaderFacet>;
};

type FacetsControlConfiguration = {
	sections: ConfigurableRecord<ManifestSection>;
};

export type ControlManifestConfiguration =
	| TableManifestConfiguration
	| ChartManifestConfiguration
	| FacetsControlConfiguration
	| HeaderFacetsControlConfiguration;

/** Object Page **/

export type ObjectPageManifestSettings = BaseManifestSettings & {
	content?: {
		header?: {
			facets?: ConfigurableRecord<ManifestHeaderFacet>;
		};
		body?: {
			sections?: ConfigurableRecord<ManifestSection>;
		};
	};
	editableHeaderContent: boolean;
};

/**
 * @typedef ManifestHeaderFacet
 */
export type ManifestHeaderFacet = {
	type: HeaderFacetType;
	name: string;
	position?: Position;
	visible?: BindingExpression<boolean>;
	title?: string;
	subTitle?: string;
	stashed?: boolean;
	flexSettings?: FlexSettings;
	requestGroupId?: string;
};

/**
 * @typedef ManifestSection
 */
export type ManifestSection = {
	type: SectionType;
	title: string;
	id?: string;
	name?: string;
	visible?: BindingExpression<boolean>;
	position?: Position;
	subSections?: Record<string, ManifestSubSection>;
	actions?: Record<string, ManifestAction>;
};

export type ManifestSubSection = {
	type: SectionType;
	id?: string;
	name?: string;
	title: string;
	position?: Position;
	visible?: BindingExpression<boolean>;
	actions?: Record<string, ManifestAction>;
};

/** List Report **/

export type ListReportManifestSettings = BaseManifestSettings & {
	initialLoad?: boolean;
	views?: MultipleViewsConfiguration;
};
export type ViewPathConfiguration = {
	keepPreviousPresonalization?: boolean;
	key: string;
	annotationPath: string;
};

/**
 * @typedef MultipleViewsConfiguration
 */
export type MultipleViewsConfiguration = {
	paths: ViewPathConfiguration[];
	showCounts?: boolean;
};

/** Chart Configuration **/

export type ChartPersonalizationManifestSettings =
	| boolean
	| {
			sort: boolean;
			type: boolean;
			item: boolean;
	  };

export type ChartManifestConfiguration = {
	chartSettings: {
		personalization: ChartPersonalizationManifestSettings;
	};
};

export type ActionAfterExecutionConfiguration = {
	navigateToInstance: boolean;
};

/** Table Configuration **/

/**
 * @typedef ManifestAction
 */
export type ManifestAction = {
	visible?: string;
	enabled?: string;
	position?: Position;
	press: string;
	text: string;
	enableOnSelect: string;
	afterExecution?: ActionAfterExecutionConfiguration;
};

export type ManifestTableColumn = Positionable & {
	header: string;
	width?: string;
	template: string;
	afterExecution?: ActionAfterExecutionConfiguration;
};

export type TableManifestConfiguration = {
	tableSettings: TableManifestSettingsConfiguration;
	actions?: Record<string, ManifestAction>;
	columns?: Record<string, ManifestTableColumn>;
};

export enum SelectionMode {
	Auto = "Auto",
	None = "None",
	Multi = "Multi",
	Single = "Single"
}

export type TablePersonalizationConfiguration =
	| boolean
	| {
			sort: boolean;
			column: boolean;
			filter: boolean;
	  };

export type TableManifestSettingsConfiguration = {
	enableAutoScroll: boolean;
	creationMode?: {
		disableAddRowButtonForEmptyData?: boolean;
		createAtEnd?: boolean;
		name?: CreationMode;
	};
	enableExport?: boolean;
	quickVariantSelection: {
		paths: [
			{
				annotationPath: string;
			}
		];
		hideTableTitle?: boolean;
		showCounts?: boolean;
	};
	personalization: TablePersonalizationConfiguration;
	/**
	 * Defines how many items in a table can be selectable. "Auto" defines the selection as "Multi" if there is an action or if it's deletable. If there are no interactions its set to "None" on "Auto". "Multi" let's you select several items, "Single" let's you select one item, None turns of selection.
	 */
	selectionMode: SelectionMode;
	type: string;
};

/**
 * @typedef ManifestWrapper
 */
export type ManifestWrapper = {
	/**
	 * Retrieve the header actions defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestHeaderFacet>} a set of manifest header facets indexed by an iterable key
	 */
	getHeaderFacets(): ConfigurableRecord<ManifestHeaderFacet>;
	/**
	 * Retrieve the header actions defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestAction>} a set of manifest action indexed by an iterable key
	 */
	getHeaderActions(): ConfigurableRecord<ManifestAction>;

	/**
	 * Retrieve the footer actions defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestAction>} a set of manifest action indexed by an iterable key
	 */
	getFooterActions(): ConfigurableRecord<ManifestAction>;

	/**
	 * Retrieve the variant management as defined in the manifest
	 *
	 * @returns {VariantManagementType} a type of variant management
	 */
	getVariantManagement(): VariantManagementType;

	/**
	 * Retrieve the view level
	 */
	getViewLevel(): number;

	/**
	 * Check whether we are in FCL mode or not
	 */
	isFclEnabled(): boolean;

	/**
	 * Retrieve the control configuration as defined in the manifest for a specific annotation path
	 *
	 * @param {string} sAnnotationPath the relative annotation path
	 * @private
	 * @returns {object} the control configuration
	 */
	getControlConfiguration(sAnnotationPath: string): any;

	/**
	 * Retrieve the configured settings for a given navigation target
	 *
	 * @param {string} navigationOrCollectionName
	 * @returns {NavigationSettingsConfiguration} the navigation settings configuration
	 */
	getNavigationConfiguration(navigationOrCollectionName: string): NavigationSettingsConfiguration;

	// OP Specific
	/**
	 * Returns true of the header of the application is editable and should appear in the
	 *
	 * @returns {boolean}
	 */
	isHeaderEditable(): boolean;

	/**
	 * Retrieve the sections defined in the manifest
	 *
	 * @returns {ConfigurableRecord<ManifestSection>} a set of manifest sections indexed by an iterable key
	 */
	getSections(): ConfigurableRecord<ManifestSection>;

	// LR Specific
	/**
	 * Retrieve the multiple view configuration from the manifest
	 *
	 * @returns {MultipleViewsConfiguration} the views that represent the manifest object
	 */
	getViewConfiguration(): MultipleViewsConfiguration | undefined;
};

/**
 * Create a wrapper object that ensure consistent return data from the manifest and that will take care of merging the different manifest "sauce".
 *
 * @param {BaseManifestSettings} oManifestSettings the manifest settings for the current page
 * @returns {ManifestWrapper} the manifest wrapper object
 */
export function createManifestWrapper(oManifestSettings: BaseManifestSettings): ManifestWrapper {
	return {
		getHeaderFacets(): ConfigurableRecord<ManifestHeaderFacet> {
			return merge(
				{},
				oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.HeaderFacets"]?.facets,
				(oManifestSettings as ObjectPageManifestSettings).content?.header?.facets
			);
		},
		getHeaderActions(): ConfigurableRecord<ManifestAction> {
			return oManifestSettings.content?.header?.actions || {};
		},
		getFooterActions(): ConfigurableRecord<ManifestAction> {
			return oManifestSettings.content?.footer?.actions || {};
		},

		getVariantManagement(): VariantManagementType {
			return oManifestSettings.variantManagement || VariantManagementType.None;
		},
		getControlConfiguration(sAnnotationPath: string): any {
			return oManifestSettings?.controlConfiguration?.[sAnnotationPath] || {};
		},
		getNavigationConfiguration(navigationOrCollectionName: string): NavigationSettingsConfiguration {
			return oManifestSettings?.navigation?.[navigationOrCollectionName] || {};
		},

		getSections(): ConfigurableRecord<ManifestSection> {
			return merge(
				{},
				oManifestSettings.controlConfiguration?.["@com.sap.vocabularies.UI.v1.Facets"]?.sections,
				(oManifestSettings as ObjectPageManifestSettings).content?.body?.sections
			);
		},
		isHeaderEditable(): boolean {
			return (oManifestSettings as ObjectPageManifestSettings).editableHeaderContent;
		},

		getViewConfiguration(): MultipleViewsConfiguration | undefined {
			return (oManifestSettings as ListReportManifestSettings).views;
		},

		getViewLevel(): number {
			return oManifestSettings?.viewLevel || -1;
		},

		isFclEnabled(): boolean {
			return !!oManifestSettings?.fclEnabled;
		}
	};
}
