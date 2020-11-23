/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var a=function(p){p=p||{};E.call(this,p);this.type="Ellipse";this.cx=p.cx||0;this.cy=p.cy||0;this.rx=p.major||p.radius||50;this.ry=p.minor||p.radius||50;this.setMaterial(p.material);};a.prototype=Object.assign(Object.create(E.prototype),{constructor:a});a.prototype.tagName=function(){return"ellipse";};a.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;this._expandBoundingBoxCR(b,m,this.cx,this.cy,this.rx+s,this.ry+s);};a.prototype._setSpecificAttributes=function(s){s("cx",this.cx);s("cy",this.cy);s("rx",this.rx);s("ry",this.ry);};return a;});
