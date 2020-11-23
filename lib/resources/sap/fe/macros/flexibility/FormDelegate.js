sap.ui.define(["sap/fe/macros/DelegateUtil","sap/ui/model/json/JSONModel","sap/fe/macros/CommonHelper"],function(D,J,C){"use strict";function _(p){if(p&&p.$Type){if(p.$Type.toLowerCase().indexOf("edm")!==0){return true;}}return false;}function a(p,n){return n.some(function(N){if(p.startsWith(N)){return true;}});}function b(p,E,P,s,o,A,n){var m={name:p,bindingPath:p,entityType:s};var g=P["@com.sap.vocabularies.UI.v1.DataFieldDefault"];var l=(g&&g.Label)||P["@com.sap.vocabularies.Common.v1.Label"];m.label=l||"[LABEL_MISSING: "+p+"]";var h=P["@com.sap.vocabularies.UI.v1.Hidden"];m.unsupported=h;if(h&&h.$Path){m.unsupported=o.getBindingContext().getProperty(h.$Path);}var F;if(!m.unsupported){F=P["@com.sap.vocabularies.Common.v1.FieldControl"];if(F){m.unsupported=F.$EnumMember==="com.sap.vocabularies.Common.v1.FieldControlType/Hidden";}}F=P["@com.sap.vocabularies.Common.v1.FieldControl"];var i=F&&F.Path;if(i&&!m.unsupported){var L=o.getBinding(A)instanceof sap.ui.model.ListBinding;if(!L){var j=o.getBindingContext().getProperty(i);m.unsupported=j!==0;}}if(g&&(g.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"||g.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"||g.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithAction"||g.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation")){m.unsupported=true;}if(!m.unsupported){m.unsupported=a(p,n)||_(E);}return m;}function c(o,E,m,g,A){var p=[];var s="";var n=[];var h;for(s in o){h=o[s];if(h.$kind==="NavigationProperty"){n.push(s);}}for(s in o){h=o[s];if(h.$kind==="Property"){var P=m.getObject("/"+E+"/"+s+"@");var i=b(s,h,P,E,g,A,n);p.push(i);}}return p;}function d(E,p){if(p.path){return p.path;}var B=E.getBindingContext();if(B){return B.getPath();}}function e(E,A,p){var m=E.getModel(p.modelName);if(m){if(m.isA("sap.ui.model.odata.v4.ODataModel")){var M=m.getMetaModel();var B=d(E,p);if(B){var o=M.getMetaContext(B);var g=o.getObject();var O=o.getObject(g.$Type);return c(O,g.$Type,M,E,A);}}}return Promise.resolve({});}var f={getPropertyInfo:function(p){return Promise.resolve().then(function(){return e(p.element,p.aggregationName,p.payload);});},createLayout:function(p){var m=p.modifier,M=p.appComponent&&p.appComponent.getModel().getMetaModel(),F=p.element,P="/"+D.getCustomData(F,"entitySet",m),o=M.createBindingContext(P),g=M.createBindingContext(P+"/"+p.bindingPath),s=p.element.sId||p.element.id;var h={sPropertyName:p.bindingPath,sBindingPath:P,sValueHelpType:"FormVH",oControl:F,oMetaModel:M,oModifier:m};var v=D.getCustomData(F,"valueHelpRequestGroupId",m)||undefined;var V=Promise.all([D.isValueHelpRequired(h),D.doesValueHelpExist(h)]).then(function(r){var i=r[0],j=r[1];if(i&&!j){return t("sap.fe.macros.flexibility.ValueHelpWrapper");}return Promise.resolve();});function t(i){var j=new J({id:s,idPrefix:p.fieldSelector.id,valueHelpRequestGroupId:v||undefined}),k={bindingContexts:{"entitySet":o,"property":g,"this":j.createBindingContext("/")},models:{"this":j,"entitySet":M,"property":M}};return m.templateControlFragment(i,k);}function T(i,j){var k=new J({_flexId:p.fieldSelector.id,onChange:C.removeEscapeCharacters(D.getCustomData(F,"onChange",m)),createMode:C.removeEscapeCharacters(D.getCustomData(F,"createMode",m)),editMode:C.removeEscapeCharacters(D.getCustomData(F,"editMode",m))}),l={bindingContexts:{"entitySet":o,"dataField":g,"this":k.createBindingContext("/")},models:{"this":k,"entitySet":M,"dataField":M}};return m.templateControlFragment(i,l,j);}return V.then(function(V){return T("sap.fe.macros.form.FormElement",p.view).then(function(i){return{control:i,valueHelp:V};});});}};return f;});