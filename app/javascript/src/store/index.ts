/* eslint-disable no-console */
import { Operation, VersionedOperation } from './../channels/DocumentChannel'
import { CollaborationClient } from './../collaboration/CollaborationClient'
import {
  Action,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  Middleware,
  PayloadAction,
  ThunkAction,
} from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { document, DocumentState } from './document'
import { createLogger } from 'redux-logger'

const logger = createLogger({
  collapsed: true,
})

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

const middlewares = getDefaultMiddleware().concat([logger])
const reducer = combineReducers({
  document: document.reducer,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]) => {
  console.log('%c[store]', 'color: #cea', ...args)
}

const client = new CollaborationClient({
  onOperationReceived: (op: VersionedOperation) => {
    const nextAction = {
      type: op.type,
      payload: {
        ...op.payload,
        remote: true,
      },
    }
    log('client got external op', op.type, 'dispatch', nextAction)
    store.dispatch(nextAction)
  },
  onAllOperationsAcknowledged: () => log('client all op ack'),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toOp = (action: PayloadAction<any>): Operation =>
  (action as unknown) as Operation

const changeMonitor: Middleware = () => (next) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: PayloadAction<any>
) => {
  const result = next(action)

  if (client.isMappedOperation(action.type) && !action.payload._remote) {
    log('document action', action)
    client.submitOperations([toOp(action)])
  } else if (action.payload._remote) {
    log('_remote action', action.type)
  } else {
    log('non-document action', action.type, action.payload)
  }

  return result
}

middlewares.push(changeMonitor)

const store = configureStore({
  reducer,
  middleware: middlewares,
  preloadedState: {
    document: window.DOCUMENT.data || { entities: {} },
  },
})

//
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
