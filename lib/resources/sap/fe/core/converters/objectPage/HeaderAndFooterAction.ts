import { ActionType } from "../ManifestSettings";
import { EntitySet, EntityType } from "@sap-ux/annotation-converter";
import { AnnotationAction, BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import { DataFieldForActionTypes } from "@sap-ux/vocabularies-types";
import { Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { ConverterContext } from "sap/fe/core/converters/templates/BaseConverter";

/**
 * Retrieve all the data field for actions for the identification annotation
 * They must be
 * - Not statically hidden
 * - Either linked to an Unbound action or to an action which has an OperationAvailable not statically false.
 *
 * @param {EntityType} entityType the current entitytype
 * @param {boolean} bDetermining whether or not the action should be determining
 * @returns {DataFieldForActionTypes[]} an array of datafield for action respecting the bDetermining property
 */
export function getIdentificationDataFieldForActions(entityType: EntityType, bDetermining: boolean): DataFieldForActionTypes[] {
	return (entityType.annotations?.UI?.Identification?.filter(identificationDataField => {
		if (identificationDataField?.annotations?.UI?.Hidden !== true) {
			if (
				identificationDataField?.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" &&
				!!identificationDataField.Determining === bDetermining &&
				(!identificationDataField?.ActionTarget?.isBound ||
					identificationDataField?.ActionTarget?.annotations?.Core?.OperationAvailable !== false)
			) {
				return true;
			}
		}
		return false;
	}) || []) as DataFieldForActionTypes[];
}

const IMPORTANT_CRITICALITIES = [
	"UI.CriticalityType/VeryPositive",
	"UI.CriticalityType/Positive",
	"UI.CriticalityType/Negative",
	"UI.CriticalityType/VeryNegative"
];

export function getHeaderDefaultActions(entitySet: EntitySet, converterContext: ConverterContext): BaseAction[] {
	const oStickySessionSupported = entitySet.annotations?.Session?.StickySessionSupported, //for sticky app
		oDraftRoot = entitySet.annotations.Common?.DraftRoot,
		oEntityDeleteRestrictions = entitySet.annotations?.Capabilities?.DeleteRestrictions,
		bUpdateHidden = entitySet.annotations.UI?.UpdateHidden;

	const headerDataFieldForActions = getIdentificationDataFieldForActions(entitySet.entityType, false);

	// First add the "Critical" DataFieldForActions
	const headerActions: BaseAction[] = headerDataFieldForActions
		.filter(dataField => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) > -1;
		})
		.map(dataField => {
			return {
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
				key: "DataFieldForAction::" + dataField?.Action.replace(/\//g, "::"),
				isNavigable: true
			};
		});

	// Then the edit action if it exists
	if ((oDraftRoot?.EditAction || oStickySessionSupported?.EditAction) && bUpdateHidden !== true) {
		headerActions.push({ type: ActionType.Primary, key: "EditAction" });
	}
	// Then the delete action if we're not statically not deletable
	if (oEntityDeleteRestrictions?.Deletable !== false) {
		headerActions.push({ type: ActionType.Secondary, key: "DeleteAction" });
	}

	// Finally the non critical DataFieldForActions
	headerDataFieldForActions
		.filter(dataField => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) === -1;
		})
		.map(dataField => {
			headerActions.push({
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
				key: "DataFieldForAction::" + dataField?.Action.replace(/\//g, "::"),
				isNavigable: true
			} as AnnotationAction);
		});

	return headerActions;
}

export function getFooterDefaultActions(entitySet: EntitySet, viewLevel: number, converterContext: ConverterContext): BaseAction[] {
	const oStickySessionSupported = entitySet.annotations?.Session?.StickySessionSupported, //for sticky app
		sEntitySetDraftRoot = entitySet.annotations.Common?.DraftRoot?.term || entitySet.annotations?.Session?.StickySessionSupported?.term,
		bConditionSave =
			sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" ||
			(oStickySessionSupported && oStickySessionSupported?.SaveAction),
		bConditionApply = viewLevel > 1,
		bConditionCancel =
			sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" ||
			(oStickySessionSupported && oStickySessionSupported?.DiscardAction);

	// Retrieve all determining actions
	const headerDataFieldForActions = getIdentificationDataFieldForActions(entitySet.entityType, true);

	// First add the "Critical" DataFieldForActions
	const footerActions: BaseAction[] = headerDataFieldForActions
		.filter(dataField => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) > -1;
		})
		.map(dataField => {
			return {
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
				key: "DataFieldForAction::" + dataField?.Action.replace(/\//g, "::"),
				isNavigable: true
			};
		});

	// Then the save action if it exists
	if (bConditionSave) {
		footerActions.push({ type: ActionType.Primary, key: "SaveAction" });
	}

	// Then the apply action if it exists
	if (bConditionApply) {
		footerActions.push({ type: ActionType.DefaultApply, key: "ApplyAction" });
	}

	// Then the non critical DataFieldForActions
	headerDataFieldForActions
		.filter(dataField => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) === -1;
		})
		.map(dataField => {
			footerActions.push({
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
				key: "DataFieldForAction::" + dataField?.Action.replace(/\//g, "::"),
				isNavigable: true
			} as AnnotationAction);
		});

	// Then the cancel action if it exists
	if (bConditionCancel) {
		footerActions.push({
			type: ActionType.Secondary,
			key: "CancelAction",
			position: { placement: Placement.End }
		});
	}
	return footerActions;
}
