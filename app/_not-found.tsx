import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-6 selection:bg-black selection:text-white">
      <div className="max-w-md text-center space-y-6">
        {/* Large Status Code */}
        <h1 className="text-9xl font-black tracking-tighter select-none">
          404
        </h1>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Page not found
          </h2>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            The page you are looking for {`doesn't`} exist or has been permanently moved.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-colors border border-black bg-black text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}