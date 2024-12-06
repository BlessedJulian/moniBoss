import env from "dotenv"

env.config()

export const ENV = process.env.NODE_ENV
export const PORT = process.env.port
export const DB = process.env.dbConnect
export const SECRET = process.env.secret
export const SECRETKEY = process.env.secretkey
export const TIME = process.env.jwtExpires
export const SessTime = process.env.sessionExp
export const baseUrl  = process.env.url


