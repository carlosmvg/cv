sap.ui.define(["./FooterActionsBase","sap/fe/test/Utils","sap/ui/test/OpaBuilder","sap/fe/test/builder/FEBuilder"],function(F,U,O,a){"use strict";var b=function(o,f){return F.call(this,o,f);};b.prototype=Object.create(F.prototype);b.prototype.constructor=b;b.prototype.isAction=true;b.prototype.iExecuteSave=function(){var o=this.getBuilder(),s="fe::FooterBar::StandardAction::Save";return this.prepareResult(o.doOnContent(a.Matchers.id(new RegExp(U.formatMessage("{0}$",s))),O.Actions.press()).description("Pressing save action on footer bar").execute());};b.prototype.iExecuteApply=function(){var o=this.getBuilder();return this.prepareResult(o.doOnContent(O.Matchers.resourceBundle("text","sap.fe.templates","T_COMMON_OBJECT_PAGE_APPLY_DRAFT"),O.Actions.press()).description("Pressing apply action on footer bar").execute());};b.prototype.iExecuteCancel=function(){var o=this.getBuilder(),s="fe::FooterBar::StandardAction::Cancel";return this.prepareResult(o.doOnContent(a.Matchers.id(new RegExp(U.formatMessage("{0}$",s))),O.Actions.press()).description("Pressing cancel action on footer bar").execute());};b.prototype.iConfirmCancel=function(){return this.prepareResult(O.create(this).hasType("sap.m.Popover").isDialogElement().doOnChildren(O.Matchers.resourceBundle("text","sap.fe.core","C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),O.Actions.press()).description("Confirming discard changes").execute());};return b;});