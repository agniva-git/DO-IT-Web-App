// Shaped like GET /users/me + user_preferences from the blueprint's
// DB schema. Swap for a real fetch/PATCH once FastAPI is live.
export const mockProfile = {
  name: 'Agniva',
  username: 'agniva',
  email: 'agniva@example.com',
  whatsapp: ''
}

export const mockPreferences = {
  wakeTime: '07:00',
  sleepTime: '23:00',
  studyDuration: '50',
  breakDuration: '10'
}

export const mockNotificationSettings = {
  browser: true,
  email: false
}