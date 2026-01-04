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
	natsIns.CreateBookingStream(ctx)
	natsIns.CreateBookingConsumer(ctx)

	log.Println("Booking worker started")
	if err := natsIns.ConsumeBookingEvent(ctx); err != nil {
		log.Fatal(err)
	}
}