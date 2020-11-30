export type Position = {
	anchor?: string;
	placement: Placement;
};

export enum Placement {
	After = "After",
	Before = "Before",
	End = "End"
}

export type ConfigurableObjectKey = string;
export type ConfigurableObject = Positionable & {
	key: ConfigurableObjectKey;
};

export type CustomElement<T extends ConfigurableObject> = T & {
	position: Position;
};

export type Positionable = {
	position?: Position;
};

export type ConfigurableRecord<T> = Record<ConfigurableObjectKey, T>;

/**
 * Recursive method that order the keys based on a position information.
 *
 * @param positioningItems
 * @param anchor
 * @param sorted
 * @param visited
 * @returns {number} the order of the current item
 */
const orderPositioningItemRecursively = (
	positioningItems: Record<string, Required<Position>>,
	anchor: string,
	sorted: string[],
	visited: Record<string, Required<Position>>
): number => {
	let insertIndex = sorted.indexOf(anchor);
	if (insertIndex !== -1) {
		return insertIndex;
	}
	const anchorItem: Required<Position> = positioningItems[anchor];
	if (anchorItem === undefined) {
		//return sorted.length;
		throw new Error("position anchor not found: " + anchor);
	}

	visited[anchor] = anchorItem;
	if (anchorItem && !(anchorItem.anchor in visited)) {
		insertIndex = orderPositioningItemRecursively(positioningItems, anchorItem.anchor, sorted, visited);
		if (anchorItem.placement !== Placement.Before) {
			++insertIndex;
		}
	} else {
		insertIndex = sorted.length;
	}

	sorted.splice(insertIndex, 0, anchor);
	return insertIndex;
};

type OverrideType = "merge" | "overwrite" | "ignore";
type ArrayOverrideType<ArrayType> = OverrideKeys<ArrayType>;

type ElementType<T> = T extends any[] ? T[number] : T;
type OverrideKeys<T> = {
	[P in keyof T]?: OverrideType | ArrayOverrideType<ElementType<T[P]>>;
};

function isArrayConfig<T>(config: OverrideType | ArrayOverrideType<T> | undefined): config is ArrayOverrideType<T> {
	return typeof config === "object";
}

function applyOverride<T extends Object>(overwritableKeys: OverrideKeys<T>, sourceItem: T | null, customElement: T): T {
	const outItem: T = sourceItem || customElement;
	for (const overwritableKey in overwritableKeys) {
		if (Object.hasOwnProperty.call(overwritableKeys, overwritableKey)) {
			const overrideConfig = overwritableKeys[overwritableKey];
			if (sourceItem !== null) {
				switch (overrideConfig) {
					case "overwrite":
						if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
							sourceItem[overwritableKey] = customElement[overwritableKey];
						}
						break;
					case "merge":
					default:
						const subItem = sourceItem[overwritableKey] || ([] as any[]);
						let subConfig = {};
						if (isArrayConfig(overrideConfig)) {
							subConfig = overrideConfig;
						}
						if (Array.isArray(subItem)) {
							sourceItem[overwritableKey] = insertCustomElements(
								subItem,
								(customElement && (customElement[overwritableKey] as Record<string, CustomElement<any>>)) || {},
								subConfig
							) as any;
						}
						break;
				}
			} else {
				switch (overrideConfig) {
					case "overwrite":
						if (customElement.hasOwnProperty(overwritableKey) && customElement[overwritableKey] !== undefined) {
							outItem[overwritableKey] = customElement[overwritableKey];
						}
						break;
					case "merge":
					default:
						let subConfig = {};
						if (isArrayConfig(overrideConfig)) {
							subConfig = overrideConfig;
						}
						outItem[overwritableKey] = insertCustomElements(
							[] as any[],
							(customElement && (customElement[overwritableKey] as Record<string, CustomElement<any>>)) || {},
							subConfig
						) as any;
						break;
				}
			}
		}
	}
	return outItem;
}

/**
 * Insert a set of custom elements in the right position in an original collection.
 *
 * @template T
 * @param rootElements a list of "ConfigurableObject" which means object that have a unique "key"
 * @param customElements an object containing extra object to add, they are indexed by a key and have a "position" object
 * @param overwritableKeys the list of keys from the original object that can be overwritten in case a custom element has the same "key"
 * @returns {T[]} an ordered array of elements including the custom ones
 */
export function insertCustomElements<T extends ConfigurableObject>(
	rootElements: T[],
	customElements: Record<string, CustomElement<T>>,
	overwritableKeys: OverrideKeys<T> = {}
): T[] {
	const firstAnchor = rootElements.length ? rootElements[0].key : null;
	const rootElementsWithoutLast = rootElements.filter(rootElement => {
		return rootElement.position?.placement !== Placement.End;
	});
	const lastAnchor = rootElements.length ? rootElements[rootElementsWithoutLast.length - 1].key : null;
	let endElement: T | undefined;
	const positioningItems: Record<string, Required<Position>> = {};
	const itemsPerKey: Record<string, T> = {};
	rootElements.forEach(rootElement => {
		if (rootElement.position?.placement === Placement.End && !endElement) {
			endElement = rootElement;
		} else {
			positioningItems[rootElement.key] = {
				anchor: rootElement.position?.anchor || rootElement.key,
				placement: rootElement.position?.placement || Placement.After
			};
		}
		itemsPerKey[rootElement.key] = rootElement;
	});
	Object.keys(customElements).forEach(customElementKey => {
		const customElement = customElements[customElementKey];
		const anchor = customElement.position.anchor;
		// If no placement defined we are After
		if (!customElement.position.placement) {
			customElement.position.placement = Placement.After;
		}
		// If no anchor we're either After the last anchor or Before the first
		if (!anchor) {
			const potentialAnchor = customElement.position.placement === Placement.After ? lastAnchor : firstAnchor;
			customElement.position.anchor = potentialAnchor ? potentialAnchor : customElementKey;
		}
		if (itemsPerKey[customElement.key]) {
			itemsPerKey[customElement.key] = applyOverride(overwritableKeys, itemsPerKey[customElement.key], customElement);
		} else {
			itemsPerKey[customElement.key] = applyOverride(overwritableKeys, null, customElement);
			positioningItems[customElement.key] = customElement.position as Required<Position>;
		}
	});
	const sortedKeys: string[] = [];

	Object.keys(positioningItems).forEach(positionItemKey => {
		orderPositioningItemRecursively(positioningItems, positionItemKey, sortedKeys, {});
	});

	const outElements = sortedKeys.map(key => itemsPerKey[key]);
	if (endElement) {
		outElements.push(endElement);
	}
	return outElements;
}
