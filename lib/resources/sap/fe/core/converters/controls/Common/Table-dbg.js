sap.ui.define(["../../ManifestSettings", "../../helpers/ID", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/helpers/BindingExpression", "sap/fe/core/converters/helpers/BindingHelper", "sap/ui/core/library", "sap/fe/core/converters/helpers/Key", "sap/fe/core/formatters/TableFormatter"], function (ManifestSettings, ID, Action, ConfigurableObject, DataField, BindingExpression, BindingHelper, library, Key, tableFormatters) {
  "use strict";

  var _exports = {};
  var KeyHelper = Key.KeyHelper;
  var Draft = BindingHelper.Draft;
  var ifElse = BindingExpression.ifElse;
  var formatResult = BindingExpression.formatResult;
  var compileBinding = BindingExpression.compileBinding;
  var bindingExpression = BindingExpression.bindingExpression;
  var annotationExpression = BindingExpression.annotationExpression;
  var isDataFieldTypes = DataField.isDataFieldTypes;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var isActionNavigable = Action.isActionNavigable;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var TableID = ID.TableID;
  var VisualizationType = ManifestSettings.VisualizationType;
  var SelectionMode = ManifestSettings.SelectionMode;
  var CreationMode = ManifestSettings.CreationMode;
  var ActionType = ManifestSettings.ActionType;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var MessageType = library.MessageType;
  var ColumnType;

  (function (ColumnType) {
    ColumnType["Default"] = "Default";
    ColumnType["Annotation"] = "Annotation";
  })(ColumnType || (ColumnType = {}));

  /**
   * Returns an array of all annotation based and manifest based table actions.
   *
   * @param {LineItem} lineItemAnnotation
   * @param {string} visualizationPath
   * @param {ConverterContext} converterContext
   * @param {NavigationSettingsConfiguration} navigationSettings
   * @returns {TableAction} the complete table actions
   */
  function getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    return insertCustomElements(getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext), getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, navigationSettings, true), {
      isNavigable: "overwrite",
      enableOnSelect: "overwrite"
    });
  }
  /**
   * Returns an array off all columns, annotation based as well as manifest based.
   * They are sorted and some properties of can be overwritten through the manifest (check out the overwritableKeys).
   *
   * @param {LineItem} lineItemAnnotation Collection of data fields for representation in a table or list
   * @param {string} visualizationPath
   * @param {ConverterContext} converterContext
   * @param {NavigationSettingsConfiguration} navigationSettings
   * @returns {TableColumn} Returns all table columns that should be available, regardless of templating or personalization or their origin
   */


  _exports.getTableActions = getTableActions;

  function getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    return insertCustomElements(getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext), getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, navigationSettings), {
      width: "overwrite",
      isNavigable: "overwrite"
    });
  }

  _exports.getTableColumns = getTableColumns;

  function createTableVisualization(lineItemAnnotation, visualizationPath, converterContext, presentationVariantAnnotation) {
    var tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext);

    var _splitPath = splitPath(visualizationPath),
        navigationPropertyPath = _splitPath.navigationPropertyPath;

    var entitySet = converterContext.getEntitySet();
    var entityName = entitySet.name,
        isEntitySet = navigationPropertyPath.length === 0;
    var navigationOrCollectionName = isEntitySet ? entityName : navigationPropertyPath;
    var navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationOrCollectionName);
    return {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfig, presentationVariantAnnotation),
      control: tableManifestConfig,
      actions: getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings),
      columns: getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings)
    };
  }

  _exports.createTableVisualization = createTableVisualization;

  function createDefaultTableVisualization(converterContext) {
    var tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext);
    return {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig),
      control: tableManifestConfig,
      actions: [],
      columns: getColumnsFromEntityType(converterContext.getEntitySet().entityType, [], converterContext)
    };
  }
  /**
   * Loop through the datafield of a lineitem to find the actions that will be put in the toolbar
   * And check if they require a context or not.
   *
   * @param lineItemAnnotation
   * @returns {boolean} if it's the case
   */


  _exports.createDefaultTableVisualization = createDefaultTableVisualization;

  function hasActionRequiringContext(lineItemAnnotation) {
    return lineItemAnnotation.some(function (dataField) {
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
        return dataField.Inline !== true;
      } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return dataField.Inline !== true && dataField.RequiresContext;
      }
    });
  }
  /**
   * Evaluate if the visualization path is deletable or updatable
   * The algorithm is as follow
   * - Evaluate if there is a NavigationRestrictions.Deletable or NavigationRestrictions.Updatable on the full navigationPath
   * - Go down the entity set of the path evaluating the same element and for the last part evaluate the DeleteRestrictions.Deletable or UpdateRestrictions.Updatable there.
   *
   * @param visualizationPath
   * @param converterContext
   * @returns {TableCapabilityRestriction} the table capabilities
   */


  function getCapabilityRestriction(visualizationPath, converterContext) {
    var _splitPath2 = splitPath(visualizationPath),
        navigationPropertyPath = _splitPath2.navigationPropertyPath;

    var navigationPropertyPathParts = navigationPropertyPath.split("/");
    var oCapabilityRestriction = {
      isDeletable: true,
      isUpdatable: true
    };
    var currentEntitySet = converterContext.getEntitySet();

    var _loop = function () {
      var _currentEntitySet$ann5, _currentEntitySet$ann6;

      var pathsToCheck = [];
      navigationPropertyPathParts.reduce(function (paths, navigationPropertyPathPart) {
        if (paths.length > 0) {
          paths += "/";
        }

        paths += navigationPropertyPathPart;
        pathsToCheck.push(paths);
        return paths;
      }, "");
      var hasRestrictedPathOnDelete = false,
          hasRestrictedPathOnUpdate = false;
      (_currentEntitySet$ann5 = currentEntitySet.annotations.Capabilities) === null || _currentEntitySet$ann5 === void 0 ? void 0 : (_currentEntitySet$ann6 = _currentEntitySet$ann5.NavigationRestrictions) === null || _currentEntitySet$ann6 === void 0 ? void 0 : _currentEntitySet$ann6.RestrictedProperties.forEach(function (restrictedNavProp) {
        var _restrictedNavProp$Na;

        if ((restrictedNavProp === null || restrictedNavProp === void 0 ? void 0 : (_restrictedNavProp$Na = restrictedNavProp.NavigationProperty) === null || _restrictedNavProp$Na === void 0 ? void 0 : _restrictedNavProp$Na.type) === "NavigationPropertyPath") {
          var _restrictedNavProp$De, _restrictedNavProp$Up;

          if (((_restrictedNavProp$De = restrictedNavProp.DeleteRestrictions) === null || _restrictedNavProp$De === void 0 ? void 0 : _restrictedNavProp$De.Deletable) === false) {
            hasRestrictedPathOnDelete = hasRestrictedPathOnDelete || pathsToCheck.indexOf(restrictedNavProp.NavigationProperty.value) !== -1;
          } else if (((_restrictedNavProp$Up = restrictedNavProp.UpdateRestrictions) === null || _restrictedNavProp$Up === void 0 ? void 0 : _restrictedNavProp$Up.Updatable) === false) {
            hasRestrictedPathOnUpdate = hasRestrictedPathOnUpdate || pathsToCheck.indexOf(restrictedNavProp.NavigationProperty.value) !== -1;
          }
        }
      });
      oCapabilityRestriction.isDeletable = !hasRestrictedPathOnDelete;
      oCapabilityRestriction.isUpdatable = !hasRestrictedPathOnUpdate;
      var navPropName = navigationPropertyPathParts.shift();

      if (navPropName) {
        var navProp = currentEntitySet.entityType.navigationProperties.find(function (navProp) {
          return navProp.name == navPropName;
        });

        if (navProp && !navProp.containsTarget && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navPropName)) {
          currentEntitySet = currentEntitySet.navigationPropertyBinding[navPropName];
        } else {
          // Contained navProp means no entitySet to report to
          currentEntitySet = null;
        }
      }
    };

    while ((oCapabilityRestriction.isDeletable || oCapabilityRestriction.isUpdatable) && currentEntitySet && navigationPropertyPathParts.length > 0) {
      _loop();
    }

    if (currentEntitySet !== null && currentEntitySet.annotations) {
      if (oCapabilityRestriction.isDeletable) {
        var _currentEntitySet$ann, _currentEntitySet$ann2;

        // If there is still an entityset, check the entityset deletable status
        oCapabilityRestriction.isDeletable = ((_currentEntitySet$ann = currentEntitySet.annotations.Capabilities) === null || _currentEntitySet$ann === void 0 ? void 0 : (_currentEntitySet$ann2 = _currentEntitySet$ann.DeleteRestrictions) === null || _currentEntitySet$ann2 === void 0 ? void 0 : _currentEntitySet$ann2.Deletable) !== false;
      }

      if (oCapabilityRestriction.isUpdatable) {
        var _currentEntitySet$ann3, _currentEntitySet$ann4;

        // If there is still an entityset, check the entityset updatable status
        oCapabilityRestriction.isUpdatable = ((_currentEntitySet$ann3 = currentEntitySet.annotations.Capabilities) === null || _currentEntitySet$ann3 === void 0 ? void 0 : (_currentEntitySet$ann4 = _currentEntitySet$ann3.UpdateRestrictions) === null || _currentEntitySet$ann4 === void 0 ? void 0 : _currentEntitySet$ann4.Updatable) !== false;
      }
    }

    return oCapabilityRestriction;
  }

  _exports.getCapabilityRestriction = getCapabilityRestriction;

  function getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet) {
    var _tableManifestSetting;

    if (!lineItemAnnotation) {
      return SelectionMode.None;
    }

    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var selectionMode = (_tableManifestSetting = tableManifestSettings.tableSettings) === null || _tableManifestSetting === void 0 ? void 0 : _tableManifestSetting.selectionMode;

    if (selectionMode && selectionMode === SelectionMode.None) {
      if (getCapabilityRestriction(visualizationPath, converterContext).isDeletable) {
        return "{= ${ui>/editMode} === 'Editable' ? '" + SelectionMode.Multi + "' : 'None'}";
      } else {
        selectionMode = SelectionMode.None;
      }
    } else if (!selectionMode || selectionMode === SelectionMode.Auto) {
      selectionMode = SelectionMode.Multi;
    }

    if (hasActionRequiringContext(lineItemAnnotation)) {
      return selectionMode;
    } else if (getCapabilityRestriction(visualizationPath, converterContext).isDeletable) {
      if (!isEntitySet) {
        return "{= ${ui>/editMode} === 'Editable' ? '" + selectionMode + "' : 'None'}";
      } else {
        return selectionMode;
      }
    }

    return SelectionMode.None;
  }
  /**
   * Method to retrieve all table actions from annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns {Record<BaseAction, BaseAction>} the table annotation actions
   */


  function getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext) {
    var tableActions = [];

    if (lineItemAnnotation) {
      var absolutePath = converterContext.getAbsoluteAnnotationPath(visualizationPath);
      lineItemAnnotation.forEach(function (dataField, index) {
        var _dataField$annotation, _dataField$annotation2;

        var tableAction;

        if (isDataFieldForActionAbstract(dataField) && !(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden) === true) && !dataField.Inline && !dataField.Determining) {
          var annotationPath = absolutePath + "/" + index;

          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              tableAction = {
                type: ActionType.DataFieldForAction,
                annotationPath: annotationPath,
                key: "DataFieldForAction::" + dataField.Action.replace(/\//g, "::"),
                isNavigable: true
              };
              break;

            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              tableAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: annotationPath,
                key: "DataFieldForIntentBasedNavigation::" + dataField.SemanticObject + "::" + dataField.Action + (dataField.RequiresContext ? "::RequiresContext" : "")
              };
              break;
          }
        }

        if (tableAction) {
          tableActions.push(tableAction);
        }
      });
    }

    return tableActions;
  }

  function getCriticalityBindingByEnum(CriticalityEnum) {
    var criticalityProperty;

    switch (CriticalityEnum) {
      case "UI.CriticalityType/Negative":
        criticalityProperty = MessageType.Error;
        break;

      case "UI.CriticalityType/Critical":
        criticalityProperty = MessageType.Warning;
        break;

      case "UI.CriticalityType/Positive":
        criticalityProperty = MessageType.Success;
        break;

      case "UI.CriticalityType/Neutral":
      default:
        criticalityProperty = MessageType.None;
    }

    return criticalityProperty;
  }

  function getHighlightRowBinding(criticalityAnnotation, isDraftRoot) {
    var defaultHighlightRowDefinition = MessageType.None;

    if (criticalityAnnotation) {
      if (typeof criticalityAnnotation === "object") {
        defaultHighlightRowDefinition = annotationExpression(criticalityAnnotation);
      } else {
        // Enum Value so we get the corresponding static part
        defaultHighlightRowDefinition = getCriticalityBindingByEnum(criticalityAnnotation);
      }
    }

    return ifElse(isDraftRoot && Draft.IsNewObject, MessageType.Information, formatResult([defaultHighlightRowDefinition], tableFormatters.rowHighlighting));
  }

  function _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings) {
    var navigation = (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create) || (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.detail); // cross-app

    if ((navigation === null || navigation === void 0 ? void 0 : navigation.outbound) && navigation.outboundDetail && (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create)) {
      return {
        mode: "External",
        outbound: navigation.outbound,
        outboundDetail: navigation.outboundDetail,
        navigationSettings: navigationSettings
      };
    }

    var newAction;

    if (lineItemAnnotation) {
      var _converterContext$get, _targetAnnotations$Co, _targetAnnotations$Co2, _targetAnnotations$Se, _targetAnnotations$Se2;

      // in-app
      var targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
      var targetAnnotations = (_converterContext$get = converterContext.getEntitySetForEntityType(targetEntityType)) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.annotations;
      newAction = (targetAnnotations === null || targetAnnotations === void 0 ? void 0 : (_targetAnnotations$Co = targetAnnotations.Common) === null || _targetAnnotations$Co === void 0 ? void 0 : (_targetAnnotations$Co2 = _targetAnnotations$Co.DraftRoot) === null || _targetAnnotations$Co2 === void 0 ? void 0 : _targetAnnotations$Co2.NewAction) || (targetAnnotations === null || targetAnnotations === void 0 ? void 0 : (_targetAnnotations$Se = targetAnnotations.Session) === null || _targetAnnotations$Se === void 0 ? void 0 : (_targetAnnotations$Se2 = _targetAnnotations$Se.StickySessionSupported) === null || _targetAnnotations$Se2 === void 0 ? void 0 : _targetAnnotations$Se2.NewAction); // TODO: Is there really no 'NewAction' on DraftNode? targetAnnotations?.Common?.DraftNode?.NewAction

      if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
        // A combination of 'CreationRow' and 'NewAction' does not make sense
        // TODO: Or does it?
        throw Error("Creation mode '".concat(CreationMode.CreationRow, "' can not be used with a custom 'new' action (").concat(newAction, ")"));
      }

      if (navigation === null || navigation === void 0 ? void 0 : navigation.route) {
        // route specified
        return {
          mode: tableManifestConfiguration.creationMode,
          append: tableManifestConfiguration.createAtEnd,
          newAction: newAction,
          navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode

        };
      }
    } // no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'


    if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
      tableManifestConfiguration.creationMode = CreationMode.Inline;
    }

    return {
      mode: tableManifestConfiguration.creationMode,
      append: tableManifestConfiguration.createAtEnd,
      newAction: newAction
    };
  }

  var _getRowConfigurationProperty = function (lineItemAnnotation, visualizationPath, converterContext, navigationSettings, targetPath) {
    var pressProperty, navigationTarget;
    var criticalityProperty = MessageType.None;
    var targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);

    if (navigationSettings && lineItemAnnotation) {
      var _navigationSettings$d, _navigationSettings$d2, _navigationSettings$d3;

      navigationTarget = ((_navigationSettings$d = navigationSettings.display) === null || _navigationSettings$d === void 0 ? void 0 : _navigationSettings$d.target) || ((_navigationSettings$d2 = navigationSettings.detail) === null || _navigationSettings$d2 === void 0 ? void 0 : _navigationSettings$d2.outbound);

      if (navigationTarget) {
        pressProperty = ".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
      } else if (navigationTarget = (_navigationSettings$d3 = navigationSettings.detail) === null || _navigationSettings$d3 === void 0 ? void 0 : _navigationSettings$d3.route) {
        if (targetEntityType) {
          var targetEntitySet = converterContext.getEntitySetForEntityType(targetEntityType);

          if (targetEntitySet) {
            var _lineItemAnnotation$a, _lineItemAnnotation$a2, _targetAnnotations$Co3, _targetAnnotations$Co4, _targetAnnotations$Co5, _targetAnnotations$Co6;

            var targetAnnotations = targetEntitySet.annotations;
            criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a === void 0 ? void 0 : (_lineItemAnnotation$a2 = _lineItemAnnotation$a.UI) === null || _lineItemAnnotation$a2 === void 0 ? void 0 : _lineItemAnnotation$a2.Criticality, !!((_targetAnnotations$Co3 = targetAnnotations.Common) === null || _targetAnnotations$Co3 === void 0 ? void 0 : _targetAnnotations$Co3.DraftRoot) || !!((_targetAnnotations$Co4 = targetAnnotations.Common) === null || _targetAnnotations$Co4 === void 0 ? void 0 : _targetAnnotations$Co4.DraftNode));
            pressProperty = ".routing.navigateForwardToContext(${$parameters>bindingContext}, { targetPath: '" + targetPath + "', editable : " + ((targetAnnotations === null || targetAnnotations === void 0 ? void 0 : (_targetAnnotations$Co5 = targetAnnotations.Common) === null || _targetAnnotations$Co5 === void 0 ? void 0 : _targetAnnotations$Co5.DraftRoot) || (targetAnnotations === null || targetAnnotations === void 0 ? void 0 : (_targetAnnotations$Co6 = targetAnnotations.Common) === null || _targetAnnotations$Co6 === void 0 ? void 0 : _targetAnnotations$Co6.DraftNode) ? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')" : "undefined") + "})"; //Need to access to DraftRoot and DraftNode !!!!!!!
          }
        }
      }
    }

    var rowNavigatedExpression = ifElse(converterContext.getManifestWrapper().isFclEnabled(), formatResult([bindingExpression("/deepestPath", "fclnavigated")], tableFormatters.fclNavigatedRow, targetEntityType), false);
    return {
      press: pressProperty,
      action: pressProperty ? "Navigation" : undefined,
      rowHighlighting: compileBinding(criticalityProperty),
      rowNavigated: compileBinding(rowNavigatedExpression)
    };
  };
  /**
   * Retrieve the columns from the entityType.
   *
   * @param entityType
   * @param annotationColumns
   * @param converterContext
   * @returns {TableColumn[]} the column from the entityType
   */


  var getColumnsFromEntityType = function (entityType) {
    var annotationColumns = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var converterContext = arguments.length > 2 ? arguments[2] : undefined;
    var tableColumns = [];
    entityType.entityProperties.forEach(function (property) {
      // Catch already existing columns - which were added before by LineItem Annotations
      var exists = annotationColumns.some(function (column) {
        return column.name === property.name;
      });

      if (!exists) {
        var _property$annotations, _property$annotations2;

        var entityName = (converterContext.getEntitySetForEntityType(entityType) || entityType).name;
        tableColumns.push({
          key: "DataField::" + property.name,
          type: ColumnType.Annotation,
          annotationPath: "/" + entityName + "/" + property.name,
          personalizationOnly: true,
          name: property.name,
          visible: converterContext.getInverseBindingExpression((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Hidden, true),
          template: "sap.fe.macros.table.ColumnProperty"
        });
      }
    });
    return tableColumns;
  };
  /**
   * Returns boolean true for valid columns, false for invalid columns.
   *
   * @param {DataFieldAbstractTypes} dataField Different DataField types defined in the annotations
   * @returns {boolean} True for valid columns, false for invalid columns
   * @private
   */


  var _isValidColumn = function (dataField) {
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        return !!dataField.Inline;

      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        return false;

      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        return true;

      default: // Todo: Replace with proper Log statement once available
      //  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);

    }
  };
  /**
   * Getting the Column Name
   * If it points to a DataField with one property or DataPoint with one property it will use the property name
   * here to be consistent with the existing flex changes.
   *
   * @param {DataFieldAbstractTypes} dataField Different DataField types defined in the annotations
   * @returns {string} Returns name of annotation columns
   * @private
   */


  var _getAnnotationColumnName = function (dataField) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;

    // This is needed as we have flexibility changes already that we have to check against
    if (isDataFieldTypes(dataField)) {
      var _dataField$Value;

      return (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.path;
    } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : (_dataField$Target$$ta2 = _dataField$Target$$ta.Value) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.path)) {
      // This is for removing duplicate properties. For example the Progress Property if removed if it already is defined as a DataPoint
      return dataField.Target.$target.Value.path;
    } else {
      return KeyHelper.generateKeyFromDataField(dataField);
    }
  };
  /**
   * Returns line items from metadata annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns {TableColumn[]} the columns from the annotations
   */


  var getColumnsFromAnnotations = function (lineItemAnnotation, visualizationPath, converterContext) {
    var entityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
    var annotationColumns = [];

    if (lineItemAnnotation) {
      // Get columns from the LineItem Annotation
      lineItemAnnotation.forEach(function (lineItem, lineItemIndex) {
        var _lineItem$annotations, _lineItem$annotations2, _lineItem$annotations3, _lineItem$annotations4, _lineItem$annotations5;

        if (!_isValidColumn(lineItem)) {
          return;
        }

        var annotationReference = converterContext.getAbsoluteAnnotationPath(visualizationPath) + "/" + lineItemIndex;
        annotationColumns.push({
          annotationPath: annotationReference,
          type: ColumnType.Annotation,
          key: KeyHelper.generateKeyFromDataField(lineItem),
          width: ((_lineItem$annotations = lineItem.annotations) === null || _lineItem$annotations === void 0 ? void 0 : (_lineItem$annotations2 = _lineItem$annotations.HTML5) === null || _lineItem$annotations2 === void 0 ? void 0 : (_lineItem$annotations3 = _lineItem$annotations2.CssDefaults) === null || _lineItem$annotations3 === void 0 ? void 0 : _lineItem$annotations3.width) || undefined,
          personalizationOnly: false,
          name: _getAnnotationColumnName(lineItem),
          visible: converterContext.getInverseBindingExpression((_lineItem$annotations4 = lineItem.annotations) === null || _lineItem$annotations4 === void 0 ? void 0 : (_lineItem$annotations5 = _lineItem$annotations4.UI) === null || _lineItem$annotations5 === void 0 ? void 0 : _lineItem$annotations5.Hidden, true),
          isNavigable: true
        });
      });
    } // Get columns from the Properties of EntityType


    var tableColumns = getColumnsFromEntityType(entityType, annotationColumns, converterContext);
    tableColumns = tableColumns.concat(annotationColumns);
    return tableColumns;
  };
  /**
   * Returns table column definitions from manifest.
   *
   * @param columns
   * @param navigationSettings
   * @returns {Record<string, CustomColumn>} the columns from the manifest
   */


  var getColumnsFromManifest = function (columns, navigationSettings) {
    var internalColumns = {};

    for (var key in columns) {
      var _manifestColumn$posit;

      var manifestColumn = columns[key];
      KeyHelper.isKeyValid(key);
      internalColumns[key] = {
        key: key,
        id: "CustomColumn::" + key,
        name: "CustomColumn::" + key,
        header: manifestColumn.header,
        width: manifestColumn.width || undefined,
        type: ColumnType.Default,
        personalizationOnly: false,
        template: manifestColumn.template || "undefined",
        visible: true,
        position: {
          anchor: (_manifestColumn$posit = manifestColumn.position) === null || _manifestColumn$posit === void 0 ? void 0 : _manifestColumn$posit.anchor,
          placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
        },
        isNavigable: isActionNavigable(manifestColumn, navigationSettings, true)
      };
    }

    return internalColumns;
  };

  function getP13nMode(visualizationPath, converterContext) {
    var _tableManifestSetting2;

    var manifestWrapper = converterContext.getManifestWrapper();
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var hasVariantManagement = ["Page", "Control"].indexOf(manifestWrapper.getVariantManagement()) > -1;
    var personalization = true;
    var aPersonalization = [];

    if ((tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting2 = tableManifestSettings.tableSettings) === null || _tableManifestSetting2 === void 0 ? void 0 : _tableManifestSetting2.personalization) !== undefined) {
      personalization = tableManifestSettings.tableSettings.personalization;
    }

    var isTableInObjectPage = converterContext.getTemplateConverterType() === "ObjectPage";

    if (hasVariantManagement && personalization) {
      if (personalization === true) {
        // Filtering in p13n supported only on ObjectPage.
        return isTableInObjectPage ? "Sort,Column,Filter" : "Sort,Column";
      } else if (typeof personalization === "object") {
        if (personalization.column) {
          aPersonalization.push("Column");
        }

        if (personalization.sort) {
          aPersonalization.push("Sort");
        }

        if (personalization.filter && isTableInObjectPage) {
          aPersonalization.push("Filter");
        }

        return aPersonalization.join(",");
      }
    }

    return undefined;
  }

  _exports.getP13nMode = getP13nMode;

  function getDeleteHidden(currentEntitySet, navigationPath) {
    var isDeleteHidden = false;

    if (navigationPath) {
      var _currentEntitySet$nav, _currentEntitySet$nav2, _currentEntitySet$nav3;

      // Check if UI.DeleteHidden is pointing to parent path
      var deleteHiddenAnnotation = (_currentEntitySet$nav = currentEntitySet.navigationPropertyBinding[navigationPath]) === null || _currentEntitySet$nav === void 0 ? void 0 : (_currentEntitySet$nav2 = _currentEntitySet$nav.annotations) === null || _currentEntitySet$nav2 === void 0 ? void 0 : (_currentEntitySet$nav3 = _currentEntitySet$nav2.UI) === null || _currentEntitySet$nav3 === void 0 ? void 0 : _currentEntitySet$nav3.DeleteHidden;

      if (deleteHiddenAnnotation && deleteHiddenAnnotation.path) {
        if (deleteHiddenAnnotation.path.indexOf("/") > 0) {
          var aSplitHiddenPath = deleteHiddenAnnotation.path.split("/");
          var sNavigationPath = aSplitHiddenPath[0];
          var partnerName = currentEntitySet.entityType.navigationProperties.find(function (navProperty) {
            return navProperty.name === navigationPath;
          }).partner;

          if (partnerName === sNavigationPath) {
            isDeleteHidden = deleteHiddenAnnotation;
          }
        } else {
          isDeleteHidden = false;
        }
      } else {
        isDeleteHidden = deleteHiddenAnnotation;
      }
    } else {
      var _currentEntitySet$ann7, _currentEntitySet$ann8;

      isDeleteHidden = (_currentEntitySet$ann7 = currentEntitySet.annotations) === null || _currentEntitySet$ann7 === void 0 ? void 0 : (_currentEntitySet$ann8 = _currentEntitySet$ann7.UI) === null || _currentEntitySet$ann8 === void 0 ? void 0 : _currentEntitySet$ann8.DeleteHidden;
    }

    return isDeleteHidden;
  }
  /**
   * Returns visibility for Delete button
   * @param isListReport
   * @param converterContext
   * @param navigationPath
   * @param sTemplateType
   * @param isTargetDeletable
   */


  function getDeleteVisible(isListReport, converterContext, navigationPath, sTemplateType, isTargetDeletable) {
    var currentEntitySet = converterContext.getEntitySet();
    var isDeleteHidden = getDeleteHidden(currentEntitySet, navigationPath);

    if (isDeleteHidden === true || isTargetDeletable === false || sTemplateType === "AnalyticalListPage") {
      return false;
    } else if (!isListReport) {
      if (isDeleteHidden) {
        return "{= !${" + (navigationPath ? navigationPath + "/" : "") + isDeleteHidden.path + "} && ${ui>/editMode} === 'Editable'}";
      } else {
        return "{= ${ui>/editMode} === 'Editable'}";
      }
    } else {
      return true;
    }
  }

  _exports.getDeleteVisible = getDeleteVisible;

  function getInsertable(currentEntitySet, navigationPath) {
    var _currentEntitySet$ann9, _currentEntitySet$ann10, _currentEntitySet$ann11;

    var isInsertable = true;
    var hasNavigationInsertRestriction = false;
    var RestrictedProperties = currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$ann9 = currentEntitySet.annotations) === null || _currentEntitySet$ann9 === void 0 ? void 0 : (_currentEntitySet$ann10 = _currentEntitySet$ann9.Capabilities) === null || _currentEntitySet$ann10 === void 0 ? void 0 : (_currentEntitySet$ann11 = _currentEntitySet$ann10.NavigationRestrictions) === null || _currentEntitySet$ann11 === void 0 ? void 0 : _currentEntitySet$ann11.RestrictedProperties;

    if (navigationPath && RestrictedProperties) {
      var restrictedProperty = RestrictedProperties.find(function (restrictedProperty) {
        var _restrictedProperty$N, _restrictedProperty$N2;

        return (restrictedProperty === null || restrictedProperty === void 0 ? void 0 : (_restrictedProperty$N = restrictedProperty.NavigationProperty) === null || _restrictedProperty$N === void 0 ? void 0 : _restrictedProperty$N.type) === "NavigationPropertyPath" && (restrictedProperty === null || restrictedProperty === void 0 ? void 0 : (_restrictedProperty$N2 = restrictedProperty.NavigationProperty) === null || _restrictedProperty$N2 === void 0 ? void 0 : _restrictedProperty$N2.value) === navigationPath && (restrictedProperty === null || restrictedProperty === void 0 ? void 0 : restrictedProperty.InsertRestrictions);
      });

      if (restrictedProperty) {
        var _restrictedProperty$I;

        isInsertable = (restrictedProperty === null || restrictedProperty === void 0 ? void 0 : (_restrictedProperty$I = restrictedProperty.InsertRestrictions) === null || _restrictedProperty$I === void 0 ? void 0 : _restrictedProperty$I.Insertable) !== false;
        hasNavigationInsertRestriction = true;
      }
    }

    if (navigationPath && !hasNavigationInsertRestriction) {
      var _currentEntitySet$nav4, _currentEntitySet$nav5, _currentEntitySet$nav6, _currentEntitySet$nav7;

      isInsertable = (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$nav4 = currentEntitySet.navigationPropertyBinding[navigationPath]) === null || _currentEntitySet$nav4 === void 0 ? void 0 : (_currentEntitySet$nav5 = _currentEntitySet$nav4.annotations) === null || _currentEntitySet$nav5 === void 0 ? void 0 : (_currentEntitySet$nav6 = _currentEntitySet$nav5.Capabilities) === null || _currentEntitySet$nav6 === void 0 ? void 0 : (_currentEntitySet$nav7 = _currentEntitySet$nav6.InsertRestrictions) === null || _currentEntitySet$nav7 === void 0 ? void 0 : _currentEntitySet$nav7.Insertable) !== false;
    } else if (!navigationPath) {
      var _currentEntitySet$ann12, _currentEntitySet$ann13, _currentEntitySet$ann14;

      isInsertable = (currentEntitySet === null || currentEntitySet === void 0 ? void 0 : (_currentEntitySet$ann12 = currentEntitySet.annotations) === null || _currentEntitySet$ann12 === void 0 ? void 0 : (_currentEntitySet$ann13 = _currentEntitySet$ann12.Capabilities) === null || _currentEntitySet$ann13 === void 0 ? void 0 : (_currentEntitySet$ann14 = _currentEntitySet$ann13.InsertRestrictions) === null || _currentEntitySet$ann14 === void 0 ? void 0 : _currentEntitySet$ann14.Insertable) !== false;
    }

    return isInsertable;
  }

  function getCreateHidden(currentEntitySet, navigationPath) {
    var isCreateHidden = false;

    if (navigationPath) {
      var _currentEntitySet$nav8, _currentEntitySet$nav9, _currentEntitySet$nav10;

      // Check if UI.CreateHidden is pointing to parent path
      var createHiddenAnnotation = (_currentEntitySet$nav8 = currentEntitySet.navigationPropertyBinding[navigationPath]) === null || _currentEntitySet$nav8 === void 0 ? void 0 : (_currentEntitySet$nav9 = _currentEntitySet$nav8.annotations) === null || _currentEntitySet$nav9 === void 0 ? void 0 : (_currentEntitySet$nav10 = _currentEntitySet$nav9.UI) === null || _currentEntitySet$nav10 === void 0 ? void 0 : _currentEntitySet$nav10.CreateHidden;

      if (createHiddenAnnotation && createHiddenAnnotation.path) {
        if (createHiddenAnnotation.path.indexOf("/") > 0) {
          var aSplitHiddenPath = createHiddenAnnotation.path.split("/");
          var sNavigationPath = aSplitHiddenPath[0];
          var partnerName = currentEntitySet.entityType.navigationProperties.find(function (navProperty) {
            return navProperty.name === navigationPath;
          }).partner;

          if (partnerName === sNavigationPath) {
            isCreateHidden = createHiddenAnnotation;
          }
        } else {
          isCreateHidden = false;
        }
      } else {
        isCreateHidden = createHiddenAnnotation;
      }
    } else {
      var _currentEntitySet$ann15, _currentEntitySet$ann16;

      isCreateHidden = (_currentEntitySet$ann15 = currentEntitySet.annotations) === null || _currentEntitySet$ann15 === void 0 ? void 0 : (_currentEntitySet$ann16 = _currentEntitySet$ann15.UI) === null || _currentEntitySet$ann16 === void 0 ? void 0 : _currentEntitySet$ann16.CreateHidden;
    }

    return isCreateHidden;
  }
  /**
   * Returns visibility for Create button
   *
   * @param isListReport
   * @param converterContext
   * @param navigationPath
   * @param sTemplateType
   * @returns {*} Expression or Boolean value of createhidden
   */


  function getCreateVisible(isListReport, converterContext, navigationPath, sTemplateType) {
    var currentEntitySet = converterContext.getEntitySet();
    var isCreateHidden = getCreateHidden(currentEntitySet, navigationPath);
    var isInsertable = getInsertable(currentEntitySet, navigationPath);

    if (isCreateHidden === true || isInsertable === false || sTemplateType === "AnalyticalListPage") {
      return false;
    } else if (!isListReport) {
      if (isCreateHidden) {
        return "{= !${" + (navigationPath ? navigationPath + "/" : "") + isCreateHidden.path + "} && ${ui>/editMode} === 'Editable'}";
      } else {
        return "{= ${ui>/editMode} === 'Editable'}";
      }
    } else {
      return true;
    }
  }

  _exports.getCreateVisible = getCreateVisible;

  function getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfiguration, presentationVariantAnnotation) {
    // Need to get the target
    var _splitPath3 = splitPath(visualizationPath),
        navigationPropertyPath = _splitPath3.navigationPropertyPath;

    var entitySet = converterContext.getEntitySet();
    var pageManifestSettings = converterContext.getManifestWrapper();
    var entityName = entitySet.name,
        isEntitySet = navigationPropertyPath.length === 0,
        p13nMode = getP13nMode(visualizationPath, converterContext),
        id = TableID(isEntitySet ? entityName : navigationPropertyPath, "LineItem");
    var selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet);
    var sTemplateType = converterContext.getTemplateConverterType();
    var isALP = sTemplateType === "AnalyticalListPage";
    var isListReport = sTemplateType === "ListReport";
    var targetCapabilities = getCapabilityRestriction(visualizationPath, converterContext);
    var isTargetDeletable = targetCapabilities.isDeletable;
    var threshold = isEntitySet ? 30 : 10;

    if (presentationVariantAnnotation && presentationVariantAnnotation.MaxItems) {
      threshold = presentationVariantAnnotation.MaxItems;
    }

    var navigationOrCollectionName = isEntitySet ? entityName : navigationPropertyPath;
    var navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationOrCollectionName);
    return {
      id: id,
      entityName: entityName,
      collection: "/" + entityName + (!isEntitySet ? "/" + navigationPropertyPath : ""),
      navigationPath: navigationPropertyPath,
      isEntitySet: isEntitySet,
      row: _getRowConfigurationProperty(lineItemAnnotation, visualizationPath, converterContext, navigationSettings, navigationOrCollectionName),
      p13nMode: p13nMode,
      show: {
        "delete": getDeleteVisible(isListReport, converterContext, navigationPropertyPath, sTemplateType, isTargetDeletable),
        create: getCreateVisible(isListReport, converterContext, navigationPropertyPath, sTemplateType),
        update: getUpdatable(sTemplateType)
      },
      create: _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings),
      selectionMode: selectionMode,
      autoBindOnInit: !isListReport && !isALP,
      enableControlVM: pageManifestSettings.getVariantManagement() === "Control" && !!p13nMode,
      threshold: threshold
    };
  }

  _exports.getTableAnnotationConfiguration = getTableAnnotationConfiguration;

  function getUpdatable(sTemplateType) {
    if (sTemplateType === "AnalyticalListPage" || sTemplateType === "ListReport") {
      return "Display";
    } // updatable will be handled at the property level


    return "{ui>/editMode}";
  }
  /**
   * Split the visualization path into the navigation property path and annotation.
   *
   * @param visualizationPath
   * @returns {object}
   */


  function splitPath(visualizationPath) {
    var _visualizationPath$sp = visualizationPath.split("@"),
        _visualizationPath$sp2 = _slicedToArray(_visualizationPath$sp, 2),
        navigationPropertyPath = _visualizationPath$sp2[0],
        annotationPath = _visualizationPath$sp2[1];

    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }

    return {
      navigationPropertyPath: navigationPropertyPath,
      annotationPath: annotationPath
    };
  }

  function getSelectionVariantConfiguration(selectionVariantPath, converterContext) {
    var selection = converterContext.getEntityTypeAnnotation(selectionVariantPath);

    if (selection) {
      var _selection$SelectOpti;

      var propertyNames = [];
      (_selection$SelectOpti = selection.SelectOptions) === null || _selection$SelectOpti === void 0 ? void 0 : _selection$SelectOpti.forEach(function (selectOption) {
        var propertyName = selectOption.PropertyName;
        var PropertyPath = propertyName.value;

        if (propertyNames.indexOf(PropertyPath) === -1) {
          propertyNames.push(PropertyPath);
        }
      });
      return {
        text: selection.Text,
        propertyNames: propertyNames
      };
    }

    return undefined;
  }

  _exports.getSelectionVariantConfiguration = getSelectionVariantConfiguration;

  function getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext) {
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var tableSettings = tableManifestSettings.tableSettings;
    var quickSelectionVariant;
    var quickFilterPaths = [];
    var enableExport = true;
    var creationMode = CreationMode.NewPage;
    var filters;
    var enableAutoScroll = false;
    var createAtEnd = true;
    var disableAddRowButtonForEmptyData = false;
    var hideTableTitle = false;
    var tableType = "ResponsiveTable";

    if (tableSettings && lineItemAnnotation) {
      var _tableSettings$quickV, _tableSettings$quickV2, _tableSettings$creati, _tableSettings$creati2, _tableSettings$creati3, _tableSettings$creati4, _tableSettings$quickV4;

      var targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
      tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV = tableSettings.quickVariantSelection) === null || _tableSettings$quickV === void 0 ? void 0 : (_tableSettings$quickV2 = _tableSettings$quickV.paths) === null || _tableSettings$quickV2 === void 0 ? void 0 : _tableSettings$quickV2.forEach(function (path) {
        var _tableSettings$quickV3;

        quickSelectionVariant = targetEntityType.resolvePath("@" + path.annotationPath); // quickSelectionVariant = converterContext.getEntityTypeAnnotation(path.annotationPath);

        if (quickSelectionVariant) {
          quickFilterPaths.push({
            annotationPath: path.annotationPath
          });
        }

        filters = {
          quickFilters: {
            showCounts: tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV3 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV3 === void 0 ? void 0 : _tableSettings$quickV3.showCounts,
            paths: quickFilterPaths
          }
        };
      });
      enableExport = tableSettings.enableExport !== undefined ? tableSettings.enableExport : true;
      creationMode = ((_tableSettings$creati = tableSettings.creationMode) === null || _tableSettings$creati === void 0 ? void 0 : _tableSettings$creati.name) || creationMode;
      enableAutoScroll = tableSettings.enableAutoScroll;
      createAtEnd = ((_tableSettings$creati2 = tableSettings.creationMode) === null || _tableSettings$creati2 === void 0 ? void 0 : _tableSettings$creati2.createAtEnd) !== undefined ? (_tableSettings$creati3 = tableSettings.creationMode) === null || _tableSettings$creati3 === void 0 ? void 0 : _tableSettings$creati3.createAtEnd : true;
      disableAddRowButtonForEmptyData = !!((_tableSettings$creati4 = tableSettings.creationMode) === null || _tableSettings$creati4 === void 0 ? void 0 : _tableSettings$creati4.disableAddRowButtonForEmptyData);
      hideTableTitle = !!((_tableSettings$quickV4 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV4 === void 0 ? void 0 : _tableSettings$quickV4.hideTableTitle);
      tableType = tableSettings.type;
    }

    return {
      enableAutoScroll: enableAutoScroll,
      filters: filters,
      type: tableType,
      headerVisible: !(quickSelectionVariant && hideTableTitle),
      enableExport: enableExport,
      creationMode: creationMode,
      createAtEnd: createAtEnd,
      disableAddRowButtonForEmptyData: disableAddRowButtonForEmptyData
    };
  }

  _exports.getTableManifestConfiguration = getTableManifestConfiguration;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYmxlLnRzIl0sIm5hbWVzIjpbIk1lc3NhZ2VUeXBlIiwibGlicmFyeSIsIkNvbHVtblR5cGUiLCJnZXRUYWJsZUFjdGlvbnMiLCJsaW5lSXRlbUFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJuYXZpZ2F0aW9uU2V0dGluZ3MiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMiLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwiZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbiIsImFjdGlvbnMiLCJpc05hdmlnYWJsZSIsImVuYWJsZU9uU2VsZWN0IiwiZ2V0VGFibGVDb2x1bW5zIiwiZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyIsImdldENvbHVtbnNGcm9tTWFuaWZlc3QiLCJjb2x1bW5zIiwid2lkdGgiLCJjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsInRhYmxlTWFuaWZlc3RDb25maWciLCJnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiIsInNwbGl0UGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJlbnRpdHlOYW1lIiwibmFtZSIsImlzRW50aXR5U2V0IiwibGVuZ3RoIiwibmF2aWdhdGlvbk9yQ29sbGVjdGlvbk5hbWUiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsInR5cGUiLCJWaXN1YWxpemF0aW9uVHlwZSIsIlRhYmxlIiwiYW5ub3RhdGlvbiIsImdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24iLCJjb250cm9sIiwiY3JlYXRlRGVmYXVsdFRhYmxlVmlzdWFsaXphdGlvbiIsInVuZGVmaW5lZCIsImdldENvbHVtbnNGcm9tRW50aXR5VHlwZSIsImVudGl0eVR5cGUiLCJoYXNBY3Rpb25SZXF1aXJpbmdDb250ZXh0Iiwic29tZSIsImRhdGFGaWVsZCIsIiRUeXBlIiwiSW5saW5lIiwiUmVxdWlyZXNDb250ZXh0IiwiZ2V0Q2FwYWJpbGl0eVJlc3RyaWN0aW9uIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aFBhcnRzIiwic3BsaXQiLCJvQ2FwYWJpbGl0eVJlc3RyaWN0aW9uIiwiaXNEZWxldGFibGUiLCJpc1VwZGF0YWJsZSIsImN1cnJlbnRFbnRpdHlTZXQiLCJwYXRoc1RvQ2hlY2siLCJyZWR1Y2UiLCJwYXRocyIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhQYXJ0IiwicHVzaCIsImhhc1Jlc3RyaWN0ZWRQYXRoT25EZWxldGUiLCJoYXNSZXN0cmljdGVkUGF0aE9uVXBkYXRlIiwiYW5ub3RhdGlvbnMiLCJDYXBhYmlsaXRpZXMiLCJOYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJmb3JFYWNoIiwicmVzdHJpY3RlZE5hdlByb3AiLCJOYXZpZ2F0aW9uUHJvcGVydHkiLCJEZWxldGVSZXN0cmljdGlvbnMiLCJEZWxldGFibGUiLCJpbmRleE9mIiwidmFsdWUiLCJVcGRhdGVSZXN0cmljdGlvbnMiLCJVcGRhdGFibGUiLCJuYXZQcm9wTmFtZSIsInNoaWZ0IiwibmF2UHJvcCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiZmluZCIsImNvbnRhaW5zVGFyZ2V0IiwibmF2aWdhdGlvblByb3BlcnR5QmluZGluZyIsImhhc093blByb3BlcnR5IiwiZ2V0U2VsZWN0aW9uTW9kZSIsIlNlbGVjdGlvbk1vZGUiLCJOb25lIiwidGFibGVNYW5pZmVzdFNldHRpbmdzIiwic2VsZWN0aW9uTW9kZSIsInRhYmxlU2V0dGluZ3MiLCJNdWx0aSIsIkF1dG8iLCJ0YWJsZUFjdGlvbnMiLCJhYnNvbHV0ZVBhdGgiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiaW5kZXgiLCJ0YWJsZUFjdGlvbiIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QiLCJVSSIsIkhpZGRlbiIsIkRldGVybWluaW5nIiwiYW5ub3RhdGlvblBhdGgiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwia2V5IiwiQWN0aW9uIiwicmVwbGFjZSIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsIlNlbWFudGljT2JqZWN0IiwiZ2V0Q3JpdGljYWxpdHlCaW5kaW5nQnlFbnVtIiwiQ3JpdGljYWxpdHlFbnVtIiwiY3JpdGljYWxpdHlQcm9wZXJ0eSIsIkVycm9yIiwiV2FybmluZyIsIlN1Y2Nlc3MiLCJnZXRIaWdobGlnaHRSb3dCaW5kaW5nIiwiY3JpdGljYWxpdHlBbm5vdGF0aW9uIiwiaXNEcmFmdFJvb3QiLCJkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbiIsImFubm90YXRpb25FeHByZXNzaW9uIiwiaWZFbHNlIiwiRHJhZnQiLCJJc05ld09iamVjdCIsIkluZm9ybWF0aW9uIiwiZm9ybWF0UmVzdWx0IiwidGFibGVGb3JtYXR0ZXJzIiwicm93SGlnaGxpZ2h0aW5nIiwiX2dldENyZWF0aW9uQmVoYXZpb3VyIiwidGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJuYXZpZ2F0aW9uIiwiY3JlYXRlIiwiZGV0YWlsIiwib3V0Ym91bmQiLCJvdXRib3VuZERldGFpbCIsIm1vZGUiLCJuZXdBY3Rpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJ0YXJnZXRBbm5vdGF0aW9ucyIsImdldEVudGl0eVNldEZvckVudGl0eVR5cGUiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJOZXdBY3Rpb24iLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93Iiwicm91dGUiLCJhcHBlbmQiLCJjcmVhdGVBdEVuZCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJOZXdQYWdlIiwiX2dldFJvd0NvbmZpZ3VyYXRpb25Qcm9wZXJ0eSIsInRhcmdldFBhdGgiLCJwcmVzc1Byb3BlcnR5IiwibmF2aWdhdGlvblRhcmdldCIsImRpc3BsYXkiLCJ0YXJnZXQiLCJ0YXJnZXRFbnRpdHlTZXQiLCJDcml0aWNhbGl0eSIsIkRyYWZ0Tm9kZSIsInJvd05hdmlnYXRlZEV4cHJlc3Npb24iLCJpc0ZjbEVuYWJsZWQiLCJiaW5kaW5nRXhwcmVzc2lvbiIsImZjbE5hdmlnYXRlZFJvdyIsInByZXNzIiwiYWN0aW9uIiwiY29tcGlsZUJpbmRpbmciLCJyb3dOYXZpZ2F0ZWQiLCJhbm5vdGF0aW9uQ29sdW1ucyIsInRhYmxlQ29sdW1ucyIsImVudGl0eVByb3BlcnRpZXMiLCJwcm9wZXJ0eSIsImV4aXN0cyIsImNvbHVtbiIsIkFubm90YXRpb24iLCJwZXJzb25hbGl6YXRpb25Pbmx5IiwidmlzaWJsZSIsImdldEludmVyc2VCaW5kaW5nRXhwcmVzc2lvbiIsInRlbXBsYXRlIiwiX2lzVmFsaWRDb2x1bW4iLCJfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUiLCJpc0RhdGFGaWVsZFR5cGVzIiwiVmFsdWUiLCJwYXRoIiwiVGFyZ2V0IiwiJHRhcmdldCIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsImxpbmVJdGVtIiwibGluZUl0ZW1JbmRleCIsImFubm90YXRpb25SZWZlcmVuY2UiLCJIVE1MNSIsIkNzc0RlZmF1bHRzIiwiY29uY2F0IiwiaW50ZXJuYWxDb2x1bW5zIiwibWFuaWZlc3RDb2x1bW4iLCJpc0tleVZhbGlkIiwiaWQiLCJoZWFkZXIiLCJEZWZhdWx0IiwicG9zaXRpb24iLCJhbmNob3IiLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsImlzQWN0aW9uTmF2aWdhYmxlIiwiZ2V0UDEzbk1vZGUiLCJtYW5pZmVzdFdyYXBwZXIiLCJoYXNWYXJpYW50TWFuYWdlbWVudCIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwicGVyc29uYWxpemF0aW9uIiwiYVBlcnNvbmFsaXphdGlvbiIsImlzVGFibGVJbk9iamVjdFBhZ2UiLCJnZXRUZW1wbGF0ZUNvbnZlcnRlclR5cGUiLCJzb3J0IiwiZmlsdGVyIiwiam9pbiIsImdldERlbGV0ZUhpZGRlbiIsIm5hdmlnYXRpb25QYXRoIiwiaXNEZWxldGVIaWRkZW4iLCJkZWxldGVIaWRkZW5Bbm5vdGF0aW9uIiwiRGVsZXRlSGlkZGVuIiwiYVNwbGl0SGlkZGVuUGF0aCIsInNOYXZpZ2F0aW9uUGF0aCIsInBhcnRuZXJOYW1lIiwibmF2UHJvcGVydHkiLCJwYXJ0bmVyIiwiZ2V0RGVsZXRlVmlzaWJsZSIsImlzTGlzdFJlcG9ydCIsInNUZW1wbGF0ZVR5cGUiLCJpc1RhcmdldERlbGV0YWJsZSIsImdldEluc2VydGFibGUiLCJpc0luc2VydGFibGUiLCJoYXNOYXZpZ2F0aW9uSW5zZXJ0UmVzdHJpY3Rpb24iLCJyZXN0cmljdGVkUHJvcGVydHkiLCJJbnNlcnRSZXN0cmljdGlvbnMiLCJJbnNlcnRhYmxlIiwiZ2V0Q3JlYXRlSGlkZGVuIiwiaXNDcmVhdGVIaWRkZW4iLCJjcmVhdGVIaWRkZW5Bbm5vdGF0aW9uIiwiQ3JlYXRlSGlkZGVuIiwiZ2V0Q3JlYXRlVmlzaWJsZSIsInBhZ2VNYW5pZmVzdFNldHRpbmdzIiwicDEzbk1vZGUiLCJUYWJsZUlEIiwiaXNBTFAiLCJ0YXJnZXRDYXBhYmlsaXRpZXMiLCJ0aHJlc2hvbGQiLCJNYXhJdGVtcyIsImNvbGxlY3Rpb24iLCJyb3ciLCJzaG93IiwidXBkYXRlIiwiZ2V0VXBkYXRhYmxlIiwiYXV0b0JpbmRPbkluaXQiLCJlbmFibGVDb250cm9sVk0iLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic2VsZWN0aW9uVmFyaWFudFBhdGgiLCJzZWxlY3Rpb24iLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsInByb3BlcnR5TmFtZXMiLCJTZWxlY3RPcHRpb25zIiwic2VsZWN0T3B0aW9uIiwicHJvcGVydHlOYW1lIiwiUHJvcGVydHlOYW1lIiwiUHJvcGVydHlQYXRoIiwidGV4dCIsIlRleHQiLCJxdWlja1NlbGVjdGlvblZhcmlhbnQiLCJxdWlja0ZpbHRlclBhdGhzIiwiZW5hYmxlRXhwb3J0IiwiZmlsdGVycyIsImVuYWJsZUF1dG9TY3JvbGwiLCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIiwiaGlkZVRhYmxlVGl0bGUiLCJ0YWJsZVR5cGUiLCJxdWlja1ZhcmlhbnRTZWxlY3Rpb24iLCJyZXNvbHZlUGF0aCIsInF1aWNrRmlsdGVycyIsInNob3dDb3VudHMiLCJoZWFkZXJWaXNpYmxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxNQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0QsV0FBNUI7TUFnRktFLFU7O2FBQUFBLFU7QUFBQUEsSUFBQUEsVTtBQUFBQSxJQUFBQSxVO0tBQUFBLFUsS0FBQUEsVTs7QUFxQ0w7Ozs7Ozs7OztBQVNPLFdBQVNDLGVBQVQsQ0FDTkMsa0JBRE0sRUFFTkMsaUJBRk0sRUFHTkMsZ0JBSE0sRUFJTkMsa0JBSk0sRUFLUztBQUNmLFdBQU9DLG9CQUFvQixDQUMxQkMseUJBQXlCLENBQUNMLGtCQUFELEVBQXFCQyxpQkFBckIsRUFBd0NDLGdCQUF4QyxDQURDLEVBRTFCSSxzQkFBc0IsQ0FBQ0osZ0JBQWdCLENBQUNLLCtCQUFqQixDQUFpRE4saUJBQWpELEVBQW9FTyxPQUFyRSxFQUE4RUwsa0JBQTlFLEVBQWtHLElBQWxHLENBRkksRUFHMUI7QUFBRU0sTUFBQUEsV0FBVyxFQUFFLFdBQWY7QUFBNEJDLE1BQUFBLGNBQWMsRUFBRTtBQUE1QyxLQUgwQixDQUEzQjtBQUtBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0FBVU8sV0FBU0MsZUFBVCxDQUNOWCxrQkFETSxFQUVOQyxpQkFGTSxFQUdOQyxnQkFITSxFQUlOQyxrQkFKTSxFQUtVO0FBQ2hCLFdBQU9DLG9CQUFvQixDQUMxQlEseUJBQXlCLENBQUNaLGtCQUFELEVBQXFCQyxpQkFBckIsRUFBd0NDLGdCQUF4QyxDQURDLEVBRTFCVyxz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QVcsR0FBRywyQkFBQTdELGFBQWEsQ0FBQ3dELFlBQWQsa0ZBQTRCSyxXQUE1QixNQUE0QzlHLFNBQTVDLDZCQUF3RGlELGFBQWEsQ0FBQ3dELFlBQXRFLDJEQUF3RCx1QkFBNEJLLFdBQXBGLEdBQWtHLElBQWhIO0FBQ0ErSCxNQUFBQSwrQkFBK0IsR0FBRyxDQUFDLDRCQUFDNUwsYUFBYSxDQUFDd0QsWUFBZiwyREFBQyx1QkFBNEJvSSwrQkFBN0IsQ0FBbkM7QUFDQUMsTUFBQUEsY0FBYyxHQUFHLENBQUMsNEJBQUM3TCxhQUFhLENBQUMrTCxxQkFBZiwyREFBQyx1QkFBcUNGLGNBQXRDLENBQWxCO0FBQ0FDLE1BQUFBLFNBQVMsR0FBRzlMLGFBQWEsQ0FBQ3hELElBQTFCO0FBQ0E7O0FBQ0QsV0FBTztBQUNObVAsTUFBQUEsZ0JBQWdCLEVBQUVBLGdCQURaO0FBRU5ELE1BQUFBLE9BQU8sRUFBRUEsT0FGSDtBQUdObFAsTUFBQUEsSUFBSSxFQUFFc1AsU0FIQTtBQUlOSyxNQUFBQSxhQUFhLEVBQUUsRUFBRVoscUJBQXFCLElBQUlNLGNBQTNCLENBSlQ7QUFLTkosTUFBQUEsWUFBWSxFQUFFQSxZQUxSO0FBTU5qSSxNQUFBQSxZQUFZLEVBQUVBLFlBTlI7QUFPTkssTUFBQUEsV0FBVyxFQUFFQSxXQVBQO0FBUU4rSCxNQUFBQSwrQkFBK0IsRUFBRUE7QUFSM0IsS0FBUDtBQVVBIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRDcml0aWNhbGl0eVR5cGUsXG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZVR5cGVzLFxuXHRTZWxlY3Rpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0T3B0aW9uVHlwZSxcblx0VUlBbm5vdGF0aW9uVHlwZXMsXG5cdEVudW1WYWx1ZSxcblx0UGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHtcblx0QWN0aW9uVHlwZSxcblx0Q3JlYXRpb25Nb2RlLFxuXHRNYW5pZmVzdFRhYmxlQ29sdW1uLFxuXHROYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRTZWxlY3Rpb25Nb2RlLFxuXHRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0VmlzdWFsaXphdGlvblR5cGUsXG5cdE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uLFxuXHRNYW5pZmVzdFdyYXBwZXJcbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IEVudGl0eVNldCwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L2Fubm90YXRpb24tY29udmVydGVyXCI7XG5pbXBvcnQgeyBDb252ZXJ0ZXJDb250ZXh0IH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy9CYXNlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBUYWJsZUlEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvZGlzdC9nZW5lcmF0ZWQvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgeyBBbm5vdGF0aW9uQWN0aW9uLCBCYXNlQWN0aW9uLCBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0LCBpc0FjdGlvbk5hdmlnYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCwgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0LCBpc0RhdGFGaWVsZFR5cGVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQge1xuXHRhbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0QmluZGluZ0V4cHJlc3Npb24sXG5cdGJpbmRpbmdFeHByZXNzaW9uLFxuXHRCaW5kaW5nUGFydCxcblx0Y29tcGlsZUJpbmRpbmcsXG5cdGZvcm1hdFJlc3VsdCxcblx0aWZFbHNlLFxuXHRQdXJlQmluZGluZ1BhcnRcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ0V4cHJlc3Npb25cIjtcbmltcG9ydCB7IERyYWZ0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgeyAkJE1lc3NhZ2VUeXBlLCBsaWJyYXJ5IH0gZnJvbSBcInNhcC91aS9jb3JlXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHRhYmxlRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclwiO1xuXG5jb25zdCBNZXNzYWdlVHlwZSA9IGxpYnJhcnkuTWVzc2FnZVR5cGU7XG5cbmV4cG9ydCB0eXBlIFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG5cdGF1dG9CaW5kT25Jbml0OiBib29sZWFuO1xuXHRjb2xsZWN0aW9uOiBzdHJpbmc7XG5cdGVuYWJsZUNvbnRyb2xWTT86IGJvb2xlYW47XG5cdGZpbHRlcklkPzogc3RyaW5nO1xuXHRpZDogc3RyaW5nO1xuXHRpc0VudGl0eVNldDogYm9vbGVhbjtcblx0bmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0cDEzbk1vZGU/OiBzdHJpbmc7XG5cdHJvdz86IHtcblx0XHRhY3Rpb24/OiBzdHJpbmc7XG5cdFx0cHJlc3M/OiBzdHJpbmc7XG5cdFx0cm93SGlnaGxpZ2h0aW5nOiBCaW5kaW5nRXhwcmVzc2lvbjwkJE1lc3NhZ2VUeXBlPjtcblx0XHRyb3dOYXZpZ2F0ZWQ6IEJpbmRpbmdFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHR9O1xuXHRzZWxlY3Rpb25Nb2RlOiBzdHJpbmc7XG5cdHNob3c/OiB7XG5cdFx0Y3JlYXRlPzogc3RyaW5nIHwgYm9vbGVhbjtcblx0XHRkZWxldGU/OiBzdHJpbmcgfCBib29sZWFuO1xuXHRcdHVwZGF0ZT86IHN0cmluZyB8IGJvb2xlYW47XG5cdH07XG5cdHRocmVzaG9sZDogbnVtYmVyO1xuXHRlbnRpdHlOYW1lOiBzdHJpbmc7XG5cblx0LyoqIENyZWF0ZSBuZXcgZW50cmllcyAqL1xuXHRjcmVhdGU6IENyZWF0ZUJlaGF2aW91ciB8IENyZWF0ZUJlaGF2aW91ckV4dGVybmFsO1xufTtcblxuLyoqXG4gKiBOZXcgZW50cmllcyBhcmUgY3JlYXRlZCB3aXRoaW4gdGhlIGFwcCAoZGVmYXVsdCBjYXNlKVxuICovXG50eXBlIENyZWF0ZUJlaGF2aW91ciA9IHtcblx0bW9kZTogQ3JlYXRpb25Nb2RlO1xuXHRhcHBlbmQ6IEJvb2xlYW47XG5cdG5ld0FjdGlvbj86IHN0cmluZztcblx0bmF2aWdhdGVUb1RhcmdldD86IHN0cmluZztcbn07XG5cbi8qKlxuICogTmV3IGVudHJpZXMgYXJlIGNyZWF0ZWQgYnkgbmF2aWdhdGluZyB0byBzb21lIHRhcmdldFxuICovXG50eXBlIENyZWF0ZUJlaGF2aW91ckV4dGVybmFsID0ge1xuXHRtb2RlOiBcIkV4dGVybmFsXCI7XG5cdG91dGJvdW5kOiBzdHJpbmc7XG5cdG91dGJvdW5kRGV0YWlsOiBOYXZpZ2F0aW9uVGFyZ2V0Q29uZmlndXJhdGlvbltcIm91dGJvdW5kRGV0YWlsXCJdO1xuXHRuYXZpZ2F0aW9uU2V0dGluZ3M6IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb247XG59O1xuXG50eXBlIFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uID0ge1xuXHRpc0RlbGV0YWJsZTogYm9vbGVhbjtcblx0aXNVcGRhdGFibGU6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uID0ge1xuXHRwYXRoczogW1xuXHRcdHtcblx0XHRcdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdFx0fVxuXHRdO1xuXHRzaG93Q291bnRzPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uID0ge1xuXHRwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXTtcblx0dGV4dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDb250cm9sQ29uZmlndXJhdGlvbiA9IHtcblx0ZW5hYmxlQXV0b1Njcm9sbDogYm9vbGVhbjtcblx0Y3JlYXRlQXRFbmQ6IGJvb2xlYW47XG5cdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlO1xuXHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhPzogYm9vbGVhbjtcblx0ZW5hYmxlRXhwb3J0PzogYm9vbGVhbjtcblx0aGVhZGVyVmlzaWJsZT86IGJvb2xlYW47XG5cdGZpbHRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uPjtcblx0dHlwZT86IHN0cmluZztcbn07XG5cbmVudW0gQ29sdW1uVHlwZSB7XG5cdERlZmF1bHQgPSBcIkRlZmF1bHRcIiwgLy8gRGVmYXVsdCBUeXBlXG5cdEFubm90YXRpb24gPSBcIkFubm90YXRpb25cIlxufVxuXG5leHBvcnQgdHlwZSBCYXNlVGFibGVDb2x1bW4gPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdGlkOiBzdHJpbmc7XG5cdHdpZHRoPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZTogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdHZpc2libGU6IEJpbmRpbmdFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRwZXJzb25hbGl6YXRpb25Pbmx5OiBib29sZWFuO1xuXHR0eXBlOiBDb2x1bW5UeXBlOyAvL09yaWdpbiBvZiB0aGUgc291cmNlIHdoZXJlIHdlIGFyZSBnZXR0aW5nIHRoZSB0ZW1wbGF0ZWQgaW5mb3JtYXRpb24gZnJvbSxcblx0aXNOYXZpZ2FibGU/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tVGFibGVDb2x1bW4gPSBCYXNlVGFibGVDb2x1bW4gJiB7XG5cdGNyZWF0aW9uVGVtcGxhdGU/OiBzdHJpbmc7XG5cdGhlYWRlcj86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbiA9IEJhc2VUYWJsZUNvbHVtbiAmIHtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgVGFibGVDb2x1bW4gPSBDdXN0b21UYWJsZUNvbHVtbiB8IEFubm90YXRpb25UYWJsZUNvbHVtbjtcblxuZXhwb3J0IHR5cGUgQ3VzdG9tQ29sdW1uID0gQ3VzdG9tRWxlbWVudDxUYWJsZUNvbHVtbj47XG5cbmV4cG9ydCB0eXBlIFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGU7XG5cdGFubm90YXRpb246IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdGNvbnRyb2w6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW107XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgYW5ub3RhdGlvbiBiYXNlZCBhbmQgbWFuaWZlc3QgYmFzZWQgdGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge0xpbmVJdGVtfSBsaW5lSXRlbUFubm90YXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIHtDb252ZXJ0ZXJDb250ZXh0fSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0ge05hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb259IG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHJldHVybnMge1RhYmxlQWN0aW9ufSB0aGUgY29tcGxldGUgdGFibGUgYWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBY3Rpb25zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBCYXNlQWN0aW9uW10ge1xuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0VGFibGVBbm5vdGF0aW9uQWN0aW9ucyhsaW5lSXRlbUFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuYWN0aW9ucywgbmF2aWdhdGlvblNldHRpbmdzLCB0cnVlKSxcblx0XHR7IGlzTmF2aWdhYmxlOiBcIm92ZXJ3cml0ZVwiLCBlbmFibGVPblNlbGVjdDogXCJvdmVyd3JpdGVcIiB9XG5cdCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZmYgYWxsIGNvbHVtbnMsIGFubm90YXRpb24gYmFzZWQgYXMgd2VsbCBhcyBtYW5pZmVzdCBiYXNlZC5cbiAqIFRoZXkgYXJlIHNvcnRlZCBhbmQgc29tZSBwcm9wZXJ0aWVzIG9mIGNhbiBiZSBvdmVyd3JpdHRlbiB0aHJvdWdoIHRoZSBtYW5pZmVzdCAoY2hlY2sgb3V0IHRoZSBvdmVyd3JpdGFibGVLZXlzKS5cbiAqXG4gKiBAcGFyYW0ge0xpbmVJdGVtfSBsaW5lSXRlbUFubm90YXRpb24gQ29sbGVjdGlvbiBvZiBkYXRhIGZpZWxkcyBmb3IgcmVwcmVzZW50YXRpb24gaW4gYSB0YWJsZSBvciBsaXN0XG4gKiBAcGFyYW0ge3N0cmluZ30gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSB7Q29udmVydGVyQ29udGV4dH0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIHtOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9ufSBuYXZpZ2F0aW9uU2V0dGluZ3NcbiAqIEByZXR1cm5zIHtUYWJsZUNvbHVtbn0gUmV0dXJucyBhbGwgdGFibGUgY29sdW1ucyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUsIHJlZ2FyZGxlc3Mgb2YgdGVtcGxhdGluZyBvciBwZXJzb25hbGl6YXRpb24gb3IgdGhlaXIgb3JpZ2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJsZUNvbHVtbnMoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbik6IFRhYmxlQ29sdW1uW10ge1xuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyhsaW5lSXRlbUFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRnZXRDb2x1bW5zRnJvbU1hbmlmZXN0KGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuY29sdW1ucywgbmF2aWdhdGlvblNldHRpbmdzKSxcblx0XHR7IHdpZHRoOiBcIm92ZXJ3cml0ZVwiLCBpc05hdmlnYWJsZTogXCJvdmVyd3JpdGVcIiB9XG5cdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGVUeXBlc1xuKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCB7IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggfSA9IHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IGVudGl0eU5hbWU6IHN0cmluZyA9IGVudGl0eVNldC5uYW1lLFxuXHRcdGlzRW50aXR5U2V0OiBib29sZWFuID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggPT09IDA7XG5cdGNvbnN0IG5hdmlnYXRpb25PckNvbGxlY3Rpb25OYW1lID0gaXNFbnRpdHlTZXQgPyBlbnRpdHlOYW1lIDogbmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0Y29uc3QgbmF2aWdhdGlvblNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uT3JDb2xsZWN0aW9uTmFtZSk7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGUsXG5cdFx0YW5ub3RhdGlvbjogZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvblxuXHRcdCksXG5cdFx0Y29udHJvbDogdGFibGVNYW5pZmVzdENvbmZpZyxcblx0XHRhY3Rpb25zOiBnZXRUYWJsZUFjdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKSxcblx0XHRjb2x1bW5zOiBnZXRUYWJsZUNvbHVtbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKVxuXHR9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVmYXVsdFRhYmxlVmlzdWFsaXphdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKHVuZGVmaW5lZCwgXCJcIiwgY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGUsXG5cdFx0YW5ub3RhdGlvbjogZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbih1bmRlZmluZWQsIFwiXCIsIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlTWFuaWZlc3RDb25maWcpLFxuXHRcdGNvbnRyb2w6IHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0YWN0aW9uczogW10sXG5cdFx0Y29sdW1uczogZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkuZW50aXR5VHlwZSwgW10sIGNvbnZlcnRlckNvbnRleHQpXG5cdH07XG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIHRoZSBkYXRhZmllbGQgb2YgYSBsaW5laXRlbSB0byBmaW5kIHRoZSBhY3Rpb25zIHRoYXQgd2lsbCBiZSBwdXQgaW4gdGhlIHRvb2xiYXJcbiAqIEFuZCBjaGVjayBpZiB0aGV5IHJlcXVpcmUgYSBjb250ZXh0IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gaWYgaXQncyB0aGUgY2FzZVxuICovXG5mdW5jdGlvbiBoYXNBY3Rpb25SZXF1aXJpbmdDb250ZXh0KGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0pOiBib29sZWFuIHtcblx0cmV0dXJuIGxpbmVJdGVtQW5ub3RhdGlvbi5zb21lKGRhdGFGaWVsZCA9PiB7XG5cdFx0aWYgKGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZGF0YUZpZWxkLklubGluZSAhPT0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRyZXR1cm4gZGF0YUZpZWxkLklubGluZSAhPT0gdHJ1ZSAmJiBkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0O1xuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIHZpc3VhbGl6YXRpb24gcGF0aCBpcyBkZWxldGFibGUgb3IgdXBkYXRhYmxlXG4gKiBUaGUgYWxnb3JpdGhtIGlzIGFzIGZvbGxvd1xuICogLSBFdmFsdWF0ZSBpZiB0aGVyZSBpcyBhIE5hdmlnYXRpb25SZXN0cmljdGlvbnMuRGVsZXRhYmxlIG9yIE5hdmlnYXRpb25SZXN0cmljdGlvbnMuVXBkYXRhYmxlIG9uIHRoZSBmdWxsIG5hdmlnYXRpb25QYXRoXG4gKiAtIEdvIGRvd24gdGhlIGVudGl0eSBzZXQgb2YgdGhlIHBhdGggZXZhbHVhdGluZyB0aGUgc2FtZSBlbGVtZW50IGFuZCBmb3IgdGhlIGxhc3QgcGFydCBldmFsdWF0ZSB0aGUgRGVsZXRlUmVzdHJpY3Rpb25zLkRlbGV0YWJsZSBvciBVcGRhdGVSZXN0cmljdGlvbnMuVXBkYXRhYmxlIHRoZXJlLlxuICpcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtUYWJsZUNhcGFiaWxpdHlSZXN0cmljdGlvbn0gdGhlIHRhYmxlIGNhcGFiaWxpdGllc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FwYWJpbGl0eVJlc3RyaWN0aW9uKHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBUYWJsZUNhcGFiaWxpdHlSZXN0cmljdGlvbiB7XG5cdGNvbnN0IHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCB9ID0gc3BsaXRQYXRoKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5UGF0aFBhcnRzID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdGNvbnN0IG9DYXBhYmlsaXR5UmVzdHJpY3Rpb24gPSB7IGlzRGVsZXRhYmxlOiB0cnVlLCBpc1VwZGF0YWJsZTogdHJ1ZSB9O1xuXHRsZXQgY3VycmVudEVudGl0eVNldDogRW50aXR5U2V0IHwgbnVsbCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdHdoaWxlIChcblx0XHQob0NhcGFiaWxpdHlSZXN0cmljdGlvbi5pc0RlbGV0YWJsZSB8fCBvQ2FwYWJpbGl0eVJlc3RyaWN0aW9uLmlzVXBkYXRhYmxlKSAmJlxuXHRcdGN1cnJlbnRFbnRpdHlTZXQgJiZcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoUGFydHMubGVuZ3RoID4gMFxuXHQpIHtcblx0XHRjb25zdCBwYXRoc1RvQ2hlY2s6IHN0cmluZ1tdID0gW107XG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aFBhcnRzLnJlZHVjZSgocGF0aHMsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhQYXJ0KSA9PiB7XG5cdFx0XHRpZiAocGF0aHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRwYXRocyArPSBcIi9cIjtcblx0XHRcdH1cblx0XHRcdHBhdGhzICs9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhQYXJ0O1xuXHRcdFx0cGF0aHNUb0NoZWNrLnB1c2gocGF0aHMpO1xuXHRcdFx0cmV0dXJuIHBhdGhzO1xuXHRcdH0sIFwiXCIpO1xuXHRcdGxldCBoYXNSZXN0cmljdGVkUGF0aE9uRGVsZXRlID0gZmFsc2UsXG5cdFx0XHRoYXNSZXN0cmljdGVkUGF0aE9uVXBkYXRlID0gZmFsc2U7XG5cdFx0Y3VycmVudEVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/Lk5hdmlnYXRpb25SZXN0cmljdGlvbnM/LlJlc3RyaWN0ZWRQcm9wZXJ0aWVzLmZvckVhY2goXG5cdFx0XHQocmVzdHJpY3RlZE5hdlByb3A6IE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXMpID0+IHtcblx0XHRcdFx0aWYgKHJlc3RyaWN0ZWROYXZQcm9wPy5OYXZpZ2F0aW9uUHJvcGVydHk/LnR5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSB7XG5cdFx0XHRcdFx0aWYgKHJlc3RyaWN0ZWROYXZQcm9wLkRlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0aGFzUmVzdHJpY3RlZFBhdGhPbkRlbGV0ZSA9XG5cdFx0XHRcdFx0XHRcdGhhc1Jlc3RyaWN0ZWRQYXRoT25EZWxldGUgfHwgcGF0aHNUb0NoZWNrLmluZGV4T2YocmVzdHJpY3RlZE5hdlByb3AuTmF2aWdhdGlvblByb3BlcnR5LnZhbHVlKSAhPT0gLTE7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChyZXN0cmljdGVkTmF2UHJvcC5VcGRhdGVSZXN0cmljdGlvbnM/LlVwZGF0YWJsZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdGhhc1Jlc3RyaWN0ZWRQYXRoT25VcGRhdGUgPVxuXHRcdFx0XHRcdFx0XHRoYXNSZXN0cmljdGVkUGF0aE9uVXBkYXRlIHx8IHBhdGhzVG9DaGVjay5pbmRleE9mKHJlc3RyaWN0ZWROYXZQcm9wLk5hdmlnYXRpb25Qcm9wZXJ0eS52YWx1ZSkgIT09IC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdFx0b0NhcGFiaWxpdHlSZXN0cmljdGlvbi5pc0RlbGV0YWJsZSA9ICFoYXNSZXN0cmljdGVkUGF0aE9uRGVsZXRlO1xuXHRcdG9DYXBhYmlsaXR5UmVzdHJpY3Rpb24uaXNVcGRhdGFibGUgPSAhaGFzUmVzdHJpY3RlZFBhdGhPblVwZGF0ZTtcblx0XHRjb25zdCBuYXZQcm9wTmFtZSA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhQYXJ0cy5zaGlmdCgpO1xuXHRcdGlmIChuYXZQcm9wTmFtZSkge1xuXHRcdFx0Y29uc3QgbmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5ID0gY3VycmVudEVudGl0eVNldC5lbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHRcdG5hdlByb3AgPT4gbmF2UHJvcC5uYW1lID09IG5hdlByb3BOYW1lXG5cdFx0XHQpIGFzIE5hdmlnYXRpb25Qcm9wZXJ0eTtcblx0XHRcdGlmIChuYXZQcm9wICYmICFuYXZQcm9wLmNvbnRhaW5zVGFyZ2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wTmFtZSkpIHtcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZQcm9wTmFtZV07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBDb250YWluZWQgbmF2UHJvcCBtZWFucyBubyBlbnRpdHlTZXQgdG8gcmVwb3J0IHRvXG5cdFx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoY3VycmVudEVudGl0eVNldCAhPT0gbnVsbCAmJiBjdXJyZW50RW50aXR5U2V0LmFubm90YXRpb25zKSB7XG5cdFx0aWYgKG9DYXBhYmlsaXR5UmVzdHJpY3Rpb24uaXNEZWxldGFibGUpIHtcblx0XHRcdC8vIElmIHRoZXJlIGlzIHN0aWxsIGFuIGVudGl0eXNldCwgY2hlY2sgdGhlIGVudGl0eXNldCBkZWxldGFibGUgc3RhdHVzXG5cdFx0XHRvQ2FwYWJpbGl0eVJlc3RyaWN0aW9uLmlzRGVsZXRhYmxlID0gY3VycmVudEVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LkRlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlICE9PSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG9DYXBhYmlsaXR5UmVzdHJpY3Rpb24uaXNVcGRhdGFibGUpIHtcblx0XHRcdC8vIElmIHRoZXJlIGlzIHN0aWxsIGFuIGVudGl0eXNldCwgY2hlY2sgdGhlIGVudGl0eXNldCB1cGRhdGFibGUgc3RhdHVzXG5cdFx0XHRvQ2FwYWJpbGl0eVJlc3RyaWN0aW9uLmlzVXBkYXRhYmxlID0gY3VycmVudEVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LlVwZGF0ZVJlc3RyaWN0aW9ucz8uVXBkYXRhYmxlICE9PSBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9DYXBhYmlsaXR5UmVzdHJpY3Rpb247XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGlvbk1vZGUoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlzRW50aXR5U2V0OiBib29sZWFuXG4pOiBzdHJpbmcge1xuXHRpZiAoIWxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdH1cblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0bGV0IHNlbGVjdGlvbk1vZGUgPSB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncz8uc2VsZWN0aW9uTW9kZTtcblx0aWYgKHNlbGVjdGlvbk1vZGUgJiYgc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5Ob25lKSB7XG5cdFx0aWYgKGdldENhcGFiaWxpdHlSZXN0cmljdGlvbih2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCkuaXNEZWxldGFibGUpIHtcblx0XHRcdHJldHVybiBcIns9ICR7dWk+L2VkaXRNb2RlfSA9PT0gJ0VkaXRhYmxlJyA/ICdcIiArIFNlbGVjdGlvbk1vZGUuTXVsdGkgKyBcIicgOiAnTm9uZSd9XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKCFzZWxlY3Rpb25Nb2RlIHx8IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuQXV0bykge1xuXHRcdHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cdGlmIChoYXNBY3Rpb25SZXF1aXJpbmdDb250ZXh0KGxpbmVJdGVtQW5ub3RhdGlvbikpIHtcblx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0fSBlbHNlIGlmIChnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24odmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpLmlzRGVsZXRhYmxlKSB7XG5cdFx0aWYgKCFpc0VudGl0eVNldCkge1xuXHRcdFx0cmV0dXJuIFwiez0gJHt1aT4vZWRpdE1vZGV9ID09PSAnRWRpdGFibGUnID8gJ1wiICsgc2VsZWN0aW9uTW9kZSArIFwiJyA6ICdOb25lJ31cIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvbk1vZGU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIHJldHJpZXZlIGFsbCB0YWJsZSBhY3Rpb25zIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMge1JlY29yZDxCYXNlQWN0aW9uLCBCYXNlQWN0aW9uPn0gdGhlIHRhYmxlIGFubm90YXRpb24gYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRUYWJsZUFubm90YXRpb25BY3Rpb25zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCB0YWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRpZiAobGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgYWJzb2x1dGVQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0XHRsaW5lSXRlbUFubm90YXRpb24uZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBpbmRleCkgPT4ge1xuXHRcdFx0bGV0IHRhYmxlQWN0aW9uOiBBbm5vdGF0aW9uQWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0KGRhdGFGaWVsZCkgJiZcblx0XHRcdFx0IShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gPT09IHRydWUpICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuSW5saW5lICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuRGV0ZXJtaW5pbmdcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGFic29sdXRlUGF0aCArIFwiL1wiICsgaW5kZXg7XG5cdFx0XHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0XHRcdFx0dGFibGVBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdGtleTogXCJEYXRhRmllbGRGb3JBY3Rpb246OlwiICsgZGF0YUZpZWxkLkFjdGlvbi5yZXBsYWNlKC9cXC8vZywgXCI6OlwiKSxcblx0XHRcdFx0XHRcdFx0aXNOYXZpZ2FibGU6IHRydWVcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjpcblx0XHRcdFx0XHRcdHRhYmxlQWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRrZXk6XG5cdFx0XHRcdFx0XHRcdFx0XCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246OlwiICtcblx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuU2VtYW50aWNPYmplY3QgK1xuXHRcdFx0XHRcdFx0XHRcdFwiOjpcIiArXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbiArXG5cdFx0XHRcdFx0XHRcdFx0KGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQgPyBcIjo6UmVxdWlyZXNDb250ZXh0XCIgOiBcIlwiKVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAodGFibGVBY3Rpb24pIHtcblx0XHRcdFx0dGFibGVBY3Rpb25zLnB1c2godGFibGVBY3Rpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB0YWJsZUFjdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldENyaXRpY2FsaXR5QmluZGluZ0J5RW51bShDcml0aWNhbGl0eUVudW06IEVudW1WYWx1ZTxDcml0aWNhbGl0eVR5cGU+KSB7XG5cdGxldCBjcml0aWNhbGl0eVByb3BlcnR5O1xuXHRzd2l0Y2ggKENyaXRpY2FsaXR5RW51bSkge1xuXHRcdGNhc2UgXCJVSS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIjpcblx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJVSS5Dcml0aWNhbGl0eVR5cGUvQ3JpdGljYWxcIjpcblx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5XYXJuaW5nO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZVwiOlxuXHRcdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLlN1Y2Nlc3M7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiVUkuQ3JpdGljYWxpdHlUeXBlL05ldXRyYWxcIjpcblx0XHRkZWZhdWx0OlxuXHRcdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IE1lc3NhZ2VUeXBlLk5vbmU7XG5cdH1cblx0cmV0dXJuIGNyaXRpY2FsaXR5UHJvcGVydHk7XG59XG5cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdGNyaXRpY2FsaXR5QW5ub3RhdGlvbjogUGF0aEFubm90YXRpb25FeHByZXNzaW9uPENyaXRpY2FsaXR5VHlwZT4gfCBFbnVtVmFsdWU8Q3JpdGljYWxpdHlUeXBlPiB8IHVuZGVmaW5lZCxcblx0aXNEcmFmdFJvb3Q6IGJvb2xlYW5cbik6IEJpbmRpbmdQYXJ0PCQkTWVzc2FnZVR5cGU+IHtcblx0bGV0IGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uOiBCaW5kaW5nUGFydDxhbnk+ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0aWYgKGNyaXRpY2FsaXR5QW5ub3RhdGlvbikge1xuXHRcdGlmICh0eXBlb2YgY3JpdGljYWxpdHlBbm5vdGF0aW9uID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbiA9IGFubm90YXRpb25FeHByZXNzaW9uKGNyaXRpY2FsaXR5QW5ub3RhdGlvbik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEVudW0gVmFsdWUgc28gd2UgZ2V0IHRoZSBjb3JyZXNwb25kaW5nIHN0YXRpYyBwYXJ0XG5cdFx0XHRkZWZhdWx0SGlnaGxpZ2h0Um93RGVmaW5pdGlvbiA9IGdldENyaXRpY2FsaXR5QmluZGluZ0J5RW51bShjcml0aWNhbGl0eUFubm90YXRpb24pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdGlzRHJhZnRSb290ICYmIERyYWZ0LklzTmV3T2JqZWN0LFxuXHRcdE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uLFxuXHRcdGZvcm1hdFJlc3VsdChbZGVmYXVsdEhpZ2hsaWdodFJvd0RlZmluaXRpb25dLCB0YWJsZUZvcm1hdHRlcnMucm93SGlnaGxpZ2h0aW5nKVxuXHQpO1xufVxuXG5mdW5jdGlvbiBfZ2V0Q3JlYXRpb25CZWhhdmlvdXIoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M6IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbik6IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb25bXCJjcmVhdGVcIl0ge1xuXHRjb25zdCBuYXZpZ2F0aW9uID0gbmF2aWdhdGlvblNldHRpbmdzPy5jcmVhdGUgfHwgbmF2aWdhdGlvblNldHRpbmdzPy5kZXRhaWw7XG5cblx0Ly8gY3Jvc3MtYXBwXG5cdGlmIChuYXZpZ2F0aW9uPy5vdXRib3VuZCAmJiBuYXZpZ2F0aW9uLm91dGJvdW5kRGV0YWlsICYmIG5hdmlnYXRpb25TZXR0aW5ncz8uY3JlYXRlKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1vZGU6IFwiRXh0ZXJuYWxcIixcblx0XHRcdG91dGJvdW5kOiBuYXZpZ2F0aW9uLm91dGJvdW5kLFxuXHRcdFx0b3V0Ym91bmREZXRhaWw6IG5hdmlnYXRpb24ub3V0Ym91bmREZXRhaWwsXG5cdFx0XHRuYXZpZ2F0aW9uU2V0dGluZ3M6IG5hdmlnYXRpb25TZXR0aW5nc1xuXHRcdH07XG5cdH1cblxuXHRsZXQgbmV3QWN0aW9uO1xuXHRpZiAobGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0Ly8gaW4tYXBwXG5cdFx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKTtcblx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9ucyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0Rm9yRW50aXR5VHlwZSh0YXJnZXRFbnRpdHlUeXBlKT8uYW5ub3RhdGlvbnM7XG5cdFx0bmV3QWN0aW9uID0gdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290Py5OZXdBY3Rpb24gfHwgdGFyZ2V0QW5ub3RhdGlvbnM/LlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvbjsgLy8gVE9ETzogSXMgdGhlcmUgcmVhbGx5IG5vICdOZXdBY3Rpb24nIG9uIERyYWZ0Tm9kZT8gdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnROb2RlPy5OZXdBY3Rpb25cblxuXHRcdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBuZXdBY3Rpb24pIHtcblx0XHRcdC8vIEEgY29tYmluYXRpb24gb2YgJ0NyZWF0aW9uUm93JyBhbmQgJ05ld0FjdGlvbicgZG9lcyBub3QgbWFrZSBzZW5zZVxuXHRcdFx0Ly8gVE9ETzogT3IgZG9lcyBpdD9cblx0XHRcdHRocm93IEVycm9yKGBDcmVhdGlvbiBtb2RlICcke0NyZWF0aW9uTW9kZS5DcmVhdGlvblJvd30nIGNhbiBub3QgYmUgdXNlZCB3aXRoIGEgY3VzdG9tICduZXcnIGFjdGlvbiAoJHtuZXdBY3Rpb259KWApO1xuXHRcdH1cblx0XHRpZiAobmF2aWdhdGlvbj8ucm91dGUpIHtcblx0XHRcdC8vIHJvdXRlIHNwZWNpZmllZFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bW9kZTogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlLFxuXHRcdFx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdFx0XHRuZXdBY3Rpb246IG5ld0FjdGlvbixcblx0XHRcdFx0bmF2aWdhdGVUb1RhcmdldDogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuTmV3UGFnZSA/IG5hdmlnYXRpb24ucm91dGUgOiB1bmRlZmluZWQgLy8gbmF2aWdhdGUgb25seSBpbiBOZXdQYWdlIG1vZGVcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0Ly8gbm8gbmF2aWdhdGlvbiBvciBubyByb3V0ZSBzcGVjaWZpZWQgLSBmYWxsYmFjayB0byBpbmxpbmUgY3JlYXRlIGlmIG9yaWdpbmFsIGNyZWF0aW9uIG1vZGUgd2FzICdOZXdQYWdlJ1xuXHRpZiAodGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuTmV3UGFnZSkge1xuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5JbmxpbmU7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1vZGU6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSxcblx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uXG5cdH07XG59XG5cbmNvbnN0IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkgPSBmdW5jdGlvbihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bmF2aWdhdGlvblNldHRpbmdzOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHR0YXJnZXRQYXRoOiBzdHJpbmdcbikge1xuXHRsZXQgcHJlc3NQcm9wZXJ0eSwgbmF2aWdhdGlvblRhcmdldDtcblx0bGV0IGNyaXRpY2FsaXR5UHJvcGVydHk6IEJpbmRpbmdQYXJ0PCQkTWVzc2FnZVR5cGU+ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKTtcblx0aWYgKG5hdmlnYXRpb25TZXR0aW5ncyAmJiBsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRuYXZpZ2F0aW9uVGFyZ2V0ID0gbmF2aWdhdGlvblNldHRpbmdzLmRpc3BsYXk/LnRhcmdldCB8fCBuYXZpZ2F0aW9uU2V0dGluZ3MuZGV0YWlsPy5vdXRib3VuZDtcblx0XHRpZiAobmF2aWdhdGlvblRhcmdldCkge1xuXHRcdFx0cHJlc3NQcm9wZXJ0eSA9XG5cdFx0XHRcdFwiLmhhbmRsZXJzLm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCggJGNvbnRyb2xsZXIgLCdcIiArIG5hdmlnYXRpb25UYXJnZXQgKyBcIicsICR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9KVwiO1xuXHRcdH0gZWxzZSBpZiAoKG5hdmlnYXRpb25UYXJnZXQgPSBuYXZpZ2F0aW9uU2V0dGluZ3MuZGV0YWlsPy5yb3V0ZSkpIHtcblx0XHRcdGlmICh0YXJnZXRFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0Rm9yRW50aXR5VHlwZSh0YXJnZXRFbnRpdHlUeXBlKTtcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb25zID0gdGFyZ2V0RW50aXR5U2V0LmFubm90YXRpb25zO1xuXHRcdFx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBnZXRIaWdobGlnaHRSb3dCaW5kaW5nKFxuXHRcdFx0XHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmFubm90YXRpb25zPy5VST8uQ3JpdGljYWxpdHksXG5cdFx0XHRcdFx0XHQhIXRhcmdldEFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290IHx8ICEhdGFyZ2V0QW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdE5vZGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHByZXNzUHJvcGVydHkgPVxuXHRcdFx0XHRcdFx0XCIucm91dGluZy5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQoJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0sIHsgdGFyZ2V0UGF0aDogJ1wiICtcblx0XHRcdFx0XHRcdHRhcmdldFBhdGggK1xuXHRcdFx0XHRcdFx0XCInLCBlZGl0YWJsZSA6IFwiICtcblx0XHRcdFx0XHRcdCh0YXJnZXRBbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdFJvb3QgfHwgdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnROb2RlXG5cdFx0XHRcdFx0XHRcdD8gXCIhJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0uZ2V0UHJvcGVydHkoJ0lzQWN0aXZlRW50aXR5JylcIlxuXHRcdFx0XHRcdFx0XHQ6IFwidW5kZWZpbmVkXCIpICtcblx0XHRcdFx0XHRcdFwifSlcIjsgLy9OZWVkIHRvIGFjY2VzcyB0byBEcmFmdFJvb3QgYW5kIERyYWZ0Tm9kZSAhISEhISEhXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Y29uc3Qgcm93TmF2aWdhdGVkRXhwcmVzc2lvbjogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+ID0gaWZFbHNlKFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaXNGY2xFbmFibGVkKCksXG5cdFx0Zm9ybWF0UmVzdWx0KFtiaW5kaW5nRXhwcmVzc2lvbihcIi9kZWVwZXN0UGF0aFwiLCBcImZjbG5hdmlnYXRlZFwiKV0sIHRhYmxlRm9ybWF0dGVycy5mY2xOYXZpZ2F0ZWRSb3csIHRhcmdldEVudGl0eVR5cGUpLFxuXHRcdGZhbHNlXG5cdCk7XG5cdHJldHVybiB7XG5cdFx0cHJlc3M6IHByZXNzUHJvcGVydHksXG5cdFx0YWN0aW9uOiBwcmVzc1Byb3BlcnR5ID8gXCJOYXZpZ2F0aW9uXCIgOiB1bmRlZmluZWQsXG5cdFx0cm93SGlnaGxpZ2h0aW5nOiBjb21waWxlQmluZGluZyhjcml0aWNhbGl0eVByb3BlcnR5KSxcblx0XHRyb3dOYXZpZ2F0ZWQ6IGNvbXBpbGVCaW5kaW5nKHJvd05hdmlnYXRlZEV4cHJlc3Npb24pXG5cdH07XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb2x1bW5zIGZyb20gdGhlIGVudGl0eVR5cGUuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGVcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtUYWJsZUNvbHVtbltdfSB0aGUgY29sdW1uIGZyb20gdGhlIGVudGl0eVR5cGVcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlID0gZnVuY3Rpb24oXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IFtdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBUYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgdGFibGVDb2x1bW5zOiBUYWJsZUNvbHVtbltdID0gW107XG5cdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHQvLyBDYXRjaCBhbHJlYWR5IGV4aXN0aW5nIGNvbHVtbnMgLSB3aGljaCB3ZXJlIGFkZGVkIGJlZm9yZSBieSBMaW5lSXRlbSBBbm5vdGF0aW9uc1xuXHRcdGNvbnN0IGV4aXN0cyA9IGFubm90YXRpb25Db2x1bW5zLnNvbWUoY29sdW1uID0+IHtcblx0XHRcdHJldHVybiBjb2x1bW4ubmFtZSA9PT0gcHJvcGVydHkubmFtZTtcblx0XHR9KTtcblxuXHRcdGlmICghZXhpc3RzKSB7XG5cdFx0XHRjb25zdCBlbnRpdHlOYW1lID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0Rm9yRW50aXR5VHlwZShlbnRpdHlUeXBlKSB8fCBlbnRpdHlUeXBlKS5uYW1lO1xuXHRcdFx0dGFibGVDb2x1bW5zLnB1c2goe1xuXHRcdFx0XHRrZXk6IFwiRGF0YUZpZWxkOjpcIiArIHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IFwiL1wiICsgZW50aXR5TmFtZSArIFwiL1wiICsgcHJvcGVydHkubmFtZSxcblx0XHRcdFx0cGVyc29uYWxpemF0aW9uT25seTogdHJ1ZSxcblx0XHRcdFx0bmFtZTogcHJvcGVydHkubmFtZSxcblx0XHRcdFx0dmlzaWJsZTogY29udmVydGVyQ29udGV4dC5nZXRJbnZlcnNlQmluZGluZ0V4cHJlc3Npb24ocHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4sIHRydWUpLFxuXHRcdFx0XHR0ZW1wbGF0ZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblByb3BlcnR5XCJcblx0XHRcdH0gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gdGFibGVDb2x1bW5zO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGJvb2xlYW4gdHJ1ZSBmb3IgdmFsaWQgY29sdW1ucywgZmFsc2UgZm9yIGludmFsaWQgY29sdW1ucy5cbiAqXG4gKiBAcGFyYW0ge0RhdGFGaWVsZEFic3RyYWN0VHlwZXN9IGRhdGFGaWVsZCBEaWZmZXJlbnQgRGF0YUZpZWxkIHR5cGVzIGRlZmluZWQgaW4gdGhlIGFubm90YXRpb25zXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBmb3IgdmFsaWQgY29sdW1ucywgZmFsc2UgZm9yIGludmFsaWQgY29sdW1uc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2lzVmFsaWRDb2x1bW4gPSBmdW5jdGlvbihkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpIHtcblx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCI6XG5cdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0cmV0dXJuICEhZGF0YUZpZWxkLklubGluZTtcblx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiOlxuXHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiOlxuXHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCI6XG5cdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIjpcblx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCI6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRkZWZhdWx0OlxuXHRcdC8vIFRvZG86IFJlcGxhY2Ugd2l0aCBwcm9wZXIgTG9nIHN0YXRlbWVudCBvbmNlIGF2YWlsYWJsZVxuXHRcdC8vICB0aHJvdyBuZXcgRXJyb3IoXCJVbmhhbmRsZWQgRGF0YUZpZWxkIEFic3RyYWN0IHR5cGU6IFwiICsgZGF0YUZpZWxkLiRUeXBlKTtcblx0fVxufTtcblxuLyoqXG4gKiBHZXR0aW5nIHRoZSBDb2x1bW4gTmFtZVxuICogSWYgaXQgcG9pbnRzIHRvIGEgRGF0YUZpZWxkIHdpdGggb25lIHByb3BlcnR5IG9yIERhdGFQb2ludCB3aXRoIG9uZSBwcm9wZXJ0eSBpdCB3aWxsIHVzZSB0aGUgcHJvcGVydHkgbmFtZVxuICogaGVyZSB0byBiZSBjb25zaXN0ZW50IHdpdGggdGhlIGV4aXN0aW5nIGZsZXggY2hhbmdlcy5cbiAqXG4gKiBAcGFyYW0ge0RhdGFGaWVsZEFic3RyYWN0VHlwZXN9IGRhdGFGaWVsZCBEaWZmZXJlbnQgRGF0YUZpZWxkIHR5cGVzIGRlZmluZWQgaW4gdGhlIGFubm90YXRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIG5hbWUgb2YgYW5ub3RhdGlvbiBjb2x1bW5zXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUgPSBmdW5jdGlvbihkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpIHtcblx0Ly8gVGhpcyBpcyBuZWVkZWQgYXMgd2UgaGF2ZSBmbGV4aWJpbGl0eSBjaGFuZ2VzIGFscmVhZHkgdGhhdCB3ZSBoYXZlIHRvIGNoZWNrIGFnYWluc3Rcblx0aWYgKGlzRGF0YUZpZWxkVHlwZXMoZGF0YUZpZWxkKSkge1xuXHRcdHJldHVybiBkYXRhRmllbGQuVmFsdWU/LnBhdGg7XG5cdH0gZWxzZSBpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmIGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LlZhbHVlPy5wYXRoKSB7XG5cdFx0Ly8gVGhpcyBpcyBmb3IgcmVtb3ZpbmcgZHVwbGljYXRlIHByb3BlcnRpZXMuIEZvciBleGFtcGxlIHRoZSBQcm9ncmVzcyBQcm9wZXJ0eSBpZiByZW1vdmVkIGlmIGl0IGFscmVhZHkgaXMgZGVmaW5lZCBhcyBhIERhdGFQb2ludFxuXHRcdHJldHVybiBkYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQuVmFsdWUucGF0aDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHR9XG59O1xuXG4vKipcbiAqIFJldHVybnMgbGluZSBpdGVtcyBmcm9tIG1ldGFkYXRhIGFubm90YXRpb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb25cbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtUYWJsZUNvbHVtbltdfSB0aGUgY29sdW1ucyBmcm9tIHRoZSBhbm5vdGF0aW9uc1xuICovXG5jb25zdCBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zID0gZnVuY3Rpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pO1xuXHRjb25zdCBhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXTtcblx0aWYgKGxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdC8vIEdldCBjb2x1bW5zIGZyb20gdGhlIExpbmVJdGVtIEFubm90YXRpb25cblxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5mb3JFYWNoKChsaW5lSXRlbSwgbGluZUl0ZW1JbmRleCkgPT4ge1xuXHRcdFx0aWYgKCFfaXNWYWxpZENvbHVtbihsaW5lSXRlbSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uUmVmZXJlbmNlID0gY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKHZpc3VhbGl6YXRpb25QYXRoKSArIFwiL1wiICsgbGluZUl0ZW1JbmRleDtcblx0XHRcdGFubm90YXRpb25Db2x1bW5zLnB1c2goe1xuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvblJlZmVyZW5jZSxcblx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQobGluZUl0ZW0pLFxuXHRcdFx0XHR3aWR0aDogbGluZUl0ZW0uYW5ub3RhdGlvbnM/LkhUTUw1Py5Dc3NEZWZhdWx0cz8ud2lkdGggfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRwZXJzb25hbGl6YXRpb25Pbmx5OiBmYWxzZSxcblx0XHRcdFx0bmFtZTogX2dldEFubm90YXRpb25Db2x1bW5OYW1lKGxpbmVJdGVtKSxcblx0XHRcdFx0dmlzaWJsZTogY29udmVydGVyQ29udGV4dC5nZXRJbnZlcnNlQmluZGluZ0V4cHJlc3Npb24obGluZUl0ZW0uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4sIHRydWUpLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0fSBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW4pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gR2V0IGNvbHVtbnMgZnJvbSB0aGUgUHJvcGVydGllcyBvZiBFbnRpdHlUeXBlXG5cdGxldCB0YWJsZUNvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUoZW50aXR5VHlwZSwgYW5ub3RhdGlvbkNvbHVtbnMsIGNvbnZlcnRlckNvbnRleHQpO1xuXHR0YWJsZUNvbHVtbnMgPSB0YWJsZUNvbHVtbnMuY29uY2F0KGFubm90YXRpb25Db2x1bW5zKTtcblxuXHRyZXR1cm4gdGFibGVDb2x1bW5zO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRhYmxlIGNvbHVtbiBkZWZpbml0aW9ucyBmcm9tIG1hbmlmZXN0LlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zXG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyB7UmVjb3JkPHN0cmluZywgQ3VzdG9tQ29sdW1uPn0gdGhlIGNvbHVtbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21NYW5pZmVzdCA9IGZ1bmN0aW9uKFxuXHRjb2x1bW5zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdFRhYmxlQ29sdW1uPixcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvblxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tQ29sdW1uPiB7XG5cdGNvbnN0IGludGVybmFsQ29sdW1uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQ29sdW1uPiA9IHt9O1xuXHRmb3IgKGNvbnN0IGtleSBpbiBjb2x1bW5zKSB7XG5cdFx0Y29uc3QgbWFuaWZlc3RDb2x1bW4gPSBjb2x1bW5zW2tleV07XG5cdFx0S2V5SGVscGVyLmlzS2V5VmFsaWQoa2V5KTtcblx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0aWQ6IFwiQ3VzdG9tQ29sdW1uOjpcIiArIGtleSxcblx0XHRcdG5hbWU6IFwiQ3VzdG9tQ29sdW1uOjpcIiArIGtleSxcblx0XHRcdGhlYWRlcjogbWFuaWZlc3RDb2x1bW4uaGVhZGVyLFxuXHRcdFx0d2lkdGg6IG1hbmlmZXN0Q29sdW1uLndpZHRoIHx8IHVuZGVmaW5lZCxcblx0XHRcdHR5cGU6IENvbHVtblR5cGUuRGVmYXVsdCxcblx0XHRcdHBlcnNvbmFsaXphdGlvbk9ubHk6IGZhbHNlLFxuXHRcdFx0dGVtcGxhdGU6IG1hbmlmZXN0Q29sdW1uLnRlbXBsYXRlIHx8IFwidW5kZWZpbmVkXCIsXG5cdFx0XHR2aXNpYmxlOiB0cnVlLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0YW5jaG9yOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbj8uYW5jaG9yLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IG1hbmlmZXN0Q29sdW1uLnBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBQbGFjZW1lbnQuQWZ0ZXIgOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbi5wbGFjZW1lbnRcblx0XHRcdH0sXG5cdFx0XHRpc05hdmlnYWJsZTogaXNBY3Rpb25OYXZpZ2FibGUobWFuaWZlc3RDb2x1bW4sIG5hdmlnYXRpb25TZXR0aW5ncywgdHJ1ZSlcblx0XHR9O1xuXHR9XG5cdHJldHVybiBpbnRlcm5hbENvbHVtbnM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlcjogTWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IGhhc1ZhcmlhbnRNYW5hZ2VtZW50OiBib29sZWFuID0gW1wiUGFnZVwiLCBcIkNvbnRyb2xcIl0uaW5kZXhPZihtYW5pZmVzdFdyYXBwZXIuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKSkgPiAtMTtcblx0bGV0IHBlcnNvbmFsaXphdGlvbjogYW55ID0gdHJ1ZTtcblx0Y29uc3QgYVBlcnNvbmFsaXphdGlvbjogc3RyaW5nW10gPSBbXTtcblx0aWYgKHRhYmxlTWFuaWZlc3RTZXR0aW5ncz8udGFibGVTZXR0aW5ncz8ucGVyc29uYWxpemF0aW9uICE9PSB1bmRlZmluZWQpIHtcblx0XHRwZXJzb25hbGl6YXRpb24gPSB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncy5wZXJzb25hbGl6YXRpb247XG5cdH1cblx0Y29uc3QgaXNUYWJsZUluT2JqZWN0UGFnZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVDb252ZXJ0ZXJUeXBlKCkgPT09IFwiT2JqZWN0UGFnZVwiO1xuXHRpZiAoaGFzVmFyaWFudE1hbmFnZW1lbnQgJiYgcGVyc29uYWxpemF0aW9uKSB7XG5cdFx0aWYgKHBlcnNvbmFsaXphdGlvbiA9PT0gdHJ1ZSkge1xuXHRcdFx0Ly8gRmlsdGVyaW5nIGluIHAxM24gc3VwcG9ydGVkIG9ubHkgb24gT2JqZWN0UGFnZS5cblx0XHRcdHJldHVybiBpc1RhYmxlSW5PYmplY3RQYWdlID8gXCJTb3J0LENvbHVtbixGaWx0ZXJcIiA6IFwiU29ydCxDb2x1bW5cIjtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uY29sdW1uKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkNvbHVtblwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uc29ydCkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJTb3J0XCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5maWx0ZXIgJiYgaXNUYWJsZUluT2JqZWN0UGFnZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJGaWx0ZXJcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2V0RGVsZXRlSGlkZGVuKGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCwgbmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRsZXQgaXNEZWxldGVIaWRkZW46IGFueSA9IGZhbHNlO1xuXHRpZiAobmF2aWdhdGlvblBhdGgpIHtcblx0XHQvLyBDaGVjayBpZiBVSS5EZWxldGVIaWRkZW4gaXMgcG9pbnRpbmcgdG8gcGFyZW50IHBhdGhcblx0XHRjb25zdCBkZWxldGVIaWRkZW5Bbm5vdGF0aW9uID0gY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdmlnYXRpb25QYXRoXT8uYW5ub3RhdGlvbnM/LlVJPy5EZWxldGVIaWRkZW47XG5cdFx0aWYgKGRlbGV0ZUhpZGRlbkFubm90YXRpb24gJiYgKGRlbGV0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoKSB7XG5cdFx0XHRpZiAoKGRlbGV0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0XHRjb25zdCBhU3BsaXRIaWRkZW5QYXRoID0gKGRlbGV0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYVNwbGl0SGlkZGVuUGF0aFswXTtcblx0XHRcdFx0Y29uc3QgcGFydG5lck5hbWUgPSAoY3VycmVudEVudGl0eVNldCBhcyBhbnkpLmVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZChcblx0XHRcdFx0XHQobmF2UHJvcGVydHk6IGFueSkgPT4gbmF2UHJvcGVydHkubmFtZSA9PT0gbmF2aWdhdGlvblBhdGhcblx0XHRcdFx0KS5wYXJ0bmVyO1xuXHRcdFx0XHRpZiAocGFydG5lck5hbWUgPT09IHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHRcdGlzRGVsZXRlSGlkZGVuID0gZGVsZXRlSGlkZGVuQW5ub3RhdGlvbjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNEZWxldGVIaWRkZW4gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNEZWxldGVIaWRkZW4gPSBkZWxldGVIaWRkZW5Bbm5vdGF0aW9uO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpc0RlbGV0ZUhpZGRlbiA9IGN1cnJlbnRFbnRpdHlTZXQuYW5ub3RhdGlvbnM/LlVJPy5EZWxldGVIaWRkZW47XG5cdH1cblx0cmV0dXJuIGlzRGVsZXRlSGlkZGVuO1xufVxuXG4vKipcbiAqIFJldHVybnMgdmlzaWJpbGl0eSBmb3IgRGVsZXRlIGJ1dHRvblxuICogQHBhcmFtIGlzTGlzdFJlcG9ydFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uUGF0aFxuICogQHBhcmFtIHNUZW1wbGF0ZVR5cGVcbiAqIEBwYXJhbSBpc1RhcmdldERlbGV0YWJsZVxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWxldGVWaXNpYmxlKFxuXHRpc0xpc3RSZXBvcnQ6IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmcsXG5cdHNUZW1wbGF0ZVR5cGU6IHN0cmluZyxcblx0aXNUYXJnZXREZWxldGFibGU6IGJvb2xlYW5cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB8IGJvb2xlYW4ge1xuXHRjb25zdCBjdXJyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBudWxsID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgaXNEZWxldGVIaWRkZW46IGFueSA9IGdldERlbGV0ZUhpZGRlbihjdXJyZW50RW50aXR5U2V0LCBuYXZpZ2F0aW9uUGF0aCk7XG5cblx0aWYgKGlzRGVsZXRlSGlkZGVuID09PSB0cnVlIHx8IGlzVGFyZ2V0RGVsZXRhYmxlID09PSBmYWxzZSB8fCBzVGVtcGxhdGVUeXBlID09PSBcIkFuYWx5dGljYWxMaXN0UGFnZVwiKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2UgaWYgKCFpc0xpc3RSZXBvcnQpIHtcblx0XHRpZiAoaXNEZWxldGVIaWRkZW4pIHtcblx0XHRcdHJldHVybiBcIns9ICEke1wiICsgKG5hdmlnYXRpb25QYXRoID8gbmF2aWdhdGlvblBhdGggKyBcIi9cIiA6IFwiXCIpICsgaXNEZWxldGVIaWRkZW4ucGF0aCArIFwifSAmJiAke3VpPi9lZGl0TW9kZX0gPT09ICdFZGl0YWJsZSd9XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIns9ICR7dWk+L2VkaXRNb2RlfSA9PT0gJ0VkaXRhYmxlJ31cIjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SW5zZXJ0YWJsZShjdXJyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQsIG5hdmlnYXRpb25QYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcblx0bGV0IGlzSW5zZXJ0YWJsZTogYm9vbGVhbiA9IHRydWU7XG5cdGxldCBoYXNOYXZpZ2F0aW9uSW5zZXJ0UmVzdHJpY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcblx0Y29uc3QgUmVzdHJpY3RlZFByb3BlcnRpZXMgPSBjdXJyZW50RW50aXR5U2V0Py5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzPy5OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zPy5SZXN0cmljdGVkUHJvcGVydGllcztcblx0aWYgKG5hdmlnYXRpb25QYXRoICYmIFJlc3RyaWN0ZWRQcm9wZXJ0aWVzKSB7XG5cdFx0Y29uc3QgcmVzdHJpY3RlZFByb3BlcnR5ID0gUmVzdHJpY3RlZFByb3BlcnRpZXMuZmluZChcblx0XHRcdHJlc3RyaWN0ZWRQcm9wZXJ0eSA9PlxuXHRcdFx0XHRyZXN0cmljdGVkUHJvcGVydHk/Lk5hdmlnYXRpb25Qcm9wZXJ0eT8udHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIgJiZcblx0XHRcdFx0cmVzdHJpY3RlZFByb3BlcnR5Py5OYXZpZ2F0aW9uUHJvcGVydHk/LnZhbHVlID09PSBuYXZpZ2F0aW9uUGF0aCAmJlxuXHRcdFx0XHRyZXN0cmljdGVkUHJvcGVydHk/Lkluc2VydFJlc3RyaWN0aW9uc1xuXHRcdCk7XG5cdFx0aWYgKHJlc3RyaWN0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0aXNJbnNlcnRhYmxlID0gcmVzdHJpY3RlZFByb3BlcnR5Py5JbnNlcnRSZXN0cmljdGlvbnM/Lkluc2VydGFibGUgIT09IGZhbHNlO1xuXHRcdFx0aGFzTmF2aWdhdGlvbkluc2VydFJlc3RyaWN0aW9uID0gdHJ1ZTtcblx0XHR9XG5cdH1cblx0aWYgKG5hdmlnYXRpb25QYXRoICYmICFoYXNOYXZpZ2F0aW9uSW5zZXJ0UmVzdHJpY3Rpb24pIHtcblx0XHRpc0luc2VydGFibGUgPVxuXHRcdFx0Y3VycmVudEVudGl0eVNldD8ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0aW9uUGF0aF0/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/Lkluc2VydFJlc3RyaWN0aW9ucz8uSW5zZXJ0YWJsZSAhPT1cblx0XHRcdGZhbHNlO1xuXHR9IGVsc2UgaWYgKCFuYXZpZ2F0aW9uUGF0aCkge1xuXHRcdGlzSW5zZXJ0YWJsZSA9IGN1cnJlbnRFbnRpdHlTZXQ/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/Lkluc2VydFJlc3RyaWN0aW9ucz8uSW5zZXJ0YWJsZSAhPT0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIGlzSW5zZXJ0YWJsZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3JlYXRlSGlkZGVuKGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCwgbmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRsZXQgaXNDcmVhdGVIaWRkZW46IGFueSA9IGZhbHNlO1xuXHRpZiAobmF2aWdhdGlvblBhdGgpIHtcblx0XHQvLyBDaGVjayBpZiBVSS5DcmVhdGVIaWRkZW4gaXMgcG9pbnRpbmcgdG8gcGFyZW50IHBhdGhcblx0XHRjb25zdCBjcmVhdGVIaWRkZW5Bbm5vdGF0aW9uID0gY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdmlnYXRpb25QYXRoXT8uYW5ub3RhdGlvbnM/LlVJPy5DcmVhdGVIaWRkZW47XG5cdFx0aWYgKGNyZWF0ZUhpZGRlbkFubm90YXRpb24gJiYgKGNyZWF0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoKSB7XG5cdFx0XHRpZiAoKGNyZWF0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0XHRjb25zdCBhU3BsaXRIaWRkZW5QYXRoID0gKGNyZWF0ZUhpZGRlbkFubm90YXRpb24gYXMgYW55KS5wYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYVNwbGl0SGlkZGVuUGF0aFswXTtcblx0XHRcdFx0Y29uc3QgcGFydG5lck5hbWUgPSAoY3VycmVudEVudGl0eVNldCBhcyBhbnkpLmVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZChcblx0XHRcdFx0XHQobmF2UHJvcGVydHk6IGFueSkgPT4gbmF2UHJvcGVydHkubmFtZSA9PT0gbmF2aWdhdGlvblBhdGhcblx0XHRcdFx0KS5wYXJ0bmVyO1xuXHRcdFx0XHRpZiAocGFydG5lck5hbWUgPT09IHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHRcdGlzQ3JlYXRlSGlkZGVuID0gY3JlYXRlSGlkZGVuQW5ub3RhdGlvbjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNDcmVhdGVIaWRkZW4gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aXNDcmVhdGVIaWRkZW4gPSBjcmVhdGVIaWRkZW5Bbm5vdGF0aW9uO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRpc0NyZWF0ZUhpZGRlbiA9IGN1cnJlbnRFbnRpdHlTZXQuYW5ub3RhdGlvbnM/LlVJPy5DcmVhdGVIaWRkZW47XG5cdH1cblx0cmV0dXJuIGlzQ3JlYXRlSGlkZGVuO1xufVxuXG4vKipcbiAqIFJldHVybnMgdmlzaWJpbGl0eSBmb3IgQ3JlYXRlIGJ1dHRvblxuICpcbiAqIEBwYXJhbSBpc0xpc3RSZXBvcnRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblBhdGhcbiAqIEBwYXJhbSBzVGVtcGxhdGVUeXBlXG4gKiBAcmV0dXJucyB7Kn0gRXhwcmVzc2lvbiBvciBCb29sZWFuIHZhbHVlIG9mIGNyZWF0ZWhpZGRlblxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDcmVhdGVWaXNpYmxlKFxuXHRpc0xpc3RSZXBvcnQ6IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmcsXG5cdHNUZW1wbGF0ZVR5cGU6IHN0cmluZ1xuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHwgYm9vbGVhbiB7XG5cdGNvbnN0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IG51bGwgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBpc0NyZWF0ZUhpZGRlbjogYW55ID0gZ2V0Q3JlYXRlSGlkZGVuKGN1cnJlbnRFbnRpdHlTZXQsIG5hdmlnYXRpb25QYXRoKTtcblx0Y29uc3QgaXNJbnNlcnRhYmxlOiBib29sZWFuID0gZ2V0SW5zZXJ0YWJsZShjdXJyZW50RW50aXR5U2V0LCBuYXZpZ2F0aW9uUGF0aCk7XG5cblx0aWYgKGlzQ3JlYXRlSGlkZGVuID09PSB0cnVlIHx8IGlzSW5zZXJ0YWJsZSA9PT0gZmFsc2UgfHwgc1RlbXBsYXRlVHlwZSA9PT0gXCJBbmFseXRpY2FsTGlzdFBhZ2VcIikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fSBlbHNlIGlmICghaXNMaXN0UmVwb3J0KSB7XG5cdFx0aWYgKGlzQ3JlYXRlSGlkZGVuKSB7XG5cdFx0XHRyZXR1cm4gXCJ7PSAhJHtcIiArIChuYXZpZ2F0aW9uUGF0aCA/IG5hdmlnYXRpb25QYXRoICsgXCIvXCIgOiBcIlwiKSArIGlzQ3JlYXRlSGlkZGVuLnBhdGggKyBcIn0gJiYgJHt1aT4vZWRpdE1vZGV9ID09PSAnRWRpdGFibGUnfVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJ7PSAke3VpPi9lZGl0TW9kZX0gPT09ICdFZGl0YWJsZSd9XCI7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbixcblx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/OiBQcmVzZW50YXRpb25WYXJpYW50VHlwZVR5cGVzXG4pOiBUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uIHtcblx0Ly8gTmVlZCB0byBnZXQgdGhlIHRhcmdldFxuXHRjb25zdCB7IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggfSA9IHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IHBhZ2VNYW5pZmVzdFNldHRpbmdzOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBlbnRpdHlOYW1lOiBzdHJpbmcgPSBlbnRpdHlTZXQubmFtZSxcblx0XHRpc0VudGl0eVNldDogYm9vbGVhbiA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID09PSAwLFxuXHRcdHAxM25Nb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0aWQgPSBUYWJsZUlEKGlzRW50aXR5U2V0ID8gZW50aXR5TmFtZSA6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIFwiTGluZUl0ZW1cIik7XG5cdGNvbnN0IHNlbGVjdGlvbk1vZGUgPSBnZXRTZWxlY3Rpb25Nb2RlKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGlzRW50aXR5U2V0KTtcblx0Y29uc3Qgc1RlbXBsYXRlVHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVDb252ZXJ0ZXJUeXBlKCk7XG5cdGNvbnN0IGlzQUxQID0gc1RlbXBsYXRlVHlwZSA9PT0gXCJBbmFseXRpY2FsTGlzdFBhZ2VcIjtcblx0Y29uc3QgaXNMaXN0UmVwb3J0ID0gc1RlbXBsYXRlVHlwZSA9PT0gXCJMaXN0UmVwb3J0XCI7XG5cdGNvbnN0IHRhcmdldENhcGFiaWxpdGllcyA9IGdldENhcGFiaWxpdHlSZXN0cmljdGlvbih2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGlzVGFyZ2V0RGVsZXRhYmxlID0gdGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlO1xuXHRsZXQgdGhyZXNob2xkID0gaXNFbnRpdHlTZXQgPyAzMCA6IDEwO1xuXHRpZiAocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24gJiYgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uTWF4SXRlbXMpIHtcblx0XHR0aHJlc2hvbGQgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5NYXhJdGVtcyBhcyBudW1iZXI7XG5cdH1cblxuXHRjb25zdCBuYXZpZ2F0aW9uT3JDb2xsZWN0aW9uTmFtZSA9IGlzRW50aXR5U2V0ID8gZW50aXR5TmFtZSA6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg7XG5cdGNvbnN0IG5hdmlnYXRpb25TZXR0aW5ncyA9IHBhZ2VNYW5pZmVzdFNldHRpbmdzLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25PckNvbGxlY3Rpb25OYW1lKTtcblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBpZCxcblx0XHRlbnRpdHlOYW1lOiBlbnRpdHlOYW1lLFxuXHRcdGNvbGxlY3Rpb246IFwiL1wiICsgZW50aXR5TmFtZSArICghaXNFbnRpdHlTZXQgPyBcIi9cIiArIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggOiBcIlwiKSxcblx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0XHRpc0VudGl0eVNldDogaXNFbnRpdHlTZXQsXG5cdFx0cm93OiBfZ2V0Um93Q29uZmlndXJhdGlvblByb3BlcnR5KFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdFx0bmF2aWdhdGlvbk9yQ29sbGVjdGlvbk5hbWVcblx0XHQpLFxuXHRcdHAxM25Nb2RlOiBwMTNuTW9kZSxcblx0XHRzaG93OiB7XG5cdFx0XHRcImRlbGV0ZVwiOiBnZXREZWxldGVWaXNpYmxlKGlzTGlzdFJlcG9ydCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgc1RlbXBsYXRlVHlwZSwgaXNUYXJnZXREZWxldGFibGUpLFxuXHRcdFx0Y3JlYXRlOiBnZXRDcmVhdGVWaXNpYmxlKGlzTGlzdFJlcG9ydCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgc1RlbXBsYXRlVHlwZSksXG5cdFx0XHR1cGRhdGU6IGdldFVwZGF0YWJsZShzVGVtcGxhdGVUeXBlKVxuXHRcdH0sXG5cdFx0Y3JlYXRlOiBfZ2V0Q3JlYXRpb25CZWhhdmlvdXIobGluZUl0ZW1Bbm5vdGF0aW9uLCB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKSxcblx0XHRzZWxlY3Rpb25Nb2RlOiBzZWxlY3Rpb25Nb2RlLFxuXHRcdGF1dG9CaW5kT25Jbml0OiAhaXNMaXN0UmVwb3J0ICYmICFpc0FMUCxcblx0XHRlbmFibGVDb250cm9sVk06IHBhZ2VNYW5pZmVzdFNldHRpbmdzLmdldFZhcmlhbnRNYW5hZ2VtZW50KCkgPT09IFwiQ29udHJvbFwiICYmICEhcDEzbk1vZGUsXG5cdFx0dGhyZXNob2xkOiB0aHJlc2hvbGRcblx0fTtcbn1cblxuZnVuY3Rpb24gZ2V0VXBkYXRhYmxlKHNUZW1wbGF0ZVR5cGU6IHN0cmluZykge1xuXHRpZiAoc1RlbXBsYXRlVHlwZSA9PT0gXCJBbmFseXRpY2FsTGlzdFBhZ2VcIiB8fCBzVGVtcGxhdGVUeXBlID09PSBcIkxpc3RSZXBvcnRcIikge1xuXHRcdHJldHVybiBcIkRpc3BsYXlcIjtcblx0fVxuXHQvLyB1cGRhdGFibGUgd2lsbCBiZSBoYW5kbGVkIGF0IHRoZSBwcm9wZXJ0eSBsZXZlbFxuXHRyZXR1cm4gXCJ7dWk+L2VkaXRNb2RlfVwiO1xufVxuLyoqXG4gKiBTcGxpdCB0aGUgdmlzdWFsaXphdGlvbiBwYXRoIGludG8gdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgcGF0aCBhbmQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEByZXR1cm5zIHtvYmplY3R9XG4gKi9cbmZ1bmN0aW9uIHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nKSB7XG5cdGxldCBbbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgYW5ub3RhdGlvblBhdGhdID0gdmlzdWFsaXphdGlvblBhdGguc3BsaXQoXCJAXCIpO1xuXG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA9PT0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKSB7XG5cdFx0Ly8gRHJvcCB0cmFpbGluZyBzbGFzaFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLnN1YnN0cigwLCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpO1xuXHR9XG5cdHJldHVybiB7IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGFubm90YXRpb25QYXRoIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbihcblx0c2VsZWN0aW9uVmFyaWFudFBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQge1xuXHRjb25zdCBzZWxlY3Rpb246IFNlbGVjdGlvblZhcmlhbnRUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzZWxlY3Rpb25WYXJpYW50UGF0aCkgYXMgU2VsZWN0aW9uVmFyaWFudFR5cGU7XG5cblx0aWYgKHNlbGVjdGlvbikge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0c2VsZWN0aW9uLlNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3QgUHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eU5hbWUudmFsdWU7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lcy5pbmRleE9mKFByb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdHByb3BlcnR5TmFtZXMucHVzaChQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBzZWxlY3Rpb24uVGV4dCBhcyBzdHJpbmcsXG5cdFx0XHRwcm9wZXJ0eU5hbWVzOiBwcm9wZXJ0eU5hbWVzXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24ge1xuXHRjb25zdCB0YWJsZU1hbmlmZXN0U2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgdGFibGVTZXR0aW5ncyA9IHRhYmxlTWFuaWZlc3RTZXR0aW5ncy50YWJsZVNldHRpbmdzO1xuXHRsZXQgcXVpY2tTZWxlY3Rpb25WYXJpYW50OiBhbnk7XG5cdGNvbnN0IHF1aWNrRmlsdGVyUGF0aHM6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9W10gPSBbXTtcblx0bGV0IGVuYWJsZUV4cG9ydCA9IHRydWU7XG5cdGxldCBjcmVhdGlvbk1vZGUgPSBDcmVhdGlvbk1vZGUuTmV3UGFnZTtcblx0bGV0IGZpbHRlcnM7XG5cdGxldCBlbmFibGVBdXRvU2Nyb2xsID0gZmFsc2U7XG5cdGxldCBjcmVhdGVBdEVuZCA9IHRydWU7XG5cdGxldCBkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhID0gZmFsc2U7XG5cdGxldCBoaWRlVGFibGVUaXRsZSA9IGZhbHNlO1xuXHRsZXQgdGFibGVUeXBlID0gXCJSZXNwb25zaXZlVGFibGVcIjtcblxuXHRpZiAodGFibGVTZXR0aW5ncyAmJiBsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZShsaW5lSXRlbUFubm90YXRpb24pO1xuXHRcdHRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8ucGF0aHM/LmZvckVhY2goKHBhdGg6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9KSA9PiB7XG5cdFx0XHRxdWlja1NlbGVjdGlvblZhcmlhbnQgPSB0YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKFwiQFwiICsgcGF0aC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHQvLyBxdWlja1NlbGVjdGlvblZhcmlhbnQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0aWYgKHF1aWNrU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRxdWlja0ZpbHRlclBhdGhzLnB1c2goeyBhbm5vdGF0aW9uUGF0aDogcGF0aC5hbm5vdGF0aW9uUGF0aCB9KTtcblx0XHRcdH1cblx0XHRcdGZpbHRlcnMgPSB7XG5cdFx0XHRcdHF1aWNrRmlsdGVyczoge1xuXHRcdFx0XHRcdHNob3dDb3VudHM6IHRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uc2hvd0NvdW50cyxcblx0XHRcdFx0XHRwYXRoczogcXVpY2tGaWx0ZXJQYXRoc1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdFx0ZW5hYmxlRXhwb3J0ID0gdGFibGVTZXR0aW5ncy5lbmFibGVFeHBvcnQgIT09IHVuZGVmaW5lZCA/IHRhYmxlU2V0dGluZ3MuZW5hYmxlRXhwb3J0IDogdHJ1ZTtcblx0XHRjcmVhdGlvbk1vZGUgPSB0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8ubmFtZSB8fCBjcmVhdGlvbk1vZGU7XG5cdFx0ZW5hYmxlQXV0b1Njcm9sbCA9IHRhYmxlU2V0dGluZ3MuZW5hYmxlQXV0b1Njcm9sbDtcblx0XHRjcmVhdGVBdEVuZCA9IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkID8gdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmNyZWF0ZUF0RW5kIDogdHJ1ZTtcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhID0gISF0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YTtcblx0XHRoaWRlVGFibGVUaXRsZSA9ICEhdGFibGVTZXR0aW5ncy5xdWlja1ZhcmlhbnRTZWxlY3Rpb24/LmhpZGVUYWJsZVRpdGxlO1xuXHRcdHRhYmxlVHlwZSA9IHRhYmxlU2V0dGluZ3MudHlwZTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGVuYWJsZUF1dG9TY3JvbGw6IGVuYWJsZUF1dG9TY3JvbGwsXG5cdFx0ZmlsdGVyczogZmlsdGVycyxcblx0XHR0eXBlOiB0YWJsZVR5cGUsXG5cdFx0aGVhZGVyVmlzaWJsZTogIShxdWlja1NlbGVjdGlvblZhcmlhbnQgJiYgaGlkZVRhYmxlVGl0bGUpLFxuXHRcdGVuYWJsZUV4cG9ydDogZW5hYmxlRXhwb3J0LFxuXHRcdGNyZWF0aW9uTW9kZTogY3JlYXRpb25Nb2RlLFxuXHRcdGNyZWF0ZUF0RW5kOiBjcmVhdGVBdEVuZCxcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhOiBkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhXG5cdH07XG59XG4iXX0=