/**
 *	Author: JCloudYu
 *	Create: 2021/03/17
**/
(()=>{
	"use strict";
	
	const fs = require('fs');
	const path = require('path');
	const RUNTIME_DATA = {
		proto_require: module.constructor.prototype.require,
		proj_root: require.main?require.main.path:process.cwd(),
		user_root: '',
		search_root: ''
	};
	
	// Look for the directory that contains node_modules
	{
		let search_dir = __dirname, node_modules_dir = false;
		while(true) {
			const curr_dir = `${search_dir}/node_modules`;
			try {
				const stat = fs.statSync(curr_dir);
				if ( stat.isDirectory() ) {
					node_modules_dir = search_dir;
					break;
				}
			}
			catch(e) {}
			
			
			
			const parent_dir = path.dirname(search_dir);
			if ( parent_dir === search_dir ) break;
			
			search_dir = parent_dir;
		}
		
		RUNTIME_DATA.proj_root = node_modules_dir||RUNTIME_DATA.proj_root;
	}
	
	
	
	RUNTIME_DATA.search_root = RUNTIME_DATA.user_root||RUNTIME_DATA.proj_root;
	Object.defineProperty(module.exports, 'root_path', {
		set:(v)=>module.exports.search_root=v,
		get: ()=>module.exports.search_root,
		configurable:false, enumerable:true
	});
	Object.defineProperty(module.exports, 'search_root', {
		set:(v)=>{
			RUNTIME_DATA.user_root = path.resolve(process.cwd(), '' + v);
			RUNTIME_DATA.search_root = RUNTIME_DATA.user_root||RUNTIME_DATA.proj_root;
		},
		get: ()=>RUNTIME_DATA.search_root,
		configurable:false, enumerable:true
	});
	Object.defineProperty(module.exports, 'project_root', {
		get: ()=>RUNTIME_DATA.proj_root,
		configurable:false, enumerable:true
	});
	Object.defineProperty(module.exports, 'safe_require', {
		configurable:false, enumerable:false, writable:false,
		value:(ori_require)=>function(...args){ try{return ori_require(...args);}catch(e){
			if ( e instanceof Error && (e.code === "MODULE_NOT_FOUND")) {
				return undefined;
			}
			
			throw e;
		}}
	});
	Object.defineProperty(module.exports, 'resolve_path', {
		configurable:false, enumerable:false, writable:false,
		value:function(src_path) {
			const root_dir = RUNTIME_DATA.search_root;
		
			const matches = src_path.match(file_uri_syntax);
			if ( matches ) {
				return path.resolve(root_dir, `${matches[1]?matches[1].substring(1):''}${matches[2]}`);
			}
			
			
			
			let resolved_path = src_path;
			if ( src_path[0] === "/" ) {
				resolved_path = path.resolve(root_dir, src_path.substring(1));
			}
			else
			if ( src_path.substring(0, 2) === "./" || src_path.substring(0, 3) === '../' ) {
				resolved_path = path.resolve(root_dir, src_path);
			}
			
			
			
			return resolved_path;
		}
	});
	
	
	
	const file_uri_syntax = /^file:\/\/(\/[a-zA-Z]:)?(\/.*)$/;
	module.constructor.prototype.require = function(id) {
		const root_dir = RUNTIME_DATA.search_root;
		
		let resolved_path = null;
		if ( id[0] === "/" ) {
			resolved_path = path.resolve(root_dir, id.substring(1));
		}
		else
		if ( id.substring(0, 2) === "./" || id.substring(0, 3) === '../' ) {
			resolved_path = path.resolve(this.path, id);
		}
		
		
		if ( resolved_path !== null ) {
			let in_safe_zone = false;

			const safe_paths = [root_dir, ...this.paths];
			for( const path of safe_paths ) {
				if ( resolved_path.substring(0, path.length) === path ) {
					in_safe_zone = in_safe_zone || true;
				}
			}
			
			if ( !in_safe_zone ) {
				throw new Error("You're accessing path that is out of current environment's scope!");
			}
			
			id = resolved_path;
		}
		else {
			const matches = id.match(file_uri_syntax);
			if ( matches ) {
				id = path.resolve(this.path, `${matches[1]?matches[1].substring(1):''}${matches[2]}`);
			}
		}
		
		return RUNTIME_DATA.proto_require.call(this, id);
	};
})();
