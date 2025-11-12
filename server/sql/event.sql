
CREATE TABLE event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    org_id INT NOT NULL,
    organized_by VARCHAR(200) NOT NULL,
    capacity INT NOT NULL CHECK (capacity >= 0),
    seats_available INT NOT NULL CHECK (seats_available >= 0),
    date TIMESTAMP NOT NULL,
    address VARCHAR(200) NOT NULL,
    city VARCHAR(200) NOT NULL,
    state VARCHAR(200) NOT NULL,
    country VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organization(id) ON DELETE CASCADE, 
    CONSTRAINT chk_seats CHECK (seats_available <= capacity)
);

DELIMITER //
CREATE TRIGGER trg_event_set_seats
BEFORE INSERT ON event
FOR EACH ROW
BEGIN
    IF NEW.seats_available IS NULL OR NEW.seats_available = 0 THEN
        SET NEW.seats_available = NEW.capacity;
    END IF;
END//
DELIMITER ;