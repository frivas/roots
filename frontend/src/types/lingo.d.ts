declare module 'lingo.dev/compiler' {
  interface LingoConfig {
    sourceLocale: string;
    targetLocales: string[];
    apiKey?: string;
    models?: {
      [key: string]: string;
    };
    useDirective?: boolean;
    provider?: {
      id: string;
      model: string;
      prompt?: string;
    };
  }

  type LingoViteOptions = LingoConfig;

  export function vite(config: LingoViteOptions): (viteConfig: unknown) => unknown;
  export function next(config: LingoConfig): (nextConfig: unknown) => unknown;

  const lingoCompiler: {
    vite: typeof vite;
    next: typeof next;
  };

  export default lingoCompiler;
} 