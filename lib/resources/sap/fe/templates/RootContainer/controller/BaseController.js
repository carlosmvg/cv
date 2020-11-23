sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/core/mvc/Controller","sap/ui/core/Component","sap/ui/core/routing/HashChanger","sap/fe/core/CommonUtils","sap/fe/macros/SizeHelper","sap/base/Log"],function(J,C,a,H,b,S,L){"use strict";return C.extend("sap.fe.templates.RootContainer.controller.BaseController",{onInit:function(){var A=a.getOwnerComponentFor(this.getView());this.oRouter=A.getRouter();S.init();},attachShellTitleHandler:function(){var A=a.getOwnerComponentFor(this.getView());var r=A.getRouter();r.attachRouteMatched(this.shellTitleHandler,this);},onExit:function(){this.oRouter.detachRouteMatched(this.shellTitleHandler,this);S.exit();},waitForRightMostViewReady:function(e){return new Promise(function(r){var c=e.getParameter("views"),f=c.filter(function(o){var d=o.getComponentInstance(),g=d.getRootControl(),h=a.getOwnerComponentFor(g);return h.isA("sap.fe.core.TemplateComponent");}),R=f[f.length-1].getComponentInstance(),v=R.getRootControl();if(R.isPageReady()){r(v);}else{R.attachEventOnce("pageReady",function(){r(v);});}});},shellTitleHandler:function(e){var t=this;if(!t.oShellTitlePromise){t.oShellTitlePromise=t.waitForRightMostViewReady(e).then(function(v){var A=b.getAppComponent(v);var d={oView:v,oAppComponent:A};t.computeTitleHierarchy(d);var l=A.getRouterProxy().getFocusControlForCurrentHash();if(v.getController()&&v.getController().onPageReady){v.getParent().onPageReady({lastFocusedControl:l});}t.oShellTitlePromise=null;}).catch(function(){L.error("An error occurs while computing the title hierarchy and calling focus method");t.oShellTitlePromise=null;});}},getTitleHierarchyCache:function(){if(!this.oTitleHierarchyCache){this.oTitleHierarchyCache={};}return this.oTitleHierarchyCache;},_computeTitleInfo:function(t,s,i){var p=i.split("/");if(p[p.length-1].indexOf("?")===-1){i+="?restoreHistory=true";}else{i+="&restoreHistory=true";}return{title:t,subtitle:s,intent:i,icon:""};},addNewEntryInCacheTitle:function(p,A){var t=this.getView().getModel("title");if(!t){var s=A.getMetadata().getManifestEntry("/sap.app/dataSources/mainService/uri");t=new sap.ui.model.odata.v4.ODataModel({serviceUrl:s,synchronizationMode:"None"});}var c=this;var e=p.replace(/ *\([^)]*\) */g,"");var T=A.getMetaModel().getProperty(e+"/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value");var d=A.getMetaModel().getProperty(e+"/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName");var B=t.createBindingContext(p);var P=t.bindProperty(T["$Path"],B);A.getRootControl().setModel(t,"title");P.initialize();return new Promise(function(r,f){var g=H.getInstance().hrefForAppSpecificHash("");var i=g+p.slice(1);var h=function(E){var o=c.getTitleHierarchyCache();o[p]=c._computeTitleInfo(d,E.getSource().getValue(),i);r(o[p]);P.detachChange(h);};P.attachChange(h);});},ensureHierarchyElementsAreStrings:function(h){var c=[];for(var l in h){var o=h[l];var s={};for(var k in o){s[k]=typeof o[k]!=="string"?String(o[k]):o[k];}c.push(s);}return c;},computeTitleHierarchy:function(d){var t=this,v=d.oView,A=d.oAppComponent,c=v.getBindingContext(),o=v.getParent(),T=[],s=H.getInstance().hrefForAppSpecificHash(""),e=A.getMetadata().getManifestEntry("sap.app").title||"",f=A.getMetadata().getManifestEntry("sap.app").appSubTitle||"",g=s,p,n;if(this.bIsComputingTitleHierachy===true){L.warning("computeTitleHierarchy already running ... this call is canceled");return;}this.bIsComputingTitleHierachy=true;if(o&&o._getPageTitleInformation){if(c){n=c.getPath();var P=n.split("/"),h,l="",N=P.length;P.splice(-1,1);P.forEach(function(m,i){if(i===0){var r=A.getManifestEntry("/sap.ui5/routing/routes"),q=A.getManifestEntry("/sap.ui5/routing/targets");var u=function(w){if(typeof r[this.index].target==="string"){return w===r[this.index].target;}else if(typeof r[this.index].target==="object"){for(var k=0;k<r[this.index].target.length;k++){return w===r[this.index].target[k];}}};for(var j=0;j<r.length;j++){var R=A.getRouter().getRoute(r[j].name);if(R.match(P[i])){var w=Object.keys(q).find(u,{index:j});h=A.getRouter().getTarget(w)._oOptions.name;break;}}if(h==="sap.fe.templates.ListReport"){T.push(Promise.resolve(t._computeTitleInfo(e,f,g)));}}else if(i<N){l+="/"+m;if(!t.getTitleHierarchyCache()[l]){T.push(t.addNewEntryInCacheTitle(l,A));}else{T.push(Promise.resolve(t.getTitleHierarchyCache()[l]));}}});}p=o._getPageTitleInformation().then(function(i){var j=H.getInstance().getHash();var k=j.split("/");if(k[k.length-1].indexOf("?")===-1){j+="?restoreHistory=true";}else{j+="&restoreHistory=true";}i.intent=s+j;if(c){t.getTitleHierarchyCache()[n]=i;}else{t.getTitleHierarchyCache()[g]=i;}return i;});T.push(p);}else{T.push(Promise.reject("Title information missing in HeaderInfo"));}Promise.all(T).then(function(i){var j=t.ensureHierarchyElementsAreStrings(i);var k=j[i.length-1].title;A.getShellServices().setHierarchy(j.reverse());A.getShellServices().setTitle(k);}).catch(function(E){L.error(E);}).finally(function(){t.bIsComputingTitleHierachy=false;}).catch(function(E){L.error(E);});}});});