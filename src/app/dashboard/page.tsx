export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your tasks.
        </p>
      </div>
      <div className="h-96 w-full border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
        Tasks will go here
      </div>
    </div>
  );
}
