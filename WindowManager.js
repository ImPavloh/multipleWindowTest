class WindowManager {
    #windows;
    #count;
    #id;
    #winData;
    #winShapeChangeCallback;
    #winChangeCallback;

    static LOCAL_STORAGE_KEYS = {
        WINDOWS: "windows",
        COUNT: "count",
    };

    constructor() {
        this.#setupEventListeners();
        this.#initializeProperties();
    }

    #setupEventListeners() {
        window.addEventListener("storage", this.#handleStorageChange.bind(this));
        window.addEventListener('beforeunload', this.#handleWindowClose.bind(this));
    }

    #handleStorageChange(event) {
        if (event.key === WindowManager.LOCAL_STORAGE_KEYS.WINDOWS) {
            const newWindows = JSON.parse(event.newValue);
            const winChange = this.#didWindowsChange(this.#windows, newWindows);
            this.#windows = newWindows;
            if (winChange && this.#winChangeCallback) {
                this.#winChangeCallback();
            }
        }
    }

    #handleWindowClose() {
        const index = this.getWindowIndexFromId(this.#id);
        if (index !== -1) {
            this.#windows.splice(index, 1);
            this.updateWindowsLocalStorage();
        }
    }

    #initializeProperties() {
        this.#windows = JSON.parse(localStorage.getItem(WindowManager.LOCAL_STORAGE_KEYS.WINDOWS)) || [];
        this.#count = parseInt(localStorage.getItem(WindowManager.LOCAL_STORAGE_KEYS.COUNT), 10) || 0;
        this.#count++;
        this.#id = this.#count;
        this.#winData = {
            id: this.#id,
            shape: this.getWinShape(),
            metaData: null,
        };
        this.#windows.push(this.#winData);
        localStorage.setItem(WindowManager.LOCAL_STORAGE_KEYS.COUNT, this.#count.toString());
        this.updateWindowsLocalStorage();
    }

    #didWindowsChange(previousWindows, newWindows) {
        if (previousWindows.length !== newWindows.length) {
            return true;
        }
        return previousWindows.some((win, index) => win.id !== newWindows[index].id);
    }

    init(metaData) {
        this.#winData.metaData = metaData;
        localStorage.setItem(WindowManager.LOCAL_STORAGE_KEYS.WINDOWS, JSON.stringify(this.#windows));
    }

    getWinShape() {
        return {
            x: window.screenLeft,
            y: window.screenTop,
            w: window.innerWidth,
            h: window.innerHeight
        };
    }

    getWindowIndexFromId(id) {
        return this.#windows.findIndex(win => win.id === id);
    }

    updateWindowsLocalStorage() {
        localStorage.setItem(WindowManager.LOCAL_STORAGE_KEYS.WINDOWS, JSON.stringify(this.#windows));
    }

    update() {
        const winShape = this.getWinShape();
        if (JSON.stringify(winShape) !== JSON.stringify(this.#winData.shape)) {
            this.#winData.shape = winShape;
            const index = this.getWindowIndexFromId(this.#id);
            if (index !== -1) {
                this.#windows[index].shape = winShape;
                this.#winShapeChangeCallback?.();
                this.updateWindowsLocalStorage();
            }
        }
    }

    setWinShapeChangeCallback(callback) {
        this.#winShapeChangeCallback = callback;
    }

    setWinChangeCallback(callback) {
        this.#winChangeCallback = callback;
    }

    getWindows() {
        return this.#windows;
    }

    getThisWindowData() {
        return this.#winData;
    }

    getThisWindowID() {
        return this.#id;
    }
}