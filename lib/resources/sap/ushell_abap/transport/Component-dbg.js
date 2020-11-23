//Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ui/core/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/mvc/XMLView",
    "sap/m/IconTabFilter"
], function (
    UIComponent,
    JSONModel,
    Log,
    coreLibrary,
    Filter,
    FilterOperator,
    XMLView,
    IconTabFilter) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

    var Modes = {
        off: "OFF",
        manual: "MANUAL",
        auto: "AUTOMATIC"
    };

    return UIComponent.extend("sap.ushell_abap.transport.Component", {
        metadata: {
            manifest: "json",
            associations: {
                /**
                 * The IconTabBar can be enhanced.
                 */
                iconTabBar: {
                    type: " sap.m.IconTabBar", multiple: false
                }
            },
            properties: {
                showAssignButton: {
                    name: "showAssignButton",
                    type: "Boolean",
                    defaultValue: false
                }
            },
            aggregations: {
                /**
                 * Dependents are not rendered, but their databinding context and lifecycle are bound to the aggregating Element.
                 */
                dependents: {name: "dependents", type :"sap.ui.core.Element", multiple: true}
            },
            events: {
                /**
                 *
                 */
                change: {
                    parameters: {
                        valid: { type: "Boolean" },
                        required: { type: "Boolean" }
                    }
                },
                /**
                 *
                 */
                assign: {
                    parameters: {
                        transportId: { type: "string" }
                    }
                }
            }
        },

        /**
         * Initializes the component.
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            var oTransportModel = this.getModel("Transport");

            this._initModels();

            //Override the attachChange method, because of PageComposer
            //Problem: The edit and delete dialogs of PageComposer are attached
            //to the change event after the event is fired and they need to call
            //showTransport (trigger new batch request) again in order to get
            //correct state after attachment. In order to avoid the second request
            //we fire the current state after attachment.
            this.fnOriginAttachChange = this.attachChange;
            this.attachChange = function () {
                this.fnOriginAttachChange.apply(this, arguments);
                this.fireChange({
                    valid: !this.getModel("TransportInformation").getProperty("/required"),
                    empty: true,
                    required: !!this.getModel("TransportInformation").getProperty("/required")
                });
            };

            this._oMetadataPromise = new Promise(function (resolve, reject) {
                if (oTransportModel.isMetadataLoadingFailed()) {
                    reject("Metadata failed to load.");
                }
                oTransportModel.attachMetadataFailed(reject);
                oTransportModel.metadataLoaded().then(resolve);
            });
        },

        /**
         * Initializes the 'Mode' and 'TransportInformation' models.
         *
         * @private
         */
        _initModels: function () {
            this.setModel(new JSONModel({
                showAssignButton: this.getShowAssignButton()
            }), "ViewSettings");
            this.setModel(new JSONModel({
                mode: null
            }), "Mode");
            this.setModel(new JSONModel({
                transportId: null,
                required: true,
                valueState: ValueState.None,
                value: "",
                transports: []
            }), "TransportInformation");
        },

        /**
         * Retrieves the mode and saves it. If retrieve fails, saves 'OFF'.
         *
         * @return {Promise<void>} Resolves when the mode is set.
         * @private
         */
        _saveMode: function () {
            var oPromise;
            if (this.getModel("Mode").getProperty("/mode") !== null) {
                oPromise = Promise.resolve(this.getModel("Mode").getProperty("/mode"));
            } else {
                oPromise = this._getMode().then(function (oResult) {
                    return oResult && oResult.mode ? oResult.mode.transportMode : Modes.off;
                }).catch(function () {
                    return Modes.off;
                });
            }
            return oPromise.then(this._setMode.bind(this));
        },

        /**
         * Sets the mode string to the Mode model.
         *
         * @param {string} sMode The mode string: OFF|AUTOMATIC|MANUAL.
         * @private
         */
        _setMode: function (sMode) {
            this.getModel("Mode").setProperty("/mode", sMode);
            if (sMode === Modes.auto) {
                this.getModel("TransportInformation").setProperty("/required", true);
            } else {
                this.getModel("TransportInformation").setProperty("/required", false);
            }
        },

        /**
         * Reads the mode from the server, resolves to the mode string.
         *
         * @return {Promise<string>} Resolves to the mode string.
         * @private
         */
        _getMode: function () {
            if (this.oModePromise) {
                return this.oModePromise;
            }
            this.oModePromise = new Promise(function (resolve, reject) {
                this.getModel("Transport").callFunction("/mode", {
                    method: "POST",
                    success: resolve,
                    error: reject
                });
            }.bind(this));
            return this.oModePromise;
        },

        /**
         * Reads the transports from the server filted by objectId and sets the model entries for the Input field.
         * Rejects with ODataModel error.
         *
         * @return {Promise} Resolves with no value.
         * @private
         */
        _getTransports: function (objectId) {
            return new Promise(function (resolve, reject) {
                this.getModel("Transport").read("/transportSet", {
                    success: resolve,
                    error: reject,
                    filters: [
                        new Filter("objectId", FilterOperator.EQ, objectId.toUpperCase())
                    ]
                });
            }.bind(this));
        },

        /**
         * Called if the OData Requests is done to set the transport data and
         * the component state based on OData message container.
         *
         * @param {object} result OData Result object
         * @param {object} spaceOrPage The Page or Space object, depending on surrounding app
         * @private
         */
        _setTransportData: function (result, spaceOrPage) {
            function checkMessages (messages, model) {
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i].getCode() === "/UI2/PAGE/055") {
                        model.setProperty("/required", false);
                    } else {
                        model.setProperty("/required", true);
                    }
                }

            }
            var aMessages = this.getModel("Transport").getMessages({sDeepPath: "/transportSet"});
            this.getModel("TransportInformation").setProperty("/transports", result.results);
            if (!spaceOrPage) {
                return;
            } else {
                if (aMessages.length !== 0 && this.getModel("Mode").getProperty("/mode") === Modes.auto) { // If AUTO + Messages --> no transport required
                    checkMessages(aMessages, this.getModel("TransportInformation"));
                } else if (aMessages.length === 0 && this.getModel("Mode").getProperty("/mode") === Modes.auto) { // If AUTO + no Messages --> transport required
                    this.getModel("TransportInformation").setProperty("/required", true);
                } else if (aMessages.length === 0 && this.getModel("Mode").getProperty("/mode") === Modes.manual) { // If MANUAL + no Messages --> transport required
                    this.getModel("TransportInformation").setProperty("/required", true);
                } else if (aMessages.length !== 0 && this.getModel("Mode").getProperty("/mode") === Modes.manual) { // If MANUAL + Messages --> no transport required
                    checkMessages(aMessages, this.getModel("TransportInformation"));
                }
                this.getRootControl().getController().validate();
            }
        },

        /**
         *
         * @private
         */
        _decorateTabBarWithTransportTable: function (objectId, objectType) {
            var sIconTabBarId = this.getAssociation("iconTabBar");
            var oIconTabBar = sap.ui.getCore().byId(sIconTabBarId);

            for (var i = 0; i < oIconTabBar.getItems().length; i++) {
                if (oIconTabBar.getItems()[i].getKey() === "iconTabBarTransports") {
                    oIconTabBar.getItems()[i].getContent()[0].getController().bindItems(objectId, objectType, oIconTabBar.getItems()[i]);
                    return;
                }
            }

            XMLView.create({
                id: this.createId("assignedTransport"),
                viewName: "sap.ushell_abap.transport.view.TransportTable"
            }).then(function (oView) {
                this.addDependent(oView);
                oView.setModel(this.getModel("Transport"), "Transport");
                oView.setModel(this.getModel("i18n"), "i18n");
                oView.setModel(this.getModel("ViewSettings"), "ViewSettings");
                var oIconTabFilter = new IconTabFilter({
                    content: oView,
                    key: "iconTabBarTransports"
                });
                oIconTabBar.addItem(oIconTabFilter);
                oView.getController().connect(this);
                oView.getController().bindItems(objectId, objectType, oIconTabFilter);
            }.bind(this));
        },

        /**
         * @param {string | sap.ui.base.ManagedObject}
         *            sId the ID of the managed object that is set as an association, or the managed object itself or null
         * @param {string} objectId the the page or space ID
         * @param {string} objectType is either a "Page" or a "Space"
         */

        setIconTabBar: function (sId, objectId, objectType) {
            this.setAssociation("iconTabBar", sId, true);
            this._saveMode().then(function () {
                if (this.getModel("Mode").getProperty("/mode") === Modes.off) {
                    return;
                }
                this._decorateTabBarWithTransportTable(objectId, objectType);
            }.bind(this));
            return this;
        },

        /**
         * Reset the component to its initial state
         *
         * - Resets the models to initial values.
         * - Calls initialize to save the mode.
         *
         * @return {Promise<void>} Resolves when the component was reset and the mode was saved.
         */
        reset: function () {
            this.getModel("TransportInformation").setProperty("/transportId", null);
            this.getModel("TransportInformation").setProperty("/value", "");
            this.getModel("TransportInformation").setProperty("/required", true);
            this.getModel("TransportInformation").setProperty("/valueState", ValueState.None);
            return Promise.resolve();
        },

        /**
         * Decorates the spaceOrPage object by adding transport-specific properties.
         *
         * @param {object} [spaceOrPage] The Page or Space object, depending on surrounding app
         * @returns {object} The enhanced object or a new object.
         */
        decorateResultWithTransportInformation: function (spaceOrPage) {
            var sTransportId = this.getModel("TransportInformation").getProperty("/transportId");

            if (!spaceOrPage) {
                spaceOrPage = {};
            }

            if (sTransportId) {
                spaceOrPage.transportId = sTransportId;
            }

            return spaceOrPage;
        },

        /**
         * Reads the transports from the server filted by objectId and sets the model entries for the Input field.
         * Rejects with ODataModel error.
         *
         * @return {Promise} Resolves with no value.
         * @private
         */
        _getAssignedTransports: function (objectId, objectType) {
            if (!objectId) {
                return new Promise(function (resolve, reject) {
                    resolve({
                        results: []
                    });
                });
            }
            var aFilter = [];
            aFilter.push(new Filter("objectId", FilterOperator.EQ, objectId.toUpperCase()));
            aFilter.push(new Filter("objectType", FilterOperator.EQ, objectType));
            return new Promise(function (resolve, reject) {
                this.getModel("Transport").read("/assignedTransportSet", {
                    success: resolve,
                    error: reject,
                    filters: aFilter
                });
            }.bind(this));
        },


        /**
         * Checks if the transport information needs to be shown.
         * - Shown if the metadata is loaded and the mode is saved and not 'OFF'.
         * - Rejects if objectType is not provided
         * @param {object} spaceOrPage The space or page object
         * @param {string} objectType is either a "Page" or a "Space"
         * @returns {Promise<boolean>} A promise resolving as boolean indicating if the transport component should be visible within the used app.
         */
        showTransport: function (spaceOrPage, objectType) {
            if (typeof objectType !== "string") {
                return new Promise(function (resolve, reject) {
                    reject("No parameter 'objectType' provided");
                });
            }
            this.getRootControl().setBusy(true);
            this.fireChange({
                valid: false,
                empty: true,
                required: true
            });
            return new Promise(function (resolve, reject) {
                Promise.all([
                    this._getAssignedTransports(spaceOrPage ? spaceOrPage.id : "", objectType),
                    this._oMetadataPromise,
                    this._saveMode()
                ]).then(function (result) {
                    if (result[0].results.length) {
                        this.fireChange({
                            valid: true,
                            empty: true,
                            required: false
                        });
                        resolve(false);
                    } else {
                        var bShow = this.getModel("Mode").getProperty("/mode") !== Modes.off;
                        if (!bShow) {
                            resolve(bShow);
                        }
                        this._getTransports(spaceOrPage ? spaceOrPage.id : "").then(function (result) {
                            this._setTransportData(result, spaceOrPage);
                            this.fireChange({
                                valid: !this.getModel("TransportInformation").getProperty("/required"),
                                empty: true,
                                required: !!this.getModel("TransportInformation").getProperty("/required")
                            });
                            resolve(bShow);
                        }.bind(this));
                    }
                }.bind(this)).catch(function (oError) {
                    Log.error(oError);
                    resolve(false);
                }).finally(function () {
                    this.getRootControl().setBusy(false);
                }.bind(this));
            }.bind(this));
        },

        /**
         * Dummy API Method to be compatible
         *
         * @returns {Promise<boolean|object>} A promise with the transport information or false if the page is not locked
         */
        showLockedMessage: function () {
            return Promise.resolve(false);
        },

        /**
         * Override setShowAssignButton property setter
         * @param {boolean} setShowButton True if the button should be visible
         */
        setShowAssignButton: function (setShowButton) {
            this.getModel("ViewSettings").setProperty("/showAssignButton", !!setShowButton);
            this.setProperty("showAssignButton", setShowButton, true);
        }
    });
});
