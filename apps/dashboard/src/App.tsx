import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@lentil/ui";
import { rpc } from "./lib/rpc";

const App = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      const result = await rpc.general.health();
      setStatus(result.status);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally {
      setOpen(true);
    }
  };

  return (
    <div>
      <Button onClick={checkHealth}>Check Health</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Health Check</DialogTitle>
            <DialogDescription>
              Server status: {status ?? "loading..."}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
