// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @file Provides functionality for "sap/ushell/applications/PageComposer/view/TileSelector.fragment.xml"
 */
sap.ui.define([
    "sap/m/Button",
    "sap/m/library",
    "sap/m/List",
    "sap/m/ResponsivePopover",
    "sap/m/StandardListItem",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ushell/utils/clone",
    "sap/ushell/services/Container" // required for "sap.ushell.Container.getServiceAsync()"
], function (
    Button,
    mobileLibrary,
    List,
    ResponsivePopover,
    StandardListItem,
    Fragment,
    Filter,
    FilterOperator,
    JSONModel,
    Sorter,
    fnClone
    // Container
) {
    "use strict";

    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.PlacementType
    var PlacementType = mobileLibrary.PlacementType;

    // shortcut for sap.m.ListMode
    var ListMode = mobileLibrary.ListMode;

    // shortcut for sap.m.ListSeparators
    var ListSeparators = mobileLibrary.ListSeparators;

    /**
     * @alias sap.ushell.applications.PageComposer.controller.TileSelector
     * @class
     * @protected
     */
    return function () {
        var oParentView,
            oFragment,
            oToolbar,
            oIconTabBar,
            oRolesTilesList,
            oCatalogsTilesList,
            oAddSelectedTilesButton,
            oModel,
            oRolesModel,
            resources = {},
            oSectionList,
            oSectionSelectionPopover,
            fnAddTileHandler,
            sLastDisplayFormatHint,
            sLastTileSearch,
            oViewSettingsDialog;

        /**
         * Helper function to get the currently active tile list.
         *
         * @returns {sap.m.List} The currently active tile list.
         * @private
         */
        function _getActiveList () {
            return oIconTabBar.getSelectedKey() === "roles" ? oRolesTilesList : oCatalogsTilesList;
        }

        /**
         * Refresh current search and sort on the currently selected tab.
         *
         * @private
         */
        function _refreshCurrentTab () {
            _searchTiles();
            _sortCatalogs(
                oModel.getProperty("/catalogsDescending"),
                oModel.getProperty("/vizDescending")
            );
        }

        /**
         * Intended to be called by the view (e.g. a List) for handling selection change events.
         *
         * @param {sap.ui.base.Event} [oEvent] The event object.
         * @private
         */
        function _onTileSelectionChange (/*oEvent*/) {
            oAddSelectedTilesButton.setEnabled(!!_getSelectedListItemsData().length);
        }

        /**
         * Initializes the TileSelector, must be called before calling any other TileSelector's method.
         * The controller's view default (unnamed) and "roles" model must already be set.
         *
         * @param {sap.ui.core.mvc.Controller} oController A reference to the controller it is going to be used on.
         * @private
         */
        this.init = function (oController) {
            oParentView = oController.getView();
            oFragment = oParentView.byId("tileSelector");
            oToolbar = oParentView.byId("tileSelectorToolbar");
            oIconTabBar = oParentView.byId("contextSwitch");
            oRolesTilesList = oParentView.byId("rolesTilesList");
            oCatalogsTilesList = oParentView.byId("catalogsTilesList");
            oAddSelectedTilesButton = oParentView.byId("tileSelectorAddButton");
            resources.i18n = oController.getResourceBundle();

            oModel = new JSONModel({
                catalogsDescending: false,
                vizDescending: false,
                vizReferenceHierarchySet: undefined,
                showSwitchViewButton: false
            });
            oModel.setSizeLimit(Infinity); // allow more list bindings than the model default limit of 100 entries
            oFragment.setModel(oModel);
            oRolesModel = oParentView.getModel("roles");

            oSectionList = new List({
                mode: ListMode.MultiSelect,
                showSeparators: ListSeparators.None,
                includeItemInSelection: true,
                selectionChange: function () { oSectionSelectionPopover.getBeginButton().setEnabled(!!oSectionList.getSelectedItem()); },
                items: {
                    path: "/page/sections",
                    template: new StandardListItem({ title: "{title}" })
                },
                noDataText: resources.i18n.getText("Message.NoSections")
            }).setModel(oParentView.getModel());

            oAddSelectedTilesButton.setEnabled(false);

            if (oViewSettingsDialog) { oViewSettingsDialog.fireReset(); }

            oIconTabBar.attachSelect(_refreshCurrentTab);
            // toggle the header "Add" button when necessary
            oRolesTilesList.attachSelectionChange(_onTileSelectionChange);
            oCatalogsTilesList.attachSelectionChange(_onTileSelectionChange);
        };

        /**
         * Helper function to get the Binding Info for both lists.
         *
         * @returns {object} The BindingInfo object.
         * @private
         */
        function _createBindingInfo () {
            var oBindingInfo = {};
            oBindingInfo.parameters = { expand: "vizReferences" };
            oBindingInfo.path = "/vizReferenceHierarchySet";
            oBindingInfo.factory = function (sID, oBindingContext) {
                switch (oBindingContext.getProperty("type")) {
                    default:
                    case "catalog":
                        return oParentView.byId("tileSelectorGroupHeader").clone();
                    case "visualization":
                        return oParentView.byId("tileSelectorCustomListItem").clone()
                            .bindObject(oBindingContext.getPath() + "/vizReferences");
                }
            };
            return oBindingInfo;
        }

        /**
         * Update the catalog tiles list after the manual selection of catalogs is changed.
         * Used as the callback function for the CatalogSelector.
         *
         * @param {string[]} [aCatalogIDs] Array of selected catalog IDs.
         * @private
         */
        function _onCatalogsSelected (aCatalogIDs) {
            if (aCatalogIDs && aCatalogIDs.length) {
                var oBindingInfo = _createBindingInfo();
                var aFilters = (aCatalogIDs || []).map(function (sCatalogId) {
                    return new Filter("catalogId", FilterOperator.EQ, sCatalogId);
                });
                oBindingInfo.filters = aFilters; // filters applied during the binding cannot be removed and are always in effect
                oCatalogsTilesList.setModel(oParentView.getModel("PageRepository"));
                oCatalogsTilesList.bindItems(oBindingInfo);
            } else {
                oCatalogsTilesList.unbindItems();
            }
            oIconTabBar.setSelectedKey("catalogs"); // switch to the "Manually Selected" tab
            _refreshCurrentTab();
            oCatalogsTilesList.removeSelections(true); // unselect all tile items because catalogs with selected items might be removed
            _onTileSelectionChange(); // toggle the header "Add" button when necessary (change event is not fired when changing from code)
        }

        /**
         * Sets the "rolesTilesList" model with the provided TileSelector hierarchy items.
         * This method can be called an arbitrary number of times.
         *
         * @param {object[]} [aVizReferenceHierarchy] The TileSelector hierarchy to be set on the List model.
         *   If not provided, the "PageRepository" model will be used (should be defined in the application manifest),
         *   assuming that it is connected to a data source providing the "vizReferenceHierarchySet" entity set.
         * @returns {Promise<undefined>} A Promise resolving when the Tile list update finishes.
         * @private
         */
        this.initTiles = function (aVizReferenceHierarchy) {
            oIconTabBar.setSelectedKey("roles"); // switch to the "Derived from Roles" tab
            oAddSelectedTilesButton.setEnabled(false);

            var oBindingInfo = _createBindingInfo();
            if (typeof aVizReferenceHierarchy !== "undefined") {
                oModel.setProperty("/vizReferenceHierarchySet", aVizReferenceHierarchy);
                oRolesTilesList.setModel(undefined);
                delete oBindingInfo.parameters;
            } else {
                oModel.setProperty("/vizReferenceHierarchySet", undefined);
                oRolesTilesList.setModel(oParentView.getModel("PageRepository"));
            }

            // OData requests are rejected if there are no roles available
            if (oRolesModel.getProperty("/available").length) {
                oRolesTilesList.bindItems(oBindingInfo);
                _refreshCurrentTab();
                return new Promise(function (fnResolve) {
                    oRolesTilesList.attachUpdateFinished(fnResolve);
                });
            }
            oRolesTilesList.unbindItems();
            return Promise.resolve();
        };

        /**
         * Method to be called externally to notify the TileSelector that the role context selection has changed and must be refreshed.
         *
         * @protected
         */
        this.refreshRoleContext = function () {
            _searchTiles();
        };

        /**
         * Intended to be called by the view (e.g. a SearchField) for handling tile search events.
         *
         * @param {sap.ui.base.Event} [oEvent] The event object.
         * @private
         */
        this.onSearchTiles = function (oEvent) {
            sLastTileSearch = oEvent.getParameter("query");
            _searchTiles();
        };

        /**
         * Filters the items of the currently active tile list using the last text used to search for tiles.
         *
         * @private
         */
        function _searchTiles () {
            var oActiveListBinding = _getActiveList().getBinding("items");
            var aFiltersArray = _getFiltersArray();
            if (oActiveListBinding && (JSON.stringify(oActiveListBinding.aLastFiltersArray) !== JSON.stringify(aFiltersArray))) {
                oActiveListBinding.aLastFiltersArray = aFiltersArray;
                oActiveListBinding.filter(aFiltersArray);
            }
        }

        /**
         * Intended to be called by the view (e.g. a Button) for handling add tile events.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @private
         */
        this.onAddTiles = function (oEvent) {
            var aSectionListItems = oSectionList.getItems();
            var oEventItem = oEvent.getParameter("item");
            // "sLastDisplayFormatHint" has the key of the last selected menu item of the MenuButton or "default" if direct "Add" is used
            sLastDisplayFormatHint = (oEventItem ? oEventItem.getKey() : "default");
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (oBindingContext) {
                // when adding a tile through its own "Add" button, then enhance the event with a reference to its item
                var sBindingContextPath = oBindingContext.getPath();
                oEvent.oAddSingleTileItem = _getActiveList().getItems().filter(function (item) {
                    return (item.getBindingContextPath() === sBindingContextPath);
                })[0];
            } else {
                // when adding a tile through the header "Add" button, then there is no "oAddSingleTileItem" (event objects are reused)
                delete oEvent.oAddSingleTileItem;
            }
            if (aSectionListItems.length === 1) { // skip asking to which section(s) if there is only one section
                aSectionListItems[0].setSelected(true);
                _addTiles(oEvent.oAddSingleTileItem);
            } else {
                _openSectionSelectionPopover(oEvent);
            }
        };

        /**
         * Intended to be called by the view (e.g. a Button) for handling manual selection of catalogs events.
         *
         * @private
         */
        this.onAddCatalogs = function () {
            sap.ui.require(["sap/ushell/applications/PageComposer/controller/CatalogSelector.controller"], function (controller) {
                controller.selectCatalogs(oParentView, _onCatalogsSelected);
            });
        };

        /**
         * Intended to be called by the view (e.g. a Button) for showing a dialog with available view settings.
         *
         * @param {sap.ui.base.Event} [oEvent] The event object.
         * @private
         */
        this.showViewSettingsDialog = function (/*oEvent*/) {
            if (oViewSettingsDialog) {
                oViewSettingsDialog.getModel().setProperty(
                    "/catalogsDescending",
                    oModel.getProperty("/catalogsDescending")
                );
                oViewSettingsDialog.getModel().setProperty(
                    "/vizDescending",
                    oModel.getProperty("/vizDescending")
                );
                oViewSettingsDialog.open();
                return;
            }

            sap.ui.require([
                "sap/ushell/applications/PageComposer/controller/ViewSettingsTileSelector.controller"
            ], function (ViewSettingsTileSelector) {
                Fragment.load({
                    id: oParentView.createId("tileSelectorViewSettings"),
                    name: "sap.ushell.applications.PageComposer.view.ViewSettingsTileSelector",
                    type: "XML",
                    controller: new ViewSettingsTileSelector(
                        oParentView
                    )
                }).then(function (oViewSettingsFragment) {
                    oViewSettingsDialog = oViewSettingsFragment;
                    oViewSettingsFragment.setModel(new JSONModel({
                        catalogsDescending: false,
                        vizDescending: false
                    }));
                    oViewSettingsFragment.setModel(oParentView.getModel("i18n"), "i18n");
                    oViewSettingsFragment.open();
                    oViewSettingsFragment.attachConfirm(function (oEvent) {
                        var oDialogModel = oEvent.getSource().getModel();
                        _sortCatalogs(
                            oDialogModel.getProperty("/catalogsDescending"),
                            oDialogModel.getProperty("/vizDescending")
                        );
                    });
                    oParentView.addDependent(oViewSettingsFragment);
                });
            });
        };

        /**
         * Sets a callback function for the add tiles event.
         * Usually set to call {@link sap.ushell.applications.PageComposer.controller.PageDetailEdit#addVisualizationInSection}.
         *
         * @param {function} newAddTileHandler The callback function to be called when adding tiles.
         *   This function is called with the following arguments, in the following order:
         *     1. {object} The visualization data of the visualization being added.
         *     2. {int[]} The indices of sections where the content should be added to.
         *     3. {int} Optional. The index within the section where the visualization should be added at.
         *              If not provided, the visualization will be added at the end of the section.
         * @private
         */
        this.setAddTileHandler = function (newAddTileHandler) {
            // "itemData" must not be a reference to the real data object, it should be cloned before calling "fnAddTileHandler"
            fnAddTileHandler = function (itemData, selectedSectionsIndexes, tileIndex) {
                delete itemData.id; // "id" should only exist for already saved Tiles on a Page (it is generated in the backend)
                newAddTileHandler(itemData, selectedSectionsIndexes, tileIndex);
            };
        };

        /**
         * Called when starting to drag a tile.
         *
         * @param {sap.ui.base.Event} oEvent The event object.
         * @private
         */
        this.onDragStart = function (oEvent) {
            if (typeof fnAddTileHandler !== "function") {
                throw new Error("Impossible to add Tile as no \"fnAddTileHandler\" was set via \"setAddTileHandler\"");
            }
            var oItemData = oEvent.getParameter("target").getBindingContext().getProperty();
            if (oItemData.type === "catalog") { // prevent dragging catalog items
                oEvent.preventDefault();
                return;
            }
            oEvent.getParameter("dragSession").setComplexData("callback", function (tileIndex, sectionIndex) {
                var oClonedItemData = fnClone(oItemData);
                // TODO: for now, every DnD Tile has the "default" displayFormatHint;
                // in the future, this will depend on which container the Tile is dropped, and then this line below can be removed
                oClonedItemData.displayFormatHint = "default";
                fnAddTileHandler(oClonedItemData, [sectionIndex], tileIndex);
            });
        };

        /**
         * Enable/Disable DnD for the tile selector
         *
         * @param {boolean} bEnabled If bEnabled is true, dnd is enabled
         * @private
         */
        this.setEnableDnD = function (bEnabled) {
            if (oRolesTilesList && oRolesTilesList.getDragDropConfig().length === 1) {
                oRolesTilesList.getDragDropConfig()[0].setEnabled(bEnabled);
            }
            if (oCatalogsTilesList && oCatalogsTilesList.getDragDropConfig().length === 1) {
                oCatalogsTilesList.getDragDropConfig()[0].setEnabled(bEnabled);
            }
        };

        /**
         * Show or hide button to switch between the tile selector and page content ("Show Page" button)
         *
         * @param {boolean} bEnabled If bEnabled is true, toggle button is shown
         * @private
         */
        this.showSwitchViewButton = function (bEnabled) {
            if (oModel) {
                oModel.setProperty("/showSwitchViewButton", bEnabled);
            }
        };

        /**
         * Helper function to get the Filters array for {@link sap.ui.model.ListBinding.prototype.filter}.
         * Takes into account the current context selected and the last text used to search for tiles.
         *
         * @returns {sap.ui.model.Filter[]} The resulting array of Filters.
         * @private
         */
        function _getFiltersArray () {
            var aFilters = [];
            if ((_getActiveList() === oRolesTilesList) && !oModel.getProperty("/vizReferenceHierarchySet")) {
                var aSelectedRoles = oRolesModel.getProperty("/selected");
                // if no roles are selected, then use all available ones (as if all roles were selected)
                if (!aSelectedRoles.length) { aSelectedRoles = oRolesModel.getProperty("/available"); }
                aSelectedRoles.forEach(function (sRole) {
                    aFilters.push(new Filter("roleId", FilterOperator.EQ, sRole));
                });
            }
            if (sLastTileSearch) {
                aFilters.push(new Filter([
                    new Filter("vizReferences/id", FilterOperator.Contains, sLastTileSearch),
                    new Filter("vizReferences/title", FilterOperator.Contains, sLastTileSearch),
                    new Filter("vizReferences/subTitle", FilterOperator.Contains, sLastTileSearch)
                ], false)); // filter combining: "AND" (true) or "OR" (false));
            }
            return aFilters;
        }

        /**
         * Helper function to get the Sorters array for {@link sap.ui.model.ListBinding.prototype.sort}.
         *
         * @param {boolean} sortCatalogsDescending Whether to sort catalogs "descending" (true) or "ascending" (false).
         * @param {boolean} sortVizDescending Whether to sort visualizations "descending" (true) or "ascending" (false).
         * @returns {sap.ui.model.Sorter[]} The resulting array of Sorters.
         * @private
         */
        function _getSortersArray (sortCatalogsDescending, sortVizDescending) {
            return [
                new Sorter("title", sortCatalogsDescending),
                new Sorter("vizReferences/title", sortVizDescending)
            ];
        }

        /**
         * Toggles the lexicographical sort order of the items of the currently active tile list between "ascending" and "descending".
         * Sorting is done based on the "title" property of the items.
         *
         * @param {boolean} sortCatalogsDescending Catalog sort order
         * @param {boolean} sortVizDescending Viz sort order
         *
         * @private
         */
        function _sortCatalogs (sortCatalogsDescending, sortVizDescending) {
            var aSorterArray = _getSortersArray(sortCatalogsDescending, sortVizDescending);
            var oActiveListBinding = _getActiveList().getBinding("items");
            if (oActiveListBinding && (JSON.stringify(oActiveListBinding.aLastSorterArray) !== JSON.stringify(aSorterArray))) {
                oActiveListBinding.aLastSorterArray = aSorterArray;
                oActiveListBinding.sort(aSorterArray);
            }
            oModel.setProperty("/catalogsDescending", sortCatalogsDescending);
            oModel.setProperty("/vizDescending", sortVizDescending);
        }

        /**
         * Get the item data of every selected List item.
         * This is needed because "getSelectedItems()" do not always return all selected items (e.g. within collapsed parents).
         *
         * @returns {object[]} An array of selected List items data.
         * @private
         */
        function _getSelectedListItemsData () {
            var oActiveList = _getActiveList();
            var oListModel = oActiveList.getModel();
            return oActiveList.getSelectedContextPaths().map(function (sSelectedItemContextPath) {
                return oListModel.getContext(sSelectedItemContextPath).getProperty();
            });
        }

        /**
         * Opens the sectionSelectionPopover, containing the Section list for selecting to which Sections the Tile(s) should be added to.
         *
         * @param {sap.ui.base.Event} oEvent The event that raised the operation (e.g. a click on the "Add" button).
         * @private
         */
        function _openSectionSelectionPopover (oEvent) {
            if (!oSectionSelectionPopover || oSectionSelectionPopover.bIsDestroyed) {
                _createSectionSelectionPopover();
            }
            oSectionList.removeSelections(true);
            oSectionSelectionPopover.getBeginButton().setEnabled(false).oEvent = oEvent;
            oSectionSelectionPopover.getEndButton().setEnabled(true);
            var oOpenByControl;
            if (!oEvent.oAddSingleTileItem && _isOverflownInOverflowToolbar(oAddSelectedTilesButton)) {
                oOpenByControl = oToolbar.getAggregation("_overflowButton");
            } else {
                oOpenByControl = oEvent.getSource();
                if (oOpenByControl.isA("sap.m.Menu")) { // if a menu item of the MenuButton was selected instead of the direct "Add"
                    oOpenByControl = oOpenByControl.getParent();
                }
            }
            oSectionSelectionPopover.openBy(oOpenByControl);
        }

        /**
         * Checks if a control is currently overflown inside of an OverflowToolbar.
         *
         * @param {sap.ui.core.Control} oControl The control to check.
         * @returns {boolean} Whether the control is or is not overflown inside of an OverflowToolbar.
         * @private
         */
        function _isOverflownInOverflowToolbar (oControl) {
            return (oControl.hasStyleClass("sapMOTAPButtonNoIcon") || oControl.hasStyleClass("sapMOTAPButtonWithIcon"));
        }

        /**
         * Creates the section selection popover, used to select to which section(s) the tile(s) should go to.
         *
         * @private
         */
        function _createSectionSelectionPopover () {
            oSectionSelectionPopover = new ResponsivePopover({
                id: "sectionSelectionPopover",
                placement: PlacementType.Auto,
                title: resources.i18n.getText("Tooltip.AddToSections"),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: resources.i18n.getText("Button.Add"),
                    press: function () { this.setEnabled(false); oSectionSelectionPopover.close(); _addTiles(this.oEvent.oAddSingleTileItem); }
                }),
                endButton: new Button({
                    text: resources.i18n.getText("Button.Cancel"),
                    press: function () { this.setEnabled(false); oSectionSelectionPopover.close(); }
                }),
                content: oSectionList,
                initialFocus: oSectionList
            });
            oFragment.addDependent(oSectionSelectionPopover);
        }

        /**
         * Calls the handler for adding tiles. Does nothing if no function is set for the add tiles handler.
         *
         * @see setAddTileHandler
         * @param {sap.m.ListItemBase} [oAddSingleTileItem] A single tile item, received only when the item's own "Add" button is used.
         * @private
         */
        function _addTiles (oAddSingleTileItem) {
            if (typeof fnAddTileHandler !== "function") {
                throw new Error("Impossible to add Tile as no \"fnAddTileHandler\" was set via \"setAddTileHandler\"");
            }
            var aSelectedSectionsIndexes = oSectionList.getSelectedItems().map(function (oSelectedSection) {
                return oSectionList.indexOfItem(oSelectedSection);
            });

            var aSelectedTilesData;
            if (oAddSingleTileItem) {
                aSelectedTilesData = [oAddSingleTileItem.getBindingContext().getProperty()];
                oAddSingleTileItem.setSelected(false);
            } else {
                aSelectedTilesData = _getSelectedListItemsData();
                _getActiveList().removeSelections(true); // unselect all tile items when adding through the header "Add" button
            }
            _onTileSelectionChange(); // toggle the header "Add" button when necessary (change event is not fired when changing from code)

            aSelectedTilesData.forEach(function (oSelectedTileData) {
                var oClonedTileData = fnClone(oSelectedTileData);
                oClonedTileData.displayFormatHint = sLastDisplayFormatHint;
                fnAddTileHandler(oClonedTileData, aSelectedSectionsIndexes);
            });

            if (oModel && oModel.getProperty("/showSwitchViewButton")) {
                oParentView.getController().switchDynamicSideContentView();
            }
        }
    };
});
