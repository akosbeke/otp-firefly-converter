import axios from "axios";

const baseURL = process.env.FIREFLY_URL;
const token = process.env.FIREFLY_TOKEN;

if (!baseURL) {
  throw new Error("FIREFLY_URL is not set in environment variables");
}
if (!token) {
  throw new Error("FIREFLY_TOKEN is not set in environment variables");
}

const fireflyApi = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export default fireflyApi;
