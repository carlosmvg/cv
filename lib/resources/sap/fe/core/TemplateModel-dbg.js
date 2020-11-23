/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2020 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function(Log, BaseObject, JSONModel) {
	"use strict";

	return BaseObject.extend("sap.fe.core.TemplateModel", {
		oMetaModel: null,
		oConfigModel: null,

		constructor: function(pageConfig, oMetaModel) {
			this.oMetaModel = oMetaModel;
			this.oConfigModel = new JSONModel();
			// don't limit aggregation bindings
			this.oConfigModel.setSizeLimit(Number.MAX_VALUE);
			this.bConfigLoaded = false;
			var that = this;

			if (typeof pageConfig === "function") {
				var fnGetObject = this.oConfigModel._getObject.bind(this.oConfigModel);
				this.oConfigModel._getObject = function(sPath, oContext) {
					if (!that.bConfigLoaded) {
						this.setData(pageConfig());
						that.bConfigLoaded = true;
					}
					return fnGetObject(sPath, oContext);
				};
			} else {
				this.oConfigModel.setData(pageConfig);
			}

			this.fnCreateMetaBindingContext = this.oMetaModel.createBindingContext.bind(this.oMetaModel);
			this.fnCreateConfigBindingContext = this.oConfigModel.createBindingContext.bind(this.oConfigModel);

			this.oConfigModel.createBindingContext = this.createBindingContext.bind(this);
			return this.oConfigModel;
		},

		createBindingContext: function(sPath, oContext, mParameters, fnCallBack) {
			var oBindingContext,
				sResolvedPath,
				bNoResolve = mParameters && mParameters.noResolve;

			oBindingContext = this.fnCreateConfigBindingContext(sPath, oContext, mParameters, fnCallBack);
			sResolvedPath = !bNoResolve && oBindingContext.getObject();
			if (sResolvedPath && typeof sResolvedPath === "string") {
				oBindingContext = this.fnCreateMetaBindingContext(sResolvedPath, oContext, mParameters, fnCallBack);
			}

			return oBindingContext;
		}
	});
});
