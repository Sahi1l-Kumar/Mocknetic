import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000");

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`👤 Client connected: ${socket.id}`);

    socket.on("join_interview", (data) => {
      console.log(`🎬 Join interview: ${data.session_id}`);
      socket.join(data.session_id);
    });

    socket.on("send_audio_chunk", (data) => {
      console.log(`📤 Audio chunk received from: ${socket.id}`);
    });

    socket.on("end_interview", (data) => {
      console.log(`✅ Interview ended: ${data.session_id}`);
      socket.leave(data.session_id);
    });

    socket.on("disconnect", () => {
      console.log(`👤 Client disconnected: ${socket.id}`);
    });
  });

  httpServer.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket ready for Socket.IO`);
  });
});
