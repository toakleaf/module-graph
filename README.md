# Module graph

## Installation

```
npm i module-graph
```

## Usage

```js
import { createModuleGraph } from 'module-graph';

const moduleGraph = await createModuleGraph('./index.js');

/**
 * Options:
 */
const moduleGraph = await createModuleGraph('./index.js', {
  basePath: process.cwd(),
  conditions: ['browser', 'import'],
  preserveSymlinks: true,
  plugins: [myPlugin]
});
```

## `ModuleGraph`

### `get`

```js
const moduleGraph = await createModuleGraph('./index.js');

const foo = moduleGraph.get('foo.js');

/**
 * Or:
 */
const foo = moduleGraph.get((p) => p.endsWith('foo.js'));
```

### `getUniqueModules`

```js
const moduleGraph = await createModuleGraph('./index.js');

const uniqueModules = moduleGraph.getUniqueModules();
```

### `findImportChains`

```js
const moduleGraph = await createModuleGraph('./index.js');

const chains = moduleGraph.findImportChains('baz.js');

/**
 * Or:
 */
const chains = moduleGraph.findImportChains((p) => p.endsWith('baz.js'));

chains.forEach((c) => console.log(c.join(" -> ")));
// index.js -> bar.js -> baz.js
```

## Plugins

You can also extend the default behavior by providing `plugin`s.

### Hooks

#### `start`

> Runs once

Use for initializing logic of the plugin

```js
const plugin = {
  name: 'my-plugin',
  start: ({entrypoint, basePath, conditions, preserveSymlinks}) => {
    console.log('Plugin start');
  }
}

const moduleGraph = await createModuleGraph('./index.js', {
  plugins: [plugin]
});
```

#### `handleImport`

> Runs for every import starting (but excluding) the entrypoint

Can be used to implement custom logic or rewrite a specifier

If `false` is returned, the import will be skipped entirely
If a string is returned, it will try to resolve that instead

```js
const plugin = {
  name: 'my-plugin',
  handleImport: ({source, importer, importee}) => {
    if (importee.endsWith('?skip')) {
      return false;
    }
  }
}

const moduleGraph = await createModuleGraph('./index.js', {
  plugins: [plugin]
});
```

#### `analyze`

> Runs for every module

Can be used to analyze the module (or its source), and add 
additional meta information to the Module object

You can mutate the module directly, no need to return it

```js
const plugin = {
  name: 'my-plugin',
  analyze: (module) => {
    if (module.source.includes('process.env')) {
      module.usesProcessEnv = true;
    }
  }
}

const moduleGraph = await createModuleGraph('./index.js', {
  plugins: [plugin]
});

moduleGraph.get('module-containing-process-env.js').usesProcessEnv; // true
```

#### `resolve`

> Runs for every import starting (but excluding) the entrypoint

Can be used to implement custom resolution logic

If nothing is returned, the default resolution will be used
If a URL is returned, it will output that instead

```js
const plugin = {
  name: 'my-plugin',
  resolve: ({ importee, importer, conditions, preserveSymlinks }) => {
    return customResolve(importee, importer, conditions, preserveSymlinks);
  }
}

const moduleGraph = await createModuleGraph('./index.js', {
  plugins: [plugin]
});
```

#### `end`

> Runs once

Use for cleanup logic of the plugin

```js
const plugin = {
  name: 'my-plugin',
  end: (moduleGraph) => {
    console.log('Plugin end')
  }
}

const moduleGraph = await createModuleGraph('./index.js', {
  plugins: [plugin]
});
```

