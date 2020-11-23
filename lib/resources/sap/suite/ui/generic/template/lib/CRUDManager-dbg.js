sap.ui.define(["sap/ui/base/Object",
	"sap/ui/generic/app/util/ModelUtil",
	"sap/ui/generic/app/util/ActionUtil",
	"sap/suite/ui/generic/template/lib/MessageUtils",
	"sap/suite/ui/generic/template/lib/CRUDHelper",
	"sap/suite/ui/generic/template/lib/CacheHelper",
	"sap/suite/ui/generic/template/lib/testableHelper",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject",
	"sap/suite/ui/generic/template/lib/FeError",
	"sap/ui/model/Context"
			  ], function(BaseObject, ModelUtil, ActionUtil, MessageUtils, CRUDHelper, CacheHelper, testableHelper, extend, isEmptyObject, FeError, Context) {
		"use strict";
        var	sClassName = "lib.CRUDManager";

		var oRejectedPromise = Promise.reject();
		oRejectedPromise.catch(Function.prototype);

		function getMethods(oController, oComponentUtils, oServices, oCommonUtils, oBusyHelper) {

			function handleError(sOperation, reject, oError, mParameters) {
				MessageUtils.handleError(sOperation, oController, oServices, oError, mParameters);
				return (reject || Function.prototype)(oError);
			}

			var fnEditEntityImpl; // declare function already here, to avoid usage before declaration
			// This method is called to check about drafts of other users for the entity to be edited.
			// It returns a promise that is settled when this question has been clarified.
			// Actually there are two scenarios in which this method can be called:
			// - If oError is faulty the method is called at the beginning of the editing process. In this case this method
			//   must find out whether
			//   a) Another user possesses a locking draft for the entity -> promise is rejected
			//   b) Another user possesses a non-locking draft for the entity -> promise is resolved as described for function editEntity (see below)
			//   c) No draft exists for this object -> promise is resolved to an empty object
			// - If oError is truthy the back-end has already been called in order to create an edit draft. Thereby the preserveChange-mode was used (see below).
			//   This backend call returned the information that another user possesses a (locking or non-locking) draft for the entity.
			//   oError is the object that was returned from the backend. In this case this method must find out whether
			//   a) The corresponding draft is locking -> promise is rejected
			//   b) The corresponding draft is non-locking -> promise is resolved as described for function editEntity (see below)
			//   c) The draft has meanwhile disappeared (edge case) -> in this case the promise should also resolve as described for function editEntity. Therefore, the function is called once more.
			// In both scenarios in case a) this method is also responsible for error handling. Note that there is a subtle difference between these scenarios in this case.
			// In the second scenario the error message that should be presented to the user can be taken from oError (and thus comes from the backend)
			// In the first scenario the error message is created locally.
			function checkForForeignUserLock(oError) {
				return new Promise(function(resolve, reject) {
					var oComponent = oController.getOwnerComponent();
					// check whether Draft exists
					var oBindingContext = oComponent.getBindingContext();
					var oModel = oComponent.getModel();
					oModel.read(oBindingContext.getPath(), {
						urlParameters: {
							"$expand": "DraftAdministrativeData"
						},
						success: function(oResponseData) {
							if (!oResponseData.DraftAdministrativeData) { // no draft exists for the object at all
								if (oError) { // It seems that the draft that was responsible for producing oError has meanwhile vanished -> Restart the process (edge case)
									//return fnEditEntityImpl(false).then(resolve);
									return handleError(MessageUtils.operations.editEntity, reject, oError);
								}
								return resolve({});
							}
							if (oResponseData.DraftAdministrativeData.InProcessByUser) { // locked by other user
								var sUserDescription = oResponseData.DraftAdministrativeData.InProcessByUserDescription || oResponseData.DraftAdministrativeData
									.InProcessByUser;
								oError = oError || new FeError(oCommonUtils.getText("ST_GENERIC_DRAFT_LOCKED_BY_USER", [" ", sUserDescription]));
								return handleError(MessageUtils.operations.editEntity, reject, oError, oError);
							}
							return resolve({
								draftAdministrativeData: oResponseData.DraftAdministrativeData
							}); // draft for other user exists but is no lock anymore
						},
						error: handleError.bind(null, MessageUtils.operations.editEntity, reject)
					});
				});
			}

			// This method is called in order to call method editEntity on the TransactionController. It returns a promise as described
			// in the description of method editEntity (see below).
			// Parameter oPrereadData is an object that possily contains administrative data which have already been retrieved.
			// More precisely this object is either empty or contains a property draftAdministrativeData.
			// In this second case the promise returned by this method should just resolve to oPrereadData.
			function fnCallEdit(bIsDraftEnabled, bUnconditional, oPrereadData) {
				if (oPrereadData.draftAdministrativeData) {
					return Promise.resolve(oPrereadData);
				}
				return new Promise(
					function(resolve, reject) {
						oServices.oTransactionController.editEntity(oController.getView().getBindingContext(), !bUnconditional)
							.then(
								function(oResponse) { //success

									// The active context is invalidated as the DraftAdministrativeData of the context(the active context) has changed after draft creation.
									// This is done to keep the DraftAdministrativeData of the record updated.
									// Direct invalidation of the active context may
									//     a) lead to strange behaviour on the UI.
									//     b) lead to immediate reload of the data.
									// With modelContextChange we wait till the object page is not bound to the active context.
									if (bIsDraftEnabled) {
										var oView = oController.getView();
										var oActiveContext = oView.getBindingContext();
										var fnInvalidateActiveContext = function() {
											oActiveContext.getModel().invalidateEntry(oActiveContext);
											oView.detachEvent("modelContextChange", fnInvalidateActiveContext);
										};
										oView.attachEvent("modelContextChange", fnInvalidateActiveContext);
									}

									return resolve({
										context: oResponse.context
									});
								},
								function(oResponse) { // error handler
									if (oResponse && oResponse.response && oResponse.response.statusCode === "409" && bIsDraftEnabled && !bUnconditional) { //there might be unsaved changes
										//remove transient message associated with rc 409 in order to prevent message pop-up
										MessageUtils.removeTransientMessages();
										// var oMesssageManager = sap.ui.getCore().getMessageManager();
										// var aMessages =  oMesssageManager.getMessageModel().getData();
										// var aMessagesToBeRemoved = [];
										// for (var i = 0; i < aMessages.length; i++) {
										// 	 if (aMessages[i].getCode() === "SDRAFT_COMMON/000") {
										// 		 aMessagesToBeRemoved.push(aMessages[i]);
										// 	 }
										// }
										// if (aMessagesToBeRemoved.length > 0) {
										// 	oMesssageManager.removeMessages(aMessagesToBeRemoved);
										// }
										return checkForForeignUserLock(oResponse).then(resolve, reject);
									} else {
										handleError(MessageUtils.operations.editEntity, reject, oResponse, oResponse);
									}
								}
							);
					}
				);
			}

			// This method implements main functionality of  editEntity (see below). Only busy handling is not done in this function.
			fnEditEntityImpl = function(bUnconditional) {
				var bIsDraftEnabled = oComponentUtils.isDraftEnabled();
				var oRet;
				var oComponent = oController.getOwnerComponent();
				var oBindingContext = oComponent.getBindingContext();
				if (bIsDraftEnabled && !bUnconditional) {
					// In this case we must ensure that a non-locking draft of another user is not overwritten without notice.
					// There are two strategies for that:
					// - First read the draft administrative data in order to check for this information
					// - Call backend to create draft in a mode where every draft of another user is consideres as a lock
					// The second possibility is preferred. However it is only suitable when the OData Service supports this mode (called preserveChange-mode)
					var oDraftContext = oServices.oDraftController.getDraftContext();
					var bPreserveChanges = oDraftContext.hasPreserveChanges(oBindingContext);
					if (!bPreserveChanges) { // Must use strategy 1 -> first check for Foreign user locks then start editing
						oRet = checkForForeignUserLock().then(fnCallEdit.bind(null, true, true));
					}
				}
				// In non-draft case and in draft cases with strategy 2 call edit functionality directly
				oRet = oRet || fnCallEdit(bIsDraftEnabled, bUnconditional, {});
				if (bIsDraftEnabled) {
					oServices.oApplication.editingStarted(oBindingContext, oRet);
				}
				return oRet;
			};

			// This method is called when a user starts to edit the active entity.
			// This method deals with busy handling and sensing error messages, but not with other dialogs.
			// Parameter bUnconditional specifies whether the user has already confirmed that he is willing to overwrite other users non-locking drafts.
			// The method returns a promise.
			// The promise is rejected when the user must not edit the object (which may be caused by tecnical or semantical problems).
			// In this case error handling has been performed by this method.
			// The promise is resolved to an object with property 'draftAdministrativeData' when there exists a non-locking draft of another user (this can only be the case when bUnconditional is false)
			// In this case this property contains the draft administrative data of the non-locking draft.
			// The promise is resolved to an object with property 'context' when the editing can start.
			// In this case this property contains the context of the entity to be edited.
			function editEntity(bUnconditional) {
				if (oBusyHelper.isBusy()) {
					return oRejectedPromise;
				}
				var oRet = fnEditEntityImpl(bUnconditional);
				oBusyHelper.setBusy(oRet);
				return oRet;
			}
			
			function getDeleteEntityPromise(bIsActiveEntity, bHasActiveEntity, oContext) {
				var oRet = new Promise(
					function(resolve, reject) {
						var fnHandleSuccess = function() {
							var sEntitySet = ModelUtil.getEntitySetFromContext(oContext);
							var oDraftContext = oServices.oDraftController.getDraftContext();
							var bRoot = oDraftContext.isDraftRoot(sEntitySet);
							var iViewLevel = oComponentUtils.getViewLevel();
							var sMessageText = iViewLevel >= 2 ? oCommonUtils.getText("ITEM_DELETED") : oCommonUtils.getText("ST_GENERIC_OBJECT_DELETED");

							// replace the message only for the root.
							if (!bIsActiveEntity && bRoot) {
								sMessageText = oCommonUtils.getText(bHasActiveEntity ? "ST_GENERIC_DRAFT_WITH_ACTIVE_DOCUMENT_DELETED" : "ST_GENERIC_DRAFT_WITHOUT_ACTIVE_DOCUMENT_DELETED");
							}
							MessageUtils.showSuccessMessageIfRequired(sMessageText, oServices);
						};
						var fnHandleResponse = function (aFailedPathes){
							// If there is no failed path means it is success case
							if (aFailedPathes.length === 0) {
								fnHandleSuccess();
								resolve();
							} else {
								MessageUtils.handleError(MessageUtils.operations.deleteEntity, oController, oServices, aFailedPathes[0].oError, null);
								reject();
							}
						};
						var oDeletePromise = deleteEntities({
							pathes: [oContext.getPath()], 
							withWarningDialog: true
						});
						oDeletePromise.then(fnHandleResponse, reject);
					}
				);
				return oRet;
			}
			
			/*
			 * Deletes current OData entity. The entity can either be a
			 * non-draft document or a draft document. *
			 * Note: This method does not care for busy handling. So this has to be done by the caller.
			 * @returns {Promise} A <code>Promise</code> for asynchronous
			 *          execution
			 * @public
			 */
			function deleteEntity(){
				var oRet = new Promise(function(fnResolve, fnReject){
					var oContext = oController.getView().getBindingContext();
					var bIsActiveEntity = oServices.oDraftController.isActiveEntity(oContext);
					var bHasActiveEntity = oServices.oDraftController.hasActiveEntity(oContext);

					var oSiblingPromise = bHasActiveEntity && !bIsActiveEntity ? oServices.oApplication.getDraftSiblingPromise(oContext) : Promise.resolve();
					oSiblingPromise.then(function(oActive){
						var oDeletePromise = getDeleteEntityPromise(bIsActiveEntity, bHasActiveEntity, oContext);
						oDeletePromise.then(fnResolve, fnReject);
						if (!bIsActiveEntity) { // cancellation of a draft
							var fnTransformActiveContext = function(){
								return  { context: oActive };
							};
							var oCancellationPromise = oDeletePromise.then(fnTransformActiveContext);
							oServices.oApplication.cancellationStarted(oContext, oCancellationPromise);
						}
					}, fnReject);
				});
				return oRet;
			}
			
			function fnParseDeleteResponse(aPath, aDeleteResults, bWithWarningDialog) {
				var mResult = {
					mFailed: Object.create(null),
					mSuccess: Object.create(null),
					mWarning: Object.create(null),
					aMessagesForUserDecision: []
				};
				// Filtering of Results in groups
				for (var i = 0; i < aPath.length; i++){
					var sPath = aPath[i];
					var oResult = aDeleteResults[i];
					var oParsedResult = MessageUtils.parseError(oResult);
					var iStatusCode = parseInt(oParsedResult.httpStatusCode, 10);
					if ((iStatusCode >= 200 && iStatusCode < 300) || iStatusCode === 304){
						mResult.mSuccess[sPath] = oResult;
					} else if (iStatusCode === 412) { // collect 412s separately. Deletion has failed but corresponding message is a warning (must be fulfilled by backend).
						mResult.mWarning[sPath] = oResult;
					} else {
						mResult.mFailed[sPath] = oResult;
					}
				}
				if (!isEmptyObject(mResult.mWarning) && bWithWarningDialog){
					mResult.aMessagesForUserDecision = MessageUtils.getTransientMessages();
					MessageUtils.removeTransientMessages();
				}
				return mResult;
			}

			/**
			 * Deletes current OData entity. The entity can either be a non-draft document or a draft document. *
			 *
			 * @param {Object} oSettings: has following information
			 * oSettings.smartTable: smart table the entries are coming from
			 * oSettings.pathes: paths (strings) which identify the entities
			 * oSettings.bOnlyOneDraftPlusActive: this flag tells that when 2 items is request for deleteion one of 
			 * them is draft and other is active of that draft, so that we can handle 412 warning case . Currently only this
			 * scenario is supported in delete. This flag will be replace or removed when we start handling multiselect delete 
			 * with 412 scenario.
			 * @returns {Promise} A <code>Promise</code> for asynchronous execution
			 * If the Promise is rejected all necessary dialogs have been performed by this function. If the Promise is resolved
			 * it is the task of the caller to give feedback to the user.
			 * Therefore, the Promise resolves to an array which contains an entry for every failed delete request. The corresponding entry is
			 * an object with the following attributes: sPath (corresponding entry from oSettings.pathes), oError (the error response), isWarning (indicates whether delete was refused with a 412 warning)
			 * @public
			 */
			function deleteEntities(oSettings) {
				var oRet = new Promise(function(outerResolver, outerReject) {
					var mObjectsToDelete = Object.create(null);
					var mResolveInfo = Object.create(null);
					var fnPromiseFunction = function(sPath, resolveSingle, rejectSingle){
						mResolveInfo[sPath] = {
							resolve: resolveSingle,
							reject: rejectSingle
						};
					};
					for (var k = 0; k < oSettings.pathes.length; k++){
						var sPath = oSettings.pathes[k];
						mObjectsToDelete[sPath] = new Promise(fnPromiseFunction.bind(null, sPath));
					}
					oServices.oApplication.prepareDeletion(mObjectsToDelete, oSettings.suppressRefreshAllComponents);
					// Three maps of pathes to repsonses:
					var mSuccess = Object.create(null); // Collects all successfull deletions
					var mFailed = Object.create(null);  // Collects all objects that cannot be deleted at all
					var mWarning; // Contains the objectas which have been rejected with a 412 in the last attempt
					var fnDone = function(bShouldReject){ // will be called when the final result of the deletion process is known
						if (!isEmptyObject(mSuccess)){
							oServices.oApplication.markCurrentDraftAsModified();
						}
						for (var sPath in mResolveInfo){
							var oResolveInfo = mResolveInfo[sPath];
							oResolveInfo[mSuccess[sPath] ? "resolve" : "reject"]();
						}
						if (bShouldReject){
							return outerReject();
						}
						// outerResolver should be called. Build the array representing the failed requests as specified above.
						var aFailedPathes = oSettings.pathes.map(function(sPath){
							return {
								sPath: sPath, 
								oError: mFailed[sPath] || mWarning[sPath], 
								isWarning: !!mWarning[sPath]
								
							};
						}).filter(function(oErrorInfo){
							return !!oErrorInfo.oError;
						});
						outerResolver(aFailedPathes);
					};
					var fnShowConfirmationOrResolve = function(aMessagesForUserDecision){
						if (aMessagesForUserDecision.length > 0){
							var oCRUDActionHandler = oComponentUtils.getCRUDActionHandler();
							oCRUDActionHandler.handleCRUDScenario(4, fnInvokeDeletion.bind(null, Object.keys(mWarning), false, false), fnDone.bind(null, true), "Delete", aMessagesForUserDecision);
							return;
						}
						fnDone();
					};
					var fnInvokeDeletion = function(aPath, bStrict, bWithWarningDialog){ // Note that this method might be called twice: First with all objects to be deleted. Second with confirmed 412s.
						if (oSettings.suppressRefreshAllComponents && oSettings.smartTable){
							// Referesh the table with same changeset name to merge the get call with above delete action
							oCommonUtils.refreshSmartTable(oSettings.smartTable, "Changes");						
						}						
						var fnHandleResponse = function(aDeleteResults){
							var oParsedDeleteResult = fnParseDeleteResponse(aPath, aDeleteResults, bWithWarningDialog, oSettings.onlyOneDraftPlusActive);
							mFailed = extend(mFailed, oParsedDeleteResult.mFailed);
							mSuccess = extend(mSuccess, oParsedDeleteResult.mSuccess);
							mWarning = oParsedDeleteResult.mWarning;
							fnShowConfirmationOrResolve(oParsedDeleteResult.aMessagesForUserDecision);
						};
						var oDeletePromise = oServices.oTransactionController.deleteEntities(aPath, {
							bIsStrict: bStrict
						}).then(fnHandleResponse, fnHandleResponse);
						oBusyHelper.setBusy(oDeletePromise);
					};
					// We only support warning dialog in following cases:
					// 1. One items is selected from LR table( either active or draft)
					// 2. One item is selectd which is draft and its active also exist, tested by condition: oSettings.onlyOneDraftPlusActive
					// Also caller should tell specifically by flag oSettings.withWarningDialog, that they want this delete to be performed with possibility to warn
					var bWithWarningDialog = oSettings.withWarningDialog && (oSettings.pathes.length === 1 || oSettings.onlyOneDraftPlusActive);
					fnInvokeDeletion(oSettings.pathes, true, bWithWarningDialog);
				});
				return oRet;
			}
			
			function discardDraft(oContext){
				var bHasActiveEntity = oServices.oDraftController.hasActiveEntity(oContext);
				var oSiblingPromise = bHasActiveEntity ? oServices.oApplication.getDraftSiblingPromise(oContext) : Promise.resolve();
				return oSiblingPromise.then(function(oActive){	
					var fnTransformActiveContext = function(){
						return  { context: oActive };
					};
					var oDeletePromise = oServices.oTransactionController.deleteEntity(oContext);
					var oCancellationPromise = oDeletePromise.then(fnTransformActiveContext);
					oServices.oApplication.cancellationStarted(oContext, oCancellationPromise);
					return oDeletePromise;
				});
			}
			
			function saveEntityImpl(resolve, reject, oCreateWithDialogFilters) {
				if (oBusyHelper.isBusy()) {
					reject();
					return;
				}
				// Prepare message handling by storing information which messages have been available before saving
				var oMessageManager, fnGetAndProcessMessages, aMessagesBeforeSave, mMessagesBeforeSave;
				var oContextFilter =  oCreateWithDialogFilters ? oCreateWithDialogFilters : oServices.oTemplateCapabilities.oMessageButtonHelper && oServices.oTemplateCapabilities.oMessageButtonHelper.getContextFilter();
				if (oContextFilter){
					oMessageManager = sap.ui.getCore().getMessageManager();
					fnGetAndProcessMessages = function(fnProcessMessage){ // This function returns all messages according to oContextFiler and allows an additional processing of the messages via fnProcessMessage
						var oMessageModel = oMessageManager.getMessageModel();
						var oMessageBinding = oMessageModel.bindList("/", null, null, [oContextFilter]); // Note: It is necessary to create this binding each time, since UI5 does not update it (because there is no change handler)
						var aContexts = oMessageBinding.getContexts();
						return aContexts.map(function(oContext){
							var oMessage = oContext.getObject();
							fnProcessMessage(oMessage);
							return oMessage;
						});
					};
					mMessagesBeforeSave = Object.create(null);
					aMessagesBeforeSave = fnGetAndProcessMessages(function(oMessage){
						mMessagesBeforeSave[oMessage.getId()] = oMessage;
					});
				}
				oServices.oTransactionController.triggerSubmitChanges().then(function(oResponse) {
					if (oMessageManager){ // clean the message model
						oMessageManager.removeMessages(aMessagesBeforeSave);
					}
					resolve(oResponse.context);
				}, function(){
					if (oMessageManager){
						var aNewMessages = [];
						var aAllMessages = fnGetAndProcessMessages(function(oMessage){
							if (!mMessagesBeforeSave[oMessage.getId()]){ // if this is a new message
								oMessage.persistent = false;
								oMessage.technical = false;
								aNewMessages.push(oMessage);
							}
						});
						// Now aAllMessages contains all messages (according to the oContextFilter) and aNewMessages only those which have been added by the current attempt to save.
						// If no new message is there (but we are in an error scenario anyway) we assume that a technical error occured that prevented the backend to test the current state.
						// Therefore, we just keep the state of the message model as it is.
						// If there is at least one new message we assume that the backend has checked the object (and found business errors). Thus, the old messages can be removed and only the new messages
						// have to stay. However, we delete all messages and then add the new ones. This ensures, that the message model gets a change event even if no message has been there before.
						// This will trigger the follow-up activities.
						if (aNewMessages.length){
							oMessageManager.removeMessages(aAllMessages);
							oMessageManager.addMessages(aNewMessages);
							if (!oCreateWithDialogFilters) {
								oServices.oTemplateCapabilities.oMessageButtonHelper.showMessagePopover();
							}
						}
					}
					reject();
				});



		//		handleError.bind(null, MessageUtils.operations.saveEntity, reject));
			}

			/*
			 * Saves current OData entity. Only used in non-draft scenario.
			 *
			 * @param {object} oCreateWithDialogFilters filters to handle error scenario if create with dialog enabled on LR
			 * @returns {Promise} A <code>Promise</code> for asynchronous execution
			 * @public
			 */
			function saveEntity(oCreateWithDialogFilters) {
				var oFilterForCreateWithDialog = oCreateWithDialogFilters;
				var oRet = new Promise(function(fnResolve, fnReject) {
					oServices.oApplication.performAfterSideEffectExecution(saveEntityImpl.bind(null, fnResolve, fnReject, oFilterForCreateWithDialog));
				});
				oBusyHelper.setBusy(oRet);
				return oRet;
			}

			/*
			 * Activates a draft OData entity. Only the root entity can be activated.
			 *
			 * @returns {Promise} A <code>Promise</code> for asynchronous execution
			 * @public
			 */
			function activateDraftEntity(oCreateDialogContext) {
				if (oBusyHelper.isBusy()) {
					return oRejectedPromise;
				}
				var oRet = new Promise(function(resolve, reject) {
					var oContext = oCreateDialogContext ? oCreateDialogContext : oController.getView().getBindingContext();
					var bWarningOccured = false;
					var fnHandleWarning = function() {
						bWarningOccured = true;
						var fnForceActivate = function() {
							var oActivationPromise = oServices.oDraftController.activateDraftEntity(oContext, true);
							oServices.oApplication.activationStarted(oContext, oActivationPromise);
							oActivationPromise.then(function(oResponse) {
								resolve(oResponse);
								},function(oError){
									MessageUtils.handleError(MessageUtils.operations.activateDraftEntity, oController, oServices, oError, null);
									reject();
								});
							oBusyHelper.setBusy(oActivationPromise);
						};
						var oCRUDActionHandler = oComponentUtils.getCRUDActionHandler();
						oCRUDActionHandler.handleCRUDScenario(4, fnForceActivate, reject, "Activate");
					};
					oServices.oApplication.getDraftSiblingPromise(oContext).then(function(oSiblingContext){
						if (oSiblingContext){
							oController.getOwnerComponent().getModel().invalidateEntry(oSiblingContext);
						}
						var oActivationPromise = oServices.oDraftController.activateDraftEntity(oContext, false);
						// Prepare promise object to fetch the header of the active entity

						if (oSiblingContext) {
							var sRootExpand =  oComponentUtils.getRootExpand();
							var mParameters = {};
							if (sRootExpand && sRootExpand.length) {
								mParameters.urlParameters = {
									"$expand": sRootExpand
								};
							}
							oServices.oDraftController.fetchHeader(oSiblingContext, mParameters);
						}
						oBusyHelper.setBusy(oActivationPromise);
						oServices.oApplication.activationStarted(oContext, oActivationPromise);
						oActivationPromise.then(function(oResponse) {
								resolve(oResponse);
						}, function(oError) {
							if (!oCreateDialogContext) {
								MessageUtils.handleError(MessageUtils.operations.activateDraftEntity, oController, oServices, oError, null, {
									"412": fnHandleWarning
								});
								if (!bWarningOccured){
									reject();
								}
							}
						});
					});
				});
				return oRet;
			}

			function getActionUtil(mParameters){
				return new ActionUtil(mParameters);
			}

			function callActionImpl(mParameters, oState, fnResolve, fnReject) {
				if (oBusyHelper.isBusy()) {
					fnReject();
					return;
				}

				var sFunctionImportPath = mParameters.functionImportPath;
				var aCurrentContexts = mParameters.contexts;
				var oSourceControl = mParameters.sourceControl;
				var sFunctionImportLabel = mParameters.label;
				var sOperationGrouping = mParameters.operationGrouping;
				var oSkipProperties = mParameters.skipProperties;

				var oActionProcessor = getActionUtil({
					controller: oController,
					contexts: aCurrentContexts,
					applicationController: oServices.oApplicationController,
					operationGrouping: sOperationGrouping
				});

				var fnObjectPageExistsForEntitySet = function(oPage, sEntitySet) {
					if (oPage.pages) {
						for (var i in oPage.pages) {
							var oSubPage = oPage.pages[i];
							if (oSubPage.component.list != true && oSubPage.entitySet === sEntitySet) {
								return true;
							} else {
								var bResult = fnObjectPageExistsForEntitySet(oSubPage, sEntitySet);
								if (bResult) {
									return true;
								}
							}
						}
					}
					return false;
				};

				var fnNavigationAllowed = function(oComponent, oResponseContext) {
					var oConfig = oComponent.getAppComponent().getConfig();
					if (oResponseContext && oResponseContext.sPath) {
						var sResponseEntitySet = oResponseContext.sPath.split("(")[0].replace("/", "");
						return fnObjectPageExistsForEntitySet(oConfig.pages[0], sResponseEntitySet);
					}
					return false;
				};

				var fnActionCallResolve = function(aResponses) {
					var oResponse, oResponseContext, oComponent, bNavigationAllowed;

					if (Array.isArray(aResponses) && aResponses.length === 1) {
						// only one context, handle as single action call
						oResponse = aResponses[0];
					} else {
						oResponse = {
							response: {
								context: aResponses.context
							}
						};
					}
					oResponseContext = oResponse.response && oResponse.response.context;
					var oContextInfo;
					if (oResponseContext && oResponseContext.getObject()) {
						oContextInfo = oComponentUtils.registerContext(oResponseContext);
					}

					oComponent = oController.getOwnerComponent();

					bNavigationAllowed = fnNavigationAllowed(oComponent, oResponseContext);

					if (bNavigationAllowed && oResponseContext && oResponseContext !== oResponse.actionContext && oResponseContext.getPath() !==
						"/undefined") {
						if (oSourceControl) {
							oCommonUtils.navigateFromListItem(oResponseContext, false);
						} else {
							oServices.oApplication.navigateToSubContext(oResponseContext, false, oContextInfo.bIsDraft ? 2 * (1 + oContextInfo.bIsCreate) : 1, oContextInfo);
						}
					}

					// -> part of method onSelectionChange in each controller
					if (aResponses.length > 0) {
						var oTableBindingInfo = oCommonUtils.getTableBindingInfo(oSourceControl);
						var oListBinding = oTableBindingInfo && oTableBindingInfo.binding;
						if (oListBinding && oListBinding.oEntityType) {
							// update the enablement of toolbar buttons
							oCommonUtils.setEnabledToolbarButtons(oSourceControl);

							// update the enablement of footer button if on the List Report
							if (oComponentUtils.isListReportTemplate()){
								oCommonUtils.setEnabledFooterButtons(oSourceControl);
							}
						}
					}

					fnResolve(aResponses);
				};

				var fnCleanUpContext =  function(){
					// remove pending request from the last change of the model
					// actually, this should rather be done by ActionUtil itself
					if (aCurrentContexts && aCurrentContexts[0]) {
						var oModel = aCurrentContexts[0].oModel;
						if (oModel && oModel.hasPendingChanges()) {
							oModel.resetChanges();
						}
					}
				};

				var fnActionPopUpReject = function(oError){
					// function is called, when the user cancels the action (on the popup to enter parameters - before sedning a rquest to the backend)
					fnCleanUpContext();
					fnReject(oError);
				};


				var fnActionCallReject = function(oError) {
					// function is called, when the execution of the action (i.e. the request to the backend) has failed
					if (Array.isArray(oError)) {
						if (oError.length === 1) {
							oError = oError[0].error;
						} else {
							oError = null;
						}
					}
					var mErrorParameters = {
						context: aCurrentContexts
					};
					fnCleanUpContext();
					handleError(MessageUtils.operations.callAction, null, oError, mErrorParameters);
					fnReject(oError);
				};

				oActionProcessor.call(sFunctionImportPath, sFunctionImportLabel, oComponentUtils.isDraftEnabled(), oSkipProperties).then(function(oResult){
					var oSessionParams = {};
					oSessionParams.actionLabel = sFunctionImportLabel;
					oBusyHelper.setBusy(oResult.executionPromise, null, oSessionParams);
					oResult.executionPromise.then(fnActionCallResolve,fnActionCallReject);
				}, fnActionPopUpReject);

			}

			/*
			 * Calls an OData action (also called OData function import). Afterwards the message handling
			 * is triggered for the returned messages.
			 *
			 * @param {object} mParameters Parameters which are used to identify and fire action
			 * @param {array} mParameters.contexts Contexts relevant for action
			 * @param {string} mParameters.functionImportPath Path to the OData function import
			 * @param {object} [mParameters.sourceControl] Control where a navigation starts (e.g. table)
			 * @param {object} [mParameters.navigationProperty] Property to navigate after action
			 * @param {string} [mParameters.label] Text for the confirmation popup
			 *
			 * @returns {Promise} A Promise that resolves if the action has been executed successfully
			 *
			 * @public
			 */
			function callAction(mParameters, oState) {
				var oRet = new Promise(function(fnResolve, fnReject){
					oServices.oApplication.performAfterSideEffectExecution(callActionImpl.bind(null, mParameters, oState, fnResolve, fnReject));
				});
				return oRet;
			}

			/*
			 * Calls OData NewAction function for Draft creation. The function import can be with or without parameters
			 *
			 * @param {object} mParameters Parameters which are used to identify and fire action
			 * @param {array} mParameters.contexts Contexts relevant for action
			 * @param {string} mParameters.functionImportPath Path to the OData function import
			 * @param {object} [mParameters.sourceControl] Control where a navigation starts (e.g. table)
			 * @param {object} [mParameters.navigationProperty] Property to navigate after action
			 * @param {string} [mParameters.label] Text for the confirmation popup
			 * @param {object} [mParameters.skipProperties] Property list to skip while creating popup
			 *
			 * @returns {Promise} A Promise that resolves if the action has been executed successfully
			 *
			 * @public
			 */
			function createDraftWithNewAction(mParameters) {
				var oRet = new Promise(function(fnResolve, fnReject) {
					callActionImpl(mParameters, null, fnResolve, fnReject);
				});
				return oRet;
			}

			/*
			 * Adds an entry to a table. Only called in draft scenarios.
			 *
			 * @param {sap.ui.table.Table|sap.m.Table|sap.ui.comp.smarttable.SmartTable} oTable The table to which an entry has been added
			 */
			function addEntry(oTable, oPredefinedValues, bContentIdReferencing) {
				if (!oTable) {
					throw new FeError(sClassName, "Unknown Table");
				}

				var sBindingPath = "";
				var sTableBindingPath = "";
				var sEntitySet;
				var oComponent = oController.getOwnerComponent();
				var oAppComponent = oComponent.getAppComponent();
				if (oComponent.getMetadata().getName() === "sap.suite.ui.generic.template.ListReport.Component") { // ToDo: OPAs for the inline create in object page and sub object page, as the current OPA mockserver setup has to be enhanced we have planned to do in using a internal backlog - LROPBANGALORE5-1093
					sEntitySet = (oComponent.getCreationEntitySet && oComponent.getCreationEntitySet()) || (oTable.getEntitySet && oTable.getEntitySet());
				} else {
					sEntitySet = (oComponent.getCreationEntitySet && oComponent.getCreationEntitySet()) ||  oComponent.getEntitySet();
				}
				var oEntityType, oEntitySet, oNavigationEnd, oMetaModel;
				var oView = oController.getView();
				var oModel = oView.getModel();
				var oViewContext = oView.getBindingContext();
				if (oViewContext) {
					// Detail screen
					sTableBindingPath = oCommonUtils.getTableBindingInfo(oTable).path;

					// get entityset of navigation property
					oMetaModel = oModel.getMetaModel();
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
					oNavigationEnd = oMetaModel.getODataAssociationSetEnd(oEntityType, sTableBindingPath);
					if (oNavigationEnd) {
						sEntitySet = oNavigationEnd.entitySet;
					}

					// create binding path
					sTableBindingPath = "/" + sTableBindingPath;
					sBindingPath = oComponent.getComponentContainer().getElementBinding().getPath() + sTableBindingPath;
				} else {
					// on list, support only one entityset mapped to the root component
					sBindingPath = "/" + sEntitySet;
				}

				return new Promise(function(fnResolve, fnReject) {
					// Method will be called in case the create has to be performed on a DraftEntity. For better performance Fe would check
					// whether the expand information in the PreProcessor data is stored in the localStorage. In case this is available Fe
					// will pass the expand nodes and read the newly created instance information. PreProcessor data is always stored with
					// a cache key which ensures Fe don't work with stale data
					var aCacheKeys;
					aCacheKeys = CacheHelper.getCacheKeyPartsAsyc(oModel);
					Promise.all(aCacheKeys).then(function(aKeys) {
						var sRootExpand;
						if (bContentIdReferencing) {
							var oKey = CacheHelper.getCacheKey(oAppComponent.getId(), sEntitySet, aKeys);
							sRootExpand = CacheHelper.readFromLocalStorage(oKey);
						} else {
							sRootExpand = null;
						}

						//Create a dummy context context to get function import
						var newActionContext = new Context(oTable.getModel(), sBindingPath);
						var sFunctionImportPath = oServices.oDraftController.getDraftContext().getODataDraftFunctionImportName(newActionContext, "NewAction");
						var oCreatePromise;

						/* 
						reference bcp: 2080378863
						disabling draft creation temporarily until we find a solution to make createwithcontext option compatible with this change
						*/
						if (false && sFunctionImportPath) {
							//Create Draft using the New Action Annotation
							oCreatePromise = createDraftWithNewAction({
								sourceControl: oTable,
								functionImportPath: sFunctionImportPath,
								label: sFunctionImportPath.split('/')[1],
								contexts: [newActionContext],
								//ResultIsActiveEntity tells wheather draft or active entity will be created
								//For draft creation it is defaulted to false and should not show in popup
								skipProperties: {ResultIsActiveEntity: true}
							});
						} else {
							//Regular way to create a new draft
							oCreatePromise = CRUDHelper.create(oServices.oDraftController,
								sEntitySet,
								sBindingPath,
								oModel,
								oServices.oApplication,
								oPredefinedValues,
								sRootExpand
							);
						}

						oServices.oApplication.getBusyHelper().setBusy(oCreatePromise);
						oCreatePromise.catch(
							handleError.bind(null,
								MessageUtils.operations.addEntry,
								function(oError){
									fnReject();
									throw oError;
								}
							)
						);
						oCreatePromise.then(function(oContext) {
							oServices.oApplication.markCurrentDraftAsModified();
							fnResolve(oContext);
						});
					});
				});
			}

			/* eslint-disable */
			var handleError = testableHelper.testable(handleError, "handleError");
			var getActionUtil = testableHelper.testable(getActionUtil, "getActionUtil");
			/* eslint-enable */

			return {
				editEntity: editEntity,
				deleteEntity: deleteEntity,
				deleteEntities: deleteEntities,
				saveEntity: saveEntity,
				activateDraftEntity: activateDraftEntity,
				discardDraft: discardDraft,
				callAction: callAction,
				addEntry: addEntry
			};
		}

		return BaseObject.extend("sap.suite.ui.generic.template.lib.CRUDManager", {
				constructor: function(oController, oComponentUtils, oServices, oCommonUtils, oBusyHelper) {
					extend(this, getMethods(oController, oComponentUtils, oServices, oCommonUtils, oBusyHelper));
				}
			});
	});