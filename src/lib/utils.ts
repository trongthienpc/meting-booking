import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma";
import SparkMD5 from "spark-md5";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function md5Hash(src: string) {
  return SparkMD5.hash(src);
}

// --- Helper Function for Error Handling ---
// Define the shape of a standardized error result
export type ServerActionError = {
  success: false;
  message: string;
  data?: unknown;
  errors?: Record<string, string[]>;
};

// Utility to clean up Zod's fieldErrors to remove undefined values
export function cleanZodErrors(fieldErrors: Record<string, string[] | undefined>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(fieldErrors).filter(([, v]) => v !== undefined)) as Record<string, string[]>;
}

// Main handler function
export async function handleServerError(
  error: unknown,
  defaultMessage = "An unexpected error occurred."
): Promise<ServerActionError> {
  console.error("Server Action Error:", error);

  if (error instanceof ZodError) {
    return {
      success: false,
      message: "Validation failed",
      errors: cleanZodErrors(error.flatten().fieldErrors),
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: `Record with this name or value might already exist.`,
      };
    }
    return {
      success: false,
      message: `Database error: ${error.message}`,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if(typeof error === "string"){
    return {
      success: false,
      message: error,
    };
  }

  return {
    success: false,
    message: defaultMessage,
  };
}
