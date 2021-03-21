import React, { ReactElement } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter } from 'react-router-dom';
import { Provider as UseChangeProvider } from 'use-change';

import routes from './routes';
import ErrorBoundary from './ErrorBoundary';
import './root.global.css';
import store from '../store';

import '../lib/binance';

const Root = (): ReactElement => (
  <ErrorBoundary>
    <HashRouter>
      <UseChangeProvider value={store}>
        {renderRoutes(routes)}
      </UseChangeProvider>
    </HashRouter>
  </ErrorBoundary>
);

export default Root;
