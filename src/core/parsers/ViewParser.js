
export default class ViewParser {
	
	static async parseHTML(responseText) {
		var data = await responseText.text();
		var parser = new DOMParser();
		return parser.parseFromString(data, "text/html");
	}
	
	static async parseJSON(responseText) {
		return responseText.json();
	}
}