package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi"
	_ "github.com/go-sql-driver/mysql"
)

type Quote struct {
	ID     int    `json:"id"`
	Author string `json:"author"`
	Text   string `json:"quote"`
}

var db *sql.DB

func main() {
	var err error
	// Replace USERNAME, PASSWORD, DBNAME with your credentials
	db, err = sql.Open("mysql", "USERNAME:PASSWORD@tcp(127.0.0.1:3306)/DBNAME")
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	r := chi.NewRouter()
	r.Get("/random-quote", GetRandomQuote)

	http.ListenAndServe(":8080", r)
}

func GetRandomQuote(w http.ResponseWriter, r *http.Request) {
	var q Quote
	err := db.QueryRow("SELECT id, author, quote FROM quotes ORDER BY RAND() LIMIT 1").Scan(&q.ID, &q.Author, &q.Text)
	if err != nil {
		http.Error(w, "Failed to fetch quote", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(q)
}
