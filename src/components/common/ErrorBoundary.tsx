import { Component, ReactNode } from 'react';
import ErrorFallback from '@/components/design-system/ErrorFallback';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReload={() => window.location.reload()}
          onGoHome={() => { this.setState({ error: null }); window.location.href = '/'; }}
        />
      );
    }
    return this.props.children;
  }
}
