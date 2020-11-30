/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

// ---------------------------------------------------------------------------------------
// Util class used to help handle side effects
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------

// TODO: enhance/take over common functionalities from macro field runtime, fe edit flow and transaction helper

sap.ui.define(["sap/base/Log"], function(Log) {
	"use strict";

	var oSideEffectsUtil = {};

	/**
	 * Checks the Side Effects path expressions for empty NavigationPropertyPaths and changes them to
	 * PropertyPaths with path "*".
	 *
	 * @function
	 * @name replaceEmptyNavigationPaths
	 * @param {Array} aPathExpressions the array of target path expressions used for the side effect
	 * @returns {Array} updated path expressions
	 */
	oSideEffectsUtil.replaceEmptyNavigationPaths = function(aPathExpressions) {
		return (
			(aPathExpressions &&
				aPathExpressions.map(function(oPathExpression) {
					if (oPathExpression["$NavigationPropertyPath"] === "") {
						return {
							"$PropertyPath": "*"
						};
					}
					return oPathExpression;
				})) ||
			[]
		);
	};
	/**
	 * Checks the Side PropertyPath with path * and adds text property in
	 * PropertyPaths with path "*".
	 *
	 * @param {Array} aPathExpressions the array of target path expressions used for the side effect
	 * @param {object} oMetaModel oModel - MetaModel
	 * @param {string} sBaseEntityType Base entity name
	 * @returns {Array} updated path expressions
	 */
	oSideEffectsUtil.addTextProperties = function(aPathExpressions, oMetaModel, sBaseEntityType) {
		var sBasePath = sBaseEntityType,
			aTextProperties = [],
			oTextProperty,
			oEntityType,
			bRequestAll;
		if (sBasePath.charAt(0) !== "/") {
			sBasePath = "/" + sBasePath;
		}
		if (sBasePath.charAt(sBasePath.length - 1) !== "/") {
			sBasePath = sBasePath + "/";
		}
		aPathExpressions.forEach(function(oPathExpression) {
			if (oPathExpression["$PropertyPath"] === "*") {
				bRequestAll = true;
			} else if (oPathExpression["$PropertyPath"]) {
				oTextProperty = _getTextProperty(oMetaModel, sBasePath + oPathExpression["$PropertyPath"]);
				if (oTextProperty) {
					aTextProperties.push(oTextProperty);
				}
			}
		});
		if (bRequestAll) {
			oEntityType = oMetaModel.getObject(sBasePath);
			Object.keys(oEntityType).forEach(function(sKey) {
				if (oEntityType[sKey].$kind && oEntityType[sKey].$kind === "Property") {
					oTextProperty = _getTextProperty(oMetaModel, sBasePath + sKey);
					if (oTextProperty) {
						aTextProperties.push(oTextProperty);
					}
				}
			});
		}
		return aPathExpressions.concat(aTextProperties);
	};
	function _getTextProperty(oMetaModel, sPath) {
		var oTextAnnotation = oMetaModel.getObject(sPath + "@com.sap.vocabularies.Common.v1.Text");
		if (oTextAnnotation && oTextAnnotation["$Path"]) {
			return _getPathOrNavigationProperty(oTextAnnotation["$Path"]);
		}
		return undefined;
	}
	function _getPathOrNavigationProperty(sPath) {
		var n = sPath.lastIndexOf("/");
		if (n > -1) {
			// In case the Text defined by the text annotation is found via a Navigation Property
			// put the Navigation Property Path into side effects. OData takes care which properties
			// are needed from the Navigation.
			return { "$NavigationPropertyPath": sPath.substr(0, n) };
		} else {
			return { "$PropertyPath": sPath };
		}
	}
	/**
	 * Returns either a Property Path or Navigation Path without Property for a path
	 * that contains a property and possibly a navigation path.
	 *
	 * @name determinePathOrNavigationPath
	 * @param {string} sPath the path to a property
	 * @returns {object}
	 */
	oSideEffectsUtil.determinePathOrNavigationPath = function(sPath) {
		return _getPathOrNavigationProperty(sPath);
	};
	/**
	 * Logs the Side Effects request with the information -
	 * 		1. Context path - of the context on which side effects are requested
	 * 		2. Property paths - the ones which are requested.
	 *
	 * @function
	 * @name logRequest
	 * @param {map} oRequest the side effect request ready for execution
	 * @param {object} oRequest.context the context on which side effect will be requested
	 * @param {Array} oRequest.pathExpressions array of $PropertyPath and $NavigationPropertyPath
	 */
	oSideEffectsUtil.logRequest = function(oRequest) {
		var sPropertyPaths =
			Array.isArray(oRequest.pathExpressions) &&
			oRequest.pathExpressions.reduce(function(sPaths, oPath) {
				return sPaths + "\n\t\t" + (oPath["$PropertyPath"] || oPath["$NavigationPropertyPath"] || "");
			}, "");
		Log.info("SideEffects request:\n\tContext path : " + oRequest.context.getPath() + "\n\tProperty paths :" + sPropertyPaths);
	};

	/**
	 * Removes the Binding Path from Target Properties for Side Effects for an Action
	 * Provides an Information in the log in case that the Binding Parameter was not defined.
	 *
	 * @param {Array} aTargetProperties array of Target Properties from Side Effects Annotation
	 * @param {string} sType
	 * @param {string} sBindingParameter the name of the Binding Parameter
	 * @param {Array} sActionName the name of the Action
	 * @returns {object}
	 */
	oSideEffectsUtil.removeBindingPaths = function(aTargetProperties, sType, sBindingParameter, sActionName) {
		// Remove binding name if supplied. Formally required but if it missing, we just give an information in the log
		aTargetProperties.forEach(function(oProperty) {
			var n = oProperty[sType].indexOf(sBindingParameter);
			if (n === 0) {
				oProperty[sType] = oProperty[sType].substr(sBindingParameter.length + 1);
			} else if (n === -1) {
				Log.info(
					'Side Effects for Action "' +
						sActionName +
						'" with property "' +
						oProperty[sType] +
						'" do not include binding parameter ' +
						'"' +
						sBindingParameter +
						'".'
				);
			}
		});
		return aTargetProperties;
	};

	/**
	 * Translate side-effect annotations.
	 *
	 * SideEffect annotations follow different definitions after a change of the vocabulary. Previously, TargetProperties
	 * were of type Collection(Edm.PropertyPath), now they are of type Collection(Edm.String). This function translates
	 * both representations into a common format.
	 *
	 * The new definition also introduces wildcards ('*') as the last segment of target property paths. Such paths are
	 * translated into the corresponding $NavigationPropertyPath and added to the list of TargetEntities.
	 *
	 * Only Edm.String and Edm.PropertyPath are allowed for target properties. Edm.Path is rejected.
	 *
	 * @param {object} 		oSideEffect - SideEffects annotation
	 * @returns {object}	Converted SideEffects annotation
	 */
	oSideEffectsUtil.convertSideEffect = function(oSideEffect) {
		function _convertTargetProperty(oConvertedSideEffect, vTarget) {
			if (typeof vTarget === "string") {
				// new vocabulary: Type is 'Edm.String'
				// The last path segment may be '*'. Map such targets to navigation properties
				if (vTarget === "*") {
					oConvertedSideEffect.TargetProperties.push({ $PropertyPath: "*" });
				} else if (vTarget.endsWith("/*")) {
					vTarget = vTarget.slice(0, -2);
					if (vTarget.includes("*")) {
						throw new Error("Wildcards ('*') are only allowed as last segment of a path");
					}
					oConvertedSideEffect.TargetEntities.push({ $NavigationPropertyPath: vTarget });
				} else {
					oConvertedSideEffect.TargetProperties.push({ $PropertyPath: vTarget });
				}
			} else if (vTarget.$PropertyPath) {
				// old vocabulary: type 'Edm.PropertyPath'. Keep supporting this for backwards compatibility.
				oConvertedSideEffect.TargetProperties.push(vTarget);
			} else if (vTarget.$Path) {
				// possible with new vocabulary, but unsupported
				throw new Error(
					"<Path> is not supported for TargetProperties of SideEffects. Annotate <String>" + vTarget.$Path + "</String> instead."
				);
			} else {
				throw new Error("Unsupported TargetProperties type");
			}
			return oConvertedSideEffect;
		}

		if (oSideEffect) {
			var oConverted = Object.assign({}, oSideEffect);
			oConverted.TargetProperties = [];
			oConverted.TargetEntities || (oConverted.TargetEntities = []);
			oSideEffect.TargetProperties && oSideEffect.TargetProperties.reduce(_convertTargetProperty, oConverted);
			return oConverted;
		}
	};

	/**
	 * Get all SideEffects annotations.
	 *
	 * @param {object} oAnnotations - Annotations
	 * @returns {object[]} Array of SideEffect annotations
	 */
	oSideEffectsUtil.getSideEffects = function(oAnnotations) {
		return oAnnotations
			? Object.keys(oAnnotations)
					.filter(function(sAnnotation) {
						return sAnnotation.indexOf("@com.sap.vocabularies.Common.v1.SideEffects") > -1;
					})
					.map(function(sSideEffect) {
						return oSideEffectsUtil.convertSideEffect(oAnnotations[sSideEffect]);
					})
			: [];
	};

	/*
	 * Manages the side effects in case of a new item creation without pressing the save button
	 * or a fail of a document saving after pressing the save button.
	 *
	 * @name requestSideEffects
	 * @param {string} sNavigationProperty
	 * @param {object} oBindingContext
	 */
	oSideEffectsUtil.requestSideEffects = function(sNavigationProperty, oBindingContext) {
		var oMetaModel = oBindingContext.oModel.getMetaModel(),
			sBaseEntityType = "/" + oMetaModel.getObject(oMetaModel.getMetaPath(oBindingContext.getPath()))["$Type"],
			oAnnotations = oMetaModel.getObject(sBaseEntityType + "@"),
			aSideEffects = this.getSideEffects(oAnnotations),
			aSideEffectsToRequest = [],
			aPathExpressions,
			aTriggerActions = [],
			aPropertiesToRequest = [],
			aEntitiesToRequest = [];

		// gather side effects which need to be requested
		aSideEffects.forEach(function(oSideEffect) {
			// if the navigation property is a source entity for any side effect
			if (oSideEffect.SourceEntities) {
				oSideEffect.SourceEntities.forEach(function(oSourceEntity) {
					if (oSourceEntity["$NavigationPropertyPath"] === sNavigationProperty) {
						aSideEffectsToRequest.push(oSideEffect);
					}
				});
			}
			// if at least one of the source properties belongs to the entity type via navigation property
			if (oSideEffect.SourceProperties && aSideEffectsToRequest.indexOf(oSideEffect) === -1) {
				oSideEffect.SourceProperties.forEach(function(oSourceProperty) {
					if (oSourceProperty["$PropertyPath"].indexOf(sNavigationProperty + "/") === 0) {
						aSideEffectsToRequest.push(oSideEffect);
					}
				});
			}
		});
		// assemble the path expressions to be GET from each side effect to be requested
		aSideEffectsToRequest.forEach(function(oSideEffect) {
			var aTargetProperties = oSideEffect.TargetProperties,
				aTargetEntities = oSideEffect.TargetEntities;
			// gather trigger actions
			if (oSideEffect.TriggerAction) {
				aTriggerActions.push(oSideEffect.TriggerAction);
			}
			// remove duplicate properties
			aTargetProperties = aTargetProperties
				.map(function(oPathExpression) {
					return oPathExpression["$PropertyPath"];
				})
				.filter(function(sPath) {
					return aPropertiesToRequest.indexOf(sPath) < 0;
				});
			// remove duplicate entities
			aTargetEntities = aTargetEntities
				.map(function(oPathExpression) {
					return oPathExpression["$NavigationPropertyPath"];
				})
				.filter(function(sPath) {
					return aEntitiesToRequest.indexOf(sPath) < 0;
				});
			// add to list of paths to be requested
			aPropertiesToRequest = aPropertiesToRequest.concat(aTargetProperties);
			aEntitiesToRequest = aEntitiesToRequest.concat(aTargetEntities);
		});
		// gather all unique paths to request in the format of '$PropertyPath' and '$NavigationPropertyPath'
		aPathExpressions = aPropertiesToRequest
			.map(function(sPath) {
				return { "$PropertyPath": sPath };
			})
			.concat(
				aEntitiesToRequest.map(function(sPath) {
					return { "$NavigationPropertyPath": sPath };
				})
			);
		// trigger action
		if (aTriggerActions.length) {
			aTriggerActions.forEach(function(sTriggerAction) {
				var oTriggerAction = oBindingContext.getModel().bindContext(sTriggerAction + "(...)", oBindingContext);
				oTriggerAction.execute(oBindingContext.getBinding().getUpdateGroupId());
			});
		}
		// request
		if (aPathExpressions.length) {
			aPathExpressions = this.replaceEmptyNavigationPaths(aPathExpressions);
			// Add additional text associations for the target properties
			aPathExpressions = this.addTextProperties(aPathExpressions, oMetaModel, sBaseEntityType);
			// log info for the request being attempted
			this.logRequest({ context: oBindingContext, pathExpressions: aPathExpressions });
			oBindingContext.requestSideEffects(aPathExpressions);
		}
	};

	return oSideEffectsUtil;
});
