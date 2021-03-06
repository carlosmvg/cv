sap.ui.define(["./templates/ListReportConverter", "./templates/ObjectPageConverter", "./MetaModelConverter", "sap/fe/core/converters/ConverterContext"], function (ListReportConverter, ObjectPageConverter, MetaModelConverter, ConverterContext) {
  "use strict";

  var _exports = {};
  var createConverterContext = ConverterContext.createConverterContext;
  var convertTypes = MetaModelConverter.convertTypes;

  /**
   * Based on a template type, convert the metamodel and manifest definition into a json structure for the page.
   *
   * @param {TemplateConverterType} sTemplateType the template type
   * @param {ODataMetaModel} oMetaModel the odata model metaModel
   * @param {BaseManifestSettings} oManifestSettings current manifest settings
   * @returns {PageDefinition} the target page definition
   */
  function convertPage(sTemplateType, oMetaModel, oManifestSettings) {
    var oConverterOutput = convertTypes(oMetaModel);
    var sTargetEntitySetName = oManifestSettings.entitySet;
    var oTargetEntitySet = oConverterOutput.entitySets.find(function (entitySet) {
      return entitySet.name === sTargetEntitySetName;
    });

    if (oTargetEntitySet) {
      var oContext = oMetaModel.createBindingContext("/" + sTargetEntitySetName);
      var oConvertedPage;

      switch (sTemplateType) {
        case "ListReport":
        case "AnalyticalListPage":
          oConvertedPage = ListReportConverter.convertPage(oTargetEntitySet, createConverterContext(oConverterOutput, oContext, oManifestSettings, oTargetEntitySet, sTemplateType));
          break;

        case "ObjectPage":
          oConvertedPage = ObjectPageConverter.convertPage(oTargetEntitySet, createConverterContext(oConverterOutput, oContext, oManifestSettings, oTargetEntitySet, sTemplateType));
          break;
      }

      return oConvertedPage;
    }
  }

  _exports.convertPage = convertPage;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlbXBsYXRlQ29udmVydGVyLnRzIl0sIm5hbWVzIjpbImNvbnZlcnRQYWdlIiwic1RlbXBsYXRlVHlwZSIsIm9NZXRhTW9kZWwiLCJvTWFuaWZlc3RTZXR0aW5ncyIsIm9Db252ZXJ0ZXJPdXRwdXQiLCJjb252ZXJ0VHlwZXMiLCJzVGFyZ2V0RW50aXR5U2V0TmFtZSIsImVudGl0eVNldCIsIm9UYXJnZXRFbnRpdHlTZXQiLCJlbnRpdHlTZXRzIiwiZmluZCIsIm5hbWUiLCJvQ29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwib0NvbnZlcnRlZFBhZ2UiLCJMaXN0UmVwb3J0Q29udmVydGVyIiwiY3JlYXRlQ29udmVydGVyQ29udGV4dCIsIk9iamVjdFBhZ2VDb252ZXJ0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7Ozs7Ozs7O0FBUU8sV0FBU0EsV0FBVCxDQUFxQkMsYUFBckIsRUFBMkRDLFVBQTNELEVBQXVGQyxpQkFBdkYsRUFBZ0k7QUFDdEksUUFBTUMsZ0JBQWdCLEdBQUdDLFlBQVksQ0FBQ0gsVUFBRCxDQUFyQztBQUNBLFFBQU1JLG9CQUFvQixHQUFHSCxpQkFBaUIsQ0FBQ0ksU0FBL0M7QUFDQSxRQUFNQyxnQkFBZ0IsR0FBR0osZ0JBQWdCLENBQUNLLFVBQWpCLENBQTRCQyxJQUE1QixDQUFpQyxVQUFDSCxTQUFEO0FBQUEsYUFBMEJBLFNBQVMsQ0FBQ0ksSUFBVixLQUFtQkwsb0JBQTdDO0FBQUEsS0FBakMsQ0FBekI7O0FBRUEsUUFBSUUsZ0JBQUosRUFBc0I7QUFDckIsVUFBTUksUUFBUSxHQUFHVixVQUFVLENBQUNXLG9CQUFYLENBQWdDLE1BQU1QLG9CQUF0QyxDQUFqQjtBQUNBLFVBQUlRLGNBQUo7O0FBQ0EsY0FBUWIsYUFBUjtBQUNDLGFBQUssWUFBTDtBQUNBLGFBQUssb0JBQUw7QUFDQ2EsVUFBQUEsY0FBYyxHQUFHQyxtQkFBbUIsQ0FBQ2YsV0FBcEIsQ0FDaEJRLGdCQURnQixFQUVoQlEsc0JBQXNCLENBQUNaLGdCQUFELEVBQW1CUSxRQUFuQixFQUE2QlQsaUJBQTdCLEVBQWdESyxnQkFBaEQsRUFBa0VQLGFBQWxFLENBRk4sQ0FBakI7QUFJQTs7QUFDRCxhQUFLLFlBQUw7QUFDQ2EsVUFBQUEsY0FBYyxHQUFHRyxtQkFBbUIsQ0FBQ2pCLFdBQXBCLENBQ2hCUSxnQkFEZ0IsRUFFaEJRLHNCQUFzQixDQUFDWixnQkFBRCxFQUFtQlEsUUFBbkIsRUFBNkJULGlCQUE3QixFQUFnREssZ0JBQWhELEVBQWtFUCxhQUFsRSxDQUZOLENBQWpCO0FBSUE7QUFiRjs7QUFlQSxhQUFPYSxjQUFQO0FBQ0E7QUFDRCIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZU1hbmlmZXN0U2V0dGluZ3MgfSBmcm9tIFwiLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgKiBhcyBMaXN0UmVwb3J0Q29udmVydGVyIGZyb20gXCIuL3RlbXBsYXRlcy9MaXN0UmVwb3J0Q29udmVydGVyXCI7XG5pbXBvcnQgT2JqZWN0UGFnZUNvbnZlcnRlciBmcm9tIFwiLi90ZW1wbGF0ZXMvT2JqZWN0UGFnZUNvbnZlcnRlclwiO1xuaW1wb3J0IHsgY29udmVydFR5cGVzIH0gZnJvbSBcIi4vTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBPRGF0YU1ldGFNb2RlbCB9IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjRcIjtcbmltcG9ydCB7IFRlbXBsYXRlQ29udmVydGVyVHlwZSB9IGZyb20gXCIuL3RlbXBsYXRlcy9CYXNlQ29udmVydGVyXCI7XG5pbXBvcnQgeyBFbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlclwiO1xuaW1wb3J0IHsgY3JlYXRlQ29udmVydGVyQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcblxuLyoqXG4gKiBAdHlwZWRlZiBQYWdlRGVmaW5pdGlvblxuICovXG5leHBvcnQgdHlwZSBQYWdlRGVmaW5pdGlvbiA9IHtcblx0dGVtcGxhdGU6IHN0cmluZztcbn07XG5cbi8qKlxuICogQmFzZWQgb24gYSB0ZW1wbGF0ZSB0eXBlLCBjb252ZXJ0IHRoZSBtZXRhbW9kZWwgYW5kIG1hbmlmZXN0IGRlZmluaXRpb24gaW50byBhIGpzb24gc3RydWN0dXJlIGZvciB0aGUgcGFnZS5cbiAqXG4gKiBAcGFyYW0ge1RlbXBsYXRlQ29udmVydGVyVHlwZX0gc1RlbXBsYXRlVHlwZSB0aGUgdGVtcGxhdGUgdHlwZVxuICogQHBhcmFtIHtPRGF0YU1ldGFNb2RlbH0gb01ldGFNb2RlbCB0aGUgb2RhdGEgbW9kZWwgbWV0YU1vZGVsXG4gKiBAcGFyYW0ge0Jhc2VNYW5pZmVzdFNldHRpbmdzfSBvTWFuaWZlc3RTZXR0aW5ncyBjdXJyZW50IG1hbmlmZXN0IHNldHRpbmdzXG4gKiBAcmV0dXJucyB7UGFnZURlZmluaXRpb259IHRoZSB0YXJnZXQgcGFnZSBkZWZpbml0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UGFnZShzVGVtcGxhdGVUeXBlOiBUZW1wbGF0ZUNvbnZlcnRlclR5cGUsIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBvTWFuaWZlc3RTZXR0aW5nczogQmFzZU1hbmlmZXN0U2V0dGluZ3MpIHtcblx0Y29uc3Qgb0NvbnZlcnRlck91dHB1dCA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsKTtcblx0Y29uc3Qgc1RhcmdldEVudGl0eVNldE5hbWUgPSBvTWFuaWZlc3RTZXR0aW5ncy5lbnRpdHlTZXQ7XG5cdGNvbnN0IG9UYXJnZXRFbnRpdHlTZXQgPSBvQ29udmVydGVyT3V0cHV0LmVudGl0eVNldHMuZmluZCgoZW50aXR5U2V0OiBFbnRpdHlTZXQpID0+IGVudGl0eVNldC5uYW1lID09PSBzVGFyZ2V0RW50aXR5U2V0TmFtZSk7XG5cblx0aWYgKG9UYXJnZXRFbnRpdHlTZXQpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIgKyBzVGFyZ2V0RW50aXR5U2V0TmFtZSk7XG5cdFx0bGV0IG9Db252ZXJ0ZWRQYWdlO1xuXHRcdHN3aXRjaCAoc1RlbXBsYXRlVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkxpc3RSZXBvcnRcIjpcblx0XHRcdGNhc2UgXCJBbmFseXRpY2FsTGlzdFBhZ2VcIjpcblx0XHRcdFx0b0NvbnZlcnRlZFBhZ2UgPSBMaXN0UmVwb3J0Q29udmVydGVyLmNvbnZlcnRQYWdlKFxuXHRcdFx0XHRcdG9UYXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdFx0Y3JlYXRlQ29udmVydGVyQ29udGV4dChvQ29udmVydGVyT3V0cHV0LCBvQ29udGV4dCwgb01hbmlmZXN0U2V0dGluZ3MsIG9UYXJnZXRFbnRpdHlTZXQsIHNUZW1wbGF0ZVR5cGUpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk9iamVjdFBhZ2VcIjpcblx0XHRcdFx0b0NvbnZlcnRlZFBhZ2UgPSBPYmplY3RQYWdlQ29udmVydGVyLmNvbnZlcnRQYWdlKFxuXHRcdFx0XHRcdG9UYXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdFx0Y3JlYXRlQ29udmVydGVyQ29udGV4dChvQ29udmVydGVyT3V0cHV0LCBvQ29udGV4dCwgb01hbmlmZXN0U2V0dGluZ3MsIG9UYXJnZXRFbnRpdHlTZXQsIHNUZW1wbGF0ZVR5cGUpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gb0NvbnZlcnRlZFBhZ2U7XG5cdH1cbn1cbiJdfQ==