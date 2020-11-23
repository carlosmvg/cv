/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(['sap/chart/coloring/emphasis/DimensionValues','sap/chart/coloring/ColorPalette','sap/chart/coloring/ColoringUtils','sap/chart/ChartLog','sap/chart/data/TimeDimension'],function(D,C,a,b,T){"use strict";var S=['DimensionValues','MeasureValues'];function c(d,l){var o=d[0];var e=o.parsed.callbacks.Highlight||[];var L=o.parsed.legend;var r=[];r.push({callback:e,properties:{color:C.EMPHASIS.Highlight},displayName:L.Highlight});var O={properties:{color:C.EMPHASIS.Others},displayName:L.Others};return{rules:r,others:O};}function g(d,l){return function(){var p={plotArea:{dataPointStyle:c(d)}};return{properties:p};};}return{getCandidateSetting:function(o,A,t,d,s,e,l){var E=o.Emphasis||{},p=A.parameters||{};var u=a.dimOrMsrUse(E,p,S,'Emphasis');var f;switch(u){case'DimensionValues':var h=p.dimension||Object.keys(E.DimensionValues);if(typeof h==='string'||h instanceof String){h=[h];}f=D.qualify(E.DimensionValues,h,d,e);if(f){f.parsed=D.parse(f,l);f.ruleGenerator=g([f]);}break;default:return{};}if(f.length){f.subType=u;}return f;}};});
