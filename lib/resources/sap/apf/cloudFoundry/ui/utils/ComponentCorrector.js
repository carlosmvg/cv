sap.ui.define(['sap/ui/base/Object','sap/ui/core/Component','sap/ui/core/mvc/View'],function(B,C,V){'use strict';var P='sap.apf.cloudFoundry.ui.utils';var a=B.extend(P+'.ComponentCorrector',{constructor:function(c){if(!(this instanceof a)){throw Error("Cannot instantiate object: \"new\" is missing!");}if(c instanceof C){this.oComponent=c;}else{throw Error("Cannot instantiate object: \"oComponent\" is not a Component!");}},runAsComponent:function(f){return this.oComponent.runAsOwner(f);},createView:function(o){var c=this.oComponent;return this.runAsComponent(function(){return V.create(o).then(function(v){if(!v.bIsDestroyed){Object.keys(c.oModels).forEach(function(m){if(!v.getModel(m)){v.setModel(c.getModel(m),m);}});v.setParent(c);return v;}return null;});});}});a.createView=function(c,o){return new a(c).createView(o);};return a;},true);