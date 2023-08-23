
# TSX SourceMap Issue Demo

## Steps to reproduce

### Node.js

Use node v18 or v20. Node v16 is not affected by the issue.

### Setup

```bash
cd tsx-sm-package
npm install
npm run tsc:build

cd ../tsx-sm-app
npm install
npm start
npm run start2
```

### Results

The first `npm start` will show the `notok` file as a JS file with the line numbers corresponding to the state in `build/notok.js`:

```
> tsx-sm-app@0.0.1 start
> tsx index.ts

/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2
    throw new Error('x');
          ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/build/notok.js:2:11)
    at <anonymous> (/.../tsx-sm-issue/tsx-sm-app/index.ts:4:1)
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)
```

However, running `npm run start2` will show the `ok` file as a TS file with the line numbers corresponding to the state in `src/ok.tsx`:
```
> tsx-sm-app@0.0.1 start2
> tsx index-ok.ts

/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4
  throw new Error('x')
        ^

Error: x
    at foo (/.../tsx-sm-issue/tsx-sm-package/src/ok.ts:4:9)
    at <anonymous> (/.../tsx-sm-issue/tsx-sm-app/index-ok.ts:4:1)
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
    at async CustomizedModuleLoader.import (node:internal/modules/esm/loader:228:24)
    at async loadESM (node:internal/process/esm_loader:40:7)
    at async handleMainPromise (node:internal/modules/run_main:66:12)

```

The only difference between the two case is that `notok.ts` has a dynamic import (`await import('some-package')`), while `ok.tsx` has none.
