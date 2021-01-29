
export default class Backoff {
	constructor() {
	}

	/**
	 * Gets a url
	 * @param url
	 * @returns {*}
     */
	async getURL(url) {
		return this._getURL(url);
	}

	/**
	 * Post to a url.
	 * @param url
	 * @param data
	 * @returns {*}
     */
	async postURL(url, data) {
		return this._postURL(url, data);
	}

	async _getURL(url, retryCount = 5, attempt = 0) {
		return await this.httpGet(url).then(data => {
			return data;
		}, (err) => {
			if (retryCount > 0) {
				setTimeout(() => {
					this._getURL(url, --retryCount, ++attempt);
				}, 250 * attempt);
			}
		});
	}

	async _postURL(url, params, retryCount = 5, attempt = 0) {
		return await this.httpPost(url, params).then(data => {
			return data;
		}, (err) => {
			if (retryCount > 0) {
				setTimeout(() => {
					this._postURL(url, params, --retryCount, ++attempt);
				}, 150 * attempt);
			}
		});
	}
	
	async httpGet(url) {
		return new Promise((resolve, reject) => {
			fetch(url).then(response => {
				if (response.ok) {
					resolve(response);
				} else {
					reject();
				}
			}).catch(err => {
				reject(err);
			});	
		});		
	}

	async httpPost(url, data) {
		return new Promise((resolve, reject) => {
			fetch(url, {
				method: 'POST',
				mode: 'cors',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
					// 'Content-Type': 'application/x-www-form-urlencoded',
				},
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
				body: JSON.stringify(data) // body data type must match "Content-Type" header
			}).then(response => {
				if (response.ok) {
					resolve(response);
				} else {
					reject();
				}
			}).catch(err => {
				reject(err);
			});
		});
	}
}