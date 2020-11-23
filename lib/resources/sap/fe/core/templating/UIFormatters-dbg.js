sap.ui.define(["sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingExpression", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/templating/PropertyHelper"], function (MetaModelConverter, BindingExpression, BindingHelper, PropertyHelper) {
  "use strict";

  var _exports = {};
  var isPathExpression = PropertyHelper.isPathExpression;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var isReadOnlyExpression = PropertyHelper.isReadOnlyExpression;
  var isNonEditableExpression = PropertyHelper.isNonEditableExpression;
  var isKey = PropertyHelper.isKey;
  var isImmutable = PropertyHelper.isImmutable;
  var isDisabledExpression = PropertyHelper.isDisabledExpression;
  var isComputed = PropertyHelper.isComputed;
  var hasValueHelp = PropertyHelper.hasValueHelp;
  var hasSemanticObject = PropertyHelper.hasSemanticObject;
  var UI = BindingHelper.UI;
  var constant = BindingExpression.constant;
  var bindingExpression = BindingExpression.bindingExpression;
  var or = BindingExpression.or;
  var isConstant = BindingExpression.isConstant;
  var ifElse = BindingExpression.ifElse;
  var equals = BindingExpression.equals;
  var compileBinding = BindingExpression.compileBinding;
  var and = BindingExpression.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;

  /**
   * Create the expression to generate an "editable" boolean value.
   *
   * @param {PropertyPath} oPropertyPath the input property
   * @param {boolean} bAsObject whether or not this should be returned as an object or a binding string
   * @returns {string} the binding string
   */
  var getEditableExpression = function (oPropertyPath) {
    var bAsObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!oPropertyPath || typeof oPropertyPath === "string") {
      return compileBinding(false);
    }

    var oProperty = isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath; // Editability depends on the field control expression
    // If the Field control is statically in ReadOnly or Inapplicable (disabled) -> not editable
    // If the property is a key -> not editable except in creation if not computed
    // If the property is computed -> not editable
    // If the property is immutable -> not editable except in creation
    // If the property has a SemanticObject and no ValueList defined -> not editable
    // If the Field control is a path resolving to ReadOnly or Inapplicable (disabled) (<= 1) -> not editable
    // Else, to be editable you need
    // immutable and key while in the creation row
    // ui/isEditable

    var editableExpression = ifElse(or(isComputed(oProperty), isKey(oProperty), isImmutable(oProperty), hasSemanticObject(oProperty) && !hasValueHelp(oProperty), isNonEditableExpression(oProperty)), ifElse(isImmutable(oProperty) || isKey(oProperty) && !isComputed(oProperty), UI.IsTransientBinding, false), UI.IsEditable);

    if (bAsObject) {
      return editableExpression;
    }

    return compileBinding(editableExpression);
  };

  _exports.getEditableExpression = getEditableExpression;

  var getUpdatableExpression = function (oUpdateRestrictions, oPropertyPath) {
    var _oUpdateRestrictions$;

    var oUpdatable = true; // if the field comes from a navigation entity, then the entity must be added to the path of updatable

    var sPath = isPathExpression(oPropertyPath) ? oPropertyPath.path : "";
    var sSource = sPath.indexOf("/") > -1 ? sPath.split("/")[0] : "";

    if (typeof oUpdateRestrictions.Updatable === "boolean") {
      oUpdatable = constant(oUpdateRestrictions.Updatable);
    } else if ((_oUpdateRestrictions$ = oUpdateRestrictions.Updatable) === null || _oUpdateRestrictions$ === void 0 ? void 0 : _oUpdateRestrictions$.$Path) {
      var _oUpdateRestrictions$2;

      var sUpdatablePath = (sSource ? sSource + "/" : "") + ((_oUpdateRestrictions$2 = oUpdateRestrictions.Updatable) === null || _oUpdateRestrictions$2 === void 0 ? void 0 : _oUpdateRestrictions$2.$Path);
      oUpdatable = bindingExpression(sUpdatablePath);
    }

    return equals(oUpdatable, constant(true));
  };
  /**
   * Create the expression to generate an "enabled" boolean value.
   *
   * @param {PropertyPath} oPropertyPath the input property
   * @param {boolean} bAsObject whether or not this should be returned as an object or a binding string
   * @returns {string} the binding string
   */


  _exports.getUpdatableExpression = getUpdatableExpression;

  var getEnabledExpression = function (oPropertyPath) {
    var bAsObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!oPropertyPath || typeof oPropertyPath === "string") {
      return compileBinding(true);
    }

    var oProperty = isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath; // Enablement depends on the field control expression
    // If the Field control is statically in Inapplicable (disabled) -> not enabled

    var enabledExpression = ifElse(isDisabledExpression(oProperty), false, true);

    if (bAsObject) {
      return enabledExpression;
    }

    return compileBinding(enabledExpression);
  };
  /**
   * Create the expression to generate an "editMode" enum value.
   * @param {PropertyPath} oPropertyPath the input property
   * @param {string} sStaticEditMode a potentially static outside editmode
   * @param {string} sUsageContext the context in which this is used
   * @param {boolean} bAsObject return this as a BindingPart
   * @param oUpdateRestrictions
   * @returns {BindingExpression<string> | BindingPart<string>} the binding string or part
   */


  _exports.getEnabledExpression = getEnabledExpression;

  var getEditMode = function (oPropertyPath) {
    var sStaticEditMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    var sUsageContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var bAsObject = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var oUpdateRestrictions = arguments.length > 4 ? arguments[4] : undefined;

    if (!oPropertyPath || typeof oPropertyPath === "string") {
      return "Display";
    }

    var oProperty = isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath; // if the property is not enabled => Disabled
    // if the property is enabled && not editable => ReadOnly
    // if the property is enabled && editable => Editable
    // If there is an associated unit, and it has a field control also use consider the following
    // if the unit field control is readonly -> EditableReadOnly
    // otherwise -> Editable

    if (sStaticEditMode === "Display" || sStaticEditMode === "ReadOnly" || sStaticEditMode === "Disabled") {
      return compileBinding(sStaticEditMode);
    }

    var editableExpression = getEditableExpression(oPropertyPath, true);

    if (sStaticEditMode === "Editable") {
      // If we're statically Editable this means we expect to be creatable
      editableExpression = ifElse(or(isComputed(oProperty), hasSemanticObject(oProperty) && !hasValueHelp(oProperty)), false, true);
    } else if (sUsageContext === "CreationRow") {
      editableExpression = ifElse(or(isComputed(oProperty), hasSemanticObject(oProperty) && !hasValueHelp(oProperty), isNonEditableExpression(oProperty)), false, UI.IsEditable);
    }

    var enabledExpression = getEnabledExpression(oPropertyPath, true);
    var unitProperty = getAssociatedUnitProperty(oProperty);
    var resultExpression = "Editable";

    if (unitProperty) {
      resultExpression = ifElse(or(isReadOnlyExpression(unitProperty), isComputed(unitProperty)), "EditableReadOnly", "Editable");
    }

    var readOnlyExpression = isReadOnlyExpression(oProperty);
    var editModeExpression = ifElse(enabledExpression, ifElse(editableExpression, resultExpression, ifElse(and(!isConstant(readOnlyExpression) && readOnlyExpression, UI.IsEditable), "ReadOnly", "Display")), "Disabled");

    if (oUpdateRestrictions) {
      // if the property is from a non-updatable entity => Read only mode, previously calculated edit Mode is ignored
      // if the property is from an updatable entity => previously calculated edit Mode expression
      var oUpdatableExp = getUpdatableExpression(oUpdateRestrictions, oPropertyPath);
      editModeExpression = ifElse(oUpdatableExp, editModeExpression, "Display");
    }

    if (bAsObject) {
      return editModeExpression;
    }

    return compileBinding(editModeExpression);
  };

  _exports.getEditMode = getEditMode;

  var getFieldDisplay = function (oPropertyPath, oEntityPath) {
    var _oProperty$annotation, _oProperty$annotation2, _oTextAnnotation$anno, _oTextAnnotation$anno2, _oEntitySet$entityTyp, _oEntitySet$entityTyp2, _oEntitySet$entityTyp3;

    var sStaticEditMode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var sUsageContext = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
    var oUpdateRestrictions = arguments.length > 4 ? arguments[4] : undefined;

    if (!oPropertyPath || typeof oPropertyPath === "string") {
      return "Display";
    }

    var oProperty = isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath;
    var oEntitySet = isPathExpression(oEntityPath) && oEntityPath.$target || oEntityPath;
    var oTextAnnotation = (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Text;
    var oTextArrangementAnnotation = (oTextAnnotation === null || oTextAnnotation === void 0 ? void 0 : (_oTextAnnotation$anno = oTextAnnotation.annotations) === null || _oTextAnnotation$anno === void 0 ? void 0 : (_oTextAnnotation$anno2 = _oTextAnnotation$anno.UI) === null || _oTextAnnotation$anno2 === void 0 ? void 0 : _oTextAnnotation$anno2.TextArrangement) || (oEntitySet === null || oEntitySet === void 0 ? void 0 : (_oEntitySet$entityTyp = oEntitySet.entityType) === null || _oEntitySet$entityTyp === void 0 ? void 0 : (_oEntitySet$entityTyp2 = _oEntitySet$entityTyp.annotations) === null || _oEntitySet$entityTyp2 === void 0 ? void 0 : (_oEntitySet$entityTyp3 = _oEntitySet$entityTyp2.UI) === null || _oEntitySet$entityTyp3 === void 0 ? void 0 : _oEntitySet$entityTyp3.TextArrangement);
    var sDisplayValue = oTextAnnotation ? "DescriptionValue" : "Value";

    if (oTextAnnotation && oTextArrangementAnnotation) {
      if (oTextArrangementAnnotation === "UI.TextArrangementType/TextOnly") {
        sDisplayValue = "Description";
      } else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextLast") {
        sDisplayValue = "ValueDescription";
      } else {
        //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
        sDisplayValue = "DescriptionValue";
      }
    }

    if (hasValueHelp(oProperty)) {
      // Predefined display mode
      return compileBinding(sDisplayValue);
    } else {
      if (sDisplayValue !== "Description" && sUsageContext === "VHTable") {
        sDisplayValue = "Value";
      }

      return compileBinding(ifElse(equals(getEditMode(oPropertyPath, sStaticEditMode, sUsageContext, true, oUpdateRestrictions), "Editable"), "Value", sDisplayValue));
    }
  };
  /**
   * Formatter helper to retrieve the converterContext from the metamodel context.
   *
   * @param {Context} oContext the original metamodel context
   * @param {object} oInterface the current templating context
   * @returns {object} the converter context representing that object
   */


  _exports.getFieldDisplay = getFieldDisplay;

  var getConverterContext = function (oContext, oInterface) {
    if (oInterface && oInterface.context) {
      return convertMetaModelContext(oInterface.context);
    }

    return null;
  };

  getConverterContext.requiresIContext = true;
  _exports.getConverterContext = getConverterContext;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVJRm9ybWF0dGVycy50cyJdLCJuYW1lcyI6WyJnZXRFZGl0YWJsZUV4cHJlc3Npb24iLCJvUHJvcGVydHlQYXRoIiwiYkFzT2JqZWN0IiwiY29tcGlsZUJpbmRpbmciLCJvUHJvcGVydHkiLCJpc1BhdGhFeHByZXNzaW9uIiwiJHRhcmdldCIsImVkaXRhYmxlRXhwcmVzc2lvbiIsImlmRWxzZSIsIm9yIiwiaXNDb21wdXRlZCIsImlzS2V5IiwiaXNJbW11dGFibGUiLCJoYXNTZW1hbnRpY09iamVjdCIsImhhc1ZhbHVlSGVscCIsImlzTm9uRWRpdGFibGVFeHByZXNzaW9uIiwiVUkiLCJJc1RyYW5zaWVudEJpbmRpbmciLCJJc0VkaXRhYmxlIiwiZ2V0VXBkYXRhYmxlRXhwcmVzc2lvbiIsIm9VcGRhdGVSZXN0cmljdGlvbnMiLCJvVXBkYXRhYmxlIiwic1BhdGgiLCJwYXRoIiwic1NvdXJjZSIsImluZGV4T2YiLCJzcGxpdCIsIlVwZGF0YWJsZSIsImNvbnN0YW50IiwiJFBhdGgiLCJzVXBkYXRhYmxlUGF0aCIsImJpbmRpbmdFeHByZXNzaW9uIiwiZXF1YWxzIiwiZ2V0RW5hYmxlZEV4cHJlc3Npb24iLCJlbmFibGVkRXhwcmVzc2lvbiIsImlzRGlzYWJsZWRFeHByZXNzaW9uIiwiZ2V0RWRpdE1vZGUiLCJzU3RhdGljRWRpdE1vZGUiLCJzVXNhZ2VDb250ZXh0IiwidW5pdFByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsInJlc3VsdEV4cHJlc3Npb24iLCJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsInJlYWRPbmx5RXhwcmVzc2lvbiIsImVkaXRNb2RlRXhwcmVzc2lvbiIsImFuZCIsImlzQ29uc3RhbnQiLCJvVXBkYXRhYmxlRXhwIiwiZ2V0RmllbGREaXNwbGF5Iiwib0VudGl0eVBhdGgiLCJvRW50aXR5U2V0Iiwib1RleHRBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0Iiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCJUZXh0QXJyYW5nZW1lbnQiLCJlbnRpdHlUeXBlIiwic0Rpc3BsYXlWYWx1ZSIsImdldENvbnZlcnRlckNvbnRleHQiLCJvQ29udGV4dCIsIm9JbnRlcmZhY2UiLCJjb250ZXh0IiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJyZXF1aXJlc0lDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NBOzs7Ozs7O0FBT08sTUFBTUEscUJBQXFCLEdBQUcsVUFDcENDLGFBRG9DLEVBR2dCO0FBQUEsUUFEcERDLFNBQ29ELHVFQUQvQixLQUMrQjs7QUFDcEQsUUFBSSxDQUFDRCxhQUFELElBQWtCLE9BQU9BLGFBQVAsS0FBeUIsUUFBL0MsRUFBeUQ7QUFDeEQsYUFBT0UsY0FBYyxDQUFDLEtBQUQsQ0FBckI7QUFDQTs7QUFDRCxRQUFNQyxTQUFtQixHQUFJQyxnQkFBZ0IsQ0FBQ0osYUFBRCxDQUFoQixJQUFtQ0EsYUFBYSxDQUFDSyxPQUFsRCxJQUErREwsYUFBM0YsQ0FKb0QsQ0FLcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsUUFBTU0sa0JBQWtCLEdBQUdDLE1BQU0sQ0FDaENDLEVBQUUsQ0FDREMsVUFBVSxDQUFDTixTQUFELENBRFQsRUFFRE8sS0FBSyxDQUFDUCxTQUFELENBRkosRUFHRFEsV0FBVyxDQUFDUixTQUFELENBSFYsRUFJRFMsaUJBQWlCLENBQUNULFNBQUQsQ0FBakIsSUFBZ0MsQ0FBQ1UsWUFBWSxDQUFDVixTQUFELENBSjVDLEVBS0RXLHVCQUF1QixDQUFDWCxTQUFELENBTHRCLENBRDhCLEVBUWhDSSxNQUFNLENBQUNJLFdBQVcsQ0FBQ1IsU0FBRCxDQUFYLElBQTJCTyxLQUFLLENBQUNQLFNBQUQsQ0FBTCxJQUFvQixDQUFDTSxVQUFVLENBQUNOLFNBQUQsQ0FBM0QsRUFBeUVZLEVBQUUsQ0FBQ0Msa0JBQTVFLEVBQWdHLEtBQWhHLENBUjBCLEVBU2hDRCxFQUFFLENB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LGFBQWpDLEVBQWdELElBQWhELEVBQXNEbEIsbUJBQXRELENBQVosRUFBd0YsVUFBeEYsQ0FERCxFQUVMLE9BRkssRUFHTHNDLGFBSEssQ0FEYyxDQUFyQjtBQU9BO0FBQ0QsR0EzQ007QUE2Q1A7Ozs7Ozs7Ozs7O0FBT08sTUFBTUMsbUJBQW1CLEdBQUcsVUFBU0MsUUFBVCxFQUE0QkMsVUFBNUIsRUFBNEQ7QUFDOUYsUUFBSUEsVUFBVSxJQUFJQSxVQUFVLENBQUNDLE9BQTdCLEVBQXNDO0FBQ3JDLGFBQU9DLHVCQUF1QixDQUFDRixVQUFVLENBQUNDLE9BQVosQ0FBOUI7QUFDQTs7QUFDRCxXQUFPLElBQVA7QUFDQSxHQUxNOztBQU1QSCxFQUFBQSxtQkFBbUIsQ0FBQ0ssZ0JBQXBCLEdBQXVDLElBQXZDIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NFwiO1xuaW1wb3J0IHsgY29udmVydE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0QmluZGluZ0V4cHJlc3Npb24sXG5cdEJpbmRpbmdQYXJ0LFxuXHRjb21waWxlQmluZGluZyxcblx0ZXF1YWxzLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdG9yLFxuXHRiaW5kaW5nRXhwcmVzc2lvbixcblx0Y29uc3RhbnRcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ0V4cHJlc3Npb25cIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQge1xuXHRoYXNTZW1hbnRpY09iamVjdCxcblx0aGFzVmFsdWVIZWxwLFxuXHRpc0NvbXB1dGVkLFxuXHRpc0Rpc2FibGVkRXhwcmVzc2lvbixcblx0aXNJbW11dGFibGUsXG5cdGlzS2V5LFxuXHRpc05vbkVkaXRhYmxlRXhwcmVzc2lvbixcblx0aXNSZWFkT25seUV4cHJlc3Npb24sXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHksXG5cdGlzUGF0aEV4cHJlc3Npb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IFByb3BlcnR5UGF0aCwgQW5ub3RhdGlvblRlcm0gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEVudGl0eVNldCwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlclwiO1xuaW1wb3J0IHsgUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3R5cGVzL0VkbVwiO1xuaW1wb3J0IHsgVXBkYXRlUmVzdHJpY3Rpb25zVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9kaXN0L2dlbmVyYXRlZC9DYXBhYmlsaXRpZXNcIjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlPclBhdGg8UD4gPSBzdHJpbmcgfCBQIHwgUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFA+O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgZXhwcmVzc2lvbiB0byBnZW5lcmF0ZSBhbiBcImVkaXRhYmxlXCIgYm9vbGVhbiB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1Byb3BlcnR5UGF0aH0gb1Byb3BlcnR5UGF0aCB0aGUgaW5wdXQgcHJvcGVydHlcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYkFzT2JqZWN0IHdoZXRoZXIgb3Igbm90IHRoaXMgc2hvdWxkIGJlIHJldHVybmVkIGFzIGFuIG9iamVjdCBvciBhIGJpbmRpbmcgc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYmluZGluZyBzdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVkaXRhYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uKFxuXHRvUHJvcGVydHlQYXRoOiBQcm9wZXJ0eU9yUGF0aDxQcm9wZXJ0eT4sXG5cdGJBc09iamVjdDogYm9vbGVhbiA9IGZhbHNlXG4pOiBCaW5kaW5nRXhwcmVzc2lvbjxib29sZWFuPiB8IEJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0aWYgKCFvUHJvcGVydHlQYXRoIHx8IHR5cGVvZiBvUHJvcGVydHlQYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVCaW5kaW5nKGZhbHNlKTtcblx0fVxuXHRjb25zdCBvUHJvcGVydHk6IFByb3BlcnR5ID0gKGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCkgJiYgb1Byb3BlcnR5UGF0aC4kdGFyZ2V0KSB8fCAob1Byb3BlcnR5UGF0aCBhcyBQcm9wZXJ0eSk7XG5cdC8vIEVkaXRhYmlsaXR5IGRlcGVuZHMgb24gdGhlIGZpZWxkIGNvbnRyb2wgZXhwcmVzc2lvblxuXHQvLyBJZiB0aGUgRmllbGQgY29udHJvbCBpcyBzdGF0aWNhbGx5IGluIFJlYWRPbmx5IG9yIEluYXBwbGljYWJsZSAoZGlzYWJsZWQpIC0+IG5vdCBlZGl0YWJsZVxuXHQvLyBJZiB0aGUgcHJvcGVydHkgaXMgYSBrZXkgLT4gbm90IGVkaXRhYmxlIGV4Y2VwdCBpbiBjcmVhdGlvbiBpZiBub3QgY29tcHV0ZWRcblx0Ly8gSWYgdGhlIHByb3BlcnR5IGlzIGNvbXB1dGVkIC0+IG5vdCBlZGl0YWJsZVxuXHQvLyBJZiB0aGUgcHJvcGVydHkgaXMgaW1tdXRhYmxlIC0+IG5vdCBlZGl0YWJsZSBleGNlcHQgaW4gY3JlYXRpb25cblx0Ly8gSWYgdGhlIHByb3BlcnR5IGhhcyBhIFNlbWFudGljT2JqZWN0IGFuZCBubyBWYWx1ZUxpc3QgZGVmaW5lZCAtPiBub3QgZWRpdGFibGVcblx0Ly8gSWYgdGhlIEZpZWxkIGNvbnRyb2wgaXMgYSBwYXRoIHJlc29sdmluZyB0byBSZWFkT25seSBvciBJbmFwcGxpY2FibGUgKGRpc2FibGVkKSAoPD0gMSkgLT4gbm90IGVkaXRhYmxlXG5cdC8vIEVsc2UsIHRvIGJlIGVkaXRhYmxlIHlvdSBuZWVkXG5cdC8vIGltbXV0YWJsZSBhbmQga2V5IHdoaWxlIGluIHRoZSBjcmVhdGlvbiByb3dcblx0Ly8gdWkvaXNFZGl0YWJsZVxuXHRjb25zdCBlZGl0YWJsZUV4cHJlc3Npb24gPSBpZkVsc2UoXG5cdFx0b3IoXG5cdFx0XHRpc0NvbXB1dGVkKG9Qcm9wZXJ0eSksXG5cdFx0XHRpc0tleShvUHJvcGVydHkpLFxuXHRcdFx0aXNJbW11dGFibGUob1Byb3BlcnR5KSxcblx0XHRcdGhhc1NlbWFudGljT2JqZWN0KG9Qcm9wZXJ0eSkgJiYgIWhhc1ZhbHVlSGVscChvUHJvcGVydHkpLFxuXHRcdFx0aXNOb25FZGl0YWJsZUV4cHJlc3Npb24ob1Byb3BlcnR5KVxuXHRcdCksXG5cdFx0aWZFbHNlKGlzSW1tdXRhYmxlKG9Qcm9wZXJ0eSkgfHwgKGlzS2V5KG9Qcm9wZXJ0eSkgJiYgIWlzQ29tcHV0ZWQob1Byb3BlcnR5KSksIFVJLklzVHJhbnNpZW50QmluZGluZywgZmFsc2UpLFxuXHRcdFVJLklzRWRpdGFibGVcblx0KTtcblx0aWYgKGJBc09iamVjdCkge1xuXHRcdHJldHVybiBlZGl0YWJsZUV4cHJlc3Npb247XG5cdH1cblx0cmV0dXJuIGNvbXBpbGVCaW5kaW5nKGVkaXRhYmxlRXhwcmVzc2lvbik7XG59O1xuZXhwb3J0IGNvbnN0IGdldFVwZGF0YWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbihcblx0b1VwZGF0ZVJlc3RyaWN0aW9uczogQW5ub3RhdGlvblRlcm08YW55Pixcblx0b1Byb3BlcnR5UGF0aDogUHJvcGVydHlPclBhdGg8UHJvcGVydHk+XG4pOiBCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdGxldCBvVXBkYXRhYmxlOiBCaW5kaW5nUGFydDxib29sZWFuPiA9IHRydWU7XG5cdC8vIGlmIHRoZSBmaWVsZCBjb21lcyBmcm9tIGEgbmF2aWdhdGlvbiBlbnRpdHksIHRoZW4gdGhlIGVudGl0eSBtdXN0IGJlIGFkZGVkIHRvIHRoZSBwYXRoIG9mIHVwZGF0YWJsZVxuXHRjb25zdCBzUGF0aCA9IGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCkgPyBvUHJvcGVydHlQYXRoLnBhdGggOiBcIlwiO1xuXHRjb25zdCBzU291cmNlID0gc1BhdGguaW5kZXhPZihcIi9cIikgPiAtMSA/IHNQYXRoLnNwbGl0KFwiL1wiKVswXSA6IFwiXCI7XG5cdGlmICh0eXBlb2Ygb1VwZGF0ZVJlc3RyaWN0aW9ucy5VcGRhdGFibGUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0b1VwZGF0YWJsZSA9IGNvbnN0YW50KG9VcGRhdGVSZXN0cmljdGlvbnMuVXBkYXRhYmxlKTtcblx0fSBlbHNlIGlmIChvVXBkYXRlUmVzdHJpY3Rpb25zLlVwZGF0YWJsZT8uJFBhdGgpIHtcblx0XHRjb25zdCBzVXBkYXRhYmxlUGF0aCA9IChzU291cmNlID8gc1NvdXJjZSArIFwiL1wiIDogXCJcIikgKyBvVXBkYXRlUmVzdHJpY3Rpb25zLlVwZGF0YWJsZT8uJFBhdGg7XG5cdFx0b1VwZGF0YWJsZSA9IGJpbmRpbmdFeHByZXNzaW9uKHNVcGRhdGFibGVQYXRoKTtcblx0fVxuXHRyZXR1cm4gZXF1YWxzKG9VcGRhdGFibGUsIGNvbnN0YW50KHRydWUpKTtcbn07XG4vKipcbiAqIENyZWF0ZSB0aGUgZXhwcmVzc2lvbiB0byBnZW5lcmF0ZSBhbiBcImVuYWJsZWRcIiBib29sZWFuIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHlQYXRofSBvUHJvcGVydHlQYXRoIHRoZSBpbnB1dCBwcm9wZXJ0eVxuICogQHBhcmFtIHtib29sZWFufSBiQXNPYmplY3Qgd2hldGhlciBvciBub3QgdGhpcyBzaG91bGQgYmUgcmV0dXJuZWQgYXMgYW4gb2JqZWN0IG9yIGEgYmluZGluZyBzdHJpbmdcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBiaW5kaW5nIHN0cmluZ1xuICovXG5leHBvcnQgY29uc3QgZ2V0RW5hYmxlZEV4cHJlc3Npb24gPSBmdW5jdGlvbihcblx0b1Byb3BlcnR5UGF0aDogUHJvcGVydHlPclBhdGg8UHJvcGVydHk+LFxuXHRiQXNPYmplY3Q6IGJvb2xlYW4gPSBmYWxzZVxuKTogQmluZGluZ0V4cHJlc3Npb248Ym9vbGVhbj4gfCBCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdGlmICghb1Byb3BlcnR5UGF0aCB8fCB0eXBlb2Ygb1Byb3BlcnR5UGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBjb21waWxlQmluZGluZyh0cnVlKTtcblx0fVxuXHRjb25zdCBvUHJvcGVydHkgPSAoaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlQYXRoKSAmJiBvUHJvcGVydHlQYXRoLiR0YXJnZXQpIHx8IChvUHJvcGVydHlQYXRoIGFzIFByb3BlcnR5KTtcblx0Ly8gRW5hYmxlbWVudCBkZXBlbmRzIG9uIHRoZSBmaWVsZCBjb250cm9sIGV4cHJlc3Npb25cblx0Ly8gSWYgdGhlIEZpZWxkIGNvbnRyb2wgaXMgc3RhdGljYWxseSBpbiBJbmFwcGxpY2FibGUgKGRpc2FibGVkKSAtPiBub3QgZW5hYmxlZFxuXHRjb25zdCBlbmFibGVkRXhwcmVzc2lvbiA9IGlmRWxzZShpc0Rpc2FibGVkRXhwcmVzc2lvbihvUHJvcGVydHkpLCBmYWxzZSwgdHJ1ZSk7XG5cdGlmIChiQXNPYmplY3QpIHtcblx0XHRyZXR1cm4gZW5hYmxlZEV4cHJlc3Npb247XG5cdH1cblx0cmV0dXJuIGNvbXBpbGVCaW5kaW5nKGVuYWJsZWRFeHByZXNzaW9uKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBleHByZXNzaW9uIHRvIGdlbmVyYXRlIGFuIFwiZWRpdE1vZGVcIiBlbnVtIHZhbHVlLlxuICogQHBhcmFtIHtQcm9wZXJ0eVBhdGh9IG9Qcm9wZXJ0eVBhdGggdGhlIGlucHV0IHByb3BlcnR5XG4gKiBAcGFyYW0ge3N0cmluZ30gc1N0YXRpY0VkaXRNb2RlIGEgcG90ZW50aWFsbHkgc3RhdGljIG91dHNpZGUgZWRpdG1vZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzVXNhZ2VDb250ZXh0IHRoZSBjb250ZXh0IGluIHdoaWNoIHRoaXMgaXMgdXNlZFxuICogQHBhcmFtIHtib29sZWFufSBiQXNPYmplY3QgcmV0dXJuIHRoaXMgYXMgYSBCaW5kaW5nUGFydFxuICogQHBhcmFtIG9VcGRhdGVSZXN0cmljdGlvbnNcbiAqIEByZXR1cm5zIHtCaW5kaW5nRXhwcmVzc2lvbjxzdHJpbmc+IHwgQmluZGluZ1BhcnQ8c3RyaW5nPn0gdGhlIGJpbmRpbmcgc3RyaW5nIG9yIHBhcnRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVkaXRNb2RlID0gZnVuY3Rpb24oXG5cdG9Qcm9wZXJ0eVBhdGg6IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5Pixcblx0c1N0YXRpY0VkaXRNb2RlOiBzdHJpbmcgPSBcIlwiLFxuXHRzVXNhZ2VDb250ZXh0OiBzdHJpbmcgPSBcIlwiLFxuXHRiQXNPYmplY3Q6IGJvb2xlYW4gPSBmYWxzZSxcblx0b1VwZGF0ZVJlc3RyaWN0aW9ucz86IEFubm90YXRpb25UZXJtPFVwZGF0ZVJlc3RyaWN0aW9uc1R5cGU+XG4pOiBCaW5kaW5nRXhwcmVzc2lvbjxzdHJpbmc+IHwgQmluZGluZ1BhcnQ8c3RyaW5nPiB7XG5cdGlmICghb1Byb3BlcnR5UGF0aCB8fCB0eXBlb2Ygb1Byb3BlcnR5UGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHJldHVybiBcIkRpc3BsYXlcIjtcblx0fVxuXHRjb25zdCBvUHJvcGVydHkgPSAoaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlQYXRoKSAmJiBvUHJvcGVydHlQYXRoLiR0YXJnZXQpIHx8IChvUHJvcGVydHlQYXRoIGFzIFByb3BlcnR5KTtcblx0Ly8gaWYgdGhlIHByb3BlcnR5IGlzIG5vdCBlbmFibGVkID0+IERpc2FibGVkXG5cdC8vIGlmIHRoZSBwcm9wZXJ0eSBpcyBlbmFibGVkICYmIG5vdCBlZGl0YWJsZSA9PiBSZWFkT25seVxuXHQvLyBpZiB0aGUgcHJvcGVydHkgaXMgZW5hYmxlZCAmJiBlZGl0YWJsZSA9PiBFZGl0YWJsZVxuXHQvLyBJZiB0aGVyZSBpcyBhbiBhc3NvY2lhdGVkIHVuaXQsIGFuZCBpdCBoYXMgYSBmaWVsZCBjb250cm9sIGFsc28gdXNlIGNvbnNpZGVyIHRoZSBmb2xsb3dpbmdcblx0Ly8gaWYgdGhlIHVuaXQgZmllbGQgY29udHJvbCBpcyByZWFkb25seSAtPiBFZGl0YWJsZVJlYWRPbmx5XG5cdC8vIG90aGVyd2lzZSAtPiBFZGl0YWJsZVxuXHRpZiAoc1N0YXRpY0VkaXRNb2RlID09PSBcIkRpc3BsYXlcIiB8fCBzU3RhdGljRWRpdE1vZGUgPT09IFwiUmVhZE9ubHlcIiB8fCBzU3RhdGljRWRpdE1vZGUgPT09IFwiRGlzYWJsZWRcIikge1xuXHRcdHJldHVybiBjb21waWxlQmluZGluZyhzU3RhdGljRWRpdE1vZGUpO1xuXHR9XG5cdGxldCBlZGl0YWJsZUV4cHJlc3Npb24gPSBnZXRFZGl0YWJsZUV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCwgdHJ1ZSkgYXMgQmluZGluZ1BhcnQ8Ym9vbGVhbj47XG5cdGlmIChzU3RhdGljRWRpdE1vZGUgPT09IFwiRWRpdGFibGVcIikge1xuXHRcdC8vIElmIHdlJ3JlIHN0YXRpY2FsbHkgRWRpdGFibGUgdGhpcyBtZWFucyB3ZSBleHBlY3QgdG8gYmUgY3JlYXRhYmxlXG5cdFx0ZWRpdGFibGVFeHByZXNzaW9uID0gaWZFbHNlKG9yKGlzQ29tcHV0ZWQob1Byb3BlcnR5KSwgaGFzU2VtYW50aWNPYmplY3Qob1Byb3BlcnR5KSAmJiAhaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eSkpLCBmYWxzZSwgdHJ1ZSk7XG5cdH0gZWxzZSBpZiAoc1VzYWdlQ29udGV4dCA9PT0gXCJDcmVhdGlvblJvd1wiKSB7XG5cdFx0ZWRpdGFibGVFeHByZXNzaW9uID0gaWZFbHNlKFxuXHRcdFx0b3IoaXNDb21wdXRlZChvUHJvcGVydHkpLCBoYXNTZW1hbnRpY09iamVjdChvUHJvcGVydHkpICYmICFoYXNWYWx1ZUhlbHAob1Byb3BlcnR5KSwgaXNOb25FZGl0YWJsZUV4cHJlc3Npb24ob1Byb3BlcnR5KSksXG5cdFx0XHRmYWxzZSxcblx0XHRcdFVJLklzRWRpdGFibGVcblx0XHQpO1xuXHR9XG5cdGNvbnN0IGVuYWJsZWRFeHByZXNzaW9uID0gZ2V0RW5hYmxlZEV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCwgdHJ1ZSkgYXMgQmluZGluZ1BhcnQ8Ym9vbGVhbj47XG5cdGNvbnN0IHVuaXRQcm9wZXJ0eSA9IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0bGV0IHJlc3VsdEV4cHJlc3Npb246IEJpbmRpbmdQYXJ0PHN0cmluZz4gPSBcIkVkaXRhYmxlXCI7XG5cdGlmICh1bml0UHJvcGVydHkpIHtcblx0XHRyZXN1bHRFeHByZXNzaW9uID0gaWZFbHNlKG9yKGlzUmVhZE9ubHlFeHByZXNzaW9uKHVuaXRQcm9wZXJ0eSksIGlzQ29tcHV0ZWQodW5pdFByb3BlcnR5KSksIFwiRWRpdGFibGVSZWFkT25seVwiLCBcIkVkaXRhYmxlXCIpO1xuXHR9XG5cdGNvbnN0IHJlYWRPbmx5RXhwcmVzc2lvbiA9IGlzUmVhZE9ubHlFeHByZXNzaW9uKG9Qcm9wZXJ0eSk7XG5cblx0bGV0IGVkaXRNb2RlRXhwcmVzc2lvbiA9IGlmRWxzZShcblx0XHRlbmFibGVkRXhwcmVzc2lvbixcblx0XHRpZkVsc2UoXG5cdFx0XHRlZGl0YWJsZUV4cHJlc3Npb24sXG5cdFx0XHRyZXN1bHRFeHByZXNzaW9uLFxuXHRcdFx0aWZFbHNlKGFuZCghaXNDb25zdGFudChyZWFkT25seUV4cHJlc3Npb24pICYmIHJlYWRPbmx5RXhwcmVzc2lvbiwgVUkuSXNFZGl0YWJsZSksIFwiUmVhZE9ubHlcIiwgXCJEaXNwbGF5XCIpXG5cdFx0KSxcblx0XHRcIkRpc2FibGVkXCJcblx0KTtcblx0aWYgKG9VcGRhdGVSZXN0cmljdGlvbnMpIHtcblx0XHQvLyBpZiB0aGUgcHJvcGVydHkgaXMgZnJvbSBhIG5vbi11cGRhdGFibGUgZW50aXR5ID0+IFJlYWQgb25seSBtb2RlLCBwcmV2aW91c2x5IGNhbGN1bGF0ZWQgZWRpdCBNb2RlIGlzIGlnbm9yZWRcblx0XHQvLyBpZiB0aGUgcHJvcGVydHkgaXMgZnJvbSBhbiB1cGRhdGFibGUgZW50aXR5ID0+IHByZXZpb3VzbHkgY2FsY3VsYXRlZCBlZGl0IE1vZGUgZXhwcmVzc2lvblxuXHRcdGNvbnN0IG9VcGRhdGFibGVFeHAgPSBnZXRVcGRhdGFibGVFeHByZXNzaW9uKG9VcGRhdGVSZXN0cmljdGlvbnMsIG9Qcm9wZXJ0eVBhdGgpO1xuXHRcdGVkaXRNb2RlRXhwcmVzc2lvbiA9IGlmRWxzZShvVXBkYXRhYmxlRXhwLCBlZGl0TW9kZUV4cHJlc3Npb24sIFwiRGlzcGxheVwiKTtcblx0fVxuXHRpZiAoYkFzT2JqZWN0KSB7XG5cdFx0cmV0dXJuIGVkaXRNb2RlRXhwcmVzc2lvbjtcblx0fVxuXHRyZXR1cm4gY29tcGlsZUJpbmRpbmcoZWRpdE1vZGVFeHByZXNzaW9uKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGaWVsZERpc3BsYXkgPSBmdW5jdGlvbihcblx0b1Byb3BlcnR5UGF0aDogUHJvcGVydHlPclBhdGg8UHJvcGVydHk+LFxuXHRvRW50aXR5UGF0aDogUHJvcGVydHlPclBhdGg8RW50aXR5U2V0Pixcblx0c1N0YXRpY0VkaXRNb2RlOiBzdHJpbmcgPSBcIlwiLFxuXHRzVXNhZ2VDb250ZXh0OiBzdHJpbmcgPSBcIlwiLFxuXHRvVXBkYXRlUmVzdHJpY3Rpb25zPzogQW5ub3RhdGlvblRlcm08VXBkYXRlUmVzdHJpY3Rpb25zVHlwZT5cbik6IEJpbmRpbmdFeHByZXNzaW9uPHN0cmluZz4ge1xuXHRpZiAoIW9Qcm9wZXJ0eVBhdGggfHwgdHlwZW9mIG9Qcm9wZXJ0eVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gXCJEaXNwbGF5XCI7XG5cdH1cblx0Y29uc3Qgb1Byb3BlcnR5ID0gKGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5UGF0aCkgJiYgb1Byb3BlcnR5UGF0aC4kdGFyZ2V0KSB8fCAob1Byb3BlcnR5UGF0aCBhcyBQcm9wZXJ0eSk7XG5cdGNvbnN0IG9FbnRpdHlTZXQgPSAoaXNQYXRoRXhwcmVzc2lvbihvRW50aXR5UGF0aCkgJiYgb0VudGl0eVBhdGguJHRhcmdldCkgfHwgKG9FbnRpdHlQYXRoIGFzIEVudGl0eVNldCk7XG5cdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRjb25zdCBvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9XG5cdFx0b1RleHRBbm5vdGF0aW9uPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCB8fCBvRW50aXR5U2V0Py5lbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudDtcblxuXHRsZXQgc0Rpc3BsYXlWYWx1ZSA9IG9UZXh0QW5ub3RhdGlvbiA/IFwiRGVzY3JpcHRpb25WYWx1ZVwiIDogXCJWYWx1ZVwiO1xuXHRpZiAob1RleHRBbm5vdGF0aW9uICYmIG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdFx0c0Rpc3BsYXlWYWx1ZSA9IFwiRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdFx0c0Rpc3BsYXlWYWx1ZSA9IFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvL0RlZmF1bHQgc2hvdWxkIGJlIFRleHRGaXJzdCBpZiB0aGVyZSBpcyBhIFRleHQgYW5ub3RhdGlvbiBhbmQgbmVpdGhlciBUZXh0T25seSBub3IgVGV4dExhc3QgYXJlIHNldFxuXHRcdFx0c0Rpc3BsYXlWYWx1ZSA9IFwiRGVzY3JpcHRpb25WYWx1ZVwiO1xuXHRcdH1cblx0fVxuXG5cdGlmIChoYXNWYWx1ZUhlbHAob1Byb3BlcnR5KSkge1xuXHRcdC8vIFByZWRlZmluZWQgZGlzcGxheSBtb2RlXG5cdFx0cmV0dXJuIGNvbXBpbGVCaW5kaW5nKHNEaXNwbGF5VmFsdWUpO1xuXHR9IGVsc2Uge1xuXHRcdGlmIChzRGlzcGxheVZhbHVlICE9PSBcIkRlc2NyaXB0aW9uXCIgJiYgc1VzYWdlQ29udGV4dCA9PT0gXCJWSFRhYmxlXCIpIHtcblx0XHRcdHNEaXNwbGF5VmFsdWUgPSBcIlZhbHVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlQmluZGluZyhcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0ZXF1YWxzKGdldEVkaXRNb2RlKG9Qcm9wZXJ0eVBhdGgsIHNTdGF0aWNFZGl0TW9kZSwgc1VzYWdlQ29udGV4dCwgdHJ1ZSwgb1VwZGF0ZVJlc3RyaWN0aW9ucyksIFwiRWRpdGFibGVcIiksXG5cdFx0XHRcdFwiVmFsdWVcIixcblx0XHRcdFx0c0Rpc3BsYXlWYWx1ZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn07XG5cbi8qKlxuICogRm9ybWF0dGVyIGhlbHBlciB0byByZXRyaWV2ZSB0aGUgY29udmVydGVyQ29udGV4dCBmcm9tIHRoZSBtZXRhbW9kZWwgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0ge0NvbnRleHR9IG9Db250ZXh0IHRoZSBvcmlnaW5hbCBtZXRhbW9kZWwgY29udGV4dFxuICogQHBhcmFtIHtvYmplY3R9IG9JbnRlcmZhY2UgdGhlIGN1cnJlbnQgdGVtcGxhdGluZyBjb250ZXh0XG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgY29udmVydGVyIGNvbnRleHQgcmVwcmVzZW50aW5nIHRoYXQgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb252ZXJ0ZXJDb250ZXh0ID0gZnVuY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIG9JbnRlcmZhY2U6IGFueSk6IG9iamVjdCB8IG51bGwge1xuXHRpZiAob0ludGVyZmFjZSAmJiBvSW50ZXJmYWNlLmNvbnRleHQpIHtcblx0XHRyZXR1cm4gY29udmVydE1ldGFNb2RlbENvbnRleHQob0ludGVyZmFjZS5jb250ZXh0KTtcblx0fVxuXHRyZXR1cm4gbnVsbDtcbn07XG5nZXRDb252ZXJ0ZXJDb250ZXh0LnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuIl19