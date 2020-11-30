/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/mdc/TableDelegate",
		"sap/ui/core/XMLTemplateProcessor",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/Fragment",
		"sap/ui/model/json/JSONModel",
		"sap/fe/macros/CommonHelper",
		"sap/fe/core/helpers/StableIdHelper",
		"sap/fe/macros/field/FieldHelper",
		"sap/fe/macros/table/TableHelper",
		"sap/fe/macros/table/Utils",
		"sap/fe/core/CommonUtils",
		"sap/ui/mdc/Table",
		"sap/fe/macros/DelegateUtil",
		"sap/ui/model/Filter",
		"sap/base/Log",
		"sap/ui/mdc/odata/v4/TypeUtil",
		"sap/fe/macros/FilterBarDelegate"
	],
	function(
		TableDelegate,
		XMLTemplateProcessor,
		XMLPreprocessor,
		Fragment,
		JSONModel,
		CommonHelper,
		StableIdHelper,
		FieldHelper,
		TableHelper,
		TableUtils,
		CommonUtils,
		MdcTable,
		DelegateUtil,
		Filter,
		Log,
		TypeUtil,
		FilterBarDelegate
	) {
		"use strict";

		var FETCHED_PROPERTIES_DATA_KEY = "sap_fe_TableDelegate_propertyInfoMap";

		/**
		 * Helper class for sap.ui.mdc.Table.
		 * <h3><b>Note:</b></h3>
		 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
		 *
		 * @author SAP SE
		 * @private
		 * @experimental
		 * @since 1.69
		 * @alias sap.fe.macros.TableDelegate
		 */
		var ODataTableDelegate = Object.assign({}, TableDelegate);

		function _getColumnsFor(oTable) {
			return CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "columns"));
		}

		function _isLineItem(oPropertyInfo) {
			return oPropertyInfo && oPropertyInfo.metadataPath.includes("@com.sap.vocabularies.UI.v1.LineItem");
		}

		function _sliceAtSlash(sPath, bLastSlash, bLastPart) {
			var iSlashIndex = bLastSlash ? sPath.lastIndexOf("/") : sPath.indexOf("/");

			if (iSlashIndex === -1) {
				return sPath;
			}
			return bLastPart ? sPath.substring(iSlashIndex + 1, sPath.length) : sPath.substring(0, iSlashIndex);
		}

		function _getTypeFromDataField(oNavigationContext, oDataField) {
			var sDataType;
			if (oDataField) {
				switch (oDataField.$Type) {
					case "com.sap.vocabularies.UI.v1.DataFieldForAction":
					case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
						sDataType = undefined;
						break;

					case "com.sap.vocabularies.UI.v1.DataField":
					case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
					case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
						sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
						break;

					case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
						var sAnnotationPath = oNavigationContext.getProperty("Target/$AnnotationPath");
						if (sAnnotationPath.indexOf("com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
							sDataType = undefined;
						} else if (sAnnotationPath.indexOf("com.sap.vocabularies.Communication.v1.Contact") > -1) {
							sDataType = oNavigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type");
						} else if (sAnnotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
							sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
						}
						break;
				}
			}

			return sDataType;
		}

		function _fetchPropertyInfo(oBindingContext, oColumnInfo) {
			var sAbsoluteNavigationPath = oColumnInfo.annotationPath,
				oMetaModel = oBindingContext.getModel(),
				oDataField = oMetaModel.getObject(oColumnInfo.annotationPath),
				oNavigationContext = oMetaModel.createBindingContext(sAbsoluteNavigationPath),
				// TODO be restrictive until MDC provides cascaded propertyInfo definition
				bSortable = oDataField.$kind === "Property" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataField";
			if (
				oDataField &&
				(oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
					oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")
			) {
				bSortable = false;
			}
			var sLabel = CommonHelper.getLabel(oNavigationContext),
				sDescription = null, // TODO this was erroneous - better having it empty for now
				sPath = CommonHelper.getIdentifyingName(oNavigationContext),
				sGroupPath = _sliceAtSlash(sPath, true),
				bInGroup = sGroupPath != sPath,
				sGroupLabel = bInGroup ? CommonHelper.getLabel(oBindingContext, sGroupPath) : null,
				bFilterable = CommonHelper.isPropertyFilterable(sPath, { context: oNavigationContext }, oDataField),
				vType =
					(oNavigationContext.getProperty("$kind") && oNavigationContext.getProperty("$Type")) ||
					_getTypeFromDataField(oNavigationContext, oDataField),
				bHidden = vType && oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true,
				bComplexType = vType && vType.indexOf("Edm.") !== 0,
				oTypeConfig = DelegateUtil.isTypeFilterable(vType) ? TypeUtil.getTypeConfig(vType) : undefined;

			return {
				name: oColumnInfo.name,
				path: sPath,
				metadataPath: sAbsoluteNavigationPath,
				groupLabel: sGroupLabel,
				group: bInGroup ? sGroupPath : null,
				label: sLabel,
				description: sDescription || sLabel,
				maxLength: oNavigationContext.$MaxLength,
				precision: oNavigationContext.$Precision,
				scale: oNavigationContext.$Scale,
				type: vType,
				typeConfig: oTypeConfig,
				filterable: bFilterable,
				sortable: bSortable,
				visible: !bHidden && !bComplexType
			};
		}

		function _fetchCustomPropertyInfo(oColumnInfo) {
			return {
				name: oColumnInfo.name,
				path: oColumnInfo.name,
				groupLabel: null,
				group: null,
				label: oColumnInfo.header,
				description: oColumnInfo.header, // property?
				maxLength: undefined, // TBD
				precision: undefined, // TBD
				scale: undefined, // TBD
				type: "Edm.String", // TBD
				filterable: false,
				sortable: false,
				visible: true
			};
		}

		function _propertyInfoFinder(sKey) {
			return function(oPropertyInfo) {
				return oPropertyInfo.name === sKey;
			};
		}

		function _fetchPropertiesForEntity(oTable, sBindingPath, oMetaModel) {
			// when fetching properties, this binding context is needed - so lets create it only once and use if for all properties/data-fields/line-items
			var oBindingContext = oMetaModel.createBindingContext(sBindingPath);
			var aFetchedProperties = [];
			return Promise.all([_getColumnsFor(oTable), DelegateUtil.fetchAnnotationsForEntity(sBindingPath, oMetaModel)]).then(function(
				aResults
			) {
				// DraftAdministrativeData does not work via 'entitySet/$NavigationPropertyBinding/DraftAdministrativeData'
				if (!aResults[0] && !aResults[1]) {
					return Promise.resolve([]);
				}
				var aColumns = aResults[0],
					mEntitySetAnnotations = aResults[1],
					aSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {},
					aNonSortableProperties = (aSortRestrictions["NonSortableProperties"] || []).map(function(oCollection) {
						return oCollection["$PropertyPath"];
					}),
					oPropertyInfo;

				aColumns.forEach(function(oColumnInfo) {
					switch (oColumnInfo.type) {
						case "Annotation":
							oPropertyInfo = _fetchPropertyInfo(oBindingContext, oColumnInfo);
							oPropertyInfo.sortable = oPropertyInfo.sortable && aNonSortableProperties.indexOf(oPropertyInfo.name) === -1;
							break;
						case "Default":
							oPropertyInfo = _fetchCustomPropertyInfo(oColumnInfo);
							oPropertyInfo.label = DelegateUtil._catchTranslationModel(oPropertyInfo.label, oTable); // Todo: To be removed once MDC provides translation support
							break;
						default:
							throw new Error("unhandled switch case " + oColumnInfo.type);
					}
					aFetchedProperties.push(oPropertyInfo);
				});
				return aFetchedProperties;
			});
		}

		function _setCachedProperties(oTable, aFetchedProperties) {
			// do not cache during templating, else it becomes part of the cached view
			if (oTable instanceof window.Element) {
				return;
			}
			DelegateUtil.setCustomData(oTable, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
		}

		function _getCachedProperties(oTable) {
			// properties are not çached during templating
			if (oTable instanceof window.Element) {
				return null;
			}
			return DelegateUtil.getCustomData(oTable, FETCHED_PROPERTIES_DATA_KEY);
		}

		function _getCachedOrFetchPropertiesForEntity(oTable, sEntitySetPath, oMetaModel) {
			var aFetchedProperties = _getCachedProperties(oTable);

			if (aFetchedProperties) {
				return Promise.resolve(aFetchedProperties);
			}
			return _fetchPropertiesForEntity(oTable, sEntitySetPath, oMetaModel).then(function(aFetchedProperties) {
				// filter out non-visible properties at the very end, they are required for proper hidden handling until here
				aFetchedProperties =
					aFetchedProperties &&
					aFetchedProperties.filter(function(oProperty) {
						return oProperty.visible;
					});
				_setCachedProperties(oTable, aFetchedProperties);
				return aFetchedProperties;
			});
		}

		function setTableNoDataText(oTable, oBindingInfo) {
			var sNoDataKey = "",
				oSmartFilterbar = TableUtils.getFilterInfo(oTable),
				suffixResourceKey = oBindingInfo.path.substr(1),
				oResourceModel = oTable.getModel("sap.fe.i18n");

			if (oSmartFilterbar.search || oSmartFilterbar.filter) {
				sNoDataKey = "T_OP_TABLE_NO_DATA_TEXT_WITH_FILTER";
			} else {
				sNoDataKey = "T_OP_TABLE_NO_DATA_TEXT";
			}

			oResourceModel &&
				oResourceModel.getResourceBundle().then(function(oResourceBundle) {
					oTable.setNoDataText(CommonUtils.getTranslatedText(sNoDataKey, oResourceBundle, null, suffixResourceKey));
				});
			return;
		}

		ODataTableDelegate.rebindTable = function(oTable, oBindingInfo) {
			if (!oTable.data("tableHidden")) {
				// Cleaning the properties in case there is table rebind : [INTERNAL] Incident 2080022392
				var localUIModel = oTable.getModel("localUI");
				var sTableId = oTable.getId().split("--")[1];
				if (localUIModel) {
					localUIModel.setProperty("/$contexts/" + sTableId + "/deleteEnabled", false);
					localUIModel.setProperty("/$contexts/" + sTableId + "/numberOfSelectedContexts", 0);
					localUIModel.setProperty("/$contexts/" + sTableId + "/selectedContexts", []);
					localUIModel.setProperty("/$contexts/" + sTableId + "/deletableContexts", []);
				}
				TableDelegate.rebindTable(oTable, oBindingInfo);
				TableUtils.onTableBound(oTable);
				setTableNoDataText(oTable, oBindingInfo);
			}
		};

		/**
		 * Fetches the relevant metadata for the table and returns property info array.
		 *
		 * @param {object} oTable - instance of the mdc Table
		 * @returns {Array} array of property info
		 */
		ODataTableDelegate.fetchProperties = function(oTable) {
			return DelegateUtil.fetchModel(oTable).then(function(oModel) {
				if (!oModel) {
					return [];
				}
				return _getCachedOrFetchPropertiesForEntity(
					oTable,
					DelegateUtil.getCustomData(oTable, "targetCollectionName"),
					oModel.getMetaModel()
				);
			});
		};

		ODataTableDelegate.updateBindingInfo = function(oTable, oMetadataInfo, oBindingInfo) {
			/**
			 * Binding info might be suspended at the beginning when the first bindRows is called:
			 * To avoid duplicate requests but still have a binding to create new entries.
			 *
			 * After the initial binding step, follow up bindings should not longer be suspended.
			 */
			if (oTable.getRowBinding()) {
				oBindingInfo.suspended = false;
			} else if (!oTable.data("tableHidden") && TableUtils.getQuickFilterKey(oTable) && oBindingInfo) {
				var fHandler = function() {
					TableUtils.handleQuickFilterCounts(oTable, oTable.getBindingContext());
				};
				TableUtils.addEventToBindingInfo(oTable, "dataRequested", fHandler);
			}

			var oFilter;
			var oFilterInfo = TableUtils.getAllFilterInfo(oTable);
			// Prepare binding info with filter/search parameters
			if (oFilterInfo.filters.length > 0) {
				oFilter = new Filter({ filters: oFilterInfo.filters, and: true });
			}
			oBindingInfo.filters = oFilter;
			if (oFilterInfo.search) {
				oBindingInfo.parameters.$search = oFilterInfo.search;
			} else {
				delete oBindingInfo.parameters.$search;
			}
		};

		function _templateCustomColumnFragment(oColumnInfo, oHandler, oModifier) {
			var oColumnModel = new JSONModel(oColumnInfo),
				oPreprocessorSettings = {
					bindingContexts: {
						"column": oColumnModel.createBindingContext("/")
					},
					models: {
						"column": oColumnModel
					}
				};

			return DelegateUtil.templateControlFragment(
				"sap.fe.macros.table.CustomColumn",
				oPreprocessorSettings,
				oHandler,
				oModifier.targets === "xmlTree"
			).then(function(oItem) {
				oColumnModel.destroy();
				return oItem;
			});
		}

		/**
		 * Invoked when a column is added using table personalization dialog.
		 * @param {string} sPropertyInfoName Name of the entity type property for which the column is added
		 * @param {sap.ui.mdc.Table} oTable Instance of Table control
		 * @param {map} mPropertyBag Instance of property bag from Flex API
		 * @returns {Promise} once resolved, a table column definition is returned
		 */
		ODataTableDelegate.addItem = function(sPropertyInfoName, oTable, mPropertyBag) {
			var oMetaModel = mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel(),
				oModifier = mPropertyBag.modifier,
				bIsXML = oModifier.targets === "xmlTree",
				sTableId = oModifier.getId(oTable),
				oController = (!bIsXML && mPropertyBag.view && mPropertyBag.view.getController()) || undefined,
				sPath,
				sGroupId,
				oValueHelp,
				oTableContext,
				oColumnInfo,
				oPropertyContext,
				oPropertyInfo,
				oParameters,
				aColumns = _getColumnsFor(oTable);

			oColumnInfo = aColumns.find(function(oColumn) {
				return oColumn.name === sPropertyInfoName;
			});
			if (!oColumnInfo) {
				Log.error(sPropertyInfoName + " not found while adding column");
				return Promise.resolve(null);
			}
			// render custom column
			if (oColumnInfo.type === "Default") {
				return _templateCustomColumnFragment(oColumnInfo, oController, oModifier);
			}

			function getEditModePropertyBinding(sEditMode) {
				return sEditMode && sEditMode.indexOf(">/") > -1 ? "{" + sEditMode + "}" : sEditMode;
			}

			// fall-back
			if (!oMetaModel) {
				return Promise.resolve(null);
			}

			sPath = DelegateUtil.getCustomData(oTable, "targetCollectionName");
			sGroupId = DelegateUtil.getCustomData(oTable, "requestGroupId") || undefined;
			oTableContext = oMetaModel.createBindingContext(sPath);

			// 1. check if this column has value help
			// 2. check if there is already a value help existing which can be re-used for the new column added

			return _getCachedOrFetchPropertiesForEntity(oTable, sPath, oMetaModel).then(function(aFetchedProperties) {
				oPropertyInfo = aFetchedProperties.find(_propertyInfoFinder(sPropertyInfoName));
				oPropertyContext = oMetaModel.createBindingContext(oPropertyInfo.metadataPath);
				oParameters = {
					sPropertyName: sPropertyInfoName,
					sBindingPath: sPath,
					sValueHelpType: "TableValueHelp",
					oControl: oTable,
					oMetaModel: oMetaModel,
					oModifier: oModifier
				};
				oValueHelp = Promise.all([
					DelegateUtil.isValueHelpRequired(oParameters),
					DelegateUtil.doesValueHelpExist(oParameters)
				]).then(function(aResults) {
					var bValueHelpRequired = aResults[0],
						bValueHelpExists = aResults[1];
					if (bValueHelpRequired && !bValueHelpExists) {
						return fnTemplateValueHelp("sap.fe.macros.table.ValueHelp");
					}
					return Promise.resolve();
				});

				function fnTemplateValueHelp(sFragmentName) {
					var oThis = new JSONModel({
							id: sTableId,
							requestGroupId: sGroupId
						}),
						oPreprocessorSettings = {
							bindingContexts: {
								"collection": oTableContext,
								"item": oPropertyContext,
								"this": oThis.createBindingContext("/")
							},
							models: {
								"this": oThis,
								"collection": oMetaModel,
								"item": oMetaModel
							}
						};

					return DelegateUtil.templateControlFragment(
						sFragmentName,
						oPreprocessorSettings,
						undefined,
						oModifier.targets === "xmlTree"
					)
						.then(function(oValueHelp) {
							if (oValueHelp) {
								oModifier.insertAggregation(oTable, "dependents", oValueHelp, 0);
							}
						})
						.catch(function(oError) {
							//We always resolve the promise to ensure that the app does not crash
							Log.error("ValueHelp not loaded : " + oError.message);
							return Promise.resolve(null);
						})
						.finally(function() {
							oThis.destroy();
						});
				}

				function fnTemplateFragment(oPropertyInfo, oHandler) {
					var sFragmentName = _isLineItem(oPropertyInfo) ? "sap.fe.macros.table.Column" : "sap.fe.macros.table.ColumnProperty",
						oThis = new JSONModel({
							editMode: getEditModePropertyBinding(DelegateUtil.getCustomData(oTable, "editModePropertyBinding")),
							onCallAction: DelegateUtil.getCustomData(oTable, "onCallAction"),
							tableType: DelegateUtil.getCustomData(oTable, "tableType"),
							onChange: DelegateUtil.getCustomData(oTable, "onChange"),
							parentControl: "Table",
							onDataFieldForIBN: DelegateUtil.getCustomData(oTable, "onDataFieldForIBN"),
							id: sTableId,
							navigationPropertyPath: sPropertyInfoName,
							columnInfo: oColumnInfo
						}),
						oPreprocessorSettings = {
							bindingContexts: {
								"collection": oTableContext,
								"dataField": oPropertyContext,
								"this": oThis.createBindingContext("/"),
								"column": oThis.createBindingContext("/columnInfo")
							},
							models: {
								"this": oThis,
								"collection": oMetaModel,
								"dataField": oMetaModel,
								"column": oThis
							}
						};

					return DelegateUtil.templateControlFragment(
						sFragmentName,
						oPreprocessorSettings,
						oHandler,
						oModifier.targets === "xmlTree"
					).finally(function() {
						oThis.destroy();
					});
				}

				return oValueHelp.then(fnTemplateFragment.bind(this, oPropertyInfo, oController));
			});
		};

		/**
		 * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields.
		 *
		 * @returns {object} Object for the Tables filter personalization.
		 */
		ODataTableDelegate.getFilterDelegate = function() {
			return {
				addFilterItem: function(oProperty, oTable) {
					return FilterBarDelegate.addP13nItem(oProperty, oTable);
				}
			};
		};

		/**
		 * Returns the typeutil attached to this delegate.
		 *
		 * @param {object} oPayload Delegate payload object
		 * @returns {sap.ui.mdc.util.TypeUtil} Any instance of TypeUtil
		 */
		ODataTableDelegate.getTypeUtil = function(oPayload) {
			return TypeUtil;
		};

		return ODataTableDelegate;
	},
	/* bExport= */ false
);
