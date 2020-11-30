/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides object sap.ui.vk.svg.SceneBuilder.
sap.ui.define([
	"sap/base/Log",
	"./Element",
	"./Ellipse",
	"./Rectangle",
	"./Line",
	"./Polyline",
	"./Path",
	"./Text",
	"../View",
	"../totara/TotaraUtils"
], function(
	Log,
	Element,
	Ellipse,
	Rectangle,
	Line,
	Polyline,
	Path,
	Text,
	View,
	TotaraUtils
) {
	"use strict";

	/**
	 * Provides the ability to create SVG scene from the information retrieved from streaming or vds file.
	 * SceneBuilder allows for creating scene tree, material, and drawing elements in any order.
	 *
	 * Constructor for a new SceneBuilder
	 *
	 * @param {any} rootNode The reference object of a root node.
	 * 							When <code>rootNode</code> is specified in constructor, it's assumed that
	 * 							the constructed SceneBuilder only deals with one root node, and therefore one single scene.<br/>
	 * 							When <code>rootNode</code> is not specified, the function setRootNode has to be called for each root node.

	 * @param {any} contentResource From content manager, only used for vds file reading (matai.js).
	 * @param {any} resolve From content manager, called in setScene function, only used for vds file reading (matai.js).
	 * @param {any} reject From content manager, called in serScene function, only used for vds file reading (matai.js).
	 *
	 * @private
	 * @author SAP SE
	 * @version 1.82.0
	 * @experimental Since 1.81.0 This class is experimental and might be modified or removed in future versions.
	 */
	var SceneBuilder = function(rootNode, contentResource, resolve, reject) {
		this._sceneIdTreeNodesMap = new Map();	// map of scene id and map of tree nodes
		this._sceneIdRootNodeMap = new Map();	// map of scene id and root node
		this._materialMap = new Map();			// map of loaded materials
		this._materialNodesMap = new Map();		// map of material usage in nodes
		this._nodes = new Map();
		this._views = new Map();
		this._geometries = new Map();			// geometryId -> geometry info
		this._geometryMeshes = new Map();		// geometryId -> [ submesh info ]
		this._meshNodes = new Map();			// meshId -> [ Element ]
		this._meshSubmeshes = new Map();
	};

	/**
	 * Set current root node, and create corresponding tree nodes map and mesh ID map
	 *
	 * @param {any} rootNode The reference object of root node
	 * @param {any} nodeId The id of root node in the scene tree
	 * @param {any} sceneId The id of scene with the root node as its top node
	 * @param {sap.ui.vk.svg.Scene} vkScene scene
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining
	 * @public
	 */
	SceneBuilder.prototype.setRootNode = function(rootNode, nodeId, sceneId, vkScene) {
		this._rootNode = rootNode;
		this._nodes.set(nodeId, rootNode);

		if (sceneId) {
			this._sceneIdTreeNodesMap.set(sceneId, this._nodes);
			this._sceneIdRootNodeMap.set(sceneId, rootNode);
			this._currentSceneId = sceneId;
		}

		if (vkScene) {
			this._vkScene = vkScene;
		}
		return this;
	};

	/**
	 * @param {sap.ui.vk.svg.Element} nodeRef Reference to the node which persistent id is set
	 * @param {string} nodeId Node's persistent identifier
	 * @param {string} sceneId The id of the scene where node is loaded
	 * @returns {boolean} <code>true</code> if id is successfully set, otherwise <code>false</code>
	 * @public
	 */
	SceneBuilder.prototype.setNodePersistentId = function(nodeRef, nodeId, sceneId) {
		this._resetCurrentScene(sceneId);

		nodeRef.sid = nodeId;
		this._nodes.set(nodeId, nodeRef);
		return true;
	};

	/**
	 * Clear all data stored in SceneBuilder
	 *
	 * @public
	 */
	SceneBuilder.prototype.cleanup = function() {
		this._rootNode = null;

		this._currentSceneId = null;

		if (this._nodes) {
			this._nodes.clear();
		}
		if (this._viewGroups) {
			this._viewGroups.clear();
		}
		if (this._views) {
			this._views.clear();
		}

		this._materialMap.clear();
		this._materialNodesMap.clear();
		this._sceneIdTreeNodesMap.clear();
		this._sceneIdRootNodeMap.clear();
	};

	/**
	 * Get SVG element
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.svg.Element} Element group node
	 * @public
	 */
	SceneBuilder.prototype.getNode = function(nodeId, sceneId) {
		if (sceneId) {
			this._resetCurrentScene(sceneId);
			if (this._nodes) {
				return this._nodes.get(nodeId);
			}
		} else {
			var contextIterator = this._sceneIdTreeNodesMap.values();
			var contextItem = contextIterator.next();
			while (!contextItem.done) {
				var node = contextItem.value.get(nodeId);
				if (node) {
					return node;
				}
				contextItem = contextIterator.next();
			}
		}
		return null;
	};

	SceneBuilder.prototype._resetCurrentScene = function(sceneId) {
		if (sceneId && sceneId !== this._currentSceneId) {
			var nodes = this._sceneIdTreeNodesMap.get(sceneId);
			if (nodes) {
				this._nodes = nodes;
			} else {
				this._nodes = new Map();
			}

			var node = this._sceneIdRootNodeMap.get(sceneId);
			if (node) {
				this._rootNode = node;
			} else {
				this._rootNode = null;
			}

			this._currentSceneId = sceneId;
		}
	};

	/**
	 * Create a camera from camera information (not used in SVG)
	 *
	 * @param {any} cameraInfo <br/>
	 * @param {any} sceneId The id of scene containing the nodes
	 *
	 * @returns {any} The created camera
	 * @public
	 */
	SceneBuilder.prototype.createCamera = function(cameraInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		// TODO: There is no camera in SVG scene, calculate drawings position and zoom level to match camera definition
		return null;
	};

	/**
	 * Get camera from camera Id (not used in SVG)
	 *
	 * @param {any} cameraId The id of camera
	 * @returns {any} The camera
	 * @public
	 */
	SceneBuilder.prototype.getCamera = function(cameraId) {
		return null;
	};

	SceneBuilder.prototype.hasMesh = function(meshId) {
		return this._meshSubmeshes.has(meshId);
	};

	function findBestLOD(lods) {
		if (Array.isArray(lods)) {
			for (var i = 0; i < lods.length; i++) {
				if (lods[ i ].type === undefined || lods[ i ].type === "mesh" || lods[ i ].type === "line") {
					return lods[ i ];
				}
			}
		}

		return null;
	}

	SceneBuilder.prototype.insertSubmesh = function(submeshInfo) {
		// console.log("insertSubmesh", submeshInfo, sceneBoundingbox);
		if (!submeshInfo.lods) {
			return false;
		}

		var lod = findBestLOD(submeshInfo.lods);
		if (!lod) {
			return false;
		}

		submeshInfo.boundingBox = lod.boundingBox;

		var geometry = this._geometries.get(lod.id);
		if (geometry) {
			var nodes = this._meshNodes.get(submeshInfo.meshId);
			if (nodes) {
				for (var ni = 0; ni < nodes.length; ni++) {
					this._addGeometryToNode(nodes[ ni ], geometry, submeshInfo);
				}
			}
		} else {
			TotaraUtils.pushElementIntoMapArray(this._geometryMeshes, lod.id, submeshInfo);
		}

		TotaraUtils.pushElementIntoMapArray(this._meshSubmeshes, submeshInfo.meshId, submeshInfo);
	};

	/**
	 * Insert a view group
	 *
	 * @param {any} info View group information
	 * @param {any} sceneId The id of scene containing the node
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertViewGroup = function(info, sceneId) {
		return this;
	};

	/**
	 * Insert a view
	 *
	 * @param {any} viewInfo View information
	 * @param {any} sceneId The scene identifier
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.insertView = function(viewInfo, sceneId) {
		this._resetCurrentScene(sceneId);
		var view = new View();
		view.setViewId(viewInfo.viewId);
		view.setName(viewInfo.name);
		view.userData = {
			viewInfo: viewInfo
		};
		this._views.set(viewInfo.viewId, view);
		return this;
	};

	/**
	 * Get a view
	 *
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.View} View
	 * @public
	 */
	SceneBuilder.prototype.getView = function(viewId, sceneId) {
		this._resetCurrentScene(sceneId);
		return this._views.get(viewId);
	};

	/**
	 * Add a camera to a view
	 *
	 * @param {any} cameraId The id of camera
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewCamera = function(cameraId, viewId, sceneId) {
		return this;
	};

	/**
	 * Get ids of child nodes of a node.
	 *
	 * @param {any} nodeId The id of node in the scene tree
	 * @param {any} sceneId The id of scene containing the node
	 * @param {boolean} includeMeshNode If set to <code>true</code> then id's of drawing sub-objects will be included in returned array.
	 * @returns {any[]} array of child node ids
	 * @public
	 */
	SceneBuilder.prototype.getChildNodeIds = function(nodeId, sceneId, includeMeshNode) {
		this._resetCurrentScene(sceneId);

		var node = this._nodes.get(nodeId);

		var ids = [];

		if (!node) {
			return ids;
		}

		if (node && node.children) {
			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[ i ];
				if (child.userData.treeNode && child.userData.treeNode.sid) {
					ids.push(child.userData.treeNode.sid);
				} else if (includeMeshNode && child.userData.submeshInfo && child.userData.submeshInfo.id) {
					ids.push(child.userData.submeshInfo.id);
				}
			}
		}
		return ids;
	};

	/**
	 * Add an array of node infos to a view
	 *
	 * @param {any} nodeInfos Array of node info
	 * @param {any} viewId The id of view
	 * @param {any} sceneId The id of scene
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setViewNodeInfos = function(nodeInfos, viewId, sceneId) {
		this._resetCurrentScene(sceneId);

		var view = this._views.get(viewId);
		view.setNodeInfos(nodeInfos);

		return this;
	};

	/**
	 * Finalize view group data, should be called after all views are read
	 *
	 * @param {string} sceneId Id of scene
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.finalizeViewGroups = function(sceneId) {
		return this;
	};

	/**
	 * Set threshold number which controls loading of LOD levels
	 * @param {number} voxelThreshold The ratio of the item bounding box to the scene/view bounding box.
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setVoxelThreshold = function(voxelThreshold) {
		return this;
	};

	/**
	 * Get threshold number which controls loading of LOD levels
	 * @returns {number} Threshold level.
	 * @public
	 */
	SceneBuilder.prototype.getVoxelThreshold = function() {
		return 0.0;
	};

	/**
	 * Create SVG grouping element
	 *
	 * @param {any} nodeInfo The node information object containning the following properties <br/>
	* 							<code>sid</code>: String. The id of node.
	 * 							<code>parametricId</code>: String. The id of object's parametric representation.
	 * 							<code>name</code>: String. The name of the node. Optional.<br/>
	 * 							<code>visible</code>: Boolean. True if the node is visible. Default true. Optional<br/>
	 * 							<code>visualisable</code>: Boolean. False if the node is skipped. Default true. Optional<br/>
	 * 							<code>materialId</code>: String. The id of the material the node is associated with. Optional<br/>
	 * 							<code>meshId</code>: String. The id of the mesh. Optional<br/>
	 * 							<code>opacity</code>: String. The opacity of node, to be applied to submesh nodes. Optional<br/>
	 * 							<code>parentId</code>: id of parent node. Optional<br/>
	 *
	 * @param {string} sceneId The id of scene containing the node
	 * @returns {any} The created node<br/>
	*/
	SceneBuilder.prototype.createNode = function(nodeInfo, sceneId) {
		this._resetCurrentScene(sceneId);

		var transform = nodeInfo.transform;
		var node = new Element({
			sid: nodeInfo.sid,
			name: nodeInfo.name,
			// TODO: Check if rotation and scale parameters are correct
			// matrix: transform ? [ transform[ 0 ], transform[ 1 ], transform[ 3 ], transform[ 4 ], transform[ 9 ], transform[ 11 ] ] : undefined
			matrix: transform ? [ transform[ 0 ], transform[ 2 ], transform[ 6 ], transform[ 8 ], transform[ 9 ], transform[ 11 ] ] : undefined
		});
		this._nodes.set(nodeInfo.sid, node);

		if (nodeInfo.parametricId) {
			node.userData.parametricId = nodeInfo.parametricId;
		} else if (nodeInfo.meshId) {
			this._setMeshNode(node, nodeInfo.meshId);
		}

		node.userData.treeNode = nodeInfo;
		node.setVisible(1, nodeInfo.visible ? nodeInfo.visible : true);

		if (nodeInfo.visualisable === false) {
			node.userData.skipIt = true; // Don't display this node in scene tree
		}

		var parent = this._nodes.get(nodeInfo.parentId);
		(parent || this._rootNode).add(node);

		return node;
	};

	////////////////////////////////////////////////////////////////////////
	// Add an annotation to a node
	SceneBuilder.prototype.createAnnotation = function(annotation, sceneId) {
		// TODO: Implement HTML annotations for 2D content
	};

	/**
	 * Delete array of nodes
	 *
	 * @param {any[]} nodeIds Array of ids of nodes to be deleted
	 * @param {any} sceneId The id of scene containing the nodes
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.remove = function(nodeIds, sceneId) {
		this._resetCurrentScene(sceneId);

		var that = this;

		nodeIds = [].concat(nodeIds);
		nodeIds.forEach(function(id) {
			var target = that._nodes.get(id); // search tree node map
			if (target) {
				that._nodes.delete(id);

				for (var i = 0; i < target.children.length; i++) {
					var child = target.children[ i ];
					if (child.userData && child.userData.treeNode && child.userData.treeNode.sid) {
						that.remove(child.userData.treeNode.sid, sceneId);
					}
				}
			}
		});

		return this;
	};

	SceneBuilder.prototype._addPolylineSegment = function(segments, indices, points) {
		var count = indices.length;
		if (count < 2) {
			return;
		}
		var polylinePoints = [];
		var closed = indices[ 0 ] === indices[ count - 1 ];
		if (closed) {
			count--;
		}
		for (var i = 0, l = indices.length; i < l; i++) {
			var ei = indices[ i ] * 3;
			polylinePoints.push(points[ ei ], points[ ei + 2 ]);
		}
		segments.push({
			type: "polyline",
			points: polylinePoints,
			closed: closed
		});
	};

	SceneBuilder.prototype._addGeometryToNode = function(node, geometry, submeshInfo) {
		var materialId = submeshInfo.materialId;
		var material = this._materialMap.get(materialId);
		// console.log("addGeometryToNode", node.name, node, geometry, submeshInfo.transform, submeshInfo.boundingBox, material);
		var data = geometry.data;
		var indices = data.indices;
		var points = data.points;
		var matrix = new Float32Array([ 1, 0, 0, 1, 0, 0 ]);
		if (geometry.isPositionQuantized && submeshInfo.boundingBox) {
			// TODO: dequantize points or update matrix
		}
		if (submeshInfo.transform) {
			// TODO: transform points or update matrix
		}
		var i, i0, i1, i2;
		var l = indices.length;
		var segments = [];
		if (geometry.isPolyline) {
			material = Object.assign(material, { color: [ 0, 0, 0, 0 ] }); // no fill
			var polylineIndices = [];
			for (i = 0, i0 = -1; i < l; i += 2, i0 = i2) {
				i1 = indices[ i ];
				i2 = indices[ i + 1 ];
				if (i1 !== i0) {
					this._addPolylineSegment(segments, polylineIndices, points);
					polylineIndices.length = 0;
					polylineIndices.push(i1);
				}
				polylineIndices.push(i2);
			}

			this._addPolylineSegment(segments, polylineIndices, points);
		} else {
			material = Object.assign(material, { lineColor: [ 0, 0, 0, 0 ], lineWidth: 0 }); // no stroke
			var meshPoints = [];
			for (i = 0; i < l; i += 3) {
				i0 = indices[i] * 3;
				i1 = indices[i + 1] * 3;
				i2 = indices[i + 2] * 3;
				meshPoints.push(points[ i0 ], points[ i0 + 2 ], points[ i1 ], points[ i1 + 2 ], points[ i2 ], points[ i2 + 2 ]);
			}
			segments.push({
				type: "mesh",
				points: meshPoints
			});
		}

		var path = new Path({
			segments: segments,
			isTriangleMesh: !geometry.isPolyline,
			matrix: matrix,
			material: material,
			materialID: materialId,
			subelement: true
		});
		path.uid += "-g";
		node.add(path);

		TotaraUtils.pushElementIntoMapArray(this._materialNodesMap, materialId, path);

		node.rerender();
	};

	/**
	 * Create a geometry from geometry information
	 *
	 * @param {any} geomInfo The object of geometry information that have the following properties<br/>
	 *								<code>id</code> : string, id of this geometry<br/>
	 *								<code>isPolyline</code>: boolean, true if the submesh is polyline<br/>
	 *								<code>isPositionQuantized</code>: boolean, true if the asociated submesh needs to be repositioned to bounding box centre<br/>
	 *								<code>data.indices</code>: array of point index<br/>
	 *								<code>data.points</code>: array of point coordinates<br/>
	 *								<code>data.uvs</code>: array of texture uv coordinates, optional<br/>
	 *
	 * @returns {sap.ui.vk.svg.SceneBuilder} <code>this</code> to allow method chaining.
	 * @public
	 */
	SceneBuilder.prototype.setGeometry = function(geomInfo) {
		this._geometries.set(geomInfo.id, geomInfo);
		// console.log("setGeometry", geomInfo);

		var geometryMeshes = this._geometryMeshes.get(geomInfo.id);
		if (geometryMeshes) {
			for (var mi = 0; mi < geometryMeshes.length; mi++) {
				var submeshInfo = geometryMeshes[ mi ];
				var nodes = this._meshNodes.get(submeshInfo.meshId);
				if (nodes) {
					for (var ni = 0; ni < nodes.length; ni++) {
						this._addGeometryToNode(nodes[ ni ], geomInfo, submeshInfo);
					}
				}
			}
		}

		if (this._fireSceneUpdated) {
			this._fireSceneUpdated();
		}

		return this;
	};

	SceneBuilder.prototype._setMeshNode = function(node, meshId) {
		TotaraUtils.pushElementIntoMapArray(this._meshNodes, meshId, node);

		var submeshes = this._meshSubmeshes.get(meshId);
		if (submeshes) {
			for (var i = 0; i < submeshes.length; i++) {
				var submeshInfo = submeshes[ i ];
				var lod = findBestLOD(submeshInfo.lods);
				if (lod) {
					var geometry = this._geometries.get(lod.id);
					if (geometry) {
						this._addGeometryToNode(node, geometry, submeshInfo);
					}
				}
			}
		}
	};

	function getTransformationMatrix(shape) {
		var matrix = new Float32Array([ 1, 0, 0, 1, 0, 0 ]);
		if (shape.t) {
			matrix[ 4 ] = shape.t[ 0 ];
			matrix[ 5 ] = shape.t[ 1 ];
		}
		if (shape.r) {
			var x = shape.r[ 0 ], y = shape.r[ 1 ], z = shape.r[ 2 ], w = shape.r[ 3 ];
			var xy = x * y;
			var zz = z * z;
			var wz = w * z;
			matrix[ 0 ] = 1 - (y * y + zz) * 2;
			matrix[ 1 ] = (xy + wz) * 2;
			matrix[ 2 ] = (xy - wz) * 2;
			matrix[ 3 ] = 1 - (x * x + zz) * 2;
		}
		if (shape.s) {
			matrix[ 0 ] *= shape.s[ 0 ];
			matrix[ 1 ] *= shape.s[ 0 ];
			matrix[ 2 ] *= shape.s[ 1 ];
			matrix[ 3 ] *= shape.s[ 1 ];
		}
		return matrix;
	}

	function optimizeShapes(shapes) {
		var segments = [];
		var materialID;

		function addShape() {
			if (segments.length > 0) {
				segments.forEach(function(segment) {
					var points = segment.points;
					if (points && points.length >= 4 && points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
						segment.closed = true;
						points.length -= 2;
					}
				});

				shapes.push({
					type: "path",
					segments: segments,
					materialID: materialID
				});
				segments = [];
			}
		}

		var matrix;
		var i = 0;
		while (i < shapes.length) {
			var shape = shapes[ i ];
			if (shape.type === "line") {
				if (materialID !== shape.materialID) {
					addShape();
					materialID = shape.materialID;
				}

				matrix = getTransformationMatrix(shape);
				var x1 = shape.x1 * matrix[ 0 ] + shape.y1 * matrix[ 2 ] + matrix[ 4 ];
				var y1 = shape.x1 * matrix[ 1 ] + shape.y1 * matrix[ 3 ] + matrix[ 5 ];
				var x2 = shape.x2 * matrix[ 0 ] + shape.y2 * matrix[ 2 ] + matrix[ 4 ];
				var y2 = shape.x2 * matrix[ 1 ] + shape.y2 * matrix[ 3 ] + matrix[ 5 ];

				var points = segments.length > 0 ? segments[ segments.length - 1 ].points : null;
				if (points && points[ points.length - 2 ] === x1 && points[ points.length - 1 ] === y1) {
					points.push(x2, y2);
				} else {
					segments.push({
						type: "polyline",
						points: [ x1, y1, x2, y2 ]
					});
				}
				shapes.shift();
			} else if (shape.type === "arc") {
				if (materialID !== shape.materialID) {
					addShape();
					materialID = shape.materialID;
				}

				matrix = getTransformationMatrix(shape);
				shape.cx = shape.cx || 0;
				shape.cy = shape.cy || 0;
				var cx = shape.cx * matrix[ 0 ] + shape.cy * matrix[ 2 ] + matrix[ 4 ];
				var cy = shape.cx * matrix[ 1 ] + shape.cy * matrix[ 3 ] + matrix[ 5 ];

				if (shape.r) {
					var rotationAngle = Math.atan2(matrix[ 1 ], matrix[ 0 ]);
					shape.start += rotationAngle;
					shape.end += rotationAngle;
				}

				segments.push({
					type: "arc",
					cx: cx,
					cy: cy,
					rx: (shape.major || shape.radius) * (shape.s ? shape.s[ 0 ] : 1),
					ry: (shape.minor || shape.radius) * (shape.s ? shape.s[ 1 ] : 1),
					start: shape.start > shape.end ? shape.start - Math.PI * 2 : shape.start,
					end: shape.end
				});
				shapes.shift();
			} else {
				i++;
			}
		}

		addShape();
	}

	/**
	 * Set parametric content to scene node
	 * @param {string} nodeId Identifier of the node which will have parametric content assigned
	 * @param {any} parametricContent  The object with parametric content with the following properties<br/>
	 * 									<code>id</code>: string, id of this object<br/>
	 * 									<code>type</code>: string, type of this object<br/>
	 * @param {any} sceneId The scene identifier
	 * @public
	 */
	SceneBuilder.prototype.setParametricContent = function(nodeId, parametricContent, sceneId) {
		if (parametricContent == null) {
			Log.warning("Empty parametric content for node " + nodeId);
			return;
		}
		this._resetCurrentScene(sceneId);

		var node = this.getNode(nodeId, this.sceneId);

		var gn = new Element({ matrix: [ -1, 0, 0, 1, 0, 0 ], subelement: true }); node.add(gn); node = gn; // TODO: remove this hack

		if (parametricContent.shapes) {

			optimizeShapes(parametricContent.shapes);

			for (var i = 0; i < parametricContent.shapes.length; i++) {
				var shapeContent = parametricContent.shapes[ i ];
				shapeContent.matrix = getTransformationMatrix(shapeContent);
				shapeContent.subelement = true;
				var shape = this._createObject(shapeContent);
				if (shape) {
					shape.uid += "-s";
					node.add(shape);

					if (shapeContent.materialID) {
						TotaraUtils.pushElementIntoMapArray(this._materialNodesMap, shapeContent.materialID, shape);
					}
				}
			}
			node.uid += "-p";
			node.rerender();
		} else {
			parametricContent.sid = nodeId;
			parametricContent.name = node.name;
			parametricContent.matrix = Element._multiplyMatrices(node.matrix, getTransformationMatrix(parametricContent));
			var newNode = this._createObject(parametricContent);
			if (newNode) {
				newNode.uid += "-ps";
				// console.log(newNode.uid, JSON.stringify(parametricContent));
				// Reassign common properties
				newNode.userData = node.userData;
				newNode.vMask = node.vMask;
				this._nodes.set(nodeId, newNode);
				node.parent.replace(node, newNode);

				if (parametricContent.materialID) {
					TotaraUtils.pushElementIntoMapArray(this._materialNodesMap, parametricContent.materialID, newNode);
				}
			}
		}
	};

	SceneBuilder.prototype._createObject = function(parametricContent) {
		if (parametricContent.materialID) {
			parametricContent.material = this._materialMap.get(parametricContent.materialID);
			// parametricContent.material = Object.assign(JSON.parse(JSON.stringify(parametricContent.material)), { lineColor: [ 1.0, 0.5, 0, 0.6 ], lineWidth: 3 });
		}
		switch (parametricContent.type) {
			case "arc":
			case "ellipticalArc":
				// console.log(parametricContent.type, parametricContent.start * 180 / Math.PI, parametricContent.end * 180 / Math.PI);
				parametricContent.segments = [ {
					type: "arc",
					cx: parametricContent.cx || 0,
					cy: parametricContent.cy || 0,
					rx: parametricContent.major || parametricContent.radius,
					ry: parametricContent.minor || parametricContent.radius,
					start: parametricContent.start > parametricContent.end ? parametricContent.start - Math.PI * 2 : parametricContent.start,
					end: parametricContent.end
				} ];
				return new Path(parametricContent);
			case "rectangle":
				return new Rectangle(parametricContent);
			case "line":
				return new Line(parametricContent);
			case "polyline":
				return new Polyline(parametricContent);
			case "ellipse":
			case "circle":
				return new Ellipse(parametricContent);
			case "text":
				return new Text(parametricContent);
			case "path":
				return new Path(parametricContent);
			default:
				Log.warning("Unsupported parametric type", parametricContent.type);
				return null;
		}
	};

	/**
	 * Create material object from material information
	 * @param  {any} materialInfo The object of material information that have the following properties<br/>
	 * 								<code>id</code>: string, id of this element<br/>
	 * 								<code>name</code>: material name<br/>
	 * 								<code>diffuseColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
	 * 								<code>opacity</code>: float, opacity, defaults to 0, optional<br/>
	 * 								<code>lineDashPattern</code>: [ array of floats of dash pattern, optional]<br/>
	 * 								<code>lineDashPatternScale</code> : line's dash pattern segment scale, defaults to 0, optional<br/>
	 * 								<code>lineColour</code>: [array of floats describing RGBA values, defaults to 0, 0, 0, 0, optional]<br/>
	 * 								<code>lineWidth</code>: float, line's width, defaults to 0, optional<br/>
	 * 								<code>lineHaloWidth</code>
	 * 								<code>lineEndCapStyle</code>
	 * 								<code>lineWidthCoordinateSpace</code>
	 * @returns {string[]} Array of texture ids to be loaded
	 * @public
	 */
	SceneBuilder.prototype.createMaterial = function(materialInfo) {
		var materialId = materialInfo.id;
		var material = this._materialMap.get(materialId);
		if (!material) {
			material = this._createTemporaryMaterial(materialId);
		}

		material.lineColor = materialInfo.lineColour;
		material.lineWidth = materialInfo.lineWidth || 0;
		material.lineStyle = {
			width: materialInfo.lineWidth || 0,
			haloWidth: materialInfo.lineHaloWidth || 0,
			endCapStyle: materialInfo.lineEndRound ? 1 : 0,
			dashPattern: materialInfo.lineDashPattern || [],
			dashPatternScale: materialInfo.lineDashPatternScale,
			widthCoordinateSpace: materialInfo.lineWidthCoordinateSpace
		};

		if (materialInfo.emissiveColour) {
			material.color = materialInfo.emissiveColour;
		}

		if (material.opacity !== undefined) {
			material.opacity = materialInfo.opacity;
		}

		var nodeIdsToUpdate = this._materialNodesMap.get(materialId);
		if (nodeIdsToUpdate) {
			for (var j = 0; j < nodeIdsToUpdate.length; j++) {
				nodeIdsToUpdate[ j ].setMaterial(material, true);
			}
		}

		return [];
	};

	SceneBuilder.prototype._createTemporaryMaterial = function(materialId) {
		var material = {
			materialId: materialId
		};
		this._materialMap.set(materialId, material);
		return material;
	};

	/**
	 * Check if material is already loaded
	 * @param {string} materialId Id of the material
	 * @param {boolean} temporaryMaterialNeeded Is set to <code>true</code> and material with <code>materialId</code> does not exist then temporary material will be created
	 * @returns {boolean} <code>true</code> if material exists, otherwise <code>false</code>
	 * @public
	 */
	SceneBuilder.prototype.checkMaterialExists = function(materialId, temporaryMaterialNeeded) {
		if (this._materialMap.get(materialId) == null) {
			if (temporaryMaterialNeeded) {
				this._createTemporaryMaterial(materialId);
			}
			return false;
		}
		return true;
	};

	return SceneBuilder;
});