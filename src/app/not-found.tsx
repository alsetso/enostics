import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-enostics-gray-100 dark:bg-enostics-gray-950 text-center text-gray-900 dark:text-white p-8 transition-colors duration-500">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="mb-8 text-gray-600 dark:text-gray-400 max-w-md">
        Sorry, the page you are looking for doesn&#39;t exist or has been moved.
      </p>
      <Link href="/" className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg">
        Go back home
      </Link>
    </div>
  )
} 