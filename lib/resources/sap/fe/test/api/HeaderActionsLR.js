sap.ui.define(["./HeaderLR","sap/fe/test/Utils","sap/ui/test/OpaBuilder","sap/fe/test/builder/FEBuilder","./ShareUtilsHelper"],function(H,U,O,F,S){"use strict";var a=function(h,v){return H.call(this,h,v);};a.prototype=Object.create(H.prototype);a.prototype.constructor=a;a.prototype.isAction=true;a.prototype.iExecuteAction=function(A){var b=U.parseArguments([[Object,String]],arguments),o=this.createOverflowToolbarBuilder(this._sPageId);return this.prepareResult(o.doOnContent(this.createActionMatcher(A),O.Actions.press()).description(U.formatMessage("Executing custom header action '{0}'",b[0])).execute());};a.prototype.iExecuteSaveAsTile=function(b){var s="fe::Share",o=this.createOverflowToolbarBuilder(this._sPageId);return this.prepareResult(o.doOnContent(F.Matchers.id(new RegExp(U.formatMessage("{0}$",s))),O.Actions.press()).description(U.formatMessage("Pressing header '{0}' Share button",this.getIdentifier())).success(S.createSaveAsTileExecutorBuilder(b)).execute());};a.prototype.iExecuteSendEmail=function(){var s="fe::Share",o=this.createOverflowToolbarBuilder(this._sPageId);return this.prepareResult(o.doOnContent(F.Matchers.id(new RegExp(U.formatMessage("{0}$",s))),O.Actions.press()).description(U.formatMessage("Pressing header '{0}' Share button",this.getIdentifier())).success(S.createSendEmailExecutorBuilder()).execute());};return a;});