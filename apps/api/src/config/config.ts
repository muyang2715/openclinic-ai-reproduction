import "dotenv/config";

export const PORT = process.env.PORT;

export const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";
