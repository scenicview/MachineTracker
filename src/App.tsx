import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import ClientForm from './pages/ClientForm';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetail from './pages/EquipmentDetail';
import EquipmentForm from './pages/EquipmentForm';
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import ServiceForm from './pages/ServiceForm';
import CategoryManager from './pages/CategoryManager';

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { label: 'Clients', icon: '👤', path: '/clients' },
    { label: 'Equipment', icon: '🔧', path: '/equipment' },
    { label: 'Services', icon: '📋', path: '/services' },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => {
        const isActive = path.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            className={`tab-item ${isActive ? 'tab-active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/clients" replace />} />

          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />

          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/new" element={<EquipmentForm />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/equipment/:id/edit" element={<EquipmentForm />} />

          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/new" element={<ServiceForm />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/services/:id/edit" element={<ServiceForm />} />

          <Route path="/categories" element={<CategoryManager />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  );
}
