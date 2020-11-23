// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (
    Controller,
    Fragment,
    Filter,
    FilterOperator,
    Sorter
) {
    "use strict";

    return Controller.extend("sap.ushell_abap.transport.controller.TransportTable.controller", {
        /**
         * Used to save the objectId in case a transport is assigned later
         */
        onInit: function () {
            // Storing as member to have access to the object ID and type later if assign button is pressed
            this.sObjectId = undefined;
            this.sObjectType = undefined;
        },

        /**
         * Used to connect the Controller to the root component
         * @param {sap.ushell_abap.transport.Component} component root component
         */
        connect: function (component) {
            this.oComponent = component;
        },

        /**
         * Called if the View Seetings Dialog is close and applies sorting on binding.
         * @param {sap.ui.core.Event} event event object passed via UI5 core.
         */
        handleSortDialogConfirm: function (event) {
            var mParams = event.getParameters(),
                sPath = mParams.sortItem.getKey(),
                bDescending = mParams.sortDescending,
                oSorter;
            oSorter = new Sorter(sPath, bDescending);
            this.byId("assignedTransportTable").getBinding("items").sort(oSorter);
        },

        /**
         * On press of the sort button it load the dialog fragment
         */
        onSort: function () {
            if (this.oViewSettingsDialog) {
                this.oViewSettingsDialog.open();
                return;
            }

            Fragment.load({
                name: "sap.ushell_abap.transport.view.SortDialog",
                controller: this
            }).then(function (oDialog) {
                this.oViewSettingsDialog = oDialog;
                oDialog.setModel(this.oComponent.getModel("i18n"), "i18n");
                oDialog.open();
            }.bind(this));
        },

        /**
         * On press of the Add button it open a dialog to a add a transport
         */
        onAdd: function () {
            if (!this.byId("transportAssignDialog--transportDialog")) {
                Fragment.load({
                    id: this.createId("transportAssignDialog"),
                    name: "sap.ushell_abap.transport.view.TransportDialog",
                    type: "XML",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    this.oComponent.showTransport(
                        { id: this.sObjectId},
                        this.sObjectType
                    ).then(function () {
                        oDialog.open();
                    }.bind(this));
                }.bind(this));
            } else {
                this.oComponent.showTransport(
                    { id: this.sObjectId },
                    this.sObjectType
                ).then(function () {
                    this.byId("transportAssignDialog--transportDialog").open();
                }.bind(this));
            }
        },

        /**
         * This event will be fired before the Dialog is opened to set the initial state inside the Dialog.
         * @param {sap.ui.base.Event} event provided by UI5
         */
        onBeforeOpen: function (event) {
            var oDialog = event.getSource(),
                oTransportContainer = oDialog.getContent()[0];
            oTransportContainer.setComponent(this.oComponent);
        },

        /**
         * Called when the user hits cancel
         */
        onCancel: function () {
            this.byId("transportAssignDialog--transportDialog").close();
        },

        /**
         * Called if the save button on Create Dialog is clicked.
         * Validates all fields
         * Retrieves all values and trigger's backend request execution.
         *
         * @private
         */
        onSave: function (event) {
            var sTransportFilled = this.oComponent.getModel("TransportInformation").getProperty("/transportId");
            if (sTransportFilled) {
                this.oComponent.fireAssign({
                    transportId: sTransportFilled
                });
                event.getSource().getParent().close();
                this.byId("assignedTransportTable").getBinding("items").refresh(true);
            }
        },

        /**
         * Sets the binding of the assigned transport table for a given object id and object type.
         * @param {string} objectId is the page or space ID
         * @param {string}objectType is either a "Page" or a "Space"
         * @param {sap.m.IconTabFilter} iconTabFilter the IconTabFilter the table is added to
         */
        bindItems: function (objectId, objectType, iconTabFilter) {
            var aFilter = [], sTabFilterText;
            aFilter.push(new Filter("objectId", FilterOperator.EQ, objectId));
            aFilter.push(new Filter("objectType", FilterOperator.EQ, objectType));
            this.sObjectId = objectId;
            this.sObjectType = objectType;
            this.byId("assignedTransportTable").bindItems({
                path: "Transport>/assignedTransportSet",
                filters: aFilter,
                sorter: new Sorter("id"),
                template: this.byId("assignedTransportTemplate").clone(),
                events: {
                    dataReceived: function (event) {
                        var aData = event.getParameter && event.getParameter("data"),
                            aResults = aData && aData.results || [];
                        sTabFilterText = this.getView().getModel("i18n").getResourceBundle().getText("IconTabFilterText", [aResults.length.toString()]);
                        iconTabFilter.setText(sTabFilterText);
                    }.bind(this)
                }
            });
            sTabFilterText = this.getView().getModel("i18n").getResourceBundle().getText("IconTabFilterText", ["0"]);
            iconTabFilter.setText(sTabFilterText);
        }
    });
});