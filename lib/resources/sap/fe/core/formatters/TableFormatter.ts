import { $$MessageType, library } from "sap/ui/core";
import { ManagedObject } from "sap/ui/base";

const MessageType = library.MessageType;
const rowHighlighting = function(criticalityValue: string | number): $$MessageType {
	let criticalityProperty;
	if (typeof criticalityValue === "string") {
		return (criticalityValue as unknown) as $$MessageType;
	}
	switch (criticalityValue) {
		case 1:
			criticalityProperty = MessageType.Error;
			break;
		case 2:
			criticalityProperty = MessageType.Warning;
			break;
		case 3:
			criticalityProperty = MessageType.Success;
			break;
		default:
			criticalityProperty = MessageType.None;
	}
	return criticalityProperty;
};
rowHighlighting.__formatterName = "sap.fe.core.formatters.TableFormatter#rowHighlighting";

const fclNavigatedRow = function(this: ManagedObject, sDeepestPath: string) {
	if (this.getBindingContext() && sDeepestPath && this.getModel("fclnavigated")) {
		return sDeepestPath.indexOf(this.getBindingContext().getPath()) === 0;
	} else {
		return false;
	}
};
fclNavigatedRow.__formatterName = "sap.fe.core.formatters.TableFormatter#fclNavigatedRow";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of table formatters.
 *
 * @param {object} this the context
 * @param {string} sName the inner function name
 * @param {object[]} oArgs the inner function parameters
 * @returns {object} the value from the inner function
 */
const tableFormatters = function(this: object, sName: string, ...oArgs: any[]): any {
	if (tableFormatters.hasOwnProperty(sName)) {
		return (tableFormatters as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

tableFormatters.rowHighlighting = rowHighlighting;
tableFormatters.fclNavigatedRow = fclNavigatedRow;
/**
 * @global
 */
export default tableFormatters;
