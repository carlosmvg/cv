// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/library",
    "sap/base/util/deepClone",
    "sap/ui/core/XMLComposite",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/Device",
    "sap/m/Token",
    "sap/ushell/resources",
    "sap/ushell/Config"
], function (library, deepClone, XMLComposite, JSONModel, Filter, FilterOperator, Fragment, Device, Token, resources, Config) {
    "use strict";

    var ContentNodeType = library.ContentNodeType;

    /**
     * Constructor for a new Content Node Selector.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class The Content Node Selector is used for selecting a group or section as a destination for new bookmark tiles.
     * @extends sap.ui.core.XMLComposite
     *
     * @author SAP SE
     * @experimental Since 1.81
     *
     * @protected
     * @alias sap.ushell.ui.ContentNodeSelector
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */
    var ContentNodeSelector = XMLComposite.extend("sap.ushell.ui.ContentNodeSelector", {
        metadata: {
            library: "sap.ushell",
            associations: {
                label: {
                    type: "sap.ui.core.Control",
                    multiple: false
                }
            }
        }
    });

    ContentNodeSelector.prototype.init = function () {
        this._oModel = new JSONModel({
            items: [],
            suggestions: [],
            isSpaces: Config.last("/core/spaces/enabled")
        });
        this._oDeviceModel = new JSONModel(Device);

        this.setModel(this._oModel, "_internal");
        this.setModel(this._oDeviceModel, "_device");
        this.setModel(resources.getTranslationModel(), "_i18n");

        var oMultiInput = this.getAggregation("_content");
        oMultiInput.addValidator(this._validateItem.bind(this));

        this.setBusyIndicatorDelay(0);
        this._loadContentNodes()
            .then(this._overwriteLabel.bind(this));
    };

    /**
     * Updates the text of the associated label to the current mode the user is in.
     * This can be the classic homepage ("groups") or spaces mode ("pages").
     *
     * @private
     */
    ContentNodeSelector.prototype._overwriteLabel = function () {
        var sLabelId = this.getLabel();
        var oLabel = sap.ui.getCore().byId(sLabelId);

        if (oLabel && typeof oLabel.setText === "function") {
            if (this._oModel.getProperty("/isSpaces")) {
                oLabel.setText(resources.i18n.getText("contentNodeSelectorHomepagePages"));
            } else {
                oLabel.setText(resources.i18n.getText("contentNodeSelectorHomepageGroups"));
            }
        }

        if (oLabel && typeof oLabel.setRequired === "function" && oLabel.isPropertyInitial("required")) {
            oLabel.setRequired(true);
        }
    };

    ContentNodeSelector.prototype.exit = function () {
        this._oModel.destroy();
        this._oDeviceModel.destroy();
    };

    /**
     * Returns only the selected content nodes.
     * @returns {object[]} All selected content nodes
     */
    ContentNodeSelector.prototype.getSelectedContentNodes = function () {
        var oMultiInput = this.getAggregation("_content");
        var aTokens = oMultiInput.getTokens();

        return aTokens.map(function (oToken) {
            var oContentNode = oToken.getBindingContext("_internal").getObject();
            var oContentNodeCopy = deepClone(oContentNode);

            delete oContentNodeCopy.selected;
            delete oContentNodeCopy.spaceTitles;

            return oContentNodeCopy;
        });
    };

    /**
     * Retrieves the list of content nodes from the sap.ushell Bookmark service and saves them in the _internal model.
     *
     * @returns {Promise<void>} A promise that is resolved once the Bookmark service is loaded.
     * @private
     */
    ContentNodeSelector.prototype._loadContentNodes = function () {
        this.setBusy(true);

        return sap.ushell.Container.getServiceAsync("Bookmark")
            .then(function (oBookmarkService) {
                return oBookmarkService.getContentNodes();
            })
            .then(function (aContentNodes) {
                aContentNodes = deepClone(aContentNodes);

                ContentNodeSelector._normalizeContentNodes(aContentNodes);
                this._oModel.setProperty("/items", aContentNodes);

                var aSuggestions = ContentNodeSelector._getSuggestions(aContentNodes);

                for (var i = 0; i < aSuggestions.length; i++) {
                    aSuggestions[i].selected = false;
                }

                this._oModel.setProperty("/suggestions", aSuggestions);

                this.setBusy(false);
            }.bind(this));
    };

    /**
     * Creates and displays a value help dialog for selecting a content node.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._showValueHelp = function (event) {
        var oMultiInput = event.getSource();
        var sText = oMultiInput.getValue();

        if (!this._oValueHelpDialog) {
            Fragment.load({
                id: this.getId() + "-ValueHelpDialog",
                name: "sap.ushell.ui.ContentNodeSelectorValueHelp",
                controller: this
            }).then(function (oDialog) {
                this.addDependent(oDialog);

                this._oValueHelpDialog = oDialog;
                this._openValueHelpDialog(sText);
            }.bind(this));
        } else {
            this._openValueHelpDialog(sText);
        }
    };

    /**
     * Opens the value help dialog and expands the tree control to the first level.
     *
     * @param {string} filterText The text by which the tree should be filtered when the dialog is opened.
     * @private
     */
    ContentNodeSelector.prototype._openValueHelpDialog = function (filterText) {
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");
        oTree.expandToLevel(1);

        this._oValueHelpDialog.open();

        var oSearchInput = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesSearch");
        oSearchInput.setValue(filterText);

        // Also applies another filter
        this._onValueHelpSearch();
    };

    /**
     * Filters the tree control by the value from the search input.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpSearch = function () {
        var oSearchInput = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesSearch");
        var sFilterText = oSearchInput.getValue();
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");
        var oItemsBinding = oTree.getBinding("items");

        oItemsBinding.filter(new Filter({
            path: "label",
            operator: FilterOperator.Contains,
            value1: sFilterText
        }));
    };

    /**
     * Event handler for the begin button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpBeginButtonPressed = function () {
        var oTree = Fragment.byId(this.getId() + "-ValueHelpDialog", "ContentNodesTree");
        var aSelectedContexts = oTree.getSelectedContexts();
        var oMultiInput = this.getAggregation("_content");
        oMultiInput.destroyTokens();

        var oContext;
        var oToken;
        for (var i = 0; i < aSelectedContexts.length; i++) {
            oContext = aSelectedContexts[i];

            oToken = this._createToken(oContext);
            oMultiInput.addValidateToken({token: oToken});
        }

        oMultiInput.setValue("");
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the end button's press event.
     *
     * @private
     */
    ContentNodeSelector.prototype._onValueHelpEndButtonPressed = function () {
        this._oValueHelpDialog.close();
    };

    /**
     * Event handler for the MultiInput's tokenUpdate event.
     *
     * @param {sap.ui.base.Event} event The SAPUI5 event object.
     * @private
     */
    ContentNodeSelector.prototype._onTokenUpdate = function (event) {
        var aAddedTokens = event.getParameter("addedTokens");
        var aRemovedTokens = event.getParameter("removedTokens");

        this._setTokensSelected(aAddedTokens, true);
        this._setTokensSelected(aRemovedTokens, false);
    };

    /**
     * Updates each token's "selected" property in the internal model with the given value.
     *
     * @param {sap.m.Token[]} tokens The updated tokens.
     * @param {boolean} selected The value to be set as the new "selected" property value.
     * @private
     */
    ContentNodeSelector.prototype._setTokensSelected = function (tokens, selected) {
        var oContext;

        for (var i = 0; i < tokens.length; i++) {
            oContext = tokens[i].getBindingContext("_internal");

            oContext.getModel().setProperty(oContext.getPath("selected"), selected);
        }
    };

    /**
     * Validates the selected suggestions and creates a new token for valid space/page combinations or classic homepage.
     *
     * @param {object} item The suggestions containing the text and item object.
     * @returns {sap.m.Token} The new token to be added to the tokens aggregation.
     * @private
     */
    ContentNodeSelector.prototype._validateItem = function (item) {
        if (item.suggestedToken) {
            return item.suggestedToken;
        }

        var oItem = item.suggestionObject;

        if (!oItem) {
            // The user must not add arbitrary text
            return null;
        }

        var oContext = oItem.getBindingContext("_internal");

        return this._createToken(oContext);
    };

    /**
     * Constructs a new sap.m.Token from the given data and sets its binding context to the given context.
     *
     * @param {sap.ui.model.Context} context The binding context to be set.
     * @returns {sap.m.Token} The new sap.m.Token instance.
     * @private
     */
    ContentNodeSelector.prototype._createToken = function (context) {
        var oData = context.getObject();
        var oToken = new Token({
            key: oData.id,
            text: oData.label
        });

        oToken.bindObject({
            path: context.getPath(),
            model: "_internal"
        });

        return oToken;
    };

    /**
     * Retrieves the flat list of selectable suggestions for the MultiInput control.
     * The suggestions consist of the top-level elements along with their children.
     *
     * @param {object[]} items The list of content nodes from the Bookmark service.
     * @returns {object[]} A flat list of selectable content nodes.
     * @private
     * @static
     */
    ContentNodeSelector._getSuggestions = function (items) {
        var aSuggestions = [];

        ContentNodeSelector._getChildren(items, aSuggestions);

        return aSuggestions;
    };

    /**
     * Recursively looks for child objects and flattens the hierarchy of the given tree into the given aggregator.
     *
     * @param {object[]} items The (sub)tree of items whose children should be extracted.
     * @param {object[]} aggregator A list that receives all nested elements from the given tree.
     * @private
     * @static
     */
    ContentNodeSelector._getChildren = function (items, aggregator) {
        var oItem;

        for (var i = 0; i < items.length; i++) {
            oItem = items[i];

            if (oItem.isContainer && aggregator.indexOf(oItem) === -1) {
                aggregator.push(oItem);
            }

            if (oItem.children) {
                ContentNodeSelector._getChildren(oItem.children, aggregator);
            }
        }
    };

    /**
     * This function looks through each content node, compares if the node already exists,
     * and if so, will replace it with the reference to the already found content node.
     * If not, the reference to the first found node is used.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @private
     * @static
     */
    ContentNodeSelector._normalizeContentNodes = function (contentNodes) {
        var oPages = {};

        ContentNodeSelector._visitPages(contentNodes, function (oSpace, oPage) {
            oPage.spaceTitles = oPage.spaceTitles || [];

            if (oPages[oPage.id]) {
                oPages[oPage.id].spaceTitles.push(oSpace.label);
                return oPages[oPage.id];
            }

            oPage.spaceTitles.push(oSpace.label);
            oPages[oPage.id] = oPage;

            return oPage;
        });
    };

    /**
     * Loops through the given tree structure of Content Nodes and calls the given callback function for each
     * encountered Page. The function receives the current Space object and the current Page object as parameters.
     * The callback must return a page object to be written back to the Content Node tree.
     *
     * @param {object[]} contentNodes The list of content nodes from the Bookmark service.
     * @param {function} callback A callback function for each encountered Page.
     * @private
     * @static
     */
    ContentNodeSelector._visitPages = function (contentNodes, callback) {
        var oContentNode,
            oPage;

        if (contentNodes === undefined || contentNodes === null) {
            return;
        }

        for (var i = 0; i < contentNodes.length; i++) {
            oContentNode = contentNodes[i];
            if (oContentNode.type !== ContentNodeType.Space) {
                return;
            } else if (oContentNode.children) {
                for (var k = 0; k < oContentNode.children.length; k++) {
                    oPage = oContentNode.children[k];

                    oContentNode.children[k] = callback(oContentNode, oPage);
                }
            }
        }
    };

    return ContentNodeSelector;
});