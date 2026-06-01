/* eslint-disable no-undef */

exports.up = (pgm) => {
  pgm.createTable('vendors', {
    id: 'id',
    name:            { type: 'varchar(255)', notNull: true },
    salutation:      { type: 'varchar(20)' },
    first_name:      { type: 'varchar(100)' },
    last_name:       { type: 'varchar(100)' },
    company_name:    { type: 'varchar(255)' },
    contact_person:  { type: 'varchar(255)' },
    email:           { type: 'varchar(255)' },
    phone:           { type: 'varchar(50)' },
    mobile:          { type: 'varchar(50)' },
    work_phone:      { type: 'varchar(50)' },
    address:         { type: 'text' },
    pan:             { type: 'varchar(50)' },
    currency:        { type: 'varchar(20)', default: 'INR' },
    payment_terms:   { type: 'varchar(100)', default: 'Due on Receipt' },
    opening_balance: { type: 'numeric(12,2)', default: 0.00 },
    payables:        { type: 'numeric(12,2)', default: 0.00 },
    unused_credits:  { type: 'numeric(12,2)', default: 0.00 },
    notes:           { type: 'text' },
    created_at:      { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Seed sample vendors
  pgm.sql(`
    INSERT INTO vendors (name, company_name, email, phone, currency, payment_terms) VALUES
      ('Camera Services Inc',     'Camera Services',  'accounts@cameraservices.com', '+919876500001', 'INR', 'Net 30'),
      ('LightEquip Repairs',      'LightEquip',       'repairs@lightequip.com',      '+919876500002', 'INR', 'Net 15'),
      ('Studio Supplies Co',      'Studio Supplies',  'billing@studiosupplies.com',  '+919876500003', 'INR', 'Due on Receipt'),
      ('AudioGear Wholesale',     'AudioGear',        'sales@audiogear.com',         '+919876500004', 'INR', 'Net 30'),
      ('TechParts Distributors',  'TechParts',        'orders@techparts.com',        '+919876500005', 'INR', 'Net 15');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('vendors', { ifExists: true, cascade: true });
};