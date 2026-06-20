import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@lentil/ui";
import { rpc } from "../lib/rpc";

const Home = () => {
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Home</CardTitle>
          <CardDescription>Welcome to the Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkHealth}>Check Health</Button>
        </CardContent>
      </Card>

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

export default Home;
