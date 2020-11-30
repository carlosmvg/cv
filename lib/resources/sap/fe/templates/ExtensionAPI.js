/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/Object","sap/fe/core/CommonUtils","sap/fe/macros/DelegateUtil","sap/base/Log","sap/ui/core/Component"],function(B,C,D,L,a){"use strict";var e=B.extend("sap.fe.templates.ExtensionAPI",{constructor:function(c){this._controller=c;this._view=c.getView();},getModel:function(m){var A;if(m&&m!=="ui"){A=C.getAppComponent(this._view);if(!A.getManifestEntry("sap.ui5").models[m]){return null;}}return this._view.getModel(m);},addDependent:function(c){this._view.addDependent(c);},removeDependent:function(c){this._view.removeDependent(c);},navigateToTarget:function(t,c){this._controller.routingListener.navigateToTarget(c,t);},loadFragment:function(s){var t=this;var T=a.getOwnerComponentFor(this._view);var m=this.getModel().getMetaModel(),p={bindingContexts:{"entitySet":m.createBindingContext("/"+T.getEntitySet())},models:{"entitySet":m}};var o=D.templateControlFragment(s.name,p,s.controller,false,s.id);o.then(function(f){t.addDependent(f);}).catch(function(E){L.error(E);});return o;}});return e;});
