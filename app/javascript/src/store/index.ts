import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { documents } from './documents'

const middlewares = []
const reducer = combineReducers({
  documents: documents.reducer,
})

const store = configureStore({
  reducer,
  middleware: middlewares,
})

export type RootState = ReturnType<typeof reducer>
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector

export { store }
