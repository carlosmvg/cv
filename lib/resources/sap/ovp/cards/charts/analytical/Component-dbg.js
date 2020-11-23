sap.ui.define(["sap/ovp/cards/generic/Component", "sap/ovp/cards/charts/VizAnnotationManager", "sap/ovp/cards/jUtils"],
    function (CardComponent, VizAnnotationManager, jUtils) {
        "use strict";

        return CardComponent.extend("sap.ovp.cards.charts.analytical.Component", {
            // use inline declaration instead of component.json to save 1 round trip
            metadata: {
                properties: {
                    "headerExtensionFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.generic.KPIHeader"
                    },
                    "contentFragment": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.charts.analytical.analyticalChart"
                    },
                    "controllerName": {
                        "type": "string",
                        "defaultValue": "sap.ovp.cards.charts.analytical.analyticalChart"
                    }
                },

                version: "1.82.0",

                library: "sap.ovp",

                includes: [],

                dependencies: {
                    libs: ["sap.viz"],
                    components: []
                },
                config: {}
            },

            onAfterRendering: function () {
                jUtils.setAttributeToMultipleElements(".tabindex0", "tabindex", 0);
                jUtils.setAttributeToMultipleElements(".tabindex-1", "tabindex", -1);
            }
        });
    }
);
