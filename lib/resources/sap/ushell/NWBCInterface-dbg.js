//Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview NWBCInterface for NWBC client
 *
 * @version 1.82.2
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/Config"
], function (EventHub, Config) {
    "use strict";

    /**
     * The NWBCInterface provides interfaces for the NWBC client to access FLP functionality
     */
    var NWBCInterface = {};

    /**
     * Notifies FLP that the user is active in the NWBC client application so FLP
     * should client session
     *
     * @private
     * @since 1.76.0
     */
    NWBCInterface.notifyUserActivity = function () {
        EventHub.emit("nwbcUserIsActive", Date.now());
    };

    /**
     * Provides FLP session timeout value
     *
     * @return {number} session time out in minutes
     *
     * @private
     * @since 1.80.0
     */
    NWBCInterface.getSessionTimeoutMinutes = function () {
        var sessionTimeoutMinutes = 0;
        if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
            sessionTimeoutMinutes = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
        }
        return sessionTimeoutMinutes;
    };

    return NWBCInterface;
});