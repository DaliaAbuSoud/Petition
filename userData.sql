DROP TABLE IF EXISTS userdata;

CREATE TABLE userdata (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR NOT NULL CHECK (firstName != ''),
    lastName VARCHAR NOT NULL CHECK (lastName != ''),
    city VARCHAR NOT NULL CHECK (city != ''),
    country VARCHAR NOT NULL CHECK (country != ''),
    signatureUrl VARCHAR NOT NULL CHECK (signatureUrl != ''),
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);