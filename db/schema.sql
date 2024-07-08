CREATE DB hrdb

USE hrdb

CREATE TABLE department (
    id INT PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE role (
    id INT PRIMARY KEY,
    title VARCHAR NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id INT PRIMARY KEY,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);
