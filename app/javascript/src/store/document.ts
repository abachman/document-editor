import { AppThunk } from './index'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import cuid from 'cuid'

export enum EntityKind {
  Note = 'note',
  Question = 'question',
}

export type DocumentEntity = {
  id: string
  kind: EntityKind
  content: string
  position?: number
  _remote?: boolean // used to signal whether create happened here
}

type EntityCollection = Record<DocumentEntity['id'], DocumentEntity>

export type DocumentState = {
  version: number
  entities: EntityCollection
}

const initialState: DocumentState = {
  version: 0,
  entities: {},
}

export const createEntity = (kind: EntityKind): DocumentEntity => {
  const id = cuid()
  return {
    id,
    kind: kind,
    content: '',
  }
}

export const sortedEntities = (
  entities: EntityCollection
): DocumentEntity[] => {
  return Object.values(entities).sort((a, b) => {
    if (a.position > b.position) return 1
    else if (a.position === b.position) return 0
    else return -1
  })
}

// insert creates and sets position
export const insertOp = (entity: DocumentEntity): AppThunk => (
  dispatch,
  getState
) => {
  const ents = sortedEntities(getState().document.entities)
  entity.position = ents.length + 1
  dispatch(document.actions.insert(entity))
}

type ReorderPayload = {
  active: Pick<DocumentEntity, 'id'>
  over: Pick<DocumentEntity, 'id'>
  delta: number
}

// update just passes entity, only generate Op if content has actually changed
export const updateOp = (entity: DocumentEntity): AppThunk => (
  dispatch,
  getState
) => {
  const existing = getState().document.entities[entity.id]
  if (existing.content !== entity.content)
    dispatch(document.actions.insert(entity))
}

const document = createSlice({
  name: 'document',
  initialState,
  reducers: {
    // local operation apply

    insert(state, action: PayloadAction<DocumentEntity>) {
      const entity = action.payload
      state.entities[entity.id] = entity
    },

    remove(state, action: PayloadAction<Pick<DocumentEntity, 'id'>>) {
      delete state.entities[action.payload.id]
    },

    reorder(state, action: PayloadAction<ReorderPayload>) {
      const { payload } = action
      const from = state.entities[payload.active.id]
      const toAfter = state.entities[payload.over.id]

      from.position = toAfter.position + 0.001 + payload.delta

      sortedEntities(state.entities).forEach((entity, idx) => {
        state.entities[entity.id].position = idx + 1 + payload.delta
      })
    },
  },
})

const documentActions = document.actions

export { document, documentActions }
