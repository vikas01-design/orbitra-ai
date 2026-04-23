import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/themes";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: "hsl(180, 100%, 45%)",
        colorBackground: "hsl(240, 50%, 6%)",
        colorInputBackground: "hsl(240, 40%, 15%)",
        colorInputText: "hsl(180, 20%, 95%)",
      },
    }}
  >
    <App />
  </ClerkProvider>
);
