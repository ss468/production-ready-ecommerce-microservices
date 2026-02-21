require("dotenv").config();
const App = require("./src/app");

const app = new App();
app.start().catch(err => console.error("Failed to start app:", err));