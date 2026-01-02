import { Toaster } from "./components/ui/toast";
import { AppRouter } from "./router";

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}
