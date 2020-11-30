sap.ui.define([
	"../thirdparty/three"
], function(
	three
) {
	"use strict";

	/**
	 * Generate ThreeJS objects based on the parametric objects data pass in.
	 * Initially used for 360 panoramic scenes
	 */
	var ParametricGenerators = {
		generateSphere: function(sphereJson, material) {
			var radius = sphereJson.radius;

			var geometry = new THREE.SphereGeometry(radius, 32, 32);

			return material ? new THREE.Mesh(geometry, material) : new THREE.Mesh(geometry);
		},

		generateBox: function(boxJson) {

		},

		generatePlane: function(planeJson, material) {
			// planeJson { length, width } => PlaneGeometry { width, height }
			var geometry = new THREE.PlaneGeometry(planeJson.length, planeJson.width);
			var mesh = material ? new THREE.Mesh(geometry, material) : new THREE.Mesh(geometry);

			mesh.rotation.x = Math.PI / 2;
			mesh.position.set(-planeJson.length / 2, -planeJson.width / 2, 0);
			return mesh;
		}
	};

	return ParametricGenerators;

});