import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../lib/auth";
import { useMutation } from "@tanstack/react-query";
import { login, requestPasswordReset, bootstrapAdmin } from "../../api/auth";
import ServerErrorBanner from "../../components/ServerErrorBanner";
import { useToast } from "../../hooks/useToast";
import { useState } from "react";
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password is required")
});

const resetSchema = z.object({
  email: z.string().email("Valid email is required")
});

type LoginValues = z.infer<typeof loginSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function LoginPage() {
  const { loginWithToken } = useAuth();
  const { push } = useToast();
  const [showReset, setShowReset] = useState(false);
  const {
    register: registerLogin,
    handleSubmit: submitLogin,
    formState: { errors: loginErrors }
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const {
    register: registerReset,
    handleSubmit: submitReset,
    formState: { errors: resetErrors }
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => login(values.email, values.password),
    onSuccess: (data) => {
      loginWithToken(data.token);
      push({ title: "Signed in", variant: "success" });
    }
  });

  const resetMutation = useMutation({
    mutationFn: (values: ResetValues) => requestPasswordReset(values.email),
    onSuccess: () => {
      push({ title: "Password reset sent", description: "Check your email inbox.", variant: "success" });
      setShowReset(false);
    }
  });

  const bootstrapMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      bootstrapAdmin({ email: values.email, fullName: values.email.split("@")[0], password: values.password }),
    onSuccess: (data) => {
      loginWithToken(data.token);
      push({ title: "Admin user created", variant: "success" });
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="m365-card w-full max-w-lg p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted">Use your email and password to access the platform.</p>
        <form onSubmit={submitLogin((values) => loginMutation.mutate(values))} className="mt-6 space-y-4">
          {loginMutation.isError && (
            <ServerErrorBanner message="Sign-in failed. Check your email and password." />
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Email</label>
            <Input {...registerLogin("email")} placeholder="admin@company.com" />
            {loginErrors.email && <p className="text-xs text-danger">{loginErrors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Password</label>
            <Input type="password" {...registerLogin("password")} placeholder="••••••••" />
            {loginErrors.password && <p className="text-xs text-danger">{loginErrors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            Sign in
          </Button>
          <div className="flex items-center justify-between text-xs text-muted">
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={() => setShowReset((v) => !v)}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={submitLogin((values) => bootstrapMutation.mutate(values))}
            >
              First-time admin setup
            </button>
          </div>
        </form>
        {showReset && (
          <form onSubmit={submitReset((values) => resetMutation.mutate(values))} className="mt-4 space-y-3">
            {resetMutation.isError && (
              <ServerErrorBanner message="Unable to send reset email. Check the address." />
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Reset email</label>
              <Input {...registerReset("email")} placeholder="user@company.com" />
              {resetErrors.email && <p className="text-xs text-danger">{resetErrors.email.message}</p>}
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={resetMutation.isPending}>
              Send reset email
            </Button>
          </form>
        )}
        <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-muted">
          <div className="flex items-center justify-between">
            <span>Developer or SSO login?</span>
            <Link to="/dev" className="text-primary underline-offset-2 hover:underline">
              Go to /dev
            </Link>
          </div>
          <div className="mt-2 text-[11px] text-muted">
            Use email/password here. Token + SSO placeholder is on the /dev page.
          </div>
        </div>
      </div>
    </div>
  );
}
