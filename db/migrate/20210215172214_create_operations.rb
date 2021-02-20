class CreateOperations < ActiveRecord::Migration[6.1]
  def change
    create_table :operations do |t|
      t.references :document, null: false, foreign_key: true
      t.string :operation_type
      t.jsonb :payload
      t.integer :version

      t.timestamps
    end
  end
end
