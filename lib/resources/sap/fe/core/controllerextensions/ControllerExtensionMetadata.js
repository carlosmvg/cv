/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/Metadata","sap/base/util/merge","sap/ui/core/mvc/ControllerMetadata"],function(M,m,C){"use strict";var a=function(c,o){C.apply(this,arguments);if(this.isA("sap.ui.core.mvc.ControllerExtension")&&this.getParent().getClass().override){this.getClass().override=this.getParent().getClass().override;}};a.prototype=Object.create(C.prototype);a.prototype.constructor=a;a.prototype.afterApplySettings=function(){M.prototype.afterApplySettings.call(this);if(this._oParent){var p=this._oParent._mMethods?this._oParent._mMethods:{};for(var s in p){if(this._mMethods[s]){var P=this._mMethods[s].public;this._mMethods[s]=m({},p[s]);if(P!==undefined){this._mMethods[s].public=P;}if(!this.isMethodPublic(s)&&this._mMethods[s].public!==p[s].public){this._aAllPublicMethods.splice(this._aAllPublicMethods.indexOf(s),1);}}else{this._mMethods[s]=p[s];}}}if(this._oParent&&this._oParent.isA("sap.ui.core.mvc.ControllerExtension")){this._bFinal=true;}};return a;});
