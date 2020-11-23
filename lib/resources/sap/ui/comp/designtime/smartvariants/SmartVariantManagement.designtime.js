/*
 * ! SAPUI5

		(c) Copyright 2009-2020 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";return{actions:{settings:function(){return{name:"VARIANT_MANAGEMENT_MANAGEDIALOG",handler:function(c,p){return new Promise(function(r,a){if(c.isA("sap.ui.comp.smartvariants.SmartVariantManagement")){if(!c.getShowShare()){a("share not enabled");return;}var C=function(d){r(d);};c.openManageViewsDialogForKeyUser(p.styleClass,C);}else{a("wrong conrol type");}});}};}},aggregations:{personalizableControls:{propagateMetadata:function(){return{actions:"not-adaptable"};}}},annotations:{},properties:{persistencyKey:{ignore:true},entitySet:{ignore:true},adaptationInfo:{ignore:true}},customData:{}};});
