/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/landvisz/internal/LinearRowField","sap/ui/core/Control","sap/ui/core/HTML","sap/ui/core/Popup","sap/ui/commons/Image","sap/ui/commons/Label","sap/ui/commons/layout/VerticalLayout","sap/ui/ux3/ToolPopup","./ConnectionEntityRenderer"],function(l,L,C,H,P,I,a,V,T,b){"use strict";var D=P.Dock;var c=l.ConnectionType;var E=l.EntityCSSSize;var d=l.DependencyType;var e=l.ViewType;var f=C.extend("sap.landvisz.ConnectionEntity",{metadata:{library:"sap.landvisz",properties:{connectionId:{type:"string",group:"Data",defaultValue:null},size:{type:"string",group:"Data",defaultValue:null},type:{type:"sap.landvisz.ConnectionType",group:"Identification",defaultValue:null},linkId:{type:"string",group:"Data",defaultValue:null},linkedHeader:{type:"string",group:"Data",defaultValue:null},dependencyTooltip:{type:"string",group:"Data",defaultValue:null},showOverlay:{type:"boolean",group:"Data",defaultValue:true}},aggregations:{connectionData:{type:"sap.landvisz.internal.LinearRowField",multiple:true,singularName:"connectionData"}}}});f.prototype.init=function(){this.viewType;this.top=0;this.left=0;this.width=0;this.height=90;this.innerTop=0;this.innerLeft=0;this.innerWidth=0;this.innerHeight=0;this.holdDisplay=false;this.initializationDone=false;};f.prototype.initControls=function(){if(!this.oVLayoutRows)this.oVLayoutRows=new V(this.getId()+"-ConnectionRowVLayout");if(!this.connectionLabel)this.connectionLabel=new a(this.getId()+"-connectionLabel");if(!this.connectionImage)this.connectionImage=new I(this.getId()+"-connectionImage");if(!this.oVLayoutCallout)this.oVLayoutCallout=new V(this.getId()+"-calloutVLayout");if(!this.oVLayoutToolPopup)this.oVLayoutToolPopup=new V(this.getId()+"-toolPopupVLayout");if(!this.calloutLabel)this.calloutLabel=new a(this.getId()+"-calloutLabel");if(!this.toolPopup){this.toolPopup=new T(this.getId()+"toolpopup");this.toolPopup.addContent(this.oVLayoutToolPopup);}if(this.getType()==c.ProductSystem)this.oVLayoutToolPopup.addStyleClass("sapLandviszCalloutPS productSystemPopup");if(this.getType()==c.TechnicalSystem)this.oVLayoutToolPopup.addStyleClass("sapLandviszCalloutPS technicalSystemPopup");if(this.getType()==c.MobileSolution)this.oVLayoutToolPopup.addStyleClass("sapLandviszCalloutPS mobileSolutionPopup");this.toolPopup.addStyleClass("sapLandviszCalloutPS");if(this.getSize()==E.Small)this.oVLayoutToolPopup.addStyleClass("sapLandviszCalloutRowFieldSmall");else this.oVLayoutToolPopup.addStyleClass("sapLandviszCalloutRowField");};f.prototype.onclick=function(o){if(o.target.id==this.getId()+"connectionRow")o.srcControl.holdDisplay=!o.srcControl.holdDisplay;else this.holdDisplay=!this.holdDisplay;if(this.holdDisplay){if(this.viewType==d.NETWORK_VIEW){var i=jQuery(document.getElementById(this.getId()+"connectionRow"));this.toolPopup.setOpener(i);if(!this.toolPopup.isOpen()){this.toolPopup.setPosition(D.CenterBottom,D.CenterTop,i,"-10 0","fit");var p=jQuery(document.getElementById(this.getId()+"toolpopup"));this.toolPopup.open();}}this.fireEvent("connectionMouseover");}};f.prototype.onmouseenter=function(o){if(this.viewType==e.SOLUTION_VIEW)o.stopImmediatePropagation();else if(o.target.id==this.getId()+"connectionRow"){var h=false;var t=false;for(var i=0;i<this.getParent().getConnectionEntities().length;i++){if(this.getParent().getConnectionEntities()[i].holdDisplay==true){if(this.getParent().getConnectionEntities()[i].getId()==this.getId()){h=true;t=true;}else{h=true;}}}if((!h)||(t&&h)){if(this.viewType==d.NETWORK_VIEW){var g=jQuery(document.getElementById(this.getId()+"connectionRow"));this.toolPopup.setOpener(g);if(!this.toolPopup.isOpen()){this.toolPopup.setPosition(D.CenterBottom,D.CenterTop,g,"-10 0","fit");var p=jQuery(document.getElementById(this.getId()+"toolpopup"));this.toolPopup.open();}}}if(this.getShowOverlay()==true&&this.getLinkId()&&""!=this.getLinkId())this.fireEvent("connectionMouseover");}};f.prototype.onmouseleave=function(o){if(this.viewType==e.SOLUTION_VIEW)o.stopImmediatePropagation();else{if(this.holdDisplay==false&&this.toolPopup.isOpen()){this.toolPopup.close();}if(this.getLinkId()&&""!=this.getLinkId())this.fireEvent("connectionMouseout");}};f.prototype.onAfterRendering=function(){var t=this;jQuery(document.getElementById(this.getId()+"connectionRow")).mouseleave(function(o){t.onmouseleave(o);});jQuery(document.getElementById(this.getId()+"connectionRow")).mouseenter(function(o){t.onmouseenter(o);});};return f;});