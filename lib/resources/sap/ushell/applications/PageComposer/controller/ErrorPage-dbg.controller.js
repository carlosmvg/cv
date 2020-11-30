// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function (
    BaseController,
    JSONModel
) {
    "use strict";

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.ErrorPage", {
        onInit: function () {
            this.getRouter().getRoute("error").attachPatternMatched(this._onErrorPatternMatched, this);
            this.getRouter().getRoute("unsupported").attachPatternMatched(this._onUnsupportedPatternMatched, this);
            this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this.setModel(new JSONModel({
                pageId: null,
                errorText: null
            }));
        },
        /**
         * Called when the user has pressed the Maintain Pages link.
         *
         * @private
         */
        onLinkPress: function () {
            this.getRouter().navTo("overview", null, null, true);
        },

        _onErrorPatternMatched: function () {
            this.getModel().setProperty("/errorText", this._oResourceBundle.getText("ErrorPage.Message"));
        },

        /**
         * Called if one of the error-page patterns are matched.
         * Sets the pageId to the model.
         * @param {sap.ui.base.Event} event the pattern matched event.
         * @private
         */
        _onUnsupportedPatternMatched: function (event) {
            var sPageId = event.getParameter("arguments").pageId;
            this.getModel().setProperty("/pageId", sPageId);
            this.getModel().setProperty("/errorText", this._oResourceBundle.getText("UnsupportedPage.Message", [sPageId]));
        }
    });
});
