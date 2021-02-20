//
// Goal: multi-user collaborative document editing.
//

import { Router } from '@reach/router'
import { DocumentEditor } from './components/DocumentEditor'
import { Viewer } from './components/Viewer'

import './stylesheets/application.scss'

export const App = () => {
  return (
    <Router>
      <DocumentEditor path="/edit" default />
      <Viewer path="/view" />
    </Router>
  )
}
