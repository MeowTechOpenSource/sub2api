package domain

// HappyHourEvent defines one daily promotional-rate window in server time.
type HappyHourEvent struct {
	ID             string  `json:"id,omitempty"`
	Name           string  `json:"name"`
	Enabled        bool    `json:"enabled"`
	Start          string  `json:"start"`
	End            string  `json:"end"`
	RateMultiplier float64 `json:"rate_multiplier"`
}
