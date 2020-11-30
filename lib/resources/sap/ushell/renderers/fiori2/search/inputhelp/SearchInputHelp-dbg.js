// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/SearchHelper',
    'sap/ushell/renderers/fiori2/search/inputhelp/SearchInputHelpDialog',
    'sap/ushell/renderers/fiori2/search/suggestions/SuggestionType',
    'sap/ushell/renderers/fiori2/search/controls/SearchObjectSuggestionImage'
], function (SearchHelper, SearchInputHelpDialog, SuggestionType, SearchObjectSuggestionImage) {
    "use strict";

    sap.m.MultiInput.extend("sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelp", {

        metadata: {
            properties: {
                dataSource: "string",
                displayAttribute: "string"
            }
        },

        constructor: function (options) {
            var that = this;

            options = jQuery.extend({}, {
                liveChange: that.handleLiveChange,
                showSuggestion: true,
                filterSuggests: false,
                suggestionColumns: [new sap.m.Column({})],
                suggestionItemSelected: that.handleSuggestionItemSelected,
                showValueHelp: true
            }, options);

            sap.m.MultiInput.prototype.constructor.apply(this, [options]);

            that.addStyleClass('sapUshellSearchInputHelp');

            that.bindAggregation("suggestionRows", "/suggestions", function (sId, oContext) {
                return that.suggestionItemFactory(sId, oContext);
            });

            that.attachValueHelpRequest(function () {
                that.dialog = new SearchInputHelpDialog({
                    inputHelp: that,
                    displayAttribute: that.getDisplayAttribute()
                });
                that.oModel = sap.ushell.renderers.fiori2.search.getModelSingleton();
                // that.oModel.preventUpdateURL = true;

                that.dialog.setModel(that.oModel);
                that.dialog.setModel(sap.ushell.resources.i18nModel, "i18n");
                that.dialog.open();

                // var searchBoxTerm = that.getValue();
                var searchBoxTerm = '';
                // if (that.getTokens().length === 1) {
                //     searchBoxTerm = that.getTokens()[0].getText();
                // }
                if (searchBoxTerm.trim() === '') {
                    searchBoxTerm = '*';
                }
                that.oModel.setSearchBoxTerm(searchBoxTerm, false);
                that.dialog.oSearchFieldGroup.input.setValue(searchBoxTerm);

                that.oModel._firePerspectiveQuery();
            });
        },

        handleLiveChange: function (oEvent) {

            var suggestTerm = this.getValue();
            var oModel = this.getModel();
            oModel.setSearchBoxTerm(suggestTerm, false);
            if (oModel.getSearchBoxTerm().length > 0) {
                oModel.doSuggestion();
            } else {
                this.destroySuggestionRows();
                oModel.abortSuggestions();
            }
        },

        suggestionItemFactory: function (sId, oContext) {
            var suggestion = oContext.getObject();
            switch (suggestion.uiSuggestionType) {
            case SuggestionType.Object:
                return this.objectSuggestionItemFactory(sId, oContext);
            case SuggestionType.BusyIndicator:
                return this.busyIndicatorItemFactory(sId, oContext);
            default:
                // return this.regularSuggestionItemFactory(sId, oContext);
            }
        },

        objectSuggestionItemFactory: function (sId, oContext) {

            var suggestion = oContext.getObject();
            var suggestionParts = [];

            // image
            if (suggestion.imageExists) {
                suggestionParts.push(new SearchObjectSuggestionImage({
                    src: "{imageUrl}",
                    isCircular: "{imageIsCircular}"
                }));
            }

            // labels
            suggestionParts.push(this.assembleObjectSuggestionLabels(suggestion));

            // combine image and labels
            var cell = new sap.ui.layout.HorizontalLayout({
                content: suggestionParts
            });
            cell.addStyleClass('sapUshellSearchObjectSuggestion-Container');
            cell.getText = function () {
                return this.getValue();
            }.bind(this);

            // suggestion list item
            var listItem = new sap.m.ColumnListItem({
                cells: [cell],
                type: "Active"
            });
            listItem.addStyleClass('searchSuggestion');
            listItem.addStyleClass('searchObjectSuggestion');
            return listItem;
        },

        busyIndicatorItemFactory: function (sId, oContext) {

            var cell = new sap.ui.layout.VerticalLayout({
                content: [new sap.m.BusyIndicator({
                    size: '0.6rem'
                })]
            });
            cell.getText = function () {
                return this.getValue();
            }.bind(this);

            var listItem = new sap.m.ColumnListItem({
                cells: [cell],
                type: "Active"
            });
            listItem.addStyleClass('searchSuggestion');
            listItem.addStyleClass('searchBusyIndicatorSuggestion');
            return listItem;
        },

        assembleObjectSuggestionLabels: function (suggestion) {

            // first line: label 1
            var labels = [];

            // fall back empty label1
            if (!suggestion.label1) {
                var displayAttribute = this.getDisplayAttribute();
                if (displayAttribute) {
                    for (var i = 0; i < suggestion.object.detailAttributes.length; i++) {
                        var detailAttribute = suggestion.object.detailAttributes[i];
                        if (detailAttribute.id === displayAttribute) {
                            suggestion.label1 = detailAttribute.value;
                        }
                    }
                }
            }
            var label1 = new sap.m.Label({
                text: "{label1}"
            });
            label1.addEventDelegate({
                onAfterRendering: function () {
                    SearchHelper.boldTagUnescaper(this.getDomRef());
                }
            }, label1);
            label1.addStyleClass('sapUshellSearchObjectSuggestion-Label1');
            labels.push(label1);

            // second line: label 2
            if (suggestion.label2) {
                var label2 = new sap.m.Label({
                    text: "{label2}"
                });
                label2.addEventDelegate({
                    onAfterRendering: function () {
                        SearchHelper.boldTagUnescaper(this.getDomRef());
                    }
                }, label2);
                label2.addStyleClass('sapUshellSearchObjectSuggestion-Label2');
                labels.push(label2);
            }

            var vLayout = new sap.ui.layout.VerticalLayout({
                content: labels
            });
            vLayout.addStyleClass('sapUshellSearchObjectSuggestion-Labels');
            return vLayout;
        },

        handleSuggestionItemSelected: function (oEvent) {

            var oModel = this.getModel();
            var searchBoxTerm = oModel.getSearchBoxTerm();
            var suggestion;
            if (oEvent.getId() === "AutoSelectAppSuggestion") {
                suggestion = oEvent.getParameter("suggestion");
            } else {
                suggestion = oEvent.getParameter("selectedRow").getBindingContext().getObject();
            }

            var suggestionTerm = suggestion.searchTerm || "";
            var dataSource = suggestion.dataSource || oModel.getDataSource();
            var targetURL = suggestion.url;
            var type = suggestion.uiSuggestionType;

            oModel.eventLogger.logEvent({
                type: oModel.eventLogger.SUGGESTION_SELECT,
                suggestionType: type,
                suggestionTerm: suggestionTerm,
                searchTerm: searchBoxTerm,
                targetUrl: targetURL,
                dataSourceKey: dataSource ? dataSource.id : ""
            });

            // remove any selection
            this.selectText(0, 0);

            suggestion.value = suggestion.label;
            var displayAttribute = this.getDisplayAttribute();
            if (displayAttribute) {
                for (var i = 0; i < suggestion.object.detailAttributes.length; i++) {
                    var detailAttribute = suggestion.object.detailAttributes[i];
                    if (detailAttribute.id === displayAttribute) {
                        suggestion.value = detailAttribute.value;
                    }
                }
            }

            this.addAggregation("tokens", new sap.m.Token({
                text: suggestion.value,
                key: suggestion.value
            }));
            oModel.setProperty('/inputHelpSelectedItems', [suggestion]);
            this.fireChange();
        },

        selectDataSource: function () {
            var oModel = this.getModel();
            var dataSourceId = this.getDataSource();
            var dataSources = oModel.getProperty("/dataSources");
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

        renderer: 'sap.m.MultiInputRenderer'

    });
});
