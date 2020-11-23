sap.ui.define(["sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID"], function (ManifestSettings, ConfigurableObject, ID) {
  "use strict";

  var _exports = {};
  var CustomActionID = ID.CustomActionID;
  var Placement = ConfigurableObject.Placement;
  var ActionType = ManifestSettings.ActionType;

  /**
   * Create the action configuration based on the manifest settings.
   * @param {Record<string, ManifestAction> | undefined} manifestActions the manifest definition
   * @param {NavigationSettingsConfiguration} navigationSettings
   * @param {boolean} considerNavigationSettings
   * @returns {Record<string, CustomAction>} the actions from the manifest
   */
  function getActionsFromManifest(manifestActions, navigationSettings, considerNavigationSettings) {
    var actions = {};

    for (var actionKey in manifestActions) {
      var _manifestAction$press, _manifestAction$posit;

      var manifestAction = manifestActions[actionKey];
      var lastDotIndex = (_manifestAction$press = manifestAction.press) === null || _manifestAction$press === void 0 ? void 0 : _manifestAction$press.lastIndexOf(".");
      actions[actionKey] = {
        id: CustomActionID(actionKey),
        visible: manifestAction.visible === undefined ? "true" : manifestAction.visible,
        enabled: manifestAction.enabled === undefined ? "true" : manifestAction.enabled,
        handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
        handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
        press: manifestAction.press,
        type: ActionType.Default,
        text: manifestAction.text,
        key: actionKey,
        enableOnSelect: manifestAction.enableOnSelect,
        position: {
          anchor: (_manifestAction$posit = manifestAction.position) === null || _manifestAction$posit === void 0 ? void 0 : _manifestAction$posit.anchor,
          placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
        },
        isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings)
      };
    }

    return actions;
  }

  _exports.getActionsFromManifest = getActionsFromManifest;

  function getEnabledBinding(actionDefinition, converterContext) {
    var _actionDefinition$ann, _actionDefinition$ann2;

    if (!actionDefinition) {
      return "true";
    }

    if (!actionDefinition.isBound) {
      return "true";
    }

    var operationAvailable = (_actionDefinition$ann = actionDefinition.annotations) === null || _actionDefinition$ann === void 0 ? void 0 : (_actionDefinition$ann2 = _actionDefinition$ann.Core) === null || _actionDefinition$ann2 === void 0 ? void 0 : _actionDefinition$ann2.OperationAvailable;

    if (operationAvailable) {
      var bindingExpression = converterContext.getBindingExpression(operationAvailable);

      if (bindingExpression) {
        var _actionDefinition$par, _actionDefinition$par2;

        /**
         * Action Parameter is ignored by the formatter when trigger by templating
         * here it's done manually
         **/
        var paramSuffix = (_actionDefinition$par = actionDefinition.parameters) === null || _actionDefinition$par === void 0 ? void 0 : (_actionDefinition$par2 = _actionDefinition$par[0]) === null || _actionDefinition$par2 === void 0 ? void 0 : _actionDefinition$par2.fullyQualifiedName;

        if (paramSuffix) {
          paramSuffix = paramSuffix.replace(actionDefinition.fullyQualifiedName + "/", "");
          bindingExpression = bindingExpression.replace(paramSuffix + "/", "");
        }

        return bindingExpression;
      }

      return "true";
    }

    return "true";
    /*
       FIXME Disable failing music tests
    	Due to limitation on CAP the following binding (which is the good one) generates error:
    			   return "{= !${#" + field.Action + "} ? false : true }";
    	CAP tries to read the action as property and doesn't find it
    */
  }

  _exports.getEnabledBinding = getEnabledBinding;

  function isActionNavigable(action, navigationSettings, considerNavigationSettings) {
    var _action$afterExecutio;

    var bIsNavigationConfigured = true;

    if (considerNavigationSettings) {
      var detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
      bIsNavigationConfigured = (detailOrDisplay === null || detailOrDisplay === void 0 ? void 0 : detailOrDisplay.route) ? true : false;
    }

    if (action && action.afterExecution && ((_action$afterExecutio = action.afterExecution) === null || _action$afterExecutio === void 0 ? void 0 : _action$afterExecutio.navigateToInstance) === false || !bIsNavigationConfigured) {
      return false;
    }

    return true;
  }

  _exports.isActionNavigable = isActionNavigable;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGlvbi50cyJdLCJuYW1lcyI6WyJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwibWFuaWZlc3RBY3Rpb25zIiwibmF2aWdhdGlvblNldHRpbmdzIiwiY29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3MiLCJhY3Rpb25zIiwiYWN0aW9uS2V5IiwibWFuaWZlc3RBY3Rpb24iLCJsYXN0RG90SW5kZXgiLCJwcmVzcyIsImxhc3RJbmRleE9mIiwiaWQiLCJDdXN0b21BY3Rpb25JRCIsInZpc2libGUiLCJ1bmRlZmluZWQiLCJlbmFibGVkIiwiaGFuZGxlck1vZHVsZSIsInN1YnN0cmluZyIsInJlcGxhY2UiLCJoYW5kbGVyTWV0aG9kIiwidHlwZSIsIkFjdGlvblR5cGUiLCJEZWZhdWx0IiwidGV4dCIsImtleSIsImVuYWJsZU9uU2VsZWN0IiwicG9zaXRpb24iLCJhbmNob3IiLCJwbGFjZW1lbnQiLCJQbGFjZW1lbnQiLCJBZnRlciIsImlzTmF2aWdhYmxlIiwiaXNBY3Rpb25OYXZpZ2FibGUiLCJnZXRFbmFibGVkQmluZGluZyIsImFjdGlvbkRlZmluaXRpb24iLCJjb252ZXJ0ZXJDb250ZXh0IiwiaXNCb3VuZCIsIm9wZXJhdGlvbkF2YWlsYWJsZSIsImFubm90YXRpb25zIiwiQ29yZSIsIk9wZXJhdGlvbkF2YWlsYWJsZSIsImJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0QmluZGluZ0V4cHJlc3Npb24iLCJwYXJhbVN1ZmZpeCIsInBhcmFtZXRlcnMiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJhY3Rpb24iLCJiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCIsImRldGFpbE9yRGlzcGxheSIsImRldGFpbCIsImRpc3BsYXkiLCJyb3V0ZSIsImFmdGVyRXhlY3V0aW9uIiwibmF2aWdhdGVUb0luc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQXlDQTs7Ozs7OztBQU9PLFdBQVNBLHNCQUFULENBQ05DLGVBRE0sRUFFTkMsa0JBRk0sRUFHTkMsMEJBSE0sRUFJeUI7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RCxFQUErRCxFQUEvRCxDQUFkO0FBQ0FKLFVBQUFBLGlCQUFpQixHQUFHQSxpQkFBaUIsQ0FBQ3ZCLE9BQWxCLENBQTBCeUIsV0FBVyxHQUFHLEdBQXhDLEVBQTZDLEVBQTdDLENBQXBCO0FBQ0E7O0FBQ0QsZUFBT0YsaUJBQVA7QUFDQTs7QUFDRCxhQUFPLE1BQVA7QUFDQTs7QUFDRCxXQUFPLE1BQVA7QUFDQTs7Ozs7O0FBTUE7Ozs7QUFFTSxXQUFTVCxpQkFBVCxDQUNOYyxNQURNLEVBRU4zQyxrQkFGTSxFQUdOQywwQkFITSxFQUlJO0FBQUE7O0FBQ1YsUUFBSTJDLHVCQUFnQyxHQUFHLElBQXZDOztBQUNBLFFBQUkzQywwQkFBSixFQUFnQztBQUMvQixVQUFNNEMsZUFBZSxHQUFHN0Msa0JBQWtCLEtBQUtBLGtCQUFrQixDQUFDOEMsTUFBbkIsSUFBNkI5QyxrQkFBa0IsQ0FBQytDLE9BQXJELENBQTFDO0FBQ0FILE1BQUFBLHVCQUF1QixHQUFHLENBQUFDLGVBQWUsU0FBZixJQUFBQSxlQUFlLFdBQWYsWUFBQUEsZUFBZSxDQUFFRyxLQUFqQixJQUF5QixJQUF6QixHQUFnQyxLQUExRDtBQUNBOztBQUNELFFBQUtMLE1BQU0sSUFBSUEsTUFBTSxDQUFDTSxjQUFqQixJQUFtQywwQkFBQU4sTUFBTSxDQUFDTSxjQUFQLGdGQUF1QkMsa0JBQXZCLE1BQThDLEtBQWxGLElBQTRGLENBQUNOLHVCQUFqRyxFQUEwSDtBQUN6SCxhQUFPLEtBQVA7QUFDQTs7QUFDRCxXQUFPLElBQVA7QUFDQSIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWN0aW9uLCBCb29sZWFuLCBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgQ29udmVydGVyQ29udGV4dCB9IGZyb20gXCIuLi8uLi90ZW1wbGF0ZXMvQmFzZUNvbnZlcnRlclwiO1xuaW1wb3J0IHsgQWN0aW9uVHlwZSwgTWFuaWZlc3RBY3Rpb24sIE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sIE1hbmlmZXN0VGFibGVDb2x1bW4gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBDb25maWd1cmFibGVPYmplY3QsIEN1c3RvbUVsZW1lbnQsIFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBDdXN0b21BY3Rpb25JRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IEJpbmRpbmdFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ0V4cHJlc3Npb25cIjtcblxuZXhwb3J0IHR5cGUgQmFzZUFjdGlvbiA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0aWQ/OiBzdHJpbmc7XG5cdHRleHQ/OiBzdHJpbmc7XG5cdHR5cGU6IEFjdGlvblR5cGU7XG5cdHByZXNzPzogc3RyaW5nO1xuXHRlbmFibGVkPzogQmluZGluZ0V4cHJlc3Npb248Ym9vbGVhbj47XG5cdHZpc2libGU/OiBCaW5kaW5nRXhwcmVzc2lvbjxib29sZWFuPjtcblx0ZW5hYmxlT25TZWxlY3Q/OiBzdHJpbmc7XG5cdGlzTmF2aWdhYmxlPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEFubm90YXRpb25BY3Rpb24gPSBCYXNlQWN0aW9uICYge1xuXHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRpZD86IHN0cmluZztcblx0Y3VzdG9tRGF0YT86IHN0cmluZztcbn07XG5cbi8qKlxuICogQ3VzdG9tIEFjdGlvbiBEZWZpbml0aW9uXG4gKlxuICogQHR5cGVkZWYgQ3VzdG9tQWN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEN1c3RvbUFjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8XG5cdEJhc2VBY3Rpb24gJiB7XG5cdFx0dHlwZTogQWN0aW9uVHlwZS5EZWZhdWx0O1xuXHRcdGhhbmRsZXJNZXRob2Q6IHN0cmluZztcblx0XHRoYW5kbGVyTW9kdWxlOiBzdHJpbmc7XG5cdH1cbj47XG5cbi8vIFJldXNlIG9mIENvbmZpZ3VyYWJsZU9iamVjdCBhbmQgQ3VzdG9tRWxlbWVudCBpcyBkb25lIGZvciBvcmRlcmluZ1xuZXhwb3J0IHR5cGUgQ29udmVydGVyQWN0aW9uID0gQW5ub3RhdGlvbkFjdGlvbiB8IEN1c3RvbUFjdGlvbjtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGFjdGlvbiBjb25maWd1cmF0aW9uIGJhc2VkIG9uIHRoZSBtYW5pZmVzdCBzZXR0aW5ncy5cbiAqIEBwYXJhbSB7UmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+IHwgdW5kZWZpbmVkfSBtYW5pZmVzdEFjdGlvbnMgdGhlIG1hbmlmZXN0IGRlZmluaXRpb25cbiAqIEBwYXJhbSB7TmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbn0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyB7UmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPn0gdGhlIGFjdGlvbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+IHwgdW5kZWZpbmVkLFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncz86IGJvb2xlYW5cbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4ge1xuXHRjb25zdCBhY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGZvciAoY29uc3QgYWN0aW9uS2V5IGluIG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdGNvbnN0IG1hbmlmZXN0QWN0aW9uOiBNYW5pZmVzdEFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRcdGNvbnN0IGxhc3REb3RJbmRleCA9IG1hbmlmZXN0QWN0aW9uLnByZXNzPy5sYXN0SW5kZXhPZihcIi5cIik7XG5cdFx0YWN0aW9uc1thY3Rpb25LZXldID0ge1xuXHRcdFx0aWQ6IEN1c3RvbUFjdGlvbklEKGFjdGlvbktleSksXG5cdFx0XHR2aXNpYmxlOiBtYW5pZmVzdEFjdGlvbi52aXNpYmxlID09PSB1bmRlZmluZWQgPyBcInRydWVcIiA6IG1hbmlmZXN0QWN0aW9uLnZpc2libGUsXG5cdFx0XHRlbmFibGVkOiBtYW5pZmVzdEFjdGlvbi5lbmFibGVkID09PSB1bmRlZmluZWQgPyBcInRydWVcIiA6IG1hbmlmZXN0QWN0aW9uLmVuYWJsZWQsXG5cdFx0XHRoYW5kbGVyTW9kdWxlOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyAmJiBtYW5pZmVzdEFjdGlvbi5wcmVzcy5zdWJzdHJpbmcoMCwgbGFzdERvdEluZGV4KS5yZXBsYWNlKC9cXC4vZ2ksIFwiL1wiKSxcblx0XHRcdGhhbmRsZXJNZXRob2Q6IG1hbmlmZXN0QWN0aW9uLnByZXNzICYmIG1hbmlmZXN0QWN0aW9uLnByZXNzLnN1YnN0cmluZyhsYXN0RG90SW5kZXggKyAxKSxcblx0XHRcdHByZXNzOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyxcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdCxcblx0XHRcdHRleHQ6IG1hbmlmZXN0QWN0aW9uLnRleHQsXG5cdFx0XHRrZXk6IGFjdGlvbktleSxcblx0XHRcdGVuYWJsZU9uU2VsZWN0OiBtYW5pZmVzdEFjdGlvbi5lbmFibGVPblNlbGVjdCxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGFuY2hvcjogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24/LmFuY2hvcixcblx0XHRcdFx0cGxhY2VtZW50OiBtYW5pZmVzdEFjdGlvbi5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gUGxhY2VtZW50LkFmdGVyIDogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24ucGxhY2VtZW50XG5cdFx0XHR9LFxuXHRcdFx0aXNOYXZpZ2FibGU6IGlzQWN0aW9uTmF2aWdhYmxlKG1hbmlmZXN0QWN0aW9uLCBuYXZpZ2F0aW9uU2V0dGluZ3MsIGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzKVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGFjdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbmFibGVkQmluZGluZyhhY3Rpb25EZWZpbml0aW9uOiBBY3Rpb24gfCB1bmRlZmluZWQsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRpZiAoIWFjdGlvbkRlZmluaXRpb24pIHtcblx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdH1cblx0aWYgKCFhY3Rpb25EZWZpbml0aW9uLmlzQm91bmQpIHtcblx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdH1cblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlID0gYWN0aW9uRGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlO1xuXHRpZiAob3BlcmF0aW9uQXZhaWxhYmxlKSB7XG5cdFx0bGV0IGJpbmRpbmdFeHByZXNzaW9uID0gY29udmVydGVyQ29udGV4dC5nZXRCaW5kaW5nRXhwcmVzc2lvbjxzdHJpbmc+KG9wZXJhdGlvbkF2YWlsYWJsZSBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxCb29sZWFuPik7XG5cdFx0aWYgKGJpbmRpbmdFeHByZXNzaW9uKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEFjdGlvbiBQYXJhbWV0ZXIgaXMgaWdub3JlZCBieSB0aGUgZm9ybWF0dGVyIHdoZW4gdHJpZ2dlciBieSB0ZW1wbGF0aW5nXG5cdFx0XHQgKiBoZXJlIGl0J3MgZG9uZSBtYW51YWxseVxuXHRcdFx0ICoqL1xuXHRcdFx0bGV0IHBhcmFtU3VmZml4ID0gYWN0aW9uRGVmaW5pdGlvbi5wYXJhbWV0ZXJzPy5bMF0/LmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0XHRcdGlmIChwYXJhbVN1ZmZpeCkge1xuXHRcdFx0XHRwYXJhbVN1ZmZpeCA9IHBhcmFtU3VmZml4LnJlcGxhY2UoYWN0aW9uRGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgKyBcIi9cIiwgXCJcIik7XG5cdFx0XHRcdGJpbmRpbmdFeHByZXNzaW9uID0gYmluZGluZ0V4cHJlc3Npb24ucmVwbGFjZShwYXJhbVN1ZmZpeCArIFwiL1wiLCBcIlwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBiaW5kaW5nRXhwcmVzc2lvbjtcblx0XHR9XG5cdFx0cmV0dXJuIFwidHJ1ZVwiO1xuXHR9XG5cdHJldHVybiBcInRydWVcIjtcblx0Lypcblx0ICAgRklYTUUgRGlzYWJsZSBmYWlsaW5nIG11c2ljIHRlc3RzXG5cdFx0RHVlIHRvIGxpbWl0YXRpb24gb24gQ0FQIHRoZSBmb2xsb3dpbmcgYmluZGluZyAod2hpY2ggaXMgdGhlIGdvb2Qgb25lKSBnZW5lcmF0ZXMgZXJyb3I6XG5cdFx0XHRcdCAgIHJldHVybiBcIns9ICEkeyNcIiArIGZpZWxkLkFjdGlvbiArIFwifSA/IGZhbHNlIDogdHJ1ZSB9XCI7XG5cdFx0Q0FQIHRyaWVzIHRvIHJlYWQgdGhlIGFjdGlvbiBhcyBwcm9wZXJ0eSBhbmQgZG9lc24ndCBmaW5kIGl0XG5cdCovXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FjdGlvbk5hdmlnYWJsZShcblx0YWN0aW9uOiBNYW5pZmVzdEFjdGlvbiB8IE1hbmlmZXN0VGFibGVDb2x1bW4sXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzPzogYm9vbGVhblxuKTogYm9vbGVhbiB7XG5cdGxldCBiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZDogYm9vbGVhbiA9IHRydWU7XG5cdGlmIChjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncykge1xuXHRcdGNvbnN0IGRldGFpbE9yRGlzcGxheSA9IG5hdmlnYXRpb25TZXR0aW5ncyAmJiAobmF2aWdhdGlvblNldHRpbmdzLmRldGFpbCB8fCBuYXZpZ2F0aW9uU2V0dGluZ3MuZGlzcGxheSk7XG5cdFx0YklzTmF2aWdhdGlvbkNvbmZpZ3VyZWQgPSBkZXRhaWxPckRpc3BsYXk/LnJvdXRlID8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cdGlmICgoYWN0aW9uICYmIGFjdGlvbi5hZnRlckV4ZWN1dGlvbiAmJiBhY3Rpb24uYWZ0ZXJFeGVjdXRpb24/Lm5hdmlnYXRlVG9JbnN0YW5jZSA9PT0gZmFsc2UpIHx8ICFiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==