module ApplicationCable
  class Connection < ActionCable::Connection::Base
    rescue_from StandardError, with: :report_error

    def connect
      Rails.logger.info("connection received")
    end

    private

    def report_error(e)
      Rails.logger.error("cable failed")
      Rails.logger.error(e.message)
      Rails.logger.error(e.backtrace[0..10].join("\n"))
    end
  end
end
