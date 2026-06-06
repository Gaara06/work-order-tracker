CREATE DATABASE IF NOT EXISTS work_order_tracker;

USE work_order_tracker;

DROP TABLE IF EXISTS work_orders;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30)
);

CREATE TABLE work_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO customers (name, email, phone) VALUES
('John Smith', 'john@example.com', '571-111-2222'),
('Maria Garcia', 'maria@example.com', '571-333-4444'),
('Robert Johnson', 'robert@example.com', '571-555-6666');

INSERT INTO work_orders (customer_id, title, description, status) VALUES
(1, 'Fix leaking sink', 'Customer reported water leaking under the kitchen sink.', 'New'),
(2, 'Install ceiling fan', 'Install new ceiling fan in living room.', 'In Progress'),
(3, 'Repair garage door', 'Garage door does not open correctly.', 'Done'),
(1, 'Replace light switch', 'Replace broken light switch in hallway.', 'New'),
(2, 'Paint office wall', 'Paint one small office wall.', 'In Progress');