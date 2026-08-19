import { apiClient } from './client'

export interface CarpoolLoginTicket {
  ticket: string
  expires_at: string
}

export async function createLoginTicket(portalId: string, returnTo: string): Promise<CarpoolLoginTicket> {
  const { data } = await apiClient.post<CarpoolLoginTicket>('/user/integrations/carpool/login-ticket', {
    portal_id: portalId,
    return_to: returnTo,
  })
  return data
}
