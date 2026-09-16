import { resolve } from "node:path";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const databasePath = process.env.GROWTHMORE_DATABASE_PATH ?? resolve("data", "growthmore-demo.sqlite");
const app = createApp({ databasePath });

app.listen(port, () => {
  console.log(`Growthmore API listening on http://localhost:${port}`);
});

