
# ESM Loader / TSX SourceMap Issue Demo

## Steps to reproduce

### Node.js

Use node v18 or v20. Node v16 is not affected by the issue.

### Setup

```bash
cd tsx-sm-package
npm install
npm run tsc:build

cd ..

cd tsx-sm-app
npm install
```

### Issue

The `npm run tsx:withDynImport` and the `npm run esmLoader:withDynImport` will show the `notok` file as a `.js` file with the line numbers corresponding to the state in `build/notok.js`:

#### TSX
```
> tsx-sm-app@0.0.1 start
> tsx ts-w-dyn-imp.ts

/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2
    throw new Error('x');
          ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2:11)
    at <anonymous> (/.../tsx-sm-issue/tsx-sm-app/ts-w-dyn-imp.ts:4:1)
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)
```

#### ESM Loader
```
(node:85624) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time
/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2
    throw new Error('x');
          ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2:11)
    at file:///.../tsx-sm-issue/tsx-sm-app/js-w-dyn-imp.js:4:1
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)

```

### Comparing to importing file without dynamic import

However, running `npm run tsx:withoutDynImport` or `npm run esmLoader:withoutDynImport` will show the `ok` file as a `.ts` file with the line numbers corresponding to the state in `src/ok.tsx`:

#### TSX

```
> tsx-sm-app@0.0.1 start2
> tsx ts-wo-dyn-imp.ts

/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4
  throw new Error('x')
        ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4:9)
    at <anonymous> (/.../tsx-sm-issue/tsx-sm-app/ts-wo-dyn-imp.ts:4:1)
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)

```

#### ESM Loader
```
(node:85460) ExperimentalWarning: Custom ESM Loaders is an experimental feature and might change at any time

/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4
  throw new Error('x')
        ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4:9)
    at file:///.../tsx-sm-issue/tsx-sm-app/js-wo-dyn-imp.js:4:1
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)


```

The only difference between the two cases is that `notok.ts` has a dynamic import (`await import('some-package')`), while `ok.tsx` has none.

### Comparing to native Node.js behaviour

Indeed, we may assume the issue is with Node.js instead of TSX / ESM Loader, however if the below two other scripts are executed, we can see that sourcemaps are working fine with pure Node.js even with dynamic imports in the dependency tree:

`npm run node:withDynImport`
```
> tsx-sm-app@0.0.1 node:withDynImport
> node --enable-source-maps js-w-dyn-imp.js

/.../tsx-sm-issue/tsx-sm-package/src/notok.ts:4
  throw new Error('x')
        ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/src/notok.ts:4:9)
    at file:///.../tsx-sm-issue/tsx-sm-app/js-w-dyn-imp.js:4:1
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async DefaultModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)


```
The output shows the `notok` file as a `.ts` file with the line numbers corresponding to the state in `src/notok.ts`

`npm run node:withoutDynImport`
Same as above, but this works even with TSX so only included for completeness: The `ok` file as a `.ts` file with the line numbers corresponding to the state in `src/ok.ts`

#### Note
The target files of the two Node.js and the two TSX scripts are identical, except for the file extension.
