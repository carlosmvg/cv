sap.ui.define(["../../helpers/ID"],function(I){"use strict";var _={};var F=I.FormID;function i(f){return f.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet";}_.isReferenceFacet=i;function c(f){var a,b;switch(f.$Type){case"com.sap.vocabularies.UI.v1.CollectionFacet":var d={id:F({Facet:f}),useFormContainerLabels:true,hasFacetsNotPartOfPreview:f.Facets.some(function(g){var h,j;return((h=g.annotations)===null||h===void 0?void 0:(j=h.UI)===null||j===void 0?void 0:j.PartOfPreview)===false;})};return d;case"com.sap.vocabularies.UI.v1.ReferenceFacet":var e={id:F({Facet:f}),useFormContainerLabels:false,hasFacetsNotPartOfPreview:((a=f.annotations)===null||a===void 0?void 0:(b=a.UI)===null||b===void 0?void 0:b.PartOfPreview)===false};return e;default:throw new Error("Cannot create form based on ReferenceURLFacet");}}_.createFormDefinition=c;return _;},false);