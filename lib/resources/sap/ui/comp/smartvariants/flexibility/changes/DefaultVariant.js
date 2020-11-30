/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/base/util/merge',"sap/base/Log"],function(m,L){"use strict";var D={};D.applyChange=function(c,v,p){var C=c.getContent();if(!C){L.error("Change does not contain sufficient information to be applied");return;}var M=p.modifier;var P=m({},M.getProperty(v,"adaptationInfo"));if(v.getDefaultVariantKey){c.setRevertData({key:v.getDefaultVariantKey()});if(v.getItemByKey){var i=v.getItemByKey(C.key);if(i){v.setDefaultVariantKey(i.getKey());}else if(C.key===v.STANDARDVARIANTKEY){v.setDefaultVariantKey(C.key);}}}P.defaultVariant=C.key;M.setProperty(v,"adaptationInfo",P);};D.completeChangeContent=function(c,s,p){if(!s.hasOwnProperty("content")){throw new Error("oSpecificChangeInfo.content should be filled");}if(!s.content.hasOwnProperty("key")){throw new Error("In oSpecificChangeInfo.content.key attribute is required");}};D.revertChange=function(c,v,p){var M=p.modifier;var P=m({},M.getProperty(v,"adaptationInfo"));var C=c.getRevertData();if(C){if(v.setDefaultVariantKey){var i=v.getItemByKey(C.key);if(i){v.setDefaultVariantKey(i.getKey());}else if(C.key===v.STANDARDVARIANTKEY){v.setDefaultVariantKey(C.key);}}P.defaultVariant=C.key;c.resetRevertData();}else{if(P.defaultVariant){delete P.defaultVariant;}}M.setProperty(v,"adaptationInfo",P);};return D;},true);
