sap.ui.define(["../ManifestSettings", "sap/fe/core/converters/helpers/ConfigurableObject"], function (ManifestSettings, ConfigurableObject) {
  "use strict";

  var _exports = {};
  var Placement = ConfigurableObject.Placement;
  var ActionType = ManifestSettings.ActionType;

  /**
   * Retrieve all the data field for actions for the identification annotation
   * They must be
   * - Not statically hidden
   * - Either linked to an Unbound action or to an action which has an OperationAvailable not statically false.
   *
   * @param {EntityType} entityType the current entitytype
   * @param {boolean} bDetermining whether or not the action should be determining
   * @returns {DataFieldForActionTypes[]} an array of datafield for action respecting the bDetermining property
   */
  function getIdentificationDataFieldForActions(entityType, bDetermining) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;

    return ((_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.Identification) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.filter(function (identificationDataField) {
      var _identificationDataFi, _identificationDataFi2;

      if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi = identificationDataField.annotations) === null || _identificationDataFi === void 0 ? void 0 : (_identificationDataFi2 = _identificationDataFi.UI) === null || _identificationDataFi2 === void 0 ? void 0 : _identificationDataFi2.Hidden) !== true) {
        var _identificationDataFi3, _identificationDataFi4, _identificationDataFi5, _identificationDataFi6;

        if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : identificationDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" && !!identificationDataField.Determining === bDetermining && (!(identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi3 = identificationDataField.ActionTarget) === null || _identificationDataFi3 === void 0 ? void 0 : _identificationDataFi3.isBound) || (identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi4 = identificationDataField.ActionTarget) === null || _identificationDataFi4 === void 0 ? void 0 : (_identificationDataFi5 = _identificationDataFi4.annotations) === null || _identificationDataFi5 === void 0 ? void 0 : (_identificationDataFi6 = _identificationDataFi5.Core) === null || _identificationDataFi6 === void 0 ? void 0 : _identificationDataFi6.OperationAvailable) !== false)) {
          return true;
        }
      }

      return false;
    })) || [];
  }

  _exports.getIdentificationDataFieldForActions = getIdentificationDataFieldForActions;
  var IMPORTANT_CRITICALITIES = ["UI.CriticalityType/VeryPositive", "UI.CriticalityType/Positive", "UI.CriticalityType/Negative", "UI.CriticalityType/VeryNegative"];

  function getHeaderDefaultActions(entitySet, converterContext) {
    var _entitySet$annotation, _entitySet$annotation2, _entitySet$annotation3, _entitySet$annotation4, _entitySet$annotation5, _entitySet$annotation6;

    var oStickySessionSupported = (_entitySet$annotation = entitySet.annotations) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.Session) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.StickySessionSupported,
        //for sticky app
    oDraftRoot = (_entitySet$annotation3 = entitySet.annotations.Common) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.DraftRoot,
        oEntityDeleteRestrictions = (_entitySet$annotation4 = entitySet.annotations) === null || _entitySet$annotation4 === void 0 ? void 0 : (_entitySet$annotation5 = _entitySet$annotation4.Capabilities) === null || _entitySet$annotation5 === void 0 ? void 0 : _entitySet$annotation5.DeleteRestrictions,
        bUpdateHidden = (_entitySet$annotation6 = entitySet.annotations.UI) === null || _entitySet$annotation6 === void 0 ? void 0 : _entitySet$annotation6.UpdateHidden;
    var headerDataFieldForActions = getIdentificationDataFieldForActions(entitySet.entityType, false); // First add the "Critical" DataFieldForActions

    var headerActions = headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) > -1;
    }).map(function (dataField) {
      return {
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
        key: "DataFieldForAction::" + (dataField === null || dataField === void 0 ? void 0 : dataField.Action.replace(/\//g, "::")),
        isNavigable: true
      };
    }); // Then the edit action if it exists

    if (((oDraftRoot === null || oDraftRoot === void 0 ? void 0 : oDraftRoot.EditAction) || (oStickySessionSupported === null || oStickySessionSupported === void 0 ? void 0 : oStickySessionSupported.EditAction)) && bUpdateHidden !== true) {
      headerActions.push({
        type: ActionType.Primary,
        key: "EditAction"
      });
    } // Then the delete action if we're not statically not deletable


    if ((oEntityDeleteRestrictions === null || oEntityDeleteRestrictions === void 0 ? void 0 : oEntityDeleteRestrictions.Deletable) !== false) {
      headerActions.push({
        type: ActionType.Secondary,
        key: "DeleteAction"
      });
    } // Finally the non critical DataFieldForActions


    headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) === -1;
    }).map(function (dataField) {
      headerActions.push({
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
        key: "DataFieldForAction::" + (dataField === null || dataField === void 0 ? void 0 : dataField.Action.replace(/\//g, "::")),
        isNavigable: true
      });
    });
    return headerActions;
  }

  _exports.getHeaderDefaultActions = getHeaderDefaultActions;

  function getFooterDefaultActions(entitySet, viewLevel, converterContext) {
    var _entitySet$annotation7, _entitySet$annotation8, _entitySet$annotation9, _entitySet$annotation10, _entitySet$annotation11, _entitySet$annotation12, _entitySet$annotation13;

    var oStickySessionSupported = (_entitySet$annotation7 = entitySet.annotations) === null || _entitySet$annotation7 === void 0 ? void 0 : (_entitySet$annotation8 = _entitySet$annotation7.Session) === null || _entitySet$annotation8 === void 0 ? void 0 : _entitySet$annotation8.StickySessionSupported,
        //for sticky app
    sEntitySetDraftRoot = ((_entitySet$annotation9 = entitySet.annotations.Common) === null || _entitySet$annotation9 === void 0 ? void 0 : (_entitySet$annotation10 = _entitySet$annotation9.DraftRoot) === null || _entitySet$annotation10 === void 0 ? void 0 : _entitySet$annotation10.term) || ((_entitySet$annotation11 = entitySet.annotations) === null || _entitySet$annotation11 === void 0 ? void 0 : (_entitySet$annotation12 = _entitySet$annotation11.Session) === null || _entitySet$annotation12 === void 0 ? void 0 : (_entitySet$annotation13 = _entitySet$annotation12.StickySessionSupported) === null || _entitySet$annotation13 === void 0 ? void 0 : _entitySet$annotation13.term),
        bConditionSave = sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" || oStickySessionSupported && (oStickySessionSupported === null || oStickySessionSupported === void 0 ? void 0 : oStickySessionSupported.SaveAction),
        bConditionApply = viewLevel > 1,
        bConditionCancel = sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" || oStickySessionSupported && (oStickySessionSupported === null || oStickySessionSupported === void 0 ? void 0 : oStickySessionSupported.DiscardAction); // Retrieve all determining actions

    var headerDataFieldForActions = getIdentificationDataFieldForActions(entitySet.entityType, true); // First add the "Critical" DataFieldForActions

    var footerActions = headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) > -1;
    }).map(function (dataField) {
      return {
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
        key: "DataFieldForAction::" + (dataField === null || dataField === void 0 ? void 0 : dataField.Action.replace(/\//g, "::")),
        isNavigable: true
      };
    }); // Then the save action if it exists

    if (bConditionSave) {
      footerActions.push({
        type: ActionType.Primary,
        key: "SaveAction"
      });
    } // Then the apply action if it exists


    if (bConditionApply) {
      footerActions.push({
        type: ActionType.DefaultApply,
        key: "ApplyAction"
      });
    } // Then the non critical DataFieldForActions


    headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) === -1;
    }).map(function (dataField) {
      footerActions.push({
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getAnnotationPathFromFullyQualifiedName(dataField.fullyQualifiedName),
        key: "DataFieldForAction::" + (dataField === null || dataField === void 0 ? void 0 : dataField.Action.replace(/\//g, "::")),
        isNavigable: true
      });
    }); // Then the cancel action if it exists

    if (bConditionCancel) {
      footerActions.push({
        type: ActionType.Secondary,
        key: "CancelAction",
        position: {
          placement: Placement.End
        }
      });
    }

    return footerActions;
  }

  _exports.getFooterDefaultActions = getFooterDefaultActions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWRlckFuZEZvb3RlckFjdGlvbi50cyJdLCJuYW1lcyI6WyJnZXRJZGVudGlmaWNhdGlvbkRhdGFGaWVsZEZvckFjdGlvbnMiLCJlbnRpdHlUeXBlIiwiYkRldGVybWluaW5nIiwiYW5ub3RhdGlvbnMiLCJVSSIsIklkZW50aWZpY2F0aW9uIiwiZmlsdGVyIiwiaWRlbnRpZmljYXRpb25EYXRhRmllbGQiLCJIaWRkZW4iLCIkVHlwZSIsIkRldGVybWluaW5nIiwiQWN0aW9uVGFyZ2V0IiwiaXNCb3VuZCIsIkNvcmUiLCJPcGVyYXRpb25BdmFpbGFibGUiLCJJTVBPUlRBTlRfQ1JJVElDQUxJVElFUyIsImdldEhlYWRlckRlZmF1bHRBY3Rpb25zIiwiZW50aXR5U2V0IiwiY29udmVydGVyQ29udGV4dCIsIm9TdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJvRHJhZnRSb290IiwiQ29tbW9uIiwiRHJhZnRSb290Iiwib0VudGl0eURlbGV0ZVJlc3RyaWN0aW9ucyIsIkNhcGFiaWxpdGllcyIsIkRlbGV0ZVJlc3RyaWN0aW9ucyIsImJVcGRhdGVIaWRkZW4iLCJVcGRhdGVIaWRkZW4iLCJoZWFkZXJEYXRhRmllbGRGb3JBY3Rpb25zIiwiaGVhZGVyQWN0aW9ucyIsImRhdGFGaWVsZCIsImluZGV4T2YiLCJDcml0aWNhbGl0eSIsIm1hcCIsInR5cGUiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRBbm5vdGF0aW9uUGF0aEZyb21GdWxseVF1YWxpZmllZE5hbWUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJrZXkiLCJBY3Rpb24iLCJyZXBsYWNlIiwiaXNOYXZpZ2FibGUiLCJFZGl0QWN0aW9uIiwicHVzaCIsIlByaW1hcnkiLCJEZWxldGFibGUiLCJTZWNvbmRhcnkiLCJnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyIsInZpZXdMZXZlbCIsInNFbnRpdHlTZXREcmFmdFJvb3QiLCJ0ZXJtIiwiYkNvbmRpdGlvblNhdmUiLCJTYXZlQWN0aW9uIiwiYkNvbmRpdGlvbkFwcGx5IiwiYkNvbmRpdGlvbkNhbmNlbCIsIkRpc2NhcmRBY3Rpb24iLCJmb290ZXJBY3Rpb25zIiwiRGVmYXVsdEFwcGx5IiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJFbmQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFPQTs7Ozs7Ozs7OztBQVVPLFdBQVNBLG9DQUFULENBQThDQyxVQUE5QyxFQUFzRUMsWUFBdEUsRUFBd0g7QUFBQTs7QUFDOUgsV0FBUSwwQkFBQUQsVUFBVSxDQUFDRSxXQUFYLDBHQUF3QkMsRUFBeEIsNEdBQTRCQyxjQUE1QixrRkFBNENDLE1BQTVDLENBQW1ELFVBQUFDLHVCQUF1QixFQUFJO0FBQUE7O0FBQ3JGLFVBQUksQ0FBQUEsdUJBQXVCLFNBQXZCLElBQUFBLHVCQUF1QixXQUF2QixxQ0FBQUEsdUJBQXVCLENBQUVKLFdBQXpCLDBHQUFzQ0MsRUFBdEMsa0ZBQTBDSSxNQUExQyxNQUFxRCxJQUF6RCxFQUErRDtBQUFBOztBQUM5RCxZQUNDLENBQUFELHVCQUF1QixTQUF2QixJQUFBQSx1QkFBdUIsV0FBdkIsWUFBQUEsdUJBQXVCLENBQUVFLEtBQXpCLE1BQW1DLCtDQUFuQyxJQUNBLENBQUMsQ0FBQ0YsdUJBQXVCLENBQUNHLFdBQTFCLEtBQTBDUixZQUQxQyxLQUVDLEVBQUNLLHVCQUFELGFBQUNBLHVCQUFELGlEQUFDQSx1QkFBdUIsQ0FBRUksWUFBMUIsMkRBQUMsdUJBQXVDQyxPQUF4QyxLQUNBLENBQUFMLHVCQUF1QixTQUF2QixJQUFBQSx1QkFBdUIsV0FBdkIsc0NBQUFBLHVCQUF1QixDQUFFSSxZQUF6Qiw0R0FBdUNSLFdBQXZDLDRHQUFvRFUsSUFBcEQsa0ZBQTBEQyxrQkFBMUQsTUFBaUYsS0FIbEYsQ0FERCxFQUtFO0FBQ0QsaUJBQU8sSUFBUDtBQUNBO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFQO0FBQ0EsS0FaTyxNQVlG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IjpbImltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgRW50aXR5U2V0LCBFbnRpdHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXJcIjtcbmltcG9ydCB7IEFubm90YXRpb25BY3Rpb24sIEJhc2VBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBEYXRhRmllbGRGb3JBY3Rpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IENvbnZlcnRlckNvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy90ZW1wbGF0ZXMvQmFzZUNvbnZlcnRlclwiO1xuXG4vKipcbiAqIFJldHJpZXZlIGFsbCB0aGUgZGF0YSBmaWVsZCBmb3IgYWN0aW9ucyBmb3IgdGhlIGlkZW50aWZpY2F0aW9uIGFubm90YXRpb25cbiAqIFRoZXkgbXVzdCBiZVxuICogLSBOb3Qgc3RhdGljYWxseSBoaWRkZW5cbiAqIC0gRWl0aGVyIGxpbmtlZCB0byBhbiBVbmJvdW5kIGFjdGlvbiBvciB0byBhbiBhY3Rpb24gd2hpY2ggaGFzIGFuIE9wZXJhdGlvbkF2YWlsYWJsZSBub3Qgc3RhdGljYWxseSBmYWxzZS5cbiAqXG4gKiBAcGFyYW0ge0VudGl0eVR5cGV9IGVudGl0eVR5cGUgdGhlIGN1cnJlbnQgZW50aXR5dHlwZVxuICogQHBhcmFtIHtib29sZWFufSBiRGV0ZXJtaW5pbmcgd2hldGhlciBvciBub3QgdGhlIGFjdGlvbiBzaG91bGQgYmUgZGV0ZXJtaW5pbmdcbiAqIEByZXR1cm5zIHtEYXRhRmllbGRGb3JBY3Rpb25UeXBlc1tdfSBhbiBhcnJheSBvZiBkYXRhZmllbGQgZm9yIGFjdGlvbiByZXNwZWN0aW5nIHRoZSBiRGV0ZXJtaW5pbmcgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElkZW50aWZpY2F0aW9uRGF0YUZpZWxkRm9yQWN0aW9ucyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCBiRGV0ZXJtaW5pbmc6IGJvb2xlYW4pOiBEYXRhRmllbGRGb3JBY3Rpb25UeXBlc1tdIHtcblx0cmV0dXJuIChlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uSWRlbnRpZmljYXRpb24/LmZpbHRlcihpZGVudGlmaWNhdGlvbkRhdGFGaWVsZCA9PiB7XG5cdFx0aWYgKGlkZW50aWZpY2F0aW9uRGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiAhPT0gdHJ1ZSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRpZGVudGlmaWNhdGlvbkRhdGFGaWVsZD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgJiZcblx0XHRcdFx0ISFpZGVudGlmaWNhdGlvbkRhdGFGaWVsZC5EZXRlcm1pbmluZyA9PT0gYkRldGVybWluaW5nICYmXG5cdFx0XHRcdCghaWRlbnRpZmljYXRpb25EYXRhRmllbGQ/LkFjdGlvblRhcmdldD8uaXNCb3VuZCB8fFxuXHRcdFx0XHRcdGlkZW50aWZpY2F0aW9uRGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGUgIT09IGZhbHNlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pIHx8IFtdKSBhcyBEYXRhRmllbGRGb3JBY3Rpb25UeXBlc1tdO1xufVxuXG5jb25zdCBJTVBPUlRBTlRfQ1JJVElDQUxJVElFUyA9IFtcblx0XCJVSS5Dcml0aWNhbGl0eVR5cGUvVmVyeVBvc2l0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL1ZlcnlOZWdhdGl2ZVwiXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZGVyRGVmYXVsdEFjdGlvbnMoZW50aXR5U2V0OiBFbnRpdHlTZXQsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCBvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA9IGVudGl0eVNldC5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCwgLy9mb3Igc3RpY2t5IGFwcFxuXHRcdG9EcmFmdFJvb3QgPSBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3QsXG5cdFx0b0VudGl0eURlbGV0ZVJlc3RyaWN0aW9ucyA9IGVudGl0eVNldC5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzPy5EZWxldGVSZXN0cmljdGlvbnMsXG5cdFx0YlVwZGF0ZUhpZGRlbiA9IGVudGl0eVNldC5hbm5vdGF0aW9ucy5VST8uVXBkYXRlSGlkZGVuO1xuXG5cdGNvbnN0IGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnMgPSBnZXRJZGVudGlmaWNhdGlvbkRhdGFGaWVsZEZvckFjdGlvbnMoZW50aXR5U2V0LmVudGl0eVR5cGUsIGZhbHNlKTtcblxuXHQvLyBGaXJzdCBhZGQgdGhlIFwiQ3JpdGljYWxcIiBEYXRhRmllbGRGb3JBY3Rpb25zXG5cdGNvbnN0IGhlYWRlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnNcblx0XHQuZmlsdGVyKGRhdGFGaWVsZCA9PiB7XG5cdFx0XHRyZXR1cm4gSU1QT1JUQU5UX0NSSVRJQ0FMSVRJRVMuaW5kZXhPZihkYXRhRmllbGQ/LkNyaXRpY2FsaXR5IGFzIHN0cmluZykgPiAtMTtcblx0XHR9KVxuXHRcdC5tYXAoZGF0YUZpZWxkID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uUGF0aEZyb21GdWxseVF1YWxpZmllZE5hbWUoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdGtleTogXCJEYXRhRmllbGRGb3JBY3Rpb246OlwiICsgZGF0YUZpZWxkPy5BY3Rpb24ucmVwbGFjZSgvXFwvL2csIFwiOjpcIiksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdC8vIFRoZW4gdGhlIGVkaXQgYWN0aW9uIGlmIGl0IGV4aXN0c1xuXHRpZiAoKG9EcmFmdFJvb3Q/LkVkaXRBY3Rpb24gfHwgb1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ/LkVkaXRBY3Rpb24pICYmIGJVcGRhdGVIaWRkZW4gIT09IHRydWUpIHtcblx0XHRoZWFkZXJBY3Rpb25zLnB1c2goeyB0eXBlOiBBY3Rpb25UeXBlLlByaW1hcnksIGtleTogXCJFZGl0QWN0aW9uXCIgfSk7XG5cdH1cblx0Ly8gVGhlbiB0aGUgZGVsZXRlIGFjdGlvbiBpZiB3ZSdyZSBub3Qgc3RhdGljYWxseSBub3QgZGVsZXRhYmxlXG5cdGlmIChvRW50aXR5RGVsZXRlUmVzdHJpY3Rpb25zPy5EZWxldGFibGUgIT09IGZhbHNlKSB7XG5cdFx0aGVhZGVyQWN0aW9ucy5wdXNoKHsgdHlwZTogQWN0aW9uVHlwZS5TZWNvbmRhcnksIGtleTogXCJEZWxldGVBY3Rpb25cIiB9KTtcblx0fVxuXG5cdC8vIEZpbmFsbHkgdGhlIG5vbiBjcml0aWNhbCBEYXRhRmllbGRGb3JBY3Rpb25zXG5cdGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnNcblx0XHQuZmlsdGVyKGRhdGFGaWVsZCA9PiB7XG5cdFx0XHRyZXR1cm4gSU1QT1JUQU5UX0NSSVRJQ0FMSVRJRVMuaW5kZXhPZihkYXRhRmllbGQ/LkNyaXRpY2FsaXR5IGFzIHN0cmluZykgPT09IC0xO1xuXHRcdH0pXG5cdFx0Lm1hcChkYXRhRmllbGQgPT4ge1xuXHRcdFx0aGVhZGVyQWN0aW9ucy5wdXNoKHtcblx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25QYXRoRnJvbUZ1bGx5UXVhbGlmaWVkTmFtZShkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0a2V5OiBcIkRhdGFGaWVsZEZvckFjdGlvbjo6XCIgKyBkYXRhRmllbGQ/LkFjdGlvbi5yZXBsYWNlKC9cXC8vZywgXCI6OlwiKSxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IHRydWVcblx0XHRcdH0gYXMgQW5ub3RhdGlvbkFjdGlvbik7XG5cdFx0fSk7XG5cblx0cmV0dXJuIGhlYWRlckFjdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyhlbnRpdHlTZXQ6IEVudGl0eVNldCwgdmlld0xldmVsOiBudW1iZXIsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCBvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA9IGVudGl0eVNldC5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCwgLy9mb3Igc3RpY2t5IGFwcFxuXHRcdHNFbnRpdHlTZXREcmFmdFJvb3QgPSBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Q/LnRlcm0gfHwgZW50aXR5U2V0LmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy50ZXJtLFxuXHRcdGJDb25kaXRpb25TYXZlID1cblx0XHRcdHNFbnRpdHlTZXREcmFmdFJvb3QgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiIHx8XG5cdFx0XHQob1N0aWNreVNlc3Npb25TdXBwb3J0ZWQgJiYgb1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ/LlNhdmVBY3Rpb24pLFxuXHRcdGJDb25kaXRpb25BcHBseSA9IHZpZXdMZXZlbCA+IDEsXG5cdFx0YkNvbmRpdGlvbkNhbmNlbCA9XG5cdFx0XHRzRW50aXR5U2V0RHJhZnRSb290ID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIiB8fFxuXHRcdFx0KG9TdGlja3lTZXNzaW9uU3VwcG9ydGVkICYmIG9TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5EaXNjYXJkQWN0aW9uKTtcblxuXHQvLyBSZXRyaWV2ZSBhbGwgZGV0ZXJtaW5pbmcgYWN0aW9uc1xuXHRjb25zdCBoZWFkZXJEYXRhRmllbGRGb3JBY3Rpb25zID0gZ2V0SWRlbnRpZmljYXRpb25EYXRhRmllbGRGb3JBY3Rpb25zKGVudGl0eVNldC5lbnRpdHlUeXBlLCB0cnVlKTtcblxuXHQvLyBGaXJzdCBhZGQgdGhlIFwiQ3JpdGljYWxcIiBEYXRhRmllbGRGb3JBY3Rpb25zXG5cdGNvbnN0IGZvb3RlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnNcblx0XHQuZmlsdGVyKGRhdGFGaWVsZCA9PiB7XG5cdFx0XHRyZXR1cm4gSU1QT1JUQU5UX0NSSVRJQ0FMSVRJRVMuaW5kZXhPZihkYXRhRmllbGQ/LkNyaXRpY2FsaXR5IGFzIHN0cmluZykgPiAtMTtcblx0XHR9KVxuXHRcdC5tYXAoZGF0YUZpZWxkID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uUGF0aEZyb21GdWxseVF1YWxpZmllZE5hbWUoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdGtleTogXCJEYXRhRmllbGRGb3JBY3Rpb246OlwiICsgZGF0YUZpZWxkPy5BY3Rpb24ucmVwbGFjZSgvXFwvL2csIFwiOjpcIiksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9O1xuXHRcdH0pO1xuXG5cdC8vIFRoZW4gdGhlIHNhdmUgYWN0aW9uIGlmIGl0IGV4aXN0c1xuXHRpZiAoYkNvbmRpdGlvblNhdmUpIHtcblx0XHRmb290ZXJBY3Rpb25zLnB1c2goeyB0eXBlOiBBY3Rpb25UeXBlLlByaW1hcnksIGtleTogXCJTYXZlQWN0aW9uXCIgfSk7XG5cdH1cblxuXHQvLyBUaGVuIHRoZSBhcHBseSBhY3Rpb24gaWYgaXQgZXhpc3RzXG5cdGlmIChiQ29uZGl0aW9uQXBwbHkpIHtcblx0XHRmb290ZXJBY3Rpb25zLnB1c2goeyB0eXBlOiBBY3Rpb25UeXBlLkRlZmF1bHRBcHBseSwga2V5OiBcIkFwcGx5QWN0aW9uXCIgfSk7XG5cdH1cblxuXHQvLyBUaGVuIHRoZSBub24gY3JpdGljYWwgRGF0YUZpZWxkRm9yQWN0aW9uc1xuXHRoZWFkZXJEYXRhRmllbGRGb3JBY3Rpb25zXG5cdFx0LmZpbHRlcihkYXRhRmllbGQgPT4ge1xuXHRcdFx0cmV0dXJuIElNUE9SVEFOVF9DUklUSUNBTElUSUVTLmluZGV4T2YoZGF0YUZpZWxkPy5Dcml0aWNhbGl0eSBhcyBzdHJpbmcpID09PSAtMTtcblx0XHR9KVxuXHRcdC5tYXAoZGF0YUZpZWxkID0+IHtcblx0XHRcdGZvb3RlckFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uUGF0aEZyb21GdWxseVF1YWxpZmllZE5hbWUoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdGtleTogXCJEYXRhRmllbGRGb3JBY3Rpb246OlwiICsgZGF0YUZpZWxkPy5BY3Rpb24ucmVwbGFjZSgvXFwvL2csIFwiOjpcIiksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9IGFzIEFubm90YXRpb25BY3Rpb24pO1xuXHRcdH0pO1xuXG5cdC8vIFRoZW4gdGhlIGNhbmNlbCBhY3Rpb24gaWYgaXQgZXhpc3RzXG5cdGlmIChiQ29uZGl0aW9uQ2FuY2VsKSB7XG5cdFx0Zm9vdGVyQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0a2V5OiBcIkNhbmNlbEFjdGlvblwiLFxuXHRcdFx0cG9zaXRpb246IHsgcGxhY2VtZW50OiBQbGFjZW1lbnQuRW5kIH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZm9vdGVyQWN0aW9ucztcbn1cbiJdfQ==