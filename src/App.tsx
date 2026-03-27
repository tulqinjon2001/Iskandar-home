import { AdminPage } from './components/pages/AdminPage';
import { LandingPage } from './components/pages/LandingPage';
import { ServicePage } from './components/pages/ServicePage';

function App() {
  const pathname = window.location.pathname;
  const isLoginPage = pathname === '/login';
  const isLoginEditPage = pathname.startsWith('/login/edit/');
  const isServicePage = pathname.startsWith('/services/');

  if (isLoginPage || isLoginEditPage) {
    return <AdminPage isEditPage={isLoginEditPage} editImageId={pathname.split('/')[3]} />;
  }

  if (isServicePage) {
    return <ServicePage serviceSlug={pathname.split('/')[2]} />;
  }

  return <LandingPage />;
}

export default App;
