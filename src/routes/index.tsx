import { createFileRoute } from '@tanstack/react-router';
import { use, useMemo, useRef, useSyncExternalStore } from 'react';
import { ExternalSyncContext } from '../hooks/useExternalSync';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { ydoc } = use(ExternalSyncContext);
  const prevDataRef = useRef<string>('');

  const helloWordString = useMemo(() => ydoc?.getText('hello_world'), [ydoc]);

  const string = useSyncExternalStore(
    callback => {
      helloWordString?.observeDeep(callback);
      return () => helloWordString?.unobserveDeep(callback);
    },
    () => {
      const data = helloWordString?.toJSON() ?? '';
      if (prevDataRef.current === data) {
        return prevDataRef.current;
      } else {
        prevDataRef.current = data;
        return prevDataRef.current;
      }
    },
    () => helloWordString?.toJSON() ?? '',
  );

  return (
    <div>
      Hello "/"!
      <input
        type="text"
        value={string}
        onChange={e => {
          if (!helloWordString) return;

          const newValue = e.target.value;
          helloWordString.delete(0, helloWordString.length);
          helloWordString.insert(0, newValue);
        }}
      />
    </div>
  );
}
