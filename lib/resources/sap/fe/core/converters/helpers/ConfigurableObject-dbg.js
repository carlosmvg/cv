sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  var Placement;

  (function (Placement) {
    Placement["After"] = "After";
    Placement["Before"] = "Before";
    Placement["End"] = "End";
  })(Placement || (Placement = {}));

  _exports.Placement = Placement;

  /**
   * Recursive method that order the keys based on a position information.
   *
   * @param positioningItems
   * @param anchor
   * @param sorted
   * @param visited
   * @returns {number} the order of the current item
   */
  var orderPositioningItemRecursively = function (positioningItems, anchor, sorted, visited) {
    var insertIndex = sorted.indexOf(anchor);

    if (insertIndex !== -1) {
      return insertIndex;
    }

    var anchorItem = positioningItems[anchor];

    if (anchorItem === undefined) {
      //return sorted.length;
      throw new Error("position anchor not found: " + anchor);
    }

    visited[anchor] = anchorItem;

    if (anchorItem && !(anchorItem.anchor in visited)) {
      insertIndex = orderPositioningItemRecursively(positioningItems, anchorItem.anchor, sorted, visited);

      if (anchorItem.placement !== Placement.Before) {
        ++insertIndex;
      }
    } else {
      insertIndex = sorted.length;
    }

    sorted.splice(insertIndex, 0, anchor);
    return insertIndex;
  };

  function isArrayConfig(config) {
    return typeof config === "object";
  }

  function applyOverride(overwritableKeys, sourceItem, customElement) {
    var outItem = sourceItem || customElement;

    for (var overwritableKey in overwritableKeys) {
      if (Object.hasOwnProperty.call(overwritableKeys, overwritableKey)) {
        var overrideConfig = overwritableKeys[overwritableKey];

        if (sourceItem !== null) {
          switch (overrideConfig) {
            case "overwrite":
              if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
                sourceItem[overwritableKey] = customElement[overwritableKey];
              }

              break;

            case "merge":
            default:
              var subItem = sourceItem[overwritableKey] || [];
              var subConfig = {};

              if (isArrayConfig(overrideConfig)) {
                subConfig = overrideConfig;
              }

              if (Array.isArray(subItem)) {
                sourceItem[overwritableKey] = insertCustomElements(subItem, customElement && customElement[overwritableKey] || {}, subConfig);
              }

              break;
          }
        } else {
          switch (overrideConfig) {
            case "overwrite":
              if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
                outItem[overwritableKey] = customElement[overwritableKey];
              }

              break;

            case "merge":
            default:
              var _subConfig = {};

              if (isArrayConfig(overrideConfig)) {
                _subConfig = overrideConfig;
              }

              outItem[overwritableKey] = insertCustomElements([], customElement && customElement[overwritableKey] || {}, _subConfig);
              break;
          }
        }
      }
    }

    return outItem;
  }
  /**
   * Insert a set of custom elements in the right position in an original collection.
   *
   * @template T
   * @param rootElements a list of "ConfigurableObject" which means object that have a unique "key"
   * @param customElements an object containing extra object to add, they are indexed by a key and have a "position" object
   * @param overwritableKeys the list of keys from the original object that can be overwritten in case a custom element has the same "key"
   * @returns {T[]} an ordered array of elements including the custom ones
   */


  function insertCustomElements(rootElements, customElements) {
    var overwritableKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var firstAnchor = rootElements.length ? rootElements[0].key : null;
    var rootElementsWithoutLast = rootElements.filter(function (rootElement) {
      var _rootElement$position;

      return ((_rootElement$position = rootElement.position) === null || _rootElement$position === void 0 ? void 0 : _rootElement$position.placement) !== Placement.End;
    });
    var lastAnchor = rootElements.length ? rootElements[rootElementsWithoutLast.length - 1].key : null;
    var endElement;
    var positioningItems = {};
    var itemsPerKey = {};
    rootElements.forEach(function (rootElement) {
      var _rootElement$position2;

      if (((_rootElement$position2 = rootElement.position) === null || _rootElement$position2 === void 0 ? void 0 : _rootElement$position2.placement) === Placement.End && !endElement) {
        endElement = rootElement;
      } else {
        var _rootElement$position3, _rootElement$position4;

        positioningItems[rootElement.key] = {
          anchor: ((_rootElement$position3 = rootElement.position) === null || _rootElement$position3 === void 0 ? void 0 : _rootElement$position3.anchor) || rootElement.key,
          placement: ((_rootElement$position4 = rootElement.position) === null || _rootElement$position4 === void 0 ? void 0 : _rootElement$position4.placement) || Placement.After
        };
      }

      itemsPerKey[rootElement.key] = rootElement;
    });
    Object.keys(customElements).forEach(function (customElementKey) {
      var customElement = customElements[customElementKey];
      var anchor = customElement.position.anchor; // If no placement defined we are After

      if (!customElement.position.placement) {
        customElement.position.placement = Placement.After;
      } // If no anchor we're either After the last anchor or Before the first


      if (!anchor) {
        var potentialAnchor = customElement.position.placement === Placement.After ? lastAnchor : firstAnchor;
        customElement.position.anchor = potentialAnchor ? potentialAnchor : customElementKey;
      }

      if (itemsPerKey[customElement.key]) {
        itemsPerKey[customElement.key] = applyOverride(overwritableKeys, itemsPerKey[customElement.key], customElement);
      } else {
        itemsPerKey[customElement.key] = applyOverride(overwritableKeys, null, customElement);
        positioningItems[customElement.key] = customElement.position;
      }
    });
    var sortedKeys = [];
    Object.keys(positioningItems).forEach(function (positionItemKey) {
      orderPositioningItemRecursively(positioningItems, positionItemKey, sortedKeys, {});
    });
    var outElements = sortedKeys.map(function (key) {
      return itemsPerKey[key];
    });

    if (endElement) {
      outElements.push(endElement);
    }

    return outElements;
  }

  _exports.insertCustomElements = insertCustomElements;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvbmZpZ3VyYWJsZU9iamVjdC50cyJdLCJuYW1lcyI6WyJQbGFjZW1lbnQiLCJvcmRlclBvc2l0aW9uaW5nSXRlbVJlY3Vyc2l2ZWx5IiwicG9zaXRpb25pbmdJdGVtcyIsImFuY2hvciIsInNvcnRlZCIsInZpc2l0ZWQiLCJpbnNlcnRJbmRleCIsImluZGV4T2YiLCJhbmNob3JJdGVtIiwidW5kZWZpbmVkIiwiRXJyb3IiLCJwbGFjZW1lbnQiLCJCZWZvcmUiLCJsZW5ndGgiLCJzcGxpY2UiLCJpc0FycmF5Q29uZmlnIiwiY29uZmlnIiwiYXBwbHlPdmVycmlkZSIsIm92ZXJ3cml0YWJsZUtleXMiLCJzb3VyY2VJdGVtIiwiY3VzdG9tRWxlbWVudCIsIm91dEl0ZW0iLCJvdmVyd3JpdGFibGVLZXkiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJvdmVycmlkZUNvbmZpZyIsInN1Ykl0ZW0iLCJzdWJDb25maWciLCJBcnJheSIsImlzQXJyYXkiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsInJvb3RFbGVtZW50cyIsImN1c3RvbUVsZW1lbnRzIiwiZmlyc3RBbmNob3IiLCJrZXkiLCJyb290RWxlbWVudHNXaXRob3V0TGFzdCIsImZpbHRlciIsInJvb3RFbGVtZW50IiwicG9zaXRpb24iLCJFbmQiLCJsYXN0QW5jaG9yIiwiZW5kRWxlbWVudCIsIml0ZW1zUGVyS2V5IiwiZm9yRWFjaCIsIkFmdGVyIiwia2V5cyIsImN1c3RvbUVsZW1lbnRLZXkiLCJwb3RlbnRpYWxBbmNob3IiLCJzb3J0ZWRLZXlzIiwicG9zaXRpb25JdGVtS2V5Iiwib3V0RWxlbWVudHMiLCJtYXAiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOzs7O01BS1lBLFM7O2FBQUFBLFM7QUFBQUEsSUFBQUEsUztBQUFBQSxJQUFBQSxTO0FBQUFBLElBQUFBLFM7S0FBQUEsUyxLQUFBQSxTOzs7O0FBcUJaOzs7Ozs7Ozs7QUFTQSxNQUFNQywrQkFBK0IsR0FBRyxVQUN2Q0MsZ0JBRHVD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LENBQWY7QUFBQSxLQUFsQixDQUFwQjs7QUFDQSxRQUFJTyxVQUFKLEVBQWdCO0FBQ2ZTLE1BQUFBLFdBQVcsQ0FBQ0UsSUFBWixDQUFpQlgsVUFBakI7QUFDQTs7QUFDRCxXQUFPUyxXQUFQO0FBQ0EiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFBvc2l0aW9uID0ge1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cdHBsYWNlbWVudDogUGxhY2VtZW50O1xufTtcblxuZXhwb3J0IGVudW0gUGxhY2VtZW50IHtcblx0QWZ0ZXIgPSBcIkFmdGVyXCIsXG5cdEJlZm9yZSA9IFwiQmVmb3JlXCIsXG5cdEVuZCA9IFwiRW5kXCJcbn1cblxuZXhwb3J0IHR5cGUgQ29uZmlndXJhYmxlT2JqZWN0S2V5ID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgQ29uZmlndXJhYmxlT2JqZWN0ID0gUG9zaXRpb25hYmxlICYge1xuXHRrZXk6IENvbmZpZ3VyYWJsZU9iamVjdEtleTtcbn07XG5cbmV4cG9ydCB0eXBlIEN1c3RvbUVsZW1lbnQ8VCBleHRlbmRzIENvbmZpZ3VyYWJsZU9iamVjdD4gPSBUICYge1xuXHRwb3NpdGlvbjogUG9zaXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBQb3NpdGlvbmFibGUgPSB7XG5cdHBvc2l0aW9uPzogUG9zaXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBDb25maWd1cmFibGVSZWNvcmQ8VD4gPSBSZWNvcmQ8Q29uZmlndXJhYmxlT2JqZWN0S2V5LCBUPjtcblxuLyoqXG4gKiBSZWN1cnNpdmUgbWV0aG9kIHRoYXQgb3JkZXIgdGhlIGtleXMgYmFzZWQgb24gYSBwb3NpdGlvbiBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAcGFyYW0gcG9zaXRpb25pbmdJdGVtc1xuICogQHBhcmFtIGFuY2hvclxuICogQHBhcmFtIHNvcnRlZFxuICogQHBhcmFtIHZpc2l0ZWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBvcmRlciBvZiB0aGUgY3VycmVudCBpdGVtXG4gKi9cbmNvbnN0IG9yZGVyUG9zaXRpb25pbmdJdGVtUmVjdXJzaXZlbHkgPSAoXG5cdHBvc2l0aW9uaW5nSXRlbXM6IFJlY29yZDxzdHJpbmcsIFJlcXVpcmVkPFBvc2l0aW9uPj4sXG5cdGFuY2hvcjogc3RyaW5nLFxuXHRzb3J0ZWQ6IHN0cmluZ1tdLFxuXHR2aXNpdGVkOiBSZWNvcmQ8c3RyaW5nLCBSZXF1aXJlZDxQb3NpdGlvbj4+XG4pOiBudW1iZXIgPT4ge1xuXHRsZXQgaW5zZXJ0SW5kZXggPSBzb3J0ZWQuaW5kZXhPZihhbmNob3IpO1xuXHRpZiAoaW5zZXJ0SW5kZXggIT09IC0xKSB7XG5cdFx0cmV0dXJuIGluc2VydEluZGV4O1xuXHR9XG5cdGNvbnN0IGFuY2hvckl0ZW06IFJlcXVpcmVkPFBvc2l0aW9uPiA9IHBvc2l0aW9uaW5nSXRlbXNbYW5jaG9yXTtcblx0aWYgKGFuY2hvckl0ZW0gPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vcmV0dXJuIHNvcnRlZC5sZW5ndGg7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwicG9zaXRpb24gYW5jaG9yIG5vdCBmb3VuZDogXCIgKyBhbmNob3IpO1xuXHR9XG5cblx0dmlzaXRlZFthbmNob3JdID0gYW5jaG9ySXRlbTtcblx0aWYgKGFuY2hvckl0ZW0gJiYgIShhbmNob3JJdGVtLmFuY2hvciBpbiB2aXNpdGVkKSkge1xuXHRcdGluc2VydEluZGV4ID0gb3JkZXJQb3NpdGlvbmluZ0l0ZW1SZWN1cnNpdmVseShwb3NpdGlvbmluZ0l0ZW1zLCBhbmNob3JJdGVtLmFuY2hvciwgc29ydGVkLCB2aXNpdGVkKTtcblx0XHRpZiAoYW5jaG9ySXRlbS5wbGFjZW1lbnQgIT09IFBsYWNlbWVudC5CZWZvcmUpIHtcblx0XHRcdCsraW5zZXJ0SW5kZXg7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGluc2VydEluZGV4ID0gc29ydGVkLmxlbmd0aDtcblx0fVxuXG5cdHNvcnRlZC5zcGxpY2UoaW5zZXJ0SW5kZXgsIDAsIGFuY2hvcik7XG5cdHJldHVybiBpbnNlcnRJbmRleDtcbn07XG5cbnR5cGUgT3ZlcnJpZGVUeXBlID0gXCJtZXJnZVwiIHwgXCJvdmVyd3JpdGVcIiB8IFwiaWdub3JlXCI7XG50eXBlIEFycmF5T3ZlcnJpZGVUeXBlPEFycmF5VHlwZT4gPSBPdmVycmlkZUtleXM8QXJyYXlUeXBlPjtcblxudHlwZSBFbGVtZW50VHlwZTxUPiA9IFQgZXh0ZW5kcyBhbnlbXSA/IFRbbnVtYmVyXSA6IFQ7XG50eXBlIE92ZXJyaWRlS2V5czxUPiA9IHtcblx0W1AgaW4ga2V5b2YgVF0/OiBPdmVycmlkZVR5cGUgfCBBcnJheU92ZXJyaWRlVHlwZTxFbGVtZW50VHlwZTxUW1BdPj47XG59O1xuXG5mdW5jdGlvbiBpc0FycmF5Q29uZmlnPFQ+KGNvbmZpZzogT3ZlcnJpZGVUeXBlIHwgQXJyYXlPdmVycmlkZVR5cGU8VD4gfCB1bmRlZmluZWQpOiBjb25maWcgaXMgQXJyYXlPdmVycmlkZVR5cGU8VD4ge1xuXHRyZXR1cm4gdHlwZW9mIGNvbmZpZyA9PT0gXCJvYmplY3RcIjtcbn1cblxuZnVuY3Rpb24gYXBwbHlPdmVycmlkZTxUIGV4dGVuZHMgT2JqZWN0PihvdmVyd3JpdGFibGVLZXlzOiBPdmVycmlkZUtleXM8VD4sIHNvdXJjZUl0ZW06IFQgfCBudWxsLCBjdXN0b21FbGVtZW50OiBUKTogVCB7XG5cdGNvbnN0IG91dEl0ZW06IFQgPSBzb3VyY2VJdGVtIHx8IGN1c3RvbUVsZW1lbnQ7XG5cdGZvciAoY29uc3Qgb3ZlcndyaXRhYmxlS2V5IGluIG92ZXJ3cml0YWJsZUtleXMpIHtcblx0XHRpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwob3ZlcndyaXRhYmxlS2V5cywgb3ZlcndyaXRhYmxlS2V5KSkge1xuXHRcdFx0Y29uc3Qgb3ZlcnJpZGVDb25maWcgPSBvdmVyd3JpdGFibGVLZXlzW292ZXJ3cml0YWJsZUtleV07XG5cdFx0XHRpZiAoc291cmNlSXRlbSAhPT0gbnVsbCkge1xuXHRcdFx0XHRzd2l0Y2ggKG92ZXJyaWRlQ29uZmlnKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIm92ZXJ3cml0ZVwiOlxuXHRcdFx0XHRcdFx0aWYgKGN1c3RvbUVsZW1lbnQuaGFzT3duUHJvcGVydHkob3ZlcndyaXRhYmxlS2V5KSAmJiBjdXN0b21FbGVtZW50W292ZXJ3cml0YWJsZUtleV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRzb3VyY2VJdGVtW292ZXJ3cml0YWJsZUtleV0gPSBjdXN0b21FbGVtZW50W292ZXJ3cml0YWJsZUtleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwibWVyZ2VcIjpcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViSXRlbSA9IHNvdXJjZUl0ZW1bb3ZlcndyaXRhYmxlS2V5XSB8fCAoW10gYXMgYW55W10pO1xuXHRcdFx0XHRcdFx0bGV0IHN1YkNvbmZpZyA9IHt9O1xuXHRcdFx0XHRcdFx0aWYgKGlzQXJyYXlDb25maWcob3ZlcnJpZGVDb25maWcpKSB7XG5cdFx0XHRcdFx0XHRcdHN1YkNvbmZpZyA9IG92ZXJyaWRlQ29uZmlnO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3ViSXRlbSkpIHtcblx0XHRcdFx0XHRcdFx0c291cmNlSXRlbVtvdmVyd3JpdGFibGVLZXldID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0XHRcdFx0XHRcdFx0c3ViSXRlbSxcblx0XHRcdFx0XHRcdFx0XHQoY3VzdG9tRWxlbWVudCAmJiAoY3VzdG9tRWxlbWVudFtvdmVyd3JpdGFibGVLZXldIGFzIFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnQ8YW55Pj4pKSB8fCB7fSxcblx0XHRcdFx0XHRcdFx0XHRzdWJDb25maWdcblx0XHRcdFx0XHRcdFx0KSBhcyBhbnk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3dpdGNoIChvdmVycmlkZUNvbmZpZykge1xuXHRcdFx0XHRcdGNhc2UgXCJvdmVyd3JpdGVcIjpcblx0XHRcdFx0XHRcdGlmIChjdXN0b21FbGVtZW50Lmhhc093blByb3BlcnR5KG92ZXJ3cml0YWJsZUtleSkgJiYgY3VzdG9tRWxlbWVudFtvdmVyd3JpdGFibGVLZXldICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0b3V0SXRlbVtvdmVyd3JpdGFibGVLZXldID0gY3VzdG9tRWxlbWVudFtvdmVyd3JpdGFibGVLZXldO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIm1lcmdlXCI6XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGxldCBzdWJDb25maWcgPSB7fTtcblx0XHRcdFx0XHRcdGlmIChpc0FycmF5Q29uZmlnKG92ZXJyaWRlQ29uZmlnKSkge1xuXHRcdFx0XHRcdFx0XHRzdWJDb25maWcgPSBvdmVycmlkZUNvbmZpZztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG91dEl0ZW1bb3ZlcndyaXRhYmxlS2V5XSA9IGluc2VydEN1c3RvbUVsZW1lbnRzKFxuXHRcdFx0XHRcdFx0XHRbXSBhcyBhbnlbXSxcblx0XHRcdFx0XHRcdFx0KGN1c3RvbUVsZW1lbnQgJiYgKGN1c3RvbUVsZW1lbnRbb3ZlcndyaXRhYmxlS2V5XSBhcyBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50PGFueT4+KSkgfHwge30sXG5cdFx0XHRcdFx0XHRcdHN1YkNvbmZpZ1xuXHRcdFx0XHRcdFx0KSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb3V0SXRlbTtcbn1cblxuLyoqXG4gKiBJbnNlcnQgYSBzZXQgb2YgY3VzdG9tIGVsZW1lbnRzIGluIHRoZSByaWdodCBwb3NpdGlvbiBpbiBhbiBvcmlnaW5hbCBjb2xsZWN0aW9uLlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0gcm9vdEVsZW1lbnRzIGEgbGlzdCBvZiBcIkNvbmZpZ3VyYWJsZU9iamVjdFwiIHdoaWNoIG1lYW5zIG9iamVjdCB0aGF0IGhhdmUgYSB1bmlxdWUgXCJrZXlcIlxuICogQHBhcmFtIGN1c3RvbUVsZW1lbnRzIGFuIG9iamVjdCBjb250YWluaW5nIGV4dHJhIG9iamVjdCB0byBhZGQsIHRoZXkgYXJlIGluZGV4ZWQgYnkgYSBrZXkgYW5kIGhhdmUgYSBcInBvc2l0aW9uXCIgb2JqZWN0XG4gKiBAcGFyYW0gb3ZlcndyaXRhYmxlS2V5cyB0aGUgbGlzdCBvZiBrZXlzIGZyb20gdGhlIG9yaWdpbmFsIG9iamVjdCB0aGF0IGNhbiBiZSBvdmVyd3JpdHRlbiBpbiBjYXNlIGEgY3VzdG9tIGVsZW1lbnQgaGFzIHRoZSBzYW1lIFwia2V5XCJcbiAqIEByZXR1cm5zIHtUW119IGFuIG9yZGVyZWQgYXJyYXkgb2YgZWxlbWVudHMgaW5jbHVkaW5nIHRoZSBjdXN0b20gb25lc1xuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0Q3VzdG9tRWxlbWVudHM8VCBleHRlbmRzIENvbmZpZ3VyYWJsZU9iamVjdD4oXG5cdHJvb3RFbGVtZW50czogVFtdLFxuXHRjdXN0b21FbGVtZW50czogUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudDxUPj4sXG5cdG92ZXJ3cml0YWJsZUtleXM6IE92ZXJyaWRlS2V5czxUPiA9IHt9XG4pOiBUW10ge1xuXHRjb25zdCBmaXJzdEFuY2hvciA9IHJvb3RFbGVtZW50cy5sZW5ndGggPyByb290RWxlbWVudHNbMF0ua2V5IDogbnVsbDtcblx0Y29uc3Qgcm9vdEVsZW1lbnRzV2l0aG91dExhc3QgPSByb290RWxlbWVudHMuZmlsdGVyKHJvb3RFbGVtZW50ID0+IHtcblx0XHRyZXR1cm4gcm9vdEVsZW1lbnQucG9zaXRpb24/LnBsYWNlbWVudCAhPT0gUGxhY2VtZW50LkVuZDtcblx0fSk7XG5cdGNvbnN0IGxhc3RBbmNob3IgPSByb290RWxlbWVudHMubGVuZ3RoID8gcm9vdEVsZW1lbnRzW3Jvb3RFbGVtZW50c1dpdGhvdXRMYXN0Lmxlbmd0aCAtIDFdLmtleSA6IG51bGw7XG5cdGxldCBlbmRFbGVtZW50OiBUIHwgdW5kZWZpbmVkO1xuXHRjb25zdCBwb3NpdGlvbmluZ0l0ZW1zOiBSZWNvcmQ8c3RyaW5nLCBSZXF1aXJlZDxQb3NpdGlvbj4+ID0ge307XG5cdGNvbnN0IGl0ZW1zUGVyS2V5OiBSZWNvcmQ8c3RyaW5nLCBUPiA9IHt9O1xuXHRyb290RWxlbWVudHMuZm9yRWFjaChyb290RWxlbWVudCA9PiB7XG5cdFx0aWYgKHJvb3RFbGVtZW50LnBvc2l0aW9uPy5wbGFjZW1lbnQgPT09IFBsYWNlbWVudC5FbmQgJiYgIWVuZEVsZW1lbnQpIHtcblx0XHRcdGVuZEVsZW1lbnQgPSByb290RWxlbWVudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cG9zaXRpb25pbmdJdGVtc1tyb290RWxlbWVudC5rZXldID0ge1xuXHRcdFx0XHRhbmNob3I6IHJvb3RFbGVtZW50LnBvc2l0aW9uPy5hbmNob3IgfHwgcm9vdEVsZW1lbnQua2V5LFxuXHRcdFx0XHRwbGFjZW1lbnQ6IHJvb3RFbGVtZW50LnBvc2l0aW9uPy5wbGFjZW1lbnQgfHwgUGxhY2VtZW50LkFmdGVyXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRpdGVtc1BlcktleVtyb290RWxlbWVudC5rZXldID0gcm9vdEVsZW1lbnQ7XG5cdH0pO1xuXHRPYmplY3Qua2V5cyhjdXN0b21FbGVtZW50cykuZm9yRWFjaChjdXN0b21FbGVtZW50S2V5ID0+IHtcblx0XHRjb25zdCBjdXN0b21FbGVtZW50ID0gY3VzdG9tRWxlbWVudHNbY3VzdG9tRWxlbWVudEtleV07XG5cdFx0Y29uc3QgYW5jaG9yID0gY3VzdG9tRWxlbWVudC5wb3NpdGlvbi5hbmNob3I7XG5cdFx0Ly8gSWYgbm8gcGxhY2VtZW50IGRlZmluZWQgd2UgYXJlIEFmdGVyXG5cdFx0aWYgKCFjdXN0b21FbGVtZW50LnBvc2l0aW9uLnBsYWNlbWVudCkge1xuXHRcdFx0Y3VzdG9tRWxlbWVudC5wb3NpdGlvbi5wbGFjZW1lbnQgPSBQbGFjZW1lbnQuQWZ0ZXI7XG5cdFx0fVxuXHRcdC8vIElmIG5vIGFuY2hvciB3ZSdyZSBlaXRoZXIgQWZ0ZXIgdGhlIGxhc3QgYW5jaG9yIG9yIEJlZm9yZSB0aGUgZmlyc3Rcblx0XHRpZiAoIWFuY2hvcikge1xuXHRcdFx0Y29uc3QgcG90ZW50aWFsQW5jaG9yID0gY3VzdG9tRWxlbWVudC5wb3NpdGlvbi5wbGFjZW1lbnQgPT09IFBsYWNlbWVudC5BZnRlciA/IGxhc3RBbmNob3IgOiBmaXJzdEFuY2hvcjtcblx0XHRcdGN1c3RvbUVsZW1lbnQucG9zaXRpb24uYW5jaG9yID0gcG90ZW50aWFsQW5jaG9yID8gcG90ZW50aWFsQW5jaG9yIDogY3VzdG9tRWxlbWVudEtleTtcblx0XHR9XG5cdFx0aWYgKGl0ZW1zUGVyS2V5W2N1c3RvbUVsZW1lbnQua2V5XSkge1xuXHRcdFx0aXRlbXNQZXJLZXlbY3VzdG9tRWxlbWVudC5rZXldID0gYXBwbHlPdmVycmlkZShvdmVyd3JpdGFibGVLZXlzLCBpdGVtc1BlcktleVtjdXN0b21FbGVtZW50LmtleV0sIGN1c3RvbUVsZW1lbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpdGVtc1BlcktleVtjdXN0b21FbGVtZW50LmtleV0gPSBhcHBseU92ZXJyaWRlKG92ZXJ3cml0YWJsZUtleXMsIG51bGwsIGN1c3RvbUVsZW1lbnQpO1xuXHRcdFx0cG9zaXRpb25pbmdJdGVtc1tjdXN0b21FbGVtZW50LmtleV0gPSBjdXN0b21FbGVtZW50LnBvc2l0aW9uIGFzIFJlcXVpcmVkPFBvc2l0aW9uPjtcblx0XHR9XG5cdH0pO1xuXHRjb25zdCBzb3J0ZWRLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdE9iamVjdC5rZXlzKHBvc2l0aW9uaW5nSXRlbXMpLmZvckVhY2gocG9zaXRpb25JdGVtS2V5ID0+IHtcblx0XHRvcmRlclBvc2l0aW9uaW5nSXRlbVJlY3Vyc2l2ZWx5KHBvc2l0aW9uaW5nSXRlbXMsIHBvc2l0aW9uSXRlbUtleSwgc29ydGVkS2V5cywge30pO1xuXHR9KTtcblxuXHRjb25zdCBvdXRFbGVtZW50cyA9IHNvcnRlZEtleXMubWFwKGtleSA9PiBpdGVtc1BlcktleVtrZXldKTtcblx0aWYgKGVuZEVsZW1lbnQpIHtcblx0XHRvdXRFbGVtZW50cy5wdXNoKGVuZEVsZW1lbnQpO1xuXHR9XG5cdHJldHVybiBvdXRFbGVtZW50cztcbn1cbiJdfQ==