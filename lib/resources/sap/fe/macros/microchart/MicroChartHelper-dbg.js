/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/base/Log", "sap/m/library"],
	function(Log, mobilelibrary) {
		"use strict";

		/**
		 * Helper class used by MDC controls for OData(V4) specific handling
		 *
		 * @private
		 * @experimental This module is only for internal/experimental use!
		 */
		var ValueColor = mobilelibrary.ValueColor;

		var MicroChartHelper = {
			/**
			 * Method to do the calculation of criticality in case CriticalityCalculation present in the annotation
			 *
			 * The calculation is done by comparing a value to the threshold values relevant for the specified improvement direction.
			 * For improvement direction Target, the criticality is calculated using both low and high threshold values. It will be
			 *
			 * - Positive if the value is greater than or equal to AcceptanceRangeLowValue and lower than or equal to AcceptanceRangeHighValue
			 * - Neutral if the value is greater than or equal to ToleranceRangeLowValue and lower than AcceptanceRangeLowValue OR greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
			 * - Critical if the value is greater than or equal to DeviationRangeLowValue and lower than ToleranceRangeLowValue OR greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
			 * - Negative if the value is lower than DeviationRangeLowValue or greater than DeviationRangeHighValue
			 *
			 * For improvement direction Minimize, the criticality is calculated using the high threshold values. It is
			 * - Positive if the value is lower than or equal to AcceptanceRangeHighValue
			 * - Neutral if the value is greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
			 * - Critical if the value is greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
			 * - Negative if the value is greater than DeviationRangeHighValue
			 *
			 * For improvement direction Maximize, the criticality is calculated using the low threshold values. It is
			 *
			 * - Positive if the value is greater than or equal to AcceptanceRangeLowValue
			 * - Neutral if the value is less than AcceptanceRangeLowValue and greater than or equal to ToleranceRangeLowValue
			 * - Critical if the value is lower than ToleranceRangeLowValue and greater than or equal to DeviationRangeLowValue
			 * - Negative if the value is lower than DeviationRangeLowValue
			 *
			 * Thresholds are optional. For unassigned values, defaults are determined in this order:
			 *
			 * - For DeviationRange, an omitted LowValue translates into the smallest possible number (-INF), an omitted HighValue translates into the largest possible number (+INF)
			 * - For ToleranceRange, an omitted LowValue will be initialized with DeviationRangeLowValue, an omitted HighValue will be initialized with DeviationRangeHighValue
			 * - For AcceptanceRange, an omitted LowValue will be initialized with ToleranceRangeLowValue, an omitted HighValue will be initialized with ToleranceRangeHighValue.
			 *
			 * @param {string} sImprovementDirection ImprovementDirection to be used for creating the criticality binding
			 * @param {string} sValue value from Datapoint to be measured
			 * @param {string} sDeviationLow ExpressionBinding for Lower Deviation level
			 * @param {string} sToleranceLow ExpressionBinding for Lower Tolerance level
			 * @param {string} sAcceptanceLow ExpressionBinding for Lower Acceptance level
			 * @param {string} sAcceptanceHigh ExpressionBinding for Higher Acceptance level
			 * @param {string} sToleranceHigh ExpressionBinding for Higher Tolerance level
			 * @param {string} sDeviationHigh ExpressionBinding for Higher Deviation level
			 * @returns {string} Returns criticality calculation as expression binding
			 */
			getCriticalityCalculationBinding: function(
				sImprovementDirection,
				sValue,
				sDeviationLow,
				sToleranceLow,
				sAcceptanceLow,
				sAcceptanceHigh,
				sToleranceHigh,
				sDeviationHigh
			) {
				var sCriticalityExpression = ValueColor.Neutral; // Default Criticality State

				sValue = "%" + sValue;

				// Setting Unassigned Values
				sDeviationLow = sDeviationLow || -Infinity;
				sToleranceLow = sToleranceLow || sDeviationLow;
				sAcceptanceLow = sAcceptanceLow || sToleranceLow;
				sDeviationHigh = sDeviationHigh || Infinity;
				sToleranceHigh = sToleranceHigh || sDeviationHigh;
				sAcceptanceHigh = sAcceptanceHigh || sToleranceHigh;

				// Dealing with Decimal and Path based bingdings
				sDeviationLow = sDeviationLow && (+sDeviationLow ? +sDeviationLow : "%" + sDeviationLow);
				sToleranceLow = sToleranceLow && (+sToleranceLow ? +sToleranceLow : "%" + sToleranceLow);
				sAcceptanceLow = sAcceptanceLow && (+sAcceptanceLow ? +sAcceptanceLow : "%" + sAcceptanceLow);
				sAcceptanceHigh = sAcceptanceHigh && (+sAcceptanceHigh ? +sAcceptanceHigh : "%" + sAcceptanceHigh);
				sToleranceHigh = sToleranceHigh && (+sToleranceHigh ? +sToleranceHigh : "%" + sToleranceHigh);
				sDeviationHigh = sDeviationHigh && (+sDeviationHigh ? +sDeviationHigh : "%" + sDeviationHigh);

				// Creating runtime expression binding from criticality calculation for Criticality State
				if (sImprovementDirection.indexOf("Minimize") > -1) {
					sCriticalityExpression =
						"{= " +
						sValue +
						" <= " +
						sAcceptanceHigh +
						" ? '" +
						ValueColor.Good +
						"' : " +
						sValue +
						" <= " +
						sToleranceHigh +
						" ? '" +
						ValueColor.Neutral +
						"' : " +
						"(" +
						sDeviationHigh +
						" && " +
						sValue +
						" <= " +
						sDeviationHigh +
						") ? '" +
						ValueColor.Critical +
						"' : '" +
						ValueColor.Error +
						"' }";
				} else if (sImprovementDirection.indexOf("Maximize") > -1) {
					sCriticalityExpression =
						"{= " +
						sValue +
						" >= " +
						sAcceptanceLow +
						" ? '" +
						ValueColor.Good +
						"' : " +
						sValue +
						" >= " +
						sToleranceLow +
						" ? '" +
						ValueColor.Neutral +
						"' : " +
						"(" +
						sDeviationLow +
						" && " +
						sValue +
						" >= " +
						sDeviationLow +
						") ? '" +
						ValueColor.Critical +
						"' : '" +
						ValueColor.Error +
						"' }";
				} else if (sImprovementDirection.indexOf("Target") > -1) {
					sCriticalityExpression =
						"{= (" +
						sValue +
						" <= " +
						sAcceptanceHigh +
						" && " +
						sValue +
						" >= " +
						sAcceptanceLow +
						") ? '" +
						ValueColor.Good +
						"' : " +
						"((" +
						sValue +
						" >= " +
						sToleranceLow +
						" && " +
						sValue +
						" < " +
						sAcceptanceLow +
						") || (" +
						sValue +
						" > " +
						sAcceptanceHigh +
						" && " +
						sValue +
						" <= " +
						sToleranceHigh +
						")) ? '" +
						ValueColor.Neutral +
						"' : " +
						"((" +
						sDeviationLow +
						" && (" +
						sValue +
						" >= " +
						sDeviationLow +
						") && (" +
						sValue +
						" < " +
						sToleranceLow +
						")) || ((" +
						sValue +
						" > " +
						sToleranceHigh +
						") && " +
						sDeviationHigh +
						" && (" +
						sValue +
						" <= " +
						sDeviationHigh +
						"))) ? '" +
						ValueColor.Critical +
						"' : '" +
						ValueColor.Error +
						"' }";
				} else {
					Log.warning("Case not supported, returning the default Value Neutral");
				}

				return sCriticalityExpression;
			},

			/**
			 * Method to do the calculation of criticality in case criticality is given in terms of constant/path.
			 *
			 * @param {object} dataPoint object read from the annotation
			 * @returns {string} Returns criticality as expression binding
			 */
			getCriticalityBinding: function(dataPoint) {
				var sCriticalityExpression = ValueColor.Neutral,
					oCriticalityProperty = dataPoint.Criticality,
					sCriticalityPath;
				if (oCriticalityProperty) {
					if (oCriticalityProperty.$Path) {
						sCriticalityPath = oCriticalityProperty.$Path;
						sCriticalityExpression =
							"{= (${" +
							sCriticalityPath +
							"} === 'Negative' || ${" +
							sCriticalityPath +
							"} === '1' || ${" +
							sCriticalityPath +
							"} === 1 ) ? '" +
							ValueColor.Error +
							"' : " +
							"(${" +
							sCriticalityPath +
							"} === 'Critical' || ${" +
							sCriticalityPath +
							"} === '2' || ${" +
							sCriticalityPath +
							"} === 2 ) ? '" +
							ValueColor.Critical +
							"' : " +
							"(${" +
							sCriticalityPath +
							"} === 'Positive' || ${" +
							sCriticalityPath +
							"} === '3' || ${" +
							sCriticalityPath +
							"} === 3 ) ? '" +
							ValueColor.Good +
							"' : '" +
							ValueColor.Neutral +
							"'}";
					} else if (oCriticalityProperty.$EnumMember) {
						sCriticalityExpression = MicroChartHelper._getCriticalityFromEnum(oCriticalityProperty.$EnumMember);
					} else {
						Log.warning("Case not supported, returning the default Value Neutral");
					}
				} else {
					Log.warning("Case not supported, returning the default Value Neutral");
				}
				return sCriticalityExpression;
			},

			/**
			 * This function returns the Threshold Color for bullet micro chart.
			 *
			 * @param {string} sValue : threshold value provided in the annotations
			 * @param {object} iContext : interfaceContext with path to the threshold
			 * @returns {string} return the indicator for Threshold Color
			 */
			getThresholdColor: function(sValue, iContext) {
				var oContext = iContext.context;
				var sPath = oContext.getPath();
				var sThresholdColor = ValueColor.Neutral;

				if (sPath.indexOf("DeviationRange") > -1) {
					sThresholdColor = ValueColor.Error;
				} else if (sPath.indexOf("ToleranceRange") > -1) {
					sThresholdColor = ValueColor.Critical;
				}
				return sThresholdColor;
			},

			/**
			 * This function returns the criticality indicator from annotations if criticality is EnumMember.
			 *
			 * @param {string} sCriticality : criticality provided in the annotations
			 * @returns {sIndicator} return the indicator for criticality
			 * @private
			 */
			_getCriticalityFromEnum: function(sCriticality) {
				var sIndicator;
				if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Negative") {
					sIndicator = ValueColor.Error;
				} else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Positive") {
					sIndicator = ValueColor.Good;
				} else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Critical") {
					sIndicator = ValueColor.Critical;
				} else {
					sIndicator = ValueColor.Neutral;
				}
				return sIndicator;
			},

			/**
			 * To fetch measure attribute index.
			 *
			 * @param {Integer} iMeasure Chart Annotations
			 * @param {object} oChartAnnotations Chart Annotations
			 * @returns {string} MeasureAttribute index.
			 * @private
			 */
			getMeasureAttributeIndex: function(iMeasure, oChartAnnotations) {
				var aMeasures = oChartAnnotations.Measures,
					aMeasureAttributes = oChartAnnotations.MeasureAttributes,
					sMeasurePropertyPath = aMeasures && aMeasures[iMeasure] && aMeasures[iMeasure].$PropertyPath,
					iMeasureAttribute = -1,
					fnCheckMeasure = function(sMeasure, oMeasureAttribute, index) {
						if ((oMeasureAttribute && oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath) === sMeasure) {
							iMeasureAttribute = index;
							return true;
						}
					},
					bMeasureAttributeExists = aMeasureAttributes.some(fnCheckMeasure.bind(null, sMeasurePropertyPath));
				return bMeasureAttributeExists && iMeasureAttribute > -1 && iMeasureAttribute;
			},

			/**
			 * To fetch measures from DataPoints.
			 *
			 * @param {object} oChartAnnotations Chart Annotations
			 * @param {object} oEntityTypeAnnotations EntityType Annotations
			 * @param {string} sChartType Chart Type used
			 * @returns {string} Containing all measures.
			 * @private
			 */
			getMeasurePropertyPaths: function(oChartAnnotations, oEntityTypeAnnotations, sChartType) {
				var aPropertyPath = [];

				if (!oEntityTypeAnnotations) {
					Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint.");
					return;
				}

				oChartAnnotations.Measures.forEach(function(sMeasure, iMeasure) {
					var iMeasureAttribute = MicroChartHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations),
						oMeasureAttribute =
							iMeasureAttribute > -1 &&
							oChartAnnotations.MeasureAttributes &&
							oChartAnnotations.MeasureAttributes[iMeasureAttribute],
						oDataPoint =
							oMeasureAttribute &&
							oEntityTypeAnnotations &&
							oEntityTypeAnnotations[oMeasureAttribute.DataPoint.$AnnotationPath];
					if (oDataPoint && oDataPoint.Value && oDataPoint.Value.$Path) {
						aPropertyPath.push(oDataPoint.Value.$Path);
					} else {
						Log.warning(
							"FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute " +
								sChartType +
								" MicroChart."
						);
					}
				});

				return aPropertyPath.join(",");
			},

			/**
			 * This function returns the measureAttribute for the measure.
			 *
			 * @param {object} oContext to the measure annotation
			 * @returns {string} path to the measureAttribute of the measure
			 */
			getMeasureAttributeForMeasure: function(oContext) {
				var oMetaModel = oContext.getModel(),
					sMeasurePath = oContext.getPath(),
					sChartAnnotationPath = sMeasurePath.substring(0, sMeasurePath.lastIndexOf("Measure")),
					iMeasure = sMeasurePath.replace(/.*\//, "");

				return oMetaModel.requestObject(sChartAnnotationPath).then(function(oChartAnnotations) {
					var aMeasureAttributes = oChartAnnotations.MeasureAttributes,
						iMeasureAttribute = MicroChartHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations);
					var sMeasureAttributePath =
						iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint
							? sChartAnnotationPath + "MeasureAttributes/" + iMeasureAttribute + "/"
							: Log.warning("DataPoint missing for the measure") && undefined;
					return sMeasureAttributePath ? sMeasureAttributePath + "DataPoint/$AnnotationPath/" : sMeasureAttributePath;
				});
			},

			/**
			 * This function returns the visible expression path.
			 *
			 * @returns {string} Expression Binding for the visible.
			 */
			getHiddenPathExpression: function() {
				if (!arguments[0] && !arguments[1]) {
					return true;
				} else if (arguments[0] === true || arguments[1] === true) {
					return false;
				} else {
					var hiddenPaths = [];
					[].forEach.call(arguments, function(hiddenProperty) {
						if (hiddenProperty && hiddenProperty.$Path) {
							hiddenPaths.push("%{" + hiddenProperty.$Path + "}");
						}
					});
					return "{= " + hiddenPaths.join(" || ") + " === true ? false : true }";
				}
			},

			/**
			 * This function returns the true/false to display chart.
			 *
			 * @param {object} chartType for the chart type
			 * @param {object} sValue datapoint value of Value
			 * @param {object} sMaxValue datapoint value of MaximumValue
			 * @param {object|boolean} sValueHidden hidden path object/boolean value for the referrenced property of value
			 * @param {object|boolean} sMaxValueHidden hidden path object/boolean value for the referrenced property of MaxValue
			 * @returns {boolean} true/false to hide/show chart
			 */
			isNotAlwaysHidden: function(chartType, sValue, sMaxValue, sValueHidden, sMaxValueHidden) {
				if (sValueHidden === true) {
					this.logError(chartType, sValue);
				}
				if (sMaxValueHidden === true) {
					this.logError(chartType, sMaxValue);
				}
				if (sValueHidden === undefined && sMaxValueHidden === undefined) {
					return true;
				} else {
					return ((!sValueHidden || sValueHidden.$Path) && sValueHidden !== undefined) ||
						((!sMaxValueHidden || sMaxValueHidden.$Path) && sMaxValueHidden !== undefined)
						? true
						: false;
				}
			},

			/**
			 * This function is to log errors for missing datapoint properties.
			 * @param {string} chartType for chart type.
			 * @param {object} sValue for dynamic hidden property name.
			 */
			logError: function(chartType, sValue) {
				Log.error("Measure Property " + sValue.$Path + " is hidden for the " + chartType + " Micro Chart");
			},

			/**
			 * This function returns the formatted value with scale factor for the value displayed.
			 *
			 * @param {string} sPath propertypath for the value
			 * @param {object} oProperty for constraints
			 * @param {Integer} iFractionDigits No. of fraction digits specified from annotations
			 * @returns {string} Expression Binding for the value with scale.
			 */
			formatDecimal: function(sPath, oProperty, iFractionDigits) {
				var aConstraints = [],
					aFormatOptions = ["style: 'short'"],
					sScale = iFractionDigits || (oProperty && oProperty.$Scale) || 1,
					sBinding;

				if (sPath) {
					if (oProperty.$Nullable != undefined) {
						aConstraints.push("nullable: " + oProperty.$Nullable);
					}
					if (oProperty.$Precision != undefined) {
						aFormatOptions.push("precision: " + (oProperty.$Precision ? oProperty.$Precision : "1"));
					}
					aConstraints.push("scale: " + (sScale === "variable" ? "'" + sScale + "'" : sScale));

					sBinding =
						"{ path: '" +
						sPath +
						"'" +
						", type: 'sap.ui.model.odata.type.Decimal', constraints: { " +
						aConstraints.join(",") +
						" }, formatOptions: { " +
						aFormatOptions.join(",") +
						" } }";
				}
				return sBinding;
			},

			/**
			 * To fetch select parameters from annotations that need to be added to the list binding
			 *
			 * param {string} sGroupId groupId to be used(optional)
			 * param {string} sUoMPath unit of measure path
			 * param {string} oCriticality criticality for the chart
			 * param {object} oCC criticality calculation object conatining the paths.
			 * @returns {string} containing all the propertypaths needed to be added to the $select query of the listbinding.
			 * @private
			 */
			getSelectParameters: function() {
				var aPropertyPath = [],
					oCC = arguments[1],
					aParameters = [];

				if (arguments[0]) {
					aParameters.push("$$groupId : '" + arguments[0] + "'");
				}
				if (arguments[2]) {
					aPropertyPath.push(arguments[2]);
				} else if (oCC) {
					for (var k in oCC) {
						if (!oCC[k].$EnumMember && oCC[k].$Path) {
							aPropertyPath.push(oCC[k].$Path);
						}
					}
				}

				for (var i = 3; i < arguments.length; i++) {
					if (arguments[i]) {
						aPropertyPath.push(arguments[i]);
					}
				}

				if (aPropertyPath.length) {
					aParameters.push("$select : '" + aPropertyPath.join(",") + "'");
				}

				return aParameters.join(",");
			},

			/**
			 * To fetch DataPoint Qualifiers of measures.
			 *
			 * @param {object} oChartAnnotations Chart Annotations
			 * @param {object} oEntityTypeAnnotations EntityType Annotations
			 * @param {string} sChartType Chart Type used
			 * @returns {string} Containing all Datapoint Qualifiers.
			 * @private
			 */
			getDataPointQualifiersForMeasures: function(oChartAnnotations, oEntityTypeAnnotations, sChartType) {
				var aQualifers = [],
					aMeasureAttributes = oChartAnnotations.MeasureAttributes,
					fnAddDataPointQualifier = function(oMeasure) {
						var sMeasure = oMeasure.$PropertyPath,
							sQualifer;
						aMeasureAttributes.forEach(function(oMeasureAttribute) {
							if (
								oEntityTypeAnnotations &&
								(oMeasureAttribute && oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath) === sMeasure &&
								oMeasureAttribute.DataPoint &&
								oMeasureAttribute.DataPoint.$AnnotationPath
							) {
								var sAnnotationPath = oMeasureAttribute.DataPoint.$AnnotationPath;
								if (oEntityTypeAnnotations[sAnnotationPath]) {
									sQualifer = sAnnotationPath.indexOf("#") ? sAnnotationPath.split("#")[1] : "";
									aQualifers.push(sQualifer);
								}
							}
						});
						if (sQualifer === undefined) {
							Log.warning(
								"FE:Macro:MicroChart : Couldn't find DataPoint(Value) measure for the measureAttribute for " +
									sChartType +
									" MicroChart."
							);
						}
					};

				if (!oEntityTypeAnnotations) {
					Log.warning("FE:Macro:MicroChart : Couldn't find annotations for the DataPoint " + sChartType + " MicroChart.");
				}
				oChartAnnotations.Measures.forEach(fnAddDataPointQualifier);
				return aQualifers.join(",");
			},

			/**
			 * This function is to log warnings for missing datapoint properties.
			 * @param {string} sChart for Chart type.
			 * @param {object} oError object with properties from DataPoint.
			 */
			logWarning: function(sChart, oError) {
				for (var sKey in oError) {
					var sValue = oError[sKey];
					if (!sValue) {
						Log.warning(sKey + " parameter is missing for the " + sChart + " Micro Chart");
					}
				}
			},

			/**
			 * This function is used to get DisplayValue for comparison Microchart data aggregation.
			 * @param {object} oDataPoint data point object.
			 * @param {object} oPathText object after evaluating @com.sap.vocabularies.Common.v1.Text annotation
			 * @param {object} oValueTextPath @com.sap.vocabularies.Common.v1.Text/$Path/$ evaluation value of the annotation
			 * @param {object} oValueDataPointPath DataPoint>Value/$Path/$ value after evaluating annotation
			 * @returns {string} sResult Expression binding for Display Value for comparison Microchart's aggregation data.
			 */
			getDisplayValueForMicroChart: function(oDataPoint, oPathText, oValueTextPath, oValueDataPointPath) {
				var sValueFormat = oDataPoint.ValueFormat && oDataPoint.ValueFormat.NumberOfFractionalDigits,
					sResult;
				if (oPathText) {
					sResult = MicroChartHelper.formatDecimal(oPathText["$Path"], oValueTextPath, sValueFormat);
				} else {
					sResult = MicroChartHelper.formatDecimal(oDataPoint.Value["$Path"], oValueDataPointPath, sValueFormat);
				}
				return sResult;
			},
			/**
			 * This function is used to check whether microchart is enabled or not by checking properties, chart annotations, hidden properties.
			 * @param {string} sChartType MicroChart Type eg:- Bullet.
			 * @param {object} oDataPoint data point object.
			 * @param {object} oDataPointValue object with $Path annotation to get hidden value path
			 * @param {object} oChartAnnotations chartAnnotation object
			 * @param {object} oDatapointMaxValue object with $Path annotation to get hidden max value path
			 * @returns {boolean} chart has all values and properties and also it is not always hidden sFinalDataPointValue && bMicrochartVisible.
			 */
			shouldMicroChartRender: function(sChartType, oDataPoint, oDataPointValue, oChartAnnotations, oDatapointMaxValue) {
				var aChartTypes = ["Area", "Column", "Comparison"],
					sDataPointValue = oDataPoint && oDataPoint.Value,
					sHiddenPath = oDataPointValue && oDataPointValue["com.sap.vocabularies.UI.v1.Hidden"],
					sChartAnnotationDimension = oChartAnnotations && oChartAnnotations.Dimensions && oChartAnnotations.Dimensions[0],
					oFinalDataPointValue =
						aChartTypes.indexOf(sChartType) > -1 ? sDataPointValue && sChartAnnotationDimension : sDataPointValue; // only for three charts in array
				if (sChartType === "Harvey") {
					var oDataPointMaximumValue = oDataPoint && oDataPoint.MaximumValue,
						sMaxValueHiddenPath = oDatapointMaxValue && oDatapointMaxValue["com.sap.vocabularies.UI.v1.Hidden"];
					return (
						sDataPointValue &&
						oDataPointMaximumValue &&
						MicroChartHelper.isNotAlwaysHidden(
							"Bullet",
							sDataPointValue,
							oDataPointMaximumValue,
							sHiddenPath,
							sMaxValueHiddenPath
						)
					);
				}
				return oFinalDataPointValue && MicroChartHelper.isNotAlwaysHidden(sChartType, sDataPointValue, undefined, sHiddenPath);
			},
			/**
			 * This function is used to get dataPointQualifiers for Column, Comparison and StackedBar Microcharts.
			 *
			 * @param {string} sUiName
			 * @returns {*} Result string or undefined.
			 */
			getdataPointQualifiersForMicroChart: function(sUiName) {
				if (sUiName.indexOf("com.sap.vocabularies.UI.v1.DataPoint") === -1) {
					return undefined;
				}
				if (sUiName.indexOf("#") > -1) {
					return sUiName.split("#")[1];
				}
				return "";
			},
			/**
			 * This function is used to get colorPalette for comparison and HarveyBall Microcharts.
			 * @param {object} oDataPoint data point object.
			 * @returns {*} Result string for colorPalette or undefined.
			 */
			getcolorPaletteForMicroChart: function(oDataPoint) {
				return oDataPoint.Criticality
					? undefined
					: "sapUiChartPaletteQualitativeHue1, sapUiChartPaletteQualitativeHue2, sapUiChartPaletteQualitativeHue3,          sapUiChartPaletteQualitativeHue4, sapUiChartPaletteQualitativeHue5, sapUiChartPaletteQualitativeHue6, sapUiChartPaletteQualitativeHue7,          sapUiChartPaletteQualitativeHue8, sapUiChartPaletteQualitativeHue9, sapUiChartPaletteQualitativeHue10, sapUiChartPaletteQualitativeHue11";
			},
			/**
			 * This function is used to get MeasureScale for Area, Column and Line Microcharts.
			 * @param {object} oDataPoint data point object.
			 * @returns {number} Datapoint valueformat or datapoint scale or 1.
			 */
			getMeasureScaleForMicroChart: function(oDataPoint) {
				if (oDataPoint.ValueFormat && oDataPoint.ValueFormat.NumberOfFractionalDigits) {
					return oDataPoint.ValueFormat.NumberOfFractionalDigits;
				}
				if (oDataPoint.Value && oDataPoint.Value["$Path"] && oDataPoint.Value["$Path"]["$Scale"]) {
					return oDataPoint.Value["$Path"]["$Scale"];
				}
				return 1;
			},
			/**
			 * This function is to return the binding expression of microchart.
			 * @param {string} sChartType type of microchart (Bullet, Radial etc.)
			 * @param {object} oMeasure Measure value for microchart.
			 * @param {object} oThis this/current model for microchart.
			 * @param {object} oCollection collection object.
			 * @param {string} sUiName @sapui.name in collection model is not accessible here from model hence need to pass it.
			 * @param {object} oDataPoint data point object used in case of Harvey Ball Microchart
			 * @returns {string} binding expression for microchart.
			 * @private
			 */
			getBindingExpressionForMicrochart: function(sChartType, oMeasure, oThis, oCollection, sUiName, oDataPoint) {
				var bCondition = oCollection["$isCollection"] || oCollection["$kind"] === "EntitySet",
					sPath = bCondition ? "" : sUiName,
					sCurrencyOrUnit = MicroChartHelper.getCurrencyOrUnit(oMeasure),
					sDataPointCriticallity = "";
				switch (sChartType) {
					case "Radial":
						sCurrencyOrUnit = "";
						break;
					case "Harvey":
						sDataPointCriticallity = oDataPoint.Criticality ? oDataPoint.Criticality["$Path"] : "";
						break;
				}
				var sFunctionValue = MicroChartHelper.getSelectParameters(oThis.groupId, "", sDataPointCriticallity, sCurrencyOrUnit),
					sBinding = "{ path: '" + sPath + "'" + ", parameters : {" + sFunctionValue + "} }";
				return sBinding;
			},
			/**
			 * This function is to return the UOMPath expression of microchart.
			 * @param {boolean} bRenderLabels Wheather labels can be rendered or not.
			 * @param {object} oMeasure measures for microchart.
			 * @returns {string} UOMPath String for microchart.
			 * @private
			 */
			getUOMPathForMicrochart: function(bRenderLabels, oMeasure) {
				var bResult;
				if (oMeasure && bRenderLabels) {
					bResult =
						(oMeasure["@Org.OData.Measures.V1.ISOCurrency"] && oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path) ||
						(oMeasure["@Org.OData.Measures.V1.Unit"] && oMeasure["@Org.OData.Measures.V1.Unit"].$Path);
				}
				return bResult ? bResult : "";
			},

			/**
			 * This function is to return the Aggregation binding expression of microchart.
			 * @param {string} sAggregationType Aggregation type of chart (eg:- Point for AreaMicrochart)
			 * @param {object} oCollection collection object.
			 * @param {object} oDataPoint Data point info for microchart.
			 * @param {string} sUiName @sapui.name in collection model is not accessible here from model hence need to pass it.
			 * @param {object} oDimension Microchart Dimensions.
			 * @param {object} oMeasure Measure value for microchart.
			 * @param {string} sMeasureOrDimensionBar passed specifically in case of bar chart
			 * @returns {string} Aggregation binding expression for microchart.
			 * @private
			 */
			getAggregationForMicrochart: function(
				sAggregationType,
				oCollection,
				oDataPoint,
				sUiName,
				oDimension,
				oMeasure,
				sMeasureOrDimensionBar
			) {
				var sPath = oCollection["$kind"] === "EntitySet" ? "/" : "",
					sPath = sPath + sUiName,
					sGroupId = "",
					sDataPointCriticallityCalc = "",
					sDataPointCriticallity = oDataPoint.Criticality ? oDataPoint.Criticality["$Path"] : "",
					sCurrencyOrUnit = MicroChartHelper.getUOMPathForMicrochart(true, oMeasure),
					sTargetValuePath = "",
					sDimensionPropertyPath = "";
				if (oDimension && oDimension.$PropertyPath && oDimension.$PropertyPath["@com.sap.vocabularies.Common.v1.Text"]) {
					sDimensionPropertyPath = oDimension.$PropertyPath["@com.sap.vocabularies.Common.v1.Text"].$Path;
				} else {
					sDimensionPropertyPath = oDimension.$PropertyPath;
				}
				switch (sAggregationType) {
					case "Points":
						sDataPointCriticallityCalc = oDataPoint && oDataPoint.CriticalityCalculation;
						sTargetValuePath = oDataPoint && oDataPoint.TargetValue && oDataPoint.TargetValue["$Path"];
						sDataPointCriticallity = "";
						break;
					case "Columns":
						sDataPointCriticallityCalc = oDataPoint && oDataPoint.CriticalityCalculation;
						break;
					case "LinePoints":
						sDataPointCriticallity = "";
						break;
					case "Bars":
						sDimensionPropertyPath = "";
						break;
				}
				var sFunctionValue = MicroChartHelper.getSelectParameters(
						sGroupId,
						sDataPointCriticallityCalc,
						sDataPointCriticallity,
						sCurrencyOrUnit,
						sTargetValuePath,
						sDimensionPropertyPath,
						sMeasureOrDimensionBar
					),
					sAggregationExpression = "{path:'" + sPath + "'" + ", parameters : {" + sFunctionValue + "} }";
				return sAggregationExpression;
			},
			getCurrencyOrUnit: function(oMeasure) {
				if (oMeasure["@Org.OData.Measures.V1.ISOCurrency"]) {
					return oMeasure["@Org.OData.Measures.V1.ISOCurrency"].$Path || oMeasure["@Org.OData.Measures.V1.ISOCurrency"];
				} else if (oMeasure["@Org.OData.Measures.V1.Unit"]) {
					return oMeasure["@Org.OData.Measures.V1.Unit"].$Path || oMeasure["@Org.OData.Measures.V1.Unit"];
				} else {
					return "";
				}
			}
		};

		return MicroChartHelper;
	},
	/* bExport= */ true
);
