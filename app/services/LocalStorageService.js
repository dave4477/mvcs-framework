import Constants from './../Constants.js';

export default class LocalStorageService extends fw.core.serviceCore {
    constructor() {
        super(Constants.services.LOCAL_STORAGE_SERVICE);
    }
    /**
     * Returns a saved data from the local data store and if the
     * localStore is not supported, it will perform this method on a cookie instead.
     * @function getData
     * @param {string} sName The name for the value to retrieve.
     * @returns {Object} The value for this given name stored in the datastore or <code>null</code> if empty.
     */
    getData(sName) {

        if (typeof (Storage) !== "undefined") {
            try {
                return localStorage.getItem(sName);
            } catch (err) {
                console.warn("Can not get local storage");
            }
        } else {
            this.getCookie(sName);
        }
    }


    /**
     * Stores a hash in the localStorage. If the localStore is not supported, it will perform this method on a cookie instead.
     * @function setData
     * @param {string} sName The name of the storage item.
     * @param {string} sValue The value for this storage item.
     * @example
     * var _pmDataStore = Object.create(null);
     * var token = data.user.api_token;
     * _pmDataStore.token = token;
     * _localStorage.setData(pm.data.localStorage, JSON.stringify(_pmDataStore));
     */
    setData(sName, sValue) {
        if (typeof (Storage) !== "undefined") {
            try {
                localStorage.setItem(sName, sValue);
            } catch (err) {
                console.warn("Can not set local storage");
            }
        } else {
            this.setCookie(sName, sValue);
        }
    };

    /**
     * Removes stored data from disk.
     * If the localStore is not supported, it will perform this method on a cookie instead.
     * @function removeData
     * @param {string} sName The name of the data to remove.
     */
    removeData(sName) {
        if (typeof (Storage) !== "undefined") {
            localStorage.removeItem(sName);
        } else {
            this.removeCookie(sName);
        }
    };


    /**
     * Fallback method for when localDataStore is not supported. Sets a cookie.
     * @param {string} sName The name of the cookie.
     * @param {string} sValue The value for this cookie.
     * @param {number} nDays The lifetime for this cookie.
     */
    setCookie(sName, sValue, nDays = null) {
        var expires = "";
        if (nDays) {
            var d = new Date();
            d.setTime(d.getTime() + nDays * 24 * 60 * 60 * 1000);
            expires = "; expires=" + d.toGMTString();
        }
        document.cookie = sName + "=" + sValue + expires + "; path=/";
    }

    /**
     * Fallback method for when localDataStore is not supported. Returns a saved cookie.
     * @param {string} sName The name of the cookie to retrieve.
     * @returns {Object} The value for the cookie or <code>null</code> if empty.
     */
    getCookie(sName) {
        var re = new RegExp("(\;|^)[^;]*(" + sName + ")\=([^;]*)(;|$)");
        var res = re.exec(document.cookie);
        return res !== null ? res[3] : null;
    }

    /**
     * Fallback method for when localDataStore is not supported. Removes a cookie from disk.
     * @param {string} name The name of the cookie to remove.
     */
    removeCookie(name) {
        this.setCookie(name, "", -1);
    }

}