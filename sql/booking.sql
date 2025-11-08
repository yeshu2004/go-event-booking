CREATE TABLE IF NOT EXISTS booking (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    event_id  INT NOT NULL,
    user_id   INT NOT NULL,
    seats     INT NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, just for testing user_id is by random fake.
    INDEX idx_event (event_id),
    -- INDEX idx_user (user_id)
);