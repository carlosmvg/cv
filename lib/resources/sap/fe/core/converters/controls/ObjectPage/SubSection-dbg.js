sap.ui.define(["../../ManifestSettings", "../../helpers/ID", "../Common/Form", "../Common/DataVisualization", "../../helpers/ConfigurableObject", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/Key"], function (ManifestSettings, ID, Form, DataVisualization, ConfigurableObject, Action, Key) {
  "use strict";

  var _exports = {};
  var KeyHelper = Key.KeyHelper;
  var isActionNavigable = Action.isActionNavigable;
  var getEnabledBinding = Action.getEnabledBinding;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var isReferenceFacet = Form.isReferenceFacet;
  var createFormDefinition = Form.createFormDefinition;
  var SubSectionID = ID.SubSectionID;
  var FormID = ID.FormID;
  var CustomSubSectionID = ID.CustomSubSectionID;
  var SectionType = ManifestSettings.SectionType;
  var ActionType = ManifestSettings.ActionType;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var SubSectionType;

  (function (SubSectionType) {
    SubSectionType["Unknown"] = "Unknown";
    SubSectionType["Form"] = "Form";
    SubSectionType["DataVisualization"] = "DataVisualization";
    SubSectionType["XMLFragment"] = "XMLFragment";
    SubSectionType["Placeholder"] = "Placeholder";
  })(SubSectionType || (SubSectionType = {}));

  _exports.SubSectionType = SubSectionType;
  var targetTerms = ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]; // TODO: Need to handle Table case inside createSubSection function if CollectionFacet has Table ReferenceFacet

  var hasTable = function () {
    var facets = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return facets.some(function (facetType) {
      var _facetType$Target, _facetType$Target$$ta;

      return targetTerms.indexOf(facetType === null || facetType === void 0 ? void 0 : (_facetType$Target = facetType.Target) === null || _facetType$Target === void 0 ? void 0 : (_facetType$Target$$ta = _facetType$Target.$target) === null || _facetType$Target$$ta === void 0 ? void 0 : _facetType$Target$$ta.term) > -1;
    });
  };
  /**
   * Create subsections based on facet definition.
   *
   * @param facetCollection
   * @param converterContext
   * @returns {ObjectPageSubSection[]} the current subections
   */


  function createSubSections(facetCollection, converterContext) {
    // First we determine which sub section we need to create
    var facetsToCreate = facetCollection.reduce(function (facetsToCreate, facetDefinition) {
      switch (facetDefinition.$Type) {
        case "com.sap.vocabularies.UI.v1.ReferenceFacet":
          facetsToCreate.push(facetDefinition);
          break;

        case "com.sap.vocabularies.UI.v1.CollectionFacet":
          // TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
          // first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
          if (hasTable(facetDefinition.Facets) || !facetDefinition.Facets.every(function (facetType) {
            return facetType.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet";
          })) {
            facetDefinition.Facets.forEach(function (facetType) {
              return facetsToCreate.push(facetType);
            });
          } else {
            //Second case if a collection facet has all reference facet then sub-section should be created only for parent collection facet not for all child reference facets.
            facetsToCreate.push(facetDefinition);
          }

          break;

        case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
          // Not supported
          break;
      }

      return facetsToCreate;
    }, []); // Then we create the actual subsections

    return facetsToCreate.map(function (facet) {
      return createSubSection(facet, converterContext, "");
    });
  } // function isTargetForCompliant(annotationPath: AnnotationPath) {
  // 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
  // }


  _exports.createSubSections = createSubSections;

  var getSubSectionKey = function (facetDefinition, fallback) {
    var _facetDefinition$ID, _facetDefinition$Labe;

    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };
  /**
   * Retrieves the action form a facet.
   *
   * @param facetDefinition
   * @param converterContext
   * @returns {ConverterAction[]} the current facet actions
   */


  function getFacetActions(facetDefinition, converterContext) {
    var actions = new Array();

    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        actions = facetDefinition.Facets.filter(function (facetDefinition) {
          return isReferenceFacet(facetDefinition);
        }).reduce(function (actions, facetDefinition) {
          return createFormActionReducer(actions, facetDefinition, converterContext);
        }, []);
        break;

      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        actions = createFormActionReducer([], facetDefinition, converterContext);
        break;
    }

    return actions;
  }
  /**
   * Create a subsection based on a FacetTypes.
   *
   * @param facetDefinition
   * @param converterContext
   * @param subSectionTitle
   * @returns {ObjectPageSubSection} one sub section definition
   */


  function createSubSection(facetDefinition, converterContext, subSectionTitle) {
    var _facetDefinition$anno, _facetDefinition$anno2;

    var subSectionID = SubSectionID({
      Facet: facetDefinition
    });
    var subSection = {
      id: subSectionID,
      key: getSubSectionKey(facetDefinition, subSectionID),
      title: converterContext.getBindingExpression(facetDefinition.Label),
      type: SubSectionType.Unknown,
      annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
      visible: converterContext.getInverseBindingExpression((_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.Hidden, true)
    };

    if (subSectionTitle && subSectionTitle !== "") {
      subSection.title = subSectionTitle;
    }

    var unsupportedText = "";

    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        // TODO If we get a collection facet a this point it should only contains form elements hopefully
        if (facetDefinition.Facets && hasTable(facetDefinition.Facets)) {
          return createSubSection(facetDefinition.Facets[0], converterContext, subSection.title);
        }

        var formCollectionSubSection = _objectSpread({}, subSection, {
          type: SubSectionType.Form,
          formDefinition: createFormDefinition(facetDefinition),
          actions: getFacetActions(facetDefinition, converterContext)
        });

        return formCollectionSubSection;

      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        if (!facetDefinition.Target.$target) {
          unsupportedText = "Unable to find annotationPath ".concat(facetDefinition.Target.value);
        } else {
          switch (facetDefinition.Target.$target.term) {
            case "com.sap.vocabularies.UI.v1.LineItem":
            case "com.sap.vocabularies.UI.v1.Chart":
            case "com.sap.vocabularies.UI.v1.PresentationVariant":
            case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
              var dataVisualizationSubSection = _objectSpread({}, subSection, {
                type: SubSectionType.DataVisualization,
                presentation: getDataVisualizationConfiguration({
                  annotation: facetDefinition.Target.$target,
                  path: facetDefinition.Target.value
                }, converterContext)
              });

              return dataVisualizationSubSection;

            case "com.sap.vocabularies.UI.v1.FieldGroup":
            case "com.sap.vocabularies.UI.v1.Identification":
            case "com.sap.vocabularies.UI.v1.DataPoint":
            case "com.sap.vocabularies.UI.v1.StatusInfo":
            case "com.sap.vocabularies.Communication.v1.Contact":
              // All those element belong to a form facet
              var formElementSubSection = _objectSpread({}, subSection, {
                type: SubSectionType.Form,
                formDefinition: createFormDefinition(facetDefinition),
                actions: getFacetActions(facetDefinition, converterContext)
              });

              return formElementSubSection;

            default:
              unsupportedText = "For ".concat(facetDefinition.Target.$target.term, " Fragment");
              break;
          }
        }

        break;

      case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
        unsupportedText = "For Reference URL Facet";
        break;
    } // If we reach here we ended up with an unsupported SubSection type


    var unsupportedSubSection = _objectSpread({}, subSection, {
      text: unsupportedText
    });

    return unsupportedSubSection;
  }

  _exports.createSubSection = createSubSection;

  function createFormActionReducer(actions, facetDefinition, converterContext) {
    var referenceTarget = facetDefinition.Target.$target;
    var manifestActions = {};
    var dataFieldCollection = [];

    if (referenceTarget) {
      switch (referenceTarget.term) {
        case "com.sap.vocabularies.UI.v1.FieldGroup":
          dataFieldCollection = referenceTarget.Data;
          manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(referenceTarget).actions);
          break;

        case "com.sap.vocabularies.UI.v1.Identification":
        case "com.sap.vocabularies.UI.v1.StatusInfo":
          dataFieldCollection = referenceTarget;
          break;
      }
    }

    return dataFieldCollection.reduce(function (actions, dataField) {
      var _dataField$annotation3, _dataField$annotation4;

      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          if (dataField.RequiresContext === true) {
            throw new Error("Requires Context should not be true for form action : " + dataField.Label);
          } else {
            var _dataField$annotation, _dataField$annotation2;

            var aMappings = [];

            if (dataField.Mapping) {
              aMappings = getSemanticObjectMapping(dataField.Mapping);
            }

            actions.push({
              type: ActionType.DataFieldForIntentBasedNavigation,
              id: FormID({
                Facet: facetDefinition
              }, dataField),
              key: KeyHelper.generateKeyFromDataField(dataField),
              text: dataField.Label,
              annotationPath: "",
              visible: converterContext.getInverseBindingExpression((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden, true),
              press: ".handlers.onDataFieldForIntentBasedNavigation($controller, '" + dataField.SemanticObject + "','" + dataField.Action + "', '" + JSON.stringify(aMappings) + "', undefined ," + dataField.RequiresContext + ")",
              customData: "{ semanticObject: '" + dataField.SemanticObject + "', action: '" + dataField.Action + "' }"
            });
          }

          break;

        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          var formManifestActionsConfiguration = converterContext.getManifestControlConfiguration(referenceTarget).actions;
          var sActionName = "DataFieldForAction::" + dataField.Action.replace(/\//g, "::");
          actions.push({
            type: ActionType.DataFieldForAction,
            id: FormID({
              Facet: facetDefinition
            }, dataField),
            key: KeyHelper.generateKeyFromDataField(dataField),
            text: dataField.Label,
            annotationPath: "",
            enabled: getEnabledBinding(dataField.ActionTarget, converterContext),
            visible: converterContext.getInverseBindingExpression((_dataField$annotation3 = dataField.annotations) === null || _dataField$annotation3 === void 0 ? void 0 : (_dataField$annotation4 = _dataField$annotation3.UI) === null || _dataField$annotation4 === void 0 ? void 0 : _dataField$annotation4.Hidden, true),
            press: ".editFlow.onCallAction('" + dataField.Action + "', { contexts: ${$view>/#fe::ObjectPage/}.getBindingContext(), invocationGrouping : '" + (dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated") + "', label: '" + dataField.Label + "', model: ${$source>/}.getModel(), isNavigable: " + isActionNavigable(formManifestActionsConfiguration && formManifestActionsConfiguration[sActionName]) + "})" //TODO: need to move this from here so that we won't mix manifest actions and annotation actions code

          });
          break;
      }

      actions = insertCustomElements(actions, manifestActions);
      return actions;
    }, actions);
  }

  function createCustomSubSections(manifestSubSections) {
    var subSections = {};
    Object.keys(manifestSubSections).forEach(function (subSectionKey) {
      return subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey);
    });
    return subSections;
  }

  _exports.createCustomSubSections = createCustomSubSections;

  function createCustomSubSection(manifestSubSection, subSectionKey) {
    var position = manifestSubSection.position;

    if (!position) {
      position = {
        placement: Placement.After
      };
    }

    switch (manifestSubSection.type) {
      case SectionType.XMLFragment:
        return {
          id: manifestSubSection.id || CustomSubSectionID(subSectionKey),
          actions: getActionsFromManifest(manifestSubSection.actions),
          key: subSectionKey,
          title: manifestSubSection.title,
          type: SubSectionType.XMLFragment,
          position: position,
          visible: manifestSubSection.visible,
          fragmentName: manifestSubSection.name || ""
        };

      case SectionType.Default:
      default:
        return {
          id: manifestSubSection.id || CustomSubSectionID(subSectionKey),
          actions: getActionsFromManifest(manifestSubSection.actions),
          key: subSectionKey,
          title: manifestSubSection.title,
          position: position,
          visible: manifestSubSection.visible,
          type: SubSectionType.Placeholder
        };
    }
  }

  _exports.createCustomSubSection = createCustomSubSection;

  function getSemanticObjectMapping(aMappings) {
    var aSemanticObjectMappings = [];
    aMappings.forEach(function (oMapping) {
      var oSOMapping = {
        "LocalProperty": {
          "$PropertyPath": oMapping.LocalProperty.value
        },
        "SemanticObjectProperty": oMapping.SemanticObjectProperty
      };
      aSemanticObjectMappings.push(oSOMapping);
    });
    return aSemanticObjectMappings;
  }

  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN1YlNlY3Rpb24udHMiXSwibmFtZXMiOlsiU3ViU2VjdGlvblR5cGUiLCJ0YXJnZXRUZXJtcyIsImhhc1RhYmxlIiwiZmFjZXRzIiwic29tZSIsImZhY2V0VHlwZSIsImluZGV4T2YiLCJUYXJnZXQiLCIkdGFyZ2V0IiwidGVybSIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiZmFjZXRDb2xsZWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImZhY2V0c1RvQ3JlYXRlIiwicmVkdWNlIiwiZmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJwdXNoIiwiRmFjZXRzIiwiZXZlcnkiLCJmb3JFYWNoIiwibWFwIiwiZmFjZXQiLCJjcmVhdGVTdWJTZWN0aW9uIiwiZ2V0U3ViU2VjdGlvbktleSIsImZhbGxiYWNrIiwiSUQiLCJ0b1N0cmluZyIsIkxhYmVsIiwiZ2V0RmFjZXRBY3Rpb25zIiwiYWN0aW9ucyIsIkFycmF5IiwiZmlsdGVyIiwiaXNSZWZlcmVuY2VGYWNldCIsImNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyIiwic3ViU2VjdGlvblRpdGxlIiwic3ViU2VjdGlvbklEIiwiU3ViU2VjdGlvbklEIiwiRmFjZXQiLCJzdWJTZWN0aW9uIiwiaWQiLCJrZXkiLCJ0aXRsZSIsImdldEJpbmRpbmdFeHByZXNzaW9uIiwidHlwZSIsIlVua25vd24iLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJ2aXNpYmxlIiwiZ2V0SW52ZXJzZUJpbmRpbmdFeHByZXNzaW9uIiwiYW5ub3RhdGlvbnMiLCJVSSIsIkhpZGRlbiIsInVuc3VwcG9ydGVkVGV4dCIsImZvcm1Db2xsZWN0aW9uU3ViU2VjdGlvbiIsIkZvcm0iLCJmb3JtRGVmaW5pdGlvbiIsImNyZWF0ZUZvcm1EZWZpbml0aW9uIiwidmFsdWUiLCJkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24iLCJEYXRhVmlzdWFsaXphdGlvbiIsInByZXNlbnRhdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsImFubm90YXRpb24iLCJwYXRoIiwiZm9ybUVsZW1lbnRTdWJTZWN0aW9uIiwidW5zdXBwb3J0ZWRTdWJTZWN0aW9uIiwidGV4dCIsInJlZmVyZW5jZVRhcmdldCIsIm1hbmlmZXN0QWN0aW9ucyIsImRhdGFGaWVsZENvbGxlY3Rpb24iLCJEYXRhIiwiZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCIsImdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24iLCJkYXRhRmllbGQiLCJSZXF1aXJlc0NvbnRleHQiLCJFcnJvciIsImFNYXBwaW5ncyIsIk1hcHBpbmciLCJnZXRTZW1hbnRpY09iamVjdE1hcHBpbmciLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiRm9ybUlEIiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwicHJlc3MiLCJTZW1hbnRpY09iamVjdCIsIkFjdGlvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJjdXN0b21EYXRhIiwiZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb24iLCJzQWN0aW9uTmFtZSIsInJlcGxhY2UiLCJEYXRhRmllbGRGb3JBY3Rpb24iLCJlbmFibGVkIiwiZ2V0RW5hYmxlZEJpbmRpbmciLCJBY3Rpb25UYXJnZXQiLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJpc0FjdGlvbk5hdmlnYWJsZSIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbnMiLCJtYW5pZmVzdFN1YlNlY3Rpb25zIiwic3ViU2VjdGlvbnMiLCJPYmplY3QiLCJrZXlzIiwic3ViU2VjdGlvbktleSIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24iLCJtYW5pZmVzdFN1YlNlY3Rpb24iLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiU2VjdGlvblR5cGUiLCJYTUxGcmFnbWVudCIsIkN1c3RvbVN1YlNlY3Rpb25JRCIsImZyYWdtZW50TmFtZSIsIm5hbWUiLCJEZWZhdWx0IiwiUGxhY2Vob2xkZXIiLCJhU2VtYW50aWNPYmplY3RNYXBwaW5ncyIsIm9NYXBwaW5nIiwib1NPTWFwcGluZyIsIkxvY2FsUHJvcGVydHkiLCJTZW1hbnRpY09iamVjdFByb3BlcnR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BNEJZQSxjOzthQUFBQSxjO0FBQUFBLElBQUFBLGM7QUFBQUEsSUFBQUEsYztBQUFBQSxJQUFBQSxjO0FBQUFBLElBQUFBLGM7QUFBQUEsSUFBQUEsYztLQUFBQSxjLEtBQUFBLGM7OztBQWdFWixNQUFNQyxXQUFxQixHQUFHLG9KQUE5QixDLENBTUE7O0FBQ0EsTUFBTUMsUUFBUSxHQUFHLFlBQXdCO0FBQUEsUUFBdkJDLE1BQXVCLHVFQUFQLEVBQU87QUFDeEMsV0FBT0EsTUFBTSxDQUFDQyxJQUFQLENBQVksVUFBQUMsU0FBUztBQUFBOztBQUFBLGFBQUlKLFdBQVcsQ0FBQ0ssT0FBWixDQUFvQkQsU0FBcEIsYUFBb0JBLFNBQXBCLDRDQUFvQkEsU0FBUyxDQUFFRSxNQUEvQiwrRUFBb0Isa0JBQW1CQyxPQUF2QywwREFBb0Isc0JBQTRCQyxJQUFoRCxJQUF3RCxDQUFDLENBQTdEO0FBQUEsS0FBckIsQ0FBUDtBQUNBLEdBRkQ7QUFJQTs7Ozs7Ozs7O0FBT08sV0FBU0MsaUJBQVQsQ0FBMkJDLGVBQTNCLEVBQTBEQyxnQkFBMUQsRUFBc0g7QUFDNUg7QUFDQSxRQUFNQyxjQUFjLEdBQUdGLGVBQWUsQ0FBQ0csTUFBaEIsQ0FBdUIsVUFBQ0QsY0FBRCxFQUErQkUsZUFBL0IsRUFBbUQ7QUFDaEcsY0FBUUEsZUFBZSxDQUFDQyxLQUF4QjtBQUNDO0FBQ0NILFVBQUFBLGNBQWMsQ0FBQ0ksSUFBZixDQUFvQkYsZUFBcEI7QUFDQTs7QUFDRDtBQUNDO0FBQ0E7QUFDQSxjQUNDYixRQUFRLENBQUNhLGVBQWUsQ0FBQ0csTUFBakIsQ0FBUixJQUNBLENBQUNILGVB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QSxJQUFJLEVBQUU1QyxjQUFjLENBQUN3SDtBQVBmLFNBQVA7QUFkRjtBQXdCQTs7OztBQUVELFdBQVN4Qyx3QkFBVCxDQUFrQ0YsU0FBbEMsRUFBMkQ7QUFDMUQsUUFBTTJDLHVCQUE4QixHQUFHLEVBQXZDO0FBQ0EzQyxJQUFBQSxTQUFTLENBQUMxRCxPQUFWLENBQWtCLFVBQUFzRyxRQUFRLEVBQUk7QUFDN0IsVUFBTUMsVUFBVSxHQUFHO0FBQ2xCLHlCQUFpQjtBQUNoQiwyQkFBaUJELFFBQVEsQ0FBQ0UsYUFBVCxDQUF1QmpFO0FBRHhCLFNBREM7QUFJbEIsa0NBQTBCK0QsUUFBUSxDQUFDRztBQUpqQixPQUFuQjtBQU1BSixNQUFBQSx1QkFBdUIsQ0FBQ3hHLElBQXhCLENBQTZCMEcsVUFBN0I7QUFDQSxLQVJEO0FBU0EsV0FBT0YsdUJBQVA7QUFDQSIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWN0aW9uVHlwZSwgTWFuaWZlc3RTdWJTZWN0aW9uLCBTZWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQge1xuXHRBbm5vdGF0aW9uVGVybSxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RmFjZXRUeXBlcyxcblx0RmllbGRHcm91cCxcblx0SWRlbnRpZmljYXRpb24sXG5cdFJlZmVyZW5jZUZhY2V0VHlwZXMsXG5cdFN0YXR1c0luZm8sXG5cdFVJQW5ub3RhdGlvblRlcm1zLFxuXHRVSUFubm90YXRpb25UeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvZGlzdC9nZW5lcmF0ZWQvQ29tbXVuaWNhdGlvblwiO1xuaW1wb3J0IHsgQ3VzdG9tU3ViU2VjdGlvbklELCBGb3JtSUQsIFN1YlNlY3Rpb25JRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJDb250ZXh0IH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy9CYXNlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBjcmVhdGVGb3JtRGVmaW5pdGlvbiwgRm9ybURlZmluaXRpb24sIGlzUmVmZXJlbmNlRmFjZXQgfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiwgZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIH0gZnJvbSBcIi4uL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDdXN0b21FbGVtZW50LCBpbnNlcnRDdXN0b21FbGVtZW50cywgUGxhY2VtZW50IH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQge1xuXHRDb252ZXJ0ZXJBY3Rpb24sXG5cdEN1c3RvbUFjdGlvbixcblx0Z2V0QWN0aW9uc0Zyb21NYW5pZmVzdCxcblx0Z2V0RW5hYmxlZEJpbmRpbmcsXG5cdGlzQWN0aW9uTmF2aWdhYmxlXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgeyBCaW5kaW5nRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdFeHByZXNzaW9uXCI7XG5cbmV4cG9ydCBlbnVtIFN1YlNlY3Rpb25UeXBlIHtcblx0VW5rbm93biA9IFwiVW5rbm93blwiLCAvLyBEZWZhdWx0IFR5cGVcblx0Rm9ybSA9IFwiRm9ybVwiLFxuXHREYXRhVmlzdWFsaXphdGlvbiA9IFwiRGF0YVZpc3VhbGl6YXRpb25cIixcblx0WE1MRnJhZ21lbnQgPSBcIlhNTEZyYWdtZW50XCIsXG5cdFBsYWNlaG9sZGVyID0gXCJQbGFjZWhvbGRlclwiXG59XG5cbnR5cGUgT2JqZWN0UGFnZVN1YlNlY3Rpb24gPVxuXHR8IFVuc3VwcG9ydGVkU3ViU2VjdGlvblxuXHR8IEZvcm1TdWJTZWN0aW9uXG5cdHwgRGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uXG5cdHwgQ29udGFjdFN1YlNlY3Rpb25cblx0fCBYTUxGcmFnbWVudFN1YlNlY3Rpb25cblx0fCBQbGFjZWhvbGRlckZyYWdtZW50U3ViU2VjdGlvbjtcblxudHlwZSBCYXNlU3ViU2VjdGlvbiA9IHtcblx0aWQ6IHN0cmluZztcblx0a2V5OiBzdHJpbmc7XG5cdHRpdGxlOiBCaW5kaW5nRXhwcmVzc2lvbjxzdHJpbmc+O1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZTtcblx0dmlzaWJsZTogQmluZGluZ0V4cHJlc3Npb248Ym9vbGVhbj47XG59O1xuXG50eXBlIFVuc3VwcG9ydGVkU3ViU2VjdGlvbiA9IEJhc2VTdWJTZWN0aW9uICYge1xuXHR0ZXh0OiBzdHJpbmc7XG59O1xuXG50eXBlIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IEJhc2VTdWJTZWN0aW9uICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5EYXRhVmlzdWFsaXphdGlvbjtcblx0cHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG59O1xuXG50eXBlIENvbnRhY3RTdWJTZWN0aW9uID0gVW5zdXBwb3J0ZWRTdWJTZWN0aW9uICYge307XG5cbnR5cGUgWE1MRnJhZ21lbnRTdWJTZWN0aW9uID0gT21pdDxCYXNlU3ViU2VjdGlvbiwgXCJhbm5vdGF0aW9uUGF0aFwiPiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuWE1MRnJhZ21lbnQ7XG5cdGZyYWdtZW50TmFtZTogc3RyaW5nO1xuXHRhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xufTtcblxudHlwZSBQbGFjZWhvbGRlckZyYWdtZW50U3ViU2VjdGlvbiA9IE9taXQ8QmFzZVN1YlNlY3Rpb24sIFwiYW5ub3RhdGlvblBhdGhcIj4gJiB7XG5cdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlBsYWNlaG9sZGVyO1xuXHRhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xufTtcblxuZXhwb3J0IHR5cGUgRm9ybVN1YlNlY3Rpb24gPSBCYXNlU3ViU2VjdGlvbiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuRm9ybTtcblx0Zm9ybURlZmluaXRpb246IEZvcm1EZWZpbml0aW9uO1xuXHRhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXTtcbn07XG5cbmV4cG9ydCB0eXBlIE9iamVjdFBhZ2VTZWN0aW9uID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHRpZDogc3RyaW5nO1xuXHR0aXRsZTogQmluZGluZ0V4cHJlc3Npb248c3RyaW5nPjtcblx0dmlzaWJsZTogQmluZGluZ0V4cHJlc3Npb248Ym9vbGVhbj47XG5cdHN1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdO1xufTtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tT2JqZWN0UGFnZVNlY3Rpb24gPSBDdXN0b21FbGVtZW50PE9iamVjdFBhZ2VTZWN0aW9uPjtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24gPSBDdXN0b21FbGVtZW50PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcblxuY29uc3QgdGFyZ2V0VGVybXM6IHN0cmluZ1tdID0gW1xuXHRVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSxcblx0VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudCxcblx0VUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFxuXTtcblxuLy8gVE9ETzogTmVlZCB0byBoYW5kbGUgVGFibGUgY2FzZSBpbnNpZGUgY3JlYXRlU3ViU2VjdGlvbiBmdW5jdGlvbiBpZiBDb2xsZWN0aW9uRmFjZXQgaGFzIFRhYmxlIFJlZmVyZW5jZUZhY2V0XG5jb25zdCBoYXNUYWJsZSA9IChmYWNldHM6IGFueVtdID0gW10pID0+IHtcblx0cmV0dXJuIGZhY2V0cy5zb21lKGZhY2V0VHlwZSA9PiB0YXJnZXRUZXJtcy5pbmRleE9mKGZhY2V0VHlwZT8uVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtKSA+IC0xKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHN1YnNlY3Rpb25zIGJhc2VkIG9uIGZhY2V0IGRlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIGZhY2V0Q29sbGVjdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtPYmplY3RQYWdlU3ViU2VjdGlvbltdfSB0aGUgY3VycmVudCBzdWJlY3Rpb25zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdWJTZWN0aW9ucyhmYWNldENvbGxlY3Rpb246IEZhY2V0VHlwZXNbXSwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10ge1xuXHQvLyBGaXJzdCB3ZSBkZXRlcm1pbmUgd2hpY2ggc3ViIHNlY3Rpb24gd2UgbmVlZCB0byBjcmVhdGVcblx0Y29uc3QgZmFjZXRzVG9DcmVhdGUgPSBmYWNldENvbGxlY3Rpb24ucmVkdWNlKChmYWNldHNUb0NyZWF0ZTogRmFjZXRUeXBlc1tdLCBmYWNldERlZmluaXRpb24pID0+IHtcblx0XHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdFx0ZmFjZXRzVG9DcmVhdGUucHVzaChmYWNldERlZmluaXRpb24pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0XHQvLyBUT0RPIElmIHRoZSBDb2xsZWN0aW9uIEZhY2V0IGhhcyBhIGNoaWxkIG9mIHR5cGUgQ29sbGVjdGlvbiBGYWNldCB3ZSBicmluZyB0aGVtIHVwIG9uZSBsZXZlbCAoRm9ybSArIFRhYmxlIHVzZSBjYXNlKSA/XG5cdFx0XHRcdC8vIGZpcnN0IGNhc2UgZmFjZXQgQ29sbGVjdGlvbiBpcyBjb21iaW5hdGlvbiBvZiBjb2xsZWN0aW9uIGFuZCByZWZlcmVuY2UgZmFjZXQgb3Igbm90IGFsbCBmYWNldHMgYXJlIHJlZmVyZW5jZSBmYWNldHMuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRoYXNUYWJsZShmYWNldERlZmluaXRpb24uRmFjZXRzKSB8fFxuXHRcdFx0XHRcdCFmYWNldERlZmluaXRpb24uRmFjZXRzLmV2ZXJ5KGZhY2V0VHlwZSA9PiBmYWNldFR5cGUuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIilcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLkZhY2V0cy5mb3JFYWNoKGZhY2V0VHlwZSA9PiBmYWNldHNUb0NyZWF0ZS5wdXNoKGZhY2V0VHlwZSkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vU2Vjb25kIGNhc2UgaWYgYSBjb2xsZWN0aW9uIGZhY2V0IGhhcyBhbGwgcmVmZXJlbmNlIGZhY2V0IHRoZW4gc3ViLXNlY3Rpb24gc2hvdWxkIGJlIGNyZWF0ZWQgb25seSBmb3IgcGFyZW50IGNvbGxlY3Rpb24gZmFjZXQgbm90IGZvciBhbGwgY2hpbGQgcmVmZXJlbmNlIGZhY2V0cy5cblx0XHRcdFx0XHRmYWNldHNUb0NyZWF0ZS5wdXNoKGZhY2V0RGVmaW5pdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0OlxuXHRcdFx0XHQvLyBOb3Qgc3VwcG9ydGVkXG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFjZXRzVG9DcmVhdGU7XG5cdH0sIFtdKTtcblxuXHQvLyBUaGVuIHdlIGNyZWF0ZSB0aGUgYWN0dWFsIHN1YnNlY3Rpb25zXG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZS5tYXAoZmFjZXQgPT4gY3JlYXRlU3ViU2VjdGlvbihmYWNldCwgY29udmVydGVyQ29udGV4dCwgXCJcIikpO1xufVxuXG4vLyBmdW5jdGlvbiBpc1RhcmdldEZvckNvbXBsaWFudChhbm5vdGF0aW9uUGF0aDogQW5ub3RhdGlvblBhdGgpIHtcbi8vIFx0cmV0dXJuIC8uKmNvbVxcLnNhcFxcLnZvY2FidWxhcmllc1xcLlVJXFwudjFcXC4oRmllbGRHcm91cHxJZGVudGlmaWNhdGlvbnxEYXRhUG9pbnR8U3RhdHVzSW5mbykuKi8udGVzdChhbm5vdGF0aW9uUGF0aC52YWx1ZSk7XG4vLyB9XG5jb25zdCBnZXRTdWJTZWN0aW9uS2V5ID0gKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdHJldHVybiBmYWNldERlZmluaXRpb24uSUQ/LnRvU3RyaW5nKCkgfHwgZmFjZXREZWZpbml0aW9uLkxhYmVsPy50b1N0cmluZygpIHx8IGZhbGxiYWNrO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFjdGlvbiBmb3JtIGEgZmFjZXQuXG4gKlxuICogQHBhcmFtIGZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtDb252ZXJ0ZXJBY3Rpb25bXX0gdGhlIGN1cnJlbnQgZmFjZXQgYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29udmVydGVyQWN0aW9uW10ge1xuXHRsZXQgYWN0aW9ucyA9IG5ldyBBcnJheTxDb252ZXJ0ZXJBY3Rpb24+KCk7XG5cdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQ6XG5cdFx0XHRhY3Rpb25zID0gKGZhY2V0RGVmaW5pdGlvbi5GYWNldHMuZmlsdGVyKGZhY2V0RGVmaW5pdGlvbiA9PiBpc1JlZmVyZW5jZUZhY2V0KGZhY2V0RGVmaW5pdGlvbikpIGFzIFJlZmVyZW5jZUZhY2V0VHlwZXNbXSkucmVkdWNlKFxuXHRcdFx0XHQoYWN0aW9uczogQ29udmVydGVyQWN0aW9uW10sIGZhY2V0RGVmaW5pdGlvbikgPT4gY3JlYXRlRm9ybUFjdGlvblJlZHVjZXIoYWN0aW9ucywgZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0W11cblx0XHRcdCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0YWN0aW9ucyA9IGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKFtdLCBmYWNldERlZmluaXRpb24gYXMgUmVmZXJlbmNlRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRicmVhaztcblx0fVxuXHRyZXR1cm4gYWN0aW9ucztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzdWJzZWN0aW9uIGJhc2VkIG9uIGEgRmFjZXRUeXBlcy5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHN1YlNlY3Rpb25UaXRsZVxuICogQHJldHVybnMge09iamVjdFBhZ2VTdWJTZWN0aW9ufSBvbmUgc3ViIHNlY3Rpb24gZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViU2VjdGlvbihcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRzdWJTZWN0aW9uVGl0bGU6IHN0cmluZ1xuKTogT2JqZWN0UGFnZVN1YlNlY3Rpb24ge1xuXHRjb25zdCBzdWJTZWN0aW9uSUQgPSBTdWJTZWN0aW9uSUQoeyBGYWNldDogZmFjZXREZWZpbml0aW9uIH0pO1xuXHRjb25zdCBzdWJTZWN0aW9uOiBCYXNlU3ViU2VjdGlvbiA9IHtcblx0XHRpZDogc3ViU2VjdGlvbklELFxuXHRcdGtleTogZ2V0U3ViU2VjdGlvbktleShmYWNldERlZmluaXRpb24sIHN1YlNlY3Rpb25JRCksXG5cdFx0dGl0bGU6IGNvbnZlcnRlckNvbnRleHQuZ2V0QmluZGluZ0V4cHJlc3Npb24oZmFjZXREZWZpbml0aW9uLkxhYmVsIGFzIHN0cmluZyksXG5cdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuVW5rbm93bixcblx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdHZpc2libGU6IGNvbnZlcnRlckNvbnRleHQuZ2V0SW52ZXJzZUJpbmRpbmdFeHByZXNzaW9uPGJvb2xlYW4+KGZhY2V0RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiwgdHJ1ZSlcblx0fTtcblx0aWYgKHN1YlNlY3Rpb25UaXRsZSAmJiBzdWJTZWN0aW9uVGl0bGUgIT09IFwiXCIpIHtcblx0XHRzdWJTZWN0aW9uLnRpdGxlID0gc3ViU2VjdGlvblRpdGxlO1xuXHR9XG5cdGxldCB1bnN1cHBvcnRlZFRleHQgPSBcIlwiO1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0Ly8gVE9ETyBJZiB3ZSBnZXQgYSBjb2xsZWN0aW9uIGZhY2V0IGEgdGhpcyBwb2ludCBpdCBzaG91bGQgb25seSBjb250YWlucyBmb3JtIGVsZW1lbnRzIGhvcGVmdWxseVxuXHRcdFx0aWYgKGZhY2V0RGVmaW5pdGlvbi5GYWNldHMgJiYgaGFzVGFibGUoZmFjZXREZWZpbml0aW9uLkZhY2V0cykpIHtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZVN1YlNlY3Rpb24oZmFjZXREZWZpbml0aW9uLkZhY2V0c1swXSwgY29udmVydGVyQ29udGV4dCwgc3ViU2VjdGlvbi50aXRsZSBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZm9ybUNvbGxlY3Rpb25TdWJTZWN0aW9uOiBGb3JtU3ViU2VjdGlvbiA9IHtcblx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuRm9ybSxcblx0XHRcdFx0Zm9ybURlZmluaXRpb246IGNyZWF0ZUZvcm1EZWZpbml0aW9uKGZhY2V0RGVmaW5pdGlvbiksXG5cdFx0XHRcdGFjdGlvbnM6IGdldEZhY2V0QWN0aW9ucyhmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGZvcm1Db2xsZWN0aW9uU3ViU2VjdGlvbjtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0aWYgKCFmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQpIHtcblx0XHRcdFx0dW5zdXBwb3J0ZWRUZXh0ID0gYFVuYWJsZSB0byBmaW5kIGFubm90YXRpb25QYXRoICR7ZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZX1gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3dpdGNoIChmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQudGVybSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW06XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5DaGFydDpcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRcdFx0Y29uc3QgZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uOiBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdC4uLnN1YlNlY3Rpb24sXG5cdFx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkRhdGFWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0XHRwcmVzZW50YXRpb246IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uOiBmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0XHRwYXRoOiBmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TdGF0dXNJbmZvOlxuXHRcdFx0XHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UZXJtcy5Db250YWN0OlxuXHRcdFx0XHRcdFx0Ly8gQWxsIHRob3NlIGVsZW1lbnQgYmVsb25nIHRvIGEgZm9ybSBmYWNldFxuXHRcdFx0XHRcdFx0Y29uc3QgZm9ybUVsZW1lbnRTdWJTZWN0aW9uOiBGb3JtU3ViU2VjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuRm9ybSxcblx0XHRcdFx0XHRcdFx0Zm9ybURlZmluaXRpb246IGNyZWF0ZUZvcm1EZWZpbml0aW9uKGZhY2V0RGVmaW5pdGlvbiksXG5cdFx0XHRcdFx0XHRcdGFjdGlvbnM6IGdldEZhY2V0QWN0aW9ucyhmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZvcm1FbGVtZW50U3ViU2VjdGlvbjtcblxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHR1bnN1cHBvcnRlZFRleHQgPSBgRm9yICR7ZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0LnRlcm19IEZyYWdtZW50YDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0OlxuXHRcdFx0dW5zdXBwb3J0ZWRUZXh0ID0gXCJGb3IgUmVmZXJlbmNlIFVSTCBGYWNldFwiO1xuXHRcdFx0YnJlYWs7XG5cdH1cblx0Ly8gSWYgd2UgcmVhY2ggaGVyZSB3ZSBlbmRlZCB1cCB3aXRoIGFuIHVuc3VwcG9ydGVkIFN1YlNlY3Rpb24gdHlwZVxuXHRjb25zdCB1bnN1cHBvcnRlZFN1YlNlY3Rpb246IFVuc3VwcG9ydGVkU3ViU2VjdGlvbiA9IHtcblx0XHQuLi5zdWJTZWN0aW9uLFxuXHRcdHRleHQ6IHVuc3VwcG9ydGVkVGV4dFxuXHR9O1xuXHRyZXR1cm4gdW5zdXBwb3J0ZWRTdWJTZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVGb3JtQWN0aW9uUmVkdWNlcihcblx0YWN0aW9uczogQ29udmVydGVyQWN0aW9uW10sXG5cdGZhY2V0RGVmaW5pdGlvbjogUmVmZXJlbmNlRmFjZXRUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ29udmVydGVyQWN0aW9uW10ge1xuXHRjb25zdCByZWZlcmVuY2VUYXJnZXQ6IEFubm90YXRpb25UZXJtPGFueT4gPSBmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQ7XG5cdGxldCBtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4gPSB7fTtcblx0bGV0IGRhdGFGaWVsZENvbGxlY3Rpb246IERhdGFGaWVsZEFic3RyYWN0VHlwZXNbXSA9IFtdO1xuXHRpZiAocmVmZXJlbmNlVGFyZ2V0KSB7XG5cdFx0c3dpdGNoIChyZWZlcmVuY2VUYXJnZXQudGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwOlxuXHRcdFx0XHRkYXRhRmllbGRDb2xsZWN0aW9uID0gKHJlZmVyZW5jZVRhcmdldCBhcyBGaWVsZEdyb3VwKS5EYXRhO1xuXHRcdFx0XHRtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbihyZWZlcmVuY2VUYXJnZXQpLmFjdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlN0YXR1c0luZm86XG5cdFx0XHRcdGRhdGFGaWVsZENvbGxlY3Rpb24gPSByZWZlcmVuY2VUYXJnZXQgYXMgSWRlbnRpZmljYXRpb24gfCBTdGF0dXNJbmZvO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gZGF0YUZpZWxkQ29sbGVjdGlvbi5yZWR1Y2UoKGFjdGlvbnMsIGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQgPT09IHRydWUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJSZXF1aXJlcyBDb250ZXh0IHNob3VsZCBub3QgYmUgdHJ1ZSBmb3IgZm9ybSBhY3Rpb24gOiBcIiArIGRhdGFGaWVsZC5MYWJlbCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bGV0IGFNYXBwaW5ncyA9IFtdO1xuXHRcdFx0XHRcdGlmIChkYXRhRmllbGQuTWFwcGluZykge1xuXHRcdFx0XHRcdFx0YU1hcHBpbmdzID0gZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKGRhdGFGaWVsZC5NYXBwaW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YWN0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdFx0XHRcdFx0aWQ6IEZvcm1JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHRcdFx0dGV4dDogZGF0YUZpZWxkLkxhYmVsIGFzIHN0cmluZyxcblx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBcIlwiLFxuXHRcdFx0XHRcdFx0dmlzaWJsZTogY29udmVydGVyQ29udGV4dC5nZXRJbnZlcnNlQmluZGluZ0V4cHJlc3Npb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLCB0cnVlKSxcblx0XHRcdFx0XHRcdHByZXNzOlxuXHRcdFx0XHRcdFx0XHRcIi5oYW5kbGVycy5vbkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbigkY29udHJvbGxlciwgJ1wiICtcblx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0ICtcblx0XHRcdFx0XHRcdFx0XCInLCdcIiArXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24gK1xuXHRcdFx0XHRcdFx0XHRcIicsICdcIiArXG5cdFx0XHRcdFx0XHRcdEpTT04uc3RyaW5naWZ5KGFNYXBwaW5ncykgK1xuXHRcdFx0XHRcdFx0XHRcIicsIHVuZGVmaW5lZCAsXCIgK1xuXHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0ICtcblx0XHRcdFx0XHRcdFx0XCIpXCIsXG5cdFx0XHRcdFx0XHRjdXN0b21EYXRhOiBcInsgc2VtYW50aWNPYmplY3Q6ICdcIiArIGRhdGFGaWVsZC5TZW1hbnRpY09iamVjdCArIFwiJywgYWN0aW9uOiAnXCIgKyBkYXRhRmllbGQuQWN0aW9uICsgXCInIH1cIlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdGNvbnN0IGZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uOiBhbnkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24ocmVmZXJlbmNlVGFyZ2V0KS5hY3Rpb25zO1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uTmFtZTogc3RyaW5nID0gXCJEYXRhRmllbGRGb3JBY3Rpb246OlwiICsgZGF0YUZpZWxkLkFjdGlvbi5yZXBsYWNlKC9cXC8vZywgXCI6OlwiKTtcblx0XHRcdFx0YWN0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRpZDogRm9ybUlEKHsgRmFjZXQ6IGZhY2V0RGVmaW5pdGlvbiB9LCBkYXRhRmllbGQpLFxuXHRcdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHRcdHRleHQ6IGRhdGFGaWVsZC5MYWJlbCBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IFwiXCIsXG5cdFx0XHRcdFx0ZW5hYmxlZDogZ2V0RW5hYmxlZEJpbmRpbmcoZGF0YUZpZWxkLkFjdGlvblRhcmdldCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFx0dmlzaWJsZTogY29udmVydGVyQ29udGV4dC5nZXRJbnZlcnNlQmluZGluZ0V4cHJlc3Npb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLCB0cnVlKSxcblx0XHRcdFx0XHRwcmVzczpcblx0XHRcdFx0XHRcdFwiLmVkaXRGbG93Lm9uQ2FsbEFjdGlvbignXCIgK1xuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbiArXG5cdFx0XHRcdFx0XHRcIicsIHsgY29udGV4dHM6ICR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS99LmdldEJpbmRpbmdDb250ZXh0KCksIGludm9jYXRpb25Hcm91cGluZyA6ICdcIiArXG5cdFx0XHRcdFx0XHQoZGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyA9PT0gXCJVSS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiKSArXG5cdFx0XHRcdFx0XHRcIicsIGxhYmVsOiAnXCIgK1xuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLkxhYmVsICtcblx0XHRcdFx0XHRcdFwiJywgbW9kZWw6ICR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpLCBpc05hdmlnYWJsZTogXCIgK1xuXHRcdFx0XHRcdFx0aXNBY3Rpb25OYXZpZ2FibGUoZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb24gJiYgZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb25bc0FjdGlvbk5hbWVdKSArXG5cdFx0XHRcdFx0XHRcIn0pXCIgLy9UT0RPOiBuZWVkIHRvIG1vdmUgdGhpcyBmcm9tIGhlcmUgc28gdGhhdCB3ZSB3b24ndCBtaXggbWFuaWZlc3QgYWN0aW9ucyBhbmQgYW5ub3RhdGlvbiBhY3Rpb25zIGNvZGVcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRhY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zKTtcblx0XHRyZXR1cm4gYWN0aW9ucztcblx0fSwgYWN0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21TdWJTZWN0aW9ucyhcblx0bWFuaWZlc3RTdWJTZWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RTdWJTZWN0aW9uPlxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24+IHtcblx0Y29uc3Qgc3ViU2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTdWJTZWN0aW9uPiA9IHt9O1xuXHRPYmplY3Qua2V5cyhtYW5pZmVzdFN1YlNlY3Rpb25zKS5mb3JFYWNoKFxuXHRcdHN1YlNlY3Rpb25LZXkgPT4gKHN1YlNlY3Rpb25zW3N1YlNlY3Rpb25LZXldID0gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbihtYW5pZmVzdFN1YlNlY3Rpb25zW3N1YlNlY3Rpb25LZXldLCBzdWJTZWN0aW9uS2V5KSlcblx0KTtcblx0cmV0dXJuIHN1YlNlY3Rpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbihtYW5pZmVzdFN1YlNlY3Rpb246IE1hbmlmZXN0U3ViU2VjdGlvbiwgc3ViU2VjdGlvbktleTogc3RyaW5nKTogQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24ge1xuXHRsZXQgcG9zaXRpb24gPSBtYW5pZmVzdFN1YlNlY3Rpb24ucG9zaXRpb247XG5cdGlmICghcG9zaXRpb24pIHtcblx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyXG5cdFx0fTtcblx0fVxuXHRzd2l0Y2ggKG1hbmlmZXN0U3ViU2VjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBTZWN0aW9uVHlwZS5YTUxGcmFnbWVudDpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGlkOiBtYW5pZmVzdFN1YlNlY3Rpb24uaWQgfHwgQ3VzdG9tU3ViU2VjdGlvbklEKHN1YlNlY3Rpb25LZXkpLFxuXHRcdFx0XHRhY3Rpb25zOiBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0U3ViU2VjdGlvbi5hY3Rpb25zKSxcblx0XHRcdFx0a2V5OiBzdWJTZWN0aW9uS2V5LFxuXHRcdFx0XHR0aXRsZTogbWFuaWZlc3RTdWJTZWN0aW9uLnRpdGxlLFxuXHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5YTUxGcmFnbWVudCxcblx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdFx0XHR2aXNpYmxlOiBtYW5pZmVzdFN1YlNlY3Rpb24udmlzaWJsZSxcblx0XHRcdFx0ZnJhZ21lbnROYW1lOiBtYW5pZmVzdFN1YlNlY3Rpb24ubmFtZSB8fCBcIlwiXG5cdFx0XHR9O1xuXHRcdGNhc2UgU2VjdGlvblR5cGUuRGVmYXVsdDpcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aWQ6IG1hbmlmZXN0U3ViU2VjdGlvbi5pZCB8fCBDdXN0b21TdWJTZWN0aW9uSUQoc3ViU2VjdGlvbktleSksXG5cdFx0XHRcdGFjdGlvbnM6IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RTdWJTZWN0aW9uLmFjdGlvbnMpLFxuXHRcdFx0XHRrZXk6IHN1YlNlY3Rpb25LZXksXG5cdFx0XHRcdHRpdGxlOiBtYW5pZmVzdFN1YlNlY3Rpb24udGl0bGUsXG5cdFx0XHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHRcdFx0dmlzaWJsZTogbWFuaWZlc3RTdWJTZWN0aW9uLnZpc2libGUsXG5cdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlBsYWNlaG9sZGVyXG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhhTWFwcGluZ3M6IGFueVtdKTogYW55W10ge1xuXHRjb25zdCBhU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55W10gPSBbXTtcblx0YU1hcHBpbmdzLmZvckVhY2gob01hcHBpbmcgPT4ge1xuXHRcdGNvbnN0IG9TT01hcHBpbmcgPSB7XG5cdFx0XHRcIkxvY2FsUHJvcGVydHlcIjoge1xuXHRcdFx0XHRcIiRQcm9wZXJ0eVBhdGhcIjogb01hcHBpbmcuTG9jYWxQcm9wZXJ0eS52YWx1ZVxuXHRcdFx0fSxcblx0XHRcdFwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiOiBvTWFwcGluZy5TZW1hbnRpY09iamVjdFByb3BlcnR5XG5cdFx0fTtcblx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKG9TT01hcHBpbmcpO1xuXHR9KTtcblx0cmV0dXJuIGFTZW1hbnRpY09iamVjdE1hcHBpbmdzO1xufVxuIl19