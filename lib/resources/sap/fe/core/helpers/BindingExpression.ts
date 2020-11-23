import {
	PrimitiveType,
	PropertyAnnotationValue,
	IfAnnotationExpressionValue,
	IfAnnotationExpression,
	ConditionalCheckOrValue,
	PathConditionExpression,
	OrConditionalExpression,
	AndConditionalExpression,
	NotConditionalExpression,
	EqConditionalExpression,
	NeConditionalExpression,
	GtConditionalExpression,
	GeConditionalExpression,
	LtConditionalExpression,
	LeConditionalExpression,
	EntityType
} from "@sap-ux/vocabularies-types";
import { ApplyAnnotationExpression, PathAnnotationExpression } from "@sap-ux/vocabularies-types/types/Edm";

type BindingPrimitiveType = string | number | boolean | object;
type BindingPartBase<TargetType> = {
	_type: string;
};

/**
 * @typedef BindingPartConstant
 */
type BindingPartConstant<TargetType> = BindingPartBase<TargetType> & {
	_type: "Constant";
	value: TargetType | null;
};

type BindingPartAnd = BindingPartBase<boolean> & {
	_type: "And";
	expressions: PureBindingPart<boolean>[];
};

type BindingPartOr = BindingPartBase<boolean> & {
	_type: "Or";
	expressions: PureBindingPart<boolean>[];
};

type BindingPartNot = BindingPartBase<boolean> & {
	_type: "Not";
	expression: PureBindingPart<boolean>;
};

/**
 * @typedef BindingPartBindingExpression
 */
type BindingPartBindingExpression<TargetType> = BindingPartBase<TargetType> & {
	_type: "Binding";
	modelName?: string;
	path: string;
};

type BindingPartDefaultBindingExpression<TargetType> = BindingPartBase<TargetType> & {
	_type: "DefaultBinding";
	modelName?: string;
	path: string;
};

/**
 * @typedef OPERATOR_STRING
 */
type OPERATOR_STRING = "===" | "!==" | ">=" | ">" | "<=" | "<";
type BindingPartComparison = BindingPartBase<boolean> & {
	_type: "Comparison";
	operator: OPERATOR_STRING;
	leftVal: PureBindingPart<any>;
	rightVal: PureBindingPart<any>;
};

type BindingPartIfElse<TargetType extends BindingPrimitiveType> = BindingPartBase<boolean> & {
	_type: "IfElse";
	condition: PureBindingPart<boolean>;
	onTrue: PureBindingPart<TargetType>;
	onFalse: PureBindingPart<TargetType>;
};

type BindingPartFormatResult<TargetType extends BindingPrimitiveType> = BindingPartBase<TargetType> & {
	_type: "FormatResult";
	formatter: string;
	parameters: PureBindingPart<TargetType>[];
};

/**
 * @template TargetType
 * @typedef {PureBindingPart<TargetType>} PureBindingPart
 */
export type PureBindingPart<TargetType extends BindingPrimitiveType> =
	| BindingPartConstant<TargetType>
	| BindingPartAnd
	| BindingPartOr
	| BindingPartNot
	| BindingPartBindingExpression<TargetType>
	| BindingPartDefaultBindingExpression<TargetType>
	| BindingPartComparison
	| BindingPartIfElse<TargetType>
	| BindingPartFormatResult<TargetType>;

/**
 * @template TargetType
 * @typedef {BindingPart<TargetType>} BindingPart
 */
export type BindingPart<TargetType extends BindingPrimitiveType> = PureBindingPart<TargetType> | TargetType;

/**
 * Logical `and` operator.
 * If at least one parameter is a constant `false` this is simplified as false.
 *
 * @param {BindingPart<boolean>[]} inExpressions an array of expression that should be evaluated with `and` operators
 * @returns {PureBindingPart<boolean>} the resulting BindingPart that evaluates to boolean
 */
