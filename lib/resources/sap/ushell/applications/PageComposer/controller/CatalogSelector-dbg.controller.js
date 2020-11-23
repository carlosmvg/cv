// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    Fragment,
    Filter,
    FilterOperator
) {
    "use strict";

    var CatalogSelectorController = Controller.extend("sap.ushell.applications.PageComposer.controller.CatalogSelector.controller", {
        /**
         * Load the UI of the catalog selector.
         *
         * @param {sap.ui.core.mvc.View} parentView The parent view.
         * @returns {Promise<sap.m.Dialog>} The promise that resolves to the dialog instance.
         * @private
         */
        load: function (parentView) {
            // Check if Dialog already exists and is not destroyed already.
            var oDialog = sap.ui.getCore().byId(this._sId);
            return oDialog ? Promise.resolve(oDialog) : Fragment.load({
                id: parentView.getId(),
                name: "sap.ushell.applications.PageComposer.view.CatalogSelector",
                controller: this
            }).then(function (oFragment) {
                parentView.addDependent(oFragment);
                this._sId = oFragment.getId();
                return oFragment;
            }.bind(this));
        },

        /**
         * Opens the catalog selector.
         *
         * @param {sap.ui.core.mvc.View} parentView The parent view (edit page).
         * @private
         */
        open: function (parentView) {
            this.load(parentView).then(function (oDialog) {
                oDialog.getBinding("items").filter([]); // reset search filter
                oDialog.open();
            });
        },

        /**
         * Confirm button press handler: return the result to the caller.
         *
         * @param {sap.ui.base.Event} event The event object.
         * @private
         */
        onConfirm: function (event) {
            var aContexts = event.getParameter("selectedContexts");
            if (this._fnConfirm) {
                this._fnConfirm(aContexts.map(function (oContext) {
                    return oContext.getObject().id;
                }));
            }
            this._fnConfirm = null;
        },

        /**
         * Handle user search event.
         *
         * @param {sap.ui.base.Event} event The event object.
         * @private
         */
        onSearch: function (event) {
            var sValue = event.getParameter("value");
            var oFilter = new Filter([
                new Filter("id", FilterOperator.Contains, sValue),
                new Filter("title", FilterOperator.Contains, sValue)
            ]);
            event.getSource().getBinding("items").filter([oFilter]);
        },

        /**
         * Select catalogs API.
         *
         * @param {sap.ui.core.mvc.View} parentView The parent view (Page Editor).
         * @param {function} fnConfirm Callback function for the selection result.
         *   Selection is returned as an array of selected catalog IDs.
         * @private
         */
        selectCatalogs: function (parentView, fnConfirm) {
            this._fnConfirm = fnConfirm;
            this.open(parentView);
        }
    });

    return new CatalogSelectorController();
});
