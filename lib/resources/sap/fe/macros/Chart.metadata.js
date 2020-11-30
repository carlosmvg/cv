/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["./MacroMetadata"],function(M){"use strict";var C=M.extend("sap.fe.macros.Chart",{name:"Chart",namespace:"sap.fe.macros",fragment:"sap.fe.macros.Chart",metadata:{stereotype:"xmlmacro",properties:{id:{type:"string"},collection:{type:"sap.ui.model.Context",required:true,$kind:["EntitySet","NavigationProperty"]},presentation:{type:"sap.ui.model.Context",required:true},data:{type:"string"},chartType:{type:"string"},header:{type:"string"},height:{type:"string",defaultValue:"400px"},width:{type:"string",defaultValue:"1000px"},selectionMode:{type:"sap.chart.SelectionMode",defaultValue:"NONE"},p13nMode:{type:"array"},filter:{type:"string"},noDataText:{type:"string"},chartDelegate:{type:"string"},vizProperties:{type:"string"},dataPointsSelected:{type:"function"},actions:{type:"sap.ui.model.Context"}},events:{}}});return C;});
