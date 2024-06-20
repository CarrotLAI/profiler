CREATE DATABASE biodata;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255)
);
CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
    birth_date VARCHAR(255)
);
CREATE TABLE address(
    id SERIAL PRIMARY KEY NOT NULL,
    user_id INT,
    street VARCHAR(255),
    city VARCHAR(255),
    province VARCHAR(255),
    zip_code VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);