/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the FilterBar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/mdc/FilterBarDelegate",
		"sap/ui/core/XMLTemplateProcessor",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/Fragment",
		"sap/ui/model/json/JSONModel",
		"sap/fe/macros/CommonHelper",
		"sap/fe/core/helpers/StableIdHelper",
		"sap/fe/macros/field/FieldHelper",
		"sap/base/util/ObjectPath",
		"sap/ui/mdc/odata/v4/TypeUtil",
		"sap/ui/model/odata/type/String",
		"sap/fe/macros/ResourceModel",
		"sap/base/util/merge",
		"sap/fe/macros/DelegateUtil",
		"sap/fe/macros/FilterBarHelper",
		"sap/base/Log",
		"sap/ui/model/odata/v4/AnnotationHelper",
		"sap/base/util/JSTokenizer"
	],
	function(
		FilterBarDelegate,
		XMLTemplateProcessor,
		XMLPreprocessor,
		Fragment,
		JSONModel,
		CommonHelper,
		StableIdHelper,
		FieldHelper,
		ObjectPath,
		TypeUtil,
		StringType,
		ResourceModel,
		mergeObjects,
		DelegateUtil,
		FilterBarHelper,
		Log,
		AnnotationHelper,
		JSTokenizer
	) {
		"use strict";
		var ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate),
			EDIT_STATE_PROPERTY_NAME = "$editState",
			SEARCH_PROPERTY_NAME = "$search",
			VALUE_HELP_TYPE = "FilterFieldValueHelp";

		function _isMultiValue(oProperty) {
			var bIsMultiValue = true;

			//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression

			switch (oProperty.filterExpression) {
				case "SearchExpression":
				case "SingleRange":
				case "SingleValue":
					bIsMultiValue = false;
					break;
			}

			if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
				bIsMultiValue = false;
			}

			return bIsMultiValue;
		}

		function _getSearchFilterPropertyInfo() {
			return {
				name: SEARCH_PROPERTY_NAME,
				path: SEARCH_PROPERTY_NAME,
				typeConfig: TypeUtil.getTypeConfig("sap.ui.model.odata.type.String"),
				maxConditions: 1
			};
		}

		function _getEditStateFilterPropertyInfo() {
			return {
				name: EDIT_STATE_PROPERTY_NAME,
				path: EDIT_STATE_PROPERTY_NAME,
				groupLabel: "",
				group: null,
				label: ResourceModel.getText("M_COMMON_FILTERBAR_EDITING_STATUS"),
				tooltip: null,
				hiddenFilter: false,
				typeConfig: TypeUtil.getTypeConfig("sap.ui.model.odata.type.String"),

				defaultFilterConditions: [
					{
						fieldPath: "$editState",
						operator: "DRAFT_EDIT_STATE",
						values: ["0"]
					}
				]
			};
		}

		function _templateEditState(oFilterBar, bIsXml) {
			var oThis = new JSONModel({
					id: DelegateUtil.getCustomData(oFilterBar, "localId"),
					draftEditStateModelName: DelegateUtil.getCustomData(oFilterBar, "draftEditStateModelName")
				}),
				oPreprocessorSettings = {
					bindingContexts: {
						"this": oThis.createBindingContext("/")
					},
					models: {
						"this.i18n": ResourceModel.getModel(),
						"this": oThis
					}
				};

			return DelegateUtil.templateControlFragment("sap.fe.macros.filter.EditState", oPreprocessorSettings, undefined, bIsXml);
		}

		function _fetchPropertyInfo(oProperty, sNavigationProperty, sKey, sBindingPath, oMetaModel) {
			var oPropertyAnnotations = oMetaModel.getObject(sNavigationProperty + "/" + sKey + "@"),
				oCollectionAnnotations = oMetaModel.getObject(sNavigationProperty + "/@"),
				oFilterDefaultValue,
				oFilterDefaultValueAnnotation,
				bIsHidden,
				bIsHiddenFilter,
				bIsFilterableType,
				oPropertyInfo,
				sGroupLabel =
					sNavigationProperty !== sBindingPath
						? oMetaModel.getObject(sNavigationProperty + "@com.sap.vocabularies.Common.v1.Label") ||
						  oMetaModel.getObject(sNavigationProperty + "/@com.sap.vocabularies.Common.v1.Label") ||
						  oMetaModel.getObject(sNavigationProperty + "@sapui.name")
						: "",
				sLabel = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
				sPath =
					sNavigationProperty.indexOf("/$NavigationPropertyBinding") === -1
						? sNavigationProperty.substr(sBindingPath.length)
						: sNavigationProperty.substr((sBindingPath + "/$NavigationPropertyBinding").length),
				oPropertyContext = oMetaModel.createBindingContext(sNavigationProperty + "/" + sKey);

			// check if hidden
			bIsHidden = CommonHelper.getBoolAnnotationValue(oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]);

			// check if type can be used for filtering, unsupported types are eg. Edm.Stream, field control, messages -> they have no sap.ui.model.type correspondence
			bIsFilterableType = DelegateUtil.isTypeFilterable(oProperty.$Type);
			if (bIsHidden || !bIsFilterableType) {
				return false;
			}

			//check if hidden filter
			bIsHiddenFilter = CommonHelper.getBoolAnnotationValue(oPropertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"]);

			oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
			if (oFilterDefaultValueAnnotation) {
				oFilterDefaultValue = oFilterDefaultValueAnnotation["$" + DelegateUtil.getModelType(oProperty.$Type)];
			}

			// /_NavigationProperty1/_NavigationProperty2/Property
			if (sPath.indexOf("/") === 0) {
				sPath = sPath.substr(1);
			}

			// Show the labels of previous two navigations if there
			var sFirstLabel, sSecondLabel, sSecondToLastNavigation;
			if (sPath.split("/").length > 1) {
				sSecondToLastNavigation = sBindingPath + "/" + sPath.substr(0, sPath.lastIndexOf("/"));
				sFirstLabel =
					oMetaModel.getObject(sSecondToLastNavigation + "@com.sap.vocabularies.Common.v1.Label") ||
					oMetaModel.getObject(sSecondToLastNavigation + "/@com.sap.vocabularies.Common.v1.Label");
				sSecondLabel = sGroupLabel;
				sGroupLabel = sFirstLabel + " > " + sSecondLabel;
			}

			if (sPath) {
				sPath = sPath + "/";
			}
			sPath = sPath + sKey;

			oPropertyInfo = {
				name: sPath,
				path: sPath,
				groupLabel: sGroupLabel || "",
				group: sNavigationProperty,
				label: sLabel,
				tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || null,
				hiddenFilter: bIsHiddenFilter
			};

			if (oFilterDefaultValue) {
				oPropertyInfo.defaultFilterConditions = [
					{
						fieldPath: sKey,
						operator: "EQ",
						values: [oFilterDefaultValue]
					}
				];
			}

			// format options
			oPropertyInfo.formatOptions = JSTokenizer.parseJS(FieldHelper.formatOptions(oProperty, { context: oPropertyContext }) || "{}");
			// constraints
			oPropertyInfo.constraints = JSTokenizer.parseJS(FieldHelper.constraints(oProperty, { context: oPropertyContext }) || "{}");

			oPropertyInfo.typeConfig = TypeUtil.getTypeConfig(oProperty.$Type, oPropertyInfo.formatOptions, oPropertyInfo.constraints);
			oPropertyInfo.display = FieldHelper.displayMode(oPropertyAnnotations, oCollectionAnnotations);

			return oPropertyInfo;
		}

		function _fetchPropertiesForEntity(sEntitySetPath, oMetaModel) {
			return Promise.all([
				DelegateUtil.fetchPropertiesForEntity(sEntitySetPath, oMetaModel),
				DelegateUtil.fetchAnnotationsForEntity(sEntitySetPath, oMetaModel)
			]).then(function(aResults) {
				var oEntityType = aResults[0],
					mEntitySetAnnotations = aResults[1];
				if (!oEntityType) {
					return Promise.resolve([]);
				}
				var oObj,
					oPropertyInfo,
					aFetchedProperties = [],
					aNonFilterableProps = [],
					aRequiredProps = [],
					aSelectionFields = [],
					mAllowedExpressions = {},
					oAnnotation = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];

				if (oAnnotation) {
					if (oAnnotation.NonFilterableProperties) {
						aNonFilterableProps = oAnnotation.NonFilterableProperties.map(function(oProperty) {
							return oProperty.$PropertyPath;
						});
					}

					if (oAnnotation.RequiredProperties) {
						aRequiredProps = oAnnotation.RequiredProperties.map(function(oProperty) {
							return oProperty.$PropertyPath;
						});
					}

					if (oAnnotation.FilterExpressionRestrictions) {
						oAnnotation.FilterExpressionRestrictions.forEach(function(oProperty) {
							//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
							mAllowedExpressions[oProperty.Property.$PropertyPath] = oProperty.AllowedExpressions;
						});
					}
				}

				// find selection fields
				oAnnotation = oMetaModel.getObject(sEntitySetPath + "/" + "@com.sap.vocabularies.UI.v1.SelectionFields");
				if (oAnnotation) {
					aSelectionFields = oAnnotation.map(function(oProperty) {
						return oProperty.$PropertyPath;
					});
				}

				Object.keys(oEntityType).forEach(function(sKey) {
					oObj = oEntityType[sKey];
					if (oObj && oObj.$kind === "Property") {
						// skip non-filterable property
						if (aNonFilterableProps.indexOf(sKey) >= 0) {
							return;
						}
						oPropertyInfo = _fetchPropertyInfo(oObj, sEntitySetPath, sKey, sEntitySetPath, oMetaModel);
						if (oPropertyInfo !== false) {
							oPropertyInfo.required = aRequiredProps.indexOf(sKey) >= 0;
							oPropertyInfo.visible = aSelectionFields.indexOf(sKey) >= 0;
							if (mAllowedExpressions[sKey]) {
								oPropertyInfo.filterExpression = mAllowedExpressions[sKey];
							} else {
								oPropertyInfo.filterExpression = "auto"; // default
							}
							oPropertyInfo.maxConditions = _isMultiValue(oPropertyInfo) ? -1 : 1;

							aFetchedProperties.push(oPropertyInfo);
						}
					} else if (oObj && oObj.$kind === "NavigationProperty" && oObj.$isCollection) {
						aSelectionFields
							.filter(function(sSelectionField) {
								return sSelectionField.indexOf(sKey + "/") === 0;
							})
							.forEach(function(sSelectionField) {
								oPropertyInfo = _fetchPropertyInfo(
									oMetaModel.getObject(sEntitySetPath + "/" + sSelectionField),
									sEntitySetPath + "/$NavigationPropertyBinding/" + sKey,
									sSelectionField.substr(sKey.length + 1),
									sEntitySetPath,
									oMetaModel
								);
								oPropertyInfo.name = oPropertyInfo.name.split("/").join("*/");
								oPropertyInfo.visible = false;
								oPropertyInfo.filterExpression = "auto"; // default
								oPropertyInfo.maxConditions = _isMultiValue(oPropertyInfo) ? -1 : 1;
								aFetchedProperties.push(oPropertyInfo);
							});
					}
				});

				return aFetchedProperties;
			});
		}

		function _generateIdPrefix(sFilterBarId, sControlType, sNavigationPrefix) {
			return sNavigationPrefix
				? StableIdHelper.generate([sFilterBarId, sControlType, sNavigationPrefix])
				: StableIdHelper.generate([sFilterBarId, sControlType]);
		}

		function _templateValueHelp(oSettings, oParameters) {
			return DelegateUtil.isValueHelpRequired(oParameters, true)
				.then(function(bValueHelpRequired) {
					var oThis = new JSONModel({
							idPrefix: oParameters.sVhIdPrefix,
							conditionModel: "$filters",
							navigationPrefix: oParameters.sNavigationPrefix ? "/" + oParameters.sNavigationPrefix : "",
							forceValueHelp: !bValueHelpRequired,
							filterFieldValueHelp: true,
							requestGroupId: oParameters.sValueHelpGroupId
						}),
						oPreprocessorSettings = mergeObjects({}, oSettings, {
							bindingContexts: {
								"this": oThis.createBindingContext("/")
							},
							models: {
								"this": oThis
							}
						});

					return DelegateUtil.templateControlFragment(
						"sap.fe.macros.ValueHelp",
						oPreprocessorSettings,
						undefined,
						oSettings.isXml
					)
						.then(function(oVHElement) {
							if (oVHElement) {
								var sAggregationName = "dependents";
								if (oParameters.oModifier) {
									oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, oVHElement, 0);
								} else {
									oParameters.oControl.insertAggregation(sAggregationName, oVHElement, 0, false);
								}
							}
						})
						.finally(function() {
							oThis.destroy();
						});
				})
				.catch(function(oError) {
					Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
				});
		}

		function _templateFilterField(oSettings, oParameters) {
			var oThis = new JSONModel({
					idPrefix: oParameters.sIdPrefix,
					vhIdPrefix: oParameters.sVhIdPrefix,
					propertyPath: oParameters.sPropertyName,
					navigationPrefix: oParameters.sNavigationPrefix ? "/" + oParameters.sNavigationPrefix : ""
				}),
				oPreprocessorSettings = mergeObjects({}, oSettings, {
					bindingContexts: {
						"this": oThis.createBindingContext("/")
					},
					models: {
						"this": oThis
					}
				});

			return DelegateUtil.templateControlFragment(
				"sap.fe.macros.FilterField",
				oPreprocessorSettings,
				undefined,
				oSettings.isXml
			).finally(function() {
				oThis.destroy();
			});
		}

		/**
		 * Method responsible for providing information about current filter field added to filter bar via 'Adapt Filters' UI.
		 * @param {string} sPropertyName Name of the property being added as filter field
		 * @param {object} oFilterBar FilterBar control instance
		 * @param {map} mPropertyBag Instance of property bag from Flex change API
		 * @returns {Promise} once resolved a filter field definition is returned
		 */
		ODataFilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
			if (!mPropertyBag) {
				// Invoked during runtime. Same logic as for adding p13n filter item
				return ODataFilterBarDelegate.addP13nItem({ name: sPropertyName }, oFilterBar);
			}

			sPropertyName = sPropertyName.split("*").join("");

			var oMetaModel = mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
			if (!oMetaModel) {
				return Promise.resolve(null);
			}

			var oModifier = mPropertyBag.modifier,
				bIsXml = oModifier.targets === "xmlTree";
			if (sPropertyName === EDIT_STATE_PROPERTY_NAME) {
				return _templateEditState(oFilterBar, bIsXml);
			} else if (sPropertyName === SEARCH_PROPERTY_NAME) {
				return Promise.resolve(null);
			}

			var sEntitySetPath = "/" + DelegateUtil.getCustomData(oFilterBar, "entitySet"),
				sNavigationPrefix = sPropertyName.indexOf("/") >= 0 ? sPropertyName.substring(0, sPropertyName.lastIndexOf("/")) : "",
				sFilterBarId = oModifier.getId(oFilterBar),
				oSettings = {
					bindingContexts: {
						"entitySet": oMetaModel.createBindingContext(sEntitySetPath),
						"property": oMetaModel.createBindingContext(sEntitySetPath + "/" + sPropertyName)
					},
					models: {
						"entitySet": oMetaModel,
						"property": oMetaModel
					},
					isXml: bIsXml
				},
				oParameters = {
					sPropertyName: sPropertyName,
					sBindingPath: sEntitySetPath,
					sValueHelpType: VALUE_HELP_TYPE,
					oControl: oFilterBar,
					oMetaModel: oMetaModel,
					oModifier: oModifier,
					sIdPrefix: _generateIdPrefix(sFilterBarId, "FilterField", sNavigationPrefix),
					sVhIdPrefix: _generateIdPrefix(sFilterBarId, VALUE_HELP_TYPE, sNavigationPrefix),
					sNavigationPrefix: sNavigationPrefix,
					sValueHelpGroupId: DelegateUtil.getCustomData(oFilterBar, "valueHelpRequestGroupId")
				};

			return DelegateUtil.doesValueHelpExist(oParameters)
				.then(function(bValueHelpExists) {
					if (!bValueHelpExists) {
						return _templateValueHelp(oSettings, oParameters);
					}
					return Promise.resolve();
				})
				.then(_templateFilterField.bind(this, oSettings, oParameters));
		};

		/**
		 * Responsible to create Filter field in Table adaptation FilterBar.
		 *
		 * @param {object} oProperty Entity type property for which the filter field needs to be created
		 * @param {object} oParentControl Instance of the parent control
		 * @returns {Promise} Once resolved a filter field definition is returned
		 */
		ODataFilterBarDelegate.addP13nItem = function(oProperty, oParentControl) {
			var sPropertyName = oProperty.name;
			if (sPropertyName.indexOf("/") > -1) {
				// Exclude navigation properties from personalization filter dialog
				return Promise.resolve(null);
			}

			return DelegateUtil.fetchModel(oParentControl).then(function(oModel) {
				sPropertyName = sPropertyName.split("*").join("");

				var oMetaModel = oModel && oModel.getMetaModel();
				if (!oMetaModel) {
					return Promise.resolve(null);
				}

				var sEntitySetPath = oParentControl.getDelegate().payload.entitySet,
					sNavigationPrefix = sPropertyName.indexOf("/") > -1 ? sPropertyName.substring(0, sPropertyName.lastIndexOf("/")) : "",
					sTableId = oParentControl.getId(),
					oSettings = {
						bindingContexts: {
							"entitySet": oMetaModel.createBindingContext(sEntitySetPath),
							"property": oMetaModel.createBindingContext(sEntitySetPath + "/" + sPropertyName)
						},
						models: {
							"entitySet": oMetaModel,
							"property": oMetaModel
						},
						isXml: false
					},
					oParameters = {
						sPropertyName: sPropertyName,
						sBindingPath: sEntitySetPath,
						sValueHelpType: VALUE_HELP_TYPE,
						oControl: oParentControl,
						oMetaModel: oMetaModel,
						oModifier: undefined,
						sIdPrefix: _generateIdPrefix(sTableId, "AdaptationFilterField", sNavigationPrefix),
						sVhIdPrefix: _generateIdPrefix(sTableId, "AdaptationFilterFieldValueHelp", sNavigationPrefix),
						sNavigationPrefix: sNavigationPrefix,
						sValueHelpGroupId: undefined
					};

				return DelegateUtil.doesValueHelpExist(oParameters)
					.then(function(bValueHelpExists) {
						if (!bValueHelpExists) {
							return _templateValueHelp(oSettings, oParameters);
						}
						return Promise.resolve();
					})
					.then(_templateFilterField.bind(this, oSettings, oParameters));
			});
		};

		/**
		 * Fetches the relevant metadata for the filter bar and returns property info array.
		 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
		 * @returns {Promise} once resolved an array of property info is returned
		 */
		ODataFilterBarDelegate.fetchProperties = function(oFilterBar) {
			var sEntitySet = "/" + DelegateUtil.getCustomData(oFilterBar, "entitySet");
			return DelegateUtil.fetchModel(oFilterBar).then(function(oModel) {
				if (!oModel) {
					return [];
				}

				var oMetaModel = oModel.getMetaModel();
				return _fetchPropertiesForEntity(sEntitySet, oMetaModel).then(function(aProperties) {
					if (oFilterBar.data("draftEditStateModelName")) {
						aProperties.push(_getEditStateFilterPropertyInfo());
					}
					if (
						FilterBarHelper.checkIfBasicSearchIsVisible(
							oFilterBar.data("hideBasicSearch") === "true",
							oMetaModel.getObject(sEntitySet + "@Org.OData.Capabilities.V1.SearchRestrictions")
						)
					) {
						aProperties.push(_getSearchFilterPropertyInfo());
					}
					return aProperties;
				});
			});
		};

		ODataFilterBarDelegate.getTypeUtil = function(oPayload) {
			return TypeUtil;
		};

		return ODataFilterBarDelegate;
	},
	/* bExport= */ false
);
