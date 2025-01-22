import { ModuleGraph } from './ModuleGraph.js';
import type { NapiResolveOptions } from 'oxc-resolver';
import type { ImportSpecifier } from 'es-module-lexer'; // Same type is exported in rs-module-lexer as well

interface UserProvided {
  [key: string]: any;
}

export interface Module extends UserProvided {
  /** File URL */
  href: string,
  /** Absolute path */
  pathname: string,
  /** Relative path from the cwd */
  path: string,
  source?: string,
  packageRoot?: URL,
  facade: boolean,
  hasModuleSyntax: boolean,
  importedBy: string[],
}

export interface ExternalModule extends Module {
  /** The name of the external package, e.g. "foo" */
  package: string,
  /** The import thats used in the source code, e.g. "foo/bar.js" */
  importSpecifier: string,
}

export type ExtendedModule<T> = Module & T;
export type ExtendedModuleGraph<T> = ModuleGraph & T;

export interface Plugin {
  name: string;
  /**
   * Runs once
   * Use for initializing logic of the plugin
   */
  start?: (params: {
    entrypoints: string[],
    basePath: string,
    exportConditions: string[],
  }) => void | Promise<void>;
  /**
   * Runs for every import starting (but excluding) the entrypoints
   * Can be used to implement custom logic or rewrite a specifier
   * If false is returned, the import will be skipped entirely
   * If a string is returned, it will try to resolve that instead
   */
  handleImport?: (params: {
    source: string,
    importer: string,
    importee: string,
  }) => void | boolean | string | Promise<void | boolean | string>;
  /**
   * Runs for every module
   * Can be used to analyze the module (or its source), and add 
   * additional meta information to the Module object
   * You can mutate the module directly, no need to return it
   */
  analyze?: (
    module: Module,
    moduleGraph: ModuleGraph,
    source: string,
    imports: ImportSpecifier[]
  ) => void | Promise<void>;
  /**
   * Runs for every import starting (but excluding) the entrypoints
   * Can be used to implement custom resolution logic
   * If nothing is returned, the default resolution will be used
   * If a URL is returned, it will output that instead
   */
  resolve?: (params: {
    importee: string,
    importer: string,
    exportConditions: string[],
  } & NapiResolveOptions) => URL | void | Promise<void | URL>;
  /**
   * Runs once
   * Use for cleanup logic of the plugin
   */
  end?: (moduleGraph: ModuleGraph) => void | Promise<void>;
}