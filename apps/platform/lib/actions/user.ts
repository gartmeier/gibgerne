"use server";

import { CreateUserData, createUserSchema } from "@/lib/validations/user";

export async function createUser(prevState: undefined, data: CreateUserData) {
  console.log(data);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let validatedData = createUserSchema.parse(data);
  console.log(validatedData);

  return { success: true };
}
