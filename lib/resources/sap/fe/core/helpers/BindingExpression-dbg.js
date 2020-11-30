sap.ui.define([], function () {
  "use strict";

  var _exports = {};

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  /**
   * @typedef BindingPartConstant
   */

  /**
   * @typedef BindingPartBindingExpression
   */

  /**
   * @typedef OPERATOR_STRING
   */

  /**
   * @template TargetType
   * @typedef {PureBindingPart<TargetType>} PureBindingPart
   */

  /**
   * @template TargetType
   * @typedef {BindingPart<TargetType>} BindingPart
   */

  /**
   * Logical `and` operator.
   * If at least one parameter is a constant `false` this is simplified as false.
   *
   * @param {BindingPart<boolean>[]} inExpressions an array of expression that should be evaluated with `and` operators
   * @returns {PureBindingPart<boolean>} the resulting BindingPart that evaluates to boolean
   */
  function and() {
    for (var _len = arguments.length, inExpressions = new Array(_len), _key = 0; _key < _len; _key++) {
      inExpressions[_key] = arguments[_key];
    }

    var expressions = inExpressions.map(wrapPrimitive);
    var isStaticFalse = false;
    var nonTrivialExpression = expressions.filter(function (expression) {
      if (isConstant(expression) && !expression.value) {
        isStaticFalse = true;
      }

      return !isConstant(expression);
    });

    if (isStaticFalse) {
      return constant(false);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      var isValid = expressions.reduce(function (isValid, expression) {
        return isValid && isConstant(expression) && !!expression.value;
      }, true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else {
      return {
        _type: "And",
        expressions: nonTrivialExpression
      };
    }
  }
  /**
   * Logical `or` operator.
   * If at least one parameter is a constant `true` this is simplified as true.
   *
   * @param {BindingPart<boolean>[]} inExpressions an array of expression that should be evaluated with `or` operators
   * @returns {PureBindingPart<boolean>} the resulting BindingPart that evaluates to boolean
   */


  _exports.and = and;

  function or() {
    for (var _len2 = arguments.length, inExpressions = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      inExpressions[_key2] = arguments[_key2];
    }

    var expressions = inExpressions.map(wrapPrimitive);
    var isStaticTrue = false;
    var nonTrivialExpression = expressions.filter(function (expression) {
      if (isConstant(expression) && expression.value) {
        isStaticTrue = true;
      }

      return !isConstant(expression) || expression.value;
    });

    if (isStaticTrue) {
      return constant(true);
    } else if (nonTrivialExpression.length === 0) {
      // Resolve the constant then
      var isValid = expressions.reduce(function (isValid, expression) {
        return isValid && isConstant(expression) && !!expression.value;
      }, true);
      return constant(isValid);
    } else if (nonTrivialExpression.length === 1) {
      return nonTrivialExpression[0];
    } else {
      return {
        _type: "Or",
        expressions: nonTrivialExpression
      };
    }
  }
  /**
   * Logical `not` operator.
   *
   * @param {BindingPart<boolean>} expression the expression to reverse
   * @returns {PureBindingPart<boolean>} the resulting BindingPart that evaluates to boolean
   */


  _exports.or = or;

  function not(expression) {
    if (isConstant(expression)) {
      return constant(!expression.value);
    } else if (typeof expression === "object" && expression._type === "Or" && expression.expressions.every(function (expression) {
      return isConstant(expression) || isComparison(expression);
    })) {
      return and.apply(void 0, _toConsumableArray(expression.expressions.map(function (expression) {
        return not(expression);
      })));
    } else if (typeof expression === "object" && expression._type === "And" && expression.expressions.every(function (expression) {
      return isConstant(expression) || isComparison(expression);
    })) {
      return or.apply(void 0, _toConsumableArray(expression.expressions.map(function (expression) {
        return not(expression);
      })));
    } else if (isComparison(expression)) {
      // Create the reverse comparison
      switch (expression.operator) {
        case "!==":
          return equals(expression.leftVal, expression.rightVal);

        case "<":
          return greaterOrEquals(expression.leftVal, expression.rightVal);

        case "<=":
          return greaterThan(expression.leftVal, expression.rightVal);

        case "===":
          return notEquals(expression.leftVal, expression.rightVal);

        case ">":
          return lowerOrEquals(expression.leftVal, expression.rightVal);

        case ">=":
          return lowerThan(expression.leftVal, expression.rightVal);
      }
    } else {
      return {
        _type: "Not",
        expression: wrapPrimitive(expression)
      };
    }
  }
  /**
   * Creates a binding expression that will be evaluated by the corresponding model.
   *
   * @template TargetType
   * @param {string} path the path on the model
   * @param {string} [modelName] the name of the model
   * @returns {BindingPartBindingExpression<TargetType>} the default binding expression
   */


  _exports.not = not;

  function bindingExpression(path, modelName) {
    return {
      _type: "Binding",
      modelName: modelName,
      path: path
    };
  }
  /**
   * Creates a constant binding based on a primitive value.
   *
   * @template ConstantType
   * @param {(null |ConstantType)} constantValue the constant to wrap in a BindingPart
   * @returns {BindingPartConstant<ConstantType>} the constant binding part
   */


  _exports.bindingExpression = bindingExpression;

  function constant(constantValue) {
    return {
      _type: "Constant",
      value: constantValue
    };
  }
  /**
   * Wrap a primitive into a constant if it's not already a binding part.
   *
   * @template T
   * @param {null | T | BindingPart<T>} something the object to wrap in a Constant binding part
   * @returns {PureBindingPart<T>} either the original object or the wrapped one depending on the case
   */


  _exports.constant = constant;

  function wrapPrimitive(something) {
    if (something === null || typeof something !== "object") {
      return constant(something);
    }

    return something;
  }
  /**
   * Check if the binding part provided is a constant or not.
   *
   * @template T
   * @param {BindingPart<T>} maybeConstant the binding part to evaluate
   * @returns {boolean} true if we're dealing with a BindingPartConstant
   */


  function isConstant(maybeConstant) {
    var _ref;

    return typeof maybeConstant !== "object" || ((_ref = maybeConstant) === null || _ref === void 0 ? void 0 : _ref._type) === "Constant";
  }
  /**
   * Check if the binding part provided is a pure binding part of not.
   *
   * @template T
   * @param {BindingPart<T>} maybeConstant the binding part to evaluate
   * @returns {boolean} true if we're dealing with a PureBindingPart
   */


  _exports.isConstant = isConstant;

  function isPureBindingPart(maybeConstant) {
    var _ref2;

    return typeof maybeConstant === "object" && ((_ref2 = maybeConstant) === null || _ref2 === void 0 ? void 0 : _ref2._type) !== undefined;
  }

  function constantsAreEqual(leftMaybeConstant, rightMaybeConstant) {
    return isConstant(leftMaybeConstant) && isConstant(rightMaybeConstant) && leftMaybeConstant.value === rightMaybeConstant.value;
  }
  /**
   * Check if the binding part provided is a comparison or not.
   *
   * @template T
   * @param {BindingPart<T>} maybeConstant the binding part to evaluate
   * @returns {boolean} true if we're dealing with a BindingPartComparison
   */


  function isComparison(maybeConstant) {
    var _ref3;

    return ((_ref3 = maybeConstant) === null || _ref3 === void 0 ? void 0 : _ref3._type) === "Comparison";
  }

  /**
   * Check if the passed annotation expression is a ComplexAnnotationExpression.
   *
   * @template T
   * @param {PropertyAnnotationValue<T>} annotationExpression the annotation expression to evaluate
   * @returns {boolean} true if the object is a {ComplexAnntotationExpression}
   */
  function isComplexAnnotationExpression(annotationExpression) {
    return typeof annotationExpression === "object";
  }
  /**
   * Generate the corresponding bindingpart for a given annotation expression.
   *
   * @template T
   * @param {PropertyAnnotationValue<T>} annotationExpression the source annotation expression
   * @returns {PureBindingPart<T>} the binding part equivalent to that annotation expression
   */


  function annotationExpression(annotationExpression) {
    if (!isComplexAnnotationExpression(annotationExpression)) {
      return constant(annotationExpression);
    } else {
      switch (annotationExpression.type) {
        case "Path":
          return bindingExpression(annotationExpression.path);

        case "If":
          return annotationIfExpression(annotationExpression.If);

        default:
          return constant(annotationExpression.value);
      }
    }
  }
  /**
   * Parse the annotation condition into a PureBindingPart.
   *
   * @template T
   * @param {ConditionalCheckOrValue} annotationValue the condition or value from the annotation
   * @returns {PureBindingPart<T>} an equivalent as PureBindingPart
   */


  _exports.annotationExpression = annotationExpression;

  function parseAnnotationCondition(annotationValue) {
    if (annotationValue === null || typeof annotationValue !== "object") {
      return constant(annotationValue);
    } else if (annotationValue.hasOwnProperty("$Or")) {
      return or.apply(void 0, _toConsumableArray(annotationValue.$Or.map(parseAnnotationCondition)));
    } else if (annotationValue.hasOwnProperty("$And")) {
      return and.apply(void 0, _toConsumableArray(annotationValue.$And.map(parseAnnotationCondition)));
    } else if (annotationValue.hasOwnProperty("$Not")) {
      return not(parseAnnotationCondition(annotationValue.$Not[0]));
    } else if (annotationValue.hasOwnProperty("$Eq")) {
      return equals(parseAnnotationCondition(annotationValue.$Eq[0]), parseAnnotationCondition(annotationValue.$Eq[1]));
    } else if (annotationValue.hasOwnProperty("$Ne")) {
      return notEquals(parseAnnotationCondition(annotationValue.$Ne[0]), parseAnnotationCondition(annotationValue.$Ne[1]));
    } else if (annotationValue.hasOwnProperty("$Gt")) {
      return greaterThan(parseAnnotationCondition(annotationValue.$Gt[0]), parseAnnotationCondition(annotationValue.$Gt[1]));
    } else if (annotationValue.hasOwnProperty("$Ge")) {
      return greaterOrEquals(parseAnnotationCondition(annotationValue.$Ge[0]), parseAnnotationCondition(annotationValue.$Ge[1]));
    } else if (annotationValue.hasOwnProperty("$Lt")) {
      return lowerThan(parseAnnotationCondition(annotationValue.$Lt[0]), parseAnnotationCondition(annotationValue.$Lt[1]));
    } else if (annotationValue.hasOwnProperty("$Le")) {
      return lowerOrEquals(parseAnnotationCondition(annotationValue.$Le[0]), parseAnnotationCondition(annotationValue.$Le[1]));
    } else if (annotationValue.hasOwnProperty("$Path")) {
      return bindingExpression(annotationValue.$Path);
    } else {
      return constant(false);
    }
  }
  /**
   * Process the {IfAnnotationExpressionValue} into a PureBindingPart.
   *
   * @template T
   * @param {IfAnnotationExpressionValue<T>} annotationIfExpression an If expression returning the type T
   * @returns {PureBindingPart<T>} the equivalent pure binding part
   */


  function annotationIfExpression(annotationIfExpression) {
    return ifElse(parseAnnotationCondition(annotationIfExpression[0]), annotationIfExpression[1], annotationIfExpression[2]);
  }
  /**
   * Generic helper for the comparison operation (equals, notEquals ....).
   *
   * @template T
   * @param {OPERATOR_STRING} operator the operator to consider
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.annotationIfExpression = annotationIfExpression;

  function comparison(operator, leftVal, rightVal) {
    leftVal = wrapPrimitive(leftVal);
    rightVal = wrapPrimitive(rightVal);

    if (isConstant(leftVal) && leftVal.value !== null && isConstant(rightVal) && rightVal.value !== null) {
      switch (operator) {
        case "!==":
          return constant(leftVal.value !== rightVal.value);

        case "<":
          return constant(leftVal.value < rightVal.value);

        case "<=":
          return constant(leftVal.value <= rightVal.value);

        case ">":
          return constant(leftVal.value > rightVal.value);

        case ">=":
          return constant(leftVal.value >= rightVal.value);

        case "===":
        default:
          return constant(leftVal.value === rightVal.value);
      }
    } else {
      return {
        _type: "Comparison",
        operator: operator,
        leftVal: leftVal,
        rightVal: rightVal
      };
    }
  }
  /**
   * Equals comparison ===.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  function equals(leftVal, rightVal) {
    if (isPureBindingPart(leftVal) && leftVal._type === "IfElse" && constantsAreEqual(leftVal.onTrue, wrapPrimitive(rightVal))) {
      return leftVal.condition;
    }

    return comparison("===", leftVal, rightVal);
  }
  /**
   * Not Equals comparison !==.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.equals = equals;

  function notEquals(leftVal, rightVal) {
    return comparison("!==", leftVal, rightVal);
  }
  /**
   * Greater or equals comparison >=.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.notEquals = notEquals;

  function greaterOrEquals(leftVal, rightVal) {
    return comparison(">=", leftVal, rightVal);
  }
  /**
   * Greather than comparison >.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.greaterOrEquals = greaterOrEquals;

  function greaterThan(leftVal, rightVal) {
    return comparison(">", leftVal, rightVal);
  }
  /**
   * Lower or Equals comparison <=.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.greaterThan = greaterThan;

  function lowerOrEquals(leftVal, rightVal) {
    return comparison("<=", leftVal, rightVal);
  }
  /**
   * Lower than comparison <.
   *
   * @template T
   * @param {BindingPart<T>} leftVal the value on the left side
   * @param {BindingPart<T>} rightVal the value on the right side of the comparison
   * @returns {PureBindingPart<boolean>} a binding part to evaluate the resulting type of the comparison
   */


  _exports.lowerOrEquals = lowerOrEquals;

  function lowerThan(leftVal, rightVal) {
    return comparison("<", leftVal, rightVal);
  }
  /**
   * If Else evaluation, if the condition evaluates to true, do the onTrue part, otherwise the onFalse.
   *
   * @template TargetType
   * @param {BindingPart<boolean>} condition the condition to evaluate
   * @param {BindingPart<TargetType>} onTrue what to do in case of true evaluation
   * @param {BindingPart<TargetType>} onFalse what to do in case of false evaluation
   * @returns {PureBindingPart<TargetType>} the binding part that represent this conditional check
   */


  _exports.lowerThan = lowerThan;

  function ifElse(condition, onTrue, onFalse) {
    condition = wrapPrimitive(condition);
    onTrue = wrapPrimitive(onTrue);
    onFalse = wrapPrimitive(onFalse);

    if (isConstant(condition)) {
      return condition.value ? onTrue : onFalse;
    } else {
      if (condition._type === "IfElse" && isConstant(condition.onFalse) && condition.onFalse.value === false && isConstant(condition.onTrue) && condition.onTrue.value === true) {
        condition = condition.condition;
      } else if (condition._type === "IfElse" && isConstant(condition.onFalse) && condition.onFalse.value === true && isConstant(condition.onTrue) && condition.onTrue.value === false) {
        condition = not(condition.condition);
      } else if (condition._type === "IfElse" && isConstant(condition.onTrue) && condition.onTrue.value === false && !isConstant(condition.onFalse)) {
        condition = and(not(condition.condition), condition.onFalse);
      }

      if (isConstant(onTrue) && isConstant(onFalse) && onTrue.value === onFalse.value) {
        return onTrue;
      }

      return {
        _type: "IfElse",
        condition: condition,
        onTrue: onTrue,
        onFalse: onFalse
      };
    }
  }

  _exports.ifElse = ifElse;

  /**
   * Checks whether the current binding part has a reference to the default model (undefined).
   *
   * @param { PureBindingPart<object>} part the binding part to evaluate
   * @returns {boolean} true if there is a reference to the default context
   */
  function hasReferenceToDefaultContext(part) {
    switch (part._type) {
      case "Constant":
      case "FormatResult":
        return false;

      case "And":
        return part.expressions.some(hasReferenceToDefaultContext);

      case "Binding":
        return part.modelName === undefined;

      case "Comparison":
        return hasReferenceToDefaultContext(part.leftVal) || hasReferenceToDefaultContext(part.rightVal);

      case "DefaultBinding":
        return true;

      case "IfElse":
        return hasReferenceToDefaultContext(part.condition) || hasReferenceToDefaultContext(part.onTrue) || hasReferenceToDefaultContext(part.onFalse);

      case "Not":
        return hasReferenceToDefaultContext(part.expression);

      case "Or":
        return part.expressions.some(hasReferenceToDefaultContext);

      default:
        return false;
    }
  }
  /**
   * @typedef WrappedTuple
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore


  // So, this works but I cannot get it to compile :D, but it still does what is expected...

  /**
   * Calls a formatter function to process the inParameters.
   * If requireContext is set to true and no concept is passed a default context will be addded automatically.
   *
   * @template TargetType
   * @template U
   * @param {WrappedTuple<Parameters<U>>} inParameters the list of parameter that should match the type and number of the formatter function
   * @param {U} formatterFunction the function to call
   * @param {EntityType} [contextEntityType] the context entity type to consider
   * @returns {PureBindingPart<TargetType>} the corresponding pure binding part
   */
  function formatResult(inParameters, formatterFunction, contextEntityType) {
    var parameters = inParameters.map(wrapPrimitive); // If there is only parameter and it's a constant and we don't expect the context then return the constant

    if (parameters.length === 1 && isConstant(parameters[0]) && !contextEntityType) {
      return parameters[0];
    } else if (!!contextEntityType) {
      // Otherwise, if the context is required and no context is provided make sure to add the default binding
      if (!parameters.some(hasReferenceToDefaultContext)) {
        contextEntityType.keys.forEach(function (key) {
          return parameters.push(bindingExpression(key.name, ""));
        });
      }
    }

    var _formatterName$split = formatterFunction.__formatterName.split("#"),
        _formatterName$split2 = _slicedToArray(_formatterName$split, 2),
        formatterClass = _formatterName$split2[0],
        formatterName = _formatterName$split2[1]; // FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class


    if (!!formatterName && formatterName.length > 0) {
      parameters.unshift(constant(formatterName));
    }

    return {
      _type: "FormatResult",
      formatter: formatterClass,
      parameters: parameters
    };
  }

  _exports.formatResult = formatResult;

  /**
   * Compile a BindingPart into an expression binding.
   *
   * @template TargetType
   * @param {BindingPart<TargetType>} part the binding part to compile
   * @param {boolean} embeddedInBinding whether this is the root level or a sub level
   * @returns {string} the corresponding expression binding
   */
  function compileBinding(part) {
    var embeddedInBinding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    part = wrapPrimitive(part);

    switch (part._type) {
      case "Constant":
        if (part.value === null) {
          return "null";
        }

        if (embeddedInBinding) {
          switch (typeof part.value) {
            case "number":
            case "bigint":
            case "boolean":
              return part.value.toString();

            case "string":
              return "'".concat(part.value.toString(), "'");

            default:
              return "";
          }
        } else {
          return part.value.toString();
        }

      case "DefaultBinding":
      case "Binding":
        if (embeddedInBinding) {
          return "%{".concat(part.modelName ? "".concat(part.modelName, ">") : "").concat(part.path, "}");
        } else {
          return "{".concat(part.modelName ? "".concat(part.modelName, ">") : "").concat(part.path, "}");
        }

      case "Comparison":
        var comparisonPart = "".concat(compileBinding(part.leftVal, true), " ").concat(part.operator, " ").concat(compileBinding(part.rightVal, true));

        if (embeddedInBinding) {
          return comparisonPart;
        }

        return "{= ".concat(comparisonPart, "}");

      case "IfElse":
        if (embeddedInBinding) {
          return "(".concat(compileBinding(part.condition, true), " ? ").concat(compileBinding(part.onTrue, true), " : ").concat(compileBinding(part.onFalse, true), ")");
        } else {
          return "{= ".concat(compileBinding(part.condition, true), " ? ").concat(compileBinding(part.onTrue, true), " : ").concat(compileBinding(part.onFalse, true), "}");
        }

      case "And":
        if (embeddedInBinding) {
          return "(".concat(part.expressions.map(function (expression) {
            return compileBinding(expression, true);
          }).join(" && "), ")");
        } else {
          return "{= (".concat(part.expressions.map(function (expression) {
            return compileBinding(expression, true);
          }).join(" && "), ")}");
        }

      case "Or":
        if (embeddedInBinding) {
          return "(".concat(part.expressions.map(function (expression) {
            return compileBinding(expression, true);
          }).join(" || "), ")");
        } else {
          return "{= (".concat(part.expressions.map(function (expression) {
            return compileBinding(expression, true);
          }).join(" || "), ")}");
        }

      case "Not":
        if (embeddedInBinding) {
          return "!".concat(compileBinding(part.expression, true));
        } else {
          return "{= !".concat(compileBinding(part.expression, true), "}");
        }

      case "FormatResult":
        var outProperty = "";

        if (part.parameters.length === 1) {
          outProperty += "{".concat(compilePathParameter(part.parameters[0], true), ", formatter: '").concat(part.formatter, "'}");
        } else {
          outProperty += "{parts:[".concat(part.parameters.map(function (param) {
            return compilePathParameter(param);
          }).join(","), "], formatter: '").concat(part.formatter, "'}");
        }

        if (embeddedInBinding) {
          outProperty = "$".concat(outProperty);
        }

        return outProperty;

      default:
        return "";
    }
  }
  /**
   * Compile the path parameter of a formatter call.
   *
   * @param {PureBindingPart<object>} part the binding part to evaluate
   * @param {boolean} singlePath whether there is one or multiple path to consider
   * @returns {string} the string snippet to include in the overall binding definition
   */


  _exports.compileBinding = compileBinding;

  function compilePathParameter(part) {
    var singlePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var outValue = "";

    switch (part._type) {
      case "Constant":
        switch (typeof part.value) {
          case "number":
          case "bigint":
            outValue = "value: ".concat(part.value.toString());
            break;

          case "string":
          case "boolean":
            outValue = "value: '".concat(part.value.toString(), "'");
            break;

          default:
            outValue = "value: ''";
            break;
        }

        if (singlePath) {
          return outValue;
        }

        return "{".concat(outValue, "}");

      case "DefaultBinding":
      case "Binding":
        outValue = "path:'".concat(part.modelName ? "".concat(part.modelName, ">") : "").concat(part.path, "', targetType : 'any'");

        if (singlePath) {
          return outValue;
        }

        return "{".concat(outValue, "}");

      default:
        return "";
    }
  }

  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJpbmRpbmdFeHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbImFuZCIsImluRXhwcmVzc2lvbnMiLCJleHByZXNzaW9ucyIsIm1hcCIsIndyYXBQcmltaXRpdmUiLCJpc1N0YXRpY0ZhbHNlIiwibm9uVHJpdmlhbEV4cHJlc3Npb24iLCJmaWx0ZXIiLCJleHByZXNzaW9uIiwiaXNDb25zdGFudCIsInZhbHVlIiwiY29uc3RhbnQiLCJsZW5ndGgiLCJpc1ZhbGlkIiwicmVkdWNlIiwiX3R5cGUiLCJvciIsImlzU3RhdGljVHJ1ZSIsIm5vdCIsImV2ZXJ5IiwiaXNDb21wYXJpc29uIiwib3BlcmF0b3IiLCJlcXVhbHMiLCJsZWZ0VmFsIiwicmlnaHRWYWwiLCJncmVhdGVyT3JFcXVhbHMiLCJncmVhdGVyVGhhbiIsIm5vdEVxdWFscyIsImxvd2VyT3JFcXVhbHMiLCJsb3dlclRoYW4iLCJiaW5kaW5nRXhwcmVzc2lvbiIsInBhdGgiLCJtb2RlbE5hbWUiLCJjb25zdGFudFZhbHVlIiwic29tZXRoaW5nIiwibWF5YmVDb25zdGFudCIsImlzUHVyZUJpbmRpbmdQYXJ0IiwidW5kZWZpbmVkIiwiY29uc3RhbnRzQXJlRXF1YWwiLCJsZWZ0TWF5YmVDb25zdGFudCIsInJpZ2h0TWF5YmVDb25zdGFudCIsImlzQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uIiwiYW5ub3RhdGlvbkV4cHJlc3Npb24iLCJ0eXBlIiwiYW5ub3RhdGlvbklmRXhwcmVzc2lvbiIsIklmIiwicGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uIiwiYW5ub3RhdGlvblZhbHVlIiwiaGFzT3duUHJvcGVydHkiLCIkT3IiLCIkQW5kIiwiJE5vdCIsIiRFcSIsIiROZSIsIiRHdCIsIiRHZSIsIiRMdCIsIiRMZSIsIiRQYXRoIiwiaWZFbHNlIiwiY29tcGFyaXNvbiIsIm9uVHJ1ZSIsImNvbmRpdGlvbiIsIm9uRmFsc2UiLCJoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0IiwicGFydCIsInNvbWUiLCJmb3JtYXRSZXN1bHQiLCJpblBhcmFtZXRlcnMiLCJmb3JtYXR0ZXJGdW5jdGlvbiIsImNvbnRleHRFbnRpdHlUeXBlIiwicGFyYW1ldGVycyIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwicHVzaCIsIm5hbWUiLCJfX2Zvcm1hdHRlck5hbWUiLCJzcGxpdCIsImZvcm1hdHRlckNsYXNzIiwiZm9ybWF0dGVyTmFtZSIsInVuc2hpZnQiLCJmb3JtYXR0ZXIiLCJjb21waWxlQmluZGluZyIsImVtYmVkZGVkSW5CaW5kaW5nIiwidG9TdHJpbmciLCJjb21wYXJpc29uUGFydCIsImpvaW4iLCJvdXRQcm9wZXJ0eSIsImNvbXBpbGVQYXRoUGFyYW1ldGVyIiwicGFyYW0iLCJzaW5nbGVQYXRoIiwib3V0VmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkE7Ozs7QUF1QkE7Ozs7QUFlQTs7OztBQXdCQTs7Ozs7QUFlQTs7Ozs7QUFNQTs7Ozs7OztBQU9PLFdBQVNBLEdBQVQsR0FBaUY7QUFBQSxzQ0FBakVDLGFBQWlFO0FBQWpFQSxNQUFBQSxhQUFpRTtBQUFBOztBQUN2RixRQUFNQyxXQUFXLEdBQUdELGFBQWEsQ0FBQ0UsR0FBZCxDQUFrQkMsYUFBbEIsQ0FBcEI7QUFDQSxRQUFJQyxhQUFzQixHQUFHLEtBQTdCO0FBQ0EsUUFBTUMsb0JBQW9CLEdBQUdKLFdBQVcsQ0FBQ0ssTUFBWixDQUFtQixVQUFBQyxVQUFVLEVBQUk7QUFDN0QsVUFBSUMsVUFBVSxDQUFDRCxVQUFELENBQVYsSUFBMEIsQ0FBQ0EsVUFBVSxDQUFDRSxLQUExQyxFQUFpRDtBQUNoREwsUUFBQUEsYUFBYSxHQUFHLElBQWhCO0FBQ0E7O0FBQ0QsYUFBTyxDQUFDSSxVQUFVLENBQUNELFVBQUQsQ0FBbEI7QUFDQSxLQUw0QixDQUE3Qjs7QUFNQSxRQUFJSCxhQUFKLEVBQW1CO0FBQ2xCLGFBQU9NLFFBQVEsQ0FBQyxLQUFELENBQWY7QUFDQSxLQUZELE1BRU8sSUFBSUwsb0JBQW9CLENBQUNNLE1BQXJC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dUI7QUFDdEJJLFVBQUFBLFdBQVcsY0FBUUEsV0FBUixDQUFYO0FBQ0E7O0FBQ0QsZUFBT0EsV0FBUDs7QUFDRDtBQUNDLGVBQU8sRUFBUDtBQTdFRjtBQStFQTtBQUVEOzs7Ozs7Ozs7OztBQU9BLFdBQVNDLG9CQUFULENBQThCeEIsSUFBOUIsRUFBK0Y7QUFBQSxRQUFyQzBCLFVBQXFDLHVFQUFmLEtBQWU7QUFDOUYsUUFBSUMsUUFBUSxHQUFHLEVBQWY7O0FBQ0EsWUFBUTNCLElBQUksQ0FBQ2xELEtBQWI7QUFDQyxXQUFLLFVBQUw7QUFDQyxnQkFBUSxPQUFPa0QsSUFBSSxDQUFDdkQsS0FBcEI7QUFDQyxlQUFLLFFBQUw7QUFDQSxlQUFLLFFBQUw7QUFDQ2tGLFlBQUFBLFFBQVEsb0JBQWEzQixJQUFJLENBQUN2RCxLQUFMLENBQVcyRSxRQUFYLEVBQWIsQ0FBUjtBQUNBOztBQUNELGVBQUssUUFBTDtBQUNBLGVBQUssU0FBTDtBQUNDTyxZQUFBQSxRQUFRLHFCQUFjM0IsSUFBSSxDQUFDdkQsS0FBTCxDQUFXMkUsUUFBWCxFQUFkLE1BQVI7QUFDQTs7QUFDRDtBQUNDTyxZQUFBQSxRQUFRLEdBQUcsV0FBWDtBQUNBO0FBWEY7O0FBYUEsWUFBSUQsVUFBSixFQUFnQjtBQUNmLGlCQUFPQyxRQUFQO0FBQ0E7O0FBQ0QsMEJBQVdBLFFBQVg7O0FBRUQsV0FBSyxnQkFBTDtBQUNBLFdBQUssU0FBTDtBQUNDQSxRQUFBQSxRQUFRLG1CQUFZM0IsSUFBSSxDQUFDakMsU0FBTCxhQUFvQmlDLElBQUksQ0FBQ2pDLFNBQXpCLFNBQXdDLEVBQXBELFNBQXlEaUMsSUFBSSxDQUFDbEMsSUFBOUQsMEJBQVI7O0FBQ0EsWUFBSTRELFVBQUosRUFBZ0I7QUFDZixpQkFBT0MsUUFBUDtBQUNBOztBQUNELDBCQUFXQSxRQUFYOztBQUNEO0FBQ0MsZUFBTyxFQUFQO0FBNUJGO0FBOEJBIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRQcmltaXRpdmVUeXBlLFxuXHRQcm9wZXJ0eUFubm90YXRpb25WYWx1ZSxcblx0SWZBbm5vdGF0aW9uRXhwcmVzc2lvblZhbHVlLFxuXHRJZkFubm90YXRpb25FeHByZXNzaW9uLFxuXHRDb25kaXRpb25hbENoZWNrT3JWYWx1ZSxcblx0UGF0aENvbmRpdGlvbkV4cHJlc3Npb24sXG5cdE9yQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRBbmRDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdE5vdENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0RXFDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdE5lQ29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRHdENvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0R2VDb25kaXRpb25hbEV4cHJlc3Npb24sXG5cdEx0Q29uZGl0aW9uYWxFeHByZXNzaW9uLFxuXHRMZUNvbmRpdGlvbmFsRXhwcmVzc2lvbixcblx0RW50aXR5VHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEFwcGx5QW5ub3RhdGlvbkV4cHJlc3Npb24sIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy90eXBlcy9FZG1cIjtcblxudHlwZSBCaW5kaW5nUHJpbWl0aXZlVHlwZSA9IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBvYmplY3Q7XG50eXBlIEJpbmRpbmdQYXJ0QmFzZTxUYXJnZXRUeXBlPiA9IHtcblx0X3R5cGU6IHN0cmluZztcbn07XG5cbi8qKlxuICogQHR5cGVkZWYgQmluZGluZ1BhcnRDb25zdGFudFxuICovXG50eXBlIEJpbmRpbmdQYXJ0Q29uc3RhbnQ8VGFyZ2V0VHlwZT4gPSBCaW5kaW5nUGFydEJhc2U8VGFyZ2V0VHlwZT4gJiB7XG5cdF90eXBlOiBcIkNvbnN0YW50XCI7XG5cdHZhbHVlOiBUYXJnZXRUeXBlIHwgbnVsbDtcbn07XG5cbnR5cGUgQmluZGluZ1BhcnRBbmQgPSBCaW5kaW5nUGFydEJhc2U8Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIkFuZFwiO1xuXHRleHByZXNzaW9uczogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+W107XG59O1xuXG50eXBlIEJpbmRpbmdQYXJ0T3IgPSBCaW5kaW5nUGFydEJhc2U8Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIk9yXCI7XG5cdGV4cHJlc3Npb25zOiBQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj5bXTtcbn07XG5cbnR5cGUgQmluZGluZ1BhcnROb3QgPSBCaW5kaW5nUGFydEJhc2U8Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIk5vdFwiO1xuXHRleHByZXNzaW9uOiBQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj47XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIEJpbmRpbmdQYXJ0QmluZGluZ0V4cHJlc3Npb25cbiAqL1xudHlwZSBCaW5kaW5nUGFydEJpbmRpbmdFeHByZXNzaW9uPFRhcmdldFR5cGU+ID0gQmluZGluZ1BhcnRCYXNlPFRhcmdldFR5cGU+ICYge1xuXHRfdHlwZTogXCJCaW5kaW5nXCI7XG5cdG1vZGVsTmFtZT86IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xufTtcblxudHlwZSBCaW5kaW5nUGFydERlZmF1bHRCaW5kaW5nRXhwcmVzc2lvbjxUYXJnZXRUeXBlPiA9IEJpbmRpbmdQYXJ0QmFzZTxUYXJnZXRUeXBlPiAmIHtcblx0X3R5cGU6IFwiRGVmYXVsdEJpbmRpbmdcIjtcblx0bW9kZWxOYW1lPzogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEB0eXBlZGVmIE9QRVJBVE9SX1NUUklOR1xuICovXG50eXBlIE9QRVJBVE9SX1NUUklORyA9IFwiPT09XCIgfCBcIiE9PVwiIHwgXCI+PVwiIHwgXCI+XCIgfCBcIjw9XCIgfCBcIjxcIjtcbnR5cGUgQmluZGluZ1BhcnRDb21wYXJpc29uID0gQmluZGluZ1BhcnRCYXNlPGJvb2xlYW4+ICYge1xuXHRfdHlwZTogXCJDb21wYXJpc29uXCI7XG5cdG9wZXJhdG9yOiBPUEVSQVRPUl9TVFJJTkc7XG5cdGxlZnRWYWw6IFB1cmVCaW5kaW5nUGFydDxhbnk+O1xuXHRyaWdodFZhbDogUHVyZUJpbmRpbmdQYXJ0PGFueT47XG59O1xuXG50eXBlIEJpbmRpbmdQYXJ0SWZFbHNlPFRhcmdldFR5cGUgZXh0ZW5kcyBCaW5kaW5nUHJpbWl0aXZlVHlwZT4gPSBCaW5kaW5nUGFydEJhc2U8Ym9vbGVhbj4gJiB7XG5cdF90eXBlOiBcIklmRWxzZVwiO1xuXHRjb25kaXRpb246IFB1cmVCaW5kaW5nUGFydDxib29sZWFuPjtcblx0b25UcnVlOiBQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT47XG5cdG9uRmFsc2U6IFB1cmVCaW5kaW5nUGFydDxUYXJnZXRUeXBlPjtcbn07XG5cbnR5cGUgQmluZGluZ1BhcnRGb3JtYXRSZXN1bHQ8VGFyZ2V0VHlwZSBleHRlbmRzIEJpbmRpbmdQcmltaXRpdmVUeXBlPiA9IEJpbmRpbmdQYXJ0QmFzZTxUYXJnZXRUeXBlPiAmIHtcblx0X3R5cGU6IFwiRm9ybWF0UmVzdWx0XCI7XG5cdGZvcm1hdHRlcjogc3RyaW5nO1xuXHRwYXJhbWV0ZXJzOiBQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT5bXTtcbn07XG5cbi8qKlxuICogQHRlbXBsYXRlIFRhcmdldFR5cGVcbiAqIEB0eXBlZGVmIHtQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT59IFB1cmVCaW5kaW5nUGFydFxuICovXG5leHBvcnQgdHlwZSBQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZSBleHRlbmRzIEJpbmRpbmdQcmltaXRpdmVUeXBlPiA9XG5cdHwgQmluZGluZ1BhcnRDb25zdGFudDxUYXJnZXRUeXBlPlxuXHR8IEJpbmRpbmdQYXJ0QW5kXG5cdHwgQmluZGluZ1BhcnRPclxuXHR8IEJpbmRpbmdQYXJ0Tm90XG5cdHwgQmluZGluZ1BhcnRCaW5kaW5nRXhwcmVzc2lvbjxUYXJnZXRUeXBlPlxuXHR8IEJpbmRpbmdQYXJ0RGVmYXVsdEJpbmRpbmdFeHByZXNzaW9uPFRhcmdldFR5cGU+XG5cdHwgQmluZGluZ1BhcnRDb21wYXJpc29uXG5cdHwgQmluZGluZ1BhcnRJZkVsc2U8VGFyZ2V0VHlwZT5cblx0fCBCaW5kaW5nUGFydEZvcm1hdFJlc3VsdDxUYXJnZXRUeXBlPjtcblxuLyoqXG4gKiBAdGVtcGxhdGUgVGFyZ2V0VHlwZVxuICogQHR5cGVkZWYge0JpbmRpbmdQYXJ0PFRhcmdldFR5cGU+fSBCaW5kaW5nUGFydFxuICovXG5leHBvcnQgdHlwZSBCaW5kaW5nUGFydDxUYXJnZXRUeXBlIGV4dGVuZHMgQmluZGluZ1ByaW1pdGl2ZVR5cGU+ID0gUHVyZUJpbmRpbmdQYXJ0PFRhcmdldFR5cGU+IHwgVGFyZ2V0VHlwZTtcblxuLyoqXG4gKiBMb2dpY2FsIGBhbmRgIG9wZXJhdG9yLlxuICogSWYgYXQgbGVhc3Qgb25lIHBhcmFtZXRlciBpcyBhIGNvbnN0YW50IGBmYWxzZWAgdGhpcyBpcyBzaW1wbGlmaWVkIGFzIGZhbHNlLlxuICpcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8Ym9vbGVhbj5bXX0gaW5FeHByZXNzaW9ucyBhbiBhcnJheSBvZiBleHByZXNzaW9uIHRoYXQgc2hvdWxkIGJlIGV2YWx1YXRlZCB3aXRoIGBhbmRgIG9wZXJhdG9yc1xuICogQHJldHVybnMge1B1cmVCaW5kaW5nUGFydDxib29sZWFuPn0gdGhlIHJlc3VsdGluZyBCaW5kaW5nUGFydCB0aGF0IGV2YWx1YXRlcyB0byBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmQoLi4uaW5FeHByZXNzaW9uczogQmluZGluZ1BhcnQ8Ym9vbGVhbj5bXSk6IFB1cmVCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdGNvbnN0IGV4cHJlc3Npb25zID0gaW5FeHByZXNzaW9ucy5tYXAod3JhcFByaW1pdGl2ZSk7XG5cdGxldCBpc1N0YXRpY0ZhbHNlOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0IG5vblRyaXZpYWxFeHByZXNzaW9uID0gZXhwcmVzc2lvbnMuZmlsdGVyKGV4cHJlc3Npb24gPT4ge1xuXHRcdGlmIChpc0NvbnN0YW50KGV4cHJlc3Npb24pICYmICFleHByZXNzaW9uLnZhbHVlKSB7XG5cdFx0XHRpc1N0YXRpY0ZhbHNlID0gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuICFpc0NvbnN0YW50KGV4cHJlc3Npb24pO1xuXHR9KTtcblx0aWYgKGlzU3RhdGljRmFsc2UpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoZmFsc2UpO1xuXHR9IGVsc2UgaWYgKG5vblRyaXZpYWxFeHByZXNzaW9uLmxlbmd0aCA9PT0gMCkge1xuXHRcdC8vIFJlc29sdmUgdGhlIGNvbnN0YW50IHRoZW5cblx0XHRjb25zdCBpc1ZhbGlkID0gZXhwcmVzc2lvbnMucmVkdWNlKChpc1ZhbGlkLCBleHByZXNzaW9uKSA9PiB7XG5cdFx0XHRyZXR1cm4gaXNWYWxpZCAmJiBpc0NvbnN0YW50KGV4cHJlc3Npb24pICYmICEhZXhwcmVzc2lvbi52YWx1ZTtcblx0XHR9LCB0cnVlKTtcblx0XHRyZXR1cm4gY29uc3RhbnQoaXNWYWxpZCk7XG5cdH0gZWxzZSBpZiAobm9uVHJpdmlhbEV4cHJlc3Npb24ubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIG5vblRyaXZpYWxFeHByZXNzaW9uWzBdO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJBbmRcIixcblx0XHRcdGV4cHJlc3Npb25zOiBub25Ucml2aWFsRXhwcmVzc2lvblxuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBMb2dpY2FsIGBvcmAgb3BlcmF0b3IuXG4gKiBJZiBhdCBsZWFzdCBvbmUgcGFyYW1ldGVyIGlzIGEgY29uc3RhbnQgYHRydWVgIHRoaXMgaXMgc2ltcGxpZmllZCBhcyB0cnVlLlxuICpcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8Ym9vbGVhbj5bXX0gaW5FeHByZXNzaW9ucyBhbiBhcnJheSBvZiBleHByZXNzaW9uIHRoYXQgc2hvdWxkIGJlIGV2YWx1YXRlZCB3aXRoIGBvcmAgb3BlcmF0b3JzXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+fSB0aGUgcmVzdWx0aW5nIEJpbmRpbmdQYXJ0IHRoYXQgZXZhbHVhdGVzIHRvIGJvb2xlYW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9yKC4uLmluRXhwcmVzc2lvbnM6IEJpbmRpbmdQYXJ0PGJvb2xlYW4+W10pOiBQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj4ge1xuXHRjb25zdCBleHByZXNzaW9ucyA9IGluRXhwcmVzc2lvbnMubWFwKHdyYXBQcmltaXRpdmUpO1xuXHRsZXQgaXNTdGF0aWNUcnVlOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0IG5vblRyaXZpYWxFeHByZXNzaW9uID0gZXhwcmVzc2lvbnMuZmlsdGVyKGV4cHJlc3Npb24gPT4ge1xuXHRcdGlmIChpc0NvbnN0YW50KGV4cHJlc3Npb24pICYmIGV4cHJlc3Npb24udmFsdWUpIHtcblx0XHRcdGlzU3RhdGljVHJ1ZSA9IHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiAhaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBleHByZXNzaW9uLnZhbHVlO1xuXHR9KTtcblx0aWYgKGlzU3RhdGljVHJ1ZSkge1xuXHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0fSBlbHNlIGlmIChub25Ucml2aWFsRXhwcmVzc2lvbi5sZW5ndGggPT09IDApIHtcblx0XHQvLyBSZXNvbHZlIHRoZSBjb25zdGFudCB0aGVuXG5cdFx0Y29uc3QgaXNWYWxpZCA9IGV4cHJlc3Npb25zLnJlZHVjZSgoaXNWYWxpZCwgZXhwcmVzc2lvbikgPT4ge1xuXHRcdFx0cmV0dXJuIGlzVmFsaWQgJiYgaXNDb25zdGFudChleHByZXNzaW9uKSAmJiAhIWV4cHJlc3Npb24udmFsdWU7XG5cdFx0fSwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGNvbnN0YW50KGlzVmFsaWQpO1xuXHR9IGVsc2UgaWYgKG5vblRyaXZpYWxFeHByZXNzaW9uLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBub25Ucml2aWFsRXhwcmVzc2lvblswXTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0X3R5cGU6IFwiT3JcIixcblx0XHRcdGV4cHJlc3Npb25zOiBub25Ucml2aWFsRXhwcmVzc2lvblxuXHRcdH07XG5cdH1cbn1cblxuLyoqXG4gKiBMb2dpY2FsIGBub3RgIG9wZXJhdG9yLlxuICpcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8Ym9vbGVhbj59IGV4cHJlc3Npb24gdGhlIGV4cHJlc3Npb24gdG8gcmV2ZXJzZVxuICogQHJldHVybnMge1B1cmVCaW5kaW5nUGFydDxib29sZWFuPn0gdGhlIHJlc3VsdGluZyBCaW5kaW5nUGFydCB0aGF0IGV2YWx1YXRlcyB0byBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3QoZXhwcmVzc2lvbjogQmluZGluZ1BhcnQ8Ym9vbGVhbj4pOiBQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj4ge1xuXHRpZiAoaXNDb25zdGFudChleHByZXNzaW9uKSkge1xuXHRcdHJldHVybiBjb25zdGFudCghZXhwcmVzc2lvbi52YWx1ZSk7XG5cdH0gZWxzZSBpZiAoXG5cdFx0dHlwZW9mIGV4cHJlc3Npb24gPT09IFwib2JqZWN0XCIgJiZcblx0XHRleHByZXNzaW9uLl90eXBlID09PSBcIk9yXCIgJiZcblx0XHRleHByZXNzaW9uLmV4cHJlc3Npb25zLmV2ZXJ5KGV4cHJlc3Npb24gPT4gaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBpc0NvbXBhcmlzb24oZXhwcmVzc2lvbikpXG5cdCkge1xuXHRcdHJldHVybiBhbmQoLi4uZXhwcmVzc2lvbi5leHByZXNzaW9ucy5tYXAoZXhwcmVzc2lvbiA9PiBub3QoZXhwcmVzc2lvbikpKTtcblx0fSBlbHNlIGlmIChcblx0XHR0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJvYmplY3RcIiAmJlxuXHRcdGV4cHJlc3Npb24uX3R5cGUgPT09IFwiQW5kXCIgJiZcblx0XHRleHByZXNzaW9uLmV4cHJlc3Npb25zLmV2ZXJ5KGV4cHJlc3Npb24gPT4gaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBpc0NvbXBhcmlzb24oZXhwcmVzc2lvbikpXG5cdCkge1xuXHRcdHJldHVybiBvciguLi5leHByZXNzaW9uLmV4cHJlc3Npb25zLm1hcChleHByZXNzaW9uID0+IG5vdChleHByZXNzaW9uKSkpO1xuXHR9IGVsc2UgaWYgKGlzQ29tcGFyaXNvbihleHByZXNzaW9uKSkge1xuXHRcdC8vIENyZWF0ZSB0aGUgcmV2ZXJzZSBjb21wYXJpc29uXG5cdFx0c3dpdGNoIChleHByZXNzaW9uLm9wZXJhdG9yKSB7XG5cdFx0XHRjYXNlIFwiIT09XCI6XG5cdFx0XHRcdHJldHVybiBlcXVhbHMoZXhwcmVzc2lvbi5sZWZ0VmFsLCBleHByZXNzaW9uLnJpZ2h0VmFsKTtcblx0XHRcdGNhc2UgXCI8XCI6XG5cdFx0XHRcdHJldHVybiBncmVhdGVyT3JFcXVhbHMoZXhwcmVzc2lvbi5sZWZ0VmFsLCBleHByZXNzaW9uLnJpZ2h0VmFsKTtcblx0XHRcdGNhc2UgXCI8PVwiOlxuXHRcdFx0XHRyZXR1cm4gZ3JlYXRlclRoYW4oZXhwcmVzc2lvbi5sZWZ0VmFsLCBleHByZXNzaW9uLnJpZ2h0VmFsKTtcblx0XHRcdGNhc2UgXCI9PT1cIjpcblx0XHRcdFx0cmV0dXJuIG5vdEVxdWFscyhleHByZXNzaW9uLmxlZnRWYWwsIGV4cHJlc3Npb24ucmlnaHRWYWwpO1xuXHRcdFx0Y2FzZSBcIj5cIjpcblx0XHRcdFx0cmV0dXJuIGxvd2VyT3JFcXVhbHMoZXhwcmVzc2lvbi5sZWZ0VmFsLCBleHByZXNzaW9uLnJpZ2h0VmFsKTtcblx0XHRcdGNhc2UgXCI+PVwiOlxuXHRcdFx0XHRyZXR1cm4gbG93ZXJUaGFuKGV4cHJlc3Npb24ubGVmdFZhbCwgZXhwcmVzc2lvbi5yaWdodFZhbCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRfdHlwZTogXCJOb3RcIixcblx0XHRcdGV4cHJlc3Npb246IHdyYXBQcmltaXRpdmUoZXhwcmVzc2lvbilcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIGJ5IHRoZSBjb3JyZXNwb25kaW5nIG1vZGVsLlxuICpcbiAqIEB0ZW1wbGF0ZSBUYXJnZXRUeXBlXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCB0aGUgcGF0aCBvbiB0aGUgbW9kZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbW9kZWxOYW1lXSB0aGUgbmFtZSBvZiB0aGUgbW9kZWxcbiAqIEByZXR1cm5zIHtCaW5kaW5nUGFydEJpbmRpbmdFeHByZXNzaW9uPFRhcmdldFR5cGU+fSB0aGUgZGVmYXVsdCBiaW5kaW5nIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRpbmdFeHByZXNzaW9uPFRhcmdldFR5cGUgZXh0ZW5kcyBCaW5kaW5nUHJpbWl0aXZlVHlwZT4oXG5cdHBhdGg6IHN0cmluZyxcblx0bW9kZWxOYW1lPzogc3RyaW5nXG4pOiBCaW5kaW5nUGFydEJpbmRpbmdFeHByZXNzaW9uPFRhcmdldFR5cGU+IHtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJCaW5kaW5nXCIsXG5cdFx0bW9kZWxOYW1lOiBtb2RlbE5hbWUsXG5cdFx0cGF0aDogcGF0aFxuXHR9O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBjb25zdGFudCBiaW5kaW5nIGJhc2VkIG9uIGEgcHJpbWl0aXZlIHZhbHVlLlxuICpcbiAqIEB0ZW1wbGF0ZSBDb25zdGFudFR5cGVcbiAqIEBwYXJhbSB7KG51bGwgfENvbnN0YW50VHlwZSl9IGNvbnN0YW50VmFsdWUgdGhlIGNvbnN0YW50IHRvIHdyYXAgaW4gYSBCaW5kaW5nUGFydFxuICogQHJldHVybnMge0JpbmRpbmdQYXJ0Q29uc3RhbnQ8Q29uc3RhbnRUeXBlPn0gdGhlIGNvbnN0YW50IGJpbmRpbmcgcGFydFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uc3RhbnQ8Q29uc3RhbnRUeXBlIGV4dGVuZHMgQmluZGluZ1ByaW1pdGl2ZVR5cGU+KGNvbnN0YW50VmFsdWU6IG51bGwgfCBDb25zdGFudFR5cGUpOiBCaW5kaW5nUGFydENvbnN0YW50PENvbnN0YW50VHlwZT4ge1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkNvbnN0YW50XCIsXG5cdFx0dmFsdWU6IGNvbnN0YW50VmFsdWVcblx0fTtcbn1cblxuLyoqXG4gKiBXcmFwIGEgcHJpbWl0aXZlIGludG8gYSBjb25zdGFudCBpZiBpdCdzIG5vdCBhbHJlYWR5IGEgYmluZGluZyBwYXJ0LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge251bGwgfCBUIHwgQmluZGluZ1BhcnQ8VD59IHNvbWV0aGluZyB0aGUgb2JqZWN0IHRvIHdyYXAgaW4gYSBDb25zdGFudCBiaW5kaW5nIHBhcnRcbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8VD59IGVpdGhlciB0aGUgb3JpZ2luYWwgb2JqZWN0IG9yIHRoZSB3cmFwcGVkIG9uZSBkZXBlbmRpbmcgb24gdGhlIGNhc2VcbiAqL1xuZnVuY3Rpb24gd3JhcFByaW1pdGl2ZTxUIGV4dGVuZHMgQmluZGluZ1ByaW1pdGl2ZVR5cGU+KHNvbWV0aGluZzogbnVsbCB8IFQgfCBCaW5kaW5nUGFydDxUPik6IFB1cmVCaW5kaW5nUGFydDxUPiB7XG5cdGlmIChzb21ldGhpbmcgPT09IG51bGwgfHwgdHlwZW9mIHNvbWV0aGluZyAhPT0gXCJvYmplY3RcIikge1xuXHRcdHJldHVybiBjb25zdGFudChzb21ldGhpbmcpO1xuXHR9XG5cdHJldHVybiBzb21ldGhpbmcgYXMgUHVyZUJpbmRpbmdQYXJ0PFQ+O1xufVxuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBiaW5kaW5nIHBhcnQgcHJvdmlkZWQgaXMgYSBjb25zdGFudCBvciBub3QuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8VD59IG1heWJlQ29uc3RhbnQgdGhlIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgd2UncmUgZGVhbGluZyB3aXRoIGEgQmluZGluZ1BhcnRDb25zdGFudFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdGFudDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obWF5YmVDb25zdGFudDogQmluZGluZ1BhcnQ8VD4pOiBtYXliZUNvbnN0YW50IGlzIEJpbmRpbmdQYXJ0Q29uc3RhbnQ8VD4ge1xuXHRyZXR1cm4gdHlwZW9mIG1heWJlQ29uc3RhbnQgIT09IFwib2JqZWN0XCIgfHwgKG1heWJlQ29uc3RhbnQgYXMgQmluZGluZ1BhcnRCYXNlPFQ+KT8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIjtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgYmluZGluZyBwYXJ0IHByb3ZpZGVkIGlzIGEgcHVyZSBiaW5kaW5nIHBhcnQgb2Ygbm90LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PFQ+fSBtYXliZUNvbnN0YW50IHRoZSBiaW5kaW5nIHBhcnQgdG8gZXZhbHVhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHdlJ3JlIGRlYWxpbmcgd2l0aCBhIFB1cmVCaW5kaW5nUGFydFxuICovXG5mdW5jdGlvbiBpc1B1cmVCaW5kaW5nUGFydDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obWF5YmVDb25zdGFudDogQmluZGluZ1BhcnQ8VD4pOiBtYXliZUNvbnN0YW50IGlzIFB1cmVCaW5kaW5nUGFydDxUPiB7XG5cdHJldHVybiB0eXBlb2YgbWF5YmVDb25zdGFudCA9PT0gXCJvYmplY3RcIiAmJiAobWF5YmVDb25zdGFudCBhcyBQdXJlQmluZGluZ1BhcnQ8VD4pPy5fdHlwZSAhPT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjb25zdGFudHNBcmVFcXVhbDxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obGVmdE1heWJlQ29uc3RhbnQ6IEJpbmRpbmdQYXJ0PFQ+LCByaWdodE1heWJlQ29uc3RhbnQ6IEJpbmRpbmdQYXJ0PFQ+KTogYm9vbGVhbiB7XG5cdHJldHVybiBpc0NvbnN0YW50KGxlZnRNYXliZUNvbnN0YW50KSAmJiBpc0NvbnN0YW50KHJpZ2h0TWF5YmVDb25zdGFudCkgJiYgbGVmdE1heWJlQ29uc3RhbnQudmFsdWUgPT09IHJpZ2h0TWF5YmVDb25zdGFudC52YWx1ZTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgYmluZGluZyBwYXJ0IHByb3ZpZGVkIGlzIGEgY29tcGFyaXNvbiBvciBub3QuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8VD59IG1heWJlQ29uc3RhbnQgdGhlIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgd2UncmUgZGVhbGluZyB3aXRoIGEgQmluZGluZ1BhcnRDb21wYXJpc29uXG4gKi9cbmZ1bmN0aW9uIGlzQ29tcGFyaXNvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obWF5YmVDb25zdGFudDogQmluZGluZ1BhcnQ8VD4pOiBtYXliZUNvbnN0YW50IGlzIEJpbmRpbmdQYXJ0Q29tcGFyaXNvbiB7XG5cdHJldHVybiAobWF5YmVDb25zdGFudCBhcyBCaW5kaW5nUGFydEJhc2U8VD4pPy5fdHlwZSA9PT0gXCJDb21wYXJpc29uXCI7XG59XG5cbnR5cGUgQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uPFA+ID0gUGF0aEFubm90YXRpb25FeHByZXNzaW9uPFA+IHwgQXBwbHlBbm5vdGF0aW9uRXhwcmVzc2lvbjxQPiB8IElmQW5ub3RhdGlvbkV4cHJlc3Npb248UD47XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHBhc3NlZCBhbm5vdGF0aW9uIGV4cHJlc3Npb24gaXMgYSBDb21wbGV4QW5ub3RhdGlvbkV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7UHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8VD59IGFubm90YXRpb25FeHByZXNzaW9uIHRoZSBhbm5vdGF0aW9uIGV4cHJlc3Npb24gdG8gZXZhbHVhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBvYmplY3QgaXMgYSB7Q29tcGxleEFubnRvdGF0aW9uRXhwcmVzc2lvbn1cbiAqL1xuZnVuY3Rpb24gaXNDb21wbGV4QW5ub3RhdGlvbkV4cHJlc3Npb248VD4oXG5cdGFubm90YXRpb25FeHByZXNzaW9uOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxUPlxuKTogYW5ub3RhdGlvbkV4cHJlc3Npb24gaXMgQ29tcGxleEFubm90YXRpb25FeHByZXNzaW9uPFQ+IHtcblx0cmV0dXJuIHR5cGVvZiBhbm5vdGF0aW9uRXhwcmVzc2lvbiA9PT0gXCJvYmplY3RcIjtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgY29ycmVzcG9uZGluZyBiaW5kaW5ncGFydCBmb3IgYSBnaXZlbiBhbm5vdGF0aW9uIGV4cHJlc3Npb24uXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7UHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8VD59IGFubm90YXRpb25FeHByZXNzaW9uIHRoZSBzb3VyY2UgYW5ub3RhdGlvbiBleHByZXNzaW9uXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PFQ+fSB0aGUgYmluZGluZyBwYXJ0IGVxdWl2YWxlbnQgdG8gdGhhdCBhbm5vdGF0aW9uIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25FeHByZXNzaW9uPFQgZXh0ZW5kcyBCaW5kaW5nUHJpbWl0aXZlVHlwZT4oYW5ub3RhdGlvbkV4cHJlc3Npb246IFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFQ+KTogUHVyZUJpbmRpbmdQYXJ0PFQ+IHtcblx0aWYgKCFpc0NvbXBsZXhBbm5vdGF0aW9uRXhwcmVzc2lvbihhbm5vdGF0aW9uRXhwcmVzc2lvbikpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoYW5ub3RhdGlvbkV4cHJlc3Npb24pO1xuXHR9IGVsc2Uge1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvbkV4cHJlc3Npb24udHlwZSkge1xuXHRcdFx0Y2FzZSBcIlBhdGhcIjpcblx0XHRcdFx0cmV0dXJuIGJpbmRpbmdFeHByZXNzaW9uKGFubm90YXRpb25FeHByZXNzaW9uLnBhdGgpO1xuXHRcdFx0Y2FzZSBcIklmXCI6XG5cdFx0XHRcdHJldHVybiBhbm5vdGF0aW9uSWZFeHByZXNzaW9uKGFubm90YXRpb25FeHByZXNzaW9uLklmKTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBjb25zdGFudChhbm5vdGF0aW9uRXhwcmVzc2lvbi52YWx1ZSk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGFubm90YXRpb24gY29uZGl0aW9uIGludG8gYSBQdXJlQmluZGluZ1BhcnQuXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7Q29uZGl0aW9uYWxDaGVja09yVmFsdWV9IGFubm90YXRpb25WYWx1ZSB0aGUgY29uZGl0aW9uIG9yIHZhbHVlIGZyb20gdGhlIGFubm90YXRpb25cbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8VD59IGFuIGVxdWl2YWxlbnQgYXMgUHVyZUJpbmRpbmdQYXJ0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbjxUIGV4dGVuZHMgQmluZGluZ1ByaW1pdGl2ZVR5cGU+KGFubm90YXRpb25WYWx1ZTogQ29uZGl0aW9uYWxDaGVja09yVmFsdWUpOiBQdXJlQmluZGluZ1BhcnQ8VD4ge1xuXHRpZiAoYW5ub3RhdGlvblZhbHVlID09PSBudWxsIHx8IHR5cGVvZiBhbm5vdGF0aW9uVmFsdWUgIT09IFwib2JqZWN0XCIpIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoYW5ub3RhdGlvblZhbHVlIGFzIFQpO1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRPclwiKSkge1xuXHRcdHJldHVybiBvcihcblx0XHRcdC4uLigoKGFubm90YXRpb25WYWx1ZSBhcyBPckNvbmRpdGlvbmFsRXhwcmVzc2lvbikuJE9yLm1hcChwYXJzZUFubm90YXRpb25Db25kaXRpb24pIGFzIHVua25vd24pIGFzIEJpbmRpbmdQYXJ0PGJvb2xlYW4+W10pXG5cdFx0KSBhcyBQdXJlQmluZGluZ1BhcnQ8VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEFuZFwiKSkge1xuXHRcdHJldHVybiBhbmQoXG5cdFx0XHQuLi4oKChhbm5vdGF0aW9uVmFsdWUgYXMgQW5kQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kQW5kLm1hcChwYXJzZUFubm90YXRpb25Db25kaXRpb24pIGFzIHVua25vd24pIGFzIEJpbmRpbmdQYXJ0PGJvb2xlYW4+W10pXG5cdFx0KSBhcyBQdXJlQmluZGluZ1BhcnQ8VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdHJldHVybiBub3QocGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTm90Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTm90WzBdKSkgYXMgUHVyZUJpbmRpbmdQYXJ0PFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdHJldHVybiBlcXVhbHMoXG5cdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oKGFubm90YXRpb25WYWx1ZSBhcyBFcUNvbmRpdGlvbmFsRXhwcmVzc2lvbikuJEVxWzBdKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEVxQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kRXFbMV0pXG5cdFx0KSBhcyBQdXJlQmluZGluZ1BhcnQ8VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJE5lXCIpKSB7XG5cdFx0cmV0dXJuIG5vdEVxdWFscyhcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIE5lQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kTmVbMF0pLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTmVDb25kaXRpb25hbEV4cHJlc3Npb24pLiROZVsxXSlcblx0XHQpIGFzIFB1cmVCaW5kaW5nUGFydDxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkR3RcIikpIHtcblx0XHRyZXR1cm4gZ3JlYXRlclRoYW4oXG5cdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oKGFubm90YXRpb25WYWx1ZSBhcyBHdENvbmRpdGlvbmFsRXhwcmVzc2lvbikuJEd0WzBdKSxcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEd0Q29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR3RbMV0pXG5cdFx0KSBhcyBQdXJlQmluZGluZ1BhcnQ8VD47XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvblZhbHVlLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0cmV0dXJuIGdyZWF0ZXJPckVxdWFscyhcblx0XHRcdHBhcnNlQW5ub3RhdGlvbkNvbmRpdGlvbigoYW5ub3RhdGlvblZhbHVlIGFzIEdlQ29uZGl0aW9uYWxFeHByZXNzaW9uKS4kR2VbMF0pLFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgR2VDb25kaXRpb25hbEV4cHJlc3Npb24pLiRHZVsxXSlcblx0XHQpIGFzIFB1cmVCaW5kaW5nUGFydDxUPjtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uVmFsdWUuaGFzT3duUHJvcGVydHkoXCIkTHRcIikpIHtcblx0XHRyZXR1cm4gbG93ZXJUaGFuKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTHRDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMdFswXSksXG5cdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oKGFubm90YXRpb25WYWx1ZSBhcyBMdENvbmRpdGlvbmFsRXhwcmVzc2lvbikuJEx0WzFdKVxuXHRcdCkgYXMgUHVyZUJpbmRpbmdQYXJ0PFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRMZVwiKSkge1xuXHRcdHJldHVybiBsb3dlck9yRXF1YWxzKFxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgTGVDb25kaXRpb25hbEV4cHJlc3Npb24pLiRMZVswXSksXG5cdFx0XHRwYXJzZUFubm90YXRpb25Db25kaXRpb24oKGFubm90YXRpb25WYWx1ZSBhcyBMZUNvbmRpdGlvbmFsRXhwcmVzc2lvbikuJExlWzFdKVxuXHRcdCkgYXMgUHVyZUJpbmRpbmdQYXJ0PFQ+O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25WYWx1ZS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0cmV0dXJuIGJpbmRpbmdFeHByZXNzaW9uKChhbm5vdGF0aW9uVmFsdWUgYXMgUGF0aENvbmRpdGlvbkV4cHJlc3Npb248VD4pLiRQYXRoKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gY29uc3RhbnQoZmFsc2UgYXMgVCk7XG5cdH1cbn1cblxuLyoqXG4gKiBQcm9jZXNzIHRoZSB7SWZBbm5vdGF0aW9uRXhwcmVzc2lvblZhbHVlfSBpbnRvIGEgUHVyZUJpbmRpbmdQYXJ0LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge0lmQW5ub3RhdGlvbkV4cHJlc3Npb25WYWx1ZTxUPn0gYW5ub3RhdGlvbklmRXhwcmVzc2lvbiBhbiBJZiBleHByZXNzaW9uIHJldHVybmluZyB0aGUgdHlwZSBUXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PFQ+fSB0aGUgZXF1aXZhbGVudCBwdXJlIGJpbmRpbmcgcGFydFxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5ub3RhdGlvbklmRXhwcmVzc2lvbjxUIGV4dGVuZHMgQmluZGluZ1ByaW1pdGl2ZVR5cGU+KFxuXHRhbm5vdGF0aW9uSWZFeHByZXNzaW9uOiBJZkFubm90YXRpb25FeHByZXNzaW9uVmFsdWU8VD5cbik6IFB1cmVCaW5kaW5nUGFydDxUPiB7XG5cdHJldHVybiBpZkVsc2UocGFyc2VBbm5vdGF0aW9uQ29uZGl0aW9uKGFubm90YXRpb25JZkV4cHJlc3Npb25bMF0pLCBhbm5vdGF0aW9uSWZFeHByZXNzaW9uWzFdLCBhbm5vdGF0aW9uSWZFeHByZXNzaW9uWzJdKTtcbn1cblxuLyoqXG4gKiBHZW5lcmljIGhlbHBlciBmb3IgdGhlIGNvbXBhcmlzb24gb3BlcmF0aW9uIChlcXVhbHMsIG5vdEVxdWFscyAuLi4uKS5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtPUEVSQVRPUl9TVFJJTkd9IG9wZXJhdG9yIHRoZSBvcGVyYXRvciB0byBjb25zaWRlclxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gbGVmdFZhbCB0aGUgdmFsdWUgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gcmlnaHRWYWwgdGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+fSBhIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZSB0aGUgcmVzdWx0aW5nIHR5cGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqL1xuZnVuY3Rpb24gY29tcGFyaXNvbjxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4oXG5cdG9wZXJhdG9yOiBPUEVSQVRPUl9TVFJJTkcsXG5cdGxlZnRWYWw6IEJpbmRpbmdQYXJ0PFQ+LFxuXHRyaWdodFZhbDogQmluZGluZ1BhcnQ8VD5cbik6IFB1cmVCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdGxlZnRWYWwgPSB3cmFwUHJpbWl0aXZlKGxlZnRWYWwpO1xuXHRyaWdodFZhbCA9IHdyYXBQcmltaXRpdmUocmlnaHRWYWwpO1xuXHRpZiAoaXNDb25zdGFudChsZWZ0VmFsKSAmJiBsZWZ0VmFsLnZhbHVlICE9PSBudWxsICYmIGlzQ29uc3RhbnQocmlnaHRWYWwpICYmIHJpZ2h0VmFsLnZhbHVlICE9PSBudWxsKSB7XG5cdFx0c3dpdGNoIChvcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIiE9PVwiOlxuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQobGVmdFZhbC52YWx1ZSAhPT0gcmlnaHRWYWwudmFsdWUpO1xuXHRcdFx0Y2FzZSBcIjxcIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRWYWwudmFsdWUgPCByaWdodFZhbC52YWx1ZSk7XG5cdFx0XHRjYXNlIFwiPD1cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRWYWwudmFsdWUgPD0gcmlnaHRWYWwudmFsdWUpO1xuXHRcdFx0Y2FzZSBcIj5cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRWYWwudmFsdWUgPiByaWdodFZhbC52YWx1ZSk7XG5cdFx0XHRjYXNlIFwiPj1cIjpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRWYWwudmFsdWUgPj0gcmlnaHRWYWwudmFsdWUpO1xuXHRcdFx0Y2FzZSBcIj09PVwiOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIGNvbnN0YW50KGxlZnRWYWwudmFsdWUgPT09IHJpZ2h0VmFsLnZhbHVlKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdF90eXBlOiBcIkNvbXBhcmlzb25cIixcblx0XHRcdG9wZXJhdG9yOiBvcGVyYXRvcixcblx0XHRcdGxlZnRWYWw6IGxlZnRWYWwsXG5cdFx0XHRyaWdodFZhbDogcmlnaHRWYWxcblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogRXF1YWxzIGNvbXBhcmlzb24gPT09LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PFQ+fSBsZWZ0VmFsIHRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PFQ+fSByaWdodFZhbCB0aGUgdmFsdWUgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj59IGEgYmluZGluZyBwYXJ0IHRvIGV2YWx1YXRlIHRoZSByZXN1bHRpbmcgdHlwZSBvZiB0aGUgY29tcGFyaXNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihsZWZ0VmFsOiBCaW5kaW5nUGFydDxUPiwgcmlnaHRWYWw6IEJpbmRpbmdQYXJ0PFQ+KTogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0aWYgKGlzUHVyZUJpbmRpbmdQYXJ0KGxlZnRWYWwpICYmIGxlZnRWYWwuX3R5cGUgPT09IFwiSWZFbHNlXCIgJiYgY29uc3RhbnRzQXJlRXF1YWwobGVmdFZhbC5vblRydWUsIHdyYXBQcmltaXRpdmUocmlnaHRWYWwpKSkge1xuXHRcdHJldHVybiBsZWZ0VmFsLmNvbmRpdGlvbjtcblx0fVxuXHRyZXR1cm4gY29tcGFyaXNvbihcIj09PVwiLCBsZWZ0VmFsLCByaWdodFZhbCk7XG59XG5cbi8qKlxuICogTm90IEVxdWFscyBjb21wYXJpc29uICE9PS5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gbGVmdFZhbCB0aGUgdmFsdWUgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gcmlnaHRWYWwgdGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+fSBhIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZSB0aGUgcmVzdWx0aW5nIHR5cGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdEVxdWFsczxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obGVmdFZhbDogQmluZGluZ1BhcnQ8VD4sIHJpZ2h0VmFsOiBCaW5kaW5nUGFydDxUPik6IFB1cmVCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdHJldHVybiBjb21wYXJpc29uKFwiIT09XCIsIGxlZnRWYWwsIHJpZ2h0VmFsKTtcbn1cbi8qKlxuICogR3JlYXRlciBvciBlcXVhbHMgY29tcGFyaXNvbiA+PS5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gbGVmdFZhbCB0aGUgdmFsdWUgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gcmlnaHRWYWwgdGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+fSBhIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZSB0aGUgcmVzdWx0aW5nIHR5cGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWF0ZXJPckVxdWFsczxUIGV4dGVuZHMgUHJpbWl0aXZlVHlwZT4obGVmdFZhbDogQmluZGluZ1BhcnQ8VD4sIHJpZ2h0VmFsOiBCaW5kaW5nUGFydDxUPik6IFB1cmVCaW5kaW5nUGFydDxib29sZWFuPiB7XG5cdHJldHVybiBjb21wYXJpc29uKFwiPj1cIiwgbGVmdFZhbCwgcmlnaHRWYWwpO1xufVxuLyoqXG4gKiBHcmVhdGhlciB0aGFuIGNvbXBhcmlzb24gPi5cbiAqXG4gKiBAdGVtcGxhdGUgVFxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gbGVmdFZhbCB0aGUgdmFsdWUgb24gdGhlIGxlZnQgc2lkZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUPn0gcmlnaHRWYWwgdGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBjb21wYXJpc29uXG4gKiBAcmV0dXJucyB7UHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+fSBhIGJpbmRpbmcgcGFydCB0byBldmFsdWF0ZSB0aGUgcmVzdWx0aW5nIHR5cGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihsZWZ0VmFsOiBCaW5kaW5nUGFydDxUPiwgcmlnaHRWYWw6IEJpbmRpbmdQYXJ0PFQ+KTogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI+XCIsIGxlZnRWYWwsIHJpZ2h0VmFsKTtcbn1cbi8qKlxuICogTG93ZXIgb3IgRXF1YWxzIGNvbXBhcmlzb24gPD0uXG4gKlxuICogQHRlbXBsYXRlIFRcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8VD59IGxlZnRWYWwgdGhlIHZhbHVlIG9uIHRoZSBsZWZ0IHNpZGVcbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8VD59IHJpZ2h0VmFsIHRoZSB2YWx1ZSBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgY29tcGFyaXNvblxuICogQHJldHVybnMge1B1cmVCaW5kaW5nUGFydDxib29sZWFuPn0gYSBiaW5kaW5nIHBhcnQgdG8gZXZhbHVhdGUgdGhlIHJlc3VsdGluZyB0eXBlIG9mIHRoZSBjb21wYXJpc29uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb3dlck9yRXF1YWxzPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihsZWZ0VmFsOiBCaW5kaW5nUGFydDxUPiwgcmlnaHRWYWw6IEJpbmRpbmdQYXJ0PFQ+KTogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI8PVwiLCBsZWZ0VmFsLCByaWdodFZhbCk7XG59XG4vKipcbiAqIExvd2VyIHRoYW4gY29tcGFyaXNvbiA8LlxuICpcbiAqIEB0ZW1wbGF0ZSBUXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PFQ+fSBsZWZ0VmFsIHRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PFQ+fSByaWdodFZhbCB0aGUgdmFsdWUgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNvbXBhcmlzb25cbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8Ym9vbGVhbj59IGEgYmluZGluZyBwYXJ0IHRvIGV2YWx1YXRlIHRoZSByZXN1bHRpbmcgdHlwZSBvZiB0aGUgY29tcGFyaXNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gbG93ZXJUaGFuPFQgZXh0ZW5kcyBQcmltaXRpdmVUeXBlPihsZWZ0VmFsOiBCaW5kaW5nUGFydDxUPiwgcmlnaHRWYWw6IEJpbmRpbmdQYXJ0PFQ+KTogUHVyZUJpbmRpbmdQYXJ0PGJvb2xlYW4+IHtcblx0cmV0dXJuIGNvbXBhcmlzb24oXCI8XCIsIGxlZnRWYWwsIHJpZ2h0VmFsKTtcbn1cblxuLyoqXG4gKiBJZiBFbHNlIGV2YWx1YXRpb24sIGlmIHRoZSBjb25kaXRpb24gZXZhbHVhdGVzIHRvIHRydWUsIGRvIHRoZSBvblRydWUgcGFydCwgb3RoZXJ3aXNlIHRoZSBvbkZhbHNlLlxuICpcbiAqIEB0ZW1wbGF0ZSBUYXJnZXRUeXBlXG4gKiBAcGFyYW0ge0JpbmRpbmdQYXJ0PGJvb2xlYW4+fSBjb25kaXRpb24gdGhlIGNvbmRpdGlvbiB0byBldmFsdWF0ZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUYXJnZXRUeXBlPn0gb25UcnVlIHdoYXQgdG8gZG8gaW4gY2FzZSBvZiB0cnVlIGV2YWx1YXRpb25cbiAqIEBwYXJhbSB7QmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT59IG9uRmFsc2Ugd2hhdCB0byBkbyBpbiBjYXNlIG9mIGZhbHNlIGV2YWx1YXRpb25cbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT59IHRoZSBiaW5kaW5nIHBhcnQgdGhhdCByZXByZXNlbnQgdGhpcyBjb25kaXRpb25hbCBjaGVja1xuICovXG5leHBvcnQgZnVuY3Rpb24gaWZFbHNlPFRhcmdldFR5cGUgZXh0ZW5kcyBCaW5kaW5nUHJpbWl0aXZlVHlwZT4oXG5cdGNvbmRpdGlvbjogQmluZGluZ1BhcnQ8Ym9vbGVhbj4sXG5cdG9uVHJ1ZTogQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT4sXG5cdG9uRmFsc2U6IEJpbmRpbmdQYXJ0PFRhcmdldFR5cGU+XG4pOiBQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT4ge1xuXHRjb25kaXRpb24gPSB3cmFwUHJpbWl0aXZlKGNvbmRpdGlvbik7XG5cdG9uVHJ1ZSA9IHdyYXBQcmltaXRpdmUob25UcnVlKTtcblx0b25GYWxzZSA9IHdyYXBQcmltaXRpdmUob25GYWxzZSk7XG5cdGlmIChpc0NvbnN0YW50KGNvbmRpdGlvbikpIHtcblx0XHRyZXR1cm4gY29uZGl0aW9uLnZhbHVlID8gb25UcnVlIDogb25GYWxzZTtcblx0fSBlbHNlIHtcblx0XHRpZiAoXG5cdFx0XHRjb25kaXRpb24uX3R5cGUgPT09IFwiSWZFbHNlXCIgJiZcblx0XHRcdGlzQ29uc3RhbnQoY29uZGl0aW9uLm9uRmFsc2UpICYmXG5cdFx0XHRjb25kaXRpb24ub25GYWxzZS52YWx1ZSA9PT0gZmFsc2UgJiZcblx0XHRcdGlzQ29uc3RhbnQoY29uZGl0aW9uLm9uVHJ1ZSkgJiZcblx0XHRcdGNvbmRpdGlvbi5vblRydWUudmFsdWUgPT09IHRydWVcblx0XHQpIHtcblx0XHRcdGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5jb25kaXRpb247XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdGNvbmRpdGlvbi5fdHlwZSA9PT0gXCJJZkVsc2VcIiAmJlxuXHRcdFx0aXNDb25zdGFudChjb25kaXRpb24ub25GYWxzZSkgJiZcblx0XHRcdGNvbmRpdGlvbi5vbkZhbHNlLnZhbHVlID09PSB0cnVlICYmXG5cdFx0XHRpc0NvbnN0YW50KGNvbmRpdGlvbi5vblRydWUpICYmXG5cdFx0XHRjb25kaXRpb24ub25UcnVlLnZhbHVlID09PSBmYWxzZVxuXHRcdCkge1xuXHRcdFx0Y29uZGl0aW9uID0gbm90KGNvbmRpdGlvbi5jb25kaXRpb24pO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRjb25kaXRpb24uX3R5cGUgPT09IFwiSWZFbHNlXCIgJiZcblx0XHRcdGlzQ29uc3RhbnQoY29uZGl0aW9uLm9uVHJ1ZSkgJiZcblx0XHRcdGNvbmRpdGlvbi5vblRydWUudmFsdWUgPT09IGZhbHNlICYmXG5cdFx0XHQhaXNDb25zdGFudChjb25kaXRpb24ub25GYWxzZSlcblx0XHQpIHtcblx0XHRcdGNvbmRpdGlvbiA9IGFuZChub3QoY29uZGl0aW9uLmNvbmRpdGlvbiksIGNvbmRpdGlvbi5vbkZhbHNlKTtcblx0XHR9XG5cdFx0aWYgKGlzQ29uc3RhbnQob25UcnVlKSAmJiBpc0NvbnN0YW50KG9uRmFsc2UpICYmIG9uVHJ1ZS52YWx1ZSA9PT0gb25GYWxzZS52YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG9uVHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdF90eXBlOiBcIklmRWxzZVwiLFxuXHRcdFx0Y29uZGl0aW9uOiBjb25kaXRpb24sXG5cdFx0XHRvblRydWU6IG9uVHJ1ZSxcblx0XHRcdG9uRmFsc2U6IG9uRmFsc2Vcblx0XHR9O1xuXHR9XG59XG5cbnR5cGUgRm9ybWF0dGVyRm48VD4gPSAoKC4uLnBhcmFtczogQmluZGluZ1BhcnQ8YW55PikgPT4gVCkgJiB7XG5cdF9fZm9ybWF0dGVyTmFtZTogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBiaW5kaW5nIHBhcnQgaGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBkZWZhdWx0IG1vZGVsICh1bmRlZmluZWQpLlxuICpcbiAqIEBwYXJhbSB7IFB1cmVCaW5kaW5nUGFydDxvYmplY3Q+fSBwYXJ0IHRoZSBiaW5kaW5nIHBhcnQgdG8gZXZhbHVhdGVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZXJlIGlzIGEgcmVmZXJlbmNlIHRvIHRoZSBkZWZhdWx0IGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChwYXJ0OiBQdXJlQmluZGluZ1BhcnQ8YW55Pik6IGJvb2xlYW4ge1xuXHRzd2l0Y2ggKHBhcnQuX3R5cGUpIHtcblx0XHRjYXNlIFwiQ29uc3RhbnRcIjpcblx0XHRjYXNlIFwiRm9ybWF0UmVzdWx0XCI6XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0Y2FzZSBcIkFuZFwiOlxuXHRcdFx0cmV0dXJuIHBhcnQuZXhwcmVzc2lvbnMuc29tZShoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KTtcblx0XHRjYXNlIFwiQmluZGluZ1wiOlxuXHRcdFx0cmV0dXJuIHBhcnQubW9kZWxOYW1lID09PSB1bmRlZmluZWQ7XG5cdFx0Y2FzZSBcIkNvbXBhcmlzb25cIjpcblx0XHRcdHJldHVybiBoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KHBhcnQubGVmdFZhbCkgfHwgaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChwYXJ0LnJpZ2h0VmFsKTtcblx0XHRjYXNlIFwiRGVmYXVsdEJpbmRpbmdcIjpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGNhc2UgXCJJZkVsc2VcIjpcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQocGFydC5jb25kaXRpb24pIHx8XG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQocGFydC5vblRydWUpIHx8XG5cdFx0XHRcdGhhc1JlZmVyZW5jZVRvRGVmYXVsdENvbnRleHQocGFydC5vbkZhbHNlKVxuXHRcdFx0KTtcblx0XHRjYXNlIFwiTm90XCI6XG5cdFx0XHRyZXR1cm4gaGFzUmVmZXJlbmNlVG9EZWZhdWx0Q29udGV4dChwYXJ0LmV4cHJlc3Npb24pO1xuXHRcdGNhc2UgXCJPclwiOlxuXHRcdFx0cmV0dXJuIHBhcnQuZXhwcmVzc2lvbnMuc29tZShoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59XG5cbi8qKlxuICogQHR5cGVkZWYgV3JhcHBlZFR1cGxlXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbnR5cGUgV3JhcHBlZFR1cGxlPFQ+ID0geyBbSyBpbiBrZXlvZiBUXTogQmluZGluZ1BhcnQ8VFtLXT4gfTtcbi8vIFNvLCB0aGlzIHdvcmtzIGJ1dCBJIGNhbm5vdCBnZXQgaXQgdG8gY29tcGlsZSA6RCwgYnV0IGl0IHN0aWxsIGRvZXMgd2hhdCBpcyBleHBlY3RlZC4uLlxuXG4vKipcbiAqIENhbGxzIGEgZm9ybWF0dGVyIGZ1bmN0aW9uIHRvIHByb2Nlc3MgdGhlIGluUGFyYW1ldGVycy5cbiAqIElmIHJlcXVpcmVDb250ZXh0IGlzIHNldCB0byB0cnVlIGFuZCBubyBjb25jZXB0IGlzIHBhc3NlZCBhIGRlZmF1bHQgY29udGV4dCB3aWxsIGJlIGFkZGRlZCBhdXRvbWF0aWNhbGx5LlxuICpcbiAqIEB0ZW1wbGF0ZSBUYXJnZXRUeXBlXG4gKiBAdGVtcGxhdGUgVVxuICogQHBhcmFtIHtXcmFwcGVkVHVwbGU8UGFyYW1ldGVyczxVPj59IGluUGFyYW1ldGVycyB0aGUgbGlzdCBvZiBwYXJhbWV0ZXIgdGhhdCBzaG91bGQgbWF0Y2ggdGhlIHR5cGUgYW5kIG51bWJlciBvZiB0aGUgZm9ybWF0dGVyIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge1V9IGZvcm1hdHRlckZ1bmN0aW9uIHRoZSBmdW5jdGlvbiB0byBjYWxsXG4gKiBAcGFyYW0ge0VudGl0eVR5cGV9IFtjb250ZXh0RW50aXR5VHlwZV0gdGhlIGNvbnRleHQgZW50aXR5IHR5cGUgdG8gY29uc2lkZXJcbiAqIEByZXR1cm5zIHtQdXJlQmluZGluZ1BhcnQ8VGFyZ2V0VHlwZT59IHRoZSBjb3JyZXNwb25kaW5nIHB1cmUgYmluZGluZyBwYXJ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRSZXN1bHQ8VGFyZ2V0VHlwZSBleHRlbmRzIEJpbmRpbmdQcmltaXRpdmVUeXBlLCBVIGV4dGVuZHMgRm9ybWF0dGVyRm48VGFyZ2V0VHlwZT4+KFxuXHRpblBhcmFtZXRlcnM6IFdyYXBwZWRUdXBsZTxQYXJhbWV0ZXJzPFU+Pixcblx0Zm9ybWF0dGVyRnVuY3Rpb246IFUsXG5cdGNvbnRleHRFbnRpdHlUeXBlPzogRW50aXR5VHlwZVxuKTogUHVyZUJpbmRpbmdQYXJ0PFRhcmdldFR5cGU+IHtcblx0Y29uc3QgcGFyYW1ldGVycyA9IChpblBhcmFtZXRlcnMgYXMgYW55W10pLm1hcCh3cmFwUHJpbWl0aXZlKTtcblx0Ly8gSWYgdGhlcmUgaXMgb25seSBwYXJhbWV0ZXIgYW5kIGl0J3MgYSBjb25zdGFudCBhbmQgd2UgZG9uJ3QgZXhwZWN0IHRoZSBjb250ZXh0IHRoZW4gcmV0dXJuIHRoZSBjb25zdGFudFxuXHRpZiAocGFyYW1ldGVycy5sZW5ndGggPT09IDEgJiYgaXNDb25zdGFudChwYXJhbWV0ZXJzWzBdKSAmJiAhY29udGV4dEVudGl0eVR5cGUpIHtcblx0XHRyZXR1cm4gcGFyYW1ldGVyc1swXTtcblx0fSBlbHNlIGlmICghIWNvbnRleHRFbnRpdHlUeXBlKSB7XG5cdFx0Ly8gT3RoZXJ3aXNlLCBpZiB0aGUgY29udGV4dCBpcyByZXF1aXJlZCBhbmQgbm8gY29udGV4dCBpcyBwcm92aWRlZCBtYWtlIHN1cmUgdG8gYWRkIHRoZSBkZWZhdWx0IGJpbmRpbmdcblx0XHRpZiAoIXBhcmFtZXRlcnMuc29tZShoYXNSZWZlcmVuY2VUb0RlZmF1bHRDb250ZXh0KSkge1xuXHRcdFx0Y29udGV4dEVudGl0eVR5cGUua2V5cy5mb3JFYWNoKGtleSA9PiBwYXJhbWV0ZXJzLnB1c2goYmluZGluZ0V4cHJlc3Npb24oa2V5Lm5hbWUsIFwiXCIpKSk7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IFtmb3JtYXR0ZXJDbGFzcywgZm9ybWF0dGVyTmFtZV0gPSAoZm9ybWF0dGVyRnVuY3Rpb24gYXMgRm9ybWF0dGVyRm48VGFyZ2V0VHlwZT4pLl9fZm9ybWF0dGVyTmFtZS5zcGxpdChcIiNcIik7XG5cdC8vIEZvcm1hdHRlck5hbWUgY2FuIGJlIG9mIGZvcm1hdCBzYXAuZmUuY29yZS54eHgjbWV0aG9kTmFtZSB0byBoYXZlIG11bHRpcGxlIGZvcm1hdHRlciBpbiBvbmUgY2xhc3Ncblx0aWYgKCEhZm9ybWF0dGVyTmFtZSAmJiBmb3JtYXR0ZXJOYW1lLmxlbmd0aCA+IDApIHtcblx0XHRwYXJhbWV0ZXJzLnVuc2hpZnQoY29uc3RhbnQoZm9ybWF0dGVyTmFtZSkpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJGb3JtYXRSZXN1bHRcIixcblx0XHRmb3JtYXR0ZXI6IGZvcm1hdHRlckNsYXNzLFxuXHRcdHBhcmFtZXRlcnM6IHBhcmFtZXRlcnNcblx0fTtcbn1cblxuZXhwb3J0IHR5cGUgQmluZGluZ0V4cHJlc3Npb248VD4gPSBUIHwgc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIENvbXBpbGUgYSBCaW5kaW5nUGFydCBpbnRvIGFuIGV4cHJlc3Npb24gYmluZGluZy5cbiAqXG4gKiBAdGVtcGxhdGUgVGFyZ2V0VHlwZVxuICogQHBhcmFtIHtCaW5kaW5nUGFydDxUYXJnZXRUeXBlPn0gcGFydCB0aGUgYmluZGluZyBwYXJ0IHRvIGNvbXBpbGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW1iZWRkZWRJbkJpbmRpbmcgd2hldGhlciB0aGlzIGlzIHRoZSByb290IGxldmVsIG9yIGEgc3ViIGxldmVsXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgY29ycmVzcG9uZGluZyBleHByZXNzaW9uIGJpbmRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVCaW5kaW5nPFRhcmdldFR5cGUgZXh0ZW5kcyBCaW5kaW5nUHJpbWl0aXZlVHlwZT4oXG5cdHBhcnQ6IEJpbmRpbmdQYXJ0PFRhcmdldFR5cGU+LFxuXHRlbWJlZGRlZEluQmluZGluZzogYm9vbGVhbiA9IGZhbHNlXG4pOiBCaW5kaW5nRXhwcmVzc2lvbjxUYXJnZXRUeXBlPiB7XG5cdHBhcnQgPSB3cmFwUHJpbWl0aXZlKHBhcnQpO1xuXHRzd2l0Y2ggKHBhcnQuX3R5cGUpIHtcblx0XHRjYXNlIFwiQ29uc3RhbnRcIjpcblx0XHRcdGlmIChwYXJ0LnZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBcIm51bGxcIjtcblx0XHRcdH1cblx0XHRcdGlmIChlbWJlZGRlZEluQmluZGluZykge1xuXHRcdFx0XHRzd2l0Y2ggKHR5cGVvZiBwYXJ0LnZhbHVlKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIm51bWJlclwiOlxuXHRcdFx0XHRcdGNhc2UgXCJiaWdpbnRcIjpcblx0XHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHBhcnQudmFsdWUudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdFx0XHRyZXR1cm4gYCcke3BhcnQudmFsdWUudG9TdHJpbmcoKX0nYDtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBwYXJ0LnZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcIkRlZmF1bHRCaW5kaW5nXCI6XG5cdFx0Y2FzZSBcIkJpbmRpbmdcIjpcblx0XHRcdGlmIChlbWJlZGRlZEluQmluZGluZykge1xuXHRcdFx0XHRyZXR1cm4gYFxcJXske3BhcnQubW9kZWxOYW1lID8gYCR7cGFydC5tb2RlbE5hbWV9PmAgOiBcIlwifSR7cGFydC5wYXRofX1gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGB7JHtwYXJ0Lm1vZGVsTmFtZSA/IGAke3BhcnQubW9kZWxOYW1lfT5gIDogXCJcIn0ke3BhcnQucGF0aH19YDtcblx0XHRcdH1cblx0XHRjYXNlIFwiQ29tcGFyaXNvblwiOlxuXHRcdFx0Y29uc3QgY29tcGFyaXNvblBhcnQgPSBgJHtjb21waWxlQmluZGluZyhwYXJ0LmxlZnRWYWwsIHRydWUpfSAke3BhcnQub3BlcmF0b3J9ICR7Y29tcGlsZUJpbmRpbmcocGFydC5yaWdodFZhbCwgdHJ1ZSl9YDtcblx0XHRcdGlmIChlbWJlZGRlZEluQmluZGluZykge1xuXHRcdFx0XHRyZXR1cm4gY29tcGFyaXNvblBhcnQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYHs9ICR7Y29tcGFyaXNvblBhcnR9fWA7XG5cdFx0Y2FzZSBcIklmRWxzZVwiOlxuXHRcdFx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0XHRcdHJldHVybiBgKCR7Y29tcGlsZUJpbmRpbmcocGFydC5jb25kaXRpb24sIHRydWUpfSA/ICR7Y29tcGlsZUJpbmRpbmcocGFydC5vblRydWUsIHRydWUpfSA6ICR7Y29tcGlsZUJpbmRpbmcoXG5cdFx0XHRcdFx0cGFydC5vbkZhbHNlLFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KX0pYDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBgez0gJHtjb21waWxlQmluZGluZyhwYXJ0LmNvbmRpdGlvbiwgdHJ1ZSl9ID8gJHtjb21waWxlQmluZGluZyhwYXJ0Lm9uVHJ1ZSwgdHJ1ZSl9IDogJHtjb21waWxlQmluZGluZyhcblx0XHRcdFx0XHRwYXJ0Lm9uRmFsc2UsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpfX1gO1xuXHRcdFx0fVxuXG5cdFx0Y2FzZSBcIkFuZFwiOlxuXHRcdFx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0XHRcdHJldHVybiBgKCR7cGFydC5leHByZXNzaW9ucy5tYXAoZXhwcmVzc2lvbiA9PiBjb21waWxlQmluZGluZyhleHByZXNzaW9uLCB0cnVlKSkuam9pbihcIiAmJiBcIil9KWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYHs9ICgke3BhcnQuZXhwcmVzc2lvbnMubWFwKGV4cHJlc3Npb24gPT4gY29tcGlsZUJpbmRpbmcoZXhwcmVzc2lvbiwgdHJ1ZSkpLmpvaW4oXCIgJiYgXCIpfSl9YDtcblx0XHRcdH1cblx0XHRjYXNlIFwiT3JcIjpcblx0XHRcdGlmIChlbWJlZGRlZEluQmluZGluZykge1xuXHRcdFx0XHRyZXR1cm4gYCgke3BhcnQuZXhwcmVzc2lvbnMubWFwKGV4cHJlc3Npb24gPT4gY29tcGlsZUJpbmRpbmcoZXhwcmVzc2lvbiwgdHJ1ZSkpLmpvaW4oXCIgfHwgXCIpfSlgO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGB7PSAoJHtwYXJ0LmV4cHJlc3Npb25zLm1hcChleHByZXNzaW9uID0+IGNvbXBpbGVCaW5kaW5nKGV4cHJlc3Npb24sIHRydWUpKS5qb2luKFwiIHx8IFwiKX0pfWA7XG5cdFx0XHR9XG5cdFx0Y2FzZSBcIk5vdFwiOlxuXHRcdFx0aWYgKGVtYmVkZGVkSW5CaW5kaW5nKSB7XG5cdFx0XHRcdHJldHVybiBgISR7Y29tcGlsZUJpbmRpbmcocGFydC5leHByZXNzaW9uLCB0cnVlKX1gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGB7PSAhJHtjb21waWxlQmluZGluZyhwYXJ0LmV4cHJlc3Npb24sIHRydWUpfX1gO1xuXHRcdFx0fVxuXHRcdGNhc2UgXCJGb3JtYXRSZXN1bHRcIjpcblx0XHRcdGxldCBvdXRQcm9wZXJ0eSA9IFwiXCI7XG5cdFx0XHRpZiAocGFydC5wYXJhbWV0ZXJzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRvdXRQcm9wZXJ0eSArPSBgeyR7Y29tcGlsZVBhdGhQYXJhbWV0ZXIocGFydC5wYXJhbWV0ZXJzWzBdLCB0cnVlKX0sIGZvcm1hdHRlcjogJyR7cGFydC5mb3JtYXR0ZXJ9J31gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0UHJvcGVydHkgKz0gYHtwYXJ0czpbJHtwYXJ0LnBhcmFtZXRlcnMubWFwKChwYXJhbTogYW55KSA9PiBjb21waWxlUGF0aFBhcmFtZXRlcihwYXJhbSkpLmpvaW4oXCIsXCIpfV0sIGZvcm1hdHRlcjogJyR7XG5cdFx0XHRcdFx0cGFydC5mb3JtYXR0ZXJcblx0XHRcdFx0fSd9YDtcblx0XHRcdH1cblx0XHRcdGlmIChlbWJlZGRlZEluQmluZGluZykge1xuXHRcdFx0XHRvdXRQcm9wZXJ0eSA9IGBcXCQke291dFByb3BlcnR5fWA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3V0UHJvcGVydHk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBcIlwiO1xuXHR9XG59XG5cbi8qKlxuICogQ29tcGlsZSB0aGUgcGF0aCBwYXJhbWV0ZXIgb2YgYSBmb3JtYXR0ZXIgY2FsbC5cbiAqXG4gKiBAcGFyYW0ge1B1cmVCaW5kaW5nUGFydDxvYmplY3Q+fSBwYXJ0IHRoZSBiaW5kaW5nIHBhcnQgdG8gZXZhbHVhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2luZ2xlUGF0aCB3aGV0aGVyIHRoZXJlIGlzIG9uZSBvciBtdWx0aXBsZSBwYXRoIHRvIGNvbnNpZGVyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgc3RyaW5nIHNuaXBwZXQgdG8gaW5jbHVkZSBpbiB0aGUgb3ZlcmFsbCBiaW5kaW5nIGRlZmluaXRpb25cbiAqL1xuZnVuY3Rpb24gY29tcGlsZVBhdGhQYXJhbWV0ZXIocGFydDogUHVyZUJpbmRpbmdQYXJ0PGFueT4sIHNpbmdsZVBhdGg6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG5cdGxldCBvdXRWYWx1ZSA9IFwiXCI7XG5cdHN3aXRjaCAocGFydC5fdHlwZSkge1xuXHRcdGNhc2UgXCJDb25zdGFudFwiOlxuXHRcdFx0c3dpdGNoICh0eXBlb2YgcGFydC52YWx1ZSkge1xuXHRcdFx0XHRjYXNlIFwibnVtYmVyXCI6XG5cdFx0XHRcdGNhc2UgXCJiaWdpbnRcIjpcblx0XHRcdFx0XHRvdXRWYWx1ZSA9IGB2YWx1ZTogJHtwYXJ0LnZhbHVlLnRvU3RyaW5nKCl9YDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdG91dFZhbHVlID0gYHZhbHVlOiAnJHtwYXJ0LnZhbHVlLnRvU3RyaW5nKCl9J2A7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0b3V0VmFsdWUgPSBcInZhbHVlOiAnJ1wiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNpbmdsZVBhdGgpIHtcblx0XHRcdFx0cmV0dXJuIG91dFZhbHVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGB7JHtvdXRWYWx1ZX19YDtcblxuXHRcdGNhc2UgXCJEZWZhdWx0QmluZGluZ1wiOlxuXHRcdGNhc2UgXCJCaW5kaW5nXCI6XG5cdFx0XHRvdXRWYWx1ZSA9IGBwYXRoOicke3BhcnQubW9kZWxOYW1lID8gYCR7cGFydC5tb2RlbE5hbWV9PmAgOiBcIlwifSR7cGFydC5wYXRofScsIHRhcmdldFR5cGUgOiAnYW55J2A7XG5cdFx0XHRpZiAoc2luZ2xlUGF0aCkge1xuXHRcdFx0XHRyZXR1cm4gb3V0VmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYHske291dFZhbHVlfX1gO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0fVxufVxuIl19