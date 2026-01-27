import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Redirect } from "wouter";
import okLogo from "@/assets/ok.png";
import sideImage from "@/assets/img.png";
import { CSSProperties } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const { user, login, isLoggingIn } = useAuth();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center p-2 bg-background">
        <div className="w-full max-w-sm space-y-2">
          <div className="flex flex-col items-center gap-2">
            <img 
              src={okLogo} 
              alt="Unique Pack Logo" 
              className="w-40 h-40 object-contain rounded-full border-4 border-black animate-fade-in-down"
              style={{ 
                animationDelay: '0s',
                animationDuration: '1.2s',
                animationFillMode: 'both'
              } as CSSProperties}
            />
            <h1 
              className="text-2xl font-bold text-center text-slate-900 animate-fade-in-up" 
              style={{ 
                animationDelay: '1s',
                animationFillMode: 'both'
              } as CSSProperties}
            >
              <span className="inline-block animate-slide-in-left" style={{ animationDelay: '1.3s', animationFillMode: 'both' } as CSSProperties}>Welcome to</span>
              <span className="inline-block animate-slide-in-left" style={{ animationDelay: '1.4s', animationFillMode: 'both' } as CSSProperties}>&nbsp;</span>
              <span className="inline-block text-blue-600 animate-slide-in-left" style={{ animationDelay: '1.5s', animationFillMode: 'both' } as CSSProperties}>Unique Pack</span>
              <span className="block text-base text-slate-600 mt-1 animate-slide-in-left" style={{ animationDelay: '1.6s', animationFillMode: 'both' } as CSSProperties}>Inventory Management System</span>
            </h1>
          </div>
          
          <Card 
            className="border-2 border-black rounded-lg shadow-none animate-fade-in-up" 
            style={{ 
              animationDelay: '1.8s',
              animationFillMode: 'both'
            } as CSSProperties}
          >
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-sm">
                Enter your credentials to access the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 py-3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => login(data))} className="space-y-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-9" disabled={isLoggingIn}>
                    {isLoggingIn ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero Image with endless scrolling animation */}
      <div className="hidden lg:flex relative bg-white items-center justify-center overflow-hidden">
        <div className="flex animate-scroll-infinite h-full w-fit">
          <img 
            src={sideImage} 
            alt="Unique Pack"
            className="h-full w-auto object-contain flex-shrink-0 animate-fade-in"
            style={{ 
              animationDelay: '0.8s',
              animationFillMode: 'both'
            } as CSSProperties}
          />
          <img 
            src={sideImage} 
            alt="Unique Pack"
            className="h-full w-auto object-contain flex-shrink-0 animate-fade-in"
            style={{ 
              animationDelay: '0.8s',
              animationFillMode: 'both'
            } as CSSProperties}
          />
        </div>
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}