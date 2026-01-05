package models

import "time"

type Event struct {
	Id             int64     `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	OrgId          int64     `json:"org_id" db:"org_id"`
	OrganizedBy    string    `json:"organized_by" db:"organized_by"`
	Key            string    `json:"key" db:"image_key"`
	Visible        string    `json:"visible" db:"visible"`
	Capacity       int64     `json:"capacity" db:"capacity"`
	SeatsAvailable int64     `json:"seats_available" db:"seats_available"`
	Date           time.Time `json:"date" db:"date"`
	Address        string    `json:"address" db:"address"`
	City           string    `json:"city" db:"city"`
	State          string    `json:"state" db:"state"`
	Country        string    `json:"country" db:"country"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type EventResponse struct {
	EventID          int       `json:"id"`
	EventName        string    `json:"name"`
	ImageURL         string    `json:"image_url"`
	OrganizationID   int       `json:"org_id"`
	OrganizationName string    `json:"organized_by"`
	EventDate        time.Time `json:"date"`
	City             string    `json:"city"`
}

type EventCache struct {
	EventID          int       `json:"id" db:"id"`
	EventName        string    `json:"name" db:"name"`
	EventKey         string    `json:"key" db:"image_key"`
	EventDate        time.Time `json:"date" db:"date"`
	City             string    `json:"city" db:"city"`
	OrganizationID   int       `json:"org_id" db:"org_id"`
	OrganizationName string    `json:"organized_by" db:"organized_by"`
	// ImageUrl string
}

type UpdateEventRequest struct {
	Name     string    `json:"name"`
	DateTime time.Time `json:"date_time"`
	Address  string    `json:"address"`
	City     string    `json:"city"`
	State    string    `json:"state"`
	Country  string    `json:"country"`
	Capacity int       `json:"capacity"`
	Visible  string    `json:"visible"`
}
