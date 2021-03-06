import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode }

interface State { error: null | Error | string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: Error | string): void {
    this.setState({ error });
  }

  render(): ReactNode {
    const { error } = this.state;
    const { children } = this.props;
    if (error !== null) {
      return (
        <div>
          <div>
            <h4>Error</h4>
            <h6>Cannot render the page</h6>
          </div>
          <pre>
            <code>
              {String(error)}
            </code>
          </pre>
        </div>
      );
    }

    return children;
  }
}
