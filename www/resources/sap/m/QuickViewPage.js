/*
 * ! OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library','sap/ui/core/Control','sap/ui/core/IconPool','sap/ui/layout/form/SimpleForm','sap/ui/layout/VerticalLayout','sap/ui/layout/HorizontalLayout','./Page','./Button','./Bar','./Title','./Image','./Link','./Text','./Label','./HBox','sap/ui/core/Icon','sap/ui/core/Title','sap/ui/core/CustomData','sap/ui/core/library','sap/ui/layout/library','sap/ui/Device','sap/ui/layout/form/ResponsiveGridLayout','./QuickViewPageRenderer',"sap/base/security/encodeURL","sap/ui/dom/jquery/Focusable"],function(l,C,I,S,V,H,P,B,a,T,b,L,c,d,f,g,h,i,m,n,D,R,Q,o){"use strict";var U=l.URLHelper;var p=n.form.SimpleFormLayout;var q=m.TitleLevel;var r=l.QuickViewGroupElementType;var s=l.ButtonType;var t=C.extend("sap.m.QuickViewPage",{metadata:{library:"sap.m",properties:{pageId:{type:"string",group:"Misc",defaultValue:""},header:{type:"string",group:"Misc",defaultValue:""},title:{type:"string",group:"Misc",defaultValue:""},titleUrl:{type:"string",group:"Misc",defaultValue:""},crossAppNavCallback:{type:"object",group:"Misc"},description:{type:"string",group:"Misc",defaultValue:""},icon:{type:"string",group:"Misc",defaultValue:""},fallbackIcon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null}},defaultAggregation:"groups",aggregations:{groups:{type:"sap.m.QuickViewGroup",multiple:true,singularName:"group",bindable:"bindable"}}}});t.prototype.init=function(){this._oResourceBundle=sap.ui.getCore().getLibraryResourceBundle('sap.m');var G=sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService;if(G){this.oCrossAppNavigator=G("CrossApplicationNavigation");}};t.prototype.onBeforeRendering=function(){this._destroyPageContent();this._createPageContent();};t.prototype.getPageContent=function(){return this._mPageContent;};t.prototype.setNavContext=function(e){this._mNavContext=e;};t.prototype.getNavContext=function(){return this._mNavContext;};t.prototype.setPageTitleControl=function(e){this._oPageTitle=e;};t.prototype.getPageTitleControl=function(){return this._oPageTitle;};t.prototype._createPage=function(){var e=this._createPageContent();var N=this.getNavContext();var j;if(this._oPage){j=this._oPage;j.destroyContent();j.setCustomHeader(new a());}else{j=this._oPage=new P(N.quickViewId+'-'+this.getPageId(),{customHeader:new a()});j.addEventDelegate({onAfterRendering:this.onAfterRenderingPage},this);}if(this.getHeader()===""&&N.quickView.getPages().length===1&&!D.system.phone){j.setShowHeader(false);j.addStyleClass('sapMQuickViewPageWithoutHeader');}if(e.header){j.addContent(e.header);}j.addContent(e.form);var k=j.getCustomHeader();k.addContentMiddle(new T({text:this.getHeader()}).addStyleClass("sapMQuickViewTitle"));if(N.hasBackButton){k.addContentLeft(new B({type:s.Back,tooltip:this._oResourceBundle.getText("PAGE_NAVBUTTON_TEXT"),press:function(){if(N.navContainer){N.quickView._setNavOrigin(null);N.navContainer.back();}}}));}if(N.popover&&D.system.phone){k.addContentRight(new B({icon:I.getIconURI("decline"),press:function(){N.popover.close();}}));}j.addStyleClass('sapMQuickViewPage');return j;};t.prototype.onAfterRenderingPage=function(){var e=this.getParent(),j=e instanceof C&&e.isA('sap.m.QuickView');if(j&&!this._oPage.$().firstFocusableDomRef()){this._oPage.$('cont').attr('tabindex',0);}if(this._bItemsChanged){var N=this.getNavContext();if(N){N.quickView._restoreFocus();}this._bItemsChanged=false;}};t.prototype._createPageContent=function(){var F=this._createForm();var e=this._getPageHeaderContent();var j=this.getPageTitleControl();if(e&&j){F.addAriaLabelledBy(j);}this._mPageContent={form:F,header:e};return this._mPageContent;};t.prototype._createForm=function(){var G=this.getAggregation("groups"),F=new S({maxContainerCols:1,editable:false,layout:p.ResponsiveGridLayout});if(G){for(var j=0;j<G.length;j++){if(G[j].getVisible()){this._renderGroup(G[j],F);}}}return F;};t.prototype._getPageHeaderContent=function(){var e,F,j=this.getFallbackIcon(),v=new V(),k=new H(),u=this.getIcon(),w=this.getTitle(),x=this.getDescription(),y=this.getTitleUrl();if(!u&&!w&&!x){return null;}if(u){if(this.getIcon().indexOf("sap-icon")==0){e=this._createIcon(u,!y,w);}else{e=new b({src:u,decorative:false,tooltip:w}).addStyleClass("sapUiIcon sapMQuickViewPageImage");if(I.isIconURI(j)){F=this._createIcon(j,!y,w);F.addStyleClass("sapMQuickViewThumbnail sapMQuickViewPageFallbackIconHidden");e.attachError(this._onImageLoadError.bind(this));k.addContent(F);}}e.addStyleClass("sapMQuickViewThumbnail");if(y){e.attachPress(this._crossApplicationNavigation(this));if(F){F.attachPress(this._crossApplicationNavigation(this));}}k.addContent(e);}var z;if(y){z=new L({text:w,href:y,target:"_blank"});}else if(this.getCrossAppNavCallback()){z=new L({text:w});z.attachPress(this._crossApplicationNavigation(this));}else{z=new T({text:w,level:q.H1});}this.setPageTitleControl(z);var A=new c({text:x});v.addContent(z);v.addContent(A);k.addContent(v);return k;};t.prototype._createIcon=function(e,j,k){return new g({src:e,decorative:j,useIconTooltip:false,tooltip:k});};t.prototype._renderGroup=function(G,F){var e=G.getAggregation("elements");var j,u,v;if(G.getHeading()){F.addContent(new h({text:G.getHeading(),level:q.H2}));}if(!e){return;}var N=this.getNavContext();for(var k=0;k<e.length;k++){j=e[k];if(!j.getVisible()){continue;}v=new d({text:j.getLabel()});var w;if(N){w=N.quickViewId;}u=j._getGroupElementValue(w);F.addContent(v);if(!u){F.addContent(new c({text:""}));continue;}v.setLabelFor(u.getId());if(j.getType()==r.pageLink){u.attachPress(this._attachPressLink(this));}if(j.getType()==r.mobile&&!D.system.desktop){var x=new g({src:I.getIconURI("post"),tooltip:this._oResourceBundle.getText("QUICKVIEW_SEND_SMS"),decorative:false,customData:[new i({key:"phoneNumber",value:j.getValue()})],press:this._mobilePress});var y=new f({items:[u,x]});F.addContent(y);}else{F.addContent(u);}}};t.prototype._crossApplicationNavigation=function(e){return function(){if(e.getCrossAppNavCallback()&&e.oCrossAppNavigator){var j=e.getCrossAppNavCallback();if(typeof j=="function"){var k=j();var u=e.oCrossAppNavigator.hrefForExternal({target:{semanticObject:k.target.semanticObject,action:k.target.action},params:k.params});U.redirect(u);}}else if(e.getTitleUrl()){window.open(e.getTitleUrl(),"_blank");}};};t.prototype._destroyPageContent=function(){if(!this._mPageContent){return;}if(this._mPageContent.form){this._mPageContent.form.destroy();}if(this._mPageContent.header){this._mPageContent.header.destroy();}this._mPageContent=null;};t.prototype.exit=function(){this._oResourceBundle=null;if(this._oPage){this._oPage.destroy();this._oPage=null;}else{this._destroyPageContent();}this._mNavContext=null;};t.prototype._attachPressLink=function(j){var N=j.getNavContext();return function(e){e.preventDefault();var k=this.getCustomData()[0].getValue();if(N.navContainer&&k){N.quickView._setNavOrigin(this);N.navContainer.to(k);}};};t.prototype._mobilePress=function(){var e="sms://"+o(this.getCustomData()[0].getValue());window.location.replace(e);};t.prototype._updatePage=function(){var N=this.getNavContext();if(N&&N.quickView._bRendered){this._bItemsChanged=true;N.popover.focus();if(N.quickView.indexOfPage(this)==0){N.quickView._clearContainerHeight();}this._createPage();N.popover.$().css('display','block');N.quickView._adjustContainerHeight();N.quickView._restoreFocus();}};["setModel","bindAggregation","setAggregation","insertAggregation","addAggregation","removeAggregation","removeAllAggregation","destroyAggregation"].forEach(function(F){t.prototype["_"+F+"Old"]=t.prototype[F];t.prototype[F]=function(){var e=t.prototype["_"+F+"Old"].apply(this,arguments);this._updatePage();if(["removeAggregation","removeAllAggregation"].indexOf(F)!==-1){return e;}return this;};});t.prototype.setProperty=function(N,v){var e=this.getQuickViewBase(),j=false;if(e&&e.isA("sap.m.QuickView")){j=true;}C.prototype.setProperty.call(this,N,v,j);this._updatePage();return this;};t.prototype.getQuickViewBase=function(){var e=this.getParent();if(e&&e.isA("sap.m.QuickViewBase")){return e;}return null;};t.prototype._onImageLoadError=function(e){var F=0,j=this._mPageContent.header.getContent()[F],k=e.getSource(),u=document.activeElement===k.getDomRef();j.removeStyleClass("sapMQuickViewPageFallbackIconHidden");k.addStyleClass("sapMQuickViewPageFailedImage");if(u){j.focus();}};return t;});
