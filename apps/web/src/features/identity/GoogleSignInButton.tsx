import { useEffect, useRef, useState } from 'react';

type CredentialResponse = { credential?: string };
type GoogleAccounts = {
  id: {
    initialize(config: { client_id: string; callback: (response: CredentialResponse) => void }): void;
    renderButton(element: HTMLElement, config: { theme: string; size: string; text: string; width: number }): void;
  };
};
declare global { interface Window { google?: { accounts: GoogleAccounts } } }

let scriptPromise: Promise<void> | undefined;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { scriptPromise = undefined; reject(new Error('Không tải được Google Sign-In.')); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function GoogleSignInButton({ clientId, mode, onCredential, onError }: {
  clientId: string;
  mode: 'login' | 'register';
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const errorCallback = useRef(onError);
  const [failed, setFailed] = useState(false);
  callback.current = onCredential;
  errorCallback.current = onError;

  useEffect(() => {
    let active = true;
    setFailed(false);
    loadGoogleScript().then(() => {
      if (!active || !container.current || !window.google?.accounts.id) return;
      const accounts = window.google.accounts.id;
      accounts.initialize({ client_id: clientId, callback: response => {
        if (response.credential) callback.current(response.credential);
        else errorCallback.current('Google không trả về thông tin đăng nhập.');
      } });
      container.current.replaceChildren();
      accounts.renderButton(container.current, {
        theme: 'outline', size: 'large', text: mode === 'register' ? 'signup_with' : 'signin_with', width: 280,
      });
    }).catch(() => {
      if (active) { setFailed(true); errorCallback.current('Không tải được Google Sign-In.'); }
    });
    return () => { active = false; };
  }, [clientId, mode]);

  return failed ? null : <div ref={container} style={{ display: 'flex', justifyContent: 'center' }} />;
}
