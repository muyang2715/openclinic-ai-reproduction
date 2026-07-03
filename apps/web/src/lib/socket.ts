import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/shared";

export type CallSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5500";

// One lazily-connected socket for the voice call. autoConnect:false so the
// connection (and mic) only opens when the user actually starts a call.
export function createCallSocket(): CallSocket {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
  });
}
