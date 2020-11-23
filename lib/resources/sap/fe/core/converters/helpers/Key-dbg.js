sap.ui.define(["sap/fe/core/helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  /**
   * The KeyHelper is used for dealing with Key in the concern of the flexible programming model
   */
  var KeyHelper = /*#__PURE__*/function () {
    function KeyHelper() {
      _classCallCheck(this, KeyHelper);
    }

    _exports.KeyHelper = KeyHelper;

    _createClass(KeyHelper, null, [{
      key: "generateKeyFromDataField",

      /**
       * Returns a generated key for DataFields to be used in the flexible programming model.
       *
       * @param {DataFieldAbstractTypes} oDataField dataField to generate the key for
       * @returns {string} Returns a through StableIdHelper generated key
       */
      value: function generateKeyFromDataField(oDataField) {
        return StableIdHelper.getStableIdPartFromDataField(oDataField);
      }
      /**
       * Returns true / false if any other character then aA-zZ, 0-9, ':', '_' or '-' is used.
       *
       * @param {string} id String to check validity on
       * @returns {boolean} Returns if all characters are legit for an ID
       */

    }, {
      key: "isKeyValid",
      value: function isKeyValid(id) {
        var pattern = /[^A-Za-z0-9_\-:]/;

        if (pattern.exec(id)) {
          // Todo: Replace with proper Log statement once available
          // throw new Error(id + " - contains the not allowed character: " + pattern.exec(id));
          return false;
        } else {
          return true;
        }
      }
    }]);

    return KeyHelper;
  }();

  _exports.KeyHelper = KeyHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIktleS50cyJdLCJuYW1lcyI6WyJLZXlIZWxwZXIiLCJvRGF0YUZpZWxkIiwiU3RhYmxlSWRIZWxwZXIiLCJnZXRTdGFibGVJZFBhcnRGcm9tRGF0YUZpZWxkIiwiaWQiLCJwYXR0ZXJuIiwiZXhlYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFHQTs7O01BR2FBLFM7Ozs7Ozs7Ozs7QUFDWjs7Ozs7OytDQU1nQ0MsVSxFQUE0QztBQUMzRSxlQUFPQyxjQUFjLENBQUNDLDRCQUFmLENBQTRDRixVQUE1QyxDQUFQO0FBQ0E7QUFFRDs7Ozs7Ozs7O2lDQU1rQkcsRSxFQUFxQjtBQUN0QyxZQUFNQyxPQUFPLEdBQUcsa0JBQWhCOztBQUNBLFlBQUlBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhRixFQUFiLENBQUosRUFBc0I7QUFDckI7QUFDQTtBQUNBLGlCQUFPLEtBQVA7QUFDQSxTQUpELE1BSU87QUFDTixpQkFBTyxJQUFQO0FBQ0E7QUFDRCIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgU3RhYmxlSWRIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVyc1wiO1xuXG4vKipcbiAqIFRoZSBLZXlIZWxwZXIgaXMgdXNlZCBmb3IgZGVhbGluZyB3aXRoIEtleSBpbiB0aGUgY29uY2VybiBvZiB0aGUgZmxleGlibGUgcHJvZ3JhbW1pbmcgbW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIEtleUhlbHBlciB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgZ2VuZXJhdGVkIGtleSBmb3IgRGF0YUZpZWxkcyB0byBiZSB1c2VkIGluIHRoZSBmbGV4aWJsZSBwcm9ncmFtbWluZyBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIHtEYXRhRmllbGRBYnN0cmFjdFR5cGVzfSBvRGF0YUZpZWxkIGRhdGFGaWVsZCB0byBnZW5lcmF0ZSB0aGUga2V5IGZvclxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIGEgdGhyb3VnaCBTdGFibGVJZEhlbHBlciBnZW5lcmF0ZWQga2V5XG5cdCAqL1xuXHRzdGF0aWMgZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKG9EYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpOiBzdHJpbmcge1xuXHRcdHJldHVybiBTdGFibGVJZEhlbHBlci5nZXRTdGFibGVJZFBhcnRGcm9tRGF0YUZpZWxkKG9EYXRhRmllbGQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSAvIGZhbHNlIGlmIGFueSBvdGhlciBjaGFyYWN0ZXIgdGhlbiBhQS16WiwgMC05LCAnOicsICdfJyBvciAnLScgaXMgdXNlZC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkIFN0cmluZyB0byBjaGVjayB2YWxpZGl0eSBvblxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBpZiBhbGwgY2hhcmFjdGVycyBhcmUgbGVnaXQgZm9yIGFuIElEXG5cdCAqL1xuXHRzdGF0aWMgaXNLZXlWYWxpZChpZDogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgcGF0dGVybiA9IC9bXkEtWmEtejAtOV9cXC06XS87XG5cdFx0aWYgKHBhdHRlcm4uZXhlYyhpZCkpIHtcblx0XHRcdC8vIFRvZG86IFJlcGxhY2Ugd2l0aCBwcm9wZXIgTG9nIHN0YXRlbWVudCBvbmNlIGF2YWlsYWJsZVxuXHRcdFx0Ly8gdGhyb3cgbmV3IEVycm9yKGlkICsgXCIgLSBjb250YWlucyB0aGUgbm90IGFsbG93ZWQgY2hhcmFjdGVyOiBcIiArIHBhdHRlcm4uZXhlYyhpZCkpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cbn1cbiJdfQ==