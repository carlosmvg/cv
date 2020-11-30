/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/Fragment","sap/ui/core/XMLTemplateProcessor","sap/fe/macros/macroLibrary","sap/ui/core/Core","sap/ui/core/library"],function(F,X,m){"use strict";sap.ui.getCore().initLibrary({name:"sap.fe.macros",dependencies:["sap.ui.core"],types:["sap.fe.macros.NavigationType","sap.fe.macros.DraftIndicatorType","sap.fe.macros.DraftIndicatorState"],interfaces:[],controls:[],elements:[],version:"1.82.1",noLibraryCSS:true});sap.fe.macros.SemanticKeyStyle={ObjectIdentifier:"ObjectIdentifier",Label:"Label"};sap.fe.macros.NavigationType={External:"External",InPage:"InPage",None:"None"};sap.fe.macros.DraftIndicatorType={IconAndText:"IconAndText",IconOnly:"IconOnly"};sap.fe.macros.DraftIndicatorState={NoChanges:"NoChanges",WithChanges:"WithChanges",Active:"Active"};F.registerType("CUSTOM",{init:function(s){this._sExplicitId=this.getId();this._oContainingView=this;this.oController=s.containingView.getController()&&s.containingView.getController().getExtensionAPI();this._aContent=X.parseTemplate(s.fragmentContent,this);}});return sap.fe.macros;});
