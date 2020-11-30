
sap.ui.define(["sap/base/Log"], function(Log){
	"use strict";

	return {

		// for setting an attribute to multiple elements (class)
		setAttributeToMultipleElements: function(selector, attributeName, attributeValue){
			var allElements = document.querySelectorAll(selector);
			allElements.forEach(function(elem) {
				elem.setAttribute(attributeName, attributeValue);
			});
		},

		// getting the width from view
		getElementWidth: function(eView) {
			return parseFloat(getComputedStyle(eView.getDomRef(), null).width.replace("px", ""));
		},

		// getting the height from view
		getElementHeight: function(eView) {
			return parseFloat(getComputedStyle(eView.getDomRef(), null).height.replace("px", ""));
		},

		// remove element by Id (removes first occurence)
		removeElementById: function(elementId) {
			var selectedElement = document.getElementById(elementId);
			selectedElement.parentNode.removeChild(selectedElement);
		},

		addClassToAllElements: function(elementArr, className) {
			// add class to each element if multiple elements
			if (elementArr) {
				if (elementArr.length) {
					elementArr.forEach(function(elem){
						elem.classList.add(className);
					});
				} else {
					elementArr.classList.add(className);
				}
			}	
		},

		removeClassToAllElements: function(elementArr, className) {
			// remove class to each element if multiple elements / nodes
			if (elementArr) {
				if (elementArr.length) {
					elementArr.forEach(function(elem){
						elem.classList.remove(className);
					});
				} else {
					elementArr.classList.remove(className);
				}
			}	
		},

		checkIfFunction: function(param) {
			if (typeof param === "function") {
				return true;
			}
			return false;
		},

		getIndex: function(node) {
			var children = node.parentNode.childNodes;
			var num = 0;
			for (var i = 0; i < children.length; i++) {
				 if (children[i] == node) {
					 return num;
				 }
				 if (children[i].nodeType == 1) {
					 num++;
				 }
			}
			return -1;
		},

		addStyleToAllElements: function(elementArr, property, value) {
			// add style to each element if multiple elements / nodes
			if (elementArr) {
				if (elementArr.length) {
					elementArr.forEach(function(elem){
						elem.style[property] = value;
					});
				} else {
					elementArr.style[property] = value;
				}
			}
		},
		addAttributeToAllElements: function(elementArr, attributeName, attributeValue) {
			// add attributes to each element if multiple elements
			if (elementArr) {
				if (elementArr.length) {
					elementArr.forEach(function(elem){
						elem.setAttribute(attributeName, attributeValue);
					});
				} else {
					elementArr.setAttribute(attributeName, attributeValue);
				}
			}
		},

		// it returns outer height with margin
		getOuterHeight: function(el) {
			var height = el.offsetHeight;
			var style = getComputedStyle(el);
			height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
			return height;
		},

		removeAttributesFromAll: function(elArr, selector, attributeName) {
			if (elArr) {
				elArr.forEach(function (el) {
					var selectedElements = el.querySelectorAll(selector);
					if (selectedElements) {
						selectedElements.forEach(function (insideEl) {
							insideEl.removeAttribute(attributeName);
						});
					}
				});
			}
		}
	};
}, /* bExport= */true);