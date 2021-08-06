declare class reroot {
	/** Where the path '/' starts from when user requires a module using absolute path. */
	root_path:string;

	/** Generates a require function that will returns undefined when the path is invalid. */
	safe_require(require:NodeRequire):NodeRequire;

	/** Converts the given path to an absolute path according to `root_path` property. */
	resolve_path(path:string):string;
}

export = reroot;