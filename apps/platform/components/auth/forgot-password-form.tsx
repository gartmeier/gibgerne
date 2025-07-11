import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

let forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  let [isLoading, setIsLoading] = useState(false);
  let [emailSent, setEmailSent] = useState<string | null>(null);

  let form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordData) {
    setIsLoading(true);

    try {
      let { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setEmailSent(data.email);
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </a>
        </div>

        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <div className="mb-4 invert dark:invert-0">
            <CheckCircle className="size-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold tracking-[-0.16px] text-gray-900 dark:text-gray-100">
            Check your email
          </h2>
          <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
            We just sent a password reset link to {emailSent}.
          </span>
          <Button asChild className="mt-6 gap-2">
            <Link href="/login">
              <ArrowLeft className="size-4" />
              <span>Back to Log in</span>
            </Link>
          </Button>
        </div>
      </div>
    );
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
        <h1 className="text-xl font-bold">Reset Password</h1>
        <div className="text-center text-sm">
          Enter your email address and we'll
          <br />
          send you a link to reset your password.
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    {...field}
                    disabled={isLoading}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            Send Reset Link
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Remembered your password?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
    </div>
  );
}
