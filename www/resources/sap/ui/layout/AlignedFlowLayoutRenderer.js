/*!
 * OpenUI5
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./library'],function(l){"use strict";var A={apiVersion:2};A.CSS_CLASS="sapUiAFLayout";A.render=function(r,c){var C=c.getContent();r.openStart("div",c);r.class(A.CSS_CLASS);if(C.length===0){r.class(A.CSS_CLASS+"NoContent");}r.openEnd();this.renderItems(r,c,C);this.renderEndItem(r,c);this.renderSpacers(r,c);r.close("div");};A.renderItems=function(r,c,C){C=C||c.getContent();C.forEach(function(o){this.renderItem(r,c,o);},this);};A.renderItem=function(r,c,C){r.openStart("div");r.class(A.CSS_CLASS+"Item");r.style("flex-basis",c.getMinItemWidth());r.style("max-width",c.getMaxItemWidth());r.openEnd();r.renderControl(C);r.close("div");};A.renderEndItem=function(r,c,e){e=e||c.getEndContent();if(e.length){r.openStart("div",c.getId()+"-endItem");r.class(A.CSS_CLASS+"End");if(c.getContent().length){r.style("flex-basis",c.getMinItemWidth());}r.openEnd();e.forEach(function(E){this.renderEndContent(r,c,E);},this);r.close("div");}};A.renderEndContent=function(r,c,C){r.renderControl(C);};A.renderSpacers=function(r,c){var s=c.getNumberOfSpacers(),m=c.getMinItemWidth(),M=c.getMaxItemWidth(),C=A.CSS_CLASS,I=c.getId(),S=I+"-spacer",L=I+"-spacerlast";for(var i=0;i<s;i++){var b=i===(s-1),a=b?L:S+i;r.openStart("div",a);r.class(C+"Item");r.class(C+"Spacer");r.style("flex-basis",m);r.style("max-width",M);r.openEnd();r.close("div");}};return A;},true);