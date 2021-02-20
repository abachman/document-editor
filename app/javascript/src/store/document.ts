import { AppThunk } from './index'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum EntityKind {
  Note = 'note',
  Question = 'question',
}

export type DocumentEntity = {
  id: string
  kind: EntityKind
  content: string
  _remote?: boolean // used to signal whether create happened here
}

export type DocumentState = {
  version: number
  entities: Record<DocumentEntity['id'], DocumentEntity>
}

const initialState: DocumentState = {
  version: 0,
  entities: {},
}

export const createEntity = (kind: EntityKind): DocumentEntity => {
  const id = Date.now().toString()
  return {
    id,
    kind: kind,
    content: '',
  }
}

// operations: insert, remove
export const insertOp = (entity: DocumentEntity): AppThunk => (dispatch) => {
  dispatch(document.actions.insert(entity))
}

const document = createSlice({
  name: 'document',
  initialState,
  reducers: {
    insert(state, action: PayloadAction<DocumentEntity>) {
      const entity = action.payload
      state.entities[entity.id] = entity
    },

    remove(state, action: PayloadAction<Pick<DocumentEntity, 'id'>>) {
      delete state.entities[action.payload.id]
    },
  },
})

const documentActions = document.actions

export { document, documentActions }
