class AddVersionToDocuments < ActiveRecord::Migration[6.1]
  def change
    add_column :documents, :version, :integer, default: 0
  end
end
