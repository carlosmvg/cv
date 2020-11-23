/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */

sap.ui.define(["sap/ui/core/util/PasteHelper", "sap/m/MessageBox"], function(CorePasteHelper, MessageBox) {
	"use strict";

	var oPasteHelper = {
		_getColumnInfoForPaste: function(oTable) {
			var aColumnInfos = [],
				oModel = oTable.getRowBinding().getModel(),
				oMetaModel = oModel.getMetaModel(),
				sRowBindingPath = oModel.resolve(oTable.getRowBinding().getPath(), oTable.getRowBinding().getContext()),
				oMetaContext = oMetaModel.getMetaContext(sRowBindingPath);

			oTable.getColumns().forEach(function(oColumn) {
				var aDataProperties = oColumn.getDataProperties();
				if (aDataProperties.length === 0) {
					// Empty column --> ignore
					aColumnInfos.push({
						property: "unused",
						type: null,
						ignore: true
					});
				} else {
					var oProperty = oMetaContext.getProperty(aDataProperties[0]),
						mFormatOptions = { parseKeepsEmptyString: true },
						oType = oProperty && oMetaModel.getUI5Type(sRowBindingPath + "/" + aDataProperties[0], mFormatOptions),
						bIgnore = !oProperty || oMetaContext.getProperty(aDataProperties[0] + "@Org.OData.Core.V1.Computed");
					aColumnInfos.push({
						property: aDataProperties[0],
						type: oType,
						ignore: bIgnore
					});

					// Check if there's a currency or a UoM associated with the current property
					// and add an additional property if that's the case
					var sAdditionalPropertyName =
						oMetaContext.getProperty(aDataProperties[0] + "@Org.OData.Measures.V1.Unit/$Path") ||
						oMetaContext.getProperty(aDataProperties[0] + "@Org.OData.Measures.V1.ISOCurrency/$Path");

					if (sAdditionalPropertyName) {
						var oAdditionalProperty = oMetaContext.getProperty(sAdditionalPropertyName),
							oAdditionalType = oAdditionalProperty && oMetaModel.getUI5Type(sRowBindingPath + "/" + sAdditionalPropertyName);

						aColumnInfos.push({
							property: sAdditionalPropertyName,
							type: oAdditionalType,
							ignore: bIgnore,
							additionalProperty: true
						});
					}
				}
			});

			return aColumnInfos;
		},

		parseDataForTablePaste: function(aRawData, oTable) {
			var oPasteInfos = this._getColumnInfoForPaste(oTable);

			// Check if we have data for at least the first editable column
			var iPastedColumnCount = aRawData.length ? aRawData[0].length : 0;
			var iFirstEditableColumn = -1;
			for (var I = 0; I < oPasteInfos.length && iFirstEditableColumn < 0; I++) {
				if (!oPasteInfos[I].ignore) {
					iFirstEditableColumn = I;
				}
			}
			if (iFirstEditableColumn < 0 || iFirstEditableColumn > iPastedColumnCount - 1) {
				// We don't have data for an editable column --> return empty parsed data
				return Promise.resolve([]);
			} else {
				return CorePasteHelper.parse(aRawData, oPasteInfos).then(function(oParseResult) {
					if (oParseResult.errors) {
						var aErrorMessages = oParseResult.errors.map(function(oElement) {
							return oElement.message;
						});

						var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core"),
							sPasteError,
							sErrorCorrection = oResourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_CORRECTION_MESSAGE"),
							sNote = oResourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_CORRECTION_NOTE");

						if (aErrorMessages.length > 1) {
							sPasteError = oResourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_MESSAGE_PLURAL", [
								aErrorMessages.length
							]);
						} else {
							sPasteError = oResourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_MESSAGE_SINGULAR");
						}
						aErrorMessages.unshift(""); // To show space between the short text and the list of errors
						aErrorMessages.unshift(sNote);
						aErrorMessages.unshift(sErrorCorrection);
						MessageBox.error(sPasteError, {
							icon: MessageBox.Icon.ERROR,
							title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR"),
							details: aErrorMessages.join("<br>")
						});

						return []; // Errors --> return nothing
					} else {
						return oParseResult.parsedData ? oParseResult.parsedData : [];
					}
				});
			}
		}
	};

	return oPasteHelper;
});
