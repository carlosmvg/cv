// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    'sap/ushell/renderers/fiori2/search/controls/SearchFieldGroup'
], function (SearchFieldGroup) {
    "use strict";

    return sap.m.Dialog.extend("sap.ushell.renderers.fiori2.search.inputhelp.SearchInputHelpDialog", {

        metadata: {
            properties: {
                inputHelp: "object",
                displayAttribute: "string"
            }
        },

        constructor: function (options) {
            var that = this;

            options = jQuery.extend({}, {
                showHeader: false,
                horizontalScrolling: false,
                verticalScrolling: false,
                contentHeight: "50rem",
                contentWidth: "80rem",
                beginButton: new sap.m.Button({
                    text: sap.ushell.resources.i18n.getText("okDialogBtn"),
                    type: sap.m.ButtonType.Emphasized,
                    press: function (oEvent) {
                        that.onOkClick(oEvent);
                        that.close();
                        that.destroy();
                    }
                }),
                endButton: new sap.m.Button({
                    text: sap.ushell.resources.i18n.getText("cancelDialogBtn"),
                    press: function (oEvent) {
                        that.onCancelClick(oEvent);
                        that.close();
                        that.destroy();
                    }
                }),
                content: [that.createContent()]
            }, options);

            that.displayAttribute = options.displayAttribute;

            sap.m.Dialog.prototype.constructor.apply(this, [options]);

            that.addStyleClass('sapUshellSearchInputHelpDialog');
        },

        renderer: 'sap.m.DialogRenderer',

        createContent: function () {
            var that = this;

            that.oSearchFieldGroup = new sap.ushell.renderers.fiori2.search.controls.SearchFieldGroup("searchInputHelpDialogSearchFieldGroup");
            that.oSearchFieldGroup.setCancelButtonActive(false);
            that.oSearchFieldGroup.addStyleClass('sapUshellSearchInputHelpDialogSearchFieldGroup');
            that.oSearchFieldGroup.input.setShowValueHelp(false);

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
                    that.oSearchResults.assembleFilterButton(),
                    that.oSearchResults.assembleDataSourceTapStrips()
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
            that.oSearchPage.addStyleClass('sapUshellSearchInputHelpDialogSearchPage');

            // that.oContainer = new sap.ui.layout.VerticalLayout();
            // that.oContainer.addContent(that.oSearchFieldGroup);
            // that.oContainer.addContent(that.oSearchPage);

            return [that.oSearchFieldGroup, that.oSearchPage];
        },

        onOkClick: function (oEvent) {
            var that = this;

            // var selectedItem = that.getModel().getProperty('/inputHelpSelectedItem');
            var selectedItems = [];
            var results = that.getModel().getProperty('/results');
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                if (result.selected) {
                    selectedItems.push(result);
                }
            }

            var tokens = [];
            for (var j = 0; j < selectedItems.length; j++) {
                var selectedItem = selectedItems[j];
                selectedItem.value = that._getAttributeValue(selectedItem);
                tokens.push(new sap.m.Token({
                    text: selectedItem.value,
                    key: selectedItem.value
                }));
            }

            that.getInputHelp().setTokens(tokens);
            that.getModel().setProperty('/inputHelpSelectedItems', selectedItems);
            that.getInputHelp().fireChange();
        },

        onCancelClick: function (oEvent) {

        },

        _getAttributeValue: function (selectedItem) {
            var that = this;
            var displayAttribute = that.getDisplayAttribute();
            for (var i = 0; i < selectedItem.itemattributes.length; i++) {
                var attribute = selectedItem.itemattributes[i];
                if (attribute.key === displayAttribute) {
                    return attribute.valueRaw;
                }
            }
            return selectedItem.title;
        }
    });
});
