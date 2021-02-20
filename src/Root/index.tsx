import React, { ReactElement } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';

import routes from './routes';
import ErrorBoundary from './ErrorBoundary';

const Root = (): ReactElement => (
  <HashRouter>
    <ErrorBoundary>

      {renderRoutes(routes)}

    </ErrorBoundary>
  </HashRouter>
);

export default Root;
