"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Trash2, Info, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotification } from "@/providers/notification-provider";

const typeIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeStyles = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  error: "bg-red-50 border-red-200",
};

export function NotificationList() {
  const { notifications, isLoading, markAsRead, deleteNotification } = useNotification();
  console.log("🚀 ~ NotificationList ~ notifications:", notifications?.length);

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (!notifications?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p>You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type as keyof typeof typeIcons];
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={cn(
                "p-4 mb-2 rounded-lg border",
                notification.isRead ? "bg-muted" : typeStyles[notification.type as keyof typeof typeStyles]
              )}
            >
              <div className="flex items-start gap-4">
                <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{notification.type}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  {/* {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-sm text-primary hover:underline block mt-2"
                    >
                      View details
                    </Link>
                  )} */}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      className="cursor-pointer"
                      size="icon"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="cursor-pointer"
                    size="icon"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </ScrollArea>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
