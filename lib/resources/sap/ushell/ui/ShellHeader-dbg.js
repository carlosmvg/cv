// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/core/theming/Parameters",
    "sap/ui/Device",
    "sap/ui/dom/units/Rem",
    "sap/ushell/utils",
    "sap/ushell/EventHub",
    "sap/ushell/ui/shell/ShellAppTitle",
    "./ShellHeaderRenderer"
], function (
    Control,
    ThemingParameters,
    Device,
    Rem,
    utils,
    EventHub
    // ShellAppTitle
    // ShellHeaderRenderer
) {
    "use strict";

    var sSearchOverlayCSS = "sapUshellShellShowSearchOverlay";

    var _iSearchWidth = 0; // width as requested by the SearchShellHelper
    var _sCurrentTheme; // the name of the currently active theme
    var _sNoLogo = "data:image/png;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // 1px transparent PNG
    var _sSapLogo = sap.ui.require.toUrl("sap/ushell") + "/themes/base/img/SAPLogo.svg";

    var ShellHeader = Control.extend("sap.ushell.ui.ShellHeader", {
        /** @lends sap.ushell.ui.ShellHeader.prototype */
        metadata: {
            properties: {
                /*
                Company logo in the header.
                If not set, the "sapUiGlobalLogo" of the current theme is used.
                If the "sapUiGlobalLogo" is "none", SAP logo is displayed.
                */
                logo: { type: "sap.ui.core.URI", defaultValue: "" },
                showLogo: { type: "boolean", defaultValue: true },
                homeUri: { type: "sap.ui.core.URI", defaultValue: "#" }, /* URI to navigate when the user presses the logo */
                searchState: { type: "string", defaultValue: "COL" },
                ariaLabel: { type: "string" },
                centralAreaElement: { type: "string", defaultValue: null },
                title: { type: "string", defaultValue: "" }
            },
            aggregations: {
                headItems: { type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true },
                headEndItems: { type: "sap.ushell.ui.shell.ShellHeadItem", multiple: true },
                search: { type: "sap.ui.core.Control", multiple: false },
                appTitle: { type: "sap.ushell.ui.shell.ShellAppTitle", multiple: false }
            },
            associations: {
                shellLayout: { type: "sap.ui.base.ManagedObject", multiple: false }
            },
            events: {
                searchSizeChanged: {}
            }
        }
    });

    /**
     * @returns {sap.ui.core.Control} the related ShellLayout control
     * @private
     */
    ShellHeader.prototype.getShellLayoutControl = function () {
        return sap.ui.getCore().byId(this.getShellLayout());
    };

    /**
     * Create a separate UI Area and place the Shell Header therein
     * @param {string} [sId="canvas"] ID of the shell UI Area
     * @private
     */
    ShellHeader.prototype.createUIArea = function (sId) {
        var headerArea = window.document.getElementById("shell-hdrcntnt");
        var canvas = window.document.getElementById(sId || "canvas");
        if (canvas && !headerArea) {
            canvas.insertAdjacentHTML("beforebegin", "<div id=\"shell-hdr\" class=\"sapContrastPlus sapUshellShellHead\"></div>");
            if (!this.getVisible()) {
                this.setVisible(false); // force hide outer divs
            }
            this.placeAt("shell-hdr");
        }
    };

    /**
     * The search states that can be passed as a parameter to the setSearchState.
     * Values:
     * COL - search field is hidden
     * EXP - search field is visible, other shell header elements can be hidden
     * EXP_S - search field is visible, other elements in the header remain visible
     */
    ShellHeader.prototype.SearchState = {
        COL: "COL",
        EXP: "EXP",
        EXP_S: "EXP_S"
    };

    ShellHeader.prototype.init = function () {
        Device.media.attachHandler(this.refreshLayout, this, Device.media.RANGESETS.SAP_STANDARD);
        Device.resize.attachHandler(this.refreshLayout, this);

        this._fnFocusListener = this._handleFocus.bind(this);

        this.addDelegate({
            onBeforeFastNavigationFocus: function (oEvent) {
                oEvent.preventDefault();
                this._accessKeyHandler.sendFocusBackToShell(oEvent);
            }.bind(this)
        });

        /*
         * Calling shell navigation directly here would cause
         * sap.ushell.Container to load and instantiate ShellNavigation early.
         * This causes Shell.controller#getServiceAsync("ShellNavigation") to
         * load the service faster, therefore soon executing ShellNavigation
         * initialization code. In the past we implemented an optimization that
         * prioritized rendering and delayed all processing on the critical
         * path.  Navigation included. To preserve that optimization we let
         * shell controller initialize ShellNavigation before using it here.
         */
        EventHub.once("ShellNavigationInitialized").do(function () {
            var oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
            this._rerenderLogoNavigationFilterBound = this._rerenderLogoNavigationFilter.bind(this);

            oShellNavigation.registerNavigationFilter(this._rerenderLogoNavigationFilterBound);
            this._rerenderLogoNavigationFilterBound.detach = function () {
                oShellNavigation.unregisterNavigationFilter(this._rerenderLogoNavigationFilterBound);
            };
        }.bind(this));
    };

    /**
     * This hook is called before the shell header control is destroyed
     * @private
     */
    ShellHeader.prototype.exit = function () {
        Device.media.detachHandler(this.refreshLayout, this, Device.media.RANGESETS.SAP_STANDARD);
        Device.resize.detachHandler(this.refreshLayout, this);
        var oShellHeader = window.document.getElementById("shell-hdr");
        if (oShellHeader) {
            oShellHeader.parentElement.removeChild(oShellHeader);
        }

        if (this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter) {
            this._rerenderLogoNavigationFilterfnRerenderLogoNavigationFilter.detach();
        }
    };

    ShellHeader.prototype._toggleFocusListener = function (bToggle) {
        var oAccessibilityHelper = window.document.getElementById("sapUshellHeaderAccessibilityHelper");
        if (oAccessibilityHelper) {
            oAccessibilityHelper[bToggle ? "addEventListener" : "removeEventListener"]("focus", this._fnFocusListener);
        }
    };

    /**
     * Set Access Key Handler
     * @param {object} AccessKeyHandler AccessKeyHandler
     * @private
     */
    ShellHeader.prototype.setAccessKeyHandler = function (AccessKeyHandler) {
        this._accessKeyHandler = AccessKeyHandler;
    };

    /**
     * Handle keyboard navigation when focus is send to the ShellHeader.
     *
     * @param {object} oEvent event that was fired
     * @private
     */
    ShellHeader.prototype._handleFocus = function (oEvent) {
        var that = this;
        function sendFocusToShellHeader () {
            if (that._accessKeyHandler.bForwardNavigation) {
                var aHeaderItems = that.getHeadItems();

                if (aHeaderItems.length > 0) {
                    aHeaderItems[0].focus();
                } else {
                    that.getAppTitle().focus();
                }
            } else {
                var aHeaderEndItems = that.getHeadEndItems();
                if (aHeaderEndItems.length > 0) {
                    aHeaderEndItems[aHeaderEndItems.length - 1].focus();
                } else {
                    that.getAppTitle().focus();
                }
            }
            that._accessKeyHandler.fromOutside = false;
        }

        if (this._accessKeyHandler) {
            if (this._accessKeyHandler.fromOutside || this._accessKeyHandler.bForwardNavigation) {
                sendFocusToShellHeader();
            } else {
                this._accessKeyHandler._handleEventUsingExternalKeysHandler(oEvent);
                var oAccessibilityHelper = window.document.getElementById("sapUshellHeaderAccessibilityHelper");
                if (window.document.activeElement === oAccessibilityHelper) {
                    var aSelectables = window.document.querySelectorAll("#canvas [tabindex='0']");
                    if (aSelectables.length) {
                        aSelectables[aSelectables.length - 1].focus();
                    } else {
                        sendFocusToShellHeader();
                        return;
                    }
                }
                this._accessKeyHandler.bFocusOnShell = false;
            }
        }
    };

    /**
     * Handle space key when focus is in the ShellHeader.
     *
     * @param {object} oEvent - the keyboard event
     * @private
     */
    ShellHeader.prototype.onsapspace = function (oEvent) {
        // Navigate home when a user presses the space keyboard button in the logo
        if (oEvent.target === this.getDomRef("logo")) {
            window.location.href = oEvent.target.href;
        }
    };

    ShellHeader.prototype.onBeforeRendering = function () {
        this._toggleFocusListener(false);
    };

    ShellHeader.prototype.onAfterRendering = function () {
        // ShellHeader may render earlier than the initial theme is loaded.
        // Check this situation and hide the unstyled content.
        // Ideally, getComputedStyle should be used, but getBoundingClientRect is faster
        var oHeaderElement = this.getDomRef();
        if (!_sCurrentTheme && oHeaderElement.parentElement.getBoundingClientRect().height > 0) {
            // The header has position:static -> the library style is not applied yet -> hide it
            oHeaderElement.style.visibility = "hidden";
            oHeaderElement.style.height = "2.75rem";
            return;
        }

        this.refreshLayout();
        this._toggleFocusListener(true);
    };

    ShellHeader.prototype.onThemeChanged = function (oEvent) {
        _sCurrentTheme = oEvent.theme;
        this.invalidate();
    };

    // RTA uses .getLogo to find the current logo URL.
    // Modify getLogo until a better way is implemented in RTA
    // Logo priority: 1) specifically set, 2) theme not applied - empty, 3) theme applied - theme image or SAP logo
    ShellHeader.prototype.getLogo = function () {
        return this.getProperty("logo") || (sap.ui.getCore().isThemeApplied() ? ThemingParameters._getThemeImage() || _sSapLogo : _sNoLogo);
    };

    /**
     * Recalulates the sizes and what should be shown on the shellHeader
     * @protected
     */
    ShellHeader.prototype.refreshLayout = function () {
        if (!this.getDomRef()) {
            return;
        }
        this._setAppTitleFontSize();

        // Search field related logic:
        if (this.getSearchVisible()) {
            var oSearch = this.getDomRef("hdr-search");
            oSearch.style.display = "none";
            this._hideElementsForSearch();
            oSearch.style.display = "";
            oSearch.style["max-width"] = _iSearchWidth + "rem";
            this.fireSearchSizeChanged({
                remSize: Rem.fromPx(oSearch.getBoundingClientRect().width),
                isFullWidth: this.isPhoneState()
            });
        }
    };

    /**
     * If there is not enought space for the App title, reduce the font size
     * @private
     */
    ShellHeader.prototype._setAppTitleFontSize = function () {
        var oBeginContainer = this.getDomRef("hdr-begin"),
            oAppTitle = window.document.getElementById("shellAppTitle"),
            cssClassName = "sapUshellHeadTitleWithSmallerFontSize";

        if (oBeginContainer && oAppTitle && oAppTitle.style.display !== "none") {
            var oTitle = oAppTitle.querySelector("h1");
            if (oTitle) {
                oTitle.classList.remove(cssClassName);
                oAppTitle.style.overflow = "visible";

                var oBeginContainerRect = oBeginContainer.getBoundingClientRect(),
                    iBeginContainerLeft = oBeginContainerRect.x + oBeginContainerRect.width,
                    oAppTitleRect = oAppTitle.getBoundingClientRect(),
                    iAppTitleLeft = oAppTitleRect.x + oAppTitleRect.width;

                if (iAppTitleLeft > iBeginContainerLeft) {
                    oTitle.classList.add(cssClassName);
                    oAppTitle.style.overflow = "hidden";
                }
            }
        }
    };

    ShellHeader.prototype.removeHeadItem = function (vItem) {
        if (typeof vItem === "number") {
            vItem = this.getHeadItems()[vItem];
        }
        this.removeAggregation("headItems", vItem);
    };

    ShellHeader.prototype.addHeadItem = function (oItem) {
        this.addAggregation("headItems", oItem);
    };

    ShellHeader.prototype.isPhoneState = function () {
        var deviceType = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name;
        var bEnoughSpaceForSearch = window.document.getElementById(this.getId()).getBoundingClientRect().width > _iSearchWidth;
        return (Device.system.phone || deviceType === "Phone" || !bEnoughSpaceForSearch);
    };

    /**
     * @param {string} sStateName The search state to be set. The validate values are - COL, EXP, EXP_S.
     * @param {string} [maxRemSize] The optional max width in rem.
     * @param {boolean} [bWithOverlay] If the state is EXP the overlay appears according to this parameter (the default is true).
     */
    ShellHeader.prototype.setSearchState = function (sStateName, maxRemSize, bWithOverlay) {
        if (this.SearchState[sStateName] && this.getSearchState() !== sStateName) {
            if (typeof maxRemSize === "boolean") {
                bWithOverlay = maxRemSize;
                maxRemSize = undefined;
            }

            this.setProperty("searchState", sStateName, false);

            var bShow = (sStateName !== "COL");
            var shellLayout = this.getShellLayoutControl();
            if (shellLayout) {
                shellLayout.toggleStyleClass(sSearchOverlayCSS, bShow && bWithOverlay);
            }

            // save for animation after rendering
            _iSearchWidth = bShow ? maxRemSize || 35 : 0;
        }
    };

    // When the search field is opened, hide header elements, one after another,
    // until the requested width is provided
    ShellHeader.prototype._hideElementsForSearch = function () {
        var nReqWidth,
            oSearchContainer = this.getDomRef("hdr-search-container"),
            oBeginContainer = this.getDomRef("hdr-begin"),
            oCenterContainer = this.getDomRef("hdr-center"),
            oEndContainer = this.getDomRef("hdr-end");

        if (this.getSearchState() === "EXP" || this.isPhoneState()) {
            nReqWidth = Rem.toPx(_iSearchWidth + 3); // 3 rem minimal distance for EXP
        } else {
            nReqWidth = Rem.toPx(9 + 0.5); // minimal search width for EXP_S
        }

        // order of elements: center container, left items in reverse order, left container, right container
        var aElements = [oBeginContainer];
        // add left items in reverse order before the begin container
        // IE11: NodeList does not have the forEach function
        Array.prototype.forEach.call(oBeginContainer.childNodes, function (element) {
            aElements.unshift(element);
        });
        // center container is hidden first
        if (oCenterContainer) {
            aElements.unshift(oCenterContainer);
        }

        // restore all hidden elements to unhide some or all of them when the user makes the window wider
        oBeginContainer.style.flexBasis = "";
        oEndContainer.style.display = "";
        aElements.forEach(function (e) {
            e.style.display = "";
        });
        // remove elements one-by-one
        for (var i = 0; i < aElements.length; i++) {
            if (nReqWidth > oSearchContainer.getBoundingClientRect().width) {
                aElements[i].style.display = "none";
                if (oCenterContainer && i === 0) {
                    oBeginContainer.style.flexBasis = "auto";
                }
            } else {
                return; // finished, do not hide any more elements
            }
        }
        // last attempt to get the required space: hide the end items container
        if (Rem.toPx(_iSearchWidth) > oSearchContainer.getBoundingClientRect().width) { // no minimal distance for the head-end items
            oEndContainer.style.display = "none";
        }
    };

    /**
     * @returns {integer} the max width of the search field in rem
     * @private
     */
    ShellHeader.prototype.getSearchWidth = function () {
        return _iSearchWidth;
    };

    /**
     * @returns {boolean} true if the current page is the homepage
     */
    ShellHeader.prototype.isHomepage = function () {
        var sHash = (window.hasher && "#" + window.hasher.getHash()) || "";

        var rIntentParameterBeforeAppRoute = new RegExp(
            "[?]" + // question mark character
            "(?:" + // begin non capturing block
                "(?!&[/])." + // any character which is not '&' followed by '/'
            ")*" // repeat
        );
        var sHashNoParams = sHash.replace(rIntentParameterBeforeAppRoute, "");

        return utils.isRootIntent(sHashNoParams) || sHashNoParams === "#Launchpad-openFLPPage";
    };

    ShellHeader.prototype._rerenderLogoNavigationFilter = function (sNewHash, sOldHash) {
        var oShellNavigation = sap.ushell.Container.getService("ShellNavigation");
        var bAppSpecificChange = oShellNavigation.hashChanger.isInnerAppNavigation(sNewHash, sOldHash);
        if (bAppSpecificChange) {
            this.invalidate(); // enable/disable logo
        }

        return oShellNavigation.NavigationFilterStatus.Continue;
    };

    // Returns true when the search field is visible
    ShellHeader.prototype.getSearchVisible = function () {
        return this.getSearchState() !== this.SearchState.COL;
    };

    ShellHeader.prototype.getCentralControl = function () {
        return sap.ui.getCore().byId(this.getCentralAreaElement());
    };

    ShellHeader.prototype.setNoLogo = function () {
        this.setLogo(_sNoLogo);
    };

    /**
     * @returns {boolean} true if FLP runs in lean mode (no back button, no home button)
     * @private
     */
    ShellHeader.prototype._getLeanMode = function () {
        return (window.location.search || "").indexOf("appState=lean") >= 0;
    };

    return ShellHeader;
}, true /* bExport */);
