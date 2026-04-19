// components/error/ErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logError } from "@/lib/logger";
import { ErrorScreen } from "./ErrorScreen";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A standard React Error Boundary that catches rendering errors,
 * logs them to Google Cloud Logging, and displays a fallback ErrorScreen.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our structured cloud logger
    logError("ErrorBoundary", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorScreen 
          error={this.state.error} 
          reset={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

