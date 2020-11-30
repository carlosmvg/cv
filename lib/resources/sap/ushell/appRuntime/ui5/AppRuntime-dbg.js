// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
prepareModules();
sap.ui.define([
    "sap/base/util/LoaderExtensions",
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/SessionHandlerAgent",
    "sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent",
    "sap/ushell/appRuntime/ui5/services/ShellUIService",
    "sap/ushell/ui5service/UserStatus",
    "sap/ushell/appRuntime/ui5/services/AppConfiguration", //must be included, do not remove
    "sap/ui/core/Popup",
    "sap/ui/thirdparty/jquery",
    "sap/base/util/isEmptyObject",
    "sap/base/Log",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/appRuntime/ui5/renderers/fiori2/RendererExtensions"
], function (
    LoaderExtensions,
    AppRuntimePostMessageAPI,
    AppCommunicationMgr,
    AppRuntimeService,
    URI,
    SessionHandlerAgent,
    AppLifeCycleAgent,
    ShellUIService,
    UserStatus,
    AppConfiguration,
    Popup,
    jQuery,
    isEmptyObject,
    Log,
    ComponentContainer
    // RendererExtensions
) {
    "use strict";

    var oPageUriParams = new URI().search(true),
        oComponentContainer,
        oShellNavigationService,
        bEmailFnReplaced = false,
        bPluginsLoaded = false,
        oStartupPlugins = {};

    /**
     * Application runtime for UI5 applications running in iframe
     *
     * @private
     */
    function AppRuntime () {

        /**
         * @private
         */
        this.main = function () {
            var that = this;

            AppCommunicationMgr.init();
            this.getPageConfig();
            Promise.all([
                AppLifeCycleAgent.getURLParameters(that._getURI()),
                that.fetchStartupPlugins()
            ]).then(function (values) {
                var oURLParameters = values[0],
                    sAppId = oURLParameters["sap-ui-app-id"];

                oStartupPlugins = values[1];
                that.setModulePaths();
                that.init();
                Promise.all([
                    that.initServicesContainer(),
                    that.getAppInfo(sAppId)
                ]).then(function (values) {
                    var oAppInfo = values[1];
                    SessionHandlerAgent.init();
                    that.createApplication(sAppId, oURLParameters, oAppInfo)
                        .then(function (oResolutionResult) {
                            that.renderApplication(oResolutionResult);
                        });
                });
            });
        };

        /**
         * @private
         */
        this._getURI = function () {
            return new URI().query(true);
        };

        /**
         * @private
         */
        this.init = function () {
            AppRuntimePostMessageAPI.registerCommHandlers({
                "sap.ushell.appRuntime": {
                    oServiceCalls: {
                        "hashChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var sHash = oServiceParams.oMessageData.body.sHash;
                                if (sHash && sHash.length > 0) {
                                    window.hasher.replaceHash(sHash);
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "setDirtyFlag": {
                            executeServiceCallFn: function (oServiceParams) {
                                var bIsDirty = oServiceParams.oMessageData.body.bIsDirty;
                                if (bIsDirty !== sap.ushell.Container.getDirtyFlag()) {
                                    sap.ushell.Container.setDirtyFlag(bIsDirty);
                                }
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "themeChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var currentThemeId = oServiceParams.oMessageData.body.currentThemeId;
                                sap.ushell.Container.getUser().setTheme(currentThemeId);
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "buttonClick": {
                            executeServiceCallFn: function (oServiceParams) {
                                sap.ushell.renderers.fiori2.Renderer.handleHeaderButtonClick(
                                    oServiceParams.oMessageData.body.buttonId
                                );
                                return new jQuery.Deferred().resolve().promise();
                            }
                        },
                        "uiDensityChange": {
                            executeServiceCallFn: function (oServiceParams) {
                                var isTouch = oServiceParams.oMessageData.body.isTouch;
                                jQuery("body")
                                    .toggleClass("sapUiSizeCompact", (isTouch === "0"))
                                    .toggleClass("sapUiSizeCozy", (isTouch === "1"));
                                return new jQuery.Deferred().resolve().promise();
                            }
                        }
                    }
                }
            });
        };

        /**
         * @private
         */
        this.getStartupPlugins = function () {
            return oStartupPlugins;
        };

        /**
         * @private
         */
        this.inIframe = function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        };

        /**
         * @private
         */
        this.isInsideYellowBox = function () {
            var bIsInsideYellowBox = false,
                that = this;

            return new Promise(function (fnResolve) {
                if (that.inIframe()) {
                    var oTimerHandler = setTimeout(function () {
                        if (!bIsInsideYellowBox) {
                            fnResolve(false);
                        }
                    }, 500);

                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.appRuntime.shellCheck", {}).then(function () {
                        bIsInsideYellowBox = true;
                        clearTimeout(oTimerHandler);
                        fnResolve(bIsInsideYellowBox);
                    });
                } else {
                    fnResolve(false);
                }
            });
        };

        /**
         * @private
         */
        this.fetchStartupPlugins = function () {
            var that = this;

            return new Promise(function (fnResolve) {
                that.isInsideYellowBox().then(function (bIsInsideYellowBox) {
                    if (bIsInsideYellowBox) {
                        AppRuntimeService.sendMessageToOuterShell(
                            "sap.ushell.appRuntime.startupPlugins", {}).then(function (oStartupPlugins) {
                            fnResolve(oStartupPlugins);
                        });
                    } else {
                        fnResolve({});
                    }
                });
            });
        };

        /**
         * @private
         */
        this.getPageConfig = function () {
            var metaData,
                shellConfig = {};

            metaData = jQuery("meta[name='sap.ushellConfig.ui5appruntime']")[0];
            if (metaData !== undefined) {
                shellConfig = JSON.parse(metaData.content);
            }
            window["sap-ushell-config"] = jQuery.extend(true, {}, getDefaultShellConfig(), shellConfig);
        };

        /**
         * @private
         */
        this.setModulePaths = function () {
            if (window["sap-ushell-config"].modulePaths) {
                var keys = Object.keys(window["sap-ushell-config"].modulePaths);
                for (var key in keys) {
                    (function () {
                        var paths = {};
                        paths[keys[key].replace(/\./g, "/")] = window["sap-ushell-config"].modulePaths[keys[key]];
                        sap.ui.loader.config({ paths: paths });
                    }());
                }
            }
        };

        /**
         * @private
         */
        this.initServicesContainer = function () {
            return new Promise(function (fnResolve) {
                sap.ui.require(["sap/ushell/appRuntime/ui5/services/Container"], function (oContainer) {
                    oContainer.bootstrap("apprt", { apprt: "sap.ushell.appRuntime.ui5.services.adapters" }).then(function () {
                        fnResolve();
                    });
                });
            });
        };

        /**
         * @private
         */
        this._getURIParams = function () {
            return oPageUriParams;
        };

        /**
         * @private
         */
        this.getAppInfo = function (sAppId) {
            var oData = window["sap-ushell-config"].ui5appruntime.config.appIndex.data,
                sModule = window["sap-ushell-config"].ui5appruntime.config.appIndex.module,
                that = this;

            return new Promise(function (fnResolve) {
                if (oData && !isEmptyObject(oData)) {
                    AppLifeCycleAgent.getAppInfo(sModule, that.createApplication.bind(that), that.renderApplication.bind(that));
                    fnResolve(oData);
                } else {
                    sap.ui.require([sModule.replace(/\./g, "/")], function (AppResolution) {
                        AppLifeCycleAgent.init(AppResolution, that.createApplication.bind(that), that.renderApplication.bind(that));
                        AppResolution.getAppInfo(sAppId).then(function (oAppInfo) {
                            fnResolve(oAppInfo);
                        });
                    });
                }
            });
        };

        /**
         * @private
         */
        this.setApplicationParameters = function (oAppInfo, oURLParameters) {
            var oStartupParameters,
                sSapIntentParam,
                sStartupParametersWithoutSapIntentParam,
                oDeferred = new jQuery.Deferred();

            function buildFinalParamsString(sSimpleParams, sIntentParams) {
                var sParams = "";
                if (sSimpleParams && sSimpleParams.length > 0) {
                    sParams = (sSimpleParams.startsWith("?") ? "" : "?") + sSimpleParams;
                }
                if (sIntentParams && sIntentParams.length > 0) {
                    sParams += (sParams.length > 0 ? "&" : "?") + sIntentParams;
                }
                return sParams;
            }

            if (oURLParameters.hasOwnProperty("sap-startup-params")) {
                oStartupParameters = (new URI("?" + oURLParameters["sap-startup-params"])).query(true);
                if (oStartupParameters.hasOwnProperty("sap-intent-param")) {
                    sSapIntentParam = oStartupParameters["sap-intent-param"];
                    delete oStartupParameters["sap-intent-param"];
                }
                sStartupParametersWithoutSapIntentParam = (new URI("?")).query(oStartupParameters).toString();

                //Handle the case when the parameters that were sent to the application were more than 1000 characters and in
                //the URL we see a shorten value of the parameters
                if (sSapIntentParam) {
                    AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { "sAppStateKey": sSapIntentParam })
                        .then(function (sMoreParams) {
                            oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam, sMoreParams);
                            oDeferred.resolve();
                        }, function (sError) {
                            oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam);
                            oDeferred.resolve();
                        });
                } else {
                    oAppInfo.url += buildFinalParamsString(sStartupParametersWithoutSapIntentParam);
                    oDeferred.resolve();
                }
            } else {
                oDeferred.resolve();
            }

            return oDeferred.promise();
        };

        /**
         * @private
         */
        this.setHashChangedCallback = function () {
            function treatHashChanged (newHash/*, oldHash*/) {
                if (newHash && typeof newHash === "string" && newHash.length > 0) {
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.appRuntime.hashChange",
                        { "newHash": newHash }
                    );
                }
            }
            window.hasher.changed.add(treatHashChanged.bind(this), this);
        };

        this.createApplication = function (sAppId, oURLParameters, oAppInfo) {
            var that = this,
                fnPopupOpenCloseHandler = function (oEvent) {
                    AppRuntimeService.sendMessageToOuterShell(
                        "sap.ushell.services.ShellUIService.showShellUIBlocker",
                        { "bShow": oEvent.getParameters().visible }
                    );
                };

            return new Promise(function (fnResolve) {
                oComponentContainer = new ComponentContainer({
                    id: sAppId + "-content",
                    width: "100%",
                    height: "100%"
                });

                var isTouch = "0";
                if (oPageUriParams.hasOwnProperty("sap-touch")) {
                    isTouch = oPageUriParams["sap-touch"];
                    if (isTouch !== "0" && isTouch !== "1") {
                        isTouch = "0";
                    }
                }
                jQuery("body")
                    .toggleClass("sapUiSizeCompact", (isTouch === "0"))
                    .toggleClass("sapUiSizeCozy", (isTouch === "1"));

                if (!oShellNavigationService) {
                    sap.ushell.renderers.fiori2.utils.init();
                    oShellNavigationService = sap.ushell.Container.getService("ShellNavigation");
                    oShellNavigationService.init(function () { });
                    oShellNavigationService.registerNavigationFilter(function (/*newHash, oldHash*/) {
                        if (sap.ushell.Container.getDirtyFlag()) {
                            return oShellNavigationService.NavigationFilterStatus.Abandon;
                        }
                        return oShellNavigationService.NavigationFilterStatus.Continue;
                    });
                }

                AppLifeCycleAgent.setComponent(oComponentContainer);

                new ShellUIService({ scopeObject: oComponentContainer, scopeType: "component" });
                new UserStatus({ scopeObject: oComponentContainer, scopeType: "component" });

                if (Popup.attachBlockLayerStateChange) {
                    Popup.attachBlockLayerStateChange(fnPopupOpenCloseHandler);
                }

                that.setApplicationParameters(oAppInfo, oURLParameters).done(function () {
                    that.setHashChangedCallback();
                    sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function (oUi5ComponentLoader) {
                        oUi5ComponentLoader.createComponent(
                            {
                                ui5ComponentName: sAppId,
                                applicationDependencies: oAppInfo,
                                url: oAppInfo.url
                            },
                            "todo-replaceDummyShellHash",
                            false
                        ).then(function (oResolutionResultWithComponentHandle) {
                            sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function (oAppLifeCycleService) {
                                oAppLifeCycleService.prepareCurrentAppObject(
                                    "UI5",
                                    oResolutionResultWithComponentHandle.componentHandle.getInstance(),
                                    false,
                                    undefined
                                );
                            });
                            that.overrideSendAsEmailFn();
                            that.loadPlugins();
                            fnResolve(oResolutionResultWithComponentHandle);
                        });
                    });
                });
            });
        };

        /**
         * @private
         */
        this.overrideSendAsEmailFn = function () {
            if (bEmailFnReplaced === true) {
                return;
            }
            bEmailFnReplaced = true;

            if (sap.m && sap.m.URLHelper && sap.m.URLHelper.triggerEmail) {
                sap.m.URLHelper.triggerEmail = function (sTo, sSubject, sBody, sCc, sBcc) {
                    AppRuntimeService.sendMessageToOuterShell("sap.ushell.services.ShellUIService.sendEmail",
                        {
                            "sTo": sTo,
                            "sSubject": sSubject,
                            "sBody": sBody,
                            "sCc": sCc,
                            "sBcc": sBcc,
                            "sIFrameURL": document.URL,
                            "bSetAppStateToPublic": true
                        }
                    );
                };
            }
        };

        /**
         * @private
         */
        this.loadPlugins = function() {
            if (bPluginsLoaded === true) {
                return;
            }

            loadPOCPlugins();
            bPluginsLoaded = true;
            sap.ushell.Container.getServiceAsync("PluginManager").then(function (PluginManagerService) {
                PluginManagerService.loadPlugins("RendererExtensions");
            });
        };

        function loadPOCPlugins() {
            try {
                if (oPageUriParams.hasOwnProperty("sap-wapoc") && oPageUriParams["sap-wapoc"] == "true") {
                    jQuery.getScript("https://education3.hana.ondemand.com/education3/pub/cflp_falko/adaptable/web_assistant_cflp_agent/Help4Agent.js");
                }
            } catch (ex) {
                Log.error(ex);
            }
            try {
                if (oPageUriParams.hasOwnProperty("sap-rtapoc") && oPageUriParams["sap-rtapoc"] == "true") {
                    sap.ushell.Container.getService("PluginManager").registerPlugins({
                        RTAPOCPlugin: {
                            component: "sap.ushell.appRuntime.ui5.plugins.rtaAgent",
                            url: jQuery.sap.getResourcePath("sap/ushell/appRuntime/ui5/plugins/rtaAgent"),
                            config: {
                                "sap-plugin-agent": true
                            }
                        }
                    });
                }
            } catch (ex) {
                Log.error(ex);
            }
        }

        /**
         * @private
         */
        this.renderApplication = function (oResolutionResult) {
            oComponentContainer
                .setComponent(oResolutionResult.componentHandle.getInstance())
                .placeAt("content");
        };
    }

    /**
     * @private
     */
    function getDefaultShellConfig () {
        return {
            "services": {
                "CrossApplicationNavigation": {
                    "module": "sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "NavTargetResolution": {
                    "module": "sap.ushell.appRuntime.ui5.services.NavTargetResolution",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "ShellNavigation": {
                    "module": "sap.ushell.appRuntime.ui5.services.ShellNavigation",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "AppConfiguration": {
                    "module": "sap.ushell.appRuntime.ui5.services.AppConfiguration"
                },
                "Bookmark": {
                    "module": "sap.ushell.appRuntime.ui5.services.Bookmark",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "LaunchPage": {
                    "module": "sap.ushell.appRuntime.ui5.services.LaunchPage",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "UserInfo": {
                    "module": "sap.ushell.appRuntime.ui5.services.UserInfo",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "AppState": {
                    "module": "sap.ushell.appRuntime.ui5.services.AppState",
                    "adapter": {
                        "module": "sap.ushell.appRuntime.ui5.services.adapters.EmptyAdapter"
                    }
                },
                "PluginManager": {
                    "module": "sap.ushell.appRuntime.ui5.services.PluginManager",
                    "config": {
                        "isBlueBox": true
                    }
                },
                "Ui5ComponentLoader": {
                    "config": {
                        "amendedLoading": false
                    }
                }
            }
        };
    }

    var appRuntime = new AppRuntime();
    appRuntime.main();
    return appRuntime;
});

function prepareModules () {
    "use strict";

    //when appruntime is loaded, we will avoid loading specific
    //dependencies as they are not in use
    if (document.URL.indexOf("ui5appruntime") > 0) {
        sap.ui.define("sap/ushell/ApplicationType", [], function () {return {};});
        sap.ui.define("sap/ushell/components/applicationIntegration/AppLifeCycle", [], function () {return {};});
        sap.ui.define("sap/ushell/services/_AppState/WindowAdapter", [], function () {return function() {};});
        sap.ui.define("sap/ushell/services/_AppState/SequentializingAdapter", [], function () {return function() {};});
        sap.ui.define("sap/ushell/services/_AppState/Sequentializer", [], function () {return function() {};});
        sap.ui.define("sap/ushell/TechnicalParameters", [], function () {
            return {
                getParameterValue: function () {return Promise.resolve([]);},
                getParameterValueSync: function () {return [];},
                getParameters: function () {return [];},
                getParameterNames: function () {return [];},
                isTechnicalParameter: function () {return false;}
            };
        });
        sap.ui.define("sap/ushell/AppInfoParameters", [], function () {
            return {
                getInfo: function () {
                    return Promise.resolve({});
                }
            };
        });
    }
}
