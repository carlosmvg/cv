/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"],function(M){"use strict";var C=M.extend("sap.fe.macros.fpm.CustomFragment",{name:"CustomFragment",namespace:"sap.fe.macros.fpm",fragment:"sap.fe.macros.fpm.CustomFragment",metadata:{properties:{id:{type:"string",required:true},fragmentName:{type:"string",required:true}},events:{}},create:function(p,a){p.fragmentInstanceName=p.fragmentName+"-JS".replace(/\//g,".");return p;}});return C;});
