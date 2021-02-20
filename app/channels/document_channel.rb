class DocumentChannel < ApplicationCable::Channel
  def subscribed
    @document = Document.find(params[:document_id])
    @client_id = params[:client_id]

    Rails.logger.info("DocumentChannel subscribed, should receive stream from:")
    Rails.logger.info("  #{broadcast_key}")
    Rails.logger.info("  #{client_key}")

    stream_from broadcast_key
    stream_from client_key
  end

  def request_operations_since(data)
    Rails.logger.info("DocumentChannel operations since #{data}")
    send_operations_since(data["version"])
  end

  # { type: ActionType, payload: ActionPayload, version: number }
  def submit(data)
    Rails.logger.info(
      "DocumentChannel submit #{data} with handle on #{@document}",
    )

    # always apply on fresh @document
    @document.reload

    operation = @document.generate_operation(data)

    Rails.logger.info("DocumentChannel operation #{operation}")

    Operation.transaction do
      operation.save!
      @document.apply(operation)
      @document.save!
    end

    ActionCable.server.broadcast(
      client_key,
      { type: "ack", message: operation },
    )
    ActionCable.server.broadcast(
      broadcast_key,
      { type: "op", client_id: @client_id, message: [operation] },
    )
  rescue => e
    Rails.logger.error("[channel error] #{e.message}")
    Rails.logger.error(e.backtrace[0..4].join("\n"))
    ActionCable.server.broadcast(
      client_key,
      {
        type: "error",
        message: "#{e.message} #{e.backtrace[0..4].join("\n  ")}",
      },
    )
  end

  private

  def send_operations_since(version)
    operations =
      @document.operations.where("version >= ?", version).order("version")
    Rails.logger.info(
      "send_operations_since(#{version}) => #{operations.length} ops",
    )
    # ActionCable.server.broadcast(
    #   client_key,
    #   { type: "op", message: operations.map(&:as_json) },
    # )
  end

  def broadcast_key
    "document:#{@document.id}:operations"
  end

  def client_key
    "document:#{@document.id}:operations_#{@client_id}"
  end
end
