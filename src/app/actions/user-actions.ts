"use server";
import { db } from "@/lib/db";
import { validateRequest } from "@/lib/lucia";
import { lucia } from "@/lib/lucia-config";
import { logsQueue } from "@/lib/queue";
import { SignInSchemaType } from "@/lib/schemas/user";
import { md5Hash } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUserInfo() {
  try {
    const { user } = await validateRequest();
    if (user) {
      return { user };
    } else {
      return { error: "User not found" };
    }
  } catch (error) {
    return { error: error };
  }
}

export const getCurrentUser = async () => {
  const { session } = await validateRequest();

  if (!session || !session.userId) {
    return { success: false, message: "Unauthorized" };
  }

  const detail = await db.user.findUnique({
    where: {
      id: session.userId,
    },
  });
  if (!detail) return { success: false, message: "User not found" };
  return { success: true, user: detail };
};

export async function signIn(values: SignInSchemaType) {
  if (!values) return { success: false, message: "Invalid request" };

  const user = await db.user.findFirst({
    where: {
      username: {
        mode: "insensitive",
        equals: values.username.trim(),
      },
    },
  });

  if (!user || !user.password) {
    return {
      success: false,
      message: "Tài khoản không tồn tại hoặc sai mật khẩu!",
    };
  }

  const pwdOrigin = md5Hash(values.password);

  if (pwdOrigin !== user.password) {
    return {
      success: false,
      message: "Tài khoản không tồn tại hoặc sai mật khẩu.!",
    };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return { success: true, message: "Logged in!" };
}

export async function logout() {
  const { session, user } = await validateRequest();

  if (!session) {
    throw new Error("Unauthorized");
  }

  logsQueue.add("logout", {
    userId: user?.username,
    activity: "logout",
  });

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/authentication");
}

export async function getUsersByDepartmentId(departmentId: string, branchId: string) {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  if (!departmentId || !branchId) {
    return { success: false, message: "Department id is required" };
  }

  const existingUser = await db.user.findMany({
    where: {
      departmentId,
      status: true,
    },
  });

  return {
    success: true,
    data: existingUser.map((user) => ({
      username: user.username,
      displayName: user.fullname,
    })),
  };
}
