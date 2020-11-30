/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var F={getTargetCollection:function(c){var p=c.getPath();if(c.getObject("$kind")==="EntitySet"||c.getObject("$kind")==="Action"||c.getObject("0/$kind")==="Action"){return p;}p="/"+p.split("/").filter(Boolean).join("/$NavigationPropertyBinding/");return"/"+c.getObject(p);}};return F;},true);
