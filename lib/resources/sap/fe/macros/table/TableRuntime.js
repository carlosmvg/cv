/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/model/json/JSONModel","sap/fe/macros/CommonHelper","sap/fe/core/CommonUtils","sap/fe/core/library"],function(J,C,a,F){"use strict";var b=F.CreationMode;var T={onSelectionChange:function(e){var c=e.getSource(),s=c.getId(),t=sap.ui.getCore().byId(s.slice(0,s.lastIndexOf(":")-1));t.data("quickFilterKey",c.getSelectedKey());t.rebindTable();},displayTableSettings:function(e){var p=e.getSource().getParent(),s=sap.ui.getCore().byId(p.getId()+"-settings");C.fireButtonPress(s);},executeConditionalActionShortcut:function(B,s){var p=s.getParent();if(B!==b.CreationRow){var o=p.getActions().find(function(e){return e.getId().endsWith(B);});C.fireButtonPress(o);}else{var c=p.getAggregation("creationRow");if(c&&c.getApplyEnabled()&&c.getVisible()){c.fireApply();}}},setContexts:function(t,m,p,d,D,c,A){var e=A?A.split(","):[];var o=JSON.parse(c);var s=t.getSelectedContexts();var f=false;var g=[];var u=[];var l=[];var h={};var L={};var M;var k="/$contexts/"+p;var n=t.getModel(m);var P=[];var q;if(!n){n=new J();t.setModel(n,"$contexts");}L.aUnsavedContexts=[];L.aLockedContexts=[];n.setProperty("/$contexts",{});n.setProperty(k,{selectedContexts:s,numberOfSelectedContexts:s.length,dynamicActions:h,deleteEnabled:true,deletableContexts:[],unSavedContexts:[],lockedContexts:[]});for(var i=0;i<s.length;i++){var S=s[i];var r=S.getObject();for(var v in r){if(v.indexOf("#")===0){var w=v;w=w.substring(1,w.length);M=n.getProperty(k);M.dynamicActions[w]={enabled:true};n.setProperty(k,M);}}M=n.getProperty(k);if(d!="undefined"){if(d.indexOf("/")>-1){P=d.split("/");q=S.getObject();for(var j=0;j<P.length;j++){q=q[P[j]];}}else{q=S.getProperty(d);}if(q){if(D!=="undefined"&&r.IsActiveEntity===true&&r.HasDraftEntity===true){L=x(r,S);}else{g.push(S);L.isDeletable=true;}}M["deleteEnabled"]=L.isDeletable;}else if(D!=="undefined"&&r.IsActiveEntity===true&&r.HasDraftEntity===true){L=x(r,S);}else{g.push(S);}}function x(r,S){if(r.DraftAdministrativeData.InProcessByUser){l.push(S);}else{u.push(S);f=true;}return{aLockedContexts:l,aUnsavedContexts:u,isDeletable:f};}this.setActionEnablement(n,o,k,s);if(s.length>1){this.disableAction(n,e,k,h);}M["deletableContexts"]=g;M["unSavedContexts"]=L.aUnsavedContexts;M["lockedContexts"]=L.aLockedContexts;M["controlId"]=t.getId();n.setProperty(k,M);},setActionEnablement:function(c,A,s,S){return a.setActionEnablement(c,A,s,S);},disableAction:function(c,A,s,d){A.forEach(function(e){d[e]={bEnabled:false};});}};return T;},true);