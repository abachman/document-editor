/* eslint-disable no-console */
import { CollaborationClient } from './../collaboration/CollaborationClient'
import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { document, DocumentState } from './document'

interface ApiDocument {
  id: number
  version: number
  name: string
  data: DocumentState
  created_at: string
  updated_at: string
}

declare global {
  interface Window {
    DOCUMENT: ApiDocument
  }
}

const reducer = combineReducers({
  document: document.reducer,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]) => {
  console.log('%c[store]', 'color: #cea', ...args)
}

const client = new CollaborationClient()

const store = configureStore({
  reducer,
  preloadedState: {
    document: window.DOCUMENT.data || { entities: {} },
  },
  enhancers: [client.enhance()],
})

client.connect(window.DOCUMENT.id.toString(), window.DOCUMENT.version)

export type RootState = ReturnType<typeof reducer>
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Action<any>
>

log('STORE ', store.getState())

export { store }
