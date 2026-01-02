import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../lib/auth";

const schema = z.object({
  token: z.string().min(20, "JWT token is required")
});

type FormValues = z.infer<typeof schema>;

export default function DevLoginPage() {
  const { loginWithToken } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="m365-card w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Developer sign in</h1>
        <p className="text-sm text-muted">Paste a JWT token for dev access or use SSO placeholder.</p>
        <form onSubmit={handleSubmit((values) => loginWithToken(values.token))} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted">JWT Token</label>
            <Input {...register("token")} placeholder="eyJhbGci..." />
            {errors.token && <p className="text-xs text-danger">{errors.token.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Sign in with token
          </Button>
          <div className="text-center text-xs text-muted">or</div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => window.alert("SSO redirect placeholder")}
          >
            Sign in with SSO
          </Button>
        </form>
      </div>
    </div>
  );
}
