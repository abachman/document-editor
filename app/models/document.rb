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
    entity = operation.payload

    case operation.operation_type
    when "document/insert"
      data["entities"][entity["id"]] = entity
    when "document/remove"
      data["entities"].delete(entity["id"])
    else
      Rails
        .logger.error "failed to apply operation #{operation.to_json} to document"
      raise "failed document.apply on operation #{operation.id} #{operation.as_json}"
    end

    self.version = operation.version + 1
    self
  end
end
