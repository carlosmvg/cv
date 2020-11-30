sap.ui.define(["./BaseArrangements", "./BaseActions", "./BaseAssertions", "sap/base/Log"], function(
	BaseArrangements,
	BaseActions,
	BaseAssertions,
	Log
) {
	"use strict";

	Log.setLevel(1, "sap.ui.test.matchers.Properties");
	Log.setLevel(1, "sap.ui.test.matchers.Ancestor");

	return {
		actions: new BaseActions(),
		assertions: new BaseAssertions(),
		arrangements: new BaseArrangements(),
		viewNamespace: "sap.fe.templates",
		autoWait: true,
		timeout: 60,
		logLevel: "ERROR",
		disableHistoryOverride: true,
		asyncPolling: true
	};
});
