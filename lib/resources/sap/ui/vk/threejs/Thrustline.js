/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","../thirdparty/three","sap/ui/base/ManagedObject","./PolylineGeometry","./PolylineMaterial","./PolylineMesh","../LeaderLineMarkStyle"],function(q,t,B,P,a,b,L){"use strict";var T=B.extend("sap.ui.vk.threejs.Thrustline",{metadata:{properties:{node:{type:"object"},renderOrder:{type:"int",defaultValue:0},depthTest:{type:"boolean",defaultValue:true},principleAxis:{type:"object",defaultValue:new THREE.Vector3(0,0,0)},material:{type:"object"},items:{type:"object[]"},segments:{type:"object[]"}}}});T.prototype.init=function(){if(B.prototype.init){B.prototype.init.call(this);}this._needUpdateMeshes=false;};T.prototype.setNode=function(n){if(n instanceof THREE.Object3D){this.setProperty("node",n,true);this._needUpdateMeshes=true;}return this;};T.prototype.setRenderOrder=function(v){this.setProperty("renderOrder",v,true);this._needUpdateMeshes=true;return this;};T.prototype.setDepthTest=function(v){this.setProperty("depthTest",v,true);this._needUpdateMeshes=true;return this;};T.prototype.setMaterial=function(h){if(h instanceof THREE.Material){this.setProperty("material",h,true);this._needUpdateMeshes=true;}return this;};T.prototype.setItems=function(v){this.setProperty("items",v,true);this._needUpdateMeshes=true;return this;};T.prototype.setSegments=function(v){this.setProperty("segments",v,true);this._needUpdateMeshes=true;return this;};T.prototype._updateMeshes=function(v){var n=this.getNode();var h=this.getMaterial();var j=this.getDepthTest();var r=this.getRenderOrder();var k=h&&h.userData.lineStyle?h.userData.lineStyle:{};var o=k.width;var p=k.dashPatternScale;if(k.widthCoordinateSpace===3){o=o?o*v.y:1;p=p?p*v.y:1;}o=o||1;k.haloWidth=k.haloWidth||0;k.endCapStyle=k.endCapStyle||0;this.getSegments().forEach(function(s){if(s.polylineMesh){n.remove(s.polylineMesh);s.polylineMesh=null;}if(s.haloMesh){n.remove(s.haloMesh);s.haloMesh=null;}var u=[];for(var i=0,l=s.ratios.length;i<l;i++){u.push(new THREE.Vector3());}var w=new P();w.setVertices(u);var x=k.endCapStyle||u.length>2?1:0;var y=(x&&k.endCapStyle===0?1:0)|(x&&k.endCapStyle===0?2:0);if(k.haloWidth>0){var z=new a({color:0xFFFFFF,lineColor:0xFFFFFF,linewidth:o*(k.haloWidth*2+1),dashCapStyle:k.endCapStyle,segmentCapStyle:x,trimStyle:y,transparent:true,depthTest:j});var A=new b(w,z);A.matrixAutoUpdate=false;A.renderOrder=r;A.layers=n.layers;s.haloMesh=A;n.add(A);}var C=new a({color:0xFFFFFF,lineColor:h.color,linewidth:o,dashCapStyle:k.endCapStyle,segmentCapStyle:x,trimStyle:y,dashPattern:k.dashPattern||[],dashScale:p||1,transparent:true,depthTest:j,polygonOffset:true,polygonOffsetFactor:-4});var D=new b(w,C);D.matrixAutoUpdate=false;D.renderOrder=r;D.layers=n.layers;s.polylineMesh=D;n.add(D);});};var m=new THREE.Matrix4(),c=new THREE.Matrix4(),d=new THREE.Vector3(),e=new THREE.Vector3(),f=new THREE.Vector3(),g=new THREE.Vector3();T.prototype._update=function(r,h,v){var n=this.getNode();if(!n||!n.layers.test(h.layers)){return;}if(this._needUpdateMeshes){this._needUpdateMeshes=false;this._updateMeshes(v);}m.multiplyMatrices(h.projectionMatrix,h.matrixWorldInverse);c.copy(m);var j=h instanceof THREE.PerspectiveCamera?h.near:undefined;var k=this.getItems();d.copy(this.getPrincipleAxis()).normalize();this.getSegments().forEach(function(s){var p=s.polylineMesh;if(p){var o=p.geometry;var u=k[s.startItemIndex];var w=new THREE.Vector3().copy(u.boundPoints[s.startBoundIndex]).applyMatrix4(u.target.matrixWorld);var x=k[s.endItemIndex];var y=new THREE.Vector3().copy(x.boundPoints[s.endBoundIndex]).applyMatrix4(x.target.matrixWorld);e.copy(y).sub(w);f.copy(d).multiplyScalar(e.dot(d));g.copy(e).sub(f);var z=o.vertices;var A=[];for(var i=0,l=s.ratios.length;i<l;i++){A.push(i);var C=s.ratios[i];var D=z[i];D.copy(w);e.copy(f).multiplyScalar(C.x);D.add(e);e.copy(g).multiplyScalar(C.y);D.add(e);}o._updateVertices(A);p.material.resolution.copy(v);p.computeLineDistances(c,v,j);}var E=s.haloMesh;if(E){E.material.resolution.copy(v);E.computeLineDistances(c,v,j);}});};return T;});