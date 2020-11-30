sap.ui.define(["sap/fe/core/helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};
  var BASE_ID = ["fe"];
  /**
   * Shortcut to the stableIdHelper providing a "curry" like method where the last parameter is missing.
   *
   * @param sFixedPart
   * @returns {Function} a shorcut function with the fixed ID part
   */

  function IDGenerator() {
    for (var _len = arguments.length, sFixedPart = new Array(_len), _key = 0; _key < _len; _key++) {
      sFixedPart[_key] = arguments[_key];
    }

    return function () {
      for (var _len2 = arguments.length, sIDPart = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        sIDPart[_key2] = arguments[_key2];
      }

      return StableIdHelper.generate(BASE_ID.concat.apply(BASE_ID, sFixedPart.concat(sIDPart)));
    };
  }
  /**
   * Those are all helpers to centralize ID generation in the code for different elements
   */


  _exports.IDGenerator = IDGenerator;
  var HeaderFacetID = IDGenerator("HeaderFacet");
  _exports.HeaderFacetID = HeaderFacetID;
  var CustomHeaderFacetID = IDGenerator("HeaderFacetCustomContainer");
  _exports.CustomHeaderFacetID = CustomHeaderFacetID;
  var SectionID = IDGenerator("FacetSection");
  _exports.SectionID = SectionID;
  var CustomSectionID = IDGenerator("CustomSection");
  _exports.CustomSectionID = CustomSectionID;
  var SubSectionID = IDGenerator("FacetSubSection");
  _exports.SubSectionID = SubSectionID;
  var CustomSubSectionID = IDGenerator("CustomSubSection");
  _exports.CustomSubSectionID = CustomSubSectionID;
  var FormID = IDGenerator("Form");
  _exports.FormID = FormID;
  var TableID = IDGenerator("table");
  _exports.TableID = TableID;
  var FilterBarID = IDGenerator("FilterBar");
  _exports.FilterBarID = FilterBarID;

  var FilterVariantManagementID = function (sFilterID) {
    return StableIdHelper.generate([sFilterID, "VariantManagement"]);
  };

  _exports.FilterVariantManagementID = FilterVariantManagementID;
  var ChartID = IDGenerator("Chart");
  _exports.ChartID = ChartID;

  var CustomActionID = function (sActionID) {
    return StableIdHelper.generate(["CustomAction", sActionID]);
  };

  _exports.CustomActionID = CustomActionID;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIklELnRzIl0sIm5hbWVzIjpbIkJBU0VfSUQiLCJJREdlbmVyYXRvciIsInNGaXhlZFBhcnQiLCJzSURQYXJ0IiwiU3RhYmxlSWRIZWxwZXIiLCJnZW5lcmF0ZSIsImNvbmNhdCIsIkhlYWRlckZhY2V0SUQiLCJDdXN0b21IZWFkZXJGYWNldElEIiwiU2VjdGlvbklEIiwiQ3VzdG9tU2VjdGlvbklEIiwiU3ViU2VjdGlvbklEIiwiQ3VzdG9tU3ViU2VjdGlvbklEIiwiRm9ybUlEIiwiVGFibGVJRCIsIkZpbHRlckJhcklEIiwiRmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCIsInNGaWx0ZXJJRCIsIkNoYXJ0SUQiLCJDdXN0b21BY3Rpb25JRCIsInNBY3Rpb25JRCJdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLE1BQU1BLE9BQWlCLEdBQUcsQ0FBQyxJQUFELENBQTFCO0FBRUE7Ozs7Ozs7QUFNTyxXQUFTQyxXQUFULEdBQThDO0FBQUEsc0NBQXRCQyxVQUFzQjtBQUF0QkEsTUFBQUEsVUFBc0I7QUFBQTs7QUFDcEQsV0FBTyxZQUErQjtBQUFBLHlDQUFuQkMsT0FBbUI7QUFBbkJBLFFBQUFBLE9BQW1CO0FBQUE7O0FBQ3JDLGFBQU9DLGNBQWMsQ0FBQ0MsUUFBZixDQUF3QkwsT0FBTyxDQUFDTSxNQUFSLE9BQUFOLE9BQU8sRUFBV0UsVUFBWCxRQUEwQkMsT0FBMUIsRUFBL0IsQ0FBUDtBQUNBLEtBRkQ7QUFHQTtBQUVEOzs7Ozs7QUFHTyxNQUFNSSxhQUFhLEdBQUdOLFdBQVcsQ0FBQyxhQUFELENBQWpDOztBQUNBLE1BQU1PLG1CQUFtQixHQUFHUCxXQUFXLENBQUMsNEJBQUQsQ0FBdkM7O0FBQ0EsTUFBTVEsU0FBUyxHQUFHUixXQUFXLENBQUMsY0FBRCxDQUE3Qjs7QUFDQSxNQUFNUyxlQUFlLEdBQUdULFdBQVcsQ0FBQyxlQUFELENBQW5DOztBQUNBLE1BQU1VLFlBQVksR0FBR1YsV0FBVyxDQUFDLGlCQUFELENBQWhDOztBQUNBLE1BQU1XLGtCQUFrQixHQUFHWCxXQUFXLENBQUMsa0JBQUQsQ0FBdEM7O0FBQ0EsTUFBTVksTUFBTSxHQUFHWixXQUFXLENBQUMsTUFBRCxDQUExQjs7QUFDQSxNQUFNYSxPQUFPLEdBQUdiLFdBQVcsQ0FBQyxPQUFELENBQTNCOztBQUNBLE1BQU1jLFdBQVcsR0FBR2QsV0FBVyxDQUFDLFdBQUQsQ0FBL0I7OztBQUNBLE1BQU1lLHlCQUF5QixHQUFHLFVBQVNDLFNBQVQsRUFBNEI7QUFDcEUsV0FBT2IsY0FBYyxDQUFDQyxRQUFmLENBQXdCLENBQUNZLFNBQUQsRUFBWSxtQkFBWixDQUF4QixDQUFQO0FBQ0EsR0FGTTs7O0FBR0EsTUFBTUMsT0FBTyxHQUFHakIsV0FBVyxDQUFDLE9BQUQsQ0FBM0I7OztBQUNBLE1BQU1rQixjQUFjLEdBQUcsVUFBU0MsU0FBVCxFQUE0QjtBQUN6RCxXQUFPaEIsY0FBYyxDQUFDQyxRQUFmLENBQXdCLENBQUMsY0FBRCxFQUFpQmUsU0FBakIsQ0FBeEIsQ0FBUDtBQUNBLEdBRk0iLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElEUGFydCwgU3RhYmxlSWRIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVyc1wiO1xuXG5jb25zdCBCQVNFX0lEOiBJRFBhcnRbXSA9IFtcImZlXCJdO1xuXG4vKipcbiAqIFNob3J0Y3V0IHRvIHRoZSBzdGFibGVJZEhlbHBlciBwcm92aWRpbmcgYSBcImN1cnJ5XCIgbGlrZSBtZXRob2Qgd2hlcmUgdGhlIGxhc3QgcGFyYW1ldGVyIGlzIG1pc3NpbmcuXG4gKlxuICogQHBhcmFtIHNGaXhlZFBhcnRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gYSBzaG9yY3V0IGZ1bmN0aW9uIHdpdGggdGhlIGZpeGVkIElEIHBhcnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIElER2VuZXJhdG9yKC4uLnNGaXhlZFBhcnQ6IElEUGFydFtdKSB7XG5cdHJldHVybiBmdW5jdGlvbiguLi5zSURQYXJ0OiBJRFBhcnRbXSkge1xuXHRcdHJldHVybiBTdGFibGVJZEhlbHBlci5nZW5lcmF0ZShCQVNFX0lELmNvbmNhdCguLi5zRml4ZWRQYXJ0LCAuLi5zSURQYXJ0KSk7XG5cdH07XG59XG5cbi8qKlxuICogVGhvc2UgYXJlIGFsbCBoZWxwZXJzIHRvIGNlbnRyYWxpemUgSUQgZ2VuZXJhdGlvbiBpbiB0aGUgY29kZSBmb3IgZGlmZmVyZW50IGVsZW1lbnRzXG4gKi9cbmV4cG9ydCBjb25zdCBIZWFkZXJGYWNldElEID0gSURHZW5lcmF0b3IoXCJIZWFkZXJGYWNldFwiKTtcbmV4cG9ydCBjb25zdCBDdXN0b21IZWFkZXJGYWNldElEID0gSURHZW5lcmF0b3IoXCJIZWFkZXJGYWNldEN1c3RvbUNvbnRhaW5lclwiKTtcbmV4cG9ydCBjb25zdCBTZWN0aW9uSUQgPSBJREdlbmVyYXRvcihcIkZhY2V0U2VjdGlvblwiKTtcbmV4cG9ydCBjb25zdCBDdXN0b21TZWN0aW9uSUQgPSBJREdlbmVyYXRvcihcIkN1c3RvbVNlY3Rpb25cIik7XG5leHBvcnQgY29uc3QgU3ViU2VjdGlvbklEID0gSURHZW5lcmF0b3IoXCJGYWNldFN1YlNlY3Rpb25cIik7XG5leHBvcnQgY29uc3QgQ3VzdG9tU3ViU2VjdGlvbklEID0gSURHZW5lcmF0b3IoXCJDdXN0b21TdWJTZWN0aW9uXCIpO1xuZXhwb3J0IGNvbnN0IEZvcm1JRCA9IElER2VuZXJhdG9yKFwiRm9ybVwiKTtcbmV4cG9ydCBjb25zdCBUYWJsZUlEID0gSURHZW5lcmF0b3IoXCJ0YWJsZVwiKTtcbmV4cG9ydCBjb25zdCBGaWx0ZXJCYXJJRCA9IElER2VuZXJhdG9yKFwiRmlsdGVyQmFyXCIpO1xuZXhwb3J0IGNvbnN0IEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQgPSBmdW5jdGlvbihzRmlsdGVySUQ6IHN0cmluZykge1xuXHRyZXR1cm4gU3RhYmxlSWRIZWxwZXIuZ2VuZXJhdGUoW3NGaWx0ZXJJRCwgXCJWYXJpYW50TWFuYWdlbWVudFwiXSk7XG59O1xuZXhwb3J0IGNvbnN0IENoYXJ0SUQgPSBJREdlbmVyYXRvcihcIkNoYXJ0XCIpO1xuZXhwb3J0IGNvbnN0IEN1c3RvbUFjdGlvbklEID0gZnVuY3Rpb24oc0FjdGlvbklEOiBzdHJpbmcpIHtcblx0cmV0dXJuIFN0YWJsZUlkSGVscGVyLmdlbmVyYXRlKFtcIkN1c3RvbUFjdGlvblwiLCBzQWN0aW9uSURdKTtcbn07XG4iXX0=