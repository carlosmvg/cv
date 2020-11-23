// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ushell/adapters/cdm/util/cdmSiteUtils","sap/ushell/utils/clone","sap/base/util/Version"],function(L,c,a,V){"use strict";var P=function(){this._oCDMPagesRequests={};this._sComponent="sap/ushell/adapters/cdm/PagesCommonDataModelAdapter";this.oSitePromise=new Promise(function(r,b){this.fnSiteResolve=r;this.fnSiteReject=b;}.bind(this));};P.prototype.getSite=function(){var d=new jQuery.Deferred();Promise.all([sap.ushell.Container.getServiceAsync("NavigationDataProvider"),sap.ushell.Container.getServiceAsync("VisualizationDataProvider")]).then(function(s){return Promise.all([s[0].getNavigationData(),s[1].getVisualizationData(),sap.ushell.Container.getServiceAsync("URLParsing")]);}).then(function(r){var n=r[0];var v=r[1];var u=r[2];var N={};var I=n.inbounds;for(var i=0;i<I.length;i++){var s=I[i].permanentKey||I[i].id;N[s]=I[i];}var S={_version:"3.1.0",site:{},catalogs:{},groups:{},visualizations:c.getVisualizations(v,u),applications:c.getApplications(N),vizTypes:c.getVizTypes(),systemAliases:a(n.systemAliases),pages:{}};this.fnSiteResolve(S);return S;}.bind(this)).then(d.resolve).catch(function(e){d.reject(e);this.fnSiteReject(e);}.bind(this));return d.promise();};P.prototype.getPage=function(p){if(!p){var e="PagesCommonDataModelAdapter: getPage was called without a pageId";L.fatal(e,null,this._sComponent);return Promise.reject(e);}return this.oSitePromise.then(function(s){if(s.pages[p]){return s.pages[p];}return Promise.all([sap.ushell.Container.getServiceAsync("PagePersistence"),sap.ushell.Container.getServiceAsync("NavigationDataProvider")]).then(function(S){var o=S[0];var n=S[1];return Promise.all([o.getPage(p),n.getNavigationData()]);}).then(function(r){var o=r[0];var n=r[1];this._addPageToSite(s,o,n);return s.pages[o.id];}.bind(this)).catch(function(E){L.fatal("PagesCommonDataModelAdapter encountered an error while fetching required services: ",E,this._sComponent);return Promise.reject(E);}.bind(this));}.bind(this));};P.prototype._addPageToSite=function(s,p,n){var N={};var I=n.inbounds;for(var i=0;i<I.length;i++){var b=I[i].permanentKey||I[i].id;N[b]=I[i];}var o=s.pages[p.id]={identification:{id:p.id,title:p.title},payload:{layout:{sectionOrder:p.sections.map(function(f){return f.id;})},sections:{}}};var S;var d;for(var j=0;j<p.sections.length;j++){S=p.sections[j];d=o.payload.sections[S.id]={id:S.id,title:S.title,layout:{vizOrder:S.viz.map(function(v){return v.id;})},viz:{}};var v;for(var k=0;k<S.viz.length;k++){v=S.viz[k];if(!s.visualizations[v.vizId]){var e=d.layout.vizOrder;e.splice(e.indexOf(v.id),1);L.error("Tile "+v.id+" with vizId "+v.vizId+" has no matching visualization. As the tile cannot be used to start an app it is removed from the page.");continue;}d.viz[v.id]={id:v.id,vizId:v.vizId};}}};P.prototype.getPages=function(p){if(!(p&&Array.isArray(p)&&p.length!==0)){var e="PagesCommonDataModelAdapter: getPages is not an array or does not contain any Page id";L.fatal(e,null,this._sComponent);return Promise.reject(e);}return this.oSitePromise.then(function(s){var b=[],d;for(var i=0;i<p.length;i++){d=p[i];if(!s.pages[d]){b.push(p[i]);}}if(b.length===0){return s.pages;}return Promise.all([sap.ushell.Container.getServiceAsync("PagePersistence"),sap.ushell.Container.getServiceAsync("NavigationDataProvider")]).then(function(S){var o=S[0];var n=S[1];return Promise.all([o.getPages(b),n.getNavigationData()]);}).then(function(r){var f=r[0];var n=r[1];for(var j=0;j<f.length;j++){this._addPageToSite(s,f[j],n);}return s.pages;}.bind(this)).catch(function(E){L.fatal("PagesCommonDataModelAdapter encountered an error while fetching required services: ",E,this._sComponent);return Promise.reject(E);}.bind(this));}.bind(this));};P.prototype.getPersonalization=function(C){var d=new jQuery.Deferred();sap.ushell.Container.getServiceAsync("Personalization").then(function(p){var o;var b=new V(C);o={container:"sap.ushell.cdm.personalization",item:"data"};if(b.inRange("3.1.0","4.0.0")){o={container:"sap.ushell.cdm3-1.personalization",item:"data"};}var s={validity:"Infinity",keyCategory:p.constants.keyCategory.GENERATED_KEY,writeFrequency:p.constants.writeFrequency.HIGH,clientStorageAllowed:false};p.getPersonalizer(o,s).getPersData().done(function(e){d.resolve(e||{});}).fail(function(e){d.reject(e);});}).catch(function(){d.reject("Personalization Service could not be loaded");});return d.promise();};P.prototype.setPersonalization=function(p){var d=new jQuery.Deferred();sap.ushell.Container.getServiceAsync("Personalization").then(function(o){var b;var C=new V(p.version);b={container:"sap.ushell.cdm.personalization",item:"data"};if(C.inRange("3.1.0","4.0.0")){b={container:"sap.ushell.cdm3-1.personalization",item:"data"};}var s={validity:"Infinity",keyCategory:o.constants.keyCategory.GENERATED_KEY,writeFrequency:o.constants.writeFrequency.HIGH,clientStorageAllowed:false};o.getPersonalizer(b,s).setPersData(p).done(function(){d.resolve(p);}).fail(d.reject);}).catch(function(){d.reject("Personalization Service could not be loaded");});return d.promise();};return P;},true);