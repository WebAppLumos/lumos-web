import { useState } from 'react'
import { getStoredUser } from './session'

export function useStoredUser() {
  const [user, setUser] = useState(() => getStoredUser())
  return [user, setUser]
}
