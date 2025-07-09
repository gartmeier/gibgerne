"use server";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { createUserSchema } from "@/lib/validations/user";
import { APIError as AuthError } from "better-auth/api";
import { eq } from "drizzle-orm";

export async function createUser(_prevState: any, data: FormData) {
  let validation = createUserSchema.safeParse({
    name: data.get("name"),
    email: data.get("email"),
    password: data.get("password"),
    organization: data.get("organization"),
  });

  if (validation.error) {
    return {
      success: false as const,
      message: "Registration failed",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, organization: orgName } = validation.data;

  // Check if email already exists
  const existingUser = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
  });

  if (existingUser) {
    return {
      success: false as const,
      message: "Registration failed",
      fieldErrors: {
        email: ["User already exists"],
      },
    };
  }

  // Check if organization already exists
  const orgSlug = slugify(orgName);
  const existingOrg = await db.query.organization.findFirst({
    where: eq(schema.organization.slug, orgSlug),
  });

  if (existingOrg) {
    return {
      success: false as const,
      message: "Registration failed",
      fieldErrors: {
        organization: ["Organization already exists"],
      },
    };
  }

  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    await auth.api.createOrganization({
      body: {
        name: orgName,
        slug: orgSlug,
        userId: user.id,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.body?.code) {
        case "USER_ALREADY_EXISTS":
          return {
            success: false as const,
            message: "Registration failed",
            fieldErrors: {
              email: [error.body.message],
            },
          };
        case "ORGANIZATION_ALREADY_EXISTS":
          return {
            success: false as const,
            message: "Registration failed",
            fieldErrors: {
              organization: [error.body.message],
            },
          };
      }
    }

    return {
      success: false as const,
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    success: true as const,
    data: { email },
  };
}
