const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const path = require("path")

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({
    dev,
    dir: path.join(__dirname, "../client"),  // path to your Next.js app
})
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
    const app = express()
    const server = http.createServer(app)

    // ... all your existing middleware and routes ...
    app.use(cors(corsOptions))
    app.use(express.json())
    app.use("/public", express.static("public"))
    app.use("/uploads", express.static(path.join(__dirname, "public/uploads")))
    app.use("/invoices", express.static(path.join(__dirname, "public/invoices")))
    app.use("/api", Router)

    // ✅ Next.js handles everything else
    app.all("*", (req, res) => {
        const parsedUrl = parse(req.url, true)
        handle(req, res, parsedUrl)
    })

    let port = process.env.PORT || 8000
    server.listen(port, () => console.log(`✅ Server running at http://localhost:${port}`))
})