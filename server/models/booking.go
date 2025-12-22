package models

import "time"

type Booking struct {
	Id       int64     `json:"id" db:"id"`
	EventId  int64     `json:"event_id" db:"event_id"`
	UserId   int64     `json:"user_id" db:"user_id"`
	Seats    int64     `json:"seats" db:"seats"`
	BookedAt time.Time `json:"booked_at" db:"booked_at"`
}

type UserBookings struct {
	Id        int64     `json:"id" db:"id"`
	EventId   int64     `json:"event_id" db:"event_id"`
	UserId    int64     `json:"user_id" db:"user_id"`
	BookedAt  time.Time `json:"booked_at" db:"booked_at"`
	EventName string    `json:"name" db:"name"`
	Date      time.Time `json:"date" db:"date"`
	City      string    `json:"city" db:"city"`
}
