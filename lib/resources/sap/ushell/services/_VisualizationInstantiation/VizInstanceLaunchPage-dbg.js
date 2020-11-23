// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_VisualizationInstantiation/VizInstance",
    "sap/base/Log"
], function (VizInstance, Log) {
    "use strict";

    /**
     * The only usecase for this thing so far is to be able to instantiate visualizations that were
     * retrieved from the SearchableContent service for the classic homepage.
     * Only functionality that is needed by the search UI is implemented.
     *
     * @constructor for a VizInstance for Classic Homepage tiles
     *
     * @extends sap.ushell.ui.launchpad.VizInstance
     * @param {object} vizData The visualization entity
     *
     * @name sap.ushell.ui.launchpad.VizInstanceLaunchPage
     *
     * @since 1.81
     */
    var VizInstanceLaunchPage = VizInstance.extend("sap.ushell.ui.launchpad.VizInstanceLaunchPage", {
        metadata: {
            library: "sap.ushell"
        },
        fragment: "sap.ushell.services._VisualizationInstantiation.VizInstanceLaunchPage"
    });

    /**
     * A function which sets the content of the VizInstance to a UI5 view
     *
     * @returns {Promise<void>} Resolves when the chip instance is loaded
     * @since 1.81
     */
    VizInstanceLaunchPage.prototype.load = function () {
        var oTile = this.getInstantiationData().launchPageTile;
        return sap.ushell.Container.getServiceAsync("LaunchPage")
            .then(function (oLaunchPageService) {
                return new Promise(function (resolve, reject) {
                    try {
                        // on a classic homepage there can be different tiles where the data comes from different sources
                        // many of them will be catalog tiles but e.g. bookmarks are group tiles
                        // for catalog tiles
                        oLaunchPageService.getCatalogTileViewControl(oTile)
                            .done(resolve)
                            .fail(reject);
                    } catch (e) {
                        // for group tiles
                        oLaunchPageService.getTileView(oTile)
                            .done(resolve)
                            .fail(reject);
                    }
                }).then(function (oTileView) {
                    var sTileSize = oLaunchPageService.getTileSize(oTile);
                    this._setSize(sTileSize);
                    this._setContent(oTileView);
                }.bind(this));
            }.bind(this));
    };

    // visibility and refresh handling should not be needed by the search UI

    return VizInstanceLaunchPage;
});