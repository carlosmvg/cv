sap.ui.define(["./FooterAPI","sap/fe/test/Utils","sap/m/library","sap/ui/test/OpaBuilder","sap/fe/test/builder/FEBuilder"],function(F,U,l,O,a){"use strict";var b=function(o,f){return F.call(this,o,f);};b.prototype=Object.create(F.prototype);b.prototype.constructor=b;b.prototype.isAction=false;b.prototype.iCheckAction=function(A,s){var c=U.parseArguments([[Object,String],Object],arguments),o=this.getBuilder();return this.prepareResult(o.hasContent(this.createActionMatcher(A),s).description(U.formatMessage("Checking footer action '{0}' with state='{1}'",c[0],c[1])).execute());};b.prototype.iCheckState=function(s){var o=this.getBuilder();return this.prepareResult(o.hasState(s).description(U.formatMessage("Checking footer with state='{0}'",s)).execute());};return b;});