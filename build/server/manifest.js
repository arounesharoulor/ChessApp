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
		client: {start:"_app/immutable/entry/start.C--YutG0.js",app:"_app/immutable/entry/app.Ck_91xm5.js",imports:["_app/immutable/entry/start.C--YutG0.js","_app/immutable/chunks/CSSstbky.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/entry/app.Ck_91xm5.js","_app/immutable/chunks/GbfBVQah.js","_app/immutable/chunks/DYl5dUZ5.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CECUam5l.js')),
			__memo(() => import('./chunks/1-D7kh529s.js')),
			__memo(() => import('./chunks/2-DKG032JB.js'))
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
				endpoint: __memo(() => Promise.resolve().then(function () { return _server_ts; }))
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

var _server_ts = /*#__PURE__*/Object.freeze({
	__proto__: null
});

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
