class Document < ApplicationRecord
  has_many :operations

  def generate_operation(payload)
    Operation.new(
      document: self,
      operation_type: payload["type"],
      version: version,
      payload: payload["payload"],
    )
  end

  def apply(operation)
    self.data ||= { "entities" => {} }
    payload = operation.payload

    case operation.operation_type
    when "document/insert"
      data["entities"][payload["id"]] = payload
    when "document/remove"
      data["entities"].delete(payload["id"])
    when "document/reorder"
      from_id = payload.dig("active", "id")
      to_after_id = payload.dig("over", "id")

      data["entities"][from_id]["position"] =
        data["entities"][to_after_id]["position"] + 0.001 +
          payload["delta"].to_i

      balance
    else
      Rails
        .logger.error "failed to apply operation #{operation.to_json} to document"
      raise "failed document.apply on operation #{operation.id} #{operation.as_json}"
    end

    self.version = operation.version + 1
    self
  end

  def balance
    # reorder and reset positions of remaining entities
    data["entities"].values.sort do |a, b|
      a["position"] <=> b["position"]
    end.each_with_index { |entity, idx| entity["position"] = idx + 1 }
  end
end
