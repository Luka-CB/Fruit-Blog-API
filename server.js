const express = require("express");
require("colors");
const ConnectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

ConnectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(
  cors({
    origin: "https://fruit-blog-client.onrender.com",
    credentials: true,
  })
);

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/likes", require("./routes/likeRoutes"));

app.use(require("./middlewares/error").notFound);
app.use(require("./middlewares/error").errorHandler);

app.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`.green.bold)
);
