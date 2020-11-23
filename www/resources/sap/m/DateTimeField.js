/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/model/type/Date','sap/ui/model/odata/type/ODataType','sap/ui/model/odata/type/DateTimeBase','./InputBase','sap/ui/core/LocaleData','sap/ui/core/library','sap/ui/core/format/DateFormat','./DateTimeFieldRenderer',"sap/base/util/deepEqual","sap/base/Log","sap/ui/thirdparty/jquery","sap/ui/dom/jquery/cursorPos"],function(S,O,D,I,L,c,a,b,d,f,q){"use strict";var C=c.CalendarType;var g=I.extend("sap.m.DateTimeField",{metadata:{"abstract":true,library:"sap.m",properties:{displayFormat:{type:"string",group:"Appearance",defaultValue:null},valueFormat:{type:"string",group:"Data",defaultValue:null},dateValue:{type:"object",group:"Data",defaultValue:null},initialFocusedDateValue:{type:"object",group:"Data",defaultValue:null}}}});g.prototype.setValue=function(v){v=this.validateProperty("value",v);var o=this.getValue();if(v===o){return this;}else{this.setLastValue(v);}this.setProperty("value",v);this._bValid=true;var e;if(v){e=this._parseValue(v);if(!e||e.getTime()<this._oMinDate.getTime()||e.getTime()>this._oMaxDate.getTime()){this._bValid=false;f.warning("Value can not be converted to a valid date",this);}}this.setProperty("dateValue",e);if(this.getDomRef()){var s;if(e){s=this._formatValue(e);}else{s=v;}if(this._$input.val()!==s){this._$input.val(s);this._curpos=this._$input.cursorPos();}}return this;};g.prototype.setDateValue=function(o){if(!this._isValidDate(o)){throw new Error("Date must be a JavaScript date object; "+this);}if(d(this.getDateValue(),o)){return this;}o=this._dateValidation(o);var v=this._formatValue(o,true);if(v!==this.getValue()){this.setLastValue(v);}this.setProperty("value",v);if(this.getDomRef()){var s=this._formatValue(o);if(this._$input.val()!==s){this._$input.val(s);this._curpos=this._$input.cursorPos();}}return this;};g.prototype.setValueFormat=function(v){this.setProperty("valueFormat",v,true);var V=this.getValue();if(V){this._handleDateValidation(this._parseValue(V));}return this;};g.prototype.setDisplayFormat=function(s){this.setProperty("displayFormat",s,true);this.updateDomValue(this._formatValue(this.getDateValue()));this._updateDomPlaceholder(this._getPlaceholder());return this;};g.prototype.getDisplayFormatType=function(){return null;};g.prototype._dateValidation=function(o){this._bValid=true;this.setProperty("dateValue",o);return o;};g.prototype._handleDateValidation=function(o){this._bValid=true;this.setProperty("dateValue",o);};g.prototype._getPlaceholder=function(){var p=this.getPlaceholder();if(!p){p=this._getDisplayFormatPattern();if(!p){p=this._getDefaultDisplayStyle();}if(this._checkStyle(p)){p=this._getLocaleBasedPattern(p);}}return p;};g.prototype._getLocaleBasedPattern=function(p){return L.getInstance(sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale()).getDatePattern(p);};g.prototype._parseValue=function(v,h){var B=this.getBinding("value"),o=B&&B.getType&&B.getType(),F,i,j;if(o&&this._isSupportedBindingType(o)){try{j=o.parseValue(v,"string");if(typeof(j)==="string"&&o instanceof D){j=D.prototype.parseValue.call(o,v,"string");}F=o.oFormatOptions;if(F&&F.source&&F.source.pattern=="timestamp"){j=new Date(j);}else if(F&&F.source&&typeof F.source.pattern==="string"){j=o.oInputFormat.parse(v);}}catch(e){}if(j&&((o.oFormatOptions&&this._isFormatOptionsUTC(o.oFormatOptions))||(o.oConstraints&&o.oConstraints.isDateOnly))){i=new Date(j.getUTCFullYear(),j.getUTCMonth(),j.getUTCDate(),j.getUTCHours(),j.getUTCMinutes(),j.getUTCSeconds(),j.getUTCMilliseconds());i.setFullYear(j.getUTCFullYear());j=i;}return j;}return this._getFormatter(h).parse(v);};g.prototype._formatValue=function(o,v){if(!o){return"";}var B=this.getBinding("value"),e=B&&B.getType&&B.getType(),F,h;if(e&&this._isSupportedBindingType(e)){if((e.oFormatOptions&&e.oFormatOptions.UTC)||(e.oConstraints&&e.oConstraints.isDateOnly)){h=new Date(Date.UTC(o.getFullYear(),o.getMonth(),o.getDate(),o.getHours(),o.getMinutes(),o.getSeconds(),o.getMilliseconds()));h.setUTCFullYear(o.getFullYear());o=h;}F=e.oFormatOptions;if(F&&F.source&&F.source.pattern=="timestamp"){o=o.getTime();}else if(e.oOutputFormat){return e.oOutputFormat.format(o);}return e.formatValue(o,"string");}return this._getFormatter(!v).format(o);};g.prototype._isSupportedBindingType=function(B){return B.isA(["sap.ui.model.type.Date","sap.ui.model.odata.type.DateTime","sap.ui.model.odata.type.DateTimeOffset"]);};g.prototype._isFormatOptionsUTC=function(B){return(B.UTC||(B.source&&B.source.UTC));};g.prototype._getDefaultDisplayStyle=function(){return"medium";};g.prototype._getDefaultValueStyle=function(){return"short";};g.prototype._getFormatter=function(e){var p=this._getBoundValueTypePattern(),r=false,F,B=this.getBinding("value"),s;if(B&&B.oType&&B.oType.oOutputFormat){r=!!B.oType.oOutputFormat.oFormatOptions.relative;s=B.oType.oOutputFormat.oFormatOptions.calendarType;}if(!p){if(e){p=(this.getDisplayFormat()||this._getDefaultDisplayStyle());s=this.getDisplayFormatType();}else{p=(this.getValueFormat()||this._getDefaultValueStyle());s=C.Gregorian;}}if(!s){s=sap.ui.getCore().getConfiguration().getCalendarType();}if(e){if(p===this._sUsedDisplayPattern&&s===this._sUsedDisplayCalendarType){F=this._oDisplayFormat;}}else{if(p===this._sUsedValuePattern&&s===this._sUsedValueCalendarType){F=this._oValueFormat;}}if(F){return F;}return this._getFormatterInstance(F,p,r,s,e);};g.prototype._getFormatterInstance=function(F,p,r,s,e){if(this._checkStyle(p)){F=this._getFormatInstance({style:p,strictParsing:true,relative:r,calendarType:s},e);}else{F=this._getFormatInstance({pattern:p,strictParsing:true,relative:r,calendarType:s},e);}if(e){this._sUsedDisplayPattern=p;this._sUsedDisplayCalendarType=s;this._oDisplayFormat=F;}else{this._sUsedValuePattern=p;this._sUsedValueCalendarType=s;this._oValueFormat=F;}return F;};g.prototype._getFormatInstance=function(A,e){return a.getInstance(A);};g.prototype._checkStyle=function(p){return(p==="short"||p==="medium"||p==="long"||p==="full");};g.prototype._getDisplayFormatPattern=function(){var p=this._getBoundValueTypePattern();if(p){return p;}p=this.getDisplayFormat();if(this._checkStyle(p)){p=this._getLocaleBasedPattern(p);}return p;};g.prototype._getBoundValueTypePattern=function(){var B=this.getBinding("value"),o=B&&B.getType&&B.getType();if(o instanceof S){return o.getOutputPattern();}if(o instanceof O&&o.oFormat){return o.oFormat.oFormatOptions.pattern;}return undefined;};g.prototype._isValidDate=function(o){return!o||Object.prototype.toString.call(o)==="[object Date]";};g.prototype._updateDomPlaceholder=function(v){if(this.getDomRef()){this._$input.attr("placeholder",v);}};return g;});
