import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lentil/ui";

const Settings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Settings</CardTitle>
      <CardDescription>Settings panel coming soon.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm">
        Configure your dashboard preferences here.
      </p>
    </CardContent>
  </Card>
);

export default Settings;
