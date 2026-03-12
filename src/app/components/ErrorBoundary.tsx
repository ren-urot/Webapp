import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>
          <h1 style={{ color: "#ff4e00", fontSize: 24, marginBottom: 16 }}>
            Something went wrong
          </h1>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 14,
              color: "#333",
            }}
          >
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
