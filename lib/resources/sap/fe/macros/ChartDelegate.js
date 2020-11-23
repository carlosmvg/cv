/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/mdc/library","sap/ui/mdc/ChartDelegate","sap/fe/macros/ODataMetaModelUtil","sap/base/util/merge","sap/fe/macros/chart/ChartUtils","sap/ui/base/SyncPromise","sap/base/Log","sap/fe/core/CommonUtils"],function(M,B,a,m,C,S,L,b){"use strict";var A="@Org.OData.Aggregation.V1";function f(H){this.name=H[0];this.label=H[1]||this.name;this.textProperty=H[2];this.type=a.getType(H[3]);if(H[4]||H[5]){var d=H[4],F=H[5];if(F){switch(F){case"year":this.timeUnit="fiscalyear";break;case"yearPeriod":this.timeUnit="fiscalyearperiod";break;default:this.timeUnit=undefined;break;}}if(d&&!this.timeUnit){switch(d){case"yearMonth":this.timeUnit="yearmonth";break;case"date":this.timeUnit="yearmonthday";break;case"yearQuarter":this.timeUnit="yearquarter";break;case"yearWeek":this.timeUnit="yearweek";break;default:this.timeUnit=undefined;break;}}}this.criticality=H[6];return this;}function h(R){var g=R[0],d=R[1];var H={},p={},I;p.inChart=g||d||false;if(p.inChart){p.chartItems=[];if(g){H.kind=M.ChartItemType.Dimension;H.role=M.ChartItemRoleType.category;I=Object.assign({},H);p.chartItems.push(I);}if(d){H.kind=M.ChartItemType.Measure;H.role=M.ChartItemRoleType.axis1;H.contextDefiningProperties=R[4]||[];var e=R[2]||[];var D=R[3];for(var i=0;i<e.length;i++){I=Object.assign({},H);I.aggregationMethod=e[i];I.default=I.aggregationMethod==D;p.chartItems.push(I);}}}var o=this.getModel();return Promise.all([o.requestObject("@sapui.name",this),o.requestObject("@com.sap.vocabularies.Common.v1.Label",this),o.requestObject("@com.sap.vocabularies.Common.v1.Text/$Path",this),o.requestObject("$Type",this),a.fetchCalendarTag(o,this),a.fetchFiscalTag(o,this),a.fetchCriticality(o,this)]).then(f.bind(p));}function r(e,p,o,d){var k,P,g=[],I=[],j,l=[],n,q,K={};var t=a.getAllCustomAggregates(d);for(var u in t){I.push(m({},t[u],{propertyPath:u,kind:M.ChartItemType.Measure,role:M.ChartItemRoleType.axis1,sortable:t[u].sortable,filterable:t[u].filterable}));}var T=a.getAllAggregatableProperties(d);for(var v in T){k=T[v].propertyPath;K[k]=K[k]||{};K[k][T[v].aggregationMethod]={name:T[v].name,label:T[v].label};}var w=a.getSortRestrictionsInfo(d["@Org.OData.Capabilities.V1.SortRestrictions"]);var F=a.getFilterRestrictionsInfo(d["@Org.OData.Capabilities.V1.FilterRestrictions"]);function x(P){var N=P.name||"",y=P.textProperty||"";var z=false;if(P.inChart&&N.indexOf("/")>-1){L.error("$expand is not yet supported. Property: "+N+" from an association cannot be used");return;}if(P.inChart&&y.indexOf("/")>-1){L.error("$expand is not yet supported. Text Property: "+y+" from an association cannot be used");z=true;}l.push(P);a.addSortInfoForProperty(P,w);a.addFilterInfoForProperty(P,F);if(P.inChart){for(var i=0;i<P.chartItems.length;i++){var D=P.chartItems[i];D.propertyPath=P.name;D.type=P.type;D.timeUnit=P.timeUnit;D.criticality=P.criticality;if(D.kind==M.ChartItemType.Measure){if(K[D.propertyPath]&&K[D.propertyPath][D.aggregationMethod]){D.name=K[D.propertyPath][D.aggregationMethod].name;D.label=K[D.propertyPath][D.aggregationMethod].label;}else{D.name=D.aggregationMethod+D.propertyPath;D.label=P.label+" ("+D.aggregationMethod+")";}D.customAggregate=false;D.sortable=true;D.sortDirection="both";D.filterable=true;}else{D.name=P.name;D.textProperty=!z?P.textProperty:undefined;D.label=P.label;D.sortable=P.sortable;D.sortDirection=P.sortDirection;D.filterable=P.filterable;D.allowedExpressions=P.allowedExpressions;}I.push(D);}}}for(k in e){if(k[0]!=="$"){P=e[k];if(P&&P.$kind){if(P.$kind=="Property"){j=p+k+A;g.push(Promise.all([o.requestObject(j+".Groupable"),o.requestObject(j+".Aggregatable"),o.requestObject(j+".SupportedAggregationMethods"),o.requestObject(j+".RecommendedAggregationMethod"),o.requestObject(j+".ContextDefiningProperties")]).then(h.bind(o.getMetaContext(p+k))).then(x));}}}}return Promise.all(g).then(function(){return[q,n,l,I];});}var c=Object.assign({},B);c.retrieveAggregationItem=function(d,o){var e;var g={className:"",settings:{key:o.name,label:o.label||o.name,type:o.type}};switch(o.kind){case M.ChartItemType.Dimension:g.className="sap.ui.mdc.chart.DimensionItem";e={textProperty:o.textProperty,timeUnit:o.timeUnit,displayText:true,criticality:o.criticality};break;case M.ChartItemType.Measure:g.className="sap.ui.mdc.chart.MeasureItem";e={propertyPath:o.propertyPath,aggregationMethod:o.aggregationMethod};break;}g.settings=Object.assign(g.settings,e);return g;};c.fetchProperties=function(o){return c.retrieveAllMetadata(o).then(function(d){return d.properties;});};c.retrieveAllMetadata=function(o){var d=c.getModel(o);function e(g){var D=o.getDelegate(),p="/"+D.payload.collectionName,i=g&&g.getMetaModel();if(p.endsWith("/")){throw new Error("The leading path for metadata calculation is the entity set not the path");}var j=p,t=p+"/";function k(R){var n={sortable:R[0],filterable:R[1],attributes:R[2],properties:R[3]};return n;}var l=[i.requestObject(t),i.requestObject(j)];return Promise.all(l).then(function(T){var E=T[0];var n=[a.fetchAllAnnotations(i,t),a.fetchAllAnnotations(i,j)];return Promise.all(n).then(function(q){var u=Object.assign(q[0],q[1]);return r(E,t,i,u);});}).then(k);}return d.then(e);};c.getModel=function(o){var v=o.getDelegate().model,d=o.getModel(v);if(d){return S.resolve(d);}return new S(function(e,g){function i(){var d=o.getModel(v);if(d){o.detachModelContextChange(i,o);return e(d);}}o.attachModelContextChange(i,o);});};function s(o,d){var n="",e=C.getAllFilterInfo(o),g=d.path.substr(1);if(e.search||e.filter){n="T_OP_CHART_NO_DATA_TEXT_WITH_FILTER";}else{n="T_OP_CHART_NO_DATA_TEXT";}return o.getModel("sap.fe.i18n").getResourceBundle().then(function(R){o.setNoDataText(b.getTranslatedText(n,R,null,g));}).catch(function(i){L.error(i);});}c.updateBindingInfo=function(o,d,e){s(o,d);e=e||o.getBindingInfo("data");var i=o.getAggregation("_chart");if(i){var F;if(C.getChartSelectionsExist(o)){F=C.getAllFilterInfo(o);}}F=F?F:C.getFilterBarFilterInfo(o);e.filters=F.filters;};return c;},false);