# do we need OT if we can boil operations down to :insert and :remove?

class Operation
  attr_reader :kind, :payload
  def initialize(kind, payload)
    @kind = kind
    @payload = payload
  end
end

def operation(type, payload = nil)
  Operation.new(type, payload)
end

def apply(op, doc)
  payload = op.payload
  if op.kind == :insert
    doc[payload[:id]] = payload
  elsif op.kind == :remove
    doc.delete(payload[:id])
  end
end

CHARS = %w[a b c d e f g h i j k l m n o p q]

def create_operation
  operation(
    rand > 0.5 ? :insert : :remove,
    { id: CHARS.sample, text: CHARS.sample },
  )
end

def transform_operation(ours, theirs, tiebreak)
  if ours.payload[:id] == theirs.payload[:id]
    if (
         (ours.kind == :remove && theirs.kind == :insert) ||
           (ours.kind == :insert && theirs.kind == :remove)
       ) && tiebreak
      return theirs
    elsif (ours.kind == :insert && theirs.kind == :insert)
      return(
        Operation.new(
          ours.kind,
          {
            id: ours.payload[:id],
            text:
              if tiebreak
                ours.payload[:text] + theirs.payload[:text]
              else
                theirs.payload[:text] + ours.payload[:text]
              end,
          },
        )
      )
    end
  end

  ours
end

def transform(left, top)
  # left and top must always be an
  left = Array(left)
  top = Array(top)

  return left, top if left.empty? || top.empty?

  if left.length == 1 && top.length == 1
    right = transform_operation(left.first, top.first, true)
    bottom = transform_operation(top.first, left.first, false)
    return Array(right), Array(bottom)
  end

  right = []
  bottom = []

  left.each do |left_op|
    # keep resetting bottom to empty until all left ops are consumed
    bottom = []

    top.each do |top_op|
      right_op, bottom_op = transform(left_op, top_op)
      left_op = right_op
      bottom.concat(bottom_op)
    end

    right.concat(left_op)
    top = bottom
  end

  [right, bottom]
end

1000.times do
  left = [create_operation]
  top = [create_operation]

  right, bottom = transform(left, top)

  doc1 = {}
  doc2 = {}

  # TP1 says:
  # - If you have two documents with the same state
  # - And you apply the first operation followed by the transformed second
  #   operation
  # - You will end up with the same document as if you applied the second
  #   operation followed by the transformed first operation.

  # travelling left then bottom should produce the same document as top then right
  (left + bottom).each { |op| apply(op, doc1) }
  (top + right).each { |op| apply(op, doc2) }

  result = doc1 == doc2

  # we're looking for a pair of transformations that break TP1
  if !result
    puts "left #{left}, top #{top}, right #{right}, bottom #{bottom}"
    puts "doc1 #{doc1}, doc2 #{doc2}"
    puts "---"
  end
end
