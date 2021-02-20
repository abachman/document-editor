// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `bin/rails generate channel` command.

import * as ActionCable from '@rails/actioncable'

ActionCable.logger.enabled = false

export default ActionCable.createConsumer('ws://localhost:5100')
