/* eslint-disable @typescript-eslint/no-unused-vars */

import { ServiceFactory, Service, ServiceContext } from "sap/ui/core/service";
import { Container, CrossApplicationNavigation, ShellNavigation, URLParsing } from "sap/ushell/services";
import { Component } from "sap/ui/core";
import { JQueryPromise } from "jQuery";

/**
 * @interface IShellServices
 * @private
 */
interface IShellServices {
	initPromise: Promise<IShellServices>;
	getLinks(oArgs: object): Promise<any>;

	toExternal(oNavArgumentsArr: Array<object>, oComponent: object): void;

	getStartupAppState(oArgs: object): Promise<any>;

	backToPreviousApp(): void;

	hrefForExternal(oArgs?: object, oComponent?: object, bAsync?: boolean): string;

	getAppState(oComponent: Component, sAppStateKey: string): Promise<any>;

	createEmptyAppState(oComponent: Component): object;

	isNavigationSupported(oNavArgumentsArr: Array<object>, oComponent: object): Promise<any>;

	isInitialNavigation(): boolean;

	expandCompactHash(sHashFragment: string): object;

	parseShellHash(sHash: string): object;

	splitHash(sHash: string): object;

	constructShellHash(oNewShellHash: object): string;

	setDirtyFlag(bDirty: boolean): void;

	registerDirtyStateProvider(fnDirtyStateProvider: Function): void;

	deregisterDirtyStateProvider(fnDirtyStateProvider: Function): void;

	createRenderer(): object;

	getUser(): object;

	hasUShell(): boolean;

	registerNavigationFilter(fnNavFilter: Function): void;

	unregisterNavigationFilter(fnNavFilter: Function): void;

	setBackNavigation(fnCallBack?: Function): void;

	setHierarchy(aHierarchyLevels: Array<object>): void;

	setTitle(sTitle: string): void;
}

/**
 * Mock implementation of the ShellService for OpenFE
 *
 * @implements {IShellServices}
 * @private
 */
class ShellServiceMock extends Service<ShellServicesSettings> implements IShellServices {
	initPromise!: Promise<any>;

	init() {
		this.initPromise = Promise.resolve(this);
	}

	getLinks(oArgs: object) {
		return Promise.resolve([]);
	}

	toExternal(oNavArgumentsArr: Array<object>, oComponent: object) {
		return;
	}

	getStartupAppState(oArgs: object) {
		return Promise.resolve(null);
	}

	backToPreviousApp() {
		return;
	}

	hrefForExternal(oArgs?: object, oComponent?: object, bAsync?: boolean) {
		return "";
	}

	getAppState(oComponent: object, sAppStateKey: string) {
		return Promise.resolve({});
	}

	createEmptyAppState(oComponent: object) {
		return Promise.resolve({});
	}

	isNavigationSupported(oNavArgumentsArr: Array<object>, oComponent: object) {
		return Promise.resolve({});
	}

	isInitialNavigation() {
		return false;
	}

	expandCompactHash(sHashFragment: string) {
		return Promise.resolve({});
	}

	parseShellHash(sHash: string) {
		return {};
	}

	splitHash(sHash: string) {
		return Promise.resolve({});
	}

	constructShellHash(oNewShellHash: object) {
		return "";
	}

	setDirtyFlag(bDirty: boolean) {
		return;
	}

	registerDirtyStateProvider(fnDirtyStateProvider: Function) {
		return;
	}

	deregisterDirtyStateProvider(fnDirtyStateProvider: Function) {
		return;
	}

	createRenderer() {
		return {};
	}

	getUser() {
		return {};
	}

	hasUShell() {
		return false;
	}

	registerNavigationFilter(fnNavFilter: Function): void {
		return;
	}

	unregisterNavigationFilter(fnNavFilter: Function): void {
		return;
	}

	setBackNavigation(fnCallBack?: Function): void {
		return;
	}

	setHierarchy(aHierarchyLevels: Array<object>): void {
		return;
	}

	setTitle(sTitle: string): void {
		return;
	}
}

/**
 * @typedef ShellServicesSettings
 * @private
 */
export type ShellServicesSettings = {
	shellContainer?: Container;
};

