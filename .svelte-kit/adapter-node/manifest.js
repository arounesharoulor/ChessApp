export const manifest = (() => {
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
		client: {start:"_app/immutable/entry/start.C--YutG0.js",app:"_app/immutable/entry/app.Ck_91xm5.js",imports:["_app/immutable/entry/start.C--YutG0.js","_app/immutable/chunks/CSSstbky.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/entry/app.Ck_91xm5.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/chunks/DYl5dUZ5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
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
				id: "/api",
				pattern: /^\/api\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/_server.ts.js'))
			},
			{
				id: "/api/players",
				pattern: /^\/api\/players\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/players/_server.ts.js'))
			},
			{
				id: "/api/tournaments",
				pattern: /^\/api\/tournaments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/tournaments/_server.ts.js'))
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

export const prerendered = new Set([]);
