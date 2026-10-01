import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
          <AlertTriangle className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          You are not registered to use this app. Please contact the app owner to be invited.
        </p>
      </div>
    </div>
  );
}