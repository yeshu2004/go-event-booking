package main

import (
	"context"
	"log"

	"github.com/yeshu2004/go-event-booking/service/nats"
)

func main() {
	ctx := context.Background()

	natsIns, err := nats.NewNATSIns()
	if err != nil {
		log.Fatal(err)
	}

	// Safe to call (idempotent)
	if err := natsIns.CreateBookingStream(ctx); err != nil {
		log.Fatal("stream creation failed:", err)
	}

	if err := natsIns.CreateBookingConsumer(ctx); err != nil {
		log.Fatal("consumer creation failed:", err)
	}


	log.Println("Booking worker started")
	if err := natsIns.ConsumeBookingEvent(ctx); err != nil {
		log.Fatal(err)
	}
}