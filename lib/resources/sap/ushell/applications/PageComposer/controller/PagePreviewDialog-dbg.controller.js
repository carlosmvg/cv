// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ushell/Config"
], function (
    Controller,
    Fragment,
    JSONModel,
    Filter,
    Config
) {
    "use strict";

    var _oParentView;
    var _oDialog;
    var _sPageID;
    var _sAllText = "";
    var _sNoText;

    /**
     * Show only visualizations that are in the selected role context.
     * If the role context is not set (i.e. no roles are selected), then all visualizations are shown.
     * An array of available visualization IDs is provided by the ContextSelector in the "roles" model.
     *
     * @private
     */
    function _filterRoles () {
        var aAvailableIds,
            oFilter,
            aRoles,
            oPage = _oDialog && _oDialog.getContent()[0];
        if (oPage) {
            aRoles = _oDialog.getModel("roleContext").getProperty("/selectedRoles") || [];
            if (aRoles.length) { // only filter when at least one role is selected
                aAvailableIds = _oParentView.getController().getPageRepository().getVizIds(aRoles);
                oFilter = new Filter({
                    path: "catalogTileId",
                    caseSensitive: true,
                    test: function (sCatalogTileId) {
                        return !aAvailableIds || aAvailableIds.indexOf(sCatalogTileId) >= 0;
                    }
                });
            }
            oPage.getSections().forEach(function (oSection) {
                // when no roles are selected, oFilter is "undefined" which clears the filter
                oSection.getBinding("visualizations").filter(oFilter);
            });
        }
    }

    /**
     * Sets the given role context for the page preview.
     *
     * @param {string[]} aRoles Array of role IDs that are assigned to the page.
     * @param {string[]} aSelectedRoles Array of role IDs that are currently selected for display.
     * @private
     */
    function _setRoleContext (aRoles, aSelectedRoles) {
        if (_oDialog) {
            var oModel = _oDialog.getModel("roleContext");
            aSelectedRoles = aSelectedRoles || oModel.getProperty("/selectedRoles") || [];
            aRoles = aRoles || oModel.getProperty("/allRoles") || [];

            var sCount = aSelectedRoles.length + "";
            if (!aSelectedRoles.length) {
                sCount = _sNoText;
            } else if (aSelectedRoles.length === aRoles.length) {
                sCount = _sAllText;
            }

            oModel.setData({
                allRoles: aRoles,
                selectedRoles: aSelectedRoles,
                selectedCountText: sCount
            });
            if (aRoles.length) {
                _filterRoles(); // filter visualizations according to the selected role context
            }
        }
    }

    var PagePreviewDialogController = Controller.extend("sap.ushell.applications.PageComposer.controller.PagePreviewDialog.controller", {
        /**
         * Load the UI of the page preview dialog.
         *
         * @param {string} sParentId The ID of the parent view.
         * @returns {Promise} The dialog instance.
         *
         * @private
         */
        load: function (sParentId) {
            return _oDialog ? Promise.resolve(_oDialog) : Fragment.load({
                id: sParentId,
                name: "sap.ushell.applications.PageComposer.view.PagePreviewDialog",
                controller: this
            });
        },

        /**
         * Opens the page preview dialog.
         *
         * @param {object} oParentView The parent view (detail or edit page).
         * @private
         */
        open: function (oParentView) {
            _oParentView = oParentView;
            _sPageID = oParentView.getModel().getProperty("/page/id");
            _sAllText = oParentView.getController().getResourceBundle().getText("Message.AllRolesSelected");
            _sNoText = oParentView.getController().getResourceBundle().getText("Message.NoRolesSelected");

            this.load(oParentView.getId())
                .then(function (oDialog) {
                    _oDialog = oDialog;
                    _oDialog._oParentView = _oParentView; // for OPA
                    oParentView.addDependent(oDialog);

                    oDialog.setBusy(true);
                    oDialog.setModel(new JSONModel({
                        sizeBehavior: Config.last("/core/home/sizeBehavior")
                    }), "viewSettings");

                    var oParentRolesModel = oParentView.getModel("roles"),
                        oParentData = oParentRolesModel && oParentRolesModel.getData() || {},
                        sCount = oParentData.selectedCountText || _sAllText,
                        aSelectedRoles = oParentData.selected || [],
                        oRolesModel = new JSONModel({
                            allRoles: [],
                            selectedRoles: aSelectedRoles,
                            selectedCountText: sCount
                        });
                    oDialog.setModel(oRolesModel, "roleContext");
                    oDialog.open();

                    oParentView.getController().getPageRepository().getRoles(_sPageID).then(function (aRoles) {
                        _setRoleContext(aRoles, null);
                        _oDialog.setBusy(false);
                    });
                })
                .catch(function () {
                    if (_oDialog) {
                        _oDialog.setBusy(false);
                    }
                });
        },

        /**
         * Closes the page preview dialog.
         *
         * @private
         */
        close: function () {
            if (_oDialog) {
                _oDialog.close();
            }
        },

        /**
         * Clean up everything after close.
         *
         * @private
         */
        onAfterClose: function () {
            if (_oDialog) {
                _oDialog.destroy();
                _oDialog = null;
            }

            if (this.oContextSelectorController) {
                this.oContextSelectorController.destroy();
                this.oContextSelectorController = null;
            }
        },

        /**
         * Event handler for the ContextSelector.
         *
         * @param {object} oSelectedRolesInfo selected role context.
         * @private
         */
        onRolesSelected: function (oSelectedRolesInfo) {
            _setRoleContext(null, oSelectedRolesInfo.selected);
        },

        /**
         * Opens a dialog to select the role context for the page/space.
         *
         * @private
         */
        onOpenContextSelector: function () {
            sap.ui.require([
                "sap/ushell/applications/PageComposer/controller/ContextSelector.controller"
            ], function (ContextSelector) {
                if (!this.oContextSelectorController) {
                    var oParentController = _oParentView.getController();
                    this.oContextSelectorController = new ContextSelector(
                        oParentController.getRootView(),
                        oParentController.getResourceBundle());
                }
                var oModel = _oDialog.getModel("roleContext");
                var aSelectedRoles = oModel.getProperty("/selectedRoles");
                this.oContextSelectorController.openSelector(_sPageID, aSelectedRoles, this.onRolesSelected);
            }.bind(this));
        }
    });

    return new PagePreviewDialogController();
});
