sap.ui.define(["sap/fe/core/converters/common/AnnotationConverter", "sap/fe/core/EnvironmentCapabilities"], function (AnnotationConverter, EnvironmentCapabilities) {
  "use strict";

  var _exports = {};
  var getCapabilities = EnvironmentCapabilities.getCapabilities;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var VOCABULARY_ALIAS = {
    "Org.OData.Capabilities.V1": "Capabilities",
    "Org.OData.Core.V1": "Core",
    "Org.OData.Measures.V1": "Measures",
    "com.sap.vocabularies.Common.v1": "Common",
    "com.sap.vocabularies.UI.v1": "UI",
    "com.sap.vocabularies.Session.v1": "Session",
    "com.sap.vocabularies.Analytics.v1": "Analytics",
    "com.sap.vocabularies.PersonalData.v1": "PersonalData",
    "com.sap.vocabularies.Communication.v1": "Communication"
  };
  var MetaModelConverter = {
    parsePropertyValue: function (annotationObject, propertyKey, currentTarget, annotationsLists) {
      var _this = this;

      var value;
      var currentPropertyTarget = currentTarget + "/" + propertyKey;

      if (annotationObject === null) {
        value = {
          type: "Null",
          Null: null
        };
      } else if (typeof annotationObject === "string") {
        value = {
          type: "String",
          String: annotationObject
        };
      } else if (typeof annotationObject === "boolean") {
        value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeof annotationObject === "number") {
        value = {
          type: "Int",
          Int: annotationObject
        };
      } else if (Array.isArray(annotationObject)) {
        value = {
          type: "Collection",
          Collection: annotationObject.map(function (subAnnotationObject, subAnnotationObjectIndex) {
            return _this.parseAnnotationObject(subAnnotationObject, currentPropertyTarget + "/" + subAnnotationObjectIndex, annotationsLists);
          })
        };

        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            value.Collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            value.Collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            value.Collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            value.Collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            value.Collection.type = "Record";
          } else if (typeof annotationObject[0] === "object") {
            // $Type is optional...
            value.Collection.type = "Record";
          } else {
            value.Collection.type = "String";
          }
        }
      } else if (annotationObject.$Path !== undefined) {
        value = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$Decimal !== undefined) {
        value = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$PropertyPath !== undefined) {
        value = {
          type: "PropertyPath",
          PropertyPath: annotationObject.$PropertyPath
        };
      } else if (annotationObject.$NavigationPropertyPath !== undefined) {
        value = {
          type: "NavigationPropertyPath",
          NavigationPropertyPath: annotationObject.$NavigationPropertyPath
        };
      } else if (annotationObject.$If !== undefined) {
        value = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        value = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        value = {
          type: "EnumMember",
          EnumMember: this.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
        };
      } else if (annotationObject.$Type) {
        value = {
          type: "Record",
          Record: this.parseAnnotationObject(annotationObject, currentTarget, annotationsLists)
        };
      }

      return {
        name: propertyKey,
        value: value
      };
    },
    mapNameToAlias: function (annotationName) {
      var _annotationName$split = annotationName.split("@"),
          _annotationName$split2 = _slicedToArray(_annotationName$split, 2),
          pathPart = _annotationName$split2[0],
          annoPart = _annotationName$split2[1];

      if (!annoPart) {
        annoPart = pathPart;
        pathPart = "";
      } else {
        pathPart += "@";
      }

      var lastDot = annoPart.lastIndexOf(".");
      return pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)] + "." + annoPart.substr(lastDot + 1);
    },
    parseAnnotationObject: function (annotationObject, currentObjectTarget, annotationsLists) {
      var _this2 = this;

      var parsedAnnotationObject = {};

      if (annotationObject === null) {
        parsedAnnotationObject = {
          type: "Null",
          Null: null
        };
      } else if (typeof annotationObject === "string") {
        parsedAnnotationObject = {
          type: "String",
          String: annotationObject
        };
      } else if (typeof annotationObject === "boolean") {
        parsedAnnotationObject = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeof annotationObject === "number") {
        parsedAnnotationObject = {
          type: "Int",
          Int: annotationObject
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        parsedAnnotationObject = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$Path !== undefined) {
        parsedAnnotationObject = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$Decimal !== undefined) {
        parsedAnnotationObject = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$PropertyPath !== undefined) {
        parsedAnnotationObject = {
          type: "PropertyPath",
          PropertyPath: annotationObject.$PropertyPath
        };
      } else if (annotationObject.$If !== undefined) {
        parsedAnnotationObject = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$NavigationPropertyPath !== undefined) {
        parsedAnnotationObject = {
          type: "NavigationPropertyPath",
          NavigationPropertyPath: annotationObject.$NavigationPropertyPath
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        parsedAnnotationObject = {
          type: "EnumMember",
          EnumMember: this.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
        };
      } else if (Array.isArray(annotationObject)) {
        var parsedAnnotationCollection = parsedAnnotationObject;
        parsedAnnotationCollection.collection = annotationObject.map(function (subAnnotationObject, subAnnotationIndex) {
          return _this2.parseAnnotationObject(subAnnotationObject, currentObjectTarget + "/" + subAnnotationIndex, annotationsLists);
        });

        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            parsedAnnotationCollection.collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            parsedAnnotationCollection.collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            parsedAnnotationCollection.collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            parsedAnnotationCollection.collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            parsedAnnotationCollection.collection.type = "Record";
          } else if (annotationObject[0].hasOwnProperty("$If")) {
            parsedAnnotationCollection.collection.type = "If";
          } else if (typeof annotationObject[0] === "object") {
            parsedAnnotationCollection.collection.type = "Record";
          } else {
            parsedAnnotationCollection.collection.type = "String";
          }
        }
      } else {
        if (annotationObject.$Type) {
          var typeValue = annotationObject.$Type;
          parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
        }

        var propertyValues = [];
        Object.keys(annotationObject).forEach(function (propertyKey) {
          if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
            propertyValues.push(_this2.parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists));
          } else if (propertyKey.startsWith("@")) {
            // Annotation of annotation
            _this2.createAnnotationLists(_defineProperty({}, propertyKey, annotationObject[propertyKey]), currentObjectTarget, annotationsLists);
          }
        });
        parsedAnnotationObject.propertyValues = propertyValues;
      }

      return parsedAnnotationObject;
    },
    getOrCreateAnnotationList: function (target, annotationsLists) {
      var potentialTarget = annotationsLists.find(function (annotationList) {
        return annotationList.target === target;
      });

      if (!potentialTarget) {
        potentialTarget = {
          target: target,
          annotations: []
        };
        annotationsLists.push(potentialTarget);
      }

      return potentialTarget;
    },
    createAnnotationLists: function (annotationObjects, annotationTarget, annotationLists) {
      var _this3 = this;

      var outAnnotationObject = this.getOrCreateAnnotationList(annotationTarget, annotationLists);
      var oCapabilities = getCapabilities();

      if (!oCapabilities.MicroChart) {
        delete annotationObjects["@com.sap.vocabularies.UI.v1.Chart"];
      }

      Object.keys(annotationObjects).forEach(function (annotationKey) {
        var annotationObject = annotationObjects[annotationKey];

        switch (annotationKey) {
          case "@com.sap.vocabularies.UI.v1.HeaderFacets":
            if (!oCapabilities.MicroChart) {
              annotationObject = annotationObject.filter(function (oRecord) {
                return oRecord.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") === -1;
              });
            }

            break;

          case "@com.sap.vocabularies.UI.v1.Identification":
            if (!oCapabilities.IntentBasedNavigation) {
              annotationObject = annotationObject.filter(function (oRecord) {
                return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
              });
            }

            break;

          case "@com.sap.vocabularies.UI.v1.LineItem":
          case "@com.sap.vocabularies.UI.v1.FieldGroup":
            if (!oCapabilities.IntentBasedNavigation) {
              annotationObject = annotationObject.filter(function (oRecord) {
                return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
              });
            }

            if (!oCapabilities.MicroChart) {
              annotationObject = annotationObject.filter(function (oRecord) {
                if (oRecord.Target && oRecord.Target.$AnnotationPath) {
                  return oRecord.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") === -1;
                } else {
                  return true;
                }
              });
            }

            break;

          default:
            break;
        }

        annotationObjects[annotationKey] = annotationObject;
        var currentOutAnnotationObject = outAnnotationObject;
        var annotationQualifierSplit = annotationKey.split("#");
        var qualifier = annotationQualifierSplit[1];
        annotationKey = annotationQualifierSplit[0]; // Check for annotation of annotation

        var annotationOfAnnotationSplit = annotationKey.split("@");

        if (annotationOfAnnotationSplit.length > 2) {
          currentOutAnnotationObject = _this3.getOrCreateAnnotationList(annotationTarget + "@" + annotationOfAnnotationSplit[1], annotationLists);
          annotationKey = annotationOfAnnotationSplit[2];
        } else {
          annotationKey = annotationOfAnnotationSplit[1];
        }

        var parsedAnnotationObject = {
          term: "".concat(annotationKey),
          qualifier: qualifier
        };
        var currentAnnotationTarget = annotationTarget + "@" + parsedAnnotationObject.term;

        if (qualifier) {
          currentAnnotationTarget += "#" + qualifier;
        }

        var isCollection = false;

        if (annotationObject === null) {
          parsedAnnotationObject.value = {
            type: "Bool",
            Bool: annotationObject
          };
        } else if (typeof annotationObject === "string") {
          parsedAnnotationObject.value = {
            type: "String",
            String: annotationObject
          };
        } else if (typeof annotationObject === "boolean") {
          parsedAnnotationObject.value = {
            type: "Bool",
            Bool: annotationObject
          };
        } else if (typeof annotationObject === "number") {
          parsedAnnotationObject.value = {
            type: "Int",
            Int: annotationObject
          };
        } else if (annotationObject.$If !== undefined) {
          parsedAnnotationObject.value = {
            type: "If",
            If: annotationObject.$If
          };
        } else if (annotationObject.$Path !== undefined) {
          parsedAnnotationObject.value = {
            type: "Path",
            Path: annotationObject.$Path
          };
        } else if (annotationObject.$AnnotationPath !== undefined) {
          parsedAnnotationObject.value = {
            type: "AnnotationPath",
            AnnotationPath: annotationObject.$AnnotationPath
          };
        } else if (annotationObject.$Decimal !== undefined) {
          parsedAnnotationObject.value = {
            type: "Decimal",
            Decimal: parseFloat(annotationObject.$Decimal)
          };
        } else if (annotationObject.$EnumMember !== undefined) {
          parsedAnnotationObject.value = {
            type: "EnumMember",
            EnumMember: _this3.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
          };
        } else if (Array.isArray(annotationObject)) {
          isCollection = true;
          parsedAnnotationObject.collection = annotationObject.map(function (subAnnotationObject, subAnnotationIndex) {
            return _this3.parseAnnotationObject(subAnnotationObject, currentAnnotationTarget + "/" + subAnnotationIndex, annotationLists);
          });

          if (annotationObject.length > 0) {
            if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
              parsedAnnotationObject.collection.type = "PropertyPath";
            } else if (annotationObject[0].hasOwnProperty("$Path")) {
              parsedAnnotationObject.collection.type = "Path";
            } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
              parsedAnnotationObject.collection.type = "NavigationPropertyPath";
            } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
              parsedAnnotationObject.collection.type = "AnnotationPath";
            } else if (annotationObject[0].hasOwnProperty("$Type")) {
              parsedAnnotationObject.collection.type = "Record";
            } else if (typeof annotationObject[0] === "object") {
              parsedAnnotationObject.collection.type = "Record";
            } else {
              parsedAnnotationObject.collection.type = "String";
            }
          }
        } else {
          var record = {
            propertyValues: []
          };

          if (annotationObject.$Type) {
            var typeValue = annotationObject.$Type;
            record.type = "".concat(typeValue);
          }

          var propertyValues = [];
          Object.keys(annotationObject).forEach(function (propertyKey) {
            if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
              propertyValues.push(_this3.parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists));
            } else if (propertyKey.startsWith("@")) {
              // Annotation of record
              annotationLists.push({
                target: currentAnnotationTarget,
                annotations: [{
                  value: _this3.parseAnnotationObject(annotationObject[propertyKey], currentAnnotationTarget, annotationLists)
                }]
              });
            }
          });
          record.propertyValues = propertyValues;
          parsedAnnotationObject.record = record;
        }

        parsedAnnotationObject.isCollection = isCollection;
        currentOutAnnotationObject.annotations.push(parsedAnnotationObject);
      });
    },
    parseProperty: function (oMetaModel, entityTypeObject, propertyName, annotationLists) {
      var propertyAnnotation = oMetaModel.getObject("/".concat(entityTypeObject.fullyQualifiedName, "/").concat(propertyName, "@"));
      var propertyDefinition = oMetaModel.getObject("/".concat(entityTypeObject.fullyQualifiedName, "/").concat(propertyName));
      var propertyObject = {
        _type: "Property",
        name: propertyName,
        fullyQualifiedName: "".concat(entityTypeObject.fullyQualifiedName, "/").concat(propertyName),
        type: propertyDefinition.$Type,
        maxLength: propertyDefinition.$MaxLength,
        precision: propertyDefinition.$Precision,
        scale: propertyDefinition.$Scale,
        nullable: propertyDefinition.$Nullable
      };
      this.createAnnotationLists(propertyAnnotation, propertyObject.fullyQualifiedName, annotationLists);
      return propertyObject;
    },
    parseNavigationProperty: function (oMetaModel, entityTypeObject, navPropertyName, annotationLists) {
      var navPropertyAnnotation = oMetaModel.getObject("/".concat(entityTypeObject.fullyQualifiedName, "/").concat(navPropertyName, "@"));
      var navPropertyDefinition = oMetaModel.getObject("/".concat(entityTypeObject.fullyQualifiedName, "/").concat(navPropertyName));
      var referentialConstraint = [];

      if (navPropertyDefinition.$ReferentialConstraint) {
        referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(function (sourcePropertyName) {
          return {
            sourceTypeName: entityTypeObject.name,
            sourceProperty: sourcePropertyName,
            targetTypeName: navPropertyDefinition.$Type,
            targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
          };
        });
      }

      var navigationProperty = {
        _type: "NavigationProperty",
        name: navPropertyName,
        fullyQualifiedName: "".concat(entityTypeObject.fullyQualifiedName, "/").concat(navPropertyName),
        partner: navPropertyDefinition.$Partner,
        isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
        containsTarget: navPropertyDefinition.$ContainsTarget,
        targetTypeName: navPropertyDefinition.$Type,
        referentialConstraint: referentialConstraint
      };
      this.createAnnotationLists(navPropertyAnnotation, navigationProperty.fullyQualifiedName, annotationLists);
      return navigationProperty;
    },
    parseEntitySet: function (oMetaModel, entitySetName, annotationLists, entityContainerName) {
      var entitySetDefinition = oMetaModel.getObject("/".concat(entitySetName));
      var entitySetAnnotation = oMetaModel.getObject("/".concat(entitySetName, "@"));
      var entitySetObject = {
        _type: "EntitySet",
        name: entitySetName,
        navigationPropertyBinding: {},
        entityTypeName: entitySetDefinition.$Type,
        fullyQualifiedName: "".concat(entityContainerName, "/").concat(entitySetName)
      };
      this.createAnnotationLists(entitySetAnnotation, entitySetObject.fullyQualifiedName, annotationLists);
      return entitySetObject;
    },
    parseEntityType: function (oMetaModel, entityTypeName, annotationLists, namespace) {
      var _this4 = this;

      var entityTypeAnnotation = oMetaModel.getObject("/".concat(entityTypeName, "@"));
      var entityTypeDefinition = oMetaModel.getObject("/".concat(entityTypeName));
      var entityKeys = entityTypeDefinition.$Key;
      var entityTypeObject = {
        _type: "EntityType",
        name: entityTypeName.replace(namespace + ".", ""),
        fullyQualifiedName: entityTypeName,
        keys: [],
        entityProperties: [],
        navigationProperties: []
      };
      this.createAnnotationLists(entityTypeAnnotation, entityTypeObject.fullyQualifiedName, annotationLists);
      var entityProperties = Object.keys(entityTypeDefinition).filter(function (propertyNameOrNot) {
        if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
          return entityTypeDefinition[propertyNameOrNot].$kind === "Property";
        }
      }).map(function (propertyName) {
        return _this4.parseProperty(oMetaModel, entityTypeObject, propertyName, annotationLists);
      });
      var navigationProperties = Object.keys(entityTypeDefinition).filter(function (propertyNameOrNot) {
        if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
          return entityTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
        }
      }).map(function (navPropertyName) {
        return _this4.parseNavigationProperty(oMetaModel, entityTypeObject, navPropertyName, annotationLists);
      });
      entityTypeObject.keys = entityKeys.map(function (entityKey) {
        return entityProperties.find(function (property) {
          return property.name === entityKey;
        });
      }).filter(function (property) {
        return property !== undefined;
      });
      entityTypeObject.entityProperties = entityProperties;
      entityTypeObject.navigationProperties = navigationProperties;
      return entityTypeObject;
    },
    parseAction: function (actionName, actionRawData, namespace) {
      var actionEntityType = "";
      var actionFQN = "".concat(actionName);

      if (actionRawData.$IsBound) {
        actionEntityType = actionRawData.$Parameter.filter(function (param) {
          return param.$Name === actionRawData.$EntitySetPath;
        }).map(function (param) {
          return param.$Type;
        }).join("");
        actionFQN = "".concat(actionName, "(").concat(actionEntityType, ")");
      }

      var parameters = actionRawData.$Parameter || [];
      return {
        _type: "Action",
        name: actionName.substr(namespace.length + 1),
        fullyQualifiedName: actionFQN,
        isBound: actionRawData.$IsBound,
        sourceType: actionEntityType,
        returnType: actionRawData.$ReturnType ? actionRawData.$ReturnType.$Type : "",
        parameters: parameters.map(function (param) {
          return {
            _type: "ActionParameter",
            isEntitySet: param.$Type === actionRawData.$EntitySetPath,
            fullyQualifiedName: "".concat(actionFQN, "/").concat(param.$Name),
            type: param.$Type // TODO missing properties ?

          };
        })
      };
    },
    parseEntityTypes: function (oMetaModel) {
      var _this5 = this;

      var oMetaModelData = oMetaModel.getObject("/$");
      var oEntitySets = oMetaModel.getObject("/");
      var annotationLists = [];
      var entityTypes = [];
      var entitySets = [];
      var entityContainerName = oMetaModelData.$EntityContainer;
      var namespace = "";
      var schemaKeys = Object.keys(oMetaModelData).filter(function (metamodelKey) {
        return oMetaModelData[metamodelKey].$kind === "Schema";
      });

      if (schemaKeys && schemaKeys.length > 0) {
        namespace = schemaKeys[0].substr(0, schemaKeys[0].length - 1);
      } else if (entityTypes && entityTypes.length) {
        namespace = entityTypes[0].fullyQualifiedName.replace(entityTypes[0].name, "");
        namespace = namespace.substr(0, namespace.length - 1);
      }

      Object.keys(oMetaModelData).filter(function (entityTypeName) {
        return entityTypeName !== "$kind" && oMetaModelData[entityTypeName].$kind === "EntityType";
      }).forEach(function (entityTypeName) {
        var entityType = _this5.parseEntityType(oMetaModel, entityTypeName, annotationLists, namespace);

        entityTypes.push(entityType);
      });
      Object.keys(oEntitySets).filter(function (entitySetName) {
        return entitySetName !== "$kind" && oEntitySets[entitySetName].$kind === "EntitySet";
      }).forEach(function (entitySetName) {
        var entitySet = _this5.parseEntitySet(oMetaModel, entitySetName, annotationLists, entityContainerName);

        entitySets.push(entitySet);
      });
      entitySets.forEach(function (entitySet) {
        var navPropertyBindings = oMetaModelData[entityContainerName][entitySet.name].$NavigationPropertyBinding;

        if (navPropertyBindings) {
          Object.keys(navPropertyBindings).forEach(function (navPropName) {
            var targetEntitySet = entitySets.find(function (entitySetName) {
              return entitySetName.name === navPropertyBindings[navPropName];
            });

            if (targetEntitySet) {
              entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
            }
          });
        }
      });
      var actions = Object.keys(oMetaModelData).filter(function (key) {
        return Array.isArray(oMetaModelData[key]) && oMetaModelData[key].length > 0 && oMetaModelData[key][0].$kind === "Action";
      }).reduce(function (outActions, actionName) {
        var actions = oMetaModelData[actionName];
        actions.forEach(function (action) {
          outActions.push(_this5.parseAction(actionName, action, namespace));
        });
        return outActions;
      }, []); // FIXME Crappy code to deal with annotations for functions

      var annotations = oMetaModelData.$Annotations;
      var actionAnnotations = Object.keys(annotations).filter(function (target) {
        return target.indexOf("(") !== -1;
      });
      actionAnnotations.forEach(function (target) {
        _this5.createAnnotationLists(oMetaModelData.$Annotations[target], target, annotationLists);
      }); // Sort by target length

      annotationLists = annotationLists.sort(function (a, b) {
        return a.target.length >= b.target.length ? 1 : -1;
      });
      var references = [];
      return {
        identification: "metamodelResult",
        version: "4.0",
        schema: {
          entityContainer: {},
          entitySets: entitySets,
          entityTypes: entityTypes,
          associations: [],
          actions: actions,
          namespace: namespace,
          annotations: {
            "metamodelResult": annotationLists
          }
        },
        references: references
      };
    }
  };
  var mMetaModelMap = {};
  /**
   * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
   *
   * @param {ODataMetaModel} oMetaModel the current oDataMetaModel
   * @returns {ConverterOutput} an object containing object like annotation
   */

  function convertTypes(oMetaModel) {
    var sMetaModelId = oMetaModel.id;

    if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
      var parsedOutput = MetaModelConverter.parseEntityTypes(oMetaModel);
      mMetaModelMap[sMetaModelId] = AnnotationConverter.convertTypes(parsedOutput);
    }

    return mMetaModelMap[sMetaModelId];
  }

  _exports.convertTypes = convertTypes;

  function convertMetaModelContext(oMetaModelContext) {
    var oConverterOutput = convertTypes(oMetaModelContext.getModel());
    var sPath = oMetaModelContext.getPath();
    var aPathSplit = sPath.split("/");
    var targetEntitySet = oConverterOutput.entitySets.find(function (entitySet) {
      return entitySet.name === aPathSplit[1];
    });
    var relativePath = aPathSplit.slice(2).join("/");

    if (relativePath.startsWith("$NavigationPropertyBinding")) {
      targetEntitySet = targetEntitySet.navigationPropertyBinding[aPathSplit[3]];
      relativePath = aPathSplit.slice(4).join("/");
    }

    if (targetEntitySet) {
      return targetEntitySet.entityType.resolvePath(relativePath);
    }
  }

  _exports.convertMetaModelContext = convertMetaModelContext;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1ldGFNb2RlbENvbnZlcnRlci50cyJdLCJuYW1lcyI6WyJWT0NBQlVMQVJZX0FMSUFTIiwiTWV0YU1vZGVsQ29udmVydGVyIiwicGFyc2VQcm9wZXJ0eVZhbHVlIiwiYW5ub3RhdGlvbk9iamVjdCIsInByb3BlcnR5S2V5IiwiY3VycmVudFRhcmdldCIsImFubm90YXRpb25zTGlzdHMiLCJ2YWx1ZSIsImN1cnJlbnRQcm9wZXJ0eVRhcmdldCIsInR5cGUiLCJOdWxsIiwiU3RyaW5nIiwiQm9vbCIsIkludCIsIkFycmF5IiwiaXNBcnJheSIsIkNvbGxlY3Rpb24iLCJtYXAiLCJzdWJBbm5vdGF0aW9uT2JqZWN0Iiwic3ViQW5ub3RhdGlvbk9iamVjdEluZGV4IiwicGFyc2VBbm5vdGF0aW9uT2JqZWN0IiwibGVuZ3RoIiwiaGFzT3duUHJvcGVydHkiLCIkUGF0aCIsInVuZGVmaW5lZCIsIlBhdGgiLCIkRGVjaW1hbCIsIkRlY2ltYWwiLCJwYXJzZUZsb2F0IiwiJFByb3BlcnR5UGF0aCIsIlByb3BlcnR5UGF0aCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIiRJZiIsIklmIiwiJEFubm90YXRpb25QYXRoIiwiQW5ub3RhdGlvblBhdGgiLCIkRW51bU1lbWJlciIsIkVudW1NZW1iZXIiLCJtYXBOYW1lVG9BbGlhcyIsInNwbGl0IiwiJFR5cGUiLCJSZWNvcmQiLCJuYW1lIiwiYW5ub3RhdGlvbk5hbWUiLCJwYXRoUGFydCIsImFubm9QYXJ0IiwibGFzdERvdCIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwiY3VycmVudE9iamVjdFRhcmdldCIsInBhcnNlZEFubm90YXRpb25PYmplY3QiLCJwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJzdWJBbm5vdGF0aW9uSW5kZXgiLCJ0eXBlVmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic3RhcnRzV2l0aCIsInB1c2giLCJjcmVhdGVBbm5vdGF0aW9uTGlzdHMiLCJnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0IiwidGFyZ2V0IiwicG90ZW50aWFsVGFyZ2V0IiwiZmluZCIsImFubm90YXRpb25MaXN0IiwiYW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9uT2JqZWN0cyIsImFubm90YXRpb25UYXJnZXQiLCJhbm5vdGF0aW9uTGlzdHMiLCJvdXRBbm5vdGF0aW9uT2JqZWN0Iiwib0NhcGFiaWxpdGllcyIsImdldENhcGFiaWxpdGllcyIsIk1pY3JvQ2hhcnQiLCJhbm5vdGF0aW9uS2V5IiwiZmlsdGVyIiwib1JlY29yZCIsIlRhcmdldCIsImluZGV4T2YiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJjdXJyZW50T3V0QW5ub3RhdGlvbk9iamVjdCIsImFubm90YXRpb25RdWFsaWZpZXJTcGxpdCIsInF1YWxpZmllciIsImFubm90YXRpb25PZkFubm90YXRpb25TcGxpdCIsInRlcm0iLCJjdXJyZW50QW5ub3RhdGlvblRhcmdldCIsImlzQ29sbGVjdGlvbiIsInJlY29yZCIsInBhcnNlUHJvcGVydHkiLCJvTWV0YU1vZGVsIiwiZW50aXR5VHlwZU9iamVjdCIsInByb3BlcnR5TmFtZSIsInByb3BlcnR5QW5ub3RhdGlvbiIsImdldE9iamVjdCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInByb3BlcnR5RGVmaW5pdGlvbiIsInByb3BlcnR5T2JqZWN0IiwiX3R5cGUiLCJtYXhMZW5ndGgiLCIkTWF4TGVuZ3RoIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsInNjYWxlIiwiJFNjYWxlIiwibnVsbGFibGUiLCIkTnVsbGFibGUiLCJwYXJzZU5hdmlnYXRpb25Qcm9wZXJ0eSIsIm5hdlByb3BlcnR5TmFtZSIsIm5hdlByb3BlcnR5QW5ub3RhdGlvbiIsIm5hdlByb3BlcnR5RGVmaW5pdGlvbiIsInJlZmVyZW50aWFsQ29uc3RyYWludCIsIiRSZWZlcmVudGlhbENvbnN0cmFpbnQiLCJzb3VyY2VQcm9wZXJ0eU5hbWUiLCJzb3VyY2VUeXBlTmFtZSIsInNvdXJjZVByb3BlcnR5IiwidGFyZ2V0VHlwZU5hbWUiLCJ0YXJnZXRQcm9wZXJ0eSIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsInBhcnRuZXIiLCIkUGFydG5lciIsIiRpc0NvbGxlY3Rpb24iLCJjb250YWluc1RhcmdldCIsIiRDb250YWluc1RhcmdldCIsInBhcnNlRW50aXR5U2V0IiwiZW50aXR5U2V0TmFtZSIsImVudGl0eUNvbnRhaW5lck5hbWUiLCJlbnRpdHlTZXREZWZpbml0aW9uIiwiZW50aXR5U2V0QW5ub3RhdGlvbiIsImVudGl0eVNldE9iamVjdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJlbnRpdHlUeXBlTmFtZSIsInBhcnNlRW50aXR5VHlwZSIsIm5hbWVzcGFjZSIsImVudGl0eVR5cGVBbm5vdGF0aW9uIiwiZW50aXR5VHlwZURlZmluaXRpb24iLCJlbnRpdHlLZXlzIiwiJEtleSIsInJlcGxhY2UiLCJlbnRpdHlQcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJwcm9wZXJ0eU5hbWVPck5vdCIsIiRraW5kIiwiZW50aXR5S2V5IiwicHJvcGVydHkiLCJwYXJzZUFjdGlvbiIsImFjdGlvbk5hbWUiLCJhY3Rpb25SYXdEYXRhIiwiYWN0aW9uRW50aXR5VHlwZSIsImFjdGlvbkZRTiIsIiRJc0JvdW5kIiwiJFBhcmFtZXRlciIsInBhcmFtIiwiJE5hbWUiLCIkRW50aXR5U2V0UGF0aCIsImpvaW4iLCJwYXJhbWV0ZXJzIiwiaXNCb3VuZCIsInNvdXJjZVR5cGUiLCJyZXR1cm5UeXBlIiwiJFJldHVyblR5cGUiLCJpc0VudGl0eVNldCIsInBhcnNlRW50aXR5VHlwZXMiLCJvTWV0YU1vZGVsRGF0YSIsIm9FbnRpdHlTZXRzIiwiZW50aXR5VHlwZXMiLCJlbnRpdHlTZXRzIiwiJEVudGl0eUNvbnRhaW5lciIsInNjaGVtYUtleXMiLCJtZXRhbW9kZWxLZXkiLCJlbnRpdHlUeXBlIiwiZW50aXR5U2V0IiwibmF2UHJvcGVydHlCaW5kaW5ncyIsIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwibmF2UHJvcE5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJhY3Rpb25zIiwia2V5IiwicmVkdWNlIiwib3V0QWN0aW9ucyIsImFjdGlvbiIsIiRBbm5vdGF0aW9ucyIsImFjdGlvbkFubm90YXRpb25zIiwic29ydCIsImEiLCJiIiwicmVmZXJlbmNlcyIsImlkZW50aWZpY2F0aW9uIiwidmVyc2lvbiIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImFzc29jaWF0aW9ucyIsIm1NZXRhTW9kZWxNYXAiLCJjb252ZXJ0VHlwZXMiLCJzTWV0YU1vZGVsSWQiLCJpZCIsInBhcnNlZE91dHB1dCIsIkFubm90YXRpb25Db252ZXJ0ZXIiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsIm9NZXRhTW9kZWxDb250ZXh0Iiwib0NvbnZlcnRlck91dHB1dCIsImdldE1vZGVsIiwic1BhdGgiLCJnZXRQYXRoIiwiYVBhdGhTcGxpdCIsInJlbGF0aXZlUGF0aCIsInNsaWNlIiwicmVzb2x2ZVBhdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLE1BQU1BLGdCQUFxQixHQUFHO0FBQzdCLGlDQUE2QixjQURBO0FBRTdCLHlCQUFxQixNQUZRO0FBRzdCLDZCQUF5QixVQUhJO0FBSTdCLHNDQUFrQyxRQUpMO0FBSzdCLGtDQUE4QixJQUxEO0FBTTdCLHVDQUFtQyxTQU5OO0FBTzdCLHlDQUFxQyxXQVBSO0FBUTdCLDRDQUF3QyxjQVJYO0FBUzdCLDZDQUF5QztBQVRaLEdBQTlCO0FBNkJBLE1BQU1DLGtCQUFrQixHQUFHO0FBQzFCQyxJQUFBQSxrQkFEMEIsWUFDUEMsZ0JBRE8sRUFDZ0JDLFdBRGhCLEVBQ3FDQyxhQURyQyxFQUM0REMsZ0JBRDVELEVBQzBGO0FBQUE7O0FBQ25ILFVBQUlDLEtBQUo7QUFDQSxVQUFNQyxxQkFBNkIsR0FBR0gsYUFBYSxHQUFHLEdBQWhCLEdBQXNCRCxXQUE1RDs7QUFDQSxVQUFJRCxn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MEcsU0FBUztBQUFBLGFBQUlBLFNBQVMsQ0FBQ2pJLElBQVYsS0FBbUJrSyxVQUFVLENBQUMsQ0FBRCxDQUFqQztBQUFBLEtBQTFDLENBQWxDO0FBQ0EsUUFBSUMsWUFBWSxHQUFHRCxVQUFVLENBQUNFLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0JuRCxJQUFwQixDQUF5QixHQUF6QixDQUFuQjs7QUFDQSxRQUFJa0QsWUFBWSxDQUFDbEosVUFBYixDQUF3Qiw0QkFBeEIsQ0FBSixFQUEyRDtBQUMxRG9ILE1BQUFBLGVBQWUsR0FBR0EsZUFBZSxDQUFDN0MseUJBQWhCLENBQTBDMEUsVUFBVSxDQUFDLENBQUQsQ0FBcEQsQ0FBbEI7QUFDQUMsTUFBQUEsWUFBWSxHQUFHRCxVQUFVLENBQUNFLEtBQVgsQ0FBaUIsQ0FBakIsRUFBb0JuRCxJQUFwQixDQUF5QixHQUF6QixDQUFmO0FBQ0E7O0FBQ0QsUUFBSW9CLGVBQUosRUFBcUI7QUFDcEIsYUFBT0EsZUFBZSxDQUFDTCxVQUFoQixDQUEyQnFDLFdBQTNCLENBQXVDRixZQUF2QyxDQUFQO0FBQ0E7QUFDRCIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQW5ub3RhdGlvbiwgQW5ub3RhdGlvbkxpc3QsIEFubm90YXRpb25SZWNvcmQsIEV4cHJlc3Npb24sIFBhcnNlck91dHB1dCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuLy8gVGhpcyBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIEBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIsIHNoYXJlZCBjb2RlIHdpdGggdG9vbCBzdWl0ZVxuaW1wb3J0IHsgQW5ub3RhdGlvbkNvbnZlcnRlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbW1vblwiO1xuaW1wb3J0IHsgT0RhdGFNZXRhTW9kZWwgfSBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0XCI7XG5pbXBvcnQgeyBnZXRDYXBhYmlsaXRpZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcIjtcbmltcG9ydCB7IENvbnZlcnRlck91dHB1dCwgRW50aXR5U2V0IGFzIF9FbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC9hbm5vdGF0aW9uLWNvbnZlcnRlclwiO1xuaW1wb3J0IHtcblx0RW50aXR5VHlwZSxcblx0RW50aXR5U2V0LFxuXHRQcm9wZXJ0eSxcblx0UmVmZXJlbnRpYWxDb25zdHJhaW50LFxuXHRWNE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0QWN0aW9uLFxuXHRSZWZlcmVuY2Vcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL2Rpc3QvUGFyc2VyXCI7XG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcInNhcC91aS9tb2RlbFwiO1xuXG5jb25zdCBWT0NBQlVMQVJZX0FMSUFTOiBhbnkgPSB7XG5cdFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMVwiOiBcIkNhcGFiaWxpdGllc1wiLFxuXHRcIk9yZy5PRGF0YS5Db3JlLlYxXCI6IFwiQ29yZVwiLFxuXHRcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMVwiOiBcIk1lYXN1cmVzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxXCI6IFwiQ29tbW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIjogXCJVSVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjFcIjogXCJTZXNzaW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxXCI6IFwiQW5hbHl0aWNzXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxXCI6IFwiUGVyc29uYWxEYXRhXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MVwiOiBcIkNvbW11bmljYXRpb25cIlxufTtcblxudHlwZSBNZXRhTW9kZWxBY3Rpb24gPSB7XG5cdCRraW5kOiBcIkFjdGlvblwiO1xuXHQkSXNCb3VuZDogYm9vbGVhbjtcblx0JEVudGl0eVNldFBhdGg6IHN0cmluZztcblx0JFBhcmFtZXRlcjoge1xuXHRcdCRUeXBlOiBzdHJpbmc7XG5cdFx0JE5hbWU6IHN0cmluZztcblx0XHQkTnVsbGFibGU/OiBib29sZWFuO1xuXHRcdCRNYXhMZW5ndGg/OiBudW1iZXI7XG5cdFx0JFByZWNpc2lvbj86IG51bWJlcjtcblx0XHQkU2NhbGU/OiBudW1iZXI7XG5cdH1bXTtcblx0JFJldHVyblR5cGU6IHtcblx0XHQkVHlwZTogc3RyaW5nO1xuXHR9O1xufTtcblxuY29uc3QgTWV0YU1vZGVsQ29udmVydGVyID0ge1xuXHRwYXJzZVByb3BlcnR5VmFsdWUoYW5ub3RhdGlvbk9iamVjdDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBjdXJyZW50VGFyZ2V0OiBzdHJpbmcsIGFubm90YXRpb25zTGlzdHM6IGFueVtdKTogYW55IHtcblx0XHRsZXQgdmFsdWU7XG5cdFx0Y29uc3QgY3VycmVudFByb3BlcnR5VGFyZ2V0OiBzdHJpbmcgPSBjdXJyZW50VGFyZ2V0ICsgXCIvXCIgKyBwcm9wZXJ0eUtleTtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdCA9PT0gbnVsbCkge1xuXHRcdFx0dmFsdWUgPSB7IHR5cGU6IFwiTnVsbFwiLCBOdWxsOiBudWxsIH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dmFsdWUgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3QgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHR2YWx1ZSA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0ID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHR2YWx1ZSA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0dHlwZTogXCJDb2xsZWN0aW9uXCIsXG5cdFx0XHRcdENvbGxlY3Rpb246IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXgpID0+XG5cdFx0XHRcdFx0dGhpcy5wYXJzZUFubm90YXRpb25PYmplY3QoXG5cdFx0XHRcdFx0XHRzdWJBbm5vdGF0aW9uT2JqZWN0LFxuXHRcdFx0XHRcdFx0Y3VycmVudFByb3BlcnR5VGFyZ2V0ICsgXCIvXCIgKyBzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXgsXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uc0xpc3RzXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFubm90YXRpb25QYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdC8vICRUeXBlIGlzIG9wdGlvbmFsLi4uXG5cdFx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHZhbHVlID0geyB0eXBlOiBcIlBhdGhcIiwgUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUGF0aCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR2YWx1ZSA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR2YWx1ZSA9IHsgdHlwZTogXCJQcm9wZXJ0eVBhdGhcIiwgUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFsdWUgPSB7XG5cdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiLFxuXHRcdFx0XHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kSWYgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFsdWUgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR2YWx1ZSA9IHsgdHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLCBBbm5vdGF0aW9uUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kQW5ub3RhdGlvblBhdGggfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dmFsdWUgPSB7XG5cdFx0XHRcdHR5cGU6IFwiRW51bU1lbWJlclwiLFxuXHRcdFx0XHRFbnVtTWVtYmVyOlxuXHRcdFx0XHRcdHRoaXMubWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMF0pICsgXCIvXCIgKyBhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFR5cGUpIHtcblx0XHRcdHZhbHVlID0ge1xuXHRcdFx0XHR0eXBlOiBcIlJlY29yZFwiLFxuXHRcdFx0XHRSZWNvcmQ6IHRoaXMucGFyc2VBbm5vdGF0aW9uT2JqZWN0KGFubm90YXRpb25PYmplY3QsIGN1cnJlbnRUYXJnZXQsIGFubm90YXRpb25zTGlzdHMpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiBwcm9wZXJ0eUtleSxcblx0XHRcdHZhbHVlXG5cdFx0fTtcblx0fSxcblx0bWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0bGV0IFtwYXRoUGFydCwgYW5ub1BhcnRdID0gYW5ub3RhdGlvbk5hbWUuc3BsaXQoXCJAXCIpO1xuXHRcdGlmICghYW5ub1BhcnQpIHtcblx0XHRcdGFubm9QYXJ0ID0gcGF0aFBhcnQ7XG5cdFx0XHRwYXRoUGFydCA9IFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhdGhQYXJ0ICs9IFwiQFwiO1xuXHRcdH1cblx0XHRjb25zdCBsYXN0RG90ID0gYW5ub1BhcnQubGFzdEluZGV4T2YoXCIuXCIpO1xuXHRcdHJldHVybiBwYXRoUGFydCArIFZPQ0FCVUxBUllfQUxJQVNbYW5ub1BhcnQuc3Vic3RyKDAsIGxhc3REb3QpXSArIFwiLlwiICsgYW5ub1BhcnQuc3Vic3RyKGxhc3REb3QgKyAxKTtcblx0fSxcblx0cGFyc2VBbm5vdGF0aW9uT2JqZWN0KFxuXHRcdGFubm90YXRpb25PYmplY3Q6IGFueSxcblx0XHRjdXJyZW50T2JqZWN0VGFyZ2V0OiBzdHJpbmcsXG5cdFx0YW5ub3RhdGlvbnNMaXN0czogYW55W11cblx0KTogRXhwcmVzc2lvbiB8IEFubm90YXRpb25SZWNvcmQgfCBBbm5vdGF0aW9uIHtcblx0XHRsZXQgcGFyc2VkQW5ub3RhdGlvbk9iamVjdDogYW55ID0ge307XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiTnVsbFwiLCBOdWxsOiBudWxsIH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJTdHJpbmdcIiwgU3RyaW5nOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdCA9PT0gXCJudW1iZXJcIikge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsIEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIlBhdGhcIiwgUGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUGF0aCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkRlY2ltYWxcIiwgRGVjaW1hbDogcGFyc2VGbG9hdChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsKSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiUHJvcGVydHlQYXRoXCIsIFByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIklmXCIsIElmOiBhbm5vdGF0aW9uT2JqZWN0LiRJZiB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0ge1xuXHRcdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIixcblx0XHRcdFx0TmF2aWdhdGlvblByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kTmF2aWdhdGlvblByb3BlcnR5UGF0aFxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHtcblx0XHRcdFx0dHlwZTogXCJFbnVtTWVtYmVyXCIsXG5cdFx0XHRcdEVudW1NZW1iZXI6XG5cdFx0XHRcdFx0dGhpcy5tYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVswXSkgKyBcIi9cIiArIGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzFdXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShhbm5vdGF0aW9uT2JqZWN0KSkge1xuXHRcdFx0Y29uc3QgcGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24gPSBwYXJzZWRBbm5vdGF0aW9uT2JqZWN0IGFzIGFueTtcblx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gPSBhbm5vdGF0aW9uT2JqZWN0Lm1hcCgoc3ViQW5ub3RhdGlvbk9iamVjdCwgc3ViQW5ub3RhdGlvbkluZGV4KSA9PlxuXHRcdFx0XHR0aGlzLnBhcnNlQW5ub3RhdGlvbk9iamVjdChzdWJBbm5vdGF0aW9uT2JqZWN0LCBjdXJyZW50T2JqZWN0VGFyZ2V0ICsgXCIvXCIgKyBzdWJBbm5vdGF0aW9uSW5kZXgsIGFubm90YXRpb25zTGlzdHMpXG5cdFx0XHQpO1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0XHQocGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRcdChwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdChwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0XHQocGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFubm90YXRpb25QYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJElmXCIpKSB7XG5cdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJJZlwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0WzBdID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQocGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGVWYWx1ZSA9IGFubm90YXRpb25PYmplY3QuJFR5cGU7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudHlwZSA9IHR5cGVWYWx1ZTsgLy9gJHt0eXBlQWxpYXN9LiR7dHlwZVRlcm19YDtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBhbnkgPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKGFubm90YXRpb25PYmplY3QpLmZvckVhY2gocHJvcGVydHlLZXkgPT4ge1xuXHRcdFx0XHRpZiAocHJvcGVydHlLZXkgIT09IFwiJFR5cGVcIiAmJiBwcm9wZXJ0eUtleSAhPT0gXCIkSWZcIiAmJiBwcm9wZXJ0eUtleSAhPT0gXCIkRXFcIiAmJiAhcHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlcy5wdXNoKFxuXHRcdFx0XHRcdFx0dGhpcy5wYXJzZVByb3BlcnR5VmFsdWUoYW5ub3RhdGlvbk9iamVjdFtwcm9wZXJ0eUtleV0sIHByb3BlcnR5S2V5LCBjdXJyZW50T2JqZWN0VGFyZ2V0LCBhbm5vdGF0aW9uc0xpc3RzKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0XHQvLyBBbm5vdGF0aW9uIG9mIGFubm90YXRpb25cblx0XHRcdFx0XHR0aGlzLmNyZWF0ZUFubm90YXRpb25MaXN0cyh7IFtwcm9wZXJ0eUtleV06IGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldIH0sIGN1cnJlbnRPYmplY3RUYXJnZXQsIGFubm90YXRpb25zTGlzdHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QucHJvcGVydHlWYWx1ZXMgPSBwcm9wZXJ0eVZhbHVlcztcblx0XHR9XG5cdFx0cmV0dXJuIHBhcnNlZEFubm90YXRpb25PYmplY3Q7XG5cdH0sXG5cdGdldE9yQ3JlYXRlQW5ub3RhdGlvbkxpc3QodGFyZ2V0OiBzdHJpbmcsIGFubm90YXRpb25zTGlzdHM6IEFubm90YXRpb25MaXN0W10pOiBBbm5vdGF0aW9uTGlzdCB7XG5cdFx0bGV0IHBvdGVudGlhbFRhcmdldCA9IGFubm90YXRpb25zTGlzdHMuZmluZChhbm5vdGF0aW9uTGlzdCA9PiBhbm5vdGF0aW9uTGlzdC50YXJnZXQgPT09IHRhcmdldCk7XG5cdFx0aWYgKCFwb3RlbnRpYWxUYXJnZXQpIHtcblx0XHRcdHBvdGVudGlhbFRhcmdldCA9IHtcblx0XHRcdFx0dGFyZ2V0OiB0YXJnZXQsXG5cdFx0XHRcdGFubm90YXRpb25zOiBbXVxuXHRcdFx0fTtcblx0XHRcdGFubm90YXRpb25zTGlzdHMucHVzaChwb3RlbnRpYWxUYXJnZXQpO1xuXHRcdH1cblx0XHRyZXR1cm4gcG90ZW50aWFsVGFyZ2V0O1xuXHR9LFxuXG5cdGNyZWF0ZUFubm90YXRpb25MaXN0cyhhbm5vdGF0aW9uT2JqZWN0czogYW55LCBhbm5vdGF0aW9uVGFyZ2V0OiBzdHJpbmcsIGFubm90YXRpb25MaXN0czogYW55W10pIHtcblx0XHRjb25zdCBvdXRBbm5vdGF0aW9uT2JqZWN0ID0gdGhpcy5nZXRPckNyZWF0ZUFubm90YXRpb25MaXN0KGFubm90YXRpb25UYXJnZXQsIGFubm90YXRpb25MaXN0cyk7XG5cdFx0Y29uc3Qgb0NhcGFiaWxpdGllcyA9IGdldENhcGFiaWxpdGllcygpO1xuXHRcdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRkZWxldGUgYW5ub3RhdGlvbk9iamVjdHNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIl07XG5cdFx0fVxuXHRcdE9iamVjdC5rZXlzKGFubm90YXRpb25PYmplY3RzKS5mb3JFYWNoKGFubm90YXRpb25LZXkgPT4ge1xuXHRcdFx0bGV0IGFubm90YXRpb25PYmplY3QgPSBhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XTtcblx0XHRcdHN3aXRjaCAoYW5ub3RhdGlvbktleSkge1xuXHRcdFx0XHRjYXNlIFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0c1wiOlxuXHRcdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5NaWNyb0NoYXJ0KSB7XG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gYW5ub3RhdGlvbk9iamVjdC5maWx0ZXIoKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JlY29yZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIikgPT09IC0xO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklkZW50aWZpY2F0aW9uXCI6XG5cdFx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IGFubm90YXRpb25PYmplY3QuZmlsdGVyKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9SZWNvcmQuJFR5cGUgIT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIjpcblx0XHRcdFx0Y2FzZSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCI6XG5cdFx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLkludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IGFubm90YXRpb25PYmplY3QuZmlsdGVyKChvUmVjb3JkOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9SZWNvcmQuJFR5cGUgIT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvUmVjb3JkLlRhcmdldCAmJiBvUmVjb3JkLlRhcmdldC4kQW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JlY29yZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIikgPT09IC0xO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRsZXQgY3VycmVudE91dEFubm90YXRpb25PYmplY3QgPSBvdXRBbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvblF1YWxpZmllclNwbGl0ID0gYW5ub3RhdGlvbktleS5zcGxpdChcIiNcIik7XG5cdFx0XHRjb25zdCBxdWFsaWZpZXIgPSBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXRbMV07XG5cdFx0XHRhbm5vdGF0aW9uS2V5ID0gYW5ub3RhdGlvblF1YWxpZmllclNwbGl0WzBdO1xuXHRcdFx0Ly8gQ2hlY2sgZm9yIGFubm90YXRpb24gb2YgYW5ub3RhdGlvblxuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0ID0gYW5ub3RhdGlvbktleS5zcGxpdChcIkBcIik7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0Lmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0Y3VycmVudE91dEFubm90YXRpb25PYmplY3QgPSB0aGlzLmdldE9yQ3JlYXRlQW5ub3RhdGlvbkxpc3QoXG5cdFx0XHRcdFx0YW5ub3RhdGlvblRhcmdldCArIFwiQFwiICsgYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0WzFdLFxuXHRcdFx0XHRcdGFubm90YXRpb25MaXN0c1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRhbm5vdGF0aW9uS2V5ID0gYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0WzJdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsxXTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcGFyc2VkQW5ub3RhdGlvbk9iamVjdDogYW55ID0ge1xuXHRcdFx0XHR0ZXJtOiBgJHthbm5vdGF0aW9uS2V5fWAsXG5cdFx0XHRcdHF1YWxpZmllcjogcXVhbGlmaWVyXG5cdFx0XHR9O1xuXHRcdFx0bGV0IGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0ID0gYW5ub3RhdGlvblRhcmdldCArIFwiQFwiICsgcGFyc2VkQW5ub3RhdGlvbk9iamVjdC50ZXJtO1xuXHRcdFx0aWYgKHF1YWxpZmllcikge1xuXHRcdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCArPSBcIiNcIiArIHF1YWxpZmllcjtcblx0XHRcdH1cblx0XHRcdGxldCBpc0NvbGxlY3Rpb24gPSBmYWxzZTtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0ID09PSBudWxsKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3QgPT09IFwibnVtYmVyXCIpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJJbnRcIiwgSW50OiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJElmICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJJZlwiLCBJZjogYW5ub3RhdGlvbk9iamVjdC4kSWYgfTtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHtcblx0XHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdFx0QW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJERlY2ltYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkRlY2ltYWxcIiwgRGVjaW1hbDogcGFyc2VGbG9hdChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsKSB9O1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHtcblx0XHRcdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdFx0XHRFbnVtTWVtYmVyOlxuXHRcdFx0XHRcdFx0dGhpcy5tYXBOYW1lVG9BbGlhcyhhbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVswXSkgKyBcIi9cIiArIGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzFdXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYW5ub3RhdGlvbk9iamVjdCkpIHtcblx0XHRcdFx0aXNDb2xsZWN0aW9uID0gdHJ1ZTtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uID0gYW5ub3RhdGlvbk9iamVjdC5tYXAoKHN1YkFubm90YXRpb25PYmplY3QsIHN1YkFubm90YXRpb25JbmRleCkgPT5cblx0XHRcdFx0XHR0aGlzLnBhcnNlQW5ub3RhdGlvbk9iamVjdChzdWJBbm5vdGF0aW9uT2JqZWN0LCBjdXJyZW50QW5ub3RhdGlvblRhcmdldCArIFwiL1wiICsgc3ViQW5ub3RhdGlvbkluZGV4LCBhbm5vdGF0aW9uTGlzdHMpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0XHRcdChwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlBhdGhcIjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiKSkge1xuXHRcdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0XHRcdChwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdFx0XHQocGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgYW5ub3RhdGlvbk9iamVjdFswXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdFx0KHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQocGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCByZWNvcmQ6IEFubm90YXRpb25SZWNvcmQgPSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXM6IFtdXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRcdFx0Y29uc3QgdHlwZVZhbHVlID0gYW5ub3RhdGlvbk9iamVjdC4kVHlwZTtcblx0XHRcdFx0XHRyZWNvcmQudHlwZSA9IGAke3R5cGVWYWx1ZX1gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRPYmplY3Qua2V5cyhhbm5vdGF0aW9uT2JqZWN0KS5mb3JFYWNoKHByb3BlcnR5S2V5ID0+IHtcblx0XHRcdFx0XHRpZiAocHJvcGVydHlLZXkgIT09IFwiJFR5cGVcIiAmJiAhcHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzLnB1c2goXG5cdFx0XHRcdFx0XHRcdHRoaXMucGFyc2VQcm9wZXJ0eVZhbHVlKGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldLCBwcm9wZXJ0eUtleSwgY3VycmVudEFubm90YXRpb25UYXJnZXQsIGFubm90YXRpb25MaXN0cylcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKSkge1xuXHRcdFx0XHRcdFx0Ly8gQW5ub3RhdGlvbiBvZiByZWNvcmRcblx0XHRcdFx0XHRcdGFubm90YXRpb25MaXN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBjdXJyZW50QW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbnM6IFtcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy5wYXJzZUFubm90YXRpb25PYmplY3QoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZWNvcmQucHJvcGVydHlWYWx1ZXMgPSBwcm9wZXJ0eVZhbHVlcztcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5yZWNvcmQgPSByZWNvcmQ7XG5cdFx0XHR9XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcblx0XHRcdGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0LmFubm90YXRpb25zLnB1c2gocGFyc2VkQW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0fSk7XG5cdH0sXG5cdHBhcnNlUHJvcGVydHkob01ldGFNb2RlbDogYW55LCBlbnRpdHlUeXBlT2JqZWN0OiBFbnRpdHlUeXBlLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgYW5ub3RhdGlvbkxpc3RzOiBBbm5vdGF0aW9uTGlzdFtdKTogUHJvcGVydHkge1xuXHRcdGNvbnN0IHByb3BlcnR5QW5ub3RhdGlvbiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtwcm9wZXJ0eU5hbWV9QGApO1xuXHRcdGNvbnN0IHByb3BlcnR5RGVmaW5pdGlvbiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YCk7XG5cblx0XHRjb25zdCBwcm9wZXJ0eU9iamVjdDogUHJvcGVydHkgPSB7XG5cdFx0XHRfdHlwZTogXCJQcm9wZXJ0eVwiLFxuXHRcdFx0bmFtZTogcHJvcGVydHlOYW1lLFxuXHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YCxcblx0XHRcdHR5cGU6IHByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdG1heExlbmd0aDogcHJvcGVydHlEZWZpbml0aW9uLiRNYXhMZW5ndGgsXG5cdFx0XHRwcmVjaXNpb246IHByb3BlcnR5RGVmaW5pdGlvbi4kUHJlY2lzaW9uLFxuXHRcdFx0c2NhbGU6IHByb3BlcnR5RGVmaW5pdGlvbi4kU2NhbGUsXG5cdFx0XHRudWxsYWJsZTogcHJvcGVydHlEZWZpbml0aW9uLiROdWxsYWJsZVxuXHRcdH07XG5cblx0XHR0aGlzLmNyZWF0ZUFubm90YXRpb25MaXN0cyhwcm9wZXJ0eUFubm90YXRpb24sIHByb3BlcnR5T2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZSwgYW5ub3RhdGlvbkxpc3RzKTtcblxuXHRcdHJldHVybiBwcm9wZXJ0eU9iamVjdDtcblx0fSxcblx0cGFyc2VOYXZpZ2F0aW9uUHJvcGVydHkoXG5cdFx0b01ldGFNb2RlbDogYW55LFxuXHRcdGVudGl0eVR5cGVPYmplY3Q6IEVudGl0eVR5cGUsXG5cdFx0bmF2UHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0YW5ub3RhdGlvbkxpc3RzOiBBbm5vdGF0aW9uTGlzdFtdXG5cdCk6IFY0TmF2aWdhdGlvblByb3BlcnR5IHtcblx0XHRjb25zdCBuYXZQcm9wZXJ0eUFubm90YXRpb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7bmF2UHJvcGVydHlOYW1lfUBgKTtcblx0XHRjb25zdCBuYXZQcm9wZXJ0eURlZmluaXRpb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7bmF2UHJvcGVydHlOYW1lfWApO1xuXG5cdFx0bGV0IHJlZmVyZW50aWFsQ29uc3RyYWludDogUmVmZXJlbnRpYWxDb25zdHJhaW50W10gPSBbXTtcblx0XHRpZiAobmF2UHJvcGVydHlEZWZpbml0aW9uLiRSZWZlcmVudGlhbENvbnN0cmFpbnQpIHtcblx0XHRcdHJlZmVyZW50aWFsQ29uc3RyYWludCA9IE9iamVjdC5rZXlzKG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50KS5tYXAoc291cmNlUHJvcGVydHlOYW1lID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRzb3VyY2VUeXBlTmFtZTogZW50aXR5VHlwZU9iamVjdC5uYW1lLFxuXHRcdFx0XHRcdHNvdXJjZVByb3BlcnR5OiBzb3VyY2VQcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdFx0XHR0YXJnZXRQcm9wZXJ0eTogbmF2UHJvcGVydHlEZWZpbml0aW9uLiRSZWZlcmVudGlhbENvbnN0cmFpbnRbc291cmNlUHJvcGVydHlOYW1lXVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eTogVjROYXZpZ2F0aW9uUHJvcGVydHkgPSB7XG5cdFx0XHRfdHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlcIixcblx0XHRcdG5hbWU6IG5hdlByb3BlcnR5TmFtZSxcblx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7bmF2UHJvcGVydHlOYW1lfWAsXG5cdFx0XHRwYXJ0bmVyOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFBhcnRuZXIsXG5cdFx0XHRpc0NvbGxlY3Rpb246IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kaXNDb2xsZWN0aW9uID8gbmF2UHJvcGVydHlEZWZpbml0aW9uLiRpc0NvbGxlY3Rpb24gOiBmYWxzZSxcblx0XHRcdGNvbnRhaW5zVGFyZ2V0OiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJENvbnRhaW5zVGFyZ2V0LFxuXHRcdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdHJlZmVyZW50aWFsQ29uc3RyYWludFxuXHRcdH07XG5cblx0XHR0aGlzLmNyZWF0ZUFubm90YXRpb25MaXN0cyhuYXZQcm9wZXJ0eUFubm90YXRpb24sIG5hdmlnYXRpb25Qcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWUsIGFubm90YXRpb25MaXN0cyk7XG5cblx0XHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5O1xuXHR9LFxuXHRwYXJzZUVudGl0eVNldChvTWV0YU1vZGVsOiBhbnksIGVudGl0eVNldE5hbWU6IHN0cmluZywgYW5ub3RhdGlvbkxpc3RzOiBBbm5vdGF0aW9uTGlzdFtdLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBFbnRpdHlTZXQge1xuXHRcdGNvbnN0IGVudGl0eVNldERlZmluaXRpb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5U2V0TmFtZX1gKTtcblx0XHRjb25zdCBlbnRpdHlTZXRBbm5vdGF0aW9uID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2VudGl0eVNldE5hbWV9QGApO1xuXHRcdGNvbnN0IGVudGl0eVNldE9iamVjdDogRW50aXR5U2V0ID0ge1xuXHRcdFx0X3R5cGU6IFwiRW50aXR5U2V0XCIsXG5cdFx0XHRuYW1lOiBlbnRpdHlTZXROYW1lLFxuXHRcdFx0bmF2aWdhdGlvblByb3BlcnR5QmluZGluZzoge30sXG5cdFx0XHRlbnRpdHlUeXBlTmFtZTogZW50aXR5U2V0RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtlbnRpdHlTZXROYW1lfWBcblx0XHR9O1xuXHRcdHRoaXMuY3JlYXRlQW5ub3RhdGlvbkxpc3RzKGVudGl0eVNldEFubm90YXRpb24sIGVudGl0eVNldE9iamVjdC5mdWxseVF1YWxpZmllZE5hbWUsIGFubm90YXRpb25MaXN0cyk7XG5cdFx0cmV0dXJuIGVudGl0eVNldE9iamVjdDtcblx0fSxcblxuXHRwYXJzZUVudGl0eVR5cGUob01ldGFNb2RlbDogYW55LCBlbnRpdHlUeXBlTmFtZTogc3RyaW5nLCBhbm5vdGF0aW9uTGlzdHM6IEFubm90YXRpb25MaXN0W10sIG5hbWVzcGFjZTogc3RyaW5nKTogRW50aXR5VHlwZSB7XG5cdFx0Y29uc3QgZW50aXR5VHlwZUFubm90YXRpb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZU5hbWV9QGApO1xuXHRcdGNvbnN0IGVudGl0eVR5cGVEZWZpbml0aW9uID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2VudGl0eVR5cGVOYW1lfWApO1xuXHRcdGNvbnN0IGVudGl0eUtleXMgPSBlbnRpdHlUeXBlRGVmaW5pdGlvbi4kS2V5O1xuXHRcdGNvbnN0IGVudGl0eVR5cGVPYmplY3Q6IEVudGl0eVR5cGUgPSB7XG5cdFx0XHRfdHlwZTogXCJFbnRpdHlUeXBlXCIsXG5cdFx0XHRuYW1lOiBlbnRpdHlUeXBlTmFtZS5yZXBsYWNlKG5hbWVzcGFjZSArIFwiLlwiLCBcIlwiKSxcblx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogZW50aXR5VHlwZU5hbWUsXG5cdFx0XHRrZXlzOiBbXSxcblx0XHRcdGVudGl0eVByb3BlcnRpZXM6IFtdLFxuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdXG5cdFx0fTtcblxuXHRcdHRoaXMuY3JlYXRlQW5ub3RhdGlvbkxpc3RzKGVudGl0eVR5cGVBbm5vdGF0aW9uLCBlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZSwgYW5ub3RhdGlvbkxpc3RzKTtcblx0XHRjb25zdCBlbnRpdHlQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoZW50aXR5VHlwZURlZmluaXRpb24pXG5cdFx0XHQuZmlsdGVyKHByb3BlcnR5TmFtZU9yTm90ID0+IHtcblx0XHRcdFx0aWYgKHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJEtleVwiICYmIHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJGtpbmRcIikge1xuXHRcdFx0XHRcdHJldHVybiBlbnRpdHlUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVPck5vdF0uJGtpbmQgPT09IFwiUHJvcGVydHlcIjtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5tYXAocHJvcGVydHlOYW1lID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucGFyc2VQcm9wZXJ0eShvTWV0YU1vZGVsLCBlbnRpdHlUeXBlT2JqZWN0LCBwcm9wZXJ0eU5hbWUsIGFubm90YXRpb25MaXN0cyk7XG5cdFx0XHR9KTtcblxuXHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoZW50aXR5VHlwZURlZmluaXRpb24pXG5cdFx0XHQuZmlsdGVyKHByb3BlcnR5TmFtZU9yTm90ID0+IHtcblx0XHRcdFx0aWYgKHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJEtleVwiICYmIHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJGtpbmRcIikge1xuXHRcdFx0XHRcdHJldHVybiBlbnRpdHlUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVPck5vdF0uJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCI7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQubWFwKG5hdlByb3BlcnR5TmFtZSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnBhcnNlTmF2aWdhdGlvblByb3BlcnR5KG9NZXRhTW9kZWwsIGVudGl0eVR5cGVPYmplY3QsIG5hdlByb3BlcnR5TmFtZSwgYW5ub3RhdGlvbkxpc3RzKTtcblx0XHRcdH0pO1xuXG5cdFx0ZW50aXR5VHlwZU9iamVjdC5rZXlzID0gZW50aXR5S2V5c1xuXHRcdFx0Lm1hcCgoZW50aXR5S2V5OiBzdHJpbmcpID0+IGVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHk6IFByb3BlcnR5KSA9PiBwcm9wZXJ0eS5uYW1lID09PSBlbnRpdHlLZXkpKVxuXHRcdFx0LmZpbHRlcigocHJvcGVydHk6IFByb3BlcnR5KSA9PiBwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKTtcblx0XHRlbnRpdHlUeXBlT2JqZWN0LmVudGl0eVByb3BlcnRpZXMgPSBlbnRpdHlQcm9wZXJ0aWVzO1xuXHRcdGVudGl0eVR5cGVPYmplY3QubmF2aWdhdGlvblByb3BlcnRpZXMgPSBuYXZpZ2F0aW9uUHJvcGVydGllcztcblxuXHRcdHJldHVybiBlbnRpdHlUeXBlT2JqZWN0O1xuXHR9LFxuXHRwYXJzZUFjdGlvbihhY3Rpb25OYW1lOiBzdHJpbmcsIGFjdGlvblJhd0RhdGE6IE1ldGFNb2RlbEFjdGlvbiwgbmFtZXNwYWNlOiBzdHJpbmcpOiBBY3Rpb24ge1xuXHRcdGxldCBhY3Rpb25FbnRpdHlUeXBlOiBzdHJpbmcgPSBcIlwiO1xuXHRcdGxldCBhY3Rpb25GUU4gPSBgJHthY3Rpb25OYW1lfWA7XG5cdFx0aWYgKGFjdGlvblJhd0RhdGEuJElzQm91bmQpIHtcblx0XHRcdGFjdGlvbkVudGl0eVR5cGUgPSBhY3Rpb25SYXdEYXRhLiRQYXJhbWV0ZXJcblx0XHRcdFx0LmZpbHRlcihwYXJhbSA9PiBwYXJhbS4kTmFtZSA9PT0gYWN0aW9uUmF3RGF0YS4kRW50aXR5U2V0UGF0aClcblx0XHRcdFx0Lm1hcChwYXJhbSA9PiBwYXJhbS4kVHlwZSlcblx0XHRcdFx0LmpvaW4oXCJcIik7XG5cdFx0XHRhY3Rpb25GUU4gPSBgJHthY3Rpb25OYW1lfSgke2FjdGlvbkVudGl0eVR5cGV9KWA7XG5cdFx0fVxuXHRcdGNvbnN0IHBhcmFtZXRlcnMgPSBhY3Rpb25SYXdEYXRhLiRQYXJhbWV0ZXIgfHwgW107XG5cdFx0cmV0dXJuIHtcblx0XHRcdF90eXBlOiBcIkFjdGlvblwiLFxuXHRcdFx0bmFtZTogYWN0aW9uTmFtZS5zdWJzdHIobmFtZXNwYWNlLmxlbmd0aCArIDEpLFxuXHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBhY3Rpb25GUU4sXG5cdFx0XHRpc0JvdW5kOiBhY3Rpb25SYXdEYXRhLiRJc0JvdW5kLFxuXHRcdFx0c291cmNlVHlwZTogYWN0aW9uRW50aXR5VHlwZSxcblx0XHRcdHJldHVyblR5cGU6IGFjdGlvblJhd0RhdGEuJFJldHVyblR5cGUgPyBhY3Rpb25SYXdEYXRhLiRSZXR1cm5UeXBlLiRUeXBlIDogXCJcIixcblx0XHRcdHBhcmFtZXRlcnM6IHBhcmFtZXRlcnMubWFwKHBhcmFtID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRfdHlwZTogXCJBY3Rpb25QYXJhbWV0ZXJcIixcblx0XHRcdFx0XHRpc0VudGl0eVNldDogcGFyYW0uJFR5cGUgPT09IGFjdGlvblJhd0RhdGEuJEVudGl0eVNldFBhdGgsXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHthY3Rpb25GUU59LyR7cGFyYW0uJE5hbWV9YCxcblx0XHRcdFx0XHR0eXBlOiBwYXJhbS4kVHlwZVxuXHRcdFx0XHRcdC8vIFRPRE8gbWlzc2luZyBwcm9wZXJ0aWVzID9cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0fTtcblx0fSxcblx0cGFyc2VFbnRpdHlUeXBlcyhvTWV0YU1vZGVsOiBhbnkpOiBQYXJzZXJPdXRwdXQge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWxEYXRhID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCIvJFwiKTtcblx0XHRjb25zdCBvRW50aXR5U2V0cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0XHRsZXQgYW5ub3RhdGlvbkxpc3RzOiBBbm5vdGF0aW9uTGlzdFtdID0gW107XG5cdFx0Y29uc3QgZW50aXR5VHlwZXM6IEVudGl0eVR5cGVbXSA9IFtdO1xuXHRcdGNvbnN0IGVudGl0eVNldHM6IEVudGl0eVNldFtdID0gW107XG5cdFx0Y29uc3QgZW50aXR5Q29udGFpbmVyTmFtZSA9IG9NZXRhTW9kZWxEYXRhLiRFbnRpdHlDb250YWluZXI7XG5cdFx0bGV0IG5hbWVzcGFjZSA9IFwiXCI7XG5cdFx0Y29uc3Qgc2NoZW1hS2V5cyA9IE9iamVjdC5rZXlzKG9NZXRhTW9kZWxEYXRhKS5maWx0ZXIobWV0YW1vZGVsS2V5ID0+IG9NZXRhTW9kZWxEYXRhW21ldGFtb2RlbEtleV0uJGtpbmQgPT09IFwiU2NoZW1hXCIpO1xuXHRcdGlmIChzY2hlbWFLZXlzICYmIHNjaGVtYUtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0bmFtZXNwYWNlID0gc2NoZW1hS2V5c1swXS5zdWJzdHIoMCwgc2NoZW1hS2V5c1swXS5sZW5ndGggLSAxKTtcblx0XHR9IGVsc2UgaWYgKGVudGl0eVR5cGVzICYmIGVudGl0eVR5cGVzLmxlbmd0aCkge1xuXHRcdFx0bmFtZXNwYWNlID0gZW50aXR5VHlwZXNbMF0uZnVsbHlRdWFsaWZpZWROYW1lLnJlcGxhY2UoZW50aXR5VHlwZXNbMF0ubmFtZSwgXCJcIik7XG5cdFx0XHRuYW1lc3BhY2UgPSBuYW1lc3BhY2Uuc3Vic3RyKDAsIG5hbWVzcGFjZS5sZW5ndGggLSAxKTtcblx0XHR9XG5cblx0XHRPYmplY3Qua2V5cyhvTWV0YU1vZGVsRGF0YSlcblx0XHRcdC5maWx0ZXIoZW50aXR5VHlwZU5hbWUgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZW50aXR5VHlwZU5hbWUgIT09IFwiJGtpbmRcIiAmJiBvTWV0YU1vZGVsRGF0YVtlbnRpdHlUeXBlTmFtZV0uJGtpbmQgPT09IFwiRW50aXR5VHlwZVwiO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKGVudGl0eVR5cGVOYW1lID0+IHtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHRoaXMucGFyc2VFbnRpdHlUeXBlKG9NZXRhTW9kZWwsIGVudGl0eVR5cGVOYW1lLCBhbm5vdGF0aW9uTGlzdHMsIG5hbWVzcGFjZSk7XG5cdFx0XHRcdGVudGl0eVR5cGVzLnB1c2goZW50aXR5VHlwZSk7XG5cdFx0XHR9KTtcblx0XHRPYmplY3Qua2V5cyhvRW50aXR5U2V0cylcblx0XHRcdC5maWx0ZXIoZW50aXR5U2V0TmFtZSA9PiB7XG5cdFx0XHRcdHJldHVybiBlbnRpdHlTZXROYW1lICE9PSBcIiRraW5kXCIgJiYgb0VudGl0eVNldHNbZW50aXR5U2V0TmFtZV0uJGtpbmQgPT09IFwiRW50aXR5U2V0XCI7XG5cdFx0XHR9KVxuXHRcdFx0LmZvckVhY2goZW50aXR5U2V0TmFtZSA9PiB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVNldCA9IHRoaXMucGFyc2VFbnRpdHlTZXQob01ldGFNb2RlbCwgZW50aXR5U2V0TmFtZSwgYW5ub3RhdGlvbkxpc3RzLCBlbnRpdHlDb250YWluZXJOYW1lKTtcblx0XHRcdFx0ZW50aXR5U2V0cy5wdXNoKGVudGl0eVNldCk7XG5cdFx0XHR9KTtcblx0XHRlbnRpdHlTZXRzLmZvckVhY2goZW50aXR5U2V0ID0+IHtcblx0XHRcdGNvbnN0IG5hdlByb3BlcnR5QmluZGluZ3MgPSBvTWV0YU1vZGVsRGF0YVtlbnRpdHlDb250YWluZXJOYW1lXVtlbnRpdHlTZXQubmFtZV0uJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc7XG5cdFx0XHRpZiAobmF2UHJvcGVydHlCaW5kaW5ncykge1xuXHRcdFx0XHRPYmplY3Qua2V5cyhuYXZQcm9wZXJ0eUJpbmRpbmdzKS5mb3JFYWNoKG5hdlByb3BOYW1lID0+IHtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRFbnRpdHlTZXQgPSBlbnRpdHlTZXRzLmZpbmQoZW50aXR5U2V0TmFtZSA9PiBlbnRpdHlTZXROYW1lLm5hbWUgPT09IG5hdlByb3BlcnR5QmluZGluZ3NbbmF2UHJvcE5hbWVdKTtcblx0XHRcdFx0XHRpZiAodGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZQcm9wTmFtZV0gPSB0YXJnZXRFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGNvbnN0IGFjdGlvbnM6IEFjdGlvbltdID0gT2JqZWN0LmtleXMob01ldGFNb2RlbERhdGEpXG5cdFx0XHQuZmlsdGVyKGtleSA9PiB7XG5cdFx0XHRcdHJldHVybiBBcnJheS5pc0FycmF5KG9NZXRhTW9kZWxEYXRhW2tleV0pICYmIG9NZXRhTW9kZWxEYXRhW2tleV0ubGVuZ3RoID4gMCAmJiBvTWV0YU1vZGVsRGF0YVtrZXldWzBdLiRraW5kID09PSBcIkFjdGlvblwiO1xuXHRcdFx0fSlcblx0XHRcdC5yZWR1Y2UoKG91dEFjdGlvbnM6IEFjdGlvbltdLCBhY3Rpb25OYW1lKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFjdGlvbnMgPSBvTWV0YU1vZGVsRGF0YVthY3Rpb25OYW1lXTtcblx0XHRcdFx0YWN0aW9ucy5mb3JFYWNoKChhY3Rpb246IE1ldGFNb2RlbEFjdGlvbikgPT4ge1xuXHRcdFx0XHRcdG91dEFjdGlvbnMucHVzaCh0aGlzLnBhcnNlQWN0aW9uKGFjdGlvbk5hbWUsIGFjdGlvbiwgbmFtZXNwYWNlKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gb3V0QWN0aW9ucztcblx0XHRcdH0sIFtdKTtcblx0XHQvLyBGSVhNRSBDcmFwcHkgY29kZSB0byBkZWFsIHdpdGggYW5ub3RhdGlvbnMgZm9yIGZ1bmN0aW9uc1xuXHRcdGNvbnN0IGFubm90YXRpb25zID0gb01ldGFNb2RlbERhdGEuJEFubm90YXRpb25zO1xuXHRcdGNvbnN0IGFjdGlvbkFubm90YXRpb25zID0gT2JqZWN0LmtleXMoYW5ub3RhdGlvbnMpLmZpbHRlcih0YXJnZXQgPT4gdGFyZ2V0LmluZGV4T2YoXCIoXCIpICE9PSAtMSk7XG5cdFx0YWN0aW9uQW5ub3RhdGlvbnMuZm9yRWFjaCh0YXJnZXQgPT4ge1xuXHRcdFx0dGhpcy5jcmVhdGVBbm5vdGF0aW9uTGlzdHMob01ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW3RhcmdldF0sIHRhcmdldCwgYW5ub3RhdGlvbkxpc3RzKTtcblx0XHR9KTtcblx0XHQvLyBTb3J0IGJ5IHRhcmdldCBsZW5ndGhcblx0XHRhbm5vdGF0aW9uTGlzdHMgPSBhbm5vdGF0aW9uTGlzdHMuc29ydCgoYSwgYikgPT4gKGEudGFyZ2V0Lmxlbmd0aCA+PSBiLnRhcmdldC5sZW5ndGggPyAxIDogLTEpKTtcblx0XHRjb25zdCByZWZlcmVuY2VzOiBSZWZlcmVuY2VbXSA9IFtdO1xuXHRcdHJldHVybiB7XG5cdFx0XHRpZGVudGlmaWNhdGlvbjogXCJtZXRhbW9kZWxSZXN1bHRcIixcblx0XHRcdHZlcnNpb246IFwiNC4wXCIsXG5cdFx0XHRzY2hlbWE6IHtcblx0XHRcdFx0ZW50aXR5Q29udGFpbmVyOiB7fSxcblx0XHRcdFx0ZW50aXR5U2V0cyxcblx0XHRcdFx0ZW50aXR5VHlwZXMsXG5cdFx0XHRcdGFzc29jaWF0aW9uczogW10sXG5cdFx0XHRcdGFjdGlvbnMsXG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0YW5ub3RhdGlvbnM6IHtcblx0XHRcdFx0XHRcIm1ldGFtb2RlbFJlc3VsdFwiOiBhbm5vdGF0aW9uTGlzdHNcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHJlZmVyZW5jZXM6IHJlZmVyZW5jZXNcblx0XHR9O1xuXHR9XG59O1xuXG5jb25zdCBtTWV0YU1vZGVsTWFwOiBSZWNvcmQ8c3RyaW5nLCBQYXJzZXJPdXRwdXQ+ID0ge307XG5cbi8qKlxuICogQ29udmVydCB0aGUgT0RhdGFNZXRhTW9kZWwgaW50byBhbm90aGVyIGZvcm1hdCB0aGF0IGFsbG93IGZvciBlYXN5IG1hbmlwdWxhdGlvbiBvZiB0aGUgYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPRGF0YU1ldGFNb2RlbH0gb01ldGFNb2RlbCB0aGUgY3VycmVudCBvRGF0YU1ldGFNb2RlbFxuICogQHJldHVybnMge0NvbnZlcnRlck91dHB1dH0gYW4gb2JqZWN0IGNvbnRhaW5pbmcgb2JqZWN0IGxpa2UgYW5ub3RhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFR5cGVzKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogQ29udmVydGVyT3V0cHV0IHtcblx0Y29uc3Qgc01ldGFNb2RlbElkID0gKG9NZXRhTW9kZWwgYXMgYW55KS5pZDtcblx0aWYgKCFtTWV0YU1vZGVsTWFwLmhhc093blByb3BlcnR5KHNNZXRhTW9kZWxJZCkpIHtcblx0XHRjb25zdCBwYXJzZWRPdXRwdXQgPSBNZXRhTW9kZWxDb252ZXJ0ZXIucGFyc2VFbnRpdHlUeXBlcyhvTWV0YU1vZGVsKTtcblx0XHRtTWV0YU1vZGVsTWFwW3NNZXRhTW9kZWxJZF0gPSBBbm5vdGF0aW9uQ29udmVydGVyLmNvbnZlcnRUeXBlcyhwYXJzZWRPdXRwdXQpO1xuXHR9XG5cdHJldHVybiAobU1ldGFNb2RlbE1hcFtzTWV0YU1vZGVsSWRdIGFzIGFueSkgYXMgQ29udmVydGVyT3V0cHV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydE1ldGFNb2RlbENvbnRleHQob01ldGFNb2RlbENvbnRleHQ6IENvbnRleHQpOiBhbnkge1xuXHRjb25zdCBvQ29udmVydGVyT3V0cHV0ID0gY29udmVydFR5cGVzKChvTWV0YU1vZGVsQ29udGV4dC5nZXRNb2RlbCgpIGFzIHVua25vd24pIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0Y29uc3Qgc1BhdGggPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRQYXRoKCk7XG5cdGNvbnN0IGFQYXRoU3BsaXQgPSBzUGF0aC5zcGxpdChcIi9cIik7XG5cdGxldCB0YXJnZXRFbnRpdHlTZXQ6IF9FbnRpdHlTZXQgPSBvQ29udmVydGVyT3V0cHV0LmVudGl0eVNldHMuZmluZChlbnRpdHlTZXQgPT4gZW50aXR5U2V0Lm5hbWUgPT09IGFQYXRoU3BsaXRbMV0pIGFzIF9FbnRpdHlTZXQ7XG5cdGxldCByZWxhdGl2ZVBhdGggPSBhUGF0aFNwbGl0LnNsaWNlKDIpLmpvaW4oXCIvXCIpO1xuXHRpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiKSkge1xuXHRcdHRhcmdldEVudGl0eVNldCA9IHRhcmdldEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW2FQYXRoU3BsaXRbM11dO1xuXHRcdHJlbGF0aXZlUGF0aCA9IGFQYXRoU3BsaXQuc2xpY2UoNCkuam9pbihcIi9cIik7XG5cdH1cblx0aWYgKHRhcmdldEVudGl0eVNldCkge1xuXHRcdHJldHVybiB0YXJnZXRFbnRpdHlTZXQuZW50aXR5VHlwZS5yZXNvbHZlUGF0aChyZWxhdGl2ZVBhdGgpO1xuXHR9XG59XG4iXX0=