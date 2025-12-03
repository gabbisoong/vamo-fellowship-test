import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login')
  const isOnSignupPage = req.nextUrl.pathname.startsWith('/signup')
  const isOnJoinWorkspacePage = req.nextUrl.pathname.startsWith('/join-workspace')
  const isOnAuthRoute = isOnLoginPage || isOnSignupPage
  const userType = req.auth?.user?.userType ?? 'admin'
  const isContributor = userType === 'contributor'

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isOnAuthRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isOnAuthRoute) {
    // Contributors must join a workspace
    if (isContributor) {
      const hasJoinedWorkspace = req.auth?.user?.hasJoinedWorkspace ?? false
      if (!hasJoinedWorkspace) {
        return NextResponse.redirect(new URL('/join-workspace', req.url))
      }
    }
    // All logged-in users go to dashboard
    return NextResponse.redirect(new URL('/', req.url))
  }

  // For logged-in contributors, enforce workspace requirement
  if (isLoggedIn && isContributor && !isOnJoinWorkspacePage) {
    const hasJoinedWorkspace = req.auth?.user?.hasJoinedWorkspace ?? false

    if (!hasJoinedWorkspace) {
      return NextResponse.redirect(new URL('/join-workspace', req.url))
    }
  }

  // If on join-workspace page and already joined, redirect to home
  if (isLoggedIn && isOnJoinWorkspacePage) {
    const hasJoinedWorkspace = req.auth?.user?.hasJoinedWorkspace ?? false

    if (hasJoinedWorkspace) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/webhooks|api/auth|_next/static|_next/image|favicon.ico).*)'],
}
