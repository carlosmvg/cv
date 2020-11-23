// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/Config","sap/ui/thirdparty/URI","sap/base/util/ObjectPath","sap/ui/thirdparty/jquery"],function(C,U,O,q){"use strict";function g(p,o){return O.get(p,o)||"";}function E(a){this.sendFeedback=function(e){var u,n,A,s,o,f,b,c,d;u=g("clientContext.navigationData.applicationInformation.url",e);n=g("clientContext.navigationData.navigationHash",e);A=g("clientContext.navigationData.applicationInformation.additionalInformation",e);s=g("clientContext.navigationData.applicationInformation.applicationType",e);f=g("clientContext.navigationData.formFactor",e);b=g("clientContext.userDetails.userId",e);c=g("clientContext.userDetails.eMail",e);d=e.feedbackText||"";o={feedbackText:d.slice(0,2000),ratings:e.ratings||{},additionalInformation:A,applicationType:s,url:u?this.getPathOfURL(u):"",navigationIntent:n.replace(/\?.*$/,""),formFactor:f,isAnonymous:e.isAnonymous||false,userId:e.isAnonymous?"":b,eMail:e.isAnonymous?"":c};return a.sendFeedback(o);};this.getLegalText=function(){return a.getLegalText();};this.isEnabled=function(){var d=new q.Deferred(),i=C.last("/core/extension/EndUserFeedback");if(!i){window.setTimeout(function(){d.reject();},0);return d.promise();}a.isEnabled().done(function(){d.resolve();}).fail(function(){d.reject();});return d.promise();};this.getPathOfURL=function(u){var o=new U(u);return o.pathname();};}E.hasNoAdapter=false;return E;},true);