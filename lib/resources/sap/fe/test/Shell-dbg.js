sap.ui.define(["sap/ui/test/OpaBuilder"], function(OpaBuilder) {
	"use strict";
	return {
		create: function() {
			return {
				viewId: null,
				actions: {
					iSelectTile: function(sTitle, sHeader) {
						return OpaBuilder.create(this)
							.hasType("sap.ushell.ui.launchpad.Tile")
							.hasProperties({
								target: sTitle
							})
							.doOnAggregation(
								"tileViews",
								OpaBuilder.Matchers.properties({
									header: sHeader
								}),
								OpaBuilder.Actions.press()
							)
							.description("Clicking on Tile: " + sTitle)
							.execute();
					},
					iOpenDefaultValues: function() {
						return OpaBuilder.create(this)
							.hasId("meAreaHeaderButton")
							.hasProperties({
								icon: "sap-icon://person-placeholder"
							})
							.doPress()
							.description("Opening FLP Default Values dialog")
							.execute();
					},
					iEnterAValueForUserDefaults: function(oField, vValue) {
						return OpaBuilder.create(this)
							.hasProperties({
								name: oField.field
							})
							.isDialogElement()
							.doEnterText(vValue)
							.description("Entering Text in the field '" + oField.field + "' with value '" + oField + "'")
							.execute();
					},
					iSelectAListItem: function(sOption) {
						return OpaBuilder.create(this)
							.hasType("sap.m.StandardListItem")
							.hasProperties({ title: sOption })
							.doPress()
							.description("Selecting Item: " + sOption)
							.execute();
					},
					iLaunchExtendedParameterDialog: function(sProperty) {
						return OpaBuilder.create(this)
							.hasType("sap.m.Button")
							.isDialogElement()
							.hasProperties({
								text: "Additional Values"
							})
							.doPress()
							.description("Launching Extended Parameter Dialog")
							.execute();
					},
					iClickOnButtonWithText: function(sText) {
						return OpaBuilder.create(this)
							.hasType("sap.m.Button")
							.hasProperties({
								text: sText
							})
							.doPress()
							.description("Clicking on Button with Text: " + sText)
							.execute();
					},
					iClickOnButtonWithIcon: function(sIcon) {
						return OpaBuilder.create(this)
							.hasType("sap.m.Button")
							.hasProperties({
								icon: "sap-icon://" + sIcon
							})
							.doPress()
							.description("Clicking on Button with Icon: " + sIcon)
							.execute();
					}
				},
				assertions: {
					iShouldSeeTheAppTile: function(sTitle) {
						return OpaBuilder.create(this)
							.hasType("sap.ushell.ui.launchpad.Tile")
							.hasProperties({
								target: sTitle
							})
							.description("Seeing Tile " + sTitle)
							.execute();
					}
				}
			};
		}
	};
});
