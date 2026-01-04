package models

import "time"

type PDFContent struct {
	BookingID     int
	UserName      string
	UserEmail     string
	EventName     string
	EventDateTime time.Time
	SeatsBooked   int
}
