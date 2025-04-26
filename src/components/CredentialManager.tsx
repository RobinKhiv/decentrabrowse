import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  List, 
  ListItem, 
  ListItemText, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff, Add } from '@mui/icons-material';
import { IdentityService, Credential } from '../identity/IdentityService';

interface CredentialManagerProps {
  identityService: IdentityService;
}

export const CredentialManager: React.FC<CredentialManagerProps> = ({ identityService }) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [open, setOpen] = useState(false);
  const [newCredential, setNewCredential] = useState({
    website: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      const creds = await identityService.getCredentials();
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleAddCredential = async () => {
    if (!identityService) return;

    try {
      await identityService.addCredential({
        website: newCredential.website,
        username: newCredential.username,
        password: newCredential.password
      });
      setNewCredential({ website: '', username: '', password: '' });
      setOpen(false);
      await loadCredentials();
    } catch (error) {
      console.error('Error adding credential:', error);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Saved Credentials</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Credential
        </Button>
      </Box>

      <List>
        {credentials.map((credential) => (
          <ListItem
            key={credential.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => togglePasswordVisibility(credential.id)}
              >
                {showPassword[credential.id] ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
          >
            <ListItemText
              primary={credential.website}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    Username: {credential.username}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2">
                    Password: {showPassword[credential.id] ? credential.password : '••••••••'}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Credential</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Website"
            fullWidth
            value={newCredential.website}
            onChange={(e) => setNewCredential({ ...newCredential, website: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={newCredential.username}
            onChange={(e) => setNewCredential({ ...newCredential, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newCredential.password}
            onChange={(e) => setNewCredential({ ...newCredential, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddCredential} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 