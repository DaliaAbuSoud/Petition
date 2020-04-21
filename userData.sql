DROP TABLE IF EXISTS userdata;

CREATE TABLE userdata (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR NOT NULL CHECK (firstName != ''),
    lastName VARCHAR NOT NULL CHECK (lastName != ''),
    email VARCHAR NOT NULL CHECK (email != ''),
    hashedPass BYTEA NOT NULL CHECK (hashedPass != ''),
    city VARCHAR,
    country VARCHAR,
    age VARCHAR,
    signatureUrl VARCHAR,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);