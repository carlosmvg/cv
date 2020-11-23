/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/XMLTemplateProcessor","sap/ui/core/util/XMLPreprocessor","sap/ui/core/Fragment","sap/fe/macros/ResourceModel","sap/fe/macros/table/Utils","sap/fe/core/helpers/SideEffectsUtil","sap/base/Log","sap/ui/mdc/enum/ConditionValidated"],function(X,a,F,R,T,S,L,C){"use strict";function _(s,d){var B=s.getBindingContext(),m=B.getModel().getMetaModel(),M=m.getMetaPath(B.getPath()),e=m.getObject(M)["$Type"],o=B;if(d!==e){o=B.getBinding().getContext();if(o){M=m.getMetaPath(o.getPath());e=m.getObject(M)["$Type"];if(d!==e){o=o.getBinding().getContext();if(o){M=m.getMetaPath(o.getPath());e=m.getObject(M)["$Type"];if(d!==e){return undefined;}}}}}return o||undefined;}function b(o){while(o&&!(o.getMetadata().getName()==="sap.ui.core.mvc.XMLView")){o=o.getParent();}return o;}var c={formatDraftOwnerTextInPopover:function(h,d,D,s,e){if(h){var u=s||d||e||D;if(!u){return R.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");}else{return d?R.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN",u):R.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN",u);}}else{return R.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");}},onDataFieldWithNavigationPath:function(s,o,d){var B=s.getBindingContext();if(o.routingListener){o.routingListener.navigateToTarget(B,d);}else{L.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.","sap.fe.macros.field.FieldRuntime","onDataFieldWithNavigationPath");}},_initSideEffectsQueue:function(s,o){this.sideEffectsRequestsQueue=this.sideEffectsRequestsQueue||{};this.sideEffectsRequestsQueue[s]=this.sideEffectsRequestsQueue[s]||{};this.sideEffectsRequestsQueue[s]["context"]=this.sideEffectsRequestsQueue[s]["context"]||o;this.sideEffectsRequestsQueue[s]["pathExpressions"]=this.sideEffectsRequestsQueue[s]["pathExpressions"]||[];if(this.aFailedSideEffects&&this.aFailedSideEffects[s]){this.sideEffectsRequestsQueue[s]["pathExpressions"]=this.sideEffectsRequestsQueue[s]["pathExpressions"].concat(this.aFailedSideEffects[s]["pathExpressions"]);delete this.aFailedSideEffects[s];}},prepareForSideEffects:function(f,s){var t=this,p=[],w=f.indexOf("#")>-1,d=(w&&f.split("#")[0])||f,q=(w&&f.split("#")[1])||"",e="/"+d+"@com.sap.vocabularies.Common.v1.SideEffects",B=s.getBindingContext(),m=B.getModel().getMetaModel(),o,g,P,Q,E,h,i,G=function(k){return k["$PropertyPath"];},j=function(k){return k["$NavigationPropertyPath"];};e=(w&&e+"#"+q)||e;i=S.convertSideEffect(m.getObject(e));if(i&&t.aPendingSideEffects.indexOf(f)>-1){o=_(s,d);if(!o){return Promise.resolve();}g=o.getPath();p=p.concat(i.TargetProperties).concat(i.TargetEntities);p=S.replaceEmptyNavigationPaths(p);p=S.addTextProperties(p,m,d);if(p.length){t._initSideEffectsQueue(g,o);Q=t.sideEffectsRequestsQueue[g]["pathExpressions"].filter(G).map(G);h=t.sideEffectsRequestsQueue[g]["pathExpressions"].filter(j).map(j);P=p.map(G).filter(function(k){return k&&Q.indexOf(k)<0;}).map(function(k){return{"$PropertyPath":k};});E=p.map(j).filter(function(k){return(k||k==="")&&h.indexOf(k)<0;}).map(function(k){return{"$NavigationPropertyPath":k};});p=P.concat(E);t.sideEffectsRequestsQueue[g]["pathExpressions"]=t.sideEffectsRequestsQueue[g]["pathExpressions"].concat(p);t.sideEffectsRequestsQueue[g]["triggerAction"]=i.TriggerAction;t.aPendingSideEffects.splice(t.aPendingSideEffects.indexOf(f),1);}}return Promise.resolve();},requestSideEffects:function(){if(!this.sideEffectsRequestsQueue){return;}var t=this,s=this.sideEffectsRequestsQueue,o=this.oSideEffectQueuePromise||Promise.resolve(),d;this.sideEffectsRequestsQueue=null;return o.then(function(){var m=Object.keys(s).map(function(p){var e=s[p];S.logRequest(e);if(e.triggerAction){d=e.context.getModel().bindContext(e.triggerAction+"(...)",e.context);d.execute(e.context.getBinding().getUpdateGroupId());}return e["context"].requestSideEffects(e["pathExpressions"]).then(function(){},function(){L.info("FieldRuntime: Failed to request side effect - "+p,"sap.fe.macros.field.FieldRuntime","requestSideEffects");t.aFailedSideEffects[p]=e;});});t.oSideEffectQueuePromise=Promise.all(m);});},requestTextIfRequired:function(s){var A=s.getBindingInfo("additionalValue");if(!A){return;}if(s.getBinding("value").getPath()){var m=s.getModel().getMetaModel(),p=s.getBindingContext().getPath()+"/"+s.getBinding("value").getPath(),v=m.getValueListType(p);if(v==="Standard"||v==="Fixed"){return;}}var P=A.parts.map(function(d){return S.determinePathOrNavigationPath(d.path);}),o=s.getBindingContext();if(P.length){o.requestSideEffects(P).then(function(){}).catch(function(){L.info("FieldRuntime: Failed to request Text association - "+(P[0]&&P[0]["$PropertyPath"]),"sap.fe.macros.field.FieldRuntime","requestTextIfRequired");});}},handleChange:function(e){var t=this,s=e.getSource(),v=b(s),i=s&&s.getBindingContext().isTransient(),p=e.getParameter("promise")||Promise.resolve(),d=p,A=false,o=v.getModel("creationRowModel");if(s.data("parentControl")==="Table"){var P=s;while(P!=null&&P.getMetadata().getName()!="sap.ui.mdc.Table"){P=P.getParent();}var f=P;if(f){var g=T.getQuickFilters(f);var m=g.map(function(q){return q.sPath;});var h=s.data("sourcePath").split(f.getRowBinding().getPath()+"/").pop();if(h&&m.length>0&&m.indexOf(h)>-1){T.handleQuickFilterCounts(f,f.getBindingContext());}}}if(s.data("parentControl")==="CreationRow"){var n=s.data("creationRowContextPath"),j=o.getProperty("/fieldValidity/"+n),N=Object.assign({},j),I=e.getParameter("valid"),k,l;p.then(function(){if(s.getMaxConditions()===1&&I===undefined){I=s.getConditions()[0].validated===C.Validated;}}).catch(function(E){L.error("Error while resolving field value",E);}).finally(function(){k=s.getId();l=s.getValue();N[k]={fieldValue:l,validity:!!I};o.setProperty("/fieldValidity/"+n,N);}).catch(function(E){L.error("Error while resolving field value",E);});}if(i){return;}this.aPendingSideEffects=this.aPendingSideEffects||[];this.mFieldGroupResolves=this.mFieldGroupResolves||{};this.aFailedSideEffects=this.aFailedSideEffects||{};if(s.getFieldGroupIds()){s.getFieldGroupIds().forEach(function(q){var r=q.indexOf("$$ImmediateRequest")>-1;if(r){A=true;q=q.substr(0,q.indexOf("$$ImmediateRequest"));}else if(t.mFieldGroupResolves.hasOwnProperty(q)){t.mFieldGroupResolves[q].push(p);}else{t.mFieldGroupResolves[q]=[p];}if(t.aPendingSideEffects.indexOf(q)===-1){t.aPendingSideEffects.push(q);}if(r){d=d.then(function(){return t.prepareForSideEffects(q,s);});}});if(A){d.then(this.requestSideEffects.bind(this)).catch(function(E){L.error("Error while processing side effects",E);});}}},handleSideEffect:function(e){if(!this.aPendingSideEffects||this.aPendingSideEffects.length===0){return;}var t=this,f=e.getParameter("fieldGroupIds"),s=e.getSource(),p=Promise.resolve();f=f||[];f.forEach(function(d){var g=[Promise.resolve()];if(t.mFieldGroupResolves&&t.mFieldGroupResolves[d]){g=t.mFieldGroupResolves[d];delete(t.mFieldGroupResolves&&t.mFieldGroupResolves[d]);}p=p.then(function(){return Promise.all(g).then(t.prepareForSideEffects.bind(t,d,s));});});p.then(this.requestSideEffects.bind(this)).catch(function(E){L.error("Error while requesting side effects",E);});},handlePatchEvents:function(B){if(!B){return;}var t=this;B=(B.getBinding&&B.getBinding())||B;B.attachEvent("patchCompleted",function(e){if(e.getParameter("success")!==false&&t.aFailedSideEffects){Object.keys(t.aFailedSideEffects).forEach(function(s){t._initSideEffectsQueue(s,t.aFailedSideEffects[s]["context"]);});t.requestSideEffects();}});},formatWithBrackets:function(t,s){if(s){return t?t+" ("+s+")":s;}else{return t?t:"";}},pressLink:function(e){var l=e.getSource();if(l.getDependents()&&l.getDependents().length>0){var f=l.getDependents()[0];if(f&&f.isA("sap.ui.mdc.Link")){f.getTriggerHref().then(function(h){if(!h){f.open(l);}else{l.setHref(h);}}).catch(function(E){L.error("Error triggering link Href",E);});}}}};return c;},true);