/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['./library','sap/ui/core/Control','./TileContent2X2Renderer'],function(l,C,T){"use strict";var a=C.extend("sap.suite.ui.commons.TileContent2X2",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{footer:{type:"string",group:"Appearance",defaultValue:null},size:{type:"sap.suite.ui.commons.InfoTileSize",group:"Misc",defaultValue:"Auto"},unit:{type:"string",group:"Misc",defaultValue:null},disabled:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{content:{type:"sap.ui.core.Control",multiple:false}}}});a.prototype.init=function(){this._oDelegate={onAfterRendering:function(e){e.srcControl.$().removeAttr("tabindex");}};};a.prototype._getContentType=function(){if(this.getContent()){var c=this.getContent().getMetadata().getName();if(c==="sap.suite.ui.commons.NewsContent"){return"News";}}};a.prototype.onAfterRendering=function(){var c=this.getContent();var t=this.$();if(!t.attr("title")){var s=c.getTooltip_AsString();var b=t.find("*");b.removeAttr("title");var o=s?s:"";t.attr("title",o+"\n"+this._getFooterText());}};a.prototype._getFooterText=function(){var f=this.getFooter();var u=this.getUnit();return u?(sap.ui.getCore().getConfiguration().getRTL()?((f?f+" ,":"")+u):(u+(f?", "+f:""))):f;};a.prototype.onBeforeRendering=function(){if(this.getContent()){if(this.getDisabled()){this.getContent().addDelegate(this._oDelegate);}else{this.getContent().removeDelegate(this._oDelegate);}}};a.prototype.setContent=function(o,s){if(this.getContent()){this.getContent().removeDelegate(this._oDelegate);}this.setAggregation("content",o,s);return this;};a.prototype.getAltText=function(){var A="";var c=this.getContent();if(c&&c.getAltText){A+=c.getAltText();}else if(c&&c.getTooltip_AsString()){A+=c.getTooltip_AsString();}return A;};return a;});