package mail

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"

	"github.com/yeshu2004/go-event-booking/models"
)

func SendMail(data models.PDFContent, fileLink string) error {
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	smtpUser := os.Getenv("ADMIN_MAIL")
	smtpPass := os.Getenv("ADMIN_PASSWORD")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("smtp credentials missing")
	}

	to := []string{data.UserEmail}
	subject := fmt.Sprintf(`Your Ticket Is Confirmed | Booking %d`, data.BookingID)
	body := fmt.Sprintf(`
Hello %s,

Your ticket has been successfully booked! 

Event: %s
Date & Time: %s
Booking ID: %d
Seats: %d

You can download your ticket receipt using the link below:
%s

For security reasons, this link expires in 48 hours.
If the download link has expired, you can log in to your account and download your ticket anytime.
		
Please keep this receipt with you during the event.
If you have any questions, feel free to reply to this email.

Best regards,
Ticket One Team
`,
		data.UserName,
		data.EventName,
		data.EventDateTime.Format("02 Jan 2006, 03:04 PM"),
		data.BookingID,
		data.SeatsBooked,
		fileLink,
	)

	m := fmt.Sprintf("To: %v\r\n"+"Subject: %v\r\n"+"\r\n"+"%v\r\n", to, subject, body)

	msg := []byte(m)

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	return smtp.SendMail(fmt.Sprintf("%s:%d", smtpHost, smtpPort), auth, smtpUser, to, msg)
}

func SendEditEventMail(toEmail string, data models.EventEditedPayload) error {
	smtpHost := "smtp.gmail.com"
	smtpPort := 587
	smtpUser := os.Getenv("ADMIN_MAIL")
	smtpPass := os.Getenv("ADMIN_PASSWORD")

	if smtpUser == "" || smtpPass == "" {
		return fmt.Errorf("smtp credentials missing")
	}

	to := data.To
	subject := fmt.Sprintf("Important Update for Event #%d", data.EventID)
	var body strings.Builder
	body.WriteString("Hello,\n\n")
	body.WriteString("There have been important updates to an event you booked:\n\n")

	for _, change := range data.Changes {
		body.WriteString(fmt.Sprintf(
			"- %s\n  From: %s\n  To:   %s\n\n",
			formatChangeType(change.Type),
			change.Old,
			change.New,
		))
	}

	body.WriteString("Your original ticket PDF remains valid.\n")
	body.WriteString("Please make note of these changes before attending.\n\n")
	body.WriteString("— Team TicketOne\n")

	m := fmt.Sprintf("To: %v\r\n"+"Subject: %v\r\n"+"\r\n"+"%v\r\n", to, subject, body.String())

	msg := []byte(m);
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	return smtp.SendMail(fmt.Sprintf("%s:%d", smtpHost, smtpPort), auth, smtpUser, []string{toEmail}, msg)
}

func formatChangeType(t models.EventChangeType) string {
	switch t {
	case models.EventDateChanged:
		return "Event Date & Time Changed"
	case models.EventNameChanged:
		return "Event Name Changed"
	case models.EventLocationChanged:
		return "Event Location Changed"
	default:
		return "Event Updated"
	}
}
