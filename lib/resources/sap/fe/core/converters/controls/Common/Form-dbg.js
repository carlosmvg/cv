sap.ui.define(["../../helpers/ID"], function (ID) {
  "use strict";

  var _exports = {};
  var FormID = ID.FormID;

  function isReferenceFacet(facetDefinition) {
    return facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet";
  }

  _exports.isReferenceFacet = isReferenceFacet;

  function createFormDefinition(facetDefinition) {
    var _facetDefinition$anno, _facetDefinition$anno2;

    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        // Keep only valid children
        var formCollectionDefinition = {
          id: FormID({
            Facet: facetDefinition
          }),
          useFormContainerLabels: true,
          hasFacetsNotPartOfPreview: facetDefinition.Facets.some(function (childFacet) {
            var _childFacet$annotatio, _childFacet$annotatio2;

            return ((_childFacet$annotatio = childFacet.annotations) === null || _childFacet$annotatio === void 0 ? void 0 : (_childFacet$annotatio2 = _childFacet$annotatio.UI) === null || _childFacet$annotatio2 === void 0 ? void 0 : _childFacet$annotatio2.PartOfPreview) === false;
          })
        };
        return formCollectionDefinition;

      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        var formDefinition = {
          id: FormID({
            Facet: facetDefinition
          }),
          useFormContainerLabels: false,
          hasFacetsNotPartOfPreview: ((_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.PartOfPreview) === false
        };
        return formDefinition;

      default:
        throw new Error("Cannot create form based on ReferenceURLFacet");
    }
  }

  _exports.createFormDefinition = createFormDefinition;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZvcm0udHMiXSwibmFtZXMiOlsiaXNSZWZlcmVuY2VGYWNldCIsImZhY2V0RGVmaW5pdGlvbiIsIiRUeXBlIiwiY3JlYXRlRm9ybURlZmluaXRpb24iLCJmb3JtQ29sbGVjdGlvbkRlZmluaXRpb24iLCJpZCIsIkZvcm1JRCIsIkZhY2V0IiwidXNlRm9ybUNvbnRhaW5lckxhYmVscyIsImhhc0ZhY2V0c05vdFBhcnRPZlByZXZpZXciLCJGYWNldHMiLCJzb21lIiwiY2hpbGRGYWNldCIsImFubm90YXRpb25zIiwiVUkiLCJQYXJ0T2ZQcmV2aWV3IiwiZm9ybURlZmluaXRpb24iLCJFcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBU08sV0FBU0EsZ0JBQVQsQ0FBMEJDLGVBQTFCLEVBQStGO0FBQ3JHLFdBQU9BLGVBQWUsQ0FBQ0MsS0FBaEIsZ0RBQVA7QUFDQTs7OztBQUVNLFdBQVNDLG9CQUFULENBQThCRixlQUE5QixFQUEyRTtBQUFBOztBQUNqRixZQUFRQSxlQUFlLENBQUNDLEtBQXhCO0FBQ0M7QUFDQztBQUNBLFlBQU1FLHdCQUF3QixHQUFHO0FBQ2hDQyxVQUFBQSxFQUFFLEVBQUVDLE1BQU0sQ0FBQztBQUFFQyxZQUFBQSxLQUFLLEVBQUVOO0FBQVQsV0FBRCxDQURzQjtBQUVoQ08sVUFBQUEsc0JBQXNCLEVBQUUsSUFGUTtBQUdoQ0MsVUFBQUEseUJBQXlCLEVBQUVSLGVBQWUsQ0FBQ1MsTUFBaEIsQ0FBdUJDLElBQXZCLENBQTRCLFVBQUFDLFVBQVU7QUFBQTs7QUFBQSxtQkFBSSwwQkFBQUEsVUFBVSxDQUFDQyxXQUFYLDBHQUF3QkMsRUFBeEIsa0ZBQTRCQyxhQUE1QixNQUE4QyxLQUFsRDtBQUFBLFdBQXRDO0FBSEssU0FBakM7QUFLQSxlQUFPWCx3QkFBUDs7QUFDRDtBQUNDLFlBQU1ZLGNBQWMsR0FBRztBQUN0QlgsVUFBQUEsRUFBRSxFQUFFQyxNQUFNLENBQUM7QUFBRUMsWUFBQUEsS0FBSyxFQUFFTjtBQUFULFdBQUQsQ0FEWTtBQUV0Qk8sVUFBQUEsc0JBQXNCLEVBQUUsS0FGRjtBQUd0QkMsVUFBQUEseUJBQXlCLEVBQUUsMEJBQUFSLGVBQWUsQ0FBQ1ksV0FBaEIsMEdBQTZCQyxFQUE3QixrRkFBaUNDLGFBQWpDLE1BQW1EO0FBSHhELFNBQXZCO0FBS0EsZUFBT0MsY0FBUDs7QUFDRDtBQUNDLGNBQU0sSUFBSUMsS0FBSixDQUFVLCtDQUFWLENBQU47QUFqQkY7QUFtQkEiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZhY2V0VHlwZXMsIFJlZmVyZW5jZUZhY2V0VHlwZXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBGb3JtSUQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9JRFwiO1xuXG5leHBvcnQgdHlwZSBGb3JtRGVmaW5pdGlvbiA9IHtcblx0aWQ6IHN0cmluZztcblx0dXNlRm9ybUNvbnRhaW5lckxhYmVsczogYm9vbGVhbjtcblx0aGFzRmFjZXRzTm90UGFydE9mUHJldmlldzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZmVyZW5jZUZhY2V0KGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcyk6IGZhY2V0RGVmaW5pdGlvbiBpcyBSZWZlcmVuY2VGYWNldFR5cGVzIHtcblx0cmV0dXJuIGZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGb3JtRGVmaW5pdGlvbihmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpOiBGb3JtRGVmaW5pdGlvbiB7XG5cdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQ6XG5cdFx0XHQvLyBLZWVwIG9ubHkgdmFsaWQgY2hpbGRyZW5cblx0XHRcdGNvbnN0IGZvcm1Db2xsZWN0aW9uRGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0aWQ6IEZvcm1JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSksXG5cdFx0XHRcdHVzZUZvcm1Db250YWluZXJMYWJlbHM6IHRydWUsXG5cdFx0XHRcdGhhc0ZhY2V0c05vdFBhcnRPZlByZXZpZXc6IGZhY2V0RGVmaW5pdGlvbi5GYWNldHMuc29tZShjaGlsZEZhY2V0ID0+IGNoaWxkRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5QYXJ0T2ZQcmV2aWV3ID09PSBmYWxzZSlcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gZm9ybUNvbGxlY3Rpb25EZWZpbml0aW9uO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ6XG5cdFx0XHRjb25zdCBmb3JtRGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0aWQ6IEZvcm1JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSksXG5cdFx0XHRcdHVzZUZvcm1Db250YWluZXJMYWJlbHM6IGZhbHNlLFxuXHRcdFx0XHRoYXNGYWNldHNOb3RQYXJ0T2ZQcmV2aWV3OiBmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5QYXJ0T2ZQcmV2aWV3ID09PSBmYWxzZVxuXHRcdFx0fTtcblx0XHRcdHJldHVybiBmb3JtRGVmaW5pdGlvbjtcblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNyZWF0ZSBmb3JtIGJhc2VkIG9uIFJlZmVyZW5jZVVSTEZhY2V0XCIpO1xuXHR9XG59XG4iXX0=