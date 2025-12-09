'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';

function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      console.error(error);
      const isDev = process.env.NODE_ENV === 'development';
      const description = isDev
        ? error.toString()
        : 'Please check your internet connection and try again.';

      toast({
        variant: 'destructive',
        title: 'Firebase Permission Error',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{description}</code>
          </pre>
        ),
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}

export default FirebaseErrorListener;
