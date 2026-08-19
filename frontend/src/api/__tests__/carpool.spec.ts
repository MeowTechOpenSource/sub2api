import { describe, expect, it, vi } from 'vitest'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
vi.mock('@/api/client', () => ({ apiClient: { post } }))

import { createLoginTicket } from '@/api/carpool'

describe('carpool API', () => {
  it('uses the authenticated user login-ticket endpoint', async () => {
    post.mockResolvedValueOnce({ data: { ticket: 'opaque-ticket', expires_at: '2026-08-05T12:00:30Z' } })

    await expect(createLoginTicket('portal_public_id', 'https://carpool.example.com/auth/callback')).resolves.toEqual({
      ticket: 'opaque-ticket',
      expires_at: '2026-08-05T12:00:30Z',
    })
    expect(post).toHaveBeenCalledWith('/user/integrations/carpool/login-ticket', {
      portal_id: 'portal_public_id',
      return_to: 'https://carpool.example.com/auth/callback',
    })
  })
})
