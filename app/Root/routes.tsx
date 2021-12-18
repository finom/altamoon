import { RouteConfig } from 'react-router-config';
import FuturesTradingScreen from '../screens/FuturesTradingScreen';

/*
const Foo = (): ReactElement => (
  <div>
    <h1>This is Foo</h1>
    <Link to="/bar" replace>
      <Button color="secondary">bar</Button>
    </Link>
  </div>
);

const Bar = (): ReactElement => (
  <div>
    <h1>This is Bar</h1>
    <Link to="/" replace>
      <Button color="primary">foo</Button>
    </Link>
  </div>
);
*/

const routes: RouteConfig[] = [
  { path: '/', exact: true, component: FuturesTradingScreen },
];

export default routes;
