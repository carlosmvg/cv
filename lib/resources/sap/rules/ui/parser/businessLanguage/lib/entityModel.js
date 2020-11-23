jQuery.sap.declare("sap.rules.ui.parser.businessLanguage.lib.entityModel");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.constants");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.parseUtils");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.parseModel");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.utils");jQuery.sap.require("sap.rules.ui.parser.businessLanguage.lib.entityModelConstractor");sap.rules.ui.parser.businessLanguage.lib.entityModel=sap.rules.ui.parser.businessLanguage.lib.entityModel||{};sap.rules.ui.parser.businessLanguage.lib.entityModel.lib=(function(){var c=sap.rules.ui.parser.businessLanguage.lib.constants.lib;var p=sap.rules.ui.parser.businessLanguage.lib.parseUtils.lib;var a=new p.parseUtilsLib();var b=sap.rules.ui.parser.businessLanguage.lib.parseModel.lib;var d=new b.parseModelLib();var u=new sap.rules.ui.parser.businessLanguage.lib.utils.lib();var e=sap.rules.ui.parser.businessLanguage.lib.entityModelConstractor.lib;function A(){}A.prototype.getType=function(){try{a.handleWarning(c.objectNamesEnum.abstractStatement+": getType function is not implemented.");}catch(i){}};A.prototype.getString=function(){try{a.handleWarning(c.objectNamesEnum.abstractStatement+": getString function is not implemented.");}catch(i){throw i;}};function f(){}f.prototype.getType=function(){try{a.handleWarning(c.objectNamesEnum.abstractSelection+": getType function is not implemented.");}catch(i){throw i;}};f.prototype.getString=function(){try{a.handleWarning(c.objectNamesEnum.abstractSelection+": getString function is not implemented.");}catch(i){throw i;}};function g(){}g.prototype.getType=function(){try{a.handleWarning(c.objectNamesEnum.abstractValue+": getType function is not implemented.");}catch(i){throw i;}};g.prototype.getString=function(){try{a.handleWarning(c.objectNamesEnum.abstractValue+": getString function is not implemented.");}catch(i){throw i;}};function O(i){try{u.addProperties(this,i,["value","originalValue"]);this.getType=function(){return"OperatorOption";};this.getString=function(){return(this.getType()+": \n { \n Value: "+this.getValue()+",\n OriginalValue: "+this.getOriginalValue()+"\n} \n");};}catch(s){throw s;}}function h(i){try{var s=function(){a.validateArgumentsType(i,c.objectNamesEnum.aggregationOption,[{name:"aggregationOperator",required:true,type:[O],typeName:[c.objectNamesEnum.operatorOption]}]);};s();u.addProperties(this,i,["aggregationOperator","groupByArray"],[null,null]);this.getType=function(){return c.objectNamesEnum.aggregationOption;};this.getString=function(){var y=(this.getGroupByArray()!==null?a.getStringArray(this.getGroupByArray()):null);var z=(this.getAggregationOperator()!==null?this.getAggregationOperator().getString():null);return(this.getType()+": \n { \n AggregationOperator: "+z+",\n GroupByArray: "+y+"\n} \n");};this.isNoneValuelistAggOperator=function(){var y=this.getAggregationOperator().getValue();if(y==="sum"||y==="avg"){return true;}return false;};}catch(x){throw x;}}function C(i){try{u.addProperties(this,i,["operator","quantity","orderBy"]);this.getType=function(){return c.objectNamesEnum.collectionOperatorOption;};this.getString=function(){var x=(this.hasOwnProperty("getOrderBy")?this.getOrderBy().getString():null);return(this.getType()+": \n { \n Operator: "+this.getOperator().getString()+",\n Quantity: "+this.getQuantity().getString()+",\n OrderBy: "+x+"\n} \n");};}catch(s){throw s;}}function j(i){try{var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.arithmeticOperator);};s(arguments.length);u.addProperty(this,"Value",i);this.getType=function(){return c.objectNamesEnum.arithmeticOperator;};this.getString=function(){var y=this.getValue();if(y===')'||y==='('){y="'"+y+"'";}return(this.getType()+": \n { \n Value: "+y+"\n } \n");};}catch(x){throw x;}}function k(i){try{this.params=[];this.push=function(x){if(x===null||x===undefined){a.handleWarning(c.objectNamesEnum.advanceFunction+": No value to push",d.getModelManger().mode);return;}this.params.push(x);};this.getType=function(){return c.objectNamesEnum.advanceFunction;};u.addProperty(this,"name",i);this.getString=function(){return(this.getType()+": \n { Name: "+this.getName()+", \n Params: "+a.getStringArray(this.params)+"} \n");};}catch(s){throw s;}}function S(){try{this.selectionsArray=[];this.push=function(x){if(x===null||x===undefined){a.handleWarning(c.objectNamesEnum.selectionClause+": No value to push",d.getModelManger().mode);return;}if(Array.isArray(x)){var i;for(i=0;i<x.length;i++){this.validateAndAdd(x[i]);}}else{this.validateAndAdd(x);}};this.addCurrentProperty=function(i){if(i===undefined||i===null){i=false;}u.addProperty(this,"isCurrent",i);};this.validateAndAdd=function(i){if(i instanceof f){this.validateType(i);}this.selectionsArray.push(i);};this.validateType=function(i){if(!i.hasOwnProperty("getValueType")){return;}if(!this.hasOwnProperty("getValueType")){u.addProperty(this,"ValueType",i.getValueType());}};this.getType=function(){return c.objectNamesEnum.selectionClause;};this.getString=function(){return(this.getType()+": \n { \n  isCurrent: "+this.getIsCurrent()+", \n selectionsArray: "+a.getStringArray(this.selectionsArray)+"} \n");};this.validateValueListForOp=function(i){var x=d.getModelManger();var y=x.getValueListAttribute();if(!y){return;}if(!this.lastOpError){x.parseResult.cursorPosition=this.lastOpIndex;a.handleWarning("error_in_expression_invalid_op_for_value_list_message",[i,y.navPath]);this.lastOpError=true;}};this.validateValueListAfterOp=function(i,x){this.lastOpIndex=i.start;this.validateValueListForOp(x);};}catch(s){throw s;}}function l(){try{this.valuesArray=[];this.valueType=null;this.push=function(s){if(s===null||s===undefined){a.handleWarning(c.objectNamesEnum.setOfValues+": No value to push",d.getModelManger().mode);return;}this.valuesArray.push(s);};this.getType=function(){return c.objectNamesEnum.setOfValues;};this.setValueType=function(s){jQuery.sap.log.debug("setValueType: add property of "+s);u.addProperty(this,"ValueType",s);};this.getString=function(){return(this.getType()+": \n {"+a.getStringArray(this.valuesArray)+"} \n");};}catch(i){throw i;}}function m(i){try{this.valueType=null;var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.complexStatement);};s(arguments.length);u.addProperty(this,"Model",i);this.getType=function(){return c.objectNamesEnum.complexStatement;};this.getValueType=function(){return this.getModel().getValueType();};this.getString=function(){return(this.getType()+": \n { \n Model: "+this.getModel().getString()+"\n } \n");};}catch(x){throw x;}}m.prototype=new A();m.prototype.constructor=m;function n(i){try{this.valueType=null;var s=function(){a.validateArgumentsType(i,c.objectNamesEnum.simpleStatement,[{name:"leftSelectionClause",required:true,type:[S],typeName:[c.objectNamesEnum.selectionClause]}]);};this.validateAmbiguity=function(y,z,E){var G={};G.key="";G.args=[];var H=y.replace(/\s+/g,'');var I=z.replace(/\s+/g,'');if(H===I){if(!this.getLeftSelectionClause().getIsCurrent()&&(this.hasOwnProperty("getRightSelectionClause")&&!this.getRightSelectionClause().getIsCurrent())){G.key="error_in_expression_missing_current_message";a.handleError(G.key,G.args,E);}if(this.getLeftSelectionClause().getIsCurrent()&&this.hasOwnProperty("getRightSelectionClause")&&this.getRightSelectionClause().getIsCurrent()){G.key="error_in_expression_redundant_current_message";a.handleError(G.key,G.args,E);}}};s();u.addProperties(this,i,["leftSelectionClause","selectionOperator","rightSelectionClause"]);this.getType=function(){return c.objectNamesEnum.simpleStatement;};this.getValueType=function(){return this.valueType;};this.getString=function(){var y=null;if(this.hasOwnProperty("getSelectionOperator")){y=this.getSelectionOperator().getString();}var z=(this.hasOwnProperty("getRightSelectionClause")?this.getRightSelectionClause().getString():null);return(this.getType()+": \n { \n LeftSelectionClause: "+this.getLeftSelectionClause().getString()+", \n SelectionOperator: "+y+", \n RightSelectionClause: "+z+"\n } \n");};}catch(x){throw x;}}n.prototype=new A();n.prototype.constructor=n;function o(i,s){try{var x={};x.args=[];var y=(i.hasOwnProperty("navigationPredicateDetails"))?i.navigationPredicateDetails.getModifiers().hasOwnProperty("current"):false;var z=(i.hasOwnProperty("navigationPredicateDetails"))?i.navigationPredicateDetails.getModifiers().hasOwnProperty("all"):false;var E=(i.hasOwnProperty("isCurrent")&&i.isCurrent===true)||y;if(E&&(!s.isInsideWhere)){x.key="error_in_expression_current_not_in_where_clause_message";a.handleError(x.key,x.args,s);}else if((i.hasOwnProperty("isCurrent")&&i.isCurrent===true)&&y){x.key="error_in_expression_redundant_current_message";a.handleError(x.key,x.args,s);}else if(E&&z){x.key="error_in_expression_invalid_current_with_all_term_message";a.handleError(x.key,x.args,s);}else if(s.isAllContext()&&z&&(i.navigationPredicateDetails.getNavigationFullPath()!==i.navigationPredicateDetails.getDataObject())){x.key="error_in_expression_invalid_all_with_all_term_message";a.handleError(x.key,x.args,s);}else if(!s.hasOwnProperty("isCurrent")&&s.isInsideWhere){s.isCurrent=E;}else if(s.isInsideWhere&&s.isCurrent!==E){x.key="error_in_expression_missing_current_in_arithmetic__message";a.handleError(x.key,x.args,s);}else if(s.isInsideWhere&&E){s.isCurrent=true;}i.isCurrent=E;u.addProperties(this,i,["navigationPredicateDetails","filterClause","isCurrent"]);this.getType=function(){return c.objectNamesEnum.selection;};this.getString=function(){var H=(this.hasOwnProperty("getFilterClause")&&this.getFilterClause()!==null?this.getFilterClause().getString():null);var I=(this.hasOwnProperty("getNavigationPredicateDetails")&&this.getNavigationPredicateDetails()!==null&&this.getNavigationPredicateDetails().hasOwnProperty("getString")?this.getNavigationPredicateDetails().getString():null);return(this.getType()+": \n { \n "+I+", \n FilterClause: "+H+", \n isCurrent: "+this.getIsCurrent()+"} \n");};}catch(G){throw G;}}function q(i){try{var s=function(){a.validateArgumentExist(i,c.objectNamesEnum.compoundSelection,d);var y=c.SIMPLE_SELECTION_VALUE_TYPE.getByValue("string",i.valueType);if(y===null){a.handleWarning(c.objectNamesEnum.simpleSelection+":  valueType input arg must be "+c.SIMPLE_SELECTION_VALUE_TYPE.getStringByField("string"));return;}};if(!i.hasOwnProperty("isParameter")){i.isParameter=false;}if(!i.hasOwnProperty("index")){i.index=null;}if(!i.hasOwnProperty("isCompound")||i.isCompound===false){i.isCompound=false;i.compoundValue=null;}else{i.value=null;}if(i.isParameter&&!(i.value instanceof Object)&&i.value!==null){i.value=i.value.replace(/^:/,"");}if(!i.hasOwnProperty("originalValue")){i.originalValue=i.value;}s();u.addProperties(this,i,["value","compoundValue","originalValue","valueType","isParameter","isCompound","index"]);this.getType=function(){return c.objectNamesEnum.simpleSelection;};this.getString=function(){var y=((this.getValue()instanceof Object)?this.getValue().getString():this.getValue());var z=null;if(this.getIsCompound()===true){var E=this.getCompoundValue();z="{ \n Value: "+E.value+",\n Constant: "+E.constant+"\n }";}return(this.getType()+": \n { \n Value: "+y+",  \n CompoundValue: "+z+", \n OriginalValue: "+this.getOriginalValue()+",  \n ValueType: "+this.getValueType()+", \n IsParameter: "+this.getIsParameter()+", \n isCompound: "+this.getIsCompound()+", \n index: "+this.getIndex()+"\n } \n");};}catch(x){throw x;}}q.prototype=new f();q.prototype.constructor=q;function r(i){try{var s=function(){a.validateArgumentsType(i,c.objectNamesEnum.compoundSelection,[{name:"compoundSelection",required:false,type:[r],typeName:[c.objectNamesEnum.compoundSelection]},{name:"selection",required:false,type:[o],typeName:[c.objectNamesEnum.selection]}]);};s();if(!i.hasOwnProperty("valueType")){i.valueType=null;}u.addProperties(this,i,["aggregationOption","compoundSelection","selection","valueType"]);this.getType=function(){return c.objectNamesEnum.compoundSelection;};this.getString=function(){var y=(this.hasOwnProperty("getAggregationOption")?this.getAggregationOption().getString():null);var z=(this.hasOwnProperty("getValueType")?this.getValueType():null);var E=(this.hasOwnProperty("getCompoundSelection")&&this.getCompoundSelection()?this.getCompoundSelection().getString():null);var G=(this.hasOwnProperty("getSelection")?this.getSelection().getString():null);return(this.getType()+": \n { \n AggregationOption: "+y+", \n ValueType: "+z+", \n CompoundSelection: "+E+", \n Selection: "+G+"\n } \n");};}catch(x){throw x;}}r.prototype=new f();r.prototype.constructor=r;function t(i){try{var s=function(y){a.validateNumberOfArguments(y,2,c.objectNamesEnum.stringFilter);};s(arguments.length);u.addProperties(this,i,["value","operator"]);this.getType=function(){return c.SIMPLE_SELECTION_VALUE_TYPE.STRING.string;};this.getString=function(){return(this.getType()+": \n { \n NavigationDetails: "+this.getNavigationDetails.getString()+", \n Operator: "+this.getOperator()+", \n Value: "+this.getValue()+"\n } \n");};}catch(x){throw x;}}t.prototype=new e.AbstractFilterClause();t.prototype.constructor=t;function D(i){try{var s=function(){a.validateArgumentsType(i,c.objectNamesEnum.dateFilter,[{name:"navigationDetails",required:false,type:[e.NavigationPredicateDetails],typeName:[c.objectNamesEnum.navigationPredicateDetails]}]);};s();u.addProperties(this,i,["timeInterval","navigationDetails"]);this.getType=function(){return c.SIMPLE_SELECTION_VALUE_TYPE.DATE.string;};this.getString=function(){var y=(this.hasOwnProperty("getTimeInterval")?this.getTimeInterval().getString():null);var z=(this.hasOwnProperty("getNavigationDetails")?this.getNavigationDetails().getString():null);return(this.getType()+": \n { \n TimeInterval: "+y+", \n NavigationDetails: "+z+"\n } \n");};}catch(x){throw x;}}D.prototype=new e.AbstractFilterClause();D.prototype.constructor=D;function F(i){try{var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.filterSelectionValue);};s(arguments.length);u.addProperty(this,"Value",i);this.getType=function(){return"FilterSelectionValue";};this.getString=function(){var y=(this.hasOwnProperty("getValue")?this.getValue().getString():null);return(this.getType()+": \n { \n Value: "+y+"\n } \n");};}catch(x){throw x;}}F.prototype=new g();F.prototype.constructor=F;function v(){try{this.isParameter=false;this.prefix=null;this.type=null;this.date={start:{str:null,day:null,month:null,year:null,isParameter:false,parameterName:null},end:{str:null,day:null,month:null,year:null,isParameter:false,parameterName:null}};this.interval={};this.interval.number=null;this.interval.constant=null;this.interval.milliseconds=null;this.resolveType=function(s){jQuery.sap.log.debug("resolveType func,  dateString - "+s);if(this.prefix===null){this.type="simpleDate";this.date.start.str=s;}else if(this.prefix==="between"){this.prefix=null;this.type="IntervalDate";this.date.end.str=s;}else{this.date.start.str=s;}jQuery.sap.log.debug("Date string - "+s+" and type - "+this.type);};this.getType=function(){return"DateValue";};this.subtractDateString=function(){jQuery.sap.log.debug("subtractDateString func,  start - "+this.date.start.str+", and end - "+this.date.end.str);if(this.date.start.str!==null){var s=c.DATE_CONST.getByValue("string",this.date.start.str);if(s===null){this.splitDate(this.date.start);}}if(this.date.end.str!==null){var x=c.DATE_CONST.getByValue("string",this.date.end.str);if(x===null){this.splitDate(this.date.end);}}};this.splitDate=function(x){var y=x.str.replace(/[']+/g,'');var s=y.split(/[\.\-\/]/);x.day=s[1];x.month=s[0];x.year=s[2];};this.calculateMilliseconds=function(){if(this.isParameter===false&&this.interval.number!==null&&this.interval.constant!==null&&this.interval.constant instanceof Object){this.interval.milliseconds=this.interval.number*this.interval.constant.multiply;}};this.getString=function(){var s=this.interval.constant;if(this.interval.constant!==null&&this.interval.constant instanceof Object){jQuery.sap.log.debug("**** DateValue, getString - "+this.interval.constant.toString());s=this.interval.constant.string;}return(this.getType()+": \n { \n  Type: "+this.type+"\n Prefix: "+this.prefix+"\n isParameter: "+this.isParameter+"\n  Date: \n { start:  { \n day: "+this.date.start.day+"\n month: "+this.date.start.month+"\n year: "+this.date.start.year+"\n startDateString: "+this.date.start.str+"\n isParameter: "+this.date.start.isParameter+"\n parameterName: "+this.date.start.parameterName+"} \n end: {  \n day: "+this.date.end.day+"\n month: "+this.date.end.month+"\n year: "+this.date.end.year+"\n endDateString: "+this.date.end.str+"\n isParameter: "+this.date.end.isParameter+"\n parameterName: "+this.date.end.parameterName+"\n }}\n Interval: \n { number: "+this.interval.number+"\n constant: "+s+"\n milliseconds: "+this.interval.milliseconds+"\n \n}\n} \n");};}catch(i){throw i;}}v.prototype=new g();v.prototype.constructor=v;function w(i){try{var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.stringValue);};s(arguments.length);u.addProperty(this,"Value",i);s();this.getType=function(){return"StringValue";};this.getString=function(){return(this.getType()+": \n { \n Value: "+this.getValue()+"\n } \n");};}catch(x){throw x;}}w.prototype=new g();w.prototype.constructor=w;function B(i){try{var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.booleanValue);};s(arguments.length);u.addProperty(this,"Value",i);s();this.getType=function(){return"BooleanValue";};this.getString=function(){return(this.getType()+": \n { \n Value: "+this.getValue()+"\n } \n");};}catch(x){throw x;}}B.prototype=new g();B.prototype.constructor=B;function T(i){try{var s=function(y){a.validateNumberOfArguments(y,1,c.objectNamesEnum.timeValue);};s(arguments.length);u.addProperty(this,"Value",i);s();this.getType=function(){return"TimeValue";};this.getString=function(){var y=(this.hasOwnProperty("getValue")?this.getValue():null);return(this.getType()+": \n { \n Value: "+y+"\n } \n");};}catch(x){throw x;}}T.prototype=new g();T.prototype.constructor=T;return{AbstractStatement:A,AbstractSelection:f,AbstractValue:g,SimpleStatement:n,SelectionClause:S,OperatorOption:O,CollectionOperatorOption:C,Selection:o,CompoundSelection:r,SetOfValues:l,SimpleSelection:q,AdvanceFunction:k,AggregationOption:h,ArithmeticOperator:j};}());