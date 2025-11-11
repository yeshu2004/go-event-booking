CREATE TABLE subscription(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    org_id INT NOT NULL,
    subscribed BOOLEAN DEFAULT FALSE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    FOREIGN KEY (user_id) REFERENCES user(id) on DELETE CASCADE
    FOREIGN KEY (currentUser) REFERENCES organization(id) on DELETE CASCADE
    UNIQUE (user_id, org_id)
)

