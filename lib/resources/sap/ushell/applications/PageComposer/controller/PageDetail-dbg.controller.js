// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "./BaseController",
    "./ConfirmChangesDialog.controller",
    "./Page",
    "./TileSelector",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ui/core/Fragment",
    "sap/base/Log",
    "sap/ui/core/library",
    "sap/ui/core/MessageType",
    "sap/ushell/utils",
    "sap/ui/core/BusyIndicator",
    "sap/m/ButtonType",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ushell/resources",
    "sap/ushell/services/Container" // required for "sap.ushell.Container.getServiceAsync()"
], function (
    BaseController,
    ConfirmChangesDialog,
    Page,
    TileSelector,
    JSONModel,
    MessageBox,
    MessageToast,
    MessagePopover,
    MessageItem,
    Fragment,
    Log,
    coreLibrary,
    MessageType,
    oUshellUtils,
    BusyIndicator,
    ButtonType,
    Filter,
    FilterOperator,
    ushellResources
    // Container
) {
    "use strict";

    return BaseController.extend("sap.ushell.applications.PageComposer.controller.PageDetail", {
        Page: Page,
        TileSelector: new TileSelector(),

        /**
         * Called when controller is initialized.
         *
         * @private
         */
        onInit: function () {
            oUshellUtils.setPerformanceMark("FLPPage-manage.startDetailInitialization", { bUseUniqueMark: true });
            this.setModel(new JSONModel());
            this._oAssignedSpacesTable = this.byId("spaceAssignmentTable");
            this.getRouter().getRoute("view").attachPatternMatched(this._onPageMatched, this);
            this.getView().setBusyIndicatorDelay(0);
            this.Page.init(this);
        },

        /**
         * Sets the "currentBreakpointIsS" property to hide the "toggleCatalogsButton" when the
         * TileSelector has not enough space to be rendered.
         *
         * @param {sap.ui.base.Event} [event] The breakpoint change event. If not provided, refreshes current breakpoint.
         * @protected
         */
        onBreakpointChanged: function (event) {
            var bCurrentBreakpointIsS;
            if (typeof event !== "undefined") {
                bCurrentBreakpointIsS = (event.getParameters().currentBreakpoint === "S");
                this.getModel().setProperty("/currentBreakpointIsS", bCurrentBreakpointIsS);
            } else {
                bCurrentBreakpointIsS = this.getModel().getProperty("/currentBreakpointIsS");
            }
            this.TileSelector.setEnableDnD(!bCurrentBreakpointIsS);
            this.TileSelector.showSwitchViewButton(bCurrentBreakpointIsS);
        },

        /**
         * Listener of the tab change.
         *
         * @param {sap.ui.base.Event} oEvent The tab change event
         * @protected
         */
        onTabChange: function (oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedKey");
            if (sSelectedKey === "iconTabBarSpaceAssignment") {
                this._initSpaceAssignment(this.getModel().getProperty("/page/id"));
            }
        },

        /**
         * Convenience function to set the dirty flag of the ushell container.
         *
         * @param {boolean} bValue Value to set the dirty flag to.
         * @private
         */
        _setDirtyFlag: function (bValue) {
            sap.ushell.Container.setDirtyFlag(bValue);
        },

        /**
         * Called when page detail view is exited.
         *
         * @private
         */
        onExit: function () {
            BaseController.prototype.onExit.apply(this, arguments);
            if (this.oMessagePopover) {
                this.oMessagePopover.destroy();
                delete this.oMessagePopover;
            }
            this.Page.exit();
        },

        /**
         * Handles the message popover press in the footer bar.
         *
         * @param {sap.ui.base.Event} oEvent The press event.
         * @private
         */
        handleMessagePopoverPress: function (oEvent) {
            if (!this.oMessagePopover) {
                this.oMessagePopover = new MessagePopover("messagePopover", {
                    items: {
                        path: "/messages",
                        template: new MessageItem({
                            type: "{type}",
                            title: "{title}",
                            activeTitle: "{active}",
                            description: "{description}",
                            subtitle: "{subTitle}",
                            counter: "{counter}"
                        })
                    }
                }).setModel(this.getModel());
            }
            this.oMessagePopover.toggle(oEvent.getSource());
        },

        /**
         * Press handler for toggleCatalogsButton.
         * When the breakpoint is "S", switches between the Page and the TileSelector.
         * In other cases, show or hide the TileSelector.
         *
         * @protected
         */
        onToggleCatalogsButtonPress: function () {
            var oModel = this.getModel();
            if (oModel.getProperty("/currentBreakpointIsS")) {
                this.switchDynamicSideContentView();
            } else {
                this.onUpdateSideContentVisibility();
            }
        },

        /**
         * Called if the show/hide catalogs button is called.
         * Used to show or hide the side content.
         *
         * @private
         */
        onUpdateSideContentVisibility: function () {
            this.getModel().setProperty("/catalogsExpanded", !this.getModel().getProperty("/catalogsExpanded"));
        },

        /**
         * Called to switch between main and side contents of the pageContent
         * Used only when breakpoint is "S"
         *
         * @private
         */
        switchDynamicSideContentView: function () {
            this.getView().byId("pageContent").toggle();
        },

        /**
         * Handles error messages retrieved when trying to save a page.
         * It either opens the ConfirmChangesDialog or shows a MessageBoxError.
         * Additionally, it sets the dirty flag to true
         *
         * @param {object} simpleError An object containing error information.
         * @property {string} simpleError.message The error message.
         * @property {int} simpleError.statusCode The status code.
         * @property {string} simpleError.statusText The status text.
         * @param {string} [modifiedBy=undefined] The name of the person who modified the page last.
         *   If not given, the name from the page model will be read out and used.
         * @private
         */
        _handlePageSaveError: function (simpleError, modifiedBy) {
            if (simpleError.statusCode === "412" || simpleError.statusCode === "400") {
                this._showConfirmChangesDialog(simpleError, modifiedBy);
            } else {
                this.showMessageBoxError(simpleError.message, false);
            }
            this._setDirtyFlag(true);
        },

        /**
         * Convenience method to reset the local default model.
         *
         * @private
         */
        _resetModelData: function () {
            this.getModel().setProperty("/", {
                page: {},
                editMode: !!this.oSettingsModel.getProperty("/editMode"),
                errors: [],
                warnings: [],
                messages: [],
                pageInfoErrors: [],
                catalogsExpanded: true,
                currentBreakpointIsS: this.getView().byId("pageContent").getCurrentBreakpoint() === "S"
            });
        },

        /**
         * Called if the route matched the pattern for viewing a page.
         * Loads the page with the id given in the URL parameter.
         *
         * @param {sap.ui.base.Event} event The routing event
         * @private
         */
        _onPageMatched: function (event) {
            var oArguments = event.getParameter("arguments");
            this.sPageID = decodeURIComponent(oArguments.pageId);
            this.oSettingsModel = this.getOwnerComponent().getModel("settings");
            this.setTitle(this.getResourceBundle().getText("PageDetails.Title"));
            this.getView().byId("iconTabBar").setSelectedKey("iconTabBarPageContent");
            this._resetModelData();
            this._resetRolesModel();
            this._deeplinkAccess = this.oSettingsModel.getProperty("/deepLink");
            // set the "/deepLink" flag to true here to prevent users from entering a SAP-delivered page by
            // manually changing the URL, in which case the flag would still be false.
            this.oSettingsModel.setProperty("/deepLink", true);
            this.oTransportComponentPromise = this.getOwnerComponent().createTransportComponent();
            this._enhanceTabBarWithTransports();
            this._loadPage(this.navigateBack.bind(this));
        },

        /**
         * Load the Page from the PagePersistence.
         * This method can be called whenever the whole Page should be completely refreshed.
         *
         * @param {function} [onCancel] Function called if the transport dialog is cancelled
         * @returns {Promise<object>} A promise resolving to the loaded Page data.
         * @private
         */
        _loadPage: function (onCancel) {
            oUshellUtils.setPerformanceMark("FLPPage-manage.startLoadPageDetail");
            var oPagePersistence = this.getPageRepository();
            this.getView().setBusy(true);
            this._setDirtyFlag(false);
            return Promise.all([
                sap.ushell.Container.getServiceAsync("VisualizationLoading"),
                this.oTransportComponentPromise,
                oPagePersistence.getPage(this.sPageID),
                oPagePersistence.getRoles(this.sPageID)
            ])
                .then(function (aPromiseResults) {
                    this.oVisualizationLoadingService = aPromiseResults[0];
                    var oTransportComponent = aPromiseResults[1];
                    var oPageData = aPromiseResults[2];
                    var aPageRoles = aPromiseResults[3];
                    this._resetRolesModel({ available: aPageRoles.map(function (oPageRole) { return oPageRole.id; }) });
                    this._setSupportedOperationModel(oPageData);
                    if (!this._pageDisplayAllowed(oPageData)) {
                        this.navigateToUnsupportedPage(oPageData.id);
                        return Promise.resolve();
                    }
                    if (!this.getModel().getProperty("/editMode")) {
                        this.getModel().setProperty("/page", oPageData);
                        if (oTransportComponent.setShowAssignButton) {
                            oTransportComponent.setShowAssignButton(false); // hide the "Add" transport button on the "Transports" tab
                        }
                        return Promise.resolve(oPageData);
                    }
                    return this._tryEnablingEditMode(oPageData, oTransportComponent, onCancel);
                }.bind(this))
                .finally(function () {
                    var oPage = this.getView().byId("page");
                    var oOnAfterRenderingDelegate = {
                        onAfterRendering: function () {
                            oUshellUtils.setPerformanceMark("FLPPage-manage.PageDetailCompletelyLoaded");
                            oPage.removeEventDelegate(oOnAfterRenderingDelegate);
                        }
                    };
                    oPage.addEventDelegate(oOnAfterRenderingDelegate);
                    this.getView().setBusy(false);
                    oUshellUtils.setPerformanceMark("FLPPage-manage.endLoadPageDetail");
                }.bind(this))
                .catch(function (oError) {
                    Log.error(oError);
                    this.navigateToErrorPage(this.sPageID);
                }.bind(this));
        },

        /**
         * Tries to enable "edit" mode. In case Page edit is not allowed, reverts back to "view" mode.
         *
         * @param {object} oPageData The Page data as received from the {@link #_loadPage} method.
         * @param {sap.ui.core.Component} oTransportComponent The TransportComponent as received from the {@link #_loadPage} method.
         * @param {function} [onCancel] Function called if the transport dialog is cancelled
         * @returns {Promise<object>} A Promise resolving to the loaded Page data.
         * @private
         */
        _tryEnablingEditMode: function (oPageData, oTransportComponent, onCancel) {
            return this._pageEditAllowed(oPageData).then(function (bEditAllowed) {
                this.getModel().setProperty("/page", oPageData);
                if (!bEditAllowed) {
                    this.getModel().setProperty("/editMode", false);
                    if (oTransportComponent.setShowAssignButton) {
                        oTransportComponent.setShowAssignButton(false); // hide the "Add" transport button on the "Transports" tab
                    }
                } else {
                    this.checkShowEditDialog(oPageData, this._updatePageWithMetadata.bind(this), onCancel);
                    this._loadTileSelector();
                    if (oTransportComponent.setShowAssignButton) {
                        oTransportComponent.setShowAssignButton(true); // show the "Add" transport button on the "Transports" tab
                    }
                    if (!this.getModel().getProperty("/page/sections").length) {
                        this.Page.addSection(); // already calls "_collectMessages"
                    } else {
                        this._collectMessages();
                    }
                }
                return Promise.resolve(oPageData);
            }.bind(this));
        },

        /**
         * Loads the TileSelector.
         *
         * @returns {Promise<undefined>} A Promise resolving when the TileSelector is fully loaded.
         * @private
         */
        _loadTileSelector: function () {
            oUshellUtils.setPerformanceMark("FLPPage-manage.startLoadTileSelector");
            this.TileSelector.init(this);
            this.onBreakpointChanged();
            return this.TileSelector.initTiles().then(function () {
                this.TileSelector.setAddTileHandler(this.addVisualizationInSection.bind(this));
                oUshellUtils.setPerformanceMark("FLPPage-manage.endLoadTileSelector");
            }.bind(this));
        },

        /**
         * Enhances the IconTabBar with a Tab for transports
         *
         * @private
         */
        _enhanceTabBarWithTransports: function () {
            this.oTransportComponentPromise.then(function (oTransport) {
                if (oTransport.setIconTabBar) {
                    oTransport.setIconTabBar(this.getView().byId("iconTabBar"), this.sPageID, "Page");
                }
                if (oTransport.attachAssign && !oTransport.hasListeners("assign")) {
                    oTransport.attachAssign(this.onAssignTransport, this);
                }
            }.bind(this));
        },

        /**
         * @param {sap.ui.base.Event} event The assign event of the transport component
         */
        onAssignTransport: function (event) {
            var sTransportId = event.getParameter("transportId");
            this._enhanceModelWithTransportId(sTransportId);
        },

        /**
         * Updates the model with transportID
         *
         * @param {string} sTransportId The ID of the transport
         * @private
         */
        _enhanceModelWithTransportId: function (sTransportId) {
            var oResourceBundle = this.getResourceBundle();
            var oPageData = this.getModel().getProperty("/page");
            oPageData.transportId = sTransportId;
            this.savePageAndUpdateModel(oPageData)
                .then(function () {
                    MessageToast.show(oResourceBundle.getText("Message.SavedChanges"), { closeOnBrowserNavigation: false });
                    this._setDirtyFlag(false);
                }.bind(this))
                .catch(function (oSimpleError) {
                    this.getPageRepository().getPageWithoutStoringETag(this.sPageID)
                        .then(function (oReloadedPage) {
                            this._handlePageSaveError(oSimpleError, oReloadedPage.modifiedByFullname || oReloadedPage.modifiedBy);
                        }.bind(this))
                        .catch(function () {
                            this._handlePageSaveError(oSimpleError);
                        }.bind(this));
                }.bind(this))
                .finally(function () {
                    this.getView().setBusy(false);
                }.bind(this));
        },

        /**
         * Intended to be called by the view for handling "open tile info" events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @protected
         */
        onOpenTileInfo: function (oEvent) {
            var oEventSource = oEvent.getSource();
            this._openTileInfoPopover(oEventSource, oEventSource.getBindingContext());
        },

        /**
         * Set the new transportId to the page object
         *
         * @param {sap.ui.base.Event} event The object containing the metadata
         * @private
         */
        _updatePageWithMetadata: function (event) {
            if (event.transportId) {
                this.getModel().setProperty("/page/transportId", event.transportId);
                this._setDirtyFlag(true);
            }
            var oDialog = event.getSource().getParent();
            oDialog.close();
        },

        /**
         * Called if the delete action has been confirmed
         *
         * @param {sap.ui.base.Event} oEvent The deletePage event
         * @returns {Promise<undefined>} A promise resolving when the page has been deleted
         * @private
         */
        _deletePage: function (oEvent) {
            var oDialog = oEvent.getSource().getParent(),
                sTransportId = oEvent.transportId || "",
                sSuccessMsg = this.getResourceBundle().getText("Message.SuccessDeletePage");

            BusyIndicator.show(0);
            return this.getPageRepository().deletePage(this.sPageID, sTransportId)
                .then(function () {
                    this.navigateBack();
                    MessageToast.show(sSuccessMsg, { closeOnBrowserNavigation: false });
                    oDialog.close();
                }.bind(this))
                .catch(this.handleBackendError.bind(this))
                .finally(function () { BusyIndicator.hide(); });
        },

        /**
         * Called if the Edit button is clicked. Initializes edit mode.
         *
         * @private
         */
        onEdit: function () {
            this.getModel().setProperty("/editMode", true);
            this._loadPage(this.discardChangesAndCancel.bind(this));
        },

        /**
         * Called if the save button is pressed.
         * MessageToast will confirm that the changes have been successfully saved
         *
         * @private
         */
        onSave: function () {
            var oPageData = this.getModel().getProperty("/page");
            var oResourceBundle = this.getResourceBundle();
            var fnSave = function (sClickedAction) {
                if (sClickedAction === MessageBox.Action.OK) {
                    this.getView().setBusy(true);
                    this.getModel().setProperty("/editMode", false);
                    this.savePageAndUpdateModel(oPageData)
                        .then(function () {
                            MessageToast.show(oResourceBundle.getText("Message.SavedChanges"), { closeOnBrowserNavigation: false });
                            this._setDirtyFlag(false);
                        }.bind(this))
                        .catch(function (oSimpleError) {
                            this.getPageRepository().getPageWithoutStoringETag(oPageData.id)
                                .then(function (reloadedPage) {
                                    this._handlePageSaveError(oSimpleError, reloadedPage.modifiedByFullname || reloadedPage.modifiedBy);
                                }.bind(this))
                                .catch(function () {
                                    this._handlePageSaveError(oSimpleError);
                                }.bind(this));
                        }.bind(this))
                        .finally(function () {
                            this.getView().setBusy(false);
                        }.bind(this));
                }
            }.bind(this);

            if (!oPageData.title) {
                this.showMessageBoxError(oResourceBundle.getText("Message.EmptyTitle"));
                return;
            }
            if (!window.navigator.onLine) {
                this.showMessageBoxError(oResourceBundle.getText("Message.NoInternetConnection"));
                return;
            }

            // for error messages, we use the "Message" service to allow the "Contact Support" option in the message box.
            if (this.getModel().getProperty("/errors").length > 0) {
                sap.ushell.Container.getServiceAsync("Message").then(function (oMsgService) {
                    var sMessage = oResourceBundle.getText("Message.PageHasErrors"),
                        sTitle = oResourceBundle.getText("Title.PageHasErrors");

                    oMsgService.error(sMessage, sTitle);
                });
                return;
            }

            if (this.getModel().getProperty("/warnings").length > 0) {
                MessageBox.confirm(oResourceBundle.getText("Message.PageHasWarnings"), {
                    icon: MessageBox.Icon.WARNING,
                    title: oResourceBundle.getText("Title.PageHasWarnings"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    initialFocus: MessageBox.Action.NO,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            fnSave(MessageBox.Action.OK);
                        }
                    }
                });
                return;
            }

            fnSave(MessageBox.Action.OK);
        },

        /**
         * Called when the cancel button in edit mode gets pressed.
         * - Sets the "editMode" property to "false".
         * - Creates (if not already created) and opens the "DiscardChangesPopover".
         *
         * @param {sap.ui.base.Event} event The button press event.
         * @private
         */
        onCancel: function (event) {
            if (!sap.ushell.Container.getDirtyFlag()) {
                this.discardChangesAndCancel();
                return;
            }
            var oButton = event.getSource();
            if (!this._oPopover) {
                Fragment.load({
                    id: this.createId("discardChangesFragment"),
                    name: "sap.ushell.applications.PageComposer.view.DiscardChangesPopover",
                    type: "XML",
                    controller: this
                }).then(function (oPopover) {
                    this._oPopover = oPopover;
                    this.getView().addDependent(this._oPopover);
                    this._oPopover.openBy(oButton);
                }.bind(this));
            } else {
                this._oPopover.openBy(oButton);
            }
        },

        /**
         * Cancel editing.
         * - Discards all changes (if there are any) on the page.
         * - Closes the "DiscardChangesPopover" if it is open.
         *
         * @private
         */
        discardChangesAndCancel: function () {
            this._reloadPageInfoValueStates();
            this.getModel().setProperty("/editMode", false);
            this._loadPage();
        },

        /**
         * Reloads the value states of the page info input fields.
         *
         * @private
         */
        _reloadPageInfoValueStates: function () {
            this._getPageDescriptionError();
            this._getPageTitleError();
        },

        /**
         * Called if the delete button is clicked. Shows the Delete Dialog.
         *
         * @private
         */
        onDelete: function () {
            var oPageData = this.getModel().getProperty("/page");
            this.checkShowDeleteDialog(oPageData, this._deletePage.bind(this));
        },

        /**
         * Called if the copy button is clicked
         * Copies the page and redirects to the new copy
         *
         * @private
         */
        onCopy: function () {
            var oPageData = this.getModel().getProperty("/page");
            this.showCopyDialog(oPageData, function (oEvent) {
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
                        return this.getPageRepository().copyPage(oReferencePage);
                    }.bind(this))
                    .then(function () {
                        this.navigateToEdit(oPageInfo.targetId);
                        MessageToast.show(this.getResourceBundle().getText("Message.PageCreated"), { closeOnBrowserNavigation: false });
                        oDialog.close();
                    }.bind(this))
                    .catch(this.handleBackendError.bind(this))
                    .finally(function () { BusyIndicator.hide(); });
            }.bind(this));
        },

        /**
         * Called when the error message icon is clicked to display more detailed error message.
         *
         * @private
         */
        onErrorMessageClicked: function () {
            var oPageData = this.getModel().getProperty("/page");
            var sErrorMessageDetails = this.formatAssignmentDetailsMessage(oPageData.code);
            this.showMessageBoxWarning(oPageData.message, sErrorMessageDetails, false);
        },

        /**
         * Opens the confirm changes dialog in case it already exists and creates it if it doesn't.
         *
         * @param {object} oSimpleError The error that occurred during page save.
         * @param {string} [sModifiedByName] The name of the person that last modified the page.
         *   If undefined, it will be fetched from the local model.
         * @private
         */
        _showConfirmChangesDialog: function (oSimpleError, sModifiedByName) {
            if (!this.byId("confirmChangesDialog")) {
                Fragment.load({
                    name: "sap.ushell.applications.PageComposer.view.ConfirmChangesDialog",
                    controller: new ConfirmChangesDialog(this.getView(), this.getResourceBundle())
                }).then(function (oDialog) {
                    if (oSimpleError.statusCode === "412") {
                        var oConfirmChangesModifiedByText = sap.ui.getCore().byId("confirmChangesModifiedByText");
                        oConfirmChangesModifiedByText.setVisible(true);
                    }
                    var sModifiedBy = sModifiedByName || this.getModel().getProperty("/page/modifiedByFullname");
                    this.getModel().setProperty("/simpleError", {
                        message: oSimpleError.message,
                        statusCode: oSimpleError.statusCode,
                        modifiedBy: sModifiedBy
                    });
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this.byId("confirmChangesDialog").open();
            }
        },

        /**
         * Formatter used for extracting the "length" property of an object.
         *
         * @param {object} object The object to have its "length" property retrieved from.
         * @returns {*} The "length" property of the object parameter or "undefined" if the object is falsy.
         * @private
         */
        _formatLength: function (object) {
            return (object ? object.length : undefined);
        },

        /**
         * Checks if the user is allowed to edit the page.
         *
         * @param {object} page The page to edit.
         * @returns {Promise<boolean>} A promise which resolves to true/false depending on if editing is allowed for the user.
         * @private
         */
        _pageEditAllowed: function (page) {
            var bEditAllowed = !this.checkMasterLanguageMismatch(page);
            return Promise.resolve(bEditAllowed);
        },

        /**
         * Checks if the user is allowed to display the page.
         *
         * @param {object} page The page to display.
         * @return {boolean} True if the page can be displayed.
         * @private
         */
        _pageDisplayAllowed: function (page) {
            return !page.isTemplate || !this._deeplinkAccess;
        },

        /**
         * Saves the Page in the backend and then refreshes the data of the "Page Detail" view.
         * Refreshing the data allows access to the most recent Page information, which is relevant for example
         * for updating the displayed "Changed By" and "Changed On" properties without having to reload.
         *
         * @param {object} page The Page data to be saved.
         * @returns {Promise<undefined>} A promise that resolves when the Page is saved.
         * @private
         */
        savePageAndUpdateModel: function (page) {
            return this.getPageRepository().updatePage(page).then(function (oResponsePageData) {
                this.sPageID = oResponsePageData.id; // in case the backend returns a new ID for the saved Page
                this.getModel().setProperty("/page", oResponsePageData);
            }.bind(this));
        },

        /**
         * Collects errors and warnings that occurred on the page and its metadata and sets the button type of the messages button.
         *
         * @private
         */
        _collectMessages: function () {
            var aPageInfoErrors = this._validatePageInfoAndGetErrors();
            this.getModel().setProperty("/pageInfoErrors", aPageInfoErrors);

            var oMessages = this.Page.collectMessages(),
                aErrors = oMessages.errors.concat(this._getPageInfoErrors()),
                aWarnings = oMessages.warnings,
                aInfos = oMessages.infos.concat(this._getPageAssignmentMessages()),
                aMessages = aErrors.concat(aWarnings, aInfos);
            this.getModel().setProperty("/errors", aErrors);
            this.getModel().setProperty("/warnings", aWarnings);
            this.getModel().setProperty("/infos", aInfos);
            this.getModel().setProperty("/messages", aMessages);

            var oMessageButton = this.getView().byId("buttonValidation");
            if (aErrors.length) {
                oMessageButton.setType(ButtonType.Negative);
            } else if (aWarnings.length) {
                oMessageButton.setType(ButtonType.Critical);
            } else {
                oMessageButton.setType(ButtonType.Neutral);
            }
        },

        /**
         * Reads out the assignment status of the current page and returns an array of information messages.
         *
         * @returns {object[]} An array of Information MessageType objects used for the message popover.
         * @private
         */
        _getPageAssignmentMessages: function () {
            var oPageData = this.getModel().getProperty("/page"),
                sMissingAssignment = this.getPageRepository().getMissingAssignment(oPageData.code),
                aInfos = [],
                oResources = this.getResourceBundle();

            if (sMissingAssignment === "role") {
                aInfos.push({
                    type: MessageType.Information,
                    title: oResources.getText("Message.NotAssignedToRoleInformation"),
                    description: oResources.getText("Message.NotAssignedToRoleInformationDetails")
                });
            } else if (sMissingAssignment === "space") {
                aInfos.push({
                    type: MessageType.Information,
                    title: oResources.getText("Message.NotAssignedToSpaceInformation"),
                    description: oResources.getText("Message.NotAssignedToSpaceInformationDetails")
                });
            }
            return aInfos;
        },

        /**
         * Checks if the page has error messages.
         * Shows error message box when the page has errors and navigates to page overview.
         *
         * @param {object} oPage The page to check
         * @return {boolean} The result - true if there are errors, false if there is none
         * @private
         */
        _checkPageHasErrors: function (oPage) {
            if (oPage.code !== "") {
                var sErrorMessageDetails = this.formatAssignmentDetailsMessage(oPage.code);
                this.showMessageBoxWarning(oPage.message, sErrorMessageDetails, true);
                return true;
            }
            return false;
        },

        /**
         * On section title is changed.
         *
         * @private
         */
        onSectionTitleChange: function () {
            this._collectMessages();
            this._setDirtyFlag(true);
        },

        /**
         * Shows the ContextSelector dialog.
         *
         * @param {function} onConfirm The function executed when confirming the selection.
         * @protected
         */
        showContextSelector: function (onConfirm) {
            sap.ui.require([
                "sap/ushell/applications/PageComposer/controller/ContextSelector.controller"
            ], function (ContextSelector) {
                if (!this.oContextSelectorController) {
                    this.oContextSelectorController = new ContextSelector(this.getRootView(), this.getResourceBundle());
                }
                var aSelectedRoles = this.getModel("roles").getProperty("/selected");
                this.oContextSelectorController.openSelector(this.sPageID, aSelectedRoles, onConfirm)
                    .catch(function (error) {
                        this.oContextSelectorController.destroy();
                        this.handleBackendError(error);
                    }.bind(this));
            }.bind(this));
        },

        /**
         * Opens a dialog to select the role context for the page/space.
         *
         * @private
         */
        onOpenContextSelector: function () {
            this.showContextSelector(function (oSelectedRolesInfo) {
                this._resetRolesModel(oSelectedRolesInfo);
                this._collectMessages();
                this.TileSelector.refreshRoleContext();
            }.bind(this));
        },

        /**
         * Helper function to delegate focus triggering on a control.
         * The attached focus "eventDelegate" is removed after triggering.
         *
         * @param {sap.ui.core.Control} oFocusControl The control to be focused.
         * @private
         */
        _delegateFocus: function (oFocusControl) {
            var oFocusDelegate = {
                onAfterRendering: function () {
                    setTimeout(function () {
                        oFocusControl.focus();
                        oFocusControl.removeEventDelegate(oFocusDelegate);
                    }, 0);
                }
            };
            oFocusControl.focus(); // some controls must be focused right away
            oFocusControl.addEventDelegate(oFocusDelegate);
        },

        // -------------------
        // Section - Model API
        // -------------------

        /**
         * Adds a section to the model at the given index.
         *
         * @param {int} sectionIndex The index of where to add the section in the array
         * @protected
         */
        addSectionAt: function (sectionIndex) {
            var aSectionsData = this.getModel().getProperty("/page/sections");
            if (!aSectionsData) {
                Log.warning("The Model is not ready yet.");
                return;
            }

            if ((!sectionIndex && sectionIndex !== 0) || sectionIndex > aSectionsData.length) {
                sectionIndex = aSectionsData.length;
            }
            aSectionsData.splice(sectionIndex, 0, { title: "", viz: [] });
            this.getModel().setProperty("/page/sections", aSectionsData);

            var oPage = this.getView().byId("page");
            this._delegateFocus(oPage.getSections()[sectionIndex].byId("title-edit"));

            this._collectMessages();
            this._setDirtyFlag(true);
        },

        /**
         * Deletes a Section from its Page.
         *
         * @param {int} sectionIndex The index of the section, that should be deleted
         * @protected
         */
        deleteSection: function (sectionIndex) {
            if ((!sectionIndex && sectionIndex !== 0) || sectionIndex < 0) {
                return;
            }

            var aSectionsData = this.getModel().getProperty("/page/sections");
            if (sectionIndex < aSectionsData.length) {
                aSectionsData.splice(sectionIndex, 1);
                this.getModel().setProperty("/page/sections", aSectionsData);
                MessageToast.show(this.getResourceBundle().getText("Message.SectionDeleted"));

                var oPage = this.getView().byId("page"),
                    aSections = oPage.getSections();
                if (aSections.length) {
                    if (sectionIndex > (aSections.length - 1)) {
                        aSections[aSections.length - 1].focus(); // focus previous Section (last Section deleted)
                    } else {
                        aSections[sectionIndex].focus(); // keep index, focus next Section
                    }
                } else {
                    this._delegateFocus(oPage);
                }

                this._collectMessages();
                this._setDirtyFlag(true);
            }
        },

        /**
         * Handles the moving of a section using and updating the model.
         *
         * @param {int} originalSectionIndex The old index of the section, that should be moved
         * @param {int} newSectionIndex The new index of the section, that should be moved
         * @protected
         */
        moveSection: function (originalSectionIndex, newSectionIndex) {
            if (!originalSectionIndex && originalSectionIndex !== 0
                || !newSectionIndex && newSectionIndex !== 0) {
                return;
            }

            var aSectionsData = this.getModel().getProperty("/page/sections"),
                oSectionToBeMoved = aSectionsData.splice(originalSectionIndex, 1)[0];
            aSectionsData.splice(newSectionIndex, 0, oSectionToBeMoved);
            this.getModel().setProperty("/page/sections", aSectionsData);
            var sSectionMovedMessage = ushellResources.i18n.getText("PageRuntime.Message.SectionMoved");
            this.getOwnerComponent().getInvisibleMessageInstance().announce(sSectionMovedMessage, coreLibrary.InvisibleMessageMode.Polite);

            this._collectMessages();
            this._setDirtyFlag(true);
        },

        // -------------------------
        // Visualization - Model API
        // -------------------------

        /**
         * Handles the addition of a visualization to a section using and updating the model
         *
         * @param {string} visualizationData The visualization data of the visualization being added.
         * @param {int[]} sectionIndices The indices of sections where the content should be added to.
         * @param {int} [visualizationIndex] The index within the section where the visualization should be added at.
         *   If not provided, the visualization will be added at the end of the section.
         * @protected
         */
        addVisualizationInSection: function (visualizationData, sectionIndices, visualizationIndex) {
            if (!visualizationData || !sectionIndices.length) {
                return;
            }

            sectionIndices.forEach(function (iSectionIndex) {
                var aVisualizationsData = this.getModel().getProperty("/page/sections/" + iSectionIndex + "/viz");
                if (!aVisualizationsData) {
                    Log.warning("The Model is not ready yet.");
                    return;
                }
                if (typeof visualizationIndex === "undefined") {
                    visualizationIndex = aVisualizationsData.length;
                }
                aVisualizationsData.splice(visualizationIndex, 0, visualizationData);
                this.getModel().setProperty("/page/sections/" + iSectionIndex + "/viz", aVisualizationsData);

                this._collectMessages();
                this._setDirtyFlag(true);
            }.bind(this));
        },

        /**
         * Removes a Visualization from its Section.
         *
         * @param {int} visualizationIndex The index of the visualization, that should be deleted
         * @param {int} sectionIndex The index of the section, the visualization is in
         * @protected
         */
        removeVisualizationInSection: function (visualizationIndex, sectionIndex) {
            var sPath = "/page/sections/" + sectionIndex + "/viz",
                aVisualizationsData = this.getModel().getProperty(sPath);
            aVisualizationsData.splice(visualizationIndex, 1);
            this.getModel().setProperty(sPath, aVisualizationsData);
            MessageToast.show(this.getResourceBundle().getText("Message.VisualizationRemoved"));

            var oPage = this.getView().byId("page");
            var aSections = oPage.getSections();
            var oSection = aSections[sectionIndex];
            var aVisualizations = oSection.getVisualizations();
            if (aVisualizations.length) {
                if (visualizationIndex > (aVisualizations.length - 1)) {
                    aVisualizations[aVisualizations.length - 1].focus(); // focus previous Tile (last Tile removed)
                } else {
                    aVisualizations[visualizationIndex].focus(); // keep index, focus next Tile
                }
            } else {
                oSection.focus();
            }

            this._collectMessages();
            this._setDirtyFlag(true);
        },

        /**
         * Handles the movement of a Visualization inside a Section and between different Sections, using and updating the model.
         *
         * @param {int} originalVisualizationIndex The old index, where the visualization was from
         * @param {int} newVisualizationIndex The new index, where the visualization should go
         * @param {int} originalSectionIndex The index of the section, the visualization was in
         * @param {int} newSectionIndex The index of the section, where the visualization should be added
         * @returns {boolean} true if the visualization was moved
         * @protected
         */
        moveVisualizationInSection: function (originalVisualizationIndex, newVisualizationIndex, originalSectionIndex, newSectionIndex) {
            if (!originalVisualizationIndex && originalVisualizationIndex !== 0
                || !newVisualizationIndex && newVisualizationIndex !== 0
                || !originalSectionIndex && originalSectionIndex !== 0
                || !newSectionIndex && newSectionIndex !== 0) {
                return false;
            }

            var sOriginalVisualizationPath = "/page/sections/" + originalSectionIndex + "/viz",
                sNewVisualizationPath = "/page/sections/" + newSectionIndex + "/viz",
                aOriginalVisualizations = this.getModel().getProperty(sOriginalVisualizationPath),
                aNewVisualizations = this.getModel().getProperty(sNewVisualizationPath),
                oContent = aOriginalVisualizations.splice(originalVisualizationIndex, 1);
            aNewVisualizations.splice(newVisualizationIndex, 0, oContent[0]);
            this.getModel().setProperty(sOriginalVisualizationPath, aOriginalVisualizations);
            this.getModel().setProperty(sNewVisualizationPath, aNewVisualizations);
            var sVizMovedMessage = ushellResources.i18n.getText("PageRuntime.Message.TileMoved");
            this.getOwnerComponent().getInvisibleMessageInstance().announce(sVizMovedMessage, coreLibrary.InvisibleMessageMode.Polite);

            this._collectMessages();
            this._setDirtyFlag(true);
            return true;
        },

        /**
         * Validate the page info input fields, i.e. the page title and description.
         *
         * @return {object[]} An array of error objects.
         * @private
         */
        _validatePageInfoAndGetErrors: function () {
            var aPageInfoErrors = [],
                oTitleError = this._getPageTitleError(),
                oDescriptionError = this._getPageDescriptionError();
            if (oTitleError) {
                aPageInfoErrors.push(oTitleError);
            }
            if (oDescriptionError) {
                aPageInfoErrors.push(oDescriptionError);
            }
            return aPageInfoErrors;
        },

        /**
         * Called on the live change event of the title field
         *
         * @private
         */
        onPageInfoChange: function () {
            this._collectMessages();
            this._setDirtyFlag(true);
        },

        /**
         * Validates the page title input field and returns an error if it is not valid.
         *
         * @returns {object} Error object that holds information for the message popover.
         * @private
         */
        _getPageTitleError: function () {
            var oInput = this.getView().byId("titleInput"),
                bIsValid = !!oInput.getValue().trim(),
                oError;
            if (!bIsValid) {
                oError = {
                    type: MessageType.Error,
                    title: this.getResourceBundle().getText("Message.InvalidPageTitle"),
                    description: this.getResourceBundle().getText("Message.InvalidPageTitleDetails")
                };
                oInput.setValueState(coreLibrary.ValueState.Error);
            } else {
                oInput.setValueState(coreLibrary.ValueState.None);
            }
            return oError;
        },

        /**
         * Validates the page description input field and returns an error if it is not valid.
         *
         * @returns {object} Error object that holds information for the message popover.
         * @private
         */
        _getPageDescriptionError: function () {
            var oInput = this.getView().byId("descriptionInput"),
                bIsValid = !!oInput.getValue().trim(),
                oError;
            if (!bIsValid) {
                oError = {
                    type: MessageType.Error,
                    title: this.getResourceBundle().getText("Message.InvalidPageDescription"),
                    description: this.getResourceBundle().getText("Message.InvalidPageDescriptionDetails")
                };
                oInput.setValueState(coreLibrary.ValueState.Error);
            } else {
                oInput.setValueState(coreLibrary.ValueState.None);
            }
            return oError;
        },

        /**
         * Returns the errors of the page title and description input fields stored in the local model.
         *
         * @returns {object[]} An array of error objects used for the message popover.
         * @private
         */
        _getPageInfoErrors: function () {
            return this.getModel().getProperty("/pageInfoErrors") || [];
        },

        /**
         * Sets the SupportedOperationModel.
         * If the page object is a template from the masterSet, the pagesMasterSet is taken to retrieve supported operations.
         * If the page object is a regular page, the pageSet is taken to retrieve supported operations.
         *
         * @param {object} page The page object.
         * @private
         */
        _setSupportedOperationModel: function (page) {
            if (page.isTemplate) {
                this.getOwnerComponent().setMetaModelDataSapDelivered();
            } else {
                this.getOwnerComponent().setMetaModelData();
            }
        },

        /**
         * Requests the Spaces of the current Page and checks if the SpaceDesigner is available.
         *
         * @param {string} pageId The ID of the current Page.
         * @private
         */
        _initSpaceAssignment: function (pageId) {
            this._oCANService = sap.ushell.Container.getService("CrossApplicationNavigation");
            this._checkNavigationSupported();
            this.getView().bindElement({
                path: "PageRepository>/pageSet('" + encodeURIComponent(pageId) + "')",
                parameters: { expand: "spaces" }
            });
        },

        /**
         * Checks if the navigation to the SpaceDesigner is supported.
         *
         * @private
         */
        _checkNavigationSupported: function () {
            var aIntents = [{
                target: {
                    semanticObject: "FLPSpace",
                    action: "manage"
                }
            }];
            var bNavigationSupported;

            this._oCANService.isNavigationSupported(aIntents, this.getOwnerComponent())
                .done(function (response) {
                    bNavigationSupported = response[0].supported;
                })
                .fail(function () {
                    bNavigationSupported = false;
                })
                .always(function () {
                    this.getModel().setProperty("/spaceAssignmentNavigationSupported", bNavigationSupported);
                }.bind(this));
        },

        /**
         * Triggers the navigation to the Space Designer.
         * There is no need to check here if the navigation is supported.
         * If this was not the case, the button would not be visible.
         *
         * @protected
         */
        onManageLaunchpadSpaces: function () {
            this._oCANService.toExternal({
                target: {
                    semanticObject: "FLPSpace",
                    action: "manage"
                }
            });
        },

        /**
         * Called when an item in one of the lists of spaces is pressed.
         * Triggers the navigation to the Space Designer detail view of the pressed space.
         * There is no need to check here if the navigation is supported. If this was not the case, the item would not be pressable.
         *
         * @param {sap.ui.base.Event} event The item press event.
         * @protected
         */
        onSpaceItemPress: function (event) {
            var sSpaceId = event.getParameter("listItem").getBindingContext("PageRepository").getProperty("id");
            this._oCANService.toExternal({
                target: {
                    semanticObject: "FLPSpace",
                    action: "manage"
                },
                appSpecificRoute: "&/view/" + encodeURIComponent(sSpaceId)
            });
        },

        /**
         * Search for spaces in the assigned Spaces list.
         * A filter for searching the space ID, space description and space title.
         *
         * @param {sap.ui.base.Event} event The search event
         * @private
         */
        onSearchSpaces: function (event) {
            var sSearchText = event.getSource().getValue() || "",
                oTable = this.byId("spaceAssignmentTable"),
                oBindings = oTable.getBinding("items");

            oBindings.filter(new Filter([
                new Filter("id", FilterOperator.Contains, sSearchText),
                new Filter("description", FilterOperator.Contains, sSearchText),
                new Filter("title", FilterOperator.Contains, sSearchText)
            ], false));

            if (oBindings.getLength() === 0) {
                if (sSearchText) {
                    oTable.setNoDataText(this.getResourceBundle().getText("Message.NoSpacesFound"));
                } else {
                    oTable.setNoDataText(this.getResourceBundle().getText("Message.NoSpaces"));
                }
            }
        },

        /**
         * Opens and creates the ViewSettingsDialog for the space assignment table.
         *
         * @private
         */
        showViewSettingsSpaceAssignmentDialog: function () {
            if (this._oViewSettingsSpaceAssignmentDialog) {
                this._oViewSettingsSpaceAssignmentDialog.open();
                return;
            }

            sap.ui.require([
                "sap/ui/Device",
                "sap/ushell/applications/PageComposer/controller/ViewSettingsSpaceAssignmentDialog.controller"
            ], function (Device, ViewSettingsSpaceAssignmentController) {
                Fragment.load({
                    name: "sap.ushell.applications.PageComposer.view.ViewSettingsSpaceAssignmentDialog",
                    type: "XML",
                    controller: new ViewSettingsSpaceAssignmentController(this)
                }).then(function (oFragment) {
                    this._oViewSettingsSpaceAssignmentDialog = oFragment;
                    if (Device.system.desktop) {
                        oFragment.addStyleClass("sapUiSizeCompact");
                    }

                    this.getView().addDependent(oFragment);
                    oFragment.open();
                }.bind(this));
            }.bind(this));
        }
    });
});
