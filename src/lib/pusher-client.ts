import PusherClient from "pusher-js";

// Enable pusher logging in development
if (process.env.NODE_ENV !== "production") {
  PusherClient.logToConsole = false; // Set to true to debug
}

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
