/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(
	["sap/ui/model/Filter", "sap/fe/macros/filter/FilterUtils", "sap/ui/model/FilterOperator", "sap/ui/core/CustomData"],
	function(Filter, FilterUtil, FilterOperator, CustomData) {
		"use strict";
		var aPrevDrillStack = [];
		var oChartUtils = {
			getChartSelectionsExist: function(oMdcChart, oSource) {
				// consider chart selections in the current drill stack or on any further drill downs
				oSource = oSource || oMdcChart;

				if (oMdcChart) {
					var oChart = oMdcChart.getAggregation("_chart");
					if (oChart) {
						var aCurrentDrillStack = oChart.getDrillStack();
						if (aCurrentDrillStack.length > 0) {
							var aCurrentDrillView = aCurrentDrillStack.pop();
							var aDimensions = aCurrentDrillView.dimension;
							var bIsDrillDown = aDimensions.length > aPrevDrillStack.length;
							var bIsDrillUp = aDimensions.length < aPrevDrillStack.length;
							var bNoChange = aDimensions.toString() === aPrevDrillStack.toString();
							var aFilters;
							if (bIsDrillUp && aDimensions.length === 1) {
								// drilling up to level0 would clear all selections
								aFilters = oChartUtils.getChartSelections(oMdcChart, true);
							} else {
								// apply filters of selections of previous drillstack
								// when drilling up/down
								aFilters = oChartUtils.getChartSelections(oMdcChart);
							}
							if (bIsDrillDown || bIsDrillUp) {
								aPrevDrillStack = aDimensions;
								return aFilters.length > 0;
							} else if (bNoChange && oSource.isA("sap.ui.mdc.Table")) {
								return aFilters.length > 0;
							}
						}
					}
				}
				return false;
			},
			getChartSelections: function(oMdcChart, bClearSelections) {
				// get chart selections
				var sModelName = oMdcChart.data("selectedContextsModel");
				var oModel = oMdcChart.getModel(sModelName);
				var sId = oMdcChart.getId().substr(oMdcChart.getId().indexOf("fe::Chart"), oMdcChart.getId().length);
				if (bClearSelections) {
					oModel.setProperty("/$contexts", {});
				}
				var aVizSelections = oModel.getProperty("/$contexts/" + sId + "/filters") || [];
				return aVizSelections;
			},
			getChartFilters: function(oMdcChart) {
				// get chart selections as a filter
				var aFilters = oChartUtils.getChartSelections(oMdcChart);
				return new Filter(aFilters);
			},
			setChartFilters: function(oMdcChart) {
				var sModelName = oMdcChart.data("selectedContextsModel");
				var oModel = oMdcChart.getModel(sModelName);
				var sId = oMdcChart.getId().substr(oMdcChart.getId().indexOf("fe::Chart"), oMdcChart.getId().length);
				var oChart = oMdcChart.getAggregation("_chart");
				var aChartFilters = [];
				function addChartFilters(aSelectedData) {
					for (var item in aSelectedData) {
						var aDimFilters = [];
						for (var i in aVisibleDimensions) {
							var sPath = aVisibleDimensions[i];
							var sValue = aSelectedData[item].data[sPath];
							if (sValue !== undefined) {
								aDimFilters.push(
									new Filter({
										path: sPath,
										operator: FilterOperator.EQ,
										value1: sValue
									})
								);
							}
						}
						if (aDimFilters.length > 0) {
							aChartFilters.push(new Filter(aDimFilters, true));
						}
					}
				}
				if (oChart) {
					var aVizSelections = oChart._getVizFrame().vizSelection() || [];
					var aVisibleDimensions = oChart.getVisibleDimensions();
					var aCurrentDrillStack = oChart.getDrillStack() || [];
					var aCurrentDrillView = aCurrentDrillStack.pop() || {};
					var aDimensions = aCurrentDrillView.dimension || [];
					if (aDimensions.length > 0) {
						// saving selections in each drill stack for future use
						var oDrillStack = oModel.getProperty("/$contexts/" + sId + "/drillStack") || {};
						oModel.setProperty("/$contexts/" + sId + "/drillStack", {});
						oDrillStack[aDimensions.toString()] = aVizSelections;
						oModel.setProperty("/$contexts/" + sId + "/drillStack", oDrillStack);
					}
					if (aVizSelections.length > 0) {
						// creating filters with selections in the current drillstack
						addChartFilters(aVizSelections);
					} else {
						// creating filters with selections in the previous drillstack when there are no selections in the current drillstack
						var aDrillStackKeys = Object.keys(oDrillStack) || [];
						var aPrevDrillStackData = oDrillStack[aDrillStackKeys[aDrillStackKeys.length - 2]] || [];
						addChartFilters(aPrevDrillStackData);
					}
					oModel.setProperty("/$contexts/" + sId + "/filters", aChartFilters);
				}
			},
			getFilterBarFilterInfo: function(oChart) {
				return FilterUtil.getFilterInfo(oChart.getFilter());
			},
			getAllFilterInfo: function(oChart) {
				var oFilters = oChartUtils.getFilterBarFilterInfo(oChart);
				var aChartFilters = oChartUtils.getChartFilters(oChart);
				oFilters.filters.push(aChartFilters);
				// filterbar + chart filters
				return oFilters;
			},
			getChartSelectedData: function(oChart) {
				var aSelectedPoints = [];
				switch (oChart.getSelectionBehavior()) {
					case "DATAPOINT":
						aSelectedPoints = oChart.getSelectedDataPoints().dataPoints;
						break;
					case "CATEGORY":
						aSelectedPoints = oChart.getSelectedCategories().categories;
						break;
					case "SERIES":
						aSelectedPoints = oChart.getSelectedSeries().series;
						break;
				}
				return aSelectedPoints;
			}
		};

		return oChartUtils;
	}
);
