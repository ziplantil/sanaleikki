import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express, { Express } from 'express';
import WebSocket from 'ws';
import { sanaleikkiConnectHandler } from './server/server';

const app: Express = express();
const port = process.env.PORT || 8888;
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  throw new Error('must supply non-empty JWT_SECRET in env or .env');
}

app.use(express.static('public'));

const server: http.Server = http.createServer(app);
const wss: WebSocket.Server = new WebSocket.Server({ server });
wss.on('connection', sanaleikkiConnectHandler(wss));
server.listen(port, () => {
  console.log(`https://localhost:${port}`);
});
