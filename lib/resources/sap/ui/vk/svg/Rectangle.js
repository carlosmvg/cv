/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var R=function(p){p=p||{};E.call(this,p);this.type="Rectangle";this.x=p.x||0;this.y=p.y||0;this.width=p.width||100;this.height=p.height||100;this.setMaterial(p.material);};R.prototype=Object.assign(Object.create(E.prototype),{constructor:R});R.prototype.tagName=function(){return"rect";};R.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;var h=this.width*0.5;var a=this.height*0.5;this._expandBoundingBoxCE(b,m,this.x+h,this.y+a,h+s,a+s);};R.prototype._setSpecificAttributes=function(s){s("x",this.x);s("y",this.y);s("width",this.width);s("height",this.height);};return R;});
