// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/Button",
    "sap/m/FlexBox",
    "sap/m/FlexItemData",
    "sap/m/Input",
    "sap/m/library",
    "sap/m/Select",
    "sap/m/Text",
    "sap/m/Token",
    "sap/ui/comp/library",
    "sap/ui/core/ListItem",
    "sap/ui/core/mvc/Controller",
    "sap/ui/comp/smartfield/SmartField",
    "sap/ui/comp/smartform/SmartForm",
    "sap/ui/comp/smartfield/SmartLabel",
    "sap/ui/comp/smartform/Group",
    "sap/ui/comp/smartform/GroupElement",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/Device",
    "sap/ui/layout/GridData",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/m/MessageBox"
], function (
    Log,
    Button,
    FlexBox,
    FlexItemData,
    Input,
    mobileLibrary,
    Select,
    Text,
    Token,
    compLibrary,
    ListItem,
    Controller,
    SmartField,
    SmartForm,
    SmartLabel,
    Group,
    GroupElement,
    ValueHelpDialog,
    Device,
    GridData,
    JSONModel,
    ODataModel,
    jQuery,
    resources,
    MessageBox
) {
    "use strict";

    // shortcut for sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation
    var ValueHelpRangeOperation = compLibrary.valuehelpdialog.ValueHelpRangeOperation;

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    return Controller.extend("sap.ushell.components.shell.Settings.userDefaults.UserDefaultsSetting", {
        onInit: function () {
            this.oModelRecords = {}; // a map of models
            this.oChangedParameters = {}; // a Map of all parameters changed by the control
            this.oBlockedParameters = {}; // parmeters of odata models which are not yet filled with "our" value
            this.aDisplayedUserDefaults = []; // array of displayed parameters, in order
            this.DefaultParametersService = sap.ushell.Container.getService("UserDefaultParameters");
            this.bIsDirty = false;
        },

        _overrideOdataModelValue: function (oEvent) {
            var sUrl = oEvent.getParameter("url").replace(/\?.*/, ""),
                oModel = oEvent.getSource();

            this.aDisplayedUserDefaults.forEach(function (oRecord) {
                if (oRecord.editorMetadata && oRecord.editorMetadata.editorInfo) {
                    var sFullOdataUrl = oRecord.editorMetadata.editorInfo.odataURL + oRecord.editorMetadata.editorInfo.bindingPath;
                    // check if there is a parameter with the same oData URL as the completed request
                    if (sFullOdataUrl === sUrl) {
                        var sFullPath = oRecord.editorMetadata.editorInfo.bindingPath + "/" + oRecord.editorMetadata.editorInfo.propertyName;
                        // if the property value in the model is not the same as the one we got from the service,
                        // change the property value accordingly
                        if (oModel.getProperty(sFullPath) !== oRecord.valueObject.value) {
                            oModel.setProperty(sFullPath, oRecord.valueObject.value);
                        }
                        this.oBlockedParameters[oRecord.parameterName] = false;
                    }
                }
            }.bind(this));
        },

         /**
         * @typedef {object} ModelRecord A model record.
         * @property {object} model The model used for the OData request.
         * @property {Promise<void>} metadata A promise which resolves if the model is loaded or rejects if the loading failed.
         */

        /**
         * Returns a model record for the OData Service.
         *
         * @param {string} sUrl
         * The url for which the model should be created.
         *
         * @returns {ModelRecord} The model record for the OData Service.
         */
        _getOrCreateModelForODataService: function (sUrl) {
            if (!this.oModelRecords[sUrl]) {
                // In order to reduce the volume of the metadata response
                // We pass only relevant parameters to oDATaModel constructor
                var oModel = new ODataModel(sUrl, {
                    metadataUrlParams: {
                        "sap-documentation": "heading,quickinfo",
                        "sap-value-list": "none"
                    },
                    json: true
                });
                oModel.setDefaultCountMode("None");
                oModel.setDefaultBindingMode("TwoWay");
                oModel.attachRequestCompleted(this._overrideOdataModelValue.bind(this));
                var oMetadataPromise = new Promise(function (resolve, reject) {
                    oModel.attachMetadataLoaded(resolve);
                    oModel.attachMetadataFailed(reject);
                });
                this.oModelRecords[sUrl] = {model: oModel, metadata: oMetadataPromise};
            }
            return this.oModelRecords[sUrl];
        },

        _constructControlSet: function (oParameters) {
            // sort parameters and remove noneditable ones
            var aUserDef = []; // use an empty array to be able to delete parameters
            // for each property name -> push all array elements into aUserDef
            for (var sParameter in oParameters) {
                // copy the parameter name because we want to show it in the UI later
                oParameters[sParameter].parameterName = sParameter;
                aUserDef.push(oParameters[sParameter]);
            }
            this.sortParametersByGroupIdParameterIndex(aUserDef);

            this.aDisplayedUserDefaults = aUserDef;
        },

        _createPlainModel: function (oGroupElement, oRecord) {
            oRecord.modelBind.model = this.oModel;
            oRecord.modelBind.extendedModel = this.oModel; // same model!
            oGroupElement.setModel(oRecord.modelBind.model);
            var oModelPath = "/sUserDef_" + oRecord.nr + "_";
            oRecord.modelBind.sFullPropertyPath = oModelPath;
            oRecord.modelBind.sPropertyName = "{" + oModelPath + "}";
            oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath, oRecord.valueObject.value);
        },

        _revertToPlainModelControls: function (oGroupElement, oRecord) {
            Log.error("Metadata loading for parameter " + oRecord.parameterName + " failed" + JSON.stringify(oRecord.editorMetadata));// metadata loading for the model intended for this control failed
            // -> instead display as plain
            // switch model binding:
            oRecord.modelBind.isOdata = false;
            this._createPlainModel(oGroupElement, oRecord);
            // switch to create other controls
            this._createAppropriateControl(oGroupElement, oRecord);
        },

        /**
         * Creates an empty smartForm and adds it to the views content
         *
         * @private
         *
         * @since 1.80.0
         */
        _constructForm: function () {
            this.oSmartForm = new SmartForm({
                editable: true
            }).addStyleClass("sapUshellShellDefaultValuesForm");
            this.getView().addContent(this.oSmartForm);
        },

        /**
         * Gets all contentProvider ids.
         * If spaces mode is active the content Providers will be recieved from the CDM service,
         * else only the default contentProvider id will be returned
         *
         * @returns {Promise<string[]>} A promise which resolves to a list of content provider ids
         *
         * @private
         *
         * @since 1.80.0
         */
        _getContentProviderIds: function () {
            return sap.ushell.Container.getServiceAsync("CommonDataModel")
                .then(function (oCdmService) {
                    return oCdmService.getContentProviderIds();
                })
                .catch(function () {
                    return [""];
                });
        },

        /**
         * Initializes the model and builds the form
         * If there are more than one content provider also the system select will be created.
         * The systemContexts and the selectedKey will be written into the model
         *
         * @returns {Promise<object>} A Promise which resolves to the view
         *
         * @private
         */
        getContent: function () {
            var oSystemContextModel= new JSONModel({systemContexts: [], selectedKey: ""});
            this.getView().setModel(oSystemContextModel, "systemContexts");

            var oGetContentProviderIdsPromise = this._getContentProviderIds();
            var oClientSideTargetResolutionPromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");

           this._constructForm();

            return Promise.all([oGetContentProviderIdsPromise, oClientSideTargetResolutionPromise]).then(function (aResults) {
                var aContentProviderIds = aResults[0];
                var oCSTRService = aResults[1];

                // If there are no content providers we use the local systemContext
                if (aContentProviderIds.length === 0) {
                    aContentProviderIds.push("");
                }
                return Promise.all(aContentProviderIds.map(function (sContentProvider) {
                        return oCSTRService.getSystemContext(sContentProvider).then(function (oSystemContext) {
                            var aSystemContexts = oSystemContextModel.getProperty("/systemContexts");
                            aSystemContexts.push(oSystemContext);
                            oSystemContextModel.refresh();
                        });
                })).then(function () {
                    var aSystemContexts = this.getView().getModel("systemContexts").getProperty("/systemContexts");
                    if (aSystemContexts.length > 0) {
                        this.getView().getModel("systemContexts").setProperty("/selectedKey", aSystemContexts[0].id);
                    }
                    // We only want to show the systemContext select if there are more than one systemContexts
                    if (aContentProviderIds.length > 1) {
                        this._createSystemContextSelectGroup();
                    }
                    return this._fillGroups();
                }.bind(this));
            }.bind(this));
        },

        /**
         * Checks if the view is dirty and creates a messageBox to ask the user if they want to discard the changes.
         * Calls _fillGroups if the user wants to discard the changes or the view is not dirty
         *
         * @private
         *
         * @since 1.81.0
         */
        _handleSystemContextChanged: function () {
            if (this.bIsDirty) {
                var sUserDefaultSaveText = resources.i18n.getText("userDefaultsSave");
                var sUserDefaultDiscardText = resources.i18n.getText("userDefaultsDiscard");
                MessageBox.show(resources.i18n.getText("userDefaultsUnsavedChangesMessage"), {
                    title: resources.i18n.getText("userDefaultsUnsavedChangesTitle"),
                    actions: [ sUserDefaultSaveText, sUserDefaultDiscardText, MessageBox.Action.CANCEL ],
                    emphasizedAction: sUserDefaultSaveText,
                    icon: MessageBox.Icon.QUESTION,
                    onClose: function (sAction) {
                        if (sAction === sUserDefaultDiscardText) {
                            this._fillGroups();
                            this.bIsDirty = false;
                        } else if (sAction === sUserDefaultSaveText) {
                            this.onSave();
                            this._fillGroups();
                            this.bIsDirty = false;
                        } else {
                            this.getView().getModel("systemContexts").setProperty("/selectedKey", this.sLastSelectedKey);
                        }
                    }.bind(this)
                });
            } else {
                this._fillGroups();
            }
        },

        /**
         * Sets the dirty state and saves the current selectedKey.
         * This is needed for resetting the selectedKey if the user doesn't want to discard their changes.
         *
         * @private
         *
         * @since 1.81.0
         */
        _setDirtyState: function () {
            this.bIsDirty = true;
            this.sLastSelectedKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
        },

        /**
         * Creates the UI elements for the system select and adds them to the smartForm
         *
         * @private
         *
         * @since 1.80.0
         */
        _createSystemContextSelectGroup: function () {
            var oSelect = new Select("systemContextSelect", {
                items: {
                    path: "systemContexts>/systemContexts",
                    template: new ListItem({
                        text: "{systemContexts>label}",
                        key: "{systemContexts>id}"
                    })
                },
                selectedKey: {
                    path: "systemContexts>/selectedKey"
                },
                change: [this._handleSystemContextChanged, this]
            });

            var oLabel = new SmartLabel({
                width: Device.system.phone ? "auto" : "12rem",
                textAlign: Device.system.phone ? "Left" : "Right",
                text: resources.i18n.getText("userDefaultsSystemTitle"),
                labelFor: "systemContextSelect"
            });

            var oSystemSelectGroupElement = new GroupElement({});
            var oInfoTextGroupElement = new GroupElement({});
            oSystemSelectGroupElement.addElement(new FlexBox({
                alignItems: Device.system.phone ? "Start" : "Center",
                direction: Device.system.phone ? "Column" : "Row",
                items: [oLabel, oSelect]
            }));

            var oSelectText = new Text({
                text: resources.i18n.getText("userDefaultsSystemContextInfo")
            }).addStyleClass("sapUshellFlpSettingsWideDescription");
            oInfoTextGroupElement.addElement(oSelectText);

            var oSystemSelectGroup = new Group({});

            oSystemSelectGroup.addGroupElement(oSystemSelectGroupElement);
            oSystemSelectGroup.addGroupElement(oInfoTextGroupElement);
            this.oSmartForm.addGroup(oSystemSelectGroup);
        },

        /**
         * Iterates over all groups of the smartForm and deletes all but the first.
         * The first group should always be the systemSelect group
         *
         * @private
         *
         * @since 1.80.0
         */
        _removeDefaultValueGroups: function () {
            var iCount = this.oSmartForm.getGroups().length;

            for (var i = iCount-1; i > 0; i--) {
                this.oSmartForm.removeGroup(i);
            }
        },

        /**
         * Creates the groups containing the user defaults of the selected system,
         * and adds them to the form
         *
         * @returns {Promise<object>} A promise which resolves to the current view
         *
         * @private
         *
         * @since 1.80.0
         */
        _fillGroups: function () {
            this._removeDefaultValueGroups();

            var sKey = this.getView().getModel("systemContexts").getProperty("/selectedKey");
            var oSystemContext = this.getView().getModel("systemContexts").getProperty("/systemContexts").find(function (oSystemContext) {
                return oSystemContext.id === sKey;
            });

            return new Promise(function (resolve, reject) {
                this.DefaultParametersService.editorGetParameters(oSystemContext)
                    .done(function (oParameters) {
                        // a json model for the "conventional" ( = non odata parameters)
                        this.oModel = new JSONModel(oParameters);
                        this.oModel.setDefaultBindingMode("TwoWay");
                        this.getView().setModel(this.oModel, "MdlParameter");
                        // take a deep copy of the original parameters
                        this.oOriginalParameters = jQuery.extend(true, {}, oParameters);
                        // that deep copy maintains the currently (within the editor) altered properties
                        this.oCurrentParameters = jQuery.extend(true, {}, oParameters);
                        this._constructControlSet(oParameters);

                        var sLastGroupId = "nevermore";
                        var oGroup; // the current group;
                        this.oBindingContexts = {};

                        this.setPropValue = function (oRecord) {
                            oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath, oRecord.valueObject.value);
                            this.oBlockedParameters[oRecord.parameterName] = false;
                        };
                        this.oModel.setProperty("/sUser");

                        for (var i = 0; i < this.aDisplayedUserDefaults.length; ++i) {
                            var oRecord = this.aDisplayedUserDefaults[i];
                            var oODataServiceModelObject;
                            oRecord.nr = i;
                            oRecord.editorMetadata = oRecord.editorMetadata || {};
                            oRecord.valueObject = oRecord.valueObject || { value: "" };
                            var oGroupElement = new GroupElement({});

                            if (sLastGroupId !== oRecord.editorMetadata.groupId) {
                                // generate a group on group change
                                // var groupTitle = oRecord.editorMetadata.groupTitle || sap.ushell.resources.i18n.getText("userDefaultsGeneralGroup");
                                var groupTitle = oRecord.editorMetadata.groupTitle || undefined;
                                // for a proper form-field alignment across groups, set the linebreak layoutData to false explicitly.
                                oGroup = new Group({
                                    label: groupTitle,
                                    editable: true,
                                    layoutData: new GridData({ linebreak: false })
                                });
                                sLastGroupId = oRecord.editorMetadata.groupId;
                                this.oSmartForm.addGroup(oGroup);
                            }
                            oGroup.addGroupElement(oGroupElement);
                            oRecord.modelBind = {
                                model: undefined, // the model
                                sModelPath: undefined, // path into the model to the property value "/sUserDef_<i>_/" or "/UserDefaults('FIN')/CostCenter
                                sPropertyName: undefined, // the property binding statement , e.g. {xxxx} to attach to the control
                                sFullPropertyPath: undefined // path into the model to the property value
                            };

                            // normalize the value, in the editor, undefined is represented as "" for now,
                            // (check if we can make that better!
                            oRecord.valueObject.value = oRecord.valueObject.value || "";

                            if (oRecord.editorMetadata.editorInfo && oRecord.editorMetadata.editorInfo.propertyName) {
                                oRecord.modelBind.isOdata = true;
                                var sUrl = oRecord.editorMetadata.editorInfo.odataURL;
                                oODataServiceModelObject = this._getOrCreateModelForODataService(sUrl);

                                oRecord.modelBind.model = oODataServiceModelObject.model;
                                oGroupElement.setModel(oRecord.modelBind.model);
                                // in order to avoid OData requests to the same URL
                                // we try to reuse the BindingContext that was previously created for the same URL
                                // the call to bindElement creates a new BindingContext, and triggers an OData request
                                if (!this.oBindingContexts[sUrl]) {
                                    oGroupElement.bindElement(oRecord.editorMetadata.editorInfo.bindingPath);
                                    this.oBindingContexts[sUrl] = oRecord.modelBind.model.getContext(oRecord.editorMetadata.editorInfo.bindingPath);
                                } else {
                                    oGroupElement.setBindingContext(this.oBindingContexts[sUrl]);
                                }
                                oRecord.modelBind.sPropertyName = "{" + oRecord.editorMetadata.editorInfo.propertyName + "}";
                                oRecord.modelBind.sFullPropertyPath = oRecord.editorMetadata.editorInfo.bindingPath + "/" + oRecord.editorMetadata.editorInfo.propertyName;

                                // for the extendedDefault we use the plain model for OData
                                oRecord.modelBind.extendedModel = this.oModel; // original model!
                            } else {
                                this._createPlainModel(oGroupElement, oRecord);
                            }

                            oRecord.valueObject.value = oRecord.valueObject.value || "";
                            oRecord.modelBind.model.setProperty(oRecord.modelBind.sFullPropertyPath, oRecord.valueObject.value);
                            // before we have set "our" value, we do not want to listen/react on values
                            // within the control, thus we "block" the update

                            if (oRecord.modelBind.isOdata) {
                                this.oBlockedParameters[oRecord.parameterName] = true;
                                oODataServiceModelObject.metadata
                                    .then(this._createAppropriateControl.bind(this, oGroupElement, oRecord))
                                    .catch(this._revertToPlainModelControls.bind(this, oGroupElement, oRecord));
                            } else {
                                this._createAppropriateControl(oGroupElement, oRecord);
                            }

                            oRecord.modelBind.model.bindTree(oRecord.modelBind.sFullPropertyPath).attachChange(this.storeChangedData.bind(this));
                        }
                        this.oModel.bindTree("/").attachChange(this.storeChangedData.bind(this));
                        resolve(this.getView());
                    }.bind(this));
                }.bind(this));
        },

        _createAppropriateControl: function (oGroupElement, oRecord) {
            var oField,
                oLabel,
                oExtendedParametersButton;
            // If oRecord supports extended values (ranges), we want to add an additional button to it
            // The style of the button depends on whether there are any ranges in the extendedValues object
            if (oRecord.editorMetadata.extendedUsage) {
                oExtendedParametersButton = new Button({
                    text: resources.i18n.getText("userDefaultsExtendedParametersTitle"),
                    tooltip: resources.i18n.getText("userDefaultsExtendedParametersTooltip"),
                    type: {
                        parts: ["MdlParameter>/" + oRecord.parameterName + "/valueObject/extendedValue/Ranges"],
                        formatter: function (aRanges) {
                            return aRanges && aRanges.length ? ButtonType.Emphasized : ButtonType.Transparent;
                        }
                    },
                    press: function (oEvent) {
                        this._openExtendedValueDialog(oEvent, oRecord);
                    }.bind(this)
                }).addStyleClass("sapUshellExtendedDefaultParamsButton");
            }
            // Group Element
            Log.debug("Creating controls for parameter" + oRecord.parameterName + " type " + oRecord.modelBind.isOdata);
            var aElements = oGroupElement.getElements().slice();
            aElements.forEach(function (oElement) {
                // at time or writing, the removeElement call was flawed
                oGroupElement.removeElement(oElement);
            });
            var aFields = oGroupElement.getFields().slice();
            aFields.forEach(function (oElement) {
                oGroupElement.removeField(oElement);
            });

            oLabel = new SmartLabel({
                width: Device.system.phone ? "auto" : "12rem",
                textAlign: Device.system.phone ? "Left" : "Right"
            });
            if (oRecord.modelBind.isOdata && oRecord.editorMetadata.editorInfo) {
                oField = new SmartField({
                    value: oRecord.modelBind.sPropertyName,
                    name: oRecord.parameterName
                });
                oLabel.setLabelFor(oField);
            } else {
                oField = new Input({
                    name: oRecord.parameterName,
                    value: oRecord.modelBind.sPropertyName,
                    type: "Text"
                });
                oField.addAriaLabelledBy(oLabel);
                this.setPropValue(oRecord);
                oLabel.setText((oRecord.editorMetadata.displayText || oRecord.parameterName) + ":");
                oLabel.setTooltip(oRecord.editorMetadata.description || oRecord.parameterName);
            }

            oField.attachChange(this.storeChangedData.bind(this));
            oField.attachChange(this._setDirtyState, this);
            oField.addStyleClass("sapUshellDefaultValuesSmartField");
            oField.setLayoutData(new FlexItemData({ shrinkFactor: 0 }));
            var oInputBox = new FlexBox({
                width: Device.system.phone ? "100%" : "auto",
                direction: (Device.system.phone && !oExtendedParametersButton) ? "Column" : "Row",
                items: [oField, oExtendedParametersButton]
            });
            oLabel.setLayoutData(new FlexItemData({ shrinkFactor: 0 }));
            oGroupElement.addElement(new FlexBox({
                alignItems: Device.system.phone ? "Start" : "Center",
                direction: Device.system.phone ? "Column" : "Row",
                items: [oLabel, oInputBox]
            }));
        },

        _openExtendedValueDialog: function (oEvent, oData) {
            var sPathToTokens = "/" + oData.parameterName + "/valueObject/extendedValue/Ranges",
                oModel = oData.modelBind.extendedModel,
                aRanges = oModel.getProperty(sPathToTokens) || [],
                sLabelText,
                sNameSpace;

            if (oData.modelBind.isOdata) {
                sNameSpace = this._getMetadataNameSpace(oData.editorMetadata.editorInfo.odataURL);
                var oEntityType = oData.modelBind.model.getMetaModel().getODataEntityType(sNameSpace + "." + oData.editorMetadata.editorInfo.entityName);
                if (oEntityType) {
                    sLabelText = oData.modelBind.model.getMetaModel().getODataProperty(oEntityType, oData.editorMetadata.editorInfo.propertyName)["sap:label"];
                }
            }
            var oValueHelpDialog = new ValueHelpDialog({
                basicSearchText: oData.editorMetadata.displayText || sLabelText || oData.parameterName,
                title: oData.editorMetadata.displayText || sLabelText || oData.parameterName,
                supportRanges: true,
                supportRangesOnly: true,
                key: oData.modelBind.sPropertyName,
                displayFormat: "UpperCase",
                descriptionKey: oData.editorMetadata.displayText || sLabelText || oData.parameterName,
                filterMode: true,
                stretch: Device.system.phone,
                ok: function (oControlEvent) {
                    this._saveExtendedValue(oControlEvent, oData, oModel, oValueHelpDialog);
                }.bind(this),
                cancel: function () {
                    oValueHelpDialog.close();
                },
                afterClose: function () {
                    oValueHelpDialog.destroy();
                }
            });

            oValueHelpDialog.setIncludeRangeOperations(this.getListOfSupportedRangeOperations());
            this.addTokensToValueHelpDialog(oValueHelpDialog, aRanges, oData.parameterName);
            var aKeyFields = [];
            aKeyFields.push({
                label: oValueHelpDialog.getTitle(),
                key: oData.parameterName
            });
            oValueHelpDialog.setRangeKeyFields(aKeyFields);
            oValueHelpDialog.open();
        },

        _saveExtendedValue: function (oControlEvent, oData, oModel, oValueHelpDialog) {
            this.aTokens = oControlEvent.getParameters().tokens;
            var aTokensData = [],
                sPathToTokens = "/" + oData.parameterName + "/valueObject/extendedValue/Ranges",
                aFormattedTokensData,
                oValueObject = { extendedValue: { Ranges: [] } };
            jQuery.extend(this.oCurrentParameters[oData.parameterName].valueObject, oValueObject);
            for (var sTokenKey in this.aTokens) {
                if (this.aTokens.hasOwnProperty(sTokenKey)) {
                    aTokensData.push(this.aTokens[sTokenKey].data("range"));
                }
            }
            // convert the Ranges that are coming from the dialog to the format that should be persisted in the service and that applications can read
            aFormattedTokensData = aTokensData.map(function (token) {
                return {
                    Sign: token.exclude ? "E" : "I",
                    Option: token.operation !== "Contains" ? token.operation : "CP",
                    Low: token.value1,
                    High: token.value2 || null
                };
            });
            if (!oModel.getProperty("/" + oData.parameterName + "/valueObject/extendedValue")) {
                oModel.setProperty("/" + oData.parameterName + "/valueObject/extendedValue", {});
            }
            oModel.setProperty(sPathToTokens, aFormattedTokensData);
            this.oChangedParameters[oData.parameterName] = true;
            if (oControlEvent.getParameter("_tokensHaveChanged")) {
                this._setDirtyState();
            }
            oValueHelpDialog.close();
        },

        getListOfSupportedRangeOperations: function () {
            // there is no representation of StartsWith and EndsWith on ABAP so applications won't be able to get these operations
            var aSupportedOps = Object.keys(ValueHelpRangeOperation);
            return aSupportedOps.filter(function (operation) {
                return operation !== "StartsWith" && operation !== "EndsWith" && operation !== "Initial";
            });
        },

        _getMetadataNameSpace: function (sServiceUrl) {
            var aSplit = sServiceUrl.split("/"),
                sNamespace;
            sNamespace = aSplit[aSplit.length - 1];
            return sNamespace;
        },

        addTokensToValueHelpDialog: function (oDialog, aRanges, sParameterName) {
            var aTokens = [],
                oFormattedToken;
            aRanges.forEach(function (oRange) {
                if (oRange) {
                    // convert the Range format to the format that the value help dialog knows how to read
                    oFormattedToken = {};
                    oFormattedToken.exclude = oRange.Sign === "E";
                    oFormattedToken.keyField = sParameterName;
                    oFormattedToken.operation = oRange.Option !== "CP" ? oRange.Option : "Contains";
                    oFormattedToken.value1 = oRange.Low;
                    oFormattedToken.value2 = oRange.High;
                    aTokens.push(new Token({}).data("range", oFormattedToken));
                }
            });
            oDialog.setTokens(aTokens);
        },

        /**
         * Sorts the array parameter aUserDefTmp in situ by respective criteria to achieve a display order
         * @param {array} aUserDefTmp list or parameters
         */
        sortParametersByGroupIdParameterIndex: function (aUserDefTmp) {
            // compare by groupId
            function compareByGroupId (oDefault1, oDefault2) {
                // handle default without metadata
                if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.groupId)) {
                    return -1; // keep order
                }
                if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.groupId)) {
                    return 1; // move oDefault1 to the end
                }

                if (oDefault1.editorMetadata.groupId < oDefault2.editorMetadata.groupId) {
                    return -1;
                }
                if (oDefault1.editorMetadata.groupId > oDefault2.editorMetadata.groupId) {
                    return 1;
                }

                return 0;
            }

            // compare by parameterIndex
            function compareByParameterIndex (oDefault1, oDefault2) {
                // handle default without metadata
                if (!(oDefault2.editorMetadata && oDefault2.editorMetadata.parameterIndex)) {
                    return -1; // keep order
                }
                if (!(oDefault1.editorMetadata && oDefault1.editorMetadata.parameterIndex)) {
                    return 1; // move oDefault1 to the end
                }
                return oDefault1.editorMetadata.parameterIndex - oDefault2.editorMetadata.parameterIndex;
            }

            // sort by groupid, parameterindex
            aUserDefTmp.sort(function (oDefault1, oDefault2) {
                // first by groupId
                var iComparisonResult = compareByGroupId(oDefault1, oDefault2);
                if (iComparisonResult === 0) {
                    // then by parameterIdx
                    return compareByParameterIndex(oDefault1, oDefault2);
                }
                return iComparisonResult;
            });
        },

        /*
         * this function is invoked on any model data change, be it in an odata model or in the plain JSON fallback model
         * we always run over all parameters and record the ones with a delta
         * we change *relevant* deltas compared to the data when calling up the dialogue
         * note that the valueObject may contain other relevant metadata!
         * (which is *not* altered by the Editor Control),
         * thus it is important not to overwrite or recreate the valueObject, but only set the value property
         */
        storeChangedData: function () {
            var aDisplayedUserDefaults = this.aDisplayedUserDefaults;

            // check for all changed parameters...
            for (var i = 0; i < aDisplayedUserDefaults.length; ++i) {
                var sParameterName = aDisplayedUserDefaults[i].parameterName;
                if (!this.oBlockedParameters[sParameterName]) {
                    var oldValue = {
                        value: this.oCurrentParameters[sParameterName].valueObject && this.oCurrentParameters[sParameterName].valueObject.value,
                        extendedValue: this.oCurrentParameters[sParameterName].valueObject && this.oCurrentParameters[sParameterName].valueObject.extendedValue && this.oCurrentParameters[sParameterName].valueObject.extendedValue
                    };
                    if (aDisplayedUserDefaults[i].modelBind && aDisplayedUserDefaults[i].modelBind.model) {
                        var oModel = aDisplayedUserDefaults[i].modelBind.model;
                        var oModelExtended = aDisplayedUserDefaults[i].modelBind.extendedModel;
                        var sPropValuePath = aDisplayedUserDefaults[i].modelBind.sFullPropertyPath;
                        var sActValue = oModel.getProperty(sPropValuePath);
                        var oNewValue = {
                            value: oModel.getProperty(sPropValuePath),
                            extendedValue: oModelExtended.getProperty("/" + sParameterName + "/valueObject/extendedValue")
                        };
                        if (this.isValueDifferent(oNewValue, oldValue)) {
                            this.oCurrentParameters[sParameterName].valueObject.value = sActValue;
                            if (oNewValue.extendedValue) {
                                jQuery.extend(this.oCurrentParameters[sParameterName].valueObject.extendedValue, oNewValue.extendedValue);
                            }
                            this.oChangedParameters[sParameterName] = true;
                        }
                    }
                }
            }
        },

        onCancel: function () {
            this.bIsDirty = false;
            var oSaveButton = sap.ui.getCore().byId("saveButton");
            if (oSaveButton) {
                oSaveButton.setEnabled(true);
            }
            var aChangedParameterNames = Object.keys(this.oChangedParameters),
                aDisplayedParameters = this.aDisplayedUserDefaults,
                sParameterName,
                oBoundModel,
                oOriginalParameter;

            if (aChangedParameterNames.length > 0) {
                for (var i = 0; i < aDisplayedParameters.length && aChangedParameterNames.length > 0; i++) {
                    sParameterName = aDisplayedParameters[i].parameterName;
                    if (aChangedParameterNames.indexOf(sParameterName) > -1) {
                        oOriginalParameter = this.oOriginalParameters[sParameterName];
                        oBoundModel = aDisplayedParameters[i].modelBind;
                        oBoundModel.model.setProperty(oBoundModel.sFullPropertyPath, oOriginalParameter.valueObject.value || "");
                        if (oOriginalParameter.editorMetadata && oOriginalParameter.editorMetadata.extendedUsage) {
                            oBoundModel.extendedModel.setProperty("/" + sParameterName + "/valueObject/extendedValue",
                                oOriginalParameter.valueObject.extendedValue || {});
                        }
                    }
                }
                this.oCurrentParameters = jQuery.extend(true, {}, this.oOriginalParameters);
                this.oChangedParameters = {};
            }

        },

        isValueDifferent: function (oValueObject1, oValueObject2) {
            var bIsEmptyValue = false,
                sValue1 = oValueObject1 ? JSON.stringify(oValueObject1) : oValueObject1,
                sValue2 = oValueObject2 ? JSON.stringify(oValueObject2) : oValueObject2,
                sExtendedValue1,
                sExtendedValue2;

            if (sValue1 === sValue2) {
                return false;
            }
            if (oValueObject1 === undefined) {
                return false;
            }
            if (oValueObject2 === undefined) {
                return false;
            }
            sExtendedValue1 = oValueObject1.extendedValue ? JSON.stringify(oValueObject1.extendedValue) : oValueObject1.extendedValue;
            sExtendedValue2 = oValueObject2.extendedValue ? JSON.stringify(oValueObject2.extendedValue) : oValueObject2.extendedValue;

            // for the editor, "" and undefined are the same!
            if ((oValueObject1.value === "" && oValueObject2.value === undefined) ||
                (oValueObject2.value === "" && oValueObject1.value === undefined)) {
                bIsEmptyValue = true;
            }
            if (bIsEmptyValue && (sExtendedValue1 === sExtendedValue2)) {
                return false;
            }
            return (!bIsEmptyValue && (oValueObject1.value !== oValueObject2.value)) || (sExtendedValue1 !== sExtendedValue2);
        },

        onSave: function () {
            this.bIsDirty = false;
            var oDeferred = new jQuery.Deferred();
            var aChangedParameterNames = Object.keys(this.oChangedParameters || {}).sort();

            if (aChangedParameterNames.length === 0) {
                oDeferred.resolve();
            }

            sap.ushell.Container.getServiceAsync("ClientSideTargetResolution")
                .then(function (oClientSideTargetResolution) {
                    return oClientSideTargetResolution.getSystemContext(this.sLastSelectedKey);
                }.bind(this))
                .then(function (oSystemContext) {
                    this.oChangedParameters = {};

                    return this._saveParameterValues(aChangedParameterNames, oSystemContext);
                }.bind(this))
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);

            return oDeferred.promise();
        },

        _saveParameterValues: function (aChangedParameterNames, oSystemContext) {
            var aPromises = [];
            var sParameterName;
            var oSetValuePromise;
            var oValueObject;
            var oOriginalValueObject;

            // we change the effectively changed parameters, once, in alphabetic order
            for (var i = 0; i < aChangedParameterNames.length; i++) {
                sParameterName = aChangedParameterNames[i];
                oValueObject = this.oCurrentParameters[sParameterName].valueObject;
                oOriginalValueObject = this.oOriginalParameters[sParameterName].valueObject;

                if (this.isValueDifferent(oOriginalValueObject, oValueObject)) {
                    // as the editor does not distinguish empty string from deletion, and has no "reset" button
                    // we drop functionality to allow to set a value to an empty string (!in the editor!)
                    // and map an empty string to an effective deletion!
                    // TODO: make sure all controls allow to enter an empty string as a "valid" value
                    if (oValueObject && oValueObject.value === null || oValueObject && oValueObject.value === "") {
                        oValueObject.value = undefined;
                    }

                    // we rectify the extended value, as the editor produces empty object
                    if (oValueObject && oValueObject.extendedValue && Array.isArray(oValueObject.extendedValue.Ranges) && oValueObject.extendedValue.Ranges.length === 0) {
                        oValueObject.extendedValue = undefined;
                    }

                    oSetValuePromise = this._saveParameterValue(sParameterName, oValueObject, oOriginalValueObject, oSystemContext);

                    aPromises.push(oSetValuePromise);
                }
            }

            return Promise.all(aPromises);
        },

        _saveParameterValue: function (sName, oValueObject, oOriginalValueObject, oSystemContext) {
            return sap.ushell.Container.getServiceAsync("UserDefaultParameters")
                .then(function (oUserDefaultParameters) {
                    return new Promise(function (resolve, reject) {
                        oUserDefaultParameters.editorSetValue(sName, oValueObject, oSystemContext)
                            .done(function () {
                                oOriginalValueObject.value = oValueObject.value;
                                resolve();
                            })
                            .fail(reject);
                    });
                });
        }
    });
});
