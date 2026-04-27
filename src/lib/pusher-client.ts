import PusherClient from "pusher-js";

// Safe initialization that won't crash during Server-Side Rendering (SSR)
export const pusherClient =
  typeof window !== "undefined"
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      })
    : ({} as any); // Mock object for server-side

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  PusherClient.logToConsole = false;
}
