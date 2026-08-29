import api from './client.js'

export const FOCUS_PRESETS = [
  { value: '25-5', label: '25 / 5', workMinutes: 25, breakMinutes: 5 },
  { value: '50-10', label: '50 / 10', workMinutes: 50, breakMinutes: 10 },
  { value: 'custom', label: 'Custom', workMinutes: null, breakMinutes: null }
]

export const listFocusSessions = () =>
  api.get('/focus/sessions').then((res) => res.data)

export const createFocusSession = (session) =>
  api.post('/focus/sessions', session).then((res) => res.data)