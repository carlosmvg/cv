sap.ui.define(["sap/rules/ui/ast/model/Base"],function(B){'use strict';var O=function(){B.apply(this,arguments);this._aSupportedFunctions=null;};O.prototype=new B();O.prototype.constructor=B;O.prototype.setSupportedFunctions=function(s){this._aSupportedFunctions=s;return this;};O.prototype.getSupportedFunctions=function(){return this._aSupportedFunctions;};return O;});