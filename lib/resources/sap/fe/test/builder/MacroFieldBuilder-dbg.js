sap.ui.define(["./FEBuilder", "./MdcFieldBuilder", "sap/ui/test/OpaBuilder", "sap/fe/test/Utils"], function(
	FEBuilder,
	FieldBuilder,
	OpaBuilder,
	Utils
) {
	"use strict";

	function _getValueMatcher(oControl, vExpectedValue) {
		if (oControl.isA("sap.ui.mdc.Field")) {
			return FieldBuilder.Matchers.value(vExpectedValue);
		}
		if (oControl.isA("sap.m.InputBase")) {
			return OpaBuilder.Matchers.properties({ value: vExpectedValue });
		}
		if (oControl.isA("sap.ui.unified.Currency")) {
			return OpaBuilder.Matchers.properties({ value: vExpectedValue.value, currency: vExpectedValue.description });
		}
		return OpaBuilder.Matchers.properties({ text: vExpectedValue });
	}

	function _getStateMatcher(oControl, sName, vValue) {
		if (oControl.isA("sap.ui.mdc.Field")) {
			return FieldBuilder.Matchers.state(sName, vValue);
		}
		return FEBuilder.Matchers.state(sName, vValue);
	}

	function _getMainControls(oContent) {
		if (oContent.isA("sap.fe.core.controls.FormElementWrapper")) {
			// we need to do this to be able to retrieve the child of the FormElementWrapper when its child is not visible
			return _getMainControls(oContent.getContent());
		}
		return oContent.isA("sap.ui.mdc.Field") ||
			oContent.isA("sap.m.Text") ||
			oContent.isA("sap.m.Label") ||
			oContent.isA("sap.m.Link") ||
			oContent.isA("sap.m.ObjectStatus") ||
			oContent.isA("sap.m.InputBase") ||
			oContent.isA("sap.m.Avatar") ||
			oContent.isA("sap.ui.unified.Currency")
			? [oContent]
			: OpaBuilder.Matchers.children(
					OpaBuilder.create().hasSome(
						FEBuilder.Matchers.state("controlType", "sap.ui.mdc.Field"),
						FEBuilder.Matchers.state("controlType", "sap.m.Text"),
						FEBuilder.Matchers.state("controlType", "sap.m.Label"),
						FEBuilder.Matchers.state("controlType", "sap.m.Link"),
						FEBuilder.Matchers.state("controlType", "sap.m.ObjectStatus"),
						FEBuilder.Matchers.state("controlType", "sap.m.InputBase"),
						FEBuilder.Matchers.state("controlType", "sap.m.Avatar"),
						FEBuilder.Matchers.state("controlType", "sap.ui.unified.Currency")
					)
			  )(oContent);
	}

	var MacroFieldBuilder = function() {
		return FEBuilder.apply(this, arguments);
	};

	MacroFieldBuilder.create = function(oOpaInstance) {
		return new MacroFieldBuilder(oOpaInstance);
	};

	MacroFieldBuilder.prototype = Object.create(FEBuilder.prototype);
	MacroFieldBuilder.prototype.constructor = MacroFieldBuilder;

	/**
	 * Returns the state matcher for the MdcField control.
	 * @param mState
	 * @returns {*}
	 * @protected
	 */
	MacroFieldBuilder.prototype.getStatesMatcher = function(mState) {
		return MacroFieldBuilder.Matchers.states(mState);
	};

	MacroFieldBuilder.prototype.hasValue = function(vValue) {
		// silently ignore undefined argument for convenience
		if (vValue === undefined) {
			return this;
		}
		return this.has(MacroFieldBuilder.Matchers.value(vValue));
	};

	MacroFieldBuilder.prototype.hasState = function(mState) {
		// silently ignore undefined argument for convenience
		if (!mState) {
			return this;
		}
		return this.has(MacroFieldBuilder.Matchers.states(mState));
	};

	MacroFieldBuilder.Matchers = {
		value: function(vExpectedValue) {
			return function(oControl) {
				var aMainControls = _getMainControls(oControl);
				return aMainControls.some(function(oMainControl) {
					return OpaBuilder.Matchers.match(_getValueMatcher(oMainControl, vExpectedValue))(oMainControl);
				});
			};
		},
		state: function(sName, vValue) {
			return function(oControl) {
				var aMainControls = _getMainControls(oControl);
				return aMainControls.some(function(oMainControl) {
					return OpaBuilder.Matchers.match(_getStateMatcher(oMainControl, sName, vValue))(oMainControl);
				});
			};
		},
		states: function(mStateMap) {
			if (!Utils.isOfType(mStateMap, Object)) {
				return OpaBuilder.Matchers.TRUE;
			}
			return FEBuilder.Matchers.match(
				Object.keys(mStateMap).map(function(sProperty) {
					return MacroFieldBuilder.Matchers.state(sProperty, mStateMap[sProperty]);
				})
			);
		}
	};

	return MacroFieldBuilder;
});
