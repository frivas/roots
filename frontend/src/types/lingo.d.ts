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

  interface LingoViteOptions extends LingoConfig {}

  export function vite(config: LingoViteOptions): (viteConfig: any) => any;
  export function next(config: LingoConfig): (nextConfig: any) => any;

  const lingoCompiler: {
    vite: typeof vite;
    next: typeof next;
  };

  export default lingoCompiler;
} 