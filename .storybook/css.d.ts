// The preview imports a stylesheet for its side effect. TypeScript needs to be
// told that is a thing one can do; Vite handles the rest.
declare module '*.css'
