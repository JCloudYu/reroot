/** Assign the path to where `/` starts from. */
export const root_path:string;

/** Generates a require function that will returns undefined when the path is invalid. */
export function safe_require(require:NodeRequire):NodeRequire;

/** Converts the given path to an absolute path according to `root_path` property. */
export function resolve_path(path:string):string;