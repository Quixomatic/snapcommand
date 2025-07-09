import React from 'react';

const PortalContext = React.createContext<HTMLElement | null>(null);

export function PortalProvider({ children, container }: { children: React.ReactNode; container: HTMLElement }) {
  return (
    <PortalContext.Provider value={container}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortalContainer() {
  const context = React.useContext(PortalContext);
  return context || document.body;
}