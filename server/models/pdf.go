package models

import "time"

type PDFContent struct {
	UserName      string
	UserEmail     string
	EventName     string
	EventDateTime time.Time
	SeatsBooked   int
}
