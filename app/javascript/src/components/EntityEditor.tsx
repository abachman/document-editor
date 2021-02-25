import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../store'
import { documentActions, EntityKind, updateOp } from '../store/document'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface EntityEditorProps {
  id: string
  index: number
  hl: boolean
}

export const EntityEditor = (props: EntityEditorProps) => {
  const dispatch = useDispatch()
  const entity = useTypedSelector((state) => state.document.entities[props.id])
  const [value, setValue] = useState(entity.content)

  useEffect(() => {
    setValue(entity.content)
  }, [entity.content])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: props.hl ? 'inset 0 2px 0 #f00' : 'inset 0 0 0 transparent',
  }

  return (
    <div
      className={`form ${entity.kind}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <label htmlFor={`entity-${entity.id}`} {...listeners}>
        {entity.kind === EntityKind.Note ? 'N:' : 'Q:'}
      </label>
      <input
        type="text"
        id={`entity-${entity.id}`}
        value={value}
        onChange={(evt) => setValue(evt.target.value)}
        onBlur={() => {
          dispatch(
            updateOp({
              ...entity,
              content: value,
            })
          )
        }}
      />
      <button
        type="button"
        onClick={() => dispatch(documentActions.remove({ id: props.id }))}
      >
        Remove
      </button>
    </div>
  )
}
