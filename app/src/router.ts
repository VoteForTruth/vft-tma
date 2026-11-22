import { useEffect, useState } from 'react';

// Minimal hash router: #/ (feed), #/s/<address> (statement), #/me (profile).
// Hash routing works on any static hosting and inside Telegram without server rules.
export type Route =
  | { name: 'feed' }
  | { name: 'statement'; address: string }
  | { name: 'profile' };

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 's' && parts[1])
    return { name: 'statement', address: parts[1] };
  if (parts[0] === 'me') return { name: 'profile' };
  return { name: 'feed' };
}

export function routeHash(route: Route): string {
  switch (route.name) {
    case 'statement':
      return `#/s/${route.address}`;
    case 'profile':
      return '#/me';
    default:
      return '#/';
  }
}

export function navigate(route: Route) {
  window.location.hash = routeHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
