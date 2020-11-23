/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/ui/model/Filter",
		"sap/ui/core/format/NumberFormat",
		"sap/fe/core/CommonUtils",
		"sap/fe/macros/filter/FilterUtils",
		"sap/base/Log",
		"sap/fe/macros/DelegateUtil"
	],
	function(Filter, NumberFormat, CommonUtils, FilterUtils, Log, DelegateUtil) {
		"use strict";

		/**
		 * Get filter information for a SelectionVariant annotation.
		 *
		 * @param {object} oTable Table instance
		 * @param {string} sSvPath relative SelectionVariant annotation path
		 * @returns {object} Information on filters
		 *  filters: array of sap.ui.model.filters
		 * text: selection Variant text property
		 * @private
		 * @sap-restricted
		 */
		function getFiltersInfoforSV(oTable, sSvPath) {
			var sEntitySetPath = oTable.data("targetCollectionName"),
				oMetaModel = CommonUtils.getAppComponent(oTable).getMetaModel(),
				oSelectionVariant = oMetaModel.getObject(sEntitySetPath + "/@" + sSvPath),
				aFilters = [],
				sText = "";
			if (oSelectionVariant && oSelectionVariant.SelectOptions) {
				sText = oSelectionVariant.Text;
				for (var i in oSelectionVariant.SelectOptions) {
					var oSelectOption = oSelectionVariant.SelectOptions[i];
					if (oSelectOption && oSelectOption.PropertyName) {
						var sPath = oSelectOption.PropertyName.$PropertyPath;
						for (var j in oSelectOption.Ranges) {
							var oRange = oSelectOption.Ranges[j];
							aFilters.push(new Filter(sPath, oRange.Option.$EnumMember.split("/").pop(), oRange.Low, oRange.High));
						}
					}
				}
			}

			return {
				filters: aFilters,
				text: sText
			};
		}

		/**
		 * Get all table hiddenFilters configured via macro table parameter 'filters'.
		 *
		 * @param {object} oTable Table instance
		 * @returns {Array} Information on filters
		 * @private
		 * @sap-restricted
		 */
		function getHiddenFilters(oTable) {
			var aFilters = [],
				hiddenFilters = oTable.data("hiddenFilters");
			if (hiddenFilters && Array.isArray(hiddenFilters.paths)) {
				hiddenFilters.paths.forEach(function(mPath) {
					var oSvFilter = getFiltersInfoforSV(oTable, mPath.annotationPath);
					aFilters = aFilters.concat(oSvFilter.filters);
				});
			}
			return aFilters;
		}

		/**
		 * Get all table quickFilters configured via macro table parameter 'filters'.
		 *
		 * @param {object} oTable Table instance
		 * @returns {Array} Information on filters
		 * @private
		 * @sap-restricted
		 */
		function getQuickFilters(oTable) {
			var aFilters = [],
				sQuickFilterKey = getQuickFilterKey(oTable);
			if (sQuickFilterKey) {
				aFilters = aFilters.concat(getFiltersInfoforSV(oTable, sQuickFilterKey).filters);
			}
			return aFilters;
		}

		/**
		 * Get all table configured via macro table parameter 'filters' (quickFilters and hiddenFilters).
		 *
		 * @param {object} oTable Table instance
		 * @returns {Array} Information on filters
		 * @private
		 * @sap-restricted
		 */
		function getTableFilters(oTable) {
			return getQuickFilters(oTable).concat(getHiddenFilters(oTable));
		}

		/**
		 * Initialize table data 'quickFilterKey' with the first QuickFilter item.
		 *
		 * @param {object} oTable Table instance
		 * @private
		 * @sap-restricted
		 */
		function initializeQuickFilterKey(oTable) {
			var oSvControl = oTable.getQuickFilter();
			if (oSvControl) {
				var oSvItems = oSvControl.getItems();
				if (oSvItems.length > 0) {
					var sKey = oSvItems[0].getKey();
					oSvControl.setSelectedKey(sKey);
					oTable.data("quickFilterKey", sKey);
				}
			}
		}

		/**
		 * Add binding event listener.
		 *
		 * @param {object} oTable - Table instance
		 * @param {object} sEventName - Event name
		 * @param {object} fHandler - Handler to be called
		 * @private
		 * @sap-restricted
		 */
		function addEventToBindingInfo(oTable, sEventName, fHandler) {
			var oBindingInfo = oTable.getRowsBindingInfo();
			if (oBindingInfo) {
				if (!oBindingInfo.events) {
					oBindingInfo.events = {};
				}
				if (!oBindingInfo.events[sEventName]) {
					oBindingInfo.events[sEventName] = fHandler;
				} else {
					var fOriginalHandler = oBindingInfo.events[sEventName];
					oBindingInfo.events[sEventName] = function() {
						fHandler.apply(this, arguments);
						fOriginalHandler.apply(this, arguments);
					};
				}
			}
		}

		/**
		 * Create List Bind Context request for a Table with additional filters.
		 *
		 * @param {object} oTable Table instance
		 * @param {sap.ui.model.Context} oPageBinding  Page Binding Context where the Table is set
		 * @param {object} oParams additional settings for the List Binding
		 * 	oParams: {
		 * 		batchGroupId: 	group ID to be used for read requests triggered by this binding
		 * 		additionalFilters: Filters to add on Table Fitlers 	for the items/rows count
		 * }
		 * @returns {Promise} Promise containing the ListBinding Context request
		 * @private
		 * @sap-restricted
		 */
		function getListBindingForCount(oTable, oPageBinding, oParams) {
			var oBindingInfo = oTable.getRowsBindingInfo(),
				oDataModel = oTable.getModel(),
				oListBinding,
				oTableContextFilter,
				sBatchId = oParams.batchGroupId || "",
				oFilterInfo = getFilterInfo(oTable),
				aFilters = Array.isArray(oParams.additionalFilters) ? oParams.additionalFilters : [];

			aFilters = aFilters.concat(oFilterInfo.filters);
			oTableContextFilter = new Filter({
				filters: aFilters,
				and: true
			});

			oListBinding = oDataModel.bindList(
				(oPageBinding ? oPageBinding.getPath() + "/" : "") + oBindingInfo.path,
				oTable.getBindingContext(),
				null,
				oTableContextFilter,
				{
					$count: true,
					$$groupId: sBatchId || "$auto",
					$search: oFilterInfo.search
				}
			);
			return oListBinding.requestContexts(0, 1).then(function(oContext) {
				var iCount = oContext && oContext.length ? oContext[0].getBinding().getLength() : 0;
				oListBinding.destroy();
				return iCount;
			});
		}

		/**
		 * Manage List Binding request related to Counts on QuickFilter control and update text
		 * in line with batch result.
		 *
		 * @param {object} oTable Table Instance
		 * @param {sap.ui.model.Context} oPageBinding  Page Binding Context where the Table is set
		 * @private
		 * @sap-restricted
		 */
		function handleQuickFilterCounts(oTable, oPageBinding) {
			var sSelectedSVKey = getQuickFilterKey(oTable);

			if (sSelectedSVKey) {
				var oSvControl = oTable.getQuickFilter();

				//Needs to create a bindList for each Selection Variant if "counts" is requested
				if (oSvControl.data("showCounts") === "true") {
					var oSvItems = oSvControl.getItems(),
						aBindingPromises = [],
						aInitialItemTexts = [],
						aAdditionnalFilters = [];

					aAdditionnalFilters = aAdditionnalFilters.concat(getHiddenFilters(oTable));

					for (var k in oSvItems) {
						var sItemKey = oSvItems[k].getKey(),
							oFilterInfos = getFiltersInfoforSV(oTable, sItemKey);
						aInitialItemTexts.push(oFilterInfos.text);
						oSvItems[k].setText(aInitialItemTexts[k] + " (...)");
						aBindingPromises.push(
							getListBindingForCount(oTable, oPageBinding, {
								batchGroupId: sItemKey === getQuickFilterKey(oTable) ? oSvControl.data("batchGroupId") : "$auto",
								additionalFilters: aAdditionnalFilters.concat(oFilterInfos.filters)
							})
						);
					}

					Promise.all(aBindingPromises)
						.then(function(aCounts) {
							for (var k in aCounts) {
								oSvItems[k].setText(aInitialItemTexts[k] + " (" + getCountFormatted(aCounts[k]) + ")");
							}
						})
						.catch(function(oError) {
							Log.error("Error while retrieving the binding promises", oError);
						});
				}
			}
		}

		function getCountFormatted(iCount) {
			var oCountFormatter = NumberFormat.getIntegerInstance({ groupingEnabled: true });
			return oCountFormatter.format(iCount);
		}

		function getFilterInfo(oTable) {
			return FilterUtils.getFilterInfo(oTable.getFilter());
		}

		/**
		 * Retrieves all filters configured in Table filter personalization dialog.
		 *
		 * @param {sap.ui.mdc.Table} oTable Table instance
		 * @returns {Array} aP13nFilters Filters configured in table personalization dialog
		 * @private
		 * @sap-restricted
		 */
		function getP13nFilters(oTable) {
			var aP13nMode = oTable.getP13nMode();
			if (aP13nMode && aP13nMode.indexOf("Filter") > -1) {
				var aTableProperties = DelegateUtil.getCustomData(oTable, "sap_fe_TableDelegate_propertyInfoMap"),
					oFilterInfo = FilterUtils.getFilterInfo(oTable, aTableProperties);
				if (oFilterInfo && oFilterInfo.filters) {
					return oFilterInfo.filters;
				}
			}
			return [];
		}

		/**
		 * Retrieves current QuickFilter key.
		 *
		 * @param {sap.ui.mdc.Table} oTable Table instance
		 * @returns {string} Current QuickFilter Key
		 * @private
		 * @sap-restricted
		 */
		function getQuickFilterKey(oTable) {
			return oTable.data("quickFilterKey");
		}

		function getFilterInfo(oTable) {
			return FilterUtils.getFilterInfo(oTable.getFilter());
		}

		function getAllFilterInfo(oTable) {
			var oIFilterInfo = getFilterInfo(oTable);
			return { filters: oIFilterInfo.filters.concat(getTableFilters(oTable), getP13nFilters(oTable)), search: oIFilterInfo.search };
		}

		/**
		 * Returns a promise that is resolved with the table itself when the table was bound.
		 * @param {sap.ui.mdc.Table} oTable the table to check for binding
		 * @returns {Promise} the Promise that will be resolved when table is bound
		 */
		function whenBound(oTable) {
			return _getOrCreateBoundPromiseInfo(oTable).promise;
		}

		/**
		 * If not yet happened, it resolves the table bound promise.
		 * @param {sap.ui.mdc.Table} oTable the table that was bound
		 */
		function onTableBound(oTable) {
			var oBoundPromiseInfo = _getOrCreateBoundPromiseInfo(oTable);
			if (oBoundPromiseInfo.resolve) {
				oBoundPromiseInfo.resolve(oTable);
				oTable.data("boundPromiseResolve", null);
			}
		}

		function _getOrCreateBoundPromiseInfo(oTable) {
			if (!oTable.data("boundPromise")) {
				var fnResolve;
				oTable.data(
					"boundPromise",
					new Promise(function(resolve) {
						fnResolve = resolve;
					})
				);
				if (oTable.isBound()) {
					fnResolve(oTable);
				} else {
					oTable.data("boundPromiseResolve", fnResolve);
				}
			}
			return { promise: oTable.data("boundPromise"), resolve: oTable.data("boundPromiseResolve") };
		}

		var oTableUtils = {
			addEventToBindingInfo: addEventToBindingInfo,
			getCountFormatted: getCountFormatted,
			getFiltersInfoforSV: getFiltersInfoforSV,
			getTableFilters: getTableFilters,
			getQuickFilters: getQuickFilters,
			handleQuickFilterCounts: handleQuickFilterCounts,
			initializeQuickFilterKey: initializeQuickFilterKey,
			getQuickFilterKey: getQuickFilterKey,
			getListBindingForCount: getListBindingForCount,
			getFilterInfo: getFilterInfo,
			getP13nFilters: getP13nFilters,
			getAllFilterInfo: getAllFilterInfo,
			whenBound: whenBound,
			onTableBound: onTableBound
		};

		return oTableUtils;
	}
);