export function and(...inExpressions: BindingPart<boolean>[]): PureBindingPart<boolean> {
	const expressions = inExpressions.map(wrapPrimitive);
	let isStaticFalse: boolean = false;
	const nonTrivialExpression = expressions.filter(expression => {
		if (isConstant(expression) && !expression.value) {
			isStaticFalse = true;
		}
		return !isConstant(expression);
	});
	if (isStaticFalse) {
		return constant(false);
	} else if (nonTrivialExpression.length === 0) {
		// Resolve the constant then
		const isValid = expressions.reduce((isValid, expression) => {
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
export function or(...inExpressions: BindingPart<boolean>[]): PureBindingPart<boolean> {
	const expressions = inExpressions.map(wrapPrimitive);
	let isStaticTrue: boolean = false;
	const nonTrivialExpression = expressions.filter(expression => {
		if (isConstant(expression) && expression.value) {
			isStaticTrue = true;
		}
		return !isConstant(expression) || expression.value;
	});
	if (isStaticTrue) {
		return constant(true);
	} else if (nonTrivialExpression.length === 0) {
		// Resolve the constant then
		const isValid = expressions.reduce((isValid, expression) => {
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
export function not(expression: BindingPart<boolean>): PureBindingPart<boolean> {
	if (isConstant(expression)) {
		return constant(!expression.value);
	} else if (
		typeof expression === "object" &&
		expression._type === "Or" &&
		expression.expressions.every(expression => isConstant(expression) || isComparison(expression))
	) {
		return and(...expression.expressions.map(expression => not(expression)));
	} else if (
		typeof expression === "object" &&
		expression._type === "And" &&
		expression.expressions.every(expression => isConstant(expression) || isComparison(expression))
	) {
		return or(...expression.expressions.map(expression => not(expression)));
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
export function bindingExpression<TargetType extends BindingPrimitiveType>(
	path: string,
	modelName?: string
): BindingPartBindingExpression<TargetType> {
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
export function constant<ConstantType extends BindingPrimitiveType>(constantValue: null | ConstantType): BindingPartConstant<ConstantType> {
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
function wrapPrimitive<T extends BindingPrimitiveType>(something: null | T | BindingPart<T>): PureBindingPart<T> {
	if (something === null || typeof something !== "object") {
		return constant(something);
	}
	return something as PureBindingPart<T>;
}

/**
 * Check if the binding part provided is a constant or not.
 *
 * @template T
 * @param {BindingPart<T>} maybeConstant the binding part to evaluate
 * @returns {boolean} true if we're dealing with a BindingPartConstant
 */
export function isConstant<T extends PrimitiveType>(maybeConstant: BindingPart<T>): maybeConstant is BindingPartConstant<T> {
	return typeof maybeConstant !== "object" || (maybeConstant as BindingPartBase<T>)?._type === "Constant";
}

/**
 * Check if the binding part provided is a pure binding part of not.
 *
 * @template T
 * @param {BindingPart<T>} maybeConstant the binding part to evaluate
 * @returns {boolean} true if we're dealing with a PureBindingPart
 */
function isPureBindingPart<T extends PrimitiveType>(maybeConstant: BindingPart<T>): maybeConstant is PureBindingPart<T> {
	return typeof maybeConstant === "object" && (maybeConstant as PureBindingPart<T>)?._type !== undefined;
}

function constantsAreEqual<T extends PrimitiveType>(leftMaybeConstant: BindingPart<T>, rightMaybeConstant: BindingPart<T>): boolean {
	return isConstant(leftMaybeConstant) && isConstant(rightMaybeConstant) && leftMaybeConstant.value === rightMaybeConstant.value;
}

/**
 * Check if the binding part provided is a comparison or not.
 *
 * @template T
 * @param {BindingPart<T>} maybeConstant the binding part to evaluate
 * @returns {boolean} true if we're dealing with a BindingPartComparison
 */
function isComparison<T extends PrimitiveType>(maybeConstant: BindingPart<T>): maybeConstant is BindingPartComparison {
	return (maybeConstant as BindingPartBase<T>)?._type === "Comparison";
}

type ComplexAnnotationExpression<P> = PathAnnotationExpression<P> | ApplyAnnotationExpression<P> | IfAnnotationExpression<P>;

/**
 * Check if the passed annotation expression is a ComplexAnnotationExpression.
 *
 * @template T
 * @param {PropertyAnnotationValue<T>} annotationExpression the annotation expression to evaluate
 * @returns {boolean} true if the object is a {ComplexAnntotationExpression}
 */
function isComplexAnnotationExpression<T>(
	annotationExpression: PropertyAnnotationValue<T>
): annotationExpression is ComplexAnnotationExpression<T> {
	return typeof annotationExpression === "object";
}

/**
 * Generate the corresponding bindingpart for a given annotation expression.
 *
 * @template T
 * @param {PropertyAnnotationValue<T>} annotationExpression the source annotation expression
 * @returns {PureBindingPart<T>} the binding part equivalent to that annotation expression
 */
export function annotationExpression<T extends BindingPrimitiveType>(annotationExpression: PropertyAnnotationValue<T>): PureBindingPart<T> {
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
function parseAnnotationCondition<T extends BindingPrimitiveType>(annotationValue: ConditionalCheckOrValue): PureBindingPart<T> {
	if (annotationValue === null || typeof annotationValue !== "object") {
		return constant(annotationValue as T);
	} else if (annotationValue.hasOwnProperty("$Or")) {
		return or(
			...(((annotationValue as OrConditionalExpression).$Or.map(parseAnnotationCondition) as unknown) as BindingPart<boolean>[])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$And")) {
		return and(
			...(((annotationValue as AndConditionalExpression).$And.map(parseAnnotationCondition) as unknown) as BindingPart<boolean>[])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Not")) {
		return not(parseAnnotationCondition((annotationValue as NotConditionalExpression).$Not[0])) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Eq")) {
		return equals(
			parseAnnotationCondition((annotationValue as EqConditionalExpression).$Eq[0]),
			parseAnnotationCondition((annotationValue as EqConditionalExpression).$Eq[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Ne")) {
		return notEquals(
			parseAnnotationCondition((annotationValue as NeConditionalExpression).$Ne[0]),
			parseAnnotationCondition((annotationValue as NeConditionalExpression).$Ne[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Gt")) {
		return greaterThan(
			parseAnnotationCondition((annotationValue as GtConditionalExpression).$Gt[0]),
			parseAnnotationCondition((annotationValue as GtConditionalExpression).$Gt[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Ge")) {
		return greaterOrEquals(
			parseAnnotationCondition((annotationValue as GeConditionalExpression).$Ge[0]),
			parseAnnotationCondition((annotationValue as GeConditionalExpression).$Ge[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Lt")) {
		return lowerThan(
			parseAnnotationCondition((annotationValue as LtConditionalExpression).$Lt[0]),
			parseAnnotationCondition((annotationValue as LtConditionalExpression).$Lt[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Le")) {
		return lowerOrEquals(
			parseAnnotationCondition((annotationValue as LeConditionalExpression).$Le[0]),
			parseAnnotationCondition((annotationValue as LeConditionalExpression).$Le[1])
		) as PureBindingPart<T>;
	} else if (annotationValue.hasOwnProperty("$Path")) {
		return bindingExpression((annotationValue as PathConditionExpression<T>).$Path);
	} else {
		return constant(false as T);
	}
}

/**
 * Process the {IfAnnotationExpressionValue} into a PureBindingPart.
 *
 * @template T
 * @param {IfAnnotationExpressionValue<T>} annotationIfExpression an If expression returning the type T
 * @returns {PureBindingPart<T>} the equivalent pure binding part
 */
export function annotationIfExpression<T extends BindingPrimitiveType>(
	annotationIfExpression: IfAnnotationExpressionValue<T>
): PureBindingPart<T> {
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
function comparison<T extends PrimitiveType>(
	operator: OPERATOR_STRING,
	leftVal: BindingPart<T>,
	rightVal: BindingPart<T>
): PureBindingPart<boolean> {
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
export function equals<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function notEquals<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function greaterOrEquals<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function greaterThan<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function lowerOrEquals<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function lowerThan<T extends PrimitiveType>(leftVal: BindingPart<T>, rightVal: BindingPart<T>): PureBindingPart<boolean> {
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
export function ifElse<TargetType extends BindingPrimitiveType>(
	condition: BindingPart<boolean>,
	onTrue: BindingPart<TargetType>,
	onFalse: BindingPart<TargetType>
): PureBindingPart<TargetType> {
	condition = wrapPrimitive(condition);
	onTrue = wrapPrimitive(onTrue);
	onFalse = wrapPrimitive(onFalse);
	if (isConstant(condition)) {
		return condition.value ? onTrue : onFalse;
	} else {
		if (
			condition._type === "IfElse" &&
			isConstant(condition.onFalse) &&
			condition.onFalse.value === false &&
			isConstant(condition.onTrue) &&
			condition.onTrue.value === true
		) {
			condition = condition.condition;
		} else if (
			condition._type === "IfElse" &&
			isConstant(condition.onFalse) &&
			condition.onFalse.value === true &&
			isConstant(condition.onTrue) &&
			condition.onTrue.value === false
		) {
			condition = not(condition.condition);
		} else if (
			condition._type === "IfElse" &&
			isConstant(condition.onTrue) &&
			condition.onTrue.value === false &&
			!isConstant(condition.onFalse)
		) {
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

type FormatterFn<T> = ((...params: BindingPart<any>) => T) & {
	__formatterName: string;
};

/**
 * Checks whether the current binding part has a reference to the default model (undefined).
 *
 * @param { PureBindingPart<object>} part the binding part to evaluate
 * @returns {boolean} true if there is a reference to the default context
 */
function hasReferenceToDefaultContext(part: PureBindingPart<any>): boolean {
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
			return (
				hasReferenceToDefaultContext(part.condition) ||
				hasReferenceToDefaultContext(part.onTrue) ||
				hasReferenceToDefaultContext(part.onFalse)
			);
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
type WrappedTuple<T> = { [K in keyof T]: BindingPart<T[K]> };
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
export function formatResult<TargetType extends BindingPrimitiveType, U extends FormatterFn<TargetType>>(
	inParameters: WrappedTuple<Parameters<U>>,
	formatterFunction: U,
	contextEntityType?: EntityType
): PureBindingPart<TargetType> {
	const parameters = (inParameters as any[]).map(wrapPrimitive);
	// If there is only parameter and it's a constant and we don't expect the context then return the constant
	if (parameters.length === 1 && isConstant(parameters[0]) && !contextEntityType) {
		return parameters[0];
	} else if (!!contextEntityType) {
		// Otherwise, if the context is required and no context is provided make sure to add the default binding
		if (!parameters.some(hasReferenceToDefaultContext)) {
			contextEntityType.keys.forEach(key => parameters.push(bindingExpression(key.name, "")));
		}
	}
	const [formatterClass, formatterName] = (formatterFunction as FormatterFn<TargetType>).__formatterName.split("#");
	// FormatterName can be of format sap.fe.core.xxx#methodName to have multiple formatter in one class
	if (!!formatterName && formatterName.length > 0) {
		parameters.unshift(constant(formatterName));
	}

	return {
		_type: "FormatResult",
		formatter: formatterClass,
		parameters: parameters
	};
}

export type BindingExpression<T> = T | string | undefined;

/**
 * Compile a BindingPart into an expression binding.
 *
 * @template TargetType
 * @param {BindingPart<TargetType>} part the binding part to compile
 * @param {boolean} embeddedInBinding whether this is the root level or a sub level
 * @returns {string} the corresponding expression binding
 */
export function compileBinding<TargetType extends BindingPrimitiveType>(
	part: BindingPart<TargetType>,
	embeddedInBinding: boolean = false
): BindingExpression<TargetType> {
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
						return `'${part.value.toString()}'`;
					default:
						return "";
				}
			} else {
				return part.value.toString();
			}
		case "DefaultBinding":
		case "Binding":
			if (embeddedInBinding) {
				return `\%{${part.modelName ? `${part.modelName}>` : ""}${part.path}}`;
			} else {
				return `{${part.modelName ? `${part.modelName}>` : ""}${part.path}}`;
			}
		case "Comparison":
			const comparisonPart = `${compileBinding(part.leftVal, true)} ${part.operator} ${compileBinding(part.rightVal, true)}`;
			if (embeddedInBinding) {
				return comparisonPart;
			}
			return `{= ${comparisonPart}}`;
		case "IfElse":
			if (embeddedInBinding) {
				return `(${compileBinding(part.condition, true)} ? ${compileBinding(part.onTrue, true)} : ${compileBinding(
					part.onFalse,
					true
				)})`;
			} else {
				return `{= ${compileBinding(part.condition, true)} ? ${compileBinding(part.onTrue, true)} : ${compileBinding(
					part.onFalse,
					true
				)}}`;
			}

		case "And":
			if (embeddedInBinding) {
				return `(${part.expressions.map(expression => compileBinding(expression, true)).join(" && ")})`;
			} else {
				return `{= (${part.expressions.map(expression => compileBinding(expression, true)).join(" && ")})}`;
			}
		case "Or":
			if (embeddedInBinding) {
				return `(${part.expressions.map(expression => compileBinding(expression, true)).join(" || ")})`;
			} else {
				return `{= (${part.expressions.map(expression => compileBinding(expression, true)).join(" || ")})}`;
			}
		case "Not":
			if (embeddedInBinding) {
				return `!${compileBinding(part.expression, true)}`;
			} else {
				return `{= !${compileBinding(part.expression, true)}}`;
			}
		case "FormatResult":
			let outProperty = "";
			if (part.parameters.length === 1) {
				outProperty += `{${compilePathParameter(part.parameters[0], true)}, formatter: '${part.formatter}'}`;
			} else {
				outProperty += `{parts:[${part.parameters.map((param: any) => compilePathParameter(param)).join(",")}], formatter: '${
					part.formatter
				}'}`;
			}
			if (embeddedInBinding) {
				outProperty = `\$${outProperty}`;
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
function compilePathParameter(part: PureBindingPart<any>, singlePath: boolean = false): string {
	let outValue = "";
	switch (part._type) {
		case "Constant":
			switch (typeof part.value) {
				case "number":
				case "bigint":
					outValue = `value: ${part.value.toString()}`;
					break;
				case "string":
				case "boolean":
					outValue = `value: '${part.value.toString()}'`;
					break;
				default:
					outValue = "value: ''";
					break;
			}
			if (singlePath) {
				return outValue;
			}
			return `{${outValue}}`;

		case "DefaultBinding":
		case "Binding":
			outValue = `path:'${part.modelName ? `${part.modelName}>` : ""}${part.path}', targetType : 'any'`;
			if (singlePath) {
				return outValue;
			}
			return `{${outValue}}`;
		default:
			return "";
	}
}
