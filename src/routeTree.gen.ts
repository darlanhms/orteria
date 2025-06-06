/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as ScoringSessionIdImport } from './routes/scoring/$sessionId'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ScoringSessionIdRoute = ScoringSessionIdImport.update({
  id: '/scoring/$sessionId',
  path: '/scoring/$sessionId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/scoring/$sessionId': {
      id: '/scoring/$sessionId'
      path: '/scoring/$sessionId'
      fullPath: '/scoring/$sessionId'
      preLoaderRoute: typeof ScoringSessionIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/scoring/$sessionId': typeof ScoringSessionIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/scoring/$sessionId': typeof ScoringSessionIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/scoring/$sessionId': typeof ScoringSessionIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/scoring/$sessionId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/scoring/$sessionId'
  id: '__root__' | '/' | '/scoring/$sessionId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ScoringSessionIdRoute: typeof ScoringSessionIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ScoringSessionIdRoute: ScoringSessionIdRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/scoring/$sessionId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/scoring/$sessionId": {
      "filePath": "scoring/$sessionId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
