"use server";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { createUserSchema } from "@/lib/validations/user";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type CreateUserRequest = z.infer<typeof createUserSchema>;

export type CreateUserResponse =
  | { success: true; data: { email: string } }
  | { success: false; errors: Record<string, string[]> };

export async function createUser(
  _prevState: any,
  data: CreateUserRequest,
): Promise<CreateUserResponse> {
  try {
    let validatedFields = createUserSchema.safeParse(data);

    if (validatedFields.error) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    let validatedData = validatedFields.data;

    // Check if email already exists
    let existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, validatedData.email),
    });

    if (existingUser) {
      return {
        success: false as const,
        errors: {
          email: ["User already exists"],
        },
      };
    }

    // Check if organization already exists
    let orgSlug = slugify(validatedData.organization);
    let existingOrg = await db.query.organization.findFirst({
      where: eq(schema.organization.slug, orgSlug),
    });

    if (existingOrg) {
      return {
        success: false as const,
        errors: {
          organization: ["Organization already exists"],
        },
      };
    }

    let { user } = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    await auth.api.createOrganization({
      body: {
        name: validatedData.organization,
        slug: orgSlug,
        userId: user.id,
      },
    });

    return {
      success: true as const,
      data: { email: user.email },
    };
  } catch (e) {
    return {
      success: false,
      errors: {
        root: ["Something went wrong. Please try again."],
      },
    };
  }
}
