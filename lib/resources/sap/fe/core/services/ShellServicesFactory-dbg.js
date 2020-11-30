sap.ui.define(["sap/ui/core/service/ServiceFactory", "sap/ui/core/service/Service"], function (ServiceFactory, Service) {
  "use strict";

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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

  /**
   * Mock implementation of the ShellService for OpenFE
   *
   * @implements {IShellServices}
   * @private
   */
  var ShellServiceMock = /*#__PURE__*/function (_Service) {
    _inherits(ShellServiceMock, _Service);

    var _super = _createSuper(ShellServiceMock);

    function ShellServiceMock() {
      _classCallCheck(this, ShellServiceMock);

      return _super.apply(this, arguments);
    }

    _createClass(ShellServiceMock, [{
      key: "init",
      value: function init() {
        this.initPromise = Promise.resolve(this);
      }
    }, {
      key: "getLinks",
      value: function getLinks(oArgs) {
        return Promise.resolve([]);
      }
    }, {
      key: "toExternal",
      value: function toExternal(oNavArgumentsArr, oComponent) {
        return;
      }
    }, {
      key: "getStartupAppState",
      value: function getStartupAppState(oArgs) {
        return Promise.resolve(null);
      }
    }, {
      key: "backToPreviousApp",
      value: function backToPreviousApp() {
        return;
      }
    }, {
      key: "hrefForExternal",
      value: function hrefForExternal(oArgs, oComponent, bAsync) {
        return "";
      }
    }, {
      key: "getAppState",
      value: function getAppState(oComponent, sAppStateKey) {
        return Promise.resolve({});
      }
    }, {
      key: "createEmptyAppState",
      value: function createEmptyAppState(oComponent) {
        return Promise.resolve({});
      }
    }, {
      key: "isNavigationSupported",
      value: function isNavigationSupported(oNavArgumentsArr, oComponent) {
        return Promise.resolve({});
      }
    }, {
      key: "isInitialNavigation",
      value: function isInitialNavigation() {
        return false;
      }
    }, {
      key: "expandCompactHash",
      value: function expandCompactHash(sHashFragment) {
        return Promise.resolve({});
      }
    }, {
      key: "parseShellHash",
      value: function parseShellHash(sHash) {
        return {};
      }
    }, {
      key: "splitHash",
      value: function splitHash(sHash) {
        return Promise.resolve({});
      }
    }, {
      key: "constructShellHash",
      value: function constructShellHash(oNewShellHash) {
        return "";
      }
    }, {
      key: "setDirtyFlag",
      value: function setDirtyFlag(bDirty) {
        return;
      }
    }, {
      key: "registerDirtyStateProvider",
      value: function registerDirtyStateProvider(fnDirtyStateProvider) {
        return;
      }
    }, {
      key: "deregisterDirtyStateProvider",
      value: function deregisterDirtyStateProvider(fnDirtyStateProvider) {
        return;
      }
    }, {
      key: "createRenderer",
      value: function createRenderer() {
        return {};
      }
    }, {
      key: "getUser",
      value: function getUser() {
        return {};
      }
    }, {
      key: "hasUShell",
      value: function hasUShell() {
        return false;
      }
    }, {
      key: "registerNavigationFilter",
      value: function registerNavigationFilter(fnNavFilter) {
        return;
      }
    }, {
      key: "unregisterNavigationFilter",
      value: function unregisterNavigationFilter(fnNavFilter) {
        return;
      }
    }, {
      key: "setBackNavigation",
      value: function setBackNavigation(fnCallBack) {
        return;
      }
    }, {
      key: "setHierarchy",
      value: function setHierarchy(aHierarchyLevels) {
        return;
      }
    }, {
      key: "setTitle",
      value: function setTitle(sTitle) {
        return;
      }
    }]);

    return ShellServiceMock;
  }(Service);
  /**
   * @typedef ShellServicesSettings
   * @private
   */


  /**
   * Wrap a JQuery Promise within a native {Promise}.
   *
   * @template {object} T
   * @param {JQueryPromise<T>} jqueryPromise the original jquery promise
   * @returns {Promise<T>} a native promise wrapping the same object
   * @private
   */
  function wrapJQueryPromise(jqueryPromise) {
    return new Promise(function (resolve, reject) {
      // eslint-disable-next-line promise/catch-or-return
      jqueryPromise.done(resolve).fail(reject);
    });
  }
  /**
   * Base implementation of the ShellServices
   *
   * @implements {IShellServices}
   * @private
   */


  var ShellServices = /*#__PURE__*/function (_Service2) {
    _inherits(ShellServices, _Service2);

    var _super2 = _createSuper(ShellServices);

    function ShellServices() {
      _classCallCheck(this, ShellServices);

      return _super2.apply(this, arguments);
    }

    _createClass(ShellServices, [{
      key: "init",
      // !: means that we know it will be assigned before usage
      value: function init() {
        var _this = this;

        var oContext = this.getContext();
        var oComponent = oContext.scopeObject;
        this.oShellContainer = oContext.settings.shellContainer;
        this.initPromise = new Promise(function (resolve, reject) {
          _this.resolveFn = resolve;
          _this.rejectFn = reject;
        });
        var oCrossAppNavServicePromise = this.oShellContainer.getServiceAsync("CrossApplicationNavigation");
        var oUrlParsingServicePromise = this.oShellContainer.getServiceAsync("URLParsing");
        var oShellNavigationServicePromise = this.oShellContainer.getServiceAsync("ShellNavigation");
        var oShellUIServicePromise = oComponent.getService("ShellUIService");
        Promise.all([oCrossAppNavServicePromise, oUrlParsingServicePromise, oShellNavigationServicePromise, oShellUIServicePromise]).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 4),
              oCrossAppNavService = _ref2[0],
              oUrlParsingService = _ref2[1],
              oShellNavigation = _ref2[2],
              oShellUIService = _ref2[3];

          _this.crossAppNavService = oCrossAppNavService;
          _this.urlParsingService = oUrlParsingService;
          _this.shellNavigation = oShellNavigation;
          _this.shellUIService = oShellUIService;

          _this.resolveFn();
        }).catch(this.rejectFn);
      }
      /**
       * Retrieves the target links configured for a given semantic object & action
       * Will retrieve the CrossApplicationNavigation
       * service reference call the getLinks method. In case service is not available or any exception
       * method throws exception error in console.
       *
       * @private
       * @ui5-restricted
       * @param {object} oArgs - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
       * @returns {Promise} Promise which will be resolved to target links array
       */

    }, {
      key: "getLinks",
      value: function getLinks(oArgs) {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          // eslint-disable-next-line promise/catch-or-return
          _this2.crossAppNavService.getLinks(oArgs).fail(function (oError) {
            reject(new Error(oError + " sap.fe.core.services.NavigationServiceFactory.getLinks"));
          }).then(resolve);
        });
      }
      /**
       * Will retrieve the ShellContainer.
       *
       * @private
       * @ui5-restricted
       * sap.ushell.container
       * @returns {object} Object with predefined shellContainer methods
       */

    }, {
      key: "getShellContainer",
      value: function getShellContainer() {
        return this.oShellContainer;
      }
      /**
       * Will call toExternal method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
       *
       * @private
       * @ui5-restricted
       * @param {Array} oNavArgumentsArr and
       * @param {object} oComponent - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>toExternal arguments
       * @returns {void}
       */

    }, {
      key: "toExternal",
      value: function toExternal(oNavArgumentsArr, oComponent) {
        this.crossAppNavService.toExternal(oNavArgumentsArr, oComponent);
      }
      /**
       * Retrieves the target startupAppState
       * Will check the existance of the ShellContainer and retrieve the CrossApplicationNavigation
       * service reference call the getStartupAppState method. In case service is not available or any exception
       * method throws exception error in console.
       *
       * @private
       * @ui5-restricted
       * @param {object} oArgs - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>getStartupAppState arguments
       * @returns {Promise} Promise which will be resolved to Object
       */

    }, {
      key: "getStartupAppState",
      value: function getStartupAppState(oArgs) {
        var _this3 = this;

        return new Promise(function (resolve, reject) {
          // JQuery Promise behaves differently
          // eslint-disable-next-line promise/catch-or-return
          _this3.crossAppNavService.getStartupAppState(oArgs).fail(function (oError) {
            reject(new Error(oError + " sap.fe.core.services.NavigationServiceFactory.getStartupAppState"));
          }).then(resolve);
        });
      }
      /**
       * Will call backToPreviousApp method of CrossApplicationNavigation service.
       *
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "backToPreviousApp",
      value: function backToPreviousApp() {
        return this.crossAppNavService.backToPreviousApp();
      }
      /**
       * Will call hrefForExternal method of CrossApplicationNavigation service.
       *
       * @private
       * @ui5-restricted
       * @param {object} oArgs - check the definition of
       * @param {object} oComponent the appComponent
       * @param {boolean} bAsync whether this call should be async or not
       * sap.ushell.services.CrossApplicationNavigation=>hrefForExternal arguments
       * @returns {string} Promise which will be resolved to string
       */

    }, {
      key: "hrefForExternal",
      value: function hrefForExternal(oArgs, oComponent, bAsync) {
        return this.crossAppNavService.hrefForExternal(oArgs, oComponent, bAsync);
      }
      /**
       * Will call getAppState method of CrossApplicationNavigation service with oComponent and oAppStateKey.
       *
       * @private
       * @ui5-restricted
       * @param {object} oComponent and
       * @param {string} sAppStateKey - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>getAppState arguments
       * @returns {Promise} Promise which will be resolved to object
       */

    }, {
      key: "getAppState",
      value: function getAppState(oComponent, sAppStateKey) {
        return wrapJQueryPromise(this.crossAppNavService.getAppState(oComponent, sAppStateKey));
      }
      /**
       * Will call createEmptyAppState method of CrossApplicationNavigation service with oComponent.
       *
       * @private
       * @ui5-restricted
       * @param {object} oComponent - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppState arguments
       * @returns {Promise} Promise which will be resolved to object
       */

    }, {
      key: "createEmptyAppState",
      value: function createEmptyAppState(oComponent) {
        return this.crossAppNavService.createEmptyAppState(oComponent);
      }
      /**
       * Will call isNavigationSupported method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
       *
       * @private
       * @ui5-restricted
       * @param {Array} oNavArgumentsArr and
       * @param {object} oComponent - check the definition of
       * sap.ushell.services.CrossApplicationNavigation=>isNavigationSupported arguments
       * @returns {Promise} Promise which will be resolved to object
       */

    }, {
      key: "isNavigationSupported",
      value: function isNavigationSupported(oNavArgumentsArr, oComponent) {
        return wrapJQueryPromise(this.crossAppNavService.isNavigationSupported(oNavArgumentsArr, oComponent));
      }
      /**
       * Will call isInitialNavigation method of CrossApplicationNavigation service.
       *
       * @private
       * @ui5-restricted
       * @returns {Promise} Promise which will be resolved to boolean
       */

    }, {
      key: "isInitialNavigation",
      value: function isInitialNavigation() {
        return this.crossAppNavService.isInitialNavigation();
      }
      /**
       * Will call expandCompactHash method of CrossApplicationNavigation service.
       *
       * @param {string} sHashFragment an (internal format) shell hash
       * @returns {Promise} promise the success handler of the resolve promise get an expanded shell hash as first argument
       * @private
       * @ui5-restricted
       */

    }, {
      key: "expandCompactHash",
      value: function expandCompactHash(sHashFragment) {
        return this.crossAppNavService.expandCompactHash(sHashFragment);
      }
      /**
       * Will call parseShellHash method of URLParsing service with given sHash.
       *
       * @private
       * @ui5-restricted
       * @param {string} sHash - check the definition of
       * sap.ushell.services.URLParsing=>parseShellHash arguments
       * @returns {object} which will return object
       */

    }, {
      key: "parseShellHash",
      value: function parseShellHash(sHash) {
        return this.urlParsingService.parseShellHash(sHash);
      }
      /**
       * Will call splitHash method of URLParsing service with given sHash.
       *
       * @private
       * @ui5-restricted
       * @param {string} sHash - check the definition of
       * sap.ushell.services.URLParsing=>splitHash arguments
       * @returns {Promise} Promise which will be resolved to object
       */

    }, {
      key: "splitHash",
      value: function splitHash(sHash) {
        return this.urlParsingService.splitHash(sHash);
      }
      /**
       * Will call constructShellHash method of URLParsing service with given sHash.
       *
       * @private
       * @ui5-restricted
       * @param {object} oNewShellHash - check the definition of
       * sap.ushell.services.URLParsing=>constructShellHash arguments
       * @returns {string} Shell Hash string
       */

    }, {
      key: "constructShellHash",
      value: function constructShellHash(oNewShellHash) {
        return this.urlParsingService.constructShellHash(oNewShellHash);
      }
      /**
       * Will call setDirtyFlag method with given dirty state.
       *
       * @private
       * @ui5-restricted
       * @param {boolean} bDirty - check the definition of sap.ushell.Container.setDirtyFlag arguments
       */

    }, {
      key: "setDirtyFlag",
      value: function setDirtyFlag(bDirty) {
        this.oShellContainer.setDirtyFlag(bDirty);
      }
      /**
       * Will call registerDirtyStateProvider method with given dirty state provider callback method.
       *
       * @private
       * @ui5-restricted
       * @param {Function} fnDirtyStateProvider - check the definition of sap.ushell.Container.registerDirtyStateProvider arguments
       */

    }, {
      key: "registerDirtyStateProvider",
      value: function registerDirtyStateProvider(fnDirtyStateProvider) {
        this.oShellContainer.registerDirtyStateProvider(fnDirtyStateProvider);
      }
      /**
       * Will call deregisterDirtyStateProvider method with given dirty state provider callback method.
       *
       * @private
       * @ui5-restricted
       * @param {Function} fnDirtyStateProvider - check the definition of sap.ushell.Container.deregisterDirtyStateProvider arguments
       */

    }, {
      key: "deregisterDirtyStateProvider",
      value: function deregisterDirtyStateProvider(fnDirtyStateProvider) {
        this.oShellContainer.deregisterDirtyStateProvider(fnDirtyStateProvider);
      }
      /**
       * Will call createRenderer method of ushell container.
       *
       * @private
       * @ui5-restricted
       * @returns {object} returns renderer object
       */

    }, {
      key: "createRenderer",
      value: function createRenderer() {
        return this.oShellContainer.createRenderer();
      }
      /**
       * Will call getUser method of ushell container.
       *
       * @private
       * @ui5-restricted
       * @returns {object} returns User object
       */

    }, {
      key: "getUser",
      value: function getUser() {
        return this.oShellContainer.getUser();
      }
      /**
       * Will check if ushell container is available or not.
       *
       * @private
       * @ui5-restricted
       * @returns {boolean} returns true
       */

    }, {
      key: "hasUShell",
      value: function hasUShell() {
        return true;
      }
      /**
       * Will call registerNavigationFilter method of shellNavigation.
       *
       * @param {Function} fnNavFilter the filter function to register
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "registerNavigationFilter",
      value: function registerNavigationFilter(fnNavFilter) {
        this.shellNavigation.registerNavigationFilter(fnNavFilter);
      }
      /**
       * Will call unregisterNavigationFilter method of shellNavigation.
       *
       * @param {Function} fnNavFilter the filter function to unregister
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "unregisterNavigationFilter",
      value: function unregisterNavigationFilter(fnNavFilter) {
        this.shellNavigation.unregisterNavigationFilter(fnNavFilter);
      }
      /**
       * Will call setBackNavigation method of ShellUIService
       * that displays the back button in the shell header.
       *
       * @param {Function} [fnCallBack]
       * A callback function called when the button is clicked in the UI.
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "setBackNavigation",
      value: function setBackNavigation(fnCallBack) {
        this.shellUIService.setBackNavigation(fnCallBack);
      }
      /**
       * Will call setHierarchy method of ShellUIService
       * that displays the given hierarchy in the shell header.
       *
       * @param {object[]} [aHierarchyLevels]
       * An array representing hierarchies of the currently displayed app.
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "setHierarchy",
      value: function setHierarchy(aHierarchyLevels) {
        this.shellUIService.setHierarchy(aHierarchyLevels);
      }
      /**
       * Will call setTitle method of ShellUIService
       * that displays the given title in the shell header.
       *
       * @param {string} [sTitle]
       * The new title. The default title is set if this argument is not given.
       * @returns {void}
       * @private
       * @ui5-restricted
       */

    }, {
      key: "setTitle",
      value: function setTitle(sTitle) {
        this.shellUIService.setTitle(sTitle);
      }
    }]);

    return ShellServices;
  }(Service);
  /**
   * Service Factory for the ShellServices
   *
   * @private
   */


  var ShellServicesFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inherits(ShellServicesFactory, _ServiceFactory);

    var _super3 = _createSuper(ShellServicesFactory);

    function ShellServicesFactory() {
      _classCallCheck(this, ShellServicesFactory);

      return _super3.apply(this, arguments);
    }

    _createClass(ShellServicesFactory, [{
      key: "createInstance",

      /**
       * Creates either a standard or a mock Shell service depending on the configuration.
       *
       * @param {ServiceContext<ShellServicesSettings>} oServiceContext the shellservice context
       * @returns {Promise<IShellServices>} a promise for a shell service implementation
       * @see ServiceFactory#createInstance
       */
      value: function createInstance(oServiceContext) {
        oServiceContext.settings.shellContainer = sap.ushell && sap.ushell.Container;
        var oShellService = oServiceContext.settings.shellContainer ? new ShellServices(oServiceContext) : new ShellServiceMock(oServiceContext);
        return oShellService.initPromise.then(function () {
          // Enrich the appComponent with this method
          oServiceContext.scopeObject.getShellServices = function () {
            return oShellService;
          };

          return oShellService;
        });
      }
    }]);

    return ShellServicesFactory;
  }(ServiceFactory);

  return ShellServicesFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNoZWxsU2VydmljZXNGYWN0b3J5LnRzIl0sIm5hbWVzIjpbIlNoZWxsU2VydmljZU1vY2siLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwib0FyZ3MiLCJvTmF2QXJndW1lbnRzQXJyIiwib0NvbXBvbmVudCIsImJBc3luYyIsInNBcHBTdGF0ZUtleSIsInNIYXNoRnJhZ21lbnQiLCJzSGFzaCIsIm9OZXdTaGVsbEhhc2giLCJiRGlydHkiLCJmbkRpcnR5U3RhdGVQcm92aWRlciIsImZuTmF2RmlsdGVyIiwiZm5DYWxsQmFjayIsImFIaWVyYXJjaHlMZXZlbHMiLCJzVGl0bGUiLCJTZXJ2aWNlIiwid3JhcEpRdWVyeVByb21pc2UiLCJqcXVlcnlQcm9taXNlIiwicmVqZWN0IiwiZG9uZSIsImZhaWwiLCJTaGVsbFNlcnZpY2VzIiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwic2NvcGVPYmplY3QiLCJvU2hlbGxDb250YWluZXIiLCJzZXR0aW5ncyIsInNoZWxsQ29udGFpbmVyIiwicmVzb2x2ZUZuIiwicmVqZWN0Rm4iLCJvQ3Jvc3NBcHBOYXZTZXJ2aWNlUHJvbWlzZSIsImdldFNlcnZpY2VBc3luYyIsIm9VcmxQYXJzaW5nU2VydmljZVByb21pc2UiLCJvU2hlbGxOYXZpZ2F0aW9uU2VydmljZVByb21pc2UiLCJvU2hlbGxVSVNlcnZpY2VQcm9taXNlIiwiZ2V0U2VydmljZSIsImFsbCIsInRoZW4iLCJvQ3Jvc3NBcHBOYXZTZXJ2aWNlIiwib1VybFBhcnNpbmdTZXJ2aWNlIiwib1NoZWxsTmF2aWdhdGlvbiIsIm9TaGVsbFVJU2VydmljZSIsImNyb3NzQXBwTmF2U2VydmljZSIsInVybFBhcnNpbmdTZXJ2aWNlIiwic2hlbGxOYXZpZ2F0aW9uIiwic2hlbGxVSVNlcnZpY2UiLCJjYXRjaCIsImdldExpbmtzIiwib0Vycm9yIiwiRXJyb3IiLCJ0b0V4dGVybmFsIiwiZ2V0U3RhcnR1cEFwcFN0YXRlIiwiYmFja1RvUHJldmlvdXNBcHAiLCJocmVmRm9yRXh0ZXJuYWwiLCJnZXRBcHBTdGF0ZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJpc05hdmlnYXRpb25TdXBwb3J0ZWQiLCJpc0luaXRpYWxOYXZpZ2F0aW9uIiwiZXhwYW5kQ29tcGFjdEhhc2giLCJwYXJzZVNoZWxsSGFzaCIsInNwbGl0SGFzaCIsImNvbnN0cnVjdFNoZWxsSGFzaCIsInNldERpcnR5RmxhZyIsInJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImNyZWF0ZVJlbmRlcmVyIiwiZ2V0VXNlciIsInJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsInVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIiwic2V0QmFja05hdmlnYXRpb24iLCJzZXRIaWVyYXJjaHkiLCJzZXRUaXRsZSIsIlNoZWxsU2VydmljZXNGYWN0b3J5Iiwib1NlcnZpY2VDb250ZXh0Iiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NoZWxsU2VydmljZSIsImdldFNoZWxsU2VydmljZXMiLCJTZXJ2aWNlRmFjdG9yeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4REE7Ozs7OztNQU1NQSxnQjs7Ozs7Ozs7Ozs7Ozs2QkFHRTtBQUNOLGFBQUtDLFdBQUwsR0FBbUJDLE9BQU8sQ0FBQ0MsT0FBUixDQUFnQixJQUFoQixDQUFuQjtBQUNBOzs7K0JBRVFDLEssRUFBZTtBQUN2QixlQUFPRixPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBUDtBQUNBOzs7aUNBRVVFLGdCLEVBQWlDQyxVLEVBQW9CO0FBQy9EO0FBQ0E7Ozt5Q0FFa0JGLEssRUFBZTtBQUNqQyxlQUFPRixPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBUDtBQUNBOzs7MENBRW1CO0FBQ25CO0FBQ0E7OztzQ0FFZUMsSyxFQUFnQkUsVSxFQUFxQkMsTSxFQUFrQjtBQUN0RSxlQUFPLEVBQVA7QUFDQTs7O2tDQUVXRCxV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QUFDQTtBQUVEOzs7Ozs7Ozs7Ozs7O21DQVVhQyxnQixFQUF1QztBQUNuRCxhQUFLZ0MsY0FBTCxDQUFvQnlCLFlBQXBCLENBQWlDekQsZ0JBQWpDO0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7OzsrQkFVU0MsTSxFQUFzQjtBQUM5QixhQUFLK0IsY0FBTCxDQUFvQjBCLFFBQXBCLENBQTZCekQsTUFBN0I7QUFDQTs7OztJQWhYMEJDLE87QUFtWDVCOzs7Ozs7O01BS015RCxvQjs7Ozs7Ozs7Ozs7Ozs7QUFDTDs7Ozs7OztxQ0FPZUMsZSxFQUFpRjtBQUMvRkEsUUFBQUEsZUFBZSxDQUFDL0MsUUFBaEIsQ0FBeUJDLGNBQXpCLEdBQTBDK0MsR0FBRyxDQUFDQyxNQUFKLElBQWNELEdBQUcsQ0FBQ0MsTUFBSixDQUFXQyxTQUFuRTtBQUNBLFlBQU1DLGFBQWEsR0FBR0osZUFBZSxDQUFDL0MsUUFBaEIsQ0FBeUJDLGNBQXpCLEdBQ25CLElBQUlOLGFBQUosQ0FBa0JvRCxlQUFsQixDQURtQixHQUVuQixJQUFJNUUsZ0JBQUosQ0FBcUI0RSxlQUFyQixDQUZIO0FBR0EsZUFBT0ksYUFBYSxDQUFDL0UsV0FBZCxDQUEwQnVDLElBQTFCLENBQStCLFlBQU07QUFDM0M7QUFDQ29DLFVBQUFBLGVBQWUsQ0FBQ2pELFdBQWpCLENBQXFDc0QsZ0JBQXJDLEdBQXdEO0FBQUEsbUJBQU1ELGFBQU47QUFBQSxXQUF4RDs7QUFDQSxpQkFBT0EsYUFBUDtBQUNBLFNBSk0sQ0FBUDtBQUtBOzs7O0lBbEJpQ0UsYzs7U0FxQnBCUCxvQiIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG5cbmltcG9ydCB7IFNlcnZpY2VGYWN0b3J5LCBTZXJ2aWNlLCBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlXCI7XG5pbXBvcnQgeyBDb250YWluZXIsIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uLCBTaGVsbE5hdmlnYXRpb24sIFVSTFBhcnNpbmcgfSBmcm9tIFwic2FwL3VzaGVsbC9zZXJ2aWNlc1wiO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcInNhcC91aS9jb3JlXCI7XG5pbXBvcnQgeyBKUXVlcnlQcm9taXNlIH0gZnJvbSBcImpRdWVyeVwiO1xuXG4vKipcbiAqIEBpbnRlcmZhY2UgSVNoZWxsU2VydmljZXNcbiAqIEBwcml2YXRlXG4gKi9cbmludGVyZmFjZSBJU2hlbGxTZXJ2aWNlcyB7XG5cdGluaXRQcm9taXNlOiBQcm9taXNlPElTaGVsbFNlcnZpY2VzPjtcblx0Z2V0TGlua3Mob0FyZ3M6IG9iamVjdCk6IFByb21pc2U8YW55PjtcblxuXHR0b0V4dGVybmFsKG9OYXZBcmd1bWVudHNBcnI6IEFycmF5PG9iamVjdD4sIG9Db21wb25lbnQ6IG9iamVjdCk6IHZvaWQ7XG5cblx0Z2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzOiBvYmplY3QpOiBQcm9taXNlPGFueT47XG5cblx0YmFja1RvUHJldmlvdXNBcHAoKTogdm9pZDtcblxuXHRocmVmRm9yRXh0ZXJuYWwob0FyZ3M/OiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4pOiBzdHJpbmc7XG5cblx0Z2V0QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50LCBzQXBwU3RhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8YW55PjtcblxuXHRjcmVhdGVFbXB0eUFwcFN0YXRlKG9Db21wb25lbnQ6IENvbXBvbmVudCk6IG9iamVjdDtcblxuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogUHJvbWlzZTxhbnk+O1xuXG5cdGlzSW5pdGlhbE5hdmlnYXRpb24oKTogYm9vbGVhbjtcblxuXHRleHBhbmRDb21wYWN0SGFzaChzSGFzaEZyYWdtZW50OiBzdHJpbmcpOiBvYmplY3Q7XG5cblx0cGFyc2VTaGVsbEhhc2goc0hhc2g6IHN0cmluZyk6IG9iamVjdDtcblxuXHRzcGxpdEhhc2goc0hhc2g6IHN0cmluZyk6IG9iamVjdDtcblxuXHRjb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaDogb2JqZWN0KTogc3RyaW5nO1xuXG5cdHNldERpcnR5RmxhZyhiRGlydHk6IGJvb2xlYW4pOiB2b2lkO1xuXG5cdHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0ZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcihmbkRpcnR5U3RhdGVQcm92aWRlcjogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdGNyZWF0ZVJlbmRlcmVyKCk6IG9iamVjdDtcblxuXHRnZXRVc2VyKCk6IG9iamVjdDtcblxuXHRoYXNVU2hlbGwoKTogYm9vbGVhbjtcblxuXHRyZWdpc3Rlck5hdmlnYXRpb25GaWx0ZXIoZm5OYXZGaWx0ZXI6IEZ1bmN0aW9uKTogdm9pZDtcblxuXHR1bnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcjogRnVuY3Rpb24pOiB2b2lkO1xuXG5cdHNldEJhY2tOYXZpZ2F0aW9uKGZuQ2FsbEJhY2s/OiBGdW5jdGlvbik6IHZvaWQ7XG5cblx0c2V0SGllcmFyY2h5KGFIaWVyYXJjaHlMZXZlbHM6IEFycmF5PG9iamVjdD4pOiB2b2lkO1xuXG5cdHNldFRpdGxlKHNUaXRsZTogc3RyaW5nKTogdm9pZDtcbn1cblxuLyoqXG4gKiBNb2NrIGltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGVsbFNlcnZpY2UgZm9yIE9wZW5GRVxuICpcbiAqIEBpbXBsZW1lbnRzIHtJU2hlbGxTZXJ2aWNlc31cbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFNoZWxsU2VydmljZU1vY2sgZXh0ZW5kcyBTZXJ2aWNlPFNoZWxsU2VydmljZXNTZXR0aW5ncz4gaW1wbGVtZW50cyBJU2hlbGxTZXJ2aWNlcyB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0fVxuXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Z2V0U3RhcnR1cEFwcFN0YXRlKG9BcmdzOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG5cblx0YmFja1RvUHJldmlvdXNBcHAoKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aHJlZkZvckV4dGVybmFsKG9BcmdzPzogb2JqZWN0LCBvQ29tcG9uZW50Pzogb2JqZWN0LCBiQXN5bmM/OiBib29sZWFuKSB7XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHRnZXRBcHBTdGF0ZShvQ29tcG9uZW50OiBvYmplY3QsIHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh7fSk7XG5cdH1cblxuXHRjcmVhdGVFbXB0eUFwcFN0YXRlKG9Db21wb25lbnQ6IG9iamVjdCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0aXNOYXZpZ2F0aW9uU3VwcG9ydGVkKG9OYXZBcmd1bWVudHNBcnI6IEFycmF5PG9iamVjdD4sIG9Db21wb25lbnQ6IG9iamVjdCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0aXNJbml0aWFsTmF2aWdhdGlvbigpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRleHBhbmRDb21wYWN0SGFzaChzSGFzaEZyYWdtZW50OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcblx0fVxuXG5cdHBhcnNlU2hlbGxIYXNoKHNIYXNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRzcGxpdEhhc2goc0hhc2g6IHN0cmluZykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe30pO1xuXHR9XG5cblx0Y29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2g6IG9iamVjdCkge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0c2V0RGlydHlGbGFnKGJEaXJ0eTogYm9vbGVhbikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXI6IEZ1bmN0aW9uKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y3JlYXRlUmVuZGVyZXIoKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0Z2V0VXNlcigpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHRoYXNVU2hlbGwoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0cmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHNldEJhY2tOYXZpZ2F0aW9uKGZuQ2FsbEJhY2s/OiBGdW5jdGlvbik6IHZvaWQge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHNldEhpZXJhcmNoeShhSGllcmFyY2h5TGV2ZWxzOiBBcnJheTxvYmplY3Q+KTogdm9pZCB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c2V0VGl0bGUoc1RpdGxlOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRyZXR1cm47XG5cdH1cbn1cblxuLyoqXG4gKiBAdHlwZWRlZiBTaGVsbFNlcnZpY2VzU2V0dGluZ3NcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCB0eXBlIFNoZWxsU2VydmljZXNTZXR0aW5ncyA9IHtcblx0c2hlbGxDb250YWluZXI/OiBDb250YWluZXI7XG59O1xuXG4vKipcbiAqIFdyYXAgYSBKUXVlcnkgUHJvbWlzZSB3aXRoaW4gYSBuYXRpdmUge1Byb21pc2V9LlxuICpcbiAqIEB0ZW1wbGF0ZSB7b2JqZWN0fSBUXG4gKiBAcGFyYW0ge0pRdWVyeVByb21pc2U8VD59IGpxdWVyeVByb21pc2UgdGhlIG9yaWdpbmFsIGpxdWVyeSBwcm9taXNlXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxUPn0gYSBuYXRpdmUgcHJvbWlzZSB3cmFwcGluZyB0aGUgc2FtZSBvYmplY3RcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHdyYXBKUXVlcnlQcm9taXNlPFQ+KGpxdWVyeVByb21pc2U6IEpRdWVyeVByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9jYXRjaC1vci1yZXR1cm5cblx0XHRqcXVlcnlQcm9taXNlLmRvbmUocmVzb2x2ZSkuZmFpbChyZWplY3QpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBCYXNlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBTaGVsbFNlcnZpY2VzXG4gKlxuICogQGltcGxlbWVudHMge0lTaGVsbFNlcnZpY2VzfVxuICogQHByaXZhdGVcbiAqL1xuY2xhc3MgU2hlbGxTZXJ2aWNlcyBleHRlbmRzIFNlcnZpY2U8UmVxdWlyZWQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPj4gaW1wbGVtZW50cyBJU2hlbGxTZXJ2aWNlcyB7XG5cdHJlc29sdmVGbjogYW55O1xuXHRyZWplY3RGbjogYW55O1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cdGNyb3NzQXBwTmF2U2VydmljZSE6IENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uO1xuXHR1cmxQYXJzaW5nU2VydmljZSE6IFVSTFBhcnNpbmc7XG5cdHNoZWxsTmF2aWdhdGlvbiE6IFNoZWxsTmF2aWdhdGlvbjtcblx0b1NoZWxsQ29udGFpbmVyITogQ29udGFpbmVyO1xuXHRzaGVsbFVJU2VydmljZSE6IGFueTtcblxuXHRpbml0KCkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueTtcblx0XHR0aGlzLm9TaGVsbENvbnRhaW5lciA9IG9Db250ZXh0LnNldHRpbmdzLnNoZWxsQ29udGFpbmVyO1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLnJlc29sdmVGbiA9IHJlc29sdmU7XG5cdFx0XHR0aGlzLnJlamVjdEZuID0gcmVqZWN0O1xuXHRcdH0pO1xuXHRcdGNvbnN0IG9Dcm9zc0FwcE5hdlNlcnZpY2VQcm9taXNlID0gdGhpcy5vU2hlbGxDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKFwiQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cIik7XG5cdFx0Y29uc3Qgb1VybFBhcnNpbmdTZXJ2aWNlUHJvbWlzZSA9IHRoaXMub1NoZWxsQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYyhcIlVSTFBhcnNpbmdcIik7XG5cdFx0Y29uc3Qgb1NoZWxsTmF2aWdhdGlvblNlcnZpY2VQcm9taXNlID0gdGhpcy5vU2hlbGxDb250YWluZXIuZ2V0U2VydmljZUFzeW5jKFwiU2hlbGxOYXZpZ2F0aW9uXCIpO1xuXHRcdGNvbnN0IG9TaGVsbFVJU2VydmljZVByb21pc2UgPSBvQ29tcG9uZW50LmdldFNlcnZpY2UoXCJTaGVsbFVJU2VydmljZVwiKTtcblx0XHRQcm9taXNlLmFsbChbb0Nyb3NzQXBwTmF2U2VydmljZVByb21pc2UsIG9VcmxQYXJzaW5nU2VydmljZVByb21pc2UsIG9TaGVsbE5hdmlnYXRpb25TZXJ2aWNlUHJvbWlzZSwgb1NoZWxsVUlTZXJ2aWNlUHJvbWlzZV0pXG5cdFx0XHQudGhlbigoW29Dcm9zc0FwcE5hdlNlcnZpY2UsIG9VcmxQYXJzaW5nU2VydmljZSwgb1NoZWxsTmF2aWdhdGlvbiwgb1NoZWxsVUlTZXJ2aWNlXSkgPT4ge1xuXHRcdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2U7XG5cdFx0XHRcdHRoaXMudXJsUGFyc2luZ1NlcnZpY2UgPSBvVXJsUGFyc2luZ1NlcnZpY2U7XG5cdFx0XHRcdHRoaXMuc2hlbGxOYXZpZ2F0aW9uID0gb1NoZWxsTmF2aWdhdGlvbjtcblx0XHRcdFx0dGhpcy5zaGVsbFVJU2VydmljZSA9IG9TaGVsbFVJU2VydmljZTtcblx0XHRcdFx0dGhpcy5yZXNvbHZlRm4oKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2godGhpcy5yZWplY3RGbik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSB0YXJnZXQgbGlua3MgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBzZW1hbnRpYyBvYmplY3QgJiBhY3Rpb25cblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cblx0ICogc2VydmljZSByZWZlcmVuY2UgY2FsbCB0aGUgZ2V0TGlua3MgbWV0aG9kLiBJbiBjYXNlIHNlcnZpY2UgaXMgbm90IGF2YWlsYWJsZSBvciBhbnkgZXhjZXB0aW9uXG5cdCAqIG1ldGhvZCB0aHJvd3MgZXhjZXB0aW9uIGVycm9yIGluIGNvbnNvbGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0FyZ3MgLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5nZXRMaW5rcyBhcmd1bWVudHNcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byB0YXJnZXQgbGlua3MgYXJyYXlcblx0ICovXG5cdGdldExpbmtzKG9BcmdzOiBvYmplY3QpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2UvY2F0Y2gtb3ItcmV0dXJuXG5cdFx0XHR0aGlzLmNyb3NzQXBwTmF2U2VydmljZVxuXHRcdFx0XHQuZ2V0TGlua3Mob0FyZ3MpXG5cdFx0XHRcdC5mYWlsKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3Iob0Vycm9yICsgXCIgc2FwLmZlLmNvcmUuc2VydmljZXMuTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5LmdldExpbmtzXCIpKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocmVzb2x2ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCByZXRyaWV2ZSB0aGUgU2hlbGxDb250YWluZXIuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBzYXAudXNoZWxsLmNvbnRhaW5lclxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBPYmplY3Qgd2l0aCBwcmVkZWZpbmVkIHNoZWxsQ29udGFpbmVyIG1ldGhvZHNcblx0ICovXG5cdGdldFNoZWxsQ29udGFpbmVyKCkge1xuXHRcdHJldHVybiB0aGlzLm9TaGVsbENvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgdG9FeHRlcm5hbCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIE5hdmlnYXRpb24gQXJndW1lbnRzIGFuZCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHtBcnJheX0gb05hdkFyZ3VtZW50c0FyciBhbmRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9Db21wb25lbnQgLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT50b0V4dGVybmFsIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdHRvRXh0ZXJuYWwob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KTogdm9pZCB7XG5cdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhcmdldCBzdGFydHVwQXBwU3RhdGVcblx0ICogV2lsbCBjaGVjayB0aGUgZXhpc3RhbmNlIG9mIHRoZSBTaGVsbENvbnRhaW5lciBhbmQgcmV0cmlldmUgdGhlIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uXG5cdCAqIHNlcnZpY2UgcmVmZXJlbmNlIGNhbGwgdGhlIGdldFN0YXJ0dXBBcHBTdGF0ZSBtZXRob2QuIEluIGNhc2Ugc2VydmljZSBpcyBub3QgYXZhaWxhYmxlIG9yIGFueSBleGNlcHRpb25cblx0ICogbWV0aG9kIHRocm93cyBleGNlcHRpb24gZXJyb3IgaW4gY29uc29sZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQXJncyAtIGNoZWNrIHRoZSBkZWZpbml0aW9uIG9mXG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmdldFN0YXJ0dXBBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBPYmplY3Rcblx0ICovXG5cdGdldFN0YXJ0dXBBcHBTdGF0ZShvQXJnczogQ29tcG9uZW50KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdC8vIEpRdWVyeSBQcm9taXNlIGJlaGF2ZXMgZGlmZmVyZW50bHlcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcm9taXNlL2NhdGNoLW9yLXJldHVyblxuXHRcdFx0dGhpcy5jcm9zc0FwcE5hdlNlcnZpY2Vcblx0XHRcdFx0LmdldFN0YXJ0dXBBcHBTdGF0ZShvQXJncylcblx0XHRcdFx0LmZhaWwoKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmVqZWN0KG5ldyBFcnJvcihvRXJyb3IgKyBcIiBzYXAuZmUuY29yZS5zZXJ2aWNlcy5OYXZpZ2F0aW9uU2VydmljZUZhY3RvcnkuZ2V0U3RhcnR1cEFwcFN0YXRlXCIpKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocmVzb2x2ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGJhY2tUb1ByZXZpb3VzQXBwIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRiYWNrVG9QcmV2aW91c0FwcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuYmFja1RvUHJldmlvdXNBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgaHJlZkZvckV4dGVybmFsIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9BcmdzIC0gY2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogQHBhcmFtIHtvYmplY3R9IG9Db21wb25lbnQgdGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGJBc3luYyB3aGV0aGVyIHRoaXMgY2FsbCBzaG91bGQgYmUgYXN5bmMgb3Igbm90XG5cdCAqIHNhcC51c2hlbGwuc2VydmljZXMuQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb249PmhyZWZGb3JFeHRlcm5hbCBhcmd1bWVudHNcblx0ICogQHJldHVybnMge3N0cmluZ30gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIHN0cmluZ1xuXHQgKi9cblx0aHJlZkZvckV4dGVybmFsKG9BcmdzOiBvYmplY3QsIG9Db21wb25lbnQ/OiBvYmplY3QsIGJBc3luYz86IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdGhpcy5jcm9zc0FwcE5hdlNlcnZpY2UuaHJlZkZvckV4dGVybmFsKG9BcmdzLCBvQ29tcG9uZW50LCBiQXN5bmMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBnZXRBcHBTdGF0ZSBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIG9Db21wb25lbnQgYW5kIG9BcHBTdGF0ZUtleS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQ29tcG9uZW50IGFuZFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0FwcFN0YXRlS2V5IC0gY2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Z2V0QXBwU3RhdGUgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRnZXRBcHBTdGF0ZShvQ29tcG9uZW50OiBDb21wb25lbnQsIHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHdyYXBKUXVlcnlQcm9taXNlKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmdldEFwcFN0YXRlKG9Db21wb25lbnQsIHNBcHBTdGF0ZUtleSkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBjcmVhdGVFbXB0eUFwcFN0YXRlIG1ldGhvZCBvZiBDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbiBzZXJ2aWNlIHdpdGggb0NvbXBvbmVudC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQ29tcG9uZW50IC0gY2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbj0+Y3JlYXRlRW1wdHlBcHBTdGF0ZSBhcmd1bWVudHNcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdGNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudDogQ29tcG9uZW50KSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmNyZWF0ZUVtcHR5QXBwU3RhdGUob0NvbXBvbmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzTmF2aWdhdGlvblN1cHBvcnRlZCBtZXRob2Qgb2YgQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gc2VydmljZSB3aXRoIE5hdmlnYXRpb24gQXJndW1lbnRzIGFuZCBvQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHtBcnJheX0gb05hdkFyZ3VtZW50c0FyciBhbmRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9Db21wb25lbnQgLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uPT5pc05hdmlnYXRpb25TdXBwb3J0ZWQgYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqL1xuXHRpc05hdmlnYXRpb25TdXBwb3J0ZWQob05hdkFyZ3VtZW50c0FycjogQXJyYXk8b2JqZWN0Piwgb0NvbXBvbmVudDogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHdyYXBKUXVlcnlQcm9taXNlKHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmlzTmF2aWdhdGlvblN1cHBvcnRlZChvTmF2QXJndW1lbnRzQXJyLCBvQ29tcG9uZW50KSk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIGlzSW5pdGlhbE5hdmlnYXRpb24gbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCB3aWxsIGJlIHJlc29sdmVkIHRvIGJvb2xlYW5cblx0ICovXG5cdGlzSW5pdGlhbE5hdmlnYXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmlzSW5pdGlhbE5hdmlnYXRpb24oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZXhwYW5kQ29tcGFjdEhhc2ggbWV0aG9kIG9mIENyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzSGFzaEZyYWdtZW50IGFuIChpbnRlcm5hbCBmb3JtYXQpIHNoZWxsIGhhc2hcblx0ICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2UgdGhlIHN1Y2Nlc3MgaGFuZGxlciBvZiB0aGUgcmVzb2x2ZSBwcm9taXNlIGdldCBhbiBleHBhbmRlZCBzaGVsbCBoYXNoIGFzIGZpcnN0IGFyZ3VtZW50XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0ZXhwYW5kQ29tcGFjdEhhc2goc0hhc2hGcmFnbWVudDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuY3Jvc3NBcHBOYXZTZXJ2aWNlLmV4cGFuZENvbXBhY3RIYXNoKHNIYXNoRnJhZ21lbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBwYXJzZVNoZWxsSGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0hhc2ggLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLlVSTFBhcnNpbmc9PnBhcnNlU2hlbGxIYXNoIGFyZ3VtZW50c1xuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSB3aGljaCB3aWxsIHJldHVybiBvYmplY3Rcblx0ICovXG5cdHBhcnNlU2hlbGxIYXNoKHNIYXNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy51cmxQYXJzaW5nU2VydmljZS5wYXJzZVNoZWxsSGFzaChzSGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNwbGl0SGFzaCBtZXRob2Qgb2YgVVJMUGFyc2luZyBzZXJ2aWNlIHdpdGggZ2l2ZW4gc0hhc2guXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0hhc2ggLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZlxuXHQgKiBzYXAudXNoZWxsLnNlcnZpY2VzLlVSTFBhcnNpbmc9PnNwbGl0SGFzaCBhcmd1bWVudHNcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggd2lsbCBiZSByZXNvbHZlZCB0byBvYmplY3Rcblx0ICovXG5cdHNwbGl0SGFzaChzSGFzaDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMudXJsUGFyc2luZ1NlcnZpY2Uuc3BsaXRIYXNoKHNIYXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgY29uc3RydWN0U2hlbGxIYXNoIG1ldGhvZCBvZiBVUkxQYXJzaW5nIHNlcnZpY2Ugd2l0aCBnaXZlbiBzSGFzaC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvTmV3U2hlbGxIYXNoIC0gY2hlY2sgdGhlIGRlZmluaXRpb24gb2Zcblx0ICogc2FwLnVzaGVsbC5zZXJ2aWNlcy5VUkxQYXJzaW5nPT5jb25zdHJ1Y3RTaGVsbEhhc2ggYXJndW1lbnRzXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFNoZWxsIEhhc2ggc3RyaW5nXG5cdCAqL1xuXHRjb25zdHJ1Y3RTaGVsbEhhc2gob05ld1NoZWxsSGFzaDogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMudXJsUGFyc2luZ1NlcnZpY2UuY29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzZXREaXJ0eUZsYWcgbWV0aG9kIHdpdGggZ2l2ZW4gZGlydHkgc3RhdGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGJEaXJ0eSAtIGNoZWNrIHRoZSBkZWZpbml0aW9uIG9mIHNhcC51c2hlbGwuQ29udGFpbmVyLnNldERpcnR5RmxhZyBhcmd1bWVudHNcblx0ICovXG5cdHNldERpcnR5RmxhZyhiRGlydHk6IGJvb2xlYW4pIHtcblx0XHR0aGlzLm9TaGVsbENvbnRhaW5lci5zZXREaXJ0eUZsYWcoYkRpcnR5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgbWV0aG9kIHdpdGggZ2l2ZW4gZGlydHkgc3RhdGUgcHJvdmlkZXIgY2FsbGJhY2sgbWV0aG9kLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm5EaXJ0eVN0YXRlUHJvdmlkZXIgLSBjaGVjayB0aGUgZGVmaW5pdGlvbiBvZiBzYXAudXNoZWxsLkNvbnRhaW5lci5yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBhcmd1bWVudHNcblx0ICovXG5cdHJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLnJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciBtZXRob2Qgd2l0aCBnaXZlbiBkaXJ0eSBzdGF0ZSBwcm92aWRlciBjYWxsYmFjayBtZXRob2QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbkRpcnR5U3RhdGVQcm92aWRlciAtIGNoZWNrIHRoZSBkZWZpbml0aW9uIG9mIHNhcC51c2hlbGwuQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIgYXJndW1lbnRzXG5cdCAqL1xuXHRkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKGZuRGlydHlTdGF0ZVByb3ZpZGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMub1NoZWxsQ29udGFpbmVyLmRlcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIoZm5EaXJ0eVN0YXRlUHJvdmlkZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBjcmVhdGVSZW5kZXJlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IHJldHVybnMgcmVuZGVyZXIgb2JqZWN0XG5cdCAqL1xuXHRjcmVhdGVSZW5kZXJlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5vU2hlbGxDb250YWluZXIuY3JlYXRlUmVuZGVyZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgZ2V0VXNlciBtZXRob2Qgb2YgdXNoZWxsIGNvbnRhaW5lci5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IHJldHVybnMgVXNlciBvYmplY3Rcblx0ICovXG5cdGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1NoZWxsQ29udGFpbmVyLmdldFVzZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNoZWNrIGlmIHVzaGVsbCBjb250YWluZXIgaXMgYXZhaWxhYmxlIG9yIG5vdC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEByZXR1cm5zIHtib29sZWFufSByZXR1cm5zIHRydWVcblx0ICovXG5cdGhhc1VTaGVsbCgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgcmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIG1ldGhvZCBvZiBzaGVsbE5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuTmF2RmlsdGVyIHRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gcmVnaXN0ZXJcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0cmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKGZuTmF2RmlsdGVyOiBGdW5jdGlvbikge1xuXHRcdHRoaXMuc2hlbGxOYXZpZ2F0aW9uLnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcik7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIG1ldGhvZCBvZiBzaGVsbE5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuTmF2RmlsdGVyIHRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gdW5yZWdpc3RlclxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHR1bnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcjogRnVuY3Rpb24pIHtcblx0XHR0aGlzLnNoZWxsTmF2aWdhdGlvbi51bnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcihmbk5hdkZpbHRlcik7XG5cdH1cblxuXHQvKipcblx0ICogV2lsbCBjYWxsIHNldEJhY2tOYXZpZ2F0aW9uIG1ldGhvZCBvZiBTaGVsbFVJU2VydmljZVxuXHQgKiB0aGF0IGRpc3BsYXlzIHRoZSBiYWNrIGJ1dHRvbiBpbiB0aGUgc2hlbGwgaGVhZGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5DYWxsQmFja11cblx0ICogQSBjYWxsYmFjayBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQgaW4gdGhlIFVJLlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRCYWNrTmF2aWdhdGlvbihmbkNhbGxCYWNrPzogRnVuY3Rpb24pOiB2b2lkIHtcblx0XHR0aGlzLnNoZWxsVUlTZXJ2aWNlLnNldEJhY2tOYXZpZ2F0aW9uKGZuQ2FsbEJhY2spO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdpbGwgY2FsbCBzZXRIaWVyYXJjaHkgbWV0aG9kIG9mIFNoZWxsVUlTZXJ2aWNlXG5cdCAqIHRoYXQgZGlzcGxheXMgdGhlIGdpdmVuIGhpZXJhcmNoeSBpbiB0aGUgc2hlbGwgaGVhZGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdFtdfSBbYUhpZXJhcmNoeUxldmVsc11cblx0ICogQW4gYXJyYXkgcmVwcmVzZW50aW5nIGhpZXJhcmNoaWVzIG9mIHRoZSBjdXJyZW50bHkgZGlzcGxheWVkIGFwcC5cblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0c2V0SGllcmFyY2h5KGFIaWVyYXJjaHlMZXZlbHM6IEFycmF5PG9iamVjdD4pOiB2b2lkIHtcblx0XHR0aGlzLnNoZWxsVUlTZXJ2aWNlLnNldEhpZXJhcmNoeShhSGllcmFyY2h5TGV2ZWxzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaWxsIGNhbGwgc2V0VGl0bGUgbWV0aG9kIG9mIFNoZWxsVUlTZXJ2aWNlXG5cdCAqIHRoYXQgZGlzcGxheXMgdGhlIGdpdmVuIHRpdGxlIGluIHRoZSBzaGVsbCBoZWFkZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbc1RpdGxlXVxuXHQgKiBUaGUgbmV3IHRpdGxlLiBUaGUgZGVmYXVsdCB0aXRsZSBpcyBzZXQgaWYgdGhpcyBhcmd1bWVudCBpcyBub3QgZ2l2ZW4uXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdHNldFRpdGxlKHNUaXRsZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0dGhpcy5zaGVsbFVJU2VydmljZS5zZXRUaXRsZShzVGl0bGUpO1xuXHR9XG59XG5cbi8qKlxuICogU2VydmljZSBGYWN0b3J5IGZvciB0aGUgU2hlbGxTZXJ2aWNlc1xuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIFNoZWxsU2VydmljZXNGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPiB7XG5cdC8qKlxuXHQgKiBDcmVhdGVzIGVpdGhlciBhIHN0YW5kYXJkIG9yIGEgbW9jayBTaGVsbCBzZXJ2aWNlIGRlcGVuZGluZyBvbiB0aGUgY29uZmlndXJhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHtTZXJ2aWNlQ29udGV4dDxTaGVsbFNlcnZpY2VzU2V0dGluZ3M+fSBvU2VydmljZUNvbnRleHQgdGhlIHNoZWxsc2VydmljZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlPElTaGVsbFNlcnZpY2VzPn0gYSBwcm9taXNlIGZvciBhIHNoZWxsIHNlcnZpY2UgaW1wbGVtZW50YXRpb25cblx0ICogQHNlZSBTZXJ2aWNlRmFjdG9yeSNjcmVhdGVJbnN0YW5jZVxuXHQgKi9cblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxTaGVsbFNlcnZpY2VzU2V0dGluZ3M+KTogUHJvbWlzZTxJU2hlbGxTZXJ2aWNlcz4ge1xuXHRcdG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lciA9IHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXI7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZSA9IG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5zaGVsbENvbnRhaW5lclxuXHRcdFx0PyBuZXcgU2hlbGxTZXJ2aWNlcyhvU2VydmljZUNvbnRleHQgYXMgU2VydmljZUNvbnRleHQ8UmVxdWlyZWQ8U2hlbGxTZXJ2aWNlc1NldHRpbmdzPj4pXG5cdFx0XHQ6IG5ldyBTaGVsbFNlcnZpY2VNb2NrKG9TZXJ2aWNlQ29udGV4dCk7XG5cdFx0cmV0dXJuIG9TaGVsbFNlcnZpY2UuaW5pdFByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHQvLyBFbnJpY2ggdGhlIGFwcENvbXBvbmVudCB3aXRoIHRoaXMgbWV0aG9kXG5cdFx0XHQob1NlcnZpY2VDb250ZXh0LnNjb3BlT2JqZWN0IGFzIGFueSkuZ2V0U2hlbGxTZXJ2aWNlcyA9ICgpID0+IG9TaGVsbFNlcnZpY2U7XG5cdFx0XHRyZXR1cm4gb1NoZWxsU2VydmljZTtcblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaGVsbFNlcnZpY2VzRmFjdG9yeTtcbiJdfQ==