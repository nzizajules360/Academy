import { NextResponse } from "next/server"

/**
 * Notifications sender route
 *
 * Notes:
 * - This API previously relied on client-side Firebase `auth.currentUser` in a
 *   server route which is not available during SSR. That caused 401 responses.
 * - Per recent requirements, developer access is open: any authenticated client
 *   or trusted caller can POST notifications. For now this route accepts requests
 *   without server-side token verification. If you want to restrict it later,
 *   pass an idToken from the client and verify with the Admin SDK.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { title, message, type, sentBy } = data || {}

    // Validate the input
    if (!title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Implement real sending logic (FCM, database, websockets, etc.)
    // For now we just log the notification and return success so the client
    // doesn't get a 401 when calling this endpoint.
    console.log("Notification queued:", { title, message, type, sentBy })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}