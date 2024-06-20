CREATE DATABASE biodata;

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
    birth_date DATE,
);

CREATE TABLE address(
    id INT PRIMARY KEY,
	users_id INT UNIQUE,
    street VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip_code VARCHAR(255),
    FOREIGN KEY (users.id) REFERENCES users(id)
);