// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
/**
 * @fileOverview The Unified Shell's bookmark service, which allows you to create shortcuts on the
 * user's home page.
 *
 * @version 1.82.2
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/base/util/deepClone",
    "sap/base/util/deepExtend"
], function (jQuery, Config, library, deepClone, deepExtend) {
    "use strict";

    /**
     * This method MUST be called by the Unified Shell's container only, others MUST call
     * <code>sap.ushell.Container.getService("Bookmark")</code>.
     * Constructs a new instance of the bookmark service.
     *
     * @name sap.ushell.services.Bookmark
     *
     * @class The unified shell's bookmark service, which allows you to create shortcuts on the
     * user's home page.
     *
     * @constructor
     * @see sap.ushell.services.Container#getService
     * @since 1.15.0
     * @public
     */
    function Bookmark () {
        var oLaunchPageService = sap.ushell.Container.getService("LaunchPage");

        /**
         * Returns <code>true</code> if the given catalog data matches a remote catalog. This
         * requires that the LaunchPageAdapter supports getCatalogData().
         * @param {object} oCatalog
         *   a catalog as given from LaunchPage service
         * @param {object} oRemoteCatalogData
         *   the description of the catalog from a remote system
         * @param {string} oRemoteCatalogData.remoteId
         *   the catalog ID in the remote system
         * @param {string} oRemoteCatalogData.baseUrl
         *   the base URL of the catalog in the remote system
         *
         * @returns {boolean} True if the given catalog data matches a remote catalog.
         * @private
         */
        this._isMatchingRemoteCatalog = function (oCatalog, oRemoteCatalogData) {
            var oCatalogData = oLaunchPageService.getCatalogData(oCatalog);
            // systemAlias is not considered yet, which might lead to multiple matches
            return oCatalogData.remoteId === oRemoteCatalogData.remoteId
                && oCatalogData.baseUrl.replace(/\/$/, "")
                === oRemoteCatalogData.baseUrl.replace(/\/$/, ""); // ignore trailing slashes
        };

        /**
         * Adds bookmarks with the provided bookmark data to the specified content nodes.
         *
         * @param {object} oBookmarkParams Parameters which are necessary to create a bookmark
         * @param {ContentNode[]} aContentNodes An array of content nodes to which the bookmark should be added
         *
         * @returns {Promise<(void|string)>}
         *  The promise is resolved if the bookmark could be added to all content nodes.
         *  The promise is rejected with an error message if the bookmark couldn't be saved.
         *
         * @see sap.ushell.services.Bookmark#addBookmark
         * @since 1.81
         * @private
         */
        this._addBookmarkToContentNodes = function (oBookmarkParams, aContentNodes) {
            var ContentNodeType = library.ContentNodeType;

            var aPromises = aContentNodes.map(function (oContentNode) {
                if (oContentNode && oContentNode.hasOwnProperty("type") && oContentNode.isContainer) {
                    switch (oContentNode.type) {
                        case ContentNodeType.Page:
                            return this.addBookmarkToPage(oBookmarkParams, oContentNode.id);
                        case ContentNodeType.HomepageGroup:
                            return new Promise(function (resolve, reject) {
                                oLaunchPageService.getGroupById(oContentNode.id)
                                    .done(resolve)
                                    .fail(reject);
                                })
                                .then(function (oGroup) {
                                    return this.addBookmarkToHomepageGroup(oBookmarkParams, oGroup);
                                }.bind(this));
                        default:
                            return Promise.reject("Bookmark Service: The API needs to be called with a valid content node type. '" + oContentNode.type + "' is not supported.");
                    }
                }
                return Promise.reject("Bookmark Service: Not a valid content node.");
            }.bind(this));

            return Promise.all(aPromises);
        };

        /**
         * Adds a bookmark tile to one of the user's classic homepage groups or to multiple provided content nodes.
         *
         * @param {object} oParameters
         *   Bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell, the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The information text of the bookmark. This property is not relevant if CDM is used.
         * @param {string} [oParameters.subtitle]
         *   The subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         *   This property is not relevant in the CDM context.
         * @param {(object|ContentNode|ContentNode[])} [vContainer]
         *   Either a legacy launchpad home page group, one content node or an array of content nodes. (@see Bookmark#getContentNodes)
         *   If not provided, the bookmark will be added to the default group if spaces mode is not active.
         *
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> promise which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified or implied group.
         *   The promise gets resolved if personalization is disabled.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.15.0
         * @public
         * @alias sap.ushell.services.Bookmark#addBookmark
         */
        this.addBookmark = function (oParameters, vContainer) {
            var oDeferred = new jQuery.Deferred();

            // Ignore call and do not complain if personalization is disabled
            if (!Config.last("/core/shell/enablePersonalization")) {
                return oDeferred.resolve().promise();
            }

            // Check if an old Launchpad Group object was provided instead of a content node
            if ((typeof vContainer === "undefined" || !vContainer.hasOwnProperty("type")) && !Array.isArray(vContainer)) {
                this.addBookmarkToHomepageGroup(oParameters, vContainer)
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);
                return oDeferred.promise();
            }

            // Make sure we always use an array of content nodes
            var aContentNodes = [].concat(vContainer);

            this._addBookmarkToContentNodes(oParameters, aContentNodes)
                .then(oDeferred.resolve)
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Adds a custom bookmark visualization to one or multiple provided content nodes.
         *
         * @param {string} sVizType
         *   Specifies what tile should be created, for example
         *   "ssuite.smartbusiness.abap.tiles.contribution"
         *
         * @param {object} oConfig
         *   Viz type specific configuration including all parameters the visualization needs.
         * @param {string} oConfig.title
         *   Title of the visualization.
         * @param {string} oConfig.url
         *   The URL of the bookmark. If the target application shall run in the Shell, the URL has
         *   to be in the format <code>"#SemanticObject-Action?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oConfig.subtitle]
         *   Subtitle of the visualization.
         * @param {string} [oConfig.icon]
         *   Icon of the visualization.
         * @param {string} [oConfig.info]
         *   Icon of the visualization.
         * @param {object} oConfig.vizConfig
         *   Can include any app descriptor (manifest.json) namespace the visualization
         *   needs. For example sap.app/datasources.
         * @param {boolean} [oConfig.loadManifest=false]
         *   false: viz config (merged with viz type) represents the full manifest which is injected into UI5 and replaces the manifest of the viz type's component. The latter is not loaded at all.
         *   true: (experimental) Manifest of viz type's component is loaded, oConfig.vizConfig is NOT merged with the component. In future both may be merged!
         *
         * @param {object} [oConfig.chipConfig]
         *   Simplified UI2 CHIP (runtime) model allowing for creation for tiles
         *   based on the ABAP stack. This can be considered as a compatibility feature.
         *   Will end-up in vizConfig/sap.flp/chipConfig.
         * @param {string} [oConfig.chipConfig.chipId]
         *   Specifies what chip is going to be instantiated on the ABAP stack.
         * @param {object} [oConfig.chipConfig.bags]
         *   Simplified model of UI2 bags
         * @param {object} [oConfig.chipConfig.configuration]
         *   UI2 configuration parameters
         *
         * @param {(ContentNode|ContentNode[])} vContentNodes
         *   Either an array of ContentNodes or a single ContentNode in which the Bookmark will be placed.
         *
         * @returns {Promise<(void|string)>}
         *   A promise which resolves on success, but rejects
         *   with a reason-message if the bookmark couldn't be created.
         *
         * @since 1.81
         * @private
         * @ui5-restricted ssuite.smartbusiness
         *
         * @alias sap.ushell.services.Bookmark#addCustomBookmark
         */
        this.addCustomBookmark = function (sVizType, oConfig, vContentNodes) {
            if (!Config.last("/core/spaces/enabled")) {
                return Promise.reject("Bookmark Service: The API 'addCustomBookmark' is only supported in spaces mode.");
            }

            var oClonedConfig = deepClone(oConfig);
            var oBookmarkConfig = deepExtend(oClonedConfig, {
                vizType: sVizType,
                vizConfig: {
                    "sap.flp": {
                        chipConfig: oClonedConfig.chipConfig
                    },
                    "sap.platform.runtime": {
                        includeManifest: !oClonedConfig.loadManifest
                    }
                }
            });

            delete oBookmarkConfig.chipConfig;
            delete oBookmarkConfig.loadManifest;

            // Make sure we always use an array of content nodes & only process content nodes of type 'Page'.
            var aContentNodes = [].concat(vContentNodes).filter(function (oContentNode) {
                return oContentNode.type === library.ContentNodeType.Page;
            });

            return this._addBookmarkToContentNodes(oBookmarkConfig, aContentNodes);
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups in the classic homepage mode.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This property is not relevant in the CDM
         *   context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         *   This property is not relevant in the CDM context.
         * @param {object} [oGroup]
         *  Optional reference to the group the bookmark tile should be added to.
         *  If not given, the default group is used.
         *
         * @returns {Promise}
         *   A promise which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified homepage group.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.81.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkToHomepageGroup
         */
        this.addBookmarkToHomepageGroup = function (oParameters, oGroup) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API is not available in spaces mode.";
                return Promise.reject(sError);
            }

            // Delegate to launchpage service and publish event
            return new Promise(function (resolve, reject) {
                oLaunchPageService.addBookmark(oParameters, oGroup)
                    .done(function (oTile) {
                        var oData = {
                            tile: oTile,
                            group: oGroup
                        };
                        sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "bookmarkTileAdded", oData);
                        resolve();
                    })
                    .fail(reject);
            });
        };

        /**
         * Adds a bookmark tile to one of the user's pages in spaces mode.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *
         * @param {string} oParameters.title
         *   The title of the bookmark.
         * @param {string} oParameters.url
         *   The URL of the bookmark. If the target application shall run in the Shell the URL has
         *   to be in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>.
         * @param {string} [oParameters.icon]
         *   The optional icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info]
         *   The optional information text of the bookmark. This property is not relevant in the CDM
         *   context.
         * @param {string} [oParameters.subtitle]
         *   The optional subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the
         *   bookmark.
         * @param {string} [oParameters.serviceRefreshInterval]
         *   The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit]
         *   The unit for the number retrieved from <code>serviceUrl</code>.
         *   This property is not relevant in the CDM context.
         * @param {string} sPageId The ID of the page to which the bookmark should be added.
         *
         * @returns {Promise}
         *   A promise which resolves on success, but rejects
         *   with a reason-message on failure to add the bookmark to the specified page.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.75.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkToPage
         */
        this.addBookmarkToPage = function (oParameters, sPageId) {
            // Reject of in launchpad homepage mode
            if (!Config.last("/core/spaces/enabled")) {
                return Promise.reject("Bookmark Service: 'addBookmarkToPage' is not valid in launchpad homepage mode, use 'addBookmark' instead.");
            }

            // Reject if personalization is disabled
            if (!Config.last("/core/shell/enablePersonalization")) {
                return Promise.reject("Bookmark Service: Add bookmark is not allowed as the personalization functionality is not enabled.");
            }

            if (oParameters && (typeof oParameters.title !== "string" || typeof oParameters.url !== "string")) {
                return Promise.reject("Bookmark Service - Invalid bookmark data.");
            }

            // Delegate to pages service
            return sap.ushell.Container.getServiceAsync("Pages").then(function (oPagesService) {
                return oPagesService.addBookmarkToPage(sPageId, oParameters);
            });
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups by group id.
         *
         * @param {object} oParameters
         *   bookmark parameters. In addition to title and URL, a bookmark might allow additional
         *   settings, such as an icon or a subtitle. Which settings are supported depends
         *   on the environment in which the application is running. Unsupported parameters will be
         *   ignored.
         *   For list of parameters see the description for the addBookmark function
         * @param {string} [groupId]
         *   ID of the group the bookmark tile should be added to.
         *
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> promise which resolves on success, but rejects
         *   (with a reason-message) on failure to add the bookmark to the specified or implied group.
         *    In launchpad spaces mode the promise gets rejected.
         *
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.66.0
         * @private
         * @alias sap.ushell.services.Bookmark#addBookmarkByGroupId
         */
        this.addBookmarkByGroupId = function (oParameters, groupId) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'addBookmarkByGroupId' is not supported in launchpad spaces mode.";
                return jQuery.Deferred().reject(sError).promise();
            }

            return oLaunchPageService.getGroups().then(function (aGroups) {
                aGroups = jQuery.grep(
                    aGroups,
                    function (entry) {
                        return entry.id === groupId;
                    }
                );

                var oGroup = null;
                if (aGroups.length > 0) {
                    oGroup = aGroups[0];
                }

                return this.addBookmark(oParameters, oGroup);

            }.bind(this));
        };

        /**
         * Returns the list of group ids and their titles of the user together with filtering out all groups that can not
         * be selected when adding a bookmark.
         * In case of success, the <code>done</code> function gets an array of 'anonymous' groupId-title objects.
         * The order of the array is the order in which the groups will be displayed to the user.
         * the API is used from "AddBookmarkButton" by not native UI5 applications
         *
         * @returns {jQuery.Deferred} A promise that resolves to the list of groups. In launchpad spaces mode the promise gets rejected.
         *
         * @since 1.66.0
         * @private
         * @alias sap.ushell.services.Bookmark#getGroupsIdsForBookmarks
         */
        this.getShellGroupIDs = function (bGetAll) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'getShellGroupIDs' is not supported in launchpad spaces mode.";
                return jQuery.Deferred().reject(sError).promise();
            }

            var oDeferred = new jQuery.Deferred();

            oLaunchPageService.getGroupsForBookmarks(bGetAll).done(function (aGroups) {

                aGroups = aGroups.map(function (group) {
                    var newGroup = {
                        id: oLaunchPageService.getGroupId(group.object),
                        title: group.title
                    };
                    return newGroup;
                });

                oDeferred.resolve(aGroups);

            });

            return oDeferred;

        };

        /**
         * Adds the tile with the given id <code>sCatalogTileId</code> from the catalog with id
         * <code>sCatalogId</code> to the given group.
         * @param {jQuery.Deferred} oDeferred
         *   a deferred object to be resolved/rejected when finished. In case of success, no
         *   further details are passed. In case of failure, an error message is passed.
         * @param {string} sCatalogTileId
         *   the ID of the tile within the catalog
         * @param {object} oCatalog
         *   the catalog containing the catalog tile
         * @param {string} [sGroupId]
         *   The id of the group. If not given, the tile is added to the default group
         * @returns {object}
         *   <code>oDeferred</code>
         */
        this._doAddCatalogTileToGroup = function (oDeferred, sCatalogTileId, oCatalog, sGroupId) {
            var sError,
                fnFailure = oDeferred.reject.bind(oDeferred);

            function isSameCatalogTile (sCatalogTileId, oCatalogTile) {
                var sIdWithPotentialSuffix = oLaunchPageService.getCatalogTileId(oCatalogTile);

                if (sIdWithPotentialSuffix === undefined) {
                    // prevent to call undefined.indexOf.
                    // assumption is that undefined is not a valid ID, so it is not the same tile. Thus false is returned.
                    return false;
                }
                // getCatalogTileId appends the system alias of the catalog if present.
                // This must be considered when comparing the IDs.
                // see BCP 0020751295 0000142292 2017
                return sIdWithPotentialSuffix.indexOf(sCatalogTileId) === 0;
            }

            function addToGroup (oGroup) {
                oLaunchPageService.getCatalogTiles(oCatalog)
                    .fail(fnFailure)
                    .done(function (aCatalogTiles) {
                        var sGroupId = oLaunchPageService.getGroupId(oGroup),
                            bTileFound = aCatalogTiles.some(function (oCatalogTile) {
                                if (isSameCatalogTile(sCatalogTileId, oCatalogTile)) {
                                    oLaunchPageService.addTile(oCatalogTile, oGroup)
                                        .fail(fnFailure)
                                        .done(function () { // ignore argument oTile!
                                            oDeferred.resolve();
                                            sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "catalogTileAdded", sGroupId);
                                        });
                                    return true;
                                }
                            });
                        if (!bTileFound) {
                            sError = "No tile '" + sCatalogTileId + "' in catalog '"
                                + oLaunchPageService.getCatalogId(oCatalog) + "'";
                            jQuery.sap.log.error(sError, null, "sap.ushell.services.Bookmark");
                            fnFailure(sError);
                        }
                    });
            }

            if (sGroupId) {
                oLaunchPageService.getGroups()
                    .fail(fnFailure)
                    .done(function (aGroups) {
                        var bGroupFound = aGroups.some(function (oGroup) {
                            if (oLaunchPageService.getGroupId(oGroup) === sGroupId) {
                                addToGroup(oGroup);
                                return true;
                            }
                        });
                        if (!bGroupFound) {
                            // TODO: Consider adding the tile to the default group. This would
                            // enable the user to add tiles if no valid group ID is available.
                            // Take into account how the consumer app requests the group ids.
                            sError = "Group '" + sGroupId + "' is unknown";
                            jQuery.sap.log.error(sError, null, "sap.ushell.services.Bookmark");
                            fnFailure(sError);
                        }
                    });
            } else {
                oLaunchPageService.getDefaultGroup()
                    .fail(fnFailure)
                    .done(addToGroup);
            }
            return oDeferred.promise();
        };

        /**
         * Adds the catalog tile with the given ID to given group. The catalog tile is looked up in
         * the legacy SAP HANA catalog unless data to look up a remote catalog is provided.
         *
         * @param {string} sCatalogTileId
         *   The ID of the tile within the catalog
         * @param {string} [sGroupId]
         *   The id of the group. If not given, the tile is added to the default group
         * @param {object} [oCatalogData]
         *   The data to identify the catalog containing the tile with the given ID
         * @param {string} oCatalogData.baseUrl
         *   The remote catalog's base URL such as
         *   "/sap/hba/apps/kpi/s/odata/hana_chip_catalog.xsodata/"
         * @param {string} oCatalogData.remoteId
         *   The remote catalog's id on the remote system such as "HANA_CATALOG"
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, no further details are passed.
         *   In case of failure, an error message is passed.
         *   In launchpad spaces mode the promise gets rejected.
         *
         * @since 1.21.2
         * @public
         * @alias sap.ushell.services.Bookmark#addCatalogTileToGroup
         */
        this.addCatalogTileToGroup = function (sCatalogTileId, sGroupId, oCatalogData) {
            var oDeferred = new jQuery.Deferred(),
                sError,
                fnFailure = oDeferred.reject.bind(oDeferred),
                fnMatcher,
                sLegacyHanaCatalogId = "X-SAP-UI2-HANA:hana?remoteId=HANA_CATALOG",
                that = this;

            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                sError = "Bookmark Service: The API 'addCatalogTileToGroup' is not supported in launchpad spaces mode.";
                return oDeferred.reject(sError).promise();
            }

            function isLegacyHanaCatalog (oCatalog) {
                // this is ABAP specific but should not harm other platforms
                return oLaunchPageService.getCatalogId(oCatalog) === sLegacyHanaCatalogId;
            }

            fnMatcher = oCatalogData ? this._isMatchingRemoteCatalog : isLegacyHanaCatalog;
            oCatalogData = oCatalogData || {id: sLegacyHanaCatalogId};
            // TODO first determine the catalog, then call onCatalogTileAdded incl. its ID
            oLaunchPageService.onCatalogTileAdded(sCatalogTileId);
            oLaunchPageService.getCatalogs()
                .fail(fnFailure)
                .done(function (aCatalogs) {
                    var oSourceCatalog;
                    aCatalogs.forEach(function (oCatalog) {
                        if (fnMatcher(oCatalog, oCatalogData)) {
                            if (!oSourceCatalog) {
                                oSourceCatalog = oCatalog;
                            } else {
                                // Note: We use the first match. If more than one catalog matches
                                // this might be the wrong one, resulting in a "missing tile"
                                // error. However we log the multiple catalog match before.
                                jQuery.sap.log.warning("More than one matching catalog: "
                                    + JSON.stringify(oCatalogData), null,
                                    "sap.ushell.services.Bookmark");
                            }
                        }
                    });
                    if (oSourceCatalog) {
                        that._doAddCatalogTileToGroup(oDeferred, sCatalogTileId, oSourceCatalog,
                            sGroupId);
                    } else {
                        sError = "No matching catalog found: " + JSON.stringify(oCatalogData);
                        jQuery.sap.log.error(sError, null, "sap.ushell.services.Bookmark");
                        oDeferred.reject(sError);
                    }
                });
            return oDeferred.promise();
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's pages. You
         * can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's pages have not yet been
         * loaded completely!
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or failure
         *   of this asynchronous operation. In case of success, the count of existing bookmarks
         *   is provided (which might be zero). In case of failure, an error message is passed.
         *   In launchpad spaces mode the promise gets rejected.
         * @see #addBookmark
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#countBookmarks
         */
        this.countBookmarks = function (sUrl) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'countBookmarks' is not supported in launchpad spaces mode.";
                return jQuery.Deferred().reject(sError).promise();
            }
            return oLaunchPageService.countBookmarks(sUrl);
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or
         *   failure of this asynchronous operation. In case of success, the number of deleted
         *   bookmarks is provided (which might be zero). In case of failure, an error message is
         *   passed.
         *   In launchpad spaces mode the promise gets rejected.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#deleteBookmarks
         */
        this.deleteBookmarks = function (sUrl) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'deleteBookmarks' is not supported in launchpad spaces mode.";
                return jQuery.Deferred().reject(sError).promise();
            }
            var oPromise = oLaunchPageService.deleteBookmarks(sUrl);

            oPromise.done(function () {
                sap.ui.getCore().getEventBus().publish("sap.ushell.services.Bookmark", "bookmarkTileDeleted", sUrl);
            });
            return oPromise;
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL on all of the user's pages
         * with the given new parameters. Parameters which are omitted are not changed in the
         * existing bookmarks.
         *
         * @param {string} sUrl
         *   The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as
         *   <code>oParameters.url</code>!
         * @param {object} oParameters
         *   The bookmark parameters as documented in {@link #addBookmark}.
         * @returns {jQuery.Deferred}
         *   A <code>jQuery.Deferred</code> object's promise which informs about success or
         *   failure of this asynchronous operation. In case of success, the number of updated
         *   bookmarks is provided (which might be zero). In case of failure, an error message is
         *   passed.
         *   In launchpad spaces mode the promise gets rejected.
         *
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         * @since 1.17.1
         * @public
         * @alias sap.ushell.services.Bookmark#updateBookmarks
         */
        this.updateBookmarks = function (sUrl, oParameters) {
            // Reject if in launchpad spaces mode
            if (Config.last("/core/spaces/enabled")) {
                var sError = "Bookmark Service: The API 'updateBookmarks' is not supported in launchpad spaces mode.";
                return jQuery.Deferred().reject(sError).promise();
            }
            return oLaunchPageService.updateBookmarks(sUrl, oParameters);
        };

        /**
         * @typedef {object} ContentNode
         *  A content node may be:
         *   - a classic homepage group
         *   - an unselectable node (space) or a selectable node (page) in spaces mode
         *   - or any other containers in future
         *
         * @property {string} id ID of the content node
         * @property {string} label Human-readable representation of a content node which can be displayed in a control
         * @property {sap.ushell.ContentNodeType} type Specifies the content node type. E.g: space, page, group, etc.
         * @property {boolean} isContainer Specifies if a bookmark can be added
         * @property {ContentNode[]} [children] Specifies sub-nodes
         */

        /**
         * Returns available content nodes based on the current launchpad context. (Classic homepage, spaces mode)
         *
         * @returns {Promise<ContentNode[]>} Promise resolving the currently available content nodes.
         *
         * @public
         * @since 1.81
         */
        this.getContentNodes = function () {
            var ContentNodeType = library.ContentNodeType;

            // Spaces mode
            if (Config.last("/core/spaces/enabled")) {
                return sap.ushell.Container.getServiceAsync("Menu")
                    .then(function (oMenuService) {
                        return oMenuService.getSpacesPagesHierarchy();
                    })
                    .then(function (aSpacesPagesHierarchy) {
                        return aSpacesPagesHierarchy.spaces.map(function (oSpaceEntry) {
                            return {
                                id: oSpaceEntry.id,
                                label: oSpaceEntry.title,
                                type: ContentNodeType.Space,
                                isContainer: false,
                                children: oSpaceEntry.pages.map(function (oPageEntry) {
                                    return {
                                        id: oPageEntry.id,
                                        label: oPageEntry.title,
                                        type: ContentNodeType.Page,
                                        isContainer: true
                                    };
                                })
                            };
                        });
                    });
            }

            // Classic homepage
            return new Promise(function (resolve, reject) {
                    oLaunchPageService.getGroups()
                        .done(resolve)
                        .fail(reject);
                })
                .then(function (aHomepageGroups) {
                    return aHomepageGroups.map(function (oGroup) {
                        return {
                            id: oLaunchPageService.getGroupId(oGroup),
                            label: oLaunchPageService.getGroupTitle(oGroup),
                            type: ContentNodeType.HomepageGroup,
                            isContainer: true
                        };
                    });
                });
        };
    }

    Bookmark.hasNoAdapter = true;
    return Bookmark;

}, true /* bExport */);
