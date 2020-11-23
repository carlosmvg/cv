sap.ui.define(["sap/ui/base/Object","sap/suite/ui/generic/template/lib/MessageUtils","sap/suite/ui/generic/template/lib/testableHelper","sap/suite/ui/generic/template/lib/FeLogger","sap/base/util/extend","sap/base/util/isEmptyObject","sap/suite/ui/generic/template/lib/FeError"],function(B,M,t,F,a,i,b){"use strict";var c="lib.BusyHelper";var f=new F(c);var l=f.getLogger();var L=f.Level;function g(T){var m={};var I=false;var d=false;var h=0;T.oNavigationHost.setBusyIndicatorDelay(0);var u=Promise.resolve();var U=Function.prototype;var o={};function j(){return h!==0||!i(m);}var A;function k(e){var w=j();if(w||e){d=false;T.oNavigationHost.setBusy(w);l.info("Physical busy state has been changed to "+w);if(w!==I){I=w;if(!I){var x=T&&T.oNavigationControllerProxy&&T.oNavigationControllerProxy.getActiveComponents();if(x){for(var y=0;y<x.length;y++){var z=x[y];if(!z){continue;}var C=T.componentRegistry&&T.componentRegistry[z]&&T.componentRegistry[z].oController;C&&C.adaptTransientMessageExtension&&C.adaptTransientMessageExtension();}}u=Promise.resolve();u=M.handleTransientMessages(T.oApplicationProxy.getDialogFragment,o.actionLabel);o={};u.then(U);}}}else{var N=T.oNavigationObserver.getProcessFinished(true);N.then(A,A);}}A=k.bind(null,true);function E(e){if(e){k();}else if(!d){d=true;setTimeout(k,0);}}function n(){h--;if(!h){E(false);}}function p(){if(I){return;}I=true;u=new Promise(function(R){U=R;});M.removeTransientMessages();}function q(w,x,y){var S=[],C="",z=T.oNavigationHost.getId(),D="sap.suite.ui.generic.template.busyHandling";try{throw new b(c,"Get the stack");}catch(e){S=e.stack.split(w,2);if(S.length>=2){S=S[1].split("\n");S.shift();}if(S.length){C=S[0].trim();}}if(l.getLevel(D)<L.INFO){l.setLevel(L.INFO,D);}l.info("busyHandling: "+w,y+" called",D,function(){var G={method:w,reason:y,promise:x,promisePending:true,caller:C,callStack:S,elementId:z,type:D};function P(){G.promisePending=false;}G.promise.then(P,P);return G;});}function s(R,e,w,S){var x;if(e){a(o,S);p();if(!m[R]){x=new Promise(function(y){m[R]=y;});if(sap.ui.support){q("setBusyReason",x,R);}}}else{if(m[R]){m[R]();}delete m[R];}E(e&&w);}function r(e,w,S){a(o,S);h++;p();e.then(n,n);E(w);if(sap.ui.support){q("setBusy",e,"");}}function v(){return 0;}return{setBusyReason:s,setBusy:r,isBusy:j,getUnbusy:function(){return u;},getBusyDelay:v};}return B.extend("sap.suite.ui.generic.template.lib.BusyHelper",{constructor:function(T){a(this,(t.testableStatic(g,"BusyHelper"))(T));}});});