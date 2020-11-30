// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @name sap.ushell.ui.launchpad.CatalogContainer
 * @private
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ushell/ui/launchpad/TileContainerUtils",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/resources"
], function (
    Control,
    TileContainerUtils,
    jQuery,
    Log,
    resources
) {
    "use strict";

    var CatalogEntryContainer = Control.extend("sap.ushell.ui.launchpad.CatalogEntryContainer", {
        metadata: {
            properties: {
                header: { type: "string", group: "Appearance", defaultValue: null },
                catalogSearchTerm: { type: "string", group: "Appearance", defaultValue: null },
                catalogTagSelector: { type: "object", group: "Appearance", defaultValue: null }
            },
            aggregations: {
                appBoxesContainer: { type: "sap.ushell.ui.appfinder.AppBox", multiple: true },
                customTilesContainer: { type: "sap.ushell.ui.launchpad.Tile", multiple: true }
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (rm, catalogEntryContainer) {
                // WRAPPER start
                rm.openStart("div", catalogEntryContainer);
                rm.attr("aria-labeledby", catalogEntryContainer.getId() + "-title");
                rm.attr("role", "group");
                rm.class("sapUshellTileContainer");
                rm.class("sapUshellCatalogTileContainer");
                rm.openEnd(); // div - tag

                // CONTENT start
                rm.openStart("div");
                rm.class("sapUshellTileContainerContent");
                rm.attr("tabindex", "-1");
                rm.openEnd(); // div - tag

                var sHeaders = catalogEntryContainer.getHeader();
                if (sHeaders) {
                    if (resources.i18n.hasText(sHeaders)) {
                        sHeaders = resources.i18n.getText(sHeaders);
                    }

                    // Title
                    rm.openStart("div");
                    rm.class("sapUshellTileContainerHeader");
                    rm.class("sapUshellCatalogTileContainerHeader");
                    rm.attr("id", catalogEntryContainer.getId() + "-groupheader");
                    rm.openEnd(); // div - tag

                    rm.openStart("div");
                    rm.class("sapUshellCatalogTileContainerHeaderInner");
                    rm.attr("id", catalogEntryContainer.getId() + "-title");
                    rm.openEnd(); // div - tag

                    rm.openStart("h2");
                    rm.class("sapUshellContainerTitle");
                    rm.class("sapUshellCatalogContainerTitle");
                    rm.attr("title", sHeaders);
                    rm.attr("aria-level", "2");
                    rm.openEnd(); // h2 - tag
                    rm.text(sHeaders);
                    rm.close("h2");

                    rm.close("div");

                    // Title END
                    rm.close("div");
                }

                // SORTABLE start
                rm.openStart("ul");
                var iContainerHeight = catalogEntryContainer.data("containerHeight");
                if (iContainerHeight) {
                    rm.style("height", iContainerHeight);
                }
                rm.class("sapUshellTilesContainer-sortable");
                rm.class("sapUshellInner");
                rm.openEnd(); // ul - tag

                // Tiles rendering, and checking if there is at lest one visible Tile
                catalogEntryContainer.getAppBoxesContainer().forEach(function (oAppBoxContianer) {
                    rm.renderControl(oAppBoxContianer);
                });

                // SORTABLE end
                rm.close("ul");

                //////////////////////////////////////////////
                ////////////// Custom Tiles Start ////////////

                // SORTABLE start
                rm.openStart("ul");
                if (iContainerHeight) {
                    rm.style("height", iContainerHeight);
                }
                rm.class("sapUshellTilesContainer-sortable");
                rm.class("sapUshellInner");
                rm.openEnd(); // ul - tag

                // Tiles rendering, and checking if there is at lest one visible Tile
                catalogEntryContainer.getCustomTilesContainer().forEach(function (oCustomTilesContainer) {
                    rm.renderControl(oCustomTilesContainer);
                });

                // SORTABLE end
                rm.close("ul");

                // CONTENT end
                rm.close("div");

                // WRAPPER end
                rm.close("div");
            }
        }
    });

    CatalogEntryContainer.prototype.setAfterHandleElements = function (fnCallback) {
        this.onAfterHandleElements = fnCallback;
    };

    CatalogEntryContainer.prototype.onAfterUpdate = function (fnCallback) {
        this.fnCallback = fnCallback;
    };

    CatalogEntryContainer.prototype.updateAggregation = function (sReason) {
        Log.debug("Updating CatalogEntryContainer. Reason: ", sReason);
    };

    CatalogEntryContainer.prototype.addNewItem = function (elementToDisplay, sName) {
        // in case catalogStatus is full. and newItem added, it means that the user alreay see this catalog fully,
        // and most likly can see the next catalog.
        // in that can ignore the allocation and add the data to that catalog, this in to next page, this is data that is already displaied.
        if (this.catalogState[sName] !== "full") {
            if (this.getAllocatedUnits) {
                if (!this.getAllocatedUnits()) {
                    // this state indicates that this catalog is rendered parially due to units allocations,
                    // we will need to complite the loading once we have more allocations.
                    this.catalogState[sName] = "partial";
                    return false;
                }
            }
        }

        // TO-DO do not forget Move it to the controller of the catalog as a callback.
        // This code should be in the controller of the view, TODO make a callback from the controller, very like the calculater
        // This code bind between the view and the tile, It is here to improve performance.
        if (sName === "customTilesContainer") {
            var elementToDisplaySrc = elementToDisplay.getObject && elementToDisplay.getObject().src;
            if (elementToDisplaySrc !== undefined) {
                var oContract;
                if (elementToDisplaySrc.Chip !== undefined && elementToDisplaySrc.Chip.getContract !== undefined) {
                    oContract = elementToDisplaySrc.Chip.getContract("preview");
                } else if (elementToDisplaySrc.getContract !== undefined) {
                    oContract = elementToDisplaySrc.getContract("preview");
                }
                if (oContract !== undefined) {
                    oContract.setEnabled(true);
                }
            }
            var oNewView = sap.ushell.Container.getService("LaunchPage").getCatalogTileView(elementToDisplay.getProperty("src"));
            elementToDisplay.getProperty("content")[0] = oNewView;
        }

        var oNewCatalog = TileContainerUtils.createNewItem.bind(this)(elementToDisplay, sName);
        TileContainerUtils.addNewItem.bind(this)(oNewCatalog, sName);

        var aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer(),
            sPath = elementToDisplay.getPath();
        this.indexingMaps[sName].onScreenPathIndexMap[sPath] = { aItemsRefrenceIndex: aItems.length - 1, isVisible: true };

        return true;
    };

    CatalogEntryContainer.prototype.getNumberResults = function (/*sReason*/) {
        return {
            nAppboxes: this.nNumberOfVisibileElements.appBoxesContainer,
            nCustom: this.nNumberOfVisibileElements.customTilesContainer
        };
    };

    CatalogEntryContainer.prototype.handleElements = function (sReason) {
        var sName = sReason,
            oBinding = this.mBindingInfos[sName].binding,
            aBindingContexts = oBinding.getContexts(),
            aItems,
            oShowHideReturnObject,
            indexSearchMissingFilteredElem;

        if (!this.catalogState) {
            this.catalogState = {};
        }

        if (!this.catalogState[sReason]) {
            this.catalogState[sReason] = "start";
        }

        if (!this.indexingMaps) {
            this.indexingMaps = {};
        }

        if (!this.nNumberOfVisibileElements) {
            this.nNumberOfVisibileElements = [];
        }
        if (!this.nNumberOfVisibileElements.customTilesContainer) {
            this.nNumberOfVisibileElements.customTilesContainer = 0;
        }

        if (!this.nNumberOfVisibileElements.appBoxesContainer) {
            this.nNumberOfVisibileElements.appBoxesContainer = 0;
        }

        if (!this.filters) {
            this.filters = {};
        }

        aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer();

        // index the on screen elements according to the path
        this.indexingMaps[sName] = TileContainerUtils.indexOnScreenElements(aItems, false);

        // search for the missing filtered elements
        indexSearchMissingFilteredElem = TileContainerUtils.markVisibleOnScreenElementsSearchCatalog(
            aBindingContexts, this.indexingMaps[sName], true);

        // add the missing elements and check if there is a need for header.
        if (TileContainerUtils.createMissingElementsInOnScreenElementsSearchCatalog(
                this.indexingMaps[sName],
                aBindingContexts,
                indexSearchMissingFilteredElem,
                this.addNewItem.bind(this),
                aItems,
                this.filters[sName],
                sName,
                this.processFiltering.bind(this)
            )) {
            // this state indicates that we rendered all the available tiles for this catalog.
            if (this.getAllocatedUnits && this.getAllocatedUnits()) {
                this.catalogState[sReason] = "full";
            }
        }

        aItems = (sName === "appBoxesContainer") ? this.getAppBoxesContainer() : this.getCustomTilesContainer();

        // show/hide all the tiles
        oShowHideReturnObject = TileContainerUtils.showHideTilesAndHeaders(this.indexingMaps[sName], aItems);

        this.nNumberOfVisibileElements[sName] = oShowHideReturnObject.nCountVisibElelemnts;

        if (this.fnCallback) {
            this.fnCallback(this);
        }

        if (this.onAfterHandleElements) {
            this.onAfterHandleElements(this);
        }
    };

    CatalogEntryContainer.prototype.processFiltering = function (entry, sName) {
        var sPath = entry.getPath();

        if (sName) {
            var indexEntry = this.indexingMaps[sName].onScreenPathIndexMap[sPath];
            if (indexEntry.isVisible && this.currElementVisible) {
                this.currElementVisible();
            }
        }
    };

    return CatalogEntryContainer;
});
