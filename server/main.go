package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
	"github.com/yeshu2004/go-event-booking/models"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	db *sql.DB
}

type AuthInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// for user
func (h *Handler) middleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authorization header is missing",
		})
		c.Abort()
		return
	}

	authToken := strings.Split(authHeader, " ")
	if len(authToken) != 2 || authToken[0] != "Bearer" || authToken[1] == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
		c.Abort()
		return
	}

	tokenStr := authToken[1]
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid or expired token",
		})
		c.Abort()
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		c.Abort()
		return
	}

	if float64(time.Now().Unix()) > claims["expiry_time"].(float64) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "token expired",
		})
		c.Abort()
		return
	}

	var user models.User
	query := "SELECT * FROM user WHERE ID = ?"
	if err := h.db.QueryRow(query, claims["id"]).Scan(&user.Id, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		c.Abort()
		return
	}

	c.Set("current_user", user)
	c.Next()
}

// for user
func (h *Handler) createUser(c *gin.Context) {
	var authInput models.User

	if err := c.ShouldBindBodyWithJSON(&authInput); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "json bind error:" + err.Error(),
		})
		return
	}
	log.Println(authInput)

	var exists bool
	if err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM user WHERE email = ?)", authInput.Email).Scan(&exists); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error: " + err.Error(),
		})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"error": "user already exists with this email",
		})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(authInput.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
	}

	var user models.User
	user.FirstName = authInput.FirstName
	user.LastName = authInput.LastName
	user.Email = authInput.Email
	user.Password = string(hashPassword)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	query := "INSERT INTO user (first_name, last_name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
	res, err := h.db.Exec(query, &user.FirstName, &user.LastName, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "error registering user:" + err.Error(),
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

	user.Id = id
	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("created user with id:%v", id),
		"data": gin.H{
			"id":         user.Id,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"email":      user.Email,
		},
	})
}

// for user
func (h *Handler) loginUser(c *gin.Context) {
	var authInput AuthInput
	if err := c.ShouldBindBodyWithJSON(&authInput); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var user models.User
	err := h.db.QueryRow("SELECT id, email, password, first_name, last_name FROM user WHERE email = ?",
		authInput.Email).Scan(&user.Id, &user.Email, &user.Password, &user.FirstName, &user.LastName)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "database error: " + err.Error(),
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(authInput.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":          user.Id,
		"expiry_time": time.Now().Add(time.Hour * 2).Unix(),
	})
	secret := os.Getenv("SECRET")
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to generate token"})
	}
	log.Println("while login", tokenString)

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"data": gin.H{
			"id":        user.Id,
			"full_name": user.FirstName + " " + user.LastName,
			"email":     user.Email,
			"token":     tokenString,
		},
	})

}

// for user
func (h *Handler) subscribeHandler(c *gin.Context) {
	// get id from middlware
	currentUser, exists := c.Get("current_user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found in context",
		})
		return
	}
	user := currentUser.(models.User)

	orgStrId := c.Param("org_id")
	orgId, err := strconv.Atoi(orgStrId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid Organization ID",
		})
		return
	}

	query := "INSERT INTO subscription (user_id, org_id, subscribed, subscribed_at) VALUES (?, ?, ?, ?)"
	if _, err = h.db.Exec(query, user.Id, orgId, true, time.Now()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "subscription err: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "subscribed to event successfully",
		"data": gin.H{
			"user_id": user.Id,
			"org_id":  orgId,
		},
	})

}

// for organization
func (h *Handler) createOrganization(c *gin.Context) {
	var authInput models.Organization
	if err := c.ShouldBindJSON(&authInput); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "json bind error:" + err.Error(),
		})
		return
	}

	var exists bool
	if err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM organization WHERE email = ?)", authInput.Email).Scan(&exists); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error: " + err.Error(),
		})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"error": "organization already exists with this email",
		})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(authInput.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var org models.Organization
	org.OrgName = authInput.OrgName
	org.Email = authInput.Email
	org.Password = string(hashPassword)
	org.Description = authInput.Description
	org.CreatedAt = time.Now()

	query := "INSERT INTO organization (org_name, email, password, description, created_at) VALUES (?, ?, ?, ?, ?)"
	rows, err := h.db.Exec(query, org.OrgName, org.Email, org.Password, org.Description, org.CreatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	id, err := rows.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("created organization with id:%v", id),
		"data": gin.H{
			"id":         id,
			"org_name":   org.OrgName,
			"created_at": org.CreatedAt,
		},
	})

}

// for organization
func (h *Handler) loginOrganization(c *gin.Context) {
	var authInput AuthInput
	if err := c.ShouldBindBodyWithJSON(&authInput); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var org models.Organization
	err := h.db.QueryRow("SELECT id, org_name, email, password, description FROM organization WHERE email = ?",
		authInput.Email).Scan(&org.Id, &org.OrgName, &org.Email, &org.Password, &org.Description)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "database error: " + err.Error(),
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(org.Password), []byte(authInput.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid email or password",
		})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":          org.Id,
		"expiry_time": time.Now().Add(time.Hour * 2).Unix(),
	})
	secret := os.Getenv("ORG_SECRET")
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to generate token"})
	}
	log.Println("while login", tokenString)

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"data": gin.H{
			"id":       org.Id,
			"org_name": org.OrgName,
			"email":    org.Email,
			"token":    tokenString,
		},
	})

}

