# cable/config.ru
require_relative "../config/environment"
Rails.application.eager_load!

logger = ActiveSupport::Logger.new($stdout)
ActionCable.server.config.logger = ActiveSupport::TaggedLogging.new(logger)

run ActionCable.server
