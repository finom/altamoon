import React, { ReactElement } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';

import routes from './routes';
import ErrorBoundary from './ErrorBoundary';
import './Root.global.css';

const Root = (): ReactElement => (
  <ErrorBoundary>
    <HashRouter>
      {renderRoutes(routes)}
    </HashRouter>
  </ErrorBoundary>
);

export default Root;
