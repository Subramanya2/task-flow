import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ArrowRight, CheckCircle2, Users, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <CheckCircle2 className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
          <SignInButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative pt-24 pb-32 overflow-hidden flex-1 flex flex-col items-center justify-center">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full mix-blend-multiply filter" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border text-sm font-medium text-muted-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Real-time collaboration is here
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Manage tasks together in real-time.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
              TaskFlow is the premium collaborative task manager for modern teams. 
              Assign tasks, track progress, and stay in sync—instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <SignInButton />
              <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors inline-flex items-center gap-1">
                Learn more <ArrowRight className="size-4" />
              </a>
            </div>

            {/* Dashboard Preview Image/Mockup */}
            <div className="mt-20 w-full max-w-5xl rounded-2xl border bg-card/50 shadow-2xl backdrop-blur-sm overflow-hidden ring-1 ring-white/10 relative">
              <div className="h-10 border-b flex items-center px-4 gap-2 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
              </div>
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-muted/50 to-muted/20 p-8 flex flex-col gap-4">
                <div className="w-1/3 h-8 bg-muted rounded-md" />
                <div className="w-full flex gap-4">
                  <div className="w-1/4 h-32 bg-card rounded-lg border shadow-sm" />
                  <div className="w-1/4 h-32 bg-card rounded-lg border shadow-sm" />
                  <div className="w-1/4 h-32 bg-card rounded-lg border shadow-sm" />
                  <div className="w-1/4 h-32 bg-card rounded-lg border shadow-sm" />
                </div>
                <div className="flex-1 w-full bg-card rounded-lg border shadow-sm mt-4 p-4 flex flex-col gap-3">
                  <div className="w-full h-12 bg-muted/50 rounded flex items-center px-4"><div className="w-2/3 h-4 bg-muted rounded" /></div>
                  <div className="w-full h-12 bg-muted/50 rounded flex items-center px-4"><div className="w-1/2 h-4 bg-muted rounded" /></div>
                  <div className="w-full h-12 bg-muted/50 rounded flex items-center px-4"><div className="w-3/4 h-4 bg-muted rounded" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to get things done</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A simple but powerful set of tools designed to help you and your team stay focused.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Zap className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Sync</h3>
                <p className="text-muted-foreground">
                  Changes appear instantly across all devices. No refreshing required. See updates as they happen.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="size-12 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                  <Users className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Assignment</h3>
                <p className="text-muted-foreground">
                  Assign tasks to anyone using just their email address. They'll see it as soon as they sign up.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                <div className="size-12 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Design</h3>
                <p className="text-muted-foreground">
                  A beautiful, responsive interface that feels right at home on your desktop, tablet, or phone.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
