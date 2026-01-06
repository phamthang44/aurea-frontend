'use client';

import { useEffect } from "react";
import { ErrorMessage } from "@/components/errors/error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html>
      <body>
        <ErrorMessage
          error={error}
          onRetry={reset}
          variant="default"
        />
      </body>
    </html>
  );
}


