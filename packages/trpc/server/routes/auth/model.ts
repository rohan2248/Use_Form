import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("name of the user"),
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
});

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user signed in"),
});

// empty object instead of z.undefined(): httpLink sends no request body for
// undefined mutation inputs, which the server rejects as malformed JSON
export const logoutUserInputModel = z.object({});

export const logoutUserOutputModel = z.object({
  success: z.boolean().describe("whether the user was logged out"),
});

export const getLoggedInUserInfoInputModel = z.undefined();

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("id of the user"),
  fullName: z.string().describe("full name of the user"),
  email: z.email().describe("email of the user"),
});
