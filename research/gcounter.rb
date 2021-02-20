class GCounter
  attr_reader :client_id, :state

  def initialize(client_id)
    @client_id = client_id
    @state = {}
  end

  def value()
    state.values.sum
  end

  def increment()
    state[client_id] ||= 0
    state[client_id] += 1
  end

  def merge(other)
    # all keys i know about
    state.keys.each do |mykey|
      state[mykey] = [other.state[mykey], state[mykey]].compact.max
    end

    # all keys other knows about
    other
      .state
      .keys
      .each do |okey|
        state[okey] = [other.state[okey], state[okey]].compact.max
      end
  end

  def replicate(other)
    merge(other)
    other.merge(self)
  end

  def to_s
    client_id + " => { " +
      state.keys.sort.map { |k| format("%2s:%4i", k, state[k]) }.join(", ") +
      " }"
  end
end

db = GCounter.new "db"

a = GCounter.new "a"
b = GCounter.new "b"
c = GCounter.new "c"
d = GCounter.new "d"
e = GCounter.new "e"

cs = [a, b, c, d, e]

TIMES = 40

TIMES.times do
  actor = cs.sample
  actor.increment
  print actor.client_id
end
puts

cs.each do |client|
  puts client
  db.merge(client)
end

puts "DB SEES VALUE: #{db.value}"
