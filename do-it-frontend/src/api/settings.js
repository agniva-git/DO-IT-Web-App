import api from './client.js'

export const getProfile = () => api.get('/users/me').then((res) => res.data)

export const updateProfile = (updates) =>
  api.patch('/users/me', updates).then((res) => res.data)

export const getPreferences = () =>
  api.get('/users/me/preferences').then((res) => res.data)

export const updatePreferences = (updates) =>
  api.patch('/users/me/preferences', updates).then((res) => res.data)

export const changePassword = (currentPassword, newPassword) =>
  api.post('/users/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  })

export const deleteAccount = () => api.delete('/users/me')