/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/templates/ExtensionAPI"],function(E){"use strict";var e=E.extend("sap.fe.templates.ListReport.ExtensionAPI",{refresh:function(){var f=this._controller._getFilterBarControl();return f.waitForInitialization().then(function(){f.triggerSearch();});}});return e;});
