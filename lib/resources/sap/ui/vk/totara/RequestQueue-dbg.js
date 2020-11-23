sap.ui.define([
	"./TotaraUtils",
	"./Command"
], function(
	TotaraUtils,
	Command
) {
	"use strict";

	function ResourceQueue(getBatchSize) {
		this.getBatchSize = getBatchSize;
		this.globalList = new Set();
		this.requestedList = [];
		this.waitingList = new Set();
	}

	ResourceQueue.prototype.push = function(id, requestData) {
		if (!this.globalList.has(id)) {
			this.globalList.add(id);
			this.requestedList.push(requestData || id);
			this.waitingList.add(id);
		}
	};

	ResourceQueue.prototype.setBatchSizeInfo = function(batchSizeInfo) {
		this.batchSizeInfo = batchSizeInfo;
	};

	ResourceQueue.prototype.fetchBatch = function() {
		var batchSize = this.getBatchSize ? this.getBatchSize : 1;
		if (typeof this.getBatchSize === "function") {
			batchSize = this.getBatchSize();
		}
		var batchStringLength = 0;
		var batch = [];
		for (var i = 0; i < batchSize && this.requestedList.length > 0; i++) {
			var id = this.requestedList.pop();
			batchStringLength += id.toString().length + (i == 0 || !this.batchSizeInfo ? 0 : this.batchSizeInfo.separatorLength);
			if (this.batchSizeInfo && batchStringLength > this.batchSizeInfo.maxBatchStringLength) {
				this.requestedList.push(id);
				break;
			}
			batch.push(id);
		}
		return batch;
	};

	ResourceQueue.prototype.pop = function(id) {
		return this.waitingList.delete(id);
	};

	ResourceQueue.prototype.isReady = function(id) {
		return this.globalList.has(id) && !this.waitingList.has(id);
	};

	ResourceQueue.prototype.clear = function(id) {
		this.globalList.clear();
		this.requestedList = [];
		this.waitingList.clear();
	};

	ResourceQueue.prototype.isEmpty = function() {
		return this.requestedList.length === 0;
	};

	ResourceQueue.prototype.isWaiting = function() {
		return this.waitingList.size > 0;
	};



	function PriorityResourceQueue(getBatchSize, getMaxBatchDataSize) {
		ResourceQueue.call(this, getBatchSize);
		this.getMaxBatchDataSize = getMaxBatchDataSize;
		this.priorityMap = new Map();
	}

	PriorityResourceQueue.prototype = Object.create(ResourceQueue.prototype);

	PriorityResourceQueue.prototype.constructor = PriorityResourceQueue;

	PriorityResourceQueue.prototype.push = function(id, priority, size) {
		if (!this.globalList.has(id)) {
			size = size || 1;
			// console.log("push", id, priority, size);
			this.globalList.add(id);
			this.requestedList.push(id);
			this.waitingList.add(id);
			this.priorityMap.set(id, { p: priority, s: size });
		}
	};

	PriorityResourceQueue.prototype.clear = function() {
		ResourceQueue.prototype.clear.call(this);
		this.priorityMap.clear();
	};

	PriorityResourceQueue.prototype.setBatchSizeInfo = function(batchSizeInfo) {
		this.batchSizeInfo = batchSizeInfo;
	};

	PriorityResourceQueue.prototype.fetchBatch = function() {
		var priorityMap = this.priorityMap;
		this.requestedList.sort(function(a, b) {
			return priorityMap.get(a).p - priorityMap.get(b).p;
		});

		var batch = [];
		var size = 0;
		var batchSize = this.getBatchSize ? this.getBatchSize() : 1;
		var batchStringLength = 0;
		var maxBatchDataSize = this.getMaxBatchDataSize ? this.getMaxBatchDataSize() : 1024 * 1024;
		var minBatchDataSize = maxBatchDataSize >> 1;
		for (var i = 0; i < batchSize && this.requestedList.length > 0; i++) {
			var id = this.requestedList.pop();
			batchStringLength += id.toString().length + (i == 0 || !this.batchSizeInfo ? 0 : this.batchSizeInfo.separatorLength);
			var resSize = priorityMap.get(id).s;
			if (this.batchSizeInfo && batchStringLength > this.batchSizeInfo.maxBatchStringLength || size > minBatchDataSize && size + resSize > maxBatchDataSize) {
				this.requestedList.push(id);
				break;
			}

			// console.log("id", id, "size", resSize, "priority", priorityMap.get(id).p);
			size += resSize;
			priorityMap.delete(id);
			batch.push(id);
		}
		// console.log(size, batch);
		return batch;
	};



	var RequestQueue = function(context, sceneId) {
		this.context = context; // SceneContext
		this.sceneId = sceneId;
		this.token = context.token || TotaraUtils.generateToken();
		var loader = context.loader;
		this.meshes = new ResourceQueue(loader.getMeshesBatchSize.bind(loader));
		this.materials = new ResourceQueue(loader.getMaterialsBatchSize.bind(loader));
		this.textures = new ResourceQueue();
		this.geometries = new PriorityResourceQueue(loader.getGeometriesBatchSize.bind(loader), loader.getGeometriesMaxBatchDataSize.bind(loader));
		this.geomMeshes = new PriorityResourceQueue(loader.getGeomMeshesBatchSize.bind(loader), loader.getGeomMeshesMaxBatchDataSize.bind(loader));
		this.annotations = new ResourceQueue(loader.getAnnotationsBatchSize.bind(loader));
		this.parametric = new ResourceQueue(128);
		this.views = new ResourceQueue();
		this.thumbnails = new ResourceQueue();
		this.tracks = new ResourceQueue(loader.getTracksBatchSize.bind(loader));
		this.sequences = new ResourceQueue(loader.getSequencesBatchSize.bind(loader));
		this.highlights = new ResourceQueue();
	};

	RequestQueue.prototype.isEmpty = function() {
		return this.meshes.isEmpty()
			&& this.annotations.isEmpty()
			&& this.parametric.isEmpty()
			&& this.materials.isEmpty()
			&& this.textures.isEmpty()
			&& this.geometries.isEmpty()
			&& this.geomMeshes.isEmpty()
			&& this.views.isEmpty()
			&& this.thumbnails.isEmpty()
			&& this.tracks.isEmpty()
			&& this.sequences.isEmpty()
			&& this.highlights.isEmpty();
	};

	RequestQueue.prototype.isWaitingForContent = function() {
		return this.meshes.isWaiting()
			|| this.textures.isWaiting()
			|| this.materials.isWaiting()
			|| this.geometries.isWaiting()
			|| this.geomMeshes.isWaiting()
			|| this.annotations.isWaiting()
			|| this.parametric.isWaiting()
			|| this.views.isWaiting()
			|| this.thumbnails.isWaiting()
			|| this.tracks.isWaiting()
			|| this.sequences.isWaiting()
			|| this.highlights.isWaiting();
	};

	RequestQueue.prototype.clearContent = function() {
		this.meshes.clear();
		this.annotations.clear();
		this.parametric.clear();
		this.materials.clear();
		this.textures.clear();
		this.geometries.clear();
		this.geomMeshes.clear();
		this.views.clear();
		this.thumbnails.clear();
		this.tracks.clear();
		this.sequences.clear();
		this.highlights.clear();
	};

	RequestQueue.prototype.createGetContentCommand = function(commandName, ids, extraOptions) {
		var options = {
			sceneId: this.sceneId,
			ids: ids.map(function(id) { return parseInt(id, 10); }),
			token: this.token
		};
		return TotaraUtils.createRequestCommand(commandName, extraOptions ? Object.assign(options, extraOptions) : options);
	};

	RequestQueue.prototype.generateRequestCommand = function() {
		var ids;
		var command = null;
		if (!this.meshes.isEmpty()) {
			ids = this.meshes.fetchBatch();
			command = this.createGetContentCommand(Command.getMesh, ids);
		} else if (!this.annotations.isEmpty()) {
			ids = this.annotations.fetchBatch();
			command = this.createGetContentCommand(Command.getAnnotation, ids);
		} else if (!this.parametric.isEmpty()) {
			ids = this.parametric.fetchBatch();
			command = this.createGetContentCommand(Command.getParametric, ids);
		} else if (!this.materials.isEmpty()) {
			ids = this.materials.fetchBatch();
			command = this.createGetContentCommand(Command.getMaterial, ids);
		} else if (!this.geometries.isEmpty()) {
			ids = this.geometries.fetchBatch();
			command = this.createGetContentCommand(Command.getGeometry, ids);
			command.sceneId = this.sceneId;
			command.geometryIds = ids;
		} else if (!this.geomMeshes.isEmpty()) {
			ids = this.geomMeshes.fetchBatch();
			command = this.createGetContentCommand(Command.getGeomMesh, ids);
			command.sceneId = this.sceneId;
			command.meshIds = ids;
		} else if (!this.textures.isEmpty()) {
			ids = this.textures.requestedList.splice(0, 1);
			command = this.createGetContentCommand(Command.getImage, [ ids[ 0 ].imageId ]);
			command.sceneId = this.sceneId;
			command = Object.assign(command, ids[ 0 ]);
		} else if (!this.sequences.isEmpty()) {
			ids = this.sequences.fetchBatch();
			command = this.createGetContentCommand(Command.getSequence, ids);
		} else if (!this.tracks.isEmpty()) {
			ids = this.tracks.fetchBatch();
			command = this.createGetContentCommand(Command.getTrack, ids);
		} else if (!this.views.isEmpty()) {
			ids = this.views.requestedList.splice(0, 1);
			var expand = "nodes,bounds,animation";
			var includeAnimation = this.context.includeAnimation !== undefined ? this.context.includeAnimation : true; // include animation by default
			if (!includeAnimation) {
				expand = "nodes,bounds";
			}
			var selectField = "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder,entityId,highlightStyleId";

			command = TotaraUtils.createRequestCommand(Command.getView, {
				sceneId: this.sceneId,
				groupId: ids[0].viewGroupId,
				id: ids[0].viewId,
				includeHidden: this.context.includeHidden !== undefined ? this.context.includeHidden : false, // not include hidden by default,
				$expand: expand,
				// includeAnimation: includeAnimation,
				$select: selectField,
				token: this.token
			});
		} else if (!this.highlights.isEmpty()) {
			ids = this.highlights.requestedList.splice(0, 1);
			command = TotaraUtils.createRequestCommand(Command.getHighlightStyle, {
				sceneId: this.sceneId,
				id: ids[ 0 ],
				token: this.token
			});
		} else if (!this.thumbnails.isEmpty()) {
			ids = this.thumbnails.requestedList.splice(0, 1);
			command = this.createGetContentCommand(Command.getImage, [ ids[ 0 ].imageId ]);
			command.sceneId = this.sceneId;
			command = Object.assign(command, ids[ 0 ]);
		}

		return command;
	};

	return RequestQueue;
});
