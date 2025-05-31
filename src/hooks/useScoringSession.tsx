import { createContext, useContext, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import {
  ScoringSessionWebrtcProvider,
  type ScoringSession,
  type ScoringSessionRequest,
  type ScoringUser,
} from '../lib/score';

interface IScoringSessionContext {
  scoringSession: ScoringSession | null;
  isLoadingSession: boolean;
  isConnected: boolean;
  addUser: (user: ScoringUser) => void;
  currentUserId: string | null;
}

const ScoringSessionContext = createContext<IScoringSessionContext>({} as IScoringSessionContext);

interface ScoringSessionProviderProps {
  sessionId: string;
  newScoringSession?: ScoringSessionRequest;
}

export const ScoringSessionProvider: React.FC<React.PropsWithChildren<ScoringSessionProviderProps>> = ({
  children,
  sessionId,
  newScoringSession,
}) => {
  const ydoc = useRef<Y.Doc | null>(null);
  const yScoringSession = useRef<Y.Map<any> | null>(null);
  const [scoringSession, setScoringSession] = useState<ScoringSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    ydoc.current = new Y.Doc();

    const provider = new ScoringSessionWebrtcProvider(sessionId, ydoc.current);

    const internalScoringSession = ydoc.current.getMap('scoringSession');

    if (newScoringSession && !internalScoringSession.get('id')) {
      internalScoringSession.set('id', sessionId);
      internalScoringSession.set('name', newScoringSession.name);
      internalScoringSession.set('possibleScores', newScoringSession.possibleScores);
      internalScoringSession.set('createdAt', new Date());
      internalScoringSession.set('ownerId', crypto.randomUUID());
      internalScoringSession.set('users', [
        {
          id: internalScoringSession.get('ownerId'),
          name: newScoringSession.ownerName,
        },
      ]);
      internalScoringSession.set('currentScore', [
        {
          score: null,
          userId: internalScoringSession.get('ownerId'),
        },
      ]);

      setCurrentUserId(internalScoringSession.get('ownerId') as string);
    }

    yScoringSession.current = internalScoringSession as Y.Map<ScoringSession>;
    setIsLoadingSession(false);

    provider.on('status', ({ connected }) => {
      setIsConnected(connected);
      console.log('Peer status changed to ', connected);
    });

    return () => {
      provider.destroy();
      ydoc.current?.destroy();
      ydoc.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isConnected) {
      return undefined;
    }

    const onScoreSessionChange = () => {
      setScoringSession(yScoringSession.current?.toJSON() as ScoringSession);
    };

    yScoringSession.current?.observeDeep(onScoreSessionChange);

    return () => {
      yScoringSession.current?.unobserveDeep(onScoreSessionChange);
    };
  }, [isConnected]);

  const addUser = (user: ScoringUser) => {
    setCurrentUserId(user.id);
    yScoringSession.current?.set('users', [...(yScoringSession.current?.get('users') || []), user]);
    yScoringSession.current?.set('currentScore', [
      ...(yScoringSession.current?.get('currentScore') || []),
      {
        score: null,
        userId: user.id,
      },
    ]);
  };

  return (
    <ScoringSessionContext.Provider
      value={{
        scoringSession,
        isLoadingSession,
        isConnected,
        addUser,
        currentUserId,
      }}
    >
      {children}
    </ScoringSessionContext.Provider>
  );
};

export function useScoringSession() {
  const context = useContext(ScoringSessionContext);
  if (!context) {
    throw new Error('useScoringSession must be used within a ScoringSessionProvider');
  }
  return context;
}
