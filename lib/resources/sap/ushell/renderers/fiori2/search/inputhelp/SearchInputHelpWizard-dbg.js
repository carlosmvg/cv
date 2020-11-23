// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/controls/SearchFieldGroup'
], function (SearchFieldGroup) {
    "use strict";

    return sap.m.Page.extend("sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelpWizard", {

        metadata: {
            properties: {
                dataSource: "string",
                displayAttribute: "string",
                selectedItems: "array"
            }
        },

        constructor: function (options) {
            var that = this;

            options = jQuery.extend({}, {
                showHeader: false,
                content: []
            }, options);

            that.displayAttribute = options.displayAttribute;

            sap.m.Page.prototype.constructor.apply(that, [options]);

            that.addStyleClass('sapUshellSearchInputHelpWizard');

            sap.ui.require([
                'sap/ushell/renderers/fiori2/search/container/ComponentService'
            ], function (ComponentService) {
                //init search services
                ComponentService.init();

                sap.ui.require([
                    'sap/ushell/renderers/fiori2/search/personalization/PersonalizationStorage',
                    'sap/ushell/renderers/fiori2/search/SearchModel'
                ], function (PersonalizationStorage, SearchModel) {

                    //init Personalization Storage Service
                    PersonalizationStorage.getInstance();

                    var searchModel = that.getModel("searchModel");
                    if (!searchModel) {
                        searchModel = sap.ushell.renderers.fiori2.search.getModelSingleton();
                        that.setModel(searchModel, "searchModel");
                    }
                    searchModel.isSearchInputHelpWizard = true;
                    searchModel.preventUpdateURL = true;
                    searchModel.config.searchScopeWithoutAll = true;

                    that.setModel(searchModel);
                    that.setModel(sap.ushell.resources.i18nModel, "i18n");

                    that.createContent();

                    that.getModel().initBusinessObjSearch().then(function () {
                        that.selectDataSource();
                        that.oSearchFieldGroup.select.setEnabled(false);
                        var searchBoxTerm = '*';
                        that.getModel().setSearchBoxTerm(searchBoxTerm, false);
                        that.getModel()._firePerspectiveQuery();
                    });

                });

            });

        },

        renderer: 'sap.m.PageRenderer',

        createContent: function () {
            var that = this;

            that.oSearchFieldGroup = new sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup("SearchInputHelpWizardSearchFieldGroup");
            that.oSearchFieldGroup.setCancelButtonActive(false);
            that.oSearchFieldGroup.addStyleClass('sapUshellSearchInputHelpWizardSearchFieldGroup');
            that.oSearchFieldGroup.input.setShowValueHelp(false);
            that.getModel().setProperty('/inputHelp', that.oSearchFieldGroup.input);

            that.oSearchResults = sap.ui.view({
                id: "searchContainerResultsView",
                viewName: "sap.ushell.renderers.fiori2.search.container.Search",
                type: sap.ui.core.mvc.ViewType.JS
            });

            that.oSearchBar = new sap.m.Bar({
                visible: {
                    parts: [{
                        path: '/count'
                    }, {
                        path: '/facetVisibility'
                    }],
                    formatter: function (count, facetVisibility) {
                        if (facetVisibility) {
                            return count !== 0;
                        }
                        return count !== 0;

                    }
                },
                contentLeft: [
                    that.oSearchResults.assembleFilterButton()
                    // that.oSearchResults.assembleDataSourceTapStrips()
                ],
                contentRight: that.oSearchResults.assembleSearchToolbar(true)
            });
            that.oSearchBar.addStyleClass('sapUshellSearchBar');

            that.oFilterBar = new sap.ushell.renderers.fiori2.search.controls.SearchFilterBar({
                visible: {
                    parts: [{
                        path: '/facetVisibility'
                    }, {
                        path: '/uiFilter/rootCondition'
                    }],
                    formatter: function (facetVisibility, rootCondition) {
                        if (!facetVisibility && rootCondition && rootCondition.hasFilters()) {
                            return true;
                        }
                        return false;

                    }
                }
            });

            that.oSearchPage = new sap.m.Page({
                id: 'searchPage',
                customHeader: this.oSearchBar,
                subHeader: this.oFilterBar,
                content: [that.oSearchResults],
                enableScrolling: true,
                showFooter: {
                    parts: ['/errors/length'],
                    formatter: function (numberErrors) {
                        return numberErrors > 0;
                    }
                },
                showHeader: true,
                showSubHeader: {
                    parts: [{
                        path: '/facetVisibility'
                    }, {
                        path: '/uiFilter/rootCondition'
                    }],
                    formatter: function (facetVisibility, rootCondition) {
                        if (!facetVisibility && rootCondition && rootCondition.hasFilters()) {
                            return true;
                        }
                        return false;

                    }
                }
            });
            that.oSearchPage.addStyleClass('sapUshellSearchInputHelpWizardSearchPage');

            // return [that.oSearchFieldGroup, that.oSearchPage];
            that.addContent(that.oSearchFieldGroup);
            that.addContent(that.oSearchPage);
        },

        selectDataSource: function () {
            var oModel = this.getModel();
            var dataSourceId = this.getDataSource();
            var dataSources = oModel.getProperty("/dataSources");

            if (dataSources[0] === oModel.allDataSource) {
                dataSources.shift();
                oModel.setDataSource(dataSources[0]);
            }
            if (oModel.getDataSource().id !== dataSourceId) {
                for (var i = 0; i < dataSources.length; i++) {
                    var dataSource = dataSources[i];
                    if (dataSourceId === dataSource.id) {
                        oModel.setDataSource(dataSource, false);
                        break;
                    }
                }
            }
        },

        selectItems: function () {

            var that = this;

            var selectedItems = [];
            var results = that.getModel().getProperty('/results');
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                if (result.selected) {
                    selectedItems.push(result);
                }
            }

            that.setSelectedItems(selectedItems);
            that.getModel().setProperty('/inputHelpSelectedItems', selectedItems);
        }

    });
});
