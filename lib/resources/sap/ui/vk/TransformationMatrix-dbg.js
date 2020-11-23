/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides data type sap.ui.vk.TransformationMatrix.
sap.ui.define([
	"sap/base/assert",
	"sap/ui/base/DataType"
], function(
	assert,
	DataType
) {
	"use strict";

	/**
	 * @class
	 * Transformation matrix is an array of 12 numbers in a row major mode.
	 * @final
	 * @public
	 * @alias sap.ui.vk.TransformationMatrix
	 * @since 1.32.0
	 */
	var TransformationMatrix = DataType.getType("float[]");


	/**
	 * Parses the given string value and converts it into an array of numbers.
	 * @param {string} value a comma or white space delimited string
	 * @return {number[]} an array of 12 numbers
	 * @static
	 * @public
	 */
	TransformationMatrix.parseValue = function(value) {
		var componentType = TransformationMatrix.getComponentType();
		return value.split(/\s*,\s*|\s+/).map(componentType.parseValue.bind(componentType));
	};

	/**
	 * Converts matrix from 4x3 to 4x4.
	 * @param {number[]} matrix4x3 The matrix to convert.
	 * @return {number[]} The matrix 4x4 with [0, 0, 0, 1] in the last column.
	 * @static
	 * @public
	 */
	TransformationMatrix.convertTo4x4 = function(matrix4x3) {
		var m = matrix4x3;
		return [ m[0], m[1], m[2], 0, m[3], m[4], m[5], 0, m[6], m[7], m[8], 0, m[9], m[10], m[11], 1 ];
	};

	/**
	 * Checks that a matrix can be safely converted to a 4x3 matrix.
	 * @param {number[]} matrix4x4 The matrix to check
	 * @return {boolean} true if the matrix can be safely converted to a 4x3 matrix
	 * @static
	 * @private
	 */
	TransformationMatrix.canConvertTo4x3 = function(matrix4x4) {
		var equals = function(a, b) { return Math.abs(a - b) < 1e-5; };
		return (
			equals(matrix4x4[3],  0) &&
			equals(matrix4x4[7],  0) &&
			equals(matrix4x4[11], 0) &&
			equals(matrix4x4[15], 1));
	};

	/**
	 * Converts matrix from 4x4 to 4x3.
	 * @param {number[]} matrix4x4 The matrix to convert. The last column must be [0, 0, 0, 1].
	 * @return {number[]} The matrix 4x3 with the last column removed from matrix4x4.
	 * @public
	 * @static
	 */
	TransformationMatrix.convertTo4x3 = function(matrix4x4) {
		var m = matrix4x4;
		assert(TransformationMatrix.canConvertTo4x3(m), "The transformation matrix is invalid. The last column must be [0, 0, 0, 1].");
		return [ m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10], m[12], m[13], m[14] ];
	};

	return TransformationMatrix;
}, /* bExport = */ true);
