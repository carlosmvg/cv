// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define([], function () {
    "use strict";

    return {

        readCFlpConfiguration: function (sinaConfigurations) {

            // check if cFlp is active
            var cFlpActive = false;
            // var dummy = 1;
            if (!cFlpActive) {
                return Promise.resolve(sinaConfigurations); // -> not active -> do nothing
            }

            // read content providers from cflp configuration
            return sap.ushell.Container.getService("CommonDataModel").getApplications().then(function (oApplications) {
                // extract content provider ids
                var oContentProviders = Object.keys(oApplications).reduce(function (o, sApplicationKey) {
                    var oApplication = oApplications[sApplicationKey];
                    var sContentProviderId = oApplication["sap.app"] && oApplication["sap.app"].contentProviderId;
                    if (sContentProviderId) {
                        o[sContentProviderId] = true;
                    }
                    return o;
                }, {});
                var contentProviderIds = Object.keys(oContentProviders);
                return contentProviderIds;
            }.bind(this)).then(function (contentProviderIds) {
                // create sina provider configuration
                var promises = [];
                for (var i = 0; i < contentProviderIds.length; ++i) {
                    var contentProviderId = contentProviderIds[i];
                    promises.push(this.createContentProviderSinaConfiguration(contentProviderId));
                }
                return Promise.all(promises);
            }.bind(this)).then(function (subSinaProviderConfigurations) {
                if (!subSinaProviderConfigurations || subSinaProviderConfigurations.length === 0) {
                    // fallback if configuration is empty
                    return sinaConfigurations;
                } else {
                    // assemble multi provider configuration
                    return [{
                        provider: 'multi',
                        subProviders: subSinaProviderConfigurations,
                        federationType: 'advanced_round_robin'
                    }];
                }
            }.bind(this));

        },

        createContentProviderSinaConfiguration: function (contentProviderId) {
            return sap.ushell.Container.getService("ClientSideTargetResolution").getSystemContext(contentProviderId).then(function (oSystemContext) {
                var sinaProviderType = oSystemContext.getProperty("esearch.provider");
                var sRequestUrlForAppRouter = oSystemContext.getFullyQualifiedXhrUrl("sap/opu/odata/sap/ESH_SEARCH_SRV");
                return {
                    provider: sinaProviderType.toLowerCase(),
                    label: contentProviderId,
                    url: sRequestUrlForAppRouter
                };
            }.bind(this));
        }

    };

});
