import CollaborationClient from './CollaborationClient'

class CollaborativeDocument {
  constructor(documentId, content, onChange) {
    this.content = content
    this.onChange = onChange
    this.id = documentId
  }

  startCollaborating(version) {
    this.collaborationClient = new CollaborationClient({
      onOperationReceived: this._receivedOperation,
      allOperationsAcknowledged: this._allOperationsAcknowledged,
    })
    this.collaborationClient.connect(this, version)
  }

  perform(operation, allowUndo = true) {
    if (!operation) return

    this._apply(operation)

    if (this.collaborationClient) {
      this.collaborationClient.submitOperations([operation])
    }

    if (allowUndo) {
      this.undoStack.performedOperation(operation)
    }
  }

  undo() {
    if (this.undoStack.canUndo) {
      this.perform(this.undoStack.popUndoItem(), false)
    }
  }

  redo() {
    if (this.undoStack.canRedo) {
      this.perform(this.undoStack.popRedoItem(), false)
    }
  }

  _change() {
    this.onChange && this.onChange(this)
  }

  // receive and update from remote operation
  _receivedOperation = (operation) => {
    this._apply(operation)
  }

  // Apply an operation to the current document's content. After this
  // function runs, content should take the new operation into
  // account, and offset should also be adjusted to take the new
  // offset into account.
  _apply(operation) {
    const { content } = this
    const { kind, data } = operation

    switch (kind) {
      case 'insert': {
        const { offset, text } = data
        let newContent = content.substring(0, offset) + text

        if (offset < content.length) {
          newContent += content.substring(offset)
        }

        this.content = newContent
        break
      }
      case 'remove': {
        const { offset, text } = data
        let newContent = content.substring(0, offset)

        if (offset + text.length < content.length) {
          newContent += content.substring(offset + text.length)
        }
        this.content = newContent
        break
      }
    }

    this._change()
    return this
  }

  _allOperationsAcknowledged() {
    // this.collaborationClient && this.collaborationClient.setOffset(this.offset);
  }
}

export default CollaborativeDocument
