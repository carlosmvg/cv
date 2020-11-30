sap.ui.define(["sap/ui/core/library"], function (library) {
  "use strict";

  var MessageType = library.MessageType;

  var rowHighlighting = function (criticalityValue) {
    var criticalityProperty;

    if (typeof criticalityValue === "string") {
      return criticalityValue;
    }

    switch (criticalityValue) {
      case 1:
        criticalityProperty = MessageType.Error;
        break;

      case 2:
        criticalityProperty = MessageType.Warning;
        break;

      case 3:
        criticalityProperty = MessageType.Success;
        break;

      default:
        criticalityProperty = MessageType.None;
    }

    return criticalityProperty;
  };

  rowHighlighting.__formatterName = "sap.fe.core.formatters.TableFormatter#rowHighlighting";

  var fclNavigatedRow = function (sDeepestPath) {
    if (this.getBindingContext() && sDeepestPath && this.getModel("fclnavigated")) {
      return sDeepestPath.indexOf(this.getBindingContext().getPath()) === 0;
    } else {
      return false;
    }
  };

  fclNavigatedRow.__formatterName = "sap.fe.core.formatters.TableFormatter#fclNavigatedRow"; // See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax

  /**
   * Collection of table formatters.
   *
   * @param {object} this the context
   * @param {string} sName the inner function name
   * @param {object[]} oArgs the inner function parameters
   * @returns {object} the value from the inner function
   */

  var tableFormatters = function (sName) {
    if (tableFormatters.hasOwnProperty(sName)) {
      for (var _len = arguments.length, oArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        oArgs[_key - 1] = arguments[_key];
      }

      return tableFormatters[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };

  tableFormatters.rowHighlighting = rowHighlighting;
  tableFormatters.fclNavigatedRow = fclNavigatedRow;
  /**
   * @global
   */

  return tableFormatters;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRhYmxlRm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbIk1lc3NhZ2VUeXBlIiwibGlicmFyeSIsInJvd0hpZ2hsaWdodGluZyIsImNyaXRpY2FsaXR5VmFsdWUiLCJjcml0aWNhbGl0eVByb3BlcnR5IiwiRXJyb3IiLCJXYXJuaW5nIiwiU3VjY2VzcyIsIk5vbmUiLCJfX2Zvcm1hdHRlck5hbWUiLCJmY2xOYXZpZ2F0ZWRSb3ciLCJzRGVlcGVzdFBhdGgiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldE1vZGVsIiwiaW5kZXhPZiIsImdldFBhdGgiLCJ0YWJsZUZvcm1hdHRlcnMiLCJzTmFtZSIsImhhc093blByb3BlcnR5Iiwib0FyZ3MiLCJhcHBseSJdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBTUEsV0FBVyxHQUFHQyxPQUFPLENBQUNELFdBQTVCOztBQUNBLE1BQU1FLGVBQWUsR0FBRyxVQUFTQyxnQkFBVCxFQUEyRDtBQUNsRixRQUFJQyxtQkFBSjs7QUFDQSxRQUFJLE9BQU9ELGdCQUFQLEtBQTRCLFFBQWhDLEVBQTBDO0FBQ3pDLGFBQVFBLGdCQUFSO0FBQ0E7O0FBQ0QsWUFBUUEsZ0JBQVI7QUFDQyxXQUFLLENBQUw7QUFDQ0MsUUFBQUEsbUJBQW1CLEdBQUdKLFdBQVcsQ0FBQ0ssS0FBbEM7QUFDQTs7QUFDRCxXQUFLLENBQUw7QUFDQ0QsUUFBQUEsbUJBQW1CLEdBQUdKLFdBQVcsQ0FBQ00sT0FBbEM7QUFDQTs7QUFDRCxXQUFLLENBQUw7QUFDQ0YsUUFBQUEsbUJBQW1CLEdBQUdKLFdBQVcsQ0FBQ08sT0FBbEM7QUFDQTs7QUFDRDtBQUNDSCxRQUFBQSxtQkFBbUIsR0FBR0osV0FBVyxDQUFDUSxJQUFsQztBQVhGOztBQWFBLFdBQU9KLG1CQUFQO0FBQ0EsR0FuQkQ7O0FBb0JBRixFQUFBQSxlQUFlLENBQUNPLGVBQWhCLEdBQWtDLHVEQUFsQzs7QUFFQSxNQUFNQyxlQUFlLEdBQUcsVUFBOEJDLFlBQTlCLEVBQW9EO0FBQzNFLFFBQUksS0FBS0MsaUJBQUwsTUFBNEJELFlBQTVCLElBQTRDLEtBQUtFLFFBQUwsQ0FBYyxjQUFkLENBQWhELEVBQStFO0FBQzlFLGFBQU9GLFlBQVksQ0FBQ0csT0FBYixDQUFxQixLQUFLRixpQkFBTCxHQUF5QkcsT0FBekIsRUFBckIsTUFBNkQsQ0FBcEU7QUFDQSxLQUZELE1BRU87QUFDTixhQUFPLEtBQVA7QUFDQTtBQUNELEdBTkQ7O0FBT0FMLEVBQUFBLGVBQWUsQ0FBQ0QsZUFBaEIsR0FBa0MsdURBQWxDLEMsQ0FFQTs7QUFDQTs7Ozs7Ozs7O0FBUUEsTUFBTU8sZUFBZSxHQUFHLFVBQXVCQyxLQUF2QixFQUE0RDtBQUNuRixRQUFJRCxlQUFlLENBQUNFLGNBQWhCLENBQStCRCxLQUEvQixDQUFKLEVBQTJDO0FBQUEsd0NBRHFCRSxLQUNyQjtBQURxQkEsUUFBQUEsS0FDckI7QUFBQTs7QUFDMUMsYUFBUUgsZUFBRCxDQUF5QkMsS0FBekIsRUFBZ0NHLEtBQWhDLENBQXNDLElBQXRDLEVBQTRDRCxLQUE1QyxDQUFQO0FBQ0EsS0FGRCxNQUVPO0FBQ04sYUFBTyxFQUFQO0FBQ0E7QUFDRCxHQU5EOztBQVFBSCxFQUFBQSxlQUFlLENBQUNkLGVBQWhCLEdBQWtDQSxlQUFsQztBQUNBYyxFQUFBQSxlQUFlLENBQUNOLGVBQWhCLEdBQWtDQSxlQUFsQztBQUNBOzs7O1NBR2VNLGUiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ICQkTWVzc2FnZVR5cGUsIGxpYnJhcnkgfSBmcm9tIFwic2FwL3VpL2NvcmVcIjtcbmltcG9ydCB7IE1hbmFnZWRPYmplY3QgfSBmcm9tIFwic2FwL3VpL2Jhc2VcIjtcblxuY29uc3QgTWVzc2FnZVR5cGUgPSBsaWJyYXJ5Lk1lc3NhZ2VUeXBlO1xuY29uc3Qgcm93SGlnaGxpZ2h0aW5nID0gZnVuY3Rpb24oY3JpdGljYWxpdHlWYWx1ZTogc3RyaW5nIHwgbnVtYmVyKTogJCRNZXNzYWdlVHlwZSB7XG5cdGxldCBjcml0aWNhbGl0eVByb3BlcnR5O1xuXHRpZiAodHlwZW9mIGNyaXRpY2FsaXR5VmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gKGNyaXRpY2FsaXR5VmFsdWUgYXMgdW5rbm93bikgYXMgJCRNZXNzYWdlVHlwZTtcblx0fVxuXHRzd2l0Y2ggKGNyaXRpY2FsaXR5VmFsdWUpIHtcblx0XHRjYXNlIDE6XG5cdFx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuRXJyb3I7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIDI6XG5cdFx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gTWVzc2FnZVR5cGUuV2FybmluZztcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgMzpcblx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5TdWNjZXNzO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHR9XG5cdHJldHVybiBjcml0aWNhbGl0eVByb3BlcnR5O1xufTtcbnJvd0hpZ2hsaWdodGluZy5fX2Zvcm1hdHRlck5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVGFibGVGb3JtYXR0ZXIjcm93SGlnaGxpZ2h0aW5nXCI7XG5cbmNvbnN0IGZjbE5hdmlnYXRlZFJvdyA9IGZ1bmN0aW9uKHRoaXM6IE1hbmFnZWRPYmplY3QsIHNEZWVwZXN0UGF0aDogc3RyaW5nKSB7XG5cdGlmICh0aGlzLmdldEJpbmRpbmdDb250ZXh0KCkgJiYgc0RlZXBlc3RQYXRoICYmIHRoaXMuZ2V0TW9kZWwoXCJmY2xuYXZpZ2F0ZWRcIikpIHtcblx0XHRyZXR1cm4gc0RlZXBlc3RQYXRoLmluZGV4T2YodGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKSkgPT09IDA7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuZmNsTmF2aWdhdGVkUm93Ll9fZm9ybWF0dGVyTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5UYWJsZUZvcm1hdHRlciNmY2xOYXZpZ2F0ZWRSb3dcIjtcblxuLy8gU2VlIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL2Z1bmN0aW9ucy5odG1sI3RoaXMtcGFyYW1ldGVycyBmb3IgbW9yZSBkZXRhaWwgb24gdGhpcyB3ZWlyZCBzeW50YXhcbi8qKlxuICogQ29sbGVjdGlvbiBvZiB0YWJsZSBmb3JtYXR0ZXJzLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzIHRoZSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gc05hbWUgdGhlIGlubmVyIGZ1bmN0aW9uIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0W119IG9BcmdzIHRoZSBpbm5lciBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgdmFsdWUgZnJvbSB0aGUgaW5uZXIgZnVuY3Rpb25cbiAqL1xuY29uc3QgdGFibGVGb3JtYXR0ZXJzID0gZnVuY3Rpb24odGhpczogb2JqZWN0LCBzTmFtZTogc3RyaW5nLCAuLi5vQXJnczogYW55W10pOiBhbnkge1xuXHRpZiAodGFibGVGb3JtYXR0ZXJzLmhhc093blByb3BlcnR5KHNOYW1lKSkge1xuXHRcdHJldHVybiAodGFibGVGb3JtYXR0ZXJzIGFzIGFueSlbc05hbWVdLmFwcGx5KHRoaXMsIG9BcmdzKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxufTtcblxudGFibGVGb3JtYXR0ZXJzLnJvd0hpZ2hsaWdodGluZyA9IHJvd0hpZ2hsaWdodGluZztcbnRhYmxlRm9ybWF0dGVycy5mY2xOYXZpZ2F0ZWRSb3cgPSBmY2xOYXZpZ2F0ZWRSb3c7XG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgdGFibGVGb3JtYXR0ZXJzO1xuIl19