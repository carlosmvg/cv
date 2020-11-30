/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/mdc/util/FilterUtil","sap/ui/core/Core","sap/ui/model/Filter"],function(F,C,a){"use strict";var f={getFilter:function(i){var b=f.getFilterInfo(i).filters;return b.length?new a(f.getFilterInfo(i).filters,false):undefined;},getFilterInfo:function(i,p){var I=i,s,b=[];if(typeof i==="string"){I=C.byId(i);}if(I){s=I.getSearch?I.getSearch():null;var c=I.getConditions();if(c){if(!p){p=I.getPropertyInfoSet?I.getPropertyInfoSet():null;}var o=F.getFilterInfo(I,c,p).filters;b=o?[o]:[];}}return{filters:b,search:s||undefined};}};return f;});
