define("zen.rt.components.actionsheet/resources/js/actionsheet_handler", ["sap/zen/basehandler"], 
		function(BaseHandler) {
	"use strict";

	var ActionSheetHandler = function() {
		BaseHandler.apply(this, arguments);
		
		var that = this;
		
		this.oPlacementMapping = {
				"BOTTOM" : sap.m.PlacementType.Bottom,
				"LEFT" : sap.m.PlacementType.Left,
				"RIGHT" : sap.m.PlacementType.Right,
				"TOP" : sap.m.PlacementType.Top,
				"HORIZONTAL" : sap.m.PlacementType.Horizontal,
				"VERTICAL" : sap.m.PlacementType.Vertical,
				"AUTO" : sap.m.PlacementType.Auto
			};
		
		this.oActionSheet = null;
		
		this.oAction = null;
		
		/**
		 * Create the Control
		 */
		this.create = function(oChainedControl, oControlProperties) {
			var lControlId = oControlProperties["id"];
	
			var loControl = this.createButton(lControlId);
			this.init(loControl, oControlProperties);
			loControl.setVisible(false);
	
			return loControl;
		};
	
		/**
		 * Update the Control
		 */
		this.update = function(oControl, oControlProperties) {
			if (oControlProperties) {
				this.init(oControl, oControlProperties);
			}
			
			return oControl;
		};
	
		/**
		 * Initialize (Create, Update)
		 */
		this.init = function(oControl, oControlProperties) {
			var loFuncCleanUpActionSheet = function(){
				if (that.oActionSheet){
					that.oActionSheet.destroyButtons();
					that.oActionSheet.destroy();
					that.oActionSheet = null;
				}
			}
			
			if (oControlProperties.open === true){
				loFuncCleanUpActionSheet(); // just to be safe
				
				that.oActionSheet = new sap.m.ActionSheet(oControl.getId() + "_rendered");
				
				if (oControlProperties.placement){
					that.oActionSheet.setPlacement(that.oPlacementMapping[oControlProperties.placement]);
				} else {					
					that.oActionSheet.setPlacement(sap.m.PlacementType.Auto);
				}
				
				var lOnClickCommand = oControlProperties.onClickCommand;
				
				var ltItems = oControlProperties.items;
				if (ltItems){
					for (var i = 0; i < ltItems.length; i++){
						var loItem = ltItems[i].item;
						
						var loButton = new sap.m.Button(that.oActionSheet.getId()+"_button_"+i);
						
						if (loItem.text){
							loButton.setText(loItem.text);
						} else {
							loButton.setText(loItem.value);
						}
						
						if (loItem.icon){
							loButton.setIcon(loItem.icon);
						}
						
						var lButtonOnClickCommand = lOnClickCommand.replace("__VALUE__", loItem.value);
						loButton.data("onClickCommand", {value: lButtonOnClickCommand});
						
						/**
						 * ATTENTION:
						 * 	the ActionSheet AfterClose command causes us to send a new require-request which interferes with Button Actions:
						 * 	e.g. the SaveAsTile Dialog does not appear
						 * 	For this reason the Button Action need to be performed after the ActionSheet Close-Command
						 */
						//var lButtonOnClickCommand = lOnClickCommand.replace("__VALUE__", loItem.value);
						//var loFuncButtonOnClickCommand = new Function(lButtonOnClickCommand);					
						//loButton.attachPress(loFuncButtonOnClickCommand);
						loButton.attachPress(function() {
							that.oActionSheet.data("onActionCommand", this.data("onClickCommand"));
						});
						
						/**
						 * Save as Tile Button should only be enabled of Personalization is allowed
						 */
						if (loItem.value === "TILE") {
							var loShellConfiguration = sap.ushell.renderers.fiori2.RendererExtensions.getConfiguration();
							 
							if (loShellConfiguration.enablePersonalization !== undefined) {
							    var lEnabled = loShellConfiguration.enablePersonalization;
							    loButton.setEnabled(lEnabled);
							}
						}
						
						that.oActionSheet.addButton(loButton);
					}
				}
				
				/**
				 * wait with the rendering to make sure the openBy UI5 control hasn't been set to invisible in the same roundtrip
				 * ATTENTION: this causes the close action to be performed after the Button Action has been performed
				 */
				setTimeout(function(){
					var loUi5Control = sap.zen.Dispatcher.instance.getRootControlForComponentId(oControlProperties.openBy)
					if (loUi5Control){				
						that.oActionSheet.openBy(loUi5Control);
						that.oActionSheet.attachAfterClose(null, function(){
							var loFuncActionCommand = new Function(this.data("onActionCommand").value);
							var loFuncCloseCommand = new Function(oControlProperties.closeCommand);
							
							// Clean-Up the UI5 ActionSheet Control
							loFuncCleanUpActionSheet();
							
							// Perform the ActionSheet Control Action
							loFuncCloseCommand();
							
							// Perform the Button-Click Action
							loFuncActionCommand();
						});
					}
				}, 1);
			}
		}
				
	    /**
	     * Get Default Proxy Class
	     */
		this.getDefaultProxyClass = function(){
			return [sap.m.ActionSheet, null];
		};
		
	    /**
	     * Get Type for ActionSheet
	     */
		this.getType = function() {
			return "actionsheet";
		};

	};
	
    return new ActionSheetHandler();
});