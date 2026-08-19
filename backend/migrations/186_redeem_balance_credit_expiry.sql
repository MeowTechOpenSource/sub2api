-- Track the unspent portion of balance issued by an expiring redeem code.
-- Aggregate users.balance remains the authorization/billing source of truth;
-- this table provides the per-redemption expiry allocation.
CREATE TABLE IF NOT EXISTS user_redeem_balance_credits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redeem_code_id BIGINT NOT NULL UNIQUE REFERENCES redeem_codes(id) ON DELETE CASCADE,
    original_amount DECIMAL(20,8) NOT NULL CHECK (original_amount > 0),
    remaining_amount DECIMAL(20,8) NOT NULL CHECK (remaining_amount >= 0),
    expires_at TIMESTAMPTZ NOT NULL,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (remaining_amount <= original_amount)
);

CREATE INDEX IF NOT EXISTS idx_user_redeem_balance_credits_expiry
    ON user_redeem_balance_credits (user_id, expires_at, id)
    WHERE remaining_amount > 0;

CREATE INDEX IF NOT EXISTS idx_user_redeem_balance_credits_due
    ON user_redeem_balance_credits (expires_at, id)
    WHERE remaining_amount > 0;
