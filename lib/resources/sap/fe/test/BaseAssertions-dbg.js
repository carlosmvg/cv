sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/OpaBuilder", "sap/fe/test/builder/FEBuilder", "sap/fe/test/Utils"], function(
	Opa5,
	OpaBuilder,
	FEBuilder,
	Utils
) {
	"use strict";
	// All common assertions for all Opa tests are defined here
	return Opa5.extend("sap.fe.integrations.common.BaseAssertions", {
		iSeeListReport: function() {
			return OpaBuilder.create(this)
				.viewName("ListReport.ListReport")
				.description("ListReport is visible")
				.execute();
		},
		iSeeObjectPage: function() {
			return OpaBuilder.create(this)
				.viewName("ObjectPage.ObjectPage")
				.description("ObjectPage is visible")
				.execute();
		},
		iSeeShellNavHierarchyItem: function(sItemTitle, iItemPosition, iItemNumbers, sItemDesc) {
			return OpaBuilder.create(this)
				.viewId(null)
				.hasId("sapUshellNavHierarchyItems")
				.hasAggregationLength("items", iItemNumbers)
				.has(OpaBuilder.Matchers.aggregationAtIndex("items", iItemPosition - 1))
				.hasProperties({ title: sItemTitle, description: sItemDesc })
				.description(
					Utils.formatMessage(
						"Checking Navigation Hierarchy Items ({2}): Name={0}, Position={1}, Description={3}",
						sItemTitle,
						iItemPosition,
						iItemNumbers,
						sItemDesc
					)
				)
				.execute();
		},
		iSeeShellAppTitle: function(sTitle) {
			return OpaBuilder.create(this)
				.viewId(null)
				.hasId("shellAppTitle")
				.hasProperties({ text: sTitle })
				.description(sTitle + " is the Shell App Title")
				.execute();
		},
		iSeeFlpDashboard: function() {
			return OpaBuilder.create(this)
				.hasId("sapUshellDashboardPage")
				.description("Seeing FLP Dashboard")
				.execute();
		},
		iSeeMessagePage: function(sMessage) {
			return OpaBuilder.create(this)
				.hasType("sap.m.MessagePage")
				.hasProperties({ text: sMessage })
				.description("Error Page is visible")
				.execute();
		},
		iSeeMessageToast: function(sText) {
			return FEBuilder.createMessageToastBuilder(sText).execute(this);
		}
	});
});
