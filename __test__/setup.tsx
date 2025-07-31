// import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach , vi} from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Cleanup después de cada test
afterEach(() => {
  cleanup()
  console.log('Cleanup after each test')
})

// Global test configuration
beforeAll(() => {
  // Setup global mocks if needed
  console.log('Global setup before all tests')
})

afterAll(() => {
  // Cleanup global resources
  console.log('Global cleanup after all tests')
})