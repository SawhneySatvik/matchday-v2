"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return (
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places", "routes", "geometry"]}
      >
        {children}
      </APIProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places", "routes", "geometry"]}
      >
        {children}
      </APIProvider>
    </GoogleOAuthProvider>
  );
}

// TODO(01:12): Configure global providers and context wrappers