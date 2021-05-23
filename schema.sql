DROP TABLE IF EXISTS jobstable;
CREATE TABLE jobstable(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    url VARCHAR(255),
    description TEXT
)