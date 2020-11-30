/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(
	[
		"sap/m/Button",
		"sap/m/Dialog",
		"sap/m/library",
		"sap/fe/templates/controls/messages/MessagePopover",
		"sap/ui/core/MessageType",
		"sap/ui/model/Filter",
		"sap/ui/model/Sorter",
		"sap/ui/model/FilterOperator",
		"sap/uxap/ObjectPageLayout"
	],
	function(Button, Dialog, mLibrary, MessagePopover, MessageType, Filter, Sorter, FilterOperator, ObjectPageLayout) {
		"use strict";
		var ButtonType = mLibrary.ButtonType;
		var MessageButton = Button.extend("sap.fe.templates.controls.messages.MessageButton", {
			metadata: {
				properties: {},
				events: {
					messageChange: {}
				},
				aggregations: {
					customFilters: {
						type: "sap.fe.templates.controls.messages.MessageFilter",
						multiple: true,
						singularName: "customFilter"
					}
				}
			},
			renderer: {}
		});

		/**
		 *
		 * @param {object} sControlId
		 * @param {object} item
		 *
		 * @returns {boolean} true if the control id matches the item id
		 */
		function _fnFilterUponId(sControlId, item) {
			return sControlId === item.getId();
		}

		/**
		 * Method to set the button text, count and icon property based upon the message items
		 * ButtonType:  Critical, Negative for Warning and Error respectively.
		 *
		 *
		 * @private
		 */
		function _setMessageData() {
			var sIcon,
				sButtonType = ButtonType.Default,
				oMessages = this.oMessagePopover.getItems(),
				iMessageLength = oMessages.length,
				oMessageCount = { Error: 0, Warning: 0, Success: 0, Information: 0 };
			if (iMessageLength > 0) {
				for (var i = 0; i < iMessageLength; i++) {
					++oMessageCount[oMessages[i].getType()];
				}
				if (oMessageCount[MessageType.Error] > 0) {
					sIcon = "sap-icon://message-error";
					sButtonType = ButtonType.Negative;
				} else if (oMessageCount[MessageType.Critical] > 0 || oMessageCount[MessageType.Warning] > 0) {
					sIcon = "sap-icon://message-warning";
					sButtonType = ButtonType.Critical;
				} else if (oMessageCount[MessageType.Success] > 0) {
					sIcon = "sap-icon://message-success";
					sButtonType = ButtonType.Accept;
				} else if (oMessageCount[MessageType.Information] > 0) {
					sIcon = "sap-icon://message-information";
				}
				this.setText(iMessageLength);
				this.setIcon(sIcon);
				this.setType(sButtonType);
				this.setVisible(true);
				this._applyGrouping();
			} else {
				this.setVisible(false);
			}
			this.fireMessageChange({
				iMessageLength: iMessageLength
			});
		}

		/**
		 * Method to set the filters based upon the message items
		 * desired filter operation is :
		 * ( filters provided by user && ( validation = true && Control should be present in view ) || messages for the current matching context ).
		 *
		 * @private
		 */
		function _applyFiltersAndSort() {
			var aCustomFilters,
				oValidationFilters,
				oValidationAndContextFilter,
				oFilters,
				oBindingContext,
				sPath,
				sViewId,
				oSorter,
				aUserDefinedFilter = [],
				objectPageLayoutSections = null;
			//Filter function to verify if the control is part of the current view or not
			function getCheckControlInViewFilter() {
				var fnTest = function(aControlIds) {
					if (!aControlIds.length) {
						return false;
					}
					var oControl = sap.ui.getCore().byId(aControlIds[0]);
					while (oControl) {
						if (oControl.getId() === sViewId) {
							return true;
						}
						if (oControl instanceof Dialog) {
							// messages for sap.m.Dialog should not appear in the message button
							return false;
						}
						oControl = oControl.getParent();
					}
					return false;
				};
				return new Filter({
					path: "controlIds",
					test: fnTest,
					caseSensitive: true
				});
			}

			if (!this.sViewId) {
				this.sViewId = this._getViewId(this.getId());
			}
			sViewId = this.sViewId;
			//Add the filters provided by the user
			aCustomFilters = this.getAggregation("customFilters");
			if (aCustomFilters) {
				aCustomFilters.forEach(function(filter) {
					aUserDefinedFilter.push(
						new Filter({
							path: filter.getProperty("path"),
							operator: filter.getProperty("operator"),
							value1: filter.getProperty("value1"),
							value2: filter.getProperty("value2")
						})
					);
				});
			}

			oBindingContext = this.getBindingContext();
			if (!oBindingContext) {
				this.setVisible(false);
				return;
			} else {
				sPath = oBindingContext.getPath();
				//Filter for filtering out only validation messages which are currently present in the view
				oValidationFilters = new Filter({
					filters: [
						new Filter({
							path: "validation",
							operator: FilterOperator.EQ,
							value1: true
						}),
						getCheckControlInViewFilter()
					],
					and: true
				});
				//Filter for filtering out the bound messages i.e target starts with the context path
				oValidationAndContextFilter = new Filter({
					filters: [
						oValidationFilters,
						new Filter({
							path: "target",
							operator: FilterOperator.StartsWith,
							value1: sPath
						})
					],
					and: false
				});
			}
			// Do not add empty array as filters
			oFilters = new Filter({
				filters: aUserDefinedFilter.length > 0 ? [aUserDefinedFilter, oValidationAndContextFilter] : [oValidationAndContextFilter],
				and: true
			});
			this.oItemBinding.filter(oFilters);
			var that = this;
			oSorter = new Sorter("message>", null, null, function(obj1, obj2) {
				var rankA, rankB;
				that.oObjectPageLayout = _getObjectPageLayout(that, that.oObjectPageLayout);
				if (!objectPageLayoutSections) {
					objectPageLayoutSections = that.oObjectPageLayout && that.oObjectPageLayout.getSections();
				}
				rankA = _getMessageRank(obj1, objectPageLayoutSections);
				rankB = _getMessageRank(obj2, objectPageLayoutSections);
				if (rankA < rankB) {
					return -1;
				}
				if (rankA > rankB) {
					return 1;
				}
				return 0;
			});
			this.oItemBinding.sort(oSorter);
		}

		/**
		 *
		 * @param {object} obj message object
		 * @param {Array} aSections array of sections in the object page
		 *
		 * @returns {number} message rank
		 */
		function _getMessageRank(obj, aSections) {
			if (aSections) {
				var section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
				for (j = aSections.length - 1; j >= 0; --j) {
					// Loop over all sections
					section = aSections[j];
					aSubSections = section.getSubSections();
					for (k = aSubSections.length - 1; k >= 0; --k) {
						// Loop over all sub-sections
						subSection = aSubSections[k];
						aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
						//Try to find the control 1 inside the sub section
						aElements = aAllElements.filter(_fnFilterUponId.bind(this, obj.getControlId()));
						sectionRank = j + 1;
						if (aElements.length > 0) {
							obj.sectionName = section.getTitle();
							obj.subSectionName = subSection.getTitle();
							return sectionRank * 10 + (k + 1);
						}
					}
				}
				//if sub section tilte is Other messages, we return a high number(rank), which ensures
				//that messages belonging to this sub section always come later in messagePopover
				return 999;
			}
			return 999;
		}

		/**
		 * Method called when the title of message is clicked.
		 *
		 * @function
		 * @name _activeTitlePress
		 * @private
		 * @param {Event} oEvent - Event object passed from the handler
		 */
		function _activeTitlePress(oEvent) {
			var oItem = oEvent.getParameter("item"),
				oMessage = oItem.getBindingContext("message").getObject(),
				oControl = sap.ui.getCore().byId(oMessage.getControlId());
			if (oControl && oControl.getDomRef()) {
				oControl.focus();
			} else {
				var sSectionTitle = oItem.getGroupName().split(", ")[0];
				_navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
				oControl.focus();
			}
		}

		/**
		 * Gets section based on section title and visibility.
		 *
		 * @param {object} oObjectPage - Object page.
		 * @param {string} sSectionTitle - Section title.
		 * @returns {object}
		 * @private
		 * @ignore
		 */
		function _getSectionBySectionTitle(oObjectPage, sSectionTitle) {
			if (sSectionTitle) {
				var aSections = oObjectPage.getSections();
				var oSection;
				for (var i = 0; i < aSections.length; i++) {
					if (aSections[i].getVisible() && aSections[i].getTitle() === sSectionTitle) {
						oSection = aSections[i];
						break;
					}
				}
				return oSection;
			}
		}
		/**
		 * Navigates to section if object page uses IconTabBar and current section is not equal to the section to navigate.
		 *
		 * @param {object} oObjectPage - Object page.
		 * @param {string} sSectionTitle - Section title.
		 * @private
		 * @ignore
		 */
		function _navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle) {
			var bUseIconTabBar = oObjectPage.getUseIconTabBar();
			if (bUseIconTabBar) {
				var oSection = _getSectionBySectionTitle(oObjectPage, sSectionTitle);
				var sSelectedSectionId = oObjectPage.getSelectedSection();
				if (oSection && sSelectedSectionId !== oSection.getId()) {
					oObjectPage.setSelectedSection(oSection.getId());
				}
			}
		}

		function _getObjectPageLayout(oElement, oObjectPageLayout) {
			if (oObjectPageLayout) {
				return oObjectPageLayout;
			}
			oObjectPageLayout = oElement;
			//Iterate over parent till you have not reached the object page layout
			while (oObjectPageLayout && !(oObjectPageLayout instanceof ObjectPageLayout)) {
				oObjectPageLayout = oObjectPageLayout.getParent();
			}
			return oObjectPageLayout;
		}

		MessageButton.prototype.init = function() {
			Button.prototype.init.apply(this, arguments);
			//press event handler attached to open the message popover
			this.attachPress(this.handleMessagePopoverPress, this);
			this.oMessagePopover = new MessagePopover();
			this.oItemBinding = this.oMessagePopover.getBinding("items");
			this.oItemBinding.attachChange(_setMessageData.bind(this));
			this.attachModelContextChange(_applyFiltersAndSort.bind(this));
			this.oMessagePopover.attachActiveTitlePress(_activeTitlePress.bind(this));
		};

		/**
		 * Method called upon click of the message-button control.
		 *
		 * @param {object} oEvent - Event object
		 */
		MessageButton.prototype.handleMessagePopoverPress = function(oEvent) {
			this.oMessagePopover.toggle(oEvent.getSource());
		};

		/**
		 * Method to group the messages based upon the section, subsection they belong to.
		 *
		 * @private
		 */
		MessageButton.prototype._applyGrouping = function() {
			var aMessages, message, aSections, section, aSubSections, subSection, aElements, aAllElements, i, j, k;
			this.sGeneralGroupText = this.sGeneralGroupText
				? this.sGeneralGroupText
				: sap.ui
						.getCore()
						.getLibraryResourceBundle("sap.fe.core")
						.getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
			this.oObjectPageLayout = _getObjectPageLayout(this, this.oObjectPageLayout);
			if (!this.oObjectPageLayout) {
				return;
			}
			aMessages = this.oMessagePopover.getItems();
			//Get all sections from the object page layout
			aSections = this.oObjectPageLayout.getSections();

			if (aSections) {
				for (i = aMessages.length - 1; i >= 0; --i) {
					// Loop over all messages
					message = aMessages[i];
					for (j = aSections.length - 1; j >= 0; --j) {
						// Loop over all sections
						section = aSections[j];
						aSubSections = section.getSubSections();
						for (k = aSubSections.length - 1; k >= 0; --k) {
							// Loop over all sub-sections
							subSection = aSubSections[k];
							aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
							//Try to find the control inside the sub section
							aElements = aAllElements.filter(
								_fnFilterUponId.bind(
									this,
									message
										.getBindingContext("message")
										.getObject()
										.getControlId()
								)
							);
							if (aElements.length > 0) {
								message.setGroupName(
									section.getTitle() +
										(subSection.getTitle() && aSubSections.length > 1 ? ", " + subSection.getTitle() : "")
								);
								// Skip the loop of section and sub-section once group name is set
								j = k = -1;
							} else {
								message.setGroupName(this.sGeneralGroupText);
							}
						}
					}
				}
			}
		};

		/**
		 * Method to retrieve the view id (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
		 *
		 * @param {string} sControlId - Id of the control for which we need to get the view id
		 * @returns {string} sViewId - View id for the control
		 */
		MessageButton.prototype._getViewId = function(sControlId) {
			var sViewId,
				oControl = sap.ui.getCore().byId(sControlId);
			while (oControl) {
				if (oControl instanceof sap.ui.core.mvc.View) {
					sViewId = oControl.getId();
					break;
				}
				oControl = oControl.getParent();
			}
			return sViewId;
		};

		return MessageButton;
	},
	/* bExport= */ true
);
