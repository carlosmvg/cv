sap.ui.define([], function () {
  "use strict";

  var _exports = {};

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Path = function Path(pathExpression, targetName) {
    _classCallCheck(this, Path);

    this.path = pathExpression.Path;
    this.type = "Path";
    this.$target = targetName;
  };

  var defaultReferences = [{
    alias: "Capabilities",
    namespace: "Org.OData.Capabilities.V1",
    uri: ""
  }, {
    namespace: "Org.OData.Core.V1",
    alias: "Core",
    uri: ""
  }, {
    namespace: "Org.OData.Measures.V1",
    alias: "Measures",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.Common.v1",
    alias: "Common",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.UI.v1",
    alias: "UI",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.Session.v1",
    alias: "Session",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.Analytics.v1",
    alias: "Analytics",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.PersonalData.v1",
    alias: "PersonalData",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.Communication.v1",
    alias: "Communication",
    uri: ""
  }, {
    namespace: "com.sap.vocabularies.HTML5.v1",
    alias: "HTML5",
    uri: ""
  }];

  function alias(references, unaliasedValue) {
    if (!references.reverseReferenceMap) {
      references.reverseReferenceMap = references.reduce(function (map, reference) {
        map[reference.namespace] = reference;
        return map;
      }, {});
    }

    if (!unaliasedValue) {
      return unaliasedValue;
    }

    var lastDotIndex = unaliasedValue.lastIndexOf(".");
    var namespace = unaliasedValue.substr(0, lastDotIndex);
    var value = unaliasedValue.substr(lastDotIndex + 1);
    var reference = references.reverseReferenceMap[namespace];

    if (reference) {
      return "".concat(reference.alias, ".").concat(value);
    } else {
      // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
      if (unaliasedValue.indexOf("@") !== -1) {
        var _unaliasedValue$split = unaliasedValue.split("@"),
            _unaliasedValue$split2 = _slicedToArray(_unaliasedValue$split, 2),
            preAlias = _unaliasedValue$split2[0],
            postAlias = _unaliasedValue$split2[1];

        return "".concat(preAlias, "@").concat(alias(references, postAlias));
      } else {
        return unaliasedValue;
      }
    }
  }

  function unalias(references, aliasedValue) {
    if (!references.referenceMap) {
      references.referenceMap = references.reduce(function (map, reference) {
        map[reference.alias] = reference;
        return map;
      }, {});
    }

    if (!aliasedValue) {
      return aliasedValue;
    }

    var _aliasedValue$split = aliasedValue.split("."),
        _aliasedValue$split2 = _slicedToArray(_aliasedValue$split, 2),
        alias = _aliasedValue$split2[0],
        value = _aliasedValue$split2[1];

    var reference = references.referenceMap[alias];

    if (reference) {
      return "".concat(reference.namespace, ".").concat(value);
    } else {
      // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
      if (aliasedValue.indexOf("@") !== -1) {
        var _aliasedValue$split3 = aliasedValue.split("@"),
            _aliasedValue$split4 = _slicedToArray(_aliasedValue$split3, 2),
            preAlias = _aliasedValue$split4[0],
            postAlias = _aliasedValue$split4[1];

        return "".concat(preAlias, "@").concat(unalias(references, postAlias));
      } else {
        return aliasedValue;
      }
    }
  }

  function buildObjectMap(parserOutput) {
    var objectMap = {};

    if (parserOutput.schema.entityContainer && parserOutput.schema.entityContainer.fullyQualifiedName) {
      objectMap[parserOutput.schema.entityContainer.fullyQualifiedName] = parserOutput.schema.entityContainer;
    }

    parserOutput.schema.entitySets.forEach(function (entitySet) {
      objectMap[entitySet.fullyQualifiedName] = entitySet;
    });
    parserOutput.schema.actions.forEach(function (action) {
      objectMap[action.fullyQualifiedName] = action;
      action.parameters.forEach(function (parameter) {
        objectMap[parameter.fullyQualifiedName] = parameter;
      });
    });
    parserOutput.schema.entityTypes.forEach(function (entityType) {
      objectMap[entityType.fullyQualifiedName] = entityType;
      entityType.entityProperties.forEach(function (property) {
        objectMap[property.fullyQualifiedName] = property;
      });
      entityType.navigationProperties.forEach(function (navProperty) {
        objectMap[navProperty.fullyQualifiedName] = navProperty;
      });
    });
    Object.keys(parserOutput.schema.annotations).forEach(function (annotationSource) {
      parserOutput.schema.annotations[annotationSource].forEach(function (annotationList) {
        var currentTargetName = unalias(parserOutput.references, annotationList.target);
        annotationList.annotations.forEach(function (annotation) {
          var annotationFQN = "".concat(currentTargetName, "@").concat(unalias(parserOutput.references, annotation.term));

          if (annotation.qualifier) {
            annotationFQN += "#".concat(annotation.qualifier);
          }

          objectMap[annotationFQN] = annotation;
          annotation.fullyQualifiedName = annotationFQN;
        });
      });
    });
    return objectMap;
  }

  function combinePath(currentTarget, path) {
    if (path.startsWith("@")) {
      return currentTarget + path;
    } else {
      return currentTarget + "/" + path;
    }
  }

  function resolveTarget(objectMap, currentTarget, path) {
    var pathOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (!path) {
      return undefined;
    }

    path = combinePath(currentTarget.fullyQualifiedName, path);
    var pathSplit = path.split("/");
    var currentPath = path;
    var target = pathSplit.reduce(function (currentValue, pathPart) {
      if (!currentValue) {
        currentPath = pathPart;
      } else if (currentValue._type === "EntitySet" && currentValue.entityType) {
        currentPath = combinePath(currentValue.entityType, pathPart);
      } else if (currentValue._type === "NavigationProperty" && currentValue.targetTypeName) {
        currentPath = combinePath(currentValue.targetTypeName, pathPart);
      } else if (currentValue._type === "NavigationProperty" && currentValue.targetType) {
        currentPath = combinePath(currentValue.targetType.fullyQualifiedName, pathPart);
      } else if (currentValue._type === "Property") {
        currentPath = combinePath(currentTarget.fullyQualifiedName.substr(0, currentTarget.fullyQualifiedName.lastIndexOf("/")), pathPart);
      } else if (currentValue._type === "Action" && currentValue.isBound) {
        currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);

        if (!objectMap[currentPath]) {
          currentPath = combinePath(currentValue.sourceType, pathPart);
        }
      } else if (currentValue._type === "ActionParameter" && currentValue.isEntitySet) {
        currentPath = combinePath(currentValue.type, pathPart);
      } else if (currentValue._type === "ActionParameter" && !currentValue.isEntitySet) {
        currentPath = combinePath(currentTarget.fullyQualifiedName.substr(0, currentTarget.fullyQualifiedName.lastIndexOf("/")), pathPart);

        if (!objectMap[currentPath]) {
          var lastIdx = currentTarget.fullyQualifiedName.lastIndexOf("/");

          if (lastIdx === -1) {
            lastIdx = currentTarget.fullyQualifiedName.length;
          }

          currentPath = combinePath(objectMap[currentTarget.fullyQualifiedName.substr(0, lastIdx)].sourceType, pathPart);
        }
      } else {
        currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);

        if (currentValue[pathPart] !== undefined) {
          return currentValue[pathPart];
        } else if (pathPart === "$AnnotationPath" && currentValue.$target) {
          return currentValue.$target;
        }
      }

      return objectMap[currentPath];
    }, null);

    if (!target) {// console.log("Missing target " + path);
    }

    if (pathOnly) {
      return currentPath;
    }

    return target;
  }

  function isAnnotationPath(pathStr) {
    return pathStr.indexOf("@") !== -1;
  }

  function parseValue(propertyValue, valueFQN, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations) {
    if (propertyValue === undefined) {
      return undefined;
    }

    switch (propertyValue.type) {
      case "String":
        return propertyValue.String;

      case "Int":
        return propertyValue.Int;

      case "Bool":
        return propertyValue.Bool;

      case "Decimal":
        return propertyValue.Decimal;

      case "Date":
        return propertyValue.Date;

      case "EnumMember":
        return propertyValue.EnumMember;

      case "PropertyPath":
        return {
          type: "PropertyPath",
          value: propertyValue.PropertyPath,
          fullyQualifiedName: valueFQN,
          $target: resolveTarget(objectMap, currentTarget, propertyValue.PropertyPath)
        };

      case "NavigationPropertyPath":
        return {
          type: "NavigationPropertyPath",
          value: propertyValue.NavigationPropertyPath,
          fullyQualifiedName: valueFQN,
          $target: resolveTarget(objectMap, currentTarget, propertyValue.NavigationPropertyPath)
        };

      case "AnnotationPath":
        var annotationTarget = resolveTarget(objectMap, currentTarget, unalias(parserOutput.references, propertyValue.AnnotationPath), true);
        var annotationPath = {
          type: "AnnotationPath",
          value: propertyValue.AnnotationPath,
          fullyQualifiedName: valueFQN,
          $target: annotationTarget
        };
        toResolve.push(annotationPath);
        return annotationPath;

      case "Path":
        if (isAnnotationPath(propertyValue.Path)) {
          // If it's an anntoation that we can resolve, resolve it !
          var _$target = resolveTarget(objectMap, currentTarget, propertyValue.Path);

          if (_$target) {
            return _$target;
          }
        }

        var $target = resolveTarget(objectMap, currentTarget, propertyValue.Path, true);
        var path = new Path(propertyValue, $target);
        toResolve.push(path);
        return path;

      case "Record":
        return parseRecord(propertyValue.Record, valueFQN, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);

      case "Collection":
        return parseCollection(propertyValue.Collection, valueFQN, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);

      case "Apply":
      case "If":
        return propertyValue;
    }
  }

  function parseRecord(recordDefinition, currentFQN, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations) {
    var annotationTerm = {
      $Type: unalias(parserOutput.references, recordDefinition.type),
      fullyQualifiedName: currentFQN
    };
    var annotationContent = {};

    if (recordDefinition.annotations && Array.isArray(recordDefinition.annotations)) {
      var subAnnotationList = {
        target: currentFQN,
        annotations: recordDefinition.annotations,
        __source: annotationSource
      };
      unresolvedAnnotations.push(subAnnotationList);
    }

    recordDefinition.propertyValues.forEach(function (propertyValue) {
      annotationContent[propertyValue.name] = parseValue(propertyValue.value, "".concat(currentFQN, "/").concat(propertyValue.name), parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);

      if (propertyValue.annotations && Array.isArray(propertyValue.annotations)) {
        var _subAnnotationList = {
          target: "".concat(currentFQN, "/").concat(propertyValue.name),
          annotations: propertyValue.annotations,
          __source: annotationSource
        };
        unresolvedAnnotations.push(_subAnnotationList);
      }

      if (annotationContent.hasOwnProperty("Action") && (annotationTerm.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || annotationTerm.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction")) {
        if (currentTarget.actions) {
          annotationContent.ActionTarget = currentTarget.actions[annotationContent.Action];

          if (!annotationContent.ActionTarget) {// Add to diagnostics debugger;
          }
        }
      }
    });
    return Object.assign(annotationTerm, annotationContent);
  }

  function getOrInferCollectionType(collectionDefinition) {
    var type = collectionDefinition.type;

    if (type === undefined && collectionDefinition.length > 0) {
      var firstColItem = collectionDefinition[0];

      if (firstColItem.hasOwnProperty("PropertyPath")) {
        type = "PropertyPath";
      } else if (firstColItem.hasOwnProperty("Path")) {
        type = "Path";
      } else if (firstColItem.hasOwnProperty("AnnotationPath")) {
        type = "AnnotationPath";
      } else if (firstColItem.hasOwnProperty("NavigationPropertyPath")) {
        type = "NavigationPropertyPath";
      } else if (typeof firstColItem === "object" && (firstColItem.hasOwnProperty("type") || firstColItem.hasOwnProperty("propertyValues"))) {
        type = "Record";
      } else if (typeof firstColItem === "string") {
        type = "String";
      }
    } else if (type === undefined) {
      type = "EmptyCollection";
    }

    return type;
  }

  function parseCollection(collectionDefinition, parentFQN, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations) {
    var collectionDefinitionType = getOrInferCollectionType(collectionDefinition);

    switch (collectionDefinitionType) {
      case "PropertyPath":
        return collectionDefinition.map(function (propertyPath, propertyIdx) {
          return {
            type: "PropertyPath",
            value: propertyPath.PropertyPath,
            fullyQualifiedName: "".concat(parentFQN, "/").concat(propertyIdx),
            $target: resolveTarget(objectMap, currentTarget, propertyPath.PropertyPath)
          };
        });

      case "Path":
        return collectionDefinition.map(function (pathValue) {
          if (isAnnotationPath(pathValue.Path)) {
            // If it's an anntoation that we can resolve, resolve it !
            var _$target2 = resolveTarget(objectMap, currentTarget, pathValue.Path);

            if (_$target2) {
              return _$target2;
            }
          }

          var $target = resolveTarget(objectMap, currentTarget, pathValue.Path, true);
          var path = new Path(pathValue, $target);
          toResolve.push(path);
          return path;
        });

      case "AnnotationPath":
        return collectionDefinition.map(function (annotationPath, annotationIdx) {
          var annotationTarget = resolveTarget(objectMap, currentTarget, annotationPath.AnnotationPath, true);
          var annotationCollectionElement = {
            type: "AnnotationPath",
            value: annotationPath.AnnotationPath,
            fullyQualifiedName: "".concat(parentFQN, "/").concat(annotationIdx),
            $target: annotationTarget
          };
          toResolve.push(annotationCollectionElement);
          return annotationCollectionElement;
        });

      case "NavigationPropertyPath":
        return collectionDefinition.map(function (navPropertyPath, navPropIdx) {
          return {
            type: "NavigationPropertyPath",
            value: navPropertyPath.NavigationPropertyPath,
            fullyQualifiedName: "".concat(parentFQN, "/").concat(navPropIdx),
            $target: resolveTarget(objectMap, currentTarget, navPropertyPath.NavigationPropertyPath)
          };
        });

      case "Record":
        return collectionDefinition.map(function (recordDefinition, recordIdx) {
          return parseRecord(recordDefinition, "".concat(parentFQN, "/").concat(recordIdx), parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);
        });

      case "String":
        return collectionDefinition.map(function (stringValue) {
          return stringValue;
        });

      default:
        if (collectionDefinition.length === 0) {
          return [];
        }

        throw new Error("Unsupported case");
    }
  }

  function convertAnnotation(annotation, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations) {
    if (annotation.record) {
      var annotationTerm = {
        $Type: unalias(parserOutput.references, annotation.record.type),
        fullyQualifiedName: annotation.fullyQualifiedName,
        qualifier: annotation.qualifier
      };
      var annotationContent = {};
      annotation.record.propertyValues.forEach(function (propertyValue) {
        annotationContent[propertyValue.name] = parseValue(propertyValue.value, "".concat(annotation.fullyQualifiedName, "/").concat(propertyValue.name), parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);

        if (annotationContent.hasOwnProperty("Action") && (!annotation.record || annotationTerm.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || annotationTerm.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction")) {
          if (currentTarget.actions) {
            annotationContent.ActionTarget = currentTarget.actions[annotationContent.Action];

            if (!annotationContent.ActionTarget) {// Add to diagnostics
              // debugger;
            }
          }
        }
      });
      return Object.assign(annotationTerm, annotationContent);
    } else if (annotation.collection === undefined) {
      if (annotation.value) {
        return parseValue(annotation.value, annotation.fullyQualifiedName, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);
      } else {
        return true;
      }
    } else if (annotation.collection) {
      var collection = parseCollection(annotation.collection, annotation.fullyQualifiedName, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);
      collection.fullyQualifiedName = annotation.fullyQualifiedName;
      return collection;
    } else {
      throw new Error("Unsupported case");
    }
  }

  function createResolvePathFn(entityType, objectMap) {
    return function (relativePath) {
      return resolveTarget(objectMap, entityType, relativePath);
    };
  }

  function resolveNavigationProperties(entityTypes, associations, objectMap) {
    entityTypes.forEach(function (entityType) {
      entityType.navigationProperties = entityType.navigationProperties.map(function (navProp) {
        var outNavProp = {
          _type: "NavigationProperty",
          name: navProp.name,
          fullyQualifiedName: navProp.fullyQualifiedName,
          partner: navProp.hasOwnProperty("partner") ? navProp.partner : undefined,
          // targetTypeName: FullyQualifiedName;
          // targetType: EntityType;
          isCollection: navProp.hasOwnProperty("isCollection") ? navProp.isCollection : false,
          containsTarget: navProp.hasOwnProperty("containsTarget") ? navProp.containsTarget : false,
          referentialConstraint: navProp.referentialConstraint ? navProp.referentialConstraint : []
        };

        if (navProp.targetTypeName) {
          outNavProp.targetType = objectMap[navProp.targetTypeName];
        } else if (navProp.relationship) {
          var targetAssociation = associations.find(function (association) {
            return association.fullyQualifiedName === navProp.relationship;
          });

          if (targetAssociation) {
            var associationEnd = targetAssociation.associationEnd.find(function (end) {
              return end.role === navProp.toRole;
            });

            if (associationEnd) {
              outNavProp.targetType = objectMap[associationEnd.type];
              outNavProp.isCollection = associationEnd.multiplicity === "*";
            }
          }
        }

        if (outNavProp.targetType) {
          outNavProp.targetTypeName = outNavProp.targetType.name;
        }

        return outNavProp;
      });
      entityType.resolvePath = createResolvePathFn(entityType, objectMap);
    });
  }

  function linkActionsToEntityType(namespace, actions, objectMap) {
    actions.forEach(function (action) {
      if (action.isBound) {
        var sourceEntityType = objectMap[action.sourceType];
        action.sourceEntityType = sourceEntityType;

        if (sourceEntityType) {
          if (!sourceEntityType.actions) {
            sourceEntityType.actions = {};
          }

          sourceEntityType.actions[action.name] = action;
          sourceEntityType.actions["".concat(namespace, ".").concat(action.name)] = action;
        }

        action.returnEntityType = objectMap[action.returnType];
      }
    });
  }

  function linkEntityTypeToEntitySet(entitySets, objectMap) {
    entitySets.forEach(function (entitySet) {
      entitySet.entityType = objectMap[entitySet.entityTypeName];

      if (!entitySet.annotations) {
        entitySet.annotations = {};
      }

      if (!entitySet.entityType.annotations) {
        entitySet.entityType.annotations = {};
      }

      entitySet.entityType.keys.forEach(function (keyProp) {
        keyProp.isKey = true;
      });
    });
  }

  function splitTerm(references, termValue) {
    var aliasedTerm = alias(references, termValue);
    var lastDot = aliasedTerm.lastIndexOf(".");
    var termAlias = aliasedTerm.substr(0, lastDot);
    var term = aliasedTerm.substr(lastDot + 1);
    return [termAlias, term];
  }

  function convertTypes(parserOutput) {
    var objectMap = buildObjectMap(parserOutput);
    resolveNavigationProperties(parserOutput.schema.entityTypes, parserOutput.schema.associations, objectMap);
    linkActionsToEntityType(parserOutput.schema.namespace, parserOutput.schema.actions, objectMap);
    linkEntityTypeToEntitySet(parserOutput.schema.entitySets, objectMap);
    var toResolve = [];
    var unresolvedAnnotations = [];
    Object.keys(parserOutput.schema.annotations).forEach(function (annotationSource) {
      parserOutput.schema.annotations[annotationSource].forEach(function (annotationList) {
        var currentTargetName = unalias(parserOutput.references, annotationList.target);
        var currentTarget = objectMap[currentTargetName];

        if (!currentTarget) {
          if (currentTargetName.indexOf("@") !== -1) {
            annotationList.__source = annotationSource;
            unresolvedAnnotations.push(annotationList);
          }
        } else if (typeof currentTarget === "object") {
          if (!currentTarget.annotations) {
            currentTarget.annotations = {};
          }

          annotationList.annotations.forEach(function (annotation) {
            var _splitTerm = splitTerm(defaultReferences, annotation.term),
                _splitTerm2 = _slicedToArray(_splitTerm, 2),
                vocAlias = _splitTerm2[0],
                vocTerm = _splitTerm2[1];

            if (!currentTarget.annotations[vocAlias]) {
              currentTarget.annotations[vocAlias] = {};
            }

            if (!currentTarget.annotations._annotations) {
              currentTarget.annotations._annotations = {};
            }

            var vocTermWithQualifier = "".concat(vocTerm).concat(annotation.qualifier ? "#".concat(annotation.qualifier) : "");
            currentTarget.annotations[vocAlias][vocTermWithQualifier] = convertAnnotation(annotation, parserOutput, currentTarget, objectMap, toResolve, annotationSource, unresolvedAnnotations);

            if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null && typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === "object") {
              currentTarget.annotations[vocAlias][vocTermWithQualifier].term = unalias(defaultReferences, "".concat(vocAlias, ".").concat(vocTerm));
              currentTarget.annotations[vocAlias][vocTermWithQualifier].qualifier = annotation.qualifier;
              currentTarget.annotations[vocAlias][vocTermWithQualifier].__source = annotationSource;
            }

            var annotationTarget = "".concat(currentTargetName, "@").concat(unalias(defaultReferences, vocAlias + "." + vocTermWithQualifier));

            if (annotation.annotations && Array.isArray(annotation.annotations)) {
              var subAnnotationList = {
                target: annotationTarget,
                annotations: annotation.annotations,
                __source: annotationSource
              };
              unresolvedAnnotations.push(subAnnotationList);
            }

            currentTarget.annotations._annotations["".concat(vocAlias, ".").concat(vocTermWithQualifier)] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
            objectMap[annotationTarget] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
          });
        }
      });
    });
    var extraUnresolvedAnnotations = [];
    unresolvedAnnotations.forEach(function (annotationList) {
      var currentTargetName = unalias(parserOutput.references, annotationList.target);

      var _currentTargetName$sp = currentTargetName.split("@"),
          _currentTargetName$sp2 = _slicedToArray(_currentTargetName$sp, 2),
          baseObj = _currentTargetName$sp2[0],
          annotationPart = _currentTargetName$sp2[1];

      var targetSplit = annotationPart.split("/");
      baseObj = baseObj + "@" + targetSplit[0];
      var currentTarget = targetSplit.slice(1).reduce(function (currentObj, path) {
        if (!currentObj) {
          return null;
        }

        return currentObj[path];
      }, objectMap[baseObj]);

      if (!currentTarget) {// console.log("Missing target again " + currentTargetName);
      } else if (typeof currentTarget === "object") {
        if (!currentTarget.annotations) {
          currentTarget.annotations = {};
        }

        annotationList.annotations.forEach(function (annotation) {
          var _splitTerm3 = splitTerm(defaultReferences, annotation.term),
              _splitTerm4 = _slicedToArray(_splitTerm3, 2),
              vocAlias = _splitTerm4[0],
              vocTerm = _splitTerm4[1];

          if (!currentTarget.annotations[vocAlias]) {
            currentTarget.annotations[vocAlias] = {};
          }

          if (!currentTarget.annotations._annotations) {
            currentTarget.annotations._annotations = {};
          }

          var vocTermWithQualifier = "".concat(vocTerm).concat(annotation.qualifier ? "#".concat(annotation.qualifier) : "");
          currentTarget.annotations[vocAlias][vocTermWithQualifier] = convertAnnotation(annotation, parserOutput, currentTarget, objectMap, toResolve, annotationList.__source, extraUnresolvedAnnotations);

          if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null && typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === "object") {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].term = unalias(defaultReferences, "".concat(vocAlias, ".").concat(vocTerm));
            currentTarget.annotations[vocAlias][vocTermWithQualifier].qualifier = annotation.qualifier;
            currentTarget.annotations[vocAlias][vocTermWithQualifier].__source = annotationList.__source;
          }

          currentTarget.annotations._annotations["".concat(vocAlias, ".").concat(vocTermWithQualifier)] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
          objectMap["".concat(currentTargetName, "@").concat(unalias(defaultReferences, vocAlias + "." + vocTermWithQualifier))] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
        });
      }
    });
    toResolve.forEach(function (resolveable) {
      var targetStr = resolveable.$target;
      resolveable.$target = objectMap[targetStr];
    });
    parserOutput.entitySets = parserOutput.schema.entitySets;
    return {
      version: parserOutput.version,
      annotations: parserOutput.schema.annotations,
      namespace: parserOutput.schema.namespace,
      actions: parserOutput.schema.actions,
      entitySets: parserOutput.schema.entitySets,
      entityTypes: parserOutput.schema.entityTypes,
      references: parserOutput.references
    };
  }

  _exports.convertTypes = convertTypes;

  function revertValueToGenericType(references, value) {
    var result;

    if (typeof value === "string") {
      if (value.match(/\w+\.\w+\/.*/)) {
        result = {
          type: "EnumMember",
          EnumMember: value
        };
      } else {
        result = {
          type: "String",
          String: value
        };
      }
    } else if (Array.isArray(value)) {
      result = {
        type: "Collection",
        Collection: value.map(function (anno) {
          return revertCollectionItemToGenericType(references, anno);
        })
      };
    } else if (typeof value === "boolean") {
      result = {
        type: "Bool",
        Bool: value
      };
    } else if (typeof value === "number") {
      result = {
        type: "Int",
        Int: value
      };
    } else if (value.type === "Path") {
      result = {
        type: "Path",
        Path: value.path
      };
    } else if (value.type === "AnnotationPath") {
      result = {
        type: "AnnotationPath",
        AnnotationPath: value.value
      };
    } else if (value.type === "PropertyPath") {
      result = {
        type: "PropertyPath",
        PropertyPath: value.value
      };
    } else if (value.type === "NavigationPropertyPath") {
      result = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: value.value
      };
    } else if (Object.prototype.hasOwnProperty.call(value, "$Type")) {
      result = {
        type: "Record",
        Record: revertCollectionItemToGenericType(references, value)
      };
    }

    return result;
  }

  function revertCollectionItemToGenericType(references, collectionItem) {
    if (typeof collectionItem === "string") {
      return collectionItem;
    } else if (typeof collectionItem === "object") {
      if (collectionItem.hasOwnProperty("$Type")) {
        // Annotation Record
        var outItem = {
          type: collectionItem.$Type,
          propertyValues: []
        }; // Could validate keys and type based on $Type

        Object.keys(collectionItem).forEach(function (collectionKey) {
          if (collectionKey !== "$Type" && collectionKey !== "term" && collectionKey !== "__source" && collectionKey !== "qualifier" && collectionKey !== "ActionTarget" && collectionKey !== "fullyQualifiedName" && collectionKey !== "annotations") {
            var value = collectionItem[collectionKey];
            outItem.propertyValues.push({
              name: collectionKey,
              value: revertValueToGenericType(references, value)
            });
          } else if (collectionKey === "annotations") {
            var annotations = collectionItem[collectionKey];
            outItem.annotations = [];
            Object.keys(annotations).filter(function (key) {
              return key !== "_annotations";
            }).forEach(function (key) {
              Object.keys(annotations[key]).forEach(function (term) {
                var _outItem$annotations;

                var parsedAnnotation = revertTermToGenericType(references, annotations[key][term]);

                if (!parsedAnnotation.term) {
                  var unaliasedTerm = unalias(references, "".concat(key, ".").concat(term));

                  if (unaliasedTerm) {
                    var qualifiedSplit = unaliasedTerm.split("#");
                    parsedAnnotation.term = qualifiedSplit[0];

                    if (qualifiedSplit.length > 1) {
                      parsedAnnotation.qualifier = qualifiedSplit[1];
                    }
                  }
                }

                (_outItem$annotations = outItem.annotations) === null || _outItem$annotations === void 0 ? void 0 : _outItem$annotations.push(parsedAnnotation);
              });
            });
          }
        });
        return outItem;
      } else if (collectionItem.type === "PropertyPath") {
        return {
          type: "PropertyPath",
          PropertyPath: collectionItem.value
        };
      } else if (collectionItem.type === "AnnotationPath") {
        return {
          type: "AnnotationPath",
          AnnotationPath: collectionItem.value
        };
      }
    }
  }

  function revertTermToGenericType(references, annotation) {
    var baseAnnotation = {
      term: annotation.term,
      qualifier: annotation.qualifier
    };

    if (Array.isArray(annotation)) {
      // Collection
      return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
        collection: annotation.map(function (anno) {
          return revertCollectionItemToGenericType(references, anno);
        })
      });
    } else if (annotation.hasOwnProperty("$Type")) {
      return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
        record: revertCollectionItemToGenericType(references, annotation)
      });
    } else {
      return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
        value: revertValueToGenericType(references, annotation)
      });
    }
  }

  _exports.revertTermToGenericType = revertTermToGenericType;
  return _exports;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbW1vbi9Bbm5vdGF0aW9uQ29udmVydGVyLnRzIl0sIm5hbWVzIjpbIlBhdGgiLCJwYXRoRXhwcmVzc2lvbiIsInRhcmdldE5hbWUiLCJwYXRoIiwidHlwZSIsIiR0YXJnZXQiLCJkZWZhdWx0UmVmZXJlbmNlcyIsImFsaWFzIiwibmFtZXNwYWNlIiwidXJpIiwicmVmZXJlbmNlcyIsInVuYWxpYXNlZFZhbHVlIiwicmV2ZXJzZVJlZmVyZW5jZU1hcCIsInJlZHVjZSIsIm1hcCIsInJlZmVyZW5jZSIsImxhc3REb3RJbmRleCIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwidmFsdWUiLCJpbmRleE9mIiwic3BsaXQiLCJwcmVBbGlhcyIsInBvc3RBbGlhcyIsInVuYWxpYXMiLCJhbGlhc2VkVmFsdWUiLCJyZWZlcmVuY2VNYXAiLCJidWlsZE9iamVjdE1hcCIsInBhcnNlck91dHB1dCIsIm9iamVjdE1hcCIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImVudGl0eVNldHMiLCJmb3JFYWNoIiwiZW50aXR5U2V0IiwiYWN0aW9ucyIsImFjdGlvbiIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCJlbnRpdHlUeXBlcyIsImVudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsIm5hdlByb3BlcnR5IiwiT2JqZWN0Iiwia2V5cyIsImFubm90YXRpb25zIiwiYW5ub3RhdGlvblNvdXJjZSIsImFubm90YXRpb25MaXN0IiwiY3VycmVudFRhcmdldE5hbWUiLCJ0YXJnZXQiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvbkZRTiIsInRlcm0iLCJxdWFsaWZpZXIiLCJjb21iaW5lUGF0aCIsImN1cnJlbnRUYXJnZXQiLCJzdGFydHNXaXRoIiwicmVzb2x2ZVRhcmdldCIsInBhdGhPbmx5IiwidW5kZWZpbmVkIiwicGF0aFNwbGl0IiwiY3VycmVudFBhdGgiLCJjdXJyZW50VmFsdWUiLCJwYXRoUGFydCIsIl90eXBlIiwidGFyZ2V0VHlwZU5hbWUiLCJ0YXJnZXRUeXBlIiwiaXNCb3VuZCIsInNvdXJjZVR5cGUiLCJpc0VudGl0eVNldCIsImxhc3RJZHgiLCJsZW5ndGgiLCJpc0Fubm90YXRpb25QYXRoIiwicGF0aFN0ciIsInBhcnNlVmFsdWUiLCJwcm9wZXJ0eVZhbHVlIiwidmFsdWVGUU4iLCJ0b1Jlc29sdmUiLCJ1bnJlc29sdmVkQW5ub3RhdGlvbnMiLCJTdHJpbmciLCJJbnQiLCJCb29sIiwiRGVjaW1hbCIsIkRhdGUiLCJFbnVtTWVtYmVyIiwiUHJvcGVydHlQYXRoIiwiTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImFubm90YXRpb25UYXJnZXQiLCJBbm5vdGF0aW9uUGF0aCIsImFubm90YXRpb25QYXRoIiwicHVzaCIsInBhcnNlUmVjb3JkIiwiUmVjb3JkIiwicGFyc2VDb2xsZWN0aW9uIiwiQ29sbGVjdGlvbiIsInJlY29yZERlZmluaXRpb24iLCJjdXJyZW50RlFOIiwiYW5ub3RhdGlvblRlcm0iLCIkVHlwZSIsImFubm90YXRpb25Db250ZW50IiwiQXJyYXkiLCJpc0FycmF5Iiwic3ViQW5ub3RhdGlvbkxpc3QiLCJfX3NvdXJjZSIsInByb3BlcnR5VmFsdWVzIiwibmFtZSIsImhhc093blByb3BlcnR5IiwiQWN0aW9uVGFyZ2V0IiwiQWN0aW9uIiwiYXNzaWduIiwiZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlIiwiY29sbGVjdGlvbkRlZmluaXRpb24iLCJmaXJzdENvbEl0ZW0iLCJwYXJlbnRGUU4iLCJjb2xsZWN0aW9uRGVmaW5pdGlvblR5cGUiLCJwcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eUlkeCIsInBhdGhWYWx1ZSIsImFubm90YXRpb25JZHgiLCJhbm5vdGF0aW9uQ29sbGVjdGlvbkVsZW1lbnQiLCJuYXZQcm9wZXJ0eVBhdGgiLCJuYXZQcm9wSWR4IiwicmVjb3JkSWR4Iiwic3RyaW5nVmFsdWUiLCJFcnJvciIsImNvbnZlcnRBbm5vdGF0aW9uIiwicmVjb3JkIiwiY29sbGVjdGlvbiIsImNyZWF0ZVJlc29sdmVQYXRoRm4iLCJyZWxhdGl2ZVBhdGgiLCJyZXNvbHZlTmF2aWdhdGlvblByb3BlcnRpZXMiLCJhc3NvY2lhdGlvbnMiLCJuYXZQcm9wIiwib3V0TmF2UHJvcCIsInBhcnRuZXIiLCJpc0NvbGxlY3Rpb24iLCJjb250YWluc1RhcmdldCIsInJlZmVyZW50aWFsQ29uc3RyYWludCIsInJlbGF0aW9uc2hpcCIsInRhcmdldEFzc29jaWF0aW9uIiwiZmluZCIsImFzc29jaWF0aW9uIiwiYXNzb2NpYXRpb25FbmQiLCJlbmQiLCJyb2xlIiwidG9Sb2xlIiwibXVsdGlwbGljaXR5IiwicmVzb2x2ZVBhdGgiLCJsaW5rQWN0aW9uc1RvRW50aXR5VHlwZSIsInNvdXJjZUVudGl0eVR5cGUiLCJyZXR1cm5FbnRpdHlUeXBlIiwicmV0dXJuVHlwZSIsImxpbmtFbnRpdHlUeXBlVG9FbnRpdHlTZXQiLCJlbnRpdHlUeXBlTmFtZSIsImtleVByb3AiLCJpc0tleSIsInNwbGl0VGVybSIsInRlcm1WYWx1ZSIsImFsaWFzZWRUZXJtIiwibGFzdERvdCIsInRlcm1BbGlhcyIsImNvbnZlcnRUeXBlcyIsInZvY0FsaWFzIiwidm9jVGVybSIsIl9hbm5vdGF0aW9ucyIsInZvY1Rlcm1XaXRoUXVhbGlmaWVyIiwiZXh0cmFVbnJlc29sdmVkQW5ub3RhdGlvbnMiLCJiYXNlT2JqIiwiYW5ub3RhdGlvblBhcnQiLCJ0YXJnZXRTcGxpdCIsInNsaWNlIiwiY3VycmVudE9iaiIsInJlc29sdmVhYmxlIiwidGFyZ2V0U3RyIiwidmVyc2lvbiIsInJldmVydFZhbHVlVG9HZW5lcmljVHlwZSIsInJlc3VsdCIsIm1hdGNoIiwiYW5ubyIsInJldmVydENvbGxlY3Rpb25JdGVtVG9HZW5lcmljVHlwZSIsInByb3RvdHlwZSIsImNhbGwiLCJjb2xsZWN0aW9uSXRlbSIsIm91dEl0ZW0iLCJjb2xsZWN0aW9uS2V5IiwiZmlsdGVyIiwia2V5IiwicGFyc2VkQW5ub3RhdGlvbiIsInJldmVydFRlcm1Ub0dlbmVyaWNUeXBlIiwidW5hbGlhc2VkVGVybSIsInF1YWxpZmllZFNwbGl0IiwiYmFzZUFubm90YXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUErQk1BLEksR0FLTCxjQUFZQyxjQUFaLEVBQTRDQyxVQUE1QyxFQUFnRTtBQUFBOztBQUMvRCxTQUFLQyxJQUFMLEdBQVlGLGNBQWMsQ0FBQ0QsSUFBM0I7QUFDQSxTQUFLSSxJQUFMLEdBQVksTUFBWjtBQUNBLFNBQUtDLE9BQUwsR0FBZUgsVUFBZjtBQUNBLEc7O0FBR0YsTUFBTUksaUJBQW9DLEdBQUcsQ0FDNUM7QUFBRUMsSUFBQUEsS0FBSyxFQUFFLGNBQVQ7QUFBeUJDLElBQUFBLFNBQVMsRUFBRSwyQkFBcEM7QUFBaUVDLElBQUFBLEdBQUcsRUFBRTtBQUF0RSxHQUQ0QyxFQUU1QztBQUFFRCxJQUFBQSxTQUFTLEVBQUUsbUJBQWI7QUFBa0NELElBQUFBLEtBQUssRUFBRSxNQUF6QztBQUFpREUsSUFBQUEsR0FBRyxFQUFFO0FBQXRELEdBRjRDLEVBRzVDO0FBQUVELElBQUFBLFNBQVMsRUFBRSx1QkFBYjtBQUFzQ0QsSUFBQUEsS0FBSyxFQUFFLFVBQTdDO0FBQXlERSxJQUFBQSxHQUFHLEVBQUU7QUFBOUQsR0FINEMsRUFJNUM7QUFBRUQsSUFBQUEsU0FBUyxFQUFFLGdDQUFiO0FBQStDRCxJQUFBQSxLQUFLLEVBQUUsUUFBdEQ7QUFBZ0VFLElBQUFBLEdBQUcsRUFBRTtBQUFyRSxHQUo0QyxFQUs1QztBQUFFRCxJQUFBQSxTQUFTLEVBQUUsNEJBQWI7QUFBMkNELElBQUFBLEtBQUssRUFBRSxJQUFsRDtBQUF3REUsSUFBQUEsR0FBRyxFQUFFO0FBQTdELEdBTDRDLEVBTTVDO0FBQUVELElBQUFBLFNBQVMsRUFBRSxpQ0FBYjtBQUFnREQsSUFBQUEsS0FBSyxFQUFFLFNBQXZEO0FBQWtFRSxJQUFB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QUFyRTtBQUNBLEtBRk0sTUFFQTtBQUNOLDZDQUFZNkksY0FBWjtBQUE0Qi9LLFFBQUFBLEtBQUssRUFBRStKLHdCQUF3QixDQUFDeEssVUFBRCxFQUFhMkMsVUFBYjtBQUEzRDtBQUNBO0FBQ0QiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdEFubm90YXRpb24gYXMgRWRtQW5ub3RhdGlvbixcblx0QW5ub3RhdGlvbkxpc3QsXG5cdEFubm90YXRpb25SZWNvcmQsXG5cdEFubm90YXRpb25UZXJtLFxuXHRDb252ZXJ0ZXJPdXRwdXQsXG5cdEV4cHJlc3Npb24sXG5cdFBhcnNlck91dHB1dCxcblx0UGF0aEV4cHJlc3Npb24sXG5cdFByb3BlcnR5UGF0aCxcblx0UHJvcGVydHlWYWx1ZSxcblx0QW5ub3RhdGlvblBhdGhFeHByZXNzaW9uLFxuXHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoRXhwcmVzc2lvbixcblx0UHJvcGVydHlQYXRoRXhwcmVzc2lvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7XG5cdEFzc29jaWF0aW9uLFxuXHRHZW5lcmljTmF2aWdhdGlvblByb3BlcnR5LFxuXHRSZWZlcmVuY2UsXG5cdFYyTmF2aWdhdGlvblByb3BlcnR5LFxuXHRWNE5hdmlnYXRpb25Qcm9wZXJ0eVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvZGlzdC9QYXJzZXJcIjtcbmltcG9ydCB7XG5cdEFubm90YXRpb24sXG5cdEVudGl0eVR5cGUsXG5cdEFjdGlvbixcblx0RW50aXR5U2V0LFxuXHRQcm9wZXJ0eSxcblx0TmF2aWdhdGlvblByb3BlcnR5XG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9kaXN0L0NvbnZlcnRlclwiO1xuXG5jbGFzcyBQYXRoIHtcblx0cGF0aDogc3RyaW5nO1xuXHQkdGFyZ2V0OiBzdHJpbmc7XG5cdHR5cGU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3RvcihwYXRoRXhwcmVzc2lvbjogUGF0aEV4cHJlc3Npb24sIHRhcmdldE5hbWU6IHN0cmluZykge1xuXHRcdHRoaXMucGF0aCA9IHBhdGhFeHByZXNzaW9uLlBhdGg7XG5cdFx0dGhpcy50eXBlID0gXCJQYXRoXCI7XG5cdFx0dGhpcy4kdGFyZ2V0ID0gdGFyZ2V0TmFtZTtcblx0fVxufVxuXG5jb25zdCBkZWZhdWx0UmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAgPSBbXG5cdHsgYWxpYXM6IFwiQ2FwYWJpbGl0aWVzXCIsIG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxXCIsIHVyaTogXCJcIiB9LFxuXHR7IG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuQ29yZS5WMVwiLCBhbGlhczogXCJDb3JlXCIsIHVyaTogXCJcIiB9LFxuXHR7IG5hbWVzcGFjZTogXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjFcIiwgYWxpYXM6IFwiTWVhc3VyZXNcIiwgdXJpOiBcIlwiIH0sXG5cdHsgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MVwiLCBhbGlhczogXCJDb21tb25cIiwgdXJpOiBcIlwiIH0sXG5cdHsgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsIGFsaWFzOiBcIlVJXCIsIHVyaTogXCJcIiB9LFxuXHR7IG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxXCIsIGFsaWFzOiBcIlNlc3Npb25cIiwgdXJpOiBcIlwiIH0sXG5cdHsgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MVwiLCBhbGlhczogXCJBbmFseXRpY3NcIiwgdXJpOiBcIlwiIH0sXG5cdHsgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MVwiLCBhbGlhczogXCJQZXJzb25hbERhdGFcIiwgdXJpOiBcIlwiIH0sXG5cdHsgbmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjFcIiwgYWxpYXM6IFwiQ29tbXVuaWNhdGlvblwiLCB1cmk6IFwiXCIgfSxcblx0eyBuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuSFRNTDUudjFcIiwgYWxpYXM6IFwiSFRNTDVcIiwgdXJpOiBcIlwiIH1cbl07XG5cbnR5cGUgUmVmZXJlbmNlc1dpdGhNYXAgPSBSZWZlcmVuY2VbXSAmIHtcblx0cmVmZXJlbmNlTWFwPzogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPjtcblx0cmV2ZXJzZVJlZmVyZW5jZU1hcD86IFJlY29yZDxzdHJpbmcsIFJlZmVyZW5jZT47XG59O1xuXG5mdW5jdGlvbiBhbGlhcyhyZWZlcmVuY2VzOiBSZWZlcmVuY2VzV2l0aE1hcCwgdW5hbGlhc2VkVmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdGlmICghcmVmZXJlbmNlcy5yZXZlcnNlUmVmZXJlbmNlTWFwKSB7XG5cdFx0cmVmZXJlbmNlcy5yZXZlcnNlUmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcDogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPiwgcmVmZXJlbmNlKSA9PiB7XG5cdFx0XHRtYXBbcmVmZXJlbmNlLm5hbWVzcGFjZV0gPSByZWZlcmVuY2U7XG5cdFx0XHRyZXR1cm4gbWFwO1xuXHRcdH0sIHt9KTtcblx0fVxuXHRpZiAoIXVuYWxpYXNlZFZhbHVlKSB7XG5cdFx0cmV0dXJuIHVuYWxpYXNlZFZhbHVlO1xuXHR9XG5cdGNvbnN0IGxhc3REb3RJbmRleCA9IHVuYWxpYXNlZFZhbHVlLmxhc3RJbmRleE9mKFwiLlwiKTtcblx0Y29uc3QgbmFtZXNwYWNlID0gdW5hbGlhc2VkVmFsdWUuc3Vic3RyKDAsIGxhc3REb3RJbmRleCk7XG5cdGNvbnN0IHZhbHVlID0gdW5hbGlhc2VkVmFsdWUuc3Vic3RyKGxhc3REb3RJbmRleCArIDEpO1xuXHRjb25zdCByZWZlcmVuY2UgPSByZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXBbbmFtZXNwYWNlXTtcblx0aWYgKHJlZmVyZW5jZSkge1xuXHRcdHJldHVybiBgJHtyZWZlcmVuY2UuYWxpYXN9LiR7dmFsdWV9YDtcblx0fSBlbHNlIHtcblx0XHQvLyBUcnkgdG8gc2VlIGlmIGl0J3MgYW4gYW5ub3RhdGlvbiBQYXRoIGxpa2UgdG9fU2FsZXNPcmRlci9AVUkuTGluZUl0ZW1cblx0XHRpZiAodW5hbGlhc2VkVmFsdWUuaW5kZXhPZihcIkBcIikgIT09IC0xKSB7XG5cdFx0XHRjb25zdCBbcHJlQWxpYXMsIHBvc3RBbGlhc10gPSB1bmFsaWFzZWRWYWx1ZS5zcGxpdChcIkBcIik7XG5cdFx0XHRyZXR1cm4gYCR7cHJlQWxpYXN9QCR7YWxpYXMocmVmZXJlbmNlcywgcG9zdEFsaWFzKX1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5hbGlhc2VkVmFsdWU7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHVuYWxpYXMocmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAsIGFsaWFzZWRWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFyZWZlcmVuY2VzLnJlZmVyZW5jZU1hcCkge1xuXHRcdHJlZmVyZW5jZXMucmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcDogUmVjb3JkPHN0cmluZywgUmVmZXJlbmNlPiwgcmVmZXJlbmNlKSA9PiB7XG5cdFx0XHRtYXBbcmVmZXJlbmNlLmFsaWFzXSA9IHJlZmVyZW5jZTtcblx0XHRcdHJldHVybiBtYXA7XG5cdFx0fSwge30pO1xuXHR9XG5cdGlmICghYWxpYXNlZFZhbHVlKSB7XG5cdFx0cmV0dXJuIGFsaWFzZWRWYWx1ZTtcblx0fVxuXHRjb25zdCBbYWxpYXMsIHZhbHVlXSA9IGFsaWFzZWRWYWx1ZS5zcGxpdChcIi5cIik7XG5cdGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXMucmVmZXJlbmNlTWFwW2FsaWFzXTtcblx0aWYgKHJlZmVyZW5jZSkge1xuXHRcdHJldHVybiBgJHtyZWZlcmVuY2UubmFtZXNwYWNlfS4ke3ZhbHVlfWA7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gVHJ5IHRvIHNlZSBpZiBpdCdzIGFuIGFubm90YXRpb24gUGF0aCBsaWtlIHRvX1NhbGVzT3JkZXIvQFVJLkxpbmVJdGVtXG5cdFx0aWYgKGFsaWFzZWRWYWx1ZS5pbmRleE9mKFwiQFwiKSAhPT0gLTEpIHtcblx0XHRcdGNvbnN0IFtwcmVBbGlhcywgcG9zdEFsaWFzXSA9IGFsaWFzZWRWYWx1ZS5zcGxpdChcIkBcIik7XG5cdFx0XHRyZXR1cm4gYCR7cHJlQWxpYXN9QCR7dW5hbGlhcyhyZWZlcmVuY2VzLCBwb3N0QWxpYXMpfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhbGlhc2VkVmFsdWU7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkT2JqZWN0TWFwKHBhcnNlck91dHB1dDogUGFyc2VyT3V0cHV0KTogUmVjb3JkPHN0cmluZywgYW55PiB7XG5cdGNvbnN0IG9iamVjdE1hcDogYW55ID0ge307XG5cdGlmIChwYXJzZXJPdXRwdXQuc2NoZW1hLmVudGl0eUNvbnRhaW5lciAmJiBwYXJzZXJPdXRwdXQuc2NoZW1hLmVudGl0eUNvbnRhaW5lci5mdWxseVF1YWxpZmllZE5hbWUpIHtcblx0XHRvYmplY3RNYXBbcGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlDb250YWluZXIuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHBhcnNlck91dHB1dC5zY2hlbWEuZW50aXR5Q29udGFpbmVyO1xuXHR9XG5cdHBhcnNlck91dHB1dC5zY2hlbWEuZW50aXR5U2V0cy5mb3JFYWNoKGVudGl0eVNldCA9PiB7XG5cdFx0b2JqZWN0TWFwW2VudGl0eVNldC5mdWxseVF1YWxpZmllZE5hbWVdID0gZW50aXR5U2V0O1xuXHR9KTtcblx0cGFyc2VyT3V0cHV0LnNjaGVtYS5hY3Rpb25zLmZvckVhY2goYWN0aW9uID0+IHtcblx0XHRvYmplY3RNYXBbYWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBhY3Rpb247XG5cdFx0YWN0aW9uLnBhcmFtZXRlcnMuZm9yRWFjaChwYXJhbWV0ZXIgPT4ge1xuXHRcdFx0b2JqZWN0TWFwW3BhcmFtZXRlci5mdWxseVF1YWxpZmllZE5hbWVdID0gcGFyYW1ldGVyO1xuXHRcdH0pO1xuXHR9KTtcblx0cGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlUeXBlcy5mb3JFYWNoKGVudGl0eVR5cGUgPT4ge1xuXHRcdG9iamVjdE1hcFtlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBlbnRpdHlUeXBlO1xuXHRcdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5mb3JFYWNoKHByb3BlcnR5ID0+IHtcblx0XHRcdG9iamVjdE1hcFtwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdID0gcHJvcGVydHk7XG5cdFx0fSk7XG5cdFx0ZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKG5hdlByb3BlcnR5ID0+IHtcblx0XHRcdG9iamVjdE1hcFtuYXZQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdID0gbmF2UHJvcGVydHk7XG5cdFx0fSk7XG5cdH0pO1xuXHRPYmplY3Qua2V5cyhwYXJzZXJPdXRwdXQuc2NoZW1hLmFubm90YXRpb25zKS5mb3JFYWNoKGFubm90YXRpb25Tb3VyY2UgPT4ge1xuXHRcdHBhcnNlck91dHB1dC5zY2hlbWEuYW5ub3RhdGlvbnNbYW5ub3RhdGlvblNvdXJjZV0uZm9yRWFjaChhbm5vdGF0aW9uTGlzdCA9PiB7XG5cdFx0XHRjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9IHVuYWxpYXMocGFyc2VyT3V0cHV0LnJlZmVyZW5jZXMsIGFubm90YXRpb25MaXN0LnRhcmdldCk7XG5cdFx0XHRhbm5vdGF0aW9uTGlzdC5hbm5vdGF0aW9ucy5mb3JFYWNoKGFubm90YXRpb24gPT4ge1xuXHRcdFx0XHRsZXQgYW5ub3RhdGlvbkZRTiA9IGAke2N1cnJlbnRUYXJnZXROYW1lfUAke3VuYWxpYXMocGFyc2VyT3V0cHV0LnJlZmVyZW5jZXMsIGFubm90YXRpb24udGVybSl9YDtcblx0XHRcdFx0aWYgKGFubm90YXRpb24ucXVhbGlmaWVyKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbkZRTiArPSBgIyR7YW5ub3RhdGlvbi5xdWFsaWZpZXJ9YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRvYmplY3RNYXBbYW5ub3RhdGlvbkZRTl0gPSBhbm5vdGF0aW9uO1xuXHRcdFx0XHQoYW5ub3RhdGlvbiBhcyBBbm5vdGF0aW9uKS5mdWxseVF1YWxpZmllZE5hbWUgPSBhbm5vdGF0aW9uRlFOO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0pO1xuXHRyZXR1cm4gb2JqZWN0TWFwO1xufVxuXG5mdW5jdGlvbiBjb21iaW5lUGF0aChjdXJyZW50VGFyZ2V0OiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdGlmIChwYXRoLnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG5cdFx0cmV0dXJuIGN1cnJlbnRUYXJnZXQgKyBwYXRoO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjdXJyZW50VGFyZ2V0ICsgXCIvXCIgKyBwYXRoO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVUYXJnZXQob2JqZWN0TWFwOiBhbnksIGN1cnJlbnRUYXJnZXQ6IGFueSwgcGF0aDogc3RyaW5nLCBwYXRoT25seTogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdGlmICghcGF0aCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoKTtcblxuXHRjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KFwiL1wiKTtcblx0bGV0IGN1cnJlbnRQYXRoID0gcGF0aDtcblx0Y29uc3QgdGFyZ2V0ID0gcGF0aFNwbGl0LnJlZHVjZSgoY3VycmVudFZhbHVlOiBhbnksIHBhdGhQYXJ0KSA9PiB7XG5cdFx0aWYgKCFjdXJyZW50VmFsdWUpIHtcblx0XHRcdGN1cnJlbnRQYXRoID0gcGF0aFBhcnQ7XG5cdFx0fSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09IFwiRW50aXR5U2V0XCIgJiYgY3VycmVudFZhbHVlLmVudGl0eVR5cGUpIHtcblx0XHRcdGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLmVudGl0eVR5cGUsIHBhdGhQYXJ0KTtcblx0XHR9IGVsc2UgaWYgKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJiBjdXJyZW50VmFsdWUudGFyZ2V0VHlwZU5hbWUpIHtcblx0XHRcdGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLnRhcmdldFR5cGVOYW1lLCBwYXRoUGFydCk7XG5cdFx0fSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiYgY3VycmVudFZhbHVlLnRhcmdldFR5cGUpIHtcblx0XHRcdGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLnRhcmdldFR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydCk7XG5cdFx0fSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0Y3VycmVudFBhdGggPSBjb21iaW5lUGF0aChcblx0XHRcdFx0Y3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUuc3Vic3RyKDAsIGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLmxhc3RJbmRleE9mKFwiL1wiKSksXG5cdFx0XHRcdHBhdGhQYXJ0XG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAoY3VycmVudFZhbHVlLl90eXBlID09PSBcIkFjdGlvblwiICYmIGN1cnJlbnRWYWx1ZS5pc0JvdW5kKSB7XG5cdFx0XHRjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcblx0XHRcdGlmICghb2JqZWN0TWFwW2N1cnJlbnRQYXRoXSkge1xuXHRcdFx0XHRjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5zb3VyY2VUeXBlLCBwYXRoUGFydCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09IFwiQWN0aW9uUGFyYW1ldGVyXCIgJiYgY3VycmVudFZhbHVlLmlzRW50aXR5U2V0KSB7XG5cdFx0XHRjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS50eXBlLCBwYXRoUGFydCk7XG5cdFx0fSBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09IFwiQWN0aW9uUGFyYW1ldGVyXCIgJiYgIWN1cnJlbnRWYWx1ZS5pc0VudGl0eVNldCkge1xuXHRcdFx0Y3VycmVudFBhdGggPSBjb21iaW5lUGF0aChcblx0XHRcdFx0Y3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUuc3Vic3RyKDAsIGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLmxhc3RJbmRleE9mKFwiL1wiKSksXG5cdFx0XHRcdHBhdGhQYXJ0XG5cdFx0XHQpO1xuXHRcdFx0aWYgKCFvYmplY3RNYXBbY3VycmVudFBhdGhdKSB7XG5cdFx0XHRcdGxldCBsYXN0SWR4ID0gY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUubGFzdEluZGV4T2YoXCIvXCIpO1xuXHRcdFx0XHRpZiAobGFzdElkeCA9PT0gLTEpIHtcblx0XHRcdFx0XHRsYXN0SWR4ID0gY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUubGVuZ3RoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoXG5cdFx0XHRcdFx0KG9iamVjdE1hcFtjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zdWJzdHIoMCwgbGFzdElkeCldIGFzIEFjdGlvbikuc291cmNlVHlwZSxcblx0XHRcdFx0XHRwYXRoUGFydFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcblx0XHRcdGlmIChjdXJyZW50VmFsdWVbcGF0aFBhcnRdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRWYWx1ZVtwYXRoUGFydF07XG5cdFx0XHR9IGVsc2UgaWYgKHBhdGhQYXJ0ID09PSBcIiRBbm5vdGF0aW9uUGF0aFwiICYmIGN1cnJlbnRWYWx1ZS4kdGFyZ2V0KSB7XG5cdFx0XHRcdHJldHVybiBjdXJyZW50VmFsdWUuJHRhcmdldDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9iamVjdE1hcFtjdXJyZW50UGF0aF07XG5cdH0sIG51bGwpO1xuXHRpZiAoIXRhcmdldCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWlzc2luZyB0YXJnZXQgXCIgKyBwYXRoKTtcblx0fVxuXHRpZiAocGF0aE9ubHkpIHtcblx0XHRyZXR1cm4gY3VycmVudFBhdGg7XG5cdH1cblx0cmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gaXNBbm5vdGF0aW9uUGF0aChwYXRoU3RyOiBzdHJpbmcpOiBib29sZWFuIHtcblx0cmV0dXJuIHBhdGhTdHIuaW5kZXhPZihcIkBcIikgIT09IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVZhbHVlKFxuXHRwcm9wZXJ0eVZhbHVlOiBFeHByZXNzaW9uLFxuXHR2YWx1ZUZRTjogc3RyaW5nLFxuXHRwYXJzZXJPdXRwdXQ6IFBhcnNlck91dHB1dCxcblx0Y3VycmVudFRhcmdldDogYW55LFxuXHRvYmplY3RNYXA6IGFueSxcblx0dG9SZXNvbHZlOiBSZXNvbHZlYWJsZVtdLFxuXHRhbm5vdGF0aW9uU291cmNlOiBzdHJpbmcsXG5cdHVucmVzb2x2ZWRBbm5vdGF0aW9uczogQW5ub3RhdGlvbkxpc3RbXVxuKSB7XG5cdGlmIChwcm9wZXJ0eVZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHN3aXRjaCAocHJvcGVydHlWYWx1ZS50eXBlKSB7XG5cdFx0Y2FzZSBcIlN0cmluZ1wiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWUuU3RyaW5nO1xuXHRcdGNhc2UgXCJJbnRcIjpcblx0XHRcdHJldHVybiBwcm9wZXJ0eVZhbHVlLkludDtcblx0XHRjYXNlIFwiQm9vbFwiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWUuQm9vbDtcblx0XHRjYXNlIFwiRGVjaW1hbFwiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWUuRGVjaW1hbDtcblx0XHRjYXNlIFwiRGF0ZVwiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWUuRGF0ZTtcblx0XHRjYXNlIFwiRW51bU1lbWJlclwiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWUuRW51bU1lbWJlcjtcblx0XHRjYXNlIFwiUHJvcGVydHlQYXRoXCI6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIlByb3BlcnR5UGF0aFwiLFxuXHRcdFx0XHR2YWx1ZTogcHJvcGVydHlWYWx1ZS5Qcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogdmFsdWVGUU4sXG5cdFx0XHRcdCR0YXJnZXQ6IHJlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLlByb3BlcnR5UGF0aClcblx0XHRcdH07XG5cdFx0Y2FzZSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiLFxuXHRcdFx0XHR2YWx1ZTogcHJvcGVydHlWYWx1ZS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuXHRcdFx0XHQkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY3VycmVudFRhcmdldCwgcHJvcGVydHlWYWx1ZS5OYXZpZ2F0aW9uUHJvcGVydHlQYXRoKVxuXHRcdFx0fTtcblx0XHRjYXNlIFwiQW5ub3RhdGlvblBhdGhcIjpcblx0XHRcdGNvbnN0IGFubm90YXRpb25UYXJnZXQgPSByZXNvbHZlVGFyZ2V0KFxuXHRcdFx0XHRvYmplY3RNYXAsXG5cdFx0XHRcdGN1cnJlbnRUYXJnZXQsXG5cdFx0XHRcdHVuYWxpYXMocGFyc2VyT3V0cHV0LnJlZmVyZW5jZXMsIHByb3BlcnR5VmFsdWUuQW5ub3RhdGlvblBhdGgpIGFzIHN0cmluZyxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGFubm90YXRpb25QYXRoID0ge1xuXHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdHZhbHVlOiBwcm9wZXJ0eVZhbHVlLkFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuXHRcdFx0XHQkdGFyZ2V0OiBhbm5vdGF0aW9uVGFyZ2V0XG5cdFx0XHR9O1xuXHRcdFx0dG9SZXNvbHZlLnB1c2goYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25QYXRoO1xuXHRcdGNhc2UgXCJQYXRoXCI6XG5cdFx0XHRpZiAoaXNBbm5vdGF0aW9uUGF0aChwcm9wZXJ0eVZhbHVlLlBhdGgpKSB7XG5cdFx0XHRcdC8vIElmIGl0J3MgYW4gYW5udG9hdGlvbiB0aGF0IHdlIGNhbiByZXNvbHZlLCByZXNvbHZlIGl0ICFcblx0XHRcdFx0Y29uc3QgJHRhcmdldCA9IHJlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLlBhdGgpO1xuXHRcdFx0XHRpZiAoJHRhcmdldCkge1xuXHRcdFx0XHRcdHJldHVybiAkdGFyZ2V0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb25zdCAkdGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGN1cnJlbnRUYXJnZXQsIHByb3BlcnR5VmFsdWUuUGF0aCwgdHJ1ZSk7XG5cdFx0XHRjb25zdCBwYXRoID0gbmV3IFBhdGgocHJvcGVydHlWYWx1ZSwgJHRhcmdldCk7XG5cdFx0XHR0b1Jlc29sdmUucHVzaChwYXRoKTtcblx0XHRcdHJldHVybiBwYXRoO1xuXG5cdFx0Y2FzZSBcIlJlY29yZFwiOlxuXHRcdFx0cmV0dXJuIHBhcnNlUmVjb3JkKFxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlLlJlY29yZCxcblx0XHRcdFx0dmFsdWVGUU4sXG5cdFx0XHRcdHBhcnNlck91dHB1dCxcblx0XHRcdFx0Y3VycmVudFRhcmdldCxcblx0XHRcdFx0b2JqZWN0TWFwLFxuXHRcdFx0XHR0b1Jlc29sdmUsXG5cdFx0XHRcdGFubm90YXRpb25Tb3VyY2UsXG5cdFx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9uc1xuXHRcdFx0KTtcblx0XHRjYXNlIFwiQ29sbGVjdGlvblwiOlxuXHRcdFx0cmV0dXJuIHBhcnNlQ29sbGVjdGlvbihcblx0XHRcdFx0cHJvcGVydHlWYWx1ZS5Db2xsZWN0aW9uLFxuXHRcdFx0XHR2YWx1ZUZRTixcblx0XHRcdFx0cGFyc2VyT3V0cHV0LFxuXHRcdFx0XHRjdXJyZW50VGFyZ2V0LFxuXHRcdFx0XHRvYmplY3RNYXAsXG5cdFx0XHRcdHRvUmVzb2x2ZSxcblx0XHRcdFx0YW5ub3RhdGlvblNvdXJjZSxcblx0XHRcdFx0dW5yZXNvbHZlZEFubm90YXRpb25zXG5cdFx0XHQpO1xuXHRcdGNhc2UgXCJBcHBseVwiOlxuXHRcdGNhc2UgXCJJZlwiOlxuXHRcdFx0cmV0dXJuIHByb3BlcnR5VmFsdWU7XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VSZWNvcmQoXG5cdHJlY29yZERlZmluaXRpb246IEFubm90YXRpb25SZWNvcmQsXG5cdGN1cnJlbnRGUU46IHN0cmluZyxcblx0cGFyc2VyT3V0cHV0OiBQYXJzZXJPdXRwdXQsXG5cdGN1cnJlbnRUYXJnZXQ6IGFueSxcblx0b2JqZWN0TWFwOiBhbnksXG5cdHRvUmVzb2x2ZTogUmVzb2x2ZWFibGVbXSxcblx0YW5ub3RhdGlvblNvdXJjZTogc3RyaW5nLFxuXHR1bnJlc29sdmVkQW5ub3RhdGlvbnM6IEFubm90YXRpb25MaXN0W11cbikge1xuXHRjb25zdCBhbm5vdGF0aW9uVGVybTogYW55ID0ge1xuXHRcdCRUeXBlOiB1bmFsaWFzKHBhcnNlck91dHB1dC5yZWZlcmVuY2VzLCByZWNvcmREZWZpbml0aW9uLnR5cGUpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogY3VycmVudEZRTlxuXHR9O1xuXHRjb25zdCBhbm5vdGF0aW9uQ29udGVudDogYW55ID0ge307XG5cdGlmIChyZWNvcmREZWZpbml0aW9uLmFubm90YXRpb25zICYmIEFycmF5LmlzQXJyYXkocmVjb3JkRGVmaW5pdGlvbi5hbm5vdGF0aW9ucykpIHtcblx0XHRjb25zdCBzdWJBbm5vdGF0aW9uTGlzdCA9IHtcblx0XHRcdHRhcmdldDogY3VycmVudEZRTixcblx0XHRcdGFubm90YXRpb25zOiByZWNvcmREZWZpbml0aW9uLmFubm90YXRpb25zLFxuXHRcdFx0X19zb3VyY2U6IGFubm90YXRpb25Tb3VyY2Vcblx0XHR9O1xuXHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKHN1YkFubm90YXRpb25MaXN0KTtcblx0fVxuXHRyZWNvcmREZWZpbml0aW9uLnByb3BlcnR5VmFsdWVzLmZvckVhY2goKHByb3BlcnR5VmFsdWU6IFByb3BlcnR5VmFsdWUpID0+IHtcblx0XHRhbm5vdGF0aW9uQ29udGVudFtwcm9wZXJ0eVZhbHVlLm5hbWVdID0gcGFyc2VWYWx1ZShcblx0XHRcdHByb3BlcnR5VmFsdWUudmFsdWUsXG5cdFx0XHRgJHtjdXJyZW50RlFOfS8ke3Byb3BlcnR5VmFsdWUubmFtZX1gLFxuXHRcdFx0cGFyc2VyT3V0cHV0LFxuXHRcdFx0Y3VycmVudFRhcmdldCxcblx0XHRcdG9iamVjdE1hcCxcblx0XHRcdHRvUmVzb2x2ZSxcblx0XHRcdGFubm90YXRpb25Tb3VyY2UsXG5cdFx0XHR1bnJlc29sdmVkQW5ub3RhdGlvbnNcblx0XHQpO1xuXHRcdGlmIChwcm9wZXJ0eVZhbHVlLmFubm90YXRpb25zICYmIEFycmF5LmlzQXJyYXkocHJvcGVydHlWYWx1ZS5hbm5vdGF0aW9ucykpIHtcblx0XHRcdGNvbnN0IHN1YkFubm90YXRpb25MaXN0ID0ge1xuXHRcdFx0XHR0YXJnZXQ6IGAke2N1cnJlbnRGUU59LyR7cHJvcGVydHlWYWx1ZS5uYW1lfWAsXG5cdFx0XHRcdGFubm90YXRpb25zOiBwcm9wZXJ0eVZhbHVlLmFubm90YXRpb25zLFxuXHRcdFx0XHRfX3NvdXJjZTogYW5ub3RhdGlvblNvdXJjZVxuXHRcdFx0fTtcblx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKHN1YkFubm90YXRpb25MaXN0KTtcblx0XHR9XG5cdFx0aWYgKFxuXHRcdFx0YW5ub3RhdGlvbkNvbnRlbnQuaGFzT3duUHJvcGVydHkoXCJBY3Rpb25cIikgJiZcblx0XHRcdChhbm5vdGF0aW9uVGVybS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiB8fFxuXHRcdFx0XHRhbm5vdGF0aW9uVGVybS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCIpXG5cdFx0KSB7XG5cdFx0XHRpZiAoY3VycmVudFRhcmdldC5hY3Rpb25zKSB7XG5cdFx0XHRcdGFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCA9IGN1cnJlbnRUYXJnZXQuYWN0aW9uc1thbm5vdGF0aW9uQ29udGVudC5BY3Rpb25dO1xuXHRcdFx0XHRpZiAoIWFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCkge1xuXHRcdFx0XHRcdC8vIEFkZCB0byBkaWFnbm9zdGljcyBkZWJ1Z2dlcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBPYmplY3QuYXNzaWduKGFubm90YXRpb25UZXJtLCBhbm5vdGF0aW9uQ29udGVudCk7XG59XG5cbmV4cG9ydCB0eXBlIENvbGxlY3Rpb25UeXBlID1cblx0fCBcIlByb3BlcnR5UGF0aFwiXG5cdHwgXCJQYXRoXCJcblx0fCBcIkFubm90YXRpb25QYXRoXCJcblx0fCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIlxuXHR8IFwiUmVjb3JkXCJcblx0fCBcIlN0cmluZ1wiXG5cdHwgXCJFbXB0eUNvbGxlY3Rpb25cIjtcblxuZnVuY3Rpb24gZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlKGNvbGxlY3Rpb25EZWZpbml0aW9uOiBhbnlbXSk6IENvbGxlY3Rpb25UeXBlIHtcblx0bGV0IHR5cGU6IENvbGxlY3Rpb25UeXBlID0gKGNvbGxlY3Rpb25EZWZpbml0aW9uIGFzIGFueSkudHlwZTtcblx0aWYgKHR5cGUgPT09IHVuZGVmaW5lZCAmJiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgZmlyc3RDb2xJdGVtID0gY29sbGVjdGlvbkRlZmluaXRpb25bMF07XG5cdFx0aWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eShcIlByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0dHlwZSA9IFwiUHJvcGVydHlQYXRoXCI7XG5cdFx0fSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoXCJQYXRoXCIpKSB7XG5cdFx0XHR0eXBlID0gXCJQYXRoXCI7XG5cdFx0fSBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoXCJBbm5vdGF0aW9uUGF0aFwiKSkge1xuXHRcdFx0dHlwZSA9IFwiQW5ub3RhdGlvblBhdGhcIjtcblx0XHR9IGVsc2UgaWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eShcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdHR5cGUgPSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0dHlwZW9mIGZpcnN0Q29sSXRlbSA9PT0gXCJvYmplY3RcIiAmJlxuXHRcdFx0KGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eShcInR5cGVcIikgfHwgZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KFwicHJvcGVydHlWYWx1ZXNcIikpXG5cdFx0KSB7XG5cdFx0XHR0eXBlID0gXCJSZWNvcmRcIjtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdH1cblx0fSBlbHNlIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcblx0XHR0eXBlID0gXCJFbXB0eUNvbGxlY3Rpb25cIjtcblx0fVxuXHRyZXR1cm4gdHlwZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VDb2xsZWN0aW9uKFxuXHRjb2xsZWN0aW9uRGVmaW5pdGlvbjogYW55W10sXG5cdHBhcmVudEZRTjogc3RyaW5nLFxuXHRwYXJzZXJPdXRwdXQ6IFBhcnNlck91dHB1dCxcblx0Y3VycmVudFRhcmdldDogYW55LFxuXHRvYmplY3RNYXA6IGFueSxcblx0dG9SZXNvbHZlOiBSZXNvbHZlYWJsZVtdLFxuXHRhbm5vdGF0aW9uU291cmNlOiBzdHJpbmcsXG5cdHVucmVzb2x2ZWRBbm5vdGF0aW9uczogQW5ub3RhdGlvbkxpc3RbXVxuKSB7XG5cdGNvbnN0IGNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSA9IGdldE9ySW5mZXJDb2xsZWN0aW9uVHlwZShjb2xsZWN0aW9uRGVmaW5pdGlvbik7XG5cdHN3aXRjaCAoY29sbGVjdGlvbkRlZmluaXRpb25UeXBlKSB7XG5cdFx0Y2FzZSBcIlByb3BlcnR5UGF0aFwiOlxuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocHJvcGVydHlQYXRoLCBwcm9wZXJ0eUlkeCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHR5cGU6IFwiUHJvcGVydHlQYXRoXCIsXG5cdFx0XHRcdFx0dmFsdWU6IHByb3BlcnR5UGF0aC5Qcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7cHJvcGVydHlJZHh9YCxcblx0XHRcdFx0XHQkdGFyZ2V0OiByZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY3VycmVudFRhcmdldCwgcHJvcGVydHlQYXRoLlByb3BlcnR5UGF0aClcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGNhc2UgXCJQYXRoXCI6XG5cdFx0XHRyZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKHBhdGhWYWx1ZSA9PiB7XG5cdFx0XHRcdGlmIChpc0Fubm90YXRpb25QYXRoKHBhdGhWYWx1ZS5QYXRoKSkge1xuXHRcdFx0XHRcdC8vIElmIGl0J3MgYW4gYW5udG9hdGlvbiB0aGF0IHdlIGNhbiByZXNvbHZlLCByZXNvbHZlIGl0ICFcblx0XHRcdFx0XHRjb25zdCAkdGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGN1cnJlbnRUYXJnZXQsIHBhdGhWYWx1ZS5QYXRoKTtcblx0XHRcdFx0XHRpZiAoJHRhcmdldCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICR0YXJnZXQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0ICR0YXJnZXQgPSByZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY3VycmVudFRhcmdldCwgcGF0aFZhbHVlLlBhdGgsIHRydWUpO1xuXHRcdFx0XHRjb25zdCBwYXRoID0gbmV3IFBhdGgocGF0aFZhbHVlLCAkdGFyZ2V0KTtcblx0XHRcdFx0dG9SZXNvbHZlLnB1c2gocGF0aCk7XG5cdFx0XHRcdHJldHVybiBwYXRoO1xuXHRcdFx0fSk7XG5cdFx0Y2FzZSBcIkFubm90YXRpb25QYXRoXCI6XG5cdFx0XHRyZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChhbm5vdGF0aW9uUGF0aCwgYW5ub3RhdGlvbklkeCkgPT4ge1xuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uVGFyZ2V0ID0gcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGN1cnJlbnRUYXJnZXQsIGFubm90YXRpb25QYXRoLkFubm90YXRpb25QYXRoLCB0cnVlKTtcblx0XHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbGxlY3Rpb25FbGVtZW50ID0ge1xuXHRcdFx0XHRcdHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIixcblx0XHRcdFx0XHR2YWx1ZTogYW5ub3RhdGlvblBhdGguQW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7YW5ub3RhdGlvbklkeH1gLFxuXHRcdFx0XHRcdCR0YXJnZXQ6IGFubm90YXRpb25UYXJnZXRcblx0XHRcdFx0fTtcblx0XHRcdFx0dG9SZXNvbHZlLnB1c2goYW5ub3RhdGlvbkNvbGxlY3Rpb25FbGVtZW50KTtcblx0XHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2xsZWN0aW9uRWxlbWVudDtcblx0XHRcdH0pO1xuXHRcdGNhc2UgXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI6XG5cdFx0XHRyZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChuYXZQcm9wZXJ0eVBhdGgsIG5hdlByb3BJZHgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIixcblx0XHRcdFx0XHR2YWx1ZTogbmF2UHJvcGVydHlQYXRoLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7bmF2UHJvcElkeH1gLFxuXHRcdFx0XHRcdCR0YXJnZXQ6IHJlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjdXJyZW50VGFyZ2V0LCBuYXZQcm9wZXJ0eVBhdGguTmF2aWdhdGlvblByb3BlcnR5UGF0aClcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdGNhc2UgXCJSZWNvcmRcIjpcblx0XHRcdHJldHVybiBjb2xsZWN0aW9uRGVmaW5pdGlvbi5tYXAoKHJlY29yZERlZmluaXRpb24sIHJlY29yZElkeCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VSZWNvcmQoXG5cdFx0XHRcdFx0cmVjb3JkRGVmaW5pdGlvbixcblx0XHRcdFx0XHRgJHtwYXJlbnRGUU59LyR7cmVjb3JkSWR4fWAsXG5cdFx0XHRcdFx0cGFyc2VyT3V0cHV0LFxuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQsXG5cdFx0XHRcdFx0b2JqZWN0TWFwLFxuXHRcdFx0XHRcdHRvUmVzb2x2ZSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uU291cmNlLFxuXHRcdFx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9uc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0Y2FzZSBcIlN0cmluZ1wiOlxuXHRcdFx0cmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcChzdHJpbmdWYWx1ZSA9PiB7XG5cdFx0XHRcdHJldHVybiBzdHJpbmdWYWx1ZTtcblx0XHRcdH0pO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRpZiAoY29sbGVjdGlvbkRlZmluaXRpb24ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH1cblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuc3VwcG9ydGVkIGNhc2VcIik7XG5cdH1cbn1cblxudHlwZSBSZXNvbHZlYWJsZSA9IHtcblx0JHRhcmdldDogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gY29udmVydEFubm90YXRpb24oXG5cdGFubm90YXRpb246IEFubm90YXRpb24sXG5cdHBhcnNlck91dHB1dDogUGFyc2VyT3V0cHV0LFxuXHRjdXJyZW50VGFyZ2V0OiBhbnksXG5cdG9iamVjdE1hcDogYW55LFxuXHR0b1Jlc29sdmU6IFJlc29sdmVhYmxlW10sXG5cdGFubm90YXRpb25Tb3VyY2U6IHN0cmluZyxcblx0dW5yZXNvbHZlZEFubm90YXRpb25zOiBBbm5vdGF0aW9uTGlzdFtdXG4pOiBhbnkge1xuXHRpZiAoYW5ub3RhdGlvbi5yZWNvcmQpIHtcblx0XHRjb25zdCBhbm5vdGF0aW9uVGVybTogYW55ID0ge1xuXHRcdFx0JFR5cGU6IHVuYWxpYXMocGFyc2VyT3V0cHV0LnJlZmVyZW5jZXMsIGFubm90YXRpb24ucmVjb3JkLnR5cGUpLFxuXHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdHF1YWxpZmllcjogYW5ub3RhdGlvbi5xdWFsaWZpZXJcblx0XHR9O1xuXHRcdGNvbnN0IGFubm90YXRpb25Db250ZW50OiBhbnkgPSB7fTtcblx0XHRhbm5vdGF0aW9uLnJlY29yZC5wcm9wZXJ0eVZhbHVlcy5mb3JFYWNoKChwcm9wZXJ0eVZhbHVlOiBQcm9wZXJ0eVZhbHVlKSA9PiB7XG5cdFx0XHRhbm5vdGF0aW9uQ29udGVudFtwcm9wZXJ0eVZhbHVlLm5hbWVdID0gcGFyc2VWYWx1ZShcblx0XHRcdFx0cHJvcGVydHlWYWx1ZS52YWx1ZSxcblx0XHRcdFx0YCR7YW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWV9LyR7cHJvcGVydHlWYWx1ZS5uYW1lfWAsXG5cdFx0XHRcdHBhcnNlck91dHB1dCxcblx0XHRcdFx0Y3VycmVudFRhcmdldCxcblx0XHRcdFx0b2JqZWN0TWFwLFxuXHRcdFx0XHR0b1Jlc29sdmUsXG5cdFx0XHRcdGFubm90YXRpb25Tb3VyY2UsXG5cdFx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9uc1xuXHRcdFx0KTtcblx0XHRcdGlmIChcblx0XHRcdFx0YW5ub3RhdGlvbkNvbnRlbnQuaGFzT3duUHJvcGVydHkoXCJBY3Rpb25cIikgJiZcblx0XHRcdFx0KCFhbm5vdGF0aW9uLnJlY29yZCB8fFxuXHRcdFx0XHRcdGFubm90YXRpb25UZXJtLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRcdFx0YW5ub3RhdGlvblRlcm0uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGlmIChjdXJyZW50VGFyZ2V0LmFjdGlvbnMpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uQ29udGVudC5BY3Rpb25UYXJnZXQgPSBjdXJyZW50VGFyZ2V0LmFjdGlvbnNbYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uXTtcblx0XHRcdFx0XHRpZiAoIWFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCkge1xuXHRcdFx0XHRcdFx0Ly8gQWRkIHRvIGRpYWdub3N0aWNzXG5cdFx0XHRcdFx0XHQvLyBkZWJ1Z2dlcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihhbm5vdGF0aW9uVGVybSwgYW5ub3RhdGlvbkNvbnRlbnQpO1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb24uY29sbGVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0aWYgKGFubm90YXRpb24udmFsdWUpIHtcblx0XHRcdHJldHVybiBwYXJzZVZhbHVlKFxuXHRcdFx0XHRhbm5vdGF0aW9uLnZhbHVlLFxuXHRcdFx0XHRhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0cGFyc2VyT3V0cHV0LFxuXHRcdFx0XHRjdXJyZW50VGFyZ2V0LFxuXHRcdFx0XHRvYmplY3RNYXAsXG5cdFx0XHRcdHRvUmVzb2x2ZSxcblx0XHRcdFx0YW5ub3RhdGlvblNvdXJjZSxcblx0XHRcdFx0dW5yZXNvbHZlZEFubm90YXRpb25zXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbi5jb2xsZWN0aW9uKSB7XG5cdFx0Y29uc3QgY29sbGVjdGlvbjogYW55ID0gcGFyc2VDb2xsZWN0aW9uKFxuXHRcdFx0YW5ub3RhdGlvbi5jb2xsZWN0aW9uLFxuXHRcdFx0YW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRwYXJzZXJPdXRwdXQsXG5cdFx0XHRjdXJyZW50VGFyZ2V0LFxuXHRcdFx0b2JqZWN0TWFwLFxuXHRcdFx0dG9SZXNvbHZlLFxuXHRcdFx0YW5ub3RhdGlvblNvdXJjZSxcblx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9uc1xuXHRcdCk7XG5cdFx0Y29sbGVjdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgPSBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0XHRyZXR1cm4gY29sbGVjdGlvbjtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZCBjYXNlXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlc29sdmVQYXRoRm4oZW50aXR5VHlwZTogRW50aXR5VHlwZSwgb2JqZWN0TWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG5cdHJldHVybiBmdW5jdGlvbihyZWxhdGl2ZVBhdGg6IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHJlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBlbnRpdHlUeXBlLCByZWxhdGl2ZVBhdGgpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlTmF2aWdhdGlvblByb3BlcnRpZXMoXG5cdGVudGl0eVR5cGVzOiBFbnRpdHlUeXBlW10sXG5cdGFzc29jaWF0aW9uczogQXNzb2NpYXRpb25bXSxcblx0b2JqZWN0TWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG4pOiB2b2lkIHtcblx0ZW50aXR5VHlwZXMuZm9yRWFjaChlbnRpdHlUeXBlID0+IHtcblx0XHRlbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5tYXAobmF2UHJvcCA9PiB7XG5cdFx0XHRjb25zdCBvdXROYXZQcm9wOiBQYXJ0aWFsPE5hdmlnYXRpb25Qcm9wZXJ0eT4gPSB7XG5cdFx0XHRcdF90eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLFxuXHRcdFx0XHRuYW1lOiBuYXZQcm9wLm5hbWUsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogbmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdHBhcnRuZXI6IChuYXZQcm9wIGFzIGFueSkuaGFzT3duUHJvcGVydHkoXCJwYXJ0bmVyXCIpID8gKG5hdlByb3AgYXMgYW55KS5wYXJ0bmVyIDogdW5kZWZpbmVkLFxuXHRcdFx0XHQvLyB0YXJnZXRUeXBlTmFtZTogRnVsbHlRdWFsaWZpZWROYW1lO1xuXHRcdFx0XHQvLyB0YXJnZXRUeXBlOiBFbnRpdHlUeXBlO1xuXHRcdFx0XHRpc0NvbGxlY3Rpb246IChuYXZQcm9wIGFzIGFueSkuaGFzT3duUHJvcGVydHkoXCJpc0NvbGxlY3Rpb25cIikgPyAobmF2UHJvcCBhcyBhbnkpLmlzQ29sbGVjdGlvbiA6IGZhbHNlLFxuXHRcdFx0XHRjb250YWluc1RhcmdldDogKG5hdlByb3AgYXMgYW55KS5oYXNPd25Qcm9wZXJ0eShcImNvbnRhaW5zVGFyZ2V0XCIpXG5cdFx0XHRcdFx0PyAobmF2UHJvcCBhcyBhbnkpLmNvbnRhaW5zVGFyZ2V0XG5cdFx0XHRcdFx0OiBmYWxzZSxcblx0XHRcdFx0cmVmZXJlbnRpYWxDb25zdHJhaW50OiAobmF2UHJvcCBhcyBhbnkpLnJlZmVyZW50aWFsQ29uc3RyYWludFxuXHRcdFx0XHRcdD8gKG5hdlByb3AgYXMgYW55KS5yZWZlcmVudGlhbENvbnN0cmFpbnRcblx0XHRcdFx0XHQ6IFtdXG5cdFx0XHR9O1xuXHRcdFx0aWYgKChuYXZQcm9wIGFzIEdlbmVyaWNOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGVOYW1lKSB7XG5cdFx0XHRcdG91dE5hdlByb3AudGFyZ2V0VHlwZSA9IG9iamVjdE1hcFsobmF2UHJvcCBhcyBWNE5hdmlnYXRpb25Qcm9wZXJ0eSkudGFyZ2V0VHlwZU5hbWVdO1xuXHRcdFx0fSBlbHNlIGlmICgobmF2UHJvcCBhcyBWMk5hdmlnYXRpb25Qcm9wZXJ0eSkucmVsYXRpb25zaGlwKSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldEFzc29jaWF0aW9uID0gYXNzb2NpYXRpb25zLmZpbmQoXG5cdFx0XHRcdFx0YXNzb2NpYXRpb24gPT4gYXNzb2NpYXRpb24uZnVsbHlRdWFsaWZpZWROYW1lID09PSAobmF2UHJvcCBhcyBWMk5hdmlnYXRpb25Qcm9wZXJ0eSkucmVsYXRpb25zaGlwXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICh0YXJnZXRBc3NvY2lhdGlvbikge1xuXHRcdFx0XHRcdGNvbnN0IGFzc29jaWF0aW9uRW5kID0gdGFyZ2V0QXNzb2NpYXRpb24uYXNzb2NpYXRpb25FbmQuZmluZChcblx0XHRcdFx0XHRcdGVuZCA9PiBlbmQucm9sZSA9PT0gKG5hdlByb3AgYXMgVjJOYXZpZ2F0aW9uUHJvcGVydHkpLnRvUm9sZVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0aWYgKGFzc29jaWF0aW9uRW5kKSB7XG5cdFx0XHRcdFx0XHRvdXROYXZQcm9wLnRhcmdldFR5cGUgPSBvYmplY3RNYXBbYXNzb2NpYXRpb25FbmQudHlwZV07XG5cdFx0XHRcdFx0XHRvdXROYXZQcm9wLmlzQ29sbGVjdGlvbiA9IGFzc29jaWF0aW9uRW5kLm11bHRpcGxpY2l0eSA9PT0gXCIqXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob3V0TmF2UHJvcC50YXJnZXRUeXBlKSB7XG5cdFx0XHRcdG91dE5hdlByb3AudGFyZ2V0VHlwZU5hbWUgPSBvdXROYXZQcm9wLnRhcmdldFR5cGUubmFtZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvdXROYXZQcm9wIGFzIE5hdmlnYXRpb25Qcm9wZXJ0eTtcblx0XHR9KTtcblx0XHRlbnRpdHlUeXBlLnJlc29sdmVQYXRoID0gY3JlYXRlUmVzb2x2ZVBhdGhGbihlbnRpdHlUeXBlIGFzIEVudGl0eVR5cGUsIG9iamVjdE1hcCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBsaW5rQWN0aW9uc1RvRW50aXR5VHlwZShuYW1lc3BhY2U6IHN0cmluZywgYWN0aW9uczogQWN0aW9uW10sIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuXHRhY3Rpb25zLmZvckVhY2goYWN0aW9uID0+IHtcblx0XHRpZiAoYWN0aW9uLmlzQm91bmQpIHtcblx0XHRcdGNvbnN0IHNvdXJjZUVudGl0eVR5cGUgPSBvYmplY3RNYXBbYWN0aW9uLnNvdXJjZVR5cGVdO1xuXHRcdFx0YWN0aW9uLnNvdXJjZUVudGl0eVR5cGUgPSBzb3VyY2VFbnRpdHlUeXBlO1xuXHRcdFx0aWYgKHNvdXJjZUVudGl0eVR5cGUpIHtcblx0XHRcdFx0aWYgKCFzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnMpIHtcblx0XHRcdFx0XHRzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnMgPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnNbYWN0aW9uLm5hbWVdID0gYWN0aW9uO1xuXHRcdFx0XHRzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnNbYCR7bmFtZXNwYWNlfS4ke2FjdGlvbi5uYW1lfWBdID0gYWN0aW9uO1xuXHRcdFx0fVxuXHRcdFx0YWN0aW9uLnJldHVybkVudGl0eVR5cGUgPSBvYmplY3RNYXBbYWN0aW9uLnJldHVyblR5cGVdO1xuXHRcdH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGxpbmtFbnRpdHlUeXBlVG9FbnRpdHlTZXQoZW50aXR5U2V0czogRW50aXR5U2V0W10sIG9iamVjdE1hcDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuXHRlbnRpdHlTZXRzLmZvckVhY2goZW50aXR5U2V0ID0+IHtcblx0XHRlbnRpdHlTZXQuZW50aXR5VHlwZSA9IG9iamVjdE1hcFtlbnRpdHlTZXQuZW50aXR5VHlwZU5hbWVdO1xuXHRcdGlmICghZW50aXR5U2V0LmFubm90YXRpb25zKSB7XG5cdFx0XHRlbnRpdHlTZXQuYW5ub3RhdGlvbnMgPSB7fTtcblx0XHR9XG5cdFx0aWYgKCFlbnRpdHlTZXQuZW50aXR5VHlwZS5hbm5vdGF0aW9ucykge1xuXHRcdFx0ZW50aXR5U2V0LmVudGl0eVR5cGUuYW5ub3RhdGlvbnMgPSB7fTtcblx0XHR9XG5cdFx0ZW50aXR5U2V0LmVudGl0eVR5cGUua2V5cy5mb3JFYWNoKChrZXlQcm9wOiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0a2V5UHJvcC5pc0tleSA9IHRydWU7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzcGxpdFRlcm0ocmVmZXJlbmNlczogUmVmZXJlbmNlc1dpdGhNYXAsIHRlcm1WYWx1ZTogc3RyaW5nKSB7XG5cdGNvbnN0IGFsaWFzZWRUZXJtID0gYWxpYXMocmVmZXJlbmNlcywgdGVybVZhbHVlKTtcblx0Y29uc3QgbGFzdERvdCA9IGFsaWFzZWRUZXJtLmxhc3RJbmRleE9mKFwiLlwiKTtcblx0bGV0IHRlcm1BbGlhcyA9IGFsaWFzZWRUZXJtLnN1YnN0cigwLCBsYXN0RG90KTtcblx0bGV0IHRlcm0gPSBhbGlhc2VkVGVybS5zdWJzdHIobGFzdERvdCArIDEpO1xuXHRyZXR1cm4gW3Rlcm1BbGlhcywgdGVybV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0VHlwZXMocGFyc2VyT3V0cHV0OiBQYXJzZXJPdXRwdXQpOiBDb252ZXJ0ZXJPdXRwdXQge1xuXHRjb25zdCBvYmplY3RNYXAgPSBidWlsZE9iamVjdE1hcChwYXJzZXJPdXRwdXQpO1xuXHRyZXNvbHZlTmF2aWdhdGlvblByb3BlcnRpZXMoXG5cdFx0cGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlUeXBlcyBhcyBFbnRpdHlUeXBlW10sXG5cdFx0cGFyc2VyT3V0cHV0LnNjaGVtYS5hc3NvY2lhdGlvbnMsXG5cdFx0b2JqZWN0TWFwXG5cdCk7XG5cdGxpbmtBY3Rpb25zVG9FbnRpdHlUeXBlKHBhcnNlck91dHB1dC5zY2hlbWEubmFtZXNwYWNlLCBwYXJzZXJPdXRwdXQuc2NoZW1hLmFjdGlvbnMgYXMgQWN0aW9uW10sIG9iamVjdE1hcCk7XG5cdGxpbmtFbnRpdHlUeXBlVG9FbnRpdHlTZXQocGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlTZXRzIGFzIEVudGl0eVNldFtdLCBvYmplY3RNYXApO1xuXHRjb25zdCB0b1Jlc29sdmU6IFJlc29sdmVhYmxlW10gPSBbXTtcblx0Y29uc3QgdW5yZXNvbHZlZEFubm90YXRpb25zOiBBbm5vdGF0aW9uTGlzdFtdID0gW107XG5cdE9iamVjdC5rZXlzKHBhcnNlck91dHB1dC5zY2hlbWEuYW5ub3RhdGlvbnMpLmZvckVhY2goYW5ub3RhdGlvblNvdXJjZSA9PiB7XG5cdFx0cGFyc2VyT3V0cHV0LnNjaGVtYS5hbm5vdGF0aW9uc1thbm5vdGF0aW9uU291cmNlXS5mb3JFYWNoKGFubm90YXRpb25MaXN0ID0+IHtcblx0XHRcdGNvbnN0IGN1cnJlbnRUYXJnZXROYW1lID0gdW5hbGlhcyhwYXJzZXJPdXRwdXQucmVmZXJlbmNlcywgYW5ub3RhdGlvbkxpc3QudGFyZ2V0KSBhcyBzdHJpbmc7XG5cdFx0XHRjb25zdCBjdXJyZW50VGFyZ2V0ID0gb2JqZWN0TWFwW2N1cnJlbnRUYXJnZXROYW1lXTtcblx0XHRcdGlmICghY3VycmVudFRhcmdldCkge1xuXHRcdFx0XHRpZiAoY3VycmVudFRhcmdldE5hbWUuaW5kZXhPZihcIkBcIikgIT09IC0xKSB7XG5cdFx0XHRcdFx0KGFubm90YXRpb25MaXN0IGFzIGFueSkuX19zb3VyY2UgPSBhbm5vdGF0aW9uU291cmNlO1xuXHRcdFx0XHRcdHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb25MaXN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY3VycmVudFRhcmdldCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAoIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0YW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaChhbm5vdGF0aW9uID0+IHtcblx0XHRcdFx0XHRjb25zdCBbdm9jQWxpYXMsIHZvY1Rlcm1dID0gc3BsaXRUZXJtKGRlZmF1bHRSZWZlcmVuY2VzLCBhbm5vdGF0aW9uLnRlcm0pO1xuXHRcdFx0XHRcdGlmICghY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc10pIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdID0ge307XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghY3VycmVudFRhcmdldC5hbm5vdGF0aW9ucy5fYW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zID0ge307XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgdm9jVGVybVdpdGhRdWFsaWZpZXIgPSBgJHt2b2NUZXJtfSR7YW5ub3RhdGlvbi5xdWFsaWZpZXIgPyBgIyR7YW5ub3RhdGlvbi5xdWFsaWZpZXJ9YCA6IFwiXCJ9YDtcblx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gPSBjb252ZXJ0QW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdGFubm90YXRpb24gYXMgQW5ub3RhdGlvbixcblx0XHRcdFx0XHRcdHBhcnNlck91dHB1dCxcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQsXG5cdFx0XHRcdFx0XHRvYmplY3RNYXAsXG5cdFx0XHRcdFx0XHR0b1Jlc29sdmUsXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uU291cmNlLFxuXHRcdFx0XHRcdFx0dW5yZXNvbHZlZEFubm90YXRpb25zXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gIT09IG51bGwgJiZcblx0XHRcdFx0XHRcdHR5cGVvZiBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gPT09IFwib2JqZWN0XCJcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS50ZXJtID0gdW5hbGlhcyhcblx0XHRcdFx0XHRcdFx0ZGVmYXVsdFJlZmVyZW5jZXMsXG5cdFx0XHRcdFx0XHRcdGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm19YFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5xdWFsaWZpZXIgPSBhbm5vdGF0aW9uLnF1YWxpZmllcjtcblx0XHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5fX3NvdXJjZSA9IGFubm90YXRpb25Tb3VyY2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGFubm90YXRpb25UYXJnZXQgPSBgJHtjdXJyZW50VGFyZ2V0TmFtZX1AJHt1bmFsaWFzKFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFJlZmVyZW5jZXMsXG5cdFx0XHRcdFx0XHR2b2NBbGlhcyArIFwiLlwiICsgdm9jVGVybVdpdGhRdWFsaWZpZXJcblx0XHRcdFx0XHQpfWA7XG5cdFx0XHRcdFx0aWYgKGFubm90YXRpb24uYW5ub3RhdGlvbnMgJiYgQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uLmFubm90YXRpb25zKSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViQW5ub3RhdGlvbkxpc3QgPSB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldDogYW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbnM6IGFubm90YXRpb24uYW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0XHRcdF9fc291cmNlOiBhbm5vdGF0aW9uU291cmNlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0dW5yZXNvbHZlZEFubm90YXRpb25zLnB1c2goc3ViQW5ub3RhdGlvbkxpc3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zLl9hbm5vdGF0aW9uc1tgJHt2b2NBbGlhc30uJHt2b2NUZXJtV2l0aFF1YWxpZmllcn1gXSA9XG5cdFx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl07XG5cdFx0XHRcdFx0b2JqZWN0TWFwW2Fubm90YXRpb25UYXJnZXRdID0gY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cdGNvbnN0IGV4dHJhVW5yZXNvbHZlZEFubm90YXRpb25zOiBBbm5vdGF0aW9uTGlzdFtdID0gW107XG5cdHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5mb3JFYWNoKGFubm90YXRpb25MaXN0ID0+IHtcblx0XHRjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9IHVuYWxpYXMocGFyc2VyT3V0cHV0LnJlZmVyZW5jZXMsIGFubm90YXRpb25MaXN0LnRhcmdldCkgYXMgc3RyaW5nO1xuXHRcdGxldCBbYmFzZU9iaiwgYW5ub3RhdGlvblBhcnRdID0gY3VycmVudFRhcmdldE5hbWUuc3BsaXQoXCJAXCIpO1xuXHRcdGNvbnN0IHRhcmdldFNwbGl0ID0gYW5ub3RhdGlvblBhcnQuc3BsaXQoXCIvXCIpO1xuXHRcdGJhc2VPYmogPSBiYXNlT2JqICsgXCJAXCIgKyB0YXJnZXRTcGxpdFswXTtcblx0XHRjb25zdCBjdXJyZW50VGFyZ2V0ID0gdGFyZ2V0U3BsaXQuc2xpY2UoMSkucmVkdWNlKChjdXJyZW50T2JqLCBwYXRoKSA9PiB7XG5cdFx0XHRpZiAoIWN1cnJlbnRPYmopIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY3VycmVudE9ialtwYXRoXTtcblx0XHR9LCBvYmplY3RNYXBbYmFzZU9ial0pO1xuXHRcdGlmICghY3VycmVudFRhcmdldCkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coXCJNaXNzaW5nIHRhcmdldCBhZ2FpbiBcIiArIGN1cnJlbnRUYXJnZXROYW1lKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBjdXJyZW50VGFyZ2V0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRpZiAoIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0Y3VycmVudFRhcmdldC5hbm5vdGF0aW9ucyA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0YW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaChhbm5vdGF0aW9uID0+IHtcblx0XHRcdFx0Y29uc3QgW3ZvY0FsaWFzLCB2b2NUZXJtXSA9IHNwbGl0VGVybShkZWZhdWx0UmVmZXJlbmNlcywgYW5ub3RhdGlvbi50ZXJtKTtcblx0XHRcdFx0aWYgKCFjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXSkge1xuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdID0ge307XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zLl9hbm5vdGF0aW9ucykge1xuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zID0ge307XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2b2NUZXJtV2l0aFF1YWxpZmllciA9IGAke3ZvY1Rlcm19JHthbm5vdGF0aW9uLnF1YWxpZmllciA/IGAjJHthbm5vdGF0aW9uLnF1YWxpZmllcn1gIDogXCJcIn1gO1xuXHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0gPSBjb252ZXJ0QW5ub3RhdGlvbihcblx0XHRcdFx0XHRhbm5vdGF0aW9uIGFzIEFubm90YXRpb24sXG5cdFx0XHRcdFx0cGFyc2VyT3V0cHV0LFxuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQsXG5cdFx0XHRcdFx0b2JqZWN0TWFwLFxuXHRcdFx0XHRcdHRvUmVzb2x2ZSxcblx0XHRcdFx0XHQoYW5ub3RhdGlvbkxpc3QgYXMgYW55KS5fX3NvdXJjZSxcblx0XHRcdFx0XHRleHRyYVVucmVzb2x2ZWRBbm5vdGF0aW9uc1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0Y3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdICE9PSBudWxsICYmXG5cdFx0XHRcdFx0dHlwZW9mIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSA9PT0gXCJvYmplY3RcIlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0udGVybSA9IHVuYWxpYXMoXG5cdFx0XHRcdFx0XHRkZWZhdWx0UmVmZXJlbmNlcyxcblx0XHRcdFx0XHRcdGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm19YFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Y3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLnF1YWxpZmllciA9IGFubm90YXRpb24ucXVhbGlmaWVyO1xuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW1xuXHRcdFx0XHRcdFx0dm9jVGVybVdpdGhRdWFsaWZpZXJcblx0XHRcdFx0XHRdLl9fc291cmNlID0gKGFubm90YXRpb25MaXN0IGFzIGFueSkuX19zb3VyY2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VycmVudFRhcmdldC5hbm5vdGF0aW9ucy5fYW5ub3RhdGlvbnNbYCR7dm9jQWxpYXN9LiR7dm9jVGVybVdpdGhRdWFsaWZpZXJ9YF0gPVxuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXTtcblx0XHRcdFx0b2JqZWN0TWFwW2Ake2N1cnJlbnRUYXJnZXROYW1lfUAke3VuYWxpYXMoZGVmYXVsdFJlZmVyZW5jZXMsIHZvY0FsaWFzICsgXCIuXCIgKyB2b2NUZXJtV2l0aFF1YWxpZmllcil9YF0gPVxuXHRcdFx0XHRcdGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG5cdHRvUmVzb2x2ZS5mb3JFYWNoKHJlc29sdmVhYmxlID0+IHtcblx0XHRjb25zdCB0YXJnZXRTdHIgPSByZXNvbHZlYWJsZS4kdGFyZ2V0O1xuXHRcdHJlc29sdmVhYmxlLiR0YXJnZXQgPSBvYmplY3RNYXBbdGFyZ2V0U3RyXTtcblx0fSk7XG5cdChwYXJzZXJPdXRwdXQgYXMgYW55KS5lbnRpdHlTZXRzID0gcGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlTZXRzO1xuXG5cdHJldHVybiB7XG5cdFx0dmVyc2lvbjogcGFyc2VyT3V0cHV0LnZlcnNpb24sXG5cdFx0YW5ub3RhdGlvbnM6IHBhcnNlck91dHB1dC5zY2hlbWEuYW5ub3RhdGlvbnMsXG5cdFx0bmFtZXNwYWNlOiBwYXJzZXJPdXRwdXQuc2NoZW1hLm5hbWVzcGFjZSxcblx0XHRhY3Rpb25zOiBwYXJzZXJPdXRwdXQuc2NoZW1hLmFjdGlvbnMgYXMgQWN0aW9uW10sXG5cdFx0ZW50aXR5U2V0czogcGFyc2VyT3V0cHV0LnNjaGVtYS5lbnRpdHlTZXRzIGFzIEVudGl0eVNldFtdLFxuXHRcdGVudGl0eVR5cGVzOiBwYXJzZXJPdXRwdXQuc2NoZW1hLmVudGl0eVR5cGVzIGFzIEVudGl0eVR5cGVbXSxcblx0XHRyZWZlcmVuY2VzOiBwYXJzZXJPdXRwdXQucmVmZXJlbmNlc1xuXHR9O1xufVxuXG5mdW5jdGlvbiByZXZlcnRWYWx1ZVRvR2VuZXJpY1R5cGUocmVmZXJlbmNlczogUmVmZXJlbmNlW10sIHZhbHVlOiBhbnkpOiBFeHByZXNzaW9uIHwgdW5kZWZpbmVkIHtcblx0bGV0IHJlc3VsdDogRXhwcmVzc2lvbiB8IHVuZGVmaW5lZDtcblx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdGlmICh2YWx1ZS5tYXRjaCgvXFx3K1xcLlxcdytcXC8uKi8pKSB7XG5cdFx0XHRyZXN1bHQgPSB7XG5cdFx0XHRcdHR5cGU6IFwiRW51bU1lbWJlclwiLFxuXHRcdFx0XHRFbnVtTWVtYmVyOiB2YWx1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0ID0ge1xuXHRcdFx0XHR0eXBlOiBcIlN0cmluZ1wiLFxuXHRcdFx0XHRTdHJpbmc6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdHJlc3VsdCA9IHtcblx0XHRcdHR5cGU6IFwiQ29sbGVjdGlvblwiLFxuXHRcdFx0Q29sbGVjdGlvbjogdmFsdWUubWFwKGFubm8gPT4gcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub0dlbmVyaWNUeXBlKHJlZmVyZW5jZXMsIGFubm8pKSBhcyBhbnlbXVxuXHRcdH07XG5cdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuXHRcdHJlc3VsdCA9IHtcblx0XHRcdHR5cGU6IFwiQm9vbFwiLFxuXHRcdFx0Qm9vbDogdmFsdWVcblx0XHR9O1xuXHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xuXHRcdHJlc3VsdCA9IHtcblx0XHRcdHR5cGU6IFwiSW50XCIsXG5cdFx0XHRJbnQ6IHZhbHVlXG5cdFx0fTtcblx0fSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSBcIlBhdGhcIikge1xuXHRcdHJlc3VsdCA9IHtcblx0XHRcdHR5cGU6IFwiUGF0aFwiLFxuXHRcdFx0UGF0aDogdmFsdWUucGF0aFxuXHRcdH07XG5cdH0gZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gXCJBbm5vdGF0aW9uUGF0aFwiKSB7XG5cdFx0cmVzdWx0ID0ge1xuXHRcdFx0dHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLFxuXHRcdFx0QW5ub3RhdGlvblBhdGg6IHZhbHVlLnZhbHVlXG5cdFx0fTtcblx0fSBlbHNlIGlmICh2YWx1ZS50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiKSB7XG5cdFx0cmVzdWx0ID0ge1xuXHRcdFx0dHlwZTogXCJQcm9wZXJ0eVBhdGhcIixcblx0XHRcdFByb3BlcnR5UGF0aDogdmFsdWUudmFsdWVcblx0XHR9O1xuXHR9IGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSB7XG5cdFx0cmVzdWx0ID0ge1xuXHRcdFx0dHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIsXG5cdFx0XHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiB2YWx1ZS52YWx1ZVxuXHRcdH07XG5cdH0gZWxzZSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBcIiRUeXBlXCIpKSB7XG5cdFx0cmVzdWx0ID0ge1xuXHRcdFx0dHlwZTogXCJSZWNvcmRcIixcblx0XHRcdFJlY29yZDogcmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub0dlbmVyaWNUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKSBhcyBBbm5vdGF0aW9uUmVjb3JkXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvR2VuZXJpY1R5cGUoXG5cdHJlZmVyZW5jZXM6IFJlZmVyZW5jZVtdLFxuXHRjb2xsZWN0aW9uSXRlbTogYW55XG4pOlxuXHR8IEFubm90YXRpb25SZWNvcmRcblx0fCBzdHJpbmdcblx0fCBQcm9wZXJ0eVBhdGhFeHByZXNzaW9uXG5cdHwgUGF0aEV4cHJlc3Npb25cblx0fCBOYXZpZ2F0aW9uUHJvcGVydHlQYXRoRXhwcmVzc2lvblxuXHR8IEFubm90YXRpb25QYXRoRXhwcmVzc2lvblxuXHR8IHVuZGVmaW5lZCB7XG5cdGlmICh0eXBlb2YgY29sbGVjdGlvbkl0ZW0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRyZXR1cm4gY29sbGVjdGlvbkl0ZW07XG5cdH0gZWxzZSBpZiAodHlwZW9mIGNvbGxlY3Rpb25JdGVtID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGNvbGxlY3Rpb25JdGVtLmhhc093blByb3BlcnR5KFwiJFR5cGVcIikpIHtcblx0XHRcdC8vIEFubm90YXRpb24gUmVjb3JkXG5cdFx0XHRjb25zdCBvdXRJdGVtOiBBbm5vdGF0aW9uUmVjb3JkID0ge1xuXHRcdFx0XHR0eXBlOiBjb2xsZWN0aW9uSXRlbS4kVHlwZSxcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXM6IFtdIGFzIGFueVtdXG5cdFx0XHR9O1xuXHRcdFx0Ly8gQ291bGQgdmFsaWRhdGUga2V5cyBhbmQgdHlwZSBiYXNlZCBvbiAkVHlwZVxuXHRcdFx0T2JqZWN0LmtleXMoY29sbGVjdGlvbkl0ZW0pLmZvckVhY2goY29sbGVjdGlvbktleSA9PiB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRjb2xsZWN0aW9uS2V5ICE9PSBcIiRUeXBlXCIgJiZcblx0XHRcdFx0XHRjb2xsZWN0aW9uS2V5ICE9PSBcInRlcm1cIiAmJlxuXHRcdFx0XHRcdGNvbGxlY3Rpb25LZXkgIT09IFwiX19zb3VyY2VcIiAmJlxuXHRcdFx0XHRcdGNvbGxlY3Rpb25LZXkgIT09IFwicXVhbGlmaWVyXCIgJiZcblx0XHRcdFx0XHRjb2xsZWN0aW9uS2V5ICE9PSBcIkFjdGlvblRhcmdldFwiICYmXG5cdFx0XHRcdFx0Y29sbGVjdGlvbktleSAhPT0gXCJmdWxseVF1YWxpZmllZE5hbWVcIiAmJlxuXHRcdFx0XHRcdGNvbGxlY3Rpb25LZXkgIT09IFwiYW5ub3RhdGlvbnNcIlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IGNvbGxlY3Rpb25JdGVtW2NvbGxlY3Rpb25LZXldO1xuXHRcdFx0XHRcdG91dEl0ZW0ucHJvcGVydHlWYWx1ZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRuYW1lOiBjb2xsZWN0aW9uS2V5LFxuXHRcdFx0XHRcdFx0dmFsdWU6IHJldmVydFZhbHVlVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCB2YWx1ZSkgYXMgRXhwcmVzc2lvblxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNvbGxlY3Rpb25LZXkgPT09IFwiYW5ub3RhdGlvbnNcIikge1xuXHRcdFx0XHRcdGNvbnN0IGFubm90YXRpb25zID0gY29sbGVjdGlvbkl0ZW1bY29sbGVjdGlvbktleV07XG5cdFx0XHRcdFx0b3V0SXRlbS5hbm5vdGF0aW9ucyA9IFtdO1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKGFubm90YXRpb25zKVxuXHRcdFx0XHRcdFx0LmZpbHRlcihrZXkgPT4ga2V5ICE9PSBcIl9hbm5vdGF0aW9uc1wiKVxuXHRcdFx0XHRcdFx0LmZvckVhY2goa2V5ID0+IHtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMoYW5ub3RhdGlvbnNba2V5XSkuZm9yRWFjaCh0ZXJtID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBwYXJzZWRBbm5vdGF0aW9uID0gcmV2ZXJ0VGVybVRvR2VuZXJpY1R5cGUocmVmZXJlbmNlcywgYW5ub3RhdGlvbnNba2V5XVt0ZXJtXSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFwYXJzZWRBbm5vdGF0aW9uLnRlcm0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHVuYWxpYXNlZFRlcm0gPSB1bmFsaWFzKHJlZmVyZW5jZXMsIGAke2tleX0uJHt0ZXJtfWApO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHVuYWxpYXNlZFRlcm0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcXVhbGlmaWVkU3BsaXQgPSB1bmFsaWFzZWRUZXJtLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbi50ZXJtID0gcXVhbGlmaWVkU3BsaXRbMF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChxdWFsaWZpZWRTcGxpdC5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbi5xdWFsaWZpZXIgPSBxdWFsaWZpZWRTcGxpdFsxXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRvdXRJdGVtLmFubm90YXRpb25zPy5wdXNoKHBhcnNlZEFubm90YXRpb24pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBvdXRJdGVtO1xuXHRcdH0gZWxzZSBpZiAoY29sbGVjdGlvbkl0ZW0udHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJQcm9wZXJ0eVBhdGhcIixcblx0XHRcdFx0UHJvcGVydHlQYXRoOiBjb2xsZWN0aW9uSXRlbS52YWx1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGNvbGxlY3Rpb25JdGVtLnR5cGUgPT09IFwiQW5ub3RhdGlvblBhdGhcIikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLFxuXHRcdFx0XHRBbm5vdGF0aW9uUGF0aDogY29sbGVjdGlvbkl0ZW0udmFsdWVcblx0XHRcdH07XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZlcnRUZXJtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSwgYW5ub3RhdGlvbjogQW5ub3RhdGlvblRlcm08YW55Pik6IEVkbUFubm90YXRpb24ge1xuXHRjb25zdCBiYXNlQW5ub3RhdGlvbiA9IHtcblx0XHR0ZXJtOiBhbm5vdGF0aW9uLnRlcm0sXG5cdFx0cXVhbGlmaWVyOiBhbm5vdGF0aW9uLnF1YWxpZmllclxuXHR9O1xuXHRpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uKSkge1xuXHRcdC8vIENvbGxlY3Rpb25cblx0XHRyZXR1cm4ge1xuXHRcdFx0Li4uYmFzZUFubm90YXRpb24sXG5cdFx0XHRjb2xsZWN0aW9uOiBhbm5vdGF0aW9uLm1hcChhbm5vID0+IHJldmVydENvbGxlY3Rpb25JdGVtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBhbm5vKSkgYXMgYW55W11cblx0XHR9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb24uaGFzT3duUHJvcGVydHkoXCIkVHlwZVwiKSkge1xuXHRcdHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCByZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBhbm5vdGF0aW9uKSBhcyBhbnkgfTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4geyAuLi5iYXNlQW5ub3RhdGlvbiwgdmFsdWU6IHJldmVydFZhbHVlVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBhbm5vdGF0aW9uKSB9O1xuXHR9XG59XG4iXX0=