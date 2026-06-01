/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('customers', {
    id: 'id',
    customer_id:    { type: 'varchar(20)' },
    name:           { type: 'varchar(255)', notNull: true },
    email:          { type: 'varchar(255)' },
    phone:          { type: 'varchar(20)' },
    address:        { type: 'text' },
    city:           { type: 'varchar(100)' },
    state:          { type: 'varchar(255)', default: '' },
    country:        { type: 'varchar(100)' },
    id_number:      { type: 'varchar(100)' },
    notes:          { type: 'text' },
    status:         { type: 'varchar(50)', default: 'active' },
    balance:        { type: 'numeric(12,2)', default: 0.00 },
    active_rentals: { type: 'integer', default: 0 },
    is_deleted:     { type: 'boolean', default: false },
    deleted_at:     { type: 'timestamp' },
    created_at:     { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample customers
  pgm.sql(`
    INSERT INTO customers (name, email, phone, city, state, country, status) VALUES
      ('Saji Joseph',        'saji@example.com',    '+919876543210', 'Kochi',              'Kerala',      'India', 'active'),
      ('Mrs. Simran Suresh', 'simran@example.com',  '+919876543211', 'Thiruvananthapuram', 'Kerala',      'India', 'active'),
      ('Anand Kumar',        'anand@example.com',   '+919876543212', 'Bangalore',          'Karnataka',   'India', 'active'),
      ('Priya Menon',        'priya@example.com',   '+919876543213', 'Chennai',            'Tamil Nadu',  'India', 'active'),
      ('Rajesh Nair',        'rajesh@example.com',  '+919876543214', 'Kozhikode',          'Kerala',      'India', 'active'),
      ('Anjali Pillai',      'anjali@example.com',  '+919876543215', 'Mumbai',             'Maharashtra', 'India', 'active'),
      ('Karthik Reddy',      'karthik@example.com', '+919876543216', 'Hyderabad',          'Telangana',   'India', 'active');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('customers', { ifExists: true, cascade: true });
};