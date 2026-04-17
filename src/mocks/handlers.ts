import { http, HttpResponse } from 'msw'
import { db } from './db'

export const handlers = [
  http.get('/vehicles', () => {
    return HttpResponse.json(db.vehicles)
  }),

  http.get('/alerts', () => {
    return HttpResponse.json(db.alerts)
  }),

  http.get('/users', () => {
    return HttpResponse.json(db.users)
  }),
]