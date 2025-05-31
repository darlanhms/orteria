import { createContext, useContext, useEffect, useState } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

type BoardUser = {
  id: string;
  name: string;
};

type BoardItem = {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
};

type BoardColumn = {
  id: string;
  title: string;
  items: Y.Array<BoardItem>;
};

type Board = Y.Map<{
  id: string;
  title: string;
  createdAt: Date;
  users: Y.Array<BoardUser>;
  columns: Y.Array<BoardColumn>;
}>;

interface IBoardContext {
  board: Y.Map<Board>;
  ydoc: Y.Doc | null;
  isConnected: boolean;
}

const BoardContext = createContext<IBoardContext>({} as IBoardContext);

export const BoardProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [board, setBoard] = useState<Y.Map<Board> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ydoc = new Y.Doc();
    setYdoc(ydoc);

    const provider = new WebrtcProvider('outeria-board-bc48d0e0-fbee-4af4-84d3-ea741518ea1b', ydoc, {
      password: '123456',
    });

    const board = ydoc.getMap<Board>('board');

    setBoard(board);

    provider.on('synced', ({ synced }) => {
      console.log('Synced with clientID', synced, ydoc?.clientID);
    });

    provider.on('status', ({ connected }) => {
      setIsConnected(connected);
      console.log('Peer status changed to ', connected);
    });

    return () => {
      provider.destroy();
      ydoc?.destroy();
      setYdoc(null);
    };
  }, []);

  return <BoardContext.Provider value={{ board: board!, isConnected, ydoc }}>{children}</BoardContext.Provider>;
};

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
