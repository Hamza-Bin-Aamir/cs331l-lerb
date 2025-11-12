declare module 'react' {
  const React: any;
  export default React;
  export const createContext: any;
  export const useContext: any;
  export const useMemo: any;
  export const useState: any;
  export type ReactNode = any;
}

declare module 'react/jsx-runtime' {
  const jsxRuntime: any;
  export = jsxRuntime;
}

declare module 'react-dom/client' {
  const ReactDOMClient: any;
  export default ReactDOMClient;
}

declare module 'react-router-dom' {
  export const NavLink: any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
