/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../BaseNodeProxy"],function(B){"use strict";var a=B.extend("sap.ui.vk.svg.BaseNodeProxy",{metadata:{}});a.prototype.init=function(n,b){this._element=b;};a.prototype.reset=function(){this._element=null;};a.prototype.getNodeRef=function(){return this._element;};a.prototype.getNodeId=function(){return this._element;};a.prototype.getName=function(){return this._element.name||("<"+this._element.type+">");};a.prototype.getNodeMetadata=function(){return this._element.metadata||{};};a.prototype.getSceneRef=function(){return this._element;};return a;});
