package models

import "time"

type Organization struct {
	Id          int64     `json:"id" db:"id"`
	OrgName     string    `json:"org_name" db:"org_name"`
	Email       string    `json:"email" db:"email"`
	Password    string    `json:"password" db:"password"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
