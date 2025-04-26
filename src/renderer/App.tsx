import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Tabs, Tab, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { VpnKey, Search } from '@mui/icons-material';
import { ethers } from 'ethers';
import { IdentityService } from '../identity/IdentityService';
import { CredentialManager } from '../components/CredentialManager';
import { WalletConnect } from '../components/WalletConnect';
import { WalletInfo, EthereumProvider } from '../types';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [identityService, setIdentityService] = useState<IdentityService | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const webviewRef = useRef<HTMLWebViewElement>(null);

  const handleWalletConnect = async (identityService: IdentityService) => {
    setIdentityService(identityService);
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url) return;

    setIsSearching(true);
    try {
      // In a real implementation, you would call a search API here
      // For now, we'll simulate search results
      const mockResults: SearchResult[] = [
        {
          title: `${url} - Official Website`,
          url: `https://${url}`,
          snippet: `Official website for ${url}. Click to visit.`
        },
        {
          title: `${url} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${url}`,
          snippet: `Wikipedia article about ${url}.`
        },
        {
          title: `${url} - News`,
          url: `https://news.google.com/search?q=${url}`,
          snippet: `Latest news about ${url}.`
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (resultUrl: string) => {
    if (webviewRef.current) {
      try {
        // Ensure URL has proper protocol and format
        let formattedUrl = resultUrl;
        if (!resultUrl.startsWith('http://') && !resultUrl.startsWith('https://')) {
          // Check if it's a domain name without TLD
          if (!resultUrl.includes('.')) {
            formattedUrl = `https://www.${resultUrl}.com`;
          } else {
            formattedUrl = `https://${resultUrl}`;
          }
        }
        
        // Clear any existing content
        webviewRef.current.src = 'about:blank';
        
        // Add a small delay to ensure the webview is ready
        setTimeout(() => {
          webviewRef.current!.src = formattedUrl;
          console.log('Navigating to:', formattedUrl);
        }, 100);
      } catch (error) {
        console.error('Error navigating to URL:', error);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<Search />} label="Browser" />
          <Tab icon={<VpnKey />} label="Credentials" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search or enter URL"
              value={url}
              onChange={handleUrlChange}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <Paper sx={{ mt: 2, p: 2, flex: 1, overflow: 'auto' }}>
              <List>
                {searchResults.map((result, index) => (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => handleResultClick(result.url)}
                    sx={{ 
                      mb: 1,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <ListItemText
                      primary={result.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {result.url}
                          </Typography>
                          <br />
                          {result.snippet}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Box sx={{ flex: 1, mt: 2 }}>
            <webview
              ref={webviewRef}
              src="about:blank"
              style={{ width: '100%', height: '100%', border: '1px solid #ccc' }}
              partition="persist:main"
              webpreferences="allowRunningInsecureContent, javascript=yes, webSecurity=no"
              allowpopups
              nodeintegration
              plugins
              onLoad={(event) => {
                console.log('Navigation completed:', webviewRef.current?.getURL());
              }}
              onError={(event) => {
                console.error('Navigation failed:', event);
              }}
            />
          </Box>
        </Box>
      )}
      {tabValue === 1 && (
        <Box sx={{ p: 2 }}>
          {!identityService ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Connect your wallet to manage credentials</Typography>
              <WalletConnect onConnect={handleWalletConnect} />
            </Box>
          ) : (
            <CredentialManager identityService={identityService} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default App; 