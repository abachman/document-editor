import { InsertOperation } from './../channels/DocumentChannel'
import { Operation } from '../channels/DocumentChannel'
import { documentActions } from '../store/document'

// git@github.com:aha-app/collaborative-demo.git
export function transform(
  ourOperations: Operation[],
  theirOperations: Operation[]
) {
  if (ourOperations.length === 0 || theirOperations.length === 0) {
    return [ourOperations, theirOperations]
  }

  if (ourOperations.length === 1 && theirOperations.length === 1) {
    // the actual transform step
    return [
      toArray(transformOperation(ourOperations[0], theirOperations[0], true)),
      toArray(transformOperation(theirOperations[0], ourOperations[0], false)),
    ]
  }

  const left = ourOperations
  let top = theirOperations
  let right = []
  let bottom = []

  left.forEach((leftOp) => {
    let transformedOp: Operation | Operation[] = leftOp
    bottom = []

    top.forEach((topOp) => {
      const [rightOp, bottomOp] = transform(
        toArray(transformedOp),
        toArray(topOp)
      )
      transformedOp = rightOp
      bottom = bottom.concat(bottomOp)
    })

    right = right.concat(transformedOp)
    top = bottom
  })

  return [right, bottom]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArray(value: Operation[] | Operation | unknown): Array<any> {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

const rem = documentActions.remove.type
const ins = documentActions.insert.type
const reo = documentActions.reorder.type

const removeInsert = (ta: string, tb: string) => {
  return (ta === rem && tb === ins) || (ta === ins && tb === rem)
}

const transformOperation = (
  left: Operation,
  right: Operation,
  tiebreak: boolean
): Operation => {
  if (left.payload.id === right.payload.id) {
    if (removeInsert(left.type, right.type) && tiebreak) {
      return right
    } else if (left.type === ins && right.type === ins) {
      left = left as InsertOperation
      right = right as InsertOperation
      return {
        type: left.type,
        payload: {
          ...left.payload,
          content: tiebreak
            ? left.payload.content + right.payload.content
            : right.payload.content + left.payload.content,
        },
      }
    }
  } else if (left.type === reo && right.type === reo) {
    // left first
    return left
  }

  return left
}
