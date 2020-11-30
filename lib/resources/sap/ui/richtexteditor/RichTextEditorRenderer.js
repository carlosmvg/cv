/*!
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(['sap/ui/core/Renderer','sap/ui/core/Core'],function(R,C){"use strict";var a={apiVersion:2};a.render=function(r,o){var t=o.getAggregation("_toolbarWrapper");var c=t&&o._bCustomToolbarRequirementsFullfiled;var b=C.getLibraryResourceBundle("sap.ui.richtexteditor");r.openStart("div",o);r.class("sapUiRTE");if(o.getRequired()){r.class("sapUiRTEReq");}if(o.getUseLegacyTheme()){r.class("sapUiRTELegacyTheme");}if(c){r.class("sapUiRTEWithCustomToolbar");}r.style("width",o.getWidth());r.style("height",o.getHeight());if(o.getTooltip_AsString()){r.attr("title",o.getTooltip_AsString());}r.accessibilityState(o,{role:"region",label:b.getText("RTE_ARIA_LABEL"),labelledby:null});r.openEnd();if(c){r.renderControl(t);}var s="render"+o.getEditorType()+"Editor";if(this[s]&&typeof this[s]==="function"){this[s].call(this,r,o);}r.close("div");};return a;},true);
