import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTypedSelector } from '../store'
import { documentActions, EntityKind, insertOp } from '../store/document'

interface EntityEditorProps {
  id: string
}

export const EntityEditor = (props: EntityEditorProps) => {
  const dispatch = useDispatch()
  const entity = useTypedSelector((state) => state.document.entities[props.id])
  const [value, setValue] = useState(entity.content)

  useEffect(() => {
    setValue(entity.content)
  }, [entity.content])

  return (
    <div className={`form ${entity.kind}`}>
      <label htmlFor={`entity-${entity.id}`}>
        {entity.kind === EntityKind.Note ? 'N:' : 'Q:'}
      </label>
      <input
        type="text"
        id={`entity-${entity.id}`}
        value={value}
        onChange={(evt) => setValue(evt.target.value)}
        onBlur={() =>
          dispatch(
            insertOp({
              id: props.id,
              kind: entity.kind,
              content: value,
            })
          )
        }
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
