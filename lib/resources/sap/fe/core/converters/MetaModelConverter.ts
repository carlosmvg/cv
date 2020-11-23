import { Annotation, AnnotationList, AnnotationRecord, Expression, ParserOutput } from "@sap-ux/vocabularies-types";
// This file is retrieved from @sap-ux/annotation-converter, shared code with tool suite
import { AnnotationConverter } from "sap/fe/core/converters/common";
import { ODataMetaModel } from "sap/ui/model/odata/v4";
import { getCapabilities } from "sap/fe/core/EnvironmentCapabilities";
import { ConverterOutput, EntitySet as _EntitySet } from "@sap-ux/annotation-converter";
import {
	EntityType,
	EntitySet,
	Property,
	ReferentialConstraint,
	V4NavigationProperty,
	Action,
	Reference
} from "@sap-ux/vocabularies-types/dist/Parser";
import { Context } from "sap/ui/model";

const VOCABULARY_ALIAS: any = {
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

type MetaModelAction = {
	$kind: "Action";
	$IsBound: boolean;
	$EntitySetPath: string;
	$Parameter: {
		$Type: string;
		$Name: string;
		$Nullable?: boolean;
		$MaxLength?: number;
		$Precision?: number;
		$Scale?: number;
	}[];
	$ReturnType: {
		$Type: string;
	};
};

const MetaModelConverter = {
	parsePropertyValue(annotationObject: any, propertyKey: string, currentTarget: string, annotationsLists: any[]): any {
		let value;
		const currentPropertyTarget: string = currentTarget + "/" + propertyKey;
		if (annotationObject === null) {
			value = { type: "Null", Null: null };
		} else if (typeof annotationObject === "string") {
			value = { type: "String", String: annotationObject };
		} else if (typeof annotationObject === "boolean") {
			value = { type: "Bool", Bool: annotationObject };
		} else if (typeof annotationObject === "number") {
			value = { type: "Int", Int: annotationObject };
		} else if (Array.isArray(annotationObject)) {
			value = {
				type: "Collection",
				Collection: annotationObject.map((subAnnotationObject, subAnnotationObjectIndex) =>
					this.parseAnnotationObject(
						subAnnotationObject,
						currentPropertyTarget + "/" + subAnnotationObjectIndex,
						annotationsLists
					)
				)
			};
			if (annotationObject.length > 0) {
				if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
					(value.Collection as any).type = "PropertyPath";
				} else if (annotationObject[0].hasOwnProperty("$Path")) {
					(value.Collection as any).type = "Path";
				} else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
					(value.Collection as any).type = "NavigationPropertyPath";
				} else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
					(value.Collection as any).type = "AnnotationPath";
				} else if (annotationObject[0].hasOwnProperty("$Type")) {
					(value.Collection as any).type = "Record";
				} else if (typeof annotationObject[0] === "object") {
					// $Type is optional...
					(value.Collection as any).type = "Record";
				} else {
					(value.Collection as any).type = "String";
				}
			}
		} else if (annotationObject.$Path !== undefined) {
			value = { type: "Path", Path: annotationObject.$Path };
		} else if (annotationObject.$Decimal !== undefined) {
			value = { type: "Decimal", Decimal: parseFloat(annotationObject.$Decimal) };
		} else if (annotationObject.$PropertyPath !== undefined) {
			value = { type: "PropertyPath", PropertyPath: annotationObject.$PropertyPath };
		} else if (annotationObject.$NavigationPropertyPath !== undefined) {
			value = {
				type: "NavigationPropertyPath",
				NavigationPropertyPath: annotationObject.$NavigationPropertyPath
			};
		} else if (annotationObject.$If !== undefined) {
			value = { type: "If", If: annotationObject.$If };
		} else if (annotationObject.$AnnotationPath !== undefined) {
			value = { type: "AnnotationPath", AnnotationPath: annotationObject.$AnnotationPath };
		} else if (annotationObject.$EnumMember !== undefined) {
			value = {
				type: "EnumMember",
				EnumMember:
					this.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
			};
		} else if (annotationObject.$Type) {
			value = {
				type: "Record",
				Record: this.parseAnnotationObject(annotationObject, currentTarget, annotationsLists)
			};
		}

		return {
			name: propertyKey,
			value
		};
	},
	mapNameToAlias(annotationName: string): string {
		let [pathPart, annoPart] = annotationName.split("@");
		if (!annoPart) {
			annoPart = pathPart;
			pathPart = "";
		} else {
			pathPart += "@";
		}
		const lastDot = annoPart.lastIndexOf(".");
		return pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)] + "." + annoPart.substr(lastDot + 1);
	},
	parseAnnotationObject(
		annotationObject: any,
		currentObjectTarget: string,
		annotationsLists: any[]
	): Expression | AnnotationRecord | Annotation {
		let parsedAnnotationObject: any = {};
		if (annotationObject === null) {
			parsedAnnotationObject = { type: "Null", Null: null };
		} else if (typeof annotationObject === "string") {
			parsedAnnotationObject = { type: "String", String: annotationObject };
		} else if (typeof annotationObject === "boolean") {
			parsedAnnotationObject = { type: "Bool", Bool: annotationObject };
		} else if (typeof annotationObject === "number") {
			parsedAnnotationObject = { type: "Int", Int: annotationObject };
		} else if (annotationObject.$AnnotationPath !== undefined) {
			parsedAnnotationObject = { type: "AnnotationPath", AnnotationPath: annotationObject.$AnnotationPath };
		} else if (annotationObject.$Path !== undefined) {
			parsedAnnotationObject = { type: "Path", Path: annotationObject.$Path };
		} else if (annotationObject.$Decimal !== undefined) {
			parsedAnnotationObject = { type: "Decimal", Decimal: parseFloat(annotationObject.$Decimal) };
		} else if (annotationObject.$PropertyPath !== undefined) {
			parsedAnnotationObject = { type: "PropertyPath", PropertyPath: annotationObject.$PropertyPath };
		} else if (annotationObject.$If !== undefined) {
			parsedAnnotationObject = { type: "If", If: annotationObject.$If };
		} else if (annotationObject.$NavigationPropertyPath !== undefined) {
			parsedAnnotationObject = {
				type: "NavigationPropertyPath",
				NavigationPropertyPath: annotationObject.$NavigationPropertyPath
			};
		} else if (annotationObject.$EnumMember !== undefined) {
			parsedAnnotationObject = {
				type: "EnumMember",
				EnumMember:
					this.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
			};
		} else if (Array.isArray(annotationObject)) {
			const parsedAnnotationCollection = parsedAnnotationObject as any;
			parsedAnnotationCollection.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) =>
				this.parseAnnotationObject(subAnnotationObject, currentObjectTarget + "/" + subAnnotationIndex, annotationsLists)
			);
			if (annotationObject.length > 0) {
				if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
					(parsedAnnotationCollection.collection as any).type = "PropertyPath";
				} else if (annotationObject[0].hasOwnProperty("$Path")) {
					(parsedAnnotationCollection.collection as any).type = "Path";
				} else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
					(parsedAnnotationCollection.collection as any).type = "NavigationPropertyPath";
				} else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
					(parsedAnnotationCollection.collection as any).type = "AnnotationPath";
				} else if (annotationObject[0].hasOwnProperty("$Type")) {
					(parsedAnnotationCollection.collection as any).type = "Record";
				} else if (annotationObject[0].hasOwnProperty("$If")) {
					(parsedAnnotationCollection.collection as any).type = "If";
				} else if (typeof annotationObject[0] === "object") {
					(parsedAnnotationCollection.collection as any).type = "Record";
				} else {
					(parsedAnnotationCollection.collection as any).type = "String";
				}
			}
		} else {
			if (annotationObject.$Type) {
				const typeValue = annotationObject.$Type;
				parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
			}
			const propertyValues: any = [];
			Object.keys(annotationObject).forEach(propertyKey => {
				if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
					propertyValues.push(
						this.parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists)
					);
				} else if (propertyKey.startsWith("@")) {
					// Annotation of annotation
					this.createAnnotationLists({ [propertyKey]: annotationObject[propertyKey] }, currentObjectTarget, annotationsLists);
				}
			});
			parsedAnnotationObject.propertyValues = propertyValues;
		}
		return parsedAnnotationObject;
	},
	getOrCreateAnnotationList(target: string, annotationsLists: AnnotationList[]): AnnotationList {
		let potentialTarget = annotationsLists.find(annotationList => annotationList.target === target);
		if (!potentialTarget) {
			potentialTarget = {
				target: target,
				annotations: []
			};
			annotationsLists.push(potentialTarget);
		}
		return potentialTarget;
	},

	createAnnotationLists(annotationObjects: any, annotationTarget: string, annotationLists: any[]) {
		const outAnnotationObject = this.getOrCreateAnnotationList(annotationTarget, annotationLists);
		const oCapabilities = getCapabilities();
		if (!oCapabilities.MicroChart) {
			delete annotationObjects["@com.sap.vocabularies.UI.v1.Chart"];
		}
		Object.keys(annotationObjects).forEach(annotationKey => {
			let annotationObject = annotationObjects[annotationKey];
			switch (annotationKey) {
				case "@com.sap.vocabularies.UI.v1.HeaderFacets":
					if (!oCapabilities.MicroChart) {
						annotationObject = annotationObject.filter((oRecord: any) => {
							return oRecord.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") === -1;
						});
					}
					break;
				case "@com.sap.vocabularies.UI.v1.Identification":
					if (!oCapabilities.IntentBasedNavigation) {
						annotationObject = annotationObject.filter((oRecord: any) => {
							return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
						});
					}
					break;
				case "@com.sap.vocabularies.UI.v1.LineItem":
				case "@com.sap.vocabularies.UI.v1.FieldGroup":
					if (!oCapabilities.IntentBasedNavigation) {
						annotationObject = annotationObject.filter((oRecord: any) => {
							return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
						});
					}
					if (!oCapabilities.MicroChart) {
						annotationObject = annotationObject.filter((oRecord: any) => {
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
			let currentOutAnnotationObject = outAnnotationObject;
			const annotationQualifierSplit = annotationKey.split("#");
			const qualifier = annotationQualifierSplit[1];
			annotationKey = annotationQualifierSplit[0];
			// Check for annotation of annotation
			const annotationOfAnnotationSplit = annotationKey.split("@");
			if (annotationOfAnnotationSplit.length > 2) {
				currentOutAnnotationObject = this.getOrCreateAnnotationList(
					annotationTarget + "@" + annotationOfAnnotationSplit[1],
					annotationLists
				);
				annotationKey = annotationOfAnnotationSplit[2];
			} else {
				annotationKey = annotationOfAnnotationSplit[1];
			}

			const parsedAnnotationObject: any = {
				term: `${annotationKey}`,
				qualifier: qualifier
			};
			let currentAnnotationTarget = annotationTarget + "@" + parsedAnnotationObject.term;
			if (qualifier) {
				currentAnnotationTarget += "#" + qualifier;
			}
			let isCollection = false;
			if (annotationObject === null) {
				parsedAnnotationObject.value = { type: "Bool", Bool: annotationObject };
			} else if (typeof annotationObject === "string") {
				parsedAnnotationObject.value = { type: "String", String: annotationObject };
			} else if (typeof annotationObject === "boolean") {
				parsedAnnotationObject.value = { type: "Bool", Bool: annotationObject };
			} else if (typeof annotationObject === "number") {
				parsedAnnotationObject.value = { type: "Int", Int: annotationObject };
			} else if (annotationObject.$If !== undefined) {
				parsedAnnotationObject.value = { type: "If", If: annotationObject.$If };
			} else if (annotationObject.$Path !== undefined) {
				parsedAnnotationObject.value = { type: "Path", Path: annotationObject.$Path };
			} else if (annotationObject.$AnnotationPath !== undefined) {
				parsedAnnotationObject.value = {
					type: "AnnotationPath",
					AnnotationPath: annotationObject.$AnnotationPath
				};
			} else if (annotationObject.$Decimal !== undefined) {
				parsedAnnotationObject.value = { type: "Decimal", Decimal: parseFloat(annotationObject.$Decimal) };
			} else if (annotationObject.$EnumMember !== undefined) {
				parsedAnnotationObject.value = {
					type: "EnumMember",
					EnumMember:
						this.mapNameToAlias(annotationObject.$EnumMember.split("/")[0]) + "/" + annotationObject.$EnumMember.split("/")[1]
				};
			} else if (Array.isArray(annotationObject)) {
				isCollection = true;
				parsedAnnotationObject.collection = annotationObject.map((subAnnotationObject, subAnnotationIndex) =>
					this.parseAnnotationObject(subAnnotationObject, currentAnnotationTarget + "/" + subAnnotationIndex, annotationLists)
				);
				if (annotationObject.length > 0) {
					if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
						(parsedAnnotationObject.collection as any).type = "PropertyPath";
					} else if (annotationObject[0].hasOwnProperty("$Path")) {
						(parsedAnnotationObject.collection as any).type = "Path";
					} else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
						(parsedAnnotationObject.collection as any).type = "NavigationPropertyPath";
					} else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
						(parsedAnnotationObject.collection as any).type = "AnnotationPath";
					} else if (annotationObject[0].hasOwnProperty("$Type")) {
						(parsedAnnotationObject.collection as any).type = "Record";
					} else if (typeof annotationObject[0] === "object") {
						(parsedAnnotationObject.collection as any).type = "Record";
					} else {
						(parsedAnnotationObject.collection as any).type = "String";
					}
				}
			} else {
				const record: AnnotationRecord = {
					propertyValues: []
				};
				if (annotationObject.$Type) {
					const typeValue = annotationObject.$Type;
					record.type = `${typeValue}`;
				}
				const propertyValues: any[] = [];
				Object.keys(annotationObject).forEach(propertyKey => {
					if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
						propertyValues.push(
							this.parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists)
						);
					} else if (propertyKey.startsWith("@")) {
						// Annotation of record
						annotationLists.push({
							target: currentAnnotationTarget,
							annotations: [
								{
									value: this.parseAnnotationObject(
										annotationObject[propertyKey],
										currentAnnotationTarget,
										annotationLists
									)
								}
							]
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
	parseProperty(oMetaModel: any, entityTypeObject: EntityType, propertyName: string, annotationLists: AnnotationList[]): Property {
		const propertyAnnotation = oMetaModel.getObject(`/${entityTypeObject.fullyQualifiedName}/${propertyName}@`);
		const propertyDefinition = oMetaModel.getObject(`/${entityTypeObject.fullyQualifiedName}/${propertyName}`);

		const propertyObject: Property = {
			_type: "Property",
			name: propertyName,
			fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${propertyName}`,
			type: propertyDefinition.$Type,
			maxLength: propertyDefinition.$MaxLength,
			precision: propertyDefinition.$Precision,
			scale: propertyDefinition.$Scale,
			nullable: propertyDefinition.$Nullable
		};

		this.createAnnotationLists(propertyAnnotation, propertyObject.fullyQualifiedName, annotationLists);

		return propertyObject;
	},
	parseNavigationProperty(
		oMetaModel: any,
		entityTypeObject: EntityType,
		navPropertyName: string,
		annotationLists: AnnotationList[]
	): V4NavigationProperty {
		const navPropertyAnnotation = oMetaModel.getObject(`/${entityTypeObject.fullyQualifiedName}/${navPropertyName}@`);
		const navPropertyDefinition = oMetaModel.getObject(`/${entityTypeObject.fullyQualifiedName}/${navPropertyName}`);

		let referentialConstraint: ReferentialConstraint[] = [];
		if (navPropertyDefinition.$ReferentialConstraint) {
			referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(sourcePropertyName => {
				return {
					sourceTypeName: entityTypeObject.name,
					sourceProperty: sourcePropertyName,
					targetTypeName: navPropertyDefinition.$Type,
					targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
				};
			});
		}
		const navigationProperty: V4NavigationProperty = {
			_type: "NavigationProperty",
			name: navPropertyName,
			fullyQualifiedName: `${entityTypeObject.fullyQualifiedName}/${navPropertyName}`,
			partner: navPropertyDefinition.$Partner,
			isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
			containsTarget: navPropertyDefinition.$ContainsTarget,
			targetTypeName: navPropertyDefinition.$Type,
			referentialConstraint
		};

		this.createAnnotationLists(navPropertyAnnotation, navigationProperty.fullyQualifiedName, annotationLists);

		return navigationProperty;
	},
	parseEntitySet(oMetaModel: any, entitySetName: string, annotationLists: AnnotationList[], entityContainerName: string): EntitySet {
		const entitySetDefinition = oMetaModel.getObject(`/${entitySetName}`);
		const entitySetAnnotation = oMetaModel.getObject(`/${entitySetName}@`);
		const entitySetObject: EntitySet = {
			_type: "EntitySet",
			name: entitySetName,
			navigationPropertyBinding: {},
			entityTypeName: entitySetDefinition.$Type,
			fullyQualifiedName: `${entityContainerName}/${entitySetName}`
		};
		this.createAnnotationLists(entitySetAnnotation, entitySetObject.fullyQualifiedName, annotationLists);
		return entitySetObject;
	},

	parseEntityType(oMetaModel: any, entityTypeName: string, annotationLists: AnnotationList[], namespace: string): EntityType {
		const entityTypeAnnotation = oMetaModel.getObject(`/${entityTypeName}@`);
		const entityTypeDefinition = oMetaModel.getObject(`/${entityTypeName}`);
		const entityKeys = entityTypeDefinition.$Key;
		const entityTypeObject: EntityType = {
			_type: "EntityType",
			name: entityTypeName.replace(namespace + ".", ""),
			fullyQualifiedName: entityTypeName,
			keys: [],
			entityProperties: [],
			navigationProperties: []
		};

		this.createAnnotationLists(entityTypeAnnotation, entityTypeObject.fullyQualifiedName, annotationLists);
		const entityProperties = Object.keys(entityTypeDefinition)
			.filter(propertyNameOrNot => {
				if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
					return entityTypeDefinition[propertyNameOrNot].$kind === "Property";
				}
			})
			.map(propertyName => {
				return this.parseProperty(oMetaModel, entityTypeObject, propertyName, annotationLists);
			});

		const navigationProperties = Object.keys(entityTypeDefinition)
			.filter(propertyNameOrNot => {
				if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
					return entityTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
				}
			})
			.map(navPropertyName => {
				return this.parseNavigationProperty(oMetaModel, entityTypeObject, navPropertyName, annotationLists);
			});

		entityTypeObject.keys = entityKeys
			.map((entityKey: string) => entityProperties.find((property: Property) => property.name === entityKey))
			.filter((property: Property) => property !== undefined);
		entityTypeObject.entityProperties = entityProperties;
		entityTypeObject.navigationProperties = navigationProperties;

		return entityTypeObject;
	},
	parseAction(actionName: string, actionRawData: MetaModelAction, namespace: string): Action {
		let actionEntityType: string = "";
		let actionFQN = `${actionName}`;
		if (actionRawData.$IsBound) {
			actionEntityType = actionRawData.$Parameter
				.filter(param => param.$Name === actionRawData.$EntitySetPath)
				.map(param => param.$Type)
				.join("");
			actionFQN = `${actionName}(${actionEntityType})`;
		}
		const parameters = actionRawData.$Parameter || [];
		return {
			_type: "Action",
			name: actionName.substr(namespace.length + 1),
			fullyQualifiedName: actionFQN,
			isBound: actionRawData.$IsBound,
			sourceType: actionEntityType,
			returnType: actionRawData.$ReturnType ? actionRawData.$ReturnType.$Type : "",
			parameters: parameters.map(param => {
				return {
					_type: "ActionParameter",
					isEntitySet: param.$Type === actionRawData.$EntitySetPath,
					fullyQualifiedName: `${actionFQN}/${param.$Name}`,
					type: param.$Type
					// TODO missing properties ?
				};
			})
		};
	},
	parseEntityTypes(oMetaModel: any): ParserOutput {
		const oMetaModelData = oMetaModel.getObject("/$");
		const oEntitySets = oMetaModel.getObject("/");
		let annotationLists: AnnotationList[] = [];
		const entityTypes: EntityType[] = [];
		const entitySets: EntitySet[] = [];
		const entityContainerName = oMetaModelData.$EntityContainer;
		let namespace = "";
		const schemaKeys = Object.keys(oMetaModelData).filter(metamodelKey => oMetaModelData[metamodelKey].$kind === "Schema");
		if (schemaKeys && schemaKeys.length > 0) {
			namespace = schemaKeys[0].substr(0, schemaKeys[0].length - 1);
		} else if (entityTypes && entityTypes.length) {
			namespace = entityTypes[0].fullyQualifiedName.replace(entityTypes[0].name, "");
			namespace = namespace.substr(0, namespace.length - 1);
		}

		Object.keys(oMetaModelData)
			.filter(entityTypeName => {
				return entityTypeName !== "$kind" && oMetaModelData[entityTypeName].$kind === "EntityType";
			})
			.forEach(entityTypeName => {
				const entityType = this.parseEntityType(oMetaModel, entityTypeName, annotationLists, namespace);
				entityTypes.push(entityType);
			});
		Object.keys(oEntitySets)
			.filter(entitySetName => {
				return entitySetName !== "$kind" && oEntitySets[entitySetName].$kind === "EntitySet";
			})
			.forEach(entitySetName => {
				const entitySet = this.parseEntitySet(oMetaModel, entitySetName, annotationLists, entityContainerName);
				entitySets.push(entitySet);
			});
		entitySets.forEach(entitySet => {
			const navPropertyBindings = oMetaModelData[entityContainerName][entitySet.name].$NavigationPropertyBinding;
			if (navPropertyBindings) {
				Object.keys(navPropertyBindings).forEach(navPropName => {
					const targetEntitySet = entitySets.find(entitySetName => entitySetName.name === navPropertyBindings[navPropName]);
					if (targetEntitySet) {
						entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
					}
				});
			}
		});

		const actions: Action[] = Object.keys(oMetaModelData)
			.filter(key => {
				return Array.isArray(oMetaModelData[key]) && oMetaModelData[key].length > 0 && oMetaModelData[key][0].$kind === "Action";
			})
			.reduce((outActions: Action[], actionName) => {
				const actions = oMetaModelData[actionName];
				actions.forEach((action: MetaModelAction) => {
					outActions.push(this.parseAction(actionName, action, namespace));
				});
				return outActions;
			}, []);
		// FIXME Crappy code to deal with annotations for functions
		const annotations = oMetaModelData.$Annotations;
		const actionAnnotations = Object.keys(annotations).filter(target => target.indexOf("(") !== -1);
		actionAnnotations.forEach(target => {
			this.createAnnotationLists(oMetaModelData.$Annotations[target], target, annotationLists);
		});
		// Sort by target length
		annotationLists = annotationLists.sort((a, b) => (a.target.length >= b.target.length ? 1 : -1));
		const references: Reference[] = [];
		return {
			identification: "metamodelResult",
			version: "4.0",
			schema: {
				entityContainer: {},
				entitySets,
				entityTypes,
				associations: [],
				actions,
				namespace,
				annotations: {
					"metamodelResult": annotationLists
				}
			},
			references: references
		};
	}
};

const mMetaModelMap: Record<string, ParserOutput> = {};

/**
 * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
 *
 * @param {ODataMetaModel} oMetaModel the current oDataMetaModel
 * @returns {ConverterOutput} an object containing object like annotation
 */
export function convertTypes(oMetaModel: ODataMetaModel): ConverterOutput {
	const sMetaModelId = (oMetaModel as any).id;
	if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
		const parsedOutput = MetaModelConverter.parseEntityTypes(oMetaModel);
		mMetaModelMap[sMetaModelId] = AnnotationConverter.convertTypes(parsedOutput);
	}
	return (mMetaModelMap[sMetaModelId] as any) as ConverterOutput;
}

export function convertMetaModelContext(oMetaModelContext: Context): any {
	const oConverterOutput = convertTypes((oMetaModelContext.getModel() as unknown) as ODataMetaModel);
	const sPath = oMetaModelContext.getPath();
	const aPathSplit = sPath.split("/");
	let targetEntitySet: _EntitySet = oConverterOutput.entitySets.find(entitySet => entitySet.name === aPathSplit[1]) as _EntitySet;
	let relativePath = aPathSplit.slice(2).join("/");
	if (relativePath.startsWith("$NavigationPropertyBinding")) {
		targetEntitySet = targetEntitySet.navigationPropertyBinding[aPathSplit[3]];
		relativePath = aPathSplit.slice(4).join("/");
	}
	if (targetEntitySet) {
		return targetEntitySet.entityType.resolvePath(relativePath);
	}
}
