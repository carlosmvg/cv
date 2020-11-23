sap.ui.define([],function(){"use strict";var _={};function a(o,i){var n=Object.keys(o);if(Object.getOwnPropertySymbols){var I=Object.getOwnPropertySymbols(o);if(i)I=I.filter(function(J){return Object.getOwnPropertyDescriptor(o,J).enumerable;});n.push.apply(n,I);}return n;}function b(n){for(var i=1;i<arguments.length;i++){var o=arguments[i]!=null?arguments[i]:{};if(i%2){a(Object(o),true).forEach(function(I){c(n,I,o[I]);});}else if(Object.getOwnPropertyDescriptors){Object.defineProperties(n,Object.getOwnPropertyDescriptors(o));}else{a(Object(o)).forEach(function(I){Object.defineProperty(n,I,Object.getOwnPropertyDescriptor(o,I));});}}return n;}function c(o,i,n){if(i in o){Object.defineProperty(o,i,{value:n,enumerable:true,configurable:true,writable:true});}else{o[i]=n;}return o;}function d(n,i){return j(n)||h(n,i)||f(n,i)||e();}function e(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function f(o,i){if(!o)return;if(typeof o==="string")return g(o,i);var n=Object.prototype.toString.call(o).slice(8,-1);if(n==="Object"&&o.constructor)n=o.constructor.name;if(n==="Map"||n==="Set")return Array.from(o);if(n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return g(o,i);}function g(n,o){if(o==null||o>n.length)o=n.length;for(var i=0,I=new Array(o);i<o;i++){I[i]=n[i];}return I;}function h(n,i){if(typeof Symbol==="undefined"||!(Symbol.iterator in Object(n)))return;var o=[];var I=true;var J=false;var K=undefined;try{for(var L=n[Symbol.iterator](),M;!(I=(M=L.next()).done);I=true){o.push(M.value);if(i&&o.length===i)break;}}catch(N){J=true;K=N;}finally{try{if(!I&&L["return"]!=null)L["return"]();}finally{if(J)throw K;}}return o;}function j(i){if(Array.isArray(i))return i;}function k(i,n){if(!(i instanceof n)){throw new TypeError("Cannot call a class as a function");}}var P=function P(i,n){k(this,P);this.path=i.Path;this.type="Path";this.$target=n;};var l=[{alias:"Capabilities",namespace:"Org.OData.Capabilities.V1",uri:""},{namespace:"Org.OData.Core.V1",alias:"Core",uri:""},{namespace:"Org.OData.Measures.V1",alias:"Measures",uri:""},{namespace:"com.sap.vocabularies.Common.v1",alias:"Common",uri:""},{namespace:"com.sap.vocabularies.UI.v1",alias:"UI",uri:""},{namespace:"com.sap.vocabularies.Session.v1",alias:"Session",uri:""},{namespace:"com.sap.vocabularies.Analytics.v1",alias:"Analytics",uri:""},{namespace:"com.sap.vocabularies.PersonalData.v1",alias:"PersonalData",uri:""},{namespace:"com.sap.vocabularies.Communication.v1",alias:"Communication",uri:""},{namespace:"com.sap.vocabularies.HTML5.v1",alias:"HTML5",uri:""}];function m(i,n){if(!i.reverseReferenceMap){i.reverseReferenceMap=i.reduce(function(Q,K){Q[K.namespace]=K;return Q;},{});}if(!n){return n;}var o=n.lastIndexOf(".");var I=n.substr(0,o);var J=n.substr(o+1);var K=i.reverseReferenceMap[I];if(K){return"".concat(K.alias,".").concat(J);}else{if(n.indexOf("@")!==-1){var L=n.split("@"),M=d(L,2),N=M[0],O=M[1];return"".concat(N,"@").concat(m(i,O));}else{return n;}}}function u(i,n){if(!i.referenceMap){i.referenceMap=i.reduce(function(Q,K){Q[K.alias]=K;return Q;},{});}if(!n){return n;}var o=n.split("."),I=d(o,2),m=I[0],J=I[1];var K=i.referenceMap[m];if(K){return"".concat(K.namespace,".").concat(J);}else{if(n.indexOf("@")!==-1){var L=n.split("@"),M=d(L,2),N=M[0],O=M[1];return"".concat(N,"@").concat(u(i,O));}else{return n;}}}function p(i){var o={};if(i.schema.entityContainer&&i.schema.entityContainer.fullyQualifiedName){o[i.schema.entityContainer.fullyQualifiedName]=i.schema.entityContainer;}i.schema.entitySets.forEach(function(n){o[n.fullyQualifiedName]=n;});i.schema.actions.forEach(function(n){o[n.fullyQualifiedName]=n;n.parameters.forEach(function(I){o[I.fullyQualifiedName]=I;});});i.schema.entityTypes.forEach(function(n){o[n.fullyQualifiedName]=n;n.entityProperties.forEach(function(I){o[I.fullyQualifiedName]=I;});n.navigationProperties.forEach(function(I){o[I.fullyQualifiedName]=I;});});Object.keys(i.schema.annotations).forEach(function(n){i.schema.annotations[n].forEach(function(I){var J=u(i.references,I.target);I.annotations.forEach(function(K){var L="".concat(J,"@").concat(u(i.references,K.term));if(K.qualifier){L+="#".concat(K.qualifier);}o[L]=K;K.fullyQualifiedName=L;});});});return o;}function q(i,n){if(n.startsWith("@")){return i+n;}else{return i+"/"+n;}}function r(o,i,n){var I=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;if(!n){return undefined;}n=q(i.fullyQualifiedName,n);var J=n.split("/");var K=n;var L=J.reduce(function(M,N){if(!M){K=N;}else if(M._type==="EntitySet"&&M.entityType){K=q(M.entityType,N);}else if(M._type==="NavigationProperty"&&M.targetTypeName){K=q(M.targetTypeName,N);}else if(M._type==="NavigationProperty"&&M.targetType){K=q(M.targetType.fullyQualifiedName,N);}else if(M._type==="Property"){K=q(i.fullyQualifiedName.substr(0,i.fullyQualifiedName.lastIndexOf("/")),N);}else if(M._type==="Action"&&M.isBound){K=q(M.fullyQualifiedName,N);if(!o[K]){K=q(M.sourceType,N);}}else if(M._type==="ActionParameter"&&M.isEntitySet){K=q(M.type,N);}else if(M._type==="ActionParameter"&&!M.isEntitySet){K=q(i.fullyQualifiedName.substr(0,i.fullyQualifiedName.lastIndexOf("/")),N);if(!o[K]){var O=i.fullyQualifiedName.lastIndexOf("/");if(O===-1){O=i.fullyQualifiedName.length;}K=q(o[i.fullyQualifiedName.substr(0,O)].sourceType,N);}}else{K=q(M.fullyQualifiedName,N);if(M[N]!==undefined){return M[N];}else if(N==="$AnnotationPath"&&M.$target){return M.$target;}}return o[K];},null);if(!L){}if(I){return K;}return L;}function s(i){return i.indexOf("@")!==-1;}function t(i,n,o,I,J,K,L,M){if(i===undefined){return undefined;}switch(i.type){case"String":return i.String;case"Int":return i.Int;case"Bool":return i.Bool;case"Decimal":return i.Decimal;case"Date":return i.Date;case"EnumMember":return i.EnumMember;case"PropertyPath":return{type:"PropertyPath",value:i.PropertyPath,fullyQualifiedName:n,$target:r(J,I,i.PropertyPath)};case"NavigationPropertyPath":return{type:"NavigationPropertyPath",value:i.NavigationPropertyPath,fullyQualifiedName:n,$target:r(J,I,i.NavigationPropertyPath)};case"AnnotationPath":var N=r(J,I,u(o.references,i.AnnotationPath),true);var O={type:"AnnotationPath",value:i.AnnotationPath,fullyQualifiedName:n,$target:N};K.push(O);return O;case"Path":if(s(i.Path)){var Q=r(J,I,i.Path);if(Q){return Q;}}var $=r(J,I,i.Path,true);var R=new P(i,$);K.push(R);return R;case"Record":return v(i.Record,n,o,I,J,K,L,M);case"Collection":return x(i.Collection,n,o,I,J,K,L,M);case"Apply":case"If":return i;}}function v(i,n,o,I,J,K,L,M){var N={$Type:u(o.references,i.type),fullyQualifiedName:n};var O={};if(i.annotations&&Array.isArray(i.annotations)){var Q={target:n,annotations:i.annotations,__source:L};M.push(Q);}i.propertyValues.forEach(function(R){O[R.name]=t(R.value,"".concat(n,"/").concat(R.name),o,I,J,K,L,M);if(R.annotations&&Array.isArray(R.annotations)){var S={target:"".concat(n,"/").concat(R.name),annotations:R.annotations,__source:L};M.push(S);}if(O.hasOwnProperty("Action")&&(N.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"||N.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithAction")){if(I.actions){O.ActionTarget=I.actions[O.Action];if(!O.ActionTarget){}}}});return Object.assign(N,O);}function w(i){var n=i.type;if(n===undefined&&i.length>0){var o=i[0];if(o.hasOwnProperty("PropertyPath")){n="PropertyPath";}else if(o.hasOwnProperty("Path")){n="Path";}else if(o.hasOwnProperty("AnnotationPath")){n="AnnotationPath";}else if(o.hasOwnProperty("NavigationPropertyPath")){n="NavigationPropertyPath";}else if(typeof o==="object"&&(o.hasOwnProperty("type")||o.hasOwnProperty("propertyValues"))){n="Record";}else if(typeof o==="string"){n="String";}}else if(n===undefined){n="EmptyCollection";}return n;}function x(i,n,o,I,J,K,L,M){var N=w(i);switch(N){case"PropertyPath":return i.map(function(O,Q){return{type:"PropertyPath",value:O.PropertyPath,fullyQualifiedName:"".concat(n,"/").concat(Q),$target:r(J,I,O.PropertyPath)};});case"Path":return i.map(function(O){if(s(O.Path)){var Q=r(J,I,O.Path);if(Q){return Q;}}var $=r(J,I,O.Path,true);var R=new P(O,$);K.push(R);return R;});case"AnnotationPath":return i.map(function(O,Q){var R=r(J,I,O.AnnotationPath,true);var S={type:"AnnotationPath",value:O.AnnotationPath,fullyQualifiedName:"".concat(n,"/").concat(Q),$target:R};K.push(S);return S;});case"NavigationPropertyPath":return i.map(function(O,Q){return{type:"NavigationPropertyPath",value:O.NavigationPropertyPath,fullyQualifiedName:"".concat(n,"/").concat(Q),$target:r(J,I,O.NavigationPropertyPath)};});case"Record":return i.map(function(O,Q){return v(O,"".concat(n,"/").concat(Q),o,I,J,K,L,M);});case"String":return i.map(function(O){return O;});default:if(i.length===0){return[];}throw new Error("Unsupported case");}}function y(i,n,o,I,J,K,L){if(i.record){var M={$Type:u(n.references,i.record.type),fullyQualifiedName:i.fullyQualifiedName,qualifier:i.qualifier};var N={};i.record.propertyValues.forEach(function(Q){N[Q.name]=t(Q.value,"".concat(i.fullyQualifiedName,"/").concat(Q.name),n,o,I,J,K,L);if(N.hasOwnProperty("Action")&&(!i.record||M.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"||M.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithAction")){if(o.actions){N.ActionTarget=o.actions[N.Action];if(!N.ActionTarget){}}}});return Object.assign(M,N);}else if(i.collection===undefined){if(i.value){return t(i.value,i.fullyQualifiedName,n,o,I,J,K,L);}else{return true;}}else if(i.collection){var O=x(i.collection,i.fullyQualifiedName,n,o,I,J,K,L);O.fullyQualifiedName=i.fullyQualifiedName;return O;}else{throw new Error("Unsupported case");}}function z(i,o){return function(n){return r(o,i,n);};}function A(i,n,o){i.forEach(function(I){I.navigationProperties=I.navigationProperties.map(function(J){var K={_type:"NavigationProperty",name:J.name,fullyQualifiedName:J.fullyQualifiedName,partner:J.hasOwnProperty("partner")?J.partner:undefined,isCollection:J.hasOwnProperty("isCollection")?J.isCollection:false,containsTarget:J.hasOwnProperty("containsTarget")?J.containsTarget:false,referentialConstraint:J.referentialConstraint?J.referentialConstraint:[]};if(J.targetTypeName){K.targetType=o[J.targetTypeName];}else if(J.relationship){var L=n.find(function(N){return N.fullyQualifiedName===J.relationship;});if(L){var M=L.associationEnd.find(function(N){return N.role===J.toRole;});if(M){K.targetType=o[M.type];K.isCollection=M.multiplicity==="*";}}}if(K.targetType){K.targetTypeName=K.targetType.name;}return K;});I.resolvePath=z(I,o);});}function B(n,i,o){i.forEach(function(I){if(I.isBound){var J=o[I.sourceType];I.sourceEntityType=J;if(J){if(!J.actions){J.actions={};}J.actions[I.name]=I;J.actions["".concat(n,".").concat(I.name)]=I;}I.returnEntityType=o[I.returnType];}});}function C(i,o){i.forEach(function(n){n.entityType=o[n.entityTypeName];if(!n.annotations){n.annotations={};}if(!n.entityType.annotations){n.entityType.annotations={};}n.entityType.keys.forEach(function(I){I.isKey=true;});});}function D(i,n){var o=m(i,n);var I=o.lastIndexOf(".");var J=o.substr(0,I);var K=o.substr(I+1);return[J,K];}function E(i){var o=p(i);A(i.schema.entityTypes,i.schema.associations,o);B(i.schema.namespace,i.schema.actions,o);C(i.schema.entitySets,o);var n=[];var I=[];Object.keys(i.schema.annotations).forEach(function(K){i.schema.annotations[K].forEach(function(L){var M=u(i.references,L.target);var N=o[M];if(!N){if(M.indexOf("@")!==-1){L.__source=K;I.push(L);}}else if(typeof N==="object"){if(!N.annotations){N.annotations={};}L.annotations.forEach(function(O){var Q=D(l,O.term),R=d(Q,2),S=R[0],T=R[1];if(!N.annotations[S]){N.annotations[S]={};}if(!N.annotations._annotations){N.annotations._annotations={};}var U="".concat(T).concat(O.qualifier?"#".concat(O.qualifier):"");N.annotations[S][U]=y(O,i,N,o,n,K,I);if(N.annotations[S][U]!==null&&typeof N.annotations[S][U]==="object"){N.annotations[S][U].term=u(l,"".concat(S,".").concat(T));N.annotations[S][U].qualifier=O.qualifier;N.annotations[S][U].__source=K;}var V="".concat(M,"@").concat(u(l,S+"."+U));if(O.annotations&&Array.isArray(O.annotations)){var W={target:V,annotations:O.annotations,__source:K};I.push(W);}N.annotations._annotations["".concat(S,".").concat(U)]=N.annotations[S][U];o[V]=N.annotations[S][U];});}});});var J=[];I.forEach(function(K){var L=u(i.references,K.target);var M=L.split("@"),N=d(M,2),O=N[0],Q=N[1];var R=Q.split("/");O=O+"@"+R[0];var S=R.slice(1).reduce(function(T,U){if(!T){return null;}return T[U];},o[O]);if(!S){}else if(typeof S==="object"){if(!S.annotations){S.annotations={};}K.annotations.forEach(function(T){var U=D(l,T.term),V=d(U,2),W=V[0],X=V[1];if(!S.annotations[W]){S.annotations[W]={};}if(!S.annotations._annotations){S.annotations._annotations={};}var Y="".concat(X).concat(T.qualifier?"#".concat(T.qualifier):"");S.annotations[W][Y]=y(T,i,S,o,n,K.__source,J);if(S.annotations[W][Y]!==null&&typeof S.annotations[W][Y]==="object"){S.annotations[W][Y].term=u(l,"".concat(W,".").concat(X));S.annotations[W][Y].qualifier=T.qualifier;S.annotations[W][Y].__source=K.__source;}S.annotations._annotations["".concat(W,".").concat(Y)]=S.annotations[W][Y];o["".concat(L,"@").concat(u(l,W+"."+Y))]=S.annotations[W][Y];});}});n.forEach(function(K){var L=K.$target;K.$target=o[L];});i.entitySets=i.schema.entitySets;return{version:i.version,annotations:i.schema.annotations,namespace:i.schema.namespace,actions:i.schema.actions,entitySets:i.schema.entitySets,entityTypes:i.schema.entityTypes,references:i.references};}_.convertTypes=E;function F(i,n){var o;if(typeof n==="string"){if(n.match(/\w+\.\w+\/.*/)){o={type:"EnumMember",EnumMember:n};}else{o={type:"String",String:n};}}else if(Array.isArray(n)){o={type:"Collection",Collection:n.map(function(I){return G(i,I);})};}else if(typeof n==="boolean"){o={type:"Bool",Bool:n};}else if(typeof n==="number"){o={type:"Int",Int:n};}else if(n.type==="Path"){o={type:"Path",Path:n.path};}else if(n.type==="AnnotationPath"){o={type:"AnnotationPath",AnnotationPath:n.value};}else if(n.type==="PropertyPath"){o={type:"PropertyPath",PropertyPath:n.value};}else if(n.type==="NavigationPropertyPath"){o={type:"NavigationPropertyPath",NavigationPropertyPath:n.value};}else if(Object.prototype.hasOwnProperty.call(n,"$Type")){o={type:"Record",Record:G(i,n)};}return o;}function G(i,n){if(typeof n==="string"){return n;}else if(typeof n==="object"){if(n.hasOwnProperty("$Type")){var o={type:n.$Type,propertyValues:[]};Object.keys(n).forEach(function(I){if(I!=="$Type"&&I!=="term"&&I!=="__source"&&I!=="qualifier"&&I!=="ActionTarget"&&I!=="fullyQualifiedName"&&I!=="annotations"){var J=n[I];o.propertyValues.push({name:I,value:F(i,J)});}else if(I==="annotations"){var K=n[I];o.annotations=[];Object.keys(K).filter(function(L){return L!=="_annotations";}).forEach(function(L){Object.keys(K[L]).forEach(function(M){var N;var O=H(i,K[L][M]);if(!O.term){var Q=u(i,"".concat(L,".").concat(M));if(Q){var R=Q.split("#");O.term=R[0];if(R.length>1){O.qualifier=R[1];}}}(N=o.annotations)===null||N===void 0?void 0:N.push(O);});});}});return o;}else if(n.type==="PropertyPath"){return{type:"PropertyPath",PropertyPath:n.value};}else if(n.type==="AnnotationPath"){return{type:"AnnotationPath",AnnotationPath:n.value};}}}function H(i,n){var o={term:n.term,qualifier:n.qualifier};if(Array.isArray(n)){return b(b({},o),{},{collection:n.map(function(I){return G(i,I);})});}else if(n.hasOwnProperty("$Type")){return b(b({},o),{},{record:G(i,n)});}else{return b(b({},o),{},{value:F(i,n)});}}_.revertTermToGenericType=H;return _;});