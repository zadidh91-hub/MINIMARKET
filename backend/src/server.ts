import { createContainer } from "./infrastructure/composition.js";
import { createApp } from "./app.js";

const container = createContainer();
const app = createApp(container);
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API minimarket en http://localhost:${port}`);
});
