sap.ui.define(["sap/ui/core/service/ServiceFactory", "sap/ui/core/service/Service"], function (ServiceFactory, Service) {
  "use strict";

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  var AsyncComponentService = /*#__PURE__*/function (_Service) {
    _inherits(AsyncComponentService, _Service);

    var _super = _createSuper(AsyncComponentService);

    function AsyncComponentService() {
      _classCallCheck(this, AsyncComponentService);

      return _super.apply(this, arguments);
    }

    _createClass(AsyncComponentService, [{
      key: "init",
      // !: means that we know it will be assigned before usage
      value: function init() {
        var _this = this;

        this.initPromise = new Promise(function (resolve, reject) {
          _this.resolveFn = resolve;
          _this.rejectFn = reject;
        });
        var oContext = this.getContext();
        var oComponent = oContext.scopeObject;

        var oServices = oComponent._getManifestEntry("/sap.ui5/services", true);

        Promise.all(Object.keys(oServices).filter(function (sServiceKey) {
          return oServices[sServiceKey].startup === "waitFor" && oServices[sServiceKey].factoryName !== "sap.fe.core.services.AsyncComponentService";
        }).map(function (sServiceKey) {
          return oComponent.getService(sServiceKey).then(function (oServiceInstance) {
            var sMethodName = "get".concat(sServiceKey[0].toUpperCase()).concat(sServiceKey.substr(1));

            if (!oComponent.hasOwnProperty(sMethodName)) {
              oComponent[sMethodName] = function () {
                return oServiceInstance;
              };
            }
          });
        })).then(function () {
          // notifiy the component
          if (oComponent.onServicesStarted) {
            oComponent.onServicesStarted();
          }

          _this.resolveFn(_this);
        }).catch(this.rejectFn);
      }
    }]);

    return AsyncComponentService;
  }(Service);

  var AsyncComponentServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inherits(AsyncComponentServiceFactory, _ServiceFactory);

    var _super2 = _createSuper(AsyncComponentServiceFactory);

    function AsyncComponentServiceFactory() {
      _classCallCheck(this, AsyncComponentServiceFactory);

      return _super2.apply(this, arguments);
    }

    _createClass(AsyncComponentServiceFactory, [{
      key: "createInstance",
      value: function createInstance(oServiceContext) {
        var asyncComponentService = new AsyncComponentService(oServiceContext);
        return asyncComponentService.initPromise;
      }
    }]);

    return AsyncComponentServiceFactory;
  }(ServiceFactory);

  return AsyncComponentServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkudHMiXSwibmFtZXMiOlsiQXN5bmNDb21wb25lbnRTZXJ2aWNlIiwiaW5pdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwib0NvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib1NlcnZpY2VzIiwiX2dldE1hbmlmZXN0RW50cnkiLCJhbGwiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwic1NlcnZpY2VLZXkiLCJzdGFydHVwIiwiZmFjdG9yeU5hbWUiLCJtYXAiLCJnZXRTZXJ2aWNlIiwidGhlbiIsIm9TZXJ2aWNlSW5zdGFuY2UiLCJzTWV0aG9kTmFtZSIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwiaGFzT3duUHJvcGVydHkiLCJvblNlcnZpY2VzU3RhcnRlZCIsImNhdGNoIiwiU2VydmljZSIsIkFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkiLCJvU2VydmljZUNvbnRleHQiLCJhc3luY0NvbXBvbmVudFNlcnZpY2UiLCJTZXJ2aWNlRmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFJTUEscUI7Ozs7Ozs7Ozs7Ozs7QUFJTDs2QkFFTztBQUFBOztBQUNOLGFBQUtDLFdBQUwsR0FBbUIsSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNuRCxVQUFBLEtBQUksQ0FBQ0MsU0FBTCxHQUFpQkYsT0FBakI7QUFDQSxVQUFBLEtBQUksQ0FBQ0csUUFBTCxHQUFnQkYsTUFBaEI7QUFDQSxTQUhrQixDQUFuQjtBQUlBLFlBQU1HLFFBQVEsR0FBRyxLQUFLQyxVQUFMLEVBQWpCO0FBQ0EsWUFBTUMsVUFBVSxHQUFHRixRQUFRLENBQUNHLFdBQTVCOztBQUNBLFlBQU1DLFNBQVMsR0FBR0YsVUFBVSxDQUFDRyxpQkFBWCxDQUE2QixtQkFBN0IsRUFBa0QsSUFBbEQsQ0FBbEI7O0FBQ0FWLFFBQUFBLE9BQU8sQ0FBQ1csR0FBUixDQUNDQyxNQUFNLENBQUNDLElBQVAsQ0FBWUosU0FBWixFQUNFSyxNQURGLENBRUUsVUFBQUMsV0FBVztBQUFBLGlCQUNWTixTQUFTLENBQUNNLFdBQUQsQ0FBVCxDQUF1QkMsT0FBdkIsS0FBbUMsU0FBbkMsSUFDQVAsU0FBUyxDQUFDTSxXQUFELENBQVQsQ0FBdUJFLFdBQXZCLEtBQXVDLDRDQUY3QjtBQUFBLFNBRmIsRUFNRUMsR0FORixDQU1NLFVBQUFILFdBQVcsRUFBSTtBQUNuQixpQkFBT1IsVUFBVSxDQUFDWSxVQUFYLENBQXNCSixXQUF0QixFQUFtQ0ssSUFBbkMsQ0FBd0MsVUFBQ0MsZ0JBQUQsRUFBb0M7QUFDbEYsZ0JBQU1DLFdBQVcsZ0JBQVNQLFdBQVcsQ0FBQyxDQUFELENBQVgsQ0FBZVEsV0FBZixFQUFULFNBQXdDUixXQUFXLENBQUNTLE1BQVosQ0FBbUIsQ0FBbkIsQ0FBeEMsQ0FBakI7O0FBQ0EsZ0JBQUksQ0FBQ2pCLFVBQVUsQ0FBQ2tCLGNBQVgsQ0FBMEJILFdBQTFCLENBQUwsRUFBNkM7QUFDNUNmLGNBQUFBLFVBQVUsQ0FBQ2UsV0FBRCxDQUFWLEdBQTBCLFlBQVc7QUFDcEMsdUJBQU9ELGdCQUFQO0FBQ0EsZUFGRDtBQUdBO0FBQ0QsV0FQTSxDQUFQO0FBUUEsU0FmRixDQURELEVBa0JFRCxJQWxCRixDQWtCTyxZQUFNO0FBQ1g7QUFDQSxjQUFJYixVQUFVLENBQUNtQixpQkFBZixFQUFrQztBQUNqQ25CLFlBQUFBLFVBQVUsQ0FBQ21CLGlCQUFYO0FBQ0E7O0FBQ0QsVUFBQSxLQUFJLENBQUN2QixTQUFMLENBQWUsS0FBZjtBQUNBLFNBeEJGLEVBeUJFd0IsS0F6QkYsQ0F5QlEsS0FBS3ZCLFFBekJiO0FBMEJBOzs7O0lBeENrQ3dCLE87O01BMkM5QkMsNEI7Ozs7Ozs7Ozs7Ozs7cUNBQ1VDLGUsRUFBeUQ7QUFDdkUsWUFBTUMscUJBQXFCLEdBQUcsSUFBSWpDLHFCQUFKLENBQTBCZ0MsZUFBMUIsQ0FBOUI7QUFDQSxlQUFPQyxxQkFBcUIsQ0FBQ2hDLFdBQTdCO0FBQ0E7Ozs7SUFKeUNpQyxjOztTQU81QkgsNEIiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFNlcnZpY2VGYWN0b3J5LCBTZXJ2aWNlLCBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlXCI7XG5cbnR5cGUgQXN5bmNDb21wb25lbnRTZXR0aW5ncyA9IHt9O1xuXG5jbGFzcyBBc3luY0NvbXBvbmVudFNlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlPEFzeW5jQ29tcG9uZW50U2V0dGluZ3M+IHtcblx0cmVzb2x2ZUZuOiBhbnk7XG5cdHJlamVjdEZuOiBhbnk7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHQvLyAhOiBtZWFucyB0aGF0IHdlIGtub3cgaXQgd2lsbCBiZSBhc3NpZ25lZCBiZWZvcmUgdXNhZ2VcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLnJlc29sdmVGbiA9IHJlc29sdmU7XG5cdFx0XHR0aGlzLnJlamVjdEZuID0gcmVqZWN0O1xuXHRcdH0pO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueTtcblx0XHRjb25zdCBvU2VydmljZXMgPSBvQ29tcG9uZW50Ll9nZXRNYW5pZmVzdEVudHJ5KFwiL3NhcC51aTUvc2VydmljZXNcIiwgdHJ1ZSk7XG5cdFx0UHJvbWlzZS5hbGwoXG5cdFx0XHRPYmplY3Qua2V5cyhvU2VydmljZXMpXG5cdFx0XHRcdC5maWx0ZXIoXG5cdFx0XHRcdFx0c1NlcnZpY2VLZXkgPT5cblx0XHRcdFx0XHRcdG9TZXJ2aWNlc1tzU2VydmljZUtleV0uc3RhcnR1cCA9PT0gXCJ3YWl0Rm9yXCIgJiZcblx0XHRcdFx0XHRcdG9TZXJ2aWNlc1tzU2VydmljZUtleV0uZmFjdG9yeU5hbWUgIT09IFwic2FwLmZlLmNvcmUuc2VydmljZXMuQXN5bmNDb21wb25lbnRTZXJ2aWNlXCJcblx0XHRcdFx0KVxuXHRcdFx0XHQubWFwKHNTZXJ2aWNlS2V5ID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5nZXRTZXJ2aWNlKHNTZXJ2aWNlS2V5KS50aGVuKChvU2VydmljZUluc3RhbmNlOiBTZXJ2aWNlPGFueT4pID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHNNZXRob2ROYW1lID0gYGdldCR7c1NlcnZpY2VLZXlbMF0udG9VcHBlckNhc2UoKX0ke3NTZXJ2aWNlS2V5LnN1YnN0cigxKX1gO1xuXHRcdFx0XHRcdFx0aWYgKCFvQ29tcG9uZW50Lmhhc093blByb3BlcnR5KHNNZXRob2ROYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRvQ29tcG9uZW50W3NNZXRob2ROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvU2VydmljZUluc3RhbmNlO1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdClcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0Ly8gbm90aWZpeSB0aGUgY29tcG9uZW50XG5cdFx0XHRcdGlmIChvQ29tcG9uZW50Lm9uU2VydmljZXNTdGFydGVkKSB7XG5cdFx0XHRcdFx0b0NvbXBvbmVudC5vblNlcnZpY2VzU3RhcnRlZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVzb2x2ZUZuKHRoaXMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCh0aGlzLnJlamVjdEZuKTtcblx0fVxufVxuXG5jbGFzcyBBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8QXN5bmNDb21wb25lbnRTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PEFzeW5jQ29tcG9uZW50U2V0dGluZ3M+KSB7XG5cdFx0Y29uc3QgYXN5bmNDb21wb25lbnRTZXJ2aWNlID0gbmV3IEFzeW5jQ29tcG9uZW50U2VydmljZShvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBhc3luY0NvbXBvbmVudFNlcnZpY2UuaW5pdFByb21pc2U7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXN5bmNDb21wb25lbnRTZXJ2aWNlRmFjdG9yeTtcbiJdfQ==