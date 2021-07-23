import { Component, ReactNode } from 'react';
interface Props {
    children: ReactNode;
}
interface State {
    error: null | Error | string;
}
export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: {
        children: ReactNode;
    });
    componentDidCatch(error: Error | string): void;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map