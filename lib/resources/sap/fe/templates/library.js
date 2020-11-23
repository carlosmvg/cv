/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/library","sap/fe/core/library","sap/fe/macros/library"],function(){"use strict";sap.ui.getCore().initLibrary({name:"sap.fe.templates",dependencies:["sap.ui.core","sap.fe.core","sap.fe.macros"],types:["sap.fe.templates.ObjectPage.SectionLayout"],interfaces:[],controls:[],elements:[],version:"1.82.1",noLibraryCSS:true,extensions:{flChangeHandlers:{"sap.fe.templates.ObjectPage.controls.StashableHBox":{"stashControl":"default","unstashControl":"default"},"sap.fe.templates.ObjectPage.controls.StashableVBox":{"stashControl":"default","unstashControl":"default","moveControls":"default"}}}});if(!sap.fe.templates.ObjectPage){sap.fe.templates.ObjectPage={};}sap.fe.templates.ObjectPage.SectionLayout={Page:"Page",Tabs:"Tabs"};return sap.fe.templates;});
