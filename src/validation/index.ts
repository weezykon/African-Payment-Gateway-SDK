import { z } from "zod";

export const initiateTransactionSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  customerEmail: z.string().email("Invalid customer email address"),
  reference: z.string().min(1, "Reference cannot be empty"),
});

export const verifyTransactionSchema = z.object({
  reference: z.string().min(1, "Reference cannot be empty"),
});
