package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	 "github.com/yeshu2004/go-event-booking/models"
)



type Handler struct {
	db *sql.DB
}

func welcomeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "hi welcome",
	})
}

func (h *Handler) createEventHandler(c *gin.Context) {
	var newEvent models.Event

	if err := c.ShouldBind(&newEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid input: " + err.Error(),
		})
		return
	}

	createEventQuery := "INSERT INTO event (name, organizedBy, capacity, date, address, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
	res, err := h.db.Exec(createEventQuery, newEvent.Name, newEvent.OrganizedBy, newEvent.Capacity, newEvent.Date, newEvent.Address, newEvent.City, newEvent.State, newEvent.Country)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	id, err := res.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to retrieve event ID: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "event created successfully",
		"event": gin.H{
			"id":          id,
			"name":        newEvent.Name,
			"organizedBy": newEvent.OrganizedBy,
			"capacity":    newEvent.Capacity,
			"date":        newEvent.Date,
			"address":     newEvent.Address,
			"city":        newEvent.City,
			"state":       newEvent.State,
			"county":      newEvent.Country,
		},
	})
}

func (h *Handler) listEventHandler(c *gin.Context) {
	var allEvents []models.Event

	showQuery := "SELECT * FROM event"
	rows, err := h.db.Query(showQuery)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var event models.Event
		if err := rows.Scan(&event.Id, &event.Name, &event.OrganizedBy, &event.Capacity, &event.Date, &event.Address, &event.City, &event.State, &event.Country); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to scan rows:" + err.Error(),
			})
			return
		}
		allEvents = append(allEvents, event)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "events retrieved",
		"events":  allEvents,
	})
}

// TODO: pagination(limit & offset), wrong city
func (h *Handler) getEventByCityHandler(c *gin.Context) {
	city := c.Query("city")
	if city == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "city is required"})
		return
	}

	query := "SELECT * FROM event WHERE city = ?"
	rows, err := h.db.Query(query, city)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var events []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(&e.Id, &e.Name, &e.OrganizedBy, &e.Capacity, &e.Date, &e.Address, &e.City, &e.State, &e.Country); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "row scan error:" + err.Error(),
			})
			return
		}
		events = append(events, e)
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "retrived events by city",
		"events":  events,
	})

}

func (h *Handler) getEventByIdHandler(c *gin.Context) {
	strId := c.Param("id")
	if strId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "event ID is required",
		})
		return
	}

	id, err := strconv.Atoi(strId) //into int (from string)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	query := "SELECT * FROM event WHERE id = ?"
	row := h.db.QueryRow(query, id)
	var event models.Event
	if err := row.Scan(&event.Id, &event.Name, &event.OrganizedBy, &event.Capacity, &event.Date, &event.Address, &event.City, &event.State, &event.Country); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "row scan error:" + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("found event by id:%v", event.Id),
		"event": event,
	})

}

func main() {
	// Connection to Database.
	db, err := connectDb()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	h := &Handler{db: db}

	// read event.sql file and create table or can be done through workbench,
	// but multiple sql commands in one file will fail.
	// sqlfile, err := os.ReadFile("event.sql")
	// if err != nil {
	// 	log.Fatalf("failed to read event.sql file: %v", err)
	// }

	// _, err = db.Exec(string(sqlfile))
	// if err != nil {
	// 	log.Fatalf("failed to execute SQL: %v", err)
	// }

	defer db.Close()

	router := gin.Default()
	router.GET("/", welcomeHandler)
	router.POST("/api/create-event", h.createEventHandler)
	router.GET("/api/list-events", h.listEventHandler) // list all events
	// list event by city
	router.GET("/api/events/search", h.getEventByCityHandler)
	router.GET("/api/event/:id", h.getEventByIdHandler)

	router.Run()
}

// helper function to connect to db.
func connectDb() (*sql.DB, error) {
	if err := godotenv.Load(".env"); err != nil {
		return nil, fmt.Errorf("error loading .env file: %v", err)
	}

	cfg := mysql.NewConfig()
	cfg.User = os.Getenv("DBUSER")
	cfg.Passwd = os.Getenv("DBPASS")
	cfg.Net = "tcp"
	cfg.Addr = "127.0.0.1:3306"
	cfg.DBName = "eventBooking"
	cfg.ParseTime = true

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		return nil, fmt.Errorf("error opening database: %v", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("error pinging database: %v", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Connected to SQL Database!")

	return db, nil
}
