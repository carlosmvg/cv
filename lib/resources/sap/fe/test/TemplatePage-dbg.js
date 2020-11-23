sap.ui.define(
	[
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/Opa5",
		"sap/ui/core/util/ShortcutHelper",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MdcFieldBuilder",
		"sap/fe/test/builder/MdcTableBuilder",
		"sap/fe/test/builder/DialogBuilder",
		"sap/fe/test/api/TableAssertions",
		"sap/fe/test/api/TableActions",
		"sap/fe/test/builder/MdcFilterBarBuilder",
		"sap/fe/test/api/FilterBarAssertions",
		"sap/fe/test/api/FilterBarActions",
		"sap/base/util/deepEqual",
		"sap/ushell/resources"
	],
	function(
		OpaBuilder,
		Opa5,
		ShortcutHelper,
		Utils,
		FEBuilder,
		FieldBuilder,
		TableBuilder,
		DialogBuilder,
		TableAssertions,
		TableActions,
		FilterBarBuilder,
		FilterBarAssertions,
		FilterBarActions,
		deepEqual,
		resources
	) {
		"use strict";

		function _getTableBuilder(vOpaInstance, vTableIdentifier) {
			var oTableBuilder = TableBuilder.create(vOpaInstance);
			if (Utils.isOfType(vTableIdentifier, String)) {
				oTableBuilder.hasProperties({ header: vTableIdentifier });
			} else {
				oTableBuilder.hasId(vTableIdentifier.id);
			}
			return oTableBuilder;
		}

		function _getFilterBarBuilder(vOpaInstance, vFilterBarIdentifier) {
			return FilterBarBuilder.create(vOpaInstance).hasId(vFilterBarIdentifier.id);
		}

		return {
			create: function(sViewId, sEntityPath) {
				var oResourceBundleTemplates = sap.ui.getCore().getLibraryResourceBundle("sap.fe.templates"),
					oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

				return {
					viewId: sViewId,
					actions: {
						_onTable: function(vTableIdentifier) {
							return new TableActions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
						},
						_onFilterBar: function(vFilterBarIdentifier) {
							return new FilterBarActions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
						},
						iCloseMessageErrorDialog: function() {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Bar")
								.hasAggregation("contentMiddle", OpaBuilder.Matchers.properties({ text: "Error" })) // TODO THIS MUST BE A LOCALIZED TEXT!!!!
								.do(
									OpaBuilder.create(this)
										.isDialogElement()
										.hasType("sap.m.Dialog")
										.doOnAggregation(
											"beginButton",
											OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_COMMON_SAPFE_CLOSE"),
											OpaBuilder.Actions.press()
										)
								)
								.description("Closing message error dialog")
								.execute();
						},
						iNavigateBackInDialog: function() {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Bar")
								.doOnAggregation(
									"contentLeft",
									OpaBuilder.Matchers.properties({ icon: "sap-icon://nav-back", visible: true }),
									OpaBuilder.Actions.press()
								)
								.description("Navigating back in dialog")
								.execute();
						},
						iOpenVHOnActionDialog: function(sFieldName) {
							var sFieldId = "APD_::" + sFieldName + "-inner-vhi";
							return OpaBuilder.create(this)
								.hasId(sFieldId)
								.isDialogElement()
								.doPress()
								.description("Opening value help for '" + sFieldName + "'")
								.execute();
						},
						_iPressKeyboardShortcut: function(sId, sShortcut, mProperties, sType) {
							return OpaBuilder.create(this)
								.hasId(sId)
								.hasProperties(mProperties ? mProperties : {})
								.hasType(sType)
								.do(function(oElement) {
									var oNormalizedShorcut = ShortcutHelper.parseShortcut(sShortcut);
									oNormalizedShorcut.type = "keydown";
									oElement.$().trigger(oNormalizedShorcut);
								})
								.description("Execute keyboard shortcut " + sShortcut)
								.execute();
						},
						iConfirmDialogWithButtonText: function(sText) {
							return DialogBuilder.create(this)
								.doPressFooterButton(OpaBuilder.Matchers.properties({ text: sText }))
								.description("Clicking dialog footer button '" + sText + "'")
								.execute();
						},
						iCancelActionDialog: function() {
							return this.iConfirmDialogWithButtonText(
								oResourceBundleCore.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL")
							);
						},
						iConfirmCustomAction: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.hasProperties({ text: sText })
								.doPress()
								.description("Custom Action in Table ToolBar")
								.execute();
						},
						iConfirmDialog: function() {
							return this.iConfirmDialogWithButtonText(oResourceBundleCore.getText("C_COMMON_DIALOG_OK"));
						},
						iConfirmDelete: function() {
							return this.iConfirmDialogWithButtonText(oResourceBundleTemplates.getText("C_COMMON_OBJECT_PAGE_DELETE"));
						},
						iConfirmActionVHDialog: function(sServiceName, sActionName, sFieldName) {
							return OpaBuilder.create(this)
								.hasId(sServiceName + "." + sActionName + "::" + sFieldName + "-ok")
								.isDialogElement()
								.doPress()
								.description("Confirming value help dialog for action " + sActionName)
								.execute();
						},
						iCancelActionVHDialog: function(sServiceName, sActionName, sFieldName) {
							return OpaBuilder.create(this)
								.hasId(sServiceName + "." + sActionName + "::" + sFieldName + "-cancel")
								.isDialogElement()
								.doPress()
								.description("Cancelling value help dialog for action " + sActionName)
								.execute();
						},
						iCollapseExpandPageHeader: function(bCollapse) {
							var oExpandedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
									"tooltip",
									"sap.f",
									"COLLAPSE_HEADER_BUTTON_TOOLTIP"
								),
								oCollapsedButtonMatcher = OpaBuilder.Matchers.resourceBundle(
									"tooltip",
									"sap.f",
									"EXPAND_HEADER_BUTTON_TOOLTIP"
								);
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.has(OpaBuilder.Matchers.some(oExpandedButtonMatcher, oCollapsedButtonMatcher))
								.doConditional(bCollapse ? oExpandedButtonMatcher : oCollapsedButtonMatcher, OpaBuilder.Actions.press())
								.description("Resizing of the Page Header")
								.execute();
						},
						iCloseMessageBox: function() {
							return this.iConfirmDialogWithButtonText(oResourceBundleCore.getText("C_COMMON_SAPFE_CLOSE"));
						}
					},
					assertions: {
						_onTable: function(vTableIdentifier) {
							return new TableAssertions(_getTableBuilder(this, vTableIdentifier), vTableIdentifier);
						},
						_onFilterBar: function(vFilterBarIdentifier) {
							return new FilterBarAssertions(_getFilterBarBuilder(this, vFilterBarIdentifier), vFilterBarIdentifier);
						},
						iSeeThisPage: function() {
							return OpaBuilder.create(this)
								.hasId(sViewId)
								.viewId(null)
								.viewName(null)
								.description(Utils.formatMessage("Seeing the page '{0}'", sViewId))
								.execute();
						},
						iSeeFilterDefinedOnActionDialogValueHelp: function(sAction, sVHParameter, sFieldName, sValue) {
							return OpaBuilder.create(this)
								.hasId(sAction + "::" + sVHParameter + "::FilterBar::FilterField::" + sFieldName + "-inner")
								.isDialogElement()
								.hasAggregationProperties("tokens", { text: sValue })
								.description("Seeing filter for '" + sFieldName + "' set to '" + sValue + "'")
								.execute();
						},
						_iSeeTheMessageToast: function(sText) {
							return FEBuilder.createMessageToastBuilder(sText).execute(this);
						},
						iSeeMessageErrorDialog: function() {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Bar")
								.hasAggregation("contentMiddle", OpaBuilder.Matchers.properties({ "text": "Error" })) // TODO THIS MUST BE A LOCALIZED TEXT!!!!
								.description("Seeing message error dialog")
								.execute();
						},
						_iSeeButtonWithText: function(sText, oButtonState) {
							return FEBuilder.create(this)
								.hasType("sap.m.Button")
								.hasProperties({ text: sText })
								.hasState(oButtonState)
								.checkNumberOfMatches(1)
								.description(
									Utils.formatMessage(
										"Seeing Button with text '{0}'" + (oButtonState ? " with state: '{1}'" : ""),
										sText,
										oButtonState
									)
								)
								.execute();
						},
						_iSeeElement: function(sId, oElementState) {
							return FEBuilder.create(this)
								.hasId(sId)
								.hasState(oElementState)
								.description(
									Utils.formatMessage(
										"Seeing Element '{0}'" + (oElementState ? " with state: '{1}'" : ""),
										sId,
										oElementState
									)
								)
								.execute();
						},
						iSeeActionParameterDialog: function(sDialogTitle) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Dialog")
								.hasProperties({ title: sDialogTitle })
								.isDialogElement()
								.description("Seeing Action Parameter Dialog with title '" + sDialogTitle + "'")
								.execute();
						},
						iSeeActionCustomDialog: function(sDialogText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Text")
								.hasProperties({ text: sDialogText })
								.isDialogElement()
								.description("Seeing Action Custom Dialog '" + sDialogText + "'")
								.execute();
						},
						iSeeActionDefaultDialog: function() {
							return (
								OpaBuilder.create(this)
									.hasType("sap.m.Text")
									.has(OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_OPERATIONS_ACTION_CONFIRM_MESSAGE"))
									//.hasProperties({ text: sDialogText })
									.isDialogElement()
									.description("Seeing Action Default Dialog ")
									.execute()
							);
						},
						iSeeActionParameterContent: function(sFieldName, sContent) {
							var sFieldId = "APD_::" + sFieldName + "-inner",
								oBuilder = OpaBuilder.create(this)
									.hasId(sFieldId)
									.isDialogElement()
									.description("Seeing Action parameter '" + sFieldName + "' with content '" + sContent + "'");

							if (sContent) {
								oBuilder.hasProperties({ value: sContent });
							}
							return oBuilder.execute();
						},
						iSeeActionVHDialog: function(sServiceName, sActionName, sFieldName) {
							return OpaBuilder.create(this)
								.hasId(sServiceName + "." + sActionName + "::" + sFieldName + "-dialog")
								.isDialogElement()
								.description("Seeing Action Value Help dialog for field " + sFieldName)
								.execute();
						},
						iSeeActionVHDialogFilterBar: function(sServiceName, sActionName, sFieldName) {
							return OpaBuilder.create(this)
								.hasId(sServiceName + "." + sActionName + "::" + sFieldName + "::FilterBar")
								.isDialogElement()
								.description("Seeing Action Value Help FilterBar for field " + sFieldName)
								.execute();
						},
						iSeeActionVHDialogTable: function(sServiceName, sActionName, sFieldName) {
							return OpaBuilder.create(this)
								.hasId(sServiceName + "." + sActionName + "::" + sFieldName + "::Table")
								.isDialogElement()
								.description("Seeing Action Value Help Table for field " + sFieldName)
								.execute();
						},
						iSeePageHeaderButton: function(bCollapse) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.has(
									OpaBuilder.Matchers.resourceBundle(
										"tooltip",
										"sap.f",
										bCollapse ? "COLLAPSE_HEADER_BUTTON_TOOLTIP" : "EXPAND_HEADER_BUTTON_TOOLTIP"
									)
								)
								.description("Seeing the " + (bCollapse ? "Collapse" : "Expand") + " Page Header Button")
								.execute();
						},
						iSeeTileCreationMessage: function() {
							return this._iSeeTheMessageToast(resources.i18n.getText("tile_created_msg"));
						},
						iSeeErrorMessage: function(sErrorText) {
							var res = OpaBuilder.create(this)
								.hasType("sap.m.Dialog")
								.isDialogElement(true)
								.hasProperties({ icon: "sap-icon://message-error", title: "Error" });

							if (sErrorText) {
								res = res.hasAggregationProperties("content", { text: sErrorText });
							}

							return res
								.doOnChildren(
									OpaBuilder.create(this)
										.hasType("sap.m.Button")
										.hasProperties({ text: "Close" })
										.checkNumberOfMatches(1)
										.doPress()
										.error("Cannot close the dialog ")
								)
								.description("Seeing error message dialog open")
								.execute();
						},
						iSeeMessageBoxWithTitle: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Dialog")
								.isDialogElement(true)
								.hasProperties({ title: sText })
								.description("Seeing error message dialog open")
								.execute();
						},
						iSeeBackButtonInDialog: function(bVisible) {
							if (bVisible === undefined) {
								bVisible = true;
							}
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Bar")
								.hasAggregation(
									"contentLeft",
									OpaBuilder.Matchers.properties({ icon: "sap-icon://nav-back", visible: bVisible })
								)
								.description(
									Utils.formatMessage("Seeing back button in dialog in '{0}' state", bVisible ? "visible " : "invisible ")
								)
								.execute();
						},
						iSeeMessageViewInDialog: function(oMessage) {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.MessageView")
								.hasAggregation("items", OpaBuilder.Matchers.properties(oMessage))
								.description(Utils.formatMessage("Seeing message '{0}' in Message View dialog", oMessage))
								.execute();
						}
					}
				};
			}
		};
	}
);
