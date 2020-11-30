// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

// Provides control sap.ushell.ui.footerbar.AddBookmarkButton.
sap.ui.define([
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/MessageBox",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/ui/layout/form/SimpleForm",
    "sap/ushell/resources",
    "sap/base/util/isEmptyObject",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/library",
    "sap/m/library",
    "sap/ui/layout/library",
    "sap/ui/Device",
    "sap/ushell/Config",
    "./AddBookmarkButtonRenderer"
], function (
    Button,
    Dialog,
    MessageBox,
    Text,
    VBox,
    SimpleForm,
    resources,
    isEmptyObject,
    Log,
    JSONModel,
    coreLibrary,
    mobileLibrary,
    layoutLibrary,
    Device,
    Config
    // AddBookmarkButtonRenderer
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    // shortcut for sap.ui.layout.form.SimpleFormLayout
    var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

    // shortcut for sap.ui.core.mvc.ViewType
    var ViewType = coreLibrary.mvc.ViewType;

    /**
     * Constructor for a new ui/footerbar/AddBookmarkButton.
     *
     * @param {string} [sId] id for the new control, generated automatically if no id is given
     * @param {object} [mSettings] initial settings for the new control
     * @class A button to be displayed in the application footer.
     *   Clicking the button opens a dialog box allowing the user to save the app state,
     *   so that the app can be launched in this state directly from the launchpad.
     * @extends sap.m.Button
     * @constructor
     * @public
     * @name sap.ushell.ui.footerbar.AddBookmarkButton
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     * @lends sap.ushell.ui.footerbar.AddBookmarkButton.prototype
     */
    var AddBookmarkButton = Button.extend("sap.ushell.ui.footerbar.AddBookmarkButton", {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * A callback function that is called before the save-as-tile dialog is opened.
                 */
                beforePressHandler: { type: "function", group: "Misc", defaultValue: null },

                /**
                 * A callback function that is called after the save-as-tile dialog is closed.
                 */
                afterPressHandler: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * Title to be displayed on the tile.
                 */
                title: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Subtitle to be displayed below the tile title.
                 */
                subtitle: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Text to be displayed at the bottom of the tile.
                 */
                info: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Icon to be desplied in the Tile.
                 */
                tileIcon: { type: "string", group: "Apperance", defaultValue: null },

                /**
                 * For dynamic tile, the unit to be displayed below the number, for example, USD.
                 */
                numberUnit: { type: "string", group: "Appearance", defaultValue: null },

                /**
                 * The keywords based on which the future tile should be indexed and filtered.
                 */
                keywords: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * A customized target URL for the tile.
                 */
                customUrl: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * URL of an OData service from which data for a dynamic tile should be read.
                 */
                serviceUrl: { type: "any", group: "Misc", defaultValue: null },

                /**
                 * Number of seconds after which dynamic content is read from the data source and the display is refreshed.
                 */
                serviceRefreshInterval: { type: "string", group: "Misc", defaultValue: null },

                /**
                 * Whether to display the control for group selection in the save-as-tile dialog in launchpad homepage mode.
                 */
                showGroupSelection: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * Whether to display the control for page selection in the save-bookmark dialog in launchpad spaces mode.
                 */
                showPageSelection: { type: "boolean", group: "Misc", defaultValue: true },

                /**
                 * An object containing properties with information about the app, e.g. serviceUrl, numberUnit, ... .
                 * @deprecated use dedicated properties above instead
                 */
                appData: { type: "object", group: "Misc", defaultValue: null }
            }
        }
    });

    AddBookmarkButton.prototype.init = function () {
        // call the parent sap.m.Button init method
        if (Button.prototype.init) {
            Button.prototype.init.apply(this, arguments);
        }

        this.setIcon("sap-icon://add-favorite");
        this.setText(resources.i18n.getText("addToHomePageBtn"));
        this.setEnabled(); // disables button if shell not initialized
        this.bSpaceEnabled = Config.last("/core/spaces/enabled");
        this.oModel = new JSONModel({
            showGroupSelection: true,
            showPageSelection: true,
            title: "",
            subtitle: "",
            numberValue: "",
            info: "",
            icon: "",
            numberUnit: "",
            keywords: ""
        });

        this.attachPress(function () {
            var fnBeforePressCallback = this.getBeforePressHandler();
            if (fnBeforePressCallback) {
                fnBeforePressCallback();
            }

            this.showAddBookmarkDialog();
        }.bind(this));
    };

    AddBookmarkButton.prototype.exit = function () {
        if (this.oDialog) {
            this.oDialog.destroy();
        }
        if (this.oModel) {
            this.oModel.destroy();
        }
        // call the parent sap.m.Button exit method
        if (Button.prototype.exit) {
            Button.prototype.exit.apply(this, arguments);
        }
    };

    AddBookmarkButton.prototype.setBookmarkTileView = function (oView) {
        this.bookmarkTileView = oView;
    };

    AddBookmarkButton.prototype.getBookmarkTileView = function () {
        return this.bookmarkTileView;
    };

    AddBookmarkButton.prototype.showAddBookmarkDialog = function () {
        // Create view for save bookmark dialog
        var oAppData = this.getAppData() || {},
            bIsAppDataEmpty = isEmptyObject(oAppData),
            oViewData = {
                appData: oAppData,
                serviceUrl: bIsAppDataEmpty ? this.getServiceUrl() : oAppData.serviceUrl,
                customUrl: bIsAppDataEmpty ? this.getCustomUrl() : oAppData.customUrl,
                numberUnit: bIsAppDataEmpty ? this.getNumberUnit() : oAppData.numberUnit,
                serviceRefreshInterval: bIsAppDataEmpty ? this.getServiceRefreshInterval() : oAppData.serviceRefreshInterval,
                keywords: bIsAppDataEmpty ? this.getKeywords() : oAppData.keywords
            },
            oSaveBookmarkView;

        if (this.bSpaceEnabled) {
            oSaveBookmarkView = sap.ui.view({
                type: ViewType.XML,
                viewName: "sap.ushell.ui.bookmark.SaveOnPage",
                viewData: oViewData
            });
            // On every change in the input verify if there is a text in the input - if so enable ok, otherwise disable
            oSaveBookmarkView.getController().byId("bookmarkTitleInput").attachLiveChange(function () {
                this.setValueState(ValueState.NONE);
            });
        } else {
            oSaveBookmarkView = sap.ui.view({
                type: ViewType.JS,
                viewName: "sap.ushell.ui.footerbar.SaveAsTile",
                viewData: oViewData
            });
            // On every change in the input verify if there is a text in the input - if so enable ok, otherwise disable
            oSaveBookmarkView.getTitleInput().attachLiveChange(function () {
                this.setValueState(ValueState.NONE);
            });
        }
        if (bIsAppDataEmpty) {
            oSaveBookmarkView.setModel(this.oModel);
        }


        if (oViewData.serviceUrl) {
            var oModel = oSaveBookmarkView.getModel();
            oModel.setProperty("/serviceUrl", oViewData.serviceUrl);
            oModel.setProperty("/numberValue", 0);
        }
        this.setBookmarkTileView(oSaveBookmarkView);

        // Wrap the dialogs view in a form and finally
        this.oSimpleForm = new SimpleForm({
            id: "bookmarkFormId",
            layout: SimpleFormLayout.ResponsiveGridLayout,
            content: [oSaveBookmarkView],
            editable: true
        }).addStyleClass("sapUshellAddBookmarkForm");

        // Open a modal dialog displaying the form with the save-on-page view inside
        this._openDialog(this.oSimpleForm);
    };

    AddBookmarkButton.prototype._openDialog = function (oContent) {
        // Create and open dialog
        this.oDialog = new Dialog({
            id: "bookmarkDialog",
            title: resources.i18n.getText("addToHomePageBtn"),
            contentWidth: "25rem",
            content: oContent,
            beginButton: new Button("bookmarkOkBtn", {
                text: resources.i18n.getText("okBtn"),
                type: ButtonType.Emphasized,
                press: [this._handleOKButtonPress, this]
            }),
            endButton: new Button("bookmarkCancelBtn", {
                text: resources.i18n.getText("cancelBtn"),
                press: [this._handleCancelButtonPress, this]
            }),
            stretch: Device.system.phone,
            horizontalScrolling: false,
            afterClose: function () {
                var fnAfterPressCallBack = this.getAfterPressHandler();
                if (fnAfterPressCallBack) {
                    fnAfterPressCallBack();
                }
                this._restoreDialogEditableValuesToDefault();
                this.oDialog.destroy();
                delete this.oDialog;
            }.bind(this)
        }).addStyleClass("sapContrastPlus");
        this.oDialog.open();

        return this.oDialog;
    };

    AddBookmarkButton.prototype._handleOKButtonPress = function () {
        if (this.bSpaceEnabled) {
            this._handleOKButtonPressSpacesMode();
        } else {
            this._handleOKButtonPressClassicMode();
        }
    };

    AddBookmarkButton.prototype._handleCancelButtonPress = function () {
        if (this.bSpaceEnabled) {
            this._handleCancelButtonPressSpacesMode();
        } else {
            this._handleCancelButtonPressClassicMode();
        }
    };

    AddBookmarkButton.prototype.setTitle = function (sTitle) {
        this.setProperty("title", sTitle, true);
        this.oModel.setProperty("/title", sTitle);
    };

    AddBookmarkButton.prototype.setSubtitle = function (sSubtitle) {
        this.setProperty("subtitle", sSubtitle, true);
        this.oModel.setProperty("/subtitle", sSubtitle);
    };

    AddBookmarkButton.prototype.setInfo = function (sInfo) {
        this.setProperty("info", sInfo, true);
        this.oModel.setProperty("/info", sInfo);
    };

    AddBookmarkButton.prototype.setTileIcon = function (sIcon) {
        this.setProperty("tileIcon", sIcon, true);
        this.oModel.setProperty("/icon", sIcon);
    };

    AddBookmarkButton.prototype.setShowGroupSelection = function (bShowGroupSelection) {
        this.setProperty("showGroupSelection", bShowGroupSelection, true);
        this.oModel.setProperty("/showGroupSelection", bShowGroupSelection);
    };

    AddBookmarkButton.prototype.setNumberUnit = function (sNumberUnit) {
        this.setProperty("numberUnit", sNumberUnit, true);
        this.oModel.setProperty("/numberUnit", sNumberUnit);
    };

    AddBookmarkButton.prototype.setKeywords = function (sKeywords) {
        this.setProperty("keywords", sKeywords, true);
        this.oModel.setProperty("/keywords", sKeywords);
    };

    AddBookmarkButton.prototype._restoreDialogEditableValuesToDefault = function () {
        if (this.oModel) {
            this.oModel.setProperty("/title", this.getTitle());
            this.oModel.setProperty("/subtitle", this.getSubtitle());
            this.oModel.setProperty("/info", this.getInfo());
        }
    };

    /**
     * A confimration message dialog is created and displayed, in case a title,
     * subtitle or description is provided.
     *
     * @private
     */
    AddBookmarkButton.prototype._handleCancelButtonPressSpacesMode = function () {
        var oBookmarkTileController = this.getBookmarkTileView().getController(),
            oBookmarkData = oBookmarkTileController.getBookmarkTileData();

        if (oBookmarkData.title || oBookmarkData.subtitle || oBookmarkData.info || oBookmarkData.pages.length) {
            var sDiscardAction = resources.i18n.getText("SaveAsTileDialog.MessageBox.Action.Discard"),
                sMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.Message.Discard"),
                sTitle = resources.i18n.getText("SaveAsTileDialog.MessageBox.Title.Discard");

            MessageBox.show(sMessage, {
                title: sTitle,
                actions: [
                    sDiscardAction,
                    MessageBox.Action.CANCEL
                ],
                emphasizedAction: sDiscardAction,
                onClose: function (sResult) {
                    if (sResult === sDiscardAction) {
                        this.oDialog.close();
                    }
                }.bind(this)
            });
        } else {
            this.oDialog.close();
        }
    };

    AddBookmarkButton.prototype._handleOKButtonPressSpacesMode = function () {
        var oBookmarkTileController = this.getBookmarkTileView().getController(),
            oBookmarkData = oBookmarkTileController.getBookmarkTileData(),
            bValid = true;

        if (oBookmarkData.pages.length === 0) {
            var oPageSelect = oBookmarkTileController.byId("pageSelect");
            if (oPageSelect) {
                oPageSelect.setValueState(ValueState.Error);
                oPageSelect.setValueStateText(resources.i18n.getText("bookmarkPageSelectError"));
                bValid = false;
            }
        }

        if (!oBookmarkData.title || oBookmarkData.title.length < 1) {
            var oTitle = oBookmarkTileController.byId("bookmarkTitleInput");
            if (oTitle) {
                oTitle.setValueState(ValueState.Error);
                oTitle.setValueStateText(resources.i18n.getText("bookmarkTitleInputError"));
                bValid = false;
            }
        }

        if (!bValid) {
            return;
        }

        this.oDialog.setBusy(true);

        var aBookmarkPages = oBookmarkData.pages;
        delete oBookmarkData.pages;

        var aAddToPagePromises = aBookmarkPages.map(function (sPageId) {
            return sap.ushell.Container.getService("Bookmark").addBookmarkToPage(oBookmarkData, sPageId)
                .then(function () {
                    return {
                        pageId: sPageId,
                        status: "resolved"
                    };
                })
                .catch(function (sMsg) {
                    Log.error("Failed to add one a bookmark: ", sMsg, "sap.ushell.ui.footerbar.AddBookmarkButton");
                    return Promise.resolve({
                        pageId: sPageId,
                        error: sMsg,
                        status: "failed"
                    }); // This has to resolve aswell, so that the Promise.all waits for all Promises
                });
        });

        Promise.all(aAddToPagePromises).then(function (aResults) {
            var oMessageService = sap.ushell.Container.getService("Message"),
                iSuccess = aResults.filter(function (oResult) {
                    return oResult.status === "resolved";
                }).length,
                aFailed = aResults.filter(function (oResult) {
                    return oResult.status === "failed";
                });

            if (iSuccess === 1) {
                oMessageService.info(resources.i18n.getText("SaveAsTileDialog.MessageToast.TileCreatedInPage"));
            } else if (iSuccess > 1) {
                oMessageService.info(resources.i18n.getText("SaveAsTileDialog.MessageToast.TileCreatedInPages"));
            }

            if (aFailed.length) {
                this._showErrorDialog(aFailed, iSuccess, oBookmarkData.title);
            }

            this.oDialog.setBusy(false);
            this.oDialog.close();
        }.bind(this));
    };

    /**
     * Creates and displays an error dialog that adjusts its content to the given parameters.
     *
     * @param {object[]} failedBookmarks The failed bookmarks
     * @param {int} nrOfSuccessfulBookmarks Number of successfully creatd bookmarks
     * @param {string} bookmarkTitle The title of the bookmark tile
     *
     * @private
     */
    AddBookmarkButton.prototype._showErrorDialog = function (failedBookmarks, nrOfSuccessfulBookmarks, bookmarkTitle) {
        var sErrorMessage,
            sDetailMessage;

        if (failedBookmarks.length === 1) {
            if (nrOfSuccessfulBookmarks === 0) {
                sErrorMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.SinglePageError");
            } else {
                sErrorMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.OnePageError");
            }
            sDetailMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.PageErrorDetail",
                [bookmarkTitle, failedBookmarks[0].pageId]);
        } else if (failedBookmarks.length > 1) {
            if (nrOfSuccessfulBookmarks === 0) {
                sErrorMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.AllPagesError");
            } else {
                sErrorMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.SomePagesError");
            }
            var sPageIds = failedBookmarks.map(function (oFailedPage) {
                return oFailedPage.pageId;
            }).join("\n");
            sDetailMessage = resources.i18n.getText("SaveAsTileDialog.MessageBox.PagesErrorDetail", [bookmarkTitle, sPageIds]);
        }

        var oDetailsBox = new VBox({
            items: [
                new Text({
                    text: sDetailMessage
                }).addStyleClass("sapUiSmallMarginBottom"),
                new Text({
                    text: failedBookmarks.map(function (oFailedPage) {
                        return oFailedPage.error;
                    }).join("\n")
                }).addStyleClass("sapUiSmallMarginBottom"),
                new Text({
                    text: resources.i18n.getText("SaveAsTileDialog.MessageBox.PageErrorSolution")
                })
            ]
        });

        sap.ushell.Container.getService("Message").errorWithDetails(sErrorMessage, oDetailsBox);
    };

    AddBookmarkButton.prototype._handleCancelButtonPressClassicMode = function () {
        this.oDialog.close();
    };

    AddBookmarkButton.prototype._handleOKButtonPressClassicMode = function () {
        var bookmarkTileView = this.getBookmarkTileView(),
            oBookmarkData = bookmarkTileView.getBookmarkTileData();

        if (!oBookmarkData.title || oBookmarkData.title.length < 1) {
            var oTitle = bookmarkTileView.getTitleInput();
            if (oTitle) {
                oTitle.setValueState(ValueState.Error);
                oTitle.setValueStateText(resources.i18n.getText("bookmarkTitleInputError"));
                return;
            }
        }
        this.oDialog.setBusy(true);

        var tileGroup = oBookmarkData.group ? oBookmarkData.group.object : "";
        delete oBookmarkData.group;

        sap.ushell.Container.getService("Bookmark").addBookmark(oBookmarkData, tileGroup)
            .done(function () {
                sap.ushell.Container.getService("Message").info(resources.i18n.getText("tile_created_msg"));
            })
            .fail(function (sMsg) {
                Log.error("Failed to add bookmark", sMsg, "sap.ushell.ui.footerbar.AddBookmarkButton");
                sap.ushell.Container.getService("Message").error(resources.i18n.getText("fail_to_add_tile_msg"));
            })
            .always(function () {
                this.oDialog.setBusy(false);
                this.oDialog.close();
            }.bind(this));
    };

    AddBookmarkButton.prototype.setEnabled = function (bEnabled) {
        var sState = "",
            bPersonalization = true,
            oShellConfiguration;
        if (sap.ushell.renderers && sap.ushell.renderers.fiori2) {
            oShellConfiguration = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration();
            if (oShellConfiguration.appState) {
                sState = oShellConfiguration.appState;
            }
            if (oShellConfiguration.enablePersonalization !== undefined) {
                bPersonalization = oShellConfiguration.enablePersonalization;
            }
        }
        if (sState === "headerless" || sState === "standalone" || sState === "embedded" || sState === "merged" || !bPersonalization) {
            bEnabled = false;
        }
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                Log.warning(
                    "Disabling 'Save as Tile' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.AddBookmarkButton"
                );
            }
            bEnabled = false;
        }
        Button.prototype.setEnabled.call(this, bEnabled);
        if (!bEnabled) {
            this.addStyleClass("sapUshellAddBookmarkButton");
        }
    };

    return AddBookmarkButton;
});
