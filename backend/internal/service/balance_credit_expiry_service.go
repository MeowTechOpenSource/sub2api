package service

import (
	"context"
	"log"
	"sync"
	"time"
)

// BalanceCreditExpiryService reconciles expiring balance grants even when the
// affected user is idle. Request-time reconciliation remains the fallback.
type BalanceCreditExpiryService struct {
	repo                 BalanceCreditExpiryRepository
	authCacheInvalidator APIKeyAuthCacheInvalidator
	billingCache         BalanceCacheInvalidator
	interval             time.Duration
	stopCh               chan struct{}
	stopOnce             sync.Once
	wg                   sync.WaitGroup
}

type BalanceCacheInvalidator interface {
	InvalidateUserBalance(ctx context.Context, userID int64) error
}

func NewBalanceCreditExpiryService(
	repo BalanceCreditExpiryRepository,
	authCacheInvalidator APIKeyAuthCacheInvalidator,
	billingCache BalanceCacheInvalidator,
	interval time.Duration,
) *BalanceCreditExpiryService {
	return &BalanceCreditExpiryService{
		repo:                 repo,
		authCacheInvalidator: authCacheInvalidator,
		billingCache:         billingCache,
		interval:             interval,
		stopCh:               make(chan struct{}),
	}
}

func (s *BalanceCreditExpiryService) Start() {
	if s == nil || s.repo == nil || s.interval <= 0 {
		return
	}
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		ticker := time.NewTicker(s.interval)
		defer ticker.Stop()
		s.runOnce()
		for {
			select {
			case <-ticker.C:
				s.runOnce()
			case <-s.stopCh:
				return
			}
		}
	}()
}

func (s *BalanceCreditExpiryService) Stop() {
	if s == nil {
		return
	}
	s.stopOnce.Do(func() { close(s.stopCh) })
	s.wg.Wait()
}

func (s *BalanceCreditExpiryService) runOnce() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userIDs, err := s.repo.SweepExpiredBalanceCredits(ctx, time.Now())
	if err != nil {
		log.Printf("[BalanceCreditExpiry] sweep failed: %v", err)
		return
	}
	for _, userID := range userIDs {
		if s.authCacheInvalidator != nil {
			s.authCacheInvalidator.InvalidateAuthCacheByUserID(ctx, userID)
		}
		if s.billingCache != nil {
			if err := s.billingCache.InvalidateUserBalance(ctx, userID); err != nil {
				log.Printf("[BalanceCreditExpiry] invalidate balance cache for user %d failed: %v", userID, err)
			}
		}
	}
	if len(userIDs) > 0 {
		log.Printf("[BalanceCreditExpiry] expired grants for %d users", len(userIDs))
	}
}
