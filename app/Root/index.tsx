import React, { ReactElement } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';

import routes from './routes';
import ErrorBoundary from './ErrorBoundary';
import './root.global.css';
import './theme.global.css';

const Root = (): ReactElement => (
  <ErrorBoundary>
    <HashRouter>
      {renderRoutes(routes)}
    </HashRouter>
  </ErrorBoundary>
);

export default Root;
