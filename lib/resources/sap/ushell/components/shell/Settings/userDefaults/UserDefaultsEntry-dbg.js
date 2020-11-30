// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/JSView",
    "sap/ushell/resources",
    "sap/base/util/includes"
], function (
    Log,
    JSView,
    resources,
    includes
) {
    "use strict";

    return {
        getEntry: function () {
            var oViewInstance;
            return {
                id: "userDefaultEntry", // defaultParametersSelector
                entryHelpID: "defaultParameters",
                title: resources.i18n.getText("defaultsValuesEntry"),
                valueArgument: function () {
                    var oUserDefaultParametersServicePromise = sap.ushell.Container.getServiceAsync("UserDefaultParameters");
                    var oCSTRServicePromise = sap.ushell.Container.getServiceAsync("ClientSideTargetResolution");
                    var oContentProviderIdPromise = sap.ushell.Container.getServiceAsync("CommonDataModel")
                        .then(function (oCdmService) {
                            return oCdmService.getContentProviderIds();
                        })
                        .catch(function () {
                            return [""];
                        });

                    return Promise.all([
                        oUserDefaultParametersServicePromise,
                        oCSTRServicePromise,
                        oContentProviderIdPromise
                    ])
                        .then(function (aResult) {
                            var oUserDefaultParametersService = aResult[0];
                            var oCSTRService = aResult[1];
                            var aContentProviderIds = aResult[2].length > 0 ? aResult[2] : [""];

                            return Promise.all(
                                aContentProviderIds.map(function (sContentProviderId) {
                                    return oCSTRService.getSystemContext(sContentProviderId)
                                        // eslint-disable-next-line max-nested-callbacks
                                        .then(function (oSystemContext) {
                                            return oUserDefaultParametersService.hasRelevantMaintainableParameters(oSystemContext);
                                        });
                                })
                            );
                        })
                        // as a result we get an array of true, false (and undefined in case hasRelevantMaintainableParameters fails)
                        .then(function (aResults) {
                            return {
                                value: includes(aResults, true)
                            };
                        });
                },
                contentFunc: function () {
                    return sap.ui.getCore().loadLibrary("sap.ui.comp", { async: true })
                        .then(function () {
                            return JSView.create({
                                id: "defaultParametersSelector",
                                viewName: "sap.ushell.components.shell.Settings.userDefaults.UserDefaultsSetting"
                            });
                        })
                        .then(function (oView) {
                                return oView.getController().getContent()
                                    .then(function (oContent) {
                                        oViewInstance = oContent;
                                        return oContent;
                                    });
                        });
                },
                onSave: function () {
                    if (oViewInstance) {
                        return oViewInstance.getController().onSave();
                    }
                    Log.warning("Save operation for user account settings was not executed, because the user default view was not initialized");
                    return Promise.resolve();

                },
                onCancel: function () {
                    if (oViewInstance) {
                        oViewInstance.getController().onCancel();
                        return;
                    }
                    Log.warning("Cancel operation for user account settings was not executed, because the user default view was not initialized");
                },
                defaultVisibility: false
            };
        }
    };

});
