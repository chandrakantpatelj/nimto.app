/// <reference types="vite/client" />

declare module 'style-inject' {
  export default function styleInject(css: string): void;
}

declare module 'mime-match' {
  function match(typeA: string, typeB: string): boolean;

  export = match;
}
