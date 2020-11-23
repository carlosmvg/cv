sap.ui.define(["sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID"], function (ConfigurableObject, ID) {
  "use strict";

  var _exports = {};
  var HeaderFacetID = ID.HeaderFacetID;
  var CustomHeaderFacetID = ID.CustomHeaderFacetID;
  var Placement = ConfigurableObject.Placement;

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Definitions: Header Facet Types, Generic OP Header Facet, Manifest Properties for Custom Header Facet
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var HeaderFacetType;

  (function (HeaderFacetType) {
    HeaderFacetType["Annotation"] = "Annotation";
    HeaderFacetType["XMLFragment"] = "XMLFragment";
  })(HeaderFacetType || (HeaderFacetType = {}));

  _exports.HeaderFacetType = HeaderFacetType;
  var FlexDesignTimeType;

  (function (FlexDesignTimeType) {
    FlexDesignTimeType["Default"] = "Default";
    FlexDesignTimeType["NotAdaptable"] = "not-adaptable";
    FlexDesignTimeType["NotAdaptableTree"] = "not-adaptable-tree";
    FlexDesignTimeType["NotAdaptableVisibility"] = "not-adaptable-visibility";
  })(FlexDesignTimeType || (FlexDesignTimeType = {}));

  _exports.FlexDesignTimeType = FlexDesignTimeType;

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Collect All Header Facets: Custom (via Manifest) and Annotation Based (via Metamodel)
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieve header facets from annotations.
   *
   * @param {EntitySet} entitySet with annotations for this object
   * @param {ConverterContext} converterContext for this object
   *
   * @returns {ObjectPageHeaderFacet} header facets from annotations
   */
  function getHeaderFacetsFromAnnotations(entitySet, converterContext) {
    var _entitySet$entityType, _entitySet$entityType2, _entitySet$entityType3, _entitySet$entityType4, _entitySet$entityType5;

    return (_entitySet$entityType = (_entitySet$entityType2 = entitySet.entityType) === null || _entitySet$entityType2 === void 0 ? void 0 : (_entitySet$entityType3 = _entitySet$entityType2.annotations) === null || _entitySet$entityType3 === void 0 ? void 0 : (_entitySet$entityType4 = _entitySet$entityType3.UI) === null || _entitySet$entityType4 === void 0 ? void 0 : (_entitySet$entityType5 = _entitySet$entityType4.HeaderFacets) === null || _entitySet$entityType5 === void 0 ? void 0 : _entitySet$entityType5.map(function (facetCollection) {
      return createHeaderFacet(facetCollection, converterContext);
    })) !== null && _entitySet$entityType !== void 0 ? _entitySet$entityType : [];
  }
  /**
   * Retrieve custom header facets from manifest.
   *
   * @param {ConfigurableRecord<ManifestHeaderFacet>} manifestCustomHeaderFacets settings for this object
   *
   * @returns {Record<string, CustomObjectPageHeaderFacet>} header facets from manifest
   */


  _exports.getHeaderFacetsFromAnnotations = getHeaderFacetsFromAnnotations;

  function getHeaderFacetsFromManifest(manifestCustomHeaderFacets) {
    var customHeaderFacets = {};
    Object.keys(manifestCustomHeaderFacets).forEach(function (manifestHeaderFacetKey) {
      var customHeaderFacet = manifestCustomHeaderFacets[manifestHeaderFacetKey];
      customHeaderFacets[manifestHeaderFacetKey] = createCustomHeaderFacet(customHeaderFacet, manifestHeaderFacetKey);
    });
    return customHeaderFacets;
  } ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Annotation Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Create an annotation based header facet.
   *
   * @param {FacetTypes} facetDefinition of this object
   * @param {ConverterContext} converterContext for this object
   *
   * @returns {ObjectPageHeaderFacet} Annotation based header facet created
   */


  _exports.getHeaderFacetsFromManifest = getHeaderFacetsFromManifest;

  function createHeaderFacet(facetDefinition, converterContext) {
    var headerFacetID = HeaderFacetID({
      Facet: facetDefinition
    });

    var getHeaderFacetKey = function (facetDefinition, fallback) {
      var _facetDefinition$ID, _facetDefinition$Labe;

      return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
    };

    return {
      type: HeaderFacetType.Annotation,
      id: headerFacetID,
      key: getHeaderFacetKey(facetDefinition, headerFacetID),
      annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName) + "/"
    };
  } ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Manifest Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  function generateBinding(requestGroupId) {
    if (!requestGroupId) {
      return undefined;
    }

    var groupId = ["Heroes", "Decoration", "Workers", "LongRunners"].indexOf(requestGroupId) !== -1 ? "$auto." + requestGroupId : requestGroupId;
    return "{ path : '', parameters : { $$groupId : '" + groupId + "' } }";
  }
  /**
   * Create a manifest based custom header facet.
   *
   * @param {ManifestHeaderFacet} customHeaderFacetDefinition for this object
   * @param {string} headerFacetKey of this object
   *
   * @returns {CustomObjectPageHeaderFacet} manifest based custom header facet created
   */


  function createCustomHeaderFacet(customHeaderFacetDefinition, headerFacetKey) {
    var customHeaderFacetID = CustomHeaderFacetID(headerFacetKey);
    var position = customHeaderFacetDefinition.position;

    if (!position) {
      position = {
        placement: Placement.After
      };
    }

    return {
      type: customHeaderFacetDefinition.type,
      id: customHeaderFacetID,
      key: headerFacetKey,
      position: position,
      visible: customHeaderFacetDefinition.visible,
      fragmentName: customHeaderFacetDefinition.name,
      title: customHeaderFacetDefinition.title,
      subTitle: customHeaderFacetDefinition.subTitle,
      stashed: customHeaderFacetDefinition.stashed || false,
      flexSettings: _objectSpread({}, {
        designtime: FlexDesignTimeType.Default
      }, {}, customHeaderFacetDefinition.flexSettings),
      binding: generateBinding(customHeaderFacetDefinition.requestGroupId)
    };
  }

  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhlYWRlckZhY2V0LnRzIl0sIm5hbWVzIjpbIkhlYWRlckZhY2V0VHlwZSIsIkZsZXhEZXNpZ25UaW1lVHlwZSIsImdldEhlYWRlckZhY2V0c0Zyb21Bbm5vdGF0aW9ucyIsImVudGl0eVNldCIsImNvbnZlcnRlckNvbnRleHQiLCJlbnRpdHlUeXBlIiwiYW5ub3RhdGlvbnMiLCJVSSIsIkhlYWRlckZhY2V0cyIsIm1hcCIsImZhY2V0Q29sbGVjdGlvbiIsImNyZWF0ZUhlYWRlckZhY2V0IiwiZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0IiwibWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHMiLCJjdXN0b21IZWFkZXJGYWNldHMiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsIm1hbmlmZXN0SGVhZGVyRmFjZXRLZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0IiwiZmFjZXREZWZpbml0aW9uIiwiaGVhZGVyRmFjZXRJRCIsIkhlYWRlckZhY2V0SUQiLCJGYWNldCIsImdldEhlYWRlckZhY2V0S2V5IiwiZmFsbGJhY2siLCJJRCIsInRvU3RyaW5nIiwiTGFiZWwiLCJ0eXBlIiwiQW5ub3RhdGlvbiIsImlkIiwia2V5IiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiZ2VuZXJhdGVCaW5kaW5nIiwicmVxdWVzdEdyb3VwSWQiLCJ1bmRlZmluZWQiLCJncm91cElkIiwiaW5kZXhPZiIsImN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbiIsImhlYWRlckZhY2V0S2V5IiwiY3VzdG9tSGVhZGVyRmFjZXRJRCIsIkN1c3RvbUhlYWRlckZhY2V0SUQiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwidmlzaWJsZSIsImZyYWdtZW50TmFtZSIsIm5hbWUiLCJ0aXRsZSIsInN1YlRpdGxlIiwic3Rhc2hlZCIs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QUFNQyxtQkFBbUIsR0FBR0MsbUJBQW1CLENBQUNGLGNBQUQsQ0FBL0M7QUFFQSxRQUFJRyxRQUE4QixHQUFHSiwyQkFBMkIsQ0FBQ0ksUUFBakU7O0FBQ0EsUUFBSSxDQUFDQSxRQUFMLEVBQWU7QUFDZEEsTUFBQUEsUUFBUSxHQUFHO0FBQ1ZDLFFBQUFBLFNBQVMsRUFBRUMsU0FBUyxDQUFDQztBQURYLE9BQVg7QUFHQTs7QUFDRCxXQUFPO0FBQ05uQixNQUFBQSxJQUFJLEVBQUVZLDJCQUEyQixDQUFDWixJQUQ1QjtBQUVORSxNQUFBQSxFQUFFLEVBQUVZLG1CQUZFO0FBR05YLE1BQUFBLEdBQUcsRUFBRVUsY0FIQztBQUlORyxNQUFBQSxRQUFRLEVBQUVBLFFBSko7QUFLTkksTUFBQUEsT0FBTyxFQUFFUiwyQkFBMkIsQ0FBQ1EsT0FML0I7QUFNTkMsTUFBQUEsWUFBWSxFQUFFVCwyQkFBMkIsQ0FBQ1UsSUFOcEM7QUFPTkMsTUFBQUEsS0FBSyxFQUFFWCwyQkFBMkIsQ0FBQ1csS0FQN0I7QUFRTkMsTUFBQUEsUUFBUSxFQUFFWiwyQkFBMkIsQ0FBQ1ksUUFSaEM7QUFTTkMsTUFBQUEsT0FBTyxFQUFFYiwyQkFBMkIsQ0FBQ2EsT0FBNUIsSUFBdUMsS0FUMUM7QUFVTkMsTUFBQUEsWUFBWSxvQkFBTztBQUFFQyxRQUFBQSxVQUFVLEVBQUV4RCxrQkFBa0IsQ0FBQ3lEO0FBQWpDLE9BQVAsTUFBc0RoQiwyQkFBMkIsQ0FBQ2MsWUFBbEYsQ0FWTjtBQVdORyxNQUFBQSxPQUFPLEVBQUV0QixlQUFlLENBQUNLLDJCQUEyQixDQUFDSixjQUE3QjtBQVhsQixLQUFQO0FBYUEiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1hbmlmZXN0SGVhZGVyRmFjZXQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQge1xuXHRDb25maWd1cmFibGVPYmplY3QsXG5cdENvbmZpZ3VyYWJsZVJlY29yZCxcblx0Q3VzdG9tRWxlbWVudCxcblx0UGxhY2VtZW50LFxuXHRQb3NpdGlvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgRW50aXR5U2V0IH0gZnJvbSBcIkBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXJcIjtcbmltcG9ydCB7IEZhY2V0VHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IENvbnZlcnRlckNvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy90ZW1wbGF0ZXMvQmFzZUNvbnZlcnRlclwiO1xuaW1wb3J0IHsgQ3VzdG9tSGVhZGVyRmFjZXRJRCwgSGVhZGVyRmFjZXRJRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB7IEJpbmRpbmdFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ0V4cHJlc3Npb25cIjtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBEZWZpbml0aW9uczogSGVhZGVyIEZhY2V0IFR5cGVzLCBHZW5lcmljIE9QIEhlYWRlciBGYWNldCwgTWFuaWZlc3QgUHJvcGVydGllcyBmb3IgQ3VzdG9tIEhlYWRlciBGYWNldFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmV4cG9ydCBlbnVtIEhlYWRlckZhY2V0VHlwZSB7XG5cdEFubm90YXRpb24gPSBcIkFubm90YXRpb25cIixcblx0WE1MRnJhZ21lbnQgPSBcIlhNTEZyYWdtZW50XCJcbn1cblxuZXhwb3J0IGVudW0gRmxleERlc2lnblRpbWVUeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHROb3RBZGFwdGFibGUgPSBcIm5vdC1hZGFwdGFibGVcIiwgLy8gZGlzYWJsZSBhbGwgYWN0aW9ucyBvbiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVRyZWUgPSBcIm5vdC1hZGFwdGFibGUtdHJlZVwiLCAvLyBkaXNhYmxlIGFsbCBhY3Rpb25zIG9uIHRoYXQgaW5zdGFuY2UgYW5kIG9uIGFsbCBjaGlsZHJlbiBvZiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVZpc2liaWxpdHkgPSBcIm5vdC1hZGFwdGFibGUtdmlzaWJpbGl0eVwiIC8vIGRpc2FibGUgYWxsIGFjdGlvbnMgdGhhdCBpbmZsdWVuY2UgdGhlIHZpc2liaWxpdHksIG5hbWVseSByZXZlYWwgYW5kIHJlbW92ZVxufVxuXG5leHBvcnQgdHlwZSBGbGV4U2V0dGluZ3MgPSB7XG5cdGRlc2lnbnRpbWU/OiBGbGV4RGVzaWduVGltZVR5cGU7XG59O1xuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlSGVhZGVyRmFjZXQgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdHR5cGU6IEhlYWRlckZhY2V0VHlwZTtcblx0aWQ6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQgPSBDdXN0b21FbGVtZW50PE9iamVjdFBhZ2VIZWFkZXJGYWNldD4gJiB7XG5cdHZpc2libGU6IEJpbmRpbmdFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRmcmFnbWVudE5hbWU6IHN0cmluZztcblx0dGl0bGU/OiBzdHJpbmc7XG5cdHN1YlRpdGxlPzogc3RyaW5nO1xuXHRzdGFzaGVkPzogYm9vbGVhbjtcblx0ZmxleFNldHRpbmdzPzogRmxleFNldHRpbmdzO1xuXHRiaW5kaW5nPzogc3RyaW5nO1xufTtcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb2xsZWN0IEFsbCBIZWFkZXIgRmFjZXRzOiBDdXN0b20gKHZpYSBNYW5pZmVzdCkgYW5kIEFubm90YXRpb24gQmFzZWQgKHZpYSBNZXRhbW9kZWwpXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXRyaWV2ZSBoZWFkZXIgZmFjZXRzIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIHtFbnRpdHlTZXR9IGVudGl0eVNldCB3aXRoIGFubm90YXRpb25zIGZvciB0aGlzIG9iamVjdFxuICogQHBhcmFtIHtDb252ZXJ0ZXJDb250ZXh0fSBjb252ZXJ0ZXJDb250ZXh0IGZvciB0aGlzIG9iamVjdFxuICpcbiAqIEByZXR1cm5zIHtPYmplY3RQYWdlSGVhZGVyRmFjZXR9IGhlYWRlciBmYWNldHMgZnJvbSBhbm5vdGF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zKGVudGl0eVNldDogRW50aXR5U2V0LCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogT2JqZWN0UGFnZUhlYWRlckZhY2V0W10ge1xuXHRyZXR1cm4gKFxuXHRcdGVudGl0eVNldC5lbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckZhY2V0cz8ubWFwKGZhY2V0Q29sbGVjdGlvbiA9PiBjcmVhdGVIZWFkZXJGYWNldChmYWNldENvbGxlY3Rpb24sIGNvbnZlcnRlckNvbnRleHQpKSA/P1xuXHRcdFtdXG5cdCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgY3VzdG9tIGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0ge0NvbmZpZ3VyYWJsZVJlY29yZDxNYW5pZmVzdEhlYWRlckZhY2V0Pn0gbWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHMgc2V0dGluZ3MgZm9yIHRoaXMgb2JqZWN0XG4gKlxuICogQHJldHVybnMge1JlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD59IGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZGVyRmFjZXRzRnJvbU1hbmlmZXN0KFxuXHRtYW5pZmVzdEN1c3RvbUhlYWRlckZhY2V0czogQ29uZmlndXJhYmxlUmVjb3JkPE1hbmlmZXN0SGVhZGVyRmFjZXQ+XG4pOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQ+IHtcblx0Y29uc3QgY3VzdG9tSGVhZGVyRmFjZXRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQ+ID0ge307XG5cblx0T2JqZWN0LmtleXMobWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHMpLmZvckVhY2gobWFuaWZlc3RIZWFkZXJGYWNldEtleSA9PiB7XG5cdFx0Y29uc3QgY3VzdG9tSGVhZGVyRmFjZXQ6IE1hbmlmZXN0SGVhZGVyRmFjZXQgPSBtYW5pZmVzdEN1c3RvbUhlYWRlckZhY2V0c1ttYW5pZmVzdEhlYWRlckZhY2V0S2V5XTtcblx0XHRjdXN0b21IZWFkZXJGYWNldHNbbWFuaWZlc3RIZWFkZXJGYWNldEtleV0gPSBjcmVhdGVDdXN0b21IZWFkZXJGYWNldChjdXN0b21IZWFkZXJGYWNldCwgbWFuaWZlc3RIZWFkZXJGYWNldEtleSk7XG5cdH0pO1xuXG5cdHJldHVybiBjdXN0b21IZWFkZXJGYWNldHM7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQ29udmVydCAmIEJ1aWxkIEFubm90YXRpb24gQmFzZWQgSGVhZGVyIEZhY2V0c1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbi8qKlxuICogQ3JlYXRlIGFuIGFubm90YXRpb24gYmFzZWQgaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBwYXJhbSB7RmFjZXRUeXBlc30gZmFjZXREZWZpbml0aW9uIG9mIHRoaXMgb2JqZWN0XG4gKiBAcGFyYW0ge0NvbnZlcnRlckNvbnRleHR9IGNvbnZlcnRlckNvbnRleHQgZm9yIHRoaXMgb2JqZWN0XG4gKlxuICogQHJldHVybnMge09iamVjdFBhZ2VIZWFkZXJGYWNldH0gQW5ub3RhdGlvbiBiYXNlZCBoZWFkZXIgZmFjZXQgY3JlYXRlZFxuICovXG5mdW5jdGlvbiBjcmVhdGVIZWFkZXJGYWNldChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlSGVhZGVyRmFjZXQge1xuXHRjb25zdCBoZWFkZXJGYWNldElEID0gSGVhZGVyRmFjZXRJRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSk7XG5cdGNvbnN0IGdldEhlYWRlckZhY2V0S2V5ID0gKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0cmV0dXJuIGZhY2V0RGVmaW5pdGlvbi5JRD8udG9TdHJpbmcoKSB8fCBmYWNldERlZmluaXRpb24uTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiBIZWFkZXJGYWNldFR5cGUuQW5ub3RhdGlvbixcblx0XHRpZDogaGVhZGVyRmFjZXRJRCxcblx0XHRrZXk6IGdldEhlYWRlckZhY2V0S2V5KGZhY2V0RGVmaW5pdGlvbiwgaGVhZGVyRmFjZXRJRCksXG5cdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKSArIFwiL1wiXG5cdH07XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQ29udmVydCAmIEJ1aWxkIE1hbmlmZXN0IEJhc2VkIEhlYWRlciBGYWNldHNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUJpbmRpbmcocmVxdWVzdEdyb3VwSWQ/OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoIXJlcXVlc3RHcm91cElkKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBncm91cElkID1cblx0XHRbXCJIZXJvZXNcIiwgXCJEZWNvcmF0aW9uXCIsIFwiV29ya2Vyc1wiLCBcIkxvbmdSdW5uZXJzXCJdLmluZGV4T2YocmVxdWVzdEdyb3VwSWQpICE9PSAtMSA/IFwiJGF1dG8uXCIgKyByZXF1ZXN0R3JvdXBJZCA6IHJlcXVlc3RHcm91cElkO1xuXG5cdHJldHVybiBcInsgcGF0aCA6ICcnLCBwYXJhbWV0ZXJzIDogeyAkJGdyb3VwSWQgOiAnXCIgKyBncm91cElkICsgXCInIH0gfVwiO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hbmlmZXN0IGJhc2VkIGN1c3RvbSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQHBhcmFtIHtNYW5pZmVzdEhlYWRlckZhY2V0fSBjdXN0b21IZWFkZXJGYWNldERlZmluaXRpb24gZm9yIHRoaXMgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyRmFjZXRLZXkgb2YgdGhpcyBvYmplY3RcbiAqXG4gKiBAcmV0dXJucyB7Q3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0fSBtYW5pZmVzdCBiYXNlZCBjdXN0b20gaGVhZGVyIGZhY2V0IGNyZWF0ZWRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXQoY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uOiBNYW5pZmVzdEhlYWRlckZhY2V0LCBoZWFkZXJGYWNldEtleTogc3RyaW5nKTogQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0IHtcblx0Y29uc3QgY3VzdG9tSGVhZGVyRmFjZXRJRCA9IEN1c3RvbUhlYWRlckZhY2V0SUQoaGVhZGVyRmFjZXRLZXkpO1xuXG5cdGxldCBwb3NpdGlvbjogUG9zaXRpb24gfCB1bmRlZmluZWQgPSBjdXN0b21IZWFkZXJGYWNldERlZmluaXRpb24ucG9zaXRpb247XG5cdGlmICghcG9zaXRpb24pIHtcblx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50eXBlLFxuXHRcdGlkOiBjdXN0b21IZWFkZXJGYWNldElELFxuXHRcdGtleTogaGVhZGVyRmFjZXRLZXksXG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdHZpc2libGU6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi52aXNpYmxlLFxuXHRcdGZyYWdtZW50TmFtZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLm5hbWUsXG5cdFx0dGl0bGU6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50aXRsZSxcblx0XHRzdWJUaXRsZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnN1YlRpdGxlLFxuXHRcdHN0YXNoZWQ6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5zdGFzaGVkIHx8IGZhbHNlLFxuXHRcdGZsZXhTZXR0aW5nczogeyAuLi57IGRlc2lnbnRpbWU6IEZsZXhEZXNpZ25UaW1lVHlwZS5EZWZhdWx0IH0sIC4uLmN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5mbGV4U2V0dGluZ3MgfSxcblx0XHRiaW5kaW5nOiBnZW5lcmF0ZUJpbmRpbmcoY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnJlcXVlc3RHcm91cElkKVxuXHR9O1xufVxuIl19