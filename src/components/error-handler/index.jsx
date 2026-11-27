import React from "react";
export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error) { console.error("Application error", error); }
  render() {
    if (this.state.error) return <main className="page-shell"><section className="card"><h1>Something went wrong</h1><p>Please reload and try again.</p></section></main>;
    return this.props.children;
  }
}
export function ErrorMessage({ children }) { return children ? <p className="error-message" role="alert">{children}</p> : null; }