// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @fileOverview Controller of the PageOverview fragment.
 */
sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/ListType",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "./../util/FilterFactory",
    "sap/ushell/utils",
    "sap/ui/core/BusyIndicator"
], function (
    BaseController,
    MessageToast,
    ColumnListItem,
    ObjectIdentifier,
    Text,
    ListType,
    JSONModel,
    Sorter,
    FilterFactory,
    oUshellUtils,
    BusyIndicator
) {
    "use strict";

    /**
     * @typedef {object} ButtonStateModel The model for the button states (e.g. delete button)
     * @property {boolean} isDeleteAndCopyEnabled Whether the delete and copy buttons are enabled
     */

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.Main", {
        aPropertiesToFilterCustomerCreated: [ // used for the SearchField in the headerToolbar
            "id",
            "title",
            "description"
        ],

        aPropertiesToFilterSapDelivered: [
            "id",
            "title",
            "description"
        ],

        oDialogFactory: null,
        sCurrentTableId: "customerCreatedTable",
        aPropertiesToFilter: [],
        mSearchFilter: [],
        mViewSettingsFilters: [],
        mFilterFactory: {},
        formatters: {
            assignmentStatusText: function (iNumberOfRoles, iNumberOfSpaces) {
                var sId;
                if (!iNumberOfSpaces) {
                    sId = "Label.NotAssignedToSpace";
                } else if (!iNumberOfRoles) {
                    sId = "Label.NotAssignedToRole";
                } else {
                    sId = "Label.StatusAssigned";
                }
                return this.getResourceBundle().getText(sId);
            },
            assignmentStatusActive: function (iNumberOfRoles, iNumberOfSpaces) {
                return !(iNumberOfRoles && iNumberOfSpaces);
            },
            assignmentStatusState: function (iNumberOfRoles, iNumberOfSpaces) {
                return iNumberOfRoles && iNumberOfSpaces ? "Success" : "Warning";
            }
        },

        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            this._bPageMasterSetLoaded = false;
            this.setModel(this._createInitialButtonStateModel(), "buttonStates");
            this.aPropertiesToFilter = this.aPropertiesToFilterCustomerCreated;
            this.mFilterFactory[this.sCurrentTableId] = new FilterFactory(this.aPropertiesToFilter);
        },

        /**
         * Called if a list item in the pageOverview table is pressed.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         * @private
         */
        onItemPress: function (oEvent) {
            var oPage = this.getPageInTable(oEvent.getParameter("listItem"));
            this._navigateToDetail(oPage.id);
        },

        /**
         * Navigates to the page detail page
         *
         * @param {string} pageId The page ID to navigate to
         * @private
         */
        _navigateToDetail: function (pageId) {
            var oSettingsModel = this.getOwnerComponent().getModel("settings");
            oSettingsModel.setProperty("/editMode", false);
            oSettingsModel.setProperty("/deepLink", false);
            this.getRouter().navTo("view", {
                pageId: encodeURIComponent(pageId)
            });
        },

        /**
         * Factory for the item creation of the SAP-Delivered table
         * @param {string} sColumnType The type of the ColumnListItem
         * @param {string} sId The id of the item
         * @param {object} oContext The context object of the item
         * @return {sap.m.ColumnListItem} The generated ColumnListItem
         * @private
         */
        _itemFactory: function (sColumnType, sId, oContext) {
            return new ColumnListItem({
                id: sId,
                type: sColumnType,
                detailPress: this.onEdit.bind(this),
                cells: [
                    new ObjectIdentifier({
                        title: oContext.getObject().id,
                        text: oContext.getObject().description
                    }),
                    new Text({
                        text: oContext.getObject().title
                    })
                ]
            });
        },

        /**
         * Loads the pageMasterSet and sets the items for the sapDelivered table if it wasn't done yet.
         * @private
         */
        _loadPageMasterSet: function () {
            if (!this._bPageMasterSetLoaded) {
                var oSupportedOperationModel = this.getOwnerComponent().getModel("SupportedOperationModel");
                var sColumnType = oSupportedOperationModel.getData().updateSupported ? ListType.DetailAndActive : ListType.Inactive;

                this.byId("sapDeliveredTable").bindItems({
                    factory: this._itemFactory.bind(this, sColumnType),
                    path: "PageRepository>/pagesMasterSet",
                    key: "id",
                    sorter: new Sorter({
                        path: "id"
                    })
                });
                this._bPageMasterSetLoaded = true;
            }
        },

        /**
         * Called if a list item in the pageOverview table is selected
         * Sets the state of the Delete button and Copy button to enabled.
         *
         * @param {sap.ui.base.Event} oEvent The select event
         * @private
         */
        onSelectionChange: function (oEvent) {
            this._setDeleteAndCopyButtonEnabled(true);
        },

        onTabChange: function (oEvent) {
            var sSelectedTabKey = this.byId("iconTabBar").getProperty("selectedKey");
            if (sSelectedTabKey === "iconTabBarSapDelivered") {
                this.getOwnerComponent().setMetaModelDataSapDelivered();
                this.sCurrentTableId = "sapDeliveredTable";
                this._loadPageMasterSet();
                this.aPropertiesToFilter = this.aPropertiesToFilterSapDelivered;
                if (!this.mFilterFactory[this.sCurrentTableId]) {
                    this.mFilterFactory[this.sCurrentTableId] = new FilterFactory(this.aPropertiesToFilter);
                }
            } else {
                this.getOwnerComponent().setMetaModelData();
                this.sCurrentTableId = "customerCreatedTable";
                this.aPropertiesToFilter = this.aPropertiesToFilterCustomerCreated;
            }
        },

        onEdit: function (oEvent) {
            oUshellUtils.setPerformanceMark("FLPPage-manage.navigateToEditView");
            var oPage = this.getPageInTable(oEvent.getSource());
            this.navigateToEdit(oPage.id);
        },

        /**
        * Called if the add button is clicked
        * Creates and saves (!) a new page, then sets the config values and navigates to the dashboard
        *
        * @private
        */
        onAdd: function () {
            var oResourceBundle = this.getResourceBundle();
            this.showCreateDialog(function (oEvent) {
                var oDialog = oEvent.getSource().getParent();
                var oPageInfo = oDialog.getModel().getProperty("/");
                // Add transport fields
                if (oEvent.transportId) { oPageInfo.transportId = oEvent.transportId; }
                if (oEvent.devclass) { oPageInfo.devclass = oEvent.devclass; }

                BusyIndicator.show(0);
                sap.ushell.Container.getServiceAsync("PageReferencing")
                    .then(function (PageReferencing) {
                        return PageReferencing.createReferencePage(oPageInfo);
                    })
                    .then(function (oReferencePage) {
                        return this.getPageRepository().createPage(oReferencePage);
                    }.bind(this))
                    .then(function () {
                        this._navigateToDetail(oPageInfo.id);
                        MessageToast.show(oResourceBundle.getText("Message.PageCreated"), { closeOnBrowserNavigation: false });
                        oDialog.close();
                    }.bind(this))
                    .catch(this.handleBackendError.bind(this))
                    .finally(function () { BusyIndicator.hide(); });
            }.bind(this));
        },

        /**
         * Called if the delete dialog is confirmed
         * Deletes the selected page and refreshes the model to display the change in the pageOverview table
         *
         * @param {sap.ui.base.Event} oEvent The press event
         * @returns {Promise<undefined>} The delete promise
         * @private
         */
        _deletePage: function (oEvent) {
            var oResourceBundle = this.getResourceBundle(),
                oDialog = oEvent.getSource().getParent(),
                sTransportId = oEvent.transportId || "",
                oTable = this.byId(this.sCurrentTableId),
                oItemToDelete = this.getPageInTable(oTable.getSelectedItem()),
                sSuccessMsg = oResourceBundle.getText("Message.SuccessDeletePage"),
                oPromise = this.sCurrentTableId === "customerCreatedTable"
                    ? this.getPageRepository().deletePage(oItemToDelete.id, sTransportId, oItemToDelete.modifiedOn)
                    : this.getPageRepository().deleteMasterPage(oItemToDelete.id, sTransportId);


            BusyIndicator.show(0);
            return oPromise.then(function () {
                oTable.removeSelections();
                this._setDeleteAndCopyButtonEnabled(false);
                oTable.fireSelectionChange();
                MessageToast.show(sSuccessMsg, { closeOnBrowserNavigation: false });
                oDialog.close();
            }.bind(this))
            .catch(this.handleBackendError.bind(this))
            .finally(function () { BusyIndicator.hide(); });

        },

        /**
         * Called if the delete button is clicked
         * Displays the delete dialog with the pages to delete
         * on confirmation deletes the pages
         * on cancel closes the dialog
         *
         * @private
         */
        onDelete: function () {
            var oTable = this.byId(this.sCurrentTableId),
                oSelectedItem = oTable.getSelectedItem();
            if (!oSelectedItem) {
                return;
            }

            this.checkShowDeleteDialog(
                this.getPageInTable(oSelectedItem),
                this._deletePage.bind(this)
            );
        },

        getPageInTable: function (oSelectedItem) {
            return oSelectedItem.getBindingContext("PageRepository").getObject();
        },

        /**
         * Called if the copy button is clicked.
         * Calls the copy dialog with the page to copy and navigates to the dashboard.
         *
         * @private
         */
        onCopy: function () {
            var oTable = this.byId(this.sCurrentTableId),
                oSelectedItem = oTable.getSelectedItem(),
                oResourceBundle = this.getResourceBundle();
            if (!oSelectedItem) {
                return;
            }

            var oPage = this.getPageInTable(oSelectedItem);
            this.showCopyDialog(oPage, function (oEvent) {
                var oDialog = oEvent.getSource().getParent();
                var oPageInfo = oDialog.getModel().getProperty("/");
                // Add transport information
                if (oEvent.transportId) { oPageInfo.transportId = oEvent.transportId; }
                if (oEvent.devclass) { oPageInfo.devclass = oEvent.devclass; }
                BusyIndicator.show(0);
                sap.ushell.Container.getServiceAsync("PageReferencing")
                    .then(function (PageReferencing) {
                        return PageReferencing.createReferencePage(oPageInfo);
                    })
                    .then(function (oReferencePage) {
                        return this.getPageRepository().copyPage(oReferencePage);
                    }.bind(this))
                    .then(function (/*oResolvedResult*/) {
                        this._navigateToDetail(oPageInfo.targetId);
                        MessageToast.show(oResourceBundle.getText("Message.PageCreated"), { closeOnBrowserNavigation: false });
                        oDialog.close();
                    }.bind(this))
                    .catch(this.handleBackendError.bind(this))
                    .finally(function () { BusyIndicator.hide(); });
            }.bind(this));
        },

        /**
         * Filters the Table
         *
         * @param {sap.ui.base.Event} oEvent The press event
         * @private
         */
        onSearch: function (oEvent) {
            var oTable = this.byId(this.sCurrentTableId),
                oBinding = oTable.getBinding("items"),
                oResourceBundle = this.getResourceBundle(),
                sSearchValue = oEvent.getSource().getValue(),
                oOrFilter = this.mFilterFactory[this.sCurrentTableId].createOrFilter(sSearchValue);
            this.mSearchFilter[this.sCurrentTableId] = oOrFilter;
            this._applyCombinedFilters(
                this.mViewSettingsFilters[this.sCurrentTableId],
                oOrFilter
            );
            if (oBinding.getLength() === 0) { // Adjust empty table message in case all pages are filtered out.
                if (sSearchValue) {
                    oTable.setNoDataText(oResourceBundle.getText("Message.NoPagesFound"));
                } else {
                    oTable.setNoDataText(oResourceBundle.getText("Message.NoPages"));
                }
            }
        },

        /**
         * Called when table was updated, for example, filter items via search
         *
         * @private
         */
        onTableUpdate: function () {
            oUshellUtils.setPerformanceMark("FLPPage-manage.tableOverviewUpdated");
            var oTable = this.byId(this.sCurrentTableId);
            // if filter hides selected item, we need to reset copy button and delete button and selected item
            if (oTable.getSelectedItems().length === 0) {
                // true -> remove all selections (also hidden by filter)
                oTable.removeSelections(true);
                this._setDeleteAndCopyButtonEnabled(false);
            }
        },

        /**
         * Creates the model for the state of the delete button
         *
         * @returns {ButtonStateModel} The Model for storing the button
         * @private
         */
        _createInitialButtonStateModel: function () {
            return new JSONModel({
                isDeleteAndCopyEnabledCustomerCreated: false,
                isDeleteAndCopyEnabledSapDelivered: false
            });
        },

        /**
         * Changes the state model of the delete and copy button.
         *
         * @param {boolean} bEnabled Whether the delete and copy buttons should be enabled.
         * @private
         */
        _setDeleteAndCopyButtonEnabled: function (bEnabled) {
            this.getView().getModel("buttonStates").setProperty(
                this.sCurrentTableId === "customerCreatedTable" ?
                    "/isDeleteAndCopyEnabledCustomerCreated" :
                    "/isDeleteAndCopyEnabledSapDelivered",
                bEnabled
            );
        },

        /**
         * Called when the error message is clicked to display more detailed error message.
         *
         * @param {sap.ui.base.Event} oEvent The press event
         * @private
         */
        onErrorMessageClicked: function (oEvent) {
            var oSelectedObject = oEvent.getSource().getBindingContext("PageRepository").getObject();
            var oMessageModel = this.getOwnerComponent().getModel("message");
            var sPageSetQuery = "/pageSet('" + oSelectedObject.id + "')";
            var oErrorMessage;
            
            oMessageModel.getData().some(function (oMessage) {
                 if (oMessage.target.toLowerCase().indexOf(sPageSetQuery.toLowerCase()) !== -1) {
                     oErrorMessage = oMessage;
                 }
                 return !!oErrorMessage;
            });
            if (oErrorMessage) {
                this.showMessageBoxWarning(
                    oErrorMessage.message,
                    this.formatAssignmentDetailsMessage(oErrorMessage.code),
                    false
                );
            }
        },

        /**
         * Opens and creates the ViewSettingsDialog for customer created table
         *
         * @param {string} sTabKey The key of the tab to be displayed. It can have values filter, sort, group
         * @private
         */
        showViewSettingsCustomerCreatedDialog: function (sTabKey) {
            if (this._oViewSettingsCustomerCreatedDialog) {
                this._oViewSettingsCustomerCreatedDialog.open(sTabKey);
                return;
            }

            sap.ui.require([
                "sap/ui/core/Fragment",
                "sap/ui/Device",
                "sap/ushell/applications/PageComposer/controller/ViewSettingsCustomerCreatedDialog.controller"
            ], function (Fragment, Device, ViewSettingsCustomerCreatedDialogController) {
                Fragment.load({
                    name: "sap.ushell.applications.PageComposer.view.ViewSettingsCustomerCreatedDialog",
                    type: "XML",
                    controller: new ViewSettingsCustomerCreatedDialogController(this)
                }).then(function (oFragment) {
                    this._oViewSettingsCustomerCreatedDialog = oFragment;
                    if (Device.system.desktop) {
                        oFragment.addStyleClass("sapUiSizeCompact");
                    }
                    this.getView().addDependent(oFragment);
                    oFragment.open(sTabKey);
                }.bind(this));
            }.bind(this));
        },


        /**
         * Opens and creates the ViewSettingsDialog for SAP delivered content
         *
         * @param {string} sTabKey The key of the tab to be displayed. It can have values filter, sort, group
         * @private
         */
        showViewSettingsSapDeliveredDialog: function (sTabKey) {
            if (this._oViewSettingsSapDeliveredDialog) {
                this._oViewSettingsSapDeliveredDialog.open(sTabKey);
                return;
            }

            sap.ui.require([
                "sap/ui/core/Fragment",
                "sap/ui/Device",
                "sap/ushell/applications/PageComposer/controller/ViewSettingsSapDeliveredDialog.controller"
            ], function (Fragment, Device, ViewSettingsSapDeliveredDialogController) {
                Fragment.load({
                    name: "sap.ushell.applications.PageComposer.view.ViewSettingsSapDeliveredDialog",
                    type: "XML",
                    controller: new ViewSettingsSapDeliveredDialogController(this)
                }).then(function (oFragment) {
                    this._oViewSettingsSapDeliveredDialog = oFragment;
                    this.getView().addDependent(oFragment);
                    oFragment.open(sTabKey);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Combines the filters from the viewSettingsDialog and the filters from the search and applies them together.
         * Filter categories, like "createdBy" or "createdOn" will be connected via AND.
         * Filter properties of such categories, like "Marie Curie" and "Albert Einstein"
         * or "14.03.1903" and "14.03.1921" will be connected via OR.
         * This allows for example to filter for pages created by "Marie Curie" or "Albert Einstein" on 03.14.1903 or the 03.14.1921.
         *
         * @param {object} mFilters map of filters from the view setting dialog
         * @param {object} oCurrentSearchFilter filter from the search field
         * @private
         */
        _applyCombinedFilters: function (mFilters, oCurrentSearchFilter) {
            var oBinding = this.byId(this.sCurrentTableId).getBinding("items");
            var oSearchAndViewSettingFilter = this.mFilterFactory[this.sCurrentTableId].createFilters(mFilters, oCurrentSearchFilter);
            oBinding.filter(oSearchAndViewSettingFilter);
        }
    });
});
