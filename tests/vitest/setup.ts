import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local for Vitest
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
