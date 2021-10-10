# ReRoot #
This library is designed to limit the require path in the specific directory

## Intall ##
```sh
npm install reroot
```

## Usage ##
```javascript
// Where the cloest node_modules is
require('reroot').project_root;

// Assign where does the root '/' start from
require('reroot').search_root = "/PATH/YOU/WANT/ALL/MODULES/START";

// other module
require('/a/b/c'); // This will be resolved into "/PATH/YOU/WANT/ALL/MODULES/START/a/b/c"

// If you really wanna require files other than the the path specified
require('file:///PATH/TO/OTHER/SCRIPT');
```