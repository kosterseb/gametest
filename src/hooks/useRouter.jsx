import { createContext, useContext, useState } from 'react';

const RouterContext = createContext();

export const Router = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState('/menu');
  const [routeParams, setRouteParams] = useState({});

  const navigate = (path, params = {}) => {
    setCurrentRoute(path);
    setRouteParams(params);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, routeParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within Router');
  }
  return context;
};