/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/Renderer','sap/m/LinkRenderer'],function(R,L){"use strict";var S=R.extend(L);S.apiVersion=2;S.render=function(r,c){if(c.getIgnoreLinkRendering()){var o=c._getInnerControl();if(o){r.openStart("div",c);r.openEnd();r.renderControl(o);r.close("div");}}else{L.render.apply(this,arguments);}};S.writeText=function(r,c){if(!c.getUom()){r.text(c.getText());return;}r.openStart("span");r.openEnd();r.text(c.getText());r.close("span");r.openStart("span");r.style("display","inline-block");r.style("min-width","2.5em");r.style("width","3.0em");r.style("text-align","start");r.openEnd();r.text(c.getUom());r.close("span");};return S;},true);
