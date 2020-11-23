/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(
	["sap/ui/core/UIComponent", "sap/fe/core/CommonUtils", "sap/base/Log"],
	function(UIComponent, CommonUtils, Log) {
		"use strict";

		var TemplateComponent = UIComponent.extend("sap.fe.core.TemplateComponent", {
			metadata: {
				properties: {
					/**
					 * OData EntitySet name
					 */
					entitySet: {
						type: "string",
						defaultValue: null
					},
					/**
					 * The pattern for the binding context to be create based on the parameters from the navigation
					 * If not provided we'll default to what was passed in the URL
					 */
					bindingContextPattern: {
						type: "string"
					},

					/**
					 * Map of used OData navigations and its routing targets
					 */
					navigation: {
						type: "object"
					},
					/**
					 * Enhance the i18n bundle used for this page with one or more app specific i18n property files
					 */
					enhanceI18n: {
						type: "string[]"
					},
					/**
					 * Define control related configuration settings
					 */
					controlConfiguration: {
						type: "object"
					},
					/**
					 * Adjusts the template content
					 */
					content: {
						type: "object"
					},
					/**
					 * Whether or not you can reach this page directly through semantic bookmarks
					 */
					allowDeepLinking: {
						type: "boolean"
					}
				},
				events: {
					"pageReady": {
						/**
						 * ManagedObject instance which is ready
						 */
						element: { type: "sap.ui.base.ManagedObject" }
					}
				},
				library: "sap.fe.core"
			},

			setContainer: function(oContainer) {
				UIComponent.prototype.setContainer.apply(this, arguments);
				// We override the default setContainer method in order ot be aware when the component is being displayed
				if (oContainer) {
					var that = this;
					oContainer.addEventDelegate({
						onBeforeShow: function() {
							that.bShown = false;
							that.bIsBackNav = false;
							that._bIsPageReady = false;
						},
						onBeforeHide: function() {
							that.bShown = false;
							that.bIsBackNav = false;
							that._bIsPageReady = false;
						},
						onAfterShow: function(oEvent) {
							that.bShown = true;
							that.bIsBackNav = oEvent.isBack || oEvent.isBackToPage;
							that._checkPageReady(true);
						}
					});
				}
			},

			/**
			 * This method will check whether or not the page is ready, this is composed of multiple points.
			 * - Displayed in a container
			 * - Rendered
			 * - Has all the data it requested.
			 *
			 * @param bFromNav {boolean} whether or not this has been triggered from the navigation rather than bindings
			 */
			_checkPageReady: function(bFromNav) {
				var that = this;

				var fnUIUpdated = function() {
					// Wait until the UI is no longer dirty
					if (!sap.ui.getCore().getUIDirty()) {
						sap.ui.getCore().detachEvent("UIUpdated", fnUIUpdated);
						that._bWaitingForRefresh = false;
						setTimeout(function() {
							that._checkPageReady();
						}, 20);
					}
				};

				if (this.bShown && this.bDataReceived !== false && this.bTablesLoaded !== false) {
					if (this.bDataReceived === true && !bFromNav && !this._bWaitingForRefresh && sap.ui.getCore().getUIDirty()) {
						// If we requested data we get notified as soon as the data arrived, so before the next rendering tick
						this.bDataReceived = undefined;
						this._bWaitingForRefresh = true;
						sap.ui.getCore().attachEvent("UIUpdated", fnUIUpdated);
					} else if (!this._bWaitingForRefresh && sap.ui.getCore().getUIDirty()) {
						this._bWaitingForRefresh = true;
						sap.ui.getCore().attachEvent("UIUpdated", fnUIUpdated);
					} else if (!this._bWaitingForRefresh) {
						// In the case we're not waiting for any data (navigating back to a page we already have loaded)
						// just wait for a frame to fire the event.
						that.firePageReady();
					}
				}
			},

			init: function() {
				this.oAppComponent = CommonUtils.getAppComponent(this);
				UIComponent.prototype.init.apply(this, arguments);
			},

			onServicesStarted: function() {
				var that = this;

				this.attachPageReady(function() {
					that._bIsPageReady = true;
				});
				var oTemplatedViewService = this.getTemplatedViewService();
				var oView = oTemplatedViewService.getView();
				var aBoundElements = [];
				var iRequested = 0;
				var iReceived = 0;
				var fnRequested = function(oEvent) {
					oEvent.getSource().detachDataRequested(fnRequested);
					iRequested++;
					that.bDataReceived = false;
				};
				var fnReceived = function(oEvent) {
					oEvent.getSource().detachDataReceived(fnReceived);
					iReceived++;
					if (iReceived === iRequested && iRequested !== 0) {
						iRequested = 0;
						iReceived = 0;
						that.bDataReceived = true;
						that._checkPageReady(false);
					}
				};

				oView.getParent().attachModelContextChange(function(oEvent) {
					that._bIsPageReady = false;
					aBoundElements.forEach(function(oElement) {
						oElement.detachDataRequested(fnRequested);
						oElement.detachDataReceived(fnReceived);
					});
					aBoundElements = [];
					oEvent.getSource().findAggregatedObjects(true, function(oElement) {
						var oObjectBinding = oElement.getObjectBinding();
						if (oObjectBinding) {
							// Register on all object binding (mostly used on object pages)
							oObjectBinding.attachDataRequested(fnRequested);
							oObjectBinding.attachDataReceived(fnReceived);
							aBoundElements.push(oObjectBinding);
						} else {
							var aBindingKeys = Object.keys(oElement.mBindingInfos);
							if (aBindingKeys.length > 0) {
								aBindingKeys.forEach(function(sPropertyName) {
									var oListBinding = oElement.mBindingInfos[sPropertyName].binding;
									// Register on all list binding, good for basic tables, problematic for MDC, see above
									if (oListBinding && oListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
										oListBinding.attachDataRequested(fnRequested);
										oListBinding.attachDataReceived(fnReceived);
										aBoundElements.push(oListBinding);
									}
								});
							}
						}
						// This is dirty but MDC Table has a weird loading lifecycle
						if (oElement.isA("sap.ui.mdc.Table")) {
							that.bTablesLoaded = false;
							// access binding only after table is bound
							oElement
								.initialized()
								.then(function() {
									var oRowBinding = oElement.getRowBinding();
									if (oRowBinding) {
										oRowBinding.attachDataRequested(fnRequested);
										oRowBinding.attachDataReceived(fnReceived);
										aBoundElements.push(oRowBinding);
									}
									setTimeout(function() {
										that.bTablesLoaded = true;
										that._checkPageReady(false);
									}, 0);
								})
								.catch(function(oError) {
									Log.error("Cannot find a bound table", oError);
								});
						}
					});
					setTimeout(function() {
						that._checkPageReady(false);
					}, 0);
				});
				that._checkPageReady(false);
			},

			// This event is triggered always before a binding is going to be set
			onBeforeBinding: function(oContext, mParameters) {
				return true;
			},

			// This event is triggered always after a binding was set
			onAfterBinding: function(oContext) {
				return true;
			},

			isPageReady: function() {
				return this._bIsPageReady;
			},

			onPageReady: function(oLastFocusedControl) {
				if (this.getRootControl() && this.getRootControl().getController() && this.getRootControl().getController().onPageReady) {
					this.getRootControl()
						.getController()
						.onPageReady(oLastFocusedControl);
				}
			},

			getNavigationConfiguration: function(sTargetPath) {
				var mNavigation = this.getNavigation();
				return mNavigation[sTargetPath];
			},

			getViewData: function() {
				var mProperties = this.getMetadata().getAllProperties();
				var oViewData = Object.keys(mProperties).reduce(
					function(mViewData, sPropertyName) {
						mViewData[sPropertyName] = mProperties[sPropertyName].get(this);
						return mViewData;
					}.bind(this),
					{}
				);

				// Access the internal _isFclEnabled which will be there
				oViewData.fclEnabled = this.oAppComponent._isFclEnabled();

				return oViewData;
			},

			_getPageTitleInformation: function() {
				if (
					this.getRootControl() &&
					this.getRootControl().getController() &&
					this.getRootControl().getController()._getPageTitleInformation
				) {
					return this.getRootControl()
						.getController()
						._getPageTitleInformation();
				}
			},

			getExtensionAPI: function() {
				return this.getRootControl()
					.getController()
					.getExtensionAPI();
			}
		});
		return TemplateComponent;
	},
	/* bExport= */ true
);
