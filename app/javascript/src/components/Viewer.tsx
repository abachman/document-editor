import { Link, RouteComponentProps } from '@reach/router'
import { shallowEqual } from 'react-redux'
import { useTypedSelector } from '../store'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Viewer = (props: RouteComponentProps) => {
  const entities = useTypedSelector(
    (state) => state.document.entities,
    shallowEqual
  )

  return (
    <div className="viewer">
      <h1>Viewer</h1>
      {JSON.stringify(entities)}
      <div className="footer">
        <Link to="/">Edit</Link>
      </div>
    </div>
  )
}
