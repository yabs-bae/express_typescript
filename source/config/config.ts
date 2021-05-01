import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 50,
    autoIndex: false,
    retryWrites: false
};

const NODEMAILER = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "da84a678be2a21",
      pass: "a81a7e618a0bb4"
    }
  });

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'yabs';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'yabs12345';
const MONGO_HOST = process.env.MONGO_URL || `localhost:27017`;

const MONGO_EXPIRETIME = process.env.MONGO_EXPIRETIME || 3600;
const MONGO_ISSUER = process.env.MONGO_ISSUER || 'coolissuer';
const MONGO_SECRET = process.env.MONGO_SECRET || 'yabs12345';

const MONGO = {
    host: MONGO_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    options: MONGO_OPTIONS,
    url: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3000;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    token: {
        expireTime: MONGO_EXPIRETIME,
        issuer: MONGO_ISSUER,
        secret: MONGO_SECRET
    }
};

const config = {
    mongo: MONGO,
    server: SERVER,
    nodemailer:NODEMAILER
};

export default config;
