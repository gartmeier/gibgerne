import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

let resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  let [isLoading, setIsLoading] = useState(false);
  let [resetSuccess, setResetSuccess] = useState(false);
  let searchParams = useSearchParams();
  let router = useRouter();
  let token = searchParams.get("token");

  let form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  async function onSubmit(data: ResetPasswordData) {
    if (!token) return;

    setIsLoading(true);

    try {
      let { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      setResetSuccess(true);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (resetSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
          <h1 className="text-xl font-bold">Password Reset Successfully</h1>
          <div className="text-center text-sm">
            Your password has been updated.
            <br />
            You can now log in with your new password.
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">
            <span>Continue to Log in</span>
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Acme Inc.</span>
        </a>
        <h1 className="text-xl font-bold">Set new password</h1>
        <div className="text-center text-sm">
          Enter your new password below.
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            Reset Password
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link href="/login" className="underline underline-offset-4">
          Back to Log in
        </Link>
      </div>
    </div>
  );
}
