sap.ui.define(["./FEBuilder", "./OverflowToolbarBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"], function(
	FEBuilder,
	OverflowToolbarBuilder,
	OpaBuilder,
	Utils
) {
	"use strict";

	var DialogBuilder = function() {
		return FEBuilder.apply(this, arguments)
			.isDialogElement()
			.hasType("sap.m.Dialog");
	};

	DialogBuilder.create = function(oOpaInstance, oOptions) {
		return new DialogBuilder(oOpaInstance, oOptions);
	};

	DialogBuilder.prototype = Object.create(FEBuilder.prototype);
	DialogBuilder.prototype.constructor = DialogBuilder;

	DialogBuilder.prototype.doOpenFooterOverflow = function() {
		return OverflowToolbarBuilder.openOverflow(this, "footer");
	};

	DialogBuilder.prototype.doPressFooterButton = function(vButtonMatcher) {
		return this.doOpenFooterOverflow().success(function(vDialog) {
			if (Array.isArray(vDialog)) {
				vDialog = vDialog.pop();
			}
			return OpaBuilder.create()
				.hasType("sap.m.Button")
				.isDialogElement()
				.has(vButtonMatcher)
				.has(OpaBuilder.Matchers.ancestor(vDialog))
				.doPress()
				.execute();
		});
	};

	return DialogBuilder;
});
