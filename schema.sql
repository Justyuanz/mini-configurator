--   mysql -u root -p < schema.sql
CREATE DATABASE harbor;
USE harbor;

CREATE TABLE products (
  id              VARCHAR(20)    PRIMARY KEY,
  name            VARCHAR(50)    NOT NULL,
  kind            VARCHAR(10)    NOT NULL,     -- 'fuel' | 'addon'
  price           DECIMAL(12,2)  NOT NULL,     -- 12 digits total, 2 after the point: up to 9,999,999,999.99
  kw_per_cylinder INT            NULL,
  tier            VARCHAR(20)    NULL
);

CREATE TABLE vessels (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  min_engines INT NOT NULL
);

CREATE TABLE cylinder_options (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  count       INT NOT NULL,
  price_extra DECIMAL(12,2) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE
);

-- Which add-on works with which fuel (many-to-many).
CREATE TABLE addon_fuels (
  addon_id VARCHAR(20) NOT NULL,
  fuel_id  VARCHAR(20) NOT NULL,
  PRIMARY KEY (addon_id, fuel_id),
  FOREIGN KEY (addon_id) REFERENCES products(id),
  FOREIGN KEY (fuel_id)  REFERENCES products(id)
);

CREATE TABLE quotes (
  id       INT          AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(100) NOT NULL
);

CREATE TABLE quote_items (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  quote_id   INT         NOT NULL,
  product_id VARCHAR(20) NOT NULL,
  qty        INT         NOT NULL,
  FOREIGN KEY (quote_id)   REFERENCES quotes(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);


-- seed data
INSERT INTO products (id, name, kind, price, kw_per_cylinder, tier) VALUES
  ('diesel',     'Diesel',            'fuel',  400000, 300,  'IMO Tier II'),
  ('lng',        'LNG',               'fuel',  520000, 290,  'IMO Tier III'),
  ('methanol',   'Methanol',          'fuel',  560000, 280,  'IMO Tier II'),
  ('hybrid',     'Battery hybrid',    'addon', 250000, NULL, NULL),
  ('scrubber',   'Exhaust scrubber',  'addon', 180000, NULL, NULL),
  ('monitoring', 'Remote monitoring', 'addon',  40000, NULL, NULL);

INSERT INTO addon_fuels (addon_id, fuel_id) VALUES
  ('hybrid',     'diesel'),
  ('hybrid',     'lng'),
  ('hybrid',     'methanol'),
  ('monitoring', 'diesel'),
  ('monitoring', 'lng'),
  ('monitoring', 'methanol'),
  ('scrubber',   'diesel');

INSERT INTO vessels (id, name, min_engines) VALUES
  ('ferry',  'Ferry',  1),
  ('cargo',  'Cargo',  1),
  ('cruise', 'Cruise', 2);

INSERT INTO cylinder_options (id, name, count, price_extra, is_default) VALUES
  ('6', '6 cylinders', 6, 0,      TRUE),
  ('8', '8 cylinders', 8, 90000,  FALSE),
  ('9', '9 cylinders', 9, 140000, FALSE);
