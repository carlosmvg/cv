/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(
	[
		"sap/ui/core/XMLTemplateProcessor",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/Fragment",
		"sap/fe/macros/ResourceModel",
		"sap/fe/macros/table/Utils",
		"sap/fe/core/helpers/SideEffectsUtil",
		"sap/base/Log",
		"sap/ui/mdc/enum/ConditionValidated"
	],
	function(XMLTemplateProcessor, XMLPreprocessor, Fragment, ResourceModel, TableUtils, SideEffectsUtil, Log, ConditionValidated) {
		"use strict";

		/**
		 * Get the appropriate context on which side effects can be requested.
		 * The correct one must have a binding parameter $$patchWithoutSideEffects.
		 *
		 * @function
		 * @name getContextForSideEffects
		 * @param {object} oSourceField field changed or focused out which may cause side effect
		 * @param {string} sSideEffectEntityType Target entity type of the side effect annotation
		 * @returns {object} oContext valid to request side effects
		 */
		function _getContextForSideEffects(oSourceField, sSideEffectEntityType) {
			var oBindingContext = oSourceField.getBindingContext(),
				oMetaModel = oBindingContext.getModel().getMetaModel(),
				sMetaPath = oMetaModel.getMetaPath(oBindingContext.getPath()),
				sEntityType = oMetaModel.getObject(sMetaPath)["$Type"],
				oContextForSideEffects = oBindingContext;

			/**
			 * If the field's context belongs to a list binding OR belongs to a 1:1,
			 * 		If target entity of the side effect annotation is different
			 * 			Use context of list binding or 1:1
			 * 		If target entity of the side effect annotation is same
			 * 			Use field's context
			 */
			if (sSideEffectEntityType !== sEntityType) {
				oContextForSideEffects = oBindingContext.getBinding().getContext();
				if (oContextForSideEffects) {
					sMetaPath = oMetaModel.getMetaPath(oContextForSideEffects.getPath());
					sEntityType = oMetaModel.getObject(sMetaPath)["$Type"];
					// 1:1 inside a 1:1
					// to support this, we can recurse up until sSideEffectEntityType matches sEntityType

					/*
					In case of fields added as columns from personalisation, the side effect binding context
					is not getting formed correctly. Hence this check was added to get the correct binding context.
					This is a workaround fix only. The root cause of this binding issue needs to be analyzed
					and resolved, afterwards this check can be removed.
					*/
					if (sSideEffectEntityType !== sEntityType) {
						oContextForSideEffects = oContextForSideEffects.getBinding().getContext();
						if (oContextForSideEffects) {
							sMetaPath = oMetaModel.getMetaPath(oContextForSideEffects.getPath());
							sEntityType = oMetaModel.getObject(sMetaPath)["$Type"];
							if (sSideEffectEntityType !== sEntityType) {
								return undefined;
							}
						}
					}
				}
			}

			return oContextForSideEffects || undefined;
		}

		function _getParentViewOfControl(oControl) {
			while (oControl && !(oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView")) {
				oControl = oControl.getParent();
			}
			return oControl;
		}

		/**
		 * Static class used by MDC Field during runtime
		 *
		 * @private
		 * @experimental This module is only for internal/experimental use!
		 */
		var FieldRuntime = {
			formatDraftOwnerTextInPopover: function(
				bHasDraftEntity,
				sDraftInProcessByUser,
				sDraftLastChangedByUser,
				sDraftInProcessByUserDesc,
				sDraftLastChangedByUserDesc
			) {
				if (bHasDraftEntity) {
					var sUserDescription =
						sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;

					if (!sUserDescription) {
						return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
					} else {
						return sDraftInProcessByUser
							? ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", sUserDescription)
							: ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", sUserDescription);
					}
				} else {
					return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
				}
			},

			/**
			 * Triggers an internal navigation on link pertaining to DataFieldWithNavigationPath.
			 *
			 * @param {object} oSource Source of the press event
			 * @param {object} oController Instance of the controller
			 * @param {string} sSemanticObjectName Semantic object name
			 */
			onDataFieldWithNavigationPath: function(oSource, oController, sSemanticObjectName) {
				var oBindingContext = oSource.getBindingContext();
				// ToDo: Assumes that the controller has the routing listener extension. Candidate for macroData?
				if (oController.routingListener) {
					oController.routingListener.navigateToTarget(oBindingContext, sSemanticObjectName);
				} else {
					Log.error(
						"FieldRuntime: No routing listener controller extension found. Internal navigation aborted.",
						"sap.fe.macros.field.FieldRuntime",
						"onDataFieldWithNavigationPath"
					);
				}
			},

			/**
			 * Method to initialize or enhance if already initialized, the queue of side effects requests
			 * in the format - { 'sContextPath' : { 'context': oContextForSideEffects, 'pathExpressions': [aPathExpressions] } }.
			 *
			 * @function
			 * @name _initSideEffectsQueue
			 * @param {string} sContextPath Binding path for the field that triggers the side effect
			 * @param {object} oContextForSideEffects Context used to request the side effect
			 * @private
			 */
			_initSideEffectsQueue: function(sContextPath, oContextForSideEffects) {
				this.sideEffectsRequestsQueue = this.sideEffectsRequestsQueue || {};
				this.sideEffectsRequestsQueue[sContextPath] = this.sideEffectsRequestsQueue[sContextPath] || {};
				this.sideEffectsRequestsQueue[sContextPath]["context"] =
					this.sideEffectsRequestsQueue[sContextPath]["context"] || oContextForSideEffects;
				this.sideEffectsRequestsQueue[sContextPath]["pathExpressions"] =
					this.sideEffectsRequestsQueue[sContextPath]["pathExpressions"] || [];
				// add the previously failed relevant side effects
				if (this.aFailedSideEffects && this.aFailedSideEffects[sContextPath]) {
					this.sideEffectsRequestsQueue[sContextPath]["pathExpressions"] = this.sideEffectsRequestsQueue[sContextPath][
						"pathExpressions"
					].concat(this.aFailedSideEffects[sContextPath]["pathExpressions"]);
					// remove from failed queue as this will now be retried
					delete this.aFailedSideEffects[sContextPath];
				}
			},

			/**
			 * Prepare for a specific side effect request.
			 * SideEffects to be requested on the same context are clubbed together in one request.
			 * @function
			 * @name prepareForSideEffects
			 * @param {string} sFieldGroupId The (virtual) field group for which side effect needs to be requested
			 * @param {object} oSourceField field changed or focused out which may cause side effect
			 * @returns {Promise} Promise that resolves when the side effects have been prepared
			 */
			prepareForSideEffects: function(sFieldGroupId, oSourceField) {
				var that = this,
					aPathExpressions = [], // target properties and target entities of the side effect
					bWithQualifier = sFieldGroupId.indexOf("#") > -1,
					sSideEffectEntityType = (bWithQualifier && sFieldGroupId.split("#")[0]) || sFieldGroupId,
					sQualifier = (bWithQualifier && sFieldGroupId.split("#")[1]) || "",
					sSideEffectAnnotationPath = "/" + sSideEffectEntityType + "@com.sap.vocabularies.Common.v1.SideEffects",
					// oContext = oBindingContext.getBinding().getContext(),
					oBindingContext = oSourceField.getBindingContext(),
					oMetaModel = oBindingContext.getModel().getMetaModel(),
					oContextForSideEffects,
					sContextPath,
					aPropertiesToRequest, // target properties
					aQueuedPropertiesToRequest, // target properties already in queue
					aEntitiesToRequest, // target entities
					aQueuedEntitiesToRequest, // target entities already in queue
					oSideEffect,
					// for filtering and mapping, we use the below two functions
					fnGetPropertyPath = function(oPathExpression) {
						return oPathExpression["$PropertyPath"];
					},
					fnGetNavigationPropertyPath = function(oPathExpression) {
						return oPathExpression["$NavigationPropertyPath"];
					};
				sSideEffectAnnotationPath = (bWithQualifier && sSideEffectAnnotationPath + "#" + sQualifier) || sSideEffectAnnotationPath;
				oSideEffect = SideEffectsUtil.convertSideEffect(oMetaModel.getObject(sSideEffectAnnotationPath));
				// Only request side effects when there has been an actual change in the value of field, confirmed by aPendingSideEffects
				if (oSideEffect && that.aPendingSideEffects.indexOf(sFieldGroupId) > -1) {
					// get the correct context to request this side effect
					oContextForSideEffects = _getContextForSideEffects(oSourceField, sSideEffectEntityType);
					if (!oContextForSideEffects) {
						// nothing to prepare
						return Promise.resolve();
					}
					sContextPath = oContextForSideEffects.getPath();
					aPathExpressions = aPathExpressions.concat(oSideEffect.TargetProperties).concat(oSideEffect.TargetEntities);
					// replace empty navigation property path with a property path *
					aPathExpressions = SideEffectsUtil.replaceEmptyNavigationPaths(aPathExpressions);
					// add additional text associations for the target properties
					aPathExpressions = SideEffectsUtil.addTextProperties(aPathExpressions, oMetaModel, sSideEffectEntityType);
					if (aPathExpressions.length) {
						// TODO: clarify trigger action Vs preparation action
						// if (oSideEffect.PreparationAction) {
						// 	// To keep the response to minimum, we add a $select
						// 	var sPropertyForSlimSelect = oMetaModel.getObject('/' + sEntityType + '/$Key')[0];
						// 	oContext.getModel().bindContext(oSideEffect.PreparationAction + '(...)', oContext, {'$select' : sPropertyForSlimSelect}).execute();
						// }

						// initialize queue of side effects waiting to be requested
						that._initSideEffectsQueue(sContextPath, oContextForSideEffects);

						// remove duplicates before adding to queue
						aQueuedPropertiesToRequest = that.sideEffectsRequestsQueue[sContextPath]["pathExpressions"]
							.filter(fnGetPropertyPath)
							.map(fnGetPropertyPath);
						aQueuedEntitiesToRequest = that.sideEffectsRequestsQueue[sContextPath]["pathExpressions"]
							.filter(fnGetNavigationPropertyPath)
							.map(fnGetNavigationPropertyPath);
						aPropertiesToRequest = aPathExpressions
							.map(fnGetPropertyPath)
							.filter(function(sPath) {
								return sPath && aQueuedPropertiesToRequest.indexOf(sPath) < 0;
							})
							.map(function(sPath) {
								return { "$PropertyPath": sPath };
							});
						aEntitiesToRequest = aPathExpressions
							.map(fnGetNavigationPropertyPath)
							.filter(function(sPath) {
								return (sPath || sPath === "") && aQueuedEntitiesToRequest.indexOf(sPath) < 0;
							})
							.map(function(sPath) {
								return { "$NavigationPropertyPath": sPath };
							});
						aPathExpressions = aPropertiesToRequest.concat(aEntitiesToRequest);
						// add to queue
						that.sideEffectsRequestsQueue[sContextPath]["pathExpressions"] = that.sideEffectsRequestsQueue[sContextPath][
							"pathExpressions"
						].concat(aPathExpressions);

						that.sideEffectsRequestsQueue[sContextPath]["triggerAction"] = oSideEffect.TriggerAction;

						// dequeue from pending side effects to ensure no duplicate requests
						that.aPendingSideEffects.splice(that.aPendingSideEffects.indexOf(sFieldGroupId), 1);
					}
				}
				return Promise.resolve();
			},

			/**
			 * Request all side effects queued in this.sideEffectsRequestsQueue.
			 * Reset the queue.
			 *
			 * @function
			 * @name requestSideEffects
			 * @returns {Promise|void}
			 */
			requestSideEffects: function() {
				if (!this.sideEffectsRequestsQueue) {
					return;
				}
				var that = this,
					oSideEffectsRequestQueue = this.sideEffectsRequestsQueue,
					oSideEffectQueuePromise = this.oSideEffectQueuePromise || Promise.resolve(),
					oTriggerAction;
				//reset the queue
				this.sideEffectsRequestsQueue = null;
				return oSideEffectQueuePromise.then(function() {
					var mSideEffectInProgress = Object.keys(oSideEffectsRequestQueue).map(function(sPath) {
						var oSideEffectRequest = oSideEffectsRequestQueue[sPath];
						// log info for the request being attempted
						SideEffectsUtil.logRequest(oSideEffectRequest);

						if (oSideEffectRequest.triggerAction) {
							oTriggerAction = oSideEffectRequest.context
								.getModel()
								.bindContext(oSideEffectRequest.triggerAction + "(...)", oSideEffectRequest.context);
							oTriggerAction.execute(oSideEffectRequest.context.getBinding().getUpdateGroupId());
						}

						return oSideEffectRequest["context"].requestSideEffects(oSideEffectRequest["pathExpressions"]).then(
							function() {
								// unlock fields affected by side effects
							},
							function() {
								// retry loading side effects or cancel
								Log.info(
									"FieldRuntime: Failed to request side effect - " + sPath,
									"sap.fe.macros.field.FieldRuntime",
									"requestSideEffects"
								);
								// add to failed side effects queue for next relevant retrial
								that.aFailedSideEffects[sPath] = oSideEffectRequest;
							}
						);
					});
					that.oSideEffectQueuePromise = Promise.all(mSideEffectInProgress);
				});
			},

			/**
			 * Request for additionalValue if required
			 * Since additionalValue is a one-way binding, we need to request it explicitly if the value is changed.
			 *
			 * @function
			 * @name requestTextIfRequired
			 * @param {object} oSourceField field changed
			 */
			requestTextIfRequired: function(oSourceField) {
				var oAdditionalValueBindingInfo = oSourceField.getBindingInfo("additionalValue");
				if (!oAdditionalValueBindingInfo) {
					return;
				}

				if (oSourceField.getBinding("value").getPath()) {
					var oMetaModel = oSourceField.getModel().getMetaModel(),
						sPath = oSourceField.getBindingContext().getPath() + "/" + oSourceField.getBinding("value").getPath(),
						sValueListType = oMetaModel.getValueListType(sPath);

					if (sValueListType === "Standard" || sValueListType === "Fixed") {
						// in case there's a value help the field retrieves the additional value from there
						return;
					}
				}

				var aPropertyPaths = oAdditionalValueBindingInfo.parts.map(function(oPart) {
						return SideEffectsUtil.determinePathOrNavigationPath(oPart.path);
					}),
					oContextForSideEffects = oSourceField.getBindingContext();
				if (aPropertyPaths.length) {
					oContextForSideEffects
						.requestSideEffects(aPropertyPaths)
						.then(function() {
							// unlock busy fields
						})
						.catch(function() {
							// retry request or cancel
							Log.info(
								"FieldRuntime: Failed to request Text association - " +
									(aPropertyPaths[0] && aPropertyPaths[0]["$PropertyPath"]),
								"sap.fe.macros.field.FieldRuntime",
								"requestTextIfRequired"
							);
						});
				}
			},

			/**
			 * Handler for change event.
			 * Store field group ids of this field for requesting side effects when required.
			 * We store them here to ensure a change in value of the field has taken place.
			 * @function
			 * @name handleChange
			 * @param {object} oEvent event object passed by the change event
			 */
			handleChange: function(oEvent) {
				var that = this,
					oSourceField = oEvent.getSource(),
					oView = _getParentViewOfControl(oSourceField),
					bIsTransient = oSourceField && oSourceField.getBindingContext().isTransient(),
					pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
					pSideEffectsPrepared = pValueResolved,
					bAtLeastOneImmediate = false,
					oCreationRowModel = oView.getModel("creationRowModel");

				// Manage QuickFilter Counts on Table when a Field, used for filtering, is modified
				if (oSourceField.data("parentControl") === "Table") {
					var oParentControl = oSourceField;
					while (oParentControl != null && oParentControl.getMetadata().getName() != "sap.ui.mdc.Table") {
						oParentControl = oParentControl.getParent();
					}
					var oTable = oParentControl;
					if (oTable) {
						var aFilters = TableUtils.getQuickFilters(oTable);
						var mFilteredProperties = aFilters.map(function(oFilter) {
							return oFilter.sPath;
						});
						var sSourceProperty = oSourceField
							.data("sourcePath")
							.split(oTable.getRowBinding().getPath() + "/")
							.pop();
						if (sSourceProperty && mFilteredProperties.length > 0 && mFilteredProperties.indexOf(sSourceProperty) > -1) {
							TableUtils.handleQuickFilterCounts(oTable, oTable.getBindingContext());
						}
					}
				}

				if (oSourceField.data("parentControl") === "CreationRow") {
					var sNavigationPath = oSourceField.data("creationRowContextPath"),
						mFieldValidity = oCreationRowModel.getProperty("/fieldValidity/" + sNavigationPath),
						mNewFieldValidity = Object.assign({}, mFieldValidity),
						bIsValid = oEvent.getParameter("valid"),
						sFieldId,
						oFieldValue;
					pValueResolved
						.then(function() {
							if (oSourceField.getMaxConditions() === 1 && bIsValid === undefined) {
								bIsValid = oSourceField.getConditions()[0].validated === ConditionValidated.Validated;
							}
						})
						.catch(function(oError) {
							Log.error("Error while resolving field value", oError);
						})
						.finally(function() {
							sFieldId = oSourceField.getId();
							oFieldValue = oSourceField.getValue();
							mNewFieldValidity[sFieldId] = {
								fieldValue: oFieldValue,
								validity: !!bIsValid
							};
							oCreationRowModel.setProperty("/fieldValidity/" + sNavigationPath, mNewFieldValidity);
						})
						.catch(function(oError) {
							Log.error("Error while resolving field value", oError);
						});
				}

				// if the context is transient, it means the request would fail anyway as the record does not exist in reality
				// TODO: should the request be made in future if the context is transient?
				if (bIsTransient) {
					return;
				}
				// queue of side effects for current change
				this.aPendingSideEffects = this.aPendingSideEffects || [];
				// queue of resolved current set of changes (group of fields)
				this.mFieldGroupResolves = this.mFieldGroupResolves || {};
				// queue of failed side effects request (due to failing PATCH), that need to be retried on next relevant change
				this.aFailedSideEffects = this.aFailedSideEffects || {};

				// if there is a text association in the additional value of the field, it should be requested
				// after the value has been resovled
				// TODO: confirm if this is still needed as the mdc field would request for text anyway
				// pValueResolved.then(function() {
				// 	that.requestTextIfRequired(oSourceField);
				// });

				if (oSourceField.getFieldGroupIds()) {
					oSourceField.getFieldGroupIds().forEach(function(sFieldGroupId) {
						var bImmediate = sFieldGroupId.indexOf("$$ImmediateRequest") > -1;
						// on change, only the side effects which are required immediately, are requested
						// store the promise for resolution of value so it can be used if the side effect is not required immediately
						if (bImmediate) {
							bAtLeastOneImmediate = true;
							sFieldGroupId = sFieldGroupId.substr(0, sFieldGroupId.indexOf("$$ImmediateRequest"));
						} else if (that.mFieldGroupResolves.hasOwnProperty(sFieldGroupId)) {
							that.mFieldGroupResolves[sFieldGroupId].push(pValueResolved);
						} else {
							that.mFieldGroupResolves[sFieldGroupId] = [pValueResolved];
						}
						// queue to pending side effects, it is not necessary that the side effect is requested immediately
						if (that.aPendingSideEffects.indexOf(sFieldGroupId) === -1) {
							that.aPendingSideEffects.push(sFieldGroupId);
						}

						// if not required immediately, request will be handled later when user focuses out of the virtual field group of source properties for this side effect
						if (bImmediate) {
							pSideEffectsPrepared = pSideEffectsPrepared.then(function() {
								// The side effect must be requested on the appropriate context
								return that.prepareForSideEffects(sFieldGroupId, oSourceField);
							});
						}
					});
					// if there is at least one side effect required immediately, request side effects
					if (bAtLeastOneImmediate) {
						pSideEffectsPrepared.then(this.requestSideEffects.bind(this)).catch(function(oError) {
							Log.error("Error while processing side effects", oError);
						});
					}
				}
			},

			/**
			 * Handler for validateFieldGroup event.
			 * Used to request side effects that are now required.
			 * Only side effects annotated on the root entity type will be requested.
			 * @function
			 * @name handleSideEffect
			 * @param {object} oEvent event object passed by the validateFieldGroup event
			 */
			handleSideEffect: function(oEvent) {
				// If there are no pending side effects in records, there is nothing to do here
				if (!this.aPendingSideEffects || this.aPendingSideEffects.length === 0) {
					return;
				}
				var that = this,
					aFieldGroupIds = oEvent.getParameter("fieldGroupIds"),
					oSourceField = oEvent.getSource(),
					// promise to ensure side effects have been prepared before requesting
					pSideEffectsPrepared = Promise.resolve();

				aFieldGroupIds = aFieldGroupIds || [];

				aFieldGroupIds.forEach(function(sFieldGroupId) {
					var aFieldGroupResolves = [Promise.resolve()];
					if (that.mFieldGroupResolves && that.mFieldGroupResolves[sFieldGroupId]) {
						// Promise to ensure ALL involved fields' values have been resolved
						aFieldGroupResolves = that.mFieldGroupResolves[sFieldGroupId];
						// delete the stored promises for value resolution
						delete (that.mFieldGroupResolves && that.mFieldGroupResolves[sFieldGroupId]);
					}
					// TODO: Promise should be to ensure all value resolve promises are completed and at least one was resolved
					pSideEffectsPrepared = pSideEffectsPrepared.then(function() {
						// The side effect must be requested on the appropriate context
						return Promise.all(aFieldGroupResolves).then(that.prepareForSideEffects.bind(that, sFieldGroupId, oSourceField));
					});
				});
				pSideEffectsPrepared.then(this.requestSideEffects.bind(this)).catch(function(oError) {
					Log.error("Error while requesting side effects", oError);
				});
			},

			/**
			 * Handler for patch events of list bindings (if field is in table) or context bindings (in form).
			 * This is only a fallback to request side effects (when PATCH failed previously) when some PATCH gets a success.
			 * Model would retry previously failed PATCHes and field needs to take care of requesting corresponding side effects.
			 * @function
			 * @name handlePatchEvents
			 * @param {object} oBinding - OP controller may send a binding or a binding context, this is uncertain
			 */
			handlePatchEvents: function(oBinding) {
				if (!oBinding) {
					return;
				}
				var that = this;
				// oBinding could be binding or binding context, this correction should be in OP controller
				oBinding = (oBinding.getBinding && oBinding.getBinding()) || oBinding;
				oBinding.attachEvent("patchCompleted", function(oEvent) {
					if (oEvent.getParameter("success") !== false && that.aFailedSideEffects) {
						Object.keys(that.aFailedSideEffects).forEach(function(sContextPath) {
							// initialize if not already
							that._initSideEffectsQueue(sContextPath, that.aFailedSideEffects[sContextPath]["context"]);
						});
						// request the failed side effects now as there was a successful PATCH
						that.requestSideEffects();
					}
				});
			},
			formatWithBrackets: function(sText1, sText2) {
				if (sText2) {
					return sText1 ? sText1 + " (" + sText2 + ")" : sText2;
				} else {
					return sText1 ? sText1 : "";
				}
			},
			pressLink: function(oEvent) {
				var oLink = oEvent.getSource();
				if (oLink.getDependents() && oLink.getDependents().length > 0) {
					var oFieldInfo = oLink.getDependents()[0];
					if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
						oFieldInfo
							.getTriggerHref()
							.then(function(sHref) {
								if (!sHref) {
									oFieldInfo.open(oLink);
								} else {
									oLink.setHref(sHref);
								}
							})
							.catch(function(oError) {
								Log.error("Error triggering link Href", oError);
							});
					}
				}
			}
		};

		return FieldRuntime;
	},
	/* bExport= */ true
);
