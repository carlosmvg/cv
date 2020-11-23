/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2017 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/m/Button","sap/ui/dom/units/Rem"],function(B,R){"use strict";var S={init:function(){this.oBtn=new B().placeAt(sap.ui.getCore().getStaticAreaRef());},getButtonWidth:function(t){this.oBtn.setText(t);this.oBtn.addStyleClass("sapMListTblCell");this.oBtn.rerender();return R.fromPx(this.oBtn.getDomRef().scrollWidth);},exit:function(){this.oBtn.destroy();}};return S;});
