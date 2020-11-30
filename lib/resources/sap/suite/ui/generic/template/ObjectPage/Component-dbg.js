sap.ui.define(["sap/ui/core/mvc/OverrideExecution", "sap/suite/ui/generic/template/lib/TemplateAssembler",
	"sap/suite/ui/generic/template/lib/TemplateComponent", "sap/suite/ui/generic/template/detailTemplates/detailUtils",
	"sap/suite/ui/generic/template/ObjectPage/controller/ControllerImplementation", "sap/suite/ui/generic/template/ObjectPage/controllerFrameworkExtensions", "sap/base/util/extend",
	"sap/suite/ui/generic/template/js/AnnotationHelper", "sap/ui/model/odata/AnnotationHelper", "sap/suite/ui/generic/template/js/preparationHelper", "sap/suite/ui/generic/template/js/StableIdHelper", 
	"sap/base/util/deepExtend", "sap/suite/ui/generic/template/js/staticChecksHelper"
], function(OverrideExecution, TemplateAssembler, TemplateComponent, detailUtils, ControllerImplementation, controllerFrameworkExtensions, extend, AH, AHModel, preparationHelper, StableIdHelper, deepExtend, staticChecksHelper) {
	"use strict";

	function getMethods(oComponent, oComponentUtils) {
		var oViewProxy = {};

		var oBase = detailUtils.getComponentBase(oComponent, oComponentUtils, oViewProxy);

		var oSpecific = {
			oControllerSpecification: {
				getMethods: ControllerImplementation.getMethods.bind(null, oViewProxy),
				oControllerDefinition: controllerFrameworkExtensions,
				oControllerExtensionDefinition: { // callbacks for controller extensions
					// allows extensions to store their specific state. Therefore, the implementing controller extension must call fnSetExtensionStateData(oControllerExtension, oExtensionState).
					// oControllerExtension must be the ControllerExtension instance for which the state should be stored. oExtensionState is the state to be stored.
					// Note that the call is ignored if oExtensionState is faulty
					// Note that the Lifecycle Object is the part of return from the function getCurrentState(where fnSetExtensionStateData is defined). Values for the Lifecycle Object parameters(Page, Permanent etc.) should be provided in extension implementation
					provideExtensionStateData: function(fnSetExtensionStateData){},
					// asks extensions to restore their state according to a state which was previously stored.
					// Therefore, the implementing controller extension can call fnGetExtensionStateData(oControllerExtension) in order to retrieve the state information which has been stored in the current state for this controller extension.
					// undefined will be returned by this function if no state or a faulty state was stored.
					restoreExtensionStateData: function(fnGetExtensionStateData, bIsSameAsLast){},
					// gives extensions the possibility to make sure that certain fields will be contained in the select clause of the table binding.
					// This should be used, when custom logic of the extension depends on these fields.
					// For each custom field the extension must call fnEnsureSelectionProperty(oControllerExtension, sFieldname).
					// oControllerExtension must be the ControllerExtension instance which ensures the field to be part of the select clause.
					// sFieldname must specify the field to be selected. Note that this must either be a field of the entity set itself or a field which can be reached via a :1 navigation property.
					// In the second case sFieldname must contain the relative path.
					ensureFieldsForSelect: function(fnEnsureSelectionProperty, sControlId){},
					// allows extension to add filters. They will be combined via AND with all other filters
					// For each filter the extension must call fnAddFilter(oControllerExtension, oFilter)
					// oControllerExtension must be the ControllerExtension instance which adds the filter
					// oFilter must be an instance of sap.ui.model.Filter
					addFilters: function(fnAddFilter, sControlId){}
				}
			},
			getTemplateSpecificParameters: function(oMetaModel, oOriginalSettings, Device, sLeadingEntitySet){
				function fnGetSections(sPath, bHeaderFacet){
					// Analysis of facets. Needs to be tolerant, as sometimes facets are defined in a way that seems to be meaningless,
					// (sometimes used just to be able to replace them in an extension, not clear, whether this is the only reason)
					// known case:
					// collection facet without any facets
					// reference facet without a target (but with an ID)
					// reference facet with a target pointing to an arbitrary string (without special characters, not pointing to sth. within the service)
					// reference facet with a target pointing to a not existing navigation property
					var oResult = {};
					var aFacets = oMetaModel.getObject(sPath);
					if (!Array.isArray(aFacets)) {
						// in case of empty collection facet, metaModel returns {} (instead of [] as would be expected)
						// for anything else, meaning would currently not be clear
						return {};
					} 
					aFacets.forEach(function(oFacet, i){
						if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.CollectionFacet") { 
							Object.assign(oResult, fnGetSections(sPath + "/" + i + "/Facets", bHeaderFacet));
						} else if (oFacet.RecordType === "com.sap.vocabularies.UI.v1.ReferenceFacet" && oFacet.Target && oFacet.Target.AnnotationPath){
							var oSection = {};
							var aSegments = oFacet.Target.AnnotationPath.split("/");
							var aParts = aSegments.pop().split("#"); 
							if (aParts[0][0] === "@"){
								oSection.annotation = aParts[0].slice(1);
							}
							oSection.qualifier = aParts[1];
							oSection.navigationProperty = aSegments.join("/");
							if (oSection.navigationProperty){
								var sTargetPath = AHModel.gotoEntitySet(oMetaModel.getContext(sPath + "/" + i + "/Target"));
								oSection.entitySet = sTargetPath && oMetaModel.getObject(sTargetPath).name;
							} else {
								oSection.entitySet = sLeadingEntitySet;
							}
							if (oSection.entitySet){ // otherwise, navigationProperty is defined (in annotation), but not existing -> ignore, as section will anyway not be generated
								oSection.facetId = StableIdHelper.getStableId({
									type: "ObjectPage",
									subType: "Facet",
									sRecordType: oFacet.RecordType,
									bIsHeaderFacet: bHeaderFacet,
									sAnnotationPath: oFacet.Target.AnnotationPath,
									sAnnotationId: oFacet.ID && oFacet.ID.String
								});
								oResult[AH.replaceSpecialCharsInId(oFacet.Target.AnnotationPath)] = oSection;
							}
						}
					});
					return oResult;
				}

				function fnGetNormalizedTableSettings(oSettings, oExtensionActions){
					// for ObjectPage, unfortunately an additional settings allTableMultiSelect had been introduced, that just has the same meaning as setting
					// multiSelect on component level, but needs to be supported for compatibility
					oSettings.multiSelect = oSettings.multiSelect || oSettings.allTableMultiSelect;
					
					var oLineItem = preparationHelper.getAnnotation(oMetaModel, oMetaModel.getODataEntitySet(oSettings.entitySet).entityType, oSettings.annotation, oSettings.qualifier);
					
					var oResult = preparationHelper.getNormalizedTableSettings(oMetaModel, oSettings, Device, oSettings.entitySet, oExtensionActions, oLineItem);
					oResult.variantManagement = !!(oSettings.tableSettings && oSettings.tableSettings.variantManagement);
					// if selection is only needed for delete (button in toolbar), it should be only set when deletion is actually possible
					// in draft, deletion is possible only in edit case, in non-draft, only in display case
					if (oResult.onlyForDelete) {
						oResult.mode = oComponentUtils.isDraftEnabled() ? "{= ${ui>/editable} ? '"  + oResult.mode + "' : 'None'}" 
																		: "{= ${ui>/editable} ? 'None' : '"  + oResult.mode + "'}";
					}
					var oEntitySet = oMetaModel.getODataEntitySet(oSettings.entitySet);
					if (oResult && oResult.createWithParameterDialog && oResult.createWithParameterDialog.fields) {
						staticChecksHelper.checkErrorforCreateWithDialog(oMetaModel.getODataEntityType(oEntitySet.entityType), oResult);
					}

					return oResult;
				}
				
				function fnGetNormalizedChartSettings(oSettings){
					return {
						variantManagement: !!(oSettings.chartSettings && oSettings.chartSettings.variantManagement)
					};
				}

				var oResult = {
						sections: {}
				};

				var sEntitySetPath = oMetaModel.getMetaContext("/" + sLeadingEntitySet).getPath();
				Object.assign(oResult.sections, fnGetSections(sEntitySetPath + "/com.sap.vocabularies.UI.v1.HeaderFacets", true));
				Object.assign(oResult.sections, fnGetSections(sEntitySetPath + "/com.sap.vocabularies.UI.v1.Facets", false));

				for (var i in oResult.sections){
					// defaulting:
					// Prio 1: key properties derived from annotation (always there)
					// Prio 2: whatever is explicitly defined in manifest 

					//To avoid the inconsitency introduced in the past to read section settings, the framework now merges the settings coming from id generated from annotations
					//and the id framework generates thus avoid breaking the possibility to define the settings either way.
					var oMergedSectionSettings = oOriginalSettings.sections && Object.assign({}, oOriginalSettings.sections[i], oOriginalSettings.sections[oResult.sections[i].facetId]);
					oResult.sections[i] = Object.assign({}, oMergedSectionSettings, oResult.sections[i]);
					// Prio 3: any settings on page level: Maybe only relevant depending on annotation (e.g. tableSettings only relevant for LineItem annotation)
					var oSectionSettings = deepExtend({}, oOriginalSettings, oResult.sections[i]);
					switch (oSectionSettings.annotation){
						case "com.sap.vocabularies.UI.v1.LineItem":
							var oExtensions = oComponentUtils.getExtensions();
							oResult.sections[i].tableSettings = fnGetNormalizedTableSettings(oSectionSettings, oExtensions && oExtensions.Sections && oExtensions.Sections[oResult.sections[i].facetId] && oExtensions.Sections[oResult.sections[i].facetId].Actions);
							break;
						case "com.sap.vocabularies.UI.v1.Chart":
							oResult.sections[i].chartSettings = fnGetNormalizedChartSettings(oSectionSettings);
							break;
						default: break;
//						further possibilities:
//					case "com.sap.vocabularies.UI.v1.FieldGroup":
//					case "com.sap.vocabularies.UI.v1.Identification":
//					case "com.sap.vocabularies.Communication.v1.Contact":
//					case "com.sap.vocabularies.UI.v1.DataPoint":						
					}
				}

				oResult.breadCrumb =  oComponentUtils.getBreadCrumbInfo();
				return oResult;
			},
			refreshBinding: function(bUnconditional, mRefreshInfos) {
				// default implementation: invalidate context element binding is bound to
				if (bUnconditional) {
					oComponentUtils.refreshBindingUnconditional();
				} else {
					oViewProxy.refreshFacets(mRefreshInfos);
				}
			},
			presetDisplayMode: function(iDisplayMode, bIsAlreadyDisplayed){
				if (bIsAlreadyDisplayed){
					return; // wait for the data to come for the case that the view is already displayed
				}
				var oTemplateModel = oComponentUtils.getTemplatePrivateModel();
				oTemplateModel.setProperty("/objectPage/displayMode", iDisplayMode);
			},
			showConfirmationOnDraftActivate: function(){
				return oComponent.getShowConfirmationOnDraftActivate();
			},
			beforeRebind: function(oWaitForPromise){
				oViewProxy.beforeRebind(oWaitForPromise);
			},
			afterRebind: function(){
				oViewProxy.afterRebind();
			},
			enhanceExtensionAPI4Reuse: function(oExtensionAPI, oEmbeddedComponentMeta){
				oExtensionAPI.setSectionHidden = function(bHidden){
					var oTemplateModel = oComponentUtils.getTemplatePrivateModel();
					oTemplateModel.setProperty("/generic/embeddedComponents/" + oEmbeddedComponentMeta.key + "/hidden", bHidden);
				};
				oExtensionAPI.setTagsInHeader = function(aTags){
					var oOverflowToolbar = oViewProxy.oController.byId("template::ObjectPage::OverflowToolbar");
					if (oOverflowToolbar) {
						// destroy content except Object Marker
						var oObjectMarker = oOverflowToolbar.getContent()[0];
						oOverflowToolbar.removeContent(oObjectMarker);
						oOverflowToolbar.destroyContent();
						oOverflowToolbar.addContent(oObjectMarker);
						for (var i = 0; i < aTags.length; i++) {
							oOverflowToolbar.addContent(aTags[i]);
						}
					}
				};
			}
		};
		return extend(oBase, oSpecific);
	}

	return TemplateAssembler.getTemplateComponent(getMethods,
		"sap.suite.ui.generic.template.ObjectPage", {

			metadata: {
				library: "sap.suite.ui.generic.template",
				properties: {
					// reference to smart template
					"templateName": {
						"type": "string",
						"defaultValue": "sap.suite.ui.generic.template.ObjectPage.view.Details"
					},
					// shall button "Related Apps" be visible on the object page?
					"showRelatedApps": {
						"type": "boolean",
						"defaultValue": "false"
					},
					// shall confirmation popup be shown in object page while saving?
					"showConfirmationOnDraftActivate": {
						"type": "boolean",
						"defaultValue": false
					},
					// hide chevron for unauthorized inline external navigation?
					"hideChevronForUnauthorizedExtNav": {
						"type": "boolean",
						"defaultValue": "false"
					},
					// To enable multiselect in tables
					"multiSelect": "boolean",
					"allTableMultiSelect": "boolean",
					// shall it be possible to edit the contents of the header?
					"editableHeaderContent": {
						"type": "boolean",
						"defaultValue": "false"
					},
					"gridTable": "boolean",
					"tableType": "string",
					tableSettings: {
						type: "object",
						properties: { 	// Unfortunately, managed object does not provide any specific support for type "object". We use just properties, and define everything below exactly like the properties of the component.
										// Currently, everything here is just for documentation, but has no functionality. In future, a mechanism to fill default values shall be added
							type: { // Defines the type of table to be used. Possible values: ResponsiveTable, GridTable, TreeTable, AnalyticalTable.
								type: "string",
								defaultValue: undefined // If sap:semantics=aggregate, and device is not phone, AnalyticalTable is used by default, otherwise ResponsiveTable
							},
							multiSelect: { // Defines, whether selection of multiple entries is possible. Only relevant, if actions exist.
								type: "boolean",
								defaultValue: false
							},
							inlineDelete: { // Defines whether, if a row can be deleted, this possibility should be provided inline
								type: "boolean",
								defaultValue: false
							},
							selectAll: { // Defines, whether a button to select all entries is available. Only relevant for table type <> ResponsiveTable, and if multiSelect is true.
								type: "boolean",
								defaultValue: false
							},
							selectionLimit: { // Defines the maximal number of lines to be loaded by a range selection from the backend. Only relevant for table type <> ResponsiveTable, if multiSelect is true, and selectAll is false.
								type: "int",
								defaultValue: 200
							},
							variantManagement: { // Defines, whether variantManagement should be used
								type: "boolean",
								defaultValue: false
							}
						}
					},
					chartSettings: {
						type: "object",
						properties: {
							variantManagement: { // Defines, whether variantManagement should be used
								type: "boolean",
								defaultValue: false
							}
						}
					},
					"condensedTableLayout": "boolean",
					"sections": "object",
					// Shall the simple header facets be used?
					"simpleHeaderFacets": {
						"type": "boolean",
						"defaultValue": "false"
					},
					//Allow deep linking to sub object pages?
					"allowDeepLinking": "boolean",
					//Navigate to list report page on draft activation?
					"navToListOnSave": "boolean",
					"designtimePath": {
						"type": "string",
						"defaultValue": "sap/suite/ui/generic/template/designtime/ObjectPage.designtime"
					},
					"flexibilityPath" : {
						"type": "string",
						"defaultValue": "sap/suite/ui/generic/template/ObjectPage/flexibility/ObjectPage.flexibility"
					}
				},
				// app descriptor format
				"manifest": "json"
			}
		});
});
