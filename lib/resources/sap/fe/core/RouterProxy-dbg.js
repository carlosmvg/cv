/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
/* eslint-disable no-alert */
sap.ui.define(
	["sap/base/Log", "sap/ui/base/Object", "sap/ui/base/EventProvider", "sap/fe/core/Synchronization", "sap/ui/thirdparty/URI"],
	function(Log, BaseObject, EventProvider, Synchronization, URI) {
	"use strict";

	var enumState = {
		EQUAL: 0,
		COMPATIBLE: 1,
		ANCESTOR: 2,
		DIFFERENT: 3
	};

	var enumURLParams = {
		LAYOUTPARAM: "layout",
		IAPPSTATEPARAM: "sap-iapp-state"
	};

	/**
	 * Creates a HashGuard object.
	 *
	 * @param {string} sGuardHash the hash used for the guard
	 * @returns {object} the created hash guard
	 */
	function createGuardFromHash(sGuardHash) {
		return {
			_guardHash: sGuardHash.replace(/\?[^\?]*$/, ""), // Remove query part
			check: function(sHash) {
				return sHash.indexOf(this._guardHash) === 0;
			}
		};
	}

	return BaseObject.extend("sap.fe.core.RouterProxy", {
		bIsRebuildHistoryRunning: false,
		bIsComputingTitleHierachy: false,
		bIsGuardCrossAllowed: false,
		sIAppStateKey: null,

		init: function(oAppComponent, isfclEnabled) {
			// Save the name of the app (including startup parameters) for rebuilding full hashes later
			oAppComponent
				.getService("shellServices")
				.then(
					function() {
						this._oShellServices = oAppComponent.getShellServices();

						this.initRaw(oAppComponent.getRouter());
						// We want to wait until the initial routeMatched is done before doing any navigation
						this.waitForRouteMatchBeforeNavigation();

						// Set feLevel=0 for the first Application page in the history
						history.replaceState(
							Object.assign(
								{
									feLevel: 0
								},
								history.state
							),
							"",
							window.location
						);
						this.fclEnabled = isfclEnabled;

						this._fnBlockingNavFilter = this._blockingNavigationFilter.bind(this);
						this._oShellServices.registerNavigationFilter(this._fnBlockingNavFilter);
					}.bind(this)
				)
				.catch(function(oError) {
					Log.error("Cannot retrieve the shell services", oError);
				});
			this._fnHashGuard = this.hashGuard.bind(this);
			window.addEventListener("popstate", this._fnHashGuard);
			this._bDisableOnHashChange = false;
			this._bIgnoreRestore = false;
			this._bCleanedRestore = false;
		},

		exit: function() {
			if (this._oShellServices) {
				this._oShellServices.unregisterNavigationFilter(this._fnBlockingNavFilter);
			}
			window.removeEventListener("popstate", this._fnHashGuard);
		},

		/**
		 * Raw initialization (for unit tests).
		 *
		 * @param {sap.ui.core.routing.Router} oRouter the router used by this proxy
		 */
		initRaw: function(oRouter) {
			this._oRouter = oRouter;
			this._oManagedHistory = [];
			this._oNavigationGuard = null;

			var sCurrentAppHash = this.getHash();
			this._oManagedHistory.push(this._extractStateFromHash(sCurrentAppHash));

			// Set the iAppState if the initial hash contains one
			this.sIAppStateKey = this._findAppStateInHash(sCurrentAppHash);
		},

		getHash: function() {
			return this._oRouter.getHashChanger().getHash();
		},

		/**
		 * Navigates to a specific hash.
		 *
		 * @function
		 * @name sap.fe.core.RouterProxy#navToHash
		 * @memberof sap.fe.core.RouterProxy
		 * @static
		 * @param {string} sHash to be navigated to
		 * @param {boolean} bPreserveHistory If set to true, non-ancestor entries in history will be retained
		 * @param {boolean} bDisablePreservationCache If set to true, cache preservation mechanism is disabled for the current navigation
		 * @returns {Promise} promise that is resolved when the navigation is finalized
		 * @sap-restricted
		 */
		navToHash: function(sHash, bPreserveHistory, bDisablePreservationCache)  {
			var that = this;

			if (this._oRouteMatchSynchronization) {
				return this._oRouteMatchSynchronization.waitFor().then(function() {
					that._oRouteMatchSynchronization = null;
					return that._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache);
				});
			} else {
				if (this._bActivateRouteMatchSynchro) {
					this.waitForRouteMatchBeforeNavigation();
				}
				return that._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache);
			}
		},

		_internalNavToHash: function(sHash, bPreserveHistory, bDisablePreservationCache) {
			var that = this,
				sLastFocusControlId = sap.ui.getCore().getCurrentFocusedControlId(),
				sLastFocusInfo =
					sLastFocusControlId && sap.ui.getCore().byId(sLastFocusControlId)
						? sap.ui
								.getCore()
								.byId(sLastFocusControlId)
								.getFocusInfo()
						: null,
				shashBeforeRoutechanged = this.getHash();

			// Add the app state in the hash if needed
			if (this.fclEnabled && this.sIAppStateKey && !this._findAppStateInHash(sHash)) {
				sHash = this._setAppStateInHash(sHash, this.sIAppStateKey);
			}
			var oNewState = this._extractStateFromHash(sHash);
			if (this._oManagedHistory.length > 0) {
				oNewState.history = this._oManagedHistory[this._oManagedHistory.length - 1].history.concat();
				oNewState.history.push(this._oManagedHistory[this._oManagedHistory.length - 1].hash);
			}

			if (!this.checkHashWithGuard(sHash)) {
				if (!this.oResourceBundle) {
					this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
				}

				// We have to use a confirm here for UI consistency reasons, as with some scenarios
				// in the EditFlow we rely on a UI5 mechanism that displays a confirm dialog.
				if (!confirm(this.oResourceBundle.getText("C_ROUTER_PROXY_SAPFE_EXIT_NOTSAVED_MESSAGE"))) {
					// The user clicked on Cancel --> cancel navigation
					return Promise.resolve();
				}
				this.bIsGuardCrossAllowed = true;
			}
			var oHistoryAction = this._pushNewState(oNewState, false, bPreserveHistory, bDisablePreservationCache);

			return this._rebuildBrowserHistory(oHistoryAction, false).then(function() {
				that._storeFocusForHash(sLastFocusControlId, sLastFocusInfo, shashBeforeRoutechanged);
			});
		},

		/**
		 * Cleans browser history if entries have been added without using the RouterProxy.
		 * Updates the internal history accordingly.
		 *
		 * @returns {Promise} promise that is resolved once the history is rebuilt
		 */
		restoreHistory: function() {
			if (this._bApplyRestore) {
				this._bApplyRestore = false;
				var sTargetHash = this.getHash();
				sTargetHash = sTargetHash.replace(/(\?|&)restoreHistory=true/, "");
				var oNewState = this._extractStateFromHash(sTargetHash);

				var oHistoryAction = this._pushNewState(oNewState, true, false, true);

				return this._rebuildBrowserHistory(oHistoryAction, true);
			} else {
				return Promise.resolve();
			}
		},

		getFocusControlForCurrentHash: function() {
			var sCurrenthash = this.getHash();
			var oLastFocusedControl;
			for (var i = this._oManagedHistory.length - 1; i >= 0; i--) {
				if (sCurrenthash === this._oManagedHistory[i].hash) {
					oLastFocusedControl = this._oManagedHistory[i].oLastFocusControl;
					break;
				} else {
					this._oManagedHistory[i].oLastFocusControl = undefined;
				}
			}

			return oLastFocusedControl;
		},

		_storeFocusForHash: function(sLastFocusControlId, sLastFocusInfo, shashBeforeRoutechanged) {
			var oManagedhistory = this._oManagedHistory;
			for (var i = 0; i < oManagedhistory.length; i++) {
				if (shashBeforeRoutechanged === oManagedhistory[i].hash) {
					oManagedhistory[i].oLastFocusControl = {
						controlId: sLastFocusControlId,
						focusInfo: sLastFocusInfo
					};
					break;
				}
			}
		},

		/**
		 * Navigates back in the history.
		 *
		 * @returns {Promise} promise that is resolved when the navigation is finalized
		 */
		navBack: function() {
			var sCurrentHash = this.getHash(),
				sPreviousHash;

			// Look for the current hash in the managed history
			for (var i = this._oManagedHistory.length - 1; i > 0; i--) {
				if (this._oManagedHistory[i].hash === sCurrentHash) {
					sPreviousHash = this._oManagedHistory[i - 1].hash;
					break;
				}
			}

			if (sPreviousHash) {
				return this.navToHash(sPreviousHash);
			} else {
				// We couldn't find a previous hash in history
				// This can happen when navigating from a transient hash in a create app, and
				// in that case history.back would go back to the FLP
				window.history.back();
				return Promise.resolve();
			}
		},

		/**
		 * Navigates to a route with parameters.
		 *
		 * @param {string} sRouteName to be navigated to
		 * @param {object} oParameters parameters for the navigation
		 * @returns {Promise} promise that is resolved when the navigation is finalized
		 * @sap-restricted
		 */
		navTo: function(sRouteName, oParameters) {
			var sHash = this._oRouter.getURL(sRouteName, oParameters);
			return this.navToHash(sHash, false, oParameters.noPreservationCache);
		},

		/**
		 * Exits from the current app by navigating back
		 * to the previous app (if any) or the FLP.
		 *
		 * @returns {Promise} promise that's resolved when we've exited from the app
		 */
		exitFromApp: function() {
			return this._oShellServices.backToPreviousApp();
		},

		/**
		 * Checks whether a given hash can have an impact on the current state
		 * i.e. if the hash is equal, compatible or an ancestor of the current state.
		 *
		 * @param {*} sHash true if there's an impact
		 * @returns {boolean} if there is an impact
		 */
		isCurrentStateImpactedBy: function(sHash) {
			if (sHash[0] === "/") {
				sHash = sHash.substring(1);
			}
			var oLocalGuard = createGuardFromHash(sHash);
			return oLocalGuard.check(this.getHash());
		},

		/**
		 * Checks if a navigation is currently being processed.
		 *
		 * @returns {boolean} false if a navigation has been triggered in the RouterProxy and is not yet finalized
		 */
		isNavigationFinalized: function() {
			return !this.bIsRebuildHistoryRunning && !this._bDelayedRebuild;
		},

		/**
		 * Sets the last state as a guard.
		 * Each future navigation will be checked against this guard, and a confirmation dialog will
		 * be displayed before the navigation crosses the guard (i.e. goes to an ancestor of the guard).
		 */
		setNavigationGuard: function() {
			this._oNavigationGuard = createGuardFromHash(this.getHash());
			this.bIsGuardCrossAllowed = false;
		},

		/**
		 * Disables the navigation guard.
		 */
		discardNavigationGuard: function() {
			this._oNavigationGuard = null;
		},

		/**
		 * Checks for the availability of the navigation guard.
		 *
		 * @returns {boolean} true if navigating guard is available
		 */
		hasNavigationGuard: function() {
			return this._oNavigationGuard !== null;
		},

		/**
		 * Tests a hash against the navigation guard.
		 *
		 * @param {string} sHash : the hash to be tested
		 * @returns {boolean} true if navigating to the hash doesn't cross the guard
		 */
		checkHashWithGuard: function(sHash) {
			return this._oNavigationGuard === null || this._oNavigationGuard.check(sHash);
		},

		/**
		 * Checks if the user allowed the navigation guard to be crossed.
		 *
		 * @returns {boolean} true if crossing the guard has been allowed by the user
		 */
		isGuardCrossAllowedByUser: function() {
			return this.bIsGuardCrossAllowed;
		},

		/**
		 * Activates the synchronization for routeMatchedEvent.
		 * The next NavToHash call will create a Synchronization object that will be resolved
		 * by the corresponding onRouteMatched event, preventing another NavToHash to happen in parallel.
		 */
		activateRouteMatchSynchronization: function() {
			this._bActivateRouteMatchSynchro = true;
		},

		/**
		 * Resolve the routeMatch synchronization object, unlocking potential pending NavToHash calls.
		 */
		resolveRouteMatch: function() {
			if (this._oRouteMatchSynchronization) {
				this._oRouteMatchSynchronization.resolve();
			}
		},

		/**
		 * Makes sure no navigation can happen before a routeMatch happened.
		 */
		waitForRouteMatchBeforeNavigation: function() {
			this._oRouteMatchSynchronization = new Synchronization();
			this._bActivateRouteMatchSynchro = false;
		},

		/**
		 * Builds a state from a hash.
		 *
		 * @param {string} sHash the hash to be used as entry
		 * @returns {object} the state
		 *
		 * @sap-restricted
		 */
		_extractStateFromHash: function(sHash) {
			var oState = {
				keys: []
			};

			// Retrieve object keys
			if (sHash === undefined) {
				sHash = "";
			}
			var sHashNoParams = sHash.split("?")[0];
			var sTokens = sHashNoParams.split("/");
			sTokens.forEach(function(sToken) {
				var regexKey = /[^\(\)]+\([^\(\)]+\)/; // abc(def)
				if (regexKey.test(sToken)) {
					oState.keys.push(sToken.split("(")[0]);
				}
			});

			// Retrieve layout (if any)
			var aLayout = sHash.match(new RegExp("\\?.*" + enumURLParams.LAYOUTPARAM + "=([^&]*)"));
			oState.sLayout = aLayout && aLayout.length > 1 ? aLayout[1] : null;
			if (oState.sLayout === "MidColumnFullScreen") {
				oState.screenMode = 1;
			} else if (oState.sLayout === "EndColumnFullScreen") {
				oState.screenMode = 2;
			} else {
				oState.screenMode = 0;
			}

			oState.hash = sHash;
			oState.history = [];
			return oState;
		},

		/**
		 * Adds a new state into the internal history structure.
		 * Makes sure this new state is added after an ancestor.
		 * Also sets the iAppState key in the whole history.
		 *
		 * @memberof sap.fe.core.RouterProxy
		 * @param {object} oNewState the new state to be added
		 * @param {boolean} bRebuildOnly true if we're rebuilding the history after a shell menu navigation
		 * @param {boolean} bPreserveHistory If set to true, non-ancestor entries in history will be retained
		 * @param {boolean} bDisableHistoryPreservation Disable the mechanism to retained marked entries in cache
		 * @param {boolean} bBackNavigation true if the function is triggered by a Back Navigation
		 * @returns {object} the new state
		 * @sap-restricted
		 * @final
		 */
		_pushNewState: function(oNewState, bRebuildOnly, bPreserveHistory, bDisableHistoryPreservation, bBackNavigation) {
			var sCurrentHash = this.getHash(),
				lastIndex = this._oManagedHistory.length - 1,
				iPopCount = bRebuildOnly ? 1 : 0,
				that = this;

			var iUpperLimitPreservedEntries = -1;
			if (!bDisableHistoryPreservation) {
				if (bPreserveHistory === true) {
					this._oManagedHistory[this._oManagedHistory.length - 1].preserved = true;
				}
				for (
					iUpperLimitPreservedEntries = bBackNavigation ? this._oManagedHistory.length - 2 : this._oManagedHistory.length - 1;
					iUpperLimitPreservedEntries >= 0;
					iUpperLimitPreservedEntries--
				) {
					if (
						this._oManagedHistory.length > iUpperLimitPreservedEntries &&
						this._oManagedHistory[iUpperLimitPreservedEntries].preserved === true
					) {
						break;
					}
				}
			}

			// In case the user has navigated back in the browser history, we need to remove
			// the states ahead in history and make sure the top state corresponds to the current page
			// We don't do that when restoring the history, as the current state has been added on top of the browser history
			// and is not reflected in the managed history
			if (!bRebuildOnly) {
				while (lastIndex >= 0 && this._oManagedHistory[lastIndex].hash !== sCurrentHash) {
					this._oManagedHistory.pop();
					lastIndex--;
				}
			}

			if (this._oManagedHistory.length === 0) {
				// We couldn't find the current location in the history. This can happen if a browser reload
				// happened, causing a reinitialization of the managed history.
				// In that case, we use the current location as the new starting point in the managed history
				this._oManagedHistory.push(this._extractStateFromHash(sCurrentHash));

				if (!bRebuildOnly) {
					history.replaceState(Object.assign({ feLevel: 0 }, history.state), "");
				}
			}

			// Then we remove all states that are not ancestors of the new state
			var oLastFocusControl;
			var oLastRemovedItem;
			while (
				this._oManagedHistory.length - 1 > iUpperLimitPreservedEntries &&
				this._oManagedHistory.length > 0 &&
				this._compareCacheStates(this._oManagedHistory[this._oManagedHistory.length - 1], oNewState) !== enumState.ANCESTOR
			) {
				oLastFocusControl = this._oManagedHistory[this._oManagedHistory.length - 1].oLastFocusControl;
				oLastRemovedItem = this._oManagedHistory.pop();
				iPopCount++;
			}

			//if we try to add a state that is already in cache (due to preserved flag) but with a different iapp-state
			// then we should delete the previous entrie
			if (
				this._oManagedHistory.length > 0 &&
				this._oManagedHistory[this._oManagedHistory.length - 1].preserved === true &&
				this._RemoveAppStateInHash(this._oManagedHistory[this._oManagedHistory.length - 1].hash) ===
					this._RemoveAppStateInHash(oNewState.hash)
			) {
				oLastFocusControl = this._oManagedHistory[this._oManagedHistory.length - 1].oLastFocusControl;
				oLastRemovedItem = this._oManagedHistory.pop();
				iPopCount++;
				oNewState.preserved = true;
			}

			// Retrieve iAppState (if any)
			this.sIAppStateKey = this._findAppStateInHash(oNewState.hash);
			if (this.fclEnabled && this.sIAppStateKey) {
				// We have a new app state --> replace in the whole history
				this._oManagedHistory.forEach(function(oManagedState) {
					oManagedState.hash = that._setAppStateInHash(oManagedState.hash, that.sIAppStateKey);
				});
			} else if (!this.fclEnabled && oLastRemovedItem) {
				var sPreviousIAppStateKey = this._findAppStateInHash(oLastRemovedItem.hash);
				var oComparisonStateResult = this._compareCacheStates(oLastRemovedItem, oNewState);
				// if current state doesn't contain a i-appstate and this state should replace a state containing a i-appstate
				// then the previous i-appstate is preserved
				if (
					!this.sIAppStateKey &&
					sPreviousIAppStateKey &&
					(oComparisonStateResult === enumState.EQUAL || oComparisonStateResult === enumState.COMPATIBLE)
				) {
					oNewState.hash = that._setAppStateInHash(oNewState.hash, sPreviousIAppStateKey);
				}
			}

			// Now we can push the state at the top of the internal history
			oNewState.oLastFocusControl = oLastFocusControl;
			var bHasSameHash = false;
			if (oLastRemovedItem) {
				oNewState.lastRemovedItem = oLastRemovedItem;
				bHasSameHash = oNewState.hash === oLastRemovedItem.hash;
			}

			if (this._oManagedHistory.length === 0 || this._oManagedHistory[this._oManagedHistory.length - 1].hash !== oNewState.hash) {
				this._oManagedHistory.push(oNewState);
			}

			// Determine which actions to do on the history
			if (iPopCount === 0) {
				// No state was popped --> append
				return { type: "append" };
			} else if (iPopCount === 1) {
				// Only 1 state was popped --> replace current hash unless hash is the same (then nothing to do)
				return bHasSameHash ? { type: "none" } : { type: "replace" };
			} else {
				// More than 1 state was popped --> go bakc in history and replace hash if necessary
				return bHasSameHash ? { type: "back", steps: iPopCount - 1 } : { type: "back-replace", steps: iPopCount - 1 };
			}
		},

		_findAppStateInHash: function(sHash) {
			var aAppState = sHash.match(new RegExp("\\?.*" + enumURLParams.IAPPSTATEPARAM + "=([^&]*)"));
			return aAppState && aAppState.length > 1 ? aAppState[1] : null;
		},

		_RemoveAppStateInHash: function(sHash) {
			return sHash.replace(new RegExp("[&?]*" + enumURLParams.IAPPSTATEPARAM + "=[^&]*"), "");
		},

		_setAppStateInHash: function(sHash, sAppStateKey) {
			var sNewHash;

			if (sHash.indexOf(enumURLParams.IAPPSTATEPARAM) >= 0) {
				// If there's already an iAppState parameter in the hash, replace it
				sNewHash = sHash.replace(
					new RegExp(enumURLParams.IAPPSTATEPARAM + "=[^&]*"),
					enumURLParams.IAPPSTATEPARAM + "=" + sAppStateKey
				);
			} else {
				// Add the iAppState parameter in the hash
				if (sHash.indexOf("?") < 0) {
					sNewHash = sHash + "?";
				} else {
					sNewHash = sHash + "&";
				}
				sNewHash += enumURLParams.IAPPSTATEPARAM + "=" + sAppStateKey;
			}

			return sNewHash;
		},

		_blockingNavigationFilter: function() {
			return this._bDisableOnHashChange ? "Custom" : "Continue";
		},

		/**
		 * Disable the routing by calling the router stop method.
		 *
		 * @function
		 * @memberof sap.fe.core.RouterProxy
		 *
		 * @sap-restricted
		 * @final
		 */
		_disableEventOnHashChange: function() {
			this._bDisableOnHashChange = true;
			this._oRouter.stop();
		},

		/**
		 * Enable the routing by calling the router initialize method.
		 *
		 * @function
		 * @name sap.fe.core.RouterProxy#_enableEventOnHashChange
		 * @memberof sap.fe.core.RouterProxy
		 * @param {Array} [bIgnoreCurrentHash] ignore the last hash event triggered before the router has initialized
		 *
		 * @sap-restricted
		 * @final
		 */
		_enableEventOnHashChange: function(bIgnoreCurrentHash) {
			this._bDisableOnHashChange = false;
			this._oRouter.initialize(bIgnoreCurrentHash);
		},

		/**
		 * Rebuilds the browser history from the app root page.
		 *
		 * @memberof sap.fe.core.RouterProxy
		 * @param {object} oHistoryAction specifies the navigation action to be performed
		 * @param {boolean} bRebuildOnly true if rebuilding history
		 * @returns {Promise} a promise that is resolved when the navigation is finalized
		 * @sap-restricted
		 * @final
		 */
		_rebuildBrowserHistory: function(oHistoryAction, bRebuildOnly) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.bIsRebuildHistoryRunning = true;
				var oTargetState = that._oManagedHistory[that._oManagedHistory.length - 1],
					oState = history.state || {};

				oState.feLevel = that._oManagedHistory.length - 1;
				function replaceAsync() {
					if (!bRebuildOnly) {
						that._enableEventOnHashChange(true);
					}

					that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
					history.replaceState(oState, "");

					if (bRebuildOnly) {
						setTimeout(function() {
							// Timeout to let 'hashchange' event be processed before by the HashChanger, so that
							// onRouteMatched notification isn't raised
							that._enableEventOnHashChange(true);
						}, 0);
					}

					that.bIsRebuildHistoryRunning = false;
					resolve();
				}

				// Async callbacks when navigating back, in order to let all notifications and events get processed
				function backReplaceAsync() {
					window.removeEventListener("popstate", backReplaceAsync);
					setTimeout(function() {
						// Timeout to let 'hashchange' event be processed before by the HashChanger
						replaceAsync();
					}, 0);
				}

				function backAsync() {
					window.removeEventListener("popstate", backAsync);
					that.bIsRebuildHistoryRunning = false;
					resolve();
				}

				that._bIgnoreRestore = true;

				switch (oHistoryAction.type) {
					case "replace":
						that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
						history.replaceState(oState, "");
						that.bIsRebuildHistoryRunning = false;
						resolve();
						break;

					case "append":
						that._oRouter.getHashChanger().setHash(oTargetState.hash);
						history.replaceState(oState, "");
						that.bIsRebuildHistoryRunning = false;
						resolve();
						break;

					case "back":
						window.addEventListener("popstate", backAsync);
						history.go(-oHistoryAction.steps);
						break;

					case "back-replace":
						that._disableEventOnHashChange();
						window.addEventListener("popstate", backReplaceAsync);
						history.go(-oHistoryAction.steps);
						break;

					default:
						// No navigation
						that.bIsRebuildHistoryRunning = false;
						resolve();
				}
			});
		},

		hashGuard: function(oEvent) {
			if (this._bCleanedRestore) {
				this._bCleanedRestore = false;
				return;
			}
			var sHash = window.location.hash;
			if (sHash.indexOf("restoreHistory=true") !== -1) {
				this._bApplyRestore = true;
			} else if (!this.bIsRebuildHistoryRunning) {
				var aHashSplit = sHash.split("&/");
				var sAppHash = aHashSplit[1] ? aHashSplit[1] : "";
				if (this.checkHashWithGuard(sAppHash)) {
					this._bDelayedRebuild = true;
					var oNewState = this._extractStateFromHash(sAppHash);
					this._pushNewState(oNewState, false, false, false, true);

					var that = this;
					setTimeout(function() {
						that._bDelayedRebuild = false;
					}, 0);
				}
			}
		},

		/**
		 * Compares 2 states.
		 *
		 * @param {object} oState1
		 * @param {object} oState2
		 * @returns {number} The result of the comparison:
		 *        - enumState.EQUAL if oState1 and oState2 are equal
		 *        - enumState.COMPATIBLE if oState1 and oState2 are compatible
		 *        - enumState.ANCESTOR if oState1 is an ancestor of oState2
		 *        - enumState.DIFFERENT if the 2 states are different
		 */

		_compareCacheStates: function(oState1, oState2) {
			// First compare object keys
			if (oState1.keys.length > oState2.keys.length) {
				return enumState.DIFFERENT;
			}
			var equal = true;
			var index;
			for (index = 0; equal && index < oState1.keys.length; index++) {
				if (oState1.keys[index] !== oState2.keys[index]) {
					equal = false;
				}
			}
			if (!equal) {
				// Some objects keys are different
				return enumState.DIFFERENT;
			}

			// All keys from oState1 are in oState2 --> check if ancestor
			if (oState1.keys.length < oState2.keys.length || oState1.screenMode < oState2.screenMode) {
				return enumState.ANCESTOR;
			}
			if (oState1.screenMode > oState2.screenMode) {
				return enumState.DIFFERENT; // Not sure this case can happen...
			}

			// At this stage, the 2 states have the same object keys (in the same order) and same screenmode
			// They can be either compatible or equal
			return oState1.sLayout === oState2.sLayout ? enumState.EQUAL : enumState.COMPATIBLE;
		},

		/**
		 * Checks if back exits the present guard set.
		 *
		 * @param {string} sPresentHash the current hash. Only used for unit tests.
		 * @returns {boolean} true if back exits there is a guard exit on back
		 */
		checkIfBackIsOutOfGuard: function(sPresentHash) {
			var that = this,
				sPrevHash;

			if (sPresentHash === undefined) {
				// We use window.location.hash instead of HashChanger.getInstance().getHash() because the latter
				// replaces characters in the URL (e.g. %24 replaced by $) and it causes issues when comparing
				// with the URLs in the managed history
				var oSplitHash = this._oShellServices.splitHash(window.location.hash);
				if (oSplitHash && oSplitHash.appSpecificRoute) {
					sPresentHash = oSplitHash.appSpecificRoute;
					if (sPresentHash.indexOf("&/") === 0) {
						sPresentHash = sPresentHash.substring(2);
					}
				} else {
					sPresentHash = window.location.hash.substring(1); // To remove the '#'
					if (sPresentHash[0] === "/") {
						sPresentHash = sPresentHash.substring(1);
					}
				}
			}
			sPresentHash = URI.decode(sPresentHash);
			if (that._oNavigationGuard) {
				for (var i = that._oManagedHistory.length - 1; i > 0; i--) {
					if (that._oManagedHistory[i].hash === sPresentHash) {
						sPrevHash = that._oManagedHistory[i - 1].hash;
						break;
					}
				}

				return !sPrevHash || !that.checkHashWithGuard(sPrevHash);
			}
			return false;
		}
	});
});
