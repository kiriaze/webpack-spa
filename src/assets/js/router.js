class Router {

	constructor() {
		this.$window = $(window);

		this.routes = [];
		this.root = '';

		this.addEventListeners();
	}

	parse(path) {
		return decodeURI(path).split('/').filter((v) => {
			if(v != '') return v;
		});
	}

	route(path, fn) {
		let params = this.parse(path);
		this.routes.push({params, fn});
	}

	start() {
		this.check();
	}

	navigate(path) {
		if (path != window.location.pathname) history.pushState(false, false, this.root + path);
		this.check();
	}

	check() {
		let params = this.parse(location.pathname);
		for (let i = 0, l = this.routes.length; i < l; ++i) {
			let route = this.routes[i].params,
				length = route.length;
			if (params.length == length) {
				let match = true,
					variables = [];
				for (let p = 0; p < length; ++p) {
					if (route[p].charAt(0) == '$') {
						variables.push(params[p]);
					} else if (route[p].charAt(0) == '?') {
						// TODO
						// optional parameter
					} else if (params[p] != route[p]) {
						match = false;
						break;
					}
				}
				if (match) {
					this.routes[i].fn(...variables);
					break;
				}
			}
		}
	}

	_windowOnPopstate() {
		this.check();
	}

	addEventListeners() {
		this._windowOnPopstate = this._windowOnPopstate.bind(this);

		this.$window.on('popstate', this._windowOnPopstate);
	}

	removeEventListeners() {
		this.$window.off('popstate', this._windowOnPopstate);
	}

}

export default new Router();