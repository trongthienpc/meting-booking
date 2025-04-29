"use server";
import { Session, User } from "lucia";
import { cookies } from "next/headers";
import { lucia } from "./lucia-config";
import { db } from "./db";

/**
 * Sets the session cookie with the given session ID.
 * @param {string} sessionId - The session ID to set in the cookie.
 */
// async function setSessionCookie(sessionId: string) {
//   const cookieStore = cookies();
//   const sessionCookie = lucia.createSessionCookie(sessionId);
//   (await cookieStore).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
// }

/**
 * Clears the session cookie.
 */
// async function clearSessionCookie() {
//   const cookieStore = await cookies();
//   const sessionCookie = lucia.createBlankSessionCookie();
//   cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
// }

/**
 * Validates the current session and retrieves the associated user.
 * @returns {Promise<{ user: User; session: Session } | { user: null; session: null }>}
 */
export async function validateRequest(): Promise<{ user: User; session: Session } | { user: null; session: null }> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  // If no session ID is found, return null for both user and session
  if (!sessionId) {
    return { user: null, session: null };
  }

  // Validate the session using Lucia
  const { user, session } = await lucia.validateSession(sessionId);

  console.log("🚀 ~ validateRequest ~ user:", user);
  // If the session is invalid, clear the session cookie and return null
  if (!session) {
    // await clearSessionCookie();
    return { user: null, session: null };
  }

  // If the session is fresh, update the session cookie
  // if (session.fresh) {
  //   await setSessionCookie(session.id);
  // }

  // If the user exists, fetch additional user data (e.g., departmentId)
  if (user) {
    await enrichUserWithDepartment(user);
  }

  return { user, session };
}

/**
 * Fetches and adds departmentId to the user object.
 * @param {User} user - The user object to enrich.
 */
async function enrichUserWithDepartment(user: User) {
  try {
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { departmentId: true },
    });

    if (dbUser) {
      user.departmentId = dbUser.departmentId;
    }
  } catch (error) {
    console.error("Failed to fetch user department:", error);
    // Handle the error gracefully (e.g., log it or set a default value)
  }
}
