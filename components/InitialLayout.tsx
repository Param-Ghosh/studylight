import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // ✅ wait until Clerk is ready

    const isAuthRoute = segments[0] === "(auth)";

    if (!isSignedIn && !isAuthRoute) 
      // Not signed in → send to login
      router.replace("/(auth)/login");
     else if (isSignedIn && isAuthRoute) 
      // Already signed in → send to tabs
      router.replace("/(tabs)");
    
  }, [isLoaded, isSignedIn, segments, router]);

  if (!isLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
