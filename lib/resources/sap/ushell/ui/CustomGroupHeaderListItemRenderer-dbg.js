// Copyright (c) 2009-2020 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/Renderer",
    "sap/m/GroupHeaderListItemRenderer"
], function (
    coreLibrary,
    Renderer,
    GroupHeaderListItemRenderer
) {
    "use strict";

    var TextDirection = coreLibrary.TextDirection;

    var CustomGroupHeaderListItemRenderer = Renderer.extend(GroupHeaderListItemRenderer);

    CustomGroupHeaderListItemRenderer.renderLIAttributes = function (rm, oLI) {
        GroupHeaderListItemRenderer.renderLIAttributes(rm, oLI);
        rm.addClass("sapUshellCGHLIContent");
    };

    CustomGroupHeaderListItemRenderer.renderLIContent = function (rm, oLI) {
        var sTextDir = oLI.getTitleTextDirection();

        rm.write("<span");
        rm.writeAttributeEscaped("class", "sapMGHLITitle");

        if (sTextDir !== TextDirection.Inherit) {
            rm.writeAttribute("dir", sTextDir.toLowerCase());
        }

        rm.write(">");
        rm.renderControl(oLI.getAggregation("_titleText"));

        if (oLI.getDescription()) {
            rm.write("</br>");
            rm.write("<span class='sapUshellCGHLIDescription'>");
            rm.renderControl(oLI.getAggregation("_descriptionText"));
            rm.write("</span>");
        }

        rm.write("</span>");
    };

    return CustomGroupHeaderListItemRenderer;
});
