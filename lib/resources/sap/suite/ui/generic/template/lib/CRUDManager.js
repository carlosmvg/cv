sap.ui.define(["sap/ui/base/Object","sap/ui/generic/app/util/ModelUtil","sap/ui/generic/app/util/ActionUtil","sap/suite/ui/generic/template/lib/MessageUtils","sap/suite/ui/generic/template/lib/CRUDHelper","sap/suite/ui/generic/template/lib/CacheHelper","sap/suite/ui/generic/template/lib/testableHelper","sap/base/util/extend","sap/base/util/isEmptyObject","sap/suite/ui/generic/template/lib/FeError","sap/ui/model/Context"],function(B,M,A,a,C,b,t,e,c,F,d){"use strict";var s="lib.CRUDManager";var r=Promise.reject();r.catch(Function.prototype);function g(o,f,S,h,j){function l(O,i,k,K){a.handleError(O,o,S,k,K);return(i||Function.prototype)(k);}var E;function m(i){return new Promise(function(k,K){var L=o.getOwnerComponent();var N=L.getBindingContext();var O=L.getModel();O.read(N.getPath(),{urlParameters:{"$expand":"DraftAdministrativeData"},success:function(R){if(!R.DraftAdministrativeData){if(i){return l(a.operations.editEntity,K,i);}return k({});}if(R.DraftAdministrativeData.InProcessByUser){var U=R.DraftAdministrativeData.InProcessByUserDescription||R.DraftAdministrativeData.InProcessByUser;i=i||new F(h.getText("ST_GENERIC_DRAFT_LOCKED_BY_USER",[" ",U]));return l(a.operations.editEntity,K,i,i);}return k({draftAdministrativeData:R.DraftAdministrativeData});},error:l.bind(null,a.operations.editEntity,K)});});}function n(i,U,k){if(k.draftAdministrativeData){return Promise.resolve(k);}return new Promise(function(K,L){S.oTransactionController.editEntity(o.getView().getBindingContext(),!U).then(function(R){if(i){var V=o.getView();var N=V.getBindingContext();var O=function(){N.getModel().invalidateEntry(N);V.detachEvent("modelContextChange",O);};V.attachEvent("modelContextChange",O);}return K({context:R.context});},function(R){if(R&&R.response&&R.response.statusCode==="409"&&i&&!U){a.removeTransientMessages();return m(R).then(K,L);}else{l(a.operations.editEntity,L,R,R);}});});}E=function(U){var i=f.isDraftEnabled();var R;var k=o.getOwnerComponent();var K=k.getBindingContext();if(i&&!U){var L=S.oDraftController.getDraftContext();var N=L.hasPreserveChanges(K);if(!N){R=m().then(n.bind(null,true,true));}}R=R||n(i,U,{});if(i){S.oApplication.editingStarted(K,R);}return R;};function p(U){if(j.isBusy()){return r;}var R=E(U);j.setBusy(R);return R;}function q(i,k,K){var R=new Promise(function(L,N){var O=function(){var U=M.getEntitySetFromContext(K);var V=S.oDraftController.getDraftContext();var W=V.isDraftRoot(U);var X=f.getViewLevel();var Y=X>=2?h.getText("ITEM_DELETED"):h.getText("ST_GENERIC_OBJECT_DELETED");if(!i&&W){Y=h.getText(k?"ST_GENERIC_DRAFT_WITH_ACTIVE_DOCUMENT_DELETED":"ST_GENERIC_DRAFT_WITHOUT_ACTIVE_DOCUMENT_DELETED");}a.showSuccessMessageIfRequired(Y,S);};var Q=function(U){if(U.length===0){O();L();}else{a.handleError(a.operations.deleteEntity,o,S,U[0].oError,null);N();}};var T=v({pathes:[K.getPath()],withWarningDialog:true});T.then(Q,N);});return R;}function u(){var R=new Promise(function(i,k){var K=o.getView().getBindingContext();var L=S.oDraftController.isActiveEntity(K);var N=S.oDraftController.hasActiveEntity(K);var O=N&&!L?S.oApplication.getDraftSiblingPromise(K):Promise.resolve();O.then(function(Q){var T=q(L,N,K);T.then(i,k);if(!L){var U=function(){return{context:Q};};var V=T.then(U);S.oApplication.cancellationStarted(K,V);}},k);});return R;}function P(k,K,W){var R={mFailed:Object.create(null),mSuccess:Object.create(null),mWarning:Object.create(null),aMessagesForUserDecision:[]};for(var i=0;i<k.length;i++){var L=k[i];var N=K[i];var O=a.parseError(N);var Q=parseInt(O.httpStatusCode,10);if((Q>=200&&Q<300)||Q===304){R.mSuccess[L]=N;}else if(Q===412){R.mWarning[L]=N;}else{R.mFailed[L]=N;}}if(!c(R.mWarning)&&W){R.aMessagesForUserDecision=a.getTransientMessages();a.removeTransientMessages();}return R;}function v(i){var R=new Promise(function(K,L){var O=Object.create(null);var N=Object.create(null);var Q=function(T,_,a1){N[T]={resolve:_,reject:a1};};for(var k=0;k<i.pathes.length;k++){var T=i.pathes[k];O[T]=new Promise(Q.bind(null,T));}S.oApplication.prepareDeletion(O,i.suppressRefreshAllComponents);var U=Object.create(null);var V=Object.create(null);var W;var X=function(_){if(!c(U)){S.oApplication.markCurrentDraftAsModified();}for(var T in N){var a1=N[T];a1[U[T]?"resolve":"reject"]();}if(_){return L();}var b1=i.pathes.map(function(T){return{sPath:T,oError:V[T]||W[T],isWarning:!!W[T]};}).filter(function(c1){return!!c1.oError;});K(b1);};var Y=function(_){if(_.length>0){var a1=f.getCRUDActionHandler();a1.handleCRUDScenario(4,Z.bind(null,Object.keys(W),false,false),X.bind(null,true),"Delete",_);return;}X();};var Z=function(_,a1,$){if(i.suppressRefreshAllComponents&&i.smartTable){h.refreshSmartTable(i.smartTable,"Changes");}var b1=function(d1){var e1=P(_,d1,$,i.onlyOneDraftPlusActive);V=e(V,e1.mFailed);U=e(U,e1.mSuccess);W=e1.mWarning;Y(e1.aMessagesForUserDecision);};var c1=S.oTransactionController.deleteEntities(_,{bIsStrict:a1}).then(b1,b1);j.setBusy(c1);};var $=i.withWarningDialog&&(i.pathes.length===1||i.onlyOneDraftPlusActive);Z(i.pathes,true,$);});return R;}function w(i){var k=S.oDraftController.hasActiveEntity(i);var K=k?S.oApplication.getDraftSiblingPromise(i):Promise.resolve();return K.then(function(L){var T=function(){return{context:L};};var N=S.oTransactionController.deleteEntity(i);var O=N.then(T);S.oApplication.cancellationStarted(i,O);return N;});}function x(i,k,K){if(j.isBusy()){k();return;}var L,N,O,Q;var R=K?K:S.oTemplateCapabilities.oMessageButtonHelper&&S.oTemplateCapabilities.oMessageButtonHelper.getContextFilter();if(R){L=sap.ui.getCore().getMessageManager();N=function(T){var U=L.getMessageModel();var V=U.bindList("/",null,null,[R]);var W=V.getContexts();return W.map(function(X){var Y=X.getObject();T(Y);return Y;});};Q=Object.create(null);O=N(function(T){Q[T.getId()]=T;});}S.oTransactionController.triggerSubmitChanges().then(function(T){if(L){L.removeMessages(O);}i(T.context);},function(){if(L){var T=[];var U=N(function(V){if(!Q[V.getId()]){V.persistent=false;V.technical=false;T.push(V);}});if(T.length){L.removeMessages(U);L.addMessages(T);if(!K){S.oTemplateCapabilities.oMessageButtonHelper.showMessagePopover();}}}k();});}function y(i){var k=i;var R=new Promise(function(K,L){S.oApplication.performAfterSideEffectExecution(x.bind(null,K,L,k));});j.setBusy(R);return R;}function z(i){if(j.isBusy()){return r;}var R=new Promise(function(k,K){var L=i?i:o.getView().getBindingContext();var W=false;var N=function(){W=true;var O=function(){var T=S.oDraftController.activateDraftEntity(L,true);S.oApplication.activationStarted(L,T);T.then(function(U){k(U);},function(U){a.handleError(a.operations.activateDraftEntity,o,S,U,null);K();});j.setBusy(T);};var Q=f.getCRUDActionHandler();Q.handleCRUDScenario(4,O,K,"Activate");};S.oApplication.getDraftSiblingPromise(L).then(function(O){if(O){o.getOwnerComponent().getModel().invalidateEntry(O);}var Q=S.oDraftController.activateDraftEntity(L,false);if(O){var T=f.getRootExpand();var U={};if(T&&T.length){U.urlParameters={"$expand":T};}S.oDraftController.fetchHeader(O,U);}j.setBusy(Q);S.oApplication.activationStarted(L,Q);Q.then(function(V){k(V);},function(V){if(!i){a.handleError(a.operations.activateDraftEntity,o,S,V,null,{"412":N});if(!W){K();}}});});});return R;}function D(i){return new A(i);}function G(k,K,R,L){if(j.isBusy()){L();return;}var N=k.functionImportPath;var O=k.contexts;var Q=k.sourceControl;var T=k.label;var U=k.operationGrouping;var V=k.skipProperties;var W=D({controller:o,contexts:O,applicationController:S.oApplicationController,operationGrouping:U});var X=function(b1,c1){if(b1.pages){for(var i in b1.pages){var d1=b1.pages[i];if(d1.component.list!=true&&d1.entitySet===c1){return true;}else{var e1=X(d1,c1);if(e1){return true;}}}}return false;};var Y=function(i,b1){var c1=i.getAppComponent().getConfig();if(b1&&b1.sPath){var d1=b1.sPath.split("(")[0].replace("/","");return X(c1.pages[0],d1);}return false;};var Z=function(i){var b1,c1,d1,e1;if(Array.isArray(i)&&i.length===1){b1=i[0];}else{b1={response:{context:i.context}};}c1=b1.response&&b1.response.context;var f1;if(c1&&c1.getObject()){f1=f.registerContext(c1);}d1=o.getOwnerComponent();e1=Y(d1,c1);if(e1&&c1&&c1!==b1.actionContext&&c1.getPath()!=="/undefined"){if(Q){h.navigateFromListItem(c1,false);}else{S.oApplication.navigateToSubContext(c1,false,f1.bIsDraft?2*(1+f1.bIsCreate):1,f1);}}if(i.length>0){var g1=h.getTableBindingInfo(Q);var h1=g1&&g1.binding;if(h1&&h1.oEntityType){h.setEnabledToolbarButtons(Q);if(f.isListReportTemplate()){h.setEnabledFooterButtons(Q);}}}R(i);};var $=function(){if(O&&O[0]){var i=O[0].oModel;if(i&&i.hasPendingChanges()){i.resetChanges();}}};var _=function(i){$();L(i);};var a1=function(i){if(Array.isArray(i)){if(i.length===1){i=i[0].error;}else{i=null;}}var b1={context:O};$();l(a.operations.callAction,null,i,b1);L(i);};W.call(N,T,f.isDraftEnabled(),V).then(function(i){var b1={};b1.actionLabel=T;j.setBusy(i.executionPromise,null,b1);i.executionPromise.then(Z,a1);},_);}function H(i,k){var R=new Promise(function(K,L){S.oApplication.performAfterSideEffectExecution(G.bind(null,i,k,K,L));});return R;}function I(i){var R=new Promise(function(k,K){G(i,null,k,K);});return R;}function J(T,i,k){if(!T){throw new F(s,"Unknown Table");}var K="";var L="";var N;var O=o.getOwnerComponent();var Q=O.getAppComponent();if(O.getMetadata().getName()==="sap.suite.ui.generic.template.ListReport.Component"){N=(O.getCreationEntitySet&&O.getCreationEntitySet())||(T.getEntitySet&&T.getEntitySet());}else{N=(O.getCreationEntitySet&&O.getCreationEntitySet())||O.getEntitySet();}var R,U,V,W;var X=o.getView();var Y=X.getModel();var Z=X.getBindingContext();if(Z){L=h.getTableBindingInfo(T).path;W=Y.getMetaModel();U=W.getODataEntitySet(N);R=W.getODataEntityType(U.entityType);V=W.getODataAssociationSetEnd(R,L);if(V){N=V.entitySet;}L="/"+L;K=O.getComponentContainer().getElementBinding().getPath()+L;}else{K="/"+N;}return new Promise(function($,_){var a1;a1=b.getCacheKeyPartsAsyc(Y);Promise.all(a1).then(function(b1){var c1;if(k){var d1=b.getCacheKey(Q.getId(),N,b1);c1=b.readFromLocalStorage(d1);}else{c1=null;}var e1=new d(T.getModel(),K);var f1=S.oDraftController.getDraftContext().getODataDraftFunctionImportName(e1,"NewAction");var g1;if(false&&f1){g1=I({sourceControl:T,functionImportPath:f1,label:f1.split('/')[1],contexts:[e1],skipProperties:{ResultIsActiveEntity:true}});}else{g1=C.create(S.oDraftController,N,K,Y,S.oApplication,i,c1);}S.oApplication.getBusyHelper().setBusy(g1);g1.catch(l.bind(null,a.operations.addEntry,function(h1){_();throw h1;}));g1.then(function(h1){S.oApplication.markCurrentDraftAsModified();$(h1);});});});}var l=t.testable(l,"handleError");var D=t.testable(D,"getActionUtil");return{editEntity:p,deleteEntity:u,deleteEntities:v,saveEntity:y,activateDraftEntity:z,discardDraft:w,callAction:H,addEntry:J};}return B.extend("sap.suite.ui.generic.template.lib.CRUDManager",{constructor:function(o,f,S,h,i){e(this,g(o,f,S,h,i));}});});