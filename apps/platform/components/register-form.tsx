import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { startTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { createUser, CreateUserRequest } from "@/lib/actions/user";
import { cn } from "@/lib/utils";
import { createUserSchema } from "@/lib/validations/user";
import { useActionState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(createUser, undefined);

  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "Joshua Gartmeier",
      email: "joshua@gartmeier.dev",
      password: "horsefly",
      organization: "Helping Hands",
    },
  });

  useEffect(() => {
    if (state?.success === false) {
      Object.entries(state.errors).forEach(([field, errors]) => {
        if (errors && errors.length > 0) {
          form.setError(field as keyof CreateUserRequest, {
            type: "server",
            message: errors[0],
          });
        }
      });

      if (state.errors.root) {
        for (const msg of state.errors.root) {
          toast.error(msg);
        }
      }
    }
  }, [state, form]);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <div className="mb-4 invert dark:invert-0">
          <CheckCircle className="size-12 text-green-500" />
        </div>
        <h2 className="text-xl font-bold tracking-[-0.16px] text-gray-900 dark:text-gray-100">
          Check your email
        </h2>
        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
          We just sent a verification link to {state.data.email}.
        </span>
        <Button asChild className="mt-6 gap-2">
          <Link href="/login">
            <span>Go to login</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
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
        <h1 className="text-xl font-bold">Create your account</h1>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            startTransition(() => formAction(data));
          })}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            Create Account
          </Button>

          {form.formState.errors.root && (
            <p className="text-center text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}
        </form>
      </Form>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