// for organization
func (h *Handler) orgMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authorization header is missing",
		})
		c.Abort()
		return
	}

	authToken := strings.Split(authHeader, " ")
	if len(authToken) != 2 || authToken[0] != "Bearer" || authToken[1] == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
		c.Abort()
		return
	}

	tokenStr := authToken[1]
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(os.Getenv("ORG_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid or expired token",
		})
		c.Abort()
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid token",
		})
		c.Abort()
		return
	}

	if float64(time.Now().Unix()) > claims["expiry_time"].(float64) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "token expired",
		})
		c.Abort()
		return
	}

	var org models.Organization
	query := "SELECT id, org_name, email, password, description, created_at FROM organization WHERE ID = ?"
	if err := h.db.QueryRow(query, claims["id"]).Scan(&org.Id, &org.OrgName, &org.Email, &org.Password, &org.Description, &org.CreatedAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		c.Abort()
		return
	}

	c.Set("current_org", org)
	c.Next()
}

// for organization
func (h *Handler) createEventHandler(c *gin.Context) {
	// get org info thrugh org-middleware
	currOrg, exists := c.Get("current_org")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found in context",
		})
		return
	}

	org := currOrg.(models.Organization)

	var newEvent models.Event

	if err := c.ShouldBind(&newEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid input: " + err.Error(),
		})
		return
	}

	newEvent.Name = strings.TrimSpace(newEvent.Name)
	newEvent.Address = strings.TrimSpace(newEvent.Address)
	newEvent.City = strings.TrimSpace(newEvent.City)
	newEvent.State = strings.TrimSpace(newEvent.State)
	newEvent.Country = strings.TrimSpace(newEvent.Country)
	newEvent.Name = strings.TrimSpace(newEvent.Name)

	query := "INSERT INTO event (name, org_id, organized_by, capacity, date, address, city, state, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	res, err := h.db.Exec(query, newEvent.Name, org.Id, org.OrgName, newEvent.Capacity, newEvent.Date, newEvent.Address, newEvent.City, newEvent.State, newEvent.Country)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		"data": gin.H{
			"id":              id,
			"name":            newEvent.Name,
			"orgId":           org.Id,
			"organizedBy":     org.OrgName,
			"capacity":        newEvent.Capacity,
			"seats_available": newEvent.Capacity,
			"date":            newEvent.Date,
			"address":         newEvent.Address,
			"city":            newEvent.City,
			"state":           newEvent.State,
			"county":          newEvent.Country,
		},
	})
}

func (h *Handler) aboutOrganization(c *gin.Context) {
	strId := c.Param("id")
	orgId, err := strconv.Atoi(strId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var org models.Organization
	orgQuery := "SELECT org_name, email, description, created_at FROM organization WHERE id = ?"
	if err = h.db.QueryRow(orgQuery, orgId).Scan(&org.OrgName, &org.Email, &org.Description, &org.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch organization"})
		return
	}

	eventQuery := "SELECT id, name, date, city, state, country, created_at FROM event WHERE org_id = ?"
	rows, err := h.db.Query(eventQuery, orgId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch events:" + err.Error(),
		})
		return
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(&e.Id, &e.Name, &e.Date, &e.City, &e.State, &e.Country, &e.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to scan event:" + err.Error(),
			})
			return
		}
		events = append(events, e)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "successful",
		"data": gin.H{
			"organization": org,
			"events":       events,
		},
	})
}

// for user
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
		if err := rows.Scan(&event.Id, &event.Name, &event.OrgId, &event.OrganizedBy, &event.Capacity, &event.SeatsAvailable, &event.Date, &event.Address, &event.City, &event.State, &event.Country, &event.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to scan rows:" + err.Error(),
			})
			return
		}
		allEvents = append(allEvents, event)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "events retrieved",
		"data":    allEvents,
	})
}

// TODO: pagination(limit & offset), wrong city
func (h *Handler) getEventByCityHandler(c *gin.Context) {
	s := strings.TrimSpace(c.Param("city"))
	state := strings.ToTitle(s)

	q := "SELECT * FROM event WHERE city = ?"
	rows, err := h.db.Query(q, state)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var events []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(&e.Id, &e.Name, &e.OrgId, &e.OrganizedBy, &e.Capacity, &e.SeatsAvailable, &e.Date, &e.Address, &e.City, &e.State, &e.Country, &e.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "row scan error:" + err.Error(),
			})
			return
		}
		events = append(events, e)
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "retrived events by city",
		"data":    events,
	})
}

