// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/m/MessageBox"
], function () {
    "use strict";

    // search preferences dialog view
    // =======================================================================
    return sap.ui.jsview("sap.ushell.renderers.fiori2.search.userpref.SearchPrefsDialog", {

        createContent: function (oController) {

            this.firstTimeBeforeRendering = true;

            // CheckBox for sessionUserActive (switch on/off user profiling)
            var oCheckBox = new sap.m.CheckBox({
                selected: {
                    path: "/personalizedSearch",
                    mode: sap.ui.model.BindingMode.TwoWay
                },
                text: sap.ushell.resources.i18n.getText("sp.userProfilingField"),
                enabled: "{/searchPrefsActive}"
            });

            // reset button
            this.resetButton = new sap.m.Button({
                text: sap.ushell.resources.i18n.getText("sp.clearCollectedData"),
                press: this.resetHistory.bind(this),
                enabled: {
                    parts: ['/searchPrefsActive', '/resetButtonWasClicked'],
                    formatter: function (searchPrefsActive, resetButtonWasClicked) {
                        return searchPrefsActive && !resetButtonWasClicked;
                    }
                }
            });

            // vertical layout with explanation and disclaimer
            var vLayout = new sap.ui.layout.VerticalLayout({
                content: [new sap.m.Text({
                    text: sap.ushell.resources.i18n.getText('sp.disclaimer')
                })]
            });

            // assemble
            var content = [oCheckBox, vLayout, this.resetButton];
            return content;
        },

        onBeforeRendering: function () {
            // first -> no model reload
            if (this.firstTimeBeforeRendering) {
                this.firstTimeBeforeRendering = false;
                return;
            }
            // reload model data
            this.getModel().reload();
        },

        resetHistory: function () {
            this.getModel().resetProfile().then(function () {
                // success: nothing todo
            }, function (response) {
                // error: display error popup
                var errorText = sap.ushell.resources.i18n.getText('sp.resetFailed');
                errorText += '\n' + response;
                sap.m.MessageBox.show(errorText, {
                    title: sap.ushell.resources.i18n.getText("sp.resetFailedTitle"),
                    icon: sap.m.MessageBox.Icon.ERROR,
                    actions: [sap.m.MessageBox.Action.OK]
                });
            });
        },

        formatErrorResponse: function (responseText) {
            var parsedResponseText;
            try {
                parsedResponseText = JSON.parse(responseText);
            } catch (e) {
                return responseText;
            }
            if (!parsedResponseText.ErrorDetails) {
                return responseText;
            }
            var result = [];
            for (var i = 0; i < parsedResponseText.ErrorDetails.length; ++i) {
                var errorDetail = parsedResponseText.ErrorDetails[i];
                result.push(errorDetail.Message + ' (' + errorDetail.Code + ')');
            }
            return result.join('\n');
        },

        switchChangeHandler: function (e) {
            // depreceated confirmation when switch off query log
            var oSwitch = e.getSource();
            if (oSwitch.getState()) {
                return;
            }
            var i18n = sap.ushell.resources.i18n;
            var disableText = i18n.getText("sp.disable");
            sap.m.MessageBox.confirm(i18n.getText('sp.disablingUserProfilingMsg'), {
                title: sap.ushell.resources.i18n.getText("sp.disableUserProfiling"),
                icon: sap.m.MessageBox.Icon.QUESTION,
                actions: [disableText, sap.m.MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction == sap.m.MessageBox.Action.CANCEL) {
                        oSwitch.setState(true);
                    }
                }
            });
        },

        openMessageBox: function () {
            // depreceated confirmation when reseting query log
            var that = this;
            var i18n = sap.ushell.resources.i18n;
            var clearText = i18n.getText("sp.clear");
            sap.m.MessageBox.confirm(i18n.getText('sp.profileWillBeReset'), {
                title: sap.ushell.resources.i18n.getText("sp.clearCollectedData"),
                icon: sap.m.MessageBox.Icon.QUESTION,
                actions: [clearText, sap.m.MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction == clearText) {
                        that.getModel().resetProfile();
                    }
                }
            });
        }

    });

});
