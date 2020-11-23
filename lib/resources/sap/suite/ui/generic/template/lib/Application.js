sap.ui.define(["sap/ui/base/Object","sap/ui/Device","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/m/ActionSheet","sap/m/Dialog","sap/m/Popover","sap/suite/ui/generic/template/lib/deletionHelper","sap/suite/ui/generic/template/lib/routingHelper","sap/suite/ui/generic/template/lib/ContextBookkeeping","sap/suite/ui/generic/template/lib/CRUDHelper","sap/suite/ui/generic/template/lib/StatePreserver","sap/suite/ui/generic/template/lib/testableHelper","sap/suite/ui/generic/template/lib/FeLogger","sap/ui/core/syncStyleClass","sap/base/util/extend","sap/ui/core/Fragment","sap/ui/generic/app/navigation/service/NavigationHandler"],function(B,D,J,M,A,a,P,d,r,C,b,S,t,F,s,e,c,N){"use strict";var G={storeInnerAppStateWithImmediateReturn:function(){return{promise:{fail:Function.prototype}};},parseNavigation:function(){return{done:function(H){setTimeout(H.bind(null,{},{},sap.ui.generic.app.navigation.service.NavType.initial),0);},fail:Function.prototype};}};var l=new F("lib.Application").getLogger();var f=(t.testableStatic(function(T,o){var i="sapUiSizeCozy",k="sapUiSizeCompact";if(o&&(o.classList.contains(i)||o.classList.contains(k))){return"";}else{return T?i:k;}},"Application_determineContentDensityClass")(D.support.touch,document.body));function g(){return f;}function h(o,p){s(f,p,o);p.addDependent(o);}var h=t.testableStatic(h,"Application_attachControlToParent");function j(T){var o=new C(T.oAppComponent);var E;var n=Object.create(null);function k(i){var t1=T.oNavigationControllerProxy.getActiveComponents();return t1.indexOf(i.getId())>=0;}var I=false;function m(i){T.fnAddSideEffectPromise(i);}function p(i,t1){if(I){return;}var u1=T.aRunningSideEffectExecutions.filter(function(v1){return!!v1;});if(u1.length){I=true;Promise.all(u1).then(function(){I=false;p(i,t1);});}else if(t1&&T.oBusyHelper.isBusy()){if(typeof t1==="function"){t1();}}else{i();}}function q(i){var t1;if(i instanceof a){t1="open";}else if(i instanceof P||i instanceof A){t1="openBy";}if(t1){var u1=i[t1];i[t1]=function(){var v1=arguments;p(function(){if(!T.oBusyHelper.isBusy()){T.oBusyHelper.getUnbusy().then(function(){u1.apply(i,v1);});}});};}}var u={};function v(i,t1,u1,v1,w1){i=i||T.oNavigationHost;var x1=i.getId();var y1=u[x1]||(u[x1]={});var z1=y1[t1];if(!z1){z1=sap.ui.xmlfragment(x1,t1,u1);h(z1,i);var A1;if(v1){A1=new J();z1.setModel(A1,v1);}(w1||Function.prototype)(z1,A1);y1[t1]=z1;q(z1);}return z1;}function w(i,t1,u1,v1,w1,x1){return new Promise(function(y1){i=i||T.oNavigationHost;var z1=i.getId();var A1=u[z1]||(u[z1]={});var B1=A1[t1];if(!B1||x1){if(B1){B1.destroy();}c.load({id:z1,name:t1,controller:u1,type:"XML"}).then(function(C1){B1=C1;h(C1,i);var D1;if(v1){D1=new J();C1.setModel(D1,v1);}(w1||Function.prototype)(C1,D1);A1[t1]=C1;q(C1);y1(B1);});return;}y1(B1);});}function x(){return new Promise(function(i){T.oNavigationObserver.getProcessFinished(true).then(function(){T.oBusyHelper.getUnbusy().then(i);});});}function O(){T.oDataLossHandler.performIfNoDataLoss(function(){T.oNavigationControllerProxy.navigateBack();},Function.prototype);}function y(i,t1,u1){var v1=b.createNonDraft(null,"/"+i,T.oAppComponent.getModel(),t1,q1());if(u1){u1.aCreateContexts=u1.aCreateContexts||[];u1.aCreateContexts.push({entitySet:i,context:v1,predefinedValues:t1});}return v1;}function z(i){T.oNavigationControllerProxy.navigateForNonDraftCreate(i.entitySet,i.predefinedValues,i.context);}function H(t1){var u1=T.oNavigationControllerProxy.getActiveComponents();for(var i=0;i<u1.length;i++){var v1=T.componentRegistry[u1[i]];v1.utils.onBeforeDraftTransfer(t1);}}function K(i,t1){H(t1);o.activationStarted(i,t1);}function L(i,t1){H(t1);o.cancellationStarted(i,t1);}function Q(i,t1){H(t1);o.editingStarted(i,t1);}function R(i){T.aStateChangers.push(i);}function U(i,t1){t1.then(function(){o.adaptAfterObjectDeleted(i);},Function.prototype);}function V(){return T.oNavigationControllerProxy.getLinksToUpperLayers();}function W(){var t1=T.oNavigationControllerProxy.getActiveComponents();var u1=0;var v1;for(var i=0;i<t1.length;i++){var w1=T.componentRegistry[t1[i]];if(w1.viewLevel>0&&(u1===0||w1.viewLevel<u1)){u1=w1.viewLevel;v1=w1.oComponent;}}var x1=v1?Promise.resolve(v1):T.oNavigationControllerProxy.getRootComponentPromise();return x1.then(function(y1){return y1.getModel("i18n").getResourceBundle();});}function X(){return T.oNavigationControllerProxy.getAppTitle();}function Y(i){return T.oNavigationControllerProxy.getCurrentKeys(i);}function Z(){for(var i in T.componentRegistry){var t1=T.componentRegistry[i];if(t1.viewLevel===1){if(k(t1.oComponent)){var u1=t1.oComponent.getComponentContainer().getElementBinding();return u1&&u1.getPath();}else{return null;}}}return null;}var $;function _(t1,u1){var i=u1||0;if(i>0){return null;}var v1=t1.getId();var w1=T.componentRegistry[v1];var x1=T.mRoutingTree[w1.route];var y1=x1.communicationObject;for(;i<0&&y1;){x1=T.mRoutingTree[x1.parentRoute];if(x1.communicationObject!==y1){i++;y1=x1.communicationObject;}}if(i<0||y1){return y1;}$=$||{};return $;}function a1(i){for(var t1 in T.mEntityTree){if(T.mEntityTree[t1].navigationProperty&&(T.mEntityTree[t1].level===i+1)){return T.mEntityTree[t1].navigationProperty;}}}function b1(){return T.oFlexibleColumnLayoutHandler?T.oFlexibleColumnLayoutHandler.getMaxColumnCountInFCL():false;}function c1(){var i=T.oNavigationControllerProxy.getCurrentIdentity();for(var t1=i.treeNode;t1.level>0;t1=T.mRoutingTree[t1.parentRoute]){if(t1.level===1&&t1.isDraft){var u1=t1.getPath(3,i.keys);o.markDraftAsModified(u1);return;}}}function d1(){if(E!==undefined){return E;}var i,t1,u1,v1,w1,x1,y1=true;var z1=T.oAppComponent.getModel();var A1=z1.getMetaModel();var B1=z1.mContexts;for(u1 in B1){y1=false;w1=B1[u1].sPath;v1=w1&&w1.substring(1,w1.indexOf('('));x1=v1&&A1.getODataEntitySet(v1);if(x1){i=z1.getProperty(w1);t1=i&&z1.getETag(undefined,undefined,i)||null;if(t1){E=true;return E;}}}if(y1){return true;}E=false;return E;}function e1(t1){var i,u1,v1;var w1=T.oNavigationControllerProxy.getAllComponents();for(i=0;i<w1.length;i++){u1=w1[i];if(!t1||!t1[u1]){v1=T.componentRegistry[u1];v1.utils.refreshBinding(true);}}}function f1(i){if(T.oFlexibleColumnLayoutHandler){T.oFlexibleColumnLayoutHandler.setStoredTargetLayoutToFullscreen(i);}}function g1(){T.oPaginatorInfo={};}function h1(i){return new S(T,i);}function i1(t1,u1){var v1=n[t1];if(!v1){v1=Object.create(null);n[t1]=v1;var w1=T.oAppComponent.getModel();var x1=w1.getMetaModel();var y1=x1.getODataEntitySet(t1);var z1=y1&&x1.getODataEntityType(y1.entityType);var A1=(z1&&z1.navigationProperty)||[];for(var i=0;i<A1.length;i++){var B1=A1[i];v1[B1.name]=B1;}}return v1[u1];}function j1(i){var t1=T.oNavigationControllerProxy.getSwitchToSiblingPromise(i,2);T.oBusyHelper.setBusy(t1.then(function(u1){u1();}));}function k1(i){var t1=T.oNavigationControllerProxy.getSpecialDraftCancelPromise(i);if(t1){return t1;}var u1=o.getDraftSiblingPromise(i);return u1.then(function(v1){var w1=v1&&v1.getObject();var x1=w1&&w1.IsActiveEntity;if(!x1){return Promise.resolve(d.getNavigateAfterDeletionOfCreateDraft(T));}return T.oNavigationControllerProxy.getSwitchToSiblingPromise(v1,1).then(function(y1){return function(){var z1=v1.getModel();z1.invalidateEntry(v1);return y1();};});});}function l1(i){return T.oNavigationControllerProxy.navigateAfterActivation(i);}function m1(i,t1,u1,v1){T.oNavigationControllerProxy.navigateToSubContext(i,t1,u1,v1);}function n1(i,t1){T.oNavigationControllerProxy.navigateByExchangingQueryParam(i,t1);}function o1(){return!T.bCreateRequestsCanonical;}function p1(){return T.oNavigationControllerProxy.getParsedShellHashFromFLP();}function q1(){return!T.bCreateRequestsCanonical;}var r1;function s1(){r1=r1||new N(T.oAppComponent);return T.ghostapp?G:r1;}T.oApplicationProxy={getDraftSiblingPromise:o.getDraftSiblingPromise,getSiblingPromise:o.getSiblingPromise,getAlternativeContextPromise:o.getAlternativeContextPromise,getPathOfLastShownDraftRoot:o.getPathOfLastShownDraftRoot,areTwoKnownPathesIdentical:o.areTwoKnownPathesIdentical,getResourceBundleForEditPromise:W,getContentDensityClass:g,getDialogFragment:v.bind(null,null),getDialogFragmentAsync:w.bind(null,null),destroyView:function(i){delete u[i];},markCurrentDraftAsModified:c1,prepareDeletion:U,performAfterSideEffectExecution:p,onBackButtonPressed:O,mustRequireRequestsCanonical:q1};return{createNonDraft:y,navigateToNonDraftCreateContext:z,getContentDensityClass:g,attachControlToParent:h,getDialogFragmentForView:v,getDialogFragmentForViewAsync:w,getBusyHelper:function(){return T.oBusyHelper;},addSideEffectPromise:m,performAfterSideEffectExecution:p,isComponentActive:k,showMessageToast:function(){var i=arguments;var t1=function(){l.info("Show message toast");M.show.apply(M,i);};Promise.all([x(true),T.oBusyHelper.getUnbusy()]).then(t1);},registerStateChanger:R,getDraftSiblingPromise:o.getDraftSiblingPromise,registerContext:o.registerContext,activationStarted:K,cancellationStarted:L,editingStarted:Q,getLinksToUpperLayers:V,getAppTitle:X,getCurrentKeys:Y,getPathForViewLevelOneIfVisible:Z,getCommunicationObject:_,getForwardNavigationProperty:a1,getMaxColumnCountInFCL:b1,markCurrentDraftAsModified:c1,checkEtags:d1,refreshAllComponents:e1,getIsDraftModified:o.getIsDraftModified,prepareDeletion:d.prepareDeletion.bind(null,T),setStoredTargetLayoutToFullscreen:f1,invalidatePaginatorInfo:g1,getStatePreserver:h1,getNavigationProperty:i1,switchToDraft:j1,getNavigateAfterDraftCancelPromise:k1,navigateAfterActivation:l1,navigateToSubContext:m1,navigateByExchangingQueryParam:n1,onBackButtonPressed:O,needsToSuppressTechnicalStateMessages:o1,mustRequireRequestsCanonical:q1,getNavigationHandler:s1,getParsedShellHashFromFLP:p1};}return B.extend("sap.suite.ui.generic.template.lib.Application",{constructor:function(T){e(this,j(T));}});});