func (h *Handler) getUpcomingEventCityHandler(c *gin.Context) {
	city := c.Query("city")
	exclude := c.Query("exclude")
	excludeId, err := strconv.Atoi(exclude)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("wrong event id(%s) type, should be int", exclude),
		})
		return
	}

	query := "SELECT * FROM event WHERE city = ? AND id != ? ORDER BY date ASC LIMIT 6"
	rows, err := h.db.Query(query, city, excludeId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	var events []models.Event
	for rows.Next() {
		var e models.Event
		if err := rows.Scan(&e.Id, &e.Name, &e.OrgId, &e.OrganizedBy, &e.Capacity, &e.SeatsAvailable, &e.Date, &e.Address, &e.City, &e.State, &e.Country, &e.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "row scan error:" + err.Error(),
			})
			return
		}
		events = append(events, e)
	}

	if len(events) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("No upcoming events found for city: %v", city),
			"data":    []interface{}{},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("served upcoming events by city excluding (%v)", exclude),
		"data":    events,
	})

}

func (h *Handler) getSeatsAvailabilityByEvent(c *gin.Context) {
	i := c.Param("id")
	id, err := strconv.Atoi(i)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	query := "SELECT seats_available FROM event WHERE id = ?";
	var seats int
	if err := h.db.QueryRow(query, id).Scan(&seats); err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "seats retrived!",
		"data": seats,
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
	if err := row.Scan(&event.Id, &event.Name, &event.OrgId, &event.OrganizedBy, &event.Capacity, &event.SeatsAvailable, &event.Date, &event.Address, &event.City, &event.State, &event.Country, &event.CreatedAt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "row scan error:" + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("found event by id:%v", event.Id),
		"data":    event,
	})

}

// route: /api/book-seats/:event_id
func (h *Handler) bookSeatForEvent(c *gin.Context) {
	// fetch the event_id from the params.
	stringId := c.Param("event_id")
	eventId, err := strconv.Atoi(stringId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
	}

	// user_id will be through middleware but for rn, let's
	// get this as random id to proccess the seats.
	userId := int64(1)

	var b models.Booking
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "json binding error:" + err.Error(),
		})
		return
	}

	if b.Seats <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "seats must be > 0"})
		return
	}

	tx, err := h.db.BeginTx(c, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "begainTx err:" + err.Error(),
		})
	}
	// incase if any failure in between.
	defer tx.Rollback()

	//check if we do have enough seats_available.
	var enough bool
	if err := tx.QueryRowContext(c, "SELECT (seats_available >= ?) FROM event WHERE id = ?", b.Seats, eventId).Scan(&enough); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "no such event exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	if !enough {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "not enough seats available",
		})
		return
	}

	// update the event seats_available
	query := "UPDATE event SET seats_available = seats_available - ? WHERE id = ?"
	_, err = tx.ExecContext(c, query, b.Seats, eventId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
	}

	//  insert record in booking table
	query = "INSERT INTO booking (event_id, user_id, seats) VALUES (?, ?, ?)"
	res, err := tx.ExecContext(c, query, eventId, userId, b.Seats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
	}

	bookingID, _ := res.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "seat booked successfully",
		"data": gin.H{
			"booking_id": bookingID,
			"event_id":   eventId,
			"user_id":    userId,
			"seats":      b.Seats,
		},
	})

}

func welcomeHandler(c *gin.Context) {
	time.Sleep(time.Second * 5)
	c.JSON(http.StatusOK, gin.H{
		"message": "hi welcome to event booking platform, created to learn :)",
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
	// sqlfile, err := os.ReadFile("sql/event.sql")
	// if err != nil {
	// 	log.Fatalf("failed to read event.sql file: %v", err)
	// }

	// _, err = db.Exec(string(sqlfile))
	// if err != nil {
	// 	log.Fatalf("failed to execute SQL: %v", err)
	// }

	defer db.Close()

	gin.SetMode(gin.DebugMode)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(gin.Logger())
	router.GET("/", welcomeHandler)

	router.POST("/api/auth/organization/register", h.createOrganization)    // working
	router.POST("/api/auth/organization/login", h.loginOrganization)        // working
	router.POST("/api/create-event", h.orgMiddleware, h.createEventHandler) // working
	router.POST("/api/subscribe", h.orgMiddleware, h.subscribeHandler)      // TODO

	router.POST("/api/auth/sign-in", h.createUser)             // working
	router.POST("/api/auth/login", h.loginUser)                // working
	router.GET("/api/events", h.listEventHandler)              // working
	router.GET("/about/organization/:id", h.aboutOrganization) // working
	router.GET("/api/event/:id", h.getEventByIdHandler)        // working
	router.GET("/api/events/upcoming", h.getUpcomingEventCityHandler) //working
	router.GET("/api/event/seats/:id", h.getSeatsAvailabilityByEvent) //working

	router.GET("/api/events/:city", h.getEventByCityHandler)
	router.POST("/api/book-seats/:event_id", h.bookSeatForEvent)

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
