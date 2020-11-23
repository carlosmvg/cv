/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the chart/item and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/fe/macros/ODataMetaModelUtil",
		"sap/fe/macros/CommonHelper",
		"sap/ui/model/odata/v4/AnnotationHelper",
		"sap/base/Log"
	],
	function(JSONModel, util, CommonHelper, ODataModelAnnotationHelper, Log) {
		"use strict";

		function formatJSONToString(oCrit) {
			if (!oCrit) {
				return undefined;
			}

			var sCriticality = JSON.stringify(oCrit);
			sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
			sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
			return sCriticality;
		}

		function getEntitySetPath(oAnnotationContext) {
			var sAnnoPath = oAnnotationContext.getPath(),
				sPathEntitySetPath = sAnnoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant).*/, "");

			return sPathEntitySetPath;
		}

		/**
		 * Helper class for sap.fe.macros Chart phantom control for prepecosseing.
		 * <h3><b>Note:</b></h3>
		 * The class is experimental and the API/behaviour is not finalised
		 * and hence this should not be used for productive usage.
		 * Especially this class is not intended to be used for the FE scenario,
		 * here we shall use sap.fe.macros.ChartHelper that is especially tailored for V4
		 * meta model
		 *
		 * @author SAP SE
		 * @private
		 * @experimental
		 * @since 1.62
		 * @alias sap.fe.macros.ChartHelper
		 */
		var ChartHelper = {};

		var mChartType = {
			"com.sap.vocabularies.UI.v1.ChartType/Column": "column",
			"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked": "stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/ColumnDual": "dual_column",
			"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual": "dual_stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100": "100_stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100": "100_dual_stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/Bar": "bar",
			"com.sap.vocabularies.UI.v1.ChartType/BarStacked": "stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/BarDual": "dual_bar",
			"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual": "dual_stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/BarStacked100": "100_stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100": "100_dual_stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/Area": "area",
			"com.sap.vocabularies.UI.v1.ChartType/AreaStacked": "stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/AreaStacked100": "100_stacked_column",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalArea": "bar",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked": "stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100": "100_stacked_bar",
			"com.sap.vocabularies.UI.v1.ChartType/Line": "line",
			"com.sap.vocabularies.UI.v1.ChartType/LineDual": "dual_line",
			"com.sap.vocabularies.UI.v1.ChartType/Combination": "combination",
			"com.sap.vocabularies.UI.v1.ChartType/CombinationStacked": "stacked_combination",
			"com.sap.vocabularies.UI.v1.ChartType/CombinationDual": "dual_combination",
			"com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual": "dual_stacked_combination",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked": "horizontal_stacked_combination",
			"com.sap.vocabularies.UI.v1.ChartType/Pie": "pie",
			"com.sap.vocabularies.UI.v1.ChartType/Donut": "donut",
			"com.sap.vocabularies.UI.v1.ChartType/Scatter": "scatter",
			"com.sap.vocabularies.UI.v1.ChartType/Bubble": "bubble",
			"com.sap.vocabularies.UI.v1.ChartType/Radar": "line",
			"com.sap.vocabularies.UI.v1.ChartType/HeatMap": "heatmap",
			"com.sap.vocabularies.UI.v1.ChartType/TreeMap": "treemap",
			"com.sap.vocabularies.UI.v1.ChartType/Waterfall": "waterfall",
			"com.sap.vocabularies.UI.v1.ChartType/Bullet": "bullet",
			"com.sap.vocabularies.UI.v1.ChartType/VerticalBullet": "vertical_bullet",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalWaterfall": "horizontal_waterfall",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationDual": "dual_horizontal_combination",
			"com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStackedDual": "dual_horizontal_stacked_combination"
		};

		var mMeasureRole = {
			"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
			"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
			"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
			"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
		};

		var mDimensionRole = {
			"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category": "category",
			"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series": "series",
			"com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category2": "category2"
		};
		ChartHelper.getP13nMode = function(oViewData) {
			var aPersonalization = [],
				bVariantManagement =
					oViewData.variantManagement && (oViewData.variantManagement === "Page" || oViewData.variantManagement === "Control"),
				personalization = true; // by default enabled
			if (bVariantManagement && personalization) {
				if (personalization === true) {
					// full personalization scope
					return "Sort,Type,Item";
				} else if (typeof personalization === "object") {
					if (personalization.type) {
						aPersonalization.push("Type");
					}
					if (personalization.sort) {
						aPersonalization.push("Sort");
					}
					return aPersonalization.join(",");
				}
			}
		};
		ChartHelper.formatChartType = function(oChartType) {
			return mChartType[oChartType.$EnumMember];
		};
		ChartHelper.formatDimensions = function(oAnnotationContext) {
			var oAnnotation = oAnnotationContext.getObject("./"),
				oMetaModel = oAnnotationContext.getModel(),
				sEntitySetPath = getEntitySetPath(oAnnotationContext),
				aDimensions = [],
				i,
				j;
			var bIsNavigationText = false;

			//perhaps there are no dimension attributes
			oAnnotation.DimensionAttributes = oAnnotation.DimensionAttributes || [];

			for (i = 0; i < oAnnotation.Dimensions.length; i++) {
				var sKey = oAnnotation.Dimensions[i].$PropertyPath;
				var oText = oMetaModel.getObject(sEntitySetPath + sKey + "@com.sap.vocabularies.Common.v1.Text") || {};
				if (sKey.indexOf("/") > -1) {
					Log.error("$expand is not yet supported. Dimension: " + sKey + " from an association cannot be used");
				}
				if (oText.$Path && oText.$Path.indexOf("/") > -1) {
					Log.error(
						"$expand is not yet supported. Text Property: " +
							oText.$Path +
							" from an association cannot be used for the dimension " +
							sKey
					);
					bIsNavigationText = true;
				}
				var oDimension = {
					key: sKey,
					textPath: !bIsNavigationText ? oText.$Path : undefined,
					label: oMetaModel.getObject(sEntitySetPath + sKey + "@com.sap.vocabularies.Common.v1.Label"),
					role: "category"
				};

				for (j = 0; j < oAnnotation.DimensionAttributes.length; j++) {
					var oAttribute = oAnnotation.DimensionAttributes[j];

					if (oDimension.key === oAttribute.Dimension.$PropertyPath) {
						oDimension.role = mDimensionRole[oAttribute.Role.$EnumMember] || oDimension.role;
						break;
					}
				}

				oDimension.criticality = util
					.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(sEntitySetPath + sKey))
					.then(formatJSONToString);

				aDimensions.push(oDimension);
			}

			var oDimensionModel = new JSONModel(aDimensions);
			oDimensionModel.$$valueAsPromise = true;
			return oDimensionModel.createBindingContext("/");
		};

		ChartHelper.formatMeasures = function(oAnnotationContext) {
			var oAnnotation = oAnnotationContext.getObject("./"),
				oMetaModel = oAnnotationContext.getModel(),
				sEntitySetPath = getEntitySetPath(oAnnotationContext),
				aMeasures = [],
				i,
				j,
				sDataPoint,
				oDataPoint;

			//retrieve aggregation information from entity set
			var aAnalytics = oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Analytics.v1.AggregatedProperties") || [],
				mAnalytics = {};

			for (i = 0; i < aAnalytics.length; i++) {
				mAnalytics[aAnalytics[i].Name] = aAnalytics[i];
			}

			//perhaps there are no Measure attributes
			oAnnotation.MeasureAttributes = oAnnotation.MeasureAttributes || [];

			for (i = 0; i < oAnnotation.Measures.length; i++) {
				var sKey = oAnnotation.Measures[i].$PropertyPath;
				if (sKey.indexOf("/") > -1) {
					Log.error("$expand is not yet supported. Measure: " + sKey + " from an association cannot be used");
				}
				var oMeasure = {
					key: sKey,
					label: oMetaModel.getObject(sEntitySetPath + sKey + "@com.sap.vocabularies.Common.v1.Label"),
					role: "axis1"
				};

				var oAnalytics = mAnalytics[sKey];
				if (oAnalytics) {
					oMeasure.propertyPath = oAnalytics.AggregatableProperty.$PropertyPath;
					oMeasure.aggregationMethod = oAnalytics.AggregationMethod;
					oMeasure.label = oAnalytics["@com.sap.vocabularies.Common.v1.Label"] || oMeasure.label;
				}

				for (j = 0; j < oAnnotation.MeasureAttributes.length; j++) {
					var oAttribute = oAnnotation.MeasureAttributes[j];

					if (oMeasure.key === oAttribute.Measure.$PropertyPath) {
						oMeasure.role = mMeasureRole[oAttribute.Role.$EnumMember] || oMeasure.role;

						//still to add data point, but MDC Chart API is missing
						sDataPoint = oAttribute.DataPoint ? oAttribute.DataPoint.$AnnotationPath : null;
						if (sDataPoint != null) {
							oDataPoint = oMetaModel.getObject(sEntitySetPath + sDataPoint);
							if (oDataPoint.Value.$Path == oMeasure.key) {
								oMeasure.dataPoint = formatJSONToString(util.createDataPointProperty(oDataPoint));
							}
						}
						continue;
					}
				}

				aMeasures.push(oMeasure);
			}

			var oMeasureModel = new JSONModel(aMeasures);
			return oMeasureModel.createBindingContext("/");
		};
		ChartHelper.getUiChart = function(oPresentationContext) {
			var oPresentation = oPresentationContext.getObject(oPresentationContext.getPath()),
				aPaths = oPresentationContext.sPath.split("@") || [],
				sPresentationVariantPath,
				oModel = oPresentationContext.getModel();
			if (aPaths.length && aPaths[aPaths.length - 1].indexOf("com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1) {
				var sPath = aPaths[aPaths.length - 1];
				sPath = oPresentationContext.sPath.split("/PresentationVariant")[0];
				sPresentationVariantPath = oPresentationContext.getObject(sPath + "@sapui.name");
			} else {
				sPresentationVariantPath = oPresentationContext.getObject(oPresentationContext.sPath + "@sapui.name");
			}
			if (CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath)) {
				var sChartPath,
					aVisualizations = oPresentation.Visualizations;
				for (var i = 0; i < aVisualizations.length; i++) {
					if (aVisualizations[i].$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") !== -1) {
						sChartPath = aVisualizations[i].$AnnotationPath;
						break;
					}
				}
				return oModel.getMetaContext(oPresentationContext.getPath().split("@")[0] + sChartPath);
			}
			return oPresentationContext;
		};
		ChartHelper.getMultiSelectDisabledActions = function(oChartContext, oContext) {
			var aMultiSelectDisabledActions = [],
				sActionPath,
				sActionName,
				sAnnotationPath,
				oParameterAnnotations,
				oAction,
				aChartCollection,
				aActionMetadata;

			aChartCollection = oChartContext.Actions || [];
			aActionMetadata = aChartCollection.filter(function(oItem) {
				return oItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
			});
			aActionMetadata.forEach(function(oActionMetadata) {
				sActionName = oActionMetadata.Action;
				sActionPath = CommonHelper.getActionPath(oContext.context, true, sActionName, false);
				oAction = oContext.context.getObject(sActionPath + "/@$ui5.overload/0");
				if (oAction && oAction.$Parameter && oAction.$IsBound) {
					for (var n in oAction.$Parameter) {
						sAnnotationPath = sActionPath + "/" + oAction.$Parameter[n].$Name + "@";
						oParameterAnnotations = oContext.context.getObject(sAnnotationPath);
						if (
							oParameterAnnotations &&
							((oParameterAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] &&
								oParameterAnnotations["@com.sap.vocabularies.UI.v1.Hidden"].$Path) ||
								(oParameterAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"] &&
									oParameterAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"].$Path))
						) {
							aMultiSelectDisabledActions.push(sActionName);
							break;
						}
					}
				}
			});
			return aMultiSelectDisabledActions;
		};
		ChartHelper.getOperationAvailableMap = function(oChartContext, oContext) {
			var aChartCollection = oChartContext.Actions || [];
			var oActionOperationAvailableMap = {},
				oResult;
			aChartCollection = aChartCollection || [];
			aChartCollection.forEach(function(oRecord) {
				var sActionName = oRecord.Action;
				if (
					oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" &&
					sActionName.indexOf("/") < 0 &&
					!oRecord.Determining
				) {
					oResult = CommonHelper.getActionPath(oContext.context, false, sActionName, true);
					if (oResult === null) {
						oActionOperationAvailableMap[sActionName] = null;
					} else {
						oResult = CommonHelper.getActionPath(oContext.context, false, sActionName);
						if (oResult.sProperty) {
							oActionOperationAvailableMap[sActionName] = oResult.sProperty.substr(oResult.sBindingParameter.length + 1);
						}
					}
				}
			});
			return JSON.stringify(oActionOperationAvailableMap);
		};
		ChartHelper.getBindingData = function(sTargetCollection, oContext, aActions) {
			var aOperationAvailablePath = [];
			var sSelect;
			for (var i in aActions) {
				if (aActions[i].$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
					var sActionName = aActions[i].Action;
					var oActionOperationAvailable = CommonHelper.getActionPath(oContext, false, sActionName, true);
					if (oActionOperationAvailable && oActionOperationAvailable.$Path) {
						aOperationAvailablePath.push("'" + oActionOperationAvailable.$Path + "'");
					} else if (oActionOperationAvailable === null) {
						aOperationAvailablePath.push(sActionName);
					}
				}
			}
			if (aOperationAvailablePath.length > 0) {
				//TODO: request fails with $select. check this with odata v4 model
				sSelect = " $select: '" + aOperationAvailablePath.join() + "'";
			}
			return (
				"'{path: '" +
				(oContext.getObject("$kind") === "EntitySet" ? "/" : "") +
				oContext.getObject("@sapui.name") +
				"'" +
				(sSelect ? ",parameters:{" + sSelect + "}" : "") +
				"}'"
			);
		};
		ChartHelper._getModel = function(oCollection, oInterface) {
			return oInterface.context;
		};

		/**
		 * @function
		 * @name isDataFieldForActionButtonEnabled
		 * @param {boolean} bIsBound - Specifies whether the current action is bound
		 * @param {string} sSelectedContextsModel - Context model
		 * @param {string} sId - Id of the current control
		 * @param {string} sAction - Action name of the current action model
		 * @param {object} oCollection - Collection of the chart
		 * @param {string} sOperationAvailableMap - stringified operation availaible map
		 * @param {string} sEnableSelectOn - select Config of the action for chart
		 * @returns {*} - returns boolean or string expression for enabled property of DataFieldForAction
		 */
		ChartHelper.isDataFieldForActionButtonEnabled = function(
			bIsBound,
			sSelectedContextsModel,
			sId,
			sAction,
			oCollection,
			sOperationAvailableMap,
			sEnableSelectOn
		) {
			if (bIsBound !== true) {
				return "true";
			}
			var oModel = oCollection.getModel();
			var sNavPath = oCollection.getPath();
			var sPartner = oModel.getObject(sNavPath).$Partner;
			var oOperationAvailableMap = sOperationAvailableMap && JSON.parse(sOperationAvailableMap);
			var aPath = oOperationAvailableMap && oOperationAvailableMap[sAction] && oOperationAvailableMap[sAction].split("/");
			if (sEnableSelectOn === "single") {
				var sNumberOfSelectedContexts = sSelectedContextsModel + ">/$contexts/" + sId + "/numberOfSelectedContexts} === 1";
			} else {
				var sNumberOfSelectedContexts = sSelectedContextsModel + ">/$contexts/" + sId + "/numberOfSelectedContexts} > 0";
			}

			if (aPath && aPath[0] === sPartner) {
				var sPath = oOperationAvailableMap[sAction].replace(sPartner + "/", "");
				return "{= ${" + sNumberOfSelectedContexts + " && ${" + sPath + "}}";
			} else {
				return "{= ${" + sNumberOfSelectedContexts + "}";
			}
		};

		ChartHelper.getHiddenPathExpressionForTableActionsAndIBN = function(sHiddenPath, oDetails) {
			var oContext = oDetails.context,
				sPropertyPath = oContext.getPath(),
				sEntitySetPath = ODataModelAnnotationHelper.getNavigationPath(sPropertyPath);
			if (sHiddenPath.indexOf("/") > 0) {
				var aSplitHiddenPath = sHiddenPath.split("/");
				var sNavigationPath = aSplitHiddenPath[0];
				// supports visiblity based on the property from the partner association
				if (oContext.getObject(sEntitySetPath + "/$Partner") === sNavigationPath) {
					return "{= !%{" + aSplitHiddenPath.slice(1).join("/") + "} }";
				}
				// any other association will be ignored and the button will be made visible
			}
			return true;
		};

		/**
		 * @function
		 * @name isDataFieldForIntentBasedNavigationButtonEnabled
		 * @param {boolean} bActionRequiresContext - Specifies whether the current action requires context
		 * @param {string} sSelectedContextsModel - Context model
		 * @param {string} sId - Id of the current control
		 * @returns {*} - returns boolean or string expression for enabled property of DataFieldForIBN
		 */
		ChartHelper.isDataFieldForIntentBasedNavigationButtonEnabled = function(bActionRequiresContext, sSelectedContextsModel, sId) {
			if (bActionRequiresContext) {
				return "{= %{" + sSelectedContextsModel + ">/$contexts/" + sId + "/numberOfSelectedContexts} >= 1}";
			}
			return true;
		};

		/**
		 * Method to get press event for DataFieldForActionButton.
		 *
		 * @function
		 * @name getPressEventForDataFieldForActionButton
		 * @param {string} sOnCallAction - Current Object
		 * @param {string} sSelectedContextsModel - Context model
		 * @param {string} sId - ID of the current control
		 * @param {object} oAction - Action model
		 * @param {string} sOperationAvailableMap - OperationAvailableMap Stringified JSON object
		 * @returns {string} - returns expression for press property of DataFieldForActionButton
		 */
		ChartHelper.getPressEventForDataFieldForActionButton = function(
			sOnCallAction,
			sSelectedContextsModel,
			sId,
			oAction,
			sOperationAvailableMap
		) {
			var sInvocationGrouping = "Isolated";
			if (
				oAction.InvocationGrouping &&
				oAction.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"
			) {
				sInvocationGrouping = "ChangeSet";
			}

			var oParams = {
				contexts: "${" + sSelectedContextsModel + ">/$contexts/" + sId + "/selectedContexts}",
				invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
				prefix: CommonHelper.addSingleQuotes(sId),
				operationAvailableMap: CommonHelper.addSingleQuotes(sOperationAvailableMap),
				model: "${$source>/}.getModel()",
				label: CommonHelper.addSingleQuotes(oAction.Label)
			};

			return CommonHelper.generateFunction(
				sOnCallAction,
				CommonHelper.addSingleQuotes(oAction.Action),
				CommonHelper.objectToString(oParams)
			);
		};

		/**
		 * Method to get press event for DataField for IBN Button.
		 *
		 * @function
		 * @name getPressEventForDataFieldForIntentBasedNavigationButton
		 * @param {string} sOnDataFieldForIBN - event for DataFieldForIBN
		 * @param {string} sId - ID of the current control
		 * @param {string} sSelectedContextsModel - Context model
		 * @param {object} oAction - Action model
		 * @returns {string} - returns expression for press property of DataFieldForIBNButton
		 */
		ChartHelper.getPressEventForDataFieldForIntentBasedNavigationButton = function(
			sOnDataFieldForIBN,
			sId,
			sSelectedContextsModel,
			oAction
		) {
			if (sOnDataFieldForIBN) {
				return CommonHelper.generateFunction(
					sOnDataFieldForIBN,
					"$controller",
					CommonHelper.addSingleQuotes(oAction.SemanticObject),
					CommonHelper.addSingleQuotes(oAction.Action),
					CommonHelper.addSingleQuotes(JSON.stringify(oAction.Mapping)),
					oAction.RequiresContext === true
						? "${" + sSelectedContextsModel + ">/$contexts/" + sId + "/selectedContexts}"
						: undefined
				);
			}
		};

		/**
		 * @function
		 * @name getActionType
		 * @param {object} oAction - Action model
		 * @returns {boolean} - returns a boolean value depending on the action type
		 */
		ChartHelper.getActionType = function(oAction) {
			return (
				(oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") > -1 ||
					oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForAction") > -1) &&
				oAction["Inline"]
			);
		};
		return ChartHelper;
	},
	/* bExport= */ false
);
