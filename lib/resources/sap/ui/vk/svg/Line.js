/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var L=function(p){p=p||{};E.call(this,p);this.type="Line";this.x1=p.x1||0;this.y1=p.y1||0;this.x2=p.x2!=null?p.x2:100;this.y2=p.y2!=null?p.y2:100;this.setMaterial(p.material);};L.prototype=Object.assign(Object.create(E.prototype),{constructor:L});L.prototype.tagName=function(){return"line";};L.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;this._expandBoundingBoxCE(b,m,this.x1,this.y1,s,s);this._expandBoundingBoxCE(b,m,this.x2,this.y2,s,s);};L.prototype._setSpecificAttributes=function(s){s("x1",this.x1);s("y1",this.y1);s("x2",this.x2);s("y2",this.y2);};return L;});
