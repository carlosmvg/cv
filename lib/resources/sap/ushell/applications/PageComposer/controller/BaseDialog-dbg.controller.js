// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/core/library",
    "sap/ui/model/json/JSONModel"
], function (
    BaseController,
    Fragment,
    coreLibrary,
    JSONModel
) {
    "use strict";

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.BaseDialog.controller", {
        /**
         * Destroys the control.
         *
         * @protected
         */
        destroy: function () {
            if (this._oView.byId(this.sViewId)) {
                this._oView.byId(this.sViewId).destroy();
            }
        },

        /**
         * Attaches a cancel function which is called when dialog cancel button is pressed.
         *
         * @param {function} cancel The cancel function.
         * @protected
         */
        attachCancel: function (cancel) {
            this._fnCancel = cancel;
        },

        /**
         * Attaches a confirm function which is called when dialog confirm button is pressed.
         *
         * @param {function} confirm The confirm function.
         * @protected
         */
        attachConfirm: function (confirm) {
            this._fnConfirm = confirm;
        },

        /**
         * Closes the dialog.
         *
         * @protected
         */
        onCancel: function () {
            this.close();
            if (this._fnCancel) {
                this._fnCancel();
            }
        },

        /**
         * Called when the user presses the confirm button.
         * Calls the attached confirm function if there is one.
         *
         * @param {sap.ui.base.Event} event The press event.
         * @protected
         */
        onConfirm: function (event) {
            function fireValidateFieldGroup (sFieldGroup) {
                var aFieldGroupInputs = this._oView.getControlsByFieldGroupId(sFieldGroup);
                if (aFieldGroupInputs.length) {
                    aFieldGroupInputs[0].fireValidateFieldGroup({ fieldGroupIds: [sFieldGroup] }); // can be called on any fieldGroup member
                }
            }
            function fireTransportValidation () {
                var oTransportComponent = this._oView.byId("transportContainer").getComponentInstance();
                var oTransportRootControl = oTransportComponent && oTransportComponent.getRootControl();
                if (oTransportRootControl) {
                    // for "sap.ushell_abap.workbenchTransport.controller.TransportInformation"
                    var oPackageInput = oTransportRootControl.byId("packageInput");
                    if (oPackageInput) { oPackageInput.fireChangeEvent(oPackageInput.getValue()); }
                    // for "sap.ushell_abap.transport.controller.TransportInformation"
                    var oTransportInput = oTransportRootControl.byId("transportInput");
                    if (oTransportInput) { oTransportInput.fireChangeEvent(oTransportInput.getValue()); }
                }
            }
            fireValidateFieldGroup.call(this, "pageGroup");
            fireTransportValidation.call(this);
            var oValidation = this.getModel().getProperty("/validation");
            var bIsValid = this.validate(oValidation);
            if (bIsValid && this._fnConfirm) {
                this._fnConfirm(event);
            }
        },

        /**
         * Returns the model of this dialog instance. If the dialog has no model yet, an empty one is created for it.
         *
         * @returns {sap.ui.model.json.JSONModel} The JSONModel.
         * @protected
         */
        getModel: function () {
            if (!this._oModel) {
                this._oModel = new JSONModel({});
            }
            return this._oModel;
        },

        /**
         * Resets the dialog model. Exception: the "validation" property is always kept.
         *
         * @private
         */
        _resetModel: function () {
            var oModel = this.getModel();
            var oValidation = oModel.getProperty("/validation") || {};
            oModel.setProperty("/", { validation: oValidation });
        },

        /**
         * Event is fired if a logical field group (defined by "fieldGroupIds") of the Form was left
         * or when the user explicitly pressed the key combination that triggers validation.
         *
         * @param {sap.ui.base.Event} event provided by UI5
         */
        onValidateFieldGroup: function (event) {
            function getInputsByFieldGroup (oControl, sFieldGroup) {
                if (!oControl) { return []; }
                if (oControl.getControlsByFieldGroupId) {
                    var aInputs = oControl.getControlsByFieldGroupId(sFieldGroup);
                    if (aInputs.length) { return aInputs; }
                }
                return getInputsByFieldGroup(oControl.getParent(), sFieldGroup);
            }
            function validateInputs (aInputs) {
                var iValidationExceptions = 0;
                aInputs.forEach(function (oInput) {
                    try {
                        oInput.getBinding("value").getType().validateValue(oInput.getValue());
                        oInput.fireValidationSuccess({ element: oInput });
                    } catch (oException) {
                        if (oException.message.indexOf("validateValue") >= 0) {
                            throw new Error("The input's \"value\" binding must have a \"type\" to be validated");
                        }
                        oInput.fireValidationError({ element: oInput, exception: oException });
                        iValidationExceptions++;
                    }
                });
                return !iValidationExceptions;
            }
            var oInput = event.getSource();
            var oModel = oInput.getModel();
            event.getParameters().fieldGroupIds.forEach(function (sFieldGroupId) {
                var aInputs = getInputsByFieldGroup(oInput, sFieldGroupId);
                oModel.setProperty("/validation/" + sFieldGroupId, validateInputs(aInputs));
            });
        },

        /**
         * Fired when a new value is entered and has been propagated to the model.
         * Only fired when the "value" binding has a "type".
         *
         * @param {sap.ui.base.Event} event provided by UI5
         */
        onValidationSuccess: function (event) {
            var oInput = event.getSource();
            oInput.setValueState(ValueState.None);
        },

        /**
         * Fired when a new value is entered and should have been propagated to the model, but this does not happen
         * because validating the value failed with an exception. Because of this, the model is manually updated.
         * Only fired when the "value" binding has a "type".
         *
         * @param {sap.ui.base.Event} event provided by UI5
         */
        onValidationError: function (event) {
            var oException = event.getParameter("exception");
            var sMessage = oException.message;
            var oInput = event.getSource();
            var sValueBindingPath = oInput.getBindingPath("value");
            if (sValueBindingPath) {
                // this is needed to always keep the model in sync with what is in the input (i.e. even when the input is invalid)
                // if not done, then the "oModel.refresh(true)" in the "CustTransportHelper" will make the last valid values reappear
                oInput.getModel().setProperty(sValueBindingPath, oInput.getValue());
            }
            if (oException.violatedConstraints.indexOf("search") >= 0) { // show custom "valueStateText" for ID inputs
                var sInvalidPageIDMessage = oInput.getModel("i18n").getProperty("Message.InvalidPageID");
                if (sMessage.indexOf(sInvalidPageIDMessage) === -1) { // check if custom message is not already appended
                    if (sMessage) {
                        sMessage += ((sMessage.slice(-1) !== ".") ? ". " : " ");
                    }
                    sMessage += sInvalidPageIDMessage;
                }
            }
            oInput.setValueStateText(sMessage);
            oInput.setValueState(ValueState.Error);
            event.bCancelBubble = true; // prevents "valueStateText" from being overridden
        },

        /**
         * Returns "true" if all values of the given object are truthy.
         *
         * @param {object} [validation] The object whose properties values are booleans.
         * @returns {boolean} The validation result.
         * @private
         */
        validate: function (validation) {
            for (var sKey in validation) {
                if (!validation[sKey]) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Inserts the given component into the ComponentContainer control with id "transportContainer".
         *
         * @param {object} component The component to insert.
         * @protected
         */
        transportExtensionPoint: function (component) {
            this._oView.byId("transportContainer").setComponent(component);
        },

        /**
         * Loads the dialog fragment without displaying it.
         *
         * @returns {Promise<undefined>} Promise resolving when the fragment is loaded.
         * @protected
         */
        load: function () {
            var oFragmentLoadOptions = {
                id: this._oView.getId(),
                name: this.sId,
                controller: this
            };

            return Fragment.load(oFragmentLoadOptions).then(function (oFragment) {
                oFragment.setModel(this._oModel);
                this._oDialog = oFragment;
                this._oView.addDependent(this._oDialog);
            }.bind(this));
        },

        /**
         * Open the dialog.
         *
         * @protected
         */
        open: function () {
            this._oDialog.open();
        },

        /**
         * Close the dialog.
         *
         * @protected
         */
        close: function () {
            this._oDialog.close();
        },

        /**
         * Check if transport is required by calling showTransport on the transport component.
         * In the CUST scenario, this will trigger a backend query to check if the ID namespace requires a transportId
         * and set the field to required / not required
         *
         * @param {string} id The page id
         */
        handleNamespaceChange: function (id) {
            var oTransportComponent = this._oView.byId("transportContainer").getComponentInstance();
            if (oTransportComponent) {
                oTransportComponent.showTransport({ id: id }, "Page");
            }
        },

        /**
         * Called on the change of the page ID.
         *
         * @param {sap.ui.base.Event} oEvent The change event.
         * @private
         */
        onPageIDChange: function (oEvent) {
            var sNewId = oEvent.getParameters().value;
            this.handleNamespaceChange(sNewId);
        }
    });
});
