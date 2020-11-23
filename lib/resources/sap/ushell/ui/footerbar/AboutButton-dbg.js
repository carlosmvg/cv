// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.AboutButton.
sap.ui.define([
    "sap/base/util/restricted/_flatten",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/Title",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/ushell/resources",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/services/AppConfiguration",
    "sap/m/Label",
    "sap/m/Text",
    "sap/ui/core/library",
    "sap/ui/layout/library",
    "sap/ushell/Config",
    "sap/ui/core/Icon",
    "./AboutButtonRenderer"
], function (
    _flatten,
    Button,
    Dialog,
    Title,
    VBox,
    HBox,
    SimpleForm,
    resources,
    ActionItem,
    AppConfiguration,
    Label,
    Text,
    coreLibrary,
    layoutLibrary,
    Config,
    Icon
    // AboutButtonRenderer
) {
    "use strict";

    // shortcut for sap.ui.layout.form.SimpleFormLayout
    var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;
    var TitleLevel = coreLibrary.TitleLevel;

    /**
     * Constructor for a new ui/footerbar/AboutButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class Add your documentation for the newui/footerbar/AboutButton
     * @extends sap.ushell.ui.launchpad.ActionItem
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.AboutButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var AboutButton = ActionItem.extend("sap.ushell.ui.footerbar.AboutButton", /** @lends sap.ushell.ui.footerbar.AboutButton.prototype */ {
        metadata: { library: "sap.ushell" }
    });

    /**
     * AboutButton
     *
     * @name sap.ushell.ui.footerbar.AboutButton
     * @private
     * @since 1.16.0
     */
    AboutButton.prototype.init = function () {
        // call the parent sap.ushell.ui.launchpad.ActionItem init method
        if (ActionItem.prototype.init) {
            ActionItem.prototype.init.apply(this, arguments);
        }
        this.setIcon("sap-icon://hint");
        this.setText(resources.i18n.getText("about"));
        this.setTooltip(resources.i18n.getText("about"));
        this.attachPress(this.showAboutDialog);
        this._translationBundle = resources.i18n;
    };

    AboutButton.prototype.showAboutDialog = function () {
        var pAppLifeCycle = sap.ushell.Container.getServiceAsync("AppLifeCycle");
        return Promise.all([
            pAppLifeCycle.then(function (oAppLifeCycle) {
                return oAppLifeCycle.getCurrentApplication().getInfo([
                    "technicalAppComponentId",
                    "appVersion",
                    "appFrameworkId",
                    "appFrameworkVersion",
                    "productName",
                    "appId",
                    "appSupportInfo"
                ]);
            }),
            this._getContentProviderLabel(),
            this._getAppFrameworkVersion()
        ]).then(function (aResults) {
            var oMetaData = AppConfiguration.getMetadata();
            var getLineOfContent = function (sParameterName, sParameterValue) {
                    return [
                        new Label({ text: this._translationBundle.getText(sParameterName) }),
                        new Text({ text: sParameterValue || "", visible: !!sParameterValue })
                    ];
                }.bind(this),
                oInfo = aResults[0],
                sProviderId = aResults[1],
                sFrameworkVersion = aResults[2],
                getLineOfContentForInfoParameter = function (sParameterName) {
                    return getLineOfContent(sParameterName, oInfo[sParameterName]);
                },
                sClientRole = this._getClientRoleDescription(),
                aContents =
                    _flatten(
                        [
                            "technicalAppComponentId",
                            "appVersion",
                            "appFrameworkId"
                        ]
                            .map(getLineOfContentForInfoParameter)

                            .concat(
                                getLineOfContent("appFrameworkVersion", sFrameworkVersion)
                            )
                            .concat(
                                getLineOfContent("contentProviderLabel", sProviderId)
                            )
                            .concat(
                                getLineOfContent("userAgentFld", navigator.userAgent)
                            )
                            .concat(
                                getLineOfContentForInfoParameter("productName")
                            )
                            .concat(
                                getLineOfContent("clientRoleFld", sClientRole)
                            )
                            .concat(
                                [
                                    "appId",
                                    "appSupportInfo"
                                ]
                                    .map(getLineOfContentForInfoParameter)
                            )
                    );

            var oSimpleForm = new SimpleForm({
                id: "aboutDialogFormID",
                editable: false,
                layout: SimpleFormLayout.ResponsiveGridLayout,
                content: aContents
            }),
                aHeaderItems = [],
                oDialog,
                oVBox,
                okButton = new Button({
                    text: this._translationBundle.getText("okBtn"),
                    press: function () {
                        oDialog.close();
                    }
                });

            if (oMetaData.icon) {
                aHeaderItems.push(
                    new Icon({ src: oMetaData.icon })
                        .addStyleClass("sapUiTinyMarginEnd")
                );
            }

            if (oMetaData.title) {
                aHeaderItems.push(new Title({
                    text: oMetaData.title,
                    level: TitleLevel.H3
                }));
            }

            if (aHeaderItems.length > 0) {
                oSimpleForm.insertContent(new HBox({
                    items: aHeaderItems
                }), 0);
            }

            oVBox = new VBox({ items: [oSimpleForm] });

            oDialog = new Dialog({
                id: "aboutContainerDialogID",
                title: this._translationBundle.getText("about"),
                contentWidth: "25rem",
                horizontalScrolling: false,
                leftButton: okButton,
                afterClose: function () {
                    oDialog.destroy();
                    if (window.document.activeElement && window.document.activeElement.tagName === "BODY") {
                        window.document.getElementById("meAreaHeaderButton").focus();
                    }
                }
            }).addStyleClass("sapContrastPlus");

            oDialog.addContent(oVBox);
            oDialog.open();
        }.bind(this));
    };

    /**
     * Extracts the translated description text from the message bundle resources for a given short name of the back-end.
     *
     * @returns {string} The translated description text of the client role.
     * @private
     */
    AboutButton.prototype._getClientRoleDescription = function () {
        var sClientRole = sap.ushell.Container.getLogonSystem().getClientRole();

        var oClientRoles = {
            P: "clientRoleProduction",
            T: "clientRoleTest",
            C: "clientRoleCustomizing",
            D: "clientRoleDemonstration",
            E: "clientRoleTraining",
            S: "clientRoleSAPReference"
        };
        return oClientRoles[sClientRole] && this._translationBundle.getText(oClientRoles[sClientRole]);
    };

    /**
    * Retrieves the label of the systemContext of the current application
    * @returns {Promise<string>} Promise that resolves to the label
    *
    * @private
    * @since 1.81.0
    */
    AboutButton.prototype._getContentProviderLabel = function () {
        if (Config.last("/core/contentProviders/providerInfo/show")) {
            var pAppLifeCycle = sap.ushell.Container.getServiceAsync("AppLifeCycle");
            return pAppLifeCycle.then(function (oAppLifeCycle) {
                var oApplication = oAppLifeCycle.getCurrentApplication();
                return oApplication.getSystemContext().then(function (oSystemContext) {
                    return oSystemContext.label;
                });
            });
        }

        return Promise.resolve(undefined);
    };

    /**
    * Returns the <code>appFrameworkversion</code> when the FLP displays
    * the homepage (or appfinder).
    * Returns <code>undfined</code> in all other cases.
    *
    * @returns {Promise<string>} Promise that resolves to the version string or undefined.
    */
    AboutButton.prototype._getAppFrameworkVersion = function () {
        var pAppLifeCycle = sap.ushell.Container.getServiceAsync("AppLifeCycle");
        return pAppLifeCycle.then(function (opAppLifeCycle) {
            var oApplication = opAppLifeCycle.getCurrentApplication();
            return oApplication.getInfo(["appFrameworkVersion"]).then(function (oInfo) {
                return oApplication.homePage ? oInfo.appFrameworkVersion : undefined;
            });
        });
    };

    return AboutButton;
});