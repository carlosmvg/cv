/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/ui/core/mvc/View",
		"sap/ui/core/Component",
		"sap/m/MessageBox",
		"sap/base/Log",
		"sap/fe/navigation/SelectionVariant",
		"sap/ui/mdc/condition/FilterOperatorUtil",
		"sap/ui/mdc/odata/v4/TypeUtil",
		"sap/fe/core/helpers/StableIdHelper"
	],
	function(View, Component, MessageBox, Log, SelectionVariant, FilterOperatorUtil, TypeUtil, StableIdHelper) {
		"use strict";

		var aValidTypes = [
				"Edm.Boolean",
				"Edm.Byte",
				"Edm.Date",
				"Edm.DateTime",
				"Edm.DateTimeOffset",
				"Edm.Decimal",
				"Edm.Double",
				"Edm.Float",
				"Edm.Guid",
				"Edm.Int16",
				"Edm.Int32",
				"Edm.Int64",
				"Edm.SByte",
				"Edm.Single",
				"Edm.String",
				"Edm.Time",
				"Edm.TimeOfDay"
			],
			oExcludeMap = {
				"Contains": "NotContains",
				"StartsWith": "NotStartsWith",
				"EndsWith": "NotEndsWith",
				"Empty": "NotEmpty",
				"NotEmpty": "Empty",
				"LE": "NOTLE",
				"GE": "NOTGE",
				"LT": "NOTLT",
				"GT": "NOTGT",
				"BT": "NOTBT",
				"NE": "EQ",
				"EQ": "NE"
			};

		function fnGetParentViewOfControl(oControl) {
			while (oControl && !(oControl instanceof View)) {
				oControl = oControl.getParent();
			}
			return oControl;
		}

		function fnHasTransientContexts(oListBinding) {
			var bHasTransientContexts = false;
			oListBinding.getCurrentContexts().forEach(function(oContext) {
				if (oContext && oContext.isTransient()) {
					bHasTransientContexts = true;
				}
			});
			return bHasTransientContexts;
		}

		function _isInNonFilterableProperties(oModel, sEntitySetPath, sContextPath) {
			var bIsNotFilterable = false;
			var oAnnotation = oModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
			if (oAnnotation && oAnnotation.NonFilterableProperties) {
				bIsNotFilterable = oAnnotation.NonFilterableProperties.some(function(property) {
					return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
				});
			}
			return bIsNotFilterable;
		}

		function _isContextPathFilterable(oModel, sEntitySetPath, sContexPath) {
			var aContext = sContexPath.split("/"),
				bIsNotFilterable = false,
				sContext = "";

			aContext.some(function(item, index, array) {
				if (sContext.length > 0) {
					sContext += "/" + item;
				} else {
					sContext = item;
				}
				if (index === array.length - 1) {
					//last path segment
					bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
				} else if (oModel.getObject(sEntitySetPath + "/$NavigationPropertyBinding/" + item)) {
					//check existing context path and initialize it
					bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
					sContext = "";
					//set the new EntitySet
					sEntitySetPath = "/" + oModel.getObject(sEntitySetPath + "/$NavigationPropertyBinding/" + item);
				}
				return bIsNotFilterable === true;
			});
			return bIsNotFilterable;
		}

		/**
		 * Checks if the property is filterable.
		 *
		 * @param {object} oModel - MetaModel
		 * @param {string} sEntitySetPath - EntitySet Path
		 * @param {string} sProperty - Entityset's Property
		 * @param {string} sPropertyPath - Overall property path
		 * @param {boolean} bSkipHiddenFilter - if HiddenFilters annotation check needs to be skipped
		 * @returns {boolean} bIsNotFilterable - True, if the property is filterable
		 *
		 */
		function isPropertyFilterable(oModel, sEntitySetPath, sProperty, sPropertyPath, bSkipHiddenFilter) {
			var bIsNotFilterable;
			var oProperty = oModel.getObject(sEntitySetPath + "/")[sProperty];
			if (!sPropertyPath) {
				sPropertyPath = sEntitySetPath + "/" + sProperty;
			}
			if (oModel.getObject(sPropertyPath + "@com.sap.vocabularies.UI.v1.Hidden") === true) {
				return false;
			}

			if (!bSkipHiddenFilter && oModel.getObject(sPropertyPath + "@com.sap.vocabularies.UI.v1.HiddenFilter")) {
				return false;
			}

			if (typeof sProperty === "string") {
				sProperty = sProperty;
			} else {
				sProperty = oModel.getObject(sPropertyPath + "@sapui.name");
			}
			if (sProperty.indexOf("/") < 0) {
				bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sProperty);
			} else {
				bIsNotFilterable = _isContextPathFilterable(oModel, sEntitySetPath, sProperty);
			}
			// check if type can be used for filtering
			if (oProperty && oProperty.$Type) {
				bIsNotFilterable = !(aValidTypes.indexOf(oProperty.$Type) > -1);
			}
			return !bIsNotFilterable;
		}

		function getShellServices(oControl) {
			return getAppComponent(oControl).getShellServices();
		}

		function updateRelateAppsModel(oEntry, oObjectPageLayout, aSemKeys, aSemUnavailableActs, oMetaModel, oMetaPath) {
			var oShellServiceHelper = getShellServices(oObjectPageLayout),
				oParam = {},
				sCurrentAction = "";

			if (oEntry) {
				if (aSemKeys && aSemKeys.length > 0) {
					for (var j = 0; j < aSemKeys.length; j++) {
						var sSemKey = aSemKeys[j].$PropertyPath;
						if (!oParam[sSemKey]) {
							oParam[sSemKey] = { value: oEntry[sSemKey] };
						}
					}
				} else {
					// fallback to Technical Keys if no Semantic Key is present
					var aTechnicalKeys = oMetaModel.getObject(oMetaPath + "/$Type/$Key");
					for (var key in aTechnicalKeys) {
						var sObjKey = aTechnicalKeys[key];
						if (!oParam[sObjKey]) {
							oParam[sObjKey] = { value: oEntry[sObjKey] };
						}
					}
				}
			}

			function fnGetParseShellHashAndGetLinks() {
				var oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
				var sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
				sCurrentAction = oParsedUrl.action;
				return oShellServiceHelper.getLinks({
					semanticObject: sCurrentSemObj,
					params: oParam
				});
			}

			fnGetParseShellHashAndGetLinks()
				.then(function(aLinks) {
					// Sorting the related app links alphabetically
					aLinks.sort(function(oLink1, oLink2) {
						if (oLink1.text < oLink2.text) {
							return -1;
						}
						if (oLink1.text > oLink2.text) {
							return 1;
						}
						return 0;
					});
					if (aLinks && aLinks.length > 0) {
						var aItems = [];
						//Skip same application from Related Apps
						for (var i = 0; i < aLinks.length; i++) {
							var oLink = aLinks[i];
							var sIntent = oLink.intent;
							var sAction = sIntent.split("-")[1].split("?")[0];
							if (
								sAction !== sCurrentAction &&
								(!aSemUnavailableActs || (aSemUnavailableActs && aSemUnavailableActs.indexOf(sAction) === -1))
							) {
								aItems.push({
									text: oLink.text,
									targetSemObject: sIntent.split("#")[1].split("-")[0],
									targetAction: sAction.split("~")[0]
								});
							}
						}
						// If no app in list, related apps button will be hidden
						oObjectPageLayout.getModel("relatedAppsModel").setProperty("/visibility", aItems.length > 0);
						oObjectPageLayout.getModel("relatedAppsModel").setProperty("/items", aItems);
					} else {
						oObjectPageLayout.getModel("relatedAppsModel").setProperty("/visibility", false);
					}
				})
				.catch(function(oError) {
					Log.error("Cannot read links", oError);
				});
		}

		function fnUpdateRelatedAppsDetails(oObjectPageLayout) {
			var oMetaModel = oObjectPageLayout.getModel().getMetaModel();
			var oBindingContext = oObjectPageLayout.getBindingContext();
			var oPath = oBindingContext && oBindingContext.getPath();
			var oMetaPath = oMetaModel.getMetaPath(oPath);
			// Semantic Key Vocabulary
			var sSemanticKeyVocabulary = oMetaPath + "/" + "@com.sap.vocabularies.Common.v1.SemanticKey";
			//Semantic Keys
			var aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
			// Unavailable Actions
			var aSemUnavailableActs = oMetaModel.getObject(
				oMetaPath + "/" + "@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"
			);
			var oEntry = oBindingContext.getObject();
			if (!oEntry) {
				oBindingContext
					.requestObject()
					.then(function(oEntry) {
						updateRelateAppsModel(oEntry, oObjectPageLayout, aSemKeys, aSemUnavailableActs, oMetaModel, oMetaPath);
					})
					.catch(function(oError) {
						Log.error("Cannot update the related app details", oError);
					});
			} else {
				updateRelateAppsModel(oEntry, oObjectPageLayout, aSemKeys, aSemUnavailableActs, oMetaModel, oMetaPath);
			}
		}

		/**
		 * Fire Press on a Button.
		 * Test if oButton is an enabled and visible sap.m.Button before triggering a press event.
		 *
		 * @param {sap.m.Button | sap.m.OverflowToolbarButton} oButton a SAP UI5 Button
		 */
		function fnFireButtonPress(oButton) {
			var aAuthorizedTypes = ["sap.m.Button", "sap.m.OverflowToolbarButton"];
			if (
				oButton &&
				aAuthorizedTypes.indexOf(oButton.getMetadata().getName()) !== -1 &&
				oButton.getVisible() &&
				oButton.getEnabled()
			) {
				oButton.firePress();
			}
		}

		function fnResolveStringtoBoolean(sValue) {
			if (sValue === "true" || sValue === true) {
				return true;
			} else {
				return false;
			}
		}

		/**
		 * Retrieves the main component associated with a given control / view.
		 *
		 * @param {sap.ui.base.ManagedObject} oControl a managed object
		 * @returns {sap.fe.core.AppComponent} the fiori Element AppComponent
		 */
		function getAppComponent(oControl) {
			var oOwner = Component.getOwnerComponentFor(oControl);
			if (!oOwner) {
				return oControl;
			} else {
				if (oOwner.isA("sap.fe.core.AppComponent")) {
					return oOwner;
				}
				return getAppComponent(oOwner);
			}
		}

		/**
		 * FE MessageBox to confirm in case data loss warning is to be given.
		 *
		 * @param {Function} fnProcess - Task to be performed if user confirms.
		 * @param {sap.ui.core.Control} oControl - Control responsible for the the trigger of the dialog
		 * @param {string} programmingModel - Type of transaction model
		 * @param oController
		 * @returns {object} MessageBox if confirmation is required else the fnProcess function.
		 */
		function fnProcessDataLossConfirmation(fnProcess, oControl, programmingModel, oController) {
			var oUIModelData = oControl && oControl.getModel("ui") && oControl.getModel("ui").getData(),
				bUIEditable = oUIModelData.createMode || oUIModelData.editMode === "Editable",
				oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates"),
				sWarningMsg = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_MSG"),
				sConfirmButtonTxt = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_CONFIRM_BUTTON"),
				sCancelButtonTxt = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_CANCEL_BUTTON");

			if (programmingModel === "Sticky" && bUIEditable) {
				return MessageBox.warning(sWarningMsg, {
					actions: [sConfirmButtonTxt, sCancelButtonTxt],
					onClose: function(sAction) {
						if (sAction === sConfirmButtonTxt) {
							var oLocalUIModel = oControl && oControl.getModel("localUI");

							Log.info("Navigation confirmed.");
							if (oLocalUIModel) {
								oLocalUIModel.setProperty("/sessionOn", false);
							} else {
								Log.warning("Local UIModel couldn't be found.");
							}
							fnProcess();
							if (oController) {
								oController.editFlow.fnStickyDiscard(oControl.getBindingContext());
							}
						} else {
							Log.info("Navigation rejected.");
						}
					}
				});
			}
			return fnProcess();
		}

		/**
		 * Performs External Navigation.
		 * @param {object} oView - LR or OP view where Navigation is performed
		 * @param {object} oSelectionVariantAndAttributes - Selection Variant and SemanticAttributes
		 * @param {string} sSemanticObject
		 * @param {string} sAction
		 * @param fnOnError
		 * @param {boolean} bOpenInNewTab - Open in new tab in case the app is in sticky edit mode
		 */
		function fnNavigateToExternalApp(oView, oSelectionVariantAndAttributes, sSemanticObject, sAction, fnOnError, bOpenInNewTab) {
			var oSelectionVariant =
				oSelectionVariantAndAttributes && oSelectionVariantAndAttributes.selectionVariant
					? oSelectionVariantAndAttributes.selectionVariant
					: new SelectionVariant();
			var vSemanticObjectMapping = oSelectionVariantAndAttributes.semanticObjectMapping;
			var aAttributes = oSelectionVariantAndAttributes && oSelectionVariantAndAttributes.attributes;
			var oAppComponent = CommonUtils.getAppComponent(oView);
			// TODO: We need to remove the below if block once FLP provide the solution to FIORITECHP1-14400
			if (bOpenInNewTab) {
				oView.getModel("localUI").setProperty("/IBN_OpenInNewTable", true);
			}

			var oNavigationService = oAppComponent.getNavigationService();
			var sContextUrl;
			if (oSelectionVariantAndAttributes && oSelectionVariantAndAttributes.entitySet && oSelectionVariant) {
				var sEntitySet = oSelectionVariantAndAttributes && oSelectionVariantAndAttributes.entitySet,
					oModel = oView.getModel();
				sContextUrl = oNavigationService.constructContextUrl(sEntitySet, oModel);
			}
			oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(aAttributes, oSelectionVariant.toJSONString());
			if (vSemanticObjectMapping) {
				oSelectionVariant = CommonUtils.setSemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
			}
			if (sContextUrl) {
				oSelectionVariant.setFilterContextUrl(sContextUrl);
			}
			var vNavigationParameters = oSelectionVariant.toJSONString();
			oNavigationService.navigate(
				sSemanticObject,
				sAction,
				vNavigationParameters,
				null,
				fnOnError,
				null,
				bOpenInNewTab ? "explace" : "inplace",
				bOpenInNewTab
			);
		}

		/**
		 * Check if Path based FieldControl Evaluates to inapplicable.
		 *
		 * @param {string} sFieldControlPath - Field control path
		 * @param {object} oAttribute - SemanticAttributes
		 * @returns {boolean} true if inapplicable
		 *
		 */
		function isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
			var bInapplicable = false,
				aParts = sFieldControlPath.split("/");
			// sensitive data is removed only if the path has already been resolved.
			if (aParts.length > 1) {
				bInapplicable =
					oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
			} else {
				bInapplicable = oAttribute[sFieldControlPath] === 0;
			}
			return bInapplicable;
		}

		/**
		 * Removes sensitive data from the semantic attribute with respect to entitySet.
		 *
		 * @param {Array} aAttributes Array of 'semantic Attributes' - context Data
		 * @param {boolean} oMetaModel V4 MetaModel for anntations
		 * @returns {Array} Array of semantic Attributes
		 **/

		function removeSensitiveData(aAttributes, oMetaModel) {
			var aOutAttributes = [];
			for (var i = 0; i < aAttributes.length; i++) {
				var sEntitySet = aAttributes[i].entitySet,
					oAttribute = aAttributes[i].contextData,
					aProperties;

				delete oAttribute["@odata.context"];
				delete oAttribute["@odata.metadataEtag"];
				delete oAttribute["SAP__Messages"];
				aProperties = Object.keys(oAttribute);
				for (var j = 0; j < aProperties.length; j++) {
					var sProp = aProperties[j],
						aPropertyAnnotations = oMetaModel.getObject("/" + sEntitySet + "/" + sProp + "@");
					if (aPropertyAnnotations) {
						if (
							aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] ||
							aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] ||
							aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]
						) {
							delete oAttribute[sProp];
						} else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
							var oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
							if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
								delete oAttribute[sProp];
							} else if (
								oFieldControl["$Path"] &&
								CommonUtils.isFieldControlPathInapplicable(oFieldControl["$Path"], oAttribute)
							) {
								delete oAttribute[sProp];
							}
						}
					}
				}
				aOutAttributes.push(oAttribute);
			}

			return aOutAttributes;
		}

		/**
		 * Method to get metadata of entityset properties.
		 *
		 * @param {object} oMetaModel - MetaModel for annotations
		 * @param {string} sEntitySet - EntitySet for properities
		 * @returns {object} the entity set properties
		 */
		function fnGetEntitySetProperties(oMetaModel, sEntitySet) {
			var oEntityType = oMetaModel.getObject("/" + sEntitySet + "/") || {},
				oProperties = {};

			for (var sKey in oEntityType) {
				if (
					oEntityType.hasOwnProperty(sKey) &&
					!/^\$/i.test(sKey) &&
					oEntityType[sKey].$kind &&
					oEntityType[sKey].$kind === "Property"
				) {
					oProperties[sKey] = oEntityType[sKey];
				}
			}
			return oProperties;
		}

		/**
		 * Method to get madatory filterfields.
		 *
		 * @param {object} oMetaModel - MetaModel for annotations
		 * @param {string} sEntitySet - EntitySet for properities
		 * @returns {object[]} the mandatory filter fields
		 */
		function fnGetMandatoryFilterFields(oMetaModel, sEntitySet) {
			var aMandatoryFilterFields;
			if (oMetaModel && sEntitySet) {
				aMandatoryFilterFields = oMetaModel.getObject(
					"/" + sEntitySet + "@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties"
				);
			}
			return aMandatoryFilterFields;
		}

		/**
		 * Method to get madatory filterfields
		 *
		 * @param {object} oControl - Control containing IBN Actions
		 * @param {Array} aIBNActions - array filled with IBN Actions
		 * @returns {Array} array containing the IBN Actions
		 *
		 */

		function fnGetIBNActions(oControl, aIBNActions) {
			var aActions = oControl.getActions();
			aActions.forEach(function(oAction) {
				if (oAction.data("IBNData")) {
					aIBNActions.push(oAction);
				}
			});
			return aIBNActions;
		}

		/**
		 * Method to update the IBN Buttons Visibility.
		 *
		 * @param {Array} aIBNActions - array containing all the IBN Actions with requires context false
		 * @param {object} oView - Instance of the view
		 */
		function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions, oView) {
			var that = this;
			var oParams = {};
			var fnGetLinks = function(oData) {
				if (oData) {
					var aKeys = Object.keys(oData);
					aKeys.map(function(sKey) {
						if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
							oParams[sKey] = { value: oData[sKey] };
						}
					});
				}
				if (aIBNActions.length) {
					aIBNActions.forEach(function(oIBNAction) {
						var sSemanticObject = oIBNAction.data("IBNData").semanticObject;
						var sAction = oIBNAction.data("IBNData").action;
						that.getShellServices(oView)
							.getLinks({
								semanticObject: sSemanticObject,
								action: sAction,
								params: oParams
							})
							.then(function(aLink) {
								oIBNAction.setVisible(aLink && aLink.length === 1);
							})
							.catch(function(oError) {
								Log.error("Cannot retrieve the links from the shell service", oError);
							});
					});
				}
			};
			if (oView && oView.getBindingContext()) {
				oView
					.getBindingContext()
					.requestObject()
					.then(function(oData) {
						return fnGetLinks(oData);
					})
					.catch(function(oError) {
						Log.error("Cannot retrieve the links from the shell service", oError);
					});
			} else {
				fnGetLinks();
			}
		}
		/**
		 * Creates the updated key to check the i18n override and fallbacks to the old value if the new value is not available for the same key.
		 *
		 * @param {string} sFrameworkKey - current key.
		 * @param {object} oResourceBundle - contains the local resource bundle
		 * @param {object} oParams - parameter object for the resource value
		 * @param {object} sEntitySetName - entity set name of the control where the resource is being used
		 * @returns {string} the translated text
		 */
		function getTranslatedText(sFrameworkKey, oResourceBundle, oParams, sEntitySetName) {
			var sContextOverriddenKey, sContextOverriddenText;
			if (oResourceBundle) {
				if (sEntitySetName) {
					//CASE: Context Specific Overriding of the text
					sContextOverriddenKey = sFrameworkKey + "|" + sEntitySetName;
					if (oResourceBundle.hasText(sContextOverriddenKey)) {
						sContextOverriddenText = oResourceBundle.getText(sContextOverriddenKey, oParams, true);
					} else if (oResourceBundle.aCustomBundles.length) {
						oResourceBundle.aCustomBundles.forEach(function(oCustomBundle) {
							if (oCustomBundle.hasText(sContextOverriddenKey)) {
								sContextOverriddenText = oCustomBundle.getText(sContextOverriddenKey, oParams, true);
							}
						});
					}
				}

				if (sContextOverriddenText) {
					return sContextOverriddenText;
				} else if (oResourceBundle.getText(sFrameworkKey, oParams, true)) {
					//CASE: Direct overriding of the Framework Text
					return oResourceBundle.getText(sFrameworkKey, oParams, true);
				}
			}
			//CASE: Framework Text
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
			return oResourceBundle.getText(sFrameworkKey, oParams);
		}

		/**
		 * Returns the metamodel path correctly for bound actions if used with bReturnOnlyPath as true,
		 * else returns an object which has 3 properties related to the action. They are the entity set name,
		 * the $Path value of the OperationAvailable annotation and the binding parameter name. If
		 * bCheckStaticValue is true, returns the static value of OperationAvailable annotation, if present.
		 * e.g. for bound action someNameSpace.SomeBoundAction
		 * of entity set SomeEntitySet, the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
		 *
		 * @param {oAction} oAction - context object of the action
		 * @param {boolean} bReturnOnlyPath - if false, additional info is returned along with metamodel path to the bound action
		 * @param {string} sActionName - name of the bound action of the form someNameSpace.SomeBoundAction
		 * @param {boolean} bCheckStaticValue - if true, the static value of OperationAvailable is returned, if present
		 * @returns {string|object} - string or object as specified by bReturnOnlyPath
		 * @private
		 * @sap-restricted
		 */
		function getActionPath(oAction, bReturnOnlyPath, sActionName, bCheckStaticValue) {
			sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
			var sEntityName = oAction.getPath().split("/@")[0];
			sEntityName = oAction.getObject(sEntityName).$Type;
			sEntityName = getEntitySetName(oAction.getModel(), sEntityName);
			if (bCheckStaticValue) {
				return oAction.getObject("/" + sEntityName + "/" + sActionName + "@Org.OData.Core.V1.OperationAvailable");
			}
			if (bReturnOnlyPath) {
				return "/" + sEntityName + "/" + sActionName;
			} else {
				return {
					sEntityName: sEntityName,
					sProperty: oAction.getObject("/" + sEntityName + "/" + sActionName + "@Org.OData.Core.V1.OperationAvailable/$Path"),
					sBindingParameter: oAction.getObject("/" + sEntityName + "/" + sActionName + "/@$ui5.overload/0/$Parameter/0/$Name")
				};
			}
		}

		function getEntitySetName(oMetaModel, sEntityType) {
			var oEntityContainer = oMetaModel.getObject("/");
			for (var key in oEntityContainer) {
				if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
					return key;
				}
			}
		}

		function computeDisplayMode(oPropertyAnnotations, oCollectionAnnotations) {
			var oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
				oTextArrangementAnnotation =
					oTextAnnotation &&
					((oPropertyAnnotations &&
						oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) ||
						(oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]));

			if (oTextArrangementAnnotation) {
				if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
					return "Description";
				} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
					return "ValueDescription";
				}
				//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
				return "DescriptionValue";
			}
			return oTextAnnotation ? "DescriptionValue" : "Value";
		}

		function setActionEnablement(oContextModel, oActionOperationAvailableMap, sContextCollectionName, aSelectedContexts) {
			for (var sAction in oActionOperationAvailableMap) {
				oContextModel.setProperty(sContextCollectionName + "/dynamicActions/" + sAction, {
					bEnabled: false,
					aApplicable: [],
					aNotApplicable: []
				});
				// Note that non dynamic actions are not processed here. They are enabled because
				// one or more are selected and the second part of the condition in the templating
				// is then undefined and thus the button takes the default enabling, which is true!
				var aApplicable = [],
					aNotApplicable = [];
				var sProperty = oActionOperationAvailableMap[sAction];
				for (var i = 0; i < aSelectedContexts.length; i++) {
					var oSelectedContext = aSelectedContexts[i];
					var oContextData = oSelectedContext.getObject();
					if (sProperty === null && !!oContextData["#" + sAction]) {
						//look for action advertisement if present and its value is not null
						oContextModel.setProperty(sContextCollectionName + "/dynamicActions/" + sAction + "/bEnabled", true);
						break;
					} else if (oSelectedContext.getObject(sProperty)) {
						oContextModel.setProperty(sContextCollectionName + "/dynamicActions/" + sAction + "/bEnabled", true);
						aApplicable.push(oSelectedContext);
					} else {
						aNotApplicable.push(oSelectedContext);
					}
				}
				oContextModel.setProperty(sContextCollectionName + "/dynamicActions/" + sAction + "/aApplicable", aApplicable);
				oContextModel.setProperty(sContextCollectionName + "/dynamicActions/" + sAction + "/aNotApplicable", aNotApplicable);
			}
		}
		function _getDefaultOperators(oRealProperty) {
			// mdc defines the full set of operations that are meaningful for each Edm Type
			var oDataClass = TypeUtil.getDataTypeClassName(oRealProperty);
			var oBaseType = TypeUtil.getBaseType(oDataClass);
			return FilterOperatorUtil.getOperatorsForType(oBaseType);
		}

		function _getRestrictions(aDefaultOps, aExpressionOps) {
			// From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
			// In case that no operators are found, return undefined so that the default set is used.
			var aOperators = aDefaultOps.filter(function(sElement) {
				return aExpressionOps.indexOf(sElement) > -1;
			});
			return aOperators.toString() || undefined;
		}

		function getOperatorsForProperty(sProperty, sEntitySetPath, oModel) {
			var oFilterRestrictions = oModel.getObject(sEntitySetPath + "@Org.OData.Capabilities.V1.FilterRestrictions");
			var aEqualsOps = ["EQ"];
			var aSingleRangeOps = ["EQ", "BT", "BTEX", "LT", "NOTLT", "GT", "NOTGT", "LE", "NOTLE", "GE", "NOTGE"];
			var aMultiRangeOps = ["EQ", "BT", "BTEX", "NOTBT", "NOTBTEX", "LT", "NOTLT", "GT", "NOTGT", "LE", "NOTLE", "GE", "NOTGE", "NE"];
			var aSeachExpressionOps = ["StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith", "Contains", "NotContains"];

			// Is there a Filter Restriction defined for this property?
			if (
				oFilterRestrictions &&
				oFilterRestrictions.FilterExpressionRestrictions &&
				oFilterRestrictions.FilterExpressionRestrictions.some(function(oRestriction) {
					return oRestriction.Property.$PropertyPath === sProperty;
				})
			) {
				var oRealProperty = oModel.getObject(sEntitySetPath + "/" + sProperty + "/$Type");
				// Get the default Operators for this Property Type
				var aDefaultOperators = _getDefaultOperators(oRealProperty);

				var aRestriction = oFilterRestrictions.FilterExpressionRestrictions.filter(function(oRestriction) {
					return oRestriction.Property.$PropertyPath === sProperty;
				});

				// In case more than one Allowed Expressions has been defined for a property
				// choose the most restrictive Allowed Expression

				// MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
				if (
					aRestriction.some(function(oRestriction) {
						return oRestriction.AllowedExpressions === "SingleValue" || oRestriction.AllowedExpressions === "MultiValue";
					})
				) {
					return _getRestrictions(aDefaultOperators, aEqualsOps);
				}

				if (
					aRestriction.some(function(oRestriction) {
						return oRestriction.AllowedExpressions === "SingleRange";
					})
				) {
					return _getRestrictions(aDefaultOperators, aSingleRangeOps);
				}

				if (
					aRestriction.some(function(oRestriction) {
						return oRestriction.AllowedExpressions === "MultiRange";
					})
				) {
					return _getRestrictions(aDefaultOperators, aMultiRangeOps);
				}

				if (
					aRestriction.some(function(oRestriction) {
						return oRestriction.AllowedExpressions === "SearchExpression";
					})
				) {
					return _getRestrictions(aDefaultOperators, aSeachExpressionOps);
				}

				if (
					aRestriction.some(function(oRestriction) {
						return oRestriction.AllowedExpressions === "MultiRangeOrSearchExpression";
					})
				) {
					return _getRestrictions(aDefaultOperators, aSeachExpressionOps.concat(aMultiRangeOps));
				}
				// In case AllowedExpressions is not recognised, undefined in return results in the default set of
				// operators for the type.
				return undefined;
			}
		}

		/**
		 * Method to get the compliant value type based on data type.
		 *
		 * @param {object} sValue - Raw value
		 * @param {string} sType - Property Metadata type for type conversion
		 * @returns {object} - value to be propagated to the condition.
		 */
		function getValueTypeCompliant(sValue, sType) {
			var oValue;
			if (aValidTypes.indexOf(sType) > -1) {
				oValue = sValue;
				if (sType === "Edm.Boolean") {
					oValue = sValue === "true" || (sValue === "false" ? false : undefined);
				} else if (sType === "Edm.Double" || sType === "Edm.Single") {
					oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
				} else if (sType === "Edm.Byte" || sType === "Edm.Int16" || sType === "Edm.Int32" || sType === "Edm.SByte") {
					oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
				} else if (sType === "Edm.Date") {
					oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
						? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]
						: sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
				} else if (sType === "Edm.DateTimeOffset") {
					if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
						oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
					} else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
						oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] + "+0000";
					} else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
						oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0] + "T00:00:00+0000";
					} else if (sValue.indexOf("Z") === sValue.length - 1) {
						oValue = sValue.split("Z")[0] + "+0100";
					} else {
						oValue = undefined;
					}
				} else if (sType === "Edm.TimeOfDay") {
					oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
				}
			}
			return oValue;
		}

		/**
		 * Method to create a condition.
		 * @param {string} sOption - Operator to be used.
		 * @param {object} oV1 - Lower Value
		 * @param {object} oV2 - Higher Value
		 * @param sSign
		 * @returns {object} - condition.
		 */
		function createConditions(sOption, oV1, oV2, sSign) {
			var oValue = oV1,
				oValue2,
				sInternalOperation,
				oCondition = {
					isEmpty: null,
					values: []
				};

			if (oV1 === undefined || oV1 === null) {
				return;
			}

			switch (sOption) {
				case "CP":
					sInternalOperation = "Contains";
					if (oValue) {
						var nIndexOf = oValue.indexOf("*");
						var nLastIndex = oValue.lastIndexOf("*");

						// only when there are '*' at all
						if (nIndexOf > -1) {
							if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
								sInternalOperation = "EndsWith";
								oValue = oValue.substring(1, oValue.length);
							} else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
								sInternalOperation = "StartsWith";
								oValue = oValue.substring(0, oValue.length - 1);
							} else {
								oValue = oValue.substring(1, oValue.length - 1);
							}
						} else {
							Log.warning("Contains Option cannot be used without '*'.");
							return;
						}
					}
					break;
				case "EQ":
					sInternalOperation = oV1 === "" ? "Empty" : sOption;
					break;
				case "NE":
					sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
					break;
				case "BT":
					if (oV2 === undefined || oV2 === null) {
						return;
					}
					oValue2 = oV2;
					sInternalOperation = sOption;
					break;
				case "LE":
				case "GE":
				case "GT":
				case "LT":
					sInternalOperation = sOption;
					break;
				default:
					Log.warning("Selection Option is not supported : '" + sOption + "'");
					return;
			}
			if (sSign === "E") {
				sInternalOperation = oExcludeMap[sInternalOperation];
			}
			oCondition.operator = sInternalOperation;
			if (sInternalOperation !== "Empty") {
				oCondition.values.push(oValue);
				if (oValue2) {
					oCondition.values.push(oValue2);
				}
			}

			return oCondition;
		}

		/**
		 * Method to convert selection variant to conditions.
		 * @param {object} oSelectionVariant - SelectionVariant to be converted.
		 * @param {object} oConditions - oConditions object to be extended.
		 * @param {object} oMetaModel - Odata V4 metamodel.
		 * @param {string} sEntitySet - EntitySet for the SV properties.
		 * @returns {object} - condition.
		 */
		function addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModel, sEntitySet) {
			var aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
				oValidProperties = CommonUtils.getEntitySetProperties(oMetaModel, sEntitySet),
				aParameterNames = oSelectionVariant.getParameterNames();

			// Remove all parameter names without 'P_' in them

			aParameterNames.forEach(function(sParameterName) {
				//check only those parameterNames starting from 'P_'
				if (sParameterName.substring(0, 2) === "P_") {
					var sOrigParamName = sParameterName;
					sParameterName = sParameterName.slice(2, sParameterName.length);
					//check if SO already has sParameterName, if so, then ignore sParameterName.
					if (aSelectOptionsPropertyNames.indexOf(sParameterName) == -1) {
						if (sParameterName in oValidProperties) {
							var sParameter = oSelectionVariant.getParameter(sOrigParamName),
								oValue = CommonUtils.getValueTypeCompliant(sParameter, oValidProperties[sParameterName].$Type),
								oCondition;
							if (oValue !== undefined || oValue !== null) {
								oCondition = {
									isEmpty: null,
									operator: "EQ",
									values: [oValue]
								};
								oConditions[sParameterName] = oConditions.hasOwnProperty(sParameterName)
									? oConditions[sParameterName].concat([oCondition])
									: [oCondition];
							}
						}
					}
				}
			});

			// Looping through all the propeties within selectOptions.
			aSelectOptionsPropertyNames.forEach(function(sPropertyName) {
				var sOrigPropertyName = sPropertyName;
				//check if propertyname starts with 'P_' or not, if it does, replace P_propertyName with propertyName
				if (sPropertyName.substring(0, 2) === "P_") {
					//Check if a matching propertyName is also present, if so ignore this value.
					sPropertyName = sPropertyName.slice(2, sPropertyName.length);
					if (aSelectOptionsPropertyNames.indexOf(sPropertyName) > -1) {
						sPropertyName = "";
					}
				}

				if (sPropertyName in oValidProperties) {
					var aConditions = [],
						aSelectOptions,
						aValidOperators;

					if (CommonUtils.isPropertyFilterable(oMetaModel, "/" + sEntitySet, sPropertyName, false, true)) {
						aSelectOptions = oSelectionVariant.getSelectOption(
							sOrigPropertyName == sPropertyName ? sPropertyName : sOrigPropertyName
						);
						aValidOperators = CommonUtils.getOperatorsForProperty(sPropertyName, "/" + sEntitySet, oMetaModel);

						// Create conditions for all the selectOptions of the property
						aConditions = aSelectOptions.reduce(function(aCumulativeConditions, oSelectOption) {
							var oValue1 = CommonUtils.getValueTypeCompliant(oSelectOption.Low, oValidProperties[sPropertyName].$Type),
								oValue2 = oSelectOption.High
									? CommonUtils.getValueTypeCompliant(oSelectOption.High, oValidProperties[sPropertyName].$Type)
									: undefined;
							if ((oValue1 !== undefined || oValue1 !== null) && oSelectOption.Option) {
								var oCondition = CommonUtils.createConditions(oSelectOption.Option, oValue1, oValue2, oSelectOption.Sign);
								if (!aValidOperators || aValidOperators.indexOf(oCondition.operator) > -1) {
									aCumulativeConditions.push(oCondition);
								}
							}
							return aCumulativeConditions;
						}, aConditions);
						if (aConditions.length) {
							oConditions[sPropertyName] = oConditions.hasOwnProperty(sPropertyName)
								? oConditions[sPropertyName].concat(aConditions)
								: aConditions;
						}
					}
				}
			});

			return oConditions;
		}

		/**
		 * Method to add condtions of page context to SelectionVariant.
		 * @param {object} oSelectionVariant Instance of {@link sap.fe.navigation.SelectionVariant} SelectionVariant to be used.
		 * @param {Array} mPageContext Conditons to be added to the SelectionVariant
		 * @param oView
		 * @returns {object} Instance of {@link sap.fe.navigation.SelectionVariant} SelectionVariant with the conditions.
		 * @private
		 * @ui5-restricted
		 * @example <code>
		 * </code>
		 */
		function addPageContextToSelectionVariant(oSelectionVariant, mPageContext, oView) {
			var oAppComponent = CommonUtils.getAppComponent(oView);
			var oNavigationService = oAppComponent.getNavigationService();
			return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
		}

		/**
		 * Method to add condtions to SelectionVariant.
		 * @param {object} oSelectionVariant Instance of {@link sap.fe.navigation.SelectionVariant} SelectionVariant to be used.
		 * @param {object} mFilters Conditons to be added to the SelectionVariant
		 * @returns {object} Instance of {@link sap.fe.navigation.SelectionVariant} SelectionVariant with the conditions.
		 * @private
		 * @ui5-restricted
		 * @example <code>
		 * </code>
		 */
		function addExternalStateFiltersToSelectionVariant(oSelectionVariant, mFilters) {
			var sFilter,
				sLow = "",
				sHigh = null;
			var fnGetSignAndOption = function(sOperator, sLowValue, sHighValue) {
				var oSelectOptionState = {
					option: "",
					sign: "I",
					low: sLowValue,
					high: sHighValue
				};
				switch (sOperator) {
					case "Contains":
						oSelectOptionState.option = "CP";
						break;
					case "StartsWith":
						oSelectOptionState.option = "CP";
						oSelectOptionState.low += "*";
						break;
					case "EndsWith":
						oSelectOptionState.option = "CP";
						oSelectOptionState.low = "*" + oSelectOptionState.low;
						break;
					case "BT":
					case "LE":
					case "LT":
					case "GT":
					case "NE":
					case "EQ":
						oSelectOptionState.option = sOperator;
						break;
					case "EEQ":
						oSelectOptionState.option = "EQ";
						break;
					case "Empty":
						oSelectOptionState.option = "EQ";
						oSelectOptionState.low = "";
						break;
					case "NotContains":
						oSelectOptionState.option = "CP";
						oSelectOptionState.sign = "E";
						break;
					case "NOTBT":
						oSelectOptionState.option = "BT";
						oSelectOptionState.sign = "E";
						break;
					case "NotStartsWith":
						oSelectOptionState.option = "CP";
						oSelectOptionState.low += "*";
						oSelectOptionState.sign = "E";
						break;
					case "NotEndsWith":
						oSelectOptionState.option = "CP";
						oSelectOptionState.low = "*" + oSelectOptionState.low;
						oSelectOptionState.sign = "E";
						break;
					case "NotEmpty":
						oSelectOptionState.option = "NE";
						oSelectOptionState.low = "";
						break;
					case "NOTLE":
						oSelectOptionState.option = "LE";
						oSelectOptionState.sign = "E";
						break;
					case "NOTGE":
						oSelectOptionState.option = "GE";
						oSelectOptionState.sign = "E";
						break;
					case "NOTLT":
						oSelectOptionState.option = "LT";
						oSelectOptionState.sign = "E";
						break;
					case "NOTGT":
						oSelectOptionState.option = "GT";
						oSelectOptionState.sign = "E";
						break;
					default:
						Log.warning(sOperator + " is not supported. " + sFilter + " could not be added to the navigation context");
				}
				return oSelectOptionState;
			};
			mFilters = mFilters.filter || mFilters;
			for (var sFilter in mFilters) {
				if (sFilter === "$editState") {
					continue;
				}
				var aFilters = mFilters[sFilter];
				for (var item in aFilters) {
					var oFilter = aFilters[item];
					sLow = (oFilter.values[0] && oFilter.values[0].toString()) || "";
					sHigh = (oFilter.values[1] && oFilter.values[1].toString()) || null;
					var oSelectOptionValues = fnGetSignAndOption(oFilter.operator, sLow, sHigh);
					if (oSelectOptionValues.option) {
						oSelectionVariant.addSelectOption(
							sFilter,
							oSelectOptionValues.sign,
							oSelectOptionValues.option,
							oSelectOptionValues.low,
							oSelectOptionValues.high
						);
					}
				}
			}
			return oSelectionVariant;
		}

		/**
		 * Returns true if Application is in sticky edit mode.
		 *
		 * @param {object} oControl
		 * @param {string} programmingModel
		 * @returns {boolean} if we are in sticky mode
		 */
		function isStickyEditMode(oControl, programmingModel) {
			var oUIModelData = oControl && oControl.getModel("ui") && oControl.getModel("ui").getData();
			var bUIEditable = oUIModelData.createMode || oUIModelData.editMode === "Editable";
			return programmingModel === "Sticky" && bUIEditable;
		}

		/**
		 * Method to add display currency to selection variant.
		 * @param {Array} aMandatoryFilterFields - mandatory filterfields of entitySet.
		 * @param {object} oAppData - app-state data.
		 */
		function addDefaultDisplayCurrency(aMandatoryFilterFields, oAppData) {
			if (oAppData && oAppData.oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
				for (var i = 0; i < aMandatoryFilterFields.length; i++) {
					var aSVOption = oAppData.oSelectionVariant.getSelectOption("DisplayCurrency"),
						aDefaultSVOption =
							oAppData.oDefaultedSelectionVariant && oAppData.oDefaultedSelectionVariant.getSelectOption("DisplayCurrency");
					if (
						aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" &&
						(!aSVOption || !aSVOption.length) &&
						aDefaultSVOption &&
						aDefaultSVOption.length
					) {
						var displayCurrencySelectOption = aDefaultSVOption[0];
						var sSign = displayCurrencySelectOption["Sign"];
						var sOption = displayCurrencySelectOption["Option"];
						var sLow = displayCurrencySelectOption["Low"];
						var sHigh = displayCurrencySelectOption["High"];
						oAppData.oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
					}
				}
			}
		}

		/**
		 * Returns an array of visible, non-computed key and immutable properties.
		 *
		 * @param {object} oMetaModel
		 * @param sPath
		 * @returns {Array} aNonComputedVisibleFields
		 */
		function getNonComputedVisibleFields(oMetaModel, sPath) {
			var aTechnicalKeys = oMetaModel.getObject(sPath + "/").$Key;
			var aNonComputedVisibleFields = [];
			var oEntityType = oMetaModel.getObject(sPath + "/");
			for (var item in oEntityType) {
				if (oEntityType[item].$kind && oEntityType[item].$kind === "Property") {
					var oAnnotations = oMetaModel.getObject(sPath + "/" + item + "@") || {},
						bIsKey = aTechnicalKeys.indexOf(item) > -1,
						bIsImmutable = bIsKey || oAnnotations["@Org.OData.Core.V1.Immutable"],
						bIsNonComputed = !oAnnotations["@Org.OData.Core.V1.Computed"],
						bIsVisible = !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
					if (bIsImmutable && bIsNonComputed && bIsVisible) {
						aNonComputedVisibleFields.push(item);
					}
				}
			}
			return aNonComputedVisibleFields;
		}

		/**
		 * Sets the FLP user defaults.
		 *
		 * @function
		 * @name sap.fe.core.CommonUtils.setUserDefaults
		 * @memberof sap.fe.core.CommonUtils
		 * @param {object} [oAppComponent] app's onwer component
		 * @param {Array} [aParameters]  parameters in the dialog
		 * @param {object} [oModel] model to which the default value has to be set
		 * @param {boolean} [bIsAction] true if aParameters contains action parameters
		 * @returns {Promise}
		 * @sap-restricted
		 * @final
		 **/
		function setUserDefaults(oAppComponent, aParameters, oModel, bIsAction) {
			return new Promise(function(resolve, reject) {
				var oComponentData = oAppComponent.getComponentData(),
					oStartupParameters = (oComponentData && oComponentData.startupParameters) || {},
					oShellServices = oAppComponent.getShellServices();

				if (!oShellServices.hasUShell()) {
					aParameters.map(function(oParameter) {
						var sPropertyName = bIsAction
							? "/" + oParameter.$Name
							: oParameter.getPath().slice(oParameter.getPath().lastIndexOf("/") + 1);
						var sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
						if (oStartupParameters[sParameterName]) {
							oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
						}
					});
					return resolve(true);
				}
				return oShellServices.getStartupAppState(oAppComponent).then(function(oStartupAppState) {
					var oData = oStartupAppState.getData() || {},
						aExtendedParameters = (oData.selectionVariant && oData.selectionVariant.SelectOptions) || [];
					aParameters.map(function(oParameter) {
						var sPropertyName = bIsAction
							? "/" + oParameter.$Name
							: oParameter.getPath().slice(oParameter.getPath().lastIndexOf("/") + 1);
						var sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
						if (oStartupParameters[sParameterName]) {
							oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
						} else if (aExtendedParameters.length > 0) {
							for (var i in aExtendedParameters) {
								var oExtendedParameter = aExtendedParameters[i];
								if (oExtendedParameter.PropertyName === sParameterName) {
									var oRange = oExtendedParameter.Ranges.length ? oExtendedParameter.Ranges[0] : undefined;
									if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
										oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
									}
								}
							}
						}
					});
					return resolve(true);
				});
			});
		}
		/**
		 * Gets semantic object mappings defined in app descriptor outbounds.
		 *
		 * @function
		 * @name sap.fe.core.CommonUtils.getSemanticObjectMapping
		 * @memberof sap.fe.core.CommonUtils
		 * @param {object} [oOutbound] outbound defined in app descriptor
		 * @returns {Array} [aSemanticObjectMapping] a collection of semantic object mappings defined for one outbound
		 * @sap-restricted
		 * @final
		 **/
		function getSemanticObjectMapping(oOutbound) {
			var aSemanticObjectMapping = [];
			if (oOutbound.parameters) {
				var aParameters = Object.keys(oOutbound.parameters) || [];
				if (aParameters.length > 0) {
					aParameters.forEach(function(sParam) {
						var oMapping = oOutbound.parameters[sParam];
						if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
							// using the format of UI.Mapping
							var oSemanticMapping = {
								"LocalProperty": {
									"$PropertyPath": oMapping.value.value
								},
								"SemanticObjectProperty": sParam
							};

							if (aSemanticObjectMapping.length > 0) {
								// To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
								for (var i = 0; i < aSemanticObjectMapping.length; i++) {
									if (
										aSemanticObjectMapping[i]["LocalProperty"]["$PropertyPath"] !==
										oSemanticMapping["LocalProperty"]["$PropertyPath"]
									) {
										aSemanticObjectMapping.push(oSemanticMapping);
									}
								}
							} else {
								aSemanticObjectMapping.push(oSemanticMapping);
							}
						}
					});
				}
			}
			return aSemanticObjectMapping;
		}
		/**
		 * Returns the datapoints/ microcharts for which target outbound is configured.
		 *
		 * @param {object} oViewData view data as given in app descriptor
		 * @param {object} oCrossNav the target outbound in cross navigation in manifest
		 * @returns {object} oHeaderFacetItems datapoints/microcharts with outbound defined
		 */
		function getHeaderFacetItemConfigForExternalNavigation(oViewData, oCrossNav) {
			var aSemanticObjectMapping = [];
			var oHeaderFacetItems = {};
			var sId;
			var oControlConfig = oViewData.controlConfiguration;
			for (var config in oControlConfig) {
				if (
					config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 ||
					config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1
				) {
					if (
						oControlConfig[config].navigation &&
						oControlConfig[config].navigation.targetOutbound &&
						oControlConfig[config].navigation.targetOutbound.outbound
					) {
						var sOutbound = oControlConfig[config].navigation.targetOutbound.outbound;
						var oOutbound = oCrossNav[sOutbound];
						if (oOutbound.semanticObject && oOutbound.action) {
							if (config.indexOf("Chart") > -1) {
								sId = StableIdHelper.generate(["fe", "MicroChartLink", config]);
							} else {
								sId = StableIdHelper.generate(["fe", "HeaderDPLink", config]);
							}
							var aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
							oHeaderFacetItems[sId] = {
								semanticObject: oOutbound.semanticObject,
								action: oOutbound.action,
								semanticObjectMapping: aSemanticObjectMapping
							};
						} else {
							Log.error("Cross navigation outbound is configured without semantic object and action for " + sOutbound);
						}
					}
				}
			}
			return oHeaderFacetItems;
		}
		/**
		 * Method to replace Local Properties with Semantic Object mappings.
		 *
		 * @param {object} oSelectionVariant - SelectionVariant consisting of filterbar, Table and Page Context
		 * @param {object} vMappings - stringified version of semantic object mappinghs
		 * @returns {object} - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
		 */
		function setSemanticObjectMappings(oSelectionVariant, vMappings) {
			var oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
			for (var i = 0; i < oMappings.length; i++) {
				var sLocalProperty =
					(oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"]) ||
					(oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] &&
						oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"]);
				var sSemanticObjectProperty =
					oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
				if (oSelectionVariant.getSelectOption(sLocalProperty)) {
					var oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);

					//Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
					oSelectionVariant.removeSelectOption(sLocalProperty);
					oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
				}
			}
			return oSelectionVariant;
		}
		var CommonUtils = {
			isPropertyFilterable: isPropertyFilterable,
			isFieldControlPathInapplicable: isFieldControlPathInapplicable,
			removeSensitiveData: removeSensitiveData,
			fireButtonPress: fnFireButtonPress,
			getParentViewOfControl: fnGetParentViewOfControl,
			hasTransientContext: fnHasTransientContexts,
			updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
			resolveStringtoBoolean: fnResolveStringtoBoolean,
			getAppComponent: getAppComponent,
			processDataLossConfirmation: fnProcessDataLossConfirmation,
			navigateToExternalApp: fnNavigateToExternalApp,
			getMandatoryFilterFields: fnGetMandatoryFilterFields,
			getEntitySetProperties: fnGetEntitySetProperties,
			updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
			getTranslatedText: getTranslatedText,
			getEntitySetName: getEntitySetName,
			getActionPath: getActionPath,
			computeDisplayMode: computeDisplayMode,
			setActionEnablement: setActionEnablement,
			isStickyEditMode: isStickyEditMode,
			getOperatorsForProperty: getOperatorsForProperty,
			addSelectionVariantToConditions: addSelectionVariantToConditions,
			addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
			addPageContextToSelectionVariant: addPageContextToSelectionVariant,
			createConditions: createConditions,
			getValueTypeCompliant: getValueTypeCompliant,
			addDefaultDisplayCurrency: addDefaultDisplayCurrency,
			getNonComputedVisibleFields: getNonComputedVisibleFields,
			setUserDefaults: setUserDefaults,
			getShellServices: getShellServices,
			getIBNActions: fnGetIBNActions,
			getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
			getSemanticObjectMapping: getSemanticObjectMapping,
			setSemanticObjectMappings: setSemanticObjectMappings
		};

		return CommonUtils;
	}
);
