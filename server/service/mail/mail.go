package mail

import (
	"fmt"
	"net/smtp"
	"os"
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
