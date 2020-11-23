interface EnvCapabilities {
	Chart: boolean;
	MicroChart: boolean;
	UShell: boolean;
	IntentBasedNavigation: boolean;
}

const openFECapabilities: EnvCapabilities = {
	Chart: false,
	MicroChart: false,
	UShell: false,
	IntentBasedNavigation: false
};

const sapFECapabilities: EnvCapabilities = {
	Chart: true,
	MicroChart: true,
	UShell: true,
	IntentBasedNavigation: true
};

let oEnvCapabilities: EnvCapabilities = sap.ushell && sap.ushell.Container ? sapFECapabilities : openFECapabilities;

export function setCapabilities(oCapabilities: EnvCapabilities) {
	oEnvCapabilities = oCapabilities;
}

export function getCapabilities() {
	return oEnvCapabilities;
}
