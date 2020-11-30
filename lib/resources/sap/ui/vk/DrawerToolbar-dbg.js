/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.DrawerToolbar.
sap.ui.define([
	"./library",
	"./DrawerToolbarRenderer",
	"sap/ui/core/Control",
	"sap/m/VBox",
	"sap/m/FlexItemData",
	"sap/m/OverflowToolbar",
	"sap/ui/core/Icon",
	"sap/m/Button",
	"sap/m/ToolbarSeparator",
	"sap/m/ToggleButton",
	"sap/m/MenuButton",
	"./tools/Tool",
	"./tools/RectSelectTool",
	"./tools/CrossSectionTool",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"./ZoomTo",
	"./getResourceBundle",
	"./Viewport",
	"./DrawerToolbarButton",
	"sap/ui/base/ManagedObjectObserver"
], function(
	vkLibrary,
	DrawerToolbarRenderer,
	Control,
	VBox,
	FlexItemData,
	OverflowToolbar,
	Icon,
	Button,
	ToolbarSeparator,
	ToggleButton,
	MenuButton,
	Tool,
	RectSelectTool,
	CrossSectionTool,
	Menu,
	MenuItem,
	ZoomTo,
	getResourceBundle,
	Viewport,
	DrawerToolbarButton,
	ManagedObjectObserver
) {
	"use strict";

	/**
	 * Constructor for a new DrawerToolbar control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Overflow toolbar that can be collapsed.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP
	 * @version 1.82.0
	 *
	 * @public
	 * @alias sap.ui.vk.DrawerToolbar
	 */
	var DrawerToolbar = Control.extend("sap.ui.vk.DrawerToolbar", /** @lends sap.ui.vk.DrawerToolbar.prototype */ {
		metadata: {
			properties: {

				/**
				 * Indicates whether the DrawerToolbar is expanded or not.
				 * If expanded is set to true, then both the toolbar and 'Close' icon are rendered.
				 * If expanded is set to false, then only the 'Open' icon is rendered.
				 */
				expanded: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				/**
				 * Determines the content of the DrawerToolbar. See {@link sap.m.OverflowToolbar} for list of allowed controls.
				 * The content visible when the DrawerToolbar is expanded.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					forwarding: {
						getter: "_getToolbar",
						aggregation: "content",
						forwardBinding: true
					}
				}
			},
			associations: {
				viewport: {
					type: "sap.ui.vk.Viewport",
					multiple: false
				}
			},
			events: {

				/**
				 * Indicates whether the DrawerToolbar is expanded or collapsed.
				 */
				expanded: {
					parameters: {
						/**
						 * If the DrawerToolbar is expanded, this is true.
						 * If the DrawerToolbar is collapsed, this is false.
						 */
						expand: {
							type: "boolean"
						}
					}
				}
			}
		},

		constructor: function(sId, mSettings) {
			Control.apply(this, arguments);
		}
	});

	var drawerToolbarIcons = [ {
			name: "show",
			unicode: "e000"
		}, {
			name: "hide",
			unicode: "e001"
		}, {
			name: "turntable",
			unicode: "e002"
		}, {
			name: "orbit",
			unicode: "e003"
		}, {
			name: "pan",
			unicode: "e004"
		}, {
			name: "zoom",
			unicode: "e005"
		}, {
			name: "fit-to-view",
			unicode: "e006"
		}, {
			name: "rectangular-selection",
			unicode: "e007"
		}, {
			name: "structure-browser",
			unicode: "e008"
		}, {
			name: "configuration",
			unicode: "e009"
		}, {
			name: "setting",
			unicode: "e00a"
		}, {
			name: "full-screen",
			unicode: "e00b"
		}, {
			name: "predefined-views",
			unicode: "e00c"
		}, {
			name: "authoring-app",
			unicode: "e00d"
		}, {
			name: "dot",
			unicode: "e00e"
		}, {
			name: "empty",
			unicode: "e00f"
		}, {
			name: "right-panel-menu",
			unicode: "e010"
		}, {
			name: "viewer-app",
			unicode: "e011"
		}, {
			name: "hide-association",
			unicode: "e012"
		}, {
			name: "cross-section",
			unicode: "e013"
		}, {
			name: "cross-section-x",
			unicode: "e014"
		}, {
			name: "cross-section-z",
			unicode: "e015"
		}, {
			name: "cross-section-y",
			unicode: "e016"
		}, {
			name: "reverse-direction",
			unicode: "e017"
		}, {
			name: "create-editable-visualisation",
			unicode: "e018"
		}, {
			name: "cross-section-z-",
			unicode: "e019"
		} ],
		collectionName = "vk-icons",
		fontFamily = "vk-icons";

	drawerToolbarIcons.forEach(function(icon) {
		sap.ui.core.IconPool.addIcon(icon.name, collectionName, fontFamily, icon.unicode);
	});

	var visIconPath = "sap-icon://vk-icons/";

	DrawerToolbar.prototype.init = function() {
		if (Control.prototype.init) {
			Control.prototype.init.apply(this);
		}

		this._toolbar = new OverflowToolbar({
			width: "auto",
			design: sap.m.ToolbarDesign.Solid,
			layoutData: new FlexItemData({
				growFactor: 0,
				shrinkFactor: 0
			}),
			content: this.createButtons()
		});

		this._toolbar.ontouchstart = function(event) {
			event.setMarked(); // disable the viewport touchstart event under the toolbar
		};

		this._toolbarObserver = new ManagedObjectObserver(this._toolbarContentChanged.bind(this));
		this._toolbarObserver.observe(this._toolbar, { aggregations: [ "content" ] });

		this._container = new VBox({
			renderType: sap.m.FlexRendertype.Bare,
			// fitContainer: false,
			// displayInline: true,
			alignContent: sap.m.FlexAlignContent.Center,
			alignItems: sap.m.FlexAlignItems.Center,
			items: [
				this._toolbar,
				new Icon({
					src: "sap-icon://navigation-up-arrow",
					noTabStop: true,
					press: function(event) {
						this._toggleExpanded();
					}.bind(this),
					layoutData: new FlexItemData({
						growFactor: 0,
						shrinkFactor: 0
					})
				}).addStyleClass("drawerToolbarIcon")
			]
		});

		this._rectSelectTool = new RectSelectTool();
	};

	DrawerToolbar.prototype._toolbarContentChanged = function() {
		var content = this._toolbar.getContent();
		for (var i = 0; i < content.length; i++) {
			if (content[i].getMetadata().getName() == "sap.m.ToolbarSeparator") {
				if (content[i - 1] == undefined || content[i + 1] == undefined || content[i - 1].getMetadata().getName() == "sap.m.ToolbarSeparator") {
					this._toolbar.removeContent(i);
				}
			}
		}
	};

	DrawerToolbar.prototype._getViewport = function() {
		var viewport = sap.ui.getCore().byId(this.getViewport());
		if (viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport" ||
			viewport.getMetadata().getName() === "sap.ui.vk.svg.Viewport") {
			return viewport;
		}
		if (viewport instanceof Viewport &&
			viewport.getImplementation() &&
			(viewport.getImplementation().getMetadata().getName() === "sap.ui.vk.threejs.Viewport" ||
			viewport.getImplementation().getMetadata().getName() === "sap.ui.vk.svg.Viewport")) {
			return viewport.getImplementation();
		}
		return null;
	};

	DrawerToolbar.prototype._getViewStateManager = function() {
		var viewport = sap.ui.getCore().byId(this.getViewport());
		var vsmId = viewport.getViewStateManager();
		if (vsmId) {
			return sap.ui.getCore().byId(vsmId);
		}
		return null;
	};

	var predefineViews = [
		null, // initial
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0), // front
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI), // back
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2), // left
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2), // right
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), // top
		new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2) // bottom
	];

	DrawerToolbar.prototype.createButtons = function() {
		var that = this;

		var crossSectionButton, crossSectionAxis;
		function activateCrossSectionTool(viewport, axis, flip) {
			crossSectionButton.setPressed(true);
			if (that._crossSectionTool) {
				that._crossSectionTool.setActive(true, viewport);
				if (axis !== undefined) {
					that._crossSectionTool.setAxis(axis);
					// that._crossSectionTool.setFlip(flip);
					crossSectionAxis.setIcon(visIconPath + "cross-section-" + [ "x", "y", "z" ][ axis ]);
				}
			}
		}

		crossSectionButton = new ToggleButton({
			icon: visIconPath + "cross-section",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Cross Section",
			press: function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					// crossSectionAxis.setEnabled(this.getPressed());
					if (this.getPressed()) {
						activateCrossSectionTool(viewport);
					} else if (that._crossSectionTool) {
						that._crossSectionTool.setActive(false, viewport);
					}
				}
			}
		});
		crossSectionButton.vitId = DrawerToolbarButton.CrossSection;

		crossSectionAxis = new MenuButton({
			type: sap.m.ButtonType.Transparent,
			tooltip: "Cross Section Axis",
			icon: visIconPath + "cross-section-x",
			// buttonMode: "Split",
			menu: new Menu({
				items: [
					new MenuItem({
						icon: visIconPath + "cross-section-x",
						text: getResourceBundle().getText("CROSS_SECTION_X"),
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 0, false);
							}
						}
					}),
					new MenuItem({
						icon: visIconPath + "cross-section-y",
						text: getResourceBundle().getText("CROSS_SECTION_Y"),
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 1, false);
							}
						}
					}),
					new MenuItem({
						icon: visIconPath + "cross-section-z",
						text: getResourceBundle().getText("CROSS_SECTION_Z"),
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport) {
								activateCrossSectionTool(viewport, 2, false);
							}
						}
					}),
					new MenuItem({
						icon: visIconPath + "reverse-direction",
						text: getResourceBundle().getText("CROSS_SECTION_REVERSE"),
						startsSection: true,
						press: function(event) {
							var viewport = that._getViewport();
							if (viewport && that._crossSectionTool && that._crossSectionTool.getActive()) {
								that._crossSectionTool.setFlip(!that._crossSectionTool.getFlip());
							}
						}
					})
				]
			})
		});
		crossSectionAxis.vitId = DrawerToolbarButton.CrossSectionAxis;

		var turntable = new ToggleButton({
			icon: visIconPath + "turntable",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Turntable",
			press: function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					that._activateGesture(viewport, 0);
				}
			}
		});
		turntable.vitId = DrawerToolbarButton.Turntable;

		var orbit = new ToggleButton({
			icon: visIconPath + "orbit",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Orbit",
			pressed: false,
			press: function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					that._activateGesture(viewport, 1);
				}
			}
		});
		orbit.vitId = DrawerToolbarButton.Orbit;

		var pan = new ToggleButton({
			icon: visIconPath + "pan",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Pan",
			press: function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					that._activateGesture(viewport, 2);
				}
			}
		});
		pan.vitId = DrawerToolbarButton.Pan;

		var zoom = new ToggleButton({
			icon: visIconPath + "zoom",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Zoom",
			press: function() {
				var viewport = that._getViewport();
				if (viewport) {
					that._activateGesture(viewport, 3);
				}
			}
		});
		zoom.vitId = DrawerToolbarButton.Zoom;

		this._gestureButtons = [
			turntable,
			orbit,
			pan,
			zoom
		];

		var show = new Button({
			icon: visIconPath + "show",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Show",
			press: function() {
				var vsm = that._getViewStateManager();
				if (vsm) {
					var selected = [];
					vsm.enumerateSelection(function(item) {
						selected.push(item);
					});
					vsm.setVisibilityState(selected, true, true);
				}
			}
		});
		show.vitId = DrawerToolbarButton.Show;

		var hide = new Button({
			icon: visIconPath + "hide",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Hide",
			press: function() {
				var vsm = that._getViewStateManager();
				if (vsm) {
					var selected = [];
					vsm.enumerateSelection(function(item) {
						selected.push(item);
					});
					vsm.setVisibilityState(selected, false, true);
				}
			}
		});
		hide.vitId = DrawerToolbarButton.Hide;

		var fitToView = new Button({
			icon: visIconPath + "fit-to-view",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("FIT_TO_VIEW"),
			press: function() {
				var viewport = sap.ui.getCore().byId(that.getViewport());
				if (viewport) {
					viewport.zoomTo(ZoomTo.All, null, 0.5, 0);
				}
			}
		});
		fitToView.vitId = DrawerToolbarButton.FitToView;

		this._rectSelectionButton = new ToggleButton({
			icon: visIconPath + "rectangular-selection",
			type: sap.m.ButtonType.Transparent,
			tooltip: "Rectangular Selection"
		});
		this._rectSelectionButton.vitId = DrawerToolbarButton.RectangularSelection;

		var predefinedViews = new MenuButton({
			icon: visIconPath + "predefined-views",
			activeIcon: visIconPath + "predefined-views",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("PREDEFINED_VIEW_MENUBUTTONTOOLTIP"),
			menu: new Menu({
				items: [
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_INITIAL") }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_FRONT"), startsSection: true }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_BACK") }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_LEFT") }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_RIGHT") }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_TOP") }),
					new MenuItem({ text: getResourceBundle().getText("PREDEFINED_VIEW_BOTTOM") })
				]
			}).attachItemSelected(function(event) {
				var viewport = that._getViewport();
				if (viewport) {
					var item = event.getParameters("item").item;
					var index = this.indexOfItem(item);
						viewport._viewportGestureHandler.setView(predefineViews[ index ], 1000);
				}
			})
		});
		predefinedViews.vitId = DrawerToolbarButton.PredefinedViews;

		var fullscreen = new ToggleButton({
			icon: visIconPath + "full-screen",
			type: sap.m.ButtonType.Transparent,
			tooltip: getResourceBundle().getText("VIEWER_FULLSCREENBUTTONTOOLTIP"),
			press: function(event) {
				var viewport = that._getViewport();
				var isInFullScreen = function(document) {
					return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement);
				};
				if (this.getPressed()) {
					if (!isInFullScreen(document)) {
						if (!that._fullScreenHandler) {
							that._fullScreenHandler = function(event) {
								var isFullScreen = isInFullScreen(document);
								if (!isFullScreen) {
									document.removeEventListener("fullscreenchange", that._fullScreenHandler);
									document.removeEventListener("mozfullscreenchange", that._fullScreenHandler);
									document.removeEventListener("webkitfullscreenchange", that._fullScreenHandler);
									document.removeEventListener("MSFullscreenChange", that._fullScreenHandler);

									this.setPressed(false);
									viewport.removeStyleClass("sapVizKitViewerFullScreen");
								}
							}.bind(this);
						}

						var bodyElement = document.getElementsByTagName("body")[ 0 ];
						if (bodyElement.requestFullscreen) {
							document.addEventListener("fullscreenchange", that._fullScreenHandler);
							bodyElement.requestFullscreen();
						} else if (bodyElement.webkitRequestFullScreen) {
							document.addEventListener("webkitfullscreenchange", that._fullScreenHandler);
							bodyElement.webkitRequestFullscreen();
						} else if (bodyElement.mozRequestFullScreen) {
							document.addEventListener("mozfullscreenchange", that._fullScreenHandler);
							bodyElement.mozRequestFullScreen();
						} else if (bodyElement.msRequestFullscreen) {
							document.addEventListener("MSFullscreenChange", that._fullScreenHandler);
							bodyElement.msRequestFullscreen();
						}
					}

					viewport.addStyleClass("sapVizKitViewerFullScreen");
				} else {
					if (isInFullScreen(document)) {
						if (document.cancelFullScreen) {
							document.cancelFullScreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.webkitCancelFullScreen) {
							document.webkitCancelFullScreen();
						}
					}

					viewport.removeStyleClass("sapVizKitViewerFullScreen");
				}
			}
		});
		fullscreen.vitId = DrawerToolbarButton.FullScreen;

		var crossSectionSeparator = new ToolbarSeparator();
		var predefinedViewsSeparator = new ToolbarSeparator();

		this._items3D = [
			this._gestureButtons[ 0 ],
			this._gestureButtons[ 1 ],
			crossSectionButton,
			crossSectionAxis,
			crossSectionSeparator,
			predefinedViews,
			predefinedViewsSeparator
		];

		var items = [
			show,
			hide,
			new ToolbarSeparator(),
			this._gestureButtons[ 0 ],
			this._gestureButtons[ 1 ],
			this._gestureButtons[ 2 ],
			this._gestureButtons[ 3 ],
			new ToolbarSeparator(),
			fitToView,
			new ToolbarSeparator(),
			this._rectSelectionButton,
			new ToolbarSeparator(),
			crossSectionButton,
			crossSectionAxis,
			crossSectionSeparator,
			predefinedViews,
			predefinedViewsSeparator,
			fullscreen
		];
		return items;
	};

	var gestureIcons = [ "drawerToolbarIconTurntable", "drawerToolbarIconOrbit", "drawerToolbarIconPan", "drawerToolbarIconZoom" ];
	var gestureIcons360 = [ "drawerToolbarIconTurntable360", "drawerToolbarIconOrbit360", "drawerToolbarIconPan360", "drawerToolbarIconZoom360" ];

	var CameraHandler = function(vp, toolbar) {
		this.viewport = vp;
		this._toolbar = toolbar;
		this._mode = 1;
		this._gesture = false;
		this._x = 0;
		this._y = 0;
	};

	function setGestureIcon(viewport, mode) {
		var icons = viewport._isPanoramicActivated() ? gestureIcons360 : gestureIcons;
		icons.forEach(function(icon, i) {
			if (viewport.hasStyleClass(icon) && i !== mode) {
				viewport.removeStyleClass(icon);
			} else if (i === mode) {
				viewport.addStyleClass(icon);
			}
		});
	}

	function showZoomIconOnScroll(cameraHandler) {
		var viewport = cameraHandler.viewport;
		var mode = cameraHandler._mode;
		var originalIcon = viewport.hasStyleClass(gestureIcons[ mode ]) || viewport._isPanoramicActivated() ? mode : -1;
		cameraHandler._isScrolling = true;
		if (originalIcon !== 3) {
			// set to zoom icon
			setGestureIcon(viewport, 3);
			// set to original icon when scrolling stop
			setTimeout(function() {
				cameraHandler._isScrolling = false;
				setGestureIcon(viewport, originalIcon);
			}, 500);
		}
	}

	function isViewport3D(viewport) {
		return viewport ? viewport.getMetadata().getName() === "sap.ui.vk.threejs.Viewport" : false;
	}

	CameraHandler.prototype.beginGesture = function(event) {
		this._gesture = true;
		if (this._mode < 3) {
			this._x = event.points[ 0 ].x;
			this._y = event.points[ 0 ].y;
		} else {
			this._x = event.x;
			this._y = event.y;
		}

		if (event.scroll) {
			showZoomIconOnScroll(this);
		}

		if (this._toolbar._rectSelectionButton.getPressed() || (event.event && (sap.ui.Device.os.macintosh ? event.event.metaKey : event.event.ctrlKey))) {
			var rect = this.viewport.getDomRef().getBoundingClientRect();
			this._selectionRect = { x1: this._x - rect.left, y1: this._y - rect.top, x2: this._x - rect.left, y2: this._y - rect.top };
		}
	};

	CameraHandler.prototype.endGesture = function() {
		this._gesture = false;
		if (this._selectionRect && (this._selectionRect.x1 !== this._selectionRect.x2 || this._selectionRect.y1 !== this._selectionRect.y2)) {
			if (isViewport3D(this.viewport)) {
				this._toolbar._rectSelectTool._select(this._selectionRect.x1, this._selectionRect.y1, this._selectionRect.x2, this._selectionRect.y2, this.viewport, this.viewport.getScene(), this.viewport.getCamera());
			} else {
				this.viewport._select(this._selectionRect);
			}
			this._selectionRect = null;
			this.viewport.setSelectionRect(null);
		} else if (!this.viewport._isPanoramicActivated() && !this._isScrolling) {
			setGestureIcon(this.viewport, -1);
		}
	};

	CameraHandler.prototype.move = function(event) {
		if (this._gesture && event.n == 1) {
			var p = event.points[ 0 ];
			if (this._selectionRect) {
				var rect = this.viewport.getDomRef().getBoundingClientRect();
				this._selectionRect.x2 = p.x - rect.left;
				this._selectionRect.y2 = p.y - rect.top;
				this.viewport.setSelectionRect(this._selectionRect);
			} else {
				setGestureIcon(this.viewport, this._mode);
				var dx = p.x - this._x;
				var dy = p.y - this._y;
				var cameraController = isViewport3D() ? this.viewport._viewportGestureHandler._cameraController : this.viewport;
				switch (this._mode) {
					case 0: cameraController.rotate(dx, dy, true); break;
					case 1: cameraController.rotate(dx, dy, false); break;
					case 2: cameraController.pan(dx, dy); break;
					case 3: cameraController.zoom(1 + dy * 0.005); break;
					default: break;
				}
				this._x = p.x;
				this._y = p.y;
			}
			event.handled = true;
		}
	};

	CameraHandler.prototype.hover = function() {};
	CameraHandler.prototype.getViewport = function() {
		return this.viewport;
	};

	DrawerToolbar.prototype._activateGesture = function(viewport, mode) {
		this._gestureButtons.forEach(function(gestureButton, index) {
			gestureButton.setPressed(index === mode);
		});

		if (!this._cameraHandler || this._cameraHandler.getViewport() != viewport) {
			this._cameraHandler = new CameraHandler(viewport, this);
			viewport._loco.addHandler(this._cameraHandler, 0);
		}

		this._cameraHandler._mode = mode;

		// Change cursor shape immidiately after tool selected on pano scene
		if (viewport._isPanoramicActivated()) {
			setGestureIcon(viewport, mode);
		}
	};

	DrawerToolbar.prototype._getToolbar = function() {
		return this._toolbar;
	};

	DrawerToolbar.prototype._toggleExpanded = function() {
		var newState = !this.getExpanded();
		this.setExpanded(newState);

		this.fireExpanded({
			expand: newState
		});
	};

	/**
	 * Sets the expanded property of the control.
	 * @param {boolean} bExpanded Defines whether control is expanded or not.
	 * @returns {sap.ui.vk.DrawerToolbar} Pointer to the control instance to allow method chaining.
	 * @public
	 */
	DrawerToolbar.prototype.setExpanded = function(bExpanded) {
		this.setProperty("expanded", bExpanded, true);

		var domRef = this.getDomRef();
		if (domRef) {
			if (!bExpanded) {
				domRef.classList.add("drawerToolbarCollapsed");
				domRef.classList.remove("drawerToolbarExpanded");
				this._container.addStyleClass("vboxCollapsed");
			} else {
				domRef.classList.add("drawerToolbarExpanded");
				domRef.classList.remove("drawerToolbarCollapsed");
				this._container.removeStyleClass("vboxCollapsed");
			}
		}

		return this;
	};

	DrawerToolbar.prototype.onBeforeRendering = function() {
		var viewport = this._getViewport();
		if (viewport) {
			var is3D = isViewport3D(viewport);

			this._items3D.forEach(function(item) {
				item.setVisible(is3D);
			});

			if (is3D) {
				this._crossSectionTool = this._crossSectionTool || new CrossSectionTool();
				viewport.addTool(this._crossSectionTool);
			}

			this._activateGesture(viewport, is3D ? 1 : 2);
		}
	};

	return DrawerToolbar;
});
