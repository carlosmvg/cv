// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/Fragment","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/Sorter"],function(C,F,a,b,S){"use strict";return C.extend("sap.ushell_abap.transport.controller.TransportTable.controller",{onInit:function(){this.sObjectId=undefined;this.sObjectType=undefined;},connect:function(c){this.oComponent=c;},handleSortDialogConfirm:function(e){var p=e.getParameters(),P=p.sortItem.getKey(),d=p.sortDescending,s;s=new S(P,d);this.byId("assignedTransportTable").getBinding("items").sort(s);},onSort:function(){if(this.oViewSettingsDialog){this.oViewSettingsDialog.open();return;}F.load({name:"sap.ushell_abap.transport.view.SortDialog",controller:this}).then(function(d){this.oViewSettingsDialog=d;d.setModel(this.oComponent.getModel("i18n"),"i18n");d.open();}.bind(this));},onAdd:function(){if(!this.byId("transportAssignDialog--transportDialog")){F.load({id:this.createId("transportAssignDialog"),name:"sap.ushell_abap.transport.view.TransportDialog",type:"XML",controller:this}).then(function(d){this.getView().addDependent(d);this.oComponent.showTransport({id:this.sObjectId},this.sObjectType).then(function(){d.open();}.bind(this));}.bind(this));}else{this.oComponent.showTransport({id:this.sObjectId},this.sObjectType).then(function(){this.byId("transportAssignDialog--transportDialog").open();}.bind(this));}},onBeforeOpen:function(e){var d=e.getSource(),t=d.getContent()[0];t.setComponent(this.oComponent);},onCancel:function(){this.byId("transportAssignDialog--transportDialog").close();},onSave:function(e){var t=this.oComponent.getModel("TransportInformation").getProperty("/transportId");if(t){this.oComponent.fireAssign({transportId:t});e.getSource().getParent().close();this.byId("assignedTransportTable").getBinding("items").refresh(true);}},bindItems:function(o,c,i){var f=[],t;f.push(new a("objectId",b.EQ,o));f.push(new a("objectType",b.EQ,c));this.sObjectId=o;this.sObjectType=c;this.byId("assignedTransportTable").bindItems({path:"Transport>/assignedTransportSet",filters:f,sorter:new S("id"),template:this.byId("assignedTransportTemplate").clone(),events:{dataReceived:function(e){var d=e.getParameter&&e.getParameter("data"),r=d&&d.results||[];t=this.getView().getModel("i18n").getResourceBundle().getText("IconTabFilterText",[r.length.toString()]);i.setText(t);}.bind(this)}});t=this.getView().getModel("i18n").getResourceBundle().getText("IconTabFilterText",["0"]);i.setText(t);}});});