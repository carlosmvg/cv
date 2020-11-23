import { and, bindingExpression, BindingPart, equals, not } from "sap/fe/core/helpers/BindingExpression";

export const UI = {
	IsEditable: bindingExpression("/isEditable", "ui") as BindingPart<boolean>,
	IsTransientBinding: equals(bindingExpression("@$ui5.context.isTransient"), true)
};

export const Draft = {
	IsNewObject: and(not(bindingExpression("HasActiveEntity")), not(bindingExpression("IsActiveEntity")))
};
