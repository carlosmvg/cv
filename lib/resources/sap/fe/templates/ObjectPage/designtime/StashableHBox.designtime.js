/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define([],function(){"use strict";var r=sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates");return{actions:{remove:{changeType:"stashControl"},reveal:{changeType:"unstashControl"}},name:{singular:function(){return r.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD");},plural:function(){return r.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD_PLURAL");}},palette:{group:"LAYOUT",icons:{svg:"sap/m/designtime/HBox.icon.svg"}},templates:{create:"sap/m/designtime/HBox.create.fragment.xml"}};});
