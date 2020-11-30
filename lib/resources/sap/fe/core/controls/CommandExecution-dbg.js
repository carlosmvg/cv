sap.ui.define(["sap/ui/core/CommandExecution"], function(CommandExecution) {
	"use strict";
	return CommandExecution.extend("sap.fe.core.controls.CommandExecution", {
		setParent: function(oParent) {
			var aExcludedSingleKey = ["delete", "escape"],
				aCommands;
			CommandExecution.prototype.setParent.apply(this, arguments);
			aCommands = oParent.data("sap.ui.core.Shortcut");
			if (Array.isArray(aCommands) && aCommands.length > 0) {
				var oCommand = oParent.data("sap.ui.core.Shortcut")[aCommands.length - 1],
					oShortcut = oCommand.shortcutSpec;
				if (oShortcut && aExcludedSingleKey.indexOf(oShortcut.key) > -1) {
					// Check if single key shortcut
					for (var key in oShortcut) {
						if (oShortcut[key] && key !== "key") {
							return this;
						}
					}
					// Need to disable ShortCut when user press single shortcut key into an input
					oParent.addDelegate(
						{
							"onkeydown": function(oEvent) {
								if (aExcludedSingleKey.indexOf(oEvent.key.toLowerCase()) > -1) {
									var sElement = oEvent.target ? oEvent.target.tagName.toLowerCase() : undefined;
									if (sElement === "input") {
										oEvent.setMarked();
									}
								}
							}
						},
						true,
						undefined,
						true
					);
				}
				return this;
			}
		}
	});
});
