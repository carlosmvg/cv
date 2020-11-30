/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"],function(M){"use strict";var C=M.extend("sap.fe.macros.fpm.InputField",{name:"InputField",namespace:"sap.fe.macros.fpm",fragment:"sap.fe.macros.fpm.InputField",metadata:{stereotype:"xmlmacro",properties:{entitySet:{type:"sap.ui.model.Context",required:true},property:{type:"sap.ui.model.Context",required:true},id:{type:"string",required:true}},events:{onChange:{type:"function"}}}});return C;});
