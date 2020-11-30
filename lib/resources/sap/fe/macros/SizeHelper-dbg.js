/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/Button", "sap/ui/dom/units/Rem"], function(Button, Rem) {
	"use strict";

	var SizeHelper = {
		init: function() {
			// Create a new button in static area sap.ui.getCore().getStaticAreaRef()
			this.oBtn = new Button().placeAt(sap.ui.getCore().getStaticAreaRef());
		},
		/**
		 * Method to calculate button's width from a temp created button placed in static area.
		 *
		 * @param {string} sText - text inside button.
		 * @returns {number} - measurement of the button's width.
		 */
		getButtonWidth: function(sText) {
			this.oBtn.setText(sText);
			//adding missing styles from buttons inside a table
			this.oBtn.addStyleClass("sapMListTblCell");
			// for sync rendering
			this.oBtn.rerender();
			return Rem.fromPx(this.oBtn.getDomRef().scrollWidth);
		},

		exit: function() {
			this.oBtn.destroy();
		}
	};
	return SizeHelper;
});
