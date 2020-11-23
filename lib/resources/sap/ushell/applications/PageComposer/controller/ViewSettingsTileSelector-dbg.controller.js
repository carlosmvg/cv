// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "./BaseController"
], function (
    JSONModel,
    Fragment,
    BaseController
) {
    "use strict";



    return BaseController.extend("sap.ushell.applications.PageComposer.controller.ViewSettingsTileSelector", {
        /**
         * Constructor.
         * @param {object} view The view to which the dialog is added.
         * @param {sap.ui.model.json.JSONModel} model The viewSettings model.
         */
        constructor: function (view) {
            this.oView = view;
        },

        /**
         * Returns the viewSettings dialog.
         *
         * @return {sap.m.ViewSettingsDialog} The ViewSettings dialog
         * @private
         */
        _getDialog: function () {
            return Fragment.byId(this.oView.createId("tileSelectorViewSettings"), "tileSelectorViewSettings");
        },

        /**
         * Called if the cancel or reset button is pressed.
         * Sets the model to the default values.
         */
        reset: function () {
            var oModel = this._getDialog().getModel();
            oModel.setProperty("/catalogsDescending", false);
            oModel.setProperty("/vizDescending", false);
        },

        /**
         * Called when the sort order is changed for catalogs or visualizations.
         * Sets the boolean values to the model.
         */
        onSelectionChange: function () {
            var oModel = this._getDialog().getModel();
            var oSortCatalogsDescending = Fragment.byId(this.oView.createId("tileSelectorViewSettings"), "sortCatalogsDescending");
            var oSortVizDescending = Fragment.byId(this.oView.createId("tileSelectorViewSettings"), "sortVizDescending");
            oModel.setProperty("/catalogsDescending", oSortCatalogsDescending.getSelected());
            oModel.setProperty("/vizDescending", oSortVizDescending.getSelected());
        }
    });
});
