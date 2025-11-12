package models

type OrgWithEvents struct {
	Organization Organization `json:"organization"`
	Events       []Event      `json:"events"`
}
