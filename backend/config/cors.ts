import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: (origin: string, ctx) => {
    const allowedOrigins = [env.get('FRONTEND_URL')].filter(Boolean)

    // Allow frontend URL
    if (allowedOrigins.includes(origin)) {
      return true
    }

    // Allow Foundry VTT (localhost with any port) for VTT-related endpoints
    // Foundry runs on localhost with configurable ports (default 30000)
    const url = ctx.request.url()
    const isFoundryEndpoint =
      url.startsWith('/webhooks/foundry') || url.startsWith('/mj/vtt-connections')
    const isLocalhost =
      origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')

    if (isFoundryEndpoint && isLocalhost) {
      return true
    }

    return false
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
