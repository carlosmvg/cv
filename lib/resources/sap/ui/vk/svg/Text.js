/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var T=function(p){p=p||{};E.call(this,p);this.type="Text";this.text=p.text||"";this.fontFamily=p.fontFamily||"";this.fontSize=p.fontSize||12;this.x=p.x||0;this.y=p.y||0;this.setMaterial(p.material);};T.prototype=Object.assign(Object.create(E.prototype),{constructor:T});T.prototype.tagName=function(){return"text";};var c=document.createElement("canvas");var a=c.getContext("2d");T.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;a.font=this.fontSize+"px "+this.fontFamily;var d=a.measureText(this.text);var h=d.width*0.5;var e=(d.actualBoundingBoxAscent||this.fontSize)*0.5;this._expandBoundingBoxCE(b,m,this.x+h,this.y-e,h+s,e+s);};T.prototype._setSpecificAttributes=function(s){s("x",this.x);s("y",this.y);s("font-family",this.fontFamily);s("font-size",this.fontSize);};T.prototype._getTextContent=function(r){return this.text;};return T;});
