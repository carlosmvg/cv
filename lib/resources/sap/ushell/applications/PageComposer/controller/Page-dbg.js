// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/utils/clone",
    "sap/ui/core/MessageType",
    "sap/m/GenericTileScope"
], function (ushellLibrary, JSONModel, Config, fnClone, MessageType, GenericTileScope) {
    "use strict";

    // shortcut for sap.ushell.VisualizationLoadState
    var VisualizationLoadState = ushellLibrary.VisualizationLoadState;

    /**
     * @typedef {object} PageMessage An error or warning that occurred on a page
     * @property {string} type The type of the message (i.e. error or warning)
     * @property {string} title The title of the message
     * @property {string} subtitle The subtitle of the message
     * @property {string} description The description of the message
     */

    /**
     * @typedef {object} PageMessageCollection A collection of errors or warnings that occurred on a page
     * @property {PageMessage[]} errors  Only the errors that occurred on a page
     * @property {PageMessage[]} warnings Only the warnings that occurred on a page
     */

    var oPageDetailController,
        oPage,
        resources = {},
        oViewSettingsModel = new JSONModel({
            sizeBehavior: Config.last("/core/home/sizeBehavior")
        }),
        _aDoableObject = Config.on("/core/home/sizeBehavior").do(function (sSizeBehavior) {
            oViewSettingsModel.setProperty("/sizeBehavior", sSizeBehavior);
        });

    /**
     * Helper function to get the Section from any child of it. If the Section itself is given, then it is returned.
     *
     * @param {sap.ui.core.Control} oSourceControl The source control. Must be the Section itself or any child of it.
     * @return {sap.ushell.ui.launchpad.Section} The Section.
     * @private
     */
    function _getSection (oSourceControl) {
        if (!oSourceControl) { throw new Error("Could not find the Section of the given control"); }
        if (oSourceControl.isA("sap.ushell.ui.launchpad.Section")) { return oSourceControl; }
        return _getSection(oSourceControl.getParent());
    }

    /**
     * Returns the model relevant indices from the given visualization
     *
     * @param {sap.ushell.ui.launchpad.VizInstance} oVisualization The visualization that is inside of a model.
     * @return {object} The relevant indices of the model
     * @private
     */
    function _getModelDataFromVisualization (oVisualization) {
        var oSection = _getSection(oVisualization);
        return {
            visualizationIndex: oSection.getVisualizations().indexOf(oVisualization),
            sectionIndex: oPage.getSections().indexOf(oSection)
        };
    }

    function _hasValidTarget (oVisualization) {
        var oContextInfo = oVisualization.getBindingContext();
        var sTargetMappingId = oContextInfo.getProperty(oContextInfo.getPath())
            && oContextInfo.getProperty(oContextInfo.getPath()).targetMappingId;
        var sTarget = oVisualization.getTarget && oVisualization.getTarget();
        return sTargetMappingId || !sTarget || sTarget[0] !== "#";
    }

    /**
     * Returns the tile properties used for displaying the tile.
     * Should be used when instantiating a visualization using "localLoad" mode.
     * @see sap.ushell.services.VisualizationLoading#instantiateVisualization
     *
     * @param {object} tileData The tile properties.
     * @returns {object} The tile properties for usage in "VizInstance" "localLoad" mode.
     * @private
     */
    function _getTileProperties (tileData) {
        var oTileProperties = fnClone(tileData);

        // adjust service property name: "subTitle" -> "subtitle"
        if (oTileProperties.subTitle) {
            oTileProperties.subtitle = oTileProperties.subTitle;
            delete oTileProperties.subTitle;
        }
        // adjust service property name: "iconUrl" -> "icon"
        if (oTileProperties.iconUrl) {
            oTileProperties.icon = oTileProperties.iconUrl;
            delete oTileProperties.iconUrl;
        }

        // "info" placeholder for any tile type other than "static" or "dynamic" (e.g. "custom" tiles)
        if (oTileProperties.tileType !== "STATIC" && oTileProperties.tileType !== "DYNAMIC" && !oTileProperties.info) {
            oTileProperties.info = "[" + resources.i18n.getText("Title.CustomTile") + "]";
        }

        return oTileProperties;
    }

    /**
     * Formatter for the "state" property of Visualizations.
     *
     * @param {sap.ushell.ui.launchpad.VizInstance} oVisualization The Visualization.
     * @return {string} The value for the "state" property (a member value of the {@link sap.ushell.VisualizationLoadState} enum).
     * @private
     */
    function _tileStateFormatter (oVisualization) {
        var oRolesModel = oPageDetailController.getModel("roles");
        var aSelectedRoles = oRolesModel.getProperty("/selected") || [];
        var aAllVisualizations = oRolesModel.getProperty("/allVisualizations");
        var aAvailableVisualizations = oRolesModel.getProperty("/availableVisualizations");
        var bContextEnabled = !!aSelectedRoles.length;
        var sVisualizationLoadState;
        if (bContextEnabled && (aAllVisualizations.indexOf(oVisualization.getVisualizationId()) === -1)) {
            // visualization is not available in any of the assigned roles
            sVisualizationLoadState = VisualizationLoadState.InsufficientRoles;
        } else if (bContextEnabled && (aAvailableVisualizations.indexOf(oVisualization.getVisualizationId()) === -1)) {
            // visualization is not available in the selected role context
            sVisualizationLoadState = VisualizationLoadState.OutOfRoleContext;
        } else if (!_hasValidTarget(oVisualization)) {
            // visualization has no valid navigation target
            sVisualizationLoadState = VisualizationLoadState.NoNavTarget;
        }
        return (sVisualizationLoadState || VisualizationLoadState.Loaded);
    }

    return {
        /**
         * Initializes the Page fragment logic
         *
         * @param {sap.ui.core.mvc.Controller} oController The controller that uses the Page fragment
         * @protected
         */
        init: function (oController) {
            oPageDetailController = oController;
            oPage = oPageDetailController.getView().byId("page");
            oPage.setModel(oPageDetailController.getModel());
            oPage.setModel(oViewSettingsModel, "viewSettings");
            resources.i18n = oPageDetailController.getResourceBundle();
        },

        exit: function () {
            _aDoableObject.off();
        },

        _tileStateFormatter: _tileStateFormatter, // exposing the private method so that it can be directly tested

        /**
         * Creates the visualizations inside of the sections.
         *
         * @param {string} sId The ID of the visualization.
         * @param {sap.ui.model.Context} oBindingContext The visualization binding context.
         * @param {boolean} [bForPreview] Whether tiles should be forced to "Display" scope ("true") or not ("false"). Defaults to "false".
         * @returns {sap.ushell.ui.launchpad.VizInstance} A visualization inside of a section.
         * @private
         */
        visualizationFactory: function (sId, oBindingContext, bForPreview) {
            if (!oPageDetailController.oVisualizationLoadingService) {
                throw new Error("Visualization Service was not loaded yet!");
            }

            var oTileData = oBindingContext.getProperty();
            var oVisualization = oPageDetailController.oVisualizationLoadingService.instantiateVisualization({
                vizId: oTileData.catalogTileId,
                previewMode: true,
                localLoad: true,
                tileType: (oTileData.tileType === "DYNAMIC" ? "sap.ushell.ui.tile.DynamicTile" : "sap.ushell.ui.tile.StaticTile"),
                properties: _getTileProperties(oTileData)
            });
            oVisualization.setBindingContext(oBindingContext);
            oVisualization.bindProperty("state", "", _tileStateFormatter.bind(this, oVisualization));
            oVisualization._getInnerControlPromise().then(function () {
                var oInnerControl = oVisualization.getInnerControl().getContent
                    ? oVisualization.getInnerControl().getContent()[0]
                    : oVisualization.getInnerControl();
                oInnerControl.attachPress(function (oEvent) {
                    switch (oEvent.getParameter("action")) {
                        case "Remove":
                            var oModelData = _getModelDataFromVisualization(oVisualization);
                            oPageDetailController.removeVisualizationInSection(oModelData.visualizationIndex, oModelData.sectionIndex);
                            break;
                        case "Press":
                        default:
                            oVisualization.fireEvent("press");
                            break;
                    }
                });
                oInnerControl.bindProperty("sizeBehavior", "viewSettings>/sizeBehavior"); // "sizeBehavior" for tiles: Small/Responsive
                oInnerControl.bindProperty("scope", "/editMode", function (bEditMode) {
                    return ((bEditMode && !bForPreview) ? GenericTileScope.Actions : GenericTileScope.Display);
                });
            });

            oVisualization.attachPress(function (oEvent) {
                var oEventSource = oEvent.getSource();
                oPageDetailController._openTileInfoPopover(oEventSource, oEventSource.getBindingContext());
            });

            return oVisualization;
        },

        /**
         * Variation of {@link visualizationFactory}.
         * Used for the PagePreviewDialog, forcing tiles to be displayed in the "Display" scope.
         *
         * @param {string} sID See {@link visualizationFactory}.
         * @param {sap.ui.model.Context} oBindingContext See {@link visualizationFactory}.
         * @returns {sap.ushell.ui.launchpad.VizInstance} See {@link visualizationFactory}.
         * @see visualizationFactory
         * @private
         */
        previewVisualizationFactory: function (sID, oBindingContext) {
            return this.visualizationFactory(sID, oBindingContext, true);
        },

        /**
         * Collects errors and warnings on the Page.
         *
         * @returns {PageMessageCollection} A collection of errors and warnings on the Page.
         * @protected
         */
        collectMessages: function () {
            var aErrors = [],
                aWarnings = [],
                aInfos = [],
                oRolesModel = oPageDetailController.getModel("roles"),
                aSelectedRoles = oRolesModel.getProperty("/selected") || [],
                aAllVisualizations = oRolesModel.getProperty("/allVisualizations"),
                aAvailableVisualizations = oRolesModel.getProperty("/availableVisualizations"),
                bContextEnabled = !!aSelectedRoles.length;

            oPage.getSections().forEach(function (oSection, iSectionIndex) {
                var oSectionTitle = oSection.byId("title-edit");
                if (oSection.getTitle() === "") {
                    oSectionTitle.setValueState("Warning");
                    oSectionTitle.setValueStateText(resources.i18n.getText("Message.InvalidSectionTitle"));
                    aWarnings.push({
                        type: MessageType.Warning,
                        title: resources.i18n.getText("Title.NoSectionTitle", iSectionIndex + 1),
                        description: resources.i18n.getText("Message.NoSectionTitle", iSectionIndex + 1)
                    });
                } else {
                    oSectionTitle.setValueState("None");
                }

                oSection.getVisualizations().forEach(function (oVisualization, iVisualizationIndex) {
                    var oBindingContextObject = oVisualization.getBindingContext().getProperty("");
                    var bNoFormFactor = oBindingContextObject && oBindingContextObject.tileType && !oBindingContextObject.deviceDesktop
                        && !oBindingContextObject.devicePhone && !oBindingContextObject.deviceTablet;
                    if (bNoFormFactor) {
                        aWarnings.push({
                            type: MessageType.Warning,
                            title: resources.i18n.getText("Title.NoFormFactor"),
                            description: resources.i18n.getText("Message.NoFormFactor",
                                oVisualization.getTitle() || oVisualization.getCatalogTile() && oVisualization.getCatalogTile().getTitle()
                                || oVisualization.getVisualizationId())
                        });
                    }

                    if (bContextEnabled && (aAllVisualizations.indexOf(oVisualization.getVisualizationId()) === -1)) {
                        // visualization is not available in any of the assigned roles
                        aInfos.push({
                            type: MessageType.Information,
                            title: resources.i18n.getText("Title.InsufficientRoles"),
                            subtitle: resources.i18n.getText("Title.VisualizationIsNotVisible"),
                            description: resources.i18n.getText("Message.LoadTileError",
                                [(iVisualizationIndex + 1) + ".", oSection.getTitle()])
                        });
                    } else if (bContextEnabled && (aAvailableVisualizations.indexOf(oVisualization.getVisualizationId()) === -1)) {
                        // visualization is not available in the selected role context
                        aInfos.push({
                            type: MessageType.Information,
                            title: resources.i18n.getText("Message.VisualizationNotAvailableInContext"),
                            subtitle: resources.i18n.getText("Message.VisualizationNotAvailableInContext"),
                            description: resources.i18n.getText("Message.VisualizationOutOfContextError",
                                oVisualization.getTitle() || oVisualization.getCatalogTile() && oVisualization.getCatalogTile().getTitle()
                                || oVisualization.getVisualizationId())
                        });
                    } else if (!_hasValidTarget(oVisualization)) {
                        // visualization has no valid navigation target
                        aWarnings.push({
                            type: MessageType.Warning,
                            title: resources.i18n.getText("Message.NavigationTargetError"),
                            subtitle: resources.i18n.getText("Title.VisualizationNotNavigable"),
                            description: resources.i18n.getText("Message.NavTargetResolutionError",
                                oVisualization.getTitle() || oVisualization.getCatalogTile() && oVisualization.getCatalogTile().getTitle()
                                || oVisualization.getVisualizationId())
                        });
                    }
                });
            });

            return {
                errors: aErrors,
                warnings: aWarnings,
                infos: aInfos
            };
        },

        /**
         * Adds a new Section to the Page.
         *
         * @param {sap.ui.base.Event} [oEvent] The event data. If not given, section is added at the first position.
         * @protected
         */
        addSection: function (oEvent) {
            var iSectionIndex = oEvent ? oEvent.getParameter("index") : 0;
            oPageDetailController.addSectionAt(iSectionIndex);
        },

        /**
         * Deletes a Section from the Page
         *
         * @param {sap.ui.base.Event} oEvent contains event data
         * @private
         */
        deleteSection: function (oEvent) {
            var oSection = oEvent.getSource(),
                sTitle = oSection.getTitle(),
                sMsg = sTitle
                    ? resources.i18n.getText("Message.Section.Delete", sTitle)
                    : resources.i18n.getText("Message.Section.DeleteNoTitle");

            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
                MessageBox.confirm(sMsg, {
                    icon: MessageBox.Icon.WARNING,
                    title: resources.i18n.getText("Button.Delete"),
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.DELETE,
                    initialFocus: MessageBox.Action.CANCEL,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.DELETE) {
                            oPageDetailController.deleteSection(oPage.indexOfSection(oSection));
                        }
                    }
                });
            });
        },

        /**
         * Moves a section inside of the Page
         *
         * @param {object} oInfo Drag and drop event data
         * @private
         */
        moveSection: function (oInfo) {
            var oDragged = oInfo.getParameter("draggedControl"),
                oDropped = oInfo.getParameter("droppedControl"),
                sInsertPosition = oInfo.getParameter("dropPosition"),
                iDragPosition = oPage.indexOfSection(oDragged),
                iDropPosition = oPage.indexOfSection(oDropped);

            if (sInsertPosition === "After") {
                if (iDropPosition < iDragPosition) {
                    iDropPosition++;
                }
            } else if (iDropPosition > iDragPosition) {
                iDropPosition--;
            }

            oPageDetailController.moveSection(iDragPosition, iDropPosition);
        },

        /**
         * Moves a visualization inside a section or between different sections.
         *
         * @param {object} oDropInfo Drag and drop event data
         * @private
         */
        moveVisualization: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                sInsertPosition = oDropInfo.getParameter("dropPosition");

            if (oDropped.isA("sap.ushell.ui.launchpad.Section")) {
                var oModelData = _getModelDataFromVisualization(oDragged),
                    iSectionPosition = oPage.indexOfSection(oDropped),
                    oBindingContext = oDragged.getBindingContext();

                oPageDetailController.addVisualizationInSection(oBindingContext.getModel().getProperty(oBindingContext.getPath()),
                    [iSectionPosition], 0);
                oPageDetailController.removeVisualizationInSection(oModelData.visualizationIndex, oModelData.sectionIndex);
                return;
            }

            var oDroppedModelData = _getModelDataFromVisualization(oDropped),
                iDropVizPosition = oDroppedModelData.visualizationIndex,
                iDropSectionPosition = oDroppedModelData.sectionIndex;

            if (oDragged.isA("sap.m.ListItemBase")) {
                var fnDragSessionCallback = oDropInfo.getParameter("dragSession").getComplexData("callback");
                if (sInsertPosition === "After") {
                    iDropVizPosition++;
                }
                fnDragSessionCallback(iDropVizPosition, iDropSectionPosition);
                return;
            }
            var oDraggedModelData = _getModelDataFromVisualization(oDragged),
                iDragVizPosition = oDraggedModelData.visualizationIndex,
                iDragSectionPosition = oDraggedModelData.sectionIndex;

            if (iDragSectionPosition === iDropSectionPosition) {
                if (sInsertPosition === "After") {
                    if (iDropVizPosition < iDragVizPosition) {
                        iDropVizPosition++;
                    }
                } else if (iDropVizPosition > iDragVizPosition) {
                    iDropVizPosition--;
                }
            } else if (sInsertPosition === "After") {
                iDropVizPosition++;
            }

            if (oPageDetailController.moveVisualizationInSection(iDragVizPosition, iDropVizPosition, iDragSectionPosition, iDropSectionPosition)) {
                window.setTimeout(function () {
                    oPage.getSections()[iDropSectionPosition]._focusItem(iDropVizPosition);
                }, 0);
            }
        },

        /**
         * Adds a visualization to a section in the Page.
         *
         * @param {object} oDropInfo Drag and drop event data
         * @private
         */
        addVisualization: function (oDropInfo) {
            var oDragged = oDropInfo.getParameter("draggedControl"),
                oDropped = oDropInfo.getParameter("droppedControl"),
                iDropVizPosition = oDropped.getVisualizations().length,
                iDropSectionPosition = oPage.indexOfSection(oDropped);

            if (oDragged.isA("sap.m.ListItemBase")) {
                oDropInfo.getParameter("dragSession").getComplexData("callback")(iDropVizPosition, iDropSectionPosition);
                return;
            }

            var oDraggedModelData = _getModelDataFromVisualization(oDragged),
                iDragVizPosition = oDraggedModelData.visualizationIndex,
                iDragSectionPosition = oDraggedModelData.sectionIndex;

            oPageDetailController.moveVisualizationInSection(iDragVizPosition, iDropVizPosition, iDragSectionPosition, iDropSectionPosition);
        }
    };
});
