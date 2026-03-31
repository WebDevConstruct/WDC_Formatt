import { clerkMiddleware } from '@clerk/nextjs/server';
import { createRouteMatcher } from '@clerk/nextjs/server';



const isPublicRoute = createRouteMatcher([
  '/', 
   '/signin(.*)', 
   '/signup(.*)',
 
   "/api/webhook(.*)"
 
 // Ensure the (.*) is there to catch sub-routes
])

export default clerkMiddleware((auth, req)=> {
  if(!isPublicRoute(req)){
 auth.protect()
}
// if(ProtectedRoute(req)) return await auth?.protect()
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}