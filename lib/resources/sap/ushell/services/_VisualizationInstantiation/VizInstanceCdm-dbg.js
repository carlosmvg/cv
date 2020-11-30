// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_VisualizationInstantiation/VizInstance",
    "sap/m/library",
    "sap/ui/core/Component",
    "sap/base/util/ObjectPath",
    "sap/base/util/deepExtend"
], function (VizInstance, mobileLibrary, Component, ObjectPath, deepExtend) {
    "use strict";

    var LoadState = mobileLibrary.LoadState;

    /**
     * @constructor for a VizInstance for CDM data
     *
     * @extends sap.ushell.ui.launchpad.VizInstance
     * @name sap.ushell.ui.launchpad.VizInstanceCDM
     *
     * @since 1.78
     */
    var VizInstanceCdm = VizInstance.extend("sap.ushell.ui.launchpad.VizInstanceCdm", {
        metadata: {
            library: "sap.ushell"
        },
        fragment: "sap.ushell.services._VisualizationInstantiation.VizInstanceCdm"
    });

    /**
     * Creates the CDM visualization component and sets it as the content
     * of the VizInstance
     *
     * @returns {Promise<void>} Resolves when the component is loaded
     * @override
     * @since 1.78
     */
    VizInstanceCdm.prototype.load = function () {
        var oComponentData = this._getComponentConfiguration();
        var sSize = this.getInstantiationData().vizType["sap.flp"].tileSize;
        this._setSize(sSize);

        return Component.create(oComponentData)
            .then(function (oComponent) {
                this._oComponent = oComponent;
                this._setContent(oComponent.getRootControl());
            }.bind(this))
            .catch(function (oError) {
                this.setState(LoadState.Failed);
                return Promise.reject(oError);
            }.bind(this));
    };

    /**
     * Creates the configuration object for the component creation
     * from the visualization data
     *
     * @returns {object} The component configuration
     * @since 1.78
     */
    VizInstanceCdm.prototype._getComponentConfiguration = function () {
        var oVizType = this.getInstantiationData().vizType;
        var oVizConfig = this.getVizConfig();

        var oComponentConfiguration = {
            name: oVizType["sap.ui5"].componentName,
            componentData: {
                properties: this._getComponentProperties()
            },
            // this property can contain a URL from where the visualization type component
            // should be loaded
            url: ObjectPath.get(["sap.platform.runtime", "componentProperties", "url"], oVizType),
            // this property can contain a URL to a manifest that should be used instead of the
            // component's default manifest
            manifest: ObjectPath.get(["sap.platform.runtime", "componentProperties", "manifest"], oVizType)
        };

        var bIncludeVizType = ObjectPath.get(["sap.platform.runtime", "includeManifest"], oVizType);
        var bIncludeVizConfig = ObjectPath.get(["sap.platform.runtime", "includeManifest"], oVizConfig);

        if (bIncludeVizType || bIncludeVizConfig) {
            // the viz type already contains the component's complete manifest
            // so there is no need for the component factory to load it
            // the vizConfig can only be added to the manifest if there is a manifest
            oComponentConfiguration.manifest = deepExtend({}, oVizType, oVizConfig);
        }

        return oComponentConfiguration;
    };

    /**
     * Extracts those properties from the visualization data that are passed to the
     * visualization component as component data.
     *
     * @returns {object} The properties for the component data.
     * @since 1.78
     */
    VizInstanceCdm.prototype._getComponentProperties = function () {
        return {
            title: this.getTitle(),
            subtitle: this.getSubtitle(),
            icon: this.getIcon(),
            info: this.getInfo(),
            indicatorDataSource: this.getIndicatorDataSource(),
            contentProviderId: this.getContentProviderId(),
            targetURL: this.getTargetURL()
        };
    };

    /**
     * Updates the tile's active state.
     * Inactive dynamic tiles do not send requests.
     *
     * @param {boolean} active The visualization's updated active state.
     * @param {boolean} refresh The visualization's updated refresh state.
     * @returns {sap.ushell.ui.launchpad.VizInstanceCdm} this to allow method chaining.
     * @since 1.78.0
     */
    VizInstanceCdm.prototype.setActive = function (active, refresh) {
        if (this._oComponent && typeof this._oComponent.tileSetVisible === "function") {
            this._oComponent.tileSetVisible(active);
        }

        if (refresh) {
            this.refresh();
        }
        return this.setProperty("active", active, false);
    };

    /**
     * Updates the tile refresh state to determine if a tile needs to be updated.
     *
     * @since 1.78.0
     */
    VizInstanceCdm.prototype.refresh = function () {
        if (this._oComponent && typeof this._oComponent.tileRefresh === "function") {
            this._oComponent.tileRefresh();
        }
    };

    return VizInstanceCdm;
});