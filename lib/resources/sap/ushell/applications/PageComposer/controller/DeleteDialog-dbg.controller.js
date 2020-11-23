// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define(["./BaseDialog.controller"], function (BaseDialogController) {
    "use strict";

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.DeleteDialog.controller", {
        constructor: function (oView, oResourceBundle) {
            this._resetModel();
            this._oView = oView;
            this._oResourceBundle = oResourceBundle;
            this.sViewId = "deletePageDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.DeleteDialog";
        }
    });
});
