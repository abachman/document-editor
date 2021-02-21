import { Link, RouteComponentProps } from '@reach/router'
import { shallowEqual, useDispatch } from 'react-redux'
import { useTypedSelector } from '../store'
import { EntityKind, createEntity, insertOp } from '../store/document'
import { EntityEditor } from './EntityEditor'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DocumentEditor = (props: RouteComponentProps) => {
  const dispatch = useDispatch()
  const document = useTypedSelector((state) => {
    const sorted = Object.values(state.document.entities).sort((a, b) => {
      if (a.id > b.id) return 1
      else if (a.id === b.id) return 0
      else return -1
    })
    return sorted.map((entity) => entity.id)
  }, shallowEqual)

  return (
    <div className="editor">
      <h1>{window.DOCUMENT.name}</h1>

      {document.map((id) => {
        return <EntityEditor key={id} id={id} />
      })}

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
