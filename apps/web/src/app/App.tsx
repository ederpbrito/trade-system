import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { AppShell } from "./AppShell";
import { AppRouter } from "./AppRouter";

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppShell>
          <AppRouter />
        </AppShell>
      </BrowserRouter>
    </AppProviders>
  );
}
