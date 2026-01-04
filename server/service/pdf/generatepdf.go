package pdf

import (
	"fmt"
	"log"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/yeshu2004/go-event-booking/models"
)

func GeneratePDF(bookingData *models.PDFContent) (string, error) {
	formattedTime := "N/A"
	if !bookingData.EventDateTime.IsZero() {
		formattedTime = bookingData.EventDateTime.Format("02 Jan 2006, 03:04 PM")
	}

	pdf := gofpdf.New("p", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Helvetica", "", 16)

	letter := fmt.Sprintf(`
	
	Hello %s,

	Thank you for booking your ticket with us!
	We're happy to confirm that your booking has been successfully completed.

	Booking Details:
	- Event Name: %s
	- Date & Time: %s
	- Seats Booked: %d

	Please keep this email as your booking confirmation. 
	You can also access and download your receipt anytime from the My Bookings section in your profile
	If you have any questions or need further assistance, feel free to contact our support team.
	
	We look forward to seeing you at the event!
	Best regards,
	Ticket One Team`, bookingData.UserName, bookingData.EventName, formattedTime, bookingData.SeatsBooked)

	pdf.MultiCell(0, 10, letter, "", "L", false)
	log.Printf("PDF generated for booking %v", bookingData)

	fileName := fmt.Sprintf("%d_event_ticket_%d.pdf", time.Now().UnixNano(), bookingData.BookingID)

	return fileName, pdf.OutputFileAndClose(fileName)
}