/**
 * Wrap a JQuery Promise within a native {Promise}.
 *
 * @template {object} T
 * @param {JQueryPromise<T>} jqueryPromise the original jquery promise
 * @returns {Promise<T>} a native promise wrapping the same object
 * @private
 */
function wrapJQueryPromise<T>(jqueryPromise: JQueryPromise<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		// eslint-disable-next-line promise/catch-or-return
		jqueryPromise.done(resolve).fail(reject);
	});
}

/**
 * Base implementation of the ShellServices
 *
 * @implements {IShellServices}
 * @private
 */
class ShellServices extends Service<Required<ShellServicesSettings>> implements IShellServices {
	resolveFn: any;
	rejectFn: any;
	initPromise!: Promise<any>;
	// !: means that we know it will be assigned before usage
	crossAppNavService!: CrossApplicationNavigation;
	urlParsingService!: URLParsing;
	shellNavigation!: ShellNavigation;
	oShellContainer!: Container;
	shellUIService!: any;

	init() {
		const oContext = this.getContext();
		const oComponent = oContext.scopeObject as any;
		this.oShellContainer = oContext.settings.shellContainer;
		this.initPromise = new Promise((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
		const oCrossAppNavServicePromise = this.oShellContainer.getServiceAsync("CrossApplicationNavigation");
		const oUrlParsingServicePromise = this.oShellContainer.getServiceAsync("URLParsing");
		const oShellNavigationServicePromise = this.oShellContainer.getServiceAsync("ShellNavigation");
		const oShellUIServicePromise = oComponent.getService("ShellUIService");
		Promise.all([oCrossAppNavServicePromise, oUrlParsingServicePromise, oShellNavigationServicePromise, oShellUIServicePromise])
			.then(([oCrossAppNavService, oUrlParsingService, oShellNavigation, oShellUIService]) => {
				this.crossAppNavService = oCrossAppNavService;
				this.urlParsingService = oUrlParsingService;
				this.shellNavigation = oShellNavigation;
				this.shellUIService = oShellUIService;
				this.resolveFn();
			})
			.catch(this.rejectFn);
	}

	/**
	 * Retrieves the target links configured for a given semantic object & action
	 * Will retrieve the CrossApplicationNavigation
	 * service reference call the getLinks method. In case service is not available or any exception
	 * method throws exception error in console.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oArgs - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>getLinks arguments
	 * @returns {Promise} Promise which will be resolved to target links array
	 */
	getLinks(oArgs: object) {
		return new Promise((resolve, reject) => {
			// eslint-disable-next-line promise/catch-or-return
			this.crossAppNavService
				.getLinks(oArgs)
				.fail((oError: any) => {
					reject(new Error(oError + " sap.fe.core.services.NavigationServiceFactory.getLinks"));
				})
				.then(resolve);
		});
	}

	/**
	 * Will retrieve the ShellContainer.
	 *
	 * @private
	 * @ui5-restricted
	 * sap.ushell.container
	 * @returns {object} Object with predefined shellContainer methods
	 */
	getShellContainer() {
		return this.oShellContainer;
	}

	/**
	 * Will call toExternal method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {Array} oNavArgumentsArr and
	 * @param {object} oComponent - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>toExternal arguments
	 * @returns {void}
	 */
	toExternal(oNavArgumentsArr: Array<object>, oComponent: object): void {
		this.crossAppNavService.toExternal(oNavArgumentsArr, oComponent);
	}

	/**
	 * Retrieves the target startupAppState
	 * Will check the existance of the ShellContainer and retrieve the CrossApplicationNavigation
	 * service reference call the getStartupAppState method. In case service is not available or any exception
	 * method throws exception error in console.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oArgs - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>getStartupAppState arguments
	 * @returns {Promise} Promise which will be resolved to Object
	 */
	getStartupAppState(oArgs: Component) {
		return new Promise((resolve, reject) => {
			// JQuery Promise behaves differently
			// eslint-disable-next-line promise/catch-or-return
			this.crossAppNavService
				.getStartupAppState(oArgs)
				.fail((oError: any) => {
					reject(new Error(oError + " sap.fe.core.services.NavigationServiceFactory.getStartupAppState"));
				})
				.then(resolve);
		});
	}

	/**
	 * Will call backToPreviousApp method of CrossApplicationNavigation service.
	 *
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	backToPreviousApp() {
		return this.crossAppNavService.backToPreviousApp();
	}

	/**
	 * Will call hrefForExternal method of CrossApplicationNavigation service.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oArgs - check the definition of
	 * @param {object} oComponent the appComponent
	 * @param {boolean} bAsync whether this call should be async or not
	 * sap.ushell.services.CrossApplicationNavigation=>hrefForExternal arguments
	 * @returns {string} Promise which will be resolved to string
	 */
	hrefForExternal(oArgs: object, oComponent?: object, bAsync?: boolean) {
		return this.crossAppNavService.hrefForExternal(oArgs, oComponent, bAsync);
	}

	/**
	 * Will call getAppState method of CrossApplicationNavigation service with oComponent and oAppStateKey.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oComponent and
	 * @param {string} sAppStateKey - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>getAppState arguments
	 * @returns {Promise} Promise which will be resolved to object
	 */
	getAppState(oComponent: Component, sAppStateKey: string) {
		return wrapJQueryPromise(this.crossAppNavService.getAppState(oComponent, sAppStateKey));
	}

	/**
	 * Will call createEmptyAppState method of CrossApplicationNavigation service with oComponent.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oComponent - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>createEmptyAppState arguments
	 * @returns {Promise} Promise which will be resolved to object
	 */
	createEmptyAppState(oComponent: Component) {
		return this.crossAppNavService.createEmptyAppState(oComponent);
	}

	/**
	 * Will call isNavigationSupported method of CrossApplicationNavigation service with Navigation Arguments and oComponent.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {Array} oNavArgumentsArr and
	 * @param {object} oComponent - check the definition of
	 * sap.ushell.services.CrossApplicationNavigation=>isNavigationSupported arguments
	 * @returns {Promise} Promise which will be resolved to object
	 */
	isNavigationSupported(oNavArgumentsArr: Array<object>, oComponent: object) {
		return wrapJQueryPromise(this.crossAppNavService.isNavigationSupported(oNavArgumentsArr, oComponent));
	}

	/**
	 * Will call isInitialNavigation method of CrossApplicationNavigation service.
	 *
	 * @private
	 * @ui5-restricted
	 * @returns {Promise} Promise which will be resolved to boolean
	 */
	isInitialNavigation() {
		return this.crossAppNavService.isInitialNavigation();
	}

	/**
	 * Will call expandCompactHash method of CrossApplicationNavigation service.
	 *
	 * @param {string} sHashFragment an (internal format) shell hash
	 * @returns {Promise} promise the success handler of the resolve promise get an expanded shell hash as first argument
	 * @private
	 * @ui5-restricted
	 */
	expandCompactHash(sHashFragment: string) {
		return this.crossAppNavService.expandCompactHash(sHashFragment);
	}

	/**
	 * Will call parseShellHash method of URLParsing service with given sHash.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {string} sHash - check the definition of
	 * sap.ushell.services.URLParsing=>parseShellHash arguments
	 * @returns {object} which will return object
	 */
	parseShellHash(sHash: string) {
		return this.urlParsingService.parseShellHash(sHash);
	}

	/**
	 * Will call splitHash method of URLParsing service with given sHash.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {string} sHash - check the definition of
	 * sap.ushell.services.URLParsing=>splitHash arguments
	 * @returns {Promise} Promise which will be resolved to object
	 */
	splitHash(sHash: string) {
		return this.urlParsingService.splitHash(sHash);
	}

	/**
	 * Will call constructShellHash method of URLParsing service with given sHash.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object} oNewShellHash - check the definition of
	 * sap.ushell.services.URLParsing=>constructShellHash arguments
	 * @returns {string} Shell Hash string
	 */
	constructShellHash(oNewShellHash: object) {
		return this.urlParsingService.constructShellHash(oNewShellHash);
	}

	/**
	 * Will call setDirtyFlag method with given dirty state.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {boolean} bDirty - check the definition of sap.ushell.Container.setDirtyFlag arguments
	 */
	setDirtyFlag(bDirty: boolean) {
		this.oShellContainer.setDirtyFlag(bDirty);
	}

	/**
	 * Will call registerDirtyStateProvider method with given dirty state provider callback method.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {Function} fnDirtyStateProvider - check the definition of sap.ushell.Container.registerDirtyStateProvider arguments
	 */
	registerDirtyStateProvider(fnDirtyStateProvider: Function) {
		this.oShellContainer.registerDirtyStateProvider(fnDirtyStateProvider);
	}

	/**
	 * Will call deregisterDirtyStateProvider method with given dirty state provider callback method.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {Function} fnDirtyStateProvider - check the definition of sap.ushell.Container.deregisterDirtyStateProvider arguments
	 */
	deregisterDirtyStateProvider(fnDirtyStateProvider: Function) {
		this.oShellContainer.deregisterDirtyStateProvider(fnDirtyStateProvider);
	}

	/**
	 * Will call createRenderer method of ushell container.
	 *
	 * @private
	 * @ui5-restricted
	 * @returns {object} returns renderer object
	 */
	createRenderer() {
		return this.oShellContainer.createRenderer();
	}

	/**
	 * Will call getUser method of ushell container.
	 *
	 * @private
	 * @ui5-restricted
	 * @returns {object} returns User object
	 */
	getUser() {
		return this.oShellContainer.getUser();
	}

	/**
	 * Will check if ushell container is available or not.
	 *
	 * @private
	 * @ui5-restricted
	 * @returns {boolean} returns true
	 */
	hasUShell() {
		return true;
	}

	/**
	 * Will call registerNavigationFilter method of shellNavigation.
	 *
	 * @param {Function} fnNavFilter the filter function to register
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	registerNavigationFilter(fnNavFilter: Function) {
		this.shellNavigation.registerNavigationFilter(fnNavFilter);
	}

	/**
	 * Will call unregisterNavigationFilter method of shellNavigation.
	 *
	 * @param {Function} fnNavFilter the filter function to unregister
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	unregisterNavigationFilter(fnNavFilter: Function) {
		this.shellNavigation.unregisterNavigationFilter(fnNavFilter);
	}

	/**
	 * Will call setBackNavigation method of ShellUIService
	 * that displays the back button in the shell header.
	 *
	 * @param {Function} [fnCallBack]
	 * A callback function called when the button is clicked in the UI.
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	setBackNavigation(fnCallBack?: Function): void {
		this.shellUIService.setBackNavigation(fnCallBack);
	}

	/**
	 * Will call setHierarchy method of ShellUIService
	 * that displays the given hierarchy in the shell header.
	 *
	 * @param {object[]} [aHierarchyLevels]
	 * An array representing hierarchies of the currently displayed app.
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	setHierarchy(aHierarchyLevels: Array<object>): void {
		this.shellUIService.setHierarchy(aHierarchyLevels);
	}

	/**
	 * Will call setTitle method of ShellUIService
	 * that displays the given title in the shell header.
	 *
	 * @param {string} [sTitle]
	 * The new title. The default title is set if this argument is not given.
	 * @returns {void}
	 * @private
	 * @ui5-restricted
	 */
	setTitle(sTitle: string): void {
		this.shellUIService.setTitle(sTitle);
	}
}

/**
 * Service Factory for the ShellServices
 *
 * @private
 */
class ShellServicesFactory extends ServiceFactory<ShellServicesSettings> {
	/**
	 * Creates either a standard or a mock Shell service depending on the configuration.
	 *
	 * @param {ServiceContext<ShellServicesSettings>} oServiceContext the shellservice context
	 * @returns {Promise<IShellServices>} a promise for a shell service implementation
	 * @see ServiceFactory#createInstance
	 */
	createInstance(oServiceContext: ServiceContext<ShellServicesSettings>): Promise<IShellServices> {
		oServiceContext.settings.shellContainer = sap.ushell && sap.ushell.Container;
		const oShellService = oServiceContext.settings.shellContainer
			? new ShellServices(oServiceContext as ServiceContext<Required<ShellServicesSettings>>)
			: new ShellServiceMock(oServiceContext);
		return oShellService.initPromise.then(() => {
			// Enrich the appComponent with this method
			(oServiceContext.scopeObject as any).getShellServices = () => oShellService;
			return oShellService;
		});
	}
}

export default ShellServicesFactory;
