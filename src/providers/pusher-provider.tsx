// PusherContext.tsx - Final solution with queue mechanism
"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Pusher, { Channel, Options as PusherOptions } from "pusher-js";

interface PusherContextType {
  subscribe: (channelName: string, componentId: string) => Channel | undefined;
  unsubscribe: (channelName: string, componentId: string) => void;
  isInitialized: boolean;
}

const PusherContext = createContext<PusherContextType | null>(null);

interface PusherProviderProps {
  appKey: string;
  options: PusherOptions;
  children: React.ReactNode;
}

export function PusherProvider({
  appKey,
  options,
  children,
}: PusherProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const clientRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Record<string, Channel>>({});
  // Track which components have subscribed to which channels
  const subscriptionsRef = useRef<Record<string, Set<string>>>({});

  // Initialize Pusher once
  useEffect(() => {
    let isActive = true; // For cleanup safety

    const init = async () => {
      // console.log("[PusherProvider] Initializing Pusher client...");

      // Create Pusher client
      const pusherClient = new Pusher(appKey, {
        ...options,
        enabledTransports: ["ws", "wss"],
      });

      // Wait for connection to be established
      await new Promise<void>((resolve) => {
        pusherClient.connection.bind("connected", () => {
          if (isActive) {
            resolve();
          }
        });
      });

      if (!isActive) return;

      // Store in ref
      clientRef.current = pusherClient;
      setIsInitialized(true);
    };

    init().catch(console.error);

    // Cleanup function
    return () => {
      isActive = false;
      if (clientRef.current) {
        console.log("[PusherProvider] Disconnecting Pusher client...");
        clientRef.current.disconnect();
        clientRef.current = null;
        channelsRef.current = {};
        subscriptionsRef.current = {};
        setIsInitialized(false);
      }
    };
  }, [appKey, options]); // Only depend on appKey

  // Subscribe function that tracks component subscriptions
  const subscribe = (
    channelName: string,
    componentId: string
  ): Channel | undefined => {
    if (!channelName) return undefined;

    // If not initialized yet, just return undefined
    if (!clientRef.current || !isInitialized) {
      return undefined;
    }

    // Track this component's subscription
    if (!subscriptionsRef.current[channelName]) {
      subscriptionsRef.current[channelName] = new Set();
    }

    // If this component already subscribed to this channel, return existing channel
    if (subscriptionsRef.current[channelName].has(componentId)) {
      return channelsRef.current[channelName];
    }

    // Mark this component as subscribed to this channel
    subscriptionsRef.current[channelName].add(componentId);

    // Subscribe to channel if not already subscribed
    if (!channelsRef.current[channelName]) {
      // console.log(`[PusherProvider] Subscribing to channel: ${channelName}`);
      channelsRef.current[channelName] =
        clientRef.current.subscribe(channelName);
    } else {
      // console.log(`[PusherProvider] Reusing existing channel: ${channelName}`);
    }

    return channelsRef.current[channelName];
  };

  // Unsubscribe function that checks if any components still need the channel
  const unsubscribe = (channelName: string, componentId: string): void => {
    if (!channelName || !clientRef.current || !isInitialized) return;

    // Remove component from subscribers
    if (subscriptionsRef.current[channelName]) {
      subscriptionsRef.current[channelName].delete(componentId);

      // If no components are subscribed to this channel anymore, unsubscribe
      if (subscriptionsRef.current[channelName].size === 0) {
        console.log(
          `[PusherProvider] Unsubscribing from channel: ${channelName}`
        );
        clientRef.current.unsubscribe(channelName);
        delete channelsRef.current[channelName];
        delete subscriptionsRef.current[channelName];
      } else {
        // console.log(
        //   `[PusherProvider] Channel ${channelName} still has ${subscriptionsRef.current[channelName].size} subscribers`
        // );
      }
    }
  };

  const contextValue = { subscribe, unsubscribe, isInitialized };

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = (): PusherContextType => {
  const context = useContext(PusherContext);

  if (!context) {
    throw new Error("usePusher must be used within a PusherProvider");
  }

  return context;
};

let nextComponentId = 0;

export const useChannel = (channelName: string): Channel | undefined => {
  const { subscribe, unsubscribe, isInitialized } = usePusher();
  const [channel, setChannel] = useState<Channel | undefined>(undefined);
  const componentIdRef = useRef<string>(`component-${nextComponentId++}`);

  useEffect(() => {
    // Only attempt to subscribe if initialized and we have a channel name
    if (!isInitialized || !channelName) return;

    // console.log(`[useChannel] Subscribing to channel: ${channelName}`);
    const newChannel = subscribe(channelName, componentIdRef.current);
    setChannel(newChannel);
    const componentId = componentIdRef.current;
    return () => {
      // console.log(`[useChannel] Unsubscribing from: ${channelName}`);
      unsubscribe(channelName, componentId);
      setChannel(undefined);
    };
  }, [channelName, isInitialized, subscribe, unsubscribe]);

  return channel;
};
