sap.ui.define(["sap/fe/core/helpers/BindingExpression"], function (BindingExpression) {
  "use strict";

  var _exports = {};
  var or = BindingExpression.or;
  var equals = BindingExpression.equals;
  var annotationExpression = BindingExpression.annotationExpression;

  /**
   * Check whether the property has the Core.Computed annotation or not.
   *
   * @param {Property} oProperty the target property
   * @returns {boolean} true if it's computed
   */
  var isComputed = function (oProperty) {
    var _oProperty$annotation, _oProperty$annotation2;

    return !!((_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Core) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Computed);
  };
  /**
   * Check whether the property has the Core.Immutable annotation or not.
   *
   * @param {Property} oProperty the target property
   * @returns {boolean} true if it's immutable
   */


  _exports.isComputed = isComputed;

  var isImmutable = function (oProperty) {
    var _oProperty$annotation3, _oProperty$annotation4;

    return !!((_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Core) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.Immutable);
  };
  /**
   * Check whether the property is a key or not.
   *
   * @param {Property} oProperty the target property
   * @returns {boolean} true if it's a key
   */


  _exports.isImmutable = isImmutable;

  var isKey = function (oProperty) {
    return oProperty.isKey;
  };
  /**
   * Check whether the property has a semantic object defined or not.
   *
   * @param {Property} oProperty the target property
   * @returns {boolean} true if it has a semantic object
   */


  _exports.isKey = isKey;

  var hasSemanticObject = function (oProperty) {
    var _oProperty$annotation5, _oProperty$annotation6;

    return !!((_oProperty$annotation5 = oProperty.annotations) === null || _oProperty$annotation5 === void 0 ? void 0 : (_oProperty$annotation6 = _oProperty$annotation5.Common) === null || _oProperty$annotation6 === void 0 ? void 0 : _oProperty$annotation6.SemanticObject);
  };
  /**
   * Create the binding expression to check if the property is non editable or not.
   *
   * @param {Property} oProperty the target property
   * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's non editable
   */


  _exports.hasSemanticObject = hasSemanticObject;

  var isNonEditableExpression = function (oProperty) {
    return or(isReadOnlyExpression(oProperty), isDisabledExpression(oProperty));
  };
  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param {Property} oProperty the target property
   * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's read only
   */


  _exports.isNonEditableExpression = isNonEditableExpression;

  var isReadOnlyExpression = function (oProperty) {
    var _oProperty$annotation7, _oProperty$annotation8;

    var oFieldControlValue = (_oProperty$annotation7 = oProperty.annotations) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.Common) === null || _oProperty$annotation8 === void 0 ? void 0 : _oProperty$annotation8.FieldControl;

    if (typeof oFieldControlValue === "object") {
      return !!oFieldControlValue && equals(annotationExpression(oFieldControlValue), 1);
    }

    return oFieldControlValue === "Common.FieldControlType/ReadOnly";
  };
  /**
   * Create the binding expression to check if the property is disabled or not.
   *
   * @param {Property} oProperty the target property
   * @returns {BindingPart<boolean>} the binding expression resolving to a boolean being true if it's disabled
   */


  _exports.isReadOnlyExpression = isReadOnlyExpression;

  var isDisabledExpression = function (oProperty) {
    var _oProperty$annotation9, _oProperty$annotation10;

    var oFieldControlValue = (_oProperty$annotation9 = oProperty.annotations) === null || _oProperty$annotation9 === void 0 ? void 0 : (_oProperty$annotation10 = _oProperty$annotation9.Common) === null || _oProperty$annotation10 === void 0 ? void 0 : _oProperty$annotation10.FieldControl;

    if (typeof oFieldControlValue === "object") {
      return !!oFieldControlValue && equals(annotationExpression(oFieldControlValue), 0);
    }

    return oFieldControlValue === "Common.FieldControlType/Inapplicable";
  };

  _exports.isDisabledExpression = isDisabledExpression;

  var isPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "Path";
  };
  /**
   * Retrieves the associated unit property for that property if it exists.
   *
   * @param {Property} oProperty the target property
   * @returns {Property | undefined} the unit property if it exists
   */


  _exports.isPathExpression = isPathExpression;

  var getAssociatedUnitProperty = function (oProperty) {
    var _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14;

    return isPathExpression((_oProperty$annotation11 = oProperty.annotations) === null || _oProperty$annotation11 === void 0 ? void 0 : (_oProperty$annotation12 = _oProperty$annotation11.Measures) === null || _oProperty$annotation12 === void 0 ? void 0 : _oProperty$annotation12.Unit) ? (_oProperty$annotation13 = oProperty.annotations) === null || _oProperty$annotation13 === void 0 ? void 0 : (_oProperty$annotation14 = _oProperty$annotation13.Measures) === null || _oProperty$annotation14 === void 0 ? void 0 : _oProperty$annotation14.Unit.$target : undefined;
  };
  /**
   * Check whether the property has a value help annotation defined or not.
   *
   * @param {Property} oProperty the target property
   * @returns {boolean} true if it has a value help
   */


  _exports.getAssociatedUnitProperty = getAssociatedUnitProperty;

  var hasValueHelp = function (oProperty) {
    var _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18, _oProperty$annotation19, _oProperty$annotation20, _oProperty$annotation21, _oProperty$annotation22;

    return !!((_oProperty$annotation15 = oProperty.annotations) === null || _oProperty$annotation15 === void 0 ? void 0 : (_oProperty$annotation16 = _oProperty$annotation15.Common) === null || _oProperty$annotation16 === void 0 ? void 0 : _oProperty$annotation16.ValueList) || !!((_oProperty$annotation17 = oProperty.annotations) === null || _oProperty$annotation17 === void 0 ? void 0 : (_oProperty$annotation18 = _oProperty$annotation17.Common) === null || _oProperty$annotation18 === void 0 ? void 0 : _oProperty$annotation18.ValueListReferences) || !!((_oProperty$annotation19 = oProperty.annotations) === null || _oProperty$annotation19 === void 0 ? void 0 : (_oProperty$annotation20 = _oProperty$annotation19.Common) === null || _oProperty$annotation20 === void 0 ? void 0 : _oProperty$annotation20.ValueListWithFixedValues) || !!((_oProperty$annotation21 = oProperty.annotations) === null || _oProperty$annotation21 === void 0 ? void 0 : (_oProperty$annotation22 = _oProperty$annotation21.Common) === null || _oProperty$annotation22 === void 0 ? void 0 : _oProperty$annotation22.ValueListMapping);
  };

  _exports.hasValueHelp = hasValueHelp;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb3BlcnR5SGVscGVyLnRzIl0sIm5hbWVzIjpbImlzQ29tcHV0ZWQiLCJvUHJvcGVydHkiLCJhbm5vdGF0aW9ucyIsIkNvcmUiLCJDb21wdXRlZCIsImlzSW1tdXRhYmxlIiwiSW1tdXRhYmxlIiwiaXNLZXkiLCJoYXNTZW1hbnRpY09iamVjdCIsIkNvbW1vbiIsIlNlbWFudGljT2JqZWN0IiwiaXNOb25FZGl0YWJsZUV4cHJlc3Npb24iLCJvciIsImlzUmVhZE9ubHlFeHByZXNzaW9uIiwiaXNEaXNhYmxlZEV4cHJlc3Npb24iLCJvRmllbGRDb250cm9sVmFsdWUiLCJGaWVsZENvbnRyb2wiLCJlcXVhbHMiLCJhbm5vdGF0aW9uRXhwcmVzc2lvbiIsImlzUGF0aEV4cHJlc3Npb24iLCJleHByZXNzaW9uIiwidHlwZSIsInVuZGVmaW5lZCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJNZWFzdXJlcyIsIlVuaXQiLCIkdGFyZ2V0IiwiaGFzVmFsdWVIZWxwIiwiVmFsdWVMaXN0IiwiVmFsdWVMaXN0UmVmZXJlbmNlcyIsIlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsIlZhbHVlTGlzdE1hcHBpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBSUE7Ozs7OztBQU1PLE1BQU1BLFVBQVUsR0FBRyxVQUFTQyxTQUFULEVBQXVDO0FBQUE7O0FBQ2hFLFdBQU8sQ0FBQywyQkFBQ0EsU0FBUyxDQUFDQyxXQUFYLG9GQUFDLHNCQUF1QkMsSUFBeEIsMkRBQUMsdUJBQTZCQyxRQUE5QixDQUFSO0FBQ0EsR0FGTTtBQUlQOzs7Ozs7Ozs7O0FBTU8sTUFBTUMsV0FBVyxHQUFHLFVBQVNKLFNBQVQsRUFBdUM7QUFBQTs7QUFDakUsV0FBTyxDQUFDLDRCQUFDQSxTQUFTLENBQUNDLFdBQVgscUZBQUMsdUJBQXVCQyxJQUF4QiwyREFBQyx1QkFBNkJHLFNBQTlCLENBQVI7QUFDQSxHQUZNO0FBSVA7Ozs7Ozs7Ozs7QUFNTyxNQUFNQyxLQUFLLEdBQUcsVUFBU04s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Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L2Fubm90YXRpb24tY29udmVydGVyXCI7XG5pbXBvcnQgeyBhbm5vdGF0aW9uRXhwcmVzc2lvbiwgQmluZGluZ1BhcnQsIGVxdWFscywgb3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nRXhwcmVzc2lvblwiO1xuaW1wb3J0IHsgUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIHRoZSBDb3JlLkNvbXB1dGVkIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHl9IG9Qcm9wZXJ0eSB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBpdCdzIGNvbXB1dGVkXG4gKi9cbmV4cG9ydCBjb25zdCBpc0NvbXB1dGVkID0gZnVuY3Rpb24ob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvcmU/LkNvbXB1dGVkO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgdGhlIENvcmUuSW1tdXRhYmxlIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHl9IG9Qcm9wZXJ0eSB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBpdCdzIGltbXV0YWJsZVxuICovXG5leHBvcnQgY29uc3QgaXNJbW11dGFibGUgPSBmdW5jdGlvbihvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29yZT8uSW1tdXRhYmxlO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIGtleSBvciBub3QuXG4gKlxuICogQHBhcmFtIHtQcm9wZXJ0eX0gb1Byb3BlcnR5IHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGl0J3MgYSBrZXlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzS2V5ID0gZnVuY3Rpb24ob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gb1Byb3BlcnR5LmlzS2V5O1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSBzZW1hbnRpYyBvYmplY3QgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHtQcm9wZXJ0eX0gb1Byb3BlcnR5IHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGl0IGhhcyBhIHNlbWFudGljIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgaGFzU2VtYW50aWNPYmplY3QgPSBmdW5jdGlvbihvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gY2hlY2sgaWYgdGhlIHByb3BlcnR5IGlzIG5vbiBlZGl0YWJsZSBvciBub3QuXG4gKlxuICogQHBhcmFtIHtQcm9wZXJ0eX0gb1Byb3BlcnR5IHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIHtCaW5kaW5nUGFydDxib29sZWFuPn0gdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBib29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyBub24gZWRpdGFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzTm9uRWRpdGFibGVFeHByZXNzaW9uID0gZnVuY3Rpb24ob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IEJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0cmV0dXJuIG9yKGlzUmVhZE9ubHlFeHByZXNzaW9uKG9Qcm9wZXJ0eSksIGlzRGlzYWJsZWRFeHByZXNzaW9uKG9Qcm9wZXJ0eSkpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBjaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgcmVhZCBvbmx5IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0ge1Byb3BlcnR5fSBvUHJvcGVydHkgdGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMge0JpbmRpbmdQYXJ0PGJvb2xlYW4+fSB0aGUgYmluZGluZyBleHByZXNzaW9uIHJlc29sdmluZyB0byBhIGJvb2xlYW4gYmVpbmcgdHJ1ZSBpZiBpdCdzIHJlYWQgb25seVxuICovXG5leHBvcnQgY29uc3QgaXNSZWFkT25seUV4cHJlc3Npb24gPSBmdW5jdGlvbihvUHJvcGVydHk6IFByb3BlcnR5KTogQmluZGluZ1BhcnQ8Ym9vbGVhbj4ge1xuXHRjb25zdCBvRmllbGRDb250cm9sVmFsdWUgPSBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmllbGRDb250cm9sO1xuXHRpZiAodHlwZW9mIG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdHJldHVybiAhIW9GaWVsZENvbnRyb2xWYWx1ZSAmJiBlcXVhbHMoYW5ub3RhdGlvbkV4cHJlc3Npb24ob0ZpZWxkQ29udHJvbFZhbHVlKSBhcyBCaW5kaW5nUGFydDxudW1iZXI+LCAxKTtcblx0fVxuXHRyZXR1cm4gb0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCI7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGNoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyBkaXNhYmxlZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHtQcm9wZXJ0eX0gb1Byb3BlcnR5IHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIHtCaW5kaW5nUGFydDxib29sZWFuPn0gdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXNvbHZpbmcgdG8gYSBib29sZWFuIGJlaW5nIHRydWUgaWYgaXQncyBkaXNhYmxlZFxuICovXG5leHBvcnQgY29uc3QgaXNEaXNhYmxlZEV4cHJlc3Npb24gPSBmdW5jdGlvbihvUHJvcGVydHk6IFByb3BlcnR5KTogQmluZGluZ1BhcnQ8Ym9vbGVhbj4ge1xuXHRjb25zdCBvRmllbGRDb250cm9sVmFsdWUgPSBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmllbGRDb250cm9sO1xuXHRpZiAodHlwZW9mIG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdHJldHVybiAhIW9GaWVsZENvbnRyb2xWYWx1ZSAmJiBlcXVhbHMoYW5ub3RhdGlvbkV4cHJlc3Npb24ob0ZpZWxkQ29udHJvbFZhbHVlKSBhcyBCaW5kaW5nUGFydDxudW1iZXI+LCAwKTtcblx0fVxuXHRyZXR1cm4gb0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIkNvbW1vbi5GaWVsZENvbnRyb2xUeXBlL0luYXBwbGljYWJsZVwiO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUGF0aEV4cHJlc3Npb24gPSBmdW5jdGlvbjxUPihleHByZXNzaW9uOiBhbnkpOiBleHByZXNzaW9uIGlzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAhIWV4cHJlc3Npb24gJiYgZXhwcmVzc2lvbi50eXBlICE9PSB1bmRlZmluZWQgJiYgZXhwcmVzc2lvbi50eXBlID09PSBcIlBhdGhcIjtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBhc3NvY2lhdGVkIHVuaXQgcHJvcGVydHkgZm9yIHRoYXQgcHJvcGVydHkgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHl9IG9Qcm9wZXJ0eSB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7UHJvcGVydHkgfCB1bmRlZmluZWR9IHRoZSB1bml0IHByb3BlcnR5IGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSA9IGZ1bmN0aW9uKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBQcm9wZXJ0eSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpXG5cdFx0PyAoKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQuJHRhcmdldCBhcyB1bmtub3duKSBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSB7UHJvcGVydHl9IG9Qcm9wZXJ0eSB0aGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBpdCBoYXMgYSB2YWx1ZSBoZWxwXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNWYWx1ZUhlbHAgPSBmdW5jdGlvbihvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0IHx8XG5cdFx0ISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0UmVmZXJlbmNlcyB8fFxuXHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyB8fFxuXHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdE1hcHBpbmdcblx0KTtcbn07XG4iXX0=