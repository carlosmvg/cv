/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/fe/macros/CommonHelper",
		"sap/fe/core/library",
		"sap/fe/core/helpers/StableIdHelper",
		"sap/fe/core/AnnotationHelper",
		"sap/ui/model/odata/v4/AnnotationHelper",
		"sap/fe/core/converters/ConverterContext",
		"sap/fe/macros/SizeHelper",
		"sap/fe/core/CommonUtils"
	],
	function(
		JSONModel,
		CommonHelper,
		FELibrary,
		StableIdHelper,
		AnnotationHelper,
		ODataModelAnnotationHelper,
		ConverterContext,
		SizeHelper,
		CommonUtils
	) {
		"use strict";

		var CreationMode = FELibrary.CreationMode;

		/**
		 * Helper class used by MDC controls for OData(V4) specific handling
		 *
		 * @private
		 * @experimental This module is only for internal/experimental use!
		 */
		var TableHelper = {
			/**
			 * Check if Action is a Static.
			 *
			 * @param {object} oActionContext - Action to check static
			 * @param {string} sActionName - Action name
			 * @returns {bool} test result
			 * @private
			 * @sap-restricted
			 */
			_isStaticAction: function(oActionContext, sActionName) {
				if (sActionName && sActionName.indexOf("(") > -1) {
					// bound action to another entity type has to be treated as a static context
					return true;
				}
				if (oActionContext) {
					var oAction = Array.isArray(oActionContext) ? oActionContext[0] : oActionContext;
					if (oAction.$IsBound && oAction.$Parameter[0].$isCollection) {
						return true;
					}
				}
			},

			isPasteEnabled: function(
				oThis,
				sCreationMode,
				oCollection,
				sCollectionName,
				oParentEntitySet,
				oTargetCollection,
				bForceFalseValue
			) {
				var bCreationRow = sCreationMode === "CreationRow";

				if (!this.createButtonTemplating(oThis, bCreationRow)) {
					// We know paste is disabled at templating time
					return bForceFalseValue ? false : undefined;
				} else {
					var res = bCreationRow
						? AnnotationHelper.getNavigationInsertableRestrictions(
								oCollection,
								sCollectionName,
								oParentEntitySet,
								oTargetCollection,
								false
						  )
						: this.isCreateButtonEnabled(oCollection, sCollectionName, oParentEntitySet, oTargetCollection);
					// We call getNavigationInsertableRestrictions with bCreationRow = false even in the case of a creation row
					// because it would otherwise generate a binding expression relative to the creation row context.
					// In our case, we want to generate a binding expression relative to the page context.
					if (oThis.showCreate !== "{= ${ui>/editMode} === 'Editable'}") {
						//If we have extra condition for oThis.showCreate then we add it along with insert restriction conditions
						// e.g : "{= !${_Item/owner/isVerified} && ${ui>/editMode} === 'Editable'}"
						var showCreate = oThis.showCreate.substr(3, oThis.showCreate.length - 1);
						showCreate = showCreate.replace(" && ${ui>/editMode} === 'Editable'", "");
						return res !== false || bForceFalseValue ? res.substr(0, res.length - 1) + " && " + showCreate : undefined;
					}
					return res !== false || bForceFalseValue ? res : undefined;
				}
			},

			createButtonTemplating: function(oThis, bCreationRow) {
				var oTargetCollection = oThis.collection,
					oCreationBehaviour = oThis.create.getObject(),
					oNavigationProperty,
					bNavigationInsertRestrictions,
					sCurrentCollectionName = oThis.navigationPath,
					sTargetCollectionPath = CommonHelper.getTargetCollection(oThis.collection, oThis.navigationPath),
					aRestrictedProperties = oThis.parentEntitySet.getObject(
						oThis.parentEntitySet.getPath() + "@Org.OData.Capabilities.V1.NavigationRestrictions/RestrictedProperties"
					);
				for (var i in aRestrictedProperties) {
					oNavigationProperty = aRestrictedProperties[i];
					if (
						oNavigationProperty.NavigationProperty.$NavigationPropertyPath === sCurrentCollectionName &&
						oNavigationProperty.InsertRestrictions &&
						oNavigationProperty.InsertRestrictions.Insertable
					) {
						bNavigationInsertRestrictions = oNavigationProperty.InsertRestrictions.Insertable;
					}
				}
				if (oThis.showCreate === "false") {
					return false;
				}
				if (!oThis.onCreate || (oCreationBehaviour.mode === CreationMode.CreationRow && bCreationRow === false)) {
					return false;
				} else if (
					oTargetCollection.getObject(sTargetCollectionPath + "@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction")
				) {
					return (
						oTargetCollection.getObject(
							sTargetCollectionPath +
								"@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction@Org.OData.Core.V1.OperationAvailable"
						) !== false
					);
				} else if (oTargetCollection.getObject(sTargetCollectionPath + "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction")) {
					return (
						oTargetCollection.getObject(
							sTargetCollectionPath +
								"@com.sap.vocabularies.Common.v1.DraftRoot/NewAction@Org.OData.Core.V1.OperationAvailable"
						) !== false
					);
				} else if (bNavigationInsertRestrictions === false) {
					return false;
				} else if (bNavigationInsertRestrictions) {
					// if navigation insert restrictions are present and not static false then we render the button
					return true;
				} else if (oThis.creationMode === CreationMode.External) {
					// if outbound navigation with Create Button
					return true;
				}
				return (
					oTargetCollection.getObject(sTargetCollectionPath + "@Org.OData.Capabilities.V1.InsertRestrictions/Insertable") !==
					false
				);
			},

			deleteButtonTemplating: function(oThis) {
				if (oThis.selectedContextsModel && oThis.id && oThis.onDelete) {
					if (oThis.showDelete !== undefined && oThis.showDelete !== null) {
						return oThis.showDelete;
					} else {
						return true;
					}
				}
				return false;
			},
			/**
			 * Returns a string of comma separated fields to add presentation variant to $select query of the table.
			 * The fields are the ones listed into PresentationVariantType RequestAtLeast.
			 * @param {object} oPresentationVariant - Annotation related to com.sap.vocabularies.UI.v1.PresentationVariant
			 * @param sPresentationVariantPath
			 * @returns {string} - CSV of fields listed into RequestAtLeast
			 * @private
			 * @sap-restricted
			 */
			addPresentationVariantToSelectQuery: function(oPresentationVariant, sPresentationVariantPath) {
				var aRequested = [];
				if (
					!(
						oPresentationVariant &&
						CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) &&
						oPresentationVariant.RequestAtLeast &&
						oPresentationVariant.RequestAtLeast.length > 0
					)
				) {
					return "";
				}
				oPresentationVariant.RequestAtLeast.forEach(function(oRequested) {
					aRequested.push(oRequested.$PropertyPath);
				});
				return aRequested.join(",");
			},
			/**
			 * Returns a string of comma separated fields to add operation to the $select query of the table.
			 * The fields are the ones used as path in OperationAvaiable annotations for actions
			 * that are present in the UI.LineItem annotation.
			 *
			 * @param {Array} aLineItemCollection - array of records in UI.LineItem
			 * @param {object} oContext - context object of the LineItem
			 * @returns {string} - CSV of path based OperationAvailable fields for actions of this table.
			 * @private
			 * @sap-restricted
			 */
			addOperationAvailableFieldsToSelectQuery: function(aLineItemCollection, oContext) {
				var selectedFieldsArray = [],
					selectFields = "";
				aLineItemCollection.forEach(function(oRecord) {
					var sActionName = oRecord.Action;
					if (
						oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" &&
						sActionName.indexOf("/") < 0 &&
						!oRecord.Determining
					) {
						if (CommonHelper.getActionPath(oContext.context, false, sActionName, true) === null) {
							selectedFieldsArray.push(sActionName);
						} else {
							var oResult = CommonHelper.getActionPath(oContext.context, false, sActionName);
							if (oResult.sProperty) {
								selectedFieldsArray.push(oResult.sProperty.substr(oResult.sBindingParameter.length + 1));
							}
						}
					}
				});
				selectFields = selectedFieldsArray.join(",");
				return selectFields;
			},
			/**
			 * Returns a stringified JSON object where key-value pairs corresspond to the name of the
			 * action used in UI.DataFieldForAction and the property used as path in OperationAvailable
			 * annotation for this action. If static null is annotated, null is stored as the value.
			 * e.g. an entry of the JSON object would be "someNamespace.SomeBoundAction: SomeProperty".
			 *
			 * @param {Array} aLineItemCollection - array of records in UI.LineItem
			 * @param {object} oContext - context object of the LineItem
			 * @returns {string} - Stringified JSON object
			 * @private
			 * @sap-restricted
			 */
			getOperationAvailableMap: function(aLineItemCollection, oContext) {
				var oActionOperationAvailableMap = {},
					oResult;
				aLineItemCollection.forEach(function(oRecord) {
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
			},

			/**
			 * Returns a array of actions whether are not multi select enabled.
			 *
			 * @param {Array} aLineItemCollection - array of records in UI.LineItem
			 * @param {object} oContext - context object of the LineItem
			 * @returns {Array} - array of action pathstrings
			 * @private
			 * @sap-restricted
			 */
			getMultiSelectDisabledActions: function(aLineItemCollection, oContext) {
				var aMultiSelectDisabledActions = [],
					sActionPath,
					sActionName,
					sAnnotationPath,
					oParameterAnnotations,
					oAction;
				var aActionMetadata = aLineItemCollection.filter(function(oItem) {
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
			},
			/**
			 * Return UI Line Item Context.
			 *
			 * @param {object} oPresentationContext Presentation context object (Presentation variant or UI.LineItem)
			 * @returns {object}
			 */
			getUiLineItem: function(oPresentationContext) {
				var oPresentation = oPresentationContext.getObject(oPresentationContext.sPath),
					oPresentationVariantPath = CommonHelper.createPresentationPathContext(oPresentationContext),
					oModel = oPresentationContext.getModel();
				if (CommonHelper._isPresentationVariantAnnotation(oPresentationVariantPath.getPath())) {
					// Uncomplete PresentationVariant can be passed to macro via SelectionPresentationVariant
					var sLineItemPath = "@com.sap.vocabularies.UI.v1.LineItem",
						aVisualizations = oPresentation.Visualizations;
					if (Array.isArray(aVisualizations)) {
						for (var i = 0; i < aVisualizations.length; i++) {
							if (aVisualizations[i].$AnnotationPath.indexOf(sLineItemPath) !== -1) {
								sLineItemPath = aVisualizations[i].$AnnotationPath;
								break;
							}
						}
					}
					return oModel.getMetaContext(oPresentationContext.getPath().split("@")[0] + sLineItemPath);
				}
				return oPresentationContext;
			},
			/**
			 * Get all fields from collection path.
			 *
			 * @param {string} sEntitySetPath Path of EntitySet
			 * @param {object} oMetaModel MetaModel instance
			 * @returns {Array} properties
			 */
			getCollectionFields: function(sEntitySetPath, oMetaModel) {
				var aProperties = [],
					oObj,
					oEntityType;
				oEntityType = oMetaModel.getObject(sEntitySetPath + "/");
				for (var sKey in oEntityType) {
					oObj = oEntityType[sKey];
					if (oObj && oObj.$kind === "Property") {
						aProperties.push({
							name: sKey,
							label: oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@com.sap.vocabularies.Common.v1.Label"),
							type: oObj.$Type
						});
					}
				}
				return aProperties;
			},

			/**
			 * Creates and returns a select query with the selected fields from the parameters passed.
			 * @param {object} oCollection - Annotations related to the target collection
			 * @param {string} sOperationAvailableFields - Fields used as path in OperationAvaiable annotations for actions
			 * @param {Array} oPresentationVariant - Annotation related to com.sap.vocabularies.UI.v1.PresentationVariant
			 * @param sPresentationVariantPath
			 * @param {Array} aSemanticKeys - SemanticKeys included in the entity set
			 * @returns {string} select query having the selected fields from the parameters passed
			 */
			create$Select: function(oCollection, sOperationAvailableFields, oPresentationVariant, sPresentationVariantPath, aSemanticKeys) {
				var sPResentationVariantFields = TableHelper.addPresentationVariantToSelectQuery(
					oPresentationVariant,
					sPresentationVariantPath
				);
				var sSelectedFields =
					(sOperationAvailableFields ? sOperationAvailableFields : "") +
					(sOperationAvailableFields && sPResentationVariantFields ? "," : "") +
					sPResentationVariantFields;
				if (aSemanticKeys) {
					aSemanticKeys.forEach(function(oSemanticKey) {
						sSelectedFields += sSelectedFields ? "," + oSemanticKey.$PropertyPath : oSemanticKey.$PropertyPath;
					});
				}
				if (
					oCollection["@Org.OData.Capabilities.V1.DeleteRestrictions"] &&
					oCollection["@Org.OData.Capabilities.V1.DeleteRestrictions"].Deletable.$Path
				) {
					var sRestriction = oCollection["@Org.OData.Capabilities.V1.DeleteRestrictions"].Deletable.$Path;
					sSelectedFields += sSelectedFields ? "," + sRestriction : sRestriction;
				}
				return !sSelectedFields ? "" : ", $select: '" + sSelectedFields + "'";
			},

			/**
			 *
			 * Method to calculate the column minWidth for specific use cases.
			 *
			 * @function
			 * @name getColumnMinWidth
			 * @param {*} oAnnotations - Annotations of the field
			 * @param {string} sDataType - Datatype of the field
			 * @param {number} nMaxLength - Maximum length of the field
			 * @param {string} sDataFieldType - Type of the field
			 * @param {string} sFieldControl - Field control value
			 * @returns {number} - The column min width for specific conditions, otherwise a min width value is set by default.
			 */
			getColumnMinWidth: function(oAnnotations, sDataType, nMaxLength, sDataFieldType, sFieldControl) {
				var nWidth,
					bHasTextAnnotation = oAnnotations && oAnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.Text"),
					bIsUnitOrCurrency =
						typeof oAnnotations !== "undefined" &&
						(oAnnotations.hasOwnProperty("@Org.OData.Measures.V1.Unit") ||
							oAnnotations.hasOwnProperty("@Org.OData.Measures.V1.ISOCurrency"));
				if (sDataType === "Edm.String" && !bHasTextAnnotation && nMaxLength && nMaxLength < 10) {
					// Add additional .75 em (~12px) to avoid showing ellipsis in some cases!
					nMaxLength += 0.75;
					if (nMaxLength < 3) {
						// use a min width of 3em (default)
						nMaxLength = 3;
					}
					nWidth = nMaxLength;
				} else if (
					CommonHelper.getEditMode(oAnnotations, sDataFieldType, sFieldControl) !== "Display" &&
					sDataType === "Edm.Decimal" &&
					bIsUnitOrCurrency
				) {
					nWidth = 20;
				}
				if (nWidth) {
					return nWidth;
				} else {
					return 8;
				}
			},

			/**
			 *
			 * Method to get column's width if defined from manifest/customisation by annotations.
			 *
			 * There are issues when the cell in the column is a measure and has a UoM or currency associated to it
			 * In edit mode this results in two fields and that doesn't work very well for the cell and the fields get cut.
			 * So we are currently hardcoding width in several cases in edit mode where there are problems.
			 *
			 *
			 * @function
			 * @name getColumnWidth
			 * @param {string} sDefinedWidth - Defined width of the column, which is taken with priority if not null, undefined or empty
			 * @param {*} oAnnotations - Annotations of the field
			 * @param {string} sDataFieldType - Type of the field
			 * @param {string} sFieldControl - Field control value
			 * @param {boolean} bIsDraftMode - True, if draft mode is enabled
			 * @param {string} sDataType - Datatype of the field
			 * @param {number} nTargetValueVisualization - Number for DataFieldForAnnotation Target Value (stars)
			 * @param {*} oDataField - Data Field
			 * @param {string} sDataFieldActionText - DataField's text from button
			 * @returns {string} - Column width if defined, otherwise width is set to auto
			 */
			getColumnWidth: function(
				sDefinedWidth,
				oAnnotations,
				sDataFieldType,
				sFieldControl,
				bIsDraftMode,
				sDataType,
				nTargetValueVisualization,
				oDataField,
				sDataFieldActionText
			) {
				var sWidth,
					bHasTextAnnotation = false;
				if (sDefinedWidth) {
					return sDefinedWidth;
				} else if (CommonHelper.getEditMode(oAnnotations, sDataFieldType, sFieldControl) === "Display") {
					bHasTextAnnotation = oAnnotations && oAnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.Text");
					if (
						sDataType === "Edm.Stream" &&
						!bHasTextAnnotation &&
						oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") &&
						oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/")
					) {
						sWidth = "7em";
					}
				} else if (sDataType === "Edm.Date" || sDataType === "Edm.TimeOfDay") {
					sWidth = "9em";
				} else if (sDataType === "Edm.DateTimeOffset") {
					sWidth = "12em";
				} else if (sDataType === "Edm.Boolean") {
					sWidth = "8em";
				} else if (
					oAnnotations &&
					((oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") &&
						oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") === true) ||
						(oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") &&
							oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/")))
				) {
					sWidth = "7em";
				} else if (
					sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
					sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
					sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation"
				) {
					var nTmpTextWidth, nTmpVisualizationWidth;

					// For FieldGroup having action buttons or visualization data points (as rating) on column.
					if (sDataFieldActionText && sDataFieldActionText.length >= oDataField.Label.length) {
						nTmpTextWidth = SizeHelper.getButtonWidth(sDataFieldActionText);
					} else if (oDataField) {
						nTmpTextWidth = SizeHelper.getButtonWidth(oDataField.Label);
					} else {
						nTmpTextWidth = SizeHelper.getButtonWidth(oAnnotations.Label);
					}
					if (nTargetValueVisualization) {
						//Each rating star has a width of 2em
						nTmpVisualizationWidth = nTargetValueVisualization * 2;
					}
					if (!isNaN(nTmpVisualizationWidth) && nTmpVisualizationWidth > nTmpTextWidth) {
						sWidth = nTmpVisualizationWidth + "em";
					} else if (
						sDataFieldActionText ||
						(oAnnotations &&
							(oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
								oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"))
					) {
						// Add additional 2 em to avoid showing ellipsis in some cases.
						nTmpTextWidth += 2;
						sWidth = nTmpTextWidth + "em";
					}
				}
				if (sWidth) {
					return sWidth;
				} else {
					return "auto";
				}
			},
			/**
			 * Method to add a margin class at the end of control.
			 *
			 * @function
			 * @name getMarginClass
			 * @param {*} oCollection - DataPoint's Title
			 * @param {*} oDataField - DataPoint's Value
			 * @param sVisualization
			 * @returns {string} - returns classes for adjusting margin between controls.
			 */
			getMarginClass: function(oCollection, oDataField, sVisualization) {
				if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
					//If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
					if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
						return "sapUiNoMarginBottom sapUiNoMarginTop";
					}
					return "";
				} else {
					//If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between controls (as per UX spec),
					//only the top margin added by sapMRI class of interactive rating indicator must be nullified.
					if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
						return "sapUiNoMarginTop";
					}
					return "sapUiTinyMarginBottom";
				}
			},

			/**
			 * Method to determine the Selection Variant key used when table is initialized.
			 *
			 * @function
			 * @name getDefaultQuickFilterKey
			 * @param {string} oQuickFilter - quickFilters via context named filters (and key quickFilters) passed to Macro Table
			 * @returns {string} - returns key of first defined Selection Variant
			 */
			getDefaultQuickFilterKey: function(oQuickFilter) {
				if (oQuickFilter && Array.isArray(oQuickFilter.paths) && oQuickFilter.paths.length > 0) {
					return oQuickFilter.paths[0].annotationPath;
				}
				return undefined;
			},

			/**
			 * Method to provide Hidden filters to Table data.
			 *
			 * @function
			 * @name formatHiddenFilters
			 * @param {string} oHiddenFilter - hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
			 * @returns {string} - returns stringify hidden filters
			 */
			formatHiddenFilters: function(oHiddenFilter) {
				if (oHiddenFilter) {
					try {
						return JSON.stringify(oHiddenFilter);
					} catch (ex) {
						return undefined;
					}
				}
				return undefined;
			},

			/**
			 * Method to get column stable ID.
			 *
			 * @function
			 * @name getColumnStableId
			 * @param {string} sId - Current Object id
			 * @param {object} oDataField - DataPoint's Value
			 * @returns {*} - returns string/undefined for column id
			 */
			getColumnStableId: function(sId, oDataField) {
				return sId
					? StableIdHelper.generate([
							sId,
							"C",
							(oDataField.Target && oDataField.Target.$AnnotationPath) ||
								(oDataField.Value && oDataField.Value.$Path) ||
								(oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
								oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"
									? oDataField
									: "")
					  ])
					: undefined;
			},
			/**
			 * Method to row binding info.
			 * @function
			 * @name getRowsBindingInfo
			 * @param {object} oThis - Current object
			 * @param oCollection
			 * @param {string} sCollectionName - Name of collection
			 * @param {object} oTargetCollection - DataPoint's value
			 * @param {object} oLineItem - Line item value
			 * @param {object} oPresentation - Presentation object
			 * @param sPresentationVariantPath
			 * @param {object} oSemanticKey - SemanticKey object
			 * @returns {string} - Returns string
			 */
			getRowsBindingInfo: function(
				oThis,
				oCollection,
				sCollectionName,
				oTargetCollection,
				oLineItem,
				oPresentation,
				sPresentationVariantPath,
				oSemanticKey
			) {
				var oRowBinding = {
					ui5object: true,
					suspended: false,
					path: CommonHelper.addSingleQuotes(
						(oCollection.$kind === "EntitySet" ? "/" : "") + (oThis.navigationPath || sCollectionName)
					),
					parameters: {
						$count: true
					},
					events: {}
				};
				var sSelect = TableHelper.create$Select(
					oTargetCollection,
					oLineItem,
					oPresentation,
					sPresentationVariantPath,
					oSemanticKey
				);
				if (sSelect) {
					oRowBinding.parameters.$select = sSelect.split(": ")[1];
				}
				if (oThis.requestGroupId) {
					oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes(oThis.requestGroupId);
				}
				if (oThis.updateGroupId) {
					oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes(oThis.updateGroupId);
				}
				if (oThis.onPatchSent) {
					oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(oThis.onPatchSent);
				}
				if (oThis.onPatchCompleted) {
					oRowBinding.events.patchCompleted = CommonHelper.addSingleQuotes(oThis.onPatchCompleted);
				}
				if (oThis.onDataReceived) {
					oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes(oThis.onDataReceived);
				}
				if (oThis.onContextChange) {
					oRowBinding.events.change = CommonHelper.addSingleQuotes(oThis.onContextChange);
				}
				return CommonHelper.objectToString(oRowBinding);
			},
			/**
			 * Method to filter line items for columns.
			 *
			 * @function
			 * @name filterLineItemsForColumn
			 * @param {object} oDataField - DataPoint's Value
			 * @param {boolean} bIsBound - DataPoint action bound
			 * @returns {boolean} - returns boolean
			 */
			filterLineItemsForColumn: function(oDataField, bIsBound) {
				return (
					(!oDataField.Action && !oDataField.SemanticObject && !oDataField.Inline) ||
					(oDataField.Inline &&
						((bIsBound && oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") ||
							oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")) ||
					oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"
				);
			},

			/**
			 * Method to get Creation row applyEnabled property.
			 *
			 * @function
			 * @name creationRowApplyEnabled
			 * @param {object} oThis - Current Object
			 * @param {object} oCollection - Annotations related to the target collection
			 * @param {string} sCollectionName - Name of collection
			 * @param {object} oParentEntitySet - Annotations related to the parent entitySet
			 * @param {object} oTargetCollection - Annotations related to the target collection
			 * @returns {*} - returns boolean/string(expression) for creation row applyEnabled
			 */
			creationRowApplyEnabled: function(oThis, oCollection, sCollectionName, oParentEntitySet, oTargetCollection) {
				var sExpressionInsertable = AnnotationHelper.getNavigationInsertableRestrictions(
					oCollection,
					sCollectionName,
					oParentEntitySet,
					oTargetCollection,
					true
				);
				if (typeof sExpressionInsertable === "string" && oThis.disableAddRowButtonForEmptyData === "true") {
					sExpressionInsertable = sExpressionInsertable.substring(0, sExpressionInsertable.length - 1);
					return (
						sExpressionInsertable +
						" && ${path: '/fieldValidity/" +
						oThis.navigationPath +
						"' , model: 'creationRowModel', formatter: 'RUNTIME.validateCreationRowFields'}}"
					);
				}
				return sExpressionInsertable;
			},

			/**
			 * Method to get Creation row visible property.
			 *
			 * @function
			 * @name creationRowVisible
			 * @param {*} showCreate - Boolean or expression for table showCreate property
			 * @param {string} sCollectionName - CollectionName
			 * @returns {*} - returns string(expression) for creation row visible
			 */
			creationRowVisible: function(showCreate, sCollectionName) {
				if (showCreate && showCreate === "{=  ${ui>/editMode} === 'Editable'}") {
					return showCreate;
				} else {
					return showCreate.replace(sCollectionName + "/", "");
				}
			},
			/**
			 * Method to check Creation row fields validity.
			 *
			 * @function
			 * @name validateCreationRowFields
			 * @param {object} oFieldValidityObject - Current Object holding the fields
			 * @returns {*} - returns boolean
			 */
			validateCreationRowFields: function(oFieldValidityObject) {
				if (!oFieldValidityObject) {
					return false;
				}
				return (
					Object.keys(oFieldValidityObject).length > 0 &&
					Object.keys(oFieldValidityObject).every(function(key) {
						return oFieldValidityObject[key]["validity"];
					})
				);
			},
			/**
			 * Method to get press event expression for DataFieldForActionButton.
			 *
			 * @function
			 * @name pressEventDataFieldForActionButton
			 * @param {object} oThis - Current Object
			 * @param {object} oDataField - DataPoint's Value
			 * @param {string} sEntitySetName - EntitySet name
			 * @param {string} sOperationAvailableMap - OperationAvailableMap Stringified JSON object
			 * @param {object} oActionContext - Action object
			 * @param {bool} bIsNavigable - Action is navigable or not
			 * @returns {string} - returns expression for DataFieldForActionButton
			 */
			pressEventDataFieldForActionButton: function(
				oThis,
				oDataField,
				sEntitySetName,
				sOperationAvailableMap,
				oActionContext,
				bIsNavigable
			) {
				var bStaticAction, oContext;
				bStaticAction = this._isStaticAction(oActionContext, oDataField.Action);

				oContext = "${" + oThis.selectedContextsModel + ">/$contexts/" + oThis.id + "/selectedContexts}";
				var sInvocationGrouping =
					oDataField.InvocationGrouping &&
					oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"
						? "ChangeSet"
						: "Isolated";

				var oParams = {
					contexts: oContext,
					bStaticAction: bStaticAction ? bStaticAction : undefined,
					entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
					invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
					prefix: CommonHelper.addSingleQuotes(oThis.id),
					operationAvailableMap: CommonHelper.addSingleQuotes(sOperationAvailableMap),
					model: "${$source>/}.getModel()",
					label: CommonHelper.addSingleQuotes(oDataField.Label),
					applicableContext:
						"${" +
						oThis.selectedContextsModel +
						">/$contexts/" +
						oThis.id +
						"/dynamicActions/" +
						oDataField.Action +
						"/aApplicable/}",
					notApplicableContext:
						"${" +
						oThis.selectedContextsModel +
						">/$contexts/" +
						oThis.id +
						"/dynamicActions/" +
						oDataField.Action +
						"/aNotApplicable/}",
					isNavigable: bIsNavigable
				};

				return CommonHelper.generateFunction(
					oThis.onCallAction,
					CommonHelper.addSingleQuotes(oDataField.Action),
					CommonHelper.objectToString(oParams)
				);
			},
			/**
			 * Method to get enabled expression for DataFieldForActionButton.
			 *
			 * @function
			 * @name isDataFieldForActionEnabled
			 * @param {object} oThis - Current Object
			 * @param {object} oDataField - DataPoint's Value
			 * @param {object} oRequiresContext - RequiresContext for IBN
			 * @param {boolean} bIsDataFieldForIBN - Flag for IBN
			 * @param {object} oActionContext - Action object
			 * @param {string} sActionEnabled - Action Enabled for single or multi select
			 * @returns {*} - returns boolean/string value
			 */
			isDataFieldForActionEnabled: function(oThis, oDataField, oRequiresContext, bIsDataFieldForIBN, oActionContext, sActionEnabled) {
				var bStaticAction = this._isStaticAction(oActionContext, oDataField.Action);

				if (!oRequiresContext || bStaticAction) {
					return true;
				}

				var sContextsPath = oThis.selectedContextsModel + ">/$contexts/" + oThis.id;
				var sDataFieldForActionEnabledExpression = "";
				if (bIsDataFieldForIBN) {
					sDataFieldForActionEnabledExpression = "%{" + sContextsPath + "/numberOfSelectedContexts} >= 1";
				} else {
					if (sActionEnabled === "single") {
						var sNumberOfSelectedContexts = "${" + sContextsPath + "/numberOfSelectedContexts} === 1";
					} else {
						var sNumberOfSelectedContexts = "${" + sContextsPath + "/numberOfSelectedContexts} > 0";
					}
					var sAction = "${" + sContextsPath + "/dynamicActions/" + oDataField.Action + "/bEnabled" + "}";
					sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
				}
				return "{= " + sDataFieldForActionEnabledExpression + "}";
			},
			/**
			 * Method to get press event expression for DataFieldForIntentBasedNavigation.
			 * @function
			 * @name pressEventDataFieldForIntentBasedNavigation
			 * @param {object} oThis - Current Object
			 * @param {object} oDataField - DataPoint's Value
			 * @returns {string} - returns expression for DataFieldForIBN
			 */
			pressEventDataFieldForIntentBasedNavigation: function(oThis, oDataField) {
				var sSelectedContexts = "${" + oThis.selectedContextsModel + ">/$contexts/" + oThis.id + "/selectedContexts}";
				var sParams =
					CommonHelper.addSingleQuotes(oDataField.SemanticObject) +
					", " +
					CommonHelper.addSingleQuotes(oDataField.Action) +
					", " +
					CommonHelper.addSingleQuotes(JSON.stringify(oDataField.Mapping)) +
					", " +
					sSelectedContexts;
				return CommonHelper.generateFunction(oThis.onDataFieldForIBN, "$controller", sParams);
			},
			/**
			 * Method to get press event expression for CreateButton.
			 *
			 * @function
			 * @name pressEventForCreateButton
			 * @param {object} oThis - Current Object
			 * @returns {string} - returns expression for CreateButton
			 */
			pressEventForCreateButton: function(oThis) {
				var oCreateBehaviour = oThis.create.getObject(),
					oParams,
					sMdcTable = "${$source>}.getParent().getParent().getParent()",
					sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".getRowsBindingInfo().path";

				switch (oCreateBehaviour.mode) {
					case CreationMode.External:
						// navigate to external target for creating new entries
						// TODO: Add required parameters
						oParams = {
							creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
							outbound: CommonHelper.addSingleQuotes(oCreateBehaviour.outbound)
						};
						break;

					case CreationMode.CreationRow:
						oParams = {
							creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
							creationRow: "${$source>}",
							createAtEnd: oCreateBehaviour.append !== undefined ? oCreateBehaviour.append : false
						};

						sRowBinding = "${$source>}.getParent()._getRowBinding()";
						break;

					case CreationMode.NewPage:
					case CreationMode.Inline:
						oParams = {
							creationMode: CommonHelper.addSingleQuotes(oCreateBehaviour.mode),
							createAtEnd: oCreateBehaviour.append !== undefined ? oCreateBehaviour.append : false,
							tableId: CommonHelper.addSingleQuotes(oThis.id)
						};

						if (oCreateBehaviour.newAction) {
							oParams.newAction = CommonHelper.addSingleQuotes(oCreateBehaviour.newAction);
						}
						break;

					default:
						// unsupported
						return undefined;
				}
				return CommonHelper.generateFunction(oThis.onCreate, sRowBinding, CommonHelper.objectToString(oParams));
			},

			pasteEvent: function(oThis) {
				var oCreateBehaviour = oThis.create.getObject(),
					createAtEnd = oCreateBehaviour.append !== undefined ? oCreateBehaviour.append : false;
				return CommonHelper.generateFunction(oThis.onPaste, "$event", createAtEnd);
			},

			getIBNData: function(oThis) {
				var outboundDetail = oThis.create.getObject("outboundDetail");
				if (outboundDetail) {
					var oIBNData = {
						semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
						action: CommonHelper.addSingleQuotes(outboundDetail.action)
					};
					return CommonHelper.objectToString(oIBNData);
				}
			},

			/**
			 * Method to get enabled expression for CreateButton.
			 *
			 * @function
			 * @name isCreateButtonEnabled
			 * @param {object} oCollection - Annotations related to the target collection
			 * @param {string} sCollectionName - Collection name
			 * @param {string} sRestrictedProperties - RestrictedProperties of parentEntitySet
			 * @param {string} sInsertable - Insertable of target collection
			 * @returns {string} - returns expression for enable create button
			 */
			isCreateButtonEnabled: function(oCollection, sCollectionName, sRestrictedProperties, sInsertable) {
				var bIsEntitySet = oCollection.$kind === "EntitySet";
				return bIsEntitySet
					? undefined
					: AnnotationHelper.getNavigationInsertableRestrictions(
							oCollection,
							sCollectionName,
							sRestrictedProperties,
							sInsertable,
							false
					  );
			},
			/**
			 * Method to get press event expression for DeleteButton.
			 *
			 * @function
			 * @name pressEventForDeleteButton
			 * @param {object} oThis - Current Object
			 * @param {string} sEntitySetName - EntitySet name
			 * @returns {string} - returns expression for DeleteButton
			 */
			pressEventForDeleteButton: function(oThis, sEntitySetName) {
				var sContextsPath = oThis.selectedContextsModel + ">/$contexts/" + oThis.id,
					sDeletableContexts = "${" + sContextsPath + "/deletableContexts}";

				var oParams = {
					id: CommonHelper.addSingleQuotes(oThis.id),
					entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
					numberOfSelectedContexts: "${" + sContextsPath + "/selectedContexts}.length",
					unSavedContexts: "${" + sContextsPath + "/unSavedContexts}",
					lockedContexts: "${" + sContextsPath + "/lockedContexts}",
					controlId: "${" + sContextsPath + "/controlId}"
				};

				return CommonHelper.generateFunction(oThis.onDelete, sDeletableContexts, CommonHelper.objectToString(oParams));
			},
			/**
			 * Method to get enabled expression for DeleteButton.
			 *
			 * @function
			 * @name isDeleteButtonEnabled
			 * @param {object} oThis - Current Object
			 * @returns {string} - returns expression for enable delete button
			 */
			isDeleteButtonEnabled: function(oThis) {
				var sContextsPath = oThis.selectedContextsModel + ">/$contexts/" + oThis.id,
					sDeletableContexts = "%{" + sContextsPath + "/deletableContexts}",
					sNumberOfDeletableContexts = sDeletableContexts + ".length > 0",
					sDeletableContextsCheck = "(" + sDeletableContexts + " && " + sNumberOfDeletableContexts + ")",
					sUnSavedContexts = "%{" + sContextsPath + "/unSavedContexts}",
					sNumberOfUnSavedContexts = sUnSavedContexts + ".length > 0",
					sUnSavedContextsCheck = "(" + sUnSavedContexts + " && " + sNumberOfUnSavedContexts + ")",
					sDeleteEnabledCheck = "(" + sDeletableContextsCheck + " || " + sUnSavedContextsCheck + ")",
					sDeleteEnabled = "%{" + sContextsPath + "/deleteEnabled}";

				var sExpression = "{= " + sDeleteEnabledCheck + " ? " + sDeleteEnabled + " : false}";
				return sExpression;
			},

			/**
			 * Method to get press event expression for Paste button.
			 *
			 * @function
			 * @name pressEventForPasteButton
			 * @param {object} oThis - Current Object
			 * @returns {string} - returns expression for DeleteButton
			 */
			pressEventForPasteButton: function(oThis) {
				var sMdcTable = "${$source>}.getParent().getParent().getParent()";
				return CommonHelper.generateFunction(oThis.onPasteButtonPressed, sMdcTable);
			},

			/**
			 * Method to get enabled expression for DeleteButton.
			 *
			 * @function
			 * @name isDeleteButtonEnabled
			 * @param {object} oDataField - DataPoint's Value
			 * @returns {boolean} - returns boolean to value for DataFieldForAction & DataFieldForIntentBasedNavigation
			 */
			filterLineItems: function(oDataField) {
				return (
					oDataField.Inline !== true &&
					oDataField.Determining !== true &&
					oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true
				);
			},
			getHiddenPathExpressionForTableActionsAndIBN: function(sHiddenPath, oDetails) {
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
			},

			/**
			 * Method to set visibility of column header label.
			 *
			 * @function
			 * @name setHeaderLabelVisibility
			 * @param {object} datafield - DataField
			 * @param {object} dataFieldCollection - List of items inside a fieldgroup (if any)
			 * @returns {boolean} - returns boolean true ff header label needs to be visible else false.
			 */
			setHeaderLabelVisibility: function(datafield, dataFieldCollection) {
				// If Inline button/navigation action, return false, else true;
				if (!dataFieldCollection) {
					if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
						return false;
					}
					if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
						return false;
					}
					return true;
				}

				// In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
				return dataFieldCollection.some(function(oDC) {
					if (
						(oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" ||
							oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") &&
						oDC["@com.sap.vocabularies.UI.v1.Hidden"] !== true
					) {
						return true;
					}
				});
			},

			/**
			 * Method to set Fieldgroup target value (if any).
			 *
			 * @function
			 * @name setValueFromFieldGroupTarget
			 * @param {object} oDataField - DataField
			 * @param {Array} aData - List of items inside a fieldgroup Target(if any)
			 * @returns {boolean} - returns true.
			 */
			setValueFromFieldGroupTarget: function(oDataField, aData) {
				if (aData && aData.length) {
					oDataField.Value = aData[0].Value;
				}
				return true;
			},

			/**
			 * Method to get Target Value (# of stars) from Visualization Rating.
			 *
			 * @function
			 * @name getValueOnRatingField
			 * @param {object} oDataField - DataPoint's Value
			 * @param {object} oContext - context object of the LineItem
			 * @returns {number} - returns number for DataFieldForAnnotation Target Value
			 */
			getValueOnRatingField: function(oDataField, oContext) {
				// for FieldGroup containing visualizationTypeRating
				if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
					// For a data field having Rating as visualization type
					if (
						oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 &&
						oContext.context.getObject("Target/$AnnotationPath/$Type") == "com.sap.vocabularies.UI.v1.DataPointType" &&
						oContext.context.getObject("Target/$AnnotationPath/Visualization/$EnumMember") ==
							"com.sap.vocabularies.UI.v1.VisualizationType/Rating"
					) {
						return oContext.context.getObject("Target/$AnnotationPath/TargetValue");
					}
					// for FieldGroup having Rating as visualization type in any of the data fields
					if (oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
						var sPathDataFields = "Target/$AnnotationPath/Data/";
						for (var i in oContext.context.getObject(sPathDataFields)) {
							if (
								oContext.context.getObject(sPathDataFields + i + "/$Type") ===
									"com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
								oContext.context
									.getObject(sPathDataFields + i + "/Target/$AnnotationPath")
									.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 &&
								oContext.context.getObject(sPathDataFields + i + "/Target/$AnnotationPath/$Type") ==
									"com.sap.vocabularies.UI.v1.DataPointType" &&
								oContext.context.getObject(sPathDataFields + i + "/Target/$AnnotationPath/Visualization/$EnumMember") ==
									"com.sap.vocabularies.UI.v1.VisualizationType/Rating"
							) {
								return oContext.context.getObject(sPathDataFields + i + "/Target/$AnnotationPath/TargetValue");
							}
						}
					}
				}
			},
			/**
			 * Method to get Text from DataFieldForAnnotation into Column.
			 *
			 * @function
			 * @name getTextOnActionField
			 * @param {object} oDataField - DataPoint's Value
			 * @param {object} oContext - context object of the LineItem
			 * @returns {string} - returns string from label refering to action text
			 */
			getTextOnActionField: function(oDataField, oContext) {
				if (
					oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
					oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
				) {
					return oDataField.Label;
				}
				// for FieldGroup containing DataFieldForAnnotation
				if (
					oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
					oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1
				) {
					var sPathDataFields = "Target/$AnnotationPath/Data/";
					for (var i in oContext.context.getObject(sPathDataFields)) {
						if (
							oContext.context.getObject(sPathDataFields + i + "/$Type") ===
								"com.sap.vocabularies.UI.v1.DataFieldForAction" ||
							oContext.context.getObject(sPathDataFields + i + "/$Type") ===
								"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
						) {
							return oContext.context.getObject(sPathDataFields + i + "/Label");
						}
					}
				}
			}
		};

		TableHelper.getOperationAvailableMap.requiresIContext = true;
		TableHelper.addOperationAvailableFieldsToSelectQuery.requiresIContext = true;
		TableHelper.getValueOnRatingField.requiresIContext = true;
		TableHelper.getTextOnActionField.requiresIContext = true;
		return TableHelper;
	},
	/* bExport= */ true
);
