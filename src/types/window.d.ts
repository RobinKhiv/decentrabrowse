interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (params: any) => void) => void;
    removeListener: (event: string, callback: (params: any) => void) => void;
  };
}

interface WebViewEvent {
  url: string;
  errorCode: number;
  errorDescription: string;
}

interface HTMLWebViewElement extends HTMLElement {
  src: string;
  loadURL: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  stop: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  isLoading: () => boolean;
  getURL: () => string;
  getTitle: () => string;
  executeJavaScript: (code: string) => Promise<any>;
  addEventListener: (type: string, listener: (event: WebViewEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: WebViewEvent) => void) => void;
  onDidFailLoad: (callback: (event: WebViewEvent) => void) => void;
  onDidNavigate: (callback: (event: WebViewEvent) => void) => void;
} 