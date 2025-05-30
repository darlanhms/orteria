import { createContext, useEffect, useRef, useState } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

interface IExternalSync {
  clientID: number | null;
  isConnected: boolean;
  ydoc: Y.Doc | null;
}

export const ExternalSyncContext = createContext<IExternalSync>({} as IExternalSync);

export const ExternalSyncProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const provider = useRef<WebrtcProvider>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [clientID, setClientID] = useState<number | null>(null);

  useEffect(() => {
    if (provider.current?.connected) {
      return;
    }

    const ydoc = new Y.Doc();
    setYdoc(ydoc);
    provider.current = new WebrtcProvider('outeria-bc48d0e0-fbee-4af4-84d3-ea741518ea1b', ydoc, {
      password: '123456',
    });

    provider.current.on('synced', ({ synced }) => {
      console.log('Synced with clientID', synced, ydoc?.clientID);
    });

    provider.current.on('status', ({ connected }) => {
      setIsConnected(connected);
      console.log('Peer status changed to ', connected);
    });

    setClientID(ydoc.clientID);

    // Cleanup function
    return () => {
      if (provider.current) {
        provider.current.destroy();
        provider.current = null;
      }
      if (ydoc) {
        ydoc.destroy();
        setYdoc(null);
      }
    };
  }, []);

  return (
    <ExternalSyncContext.Provider value={{ clientID, isConnected, ydoc }}>
      {children}
    </ExternalSyncContext.Provider>
  );
};
