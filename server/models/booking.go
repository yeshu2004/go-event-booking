package models

import "time"

// db level
type Booking struct {
	Id       int64     `json:"id" db:"id"`
	EventId  int64     `json:"event_id" db:"event_id"`
	UserId   int64     `json:"user_id" db:"user_id"`
	Seats    int64     `json:"seats" db:"seats"`
	BookedAt time.Time `json:"booked_at" db:"booked_at"`
}

// incoming client format
type BookingRequest struct {
	// user id and event id will be taken from auth token and url param respectively
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	UserPhone string `json:"user_phone"`
	EventName string `json:"event_name"`
	DateTime  string `json:"date_time"`
	Seats     int64  `json:"seats"`
}

// profile section etc
type UserBookings struct {
	Id        int64     `json:"id"`
	EventId   int64     `json:"event_id"`
	Seats     int64     `json:"seats"`
	Status string `json:"status"`
	UserId    int64     `json:"user_id"`
	BookedAt  time.Time `json:"booked_at"`
	EventName string    `json:"name"`
	Date      time.Time `json:"date"`
	City      string    `json:"city"`
}
