//@ui5-bundle sap/ushell/components/pages/Component-preload.js
//Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.predefine('sap/ushell/components/pages/ActionMode',["sap/ui/core/library","sap/m/MessageBox","sap/m/MessageToast","sap/ushell/resources","sap/ushell/EventHub","sap/base/Log"],function(c,M,a,r,E,L){"use strict";var A={};A.start=function(C){this.oController=C;C.getView().getModel("viewSettings").setProperty("/actionModeActive",true);E.emit("enableMenuBarNavigation",false);var o=sap.ui.getCore().byId("ActionModeBtn");var s=r.i18n.getText("PageRuntime.EditMode.Exit");o.setTooltip(s);o.setText(s);};A.cancel=function(){this._cleanup();};A.save=function(){L.info("store actions in pages service");this._cleanup();};A._cleanup=function(){this.oController.getView().getModel("viewSettings").setProperty("/actionModeActive",false);E.emit("enableMenuBarNavigation",true);var o=sap.ui.getCore().byId("ActionModeBtn");var s=r.i18n.getText("PageRuntime.EditMode.Activate");o.setTooltip(s);o.setText(s);};A.addVisualization=function(e,s,p){var m=s.getBindingContext().getModel(),P=s.getBindingContext().getPath(),b=P.split("/"),i=parseInt(b[2],10);var d=m.getProperty("/pages/"+i+"/id"),S=m.getProperty(P+"/id");sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(C){var f="Shell-appfinder?&/catalog/"+JSON.stringify({pageID:encodeURIComponent(d),sectionID:encodeURIComponent(S)});C.toExternal({target:{shellHash:f}});});};A.addSection=function(e,s,p){var S=p.index;var P=s.getBindingContext().getPath();var b=P.split("/");var i=parseInt(b[2],10);return this.oController.getOwnerComponent().getPagesService().then(function(o){o.addSection(i,S);var d={onAfterRendering:function(){setTimeout(function(){s.getSections()[S].byId("title-edit").focus();},0);s.removeEventDelegate(d);}};s.addEventDelegate(d);});};A.deleteSection=function(e,s,p){return sap.ushell.Container.getServiceAsync("Message").then(function(m){var t=s.getTitle(),b=t?r.i18n.getText("PageRuntime.Message.Section.Delete",t):r.i18n.getText("PageRuntime.Message.Section.DeleteNoTitle"),d=r.i18n.getText("PageRuntime.Dialog.Title.Delete");function C(o){if(o===M.Action.DELETE){this.oController.getOwnerComponent().getPagesService().then(function(P){var f=s.getBindingContext().getPath(),g=s.getParent(),h=f.split("/"),i=parseInt(h[2],10),S=parseInt(h[4],10);P.deleteSection(i,S);a.show(r.i18n.getText("PageRuntime.MessageToast.SectionDeleted"));var j=g.getSections();if(j.length){var k=j[S!==0?S-1:S];k.focus();var l={onAfterRendering:function(){k.focus();k.removeEventDelegate(l);}};k.addEventDelegate(l);}else{var n={onAfterRendering:function(){g.focus();g.removeEventDelegate(n);}};g.addEventDelegate(n);}});}}m.confirm(b,C.bind(this),d,[M.Action.DELETE,M.Action.CANCEL]);}.bind(this));};A.resetSection=function(e,s,p){var S=s;var P=S.getBindingContext().getPath();var b=P.split("/");var i=parseInt(b[2],10);var d=parseInt(b[4],10);return this.oController.getOwnerComponent().getPagesService().then(function(o){o.resetSection(i,d);a.show(r.i18n.getText("PageRuntime.MessageToast.SectionReset"));});};A.changeSectionTitle=function(e,s,p){var P=s.getBindingContext().getPath();var n=s.getProperty("title");var b=P.split("/");var i=parseInt(b[2],10);var S=parseInt(b[4],10);return this.oController.getOwnerComponent().getPagesService().then(function(o){o.renameSection(i,S,n);});};A.moveSection=function(e,s,p){var S=p.draggedControl.getBindingContext().getPath();var t=p.droppedControl.getBindingContext().getPath();var d=p.dropPosition;var T=t.split("/");var b=S.split("/");var P=parseInt(b[2],10);var f=parseInt(b[4],10);var g=parseInt(T[4],10);if(f===g-1&&d==="Before"||f===g+1&&d==="After"){return Promise.resolve();}if(d==="After"){g=g+1;}var o=this.oController._getAncestorPage(p.droppedControl);var h=o.getSections();var i;if(f<g){for(i=f+1;i<g;i++){this.oController._setPromiseInSection(h[i],h[i-1]);}this.oController._setPromiseInSection(h[f],h[g-1]);}else{for(i=g;i<f;i++){this.oController._setPromiseInSection(h[i],h[i+1]);}this.oController._setPromiseInSection(h[f],h[g]);}var C=this.oController.getOwnerComponent();return C.getPagesService().then(function(j){return j.moveSection(P,f,g);}).then(function(){var j=r.i18n.getText("PageRuntime.Message.SectionMoved");C.getInvisibleMessageInstance().announce(j,c.InvisibleMessageMode.Polite);});};A.changeSectionVisibility=function(e,s,p){if(this.oController===undefined||p.visible===undefined){return Promise.resolve();}var P=s.getBindingContext().getPath();var v=p.visible;var b=P.split("/");var i=parseInt(b[2],10);var S=parseInt(b[4],10);return this.oController.getOwnerComponent().getPagesService().then(function(o){o.setSectionVisibility(i,S,v);});};return A;});
sap.ui.predefine('sap/ushell/components/pages/Component',["sap/ui/core/InvisibleMessage","sap/ui/core/UIComponent","sap/ushell/components/SharedComponentUtils","sap/ushell/resources"],function(I,U,S,r){"use strict";return U.extend("sap.ushell.components.pages.Component",{metadata:{manifest:"json",library:"sap.ushell"},init:function(){U.prototype.init.apply(this,arguments);S.toggleUserActivityLog();S.getEffectiveHomepageSetting("/core/home/sizeBehavior","/core/home/sizeBehaviorConfigurable");this.setModel(r.i18nModel,"i18n");this._oPagesService=sap.ushell.Container.getServiceAsync("Pages");this._oInvisibleMessageInstance=I.getInstance();},getPagesService:function(){return this._oPagesService;},getInvisibleMessageInstance:function(){return this._oInvisibleMessageInstance;},getComponentData:function(){return{};}});});
sap.ui.predefine('sap/ushell/components/pages/StateManager',["sap/ushell/utils"],function(S){"use strict";var a={};a.init=function(p,b){this.oPagesRuntimeNavContainer=p;this.oPagesNavContainer=b;this._oURLParsingService=sap.ushell.Container.getServiceAsync("URLParsing");this.oPagesRuntimeNavContainer.attachNavigate(this._onErrorPageNavigated,this);this.oPagesNavContainer.attachNavigate(this._onPageNavigated,this);this._onTabNavigatedBind=this._onTabNavigated.bind(this);document.addEventListener("visibilitychange",this._onTabNavigatedBind);this.oEventBus=sap.ui.getCore().getEventBus();this.oEventBus.subscribe("launchpad","setConnectionToServer",this._onEnableRequests,this);this.oEventBus.subscribe("sap.ushell","navigated",this._onShellNavigated,this);};a._onEnableRequests=function(c,e,d){if(!d||d.active===undefined){return;}this._setCurrentPageVisibility(d.active);};a._setCurrentPageVisibility=function(v,r,n){if(this.oPagesRuntimeNavContainer.getCurrentPage().isA("sap.m.MessagePage")&&!n){return;}var c=this.oPagesNavContainer.getCurrentPage();this._setPageVisibility(c,v,r);};a._setPageVisibility=function(p,v,r){if(!p){return;}this._visitVisualizations(p,function(b){b.setActive(v,r);});};a._visitVisualizations=function(p,v){if(!v){return;}p.getContent()[0].getAggregation("sections").forEach(function(s){s.getAggregation("visualizations").forEach(v);});};a._onShellNavigated=function(){return this._oURLParsingService.then(function(u){var h=window.hasher.getHash();var H=u.parseShellHash(h);if(S.isRootIntent(h)||(H.semanticObject==="Launchpad"&&H.action==="openFLPPage")){this._setCurrentPageVisibility(true,true);}else{this._setCurrentPageVisibility(false,false);}}.bind(this));};a._onTabNavigated=function(){return this._oURLParsingService.then(function(u){var h=window.hasher.getHash();var H=u.parseShellHash(h);if(S.isRootIntent(h)||(H.semanticObject==="Launchpad"&&H.action==="openFLPPage")){this._setCurrentPageVisibility(!document.hidden);}}.bind(this));};a._onPageNavigated=function(e){var p=e.getParameters();this._setPageVisibility(p.from,false,false);this._setPageVisibility(p.to,true,true);};a._onErrorPageNavigated=function(e){var t=e.getParameter("to");this._setCurrentPageVisibility(!t.isA("sap.m.MessagePage"),undefined,true);};a.exit=function(){this.oEventBus.unsubscribe("sap.ushell","navigated",this._onPageNavigated,this);document.removeEventListener("visibilitychange",this._onTabNavigatedBind);this.oPagesNavContainer.detachNavigate(this._onPageNavigated,this);this.oPagesRuntimeNavContainer.detachNavigate(this._onErrorPageNavigated,this);this.oEventBus.unsubscribe("launchpad","setConnectionToServer",this._onEnableRequests,this);};return a;});
sap.ui.predefine('sap/ushell/components/pages/controller/PageRuntime.controller',["sap/ui/core/library","sap/ui/core/mvc/Controller","sap/m/GenericTile","sap/ushell/resources","sap/ui/model/json/JSONModel","sap/ushell/Config","sap/m/library","sap/m/MessageToast","sap/ushell/components/pages/StateManager","sap/ushell/EventHub","sap/ushell/utils"],function(c,C,G,r,J,a,l,M,s,E,u){"use strict";return C.extend("sap.ushell.components.pages.controller.Pages",{onInit:function(){var p=a.last("/core/shell/enablePersonalization");if(a.last("/core/spaces/vizInstantiation/enabled")){this._oVisualizationInstantiationServicePromise=sap.ushell.Container.getServiceAsync("VisualizationInstantiation");}else{this._oVisualizationInstantiationServicePromise=sap.ushell.Container.getServiceAsync("VisualizationLoading");}this._oURLParsingService=sap.ushell.Container.getServiceAsync("URLParsing");this._oViewSettingsModel=new J({sizeBehavior:a.last("/core/home/sizeBehavior"),actionModeActive:false,showHideButton:a.last("/core/catalog/enableHideGroups"),enableVisualizationReordering:p,showPageTitle:false});this.getView().setModel(this._oViewSettingsModel,"viewSettings");this._aConfigListeners=a.on("/core/home/sizeBehavior").do(function(S){this._oViewSettingsModel.setProperty("/sizeBehavior",S);}.bind(this));this._oErrorPageModel=new J({icon:"sap-icon://documents",text:"",description:"",details:""});this.getView().setModel(this._oErrorPageModel,"errorPage");Promise.all([this._oVisualizationInstantiationServicePromise,this.getOwnerComponent().getPagesService()]).then(function(S){this._oVisualizationInstantiationService=S[0];this.getView().setModel(S[1].getModel());}.bind(this));this.sCurrentTargetPageId="";this._openFLPPage();this.oContainerRouter=sap.ushell.Container.getRenderer().getRouter();this.oContainerRouter.getRoute("home").attachMatched(this._openFLPPage,this);this.oContainerRouter.getRoute("openFLPPage").attachMatched(this._openFLPPage,this);this.oErrorPage=this.byId("errorPage");this.oPagesNavContainer=this.byId("pagesNavContainer");this.oPagesRuntimeNavContainer=this.byId("pagesRuntimeNavContainer");s.init(this.oPagesRuntimeNavContainer,this.oPagesNavContainer);this.oEventHubListener=E.once("PagesRuntimeRendered").do(function(){if(p){this._createActionModeButton();}E.emit("firstSegmentCompleteLoaded",true);}.bind(this));this._oEventBus=sap.ui.getCore().getEventBus();this._oEventBus.subscribe("launchpad","shellFloatingContainerIsDocked",this._handleUshellContainerDocked,this);this._oEventBus.subscribe("launchpad","shellFloatingContainerIsUnDocked",this._handleUshellContainerDocked,this);this.oVisualizationLoadingListener=E.on("VizInstanceLoaded").do(function(){this._setPerformanceMark();if(!this.oVisualizationLoadingListenerTimeout){this.oVisualizationLoadingListenerTimeout=setTimeout(function(){this.oVisualizationLoadingListener.off();}.bind(this),5000);}}.bind(this));},_setPerformanceMark:function(){u.setPerformanceMark("FLP-TTI-Homepage",{bUseUniqueMark:true,bUseLastMark:true});},_getPageAndSpaceId:function(){return this._oURLParsingService.then(function(b){var i=window.hasher.getHash();var h=b.parseShellHash(window.hasher.getHash());var H=h.params||{};var p=H.pageId||[];var S=H.spaceId||[];return this._parsePageAndSpaceId(p,S,i);}.bind(this));},_parsePageAndSpaceId:function(p,b,i){if(p.length<1&&b.length<1){if(u.isRootIntent(i)){return this._getUserDefaultPage();}return Promise.reject(r.i18n.getText("PageRuntime.NoPageIdAndSpaceIdProvided"));}if(p.length===1&&b.length===0){return Promise.reject(r.i18n.getText("PageRuntime.OnlyPageIdProvided"));}if(p.length===0&&b.length===1){return Promise.reject(r.i18n.getText("PageRuntime.OnlySpaceIdProvided"));}if(p.length>1||b.length>1){return Promise.reject(r.i18n.getText("PageRuntime.MultiplePageOrSpaceIdProvided"));}if(p[0]===""){return Promise.reject(r.i18n.getText("PageRuntime.InvalidPageId"));}if(b[0]===""){return Promise.reject(r.i18n.getText("PageRuntime.InvalidSpaceId"));}return Promise.resolve({pageId:p[0],spaceId:b[0]});},_getUserDefaultPage:function(){return sap.ushell.Container.getServiceAsync("Menu").then(function(m){return m.getSpacesPagesHierarchy();}).then(function(S){if(S.spaces.length===0){return Promise.reject(r.i18n.getText("PageRuntime.NoAssignedSpace"));}var o=S.spaces.find(function(b){return(!!(b.id&&b.pages&&b.pages[0]&&b.pages[0].id));});if(!o){return Promise.reject(r.i18n.getText("PageRuntime.NoAssignedPage"));}return{spaceId:o.id,pageId:o.pages[0].id};});},_openFLPPage:function(){var p,S;return this._getPageAndSpaceId().then(function(i){p=i.pageId;S=i.spaceId;this.sCurrentTargetPageId=p;return this.getOwnerComponent().getPagesService().then(function(b){return b.loadPage(p);}).then(function(){if(this.sCurrentTargetPageId===p){return this._navigate(p,S);}return Promise.resolve();}.bind(this)).then(this._notifyOnPageRuntimeRendered).catch(function(e){if(e instanceof Error){this._oErrorPageModel.setProperty("/text",r.i18n.getText("PageRuntime.GeneralError.Text"));}else{var d=r.i18n.getText("PageRuntime.CannotLoadPage.Description")+JSON.stringify(e);this._oErrorPageModel.setProperty("/icon","sap-icon://documents");this._oErrorPageModel.setProperty("/text",r.i18n.getText("PageRuntime.CannotLoadPage.Text",[p,S]));this._oErrorPageModel.setProperty("/description","");this._oErrorPageModel.setProperty("/details",d);}this.oPagesRuntimeNavContainer.to(this.oErrorPage);this._notifyOnPageRuntimeRendered();}.bind(this));}.bind(this)).catch(function(e){this._oErrorPageModel.setProperty("/icon","sap-icon://documents");this._oErrorPageModel.setProperty("/text",e||"");this._oErrorPageModel.setProperty("/description","");this._oErrorPageModel.setProperty("/details","");this.oPagesRuntimeNavContainer.to(this.oErrorPage);this._notifyOnPageRuntimeRendered();}.bind(this));},_navigate:function(t,b){var p=this.oPagesNavContainer.getPages().find(function(o){return t===o.data("pageId");});if(!p){return Promise.reject();}return sap.ushell.Container.getServiceAsync("Menu").then(function(m){return m.hasMultiplePages(b);}).then(function(h){this._oViewSettingsModel.setProperty("/showPageTitle",h);this.oPagesNavContainer.to(p);this.oPagesRuntimeNavContainer.to(this.oPagesNavContainer);}.bind(this));},_notifyOnPageRuntimeRendered:function(){E.emit("PagesRuntimeRendered");if(E.last("AppRendered")!==undefined){E.emit("AppRendered",undefined);}},_pressViewDetailsButton:function(){var e=this._oErrorPageModel.getProperty("/details")||"";this._oErrorPageModel.setProperty("/description",e);},_copyToClipboard:function(){var t=document.createElement("textarea");try{t.contentEditable=true;t.readonly=false;t.textContent=this._oErrorPageModel.getProperty("/description");document.documentElement.appendChild(t);t.select();document.execCommand("copy");M.show(r.i18n.getText("PageRuntime.CannotLoadPage.CopySuccess"),{closeOnBrowserNavigation:false});}catch(e){M.show(r.i18n.getText("PageRuntime.CannotLoadPage.CopyFail"),{closeOnBrowserNavigation:false});}finally{t.parentNode.removeChild(t);}},_visualizationFactory:function(i,b){if(this._oVisualizationInstantiationService){var d=b.getObject();var v=this._oVisualizationInstantiationService.instantiateVisualization(d);v.attachPress(this.onVisualizationPress,this);v.bindEditable("viewSettings>/actionModeActive");return v;}return new G({state:l.LoadState.Failed});},onVisualizationPress:function(e){var S=e.getParameter("scope");var A=e.getParameter("action");var o=e.getSource().getBindingContext();var p=o.getPath();var P=p.split("/");if(S==="Actions"&&A==="Remove"){return this.getOwnerComponent().getPagesService().then(function(b){b.deleteVisualization(P[2],P[4],P[6]);M.show(r.i18n.getText("PageRuntime.MessageToast.TileRemoved"));});}return Promise.resolve();},onExit:function(){this.oContainerRouter.getRoute("home").detachMatched(this._openFLPPage,this);this.oContainerRouter.getRoute("openFLPPage").detachMatched(this._openFLPPage,this);this._aConfigListeners.off();this.oEventHubListener.off();this._oEventBus.unsubscribe("launchpad","shellFloatingContainerIsDocked",this._handleUshellContainerDocked,this);this._oEventBus.unsubscribe("launchpad","shellFloatingContainerIsUnDocked",this._handleUshellContainerDocked,this);s.exit();},_createActionModeButton:function(){var A={id:"ActionModeBtn",text:r.i18n.getText("PageRuntime.EditMode.Activate"),icon:"sap-icon://edit",press:[this.pressActionModeButton,this]};var t=sap.ui.getCore().byId(A.id);if(t){t.setTooltip(A.text);t.setText(A.text);t.attachPress(A.press);}else{var o={controlType:"sap.ushell.ui.launchpad.ActionItem",oControlProperties:A,bIsVisible:true,aStates:["home"]};var R=sap.ushell.Container.getRenderer("fiori2");R.addUserAction(o).done(function(b){t=b;if(a.last("/core/extension/enableHelp")){t.addStyleClass("help-id-ActionModeBtn");}});}},pressActionModeButton:function(){var A=this.getView().getModel("viewSettings").getProperty("/actionModeActive");sap.ui.require(["sap/ushell/components/pages/ActionMode"],function(b){if(A){b.cancel();}else{b.start(this);}}.bind(this));},handleEditModeAction:function(h,e,S,p){sap.ui.require(["sap/ushell/components/pages/ActionMode"],function(A){A[h](e,S,p);});},_getAncestorSection:function(o){if(o.isA("sap.ushell.ui.launchpad.Section")){return o;}else if(o.getParent){return this._getAncestorSection(o.getParent());}return null;},_getAncestorPage:function(o){if(o.isA("sap.ushell.ui.launchpad.Page")){return o;}else if(o.getParent){return this._getAncestorPage(o.getParent());}return null;},_setPromiseInSection:function(R,p){var v=new Promise(function(b,d){R.setVizMoveResolve(b);});p.setVizMovePromise(v);},moveVisualization:function(e,S,p){var b=p.draggedControl.getBindingContext().getPath();var t=p.droppedControl.getBindingContext().getPath();var d=p.dropPosition;var T=t.split("/");var i=-1;if(T.length>5){i=parseInt(T[6],10);}var f=b.split("/");var P=parseInt(f[2],10);var g=parseInt(f[4],10);var h=parseInt(f[6],10);var j=parseInt(T[4],10);if(g===j&&(h===i-1&&d==="Before"||h===i+1&&d==="After"||h===i)){return Promise.resolve();}var o=this._getAncestorSection(p.draggedControl);var k=this._getAncestorSection(p.droppedControl);if(k.getDefault()&&!o.getDefault()){return Promise.resolve();}p.draggedControl.invalidate();if(!(o.getDefault()&&o.getVisualizations().length===1)){this._setPromiseInSection(o,k);}if(k._focusItem){k._focusItem(i);}if(d==="After"){i+=1;}var m=this.getOwnerComponent();return m.getPagesService().then(function(n){return n.moveVisualization(P,g,h,j,i);}).then(function(){var v=r.i18n.getText("PageRuntime.Message.TileMoved");m.getInvisibleMessageInstance().announce(v,c.InvisibleMessageMode.Polite);});},onDragEnter:function(e){var t=e.getParameter("dragSession").getDropControl();if(t.getDefault()){e.preventDefault();}},_handleUshellContainerDocked:function(b,e){this._oViewSettingsModel.setProperty("/ushellContainerDocked",e==="shellFloatingContainerIsDocked");}});});
sap.ui.require.preload({
	"sap/ushell/components/pages/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.ushell.components.pages","applicationVersion":{"version":"1.82.2"},"i18n":{"bundleUrl":"../../renderers/fiori2/resources/resources.properties","supportedLocales":["","ar","bg","ca","cs","da","de","el","en","en_US","en_US_sappsd","en_US_saptrc","es","et","fi","fr","hi","hr","hu","it","iw","ja","kk","ko","lt","lv","ms","nl","no","pl","pt","ro","ru","sh","sk","sl","sv","th","tr","uk","vi","zh_CN","zh_TW"],"fallbackLocale":"en"},"ach":"CA-FLP-FE-COR","type":"component","title":"{{Component.Pages.Title}}","resources":"resources.json"},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"componentName":"sap.ushell.components.pages","rootView":{"viewName":"sap.ushell.components.pages.view.PageRuntime","type":"XML","async":true},"dependencies":{"minUI5Version":"1.72","libs":{"sap.ui.core":{},"sap.m":{},"sap.f":{}}},"contentDensities":{"compact":true,"cozy":true}}}',
	"sap/ushell/components/pages/view/PageRuntime.view.xml":'<mvc:View height="100%" controllerName="sap.ushell.components.pages.controller.PageRuntime" xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc" xmlns:dnd="sap.ui.core.dnd" xmlns:data="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1" xmlns:lp="sap.ushell.ui.launchpad"><NavContainer id="pagesRuntimeNavContainer"><NavContainer id="pagesNavContainer" pages="{/pages}"><Page data:pageId="{id}" showHeader="false" backgroundDesign="Transparent" floatingFooter="true"><content><lp:Page edit="{viewSettings&gt;/actionModeActive}" showTitle="{viewSettings&gt;/showPageTitle}" title="{title}" sections="{path:\'sections\',templateShareable:false}" addSectionButtonPressed=".handleEditModeAction(\'addSection\', $event, ${$source&gt;/}, ${$parameters&gt;/})" enableSectionReordering="{viewSettings&gt;/actionModeActive}" sectionDrop=".handleEditModeAction(\'moveSection\', $event, ${$source&gt;/}, ${$parameters&gt;/})"><lp:sections><lp:Section title="{title}" class="sapContrastPlus" sizeBehavior="{viewSettings&gt;/sizeBehavior}" default="{default}" visualizations="{path:\'visualizations\',factory:\'._visualizationFactory\',key:\'id\'}" enableGridBreakpoints="false" enableGridContainerQuery="{viewSettings&gt;/ushellContainerDocked}" editable="{viewSettings&gt;/actionModeActive}" add=".handleEditModeAction(\'addVisualization\', $event, ${$source&gt;/}, ${$parameters&gt;/})" delete=".handleEditModeAction(\'deleteSection\', $event, ${$source&gt;/}, ${$parameters&gt;/})" reset=".handleEditModeAction(\'resetSection\', $event, ${$source&gt;/}, ${$parameters&gt;/})" sectionVisibilityChange=".handleEditModeAction(\'changeSectionVisibility\', $event, ${$source&gt;/}, ${$parameters&gt;/})" titleChange=".handleEditModeAction(\'changeSectionTitle\', $event, ${$source&gt;/}, ${$parameters&gt;/})" enableVisualizationReordering="{viewSettings&gt;/enableVisualizationReordering}" visualizationDrop=".moveVisualization($event, ${$source&gt;/}, ${$parameters&gt;/})" showSection="{= ${visible} &amp;&amp; (${visualizations}.length || ${viewSettings&gt;/actionModeActive})}" enableResetButton="{preset}" enableDeleteButton="{= !${preset}}" enableShowHideButton="{viewSettings&gt;/showHideButton}"/></lp:sections><lp:dragDropConfig><dnd:DropInfo groupName="Section" targetAggregation="sections" dragEnter=".onDragEnter" drop=".moveVisualization($event, ${$source&gt;/}, ${$parameters&gt;/})"/></lp:dragDropConfig></lp:Page></content><footer><Bar class="sapUshellDashboardFooter" visible="{viewSettings&gt;/actionModeActive}"><contentRight><Button text="{i18n&gt;closeEditMode}" type="Emphasized" press=".handleEditModeAction(\'save\', $event, ${$source&gt;/}, ${$parameters&gt;/})"/></contentRight><customData><core:CustomData xmlns:core="sap.ui.core" key="sap-ui-fastnavgroup" value="true" writeToDom="true"/></customData></Bar></footer><landmarkInfo><PageAccessibleLandmarkInfo rootRole="Region" rootLabel="{i18n&gt;PageSectionRegion}" headerRole="None" contentRole="None" footerRole="None"/></landmarkInfo></Page></NavContainer><MessagePage id="errorPage" showHeader="false" icon="{errorPage&gt;/icon}" text="{errorPage&gt;/text}" description="{errorPage&gt;/description}"><buttons><Button text="{i18n&gt;PageRuntime.CannotLoadPage.DetailsButton}" visible="{= !!${errorPage&gt;/details} &amp;&amp; !${errorPage&gt;/description}}" press="._pressViewDetailsButton"/><Button text="{i18n&gt;PageRuntime.CannotLoadPage.CopyButton}" visible="{= !!${errorPage&gt;/details} }" press="._copyToClipboard"/></buttons></MessagePage></NavContainer></mvc:View>'
},"sap/ushell/components/pages/Component-preload"
);
//# sourceMappingURL=Component-preload.js.map