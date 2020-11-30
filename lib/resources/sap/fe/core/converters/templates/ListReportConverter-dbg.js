sap.ui.define(["../ManifestSettings", "../controls/Common/DataVisualization", "../helpers/ID", "sap/fe/core/converters/controls/Common/Table", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject"], function (ManifestSettings, DataVisualization, ID, Table, Action, ConfigurableObject) {
  "use strict";

  var _exports = {};
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var getSelectionVariantConfiguration = Table.getSelectionVariantConfiguration;
  var TableID = ID.TableID;
  var FilterVariantManagementID = ID.FilterVariantManagementID;
  var FilterBarID = ID.FilterBarID;
  var getDefaultPresentationVariant = DataVisualization.getDefaultPresentationVariant;
  var getDefaultChart = DataVisualization.getDefaultChart;
  var getDefaultLineItem = DataVisualization.getDefaultLineItem;
  var isPresentationALPCompliant = DataVisualization.isPresentationALPCompliant;
  var isPresentationCompliant = DataVisualization.isPresentationCompliant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var VisualizationType = ManifestSettings.VisualizationType;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  /**
   * Retrieve the configuration for the selection fields that will be used within the filter bar
   * This configuration takes into account annotation and the selection variants.
   *
   * @param entityType
   * @param selectionVariants
   * @param converterContext
   * @returns {FilterSelectionField[]} an array of selection fields
   */
  var getSelectionFields = function (entityType, selectionVariants, converterContext) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;

    var selectionFields = [];
    var oSelectionVariantFields = {};
    selectionVariants.forEach(function (selectionVariant) {
      selectionVariant.propertyNames.forEach(function (propertyName) {
        if (!oSelectionVariantFields[propertyName]) {
          oSelectionVariantFields[propertyName] = true;
        }
      });
    });
    (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.SelectionFields) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.forEach(function (selection) {
      var selectionFieldValue = selection.value;

      if (!oSelectionVariantFields[selectionFieldValue]) {
        selectionFields.push({
          readablePath: selectionFieldValue,
          templatingPath: converterContext.getEntitySetBasedAnnotationPath(selection.fullyQualifiedName + "/$PropertyPath")
        });
      }
    });
    return selectionFields;
  };
  /**
   * Find a visualization annotation that can be used for rendering the list report.
   *
   * @param entityType
   * @returns {LineItem | PresentationVariantTypeTypes | undefined} one compliant annotation for rendering the list report
   */


  _exports.getSelectionFields = getSelectionFields;

  function getCompliantVisualizationAnnotation(entityType) {
    var presentationVariant = getDefaultPresentationVariant(entityType);

    if (presentationVariant) {
      if (isPresentationCompliant(presentationVariant)) {
        return presentationVariant;
      }
    }

    var defaultLineItem = getDefaultLineItem(entityType);

    if (defaultLineItem) {
      return defaultLineItem;
    }

    return undefined;
  }

  var getView = function (viewConfiguration, entityType, converterContext) {
    var presentation = getDataVisualizationConfiguration({
      annotation: viewConfiguration.annotation,
      path: viewConfiguration.annotation ? converterContext.getRelativeAnnotationPath(viewConfiguration.annotation.fullyQualifiedName, entityType) : ""
    }, converterContext);
    var tableControlId = "";
    var chartControlId = "";
    var title = "";
    var selectionVariantPath = "";

    var isMultipleViewConfiguration = function (config) {
      return config.key !== undefined;
    };

    var config = viewConfiguration;

    if (isMultipleViewConfiguration(config)) {
      // key exists only on multi tables mode
      var viewAnnotation = converterContext.getEntityTypeAnnotation(config.annotationPath);
      title = converterContext.getBindingExpression(viewAnnotation.Text) || "";
      /**
       * Need to loop on views and more precisely to table into views since
       * multi table mode get specific configuation (hidden filters or Table Id)
       */

      presentation.visualizations.forEach(function (visualizationDefinition, index) {
        switch (visualizationDefinition.type) {
          case VisualizationType.Table:
            var tableVisualization = presentation.visualizations[index];
            var filters = tableVisualization.control.filters || {};
            filters.hiddenFilters = filters.hiddenFilters || {
              paths: []
            };

            if (!config.keepPreviousPresonalization) {
              // Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
              tableVisualization.annotation.id = TableID(config.key, "LineItem");
            }

            if (viewConfiguration && viewConfiguration.annotation && viewConfiguration.annotation.term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
              selectionVariantPath = viewConfiguration.annotation.SelectionVariant.fullyQualifiedName.split("@")[1];
            } else {
              selectionVariantPath = config.annotationPath;
            }
            /**
             * Provide Selection Variant to hiddenFilters in order to set the SV filters to the table
             * MDC Table override Obinding Fitler and from SAP FE the only method where we are able to add
             * additionnal filter is 'rebindTable' into Table delegate
             * In order to avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related
             * to the Tab (multi table mode) can be passed to macro table via parameter/context named fitlers
             * and key hiddenFilters
             */


            filters.hiddenFilters.paths.push({
              annotationPath: selectionVariantPath
            });
            tableVisualization.control.filters = filters;
            break;

          case VisualizationType.Chart:
            // Not currently managed
            break;

          default:
            break;
        }
      });
    }

    presentation.visualizations.forEach(function (visualizationDefinition) {
      if (visualizationDefinition.type === VisualizationType.Table) {
        tableControlId = visualizationDefinition.annotation.id;
      } else if (visualizationDefinition.type === VisualizationType.Chart) {
        chartControlId = visualizationDefinition.id;
      }
    });
    return {
      presentation: presentation,
      tableControlId: tableControlId,
      chartControlId: chartControlId,
      title: title,
      selectionVariantPath: selectionVariantPath
    };
  };

  var getViews = function (entityType, converterContext, settingsViews) {
    var viewConfigs = [];

    if (settingsViews) {
      settingsViews.paths.forEach(function (path, index) {
        var targetAnnotation = converterContext.getEntityTypeAnnotation(path.annotationPath);

        if (targetAnnotation) {
          var annotation = targetAnnotation.term === "com.sap.vocabularies.UI.v1.SelectionVariant" ? getDefaultLineItem(entityType) : targetAnnotation;
          viewConfigs.push(_objectSpread({
            annotation: annotation
          }, settingsViews.paths[index]));
        }
      });
    } else {
      if (converterContext.getTemplateConverterType() === "AnalyticalListPage") {
        viewConfigs = getAlpViewConfig(entityType, viewConfigs);
      } else {
        viewConfigs.push({
          annotation: getCompliantVisualizationAnnotation(entityType)
        });
      }
    }

    return viewConfigs.map(function (viewConfig) {
      return getView(viewConfig, entityType, converterContext);
    });
  };

  function getAlpViewConfig(entityType, viewConfigs) {
    var presentation = getDefaultPresentationVariant(entityType);
    var isCompliant = presentation && isPresentationALPCompliant(presentation);

    if (!isCompliant) {
      var chart = getDefaultChart(entityType);
      var table = getDefaultLineItem(entityType);

      if (chart) {
        viewConfigs.push({
          annotation: chart
        });
      }

      if (table) {
        viewConfigs.push({
          annotation: table
        });
      }
    } else {
      viewConfigs.push({
        annotation: presentation
      });
    }

    return viewConfigs;
  }
  /**
   * Create the ListReportDefinition for the current entityset.
   *
   * @param entitySet
   * @param converterContext
   * @returns {ListReportDefinition} the list report definition based on annotation + manifest
   */


  var convertPage = function (entitySet, converterContext) {
    var entityType = entitySet.entityType;
    var sTemplateType = converterContext.getTemplateConverterType();
    var manifestWrapper = converterContext.getManifestWrapper();
    var viewsDefinition = manifestWrapper.getViewConfiguration();
    var views = getViews(entityType, converterContext, viewsDefinition);
    var showTabCounts = viewsDefinition === null || viewsDefinition === void 0 ? void 0 : viewsDefinition.showCounts;
    var singleTableId = "";
    var singleChartId = "";
    var bFitContent = false; // Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)

    var selectionVariantConfigs = [];
    var selectionVariantPaths = [];
    var filterBarId = FilterBarID(entitySet.name);
    var filterVariantManagementID = FilterVariantManagementID(filterBarId);
    var targetControlIds = [filterBarId];
    views.forEach(function (view) {
      view.presentation.visualizations.forEach(function (visualizationDefinition) {
        if (visualizationDefinition.type === VisualizationType.Table) {
          var tableFilters = visualizationDefinition.control.filters;

          for (var key in tableFilters) {
            if (Array.isArray(tableFilters[key].paths)) {
              var paths = tableFilters[key].paths;
              paths.forEach(function (path) {
                if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
                  selectionVariantPaths.push(path.annotationPath);
                  var selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);

                  if (selectionVariantConfig) {
                    selectionVariantConfigs.push(selectionVariantConfig);
                  }
                }
              });
            }
          }

          targetControlIds.push(visualizationDefinition.annotation.id);

          if (visualizationDefinition.control.type === "GridTable") {
            bFitContent = sTemplateType === "AnalyticalListPage";
          }
        }
      });
    });
    var oConfig = getContentAreaId(sTemplateType, views);

    if (oConfig) {
      singleChartId = oConfig.chartId;
      singleTableId = oConfig.tableId;
    }

    var selectionFields = getSelectionFields(entityType, selectionVariantConfigs, converterContext); // Sort header actions according to position attributes in manifest

    var headerActions = insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions()));
    return {
      singleTableId: singleTableId,
      singleChartId: singleChartId,
      showTabCounts: showTabCounts,
      headerActions: headerActions,
      selectionFields: selectionFields,
      views: views,
      filterBarId: filterBarId,
      variantManagement: {
        id: filterVariantManagementID,
        targetControlIds: targetControlIds.join(",")
      },
      fitContent: bFitContent,
      isAlp: converterContext.getTemplateConverterType() === "AnalyticalListPage"
    };
  };

  _exports.convertPage = convertPage;

  function getContentAreaId(sTemplateType, views) {
    var singleTableId = "",
        singleChartId = "";

    if (views.length === 1) {
      singleTableId = views[0].tableControlId;
      singleChartId = views[0].chartControlId;
    } else if (sTemplateType === "AnalyticalListPage" && views.length === 2) {
      views.map(function (oView) {
        if (oView.chartControlId) {
          singleChartId = oView.chartControlId;
        } else if (oView.tableControlId) {
          singleTableId = oView.tableControlId;
        }
      });
    }

    if (singleTableId || singleChartId) {
      return {
        chartId: singleChartId,
        tableId: singleTableId
      };
    }

    return undefined;
  }

  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxpc3RSZXBvcnRDb252ZXJ0ZXIudHMiXSwibmFtZXMiOlsiZ2V0U2VsZWN0aW9uRmllbGRzIiwiZW50aXR5VHlwZSIsInNlbGVjdGlvblZhcmlhbnRzIiwiY29udmVydGVyQ29udGV4dCIsInNlbGVjdGlvbkZpZWxkcyIsIm9TZWxlY3Rpb25WYXJpYW50RmllbGRzIiwiZm9yRWFjaCIsInNlbGVjdGlvblZhcmlhbnQiLCJwcm9wZXJ0eU5hbWVzIiwicHJvcGVydHlOYW1lIiwiYW5ub3RhdGlvbnMiLCJVSSIsIlNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbiIsInNlbGVjdGlvbkZpZWxkVmFsdWUiLCJ2YWx1ZSIsInB1c2giLCJyZWFkYWJsZVBhdGgiLCJ0ZW1wbGF0aW5nUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbiIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudCIsImlzUHJlc2VudGF0aW9uQ29tcGxpYW50IiwiZGVmYXVsdExpbmVJdGVtIiwiZ2V0RGVmYXVsdExpbmVJdGVtIiwidW5kZWZpbmVkIiwiZ2V0VmlldyIsInZpZXdDb25maWd1cmF0aW9uIiwicHJlc2VudGF0aW9uIiwiZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIiwiYW5ub3RhdGlvbiIsInBhdGgiLCJnZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoIiwidGFibGVDb250cm9sSWQiLCJjaGFydENvbnRyb2xJZCIsInRpdGxlIiwic2VsZWN0aW9uVmFyaWFudFBhdGgiLCJpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24iLCJjb25maWciLCJrZXkiLCJ2aWV3QW5ub3RhdGlvbiIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRCaW5kaW5nRXhwcmVzc2lvbiIsIlRleHQiLCJ2aXN1YWxpemF0aW9ucyIsInZpc3VhbGl6YXRpb25EZWZpbml0aW9uIiwiaW5kZXgiLCJ0eXBlIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInRhYmxlVmlzdWFsaXphdGlvbiIsImZpbHRlcnMiLCJjb250cm9sIiwiaGlkZGVuRmlsdGVycyIsInBhdGhzIiwia2VlcFByZXZpb3VzUHJlc29uYWxpemF0aW9uIiwiaWQiLCJUYWJsZUlEIiwidGVybSIsIlNlbGVjdGlvblZhcmlhbnQiLCJzcGxpdCIsIkNoYXJ0IiwiZ2V0Vmlld3MiLCJzZXR0aW5nc1ZpZXdzIiwidmlld0NvbmZpZ3MiLCJ0YXJnZXRBbm5vdGF0aW9uIiwiZ2V0VGVtcGxhdGVDb252ZXJ0ZXJUeXBlIiwiZ2V0QWxwVmlld0NvbmZpZyIsIm1hcCIsInZpZXdDb25maWciLCJpc0NvbXBsaWFudCIsImlzUHJlc2VudGF0aW9uQUxQQ29tcGxpYW50IiwiY2hhcnQiLCJnZXREZWZhdWx0Q2hhcnQiLCJ0YWJsZSIsImNvbnZlcnRQYWdlIiwiZW50aXR5U2V0Iiwic1RlbXBsYXRlVHlwZSIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsInZpZXdzRGVmaW5pdGlvbiIsImdldFZpZXdDb25maWd1cmF0aW9uIiwidmlld3MiLCJzaG93VGFiQ291bnRzIiwic2hvd0NvdW50cyIsInNpbmdsZVRhYmxlSWQiLCJzaW5nbGVDaGFydElkIiwiYkZpdENvbnRlbnQiLCJzZWxlY3Rpb25WYXJpYW50Q29uZmlncyIsInNlbGVjdGlvblZhcmlhbnRQYXRocyIsImZpbHRlckJhcklkIiwiRmlsdGVyQmFySUQiLCJuYW1lIiwiZmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCIsIkZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQiLCJ0YXJnZXRDb250cm9sSWRzIiwidmlldyIsInRhYmxlRmlsdGVycyIsIkFycmF5IiwiaXNBcnJheSIsImluZGV4T2YiLCJzZWxlY3Rpb25WYXJpYW50Q29uZmlnIiwiZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24iLCJvQ29uZmlnIiwiZ2V0Q29udGVudEFyZWFJZCIsImNoYXJ0SWQiLCJ0YWJsZUlkIiwiaGVhZGVyQWN0aW9ucyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCIsImdldEhlYWRlckFjdGlvbnMiLCJ2YXJpYW50TWFuYWdlbWVudCIsImpvaW4iLCJmaXRDb250ZW50IiwiaXNBbHAiLCJsZW5ndGgiLCJvVmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEVBOzs7Ozs7Ozs7QUFTTyxNQUFNQSxrQkFBa0IsR0FBRyxVQUNqQ0MsVUFEaUMsRUFFakNDLGlCQUZpQyxFQUdqQ0MsZ0JBSGlDLEVBSVI7QUFBQTs7QUFDekIsUUFBTUMsZUFBdUMsR0FBRyxFQUFoRDtBQUNBLFFBQU1DLHVCQUE0QixHQUFHLEVBQXJDO0FBQ0FILElBQUFBLGlCQUFpQixDQUFDSSxPQUFsQixDQUEwQixVQUFDQyxnQkFBRCxFQUFxRDtBQUM5RUEsTUFBQUEsZ0JBQWdCLENBQUNDLGFBQWpCLENBQStCRixPQUEvQixDQUF1QyxVQUFDRyxZQUFELEVBQTBCO0FBQ2hFLFlBQUksQ0FBQ0osdUJBQXVCLENBQUNJLFlBQUQsQ0FBNUIsRUFBNEM7QUFDM0NKLFVBQUFBLHVCQUF1QixDQUFDSSxZQUFELENBQXZCLEdBQXdDLElBQXhDO0FBQ0E7QUFDRCxPQUpEO0FBS0EsS0FORDtBQU9BLDZCQUFBUixVQUFVLENBQUNTLFdBQVgsMEdBQXdCQyxFQUF4Qiw0R0FBNEJDLGVBQTVCLGtGQUE2Q04sT0FBN0MsQ0FBcUQsVUFBQ08sU0FBRCxFQUE2QjtBQUNqRixVQUFNQyxtQkFBMkIsR0FBR0QsU0FBUyxDQUFDRSxLQUE5Qzs7QUFDQSxVQUFJLENBQUNWLHVCQUF1QixDQUFDUyxtQkFBRCxDQUE1QixFQUFtRDtBQUNsRFYsUUFBQUEsZUFBZSxDQUFDWSxJQUFoQixDQUFxQjtBQUNwQkMsVUFBQUEsWUFBWSxFQUFFSCxtQkFETTtBQUVw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Q25GLGNBQVYsRUFBMEI7QUFDekJxRCxVQUFBQSxhQUFhLEdBQUc4QixLQUFLLENBQUNuRixjQUF0QjtBQUNBLFNBRkQsTUFFTyxJQUFJbUYsS0FBSyxDQUFDcEYsY0FBVixFQUEwQjtBQUNoQ3FELFVBQUFBLGFBQWEsR0FBRytCLEtBQUssQ0FBQ3BGLGNBQXRCO0FBQ0E7QUFDRCxPQU5EO0FBT0E7O0FBQ0QsUUFBSXFELGFBQWEsSUFBSUMsYUFBckIsRUFBb0M7QUFDbkMsYUFBTztBQUNObUIsUUFBQUEsT0FBTyxFQUFFbkIsYUFESDtBQUVOb0IsUUFBQUEsT0FBTyxFQUFFckI7QUFGSCxPQUFQO0FBSUE7O0FBQ0QsV0FBTzdELFNBQVA7QUFDQSIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVmlzdWFsaXphdGlvblR5cGUsIFZpZXdQYXRoQ29uZmlndXJhdGlvbiwgTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG5pbXBvcnQgeyBFbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlclwiO1xuaW1wb3J0IHsgQ29udmVydGVyQ29udGV4dCB9IGZyb20gXCIuL0Jhc2VDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbixcblx0Z2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uLFxuXHREYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zLFxuXHRpc1ByZXNlbnRhdGlvbkNvbXBsaWFudCxcblx0aXNQcmVzZW50YXRpb25BTFBDb21wbGlhbnQsXG5cdGdldERlZmF1bHRMaW5lSXRlbSxcblx0Z2V0RGVmYXVsdENoYXJ0LFxuXHRnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudFxufSBmcm9tIFwiLi4vY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRMaW5lSXRlbSxcblx0UHJlc2VudGF0aW9uVmFyaWFudFR5cGVUeXBlcyxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcyxcblx0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFR5cGVUeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvZGlzdC9nZW5lcmF0ZWQvVUlcIjtcbmltcG9ydCB7IEVudGl0eVR5cGUsIFByb3BlcnR5UGF0aCwgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEZpbHRlckJhcklELCBGaWx0ZXJWYXJpYW50TWFuYWdlbWVudElELCBUYWJsZUlEIH0gZnJvbSBcIi4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7XG5cdGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uLFxuXHRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbixcblx0VGFibGVWaXN1YWxpemF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHsgQmFzZUFjdGlvbiwgZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcblxudHlwZSBWaWV3QW5ub3RhdGlvbnNUeXBlVHlwZXMgPSBTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50VHlwZVR5cGVzIHwgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcztcbnR5cGUgVmFyaWFudE1hbmFnZW1lbnREZWZpbml0aW9uID0ge1xuXHRpZDogc3RyaW5nO1xuXHR0YXJnZXRDb250cm9sSWRzOiBzdHJpbmc7XG59O1xuXG50eXBlIE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gPSBWaWV3UGF0aENvbmZpZ3VyYXRpb24gJiB7XG5cdGFubm90YXRpb24/OiBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xufTtcblxudHlwZSBTaW5nbGVWaWV3Q29uZmlndXJhdGlvbiA9IHtcblx0YW5ub3RhdGlvbj86IERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG59O1xuXG50eXBlIFZpZXdDb25maWd1cmF0aW9uID0gTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiB8IFNpbmdsZVZpZXdDb25maWd1cmF0aW9uO1xuXG50eXBlIEZpbHRlclNlbGVjdGlvbkZpZWxkID0ge1xuXHRyZWFkYWJsZVBhdGg6IHN0cmluZztcblx0dGVtcGxhdGluZ1BhdGg6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIExpc3RSZXBvcnREZWZpbml0aW9uID0ge1xuXHRzaW5nbGVUYWJsZUlkPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggc2luZ2xlIFRhYmxlIG1vZGVcblx0c2luZ2xlQ2hhcnRJZD86IHN0cmluZzsgLy8gb25seSB3aXRoIHNpbmdsZSBUYWJsZSBtb2RlXG5cdHNob3dUYWJDb3VudHM/OiBib29sZWFuOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRoZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNlbGVjdGlvbkZpZWxkczogRmlsdGVyU2VsZWN0aW9uRmllbGRbXTtcblx0dmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdO1xuXHRmaWx0ZXJCYXJJZDogc3RyaW5nO1xuXHR2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnREZWZpbml0aW9uO1xuXHRmaXRDb250ZW50OiBib29sZWFuO1xuXHRpc0FscDogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbiA9IHtcblx0c2VsZWN0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBvbiBtdWx0aSBUYWJsZSBtb2RlXG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcblx0dGFibGVDb250cm9sSWQ6IHN0cmluZztcblx0Y2hhcnRDb250cm9sSWQ6IHN0cmluZztcbn07XG5cbnR5cGUgQ29udGVudEFyZWFJRCA9IHtcblx0Y2hhcnRJZDogc3RyaW5nO1xuXHR0YWJsZUlkOiBzdHJpbmc7XG59O1xuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNlbGVjdGlvbiBmaWVsZHMgdGhhdCB3aWxsIGJlIHVzZWQgd2l0aGluIHRoZSBmaWx0ZXIgYmFyXG4gKiBUaGlzIGNvbmZpZ3VyYXRpb24gdGFrZXMgaW50byBhY2NvdW50IGFubm90YXRpb24gYW5kIHRoZSBzZWxlY3Rpb24gdmFyaWFudHMuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGVcbiAqIEBwYXJhbSBzZWxlY3Rpb25WYXJpYW50c1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIHtGaWx0ZXJTZWxlY3Rpb25GaWVsZFtdfSBhbiBhcnJheSBvZiBzZWxlY3Rpb24gZmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZWxlY3Rpb25GaWVsZHMgPSBmdW5jdGlvbihcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0c2VsZWN0aW9uVmFyaWFudHM6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEZpbHRlclNlbGVjdGlvbkZpZWxkW10ge1xuXHRjb25zdCBzZWxlY3Rpb25GaWVsZHM6IEZpbHRlclNlbGVjdGlvbkZpZWxkW10gPSBbXTtcblx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnRGaWVsZHM6IGFueSA9IHt9O1xuXHRzZWxlY3Rpb25WYXJpYW50cy5mb3JFYWNoKChzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbikgPT4ge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQucHJvcGVydHlOYW1lcy5mb3JFYWNoKChwcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0aWYgKCFvU2VsZWN0aW9uVmFyaWFudEZpZWxkc1twcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50RmllbGRzW3Byb3BlcnR5TmFtZV0gPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTtcblx0ZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LlNlbGVjdGlvbkZpZWxkcz8uZm9yRWFjaCgoc2VsZWN0aW9uOiBQcm9wZXJ0eVBhdGgpID0+IHtcblx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZFZhbHVlOiBzdHJpbmcgPSBzZWxlY3Rpb24udmFsdWU7XG5cdFx0aWYgKCFvU2VsZWN0aW9uVmFyaWFudEZpZWxkc1tzZWxlY3Rpb25GaWVsZFZhbHVlXSkge1xuXHRcdFx0c2VsZWN0aW9uRmllbGRzLnB1c2goe1xuXHRcdFx0XHRyZWFkYWJsZVBhdGg6IHNlbGVjdGlvbkZpZWxkVmFsdWUsXG5cdFx0XHRcdHRlbXBsYXRpbmdQYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoc2VsZWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSArIFwiLyRQcm9wZXJ0eVBhdGhcIilcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZHM7XG59O1xuXG4vKipcbiAqIEZpbmQgYSB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gdGhhdCBjYW4gYmUgdXNlZCBmb3IgcmVuZGVyaW5nIHRoZSBsaXN0IHJlcG9ydC5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZVxuICogQHJldHVybnMge0xpbmVJdGVtIHwgUHJlc2VudGF0aW9uVmFyaWFudFR5cGVUeXBlcyB8IHVuZGVmaW5lZH0gb25lIGNvbXBsaWFudCBhbm5vdGF0aW9uIGZvciByZW5kZXJpbmcgdGhlIGxpc3QgcmVwb3J0XG4gKi9cbmZ1bmN0aW9uIGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBMaW5lSXRlbSB8IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlVHlwZXMgfCB1bmRlZmluZWQge1xuXHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50ID0gZ2V0RGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSk7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0aWYgKGlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnQpKSB7XG5cdFx0XHRyZXR1cm4gcHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHR9XG5cdH1cblx0Y29uc3QgZGVmYXVsdExpbmVJdGVtID0gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGUpO1xuXHRpZiAoZGVmYXVsdExpbmVJdGVtKSB7XG5cdFx0cmV0dXJuIGRlZmF1bHRMaW5lSXRlbTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5jb25zdCBnZXRWaWV3ID0gZnVuY3Rpb24oXG5cdHZpZXdDb25maWd1cmF0aW9uOiBWaWV3Q29uZmlndXJhdGlvbixcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uIHtcblx0Y29uc3QgcHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0e1xuXHRcdFx0YW5ub3RhdGlvbjogdmlld0NvbmZpZ3VyYXRpb24uYW5ub3RhdGlvbixcblx0XHRcdHBhdGg6IHZpZXdDb25maWd1cmF0aW9uLmFubm90YXRpb25cblx0XHRcdFx0PyBjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgodmlld0NvbmZpZ3VyYXRpb24uYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsIGVudGl0eVR5cGUpXG5cdFx0XHRcdDogXCJcIlxuXHRcdH0sXG5cdFx0Y29udmVydGVyQ29udGV4dFxuXHQpO1xuXHRsZXQgdGFibGVDb250cm9sSWQgPSBcIlwiO1xuXHRsZXQgY2hhcnRDb250cm9sSWQgPSBcIlwiO1xuXHRsZXQgdGl0bGUgPSBcIlwiO1xuXHRsZXQgc2VsZWN0aW9uVmFyaWFudFBhdGggPSBcIlwiO1xuXHRjb25zdCBpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbihjb25maWc6IFZpZXdDb25maWd1cmF0aW9uKTogY29uZmlnIGlzIE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24ge1xuXHRcdHJldHVybiAoY29uZmlnIGFzIE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24pLmtleSAhPT0gdW5kZWZpbmVkO1xuXHR9O1xuXHRjb25zdCBjb25maWcgPSB2aWV3Q29uZmlndXJhdGlvbjtcblxuXHRpZiAoaXNNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uKGNvbmZpZykpIHtcblx0XHQvLyBrZXkgZXhpc3RzIG9ubHkgb24gbXVsdGkgdGFibGVzIG1vZGVcblx0XHRjb25zdCB2aWV3QW5ub3RhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oY29uZmlnLmFubm90YXRpb25QYXRoKTtcblx0XHR0aXRsZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QmluZGluZ0V4cHJlc3Npb248c3RyaW5nPigodmlld0Fubm90YXRpb24gYXMgVmlld0Fubm90YXRpb25zVHlwZVR5cGVzKS5UZXh0KSB8fCBcIlwiO1xuXHRcdC8qKlxuXHRcdCAqIE5lZWQgdG8gbG9vcCBvbiB2aWV3cyBhbmQgbW9yZSBwcmVjaXNlbHkgdG8gdGFibGUgaW50byB2aWV3cyBzaW5jZVxuXHRcdCAqIG11bHRpIHRhYmxlIG1vZGUgZ2V0IHNwZWNpZmljIGNvbmZpZ3VhdGlvbiAoaGlkZGVuIGZpbHRlcnMgb3IgVGFibGUgSWQpXG5cdFx0ICovXG5cdFx0cHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLCBpbmRleCkgPT4ge1xuXHRcdFx0c3dpdGNoICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgVmlzdWFsaXphdGlvblR5cGUuVGFibGU6XG5cdFx0XHRcdFx0Y29uc3QgdGFibGVWaXN1YWxpemF0aW9uID0gcHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zW2luZGV4XSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0Y29uc3QgZmlsdGVycyA9IHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnMgfHwge307XG5cdFx0XHRcdFx0ZmlsdGVycy5oaWRkZW5GaWx0ZXJzID0gZmlsdGVycy5oaWRkZW5GaWx0ZXJzIHx8IHsgcGF0aHM6IFtdIH07XG5cdFx0XHRcdFx0aWYgKCFjb25maWcua2VlcFByZXZpb3VzUHJlc29uYWxpemF0aW9uKSB7XG5cdFx0XHRcdFx0XHQvLyBOZWVkIHRvIG92ZXJyaWRlIFRhYmxlIElkIHRvIG1hdGNoIHdpdGggVGFiIEtleSAoY3VycmVudGx5IG9ubHkgdGFibGUgaXMgbWFuYWdlZCBpbiBtdWx0aXBsZSB2aWV3IG1vZGUpXG5cdFx0XHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5pZCA9IFRhYmxlSUQoY29uZmlnLmtleSwgXCJMaW5lSXRlbVwiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHR2aWV3Q29uZmlndXJhdGlvbiAmJlxuXHRcdFx0XHRcdFx0dmlld0NvbmZpZ3VyYXRpb24uYW5ub3RhdGlvbiAmJlxuXHRcdFx0XHRcdFx0dmlld0NvbmZpZ3VyYXRpb24uYW5ub3RhdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aCA9ICh2aWV3Q29uZmlndXJhdGlvbi5hbm5vdGF0aW9uIGFzIFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRUeXBlVHlwZXMpLlNlbGVjdGlvblZhcmlhbnQuZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFxuXHRcdFx0XHRcdFx0XHRcIkBcIlxuXHRcdFx0XHRcdFx0KVsxXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGggPSBjb25maWcuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIFByb3ZpZGUgU2VsZWN0aW9uIFZhcmlhbnQgdG8gaGlkZGVuRmlsdGVycyBpbiBvcmRlciB0byBzZXQgdGhlIFNWIGZpbHRlcnMgdG8gdGhlIHRhYmxlXG5cdFx0XHRcdFx0ICogTURDIFRhYmxlIG92ZXJyaWRlIE9iaW5kaW5nIEZpdGxlciBhbmQgZnJvbSBTQVAgRkUgdGhlIG9ubHkgbWV0aG9kIHdoZXJlIHdlIGFyZSBhYmxlIHRvIGFkZFxuXHRcdFx0XHRcdCAqIGFkZGl0aW9ubmFsIGZpbHRlciBpcyAncmViaW5kVGFibGUnIGludG8gVGFibGUgZGVsZWdhdGVcblx0XHRcdFx0XHQgKiBJbiBvcmRlciB0byBhdm9pZCBpbXBsZW1lbnRpbmcgc3BlY2lmaWMgTFIgZmVhdHVyZSB0byBTQVAgRkUgTWFjcm8gVGFibGUsIHRoZSBmaWx0ZXIocykgcmVsYXRlZFxuXHRcdFx0XHRcdCAqIHRvIHRoZSBUYWIgKG11bHRpIHRhYmxlIG1vZGUpIGNhbiBiZSBwYXNzZWQgdG8gbWFjcm8gdGFibGUgdmlhIHBhcmFtZXRlci9jb250ZXh0IG5hbWVkIGZpdGxlcnNcblx0XHRcdFx0XHQgKiBhbmQga2V5IGhpZGRlbkZpbHRlcnNcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRmaWx0ZXJzLmhpZGRlbkZpbHRlcnMucGF0aHMucHVzaCh7IGFubm90YXRpb25QYXRoOiBzZWxlY3Rpb25WYXJpYW50UGF0aCB9KTtcblx0XHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC5maWx0ZXJzID0gZmlsdGVycztcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydDpcblx0XHRcdFx0XHQvLyBOb3QgY3VycmVudGx5IG1hbmFnZWRcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uID0+IHtcblx0XHRpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdHRhYmxlQ29udHJvbElkID0gdmlzdWFsaXphdGlvbkRlZmluaXRpb24uYW5ub3RhdGlvbi5pZDtcblx0XHR9IGVsc2UgaWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSB7XG5cdFx0XHRjaGFydENvbnRyb2xJZCA9IHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmlkO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiB7IHByZXNlbnRhdGlvbiwgdGFibGVDb250cm9sSWQsIGNoYXJ0Q29udHJvbElkLCB0aXRsZSwgc2VsZWN0aW9uVmFyaWFudFBhdGggfTtcbn07XG5cbmNvbnN0IGdldFZpZXdzID0gZnVuY3Rpb24oXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHNldHRpbmdzVmlld3M6IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkXG4pOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSB7XG5cdGxldCB2aWV3Q29uZmlnczogVmlld0NvbmZpZ3VyYXRpb25bXSA9IFtdO1xuXHRpZiAoc2V0dGluZ3NWaWV3cykge1xuXHRcdHNldHRpbmdzVmlld3MucGF0aHMuZm9yRWFjaCgocGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgpIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRpZiAodGFyZ2V0QW5ub3RhdGlvbikge1xuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uID1cblx0XHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0XHRcdD8gKGdldERlZmF1bHRMaW5lSXRlbShlbnRpdHlUeXBlKSBhcyBMaW5lSXRlbSlcblx0XHRcdFx0XHRcdDogdGFyZ2V0QW5ub3RhdGlvbjtcblx0XHRcdFx0dmlld0NvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbixcblx0XHRcdFx0XHQuLi5zZXR0aW5nc1ZpZXdzLnBhdGhzW2luZGV4XVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZUNvbnZlcnRlclR5cGUoKSA9PT0gXCJBbmFseXRpY2FsTGlzdFBhZ2VcIikge1xuXHRcdFx0dmlld0NvbmZpZ3MgPSBnZXRBbHBWaWV3Q29uZmlnKGVudGl0eVR5cGUsIHZpZXdDb25maWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmlld0NvbmZpZ3MucHVzaCh7IGFubm90YXRpb246IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUpIH0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdmlld0NvbmZpZ3MubWFwKHZpZXdDb25maWcgPT4gZ2V0Vmlldyh2aWV3Q29uZmlnLCBlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KSk7XG59O1xuZnVuY3Rpb24gZ2V0QWxwVmlld0NvbmZpZyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCB2aWV3Q29uZmlnczogVmlld0NvbmZpZ3VyYXRpb25bXSk6IFZpZXdDb25maWd1cmF0aW9uW10ge1xuXHRjb25zdCBwcmVzZW50YXRpb24gPSBnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudChlbnRpdHlUeXBlKTtcblx0Y29uc3QgaXNDb21wbGlhbnQgPSBwcmVzZW50YXRpb24gJiYgaXNQcmVzZW50YXRpb25BTFBDb21wbGlhbnQocHJlc2VudGF0aW9uKTtcblx0aWYgKCFpc0NvbXBsaWFudCkge1xuXHRcdGNvbnN0IGNoYXJ0ID0gZ2V0RGVmYXVsdENoYXJ0KGVudGl0eVR5cGUpO1xuXHRcdGNvbnN0IHRhYmxlID0gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGUpO1xuXHRcdGlmIChjaGFydCkge1xuXHRcdFx0dmlld0NvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdGFubm90YXRpb246IGNoYXJ0XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKHRhYmxlKSB7XG5cdFx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdFx0YW5ub3RhdGlvbjogdGFibGVcblx0XHRcdH0pO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdGFubm90YXRpb246IHByZXNlbnRhdGlvblxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB2aWV3Q29uZmlncztcbn1cbi8qKlxuICogQ3JlYXRlIHRoZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiBmb3IgdGhlIGN1cnJlbnQgZW50aXR5c2V0LlxuICpcbiAqIEBwYXJhbSBlbnRpdHlTZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyB7TGlzdFJlcG9ydERlZmluaXRpb259IHRoZSBsaXN0IHJlcG9ydCBkZWZpbml0aW9uIGJhc2VkIG9uIGFubm90YXRpb24gKyBtYW5pZmVzdFxuICovXG5leHBvcnQgY29uc3QgY29udmVydFBhZ2UgPSBmdW5jdGlvbihlbnRpdHlTZXQ6IEVudGl0eVNldCwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IExpc3RSZXBvcnREZWZpbml0aW9uIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGVudGl0eVNldC5lbnRpdHlUeXBlO1xuXHRjb25zdCBzVGVtcGxhdGVUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZUNvbnZlcnRlclR5cGUoKTtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3Qgdmlld3NEZWZpbml0aW9uOiBNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCA9IG1hbmlmZXN0V3JhcHBlci5nZXRWaWV3Q29uZmlndXJhdGlvbigpO1xuXHRjb25zdCB2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10gPSBnZXRWaWV3cyhlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCB2aWV3c0RlZmluaXRpb24pO1xuXHRjb25zdCBzaG93VGFiQ291bnRzID0gdmlld3NEZWZpbml0aW9uPy5zaG93Q291bnRzO1xuXG5cdGxldCBzaW5nbGVUYWJsZUlkID0gXCJcIjtcblx0bGV0IHNpbmdsZUNoYXJ0SWQgPSBcIlwiO1xuXHRsZXQgYkZpdENvbnRlbnQgPSBmYWxzZTtcblx0Ly8gRmV0Y2ggYWxsIHNlbGVjdGlvblZhcmlhbnRzIGRlZmluZWQgaW4gdGhlIGRpZmZlcmVudCB2aXN1YWxpemF0aW9ucyBhbmQgZGlmZmVyZW50IHZpZXdzIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50Q29uZmlnczogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IFtdO1xuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50UGF0aHM6IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IGZpbHRlckJhcklkID0gRmlsdGVyQmFySUQoZW50aXR5U2V0Lm5hbWUpO1xuXHRjb25zdCBmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEID0gRmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRChmaWx0ZXJCYXJJZCk7XG5cdGNvbnN0IHRhcmdldENvbnRyb2xJZHMgPSBbZmlsdGVyQmFySWRdO1xuXHR2aWV3cy5mb3JFYWNoKHZpZXcgPT4ge1xuXHRcdHZpZXcucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2godmlzdWFsaXphdGlvbkRlZmluaXRpb24gPT4ge1xuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdGNvbnN0IHRhYmxlRmlsdGVycyA9IHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmNvbnRyb2wuZmlsdGVycztcblx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gdGFibGVGaWx0ZXJzKSB7XG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodGFibGVGaWx0ZXJzW2tleV0ucGF0aHMpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBwYXRocyA9IHRhYmxlRmlsdGVyc1trZXldLnBhdGhzO1xuXHRcdFx0XHRcdFx0cGF0aHMuZm9yRWFjaChwYXRoID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKHBhdGggJiYgcGF0aC5hbm5vdGF0aW9uUGF0aCAmJiBzZWxlY3Rpb25WYXJpYW50UGF0aHMuaW5kZXhPZihwYXRoLmFubm90YXRpb25QYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aHMucHVzaChwYXRoLmFubm90YXRpb25QYXRoKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzZWxlY3Rpb25WYXJpYW50Q29uZmlnID0gZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24ocGF0aC5hbm5vdGF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdGlvblZhcmlhbnRDb25maWcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRDb25maWdzLnB1c2goc2VsZWN0aW9uVmFyaWFudENvbmZpZyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dGFyZ2V0Q29udHJvbElkcy5wdXNoKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmFubm90YXRpb24uaWQpO1xuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24uY29udHJvbC50eXBlID09PSBcIkdyaWRUYWJsZVwiKSB7XG5cdFx0XHRcdFx0YkZpdENvbnRlbnQgPSBzVGVtcGxhdGVUeXBlID09PSBcIkFuYWx5dGljYWxMaXN0UGFnZVwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXHRjb25zdCBvQ29uZmlnID0gZ2V0Q29udGVudEFyZWFJZChzVGVtcGxhdGVUeXBlLCB2aWV3cyk7XG5cdGlmIChvQ29uZmlnKSB7XG5cdFx0c2luZ2xlQ2hhcnRJZCA9IG9Db25maWcuY2hhcnRJZDtcblx0XHRzaW5nbGVUYWJsZUlkID0gb0NvbmZpZy50YWJsZUlkO1xuXHR9XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkcyA9IGdldFNlbGVjdGlvbkZpZWxkcyhlbnRpdHlUeXBlLCBzZWxlY3Rpb25WYXJpYW50Q29uZmlncywgY29udmVydGVyQ29udGV4dCk7XG5cblx0Ly8gU29ydCBoZWFkZXIgYWN0aW9ucyBhY2NvcmRpbmcgdG8gcG9zaXRpb24gYXR0cmlidXRlcyBpbiBtYW5pZmVzdFxuXHRjb25zdCBoZWFkZXJBY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoW10sIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QobWFuaWZlc3RXcmFwcGVyLmdldEhlYWRlckFjdGlvbnMoKSkpO1xuXG5cdHJldHVybiB7XG5cdFx0c2luZ2xlVGFibGVJZCxcblx0XHRzaW5nbGVDaGFydElkLFxuXHRcdHNob3dUYWJDb3VudHMsXG5cdFx0aGVhZGVyQWN0aW9ucyxcblx0XHRzZWxlY3Rpb25GaWVsZHMsXG5cdFx0dmlld3M6IHZpZXdzLFxuXHRcdGZpbHRlckJhcklkLFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB7XG5cdFx0XHRpZDogZmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCxcblx0XHRcdHRhcmdldENvbnRyb2xJZHM6IHRhcmdldENvbnRyb2xJZHMuam9pbihcIixcIilcblx0XHR9LFxuXHRcdGZpdENvbnRlbnQ6IGJGaXRDb250ZW50LFxuXHRcdGlzQWxwOiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlQ29udmVydGVyVHlwZSgpID09PSBcIkFuYWx5dGljYWxMaXN0UGFnZVwiXG5cdH07XG59O1xuXG5mdW5jdGlvbiBnZXRDb250ZW50QXJlYUlkKHNUZW1wbGF0ZVR5cGU6IHN0cmluZywgdmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdKTogQ29udGVudEFyZWFJRCB8IHVuZGVmaW5lZCB7XG5cdGxldCBzaW5nbGVUYWJsZUlkID0gXCJcIixcblx0XHRzaW5nbGVDaGFydElkID0gXCJcIjtcblx0aWYgKHZpZXdzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHNpbmdsZVRhYmxlSWQgPSB2aWV3c1swXS50YWJsZUNvbnRyb2xJZDtcblx0XHRzaW5nbGVDaGFydElkID0gdmlld3NbMF0uY2hhcnRDb250cm9sSWQ7XG5cdH0gZWxzZSBpZiAoc1RlbXBsYXRlVHlwZSA9PT0gXCJBbmFseXRpY2FsTGlzdFBhZ2VcIiAmJiB2aWV3cy5sZW5ndGggPT09IDIpIHtcblx0XHR2aWV3cy5tYXAob1ZpZXcgPT4ge1xuXHRcdFx0aWYgKG9WaWV3LmNoYXJ0Q29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSBvVmlldy5jaGFydENvbnRyb2xJZDtcblx0XHRcdH0gZWxzZSBpZiAob1ZpZXcudGFibGVDb250cm9sSWQpIHtcblx0XHRcdFx0c2luZ2xlVGFibGVJZCA9IG9WaWV3LnRhYmxlQ29udHJvbElkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGlmIChzaW5nbGVUYWJsZUlkIHx8IHNpbmdsZUNoYXJ0SWQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2hhcnRJZDogc2luZ2xlQ2hhcnRJZCxcblx0XHRcdHRhYmxlSWQ6IHNpbmdsZVRhYmxlSWRcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG4iXX0=