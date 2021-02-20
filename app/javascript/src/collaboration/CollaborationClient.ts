import * as cuid from 'cuid'
import { DocumentChannel } from '../channels'
import { Operation, VersionedOperation } from '../channels/DocumentChannel'
import { transform } from './transform'

type Timers = {
  operation?: ReturnType<typeof window.setTimeout> | null
}

export class CollaborationClient {
  me: string
  channel: DocumentChannel
  version: number
  pending: Operation[] = []
  inflight: Operation = null
  timers: Timers = {}
  onReceivedCallback: (operation: Operation) => void
  onAllOperationsAcknowledgedCallback: (version: number) => void

  constructor({ onOperationReceived, onAllOperationsAcknowledged }) {
    this.me = cuid()

    this.onReceivedCallback = onOperationReceived
    this.onAllOperationsAcknowledgedCallback = onAllOperationsAcknowledged
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log('%c[CollaborationClient]', 'color: #ace', ...args)
  }

  isMappedOperation(actionType: string) {
    return ['document/insert', 'document/remove'].indexOf(actionType) > -1
  }

  connect(documentId: string, initialVersion: number) {
    this.version = initialVersion
    this.connectOperationsChannel(documentId, initialVersion)
  }

  connectOperationsChannel(documentId, initialVersion) {
    const channel = new DocumentChannel({
      clientId: this.me,
      documentId,
      onReceived: this.onReceived,
      onAcknowledged: this.onAcknowledged,
      onError: this.onError,
    })

    channel.connect(
      () => {
        // onConnected
        this.channel = channel
        this.channel.requestOperationsSince(initialVersion)
        this.log('CollaborationClient channel connected')
      },
      () => {
        // onDisconnected
        this.channel = null
        this.log('CollaborationClient channel disconnected')
      }
    )
  }

  submitOperations(operations: Operation[]) {
    this.log('submit ops', operations)
    this.enqueue(operations)
    if (!this.timers.operation) {
      this.timers.operation = setTimeout(this.submitNextOperation, 10)
    }
  }

  enqueue(operations: Operation[]) {
    this.pending = operations
  }

  submitNextOperation = () => {
    clearTimeout(this.timers.operation)
    this.timers.operation = null

    if (this.inflight) return
    if (this.pending.length === 0) return

    if (!this.channel) {
      // wait until connection establishes
      this.timers.operation = setTimeout(this.submitNextOperation, 100)
      return
    }

    this.inflight = this.pending[0]
    this.channel.submit({
      ...this.inflight,
      version: this.version,
    })
  }

  // Another client has sent us operations. This is where we find the "Transform"
  // step of operational transform.
  onReceived = (operations: VersionedOperation[]) => {
    this.log('received', operations)
    operations = operations.filter((op) => op.version >= this.version)
    if (operations.length === 0) return

    const firstVersion = operations[0].version
    const lastVersion = operations[operations.length - 1].version

    // We can only transform their operations against our operations
    // if both sets start from the same document version.
    this.log('versions', { other: firstVersion, self: this.version })
    if (firstVersion !== this.version) {
      this.log(
        'received operations past expected version, requesting older operations'
      )
      this.channel.requestOperationsSince(this.version)
      return
    }

    const [newOurs, newTheirs] = transform(this.pending, operations)
    this.pending = newOurs

    newTheirs.forEach((operation) => this.onReceivedCallback(operation))

    this.updateVersion(lastVersion + 1)

    // Catch up on anything else new, that we may have ignored because
    // we didn't have the right version. We could be more efficient by
    // storing every operation we've received, in order, so we don't
    // need to request it again, but this works fine for a demo app.
    this.channel.requestOperationsSince(this.version)
  }

  updateVersion(version: number) {
    this.log('version', version)
    this.version = version
  }

  onAcknowledged = (operation: VersionedOperation) => {
    this.log('acknowedged', operation)
    this.inflight = null
    this.pending.shift()

    this.updateVersion(operation.version + 1)

    if (this.pending.length > 0) {
      this.submitNextOperation()
    } else {
      this.timers.operation = null
      this.onAllOperationsAcknowledgedCallback(this.version)
    }
  }

  onError(message: string) {
    // eslint-disable-next-line no-console
    console.error('[CollaborationClient] error', message)
  }
}
