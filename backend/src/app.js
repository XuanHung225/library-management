require("dotenv").config(); // Load môi trường đầu tiên
const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./routes/auth.route");

// 1. Khởi tạo app TRƯỚC khi sử dụng
const app = express();

// 2. Startup environment sanity checks
function checkCriticalEnv() {
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(", ")}. Copy .env.example and fill them in.`,
    );
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev_secret")
  ) {
    console.error(
      "ERROR: In production, set a strong JWT_SECRET and avoid default secrets. Exiting.",
    );
    process.exit(1);
  }
}
checkCriticalEnv();

// 3. Cấu hình Swagger
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library Management API",
      version: "1.0.0",
      description: "API documentation for Library Management System",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
});

// 4. Các Middleware hệ thống
app.use(cors());
app.use(require("./middlewares/helmet.middleware"));
app.use(require("./middlewares/logging.middleware"));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Bây giờ app đã tồn tại

// 5. Định nghĩa các Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", require("./routes/book.route"));
app.use("/api/loans", require("./routes/loan.route"));
app.use("/api/fines", require("./routes/fine.route"));

app.use("/api/users", require("./routes/user.route"));
app.use("/api/stats", require("./routes/stats.route"));
app.use("/api/logs", require("./routes/log.route"));
app.use("/uploads", express.static("uploads"));

// 6. Export app cho testing
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
