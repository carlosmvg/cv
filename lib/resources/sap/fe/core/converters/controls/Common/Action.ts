import { Action, Boolean, PropertyAnnotationValue } from "@sap-ux/vocabularies-types";
import { ConverterContext } from "../../templates/BaseConverter";
import { ActionType, ManifestAction, NavigationSettingsConfiguration, ManifestTableColumn } from "sap/fe/core/converters/ManifestSettings";
import { ConfigurableObject, CustomElement, Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { CustomActionID } from "sap/fe/core/converters/helpers/ID";
import { BindingExpression } from "sap/fe/core/helpers/BindingExpression";

export type BaseAction = ConfigurableObject & {
	id?: string;
	text?: string;
	type: ActionType;
	press?: string;
	enabled?: BindingExpression<boolean>;
	visible?: BindingExpression<boolean>;
	enableOnSelect?: string;
	isNavigable?: boolean;
};

export type AnnotationAction = BaseAction & {
	type: ActionType.DataFieldForIntentBasedNavigation | ActionType.DataFieldForAction;
	annotationPath: string;
	id?: string;
	customData?: string;
};

/**
 * Custom Action Definition
 *
 * @typedef CustomAction
 */
export type CustomAction = CustomElement<
	BaseAction & {
		type: ActionType.Default;
		handlerMethod: string;
		handlerModule: string;
	}
>;

// Reuse of ConfigurableObject and CustomElement is done for ordering
export type ConverterAction = AnnotationAction | CustomAction;

/**
 * Create the action configuration based on the manifest settings.
 * @param {Record<string, ManifestAction> | undefined} manifestActions the manifest definition
 * @param {NavigationSettingsConfiguration} navigationSettings
 * @param {boolean} considerNavigationSettings
 * @returns {Record<string, CustomAction>} the actions from the manifest
 */
export function getActionsFromManifest(
	manifestActions: Record<string, ManifestAction> | undefined,
	navigationSettings?: NavigationSettingsConfiguration,
	considerNavigationSettings?: boolean
): Record<string, CustomAction> {
	const actions: Record<string, CustomAction> = {};
	for (const actionKey in manifestActions) {
		const manifestAction: ManifestAction = manifestActions[actionKey];
		const lastDotIndex = manifestAction.press?.lastIndexOf(".");
		actions[actionKey] = {
			id: CustomActionID(actionKey),
			visible: manifestAction.visible === undefined ? "true" : manifestAction.visible,
			enabled: manifestAction.enabled === undefined ? "true" : manifestAction.enabled,
			handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
			handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
			press: manifestAction.press,
			type: ActionType.Default,
			text: manifestAction.text,
			key: actionKey,
			enableOnSelect: manifestAction.enableOnSelect,
			position: {
				anchor: manifestAction.position?.anchor,
				placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
			},
			isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings)
		};
	}
	return actions;
}

export function getEnabledBinding(actionDefinition: Action | undefined, converterContext: ConverterContext): string {
	if (!actionDefinition) {
		return "true";
	}
	if (!actionDefinition.isBound) {
		return "true";
	}
	const operationAvailable = actionDefinition.annotations?.Core?.OperationAvailable;
	if (operationAvailable) {
		let bindingExpression = converterContext.getBindingExpression<string>(operationAvailable as PropertyAnnotationValue<Boolean>);
		if (bindingExpression) {
			/**
			 * Action Parameter is ignored by the formatter when trigger by templating
			 * here it's done manually
			 **/
			let paramSuffix = actionDefinition.parameters?.[0]?.fullyQualifiedName;
			if (paramSuffix) {
				paramSuffix = paramSuffix.replace(actionDefinition.fullyQualifiedName + "/", "");
				bindingExpression = bindingExpression.replace(paramSuffix + "/", "");
			}
			return bindingExpression;
		}
		return "true";
	}
	return "true";
	/*
	   FIXME Disable failing music tests
		Due to limitation on CAP the following binding (which is the good one) generates error:
				   return "{= !${#" + field.Action + "} ? false : true }";
		CAP tries to read the action as property and doesn't find it
	*/
}

export function isActionNavigable(
	action: ManifestAction | ManifestTableColumn,
	navigationSettings?: NavigationSettingsConfiguration,
	considerNavigationSettings?: boolean
): boolean {
	let bIsNavigationConfigured: boolean = true;
	if (considerNavigationSettings) {
		const detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
		bIsNavigationConfigured = detailOrDisplay?.route ? true : false;
	}
	if ((action && action.afterExecution && action.afterExecution?.navigateToInstance === false) || !bIsNavigationConfigured) {
		return false;
	}
	return true;
}
