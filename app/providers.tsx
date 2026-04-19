import { APIProvider } from "@vis.gl/react-google-maps";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = !googleClientId ? (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      libraries={["places", "routes", "geometry"]}
    >
      {children}
    </APIProvider>
  ) : (
    <GoogleOAuthProvider clientId={googleClientId}>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places", "routes", "geometry"]}
      >
        {children}
      </APIProvider>
    </GoogleOAuthProvider>
  );

  return <ErrorBoundary>{content}</ErrorBoundary>;
}