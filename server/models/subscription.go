package models

import "time"

type Subscription struct {
	Id         int64     `json:"id" db:"id"`
	UserId     int64     `json:"user_id" db:"user_id"`
	OrgId      int64     `json:"org_id" db:"org_id"`
	Subscribed bool      `json:"subscribed" db:"subscribed"`
	Subscribed_at time.Time `json:"subscribed_at" db:"subscribed_at"`
}
