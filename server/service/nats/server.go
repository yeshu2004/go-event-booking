package nats

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/yeshu2004/go-event-booking/models"
	pdf "github.com/yeshu2004/go-event-booking/service/pdf"
)

type NATSIns struct {
	js jetstream.JetStream
}

// connecting to nats server -- running on docker
func NewNATSIns() (*NATSIns, error) {
	nc, err := nats.Connect(nats.DefaultURL)
	if err != nil {
		return nil, fmt.Errorf("nats connection error: %w", err)
	}

	// jetstream instance
	js, err := jetstream.New(nc)
	if err != nil {
		return nil, fmt.Errorf("jetstream error: %w", err)
	}

	return &NATSIns{js: js}, nil
}

func (n *NATSIns) CreateBookingStream(ctx context.Context) error {
	_, err := n.js.CreateStream(ctx, jetstream.StreamConfig{
		Name:        "BOOKINGS",
		Description: "Booking Ticket events",
		Subjects:    []string{"BOOKING.*"},
		Storage:     jetstream.FileStorage, // on disk storage
		Retention:   jetstream.WorkQueuePolicy,
		Discard:     jetstream.DiscardOld, // remove old message when old
		MaxAge:      24 * time.Hour,
		MaxMsgs:     -1, // unlimit
		MaxBytes:    -1,
	})

	if err != nil && err != jetstream.ErrStreamNameAlreadyInUse {
		return fmt.Errorf("create stream error: %w", err)
	}

	return nil
}

// PublishBooingEvent is used to publish booking event into nats stream
func (n *NATSIns) PublishBookingEvent(ctx context.Context, bookingID int, payload []byte) error {
	_, err := n.js.Publish(ctx, "BOOKING.new", payload, jetstream.WithMsgID(fmt.Sprintf("booking-%d", bookingID)))
	if err != nil {
		return fmt.Errorf("error in publishing new booking event: %v", err)
	}
	return nil
}

func (n *NATSIns) CreateBookingConsumer(ctx context.Context) error {
	_, err := n.js.CreateOrUpdateConsumer(ctx, "BOOKINGS", jetstream.ConsumerConfig{
		Name:    "booking-worker",
		Durable: "booking-worker",

		AckPolicy: jetstream.AckExplicitPolicy,
		AckWait:   30 * time.Second,

		DeliverPolicy: jetstream.DeliverAllPolicy,
		ReplayPolicy:  jetstream.ReplayInstantPolicy,

		MaxDeliver:    5, // retry 5 times
		FilterSubject: "BOOKING.new",

		MaxAckPending: 1,
	})

	if err != nil {
		return fmt.Errorf("consumer creation error: %w", err)
	}

	return nil
}

// ConsumeBookingEvent is used to consume events from nats stream defined
func (n *NATSIns) ConsumeBookingEvent(ctx context.Context) error {
	c, err := n.js.Consumer(ctx, "BOOKINGS", "booking-worker")
	if err != nil {
		return fmt.Errorf("get consumer error: %w", err)
	}

	for {
		msgs, err := c.Fetch(1, jetstream.FetchMaxWait(5*time.Second))
		if err != nil {
			if err == jetstream.ErrNoMessages {
				continue
			}
			log.Println("fetch error:", err)
			continue
		}

		for msg := range msgs.Messages() {
			if err := processBookingMessage(msg.Data()); err != nil {
				log.Printf("error in processing message data: %v", err)
				_ = msg.NakWithDelay(10 * time.Second)  // negative acknowledges i.e message not consumed
				continue      // do not block
			}

			msg.Ack() // acknowledges i.e message consumed
		}
	}
}

// helper function to process the msg data from consumers
func processBookingMessage(msg []byte) error {
	log.Printf("Processing booking message: %s", string(msg))

	var data models.PDFContent
	if err := json.Unmarshal(msg, &data); err != nil {
		return err
	}

	return pdf.GeneratePDF(&data);
}
