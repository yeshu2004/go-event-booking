package models

import "time"

type Event struct {
	Id          int64     `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	OrganizedBy string    `json:"organizedBy" db:"organizedBy"`
	Capacity    int64     `json:"capacity" db:"capacity"`
	Date        time.Time `json:"date" db:"date"`
	Address     string    `json:"address" db:"address"`
	City        string    `json:"city" db:"city"`
	State       string    `json:"state" db:"state"`
	Country     string    `json:"country" db:"country"`
}