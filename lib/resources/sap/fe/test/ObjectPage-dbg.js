sap.ui.define(
	[
		"sap/base/util/merge",
		"./TemplatePage",
		"sap/ui/test/OpaBuilder",
		"sap/ui/test/Opa5",
		"sap/fe/test/Utils",
		"sap/fe/test/builder/FEBuilder",
		"sap/fe/test/builder/MacroFieldBuilder",
		"sap/fe/test/builder/OverflowToolbarBuilder",
		"sap/fe/test/api/FooterActionsOP",
		"sap/fe/test/api/FooterAssertionsOP",
		"sap/fe/test/api/HeaderActions",
		"sap/fe/test/api/HeaderAssertions",
		"sap/fe/test/api/FormActions",
		"sap/fe/test/api/FormAssertions",
		"sap/fe/core/helpers/StableIdHelper"
	],
	function(
		mergeObjects,
		TemplatePage,
		OpaBuilder,
		Opa5,
		Utils,
		FEBuilder,
		FieldBuilder,
		OverflowToolbarBuilder,
		FooterActionsOP,
		FooterAssertionsOP,
		HeaderActions,
		HeaderAssertions,
		FormActions,
		FormAssertions,
		StableIdHelper
	) {
		"use strict";

		function getTableId(sNavProperty) {
			return "fe::table::" + sNavProperty.split("/").join("::") + "::LineItem";
		}

		function _getFieldId(sField, sSuffix, sFacet, sHeaderFacet, bValueHelp) {
			var sId = "fe::";

			if (typeof sFacet === "string") {
				sId += "FormContainer";
				sId += "::" + StableIdHelper.prepareId(sFacet);
				if (bValueHelp) {
					sId += "::FieldValueHelp";
					sId += "::" + sField;
				} else {
					sId += "::FormElement";
					sId += "::DataField";
					sId += "::" + sField;
					sId += "::Field";
				}
			} else if (typeof sHeaderFacet === "string") {
				sId += "HeaderFacet";
				sId += "::Form";
				sId += "::" + StableIdHelper.prepareId(sHeaderFacet);
				sId += "::DataField";
				sId += "::" + sField;
				sId += "::Field";
			}

			sId = StableIdHelper.prepareId(sId);
			return sId;
		}

		function getVHDFieldId(oField) {
			return _getFieldId(oField.field, "", oField.facet, oField.headerFacet, true);
		}

		function getFieldId(oField, sFieldSuffix) {
			return _getFieldId(oField.field, sFieldSuffix || "", oField.facet, oField.headerFacet, false);
		}

		function _getOverflowToolbarBuilder(vOpaInstance, vFooterIdentifier) {
			return OverflowToolbarBuilder.create(vOpaInstance).hasId(vFooterIdentifier.id);
		}

		function _getHeaderBuilder(vOpaInstance, vHeaderIdentifier) {
			return FEBuilder.create(vOpaInstance).hasId(vHeaderIdentifier.id);
		}

		function _getFormBuilder(vOpaInstance, vFormIdentifier) {
			var oFormBuilder = FEBuilder.create(vOpaInstance);
			if (Utils.isOfType(vFormIdentifier, String)) {
				oFormBuilder.hasType("sap.uxap.ObjectPageSubSection");
				oFormBuilder.hasProperties({ title: vFormIdentifier });
			} else if (vFormIdentifier.fieldGroupId) {
				if (vFormIdentifier.fullSubSectionId) {
					oFormBuilder
						.hasId(vFormIdentifier.fieldGroupId)
						.has(OpaBuilder.Matchers.ancestor(vFormIdentifier.fullSubSectionId, false));
				} else {
					oFormBuilder.hasId(vFormIdentifier.fieldGroupId);
				}
			} else {
				oFormBuilder.hasId(vFormIdentifier.id);
			}
			return oFormBuilder;
		}

		return {
			create: function(sAppId, sComponentId, sEntityPath) {
				var ViewId = sAppId + "::" + sComponentId,
					ObjectPageLayoutId = ViewId + "--fe::ObjectPage",
					OPHeaderId = "fe::HeaderFacet",
					OPHeaderContentId = "fe::ObjectPage-OPHeaderContent",
					OPFooterId = "fe::FooterBar",
					OPSectionIdPrefix = "fe::FacetSubSection",
					OPFormIdPrefix = "fe::Form",
					OPFormContainerIdPrefix = "fe::FormContainer",
					BreadCrumbId = ViewId + "--fe::Breadcrumbs",
					AnchorBarId = "fe::ObjectPage-anchBar",
					PaginatorId = "fe::Paginator",
					Page_EditMode = {
						DISPLAY: "Display",
						EDITABLE: "Editable"
					},
					oResourceBundleCore = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");

				return mergeObjects(TemplatePage.create(ViewId, sEntityPath), {
					actions: {
						onTable: function(vTableIdentifier) {
							if (!Utils.isOfType(vTableIdentifier, String)) {
								vTableIdentifier = { id: getTableId(vTableIdentifier.property) };
							}
							return this._onTable(vTableIdentifier);
						},
						onFooter: function() {
							return new FooterActionsOP(_getOverflowToolbarBuilder(this, { id: OPFooterId }), {
								id: OPFooterId
							});
						},
						onHeader: function() {
							return new HeaderActions(_getHeaderBuilder(this, { id: ObjectPageLayoutId }), {
								id: ObjectPageLayoutId,
								headerId: OPHeaderId,
								headerContentId: OPHeaderContentId,
								viewId: ViewId,
								paginatorId: PaginatorId,
								breadCrumbId: BreadCrumbId
							});
						},
						onForm: function(vFormIdentifier) {
							if (!Utils.isOfType(vFormIdentifier, String)) {
								if (vFormIdentifier.section) {
									vFormIdentifier.id = OPSectionIdPrefix + "::" + vFormIdentifier.section;
									vFormIdentifier.fullSubSectionId = ViewId + "--" + vFormIdentifier.id;
								}
								if (vFormIdentifier.fieldGroup) {
									vFormIdentifier.fieldGroupId = OPFormContainerIdPrefix + "::" + vFormIdentifier.fieldGroup;
								}
							}
							return new FormActions(_getFormBuilder(this, vFormIdentifier), vFormIdentifier);
						},

						iClickQuickViewMoreLinksButton: function() {
							return OpaBuilder.create(this)
								.hasType("sap.m.Button")
								.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
								.doPress()
								.description("Pressing 'More Links' button")
								.execute();
						},
						iClickLinkWithText: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Link")
								.hasProperties({ text: sText })
								.doPress()
								.description("Navigating via link '" + sText + "'")
								.execute();
						},
						iEnableLink: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.ColumnListItem")
								.hasAggregationProperties("cells", { text: sText })
								.isDialogElement()
								.doPress("selectMulti")
								.description("The CheckBox for link " + sText + " is selected")
								.execute();
						},
						iOpenVHDialog: function(oField) {
							var sFieldId = getFieldId(oField) + "-inner-vhi";
							return OpaBuilder.create(this)
								.hasId(sFieldId)
								.doPress()
								.description("Opening value help for '" + oField.field + "'")
								.execute();
						},
						iPressKeyboardShortcutOnSection: function(sShortcut, mProperties) {
							return this._iPressKeyboardShortcut(undefined, sShortcut, mProperties, "sap.uxap.ObjectPageSection");
						},
						iSelectFromVHDTable: function(sValue) {
							return OpaBuilder.create(this)
								.hasType("sap.m.ColumnListItem")
								.hasAggregationProperties("cells", { value: sValue })
								.checkNumberOfMatches(1)
								.isDialogElement()
								.doPress()
								.description("Selecting row from dialog with value '" + sValue + "'")
								.execute();
						},
						iConfirmFacetVHD: function(oField) {
							var sFieldId = getVHDFieldId(oField) + "-ok";
							return OpaBuilder.create(this)
								.hasId(sFieldId)
								.doPress()
								.description("Confirming value help selection for '" + oField.field + "'")
								.execute();
						},
						iCancelDialog: function() {
							return this.iConfirmDialogWithButtonText(oResourceBundleCore.getText("C_COMMON_OBJECT_PAGE_CANCEL"));
						},
						iOpenSectionWithTitle: function(sName) {
							return OpaBuilder.create(this)
								.hasId(AnchorBarId)
								.has(
									OpaBuilder.Matchers.children(
										FEBuilder.Matchers.states({
											controlType: "sap.m.Button",
											text: sName
										})
									)
								)
								.doPress()
								.description("Selecting section " + sName)
								.execute();
						},
						iClickCreateButton: function() {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Button")
								.has(OpaBuilder.Matchers.resourceBundle("text", "sap.fe.core", "C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"))
								.doPress()
								.description("Pressing Create button on sticky creation dialog.")
								.execute();
						},
						iOpenVHDInCreateDialog: function(sFieldId) {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasId(sFieldId + "-inner-vhi")
								.doPress()
								.description("Opening value help for '" + sFieldId + "' from within the create dialog")
								.execute();
						},
						iConfirmVHDInCreateDialog: function(sField) {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasId(sField + "::VH-ok")
								.doPress()
								.description("Comfirmed VHD opened from create dialog")
								.execute();
						},
						iEnterValueForFieldInCreateDialog: function(sFieldId, sValue) {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasId(sFieldId)
								.doEnterText(sValue)
								.description(
									"Entering Text in the field '" + sFieldId + "'in the create dialog with value '" + sValue + "'"
								)
								.execute();
						}
					},
					assertions: {
						onTable: function(vTableIdentifier) {
							if (!Utils.isOfType(vTableIdentifier, String)) {
								vTableIdentifier = { id: getTableId(vTableIdentifier.property) };
							}
							return this._onTable(vTableIdentifier);
						},
						onFooter: function() {
							return new FooterAssertionsOP(_getOverflowToolbarBuilder(this, { id: OPFooterId }), { id: OPFooterId });
						},
						onHeader: function() {
							return new HeaderAssertions(_getHeaderBuilder(this, { id: ObjectPageLayoutId }), {
								id: ObjectPageLayoutId,
								headerId: OPHeaderId,
								headerContentId: OPHeaderContentId,
								viewId: ViewId,
								paginatorId: PaginatorId,
								breadCrumbId: BreadCrumbId
							});
						},
						onForm: function(vFormIdentifier) {
							if (!Utils.isOfType(vFormIdentifier, String)) {
								if (vFormIdentifier.section) {
									vFormIdentifier.id = OPSectionIdPrefix + "::" + vFormIdentifier.section;
									vFormIdentifier.fullSubSectionId = ViewId + "--" + vFormIdentifier.id;
								}
								if (vFormIdentifier.fieldGroup) {
									vFormIdentifier.fieldGroupId = OPFormContainerIdPrefix + "::" + vFormIdentifier.fieldGroup;
								}
							}
							return new FormAssertions(_getFormBuilder(this, vFormIdentifier), vFormIdentifier);
						},

						iSeeLinkWithText: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Link")
								.hasProperties({ text: sText })
								.description("Seeing link with text '" + sText + "'")
								.execute();
						},
						iSeeTextWithText: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Text")
								.hasProperties({ text: sText })
								.description("Seeing link with text '" + sText + "'")
								.execute();
						},
						iSeeTitleWithText: function(sText) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Title")
								.hasProperties({ text: sText })
								.description("Seeing link with text '" + sText + "'")
								.execute();
						},
						iSeeContactDetailsPopover: function(sTitle) {
							return (
								OpaBuilder.create(this)
									.hasType("sap.ui.mdc.link.Panel")
									// .hasAggregation("items", [
									// 	function(oItem) {
									// 		return oItem instanceof sap.m.Label;
									// 	},
									// 	{
									// 		properties: {
									// 			text: sTitle
									// 		}
									// 	}
									// ])
									.description("Contact card with title '" + sTitle + "' is present")
									.execute()
							);
						},
						iSeeQuickViewPopover: function() {
							return OpaBuilder.create(this)
								.hasType("sap.ui.mdc.link.Panel")
								.description("Seeing Quick View Details in ObjectPage")
								.execute();
						},
						iSeeQuickViewMoreLinksButton: function() {
							return OpaBuilder.create(this)
								.isDialogElement(true)
								.hasType("sap.m.Button")
								.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.POPOVER_DEFINE_LINKS"))
								.description("The 'More Links' button found")
								.execute();
						},
						iSeeObjectPageInDisplayMode: function() {
							return this._iSeeObjectPageInMode(Page_EditMode.DISPLAY);
						},
						iSeeObjectPageInEditMode: function() {
							return this._iSeeObjectPageInMode(Page_EditMode.EDITABLE);
						},
						_iSeeObjectPageInMode: function(sMode) {
							return OpaBuilder.create(this)
								.hasId(ViewId)
								.viewId(null)
								.has(function(oObjectPage) {
									return oObjectPage.getModel("ui").getProperty("/editMode") === sMode;
								})
								.description("Object Page is in mode '" + sMode + "'")
								.execute();
						},
						iSeeSectionWithTitle: function(sTitle) {
							return OpaBuilder.create(this)
								.hasType("sap.uxap.ObjectPageSection")
								.hasProperties({ title: sTitle })
								.description("Seeing section with title '" + sTitle + "'")
								.execute();
						},
						iSeeSubSectionWithTitle: function(sTitle) {
							return OpaBuilder.create(this)
								.hasType("sap.uxap.ObjectPageSubSection")
								.hasProperties({ title: sTitle })
								.description("Seeing sub-section with title '" + sTitle + "'")
								.execute();
						},
						iSeeSectionButtonWithTitle: function(sTitle, mState) {
							return FEBuilder.create(this)
								.hasId(AnchorBarId)
								.has(
									OpaBuilder.Matchers.children(
										FEBuilder.Matchers.states(mergeObjects({}, { controlType: "sap.m.Button", text: sTitle }, mState))
									)
								)
								.description(Utils.formatMessage("Seeing section button with title '{0}' and state='{1}'", sTitle, mState))
								.execute();
						},
						iSeeFlpLink: function(sDescription) {
							return OpaBuilder.create(this)
								.hasType("sap.ui.mdc.link.PanelListItem")
								.isDialogElement(true)
								.hasProperties({ text: sDescription })
								.description("FLP link with text '" + sDescription + "' is present")
								.execute();
						},
						iSeeSelectLinksDialog: function() {
							return OpaBuilder.create(this)
								.hasType("sap.m.Title")
								.isDialogElement(true)
								.has(OpaBuilder.Matchers.resourceBundle("text", "sap.ui.mdc", "info.SELECTION_DIALOG_ALIGNEDTITLE"))
								.description("Seeing dialog open")
								.execute();
						},
						iDoNotSeeFlpLink: function(sDescription) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Link")
								.isDialogElement(true)
								.check(function(links) {
									var bFound = links.some(function(link) {
										return link.getText() === sDescription;
									});
									return bFound === false;
								}, true)
								.description("FLP link with text '" + sDescription + "' is not found")
								.execute();
						},
						iSeeTitleLink: function(sDescription, sIntent) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Link")
								.isDialogElement(true)
								.hasProperties({ text: sDescription, href: sIntent })
								.description("QuickView Title link with text '" + sDescription + "' is found")
								.execute();
						},
						iSeeVHD: function(oField) {
							var sDialogId = getVHDFieldId(oField) + "-dialog";
							return OpaBuilder.create(this)
								.hasId(sDialogId)
								.description("Seeing value help dialog for field '" + oField.field + "'")
								.execute();
						},
						iSeeVHDTable: function(oField) {
							var sVHDTableId = getVHDFieldId(oField) + "::Table";
							return OpaBuilder.create(this)
								.hasId(sVHDTableId)
								.hasAggregation("items")
								.description("Seeing filled value help dialog for field '" + oField.field + "'")
								.execute();
						},
						iSeeVHDFilterBar: function(oField) {
							var sVHDFilterBarId = getVHDFieldId(oField) + "::FilterBar";
							return OpaBuilder.create(this)
								.hasId(sVHDFilterBarId)
								.description("Seeing value help filterbar for field '" + oField.field + "'")
								.execute();
						},
						iSeeSaveConfirmation: function() {
							return this._iSeeTheMessageToast(oResourceBundleCore.getText("C_TRANSACTION_HELPER_OBJECT_SAVED"));
						},
						iSeeDeleteConfirmation: function() {
							return this._iSeeTheMessageToast(
								oResourceBundleCore.getText("C_TRANSACTION_HELPER_OBJECT_PAGE_DELETE_TOAST_SINGULAR")
							);
						},
						iSeeConfirmMessageBoxWithTitle: function(sTitle) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Dialog")
								.isDialogElement(true)
								.hasProperties({ title: sTitle })
								.description("Seeing Message dialog open")
								.execute();
						},
						iSeeMoreFormContent: function(sSectionId) {
							return OpaBuilder.create(this)
								.hasId(OPFormIdPrefix + "::" + sSectionId + "::MoreContent")
								.description("Seeing More Form Content in " + sSectionId)
								.execute();
						},
						iDoNotSeeMoreFormContent: function(sSectionId) {
							return OpaBuilder.create(this)
								.hasType("sap.ui.layout.form.Form")
								.check(function(aElements) {
									var bFound = aElements.some(function(oElement) {
										return oElement.getId().includes(sSectionId + "::MoreContent");
									});
									return bFound === false;
								})
								.description("Not Seeing More Form Content in " + sSectionId)
								.execute();
						},
						iSeeControlVMTableTitle: function(sTitle, sNavProperty) {
							return OpaBuilder.create(this)
								.hasType("sap.m.Title")
								.hasId(getTableId(sNavProperty) + "::VM-text")
								.hasProperties({ text: sTitle })
								.description("Seeing variant title '" + sTitle + "'")
								.execute();
						},
						iCheckCreateDialog: function() {
							return OpaBuilder.create(this)
								.isDialogElement()
								.hasType("sap.m.Dialog")
								.has(OpaBuilder.Matchers.resourceBundle("title", "sap.fe.core", "C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"))
								.description("Creation dialog is opened")
								.execute();
						},
						iCheckValueOfFieldInCreateDialog: function(sFieldId, sValue, sAdditionalValue, bIsRequired) {
							return FieldBuilder.create(this)
								.isDialogElement()
								.hasId(sFieldId)
								.hasValue(sValue, sAdditionalValue)
								.hasProperties({ required: !!bIsRequired })
								.description(
									Utils.formatMessage(
										"Seeing field '{0}' with value '{1}'",
										sFieldId,
										[].concat(sValue, sAdditionalValue || [])
									)
								)
								.execute();
						},

						iSeeCreateButton: function(bEnabled) {
							bEnabled = bEnabled !== false;
							return FEBuilder.create(this)
								.hasType("sap.m.Button")
								.hasProperties({ text: "Create" })
								.isDialogElement(true)
								.mustBeEnabled(bEnabled)
								.checkNumberOfMatches(1)
								.description("Create button is visible")
								.execute();
						}
					}
				});
			}
		};
	}
);
