sap.ui.define(["sap/fe/macros/DelegateUtil", "sap/ui/model/json/JSONModel", "sap/fe/macros/CommonHelper"], function(
	DelegateUtil,
	JSONModel,
	Common
) {
	"use strict";
	/**
	 * Is property of complex type.
	 *
	 * @param {object} mProperty - property from entity type
	 * @returns {boolean} true if property is of complex type
	 */
	function _isComplexType(mProperty) {
		if (mProperty && mProperty.$Type) {
			if (mProperty.$Type.toLowerCase().indexOf("edm") !== 0) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Check if a given property path starts with a navigation property.
	 *
	 * @param {string} sPropertyPath - path of the property
	 * @param {object} aNavigationProperties - list of navigation properties of the entity type
	 * @returns {boolean} true if property is of complex type
	 */
	function _startsWithNavigationProperty(sPropertyPath, aNavigationProperties) {
		return aNavigationProperties.some(function(sNavProp) {
			if (sPropertyPath.startsWith(sNavProp)) {
				return true;
			}
		});
	}
	/**
	 * Get delegate format for a given property.
	 *
	 * @param {string} sPropertyPath - path of the property
	 * @param {object} mElement - property in metadata format
	 * @param {object} mPropertyAnnotations - annotations for the property
	 * @param {string} sEntityType - entity type name
	 * @param {sap.ui.core.Control} oElement - control instance
	 * @param {string} sAggregationName - aggregation name for which the delegate should provide additional elements
	 * @param {Array} aNavigationProperties - list of navigation properties for the entity type
	 * @returns {object} property in delegate format
	 * @private
	 */
	function _enrichProperty(
		sPropertyPath,
		mElement,
		mPropertyAnnotations,
		sEntityType,
		oElement,
		sAggregationName,
		aNavigationProperties
	) {
		var mProp = {
			name: sPropertyPath,
			bindingPath: sPropertyPath,
			entityType: sEntityType
		};
		// get label information, either via DataFieldDefault annotation (if exists) or Label annotation
		var mDataFieldDefaultAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.DataFieldDefault"];
		var sLabel =
			(mDataFieldDefaultAnnotation && mDataFieldDefaultAnnotation.Label) ||
			mPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"];
		mProp.label = sLabel || "[LABEL_MISSING: " + sPropertyPath + "]";
		// evaluate Hidden annotation
		var mHiddenAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
		mProp.unsupported = mHiddenAnnotation;
		if (mHiddenAnnotation && mHiddenAnnotation.$Path) {
			mProp.unsupported = oElement.getBindingContext().getProperty(mHiddenAnnotation.$Path);
		}
		var mFieldControlAnnotation;
		if (!mProp.unsupported) {
			mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
			if (mFieldControlAnnotation) {
				mProp.unsupported = mFieldControlAnnotation.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
			}
		}
		// @runtime hidden by field control value = 0
		mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
		var sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
		if (sFieldControlPath && !mProp.unsupported) {
			// if the binding is a list binding, skip the check for field control
			var bListBinding = oElement.getBinding(sAggregationName) instanceof sap.ui.model.ListBinding;
			if (!bListBinding) {
				var iFieldControlValue = oElement.getBindingContext().getProperty(sFieldControlPath);
				mProp.unsupported = iFieldControlValue !== 0;
			}
		}
		// no support for DataFieldFor/WithAction and DataFieldFor/WithIntentBasedNavigation within DataFieldDefault annotation
		if (
			mDataFieldDefaultAnnotation &&
			(mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction" ||
				mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation")
		) {
			mProp.unsupported = true;
		}
		// no support for navigation properties and complex properties
		if (!mProp.unsupported) {
			mProp.unsupported = _startsWithNavigationProperty(sPropertyPath, aNavigationProperties) || _isComplexType(mElement);
		}
		return mProp;
	}
	/**
	 * Convert metadata format to delegate format.
	 *
	 * @param {object} mODataEntityType - entity type in metadata format
	 * @param {string} sEntityType - entity type name
	 * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel - meta model
	 * @param {sap.ui.core.Control} oElement - control instance
	 * @param {string} sAggregationName - aggregation name for which the delegate should provide additional elements
	 * @returns {Array} list of properties in delegate format
	 * @private
	 */
	function _convertMetadataToDelegateFormat(mODataEntityType, sEntityType, oMetaModel, oElement, sAggregationName) {
		var aProperties = [];
		var sElementName = "";
		var aNavigationProperties = [];
		var mElement;
		for (sElementName in mODataEntityType) {
			mElement = mODataEntityType[sElementName];
			if (mElement.$kind === "NavigationProperty") {
				aNavigationProperties.push(sElementName);
			}
		}
		for (sElementName in mODataEntityType) {
			mElement = mODataEntityType[sElementName];
			if (mElement.$kind === "Property") {
				var mPropAnnotations = oMetaModel.getObject("/" + sEntityType + "/" + sElementName + "@");
				var mProp = _enrichProperty(
					sElementName,
					mElement,
					mPropAnnotations,
					sEntityType,
					oElement,
					sAggregationName,
					aNavigationProperties
				);
				aProperties.push(mProp);
			}
		}
		return aProperties;
	}
	/**
	 * Get binding path either from payload (if available) or the element's binding context.
	 *
	 * @param {sap.ui.core.Control} oElement - control instance
	 * @param {object} mPayload - payload parameter attached to the delegate, empty object if no payload was assigned
	 * @returns {string} the binding path
	 * @private
	 */
	function _getBindingPath(oElement, mPayload) {
		if (mPayload.path) {
			return mPayload.path;
		}
		var vBinding = oElement.getBindingContext();
		if (vBinding) {
			return vBinding.getPath();
		}
	}
	/**
	 * Get all properties of the element's model.
	 *
	 * @param {sap.ui.core.Control} oElement - control instance
	 * @param {string} sAggregationName - aggregation name for which the delegate should provide additional elements
	 * @param {object} mPayload - payload parameter attached to the delegate, empty object if no payload was assigned
	 * @returns {Array} list of properties in delegate format
	 * @private
	 */
	function _getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
		var oModel = oElement.getModel(mPayload.modelName);
		if (oModel) {
			if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
				var oMetaModel = oModel.getMetaModel();
				var sBindingContextPath = _getBindingPath(oElement, mPayload);
				if (sBindingContextPath) {
					var oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
					var oMetaModelContextObject = oMetaModelContext.getObject();
					var mODataEntityType = oMetaModelContext.getObject(oMetaModelContextObject.$Type);
					return _convertMetadataToDelegateFormat(
						mODataEntityType,
						oMetaModelContextObject.$Type,
						oMetaModel,
						oElement,
						sAggregationName
					);
				}
			}
		}
		return Promise.resolve({});
	}
	var Delegate = {
		/**
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.element - Element instance the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, empty object if no payload was assigned
		 * @returns {Promise<sap.ui.fl.delegate.PropertyInfo[]>} Metadata in a deep structure of nodes and properties
		 */
		getPropertyInfo: function(mPropertyBag) {
			return Promise.resolve().then(function() {
				return _getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
			});
		},
		/**
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
		 * @param {sap.ui.core.UIComponent} [mPropertyBag.appComponent] - Needed to calculate the correct ID in case you provide an selector
		 * @param {Element} [mPropertyBag.view] - XML node of the view, required for XML case to create nodes and to find elements
		 * @param {object} [mPropertyBag.fieldSelector] - Selector to calculate the ID for the control that is created
		 * @param {string} [mPropertyBag.fieldSelector.id] - Control ID targeted by the change
		 * @param {boolean} [mPropertyBag.fieldSelector.isLocalId] - <code>true</code> if the ID within the selector is a local ID or a global ID
		 * @param {string} mPropertyBag.bindingPath - Runtime binding path the control should be bound to
		 * @param {object} mPropertyBag.payload - Payload parameter attached to the delegate, undefined if no payload was assigned
		 * @param {string} mPropertyBag.controlType - Control type of the element the delegate is attached to
		 * @param {string} mPropertyBag.aggregationName - Name of the aggregation the delegate should provide additional elements
		 * @returns {Promise<sap.ui.fl.delegate.LayoutControlInfo>} Map containing the controls to add
		 */
		createLayout: function(mPropertyBag) {
			var oModifier = mPropertyBag.modifier,
				oMetaModel = mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel(),
				oForm = mPropertyBag.element,
				sPath = "/" + DelegateUtil.getCustomData(oForm, "entitySet", oModifier),
				oFormContext = oMetaModel.createBindingContext(sPath),
				oPropertyContext = oMetaModel.createBindingContext(sPath + "/" + mPropertyBag.bindingPath),
				sFormId = mPropertyBag.element.sId || mPropertyBag.element.id;

			var oParameters = {
				sPropertyName: mPropertyBag.bindingPath,
				sBindingPath: sPath,
				sValueHelpType: "FormVH",
				oControl: oForm,
				oMetaModel: oMetaModel,
				oModifier: oModifier
			};
			var sValueHelpRequestGroupId = DelegateUtil.getCustomData(oForm, "valueHelpRequestGroupId", oModifier) || undefined;

			var oValueHelp = Promise.all([
				DelegateUtil.isValueHelpRequired(oParameters),
				DelegateUtil.doesValueHelpExist(oParameters)
			]).then(function(aResults) {
				var bValueHelpRequired = aResults[0],
					bValueHelpExists = aResults[1];
				if (bValueHelpRequired && !bValueHelpExists) {
					return fnTemplateValueHelp("sap.fe.macros.flexibility.ValueHelpWrapper");
				}
				return Promise.resolve();
			});

			function fnTemplateValueHelp(sFragmentName) {
				var oThis = new JSONModel({
						id: sFormId,
						idPrefix: mPropertyBag.fieldSelector.id,
						valueHelpRequestGroupId: sValueHelpRequestGroupId || undefined
					}),
					oPreprocessorSettings = {
						bindingContexts: {
							"entitySet": oFormContext,
							"property": oPropertyContext,
							"this": oThis.createBindingContext("/")
						},
						models: {
							"this": oThis,
							"entitySet": oMetaModel,
							"property": oMetaModel
						}
					};

				return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings);
			}

			function fnTemplateFragment(sFragmentName, oView) {
				var oThis = new JSONModel({
						// properties and events of Field macro
						_flexId: mPropertyBag.fieldSelector.id,
						onChange: Common.removeEscapeCharacters(DelegateUtil.getCustomData(oForm, "onChange", oModifier)),
						createMode: Common.removeEscapeCharacters(DelegateUtil.getCustomData(oForm, "createMode", oModifier)),
						editMode: Common.removeEscapeCharacters(DelegateUtil.getCustomData(oForm, "editMode", oModifier))
					}),
					oPreprocessorSettings = {
						bindingContexts: {
							"entitySet": oFormContext,
							"dataField": oPropertyContext,
							"this": oThis.createBindingContext("/")
						},
						models: {
							"this": oThis,
							"entitySet": oMetaModel,
							"dataField": oMetaModel
						}
					};
				return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oView);
			}

			return oValueHelp.then(function(oValueHelp) {
				return fnTemplateFragment("sap.fe.macros.form.FormElement", mPropertyBag.view).then(function(oField) {
					return {
						control: oField,
						valueHelp: oValueHelp
					};
				});
			});
		}
	};
	return Delegate;
});
