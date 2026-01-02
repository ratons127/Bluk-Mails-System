import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { resetPassword } from "../../api/auth";
import { useMutation } from "@tanstack/react-query";
import ServerErrorBanner from "../../components/ServerErrorBanner";
import { useToast } from "../../hooks/useToast";

const schema = z
  .object({
    token: z.string().min(10, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6)
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const defaultToken = params.get("token") || "";
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: defaultToken, newPassword: "", confirmPassword: "" }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => resetPassword(values.token, values.newPassword),
    onSuccess: () => {
      push({ title: "Password updated", variant: "success" });
      navigate("/login");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="m365-card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted">Enter the reset token and choose a new password.</p>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-6 space-y-4">
          {mutation.isError && (
            <ServerErrorBanner message="Reset failed. Check the token and try again." />
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Reset token</label>
            <Input {...form.register("token")} />
            {form.formState.errors.token && (
              <p className="text-xs text-danger">{form.formState.errors.token.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">New password</label>
            <Input type="password" {...form.register("newPassword")} />
            {form.formState.errors.newPassword && (
              <p className="text-xs text-danger">{form.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">Confirm password</label>
            <Input type="password" {...form.register("confirmPassword")} />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-danger">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
