/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  getCurrentUser,
  getUserInfo,
  getUsersByDepartmentId,
} from "@/app/actions/user-actions";
import React, { useContext } from "react";
// User type definition
type User =
  | {
      username: string;
      displayName?: string | null;
      avatar?: string | null;
      branchId?: string | null;
      departmentId?: string | null;
    }
  | null
  | undefined;

// Context type definition
type UserContextType = {
  user: User | undefined;
  departmentId: string | undefined;
  error: string | null;
  departmentUsers: User[];
  isLoading: boolean;
  getDepartmentUsers: (departmentId: string) => Promise<void>;
};

const UserContext = React.createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Set initial state values, `user` can be `undefined`, `null`, or a user object, `error` is a string or null
  const [user, setUser] = React.useState<User | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [departmentId, setDepartmentId] = React.useState<string | undefined>(
    undefined
  );
  const [departmentUsers, setDepartmentUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const [result, userResponse] = await Promise.all([
          getUserInfo(),
          getCurrentUser(),
        ]);

        if (userResponse.success && userResponse?.user) {
          const user = userResponse?.user;
          setDepartmentId(user?.departmentId ?? undefined);
        }
        if (result.error) {
          throw new Error("Failed to fetch user");
        }

        if (result?.user && result?.user?.username) {
          setUser(result.user);
        }
      } catch (error: any) {
        setError(error?.message || "Unknown error occurred");
      }
    };

    fetchUser();
  }, []);

  const getDepartmentUsers = async (departmentId: string) => {
    setIsLoading(true);
    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success && userResponse?.user) {
        const user = userResponse?.user;
        setDepartmentId(user?.departmentId ?? undefined);
        const response = await getUsersByDepartmentId(departmentId);

        if (response.success && response?.data) {
          setDepartmentUsers(response?.data);
        }
      }
    } catch (error: any) {
      setError(error?.message || "Failed to fetch department users");
      setDepartmentUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pass `user` and `error` to the context provider
  const value: UserContextType = {
    user,
    error,
    departmentUsers,
    isLoading,
    getDepartmentUsers,
    departmentId,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Helper hook for department users
export function useDepartmentUsers(departmentId?: string) {
  const {
    departmentUsers,
    getDepartmentUsers,
    departmentId: _departmentId,
    isLoading,
    error,
  } = useUser();

  React.useEffect(() => {
    if (departmentId) {
      getDepartmentUsers(departmentId);
    } else {
      if (_departmentId) {
        getDepartmentUsers(_departmentId);
      }
    }
  }, [_departmentId, departmentId, getDepartmentUsers]);

  return {
    users: departmentUsers,
    isLoading,
    error,
    refetch: () => departmentId && getDepartmentUsers(departmentId),
  };
}
