/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/Device","sap/ui/core/Core","sap/gantt/simple/BaseLine","sap/gantt/simple/RenderUtils","sap/gantt/simple/GanttExtension","sap/gantt/simple/Relationship","sap/gantt/misc/Format","sap/gantt/misc/Utility","sap/gantt/library"],function(D,C,B,R,G,a,F,U,l){"use strict";var I={};var A=l.AdhocLineLayer;I.render=function(r,c){var g=c.getParent();this.renderGanttChart(r,g);g.getSyncedControl().scrollContentIfNecessary();};I.renderGanttChart=function(r,g){r.write("<div id='"+g.getId()+"-cnt'");r.addClass("sapGanttChartCnt");r.writeClasses();r.addStyle("height","100%");r.addStyle("width","100%");r.write(">");this.rerenderAllShapes(r,g);r.write("</div>");};I.renderImmediately=function(g){var r=C.createRenderManager();this.renderGanttChart(r,g);var o=window.document.getElementById(g.getId()+"-cnt");r.flush(o,true,false);this.renderRelationships(r,g);g._updateShapeSelections(g.getSelectedShapeUid(),[]);G.attachEvents(g);r.destroy();};I.rerenderAllShapes=function(r,g){var b=g.getSyncedControl().getRowStates();if(b.length===0){return;}g.getAggregation("_header").renderElement();var i=b.reduce(function(h,d){return h+d.height;},0);r.write("<svg id='"+g.getId()+"-svg'");r.addClass("sapGanttChartSvg");r.writeClasses();r.writeAttribute("height",i+"px");var c=R.getGanttRenderWidth(g);r.writeAttribute("width",c+"px");r.write(">");this.renderHelperDefs(r,g.getId());this.renderGanttBackgrounds(r,g,b);this.renderCalendarPattern(r,g);this.renderCalendarShapes(r,g);this.renderExpandedRowBackground(r,g);this.renderVerticalLines(r,g);this.renderNowLineBody(r,g);var f=R.createOrderedListOfRenderFunctionsFromTemplate(this.createTemplateForOrderedListOfRenderFunctions(g));f.forEach(function(d){d.apply(I,[r,g]);});r.write("</svg>");if(!g._bPreventInitialRender){g._bPreventInitialRender=true;}};I.createTemplateForOrderedListOfRenderFunctions=function(g){var t=[{fnCallback:this.renderAllShapesInRows},{fnCallback:this.renderRlsContainer,bUnshift:g.getShapeOverRelationship()},{fnCallback:this.renderAssistedContainer}];if(g.getEnableAdhocLine()){t.push({fnCallback:this.renderAdhocLines,bUnshift:g.getAdhocLineLayer()===A.Bottom});}return t;};I.renderHelperDefs=function(r,i){r.write("<defs>");var L=i+"-helperDef-linePattern";r.write("<pattern id='"+L+"' width='2' height='2' x='0' y='0' patternUnits='userSpaceOnUse'>");r.write("<line x1='1' x2='1' y1='0' y2='2' stroke-width='1' stroke='white' shape-rendering='crispEdges' />");r.write("</pattern>");r.write("</defs>");};I.renderGanttBackgrounds=function(r,g,b){r.write("<g");r.writeAttribute("id",g.getId()+"-bg");r.write(">");this.renderRowBackgrounds(r,g,b);this.renderRowBorders(r,g,b);r.write("</g>");};I.renderRowBackgrounds=function(r,g,b){var n=0;r.write("<g class='rowBackgrounds'");r.writeAttribute("id",g.getId()+"-rowBackgrounds");r.write(">");b.forEach(function(o,i){r.write("<rect");r.writeAttribute("id",g.getId()+"-bgRow-"+i);r.writeAttribute("y",n);r.writeAttribute("width","100%");r.writeAttribute("height",o.height);r.writeAttribute("data-sap-ui-index",i);r.addClass("sapGanttBackgroundSVGRow");if(o.selected){r.addClass("sapGanttBackgroundSVGRowSelected");}if(o.hovered){r.addClass("sapGanttBackgroundSVGRowHovered");}r.writeClasses();r.write("/>");n+=o.height;});r.write("</g>");};I.renderRowBorders=function(r,g,b){r.write("<g class='rowBorders'");r.writeAttribute("id",g.getId()+"-rowBorders");r.write(">");var n=0;b.forEach(function(o,i){var c=(n+o.height)-0.5;r.write("<line");r.writeAttribute("id",g.getId()+"-bgRowBorder-"+i);r.writeAttribute("x1",0);r.writeAttribute("x2","100%");r.writeAttribute("y1",c);r.writeAttribute("y2",c);r.writeAttribute("style","pointer-events:none");r.addClass("sapGanttBackgroundSVGRowBorder");r.writeClasses();r.write("/>");n+=o.height;});r.write("</g>");};I.renderAdhocLines=function(r,g){var b=g.getAdhocLines();var t=g.getRenderedTimeRange(),m=t[0],M=t[1];b=b.filter(function(v){var d=F.abapTimestampToDate(v.getTimeStamp());return d>=m&&d<=M;});if(b.length===0){return;}r.write("<g");r.writeAttribute("class","sapGanttChartAdhocLine");r.write(">");var o=g.getAxisTime();b.map(function(c){var x=o.timeToView(F.abapTimestampToDate(c.getTimeStamp()));return new B({x1:x,y1:0,x2:x,y2:"100%",stroke:c.getStroke(),strokeWidth:c.getStrokeWidth(),strokeDasharray:c.getStrokeDasharray(),strokeOpacity:c.getStrokeOpacity(),tooltip:c.getDescription()}).setProperty("childElement",true);}).forEach(function(L){L.renderElement(r,L);});r.write("</g>");};I.renderVerticalLines=function(r,g){if(g.getEnableVerticalLine()){var b=R.getGanttRenderWidth(g),c=jQuery.sap.byId(g.getId()).height(),o=g.getAxisTime();var z=o.getZoomStrategy();var t=o.getTickTimeIntervalLabel(z.getTimeLineOption(),null,[0,b]);var T=t[1];var p="";for(var i=0;i<T.length;i++){p+=" M"+" "+(T[i].value-1/2)+" 0"+" v "+c;}if(p){r.write("<path");r.addClass("sapGanttChartVerticalLine");r.writeClasses();r.writeAttribute("d",p);r.write("/>");}}};I.renderAssistedContainer=function(r,g){r.write("<g");r.writeAttribute("class","sapGanttChartSelection");r.write(">");r.write("</g>");r.write("<g");r.writeAttribute("class","sapGanttChartShapeConnect");r.write(">");r.write("</g>");};I.renderNowLineBody=function(r,g){var n=g.getAxisTime().getNowLabel(g.getNowLineInUTC())[0].value;if(g.getEnableNowLine()===false||isNaN(n)){return;}r.write("<g class='sapGanttNowLineBodySvgLine'");r.write(">");var s=new B({x1:n,y1:0,x2:n,y2:"100%",strokeWidth:1}).setProperty("childElement",true);s.renderElement(r,s);r.write("</g>");};I.renderRlsContainer=function(r,g){r.write("<g");r.writeAttribute("class","sapGanttChartRls");r.write(">");r.write("</g>");};I.renderAllShapesInRows=function(r,g){if(!jQuery.sap.byId(g.getId()+"-gantt")){return;}r.write("<g");r.writeAttribute("id",g.getId()+"-shapes");r.writeAttribute("class","sapGanttChartShapes");r.write(">");this._eachVisibleRowSettings(g,function(o){o.renderElement(r,g);});r.write("</g>");};I._eachVisibleRowSettings=function(g,c){var b=g.getTable().getRows();var o=g.getTable().getBindingInfo("rows"),m=o&&o.model;for(var i=0;i<b.length;i++){var r=b[i];var d=r.getBindingContext(m);if(d&&r.getIndex()!==-1){var e=r.getAggregation("_settings");if(c){c(e);}}}};I.renderRelationships=function(r,g){var o=jQuery.sap.domById(g.getId()+"-svg");var b=jQuery(o).children("g.sapGanttChartRls").get(0);if(o==null||b==null){return;}var s=Object.create(null);if(D.browser.msie){var t=jQuery("<div>").attr("id",g.getId()+"-rls").get(0);var T=jQuery.sap.domById("sap-ui-preserve").appendChild(t);r.write("<svg>");this._eachVisibleRowSettings(g,this._renderVisibleRowRelationships.bind(this,r,g,s));this._renderNonVisibleRowRelationships(r,g,s);r.write("</svg>");r.flush(T,true,false);jQuery(b).append(jQuery(T).children());jQuery(T).remove();}else{this._eachVisibleRowSettings(g,this._renderVisibleRowRelationships.bind(this,r,g,s));this._renderNonVisibleRowRelationships(r,g,s);r.flush(b,true,false);}};I._renderVisibleRowRelationships=function(r,g,s,o){o.getRelationships().forEach(function(b){var S=b.getShapeId();var c=o.getShapeUid(b);if(!s[S]){s[S]=true;b.setProperty("shapeUid",c,true);b.renderElement(r,b,g.getId());}});};I._renderNonVisibleRowRelationships=function(r,g,s){var o=U.safeCall(g,["getTable","getRowSettingsTemplate","getBindingInfo"],null,["relationships"]);if(!o){return;}var S=o.template.getBindingInfo("shapeId");if(!S){return;}var b=S.parts[0].path,m=g.getTable().getModel(o.model);var f=function(d,h){if(!s[d]){s[d]=true;var i=o.factory();i.setModel(m,o.model);i.bindObject({path:h,model:o.model});i.renderElement(r,i,g.getId());i.destroy();}};if(m.isA("sap.ui.model.json.JSONModel")){var c=m.getProperty(o.path);if(c){c.forEach(function(d,i){f(d[b],o.path+"/"+i);});}}else{var e=m.getProperty("/");Object.keys(e).forEach(function(E){if(E.startsWith(o.path)){f(e[E][b],E[0]==="/"?E:"/"+E);}});}};I.renderSvgDefs=function(r,g){var s=g.getSvgDefs();if(s){r.write("<svg");r.writeAttribute("id",g.getId()+"-svg-psdef");r.writeAttribute("aria-hidden","true");r.addStyle("float","left");r.addStyle("width","0px");r.addStyle("height","0px");r.writeStyles();r.write(">");r.write(s.getDefString());r.write("</svg>");}};I.renderCalendarPattern=function(r,g){var p=g.getCalendarDef(),s=g.getId(),i=g.iGanttRenderedWidth;if(p&&p.getDefNode()&&p.getDefNode().defNodes&&i>0){var d=p.getDefNode();var b=s+"-calendardefs";r.write("<defs");r.writeAttribute("id",b);r.write(">");for(var c=0;c<d.defNodes.length;c++){var n=d.defNodes[c];r.write("<pattern");r.writeAttribute("id",n.id);r.addClass("calendarPattern");r.writeClasses();r.writeAttribute("patternUnits","userSpaceOnUse");r.writeAttribute("x",0);r.writeAttribute("y",0);r.writeAttribute("width",i);r.writeAttribute("height",32);r.write(">");for(var e=0;e<n.timeIntervals.length;e++){var t=n.timeIntervals[e];r.write("<rect");r.writeAttribute("x",t.x);r.writeAttribute("y",t.y);r.writeAttribute("width",t.width);r.writeAttribute("height",32);r.writeAttribute("fill",t.fill);r.write("/>");}r.write("</pattern>");}r.write("</defs>");}};I.renderCalendarShapes=function(r,g){r.write("<g");r.addClass("sapGanttChartCalendar");r.writeClasses();r.write(">");var b=g.getSyncedControl().getRowStates();this._eachVisibleRowSettings(g,function(o){var p=R.calcRowDomPosition(o,b);o.getCalendars().forEach(function(c){c.setProperty("rowYCenter",p.rowYCenter,true);c._iBaseRowHeight=p.rowHeight;c.renderElement(r,c);});});r.write("</g>");};I.renderExpandedRowBackground=function(r,g){var b=g.getExpandedBackgroundData();if(jQuery.isEmptyObject(b)){return;}g._oExpandModel.refreshRowYAxis(g.getTable());var e=Array.prototype.concat.apply([],b);var w=g.iGanttRenderedWidth;r.write("<g");r.addClass("sapGanttChartRowBackground");r.writeClasses();r.write(">");for(var i=0;i<e.length;i++){var d=e[i];r.write("<g");r.addClass("expandedRow");r.writeClasses();r.write(">");r.write("<rect");r.writeAttribute("x",d.x);r.writeAttribute("y",d.y);r.writeAttribute("height",d.rowHeight-1);r.writeAttribute("width","100%");r.writeAttribute("class","sapGanttExpandChartCntBG");r.write(">");r.write("</rect>");r.write("<path");r.addClass("sapGanttExpandChartLine");r.writeClasses();r.writeAttribute("d","M0 "+(d.y-1)+" H"+(w-1));r.write("/>");r.write("</g>");}r.write("</g>");};return I;},true);