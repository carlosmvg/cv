sap.ui.define(
	["sap/fe/macros/TableDelegate", "sap/fe/macros/table/Utils", "sap/fe/macros/chart/ChartUtils"],
	function(MacroTableDelegate, TableUtils, ChartUtils) {
		"use strict";

		var FETableDelegate = Object.assign({}, MacroTableDelegate);

		function _getChartControl(oTable) {
			var oView = sap.ui.fl.Utils.getViewForControl(oTable);
			var sChartId = oView.getContent()[0].data("singleChartId");
			return oView.byId(sChartId);
		}
		/**
		 * @param oTable mdc table control
		 * @param oMetadataInfo metadata info of table
		 * @param oBindingInfo binding info of table
		 * in alp, when the table's binding info is being updated, the table
		 * must consider the chart selections, if they are present.
		 * otherwise, the filterbar filters must be considered.
		 */
		FETableDelegate.updateBindingInfo = function(oTable, oMetadataInfo, oBindingInfo) {
			var oFilterInfo;
			if (oTable.getRowBinding()) {
				oBindingInfo.suspended = false;
			}
			var oMdcChart = _getChartControl(oTable);
			var bChartSelectionsExist = ChartUtils.getChartSelectionsExist(oMdcChart, oTable);
			if (bChartSelectionsExist) {
				oFilterInfo = ChartUtils.getAllFilterInfo(oMdcChart);
			} else {
				oFilterInfo = TableUtils.getAllFilterInfo(oTable);
			}
			// Prepare binding info with filter/search parameters
			oBindingInfo.filters = oFilterInfo.filters;
			if (oFilterInfo.search) {
				oBindingInfo.parameters.$search = oFilterInfo.search;
			} else {
				delete oBindingInfo.parameters.$search;
			}
		};

		return FETableDelegate;
	},
	/* bExport= */ false
);
