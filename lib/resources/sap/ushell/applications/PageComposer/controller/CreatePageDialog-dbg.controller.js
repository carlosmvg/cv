// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define(["./BaseDialog.controller"], function (BaseDialogController) {
    "use strict";

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.CreatePageDialog", {
        constructor: function (oView, oResourceBundle) {
            this._resetModel();
            this._oView = oView;
            this._oResourceBundle = oResourceBundle;
            this.sViewId = "createPageDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.CreatePageDialog";
        }
    });
});
