import type { ReactNode } from 'react';

export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="phone-viewport">
      <div className="phone-frame">
        <div className="phone-screen">{children}</div>
      </div>
    </div>
  );
}
