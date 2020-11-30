/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(["sap/ui/mdc/util/FilterUtil", "sap/ui/core/Core", "sap/ui/model/Filter"], function(FilterUtil, Core, Filter) {
	"use strict";

	var oFilterUtils = {
		getFilter: function(vIFilter) {
			var aFilters = oFilterUtils.getFilterInfo(vIFilter).filters;
			return aFilters.length ? new Filter(oFilterUtils.getFilterInfo(vIFilter).filters, false) : undefined;
		},

		getFilterInfo: function(vIFilter, aPropertiesMetadata) {
			var oIFilter = vIFilter,
				sSearch,
				aFilters = [];
			if (typeof vIFilter === "string") {
				oIFilter = Core.byId(vIFilter);
			}
			if (oIFilter) {
				sSearch = oIFilter.getSearch ? oIFilter.getSearch() : null;
				var mConditions = oIFilter.getConditions();
				if (mConditions) {
					if (!aPropertiesMetadata) {
						aPropertiesMetadata = oIFilter.getPropertyInfoSet ? oIFilter.getPropertyInfoSet() : null;
					}

					var oFilter = FilterUtil.getFilterInfo(oIFilter, mConditions, aPropertiesMetadata).filters;
					aFilters = oFilter ? [oFilter] : [];
				}
			}
			return { filters: aFilters, search: sSearch || undefined };
		}
	};

	return oFilterUtils;
});
