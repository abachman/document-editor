import { Link, RouteComponentProps } from '@reach/router'
import { shallowEqual, useDispatch } from 'react-redux'
import { useTypedSelector } from '../store'
import {
  EntityKind,
  createEntity,
  insertOp,
  sortedEntities,
  reorderOp,
  documentActions,
} from '../store/document'
import { EntityEditor } from './EntityEditor'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DocumentEditor = (props: RouteComponentProps) => {
  const dispatch = useDispatch()
  const [hl, setHl] = useState<string | null>(null)

  const document = useTypedSelector((state) => {
    const sorted = sortedEntities(state.document.entities)
    return sorted.map((entity) => entity.id)
  }, shallowEqual)

  return (
    <div className="editor">
      <h1>{window.DOCUMENT.name}</h1>

      <DndContext
        onDragEnd={(evt: DragEndEvent) => {
          console.log(evt)
          setHl(evt.over.id)
          dispatch(
            documentActions.reorder({
              active: evt.active,
              over: evt.over,
              delta: evt.delta.y > 0 ? 0 : -1,
            })
          )
        }}
      >
        <SortableContext items={document}>
          {document.map((id, i) => {
            return <EntityEditor key={id} id={id} index={i} hl={hl === id} />
          })}
        </SortableContext>
      </DndContext>

      <div className="controls">
        <button
          type="button"
          onClick={() => dispatch(insertOp(createEntity(EntityKind.Question)))}
        >
          Add Question
        </button>
        <button
          type="button"
          onClick={() => dispatch(insertOp(createEntity(EntityKind.Note)))}
        >
          Add Note
        </button>
      </div>

      <div className="footer">
        <Link to="/view">View</Link>
      </div>
    </div>
  )
}
