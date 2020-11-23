/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery",'./library','sap/ui/core/Control','sap/ui/Device','./PullToRefreshRenderer',"sap/ui/events/KeyCodes","sap/base/security/encodeXML","sap/ui/core/InvisibleText"],function(q,l,C,D,P,K,e,I){"use strict";var a=l.ImageHelper;var b=C.extend("sap.m.PullToRefresh",{metadata:{library:"sap.m",properties:{description:{type:"string",group:"Misc",defaultValue:null},showIcon:{type:"boolean",group:"Appearance",defaultValue:false},customIcon:{type:"sap.ui.core.URI",group:"Appearance",defaultValue:null},iconDensityAware:{type:"boolean",group:"Appearance",defaultValue:true}},events:{refresh:{}}}});b.ARIA_F5_REFRESH="PULL_TO_REFRESH_ARIA_F5";b.prototype.init=function(){this._bTouchMode=D.support.touch&&!D.system.combi||q.sap.simulateMobileOnDesktop;this._iState=0;this._sAriaF5Text=I.getStaticId("sap.m",b.ARIA_F5_REFRESH);};b.prototype._loadBI=function(){if(this.getVisible()&&!this._oBusyIndicator){var B=sap.ui.requireSync("sap/m/BusyIndicator");this._oBusyIndicator=new B({size:"1.7rem",design:"auto"});this._oBusyIndicator.setParent(this);}};b.prototype._getAriaDescribedByReferences=function(){var t=this.getTooltip_AsString(),d=this._sAriaF5Text,T;if(t){T=I.getStaticId("sap.m",t);d+=' '+T;}return d;};b.prototype.onBeforeRendering=function(){this._loadBI();if(this._bTouchMode){q(window).off("resize.sapMP2R",this.calculateTopTrigger);var p=this.getParent();this._oScroller=p&&p.getScrollDelegate?p.getScrollDelegate():null;if(this._oScroller){this._oScroller.setBounce(true);this._oScroller.setPullDown(this.getVisible()?this:null);}}};b.prototype.calculateTopTrigger=function(){this._iTopTrigger=1;if(this._oDomRef&&this._oDomRef.parentNode&&this._oDomRef.parentNode.parentNode&&this._oDomRef.parentNode.parentNode.offsetHeight<this._oDomRef.offsetHeight*1.5){this._iTopTrigger=this.getDomRef("T").offsetTop;}};b.prototype.onAfterRendering=function(){this._oDomRef=this.getDomRef();if(this._bTouchMode){if(this._oScroller){this._oScroller.refresh();}if(this.getVisible()&&this._oScroller&&this._oScroller._bIScroll){q(window).on("resize.sapMP2R",q.proxy(this.calculateTopTrigger,this));this.calculateTopTrigger();}}};b.prototype.exit=function(){if(this._bTouchMode&&this._oScroller&&this._oScroller._bIScroll){q(window).off("resize.sapMP2R",this.calculateTopTrigger);}if(this._oScroller){this._oScroller.setPullDown(null);this._oScroller=null;}if(this._oCustomImage){this._oCustomImage.destroy();this._oCustomImage=null;}if(this._oBusyIndicator){this._oBusyIndicator.destroy();this._oBusyIndicator=null;}};b.prototype.doScrollMove=function(){if(!this._oScroller){return;}var d=this._oDomRef;var _=this._oScroller._scroller;if(_.y>-this._iTopTrigger&&this._iState<1){this.setState(1);_.minScrollY=0;}else if(_.y<-this._iTopTrigger&&this._iState===1){this.setState(0);_.minScrollY=-d.offsetHeight;}};b.prototype.doPull=function(p){if(this._bTouchMode&&this._iState<2){this.setState(p>=-1?1:0);}};b.prototype.doRefresh=function(){this.setState(0);};b.prototype.doScrollEnd=function(){if(this._iState===1){this.setState(2);this.fireRefresh();}};b.prototype.setState=function(s){if(this._iState===s){return;}this._iState=s;if(!this._oDomRef){return;}var $=this.$();var c=$.find(".sapMPullDownText");var r=this._getRB();switch(s){case 0:$.toggleClass("sapMFlip",false).toggleClass("sapMLoading",false);c.html(r.getText(this._bTouchMode?"PULL2REFRESH_PULLDOWN":"PULL2REFRESH_REFRESH"));$.removeAttr("aria-live");$.find(".sapMPullDownInfo").html(e(this.getDescription()));break;case 1:$.toggleClass("sapMFlip",true);c.html(r.getText("PULL2REFRESH_RELEASE"));$.removeAttr("aria-live");break;case 2:$.toggleClass("sapMFlip",false).toggleClass("sapMLoading",true);this._oBusyIndicator.setVisible(true);c.html(r.getText("PULL2REFRESH_LOADING"));$.attr("aria-live","assertive");$.find(".sapMPullDownInfo").html(this._bTouchMode?r.getText("PULL2REFRESH_LOADING_LONG"):"");break;}};b.prototype.getCustomIconImage=function(){var p={src:this.getCustomIcon(),densityAware:this.getIconDensityAware(),useIconTooltip:false};var c=['sapMPullDownCIImg'];this._oCustomImage=a.getImageControl(null,this._oCustomImage,this,p,c);return this._oCustomImage;};b.prototype.onclick=function(){if(!this._bTouchMode){this.setState(2);this.fireRefresh();}};b.prototype.onkeydown=function(c){if(c.which===K.F5){this.onclick();c.stopPropagation();c.preventDefault();}};b.prototype.onsapenter=function(E){if(this._iState<1){this.setState(2);this.fireRefresh();}};b.prototype.onsapspace=function(E){E.preventDefault();if(this._iState<1){this.setState(2);this.fireRefresh();}};b.prototype.hide=function(){this.setState(0);if(this._oScroller){this._oScroller.refresh();}};b.prototype.setVisible=function(v){if(this.getVisible()===v){return this;}if(this._oDomRef&&this._oScroller&&this._oScroller._oControl){this._oScroller._oControl.invalidate();}return this.setProperty("visible",v);};b.prototype._getRB=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.m");};return b;});