/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/mdc/FilterBarDelegate","sap/ui/core/XMLTemplateProcessor","sap/ui/core/util/XMLPreprocessor","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/fe/macros/CommonHelper","sap/fe/core/helpers/StableIdHelper","sap/fe/macros/field/FieldHelper","sap/base/util/ObjectPath","sap/ui/mdc/odata/v4/TypeUtil","sap/ui/model/odata/type/String","sap/fe/macros/ResourceModel","sap/base/util/merge","sap/fe/macros/DelegateUtil","sap/fe/macros/FilterBarHelper","sap/base/Log","sap/ui/model/odata/v4/AnnotationHelper","sap/base/util/JSTokenizer"],function(F,X,a,b,J,C,S,c,O,T,d,R,m,D,e,L,A,f){"use strict";var g=Object.assign({},F),E="$editState",h="$search",V="FilterFieldValueHelp";function _(P){var I=true;switch(P.filterExpression){case"SearchExpression":case"SingleRange":case"SingleValue":I=false;break;}if(P.type&&P.type.indexOf("Boolean")>0){I=false;}return I;}function i(){return{name:h,path:h,typeConfig:T.getTypeConfig("sap.ui.model.odata.type.String"),maxConditions:1};}function j(){return{name:E,path:E,groupLabel:"",group:null,label:R.getText("M_COMMON_FILTERBAR_EDITING_STATUS"),tooltip:null,hiddenFilter:false,typeConfig:T.getTypeConfig("sap.ui.model.odata.type.String"),defaultFilterConditions:[{fieldPath:"$editState",operator:"DRAFT_EDIT_STATE",values:["0"]}]};}function k(r,I){var t=new J({id:D.getCustomData(r,"localId"),draftEditStateModelName:D.getCustomData(r,"draftEditStateModelName")}),P={bindingContexts:{"this":t.createBindingContext("/")},models:{"this.i18n":R.getModel(),"this":t}};return D.templateControlFragment("sap.fe.macros.filter.EditState",P,undefined,I);}function l(P,N,K,B,M){var r=M.getObject(N+"/"+K+"@"),s=M.getObject(N+"/@"),t,u,I,v,w,x,G=N!==B?M.getObject(N+"@com.sap.vocabularies.Common.v1.Label")||M.getObject(N+"/@com.sap.vocabularies.Common.v1.Label")||M.getObject(N+"@sapui.name"):"",y=r["@com.sap.vocabularies.Common.v1.Label"]||K,z=N.indexOf("/$NavigationPropertyBinding")===-1?N.substr(B.length):N.substr((B+"/$NavigationPropertyBinding").length),H=M.createBindingContext(N+"/"+K);I=C.getBoolAnnotationValue(r["@com.sap.vocabularies.UI.v1.Hidden"]);w=D.isTypeFilterable(P.$Type);if(I||!w){return false;}v=C.getBoolAnnotationValue(r["@com.sap.vocabularies.UI.v1.HiddenFilter"]);u=r["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];if(u){t=u["$"+D.getModelType(P.$Type)];}if(z.indexOf("/")===0){z=z.substr(1);}var Q,U,W;if(z.split("/").length>1){W=B+"/"+z.substr(0,z.lastIndexOf("/"));Q=M.getObject(W+"@com.sap.vocabularies.Common.v1.Label")||M.getObject(W+"/@com.sap.vocabularies.Common.v1.Label");U=G;G=Q+" > "+U;}if(z){z=z+"/";}z=z+K;x={name:z,path:z,groupLabel:G||"",group:N,label:y,tooltip:r["@com.sap.vocabularies.Common.v1.QuickInfo"]||null,hiddenFilter:v};if(t){x.defaultFilterConditions=[{fieldPath:K,operator:"EQ",values:[t]}];}x.formatOptions=f.parseJS(c.formatOptions(P,{context:H})||"{}");x.constraints=f.parseJS(c.constraints(P,{context:H})||"{}");x.typeConfig=T.getTypeConfig(P.$Type,x.formatOptions,x.constraints);x.display=c.displayMode(r,s);return x;}function n(s,M){return Promise.all([D.fetchPropertiesForEntity(s,M),D.fetchAnnotationsForEntity(s,M)]).then(function(r){var t=r[0],u=r[1];if(!t){return Promise.resolve([]);}var v,P,w=[],N=[],x=[],y=[],z={},B=u["@Org.OData.Capabilities.V1.FilterRestrictions"];if(B){if(B.NonFilterableProperties){N=B.NonFilterableProperties.map(function(G){return G.$PropertyPath;});}if(B.RequiredProperties){x=B.RequiredProperties.map(function(G){return G.$PropertyPath;});}if(B.FilterExpressionRestrictions){B.FilterExpressionRestrictions.forEach(function(G){z[G.Property.$PropertyPath]=G.AllowedExpressions;});}}B=M.getObject(s+"/"+"@com.sap.vocabularies.UI.v1.SelectionFields");if(B){y=B.map(function(G){return G.$PropertyPath;});}Object.keys(t).forEach(function(K){v=t[K];if(v&&v.$kind==="Property"){if(N.indexOf(K)>=0){return;}P=l(v,s,K,s,M);if(P!==false){P.required=x.indexOf(K)>=0;P.visible=y.indexOf(K)>=0;if(z[K]){P.filterExpression=z[K];}else{P.filterExpression="auto";}P.maxConditions=_(P)?-1:1;w.push(P);}}else if(v&&v.$kind==="NavigationProperty"&&v.$isCollection){y.filter(function(G){return G.indexOf(K+"/")===0;}).forEach(function(G){P=l(M.getObject(s+"/"+G),s+"/$NavigationPropertyBinding/"+K,G.substr(K.length+1),s,M);P.name=P.name.split("/").join("*/");P.visible=false;P.filterExpression="auto";P.maxConditions=_(P)?-1:1;w.push(P);});}});return w;});}function o(s,r,N){return N?S.generate([s,r,N]):S.generate([s,r]);}function p(s,P){return D.isValueHelpRequired(P,true).then(function(v){var t=new J({idPrefix:P.sVhIdPrefix,conditionModel:"$filters",navigationPrefix:P.sNavigationPrefix?"/"+P.sNavigationPrefix:"",forceValueHelp:!v,filterFieldValueHelp:true,requestGroupId:P.sValueHelpGroupId}),r=m({},s,{bindingContexts:{"this":t.createBindingContext("/")},models:{"this":t}});return D.templateControlFragment("sap.fe.macros.ValueHelp",r,undefined,s.isXml).then(function(u){if(u){var w="dependents";if(P.oModifier){P.oModifier.insertAggregation(P.oControl,w,u,0);}else{P.oControl.insertAggregation(w,u,0,false);}}}).finally(function(){t.destroy();});}).catch(function(r){L.error("Error while evaluating DelegateUtil.isValueHelpRequired",r);});}function q(s,P){var t=new J({idPrefix:P.sIdPrefix,vhIdPrefix:P.sVhIdPrefix,propertyPath:P.sPropertyName,navigationPrefix:P.sNavigationPrefix?"/"+P.sNavigationPrefix:""}),r=m({},s,{bindingContexts:{"this":t.createBindingContext("/")},models:{"this":t}});return D.templateControlFragment("sap.fe.macros.FilterField",r,undefined,s.isXml).finally(function(){t.destroy();});}g.addItem=function(P,r,s){if(!s){return g.addP13nItem({name:P},r);}P=P.split("*").join("");var M=s.appComponent&&s.appComponent.getModel().getMetaModel();if(!M){return Promise.resolve(null);}var t=s.modifier,I=t.targets==="xmlTree";if(P===E){return k(r,I);}else if(P===h){return Promise.resolve(null);}var u="/"+D.getCustomData(r,"entitySet"),N=P.indexOf("/")>=0?P.substring(0,P.lastIndexOf("/")):"",v=t.getId(r),w={bindingContexts:{"entitySet":M.createBindingContext(u),"property":M.createBindingContext(u+"/"+P)},models:{"entitySet":M,"property":M},isXml:I},x={sPropertyName:P,sBindingPath:u,sValueHelpType:V,oControl:r,oMetaModel:M,oModifier:t,sIdPrefix:o(v,"FilterField",N),sVhIdPrefix:o(v,V,N),sNavigationPrefix:N,sValueHelpGroupId:D.getCustomData(r,"valueHelpRequestGroupId")};return D.doesValueHelpExist(x).then(function(y){if(!y){return p(w,x);}return Promise.resolve();}).then(q.bind(this,w,x));};g.addP13nItem=function(P,r){var s=P.name;if(s.indexOf("/")>-1){return Promise.resolve(null);}return D.fetchModel(r).then(function(M){s=s.split("*").join("");var t=M&&M.getMetaModel();if(!t){return Promise.resolve(null);}var u=r.getDelegate().payload.entitySet,N=s.indexOf("/")>-1?s.substring(0,s.lastIndexOf("/")):"",v=r.getId(),w={bindingContexts:{"entitySet":t.createBindingContext(u),"property":t.createBindingContext(u+"/"+s)},models:{"entitySet":t,"property":t},isXml:false},x={sPropertyName:s,sBindingPath:u,sValueHelpType:V,oControl:r,oMetaModel:t,oModifier:undefined,sIdPrefix:o(v,"AdaptationFilterField",N),sVhIdPrefix:o(v,"AdaptationFilterFieldValueHelp",N),sNavigationPrefix:N,sValueHelpGroupId:undefined};return D.doesValueHelpExist(x).then(function(y){if(!y){return p(w,x);}return Promise.resolve();}).then(q.bind(this,w,x));});};g.fetchProperties=function(r){var s="/"+D.getCustomData(r,"entitySet");return D.fetchModel(r).then(function(M){if(!M){return[];}var t=M.getMetaModel();return n(s,t).then(function(P){if(r.data("draftEditStateModelName")){P.push(j());}if(e.checkIfBasicSearchIsVisible(r.data("hideBasicSearch")==="true",t.getObject(s+"@Org.OData.Capabilities.V1.SearchRestrictions"))){P.push(i());}return P;});});};g.getTypeUtil=function(P){return T;};return g;},false);