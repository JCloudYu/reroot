declare class reroot {
	/** An alias to search_root. **/
	static root_path:string;

	/** Where the path '/' starts from when user requires a module using absolute path. **/
	static search_root:string;

	/** The root of current project. **/
	static readonly project_root:string;

	/** Generates a require function that will returns undefined when the path is invalid. **/
	static safe_require(require:NodeRequire):NodeRequire;

	/** Converts the given path to an absolute path according to `root_path` property. **/
	static resolve_path(path:string):string;
}

export = reroot;