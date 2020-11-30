/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/base/Object",
		"sap/m/MessagePage",
		"sap/m/Link",
		"sap/m/MessageBox",
		"sap/base/Log",
		"sap/fe/core/CommonUtils",
		"sap/ui/base/BindingParser",
		"sap/fe/core/BusyLocker",
		"sap/fe/core/actions/messageHandling"
	],
	function(
		Filter,
		FilterOperator,
		BaseObject,
		MessagePage,
		Link,
		MessageBox,
		Log,
		CommonUtils,
		BindingParser,
		BusyLocker,
		messageHandling
	) {
		"use strict";

		// used across controller extension instances
		var oUseContext,
			bDeferredContext,
			oAsyncContext,
			bTargetEditable,
			bPersistOPScroll,
			aOnAfterNavigation = [],
			sBindingTarget,
			bExitOnNavigateBackToRoot,
			aSemanticKeys = [],
			oEntityType,
			oDraft,
			oFirstBeforeRouteMatchedCallEvent,
			fnNoOp = function() {
				Log.debug("target binding of custom page or re-use component: " + sBindingTarget);
			};

		var enumUIState = {
			CLEAN: 0,
			PROCESSED: 1,
			DIRTY: 2,
			CREATION: 3
		};

		/**
		 * {@link sap.ui.core.mvc.ControllerExtension Controller extension} for routing and navigation
		 *
		 * @namespace
		 * @alias sap.fe.core.controllerextensions.Routing
		 *
		 * @sap-restricted
		 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
		 * @since 1.54.0
		 */
		var Extension = BaseObject.extend("sap.fe.core.controllerextensions.Routing", {
			configure: function(oView, oFcl) {
				this.oView = oView;
				this.oFcl = oFcl;
			},

			/**
			 * Navigates to a context
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#navigateToContext
			 * @memberof sap.fe.core.controllerextensions.Routing
			 * @static
			 * @param {sap.ui.model.odata.v4.Context} context to be navigated to
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {boolean} [mParameters.noHistoryEntry] Navigate without creating a history entry
			 * @param {boolean} [mParameters.noHashChange] Navigate to the context without changing the URL
			 * @param {boolean} [mParameters.useCanonicalPath] Use canonical path
			 * @param {Promise} [mParameters.asyncContext] The context is created async, navigate to (...) and
			 *                    wait for Promise to be resolved and then navigate into the context
			 * @param {boolean} [mParameters.deferredContext] The context shall be created deferred at the target page
			 * @param {boolean} [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
			 * @param {boolean} [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
			 * @param {integer} [mParameters.updateFCLLevel] +1 if we add a column in FCL, -1 to remove a column, 0 to stay on the same column
			 * @param {boolean} [mParameters.useHash] For Semantic Bookmarking load the context without changing the hash when true
			 * @param {boolean} [mParameters.noPreservationCache] do navigation without taking into account the preserved cache mechanism
			 * @returns {Promise} Promise which is resolved once the navigation is triggered
			 *
			 * @sap-restricted
			 * @final
			 */

			navigateToContext: function(oContext, mParameters) {
				mParameters = mParameters || {};
				var oRootContainer = this._getOwnerComponent().getRootContainer(),
					oViewData = this.oView.getViewData(),
					sPath,
					sTargetRoute,
					oParameters = null,
					oRouteDetail,
					oRouterProxy = this._getOwnerComponent().getRouterProxy(),
					that = this;

				if (mParameters.targetPath && oViewData.navigation) {
					oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
					sTargetRoute = oRouteDetail.route;

					if (oRouteDetail.parameters) {
						oParameters = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
					}
				}
				// store context
				if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
					if (mParameters.asyncContext) {
						// the context is either created async (Promise)
						// We need to activate the routeMatchSynchro on the RouterProxy to avoid that
						// the subsequent call to navigateToContext conflicts with the current one
						oRouterProxy.activateRouteMatchSynchronization();

						mParameters.asyncContext
							.then(function(oContext) {
								// once the context is returned we navigate into it
								that.navigateToContext(oContext, {
									noHistoryEntry: true,
									noHashChange: mParameters.noHashChange,
									useCanonicalPath: mParameters.useCanonicalPath,
									editable: mParameters.editable,
									bPersistOPScroll: mParameters.bPersistOPScroll,
									updateFCLLevel: mParameters.updateFCLLevel
								});
							})
							.catch(function(oError) {
								Log.error("Error with the async context", oError);
							});

						// store async context context in singleton
						oAsyncContext = mParameters.asyncContext;
					} else if (mParameters.deferredContext) {
						bDeferredContext = true;
					} else {
						// Navigate to a list binding not yet supported
						throw "navigation to a list binding is not yet supported";
					}
				} else {
					if (oContext.getBinding() && oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding")) {
						if (CommonUtils.hasTransientContext(oContext.getBinding())) {
							return this.oView
								.getModel("sap.fe.i18n")
								.getResourceBundle()
								.then(function(oResourceBundle) {
									var sTitle = CommonUtils.getTranslatedText(
										"C_ROUTING_NAVIGATION_DISABLED_TITLE",
										oResourceBundle,
										null,
										oContext
											.getBinding()
											.getPath()
											.substr(1)
									);
									var sDisableMessage = CommonUtils.getTranslatedText(
										"C_ROUTING_NAVIGATION_DISABLED_MESSAGE",
										oResourceBundle,
										null,
										oContext
											.getBinding()
											.getPath()
											.substr(1)
									);

									MessageBox.show(sDisableMessage, {
										icon: MessageBox.Icon.WARNING,
										title: sTitle,
										actions: [MessageBox.Action.CLOSE],
										details: oResourceBundle.getText("C_TRANSACTION_HELPER_TRANSIENT_CONTEXT_DESCRIPTION"),
										contentWidth: "100px"
									});
								});
						}
					}

					// Navigate to a context binding
					oUseContext = oContext;
				}

				bTargetEditable = mParameters.editable;
				bPersistOPScroll = mParameters.bPersistOPScroll;

				if (mParameters.useCanonicalPath) {
					sPath = oContext.getCanonicalPath();
				} else if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
					sPath = oContext.getHeaderContext().getPath();
				} else {
					sPath = oContext.getPath();
				}

				if (mParameters.updateFCLLevel === -1) {
					// When navigating back from a context, we need to remove the last component of the path
					var regex = new RegExp("/[^/]*$");
					sPath = sPath.replace(regex, "");

					//current context is wrong as we previously modify the sPath
					oUseContext = null;

					// If sPath is empty, we're supposed to navigate to the first page of the app
					// Check if we need to exit from the app instead
					if (sPath.length === 0 && bExitOnNavigateBackToRoot) {
						return oRouterProxy.exitFromApp();
					}
				}
				var oAppComponent = this._getOwnerComponent();
				var oRouter = oAppComponent.getRouter();
				var sHash = oRouter.getHashChanger().getHash();
				var oFclCtrl = oAppComponent.getRootViewController();

				if (mParameters.asyncContext || mParameters.deferredContext) {
					// the context is deferred or async, we add (...) to the path
					sPath += "(...)";
				} else if (
					aSemanticKeys &&
					aSemanticKeys.length &&
					oDraft &&
					sHash.split("/").length === 1 &&
					sHash.indexOf("(...)") === -1 &&
					sPath !== "" &&
					!oAppComponent.getRootViewController().isFclEnabled()
				) {
					var sEntitySet =
						(oContext && oContext.getPath().substring(0, oContext.getPath().indexOf("("))) ||
						sHash.substring(0, sHash.indexOf("("));
					var sTempPath = "";
					while (sEntitySet.indexOf("/") === 0) {
						sEntitySet = sEntitySet.substr(1);
					}
					if (oViewData.viewLevel === 0) {
						sTempPath = this._createHash(aSemanticKeys, sEntitySet, oContext);
					} else if (oViewData.viewLevel === 1 && sHash !== "") {
						//TODO: sHash != "" check should be removed once the issue of adding empty hash is resolved during creation
						if (mParameters.useHash) {
							sTempPath = sHash;
						} else if (oContext && oContext.getPath().split("/").length <= 2) {
							sTempPath = this._createHash(aSemanticKeys, sEntitySet, oContext);
						}
					}

					if (sTempPath !== "") {
						if (sHash === sTempPath || sHash.replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "") === sTempPath) {
							this._bindTargetPage(oRootContainer.getCurrentPage(), null, null, true, false, oRouter);
							return Promise.resolve();
						} else if (sTempPath === undefined) {
							// Whenever the context does not contain the semantic key values it would return sTempPath as undefined
							// and we fallback to technical keys implementation unless its during cancel action
							if (mParameters.useHash) {
								// Sometimes during cancel the context might not contain the semantic key values, then we directly call bindTargetPage instead of falling back to technical keys
								this._bindTargetPage(oRootContainer.getCurrentPage(), null, null, true, false, oRouter);
								return Promise.resolve();
							}
						} else {
							sPath = sTempPath;
						}
					}
				}

				if (oAppComponent.getRootViewController().isFclEnabled()) {
					var FCLLevel = this.oFcl.getFCLLevel();
					if (mParameters.updateFCLLevel) {
						FCLLevel += mParameters.updateFCLLevel;
						if (FCLLevel < 0) {
							FCLLevel = 0;
						}
					}
					// Calculate the next layout based on the view level and path
					var sLayout;
					if (mParameters.sLayout) {
						sLayout = mParameters.sLayout;
					} else {
						sLayout = oFclCtrl.getFCLLayout(FCLLevel, sPath);
					}

					sPath += "?layout=" + sLayout;
				}

				// remove extra '/' at the beginning of path
				while (sPath.indexOf("/") === 0) {
					sPath = sPath.substr(1);
				}

				if (mParameters.noHashChange) {
					// If there's no real navigation, just update the context
					if (oAppComponent.getRootViewController().isFclEnabled()) {
						// In the FCL case, first check whether there's really no hash change by
						// comparing the target URL with the current one (otherwise, perform standard navigation)
						// oRootContainer is a FlexibleColumnLayout
						if (
							sPath ===
							this._getOwnerComponent()
								.getRouter()
								.getHashChanger()
								.getHash()
						) {
							var oTargetPage;
							switch (this.oFcl.getFCLLevel()) {
								case 0:
									oTargetPage = oRootContainer.getCurrentBeginColumnPage();
									break;

								case 1:
									oTargetPage = oRootContainer.getCurrentMidColumnPage();
									break;

								default:
									oTargetPage = oRootContainer.getCurrentEndColumnPage();
									break;
							}
							this._bindTargetPage(oTargetPage, null, null, true, true, oRouter);
							return Promise.resolve();
						}
					} else {
						// In the fullscreen case, oRootContainer is a NavContainer
						this._bindTargetPage(oRootContainer.getCurrentPage(), null, null, true, false, oRouter);
						return Promise.resolve();
					}
				}

				if (sTargetRoute && oParameters !== null) {
					this._getOwnerComponent()
						.getRouter()
						.navTo(sTargetRoute, oParameters);
				} else if (mParameters.transient && mParameters.editable == true && sPath.indexOf("(...)") === -1) {
					if (sPath.indexOf("?") > -1) {
						sPath += "&i-action=create";
					} else {
						sPath += "?i-action=create";
					}
				}

				return oRouterProxy.navToHash(sPath, false, mParameters.noPreservationCache);
			},

			/**
			 * Will take a parameters map [k: string] : ComplexBindingSyntax
			 * and return a map where the binding syntax is resolved to the current model.
			 * Additionally, relative path are supported.
			 *
			 * @param mParameters
			 * @param sTargetRoute
			 * @param oContext
			 * @returns {{}}
			 */
			prepareParameters: function(mParameters, sTargetRoute, oContext) {
				var oParameters;
				try {
					var sContextPath = oContext.getPath();
					var aContextPathParts = sContextPath.split("/");
					oParameters = Object.keys(mParameters).reduce(function(oReducer, sParameterKey) {
						var sParameterMappingExpression = mParameters[sParameterKey];
						// We assume the defined parameters will be compatible with a binding expression
						var oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
						var aParts = oParsedExpression.parts || [oParsedExpression];
						var aResolvedParameters = aParts.map(function(oPathPart) {
							var aRelativeParts = oPathPart.path.split("../");
							// We go up the current context path as many times as necessary
							var aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
							aLocalParts.push(aRelativeParts[aRelativeParts.length - 1]);
							return oContext.getObject(aLocalParts.join("/"));
						});
						if (oParsedExpression.formatter) {
							oReducer[sParameterKey] = oParsedExpression.formatter.apply(this, aResolvedParameters);
						} else {
							oReducer[sParameterKey] = aResolvedParameters.join("");
						}
						return oReducer;
					}, {});
				} catch (error) {
					Log.error("Could not parse the parameters for the navigation to route " + sTargetRoute);
					oParameters = undefined;
				}
				return oParameters;
			},

			/**
			 * Navigates 1 "level before" a given context
			 * The target level is defined by removing the last segment from the context passed as parameter
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#navigateBackFromContext
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @param {*} oContext The context used as starting point
			 * @param {*} mParameters Same as in navigateToContext
			 * @returns {Promise} Promise which is resolved once the navigation is triggered
			 */

			navigateBackFromContext: function(oContext, mParameters) {
				mParameters = mParameters || {};
				mParameters.updateFCLLevel = -1;

				return this.navigateToContext(oContext, mParameters);
			},

			/**
			 * Navigates to a given context, which is supposed to be deeper than the current one
			 * In the case of an FCL layout, this means we shall add another column to the right for the navigation
			 * In the case of a fullscreen layout, the result is the same as navigateToContext
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#navigateForwardToContext
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @param {*} oContext The context to navigate to
			 * @param {*} mParameters Same as in navigateToContext
			 * @returns {Promise} Promise which is resolved once the navigation is triggered
			 */

			navigateForwardToContext: function(oContext, mParameters) {
				mParameters = mParameters || {};
				mParameters.updateFCLLevel = 1;

				return this.navigateToContext(oContext, mParameters);
			},
			/**
			 * Creates and navigates a message page to show an error.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#navigateToContext
			 * @memberof sap.fe.core.controllerextensions.Routing
			 * @static
			 * @param {string} sErrorMessage errorMessage A human readable error message
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {sap.m.NavContainer} [mParameters.navContainer] Instance of a sap.m.NavContainer if not specified the method expects tha owner component of the view to be the navigation container
			 * @param {string} [mParameters.description] A human readable description of the error
			 * @param {string} [mParameters.technicalMessage] Technical Message
			 * @param {string} [mParameters.technicalDetails] Further technical details
			 * @returns {void}
			 * @sap-restricted
			 * @final
			 */
			navigateToMessagePage: function(sErrorMessage, mParameters) {
				mParameters = mParameters || {};
				var oAppComponent = CommonUtils.getAppComponent(mParameters.navContainer);
				var oRouter = oAppComponent.getRouter();
				if (
					oRouter
						.getHashChanger()
						.getHash()
						.indexOf("i-action=create") > -1
				) {
					var oAppComponent = CommonUtils.getAppComponent(mParameters.navContainer);

					return this.getRootEntitySet(oAppComponent).then(function(sEntitySet) {
						var sHash = sEntitySet + "(...)";
						var oRouterProxy = oAppComponent.getRouterProxy();
						oRouterProxy.navToHash(sHash);
					});
				}
				var oRootContainer = mParameters.navContainer || this._getOwnerComponent().getRootContainer();

				if (!this.oMessagePage) {
					this.oMessagePage = new MessagePage({
						showHeader: false,
						icon: "sap-icon://message-error"
					});

					oRootContainer.addPage(this.oMessagePage);
				}

				this.oMessagePage.setText(sErrorMessage);

				if (mParameters.technicalMessage) {
					this.oMessagePage.setCustomDescription(
						new Link({
							text: mParameters.description || mParameters.technicalMessage,
							press: function() {
								MessageBox.show(mParameters.technicalMessage, {
									icon: MessageBox.Icon.ERROR,
									title: mParameters.title,
									actions: [MessageBox.Action.OK],
									defaultAction: MessageBox.Action.OK,
									details: mParameters.technicalDetails || "",
									contentWidth: "60%"
								});
							}
						})
					);
				} else {
					this.oMessagePage.setDescription(mParameters.description || "");
				}

				oRootContainer.to(this.oMessagePage);
			},

			/**
			 * Navigate back to previous state from transient state (...).
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#navigateBackFromTransientState
			 * @memberof sap.fe.core.controllerextensions.Routing
			 * @static
			 * @param {object} [oAppComponent] the app component
			 * @param {map} [mParameters] Optional, can contain the following attributes:
			 * @param {control | model} [mParameters.unLockObject] object to be unlocked with function BusyLocker.unlock
			 *
			 * @sap-restricted
			 * @final
			 */
			navigateBackFromTransientState: function(oAppComponent, mParameters) {
				var oRouterProxy = oAppComponent.getRouterProxy(),
					sHash = oRouterProxy.getHash();

				// if triggered while navigating to (...) the browser comes back to his previous navigation state and unlocks objects if needed
				if (sHash.indexOf("(...)") !== -1) {
					if (mParameters && mParameters.unLockObject && BusyLocker.isLocked(mParameters.unLockObject)) {
						BusyLocker.unlock(mParameters.unLockObject);
					}
					oRouterProxy.navBack();
				}
			},

			/**
			 * This sets the UI state as dirty, meaning bindings have to be refreshed.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#setUIStateDirty
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */
			setUIStateDirty: function() {
				Extension.flagUIState = enumUIState.DIRTY;
			},

			/**
			 * This sets the UI state as processed, meaning is can be reset to clean after all bindings are refreshed.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#setUIStateProcessed
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */
			setUIStateProcessed: function() {
				Extension.flagUIState = enumUIState.PROCESSED;
			},

			/**
			 * This sets the UI state as creation, meaning bindings have to be refreshed.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#setUIStateCreation
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */
			setUIStateCreation: function() {
				Extension.flagUIState = enumUIState.CREATION;
			},

			/**
			 * Resets the UI state to the initial state.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#resetUIState
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */
			resetUIState: function() {
				Extension.flagUIState = enumUIState.CLEAN;
			},

			/**
			 * Returns true if the UI state is not clean, meaning bindings have to be refreshed
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#isUIStateDirty
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */

			isUIStateDirty: function() {
				return Extension.flagUIState !== enumUIState.CLEAN;
			},

			/**
			 * Cleans the UI state if it has been processed, i.e. bindings have been properly refreshed.
			 *
			 * @function
			 * @name sap.fe.core.controllerextensions.Routing#cleanProcessedUIState
			 * @memberof sap.fe.core.controllerextensions.Routing
			 *
			 * @sap-restricted
			 * @final
			 */
			cleanProcessedUIState: function() {
				if (Extension.flagUIState === enumUIState.PROCESSED) {
					Extension.flagUIState = enumUIState.CLEAN;
				}
			},

			getFirstBeforeRouteMatchedCallEvent: function() {
				return oFirstBeforeRouteMatchedCallEvent;
			},

			/**
			 * Check for allowDeepLinking for every page and store the details.
			 *
			 * @param {sap.ui.core.Component} oAppComponent Application Component
			 * @returns {object} Details of all the object pages at each level for which allowDeepLinking is true
			 */
			getNavigablePages: function(oAppComponent) {
				var oRouting = oAppComponent.getManifest()["sap.ui5"].routing,
					aRoutes = oRouting.routes,
					oTargets = oRouting.targets,
					mPageMap = {};
				for (var i = 0; i < aRoutes.length; i++) {
					var oPage = {},
						sPattern = aRoutes[i].pattern,
						sTarget = aRoutes[i].target,
						iLevel = sPattern.split("/").length - 1;
					oPage["pattern"] = sPattern;
					if (sPattern === ":?query:" || sPattern === "") {
						continue;
					}
					if (iLevel === 1 && sPattern.split("/")[iLevel] === ":?query:") {
						iLevel = 0;
					}
					oPage["level"] = iLevel;
					if (Array.isArray(sTarget)) {
						//target is Array in case of FCL
						oPage["target"] = sTarget[sTarget.length - 1];
					} else {
						oPage["target"] = sTarget;
					}
					if (oTargets[oPage.target].options && oTargets[oPage.target].options.settings) {
						oPage["allowDeepLinking"] = oTargets[oPage.target].options.settings.allowDeepLinking;
						oPage["entitySet"] = oTargets[oPage.target].options.settings.entitySet;
					}
					if (!oPage["allowDeepLinking"] && oPage["level"] !== 0) {
						continue;
					} else if (!mPageMap[oPage.level]) {
						mPageMap[oPage.level] = [];
					}
					mPageMap[oPage.level].push(oPage);
				}
				return mPageMap;
			},

			/**
			 * Check for Semantic Keys/ Technical Keys in the URL.
			 *
			 * @param {Array} aKeys array of semantic keys or technical keys of the page
			 * @param {object} oParameters URL parameters
			 * @returns {boolean} True if Semantic Keys are available in URL
			 */
			checkForKeys: function(aKeys, oParameters) {
				if (aKeys && aKeys.length) {
					for (var j = 0; j < aKeys.length; j++) {
						var sPropertyPath = aKeys[j].$PropertyPath;
						if (!sPropertyPath) {
							// Technical Keys do not require $ProperyPath
							sPropertyPath = aKeys[j];
						}
						var aPropertyValue = oParameters[sPropertyPath];
						if (!aPropertyValue || (aPropertyValue && aPropertyValue.length > 1)) {
							return false;
						}
					}
					return true;
				}
				return false;
			},

			/**
			 * Creates the filter for the entity set.
			 *
			 * @param {object} oDraft details of Draft Node
			 * @param {Array} aKeys array of semantic keys or technical keys of the page
			 * @param {object} oStartUpParameters URL Parameters
			 * @returns {object} Filters for the entity set
			 */
			getFilters: function(oDraft, aKeys, oStartUpParameters) {
				var aFilters = [];

				for (var j = 0; j < aKeys.length; j++) {
					var sProperty = aKeys[j].$PropertyPath;
					if (!sProperty) {
						// Technical Keys Scenario
						sProperty = aKeys[j];
						if (sProperty === "IsActiveEntity") {
							oDraft = false;
						}
					}
					var sValue = oStartUpParameters[sProperty][0];
					if (sValue) {
						aFilters.push(new Filter(sProperty, FilterOperator.EQ, sValue));
					} else {
						return undefined;
					}
				}
				if (oDraft) {
					var oDraftFilter = new Filter({
						filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
						and: false
					});
					aFilters.push(oDraftFilter);
				}
				var oCompleteFilter = new Filter(aFilters, true);
				return oCompleteFilter;
			},

			_initializeRouteMatcher: function(oAppComponent, oRouter) {
				var that = this;

				oRouter.attachBeforeRouteMatched(function(oEvent) {
					var oRootView = oAppComponent.getRootControl();
					BusyLocker.lock(oRootView);
					//keep a copy of the first beforeRouteMatched Event in case of deeplink navigation without layout defined
					if (!oFirstBeforeRouteMatchedCallEvent && oEvent) {
						oFirstBeforeRouteMatchedCallEvent = Object.assign({}, oEvent);
						oFirstBeforeRouteMatchedCallEvent.getParameters = oEvent.getParameters;
						oFirstBeforeRouteMatchedCallEvent.getParameter = oEvent.getParameter;
					}
				});

				oRouter.attachRouteMatched(function(oEvent) {
					var mArguments = oEvent.getParameters().arguments,
						sTarget = "",
						sKey,
						bDeferred;

					that.fireOnAfterNavigation();

					var oRootView = oAppComponent.getRootControl();
					var oAppStateHandler = oAppComponent.getAppStateHandler();
					// if the root control is a NavContainer, it is set to busy when navigateToContext
					// handler to reset the busy state is attached once here
					if (BusyLocker.isLocked(oRootView)) {
						BusyLocker.unlock(oRootView);
					}

					if (oAppStateHandler.checkIfRouteChangedByIApp()) {
						oAppStateHandler.resetRouteChangedByIApp();
						return;
					}

					if (Object.keys(mArguments).length > 0) {
						// get route pattern and remove query part
						var sTargetBindingPattern;
						if (
							oEvent.getParameter("view").getComponentInstance &&
							oEvent.getParameter("view").getComponentInstance() &&
							oEvent.getParameter("view").getComponentInstance().getBindingContextPattern
						) {
							sTargetBindingPattern = oEvent
								.getParameter("view")
								.getComponentInstance()
								.getBindingContextPattern();
						}
						sTarget = sTargetBindingPattern || oEvent.getParameters().config.pattern;
						// 	the query name is static now but can be also a parameter in the future
						sTarget = sTarget.replace(":?query:", "");

						for (var p in mArguments) {
							sKey = mArguments[p];
							if (sKey === "...") {
								bDeferred = true;
								// Sometimes in preferredMode = create, the edit button is shown in background when the
								// action parameter dialog shows up, setting bTargetEditable passes editable as true
								// to onBeforeBinding in _bindTargetPage function
								bTargetEditable = true;
							}
							sTarget = sTarget.replace("{" + p + "}", sKey);
						}
						// the binding target is always absolute
						if (sTarget && sTarget[0] !== "/") {
							sTarget = "/" + sTarget;
						}
					}
					var aTargets = oEvent.getParameter("config").target;
					if (oAppComponent.getRootViewController().isFclEnabled() && typeof aTargets === "object" && aTargets.length) {
						// Update FCL levels for each view
						oAppComponent.getRootViewController().updateFCLLevels(aTargets, oEvent.getParameter("views"));

						// We have more than one target
						aTargets.forEach(function(sTargetName, iIndex) {
							var oTargetConfiguration = oAppComponent.getRootViewController().getTargetAggregation()[sTargetName];
							if (oTargetConfiguration.pattern !== undefined) {
								sTarget = that.buildBindingContext(oTargetConfiguration.pattern, mArguments);
							}

							var oTargetContainer = oEvent.getParameter("views")[iIndex];

							if (oTargetContainer != null) {
								that._bindTargetPage(oTargetContainer, sTarget, bDeferred, false, true, oRouter);
							} else {
								throw new Error("No Container found for target " + sTargetName + "(Please check the Router configuration)");
							}
						});
					} else {
						var oRootView = oAppComponent.getRootContainer();
						that._bindTargetPage(oRootView.getCurrentPage(), sTarget, bDeferred, false, false, oRouter);
					}

					that.cleanProcessedUIState(); // Reset UI state only when all bindings have been refreshed

					// Check if current hash has been set by getRouterProxy().navToHash function
					// If not, rebuild history properly (both in the browser and the RouterProxy)
					var oRouterProxy = oAppComponent.getRouterProxy();
					if (!history.state || history.state.feLevel === undefined) {
						oRouterProxy
							.restoreHistory()
							.then(function() {
								oRouterProxy.resolveRouteMatch();
							})
							.catch(function(oError) {
								Log.error("Error while restoing history", oError);
							});
					} else {
						oRouterProxy.resolveRouteMatch();
					}
				});
			},

			/**
			 * This initializes and extends the routing as well as the attaching to hash changes.
			 *
			 * @memberof sap.fe.core.controllerextensions.Routing
			 * @static
			 * @param {sap.ui.core.Component} oAppComponent application component owning the routing
			 * @returns {Promise} to indicate initialization is done
			 * @sap-restricted
			 * @final
			 */
			initializeRouting: function(oAppComponent) {
				var that = this;
				var oModel = oAppComponent.getModel();
				var oMetaModel = oModel.getMetaModel();
				var oRouter = oAppComponent.getRouter();

				// as the controller extension and it's globals are used across apps we have to reset them
				oUseContext = null;
				bDeferredContext = false;
				oAsyncContext = null;
				bTargetEditable = false;
				bPersistOPScroll = null;
				aOnAfterNavigation = [];
				bExitOnNavigateBackToRoot = false;
				oFirstBeforeRouteMatchedCallEvent = null;
				that.resetUIState();

				// initialize route matcher at the very beginning to ensure that internal route matcher callbacks are registered first
				this._initializeRouteMatcher(oAppComponent, oRouter);

				return that
					.getRootEntitySet(oAppComponent)
					.then(function(sRootEntityName) {
						var sPath,
							bIsIappState =
								oRouter
									.getHashChanger()
									.getHash()
									.indexOf("sap-iapp-state") !== -1,
							oComponentData = oAppComponent.getComponentData(),
							oStartUpParameters = oComponentData && oComponentData.startupParameters,
							bHasStartUpParameters = oStartUpParameters !== undefined && Object.keys(oStartUpParameters).length !== 0;

						var aContextPromises = [];
						var mExternallyNavigablePages = {};
						var sHash = "";

						//Initialise with level 0 values in case of no startup parameter
						if (sRootEntityName) {
							oEntityType = oMetaModel.getObject("/$EntityContainer/" + sRootEntityName + "/");
							oDraft =
								oMetaModel.getObject(
									"/$EntityContainer/" + sRootEntityName + "@com.sap.vocabularies.Common.v1.DraftRoot"
								) ||
								oMetaModel.getObject("/$EntityContainer/" + sRootEntityName + "@com.sap.vocabularies.Common.v1.DraftNode");
							aSemanticKeys = oMetaModel.getObject(
								"/$EntityContainer/" + sRootEntityName + "/@com.sap.vocabularies.Common.v1.SemanticKey"
							);
						} else {
							// the root entitySet is not necessarily required
							Log.info("no root entity identified - therefore no draft information and semantic keys available");
						}

						// Only use this logic in case of no iapp-state and bHasStartUpParameters
						if (!bIsIappState && bHasStartUpParameters) {
							if (
								oStartUpParameters.preferredMode &&
								oStartUpParameters.preferredMode[0] === "create" &&
								!oRouter.getHashChanger().getHash()
							) {
								// Logic for create mode
								if (sRootEntityName) {
									sPath = sRootEntityName + "(...)";
								} else {
									Log.error(
										"Cannot handle this App due to missing root entity definition - neither DraftRoot nor StickySessionSupported found"
									);
								}
								oRouter.getHashChanger().replaceHash(sPath);
								bExitOnNavigateBackToRoot = true;
							} else {
								// Check if semantic keys are present in url parameters for every object page at each level
								var aObjectPages,
									oObjectPage,
									oLevelOfObjectPages = that.getNavigablePages(oAppComponent),
									iLevel = 0;

								// check each level starting at 0 until a level is not defined - the following ones should be ignored
								while (iLevel in oLevelOfObjectPages) {
									aObjectPages = oLevelOfObjectPages[iLevel];

									// loop through pages at each level
									// use for-loop to break early
									for (var i = 0; i < aObjectPages.length; ++i) {
										oObjectPage = aObjectPages[i];
										if (!oObjectPage.entitySet && oObjectPage.level === 0) {
											oObjectPage.entitySet = sRootEntityName;
										}
										if (!oObjectPage.entitySet) {
											continue;
										}

										oObjectPage.entityType = oMetaModel.getObject("/$EntityContainer/" + oObjectPage.entitySet + "/");
										oObjectPage.draft =
											oMetaModel.getObject(
												"/$EntityContainer/" + oObjectPage.entitySet + "@com.sap.vocabularies.Common.v1.DraftRoot"
											) ||
											oMetaModel.getObject(
												"/$EntityContainer/" + oObjectPage.entitySet + "@com.sap.vocabularies.Common.v1.DraftNode"
											);
										oObjectPage.technicalKeys = oObjectPage.entityType["$Key"];
										oObjectPage.semanticKeys = oMetaModel.getObject(
											"/$EntityContainer/" + oObjectPage.entitySet + "/@com.sap.vocabularies.Common.v1.SemanticKey"
										);
										if (that.checkForKeys(oObjectPage.semanticKeys, oStartUpParameters)) {
											// make record if semantic keys are available in URL params
											oObjectPage.isSemanticKeyNavigation = true;
											mExternallyNavigablePages[iLevel] = oObjectPage;
											break;
										} else if (
											oObjectPage.level === 0 &&
											that.checkForKeys(oObjectPage.technicalKeys, oStartUpParameters)
										) {
											// Support for Technical Keys for root level object page
											oObjectPage.isSemanticKeyNavigation = false;
											mExternallyNavigablePages[iLevel] = oObjectPage;
											break;
										}
									}

									++iLevel;
								}

								Object.keys(mExternallyNavigablePages).forEach(function(sKey) {
									var oPage = mExternallyNavigablePages[sKey],
										oCompleteFilter,
										oListBind;
									if (oPage.isSemanticKeyNavigation) {
										oCompleteFilter = that.getFilters(oPage.draft, oPage.semanticKeys, oStartUpParameters);
									} else {
										oCompleteFilter = that.getFilters(oPage.draft, oPage.technicalKeys, oStartUpParameters);
									}
									oListBind = oModel.bindList("/" + oPage.entitySet, undefined, undefined, oCompleteFilter);
									aContextPromises.push(oListBind.requestContexts());
								});
							}
						}

						return Promise.all(aContextPromises)
							.then(function(aValues) {
								var sTarget,
									k = 0,
									i = 0,
									oTechnicalKeys = {},
									aPattern = [],
									oFcl = oAppComponent.getRootControl().getViewName() === "sap.fe.templates.RootContainer.view.Fcl";
								for (i = 0; i < aValues.length; i++) {
									if (aValues[i] && aValues[i].length) {
										if (aValues[i].length > 1) {
											break;
										}
										sTarget = aValues[i][0].getPath().split("(");
										var sTechnicalKey = sTarget[sTarget.length - 1];
										oTechnicalKeys[i] = sTechnicalKey; // storing technical keys to be replaced in pattern
									} else {
										break;
									}
								}
								var iNumberOfTechnicalKeys = Object.keys(oTechnicalKeys).length;
								if (Object.keys(mExternallyNavigablePages).length && iNumberOfTechnicalKeys) {
									// Fetch the pattern of deepest level
									aPattern = mExternallyNavigablePages[iNumberOfTechnicalKeys - 1].pattern.split("/");
								}
								if (iNumberOfTechnicalKeys === 1 && !oFcl) {
									// Semantic Bookmarking Support
									oEntityType = mExternallyNavigablePages[0].entityType;
									aSemanticKeys = mExternallyNavigablePages[0].semanticKeys;
									oDraft = mExternallyNavigablePages[0].draft;
									sRootEntityName = mExternallyNavigablePages[0].entitySet;
									if (mExternallyNavigablePages[0].isSemanticKeyNavigation) {
										sHash = that._createHash(aSemanticKeys, sRootEntityName, oStartUpParameters);
									} else {
										sHash = that._createHash(
											mExternallyNavigablePages[0].technicalKeys,
											sRootEntityName,
											oStartUpParameters
										);
									}
								} else {
									for (k = 0; k < aPattern.length; k++) {
										// Replace {key} with technical keys
										var sNavigationProperty = aPattern[k].split("{")[0];
										sHash = sHash + "/" + sNavigationProperty + oTechnicalKeys[k];
									}
								}
								if (sHash) {
									//Replace the hash with newly created hash
									oRouter.getHashChanger().replaceHash(sHash);
								}
							})
							.catch(function(error) {
								Log.info("Could not find results for list bind: " + error);
							});
					})
					.finally(function() {
						oRouter.initialize();
					});
			},

			_bindTargetPage: function(oTargetControl, sTarget, bDeferred, bNoHashChange, bIsFcl, oRouter) {
				var oTargetInstance = oTargetControl.getComponentInstance
						? oTargetControl.getComponentInstance()
						: oTargetControl.getController(),
					fnOnBeforeBinding = (oTargetInstance.onBeforeBinding || fnNoOp).bind(oTargetInstance),
					fnOnAfterBinding = (oTargetInstance.onAfterBinding || fnNoOp).bind(oTargetInstance),
					oBindingContext,
					sBindingContextPath,
					oExistingParentBinding,
					oParentBinding,
					oParentListBinding,
					oMetaModel = oTargetControl.getModel().getMetaModel(),
					// retrieving the entitySet to add the message property to the binding works only in
					// case a FE component (getEntitySet exists) is used -> we anyway want to refactor this
					sEntitySet =
						oTargetControl.getComponentInstance &&
						oTargetControl.getComponentInstance().getEntitySet &&
						oTargetControl.getComponentInstance().getEntitySet(),
					that = this,
					sMessagesPath;

				function fnGetSemantickeysFilter() {
					if (aSemanticKeys && aSemanticKeys.length) {
						var aFilters = [];
						var aValues = [];
						var sHash = oRouter.getHashChanger().getHash();
						sHash = sHash.split("?")[0]; //remove any hash query params if they exist.
						if (oUseContext) {
							var oValue;
							for (var i = 0; i < aSemanticKeys.length; i++) {
								oValue = oUseContext.getObject(aSemanticKeys[i].$PropertyPath);
								if (oValue) {
									aValues.push(oValue);
								} else {
									return undefined;
								}
							}
						} else {
							aValues = sHash.substring(sHash.indexOf("(") + 1, sHash.length - 1).split(",");
						}
						for (var j = 0; j < aSemanticKeys.length; j++) {
							var sProperty = aSemanticKeys[j].$PropertyPath;
							var sValue;
							if (aValues.length === 1) {
								sValue = aValues[0];
							} else {
								sValue = aValues[j].split("=")[1];
							}
							if (sValue.indexOf("'") === 0 && sValue.lastIndexOf("'") === sValue.length - 1) {
								// slicing the quotes from the value
								sValue = sValue.substr(1, sValue.length - 2);
							}
							aFilters.push(new Filter(sProperty, FilterOperator.EQ, sValue));
						}
						if (oDraft) {
							var oDraftFilter = new Filter({
								filters: [
									new Filter("IsActiveEntity", "EQ", false),
									new Filter("SiblingEntity/IsActiveEntity", "EQ", null)
								],
								and: false
							});
							aFilters.push(oDraftFilter);
						}
						var oCompleteFilter = new Filter(aFilters, true);
						return oCompleteFilter;
					}
				}

				function fnBindContextToTargetPage() {
					if (!bNoHashChange) {
						oBindingContext = oTargetControl.getBindingContext();
						sBindingContextPath = oBindingContext && oBindingContext.getPath();
						oExistingParentBinding = oBindingContext && oBindingContext.getBinding();
						oParentBinding = oUseContext && oUseContext.getBinding();
					}

					if (
						bNoHashChange ||
						sBindingContextPath !== sTarget ||
						(oUseContext && oExistingParentBinding !== oParentBinding && !bIsFcl)
					) {
						if (sTarget || bNoHashChange) {
							if (
								!oUseContext ||
								!oUseContext.getBinding() ||
								oUseContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding")
							) {
								// TODO: This is just a workaround once model changes caching sParentListBinding has to be removed
								//Passing the parentBinding Id to the OP controller
								oParentListBinding = oUseContext && oUseContext.getBinding();
								var mParameters = {
									$$patchWithoutSideEffects: true,
									$$groupId: "$auto.Heroes",
									$$updateGroupId: "$auto"
								};

								// Bind messages in the hidden binding.
								if (sMessagesPath) {
									mParameters.$select = sMessagesPath;
								}

								var oDraftRoot = oMetaModel.getObject(
									oMetaModel.getMetaPath(sTarget) + "@com.sap.vocabularies.Common.v1.DraftRoot"
								);
								var oDraftNode = oMetaModel.getObject(
									oMetaModel.getMetaPath(sTarget) + "@com.sap.vocabularies.Common.v1.DraftNode"
								);
								// In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
								if (oDraftRoot !== undefined || oDraftNode !== undefined) {
									if (mParameters.$select === undefined) {
										mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
									} else {
										mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
									}
								}

								// there's no context, the user refreshed the page or used a bookmark, we need to
								// create a new context with the path from the URL
								// as setting the context with a return value context currently doesn't work we
								// also create a new context in this case - to be discussed with v4 model team
								var oHiddenBinding = oTargetControl.getModel().bindContext(sTarget, undefined, mParameters);

								oHiddenBinding.attachEventOnce("dataRequested", function() {
									BusyLocker.lock(oTargetControl);
								});

								oHiddenBinding.attachEventOnce("dataReceived", function(oEvent) {
									var sErrorDescription = oEvent && oEvent.getParameter("error");
									BusyLocker.unlock(oTargetControl);
									if (sErrorDescription) {
										// TODO: in case of 404 the text shall be different
										sap.ui
											.getCore()
											.getLibraryResourceBundle("sap.fe.core", true)
											.then(function(oResourceBundle) {
												messageHandling.removeUnboundTransitionMessages();
												that.navigateToMessagePage(oResourceBundle.getText("SAPFE_DATA_RECEIVED_ERROR"), {
													title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
													description: sErrorDescription,
													navContainer: oTargetControl.getParent()
												});
											})
											.catch(function(oError) {
												Log.error("Error while getting the core resource bundle", oError);
											});
									}
								});
								oUseContext = oHiddenBinding.getBoundContext();

								if (that.isUIStateDirty()) {
									// TODO: as a workaround we invalidate the model cache while the app is dirty
									// as the manage model sets the parent in an async task and the request side effects
									// relies on the parent relationship we have to set a timeout 0
									setTimeout(function() {
										that._refreshBindingContext(oBindingContext, sMessagesPath);
									}, 0);
								}
							}

							oBindingContext = oUseContext;
							fnOnBeforeBinding(oBindingContext, {
								editable: bTargetEditable,
								listBinding: oParentListBinding,
								bPersistOPScroll: bPersistOPScroll
							});

							oTargetControl.setBindingContext(oBindingContext);
							// TODO: This is just a workaround once model changes caching sParentListBinding has to be removed
							fnOnAfterBinding(oBindingContext);
							oUseContext = null;
						} else if (sTarget === "") {
							fnOnBeforeBinding(null);
							fnOnAfterBinding(null);
						}
					} else if (that.isUIStateDirty()) {
						// TODO: this is just a first workaround. Once the model supports synchronization this is not needed anymore
						that._refreshBindingContext(oBindingContext, sMessagesPath);
					}
				}

				sBindingTarget = oTargetControl.getComponent ? oTargetControl.getComponent() : oTargetControl.getControllerName();
				if (sEntitySet) {
					sMessagesPath = oMetaModel.getProperty("/" + sEntitySet + "/@com.sap.vocabularies.Common.v1.Messages/$Path");
				}
				if (bDeferred) {
					// TODO: set empty context to be checked with model colleagues

					// pass the parameters to the onbeforebinding
					fnOnBeforeBinding(null, { editable: bTargetEditable });

					if (bDeferredContext || !oAsyncContext) {
						// either the context shall be created in the target page (deferred Context) or it shall
						// be created async but the user refreshed the page / bookmarked this URL
						// TODO: currently the target component creates this document but we shall move this to
						// a central place
						if (oTargetInstance && oTargetInstance.createDeferredContext) {
							oTargetInstance.createDeferredContext(sTarget);
							oAsyncContext = null;
							bDeferredContext = false;
						}
					}

					if (oTargetControl.getBindingContext() && oTargetControl.getBindingContext().hasPendingChanges()) {
						/* TODO: this is just a quick solution, this needs to be reworked
                                there are still pending changes that were not yet removed. ideally the user should be asked for
                                before he is leaving the page. we will work on this with another backlog item. For now remove the
                                pending changes to avoid the model raises errors and the object page is at least bound
                             */
						oTargetControl
							.getBindingContext()
							.getBinding()
							.resetChanges();
					}

					// remove the context to avoid showing old data
					oTargetControl.setBindingContext(null);

					return false;
				}
				var sHash = oRouter.getHashChanger().getHash();
				if (
					aSemanticKeys &&
					aSemanticKeys.length &&
					oDraft &&
					sHash &&
					sHash.split("/").length === 1 &&
					sTarget !== "" &&
					!bIsFcl
				) {
					// If context exists then we fetch the semantic key values from it else we use Hash to get semantic key values
					// and make a call via listbinding to fetch the context
					if (!oUseContext) {
						var oCompleteFilter = fnGetSemantickeysFilter();
						var oListBinding = oTargetControl
							.getModel()
							.bindList("/" + sHash.substring(0, sHash.indexOf("(")), undefined, undefined, oCompleteFilter, {
								"$$groupId": "$auto.Heroes"
							});
						oListBinding
							.requestContexts()
							.then(function(oContexts) {
								if (oContexts && oContexts.length) {
									sTarget = oContexts[0].getPath();
								}
								fnBindContextToTargetPage();
							})
							.catch(
								function(oError) {
									// Error handling for erroneous metadata request
									var oRootContainer = oTargetControl.getParent();
									var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

									this.navigateToMessagePage(oResourceBundle.getText("SAPFE_DATA_RECEIVED_ERROR"), {
										title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
										description: oError.message,
										navContainer: oRootContainer
									});
								}.bind(this)
							);
					} else {
						sTarget = oUseContext.getPath();
						fnBindContextToTargetPage();
					}
				} else {
					fnBindContextToTargetPage();
				}
			},

			/**
			 * Return the binding context as a string.
			 *
			 * @name sap.fe.core.controllerextensions.routing#buildBindingContext
			 * @memberof sap.fe.core.controllerextensions.routing
			 * @function
			 * @param {string} [sPattern] string representation of the route pattern
			 * @param {Array} [mParameters] array of parrameter to be replaced in the sPattern
			 * @returns {string} binding context
			 *
			 * @sap-restricted
			 */
			buildBindingContext: function(sPattern, mParameters) {
				if (sPattern.length === 0) {
					return "";
				}
				var sBindingContext = sPattern;
				var iFirstVarIndex = sPattern.indexOf("{");
				if (iFirstVarIndex != -1) {
					var iFirstVarEndIndex = sPattern.indexOf("}");
					var sFirstVarName = sPattern.substr(iFirstVarIndex + 1, iFirstVarEndIndex - iFirstVarIndex - 1);
					sBindingContext = sPattern.substr(0, iFirstVarIndex) + mParameters[sFirstVarName];
					sBindingContext += this.buildBindingContext(sPattern.substr(iFirstVarEndIndex + 1), mParameters);
				}
				return sBindingContext;
			},

			/* TODO: get rid of this once provided by the model
					a refresh on the binding context does not work in case a creation row with a transient context is
					used. also a requestSideEffects with an empty path would fail due to the transient context
					therefore we get all dependent bindings (via private model method) to determine all paths and then
					request them
				 */
			_refreshBindingContext: function(oBindingContext, sMessagesPath) {
				var aNavigationPropertyPaths = [],
					aPropertyPaths = [],
					aSideEffects = [];

				var getBindingPaths = function(oBinding) {
					var aDependentBindings,
						sPath = oBinding.getPath();

					if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
						// if (sPath === "") {
						// now get the dependent bindings
						aDependentBindings = oBinding.getDependentBindings();
						if (aDependentBindings) {
							// ask the dependent bindings (and only those with the specified groupId
							//if (aDependentBindings.length > 0) {
							for (var i = 0; i < aDependentBindings.length; i++) {
								getBindingPaths(aDependentBindings[i]);
							}
						} else {
							if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
								aNavigationPropertyPaths.push(sPath);
							}
						}
					} else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
						if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
							aNavigationPropertyPaths.push(sPath);
						}
					} else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
						if (aPropertyPaths.indexOf(sPath) === -1) {
							aPropertyPaths.push(sPath);
						}
					}
				};

				// binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
				getBindingPaths(oBindingContext.getBinding());

				for (var i = 0; i < aNavigationPropertyPaths.length; i++) {
					aSideEffects.push({
						$NavigationPropertyPath: aNavigationPropertyPaths[i]
					});
				}
				for (var i = 0; i < aPropertyPaths.length; i++) {
					aSideEffects.push({
						$PropertyPath: aPropertyPaths[i]
					});
				}
				if (sMessagesPath) {
					aSideEffects.push({
						$PropertyPath: sMessagesPath
					});
				}
				oBindingContext.requestSideEffects(aSideEffects);
			},

			attachOnAfterNavigation: function(fnHandler) {
				aOnAfterNavigation.push(fnHandler);
			},

			detachOnAfterNavigation: function(fnHandler) {
				for (var i = 0; i < aOnAfterNavigation.length; i++) {
					if (aOnAfterNavigation[i] === fnHandler) {
						aOnAfterNavigation.splice(i, 1);
					}
				}
			},

			fireOnAfterNavigation: function() {
				for (var i = 0; i < aOnAfterNavigation.length; i++) {
					aOnAfterNavigation[i]();
				}
			},

			getOutbounds: function() {
				if (!this.outbounds) {
					// in the future we might allow setting the outbounds from outside
					if (!this.manifest) {
						// in the future we might allow setting the manifest from outside
						// as a fallback we try to get the manifest from the view's owner component

						this.manifest = this._getOwnerComponent()
							.getMetadata()
							.getManifest();
					}
					this.outbounds =
						this.manifest["sap.app"] &&
						this.manifest["sap.app"].crossNavigation &&
						this.manifest["sap.app"].crossNavigation.outbounds;
				}

				return this.outbounds;
			},

			_getOwnerComponent: function() {
				// this.base does not have the getOwnerComponent - as a workaround we get the view and again
				// the controller to access the owner component
				return CommonUtils.getAppComponent(this.oView);
			},
			getRootEntitySet: function(oAppComponent) {
				var oMetaModel = oAppComponent.getModel().getMetaModel();
				return oMetaModel.requestObject("/$EntityContainer/").then(function(oEntityContainer) {
					return Object.keys(oEntityContainer).find(function(sKey) {
						return (
							oMetaModel.getObject("/$EntityContainer/" + sKey + "@com.sap.vocabularies.Common.v1.DraftRoot") ||
							oMetaModel.getObject("/$EntityContainer/" + sKey + "@com.sap.vocabularies.Session.v1.StickySessionSupported")
						);
					});
				});
			},
			_createHash: function(aKeys, sEntitySet, oContextOrStartupParams) {
				var sPath = sEntitySet + "(";
				var sKey, oValue;
				var oET = this._getEntityType();
				if (aKeys.length === 1) {
					sKey = aKeys[0].$PropertyPath || aKeys[0];
					oValue =
						oContextOrStartupParams.isA && oContextOrStartupParams.isA("sap.ui.model.odata.v4.Context")
							? oContextOrStartupParams.getObject(sKey)
							: oContextOrStartupParams[sKey][0];
					if (oValue !== undefined) {
						sPath = oET[sKey].$Type === "Edm.String" ? sPath + "'" + oValue + "'" : sPath + oValue;
					} else {
						sPath = undefined;
					}
				} else {
					for (var i = 0; i < aKeys.length; i++) {
						sKey = aKeys[i].$PropertyPath || aKeys[i];
						oValue = oContextOrStartupParams.getObject
							? oContextOrStartupParams.getObject(sKey)
							: oContextOrStartupParams[sKey][0];
						if (oValue) {
							sPath = oET[sKey].$Type === "Edm.String" ? sPath + sKey + "='" + oValue + "'" : sPath + sKey + "=" + oValue;
							if (i !== aKeys.length - 1) {
								sPath = sPath + ",";
							}
						} else {
							sPath = undefined;
							break;
						}
					}
				}
				if (sPath) {
					sPath = sPath + ")";
					return sPath;
				}
				return undefined;
			},
			_getEntityType: function() {
				return oEntityType || null;
			}
		});
		// TODO: get rid of this dirty logic once model supports synchronization
		// as long as it doesn't we park the dirty state into one singleton
		Extension.flagUIState = enumUIState.CLEAN;

		return Extension;
	}
);
