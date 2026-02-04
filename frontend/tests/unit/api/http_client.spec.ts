import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'

// Mock Sentry before any imports - this prevents the debug module error
vi.mock('@sentry/nuxt', () => ({
  captureException: vi.fn(),
}))

// Mock axios
vi.mock('axios', () => {
  const createMockInstance = () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  })

  return {
    default: {
      create: vi.fn(() => createMockInstance()),
    },
  }
})

describe('HTTP Client', () => {
  type MockAxiosInstance = {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    patch: ReturnType<typeof vi.fn>
    interceptors: {
      request: { use: ReturnType<typeof vi.fn> }
      response: {
        use: ReturnType<typeof vi.fn>
        _errorCallback?: (error: AxiosError) => Promise<never>
      }
    }
  }

  let mockAxiosInstance: MockAxiosInstance
  let httpClient: typeof import('~/api/http_client').httpClient

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Reset window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })

    // Create mock axios instance with interceptor callback capture
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn((_successCallback, errorCallback) => {
            mockAxiosInstance.interceptors.response._errorCallback = errorCallback
            return 0
          }),
        },
      },
    }

    // Configure axios.create mock
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as unknown as AxiosInstance)

    // Import fresh module
    const module = await import('~/api/http_client')
    httpClient = module.httpClient
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3333', // Uses value from tests/setup.ts
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  test('should setup request and response interceptors', () => {
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
  })

  test('get() should make GET request and return data', async () => {
    const mockData = { id: 1, name: 'Test' }
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData })

    const result = await httpClient.get('/test')

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
      params: undefined,
    })
    expect(result).toEqual(mockData)
  })

  test('get() should pass query params', async () => {
    const mockData = { results: [] }
    const params = { page: 1, limit: 10 }
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData })

    await httpClient.get('/test', params)

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params })
  })

  test('post() should make POST request and return data', async () => {
    const mockData = { id: 1, created: true }
    const postData = { name: 'New Item' }
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mockData })

    const result = await httpClient.post('/test', postData)

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData)
    expect(result).toEqual(mockData)
  })

  test('put() should make PUT request and return data', async () => {
    const mockData = { id: 1, updated: true }
    const putData = { name: 'Updated Item' }
    mockAxiosInstance.put.mockResolvedValueOnce({ data: mockData })

    const result = await httpClient.put('/test/1', putData)

    expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData)
    expect(result).toEqual(mockData)
  })

  test('delete() should make DELETE request and return data', async () => {
    const mockData = { deleted: true }
    mockAxiosInstance.delete.mockResolvedValueOnce({ data: mockData })

    const result = await httpClient.delete('/test/1')

    expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1')
    expect(result).toEqual(mockData)
  })

  test('patch() should make PATCH request and return data', async () => {
    const mockData = { id: 1, patched: true }
    const patchData = { status: 'active' }
    mockAxiosInstance.patch.mockResolvedValueOnce({ data: mockData })

    const result = await httpClient.patch('/test/1', patchData)

    expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData)
    expect(result).toEqual(mockData)
  })

  test('should handle 401 error and reject', async () => {
    // Note: The actual redirect only happens when import.meta.client is true
    // In test environment, we just verify the error is rejected properly
    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback
    expect(errorCallback).toBeDefined()

    if (errorCallback) {
      const error = {
        response: { status: 401 },
        config: { method: 'get', url: '/test' },
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
    }
  })

  test('should log warning on 403', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback

    if (errorCallback) {
      const error = {
        response: { status: 403 },
        config: { method: 'get', url: '/test' },
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Accès interdit')
    }

    consoleWarnSpy.mockRestore()
  })

  test('should log warning on 404', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback

    if (errorCallback) {
      const error = {
        response: { status: 404 },
        config: { method: 'get', url: '/test' },
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Ressource non trouvée')
    }

    consoleWarnSpy.mockRestore()
  })

  test('should log error on 500', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback

    if (errorCallback) {
      const error = {
        response: { status: 500, data: {} },
        config: { method: 'get', url: '/test' },
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur serveur:', error)
    }

    consoleErrorSpy.mockRestore()
  })

  test('should handle network errors (no response)', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback

    if (errorCallback) {
      const error = {
        request: {},
        config: { method: 'get', url: '/test' },
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Aucune réponse du serveur:', error)
    }

    consoleErrorSpy.mockRestore()
  })

  test('should handle request configuration errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const errorCallback = mockAxiosInstance.interceptors.response._errorCallback

    if (errorCallback) {
      const error = {
        message: 'Invalid config',
      } as AxiosError

      await expect(errorCallback(error)).rejects.toEqual(error)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur de configuration de la requête:',
        'Invalid config'
      )
    }

    consoleErrorSpy.mockRestore()
  })
})
