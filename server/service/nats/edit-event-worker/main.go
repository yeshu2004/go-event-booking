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

	if err := natsIns.CreateEventStream(ctx); err != nil {
		log.Fatal(err)
	}

	if err := natsIns.CreateEditEventConsumer(ctx); err != nil {
		log.Fatal(err)
	}

	
	if err := natsIns.ConsumeEditEvent(ctx); err != nil {
		log.Fatal(err)
	}
	log.Println("Event worker started")
}
