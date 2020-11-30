// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "/sap/ushell/applications/PageComposer/view/ContextSelector.fragment.xml"
 */
sap.ui.define([
    "./BaseDialog.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    BaseDialogController,
    Filter,
    FilterOperator
) {
    "use strict";

    var oList;
    var oResourceBundle;

    return BaseDialogController.extend("sap.ushell.applications.PageComposer.controller.ContextSelector", {
        constructor: function (oView, oResources) {
            this._oView = oView;
            this.sViewId = "contextSelector";
            this.sId = "sap.ushell.applications.PageComposer.view.ContextSelector";
            oResourceBundle = oResources;
        },

        /**
         * Called when search for roles is executed.
         *
         * @param {sap.ui.base.Event} event The search event.
         */
        onSearch: function (event) {
            var oListItemsBinding = oList.getBinding("items");
            var sSearchValue = event.getSource().getValue() || "";
            oListItemsBinding.filter([
                new Filter([
                    new Filter({ path: "id", operator: FilterOperator.Contains, value1: sSearchValue, caseSensitive: false }),
                    new Filter({ path: "title", operator: FilterOperator.Contains, value1: sSearchValue, caseSensitive: false })
                ], false)
            ]);
            if (oListItemsBinding.getLength() === 0) {
                if (sSearchValue) {
                    oList.setNoDataText(oResourceBundle.getText("Message.NoRolesFound"));
                } else {
                    oList.setNoDataText(oResourceBundle.getText("Message.NoRoles"));
                }
            }
        },

        /**
         * Called when the selection in the ContextSelector is changed.
         * It takes care of the validation of the ContextSelector and opens an error message if required.
         *
         * @private
         */
        onSelectionChange: function () {
            var aSelectedContexts = oList.getSelectedContexts(true);
            this.getModel().setProperty("/contextDisabled", !aSelectedContexts.length);
        },

        /**
         * Called when the "Select" button is clicked. Closes the dialog and writes the selection to a model.
         *
         * @private
         */
        onConfirm: function () {
            var aSelectedRoleIDs = oList.getSelectedContexts(true).map(function (oSelectedContext) {
                return oSelectedContext.getProperty("id");
            });
            this._oDialog.close();
            var iAvailableRoles = oList.getItems().length;
            var oRoles = {
                selected: aSelectedRoleIDs,
                allSelected: (aSelectedRoleIDs.length === iAvailableRoles) || (aSelectedRoleIDs.length === 0)
            };
            if (this._fnConfirm) {
                this._fnConfirm(oRoles);
            }
        },

        /**
         * Called before opening the dialog to initialize the "selected" property of each role list item.
         *
         * @param {string[]} aSelectedRoleIDs An array of IDs of the selected roles.
         * @private
         */
        _setPreSelection: function (aSelectedRoleIDs) {
            oList.getItems().forEach(function (oListItem) {
                if (aSelectedRoleIDs.indexOf(oListItem.getTitle()) !== -1) {
                    oListItem.setSelected(true);
                }
            });
            this.getModel().setProperty("/contextDisabled", !oList.getSelectedItems().length);
        },

        /**
         * @param {string} sPageID The Page ID for which the ContextSelector must be loaded.
         * @param {string[]} aSelectedRoleIDs An array of IDs of the selected roles.
         * @param {function} fnConfirm A callback function called when confirming the ContextSelector selection.
         * @returns {Promise<undefined>} A promise that resolves when the ContextSelector opens.
         * @protected
         */
        openSelector: function (sPageID, aSelectedRoleIDs, fnConfirm) {
            this.getModel().setProperty("/contextDisabled", false);
            this.attachConfirm(fnConfirm);
            return this.load().then(function () {
                oList = this._oView.byId("contextSelectorList");
                oList.attachUpdateFinished(function () {
                    this._setPreSelection(aSelectedRoleIDs);
                    this._oDialog.setBusy(false);
                }.bind(this));
                this._oDialog.setBusy(true);
                this._oDialog.bindObject({ path: "PageRepository>/pageSet('" + encodeURIComponent(sPageID) + "')" });
                this.open();
            }.bind(this));
        }
    });
});
