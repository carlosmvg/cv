sap.ui.define(["../../ManifestSettings", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/annotations/DataField", "../../helpers/ID", "sap/fe/core/converters/helpers/ConfigurableObject"], function (ManifestSettings, Action, DataField, ID, ConfigurableObject) {
  "use strict";

  var _exports = {};
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var FilterBarID = ID.FilterBarID;
  var ChartID = ID.ChartID;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var ActionType = ManifestSettings.ActionType;
  var VisualizationType = ManifestSettings.VisualizationType;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  /**
   * Method to retrieve all chart actions from annotations.
   *
   * @param chartAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns {BaseAction[]} the table annotation actions
   */
  function getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext) {
    var chartActions = [];

    if (chartAnnotation) {
      var absolutePath = converterContext.getAbsoluteAnnotationPath(visualizationPath);
      var aActions = chartAnnotation.Actions || [];
      aActions.forEach(function (dataField, index) {
        var _dataField$annotation, _dataField$annotation2;

        var chartAction;

        if (isDataFieldForActionAbstract(dataField) && !(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden) === true) && !dataField.Inline && !dataField.Determining) {
          var annotationPath = absolutePath + "/Actions/" + index;

          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              chartAction = {
                type: ActionType.DataFieldForAction,
                annotationPath: annotationPath,
                key: "DataFieldForAction::" + dataField.Action.replace(/\//g, "::")
              };
              break;

            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              chartAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: annotationPath,
                key: "DataFieldForIntentBasedNavigation::" + dataField.SemanticObject + "::" + dataField.Action + (dataField.RequiresContext ? "::RequiresContext" : "")
              };
              break;
          }
        }

        if (chartAction) {
          chartActions.push(chartAction);
        }
      });
    }

    return chartActions;
  }

  function getChartActions(chartAnnotation, visualizationPath, converterContext) {
    return insertCustomElements(getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext), getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions), {
      enableOnSelect: "overwrite"
    });
  }

  _exports.getChartActions = getChartActions;

  function getP13nMode(visualizationPath, converterContext) {
    var _chartManifestSetting;

    var manifestWrapper = converterContext.getManifestWrapper();
    var chartManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var hasVariantManagement = ["Page", "Control"].indexOf(manifestWrapper.getVariantManagement()) > -1;
    var personalization = true;
    var aPersonalization = [];

    if ((chartManifestSettings === null || chartManifestSettings === void 0 ? void 0 : (_chartManifestSetting = chartManifestSettings.chartSettings) === null || _chartManifestSetting === void 0 ? void 0 : _chartManifestSetting.personalization) !== undefined) {
      personalization = chartManifestSettings.chartSettings.personalization;
    }

    if (hasVariantManagement && personalization) {
      if (personalization === true) {
        return "Sort,Type,Item";
      } else if (typeof personalization === "object") {
        if (personalization.type) {
          aPersonalization.push("Type");
        }

        if (personalization.item) {
          aPersonalization.push("Item");
        }

        if (personalization.sort) {
          aPersonalization.push("Sort");
        }

        return aPersonalization.join(",");
      }
    }

    return undefined;
  }
  /**
   * Create the ChartVisualization configuration that will be used to display a chart via Chart Macro.
   *
   * @param {ChartDefinitionTypeTypes} chartAnnotation the target chart annotation
   * @param {string} visualizationPath the current visualization annotation path
   * @param {ConverterContext} converterContext the converter context
   * @returns {ChartVisualization} the chart visualization based on the annotation
   */


  _exports.getP13nMode = getP13nMode;

  function createChartVisualization(chartAnnotation, visualizationPath, converterContext) {
    var chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);

    var _visualizationPath$sp = visualizationPath.split("@"),
        _visualizationPath$sp2 = _slicedToArray(_visualizationPath$sp, 1),
        navigationPropertyPath
    /*, annotationPath*/
    = _visualizationPath$sp2[0];

    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }

    var entitySet = converterContext.getEntitySet();
    var isEntitySet = navigationPropertyPath.length === 0;
    var entityName = isEntitySet ? entitySet.name : entitySet.navigationPropertyBinding[navigationPropertyPath].name;
    var sFilterbarId = isEntitySet ? FilterBarID(entityName) : undefined;
    var oVizProperties = {
      "legendGroup": {
        "layout": {
          "position": "bottom"
        }
      }
    };
    return {
      type: VisualizationType.Chart,
      id: ChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
      collection: "/" + entitySet.name + (!isEntitySet ? "/" + navigationPropertyPath : ""),
      entityName: entityName,
      p13nMode: getP13nMode(visualizationPath, converterContext),
      navigationPath: navigationPropertyPath,
      annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
      filterId: sFilterbarId,
      vizProperties: JSON.stringify(oVizProperties),
      actions: chartActions
    };
  }

  _exports.createChartVisualization = createChartVisualization;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoYXJ0LnRzIl0sIm5hbWVzIjpbImdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyIsImNoYXJ0QW5ub3RhdGlvbiIsInZpc3VhbGl6YXRpb25QYXRoIiwiY29udmVydGVyQ29udGV4dCIsImNoYXJ0QWN0aW9ucyIsImFic29sdXRlUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJhQWN0aW9ucyIsIkFjdGlvbnMiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiaW5kZXgiLCJjaGFydEFjdGlvbiIsImlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QiLCJhbm5vdGF0aW9ucyIsIlVJIiwiSGlkZGVuIiwiSW5saW5lIiwiRGV0ZXJtaW5pbmciLCJhbm5vdGF0aW9uUGF0aCIsIiRUeXBlIiwidHlwZSIsIkFjdGlvblR5cGUiLCJEYXRhRmllbGRGb3JBY3Rpb24iLCJrZXkiLCJBY3Rpb24iLCJyZXBsYWNlIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiU2VtYW50aWNPYmplY3QiLCJSZXF1aXJlc0NvbnRleHQiLCJwdXNoIiwiZ2V0Q2hhcnRBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwiZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbiIsImFjdGlvbnMiLCJlbmFibGVPblNlbGVjdCIsImdldFAxM25Nb2RlIiwibWFuaWZlc3RXcmFwcGVyIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiY2hhcnRNYW5pZmVzdFNldHRpbmdzIiwiaGFzVmFyaWFudE1hbmFnZW1lbnQiLCJpbmRleE9mIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJwZXJzb25hbGl6YXRpb24iLCJhUGVyc29uYWxpemF0aW9uIiwiY2hhcnRTZXR0aW5ncyIsInVuZGVmaW5lZCIsIml0ZW0iLCJzb3J0Iiwiam9pbiIsImNyZWF0ZUNoYXJ0VmlzdWFsaXphdGlvbiIsInNwbGl0IiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImxhc3RJbmRleE9mIiwibGVuZ3RoIiwic3Vic3RyIiwiZW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0IiwiaXNFbnRpdHlTZXQiLCJlbnRpdHlOYW1lIiwibmFtZSIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJzRmlsdGVyYmFySWQiLCJGaWx0ZXJCYXJJRCIsIm9WaXpQcm9wZXJ0aWVzIiwiVmlzdWFsaXphdGlvblR5cGUiLCJDaGFydCIsImlkIiwiQ2hhcnRJRCIsImNvbGxlY3Rpb24iLCJwMTNuTW9kZSIsIm5hdmlnYXRpb25QYXRoIiwiZmlsdGVySWQiLCJ2aXpQcm9wZXJ0aWVzIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEJBOzs7Ozs7OztBQVFBLFdBQVNBLDhCQUFULENBQ0NDLGVBREQsRUFFQ0MsaUJBRkQsRUFHQ0MsZ0JBSEQsRUFJZ0I7QUFDZixRQUFNQyxZQUEwQixHQUFHLEVBQW5DOztBQUNBLFFBQUlILGVBQUosRUFBcUI7QUFDcEIsVUFBTUksWUFBWSxHQUFHRixnQkFBZ0IsQ0FBQ0cseUJBQWpCLENBQTJDSixpQkFBM0MsQ0FBckI7QUFDQSxVQUFNSyxRQUFRLEdBQUdOLGVBQWUsQ0FBQ08sT0FBaEIsSUFBMkIsRUFBNUM7QUFDQUQsTUFBQUEsUUFBUSxDQUFDRSxPQUFULENBQWlCLFVBQUNDLFNBQUQsRUFBb0NDLEtBQXBDLEVBQThDO0FBQUE7O0FBQzlELFlBQUlDLFdBQUo7O0FBQ0EsWUFDQ0MsNEJBQTRCLENBQUNILFNBQUQsQ0FBNUIsSUFDQSxFQUFFLDBCQUFBQSxTQUFTLENBQUNJLFdBQVYsMEdBQXVCQyxFQUF2QixrRkFBMkJDLE1BQTNCLE1BQXNDLElBQXhDLENBREEsSUFFQSxDQUFDTixTQUFTLENBQUNPLE1BRlgsSUFHQSxDQUFDUCxTQUFTLENBQUNRLFdBSlosRUFLRTtBQUNELGNBQU1DLGNBQWMsR0FBR2QsWUFBWSxHQUFHLFdBQWYsR0FBNkJNLEtBQXBEOztBQUNBLGtCQUFRRCxTQUFTLENBQUNVLEtBQWxCO0FBQ0MsaUJBQUssK0NBQUw7QUFDQ1IsY0FBQUEsV0FBVyxHQUFHO0FBQ2JTLGdCQUFBQSxJQUFJLEVBQUVDLFVBQVUsQ0FBQ0Msa0JBREo7QUFFYkosZ0JBQUFBLGNBQWMsRUFBRUEsY0FGSDtBQUdiSyxnQkFBQUEsR0FBRyxFQUFFLHlCQUF5QmQsU0FBUyxDQUFDZSxNQUFWLENBQWlCQyxPQUFqQixDQUF5QixLQUF6QixFQUFnQyxJQUFoQztBQUhqQixlQUFkO0FBS0E7O0FBRUQsaUJBQUssOERBQUw7QUFDQ2QsY0FBQUEsV0FBVyxHQUFHO0FBQ2JTLGdCQUFBQSxJQUFJLEVBQUVDLFVBQVUsQ0FBQ0ssaUNBREo7QUFFYlIsZ0JBQUFBLGNBQWMsRUFBRUEsY0FGSDtBQUdiSyxnQkFBQUEsR0FBRyxFQUNGLHdDQUNBZCxTQUFTLENBQUNrQixjQURWLEdBRUEsSUFGQSxHQUdBbEIsU0FBUyxDQUFDZSxNQUhWLElBSUNmLFNBQVMsQ0FBQ21CLGVBQVYsR0FBNEIsbUJBQTVCLEdBQWtELEVBSm5EO0FBSlksZUFBZDtBQVVBO0FBcEJGO0FBc0JBOztBQUNELFlBQUlqQixXQUFKLEVBQWlCO0FBQ2hCUixVQUFBQSxZQUFZLENBQUMwQixJQUFiLENBQWtCbEIsV0FBbEI7QUFDQTtBQUNELE9BbkNEO0FBb0NBOztBQUNELFdBQU9SLFlBQVA7QUFDQTs7QUFFTSxXQUFTMkIsZUFBVCxDQUNOOUIsZUFETSxFQUVOQyxpQkFGTSxFQUdOQyxnQkFITSxFQUlTO0FBQ2YsV0FBTzZCLG9CQUFvQixDQUMxQmhDLDhCQUE4QixDQUFDQyxlQUFELEVBQWtCQyxpQkFBbEIsRUFBcUNDLGdCQUFyQyxDQURKLEVBRTFCOEIsc0JBQXNCLENBQUM5QixnQkFBZ0IsQ0FBQytCLCtCQUFqQixDQUFpRGhDLGlCQUFqRCxFQUFvRWlDLE9BQXJFLENBRkksRUFHMUI7QUFBRUMsTUFBQUEsY0FBYyxFQUFFO0FBQWxCLEtBSDBCLENBQTNCO0FBS0E7Ozs7QUFFTSxXQUFTQyxXQUFULENBQXFCbkMsaUJBQXJCLEVBQWdEQyxnQkFBaEQsRUFBd0c7QUFBQTs7QUFDOUcsUUFBTW1DLGVBQWdDLEdBQUduQyxnQkFBZ0IsQ0FBQ29DLGtCQUFqQixFQUF6QztBQUNBLFFBQU1DLHFCQUFpRCxHQUFHckMsZ0JBQWdCLENBQUMrQiwrQkFBakIsQ0FBaURoQyxpQkFBakQsQ0FBMUQ7QUFDQSxRQUFNdUMsb0JBQTZCLEdBQUcsQ0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQkMsT0FBcEIsQ0FBNEJKLGVBQWUsQ0FBQ0ssb0JBQWhCLEVBQTVCLElBQXNFLENBQUMsQ0FBN0c7QUFDQSxRQUFJQyxlQUFxRCxHQUFHLElBQTVEO0FBQ0EsUUFBTUMsZ0JBQTBCLEdBQUcsRUFBbkM7O0FBQ0EsUUFBSSxDQUFBTCxxQkFBcUIsU0FBckIsSUFBQUEscUJBQXFCLFdBQXJCLHFDQUFBQSxxQkFBcUIsQ0FBRU0sYUFBdkIsZ0ZBQXNDRixlQUF0QyxNQUEwREcsU0FBOUQsRUFBeUU7QUFDeEVILE1BQUFBLGVBQWUsR0FBR0oscUJBQXFCLENBQUNNLGFBQXRCLENBQW9DRixlQUF0RDtBQUNBOztBQUNELFFBQUlILG9CQUFvQixJQUFJRyxlQUE1QixFQUE2QztBQUM1QyxVQUFJQSxlQUFlLEtBQUssSUFBeEIsRUFBOEI7QUFDN0IsZUFBTyxnQkFBUDtBQUNBLE9BRkQsTUFFTyxJQUFJLE9BQU9BLGVBQVAsS0FBMkIsUUFBL0IsRUFBeUM7QUFDL0MsWUFBSUEsZUFBZSxDQUFDdkIsSUFBcEIsRUFBMEI7QUFDekJ3QixVQUFBQSxnQkFBZ0IsQ0FBQ2YsSUFBakIsQ0FBc0IsTUFBdEI7QUFDQTs7QUFDRCxZQUFJYyxlQUFlLENBQUNJLElBQXBCLEVBQTBCO0FBQ3pCSCxVQUFBQSxnQkFBZ0IsQ0FBQ2YsSUFBakIsQ0FBc0IsTUFBdEI7QUFDQTs7QUFDRCxZQUFJYyxlQUFlLENBQUNLLElBQXBCLEVBQTBCO0FBQ3pCSixVQUFBQSxnQkFBZ0IsQ0FBQ2YsSUFBakIsQ0FBc0IsTUFBdEI7QUFDQTs7QUFDRCxlQUFPZSxnQkFBZ0IsQ0FBQ0ssSUFBakIsQ0FBc0IsR0FBdEIsQ0FBUDtBQUNBO0FBQ0Q7O0FBQ0QsV0FBT0gsU0FBUDtBQUNBO0FBRUQ7Ozs7Ozs7Ozs7OztBQVFPLFdBQVNJLHdCQUFULENBQ05sRCxlQURNLEVBRU5DLGlCQUZNLEVBR05DLGdCQUhNLEVBSWU7QUFDckIsUUFBTUMsWUFBWSxHQUFHMkIsZUFBZSxDQUFDOUIsZUFBRCxFQUFrQkMsaUJBQWxCLEVBQXFDQyxnQkFBckMsQ0FBcEM7O0FBRHFCLGdDQUUrQkQsaUJBQWlCLENBQUNrRCxLQUFsQixDQUF3QixHQUF4QixDQUYvQjtBQUFBO0FBQUEsUUFFaEJDO0FBQXVCO0FBRlA7O0FBR3JCLFFBQUlBLHNCQUFzQixDQUFDQyxXQUF2QixDQUFtQyxHQUFuQyxNQUE0Q0Qsc0JBQXNCLENBQUNFLE1BQXZCLEdBQWdDLENBQWhGLEVBQW1GO0FBQ2xGO0FBQ0FGLE1BQUFBLHNCQUFzQixHQUFHQSxzQkFBc0IsQ0FBQ0csTUFBdkIsQ0FBOEIsQ0FBOUIsRUFBaUNILHNCQUFzQixDQUFDRSxNQUF2QixHQUFnQyxDQUFqRSxDQUF6QjtBQUNBOztBQUNELFFBQU1FLFNBQVMsR0FBR3RELGdCQUFnQixDQUFDdUQsWUFBakIsRUFBbEI7QUFDQSxRQUFNQyxXQUFvQixHQUFHTixzQkFBc0IsQ0FBQ0UsTUFBdkIsS0FBa0MsQ0FBL0Q7QUFDQSxRQUFNSyxVQUFrQixHQUFHRCxXQUFXLEdBQUdGLFNBQVMsQ0FBQ0ksSUFBYixHQUFvQkosU0FBUyxDQUFDSyx5QkFBVixDQUFvQ1Qsc0JBQXBDLEVBQTREUSxJQUF0SDtBQUNBLFFBQU1FLFlBQVksR0FBR0osV0FBVyxHQUFHSyxXQUFXLENBQUNKLFVBQUQsQ0FBZCxHQUE2QmIsU0FBN0Q7QUFDQSxRQUFNa0IsY0FBYyxHQUFHO0FBQ3RCLHFCQUFlO0FBQ2Qsa0JBQVU7QUFDVCxzQkFBWTtBQURIO0FBREk7QUFETyxLQUF2QjtBQU9BLFdBQU87QUFDTjVDLE1BQUFBLElBQUksRUFBRTZDLGlCQUFpQixDQUFDQyxLQURsQjtBQUVOQyxNQUFBQSxFQUFFLEVBQUVDLE9BQU8sQ0FBQ1YsV0FBVyxHQUFHQyxVQUFILEdBQWdCUCxzQkFBNUIsRUFBb0RhLGlCQUFpQixDQUFDQyxLQUF0RSxDQUZMO0FBR05HLE1BQUFBLFVBQVUsRUFBRSxNQUFNYixTQUFTLENBQUNJLElBQWhCLElBQXdCLENBQUNGLFdBQUQsR0FBZSxNQUFNTixzQkFBckIsR0FBOEMsRUFBdEUsQ0FITjtBQUlOTyxNQUFBQSxVQUFVLEVBQUVBLFVBSk47QUFLTlcsTUFBQUEsUUFBUSxFQUFFbEMsV0FBVyxDQUFDbkMsaUJBQUQsRUFBb0JDLGdCQUFwQixDQUxmO0FBTU5xRSxNQUFBQSxjQUFjLEVBQUVuQixzQkFOVjtBQU9ObEMsTUFBQUEsY0FBYyxFQUFFaEIsZ0JBQWdCLENBQUNHLHlCQUFqQixDQUEyQ0osaUJBQTNDLENBUFY7QUFRTnVFLE1BQUFBLFFBQVEsRUFBRVYsWUFSSjtBQVNOVyxNQUFBQSxhQUFhLEVBQUVDLElBQUksQ0FBQ0MsU0FBTCxDQUFlWCxjQUFmLENBVFQ7QUFVTjlCLE1BQUFBLE9BQU8sRUFBRS9CO0FBVkgsS0FBUDtBQVlBIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb252ZXJ0ZXJDb250ZXh0IH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy9CYXNlQ29udmVydGVyXCI7XG5pbXBvcnQge1xuXHRDaGFydE1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0Q2hhcnRQZXJzb25hbGl6YXRpb25NYW5pZmVzdFNldHRpbmdzLFxuXHRNYW5pZmVzdFdyYXBwZXIsXG5cdFZpc3VhbGl6YXRpb25UeXBlLFxuXHRBY3Rpb25UeXBlXG59IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBDaGFydERlZmluaXRpb25UeXBlVHlwZXMsIERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEFubm90YXRpb25BY3Rpb24sIEJhc2VBY3Rpb24sIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgeyBDaGFydElELCBGaWx0ZXJCYXJJRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5cbi8qKlxuICogQHR5cGVkZWYgQ2hhcnRWaXN1YWxpemF0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIENoYXJ0VmlzdWFsaXphdGlvbiA9IHtcblx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQ7XG5cdGlkOiBzdHJpbmc7XG5cdGNvbGxlY3Rpb246IHN0cmluZztcblx0ZW50aXR5TmFtZTogc3RyaW5nO1xuXHRwMTNuTW9kZT86IHN0cmluZztcblx0bmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdHZpelByb3BlcnRpZXM6IHN0cmluZztcblx0YWN0aW9uczogQmFzZUFjdGlvbltdO1xufTtcblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIGNoYXJ0IGFjdGlvbnMgZnJvbSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY2hhcnRBbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyB7QmFzZUFjdGlvbltdfSB0aGUgdGFibGUgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhcblx0Y2hhcnRBbm5vdGF0aW9uOiBDaGFydERlZmluaXRpb25UeXBlVHlwZXMsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEJhc2VBY3Rpb25bXSB7XG5cdGNvbnN0IGNoYXJ0QWN0aW9uczogQmFzZUFjdGlvbltdID0gW107XG5cdGlmIChjaGFydEFubm90YXRpb24pIHtcblx0XHRjb25zdCBhYnNvbHV0ZVBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgodmlzdWFsaXphdGlvblBhdGgpO1xuXHRcdGNvbnN0IGFBY3Rpb25zID0gY2hhcnRBbm5vdGF0aW9uLkFjdGlvbnMgfHwgW107XG5cdFx0YUFjdGlvbnMuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBpbmRleCkgPT4ge1xuXHRcdFx0bGV0IGNoYXJ0QWN0aW9uOiBBbm5vdGF0aW9uQWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0KGRhdGFGaWVsZCkgJiZcblx0XHRcdFx0IShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gPT09IHRydWUpICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuSW5saW5lICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuRGV0ZXJtaW5pbmdcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGFic29sdXRlUGF0aCArIFwiL0FjdGlvbnMvXCIgKyBpbmRleDtcblx0XHRcdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCI6XG5cdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0a2V5OiBcIkRhdGFGaWVsZEZvckFjdGlvbjo6XCIgKyBkYXRhRmllbGQuQWN0aW9uLnJlcGxhY2UoL1xcLy9nLCBcIjo6XCIpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0a2V5OlxuXHRcdFx0XHRcdFx0XHRcdFwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOjpcIiArXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0ICtcblx0XHRcdFx0XHRcdFx0XHRcIjo6XCIgK1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24gK1xuXHRcdFx0XHRcdFx0XHRcdChkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0ID8gXCI6OlJlcXVpcmVzQ29udGV4dFwiIDogXCJcIilcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGNoYXJ0QWN0aW9uKSB7XG5cdFx0XHRcdGNoYXJ0QWN0aW9ucy5wdXNoKGNoYXJ0QWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gY2hhcnRBY3Rpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hhcnRBY3Rpb25zKFxuXHRjaGFydEFubm90YXRpb246IENoYXJ0RGVmaW5pdGlvblR5cGVUeXBlcyxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQmFzZUFjdGlvbltdIHtcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKFxuXHRcdGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuYWN0aW9ucyksXG5cdFx0eyBlbmFibGVPblNlbGVjdDogXCJvdmVyd3JpdGVcIiB9XG5cdCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCBjaGFydE1hbmlmZXN0U2V0dGluZ3M6IENoYXJ0TWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgaGFzVmFyaWFudE1hbmFnZW1lbnQ6IGJvb2xlYW4gPSBbXCJQYWdlXCIsIFwiQ29udHJvbFwiXS5pbmRleE9mKG1hbmlmZXN0V3JhcHBlci5nZXRWYXJpYW50TWFuYWdlbWVudCgpKSA+IC0xO1xuXHRsZXQgcGVyc29uYWxpemF0aW9uOiBDaGFydFBlcnNvbmFsaXphdGlvbk1hbmlmZXN0U2V0dGluZ3MgPSB0cnVlO1xuXHRjb25zdCBhUGVyc29uYWxpemF0aW9uOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAoY2hhcnRNYW5pZmVzdFNldHRpbmdzPy5jaGFydFNldHRpbmdzPy5wZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdHBlcnNvbmFsaXphdGlvbiA9IGNoYXJ0TWFuaWZlc3RTZXR0aW5ncy5jaGFydFNldHRpbmdzLnBlcnNvbmFsaXphdGlvbjtcblx0fVxuXHRpZiAoaGFzVmFyaWFudE1hbmFnZW1lbnQgJiYgcGVyc29uYWxpemF0aW9uKSB7XG5cdFx0aWYgKHBlcnNvbmFsaXphdGlvbiA9PT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIFwiU29ydCxUeXBlLEl0ZW1cIjtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24udHlwZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJUeXBlXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5pdGVtKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkl0ZW1cIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLnNvcnQpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhUGVyc29uYWxpemF0aW9uLmpvaW4oXCIsXCIpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIENyZWF0ZSB0aGUgQ2hhcnRWaXN1YWxpemF0aW9uIGNvbmZpZ3VyYXRpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGlzcGxheSBhIGNoYXJ0IHZpYSBDaGFydCBNYWNyby5cbiAqXG4gKiBAcGFyYW0ge0NoYXJ0RGVmaW5pdGlvblR5cGVUeXBlc30gY2hhcnRBbm5vdGF0aW9uIHRoZSB0YXJnZXQgY2hhcnQgYW5ub3RhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHZpc3VhbGl6YXRpb25QYXRoIHRoZSBjdXJyZW50IHZpc3VhbGl6YXRpb24gYW5ub3RhdGlvbiBwYXRoXG4gKiBAcGFyYW0ge0NvbnZlcnRlckNvbnRleHR9IGNvbnZlcnRlckNvbnRleHQgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyB7Q2hhcnRWaXN1YWxpemF0aW9ufSB0aGUgY2hhcnQgdmlzdWFsaXphdGlvbiBiYXNlZCBvbiB0aGUgYW5ub3RhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uKFxuXHRjaGFydEFubm90YXRpb246IENoYXJ0RGVmaW5pdGlvblR5cGVUeXBlcyxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ2hhcnRWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgY2hhcnRBY3Rpb25zID0gZ2V0Q2hhcnRBY3Rpb25zKGNoYXJ0QW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRsZXQgW25hdmlnYXRpb25Qcm9wZXJ0eVBhdGggLyosIGFubm90YXRpb25QYXRoKi9dID0gdmlzdWFsaXphdGlvblBhdGguc3BsaXQoXCJAXCIpO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPT09IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSkge1xuXHRcdC8vIERyb3AgdHJhaWxpbmcgc2xhc2hcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zdWJzdHIoMCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKTtcblx0fVxuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBpc0VudGl0eVNldDogYm9vbGVhbiA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID09PSAwO1xuXHRjb25zdCBlbnRpdHlOYW1lOiBzdHJpbmcgPSBpc0VudGl0eVNldCA/IGVudGl0eVNldC5uYW1lIDogZW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2aWdhdGlvblByb3BlcnR5UGF0aF0ubmFtZTtcblx0Y29uc3Qgc0ZpbHRlcmJhcklkID0gaXNFbnRpdHlTZXQgPyBGaWx0ZXJCYXJJRChlbnRpdHlOYW1lKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb1ZpelByb3BlcnRpZXMgPSB7XG5cdFx0XCJsZWdlbmRHcm91cFwiOiB7XG5cdFx0XHRcImxheW91dFwiOiB7XG5cdFx0XHRcdFwicG9zaXRpb25cIjogXCJib3R0b21cIlxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0cmV0dXJuIHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCxcblx0XHRpZDogQ2hhcnRJRChpc0VudGl0eVNldCA/IGVudGl0eU5hbWUgOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCksXG5cdFx0Y29sbGVjdGlvbjogXCIvXCIgKyBlbnRpdHlTZXQubmFtZSArICghaXNFbnRpdHlTZXQgPyBcIi9cIiArIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggOiBcIlwiKSxcblx0XHRlbnRpdHlOYW1lOiBlbnRpdHlOYW1lLFxuXHRcdHAxM25Nb2RlOiBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0bmF2aWdhdGlvblBhdGg6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCh2aXN1YWxpemF0aW9uUGF0aCksXG5cdFx0ZmlsdGVySWQ6IHNGaWx0ZXJiYXJJZCxcblx0XHR2aXpQcm9wZXJ0aWVzOiBKU09OLnN0cmluZ2lmeShvVml6UHJvcGVydGllcyksXG5cdFx0YWN0aW9uczogY2hhcnRBY3Rpb25zXG5cdH07XG59XG4iXX0=