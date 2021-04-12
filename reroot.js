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
		root_dir: require.main.path
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
		
		
		RUNTIME_DATA.root_dir = node_modules_dir||require.main.path;
	}
	
	
	
	Object.defineProperty(module.exports, 'root_path', {
		set:(v)=>{
			RUNTIME_DATA.root_dir = path.resolve(process.cwd(), v);
		},
		get: ()=>{ return RUNTIME_DATA.root_dir; },
		configurable:false, enumerable:true
	});
	Object.defineProperty(module.exports, 'safe_require', {
		configurable:false, enumerable:false, writable:false,
		value:(ori_require)=>function(...args){ try{return ori_require(...args);}catch(e){
			if ( e instanceof Error && (e.code === "ENOENT" || e.code === "MODULE_NOT_FOUND")) {
				return undefined;
			}
			
			throw e;
		}}
	});
	Object.defineProperty(module.exports, 'resolve_path', {
		configurable:false, enumerable:false, writable:false,
		value:function(src_path) {
			const root_dir = RUNTIME_DATA.root_dir;
		
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
		const root_dir = RUNTIME_DATA.root_dir;
		
		let resolved_path = null;
		if ( id[0] === "/" ) {
			resolved_path = path.resolve(root_dir, id.substring(1));
		}
		else
		if ( id.substring(0, 2) === "./" || id.substring(0, 3) === '../' ) {
			resolved_path = path.resolve(this.path, id);
		}
		
		
		if ( resolved_path !== null ) {
			if ( resolved_path.substring(0, root_dir.length) !== root_dir ) {
				throw new Error("You're not allowed to access outer scope with relative path!");
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
