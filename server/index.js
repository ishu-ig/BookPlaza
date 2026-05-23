const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")
const { parse } = require("url")
const next = require("next")
require("dotenv").config()
require("./db_connect")

const Router = require("./routes/index")
const { Server } = require("socket.io")

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({
    dev,
    dir: path.join(__dirname, "../client"),
})
const handle = nextApp.getRequestHandler()

var whitelist = [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:4000',
   'https://bookplaza.onrender.com'
]
var corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('CORS Error: Not authorized'))
        }
    }
}

nextApp.prepare().then(() => {
    const app = express()
    const server = http.createServer(app)

    // ── Socket.IO ─────────────────────────────────────────────────────────────
    const io = new Server(server, {
        cors: {
            origin: whitelist,
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)
        socket.on("joinRoom", (roomId) => {
            socket.join(roomId)
            console.log(`User joined room: ${roomId}`)
        })
        socket.on("sendMessage", ({ roomId, sender, text }) => {
            io.to(roomId).emit("receiveMessage", { sender, text, createdAt: new Date() })
        })
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })
    })

    // ── Middleware ────────────────────────────────────────────────────────────
    app.use(cors(corsOptions))
    app.use(express.json())
    app.use("/public",   express.static("public"))
    app.use("/uploads",  express.static(path.join(__dirname, "public/uploads")))
    app.use("/invoices", express.static(path.join(__dirname, "public/invoices")))

    // ── API Routes ────────────────────────────────────────────────────────────
    app.use("/api", Router)

    // ── Next.js handles everything else ──────────────────────────────────────
    app.all("*", (req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    })

    const port = process.env.PORT || 8000
    server.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`))
}).catch((err) => {
    console.error("Next.js failed to start:", err)
    process.exit(1)
})