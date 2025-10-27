// login.tsx
import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/auth.styles';
import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function Login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Memoize static content to prevent unnecessary re-renders
  const logoSource = useMemo(() => require("../../assets/images/Collage_Logo.png"), []);
  const illustrationSource = useMemo(() => require("../../assets/images/auth-bg-2.png"), []);

  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return; // Prevent double taps
    
    setIsLoading(true);
    
    try {
      // Immediate navigation for better UX - don't wait for session setup
      const ssoResult = await startSSOFlow({ 
        strategy: "oauth_google" 
      });

      // Quick session activation without await for faster navigation
      if (ssoResult.setActive && ssoResult.createdSessionId) {
        ssoResult.setActive({ session: ssoResult.createdSessionId });
        
        // Navigate immediately without waiting
        router.replace("/(tabs)");
        return;
      }
      
      throw new Error("Authentication failed");
    } catch (error) {
      console.error("OAuth error:", error);
      setIsLoading(false);
      
      // Simple error without blocking
      Alert.alert("Login failed", "Please try again");
    }
  }, [startSSOFlow, router, isLoading]);

  const renderGoogleButton = () => (
    <TouchableOpacity
      style={[
        styles.googleButton,
        isLoading && { opacity: 0.7 }
      ]}
      onPress={handleGoogleSignIn}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View style={styles.googleIconContainer}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={COLORS.surface} 
          />
        ) : (
          <Ionicons 
            name="logo-google" 
            size={20} 
            color={COLORS.surface} 
          />
        )}
      </View>
      <Text style={styles.googleButtonText}>
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* BRAND SECTION */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Image
            source={logoSource}
            style={{ 
              width: 80, 
              height: 90, 
              resizeMode: "contain" 
            }}
            // Add cache control for better performance
            fadeDuration={200}
          />
        </View>
        <Text style={styles.appName}>Studylight</Text>
        <Text style={styles.tagline}>
          Stay updated with college news, notes, and group chats — all in one
          place. Never miss a moment that matters.
        </Text>
      </View>

      {/* ILLUSTRATION */}
      <View style={styles.illustrationContainer}>
        <Image
          source={illustrationSource}
          style={[
            styles.illustration,
            {
              // Responsive width based on screen size
              width: Math.min(screenWidth * 0.8, 300),
              maxHeight: 200
            }
          ]}
          resizeMode="contain"
          fadeDuration={200}
        />
      </View>

      {/* LOGIN SECTION */}
      <View style={styles.loginSection}>
        {renderGoogleButton()}

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}