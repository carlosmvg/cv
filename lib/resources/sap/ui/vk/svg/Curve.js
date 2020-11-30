/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["./Element"],function(E){"use strict";var C=function(p){p=p||{};E.call(this,p);this.type="Curve";this.points=new Float32Array(p.points||[0,0,100,0,100,100,0,100]);this.closed=p.closed||false;this.setMaterial(p.material);};C.prototype=Object.assign(Object.create(E.prototype),{constructor:C});C.prototype.tagName=function(){return"path";};C.prototype._expandBoundingBox=function(b,m){var s=this.strokeWidth*0.5;var p=this.points;for(var i=0,l=p.length-1;i<l;i+=2){this._expandBoundingBoxCE(b,m,p[i],p[i+1],s,s);}};C.prototype._setSpecificAttributes=function(s){var p=this.points;var d=["M",p[0],p[1]];for(var i=2,l=p.length-5;i<l;i+=6){d.push("C",p[i],p[i+1],p[i+2],p[i+3],p[i+4],p[i+5]);}if(this.closed){d.push("Z");}s("d",d.join(" "));s("stroke-linejoin","round");};return C;});
