/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/Image","./Core","./ViewGalleryThumbnailRenderer"],function(I,v,V){"use strict";var a=I.extend("sap.ui.vk.ViewGalleryThumbnail",{metadata:{associations:{viewGallery:{type:"sap.ui.vk.ViewGallery"}},properties:{enabled:{type:"boolean",defaultValue:true},thumbnailWidth:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},thumbnailHeight:{type:"sap.ui.core.CSSSize",defaultValue:"5rem"},source:{type:"string",defaultValue:""},tooltip:{type:"string",defaultValue:""},selected:{type:"boolean",defaultValue:false},processing:{type:"boolean",defaultValue:false},animated:{type:"boolean",defaultValue:false}}},constructor:function(i,s){I.apply(this,arguments);this._viewGallery=null;v.observeAssociations(this);}});a.prototype.onSetViewGallery=function(b){this._viewGallery=b;};a.prototype.onUnsetViewGallery=function(b){this._viewGallery=null;};a.prototype._getIndex=function(){return this._viewGallery?this._viewGallery._viewItems.indexOf(this):-1;};return a;});
