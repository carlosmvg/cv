sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  var openFECapabilities = {
    Chart: false,
    MicroChart: false,
    UShell: false,
    IntentBasedNavigation: false
  };
  var sapFECapabilities = {
    Chart: true,
    MicroChart: true,
    UShell: true,
    IntentBasedNavigation: true
  };
  var oEnvCapabilities = sap.ushell && sap.ushell.Container ? sapFECapabilities : openFECapabilities;

  function setCapabilities(oCapabilities) {
    oEnvCapabilities = oCapabilities;
  }

  _exports.setCapabilities = setCapabilities;

  function getCapabilities() {
    return oEnvCapabilities;
  }

  _exports.getCapabilities = getCapabilities;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVudmlyb25tZW50Q2FwYWJpbGl0aWVzLnRzIl0sIm5hbWVzIjpbIm9wZW5GRUNhcGFiaWxpdGllcyIsIkNoYXJ0IiwiTWljcm9DaGFydCIsIlVTaGVsbCIsIkludGVudEJhc2VkTmF2aWdhdGlvbiIsInNhcEZFQ2FwYWJpbGl0aWVzIiwib0VudkNhcGFiaWxpdGllcyIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsInNldENhcGFiaWxpdGllcyIsIm9DYXBhYmlsaXRpZXMiLCJnZXRDYXBhYmlsaXRpZXMiXSwibWFwcGluZ3MiOiI7Ozs7QUFPQSxNQUFNQSxrQkFBbUMsR0FBRztBQUMzQ0MsSUFBQUEsS0FBSyxFQUFFLEtBRG9DO0FBRTNDQyxJQUFBQSxVQUFVLEVBQUUsS0FGK0I7QUFHM0NDLElBQUFBLE1BQU0sRUFBRSxLQUhtQztBQUkzQ0MsSUFBQUEscUJBQXFCLEVBQUU7QUFKb0IsR0FBNUM7QUFPQSxNQUFNQyxpQkFBa0MsR0FBRztBQUMxQ0osSUFBQUEsS0FBSyxFQUFFLElBRG1DO0FBRTFDQyxJQUFBQSxVQUFVLEVBQUUsSUFGOEI7QUFHMUNDLElBQUFBLE1BQU0sRUFBRSxJQUhrQztBQUkxQ0MsSUFBQUEscUJBQXFCLEVBQUU7QUFKbUIsR0FBM0M7QUFPQSxNQUFJRSxnQkFBaUMsR0FBR0MsR0FBRyxDQUFDQyxNQUFKLElBQWNELEdBQUcsQ0FBQ0MsTUFBSixDQUFXQyxTQUF6QixHQUFxQ0osaUJBQXJDLEdBQXlETCxrQkFBakc7O0FBRU8sV0FBU1UsZUFBVCxDQUF5QkMsYUFBekIsRUFBeUQ7QUFDL0RMLElBQUFBLGdCQUFnQixHQUFHSyxhQUFuQjtBQUNBOzs7O0FBRU0sV0FBU0MsZUFBVCxHQUEyQjtBQUNqQyxXQUFPTixnQkFBUDtBQUNBIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgRW52Q2FwYWJpbGl0aWVzIHtcblx0Q2hhcnQ6IGJvb2xlYW47XG5cdE1pY3JvQ2hhcnQ6IGJvb2xlYW47XG5cdFVTaGVsbDogYm9vbGVhbjtcblx0SW50ZW50QmFzZWROYXZpZ2F0aW9uOiBib29sZWFuO1xufVxuXG5jb25zdCBvcGVuRkVDYXBhYmlsaXRpZXM6IEVudkNhcGFiaWxpdGllcyA9IHtcblx0Q2hhcnQ6IGZhbHNlLFxuXHRNaWNyb0NoYXJ0OiBmYWxzZSxcblx0VVNoZWxsOiBmYWxzZSxcblx0SW50ZW50QmFzZWROYXZpZ2F0aW9uOiBmYWxzZVxufTtcblxuY29uc3Qgc2FwRkVDYXBhYmlsaXRpZXM6IEVudkNhcGFiaWxpdGllcyA9IHtcblx0Q2hhcnQ6IHRydWUsXG5cdE1pY3JvQ2hhcnQ6IHRydWUsXG5cdFVTaGVsbDogdHJ1ZSxcblx0SW50ZW50QmFzZWROYXZpZ2F0aW9uOiB0cnVlXG59O1xuXG5sZXQgb0VudkNhcGFiaWxpdGllczogRW52Q2FwYWJpbGl0aWVzID0gc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lciA/IHNhcEZFQ2FwYWJpbGl0aWVzIDogb3BlbkZFQ2FwYWJpbGl0aWVzO1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0Q2FwYWJpbGl0aWVzKG9DYXBhYmlsaXRpZXM6IEVudkNhcGFiaWxpdGllcykge1xuXHRvRW52Q2FwYWJpbGl0aWVzID0gb0NhcGFiaWxpdGllcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhcGFiaWxpdGllcygpIHtcblx0cmV0dXJuIG9FbnZDYXBhYmlsaXRpZXM7XG59XG4iXX0=