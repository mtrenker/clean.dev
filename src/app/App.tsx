import React, {
  FC, StrictMode,
} from 'react';
import {
  BrowserRouter, Outlet, Route, Routes,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { Layout } from '../common/components/Layout';
import { Login } from '../features/user/Login';
import { Logout } from '../features/user/Logout';
import { useAuthenticator } from '../features/user/hooks/useAuthenticator';
import { ProjectsOverview } from '../features/projects/ProjectsOverview';
import { TimeTracking } from '../features/projects/TimeTracking';
import { store } from './store';

const theme = createTheme({ palette: { mode: 'dark' } });

export const App: FC = () => {
  useAuthenticator();
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="login" element={<Login />} />
                <Route path="logout" element={<Logout />} />
                <Route path="projects" element={<Outlet />}>
                  <Route index element={<ProjectsOverview />} />
                  <Route path=":projectId">
                    <Route index element={<div>ProjectDetails</div>} />
                    <Route path="track" element={<TimeTracking />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </StrictMode>
  );
};
