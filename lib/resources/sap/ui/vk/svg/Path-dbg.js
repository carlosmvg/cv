/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides the sap.ui.vk.svg.Path class.
sap.ui.define([
	"sap/base/Log",
	"./Element"
], function(
	Log,
	Element
) {
	"use strict";

	var Path = function(parameters) {
		parameters = parameters || {};
		Element.call(this, parameters);

		this.type = "Path";
		this.segments = parameters.segments || [];
		if (parameters.isTriangleMesh) {
			this.isTriangleMesh = true;
		}

		this.setMaterial(parameters.material);
	};

	Path.prototype = Object.assign(Object.create(Element.prototype), { constructor: Path });

	Path.prototype.tagName = function() {
		return "path";
	};

	Path.prototype.setMaterial = function(material, invalidate) {
		if (material && !this.isTriangleMesh) {
			delete material.color; // no fill
		}
		Element.prototype.setMaterial.call(this, material, invalidate);
	};

	function polarToCartesian(cx, cy, rx, ry, angle) {
		var x = cx + rx * Math.cos(angle);
		var y = cy + ry * Math.sin(angle);
		return { x: x, y: y };
	}

	Path.prototype._expandBoundingBox = function(boundingBox, matrixWorld) {
		var strokeDelta = this.strokeWidth * 0.5;
		for (var si = 0, sl = this.segments.length; si < sl; si++) {
			var segment = this.segments[ si ];
			if (segment.type === "arc") {
				for (var a = 0, n = 6; a < n; a++) {
					var pos = polarToCartesian(segment.cx, segment.cy, segment.rx, segment.ry, segment.start + (segment.end - segment.start) * a / (n - 1));
					this._expandBoundingBoxCE(boundingBox, matrixWorld, pos.x, pos.y, strokeDelta, strokeDelta);
				}
				if (segment.closed) {
					this._expandBoundingBoxCE(boundingBox, matrixWorld, segment.cx, segment.cy, strokeDelta, strokeDelta);
				}
			} else {
				var points = segment.points;
				for (var i = 0, l = points.length - 1; i < l; i += 2) {
					this._expandBoundingBoxCE(boundingBox, matrixWorld, points[ i ], points[ i + 1 ], strokeDelta, strokeDelta);
				}
			}
		}
	};

	function addBezierSegment(d, segment) {
		var i, l;
		var points = segment.points;
		d.push("M", points[ 0 ], points[ 1 ]);
		switch (segment.degree) {
			case 2:
				for (i = 2, l = points.length - 3; i < l; i += 4) {
					d.push("Q", points[ i ], points[ i + 1 ], points[ i + 2 ], points[ i + 3 ]);
				}
				break;
			case 3:
				for (i = 2, l = points.length - 5; i < l; i += 6) {
					d.push("C", points[ i ], points[ i + 1 ], points[ i + 2 ], points[ i + 3 ], points[ i + 4 ], points[ i + 5 ]);
				}
				break;
			default:
				Log.warning("Unsupported bezier segment degree:", segment.type);
				break;
		}
	}

	function addPolyline(d, segment) {
		var points = segment.points;
		d.push("M", points[ 0 ], points[ 1 ]);
		for (var i = 2, l = points.length - 1; i < l; i += 2) {
			d.push("L", points[ i ], points[ i + 1 ]);
		}
		if (segment.closed) {
			d.push("Z");
		}
	}

	function addMesh(d, segment) {
		var points = segment.points;
		for (var i = 0, l = points.length - 5; i < l; i += 6) {
			d.push("M", points[ i ], points[ i + 1 ], "L", points[ i + 2 ], points[ i + 3 ], "L", points[ i + 4 ], points[ i + 5 ], "Z");
		}
	}

	function addArc(d, segment) {
		var startPos = polarToCartesian(segment.cx, segment.cy, segment.rx, segment.ry, segment.start);
		var endPos = polarToCartesian(segment.cx, segment.cy, segment.rx, segment.ry, segment.end);
		d.push("M", startPos.x, startPos.y, "A", segment.rx, segment.ry, "0", Math.abs(segment.end - segment.start) < Math.PI ? "0" : "1", segment.end > segment.start ? "1" : "0", endPos.x, endPos.y);
		if (segment.closed) {
			d.push("L", segment.cx, segment.cy, "Z");
		}
	}

	Path.prototype._setSpecificAttributes = function(setAttributeFunc) {
		var d = [];
		this.segments.forEach(function(segment) {
			switch (segment.type) {
				case "arc":
					addArc(d, segment);
					break;
				case "bezier":
					addBezierSegment(d, segment);
					break;
				case "polyline":
					addPolyline(d, segment);
					break;
				case "mesh":
					addMesh(d, segment);
					break;
				default:
					Log.warning("Unsupported path segment type:", segment.type);
					break;
			}
		});

		if (d.length > 0) {
			setAttributeFunc("d", d.join(" "));
		}

		if (!this.isTriangleMesh) {
			// setAttributeFunc("stroke-linecap", "butt");
			setAttributeFunc("stroke-linejoin", "round");
		}
	};

	return Path;
});
