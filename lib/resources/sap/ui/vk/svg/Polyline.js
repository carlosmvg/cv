/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var P=function(p){p=p||{};E.call(this,p);this.type="Polyline";this.points=new Float32Array(p.points||[0,0,100,100]);this.closed=p.closed||false;this.setMaterial(p.material);};P.prototype=Object.assign(Object.create(E.prototype),{constructor:P});P.prototype.tagName=function(){return this.closed?"polygon":"polyline";};P.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;var p=this.points;for(var i=0,l=p.length;i<l;i+=2){this._expandBoundingBoxCE(b,m,p[i],p[i+1],s,s);}};P.prototype._setSpecificAttributes=function(s){s("points",this.points.join(" "));if(this.stroke!==undefined&&this.stroke[3]>0&&this.strokeWidth>0){s("stroke-linejoin","round");}};return P;});
