// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/library",
    "sap/ui/core/XMLComposite",
    "sap/ui/core/Icon",
    "sap/m/VBox",
    "sap/m/Button",
    "sap/ui/events/PseudoEvents",
    "sap/ushell/resources",
    "sap/m/ActionSheet"
], function (mobileLibrary, XMLComposite, Icon, VBox, Button, PseudoEvents, resources, ActionSheet) {
    "use strict";

    // shortcut for sap.m.LoadState
    var LoadState = mobileLibrary.LoadState;
    var TileSizeBehavior = mobileLibrary.TileSizeBehavior;

    /**
     * @constructor
     */
    var VizInstance = XMLComposite.extend("sap.ushell.ui.launchpad.VizInstance", /** @lends sap.ushell.ui.launchpad.VizInstance.prototype*/ {
        metadata: {
            library: "sap.ushell",
            properties: {
                title: {
                    type: "string",
                    defaultValue: "",
                    bindable: true
                },
                subtitle: {
                    type: "string",
                    defaultValue: "",
                    bindable: true
                },
                height: {
                    type: "int",
                    defaultValue: 2
                },
                width: {
                    type: "int",
                    defaultValue: 2
                },
                info: {
                    type: "string",
                    defaultValue: "",
                    bindable: true
                },
                icon: {
                    type: "sap.ui.core.URI",
                    defaultValue: "",
                    bindable: true
                },
                state: {
                    type: "sap.m.LoadState",
                    defaultValue: LoadState.Loaded,
                    bindable: true
                },
                sizeBehavior: {
                    type: "sap.m.TileSizeBehavior",
                    defaultValue: TileSizeBehavior.Responsive,
                    bindable: true
                },
                editable: {
                    type: "boolean",
                    defaultValue: false,
                    bindable: true
                },
                active: {
                    type: "boolean",
                    defaultValue: false
                },
                targetURL: {
                    type: "string"
                },
                indicatorDataSource: {
                    type: "object",
                    defaultValue: undefined
                },
                keywords: {
                    type: "string[]",
                    defaultValue: []
                },
                instantiationData: {
                    type: "object",
                    defaultValue: {}
                },
                tileActions: {
                    type: "object",
                    defaultValue: {}
                },
                contentProviderId: {
                    type: "string",
                    defaultValue: ""
                },
                vizConfig: {
                    type: "object"
                }
            },
            events: {
                press: {
                    parameters: {
                        scope: { type: "sap.m.GenericTileScope" },
                        action: { type: "string" }
                    }
                }
            }
        },
        fragment: "sap.ushell.services._VisualizationInstantiation.VizInstance"
    });

    VizInstance.prototype.init = function () {
        XMLComposite.prototype.init.apply(this, arguments);

        this._oContent = this.getAggregation("_content");
    };

    VizInstance.prototype.exit = function () {
        if (this._oEditModeOverlayContainer) {
            this._oEditModeOverlayContainer.destroy();
        }
        if (this._oActionModeButtonIconVBox) {
            this._oActionModeButtonIconVBox.destroy();
        }
        if (this._oActionDivCenter) {
            this._oActionDivCenter.destroy();
        }
        if (this._oActionSheet) {
            this._oActionSheet.destroy();
        }
    };

    /**
     * Returns the layout data for the GridContainer/Section.
     *
     * @returns {object} The layout data in "columns x rows" format. E.g.: "2x2"
     * @since 1.77.0
     */
    VizInstance.prototype.getLayout = function () {
        return {
            columns: this.getWidth(),
            rows: this.getHeight()
        };
    };

    /**
     * Updates the content aggregation of the XML composite and recalculates its layout data
     *
     * @param {sap.ui.core.Control} content The control to be put inside the visualization
     * @since 1.77.0
     */
    VizInstance.prototype._setContent = function (content) {
        var oGridData = this.getLayoutData();
        if (oGridData && oGridData.isA("sap.f.GridContainerItemLayoutData")) {
            oGridData.setRows(this.getHeight());
            oGridData.setColumns(this.getWidth());
            this.getParent().invalidate();
        }

        this._oContent = content;
        this.invalidate();
    };

    /**
     * Updates the internal _content aggregation with the inner content or the inner content's first child item.
     * @private
     * @since 1.81.0
     */
    VizInstance.prototype._updateContent = function () {
        var oContent = this._oContent;

        if (this.getEditable()) {
            oContent = this._getEditModeOverlay(oContent);
        }

        // Replace the generic tile of the XML composite control with the actual content
        if (this._oContent.getItems) {
            this.setAggregation("_content", oContent.getItems()[0]);
        } else {
            this.setAggregation("_content", oContent);
        }
    };

    /**
     * Constructs and caches the edit mode overlay and wraps the given content with it.
     *
     * @param {sap.ui.core.Control} content An inner control that should receive the overlay.
     * @returns {sap.m.VBox} The overlay control with the wrapped content.
     * @private
     * @since 1.81.0
     */
    VizInstance.prototype._getEditModeOverlay = function (content) {
        var oTileActions = this.getTileActions();
        var aTileActionKeys = Object.keys(oTileActions);

        if (!this._oEditModeOverlayContainer) {
            var oRemoveIcon = new Icon({
                src: "sap-icon://decline",
                press: [ this._onRemoveIconPressed, this ],
                tooltip: resources.i18n.getText("removeButtonTitle"),
                noTabStop: true
            }).addStyleClass("sapUshellTileDeleteIconInnerClass sapMPointer");

            this._oRemoveIconVBox = new VBox({
                items: [oRemoveIcon]
            }).addStyleClass("sapUshellTileDeleteIconOuterClass sapUshellTileDeleteClickArea sapMPointer");

            this._oEditModeOverlayContainer = new VBox().addStyleClass("sapUshellVizInstance");

            if (aTileActionKeys.length > 0) {
                this._oActionDivCenter = new VBox().addStyleClass("sapUshellTileActionDivCenter");

                this._oActionDivCenter.attachBrowserEvent("click", this._onActionMenuIconPressed, this);

                this._oActionModeIcon = new Icon({
                    src: "sap-icon://overflow",
                    press: [ this._onActionMenuIconPressed, this ],
                    tooltip: resources.i18n.getText("configuration.category.tile_actions"),
                    noTabStop: true
                }).addStyleClass("sapUshellTileActionIconDivBottomInner sapMPointer");

                this._oActionModeButtonIconVBox = new VBox({
                    items: [ this._oActionModeIcon ]
                }).addStyleClass("sapUshellTileActionIconDivBottom sapMPointer");
            }
        }

        this._oEditModeOverlayContainer.removeAllItems();
        this._oEditModeOverlayContainer.addItem(content);
        this._oEditModeOverlayContainer.addItem(this._oRemoveIconVBox);

        if (aTileActionKeys.length > 0) {
            this._oEditModeOverlayContainer.addItem(this._oActionDivCenter);
            this._oEditModeOverlayContainer.addItem(this._oActionModeButtonIconVBox);
        }

        return this._oEditModeOverlayContainer;
    };

    /**
     * Press handler for the remove icon. Fires a press event on the VizInstance which leads to the removal of the tile
     *
     * @since 1.78.0
     */
    VizInstance.prototype._onRemoveIconPressed = function () {
        this.firePress({
            scope: "Actions",
            action: "Remove"
        });
    };

    /**
     * Press handler for action menu icon.
     *
     * @since 1.79.0
     * @private
     */
    VizInstance.prototype._onActionMenuIconPressed = function () {
        if (!this._oActionSheet) {
            if (Object.keys(this.getProperty("tileActions")).length === 0) {
                this._oActionSheet = new ActionSheet({
                    buttons: [
                        new Button({
                            text: resources.i18n.getText("tileHasNoActions"),
                            enabled: false
                        })
                    ]
                });
            } else {
                // fill action sheet with actions here
            }
        }

        this._oActionSheet.openBy(this._oActionModeIcon);
    };

    VizInstance.prototype.getFocusDomRef = function () {
        if (this.getEditable()) {
            return this._oActionModeIcon && this._oActionModeIcon.getFocusDomRef();
        }

        var aPossibleControls = this._oContent.findAggregatedObjects(true, function (oControl) {
            return oControl.isA("sap.m.GenericTile") || oControl.isA("sap.f.Card");
        });

        if (aPossibleControls.length) {
            return aPossibleControls[0].getFocusDomRef();
        }

        return this._oContent.getFocusDomRef();
    };

    /**
     * Click handler. Prevents the navigation if the edit mode is active.
     *
     * @param {Event} oEvent The Event object
     * @since 1.78.0
     */
    VizInstance.prototype.onclick = function (oEvent) {
        if (this._preventDefault(oEvent)) {
            this.firePress({
                scope: "Display",
                action: "Press"
            });
        }
    };

    VizInstance.prototype.onBeforeRendering = function () {
        this._updateContent();

        var oDomRef = this.getDomRef();
        if (oDomRef) {
            oDomRef.removeEventListener("keyup", this._fnKeyupHandler);
            oDomRef.removeEventListener("touchend", this._fnTouchendHandler);
        }
    };

    /**
     * SAPUI5 Lifecycle hook which is called after the control is rendered.
     * Prevents the navigation on keyup events while in the edit mode.
     * Event Capturing is enabled for these as we have no direct control over
     * inner elements but need to prevent their actions in the edit mode.
     *
     * @override
     * @since 1.78.0
     * @private
     */
    VizInstance.prototype.onAfterRendering = function () {
        var oDomRef = this.getDomRef();
        this._fnKeyupHandler = this.onkeyup.bind(this);
        this._fnTouchendHandler = this.onclick.bind(this);

        oDomRef.addEventListener("keyup", this._fnKeyupHandler, true);
        oDomRef.addEventListener("touchend", this._fnTouchendHandler, true);
    };

    /**
     * Handles the keyup event while edit mode is active
     * If delete or backspace is pressed, the focused VizInstance gets removes.
     * If space or enter is pressed, the navigation gets prevented.
     *
     * @param {Event} oEvent Browser Keyboard event
     * @since 1.78.0
     * @private
     */
    VizInstance.prototype.onkeyup = function (oEvent) {
        if (this.getEditable()) {
            if ((PseudoEvents.events.sapdelete.fnCheck(oEvent) || PseudoEvents.events.sapbackspace.fnCheck(oEvent))) {
                this.firePress({
                    scope: "Actions",
                    action: "Remove"
                });
            }

            if (PseudoEvents.events.sapspace.fnCheck(oEvent) || PseudoEvents.events.sapenter.fnCheck(oEvent)) {
                this._preventDefault(oEvent);
            }
        }
    };

    /**
     * Stops the given event from bubbling up or down the DOM and prevents its default behavior.
     *
     * @param {Event} oEvent The browser event
     * @returns {boolean} False if the default behavior is prevented, otherwise true.
     * @since 1.78.0
     */
    VizInstance.prototype._preventDefault = function (oEvent) {
        if (this.getEditable()) {
            oEvent.preventDefault();
            oEvent.stopPropagation();
            oEvent.stopImmediatePropagation();
            return false;
        }
        return true;
    };

    /**
     * Loads the content of the VizInstance and resolves the returned Promise
     * when loading is completed.
     *
     * @returns {Promise<void>} Resolves when loading is completed
     * @abstract
     * @since 1.77.0
     */
    VizInstance.prototype.load = function () {
        // As this is the base control that doesn't load anything, a resolved Promise is
        // returned always.
        return Promise.resolve();
    };

    /**
     * Sets the size of the VizInstance based on the instantiation data
     *
     * @param {string} sTileSize The tile size e.g. 1x1
     * @private
     * @since 1.81.
     */
    VizInstance.prototype._setSize = function (sTileSize) {
        // There is no vizInstance property for the tile size as the tiles don't react on it
        // It is only used to set the layout data for the grid correctly
        if (sTileSize) {
            var aSize = sTileSize.split("x");
            var iHeight = parseInt(aSize[0], 10);
            var iWidth = parseInt(aSize[1], 10);

            // If not both dimensions are valid the VizInstance stays with its default size
            if (iWidth && iHeight) {
                // Convert from FLP tile size to grid size
                iWidth = iWidth * 2;
                iHeight = iHeight * 2;

                this.setWidth(iWidth);
                this.setHeight(iHeight);
            }
        }
    };

    return VizInstance;
});
