/*
 * ! OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/FieldInfoBase","sap/ui/thirdparty/jquery","sap/ui/core/InvisibleText","sap/ui/model/json/JSONModel","sap/ui/mdc/link/Log","sap/base/Log","sap/ui/mdc/link/Panel","sap/ui/mdc/link/PanelItem","sap/ui/layout/form/SimpleForm","sap/ui/core/Title","sap/ui/layout/library"],function(F,q,I,J,L,S,P,a,b,C,l){"use strict";var R=l.form.SimpleFormLayout.ResponsiveGridLayout;var c=F.extend("sap.ui.mdc.Link",{metadata:{library:"sap.ui.mdc",properties:{enablePersonalization:{type:"boolean",defaultValue:true},delegate:{type:"object",defaultValue:{name:"sap/ui/mdc/LinkDelegate",payload:{}}}},associations:{sourceControl:{type:"sap.ui.core.Control",multiple:false}}}});c.prototype.applySettings=function(){F.prototype.applySettings.apply(this,arguments);this.initControlDelegate();};c.prototype.init=function(){var m=new J({contentTitle:undefined,bHasPotentialContent:undefined,linkItems:[]});m.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);m.setSizeLimit(1000);this.setModel(m,"$sapuimdcLink");this.attachEvent("modelContextChange",this._handleModelContextChange,this);this._bLinkItemsFetched=false;this._aLinkItems=[];F.prototype.init.apply(this,arguments);};c.prototype.getDirectLinkHrefAndTarget=function(){return this.getDirectLink().then(function(o){return o?{target:o.getTarget(),href:o.getHref()}:null;});};c.prototype.isTriggerable=function(){return this.awaitControlDelegate().then(function(){if(this._bIsBeingDestroyed){return false;}var p=Object.assign({},this.getPayload());return this.getControlDelegate().fetchLinkType(p).then(function(o){if(o.type>0){return true;}return false;});}.bind(this));};c.prototype.getTriggerHref=function(){return this.getDirectLinkHrefAndTarget().then(function(o){return o?o.href:null;});};c.retrieveAllMetadata=function(p){if(!p.getModel||!p.getModel("$sapuimdcLink")){return[];}var m=p.getModel("$sapuimdcLink");return m.getProperty("/metadata").map(function(M){return{id:M.key,text:M.text,description:M.description,href:M.href,target:M.target,visible:M.visible};});};c.retrieveBaseline=function(p){if(!p.getModel||!p.getModel("$sapuimdcLink")){return[];}var m=p.getModel("$sapuimdcLink");return m.getProperty("/baseline").map(function(M){return{id:M.key,visible:true};});};c.prototype.hasPotentialContent=function(){return this.retrieveAdditionalContent().then(function(A){if(A.length){return Promise.resolve(true);}return Promise.resolve(this.hasPotentialLinks());}.bind(this));};c.prototype.getDirectLink=function(){return this.retrieveDirectLinkItem().then(function(d){this.addDependent(d);return d;}.bind(this));};c.prototype.getContentTitle=function(){return new I({text:this._getContentTitle()});};c.prototype.getContent=function(g){var o=this.retrieveLinkItems();var A=this.retrieveAdditionalContent();return Promise.all([o,A]).then(function(v){var d=v[0];var e=v[1];return new Promise(function(r){sap.ui.require(['sap/ui/fl/Utils','sap/ui/fl/apply/api/FlexRuntimeInfoAPI'],function(U,f){this._setConvertedLinkItems(d);var m=this._getInternalModel().getProperty("/linkItems");var M=this._getInternalModel().getProperty("/baselineLinkItems");var p=new P(this._createPanelId(U,f),{enablePersonalization:this.getEnablePersonalization(),items:M.map(function(h){return new a(h.key,{text:h.text,description:h.description,href:h.href,target:h.target,icon:h.icon,visible:true});}),additionalContent:!e.length&&!m.length?c._getNoContent():e,beforeSelectionDialogOpen:function(){if(g&&g()){g().setModal(true);}},afterSelectionDialogClose:function(){if(g&&g()){g().setModal(false);}},beforeNavigationCallback:this._beforeNavigationCallback.bind(this),metadataHelperPath:"sap/ui/mdc/Link"});p.setModel(new J({metadata:q.extend(true,[],this._getInternalModel().getProperty("/linkItems")),baseline:q.extend(true,[],this._getInternalModel().getProperty("/baselineLinkItems"))}),"$sapuimdcLink");return r(p);}.bind(this));}.bind(this));}.bind(this));};c.prototype.hasPotentialLinks=function(){return this._retrieveUnmodifiedLinkItems().then(function(d){return!!d.length;});};c.prototype.retrieveLinkItems=function(){var p=Object.assign({},this.getPayload());var B=this._getControlBindingContext();return this._retrieveUnmodifiedLinkItems().then(function(u){return this.getControlDelegate().modifyLinkItems(p,B,u).then(function(d){return d;});}.bind(this));};c.prototype._retrieveUnmodifiedLinkItems=function(){if(this._bLinkItemsFetched){return Promise.resolve(this._aLinkItems);}else{this.oUseDelegateItemsPromise=this._useDelegateItems();return this.oUseDelegateItemsPromise.then(function(){return Promise.resolve(this._aLinkItems);}.bind(this));}};c.prototype.retrieveAdditionalContent=function(){if(this.awaitControlDelegate()){return this.awaitControlDelegate().then(function(){var p=Object.assign({},this.getPayload());var B=this._getControlBindingContext();return this.getControlDelegate().fetchAdditionalContent(p,B,this).then(function(A){return A;});}.bind(this));}S.error("mdc.Link retrieveAdditionalContent: control delegate is not set - could not load AdditionalContent from delegate.");return Promise.resolve([]);};c.prototype.retrieveDirectLinkItem=function(){if(this.awaitControlDelegate()){return this.awaitControlDelegate().then(function(){var p=Object.assign({},this.getPayload());return this.getControlDelegate().fetchLinkType(p).then(function(o){if(o.type!==1||o.directLink===undefined){return null;}return o.directLink;});}.bind(this));}S.error("mdc.Link retrieveDirectLinkItem: control delegate is not set - could not load LinkItems from delegate.");return Promise.resolve(null);};c.prototype.getSourceControl=function(){return this.getAssociation("sourceControl");};c.prototype.removeAllLinkItems=function(){this._retrieveUnmodifiedLinkItems().then(function(d){d.forEach(function(o){o.destroy();o=undefined;});this._setLinkItems([]);this._determineContent();}.bind(this));};c.prototype._getContentTitle=function(){return this._getInternalModel().getProperty("/contentTitle");};c.prototype._getControlBindingContext=function(){var o=sap.ui.getCore().byId(this.getSourceControl());return o&&o.getBindingContext()||this.getBindingContext();};c.prototype._getContextObject=function(B){return B?B.getObject(B.getPath()):undefined;};c.prototype._getInfoLog=function(){if(this.getPayload()&&this.getPayload().semanticObjects){if(this._oInfoLog){return this._oInfoLog;}if(S.getLevel()>=S.Level.INFO){this._oInfoLog=new L();this._oInfoLog.initialize(this.getPayload().semanticObjects,this._getContextObject(this._getControlBindingContext()));return this._oInfoLog;}}return undefined;};c.prototype._getInternalModel=function(){return this.getModel("$sapuimdcLink");};c.prototype._getLogFormattedText=function(){return(this._oInfoLog&&!this._oInfoLog.isEmpty())?"---------------------------------------------\nsap.ui.mdc.Link:\nBelow you can see detailed information regarding semantic attributes which have been calculated for one or more semantic objects defined in a Link control. Semantic attributes are used to create the URL parameters. Additionally you can see all links containing the URL parameters.\n"+this._oInfoLog.getFormattedText():"No logging data available";};c._getNoContent=function(){var s=new b({layout:R,content:[new C({text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("info.POPOVER_MSG_NO_CONTENT")})]});s.addStyleClass("mdcbaseinfoPanelDefaultAdditionalContent");return s;};c.prototype._getView=function(U){var f;if(this.getParent()){f=this.getParent();}var o=sap.ui.getCore().byId(this.getSourceControl());if(!o){this.setSourceControl(f);}return U.getViewForControl(o)||U.getViewForControl(f);};c.prototype._setContentTitle=function(t){return this._getInternalModel().setProperty("/contentTitle",t);};c.prototype._setConvertedLinkItems=function(d){var m=this._getInternalModel();var M=d.map(function(o){if(!o.getKey()){S.error("sap.ui.mdc.Link: undefined 'key' property of the LinkItem "+o.getId()+". The mandatory 'key' property should be defined due to personalization reasons.");}return{key:o.getKey(),text:o.getText(),description:o.getDescription(),href:o.getHref(),target:o.getTarget(),icon:o.getIcon(),initiallyVisible:o.getInitiallyVisible(),visible:false};});m.setProperty("/linkItems/",M);var e=M.filter(function(o){return o.initiallyVisible;});m.setProperty("/baselineLinkItems/",e);};c.prototype._setLinkItems=function(d){var e=d.filter(function(o){return o.getParent()===null;});e.forEach(function(o){this.addDependent(o);}.bind(this));this._aLinkItems=d;};c.prototype._createPanelId=function(U,d){var f;if(this.getParent()){f=this.getParent();}var o=sap.ui.getCore().byId(this.getSourceControl());if(!o){this.setSourceControl(f);}if(!d.isFlexSupported({element:this})){S.error("Invalid component. The mandatory 'sourceControl' association should be assigned to the app component due to personalization reasons.");return this.getId()+"-idInfoPanel";}var A=U.getAppComponentForControl(o)||U.getAppComponentForControl(f);return A.createId("idInfoPanel");};c.prototype._determineContent=function(){this.hasPotentialContent().then(function(h){if(this._getInternalModel().getProperty('/bHasPotentialContent')!==h){this._getInternalModel().setProperty('/bHasPotentialContent',h);}}.bind(this));};c.prototype._handleModelContextChange=function(e){this.fireDataUpdate();};c.prototype._useDelegateItems=function(){if(this.awaitControlDelegate()){return this.awaitControlDelegate().then(function(){var p=Object.assign({},this.getPayload());var B=this._getControlBindingContext();var i=this._getInfoLog();return new Promise(function(r){this.getControlDelegate().fetchLinkItems(p,B,i).then(function(d){this._setLinkItems(d===null?[]:d);this._bLinkItemsFetched=d!==null;r();}.bind(this));}.bind(this));}.bind(this));}S.error("mdc.Link _useDelegateItems: control delegate is not set - could not load LinkItems from delegate.");return Promise.resolve();};c.prototype._beforeNavigationCallback=function(e){var p=Object.assign({},this.getPayload());return this.getControlDelegate().beforeNavigationCallback(p,e);};return c;});