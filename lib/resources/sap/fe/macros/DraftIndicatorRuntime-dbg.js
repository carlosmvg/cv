/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */

// ---------------------------------------------------------------------------------------
// Static class used by DraftIndicator used during runtime
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(
	[
		"sap/ui/core/XMLTemplateProcessor",
		"sap/ui/core/util/XMLPreprocessor",
		"sap/ui/core/Fragment",
		"sap/fe/macros/ResourceModel",
		"sap/base/Log",
		"sap/ui/model/json/JSONModel",
		"sap/fe/macros/library"
	],
	function(XMLTemplateProcessor, XMLPreprocessor, Fragment, ResourceModel, Log, JSONModel, library) {
		"use strict";
		var DraftIndicatorState = library.DraftIndicatorState;
		function _getParentViewOfControl(oControl) {
			while (oControl && !(oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView")) {
				oControl = oControl.getParent();
			}
			return oControl;
		}
		var DraftIndicatorHelper = {
			/**
			 *
			 * @function to be executed on click of the close button of the draft admin data popover
			 * @name closeDraftAdminPopover
			 * @param {object} oEvent Event instance
			 */
			closeDraftAdminPopover: function(oEvent) {
				// for now go up two levels to get the popover instance
				oEvent
					.getSource()
					.getParent()
					.getParent()
					.close();
			},

			/**
			 * @function
			 * @name onDraftLinkPressed
			 * @param {Event} oEvent event object passed from the click event
			 * @param {string} sEntitySet Name of the entity set for on the fly templating
			 * @param {string} pType Name of the page on which popup is being created
			 */
			onDraftLinkPressed: function(oEvent, sEntitySet, pType) {
				var that = this,
					oSource = oEvent.getSource(),
					oView = _getParentViewOfControl(oSource),
					oBindingContext = oSource.getBindingContext(),
					oMetaModel = oBindingContext.getModel().getMetaModel(),
					sViewId = oView.getId(),
					oDraftPopover;

				this.mDraftPopovers = this.mDraftPopovers || {};
				this.mDraftPopovers[sViewId] = this.mDraftPopovers[sViewId] || {};
				oDraftPopover = this.mDraftPopovers[sViewId][sEntitySet];

				if (oDraftPopover) {
					oDraftPopover.setBindingContext(oBindingContext);
					oDraftPopover.openBy(oSource);
				} else {
					var oModel = new JSONModel({
						bIndicatorType: pType
					});
					// oDraftPopover.
					var sFragmentName = "sap.fe.macros.field.DraftPopOverAdminData",
						oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");

					Promise.resolve(
						XMLPreprocessor.process(
							oPopoverFragment,
							{ name: sFragmentName },
							{
								bindingContexts: {
									entitySet: oMetaModel.createBindingContext("/" + sEntitySet),
									prop: oModel.createBindingContext("/")
								},
								models: {
									entitySet: oMetaModel,
									prop: oModel
								}
							}
						)
					)
						.then(function(oFragment) {
							return Fragment.load({ definition: oFragment, controller: that });
						})
						.then(function(oPopover) {
							oPopover.setModel(ResourceModel.getModel(), "i18n");
							oView.addDependent(oPopover);
							oPopover.setBindingContext(oBindingContext);
							oPopover.setModel(oModel, "prop");
							that.mDraftPopovers[sViewId][sEntitySet] = oPopover;
							oPopover.openBy(oSource);
							// ensure to remove the reference to the draft popover as it would be destroyed on exit
							oView.attachEventOnce("beforeExit", function() {
								delete that.mDraftPopovers;
							});
						})
						.catch(function(oError) {
							Log.error("Error while opening the draft popup", oError);
						});
				}
			},
			/**
			 * @function
			 * @name getVisible
			 * @param {boolean} bIsActiveEntity to check if the entry is active or not
			 * @param {object} oLastChangedDateTime last change time stamp info
			 * @param {string} sIndicatorType type of draft indicator to be rendered
			 * @returns {boolean} text or vbox to be rendered or not
			 */
			getVisible: function(bIsActiveEntity, oLastChangedDateTime, sIndicatorType) {
				if (!bIsActiveEntity && !oLastChangedDateTime && sIndicatorType == DraftIndicatorState.NoChanges) {
					return true;
				} else if (!bIsActiveEntity && oLastChangedDateTime && sIndicatorType == DraftIndicatorState.WithChanges) {
					return true;
				} else if (bIsActiveEntity && oLastChangedDateTime && sIndicatorType == DraftIndicatorState.Active) {
					return true;
				} else {
					return false;
				}
			}
		};

		return DraftIndicatorHelper;
	},
	/* bExport= */ false
);
