// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

/**
 * @fileOverview Factory to create filters required by search and view settings dialog of a table
 * @version 1.82.2
 */
sap.ui.define([
    "sap/ushell/utils/clone",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (fnClone, Filter, FilterOperator) {
    "use strict";

    /**
     * Constructs a new instance of a filter factory
     *
     * @constructor
     * @param {array} aPropertiesToFilter array of properties that the user can choose in the view setting dialog
     * @private
     */
    var FilterFactory = function (aPropertiesToFilter) {
        this._aPropertiesToFilter = aPropertiesToFilter;
    };

    /**
     * Creates a filter of all relevant properties using the provided search
     * value
     * @param {string} sSearchValue search value provided by user
     * @returns {object} Filter combines all properties with OR
     */
    FilterFactory.prototype.createOrFilter = function (sSearchValue) {
        var aFilters, oOrFilter;
        if (sSearchValue) {
            aFilters = this._aPropertiesToFilter.map(function (sPropertyToFilter) {
                    return new Filter({
                        path: sPropertyToFilter,
                        operator: FilterOperator.Contains,
                        value1: sSearchValue
                    });
                });
            oOrFilter = new Filter({
                filters: aFilters,
                and: false
            });
        }
        return oOrFilter;
    };

    /**
     * Combines Filter from view setting dialog and search field
     * by AND
     * @param {object} mFilters map of filter from view setting dialog
     * @param {object} oSearchFilter combined filter from search
     * @returns {object} combined filter from both sources
     */
    FilterFactory.prototype.createFilters = function (
        mFilters, oSearchFilter
    ) {
        var aCategoryFilters = [];
        var aPropertyFilters = [];
        var oSearchAndViewSettingFilter;

        for (var filter in mFilters) {
            aPropertyFilters.push(
                new Filter({
                    filters: mFilters[filter],
                    and: false
                })
            );
        }
        aCategoryFilters = aCategoryFilters.concat(aPropertyFilters);
        if (oSearchFilter) {
            aCategoryFilters = aCategoryFilters.concat(oSearchFilter);
        }

        if (aCategoryFilters.length === 0) {
            oSearchAndViewSettingFilter = new Filter({
                path: "id",
                operator: FilterOperator.Contains,
                value1: ""
            });
        } else {
            oSearchAndViewSettingFilter = new Filter({
                filters: aCategoryFilters,
                and: true
            });
        }
        return oSearchAndViewSettingFilter;
    };
    return FilterFactory;
}, true /* bExport */);
