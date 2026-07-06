const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.XbVe-SDy.js",app:"_app/immutable/entry/app.D_W4aR9C.js",imports:["_app/immutable/entry/start.XbVe-SDy.js","_app/immutable/chunks/2N1MTiw1.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/entry/app.D_W4aR9C.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/chunks/DYl5dUZ5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Bfk5LKuL.js')),
			__memo(() => import('./chunks/1-BFEHaXkk.js')),
			__memo(() => import('./chunks/2-CK5cWruB.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/players",
				pattern: /^\/api\/players\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-9Yy1Leb7.js'))
			},
			{
				id: "/api/tournaments",
				pattern: /^\/api\/tournaments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Dxp9MQxJ.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
