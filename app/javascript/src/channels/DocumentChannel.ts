import { DocumentEntity } from './../store/document'
import { Action } from '@reduxjs/toolkit'
import consumer from './consumer'

/* eslint-disable no-this */
function channelCallbacks(
  channelClass: DocumentChannel,
  onConnected: () => void,
  onDisconnected: () => void
) {
  return {
    connected: () => {
      channelClass.log('[channelCallbacks] connected')
      onConnected()
    },
    disconnected: () => {
      channelClass.log('[channelCallbacks] disconnected')
      onDisconnected()
    },
    rejected: () => {
      channelClass.log('[channelCallbacks] rejected')
    },
    received: (
      data: AcknowledgementMessage | OperationMessage | ErrorMessage
    ) => {
      switch (data.type) {
        case 'op':
          return channelClass.onOperation(data, data.client_id)
        case 'ack':
          return channelClass.onAcknowledgement(data)
        case 'error':
          return channelClass._error(data.message)
        default:
          this.warn(`Can't process message with unrecognized type`, data)
      }
    },
  }
}

type OperationAPI = {
  id: number
  document_id: number
  operation_type: Action['type']
  payload: Operation
  version: number
  created_at: string
  updated_at: string
}

type AcknowledgementMessage = {
  type: 'ack'
  message: OperationAPI
}

type OperationMessage = {
  type: 'op'
  message: OperationAPI[]
  client_id: string
}

type ErrorMessage = {
  type: 'error'
  message: string
}

type Remoteish = {
  _remote: boolean
}

export type InsertOperation = {
  type: 'document/insert'
  payload: DocumentEntity & Remoteish
}

export type RemoveOperation = {
  type: 'document/remove'
  payload: Pick<DocumentEntity, 'id'> & Remoteish
}

// same as Redux PayloadAction<any> for all the actions we care about
export type Operation = InsertOperation | RemoveOperation

export type VersionedOperation = Operation & {
  version: number
}

export default class DocumentChannel {
  channel = null

  clientId: string
  documentId: number
  receivedCallback: (operations: Operation[]) => void
  acknowledgedCallback: (operation: Operation) => void
  errorCallback: (message: string) => void

  constructor({ clientId, documentId, onReceived, onAcknowledged, onError }) {
    this.clientId = clientId
    this.documentId = documentId
    this.receivedCallback = onReceived
    this.acknowledgedCallback = onAcknowledged
    this.errorCallback = onError

    this.log('channel ready', this.clientId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log('%c[DocumentChannel]', 'color: #cae', ...args)
  }

  connect(onConnected: () => void, onDisconnected: () => void) {
    this.log('connecting...')
    this.channel = consumer.subscriptions.create(
      {
        channel: 'DocumentChannel',
        client_id: this.clientId,
        document_id: this.documentId,
      },
      channelCallbacks(this, onConnected, onDisconnected)
    )
  }

  submit(action: VersionedOperation) {
    this.channel.perform('submit', action)
  }

  requestOperationsSince(version: number) {
    this.channel.perform('request_operations_since', { version })
  }

  _error(data) {
    this.errorCallback && this.errorCallback(data)
  }

  onOperation(data: OperationMessage, clientId: string) {
    // ignore our own operations
    if (clientId === this.clientId) return
    this.receivedCallback &&
      this.receivedCallback(data.message.map(this.toVersionedOperation))
  }

  toVersionedOperation(op: OperationAPI): VersionedOperation {
    return {
      type: op.operation_type,
      payload: op.payload,
      version: op.version,
    }
  }

  onAcknowledgement(data: AcknowledgementMessage) {
    this.log('DocumentChannel ack', data)
    this.acknowledgedCallback &&
      this.acknowledgedCallback(this.toVersionedOperation(data.message))
  }
}
