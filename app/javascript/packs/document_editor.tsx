// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.

import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { App } from '../src/App'
import { store } from '../src/store'

function start() {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.body.appendChild(document.createElement('div'))
  )
}

document.addEventListener('turbolinks:load', start)
