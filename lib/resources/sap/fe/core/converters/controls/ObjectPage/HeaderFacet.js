sap.ui.define(["sap/fe/core/converters/helpers/ConfigurableObject","sap/fe/core/converters/helpers/ID"],function(C,I){"use strict";var _={};var H=I.HeaderFacetID;var a=I.CustomHeaderFacetID;var P=C.Placement;function o(i,k){var l=Object.keys(i);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(i);if(k)s=s.filter(function(m){return Object.getOwnPropertyDescriptor(i,m).enumerable;});l.push.apply(l,s);}return l;}function b(t){for(var i=1;i<arguments.length;i++){var s=arguments[i]!=null?arguments[i]:{};if(i%2){o(Object(s),true).forEach(function(k){c(t,k,s[k]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(t,Object.getOwnPropertyDescriptors(s));}else{o(Object(s)).forEach(function(k){Object.defineProperty(t,k,Object.getOwnPropertyDescriptor(s,k));});}}return t;}function c(i,k,v){if(k in i){Object.defineProperty(i,k,{value:v,enumerable:true,configurable:true,writable:true});}else{i[k]=v;}return i;}var d;(function(d){d["Annotation"]="Annotation";d["XMLFragment"]="XMLFragment";})(d||(d={}));_.HeaderFacetType=d;var F;(function(F){F["Default"]="Default";F["NotAdaptable"]="not-adaptable";F["NotAdaptableTree"]="not-adaptable-tree";F["NotAdaptableVisibility"]="not-adaptable-visibility";})(F||(F={}));_.FlexDesignTimeType=F;function g(i,k){var l,m,n,p,q;return(l=(m=i.entityType)===null||m===void 0?void 0:(n=m.annotations)===null||n===void 0?void 0:(p=n.UI)===null||p===void 0?void 0:(q=p.HeaderFacets)===null||q===void 0?void 0:q.map(function(r){return f(r,k);}))!==null&&l!==void 0?l:[];}_.getHeaderFacetsFromAnnotations=g;function e(m){var i={};Object.keys(m).forEach(function(k){var l=m[k];i[k]=j(l,k);});return i;}_.getHeaderFacetsFromManifest=e;function f(i,k){var l=H({Facet:i});var m=function(i,n){var p,q;return((p=i.ID)===null||p===void 0?void 0:p.toString())||((q=i.Label)===null||q===void 0?void 0:q.toString())||n;};return{type:d.Annotation,id:l,key:m(i,l),annotationPath:k.getEntitySetBasedAnnotationPath(i.fullyQualifiedName)+"/"};}function h(r){if(!r){return undefined;}var i=["Heroes","Decoration","Workers","LongRunners"].indexOf(r)!==-1?"$auto."+r:r;return"{ path : '', parameters : { $$groupId : '"+i+"' } }";}function j(i,k){var l=a(k);var p=i.position;if(!p){p={placement:P.After};}return{type:i.type,id:l,key:k,position:p,visible:i.visible,fragmentName:i.name,title:i.title,subTitle:i.subTitle,stashed:i.stashed||false,flexSettings:b({},{designtime:F.Default},{},i.flexSettings),binding:h(i.requestGroupId)};}return _;},false);