import { DataFieldAbstractTypes } from "@sap-ux/vocabularies-types";
import { StableIdHelper } from "sap/fe/core/helpers";

/**
 * The KeyHelper is used for dealing with Key in the concern of the flexible programming model
 */
export class KeyHelper {
	/**
	 * Returns a generated key for DataFields to be used in the flexible programming model.
	 *
	 * @param {DataFieldAbstractTypes} oDataField dataField to generate the key for
	 * @returns {string} Returns a through StableIdHelper generated key
	 */
	static generateKeyFromDataField(oDataField: DataFieldAbstractTypes): string {
		return StableIdHelper.getStableIdPartFromDataField(oDataField);
	}

	/**
	 * Returns true / false if any other character then aA-zZ, 0-9, ':', '_' or '-' is used.
	 *
	 * @param {string} id String to check validity on
	 * @returns {boolean} Returns if all characters are legit for an ID
	 */
	static isKeyValid(id: string): boolean {
		const pattern = /[^A-Za-z0-9_\-:]/;
		if (pattern.exec(id)) {
			// Todo: Replace with proper Log statement once available
			// throw new Error(id + " - contains the not allowed character: " + pattern.exec(id));
			return false;
		} else {
			return true;
		}
	}
}
