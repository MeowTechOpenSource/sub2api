package service

import (
	"context"
	"testing"
	"time"
)

type balanceCreditExpiryRepoStub struct {
	userIDs []int64
	now     time.Time
}

func (s *balanceCreditExpiryRepoStub) ListExpiringBalanceCredits(context.Context, int64, int) ([]BalanceCreditExpiry, error) {
	return nil, nil
}

func (s *balanceCreditExpiryRepoStub) SweepExpiredBalanceCredits(_ context.Context, now time.Time) ([]int64, error) {
	s.now = now
	return s.userIDs, nil
}

type balanceCreditAuthCacheStub struct{ userIDs []int64 }

func (*balanceCreditAuthCacheStub) InvalidateAuthCacheByKey(context.Context, string) {}
func (s *balanceCreditAuthCacheStub) InvalidateAuthCacheByUserID(_ context.Context, userID int64) {
	s.userIDs = append(s.userIDs, userID)
}
func (*balanceCreditAuthCacheStub) InvalidateAuthCacheByGroupID(context.Context, int64) {}

type balanceCreditBillingCacheStub struct{ userIDs []int64 }

func (s *balanceCreditBillingCacheStub) InvalidateUserBalance(_ context.Context, userID int64) error {
	s.userIDs = append(s.userIDs, userID)
	return nil
}

func TestBalanceCreditExpiryServiceRunOnceInvalidatesAffectedUsers(t *testing.T) {
	repo := &balanceCreditExpiryRepoStub{userIDs: []int64{7, 9}}
	authCache := &balanceCreditAuthCacheStub{}
	billingCache := &balanceCreditBillingCacheStub{}
	svc := NewBalanceCreditExpiryService(repo, authCache, billingCache, time.Minute)

	svc.runOnce()

	if repo.now.IsZero() {
		t.Fatal("expected expiry sweep to run")
	}
	if len(authCache.userIDs) != 2 || authCache.userIDs[0] != 7 || authCache.userIDs[1] != 9 {
		t.Fatalf("unexpected auth cache invalidations: %v", authCache.userIDs)
	}
	if len(billingCache.userIDs) != 2 || billingCache.userIDs[0] != 7 || billingCache.userIDs[1] != 9 {
		t.Fatalf("unexpected billing cache invalidations: %v", billingCache.userIDs)
	}
}
