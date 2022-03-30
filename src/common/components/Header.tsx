import React from 'react';
import {
  AppBar, Container, List, ListItem, Typography,
} from '@mui/material';
import { useAuthenticator } from '../../features/user/hooks/useAuthenticator';
import { Link } from './Link';

export const Header: React.VFC = () => {
  const { user } = useAuthenticator();
  return (
    <AppBar>
      <Container sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      >
        <Typography>clean.dev</Typography>
        <List sx={{
          display: 'flex',
        }}
        >
          <ListItem><Link to="/">Home</Link></ListItem>
          <ListItem><Link to="/blog">Blog</Link></ListItem>
          {user && (
            <ListItem><Link to="/projects">Projects</Link></ListItem>
          )}
          {!user && (
            <ListItem><Link to="/login">Login</Link></ListItem>
          )}
          {user && (
            <ListItem><Link to="/logout">Logout</Link></ListItem>
          )}
        </List>
      </Container>
    </AppBar>
  );
};
