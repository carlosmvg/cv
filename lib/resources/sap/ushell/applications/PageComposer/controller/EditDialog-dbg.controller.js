// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define(["./BaseDialog.controller"], function (BaseDialogController) {
    "use strict";

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.EditDialog.controller", {
        constructor: function (oView, oResourceBundle) {
            this._resetModel();
            this._oView = oView;
            this._oResourceBundle = oResourceBundle;
            this.sViewId = "editDialog";
            this.sId = "sap.ushell.applications.PageComposer.view.EditDialog";
        },

        /**
         * Determines the text of the Submit button according to the given properties.
         *
         * @param {object} modelData The model data containing the relevant properties^
         * @return {string} The translated text
         */
        saveOrSkipFormatter: function (modelData) {
            var bValid = this.validate(modelData.validation);
            var required = modelData.required;
            var empty = modelData.empty;
            return !required && bValid && empty
                ? this._oView.getModel("i18n").getResourceBundle().getText("Button.Skip")
                : this._oView.getModel("i18n").getResourceBundle().getText("Button.Save");
        }
    });
});
