import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Render error caught by ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <div className="mt-4 font-heading text-2xl font-bold text-red-950">Something went wrong</div>
            <p className="mt-2 text-sm text-red-700">{this.state.message || "An unexpected render error occurred."}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
