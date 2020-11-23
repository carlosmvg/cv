/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/model/odata/v4/ODataListBinding","sap/ui/model/odata/v4/Context","sap/ui/model/Filter","sap/ui/base/ManagedObject","sap/ui/model/ChangeReason","sap/ui/model/resource/ResourceModel","sap/ui/model/odata/v4/ODataContextBinding","sap/base/Log","sap/fe/core/model/DraftEditState"],function(J,O,C,F,M,a,R,b,L,E){"use strict";var c="_$DraftModel";var A=false;var p={};function s(t,K,v){var w=typeof t==="string"?t:t.getId(),P=(p[w]=p[w]||{});P[K]=v;if(A&&!t[c]){t[c]=P;}}function g(t,K){var v=typeof t==="string"?t:t.getId();return p[v]&&p[v][K];}function d(t){var v=t.getMetaModel(),w=g(t,"aEntitySets"),x=w?Promise.resolve(w):v&&v.requestObject("/").then(function(y){var P=[];Object.keys(y).forEach(function(z){var B=y[z],G;if(B.$kind==="EntitySet"){G=v.requestObject("/"+z+"@");P.push(G.then(function(H){var I={};I["@"]=H;I["@sapui.name"]=z;return I;}));}});return Promise.all(P);});return x;}function e(t,v,w){var x=t.getModel();w=w||{$$inheritExpandSelect:false};return x.bindContext(v+"(...)",t,w);}function f(t,G){if(!this.getProperty("IsActiveEntity")){var v=e(this,arguments[0],{$$inheritExpandSelect:true});return v.execute(G).then(function(w){return w;});}else{throw new Error("The activation action cannot be executed on an active document");}}function h(t,v,G){if(!this.getProperty("IsActiveEntity")){var w=e(this,arguments[0]);if(typeof v==="undefined"){v="";}w.setParameter("SideEffectsQualifier",v);return w.execute(G).then(function(){return w;});}else{throw new Error("The preparation action cannot be executed on an active document");}}function i(){if(!this.getProperty("IsActiveEntity")){var t=e(this,arguments[0]);return t.execute().then(function(){return t;});}else{throw new Error("The validation function cannot be executed on an active document");}}function j(){if(!this.getProperty("IsActiveEntity")){var t=e(this,arguments[0]);return t.execute();}else{throw new Error("The discard action cannot be executed on an active document");}}function k(t){if(this.getProperty("IsActiveEntity")){var v=e(this,arguments[0],{$$inheritExpandSelect:true});t=arguments[1];v.setParameter("PreserveChanges",t);return v.execute().then(function(w){return w;});}else{throw new Error("The edit action cannot be executed on a draft document");}}var o={"ActivationAction":f,"PreparationAction":h,"DiscardAction":j,"ValidationFunction":i,"EditAction":k};function l(t,v){var w=v["@"]["@com.sap.vocabularies.Common.v1.DraftRoot"]||v["@"]["@com.sap.vocabularies.Common.v1.DraftNode"];Object.keys(w).forEach(function(x){var y=w[x];if(o[x]){t["executeDraft"+x]=o[x].bind(t,y);}});}function m(t){if(g(t,"bIsDraftEnabled")===undefined){return d(t).then(function(v){var w=v.filter(function(x){var y=x["@"]||{};return(y.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot")||y.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode"));}),I=Array.isArray(w)&&w.length>0;if(I){s(t,"aEntitySets",v);s(t,"aDraftEntitySets",w);}s(t,"bIsDraftEnabled",I);return I;});}else{return Promise.resolve(g(t,"bIsDraftEnabled"));}}function _(t){if(g(t,"bUpgraded")){L.warning("Model was already upgraded to DraftModel");return;}var v={},w={},x=-1,y={"editStates":[{id:E.ALL.id,name:E.ALL.display},{id:E.UNCHANGED.id,name:E.UNCHANGED.display},{id:E.OWN_DRAFT.id,name:E.OWN_DRAFT.display},{id:E.LOCKED.id,name:E.LOCKED.display},{id:E.UNSAVED_CHANGES.id,name:E.UNSAVED_CHANGES.display}],"entitySets":{}},I,z=g(t,"aDraftEntitySets");s(t,"mListBindings",w);z.forEach(function(G){y.entitySets[G["@sapui.name"]]={editState:E.ALL};});I=new J(y);s(t,"oDraftAccessModel",I);t.getDraftAccessModel=q;v.bindList=t.bindList;t.bindList=function(P,G,S,H,K){var N=I.getObject("/entitySets"+P),Q;if(N){var T="";K=K||{};T=K.$expand;if(T){if(T.indexOf("DraftAdministrativeData")<0){T+=",DraftAdministrativeData";}}else{T="DraftAdministrativeData";}K.$expand=T;}arguments[4]=K;Q=v.bindList.apply(this,arguments);if(N){Q._bDraftModelUpgrade=true;w[++x]=Q;Q.destroy=(function(U){return function(){delete w[U];return O.prototype.destroy.apply(this,arguments);};})(x);}return Q;};function B(G){var H=false,P=G.getPath();if(g(t,"bUpgraded")&&P){z.forEach(function(K){var N=!H&&P.substring(P.indexOf("/")+1,P.indexOf("("))===K["@sapui.name"];if(N){H=true;l(G,K);}});}return G;}v.create=C.create;C.create=function(t,G,P,H,K){return B(v.create.apply(null,arguments));};v.createReturnValueContext=C.createReturnValueContext;C.createReturnValueContext=function(t,G,P){return B(v.createReturnValueContext.apply(null,arguments));};v.modelDestroy=t.destroy;t.destroy=function(){delete p[this.getId()];return v.modelDestroy.apply(this,arguments);};s(t,"bUpgraded",true);return true;}function u(t){return m(t).then(function(v){if(v){return _(t);}else{throw new Error("The model is not draft enabled");}});}function n(t){return m(t).then(function(v){if(v){_(t);}return v;});}function q(){return g(this,"oDraftAccessModel");}var r={};var D={upgrade:u,upgradeOnDemand:n,isDraftModel:m,EDITSTATE:E};return D;},true);