/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/templates/ExtensionAPI","sap/fe/core/helpers/SideEffectsUtil"],function(E,S){"use strict";var e=E.extend("sap.fe.templates.ObjectPage.ExtensionAPI",{refresh:function(p){var b=this._view.getBindingContext(),m=b.getModel().getMetaModel(),P,s=[],a,B,k;if(p===undefined||p===null){s.push({$NavigationPropertyPath:""});}else{P=Array.isArray(p)?p:[p];B=this._controller.getOwnerComponent().getEntitySet();for(var i=0;i<P.length;i++){a=P[i];if(a===""){s.push({$PropertyPath:"*"});}else{k=m.getObject("/"+B+"/"+a+"/$kind");if(k==="NavigationProperty"){s.push({$NavigationPropertyPath:a});}else if(k){s.push({$PropertyPath:a});}else{return Promise.reject(a+" is not a valid path to be refreshed");}}}s=S.addTextProperties(s,m,B);}return b.requestSideEffects(s);}});return e;});
