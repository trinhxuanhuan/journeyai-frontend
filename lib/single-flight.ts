export function createSingleFlight<T>(
  operation: () => Promise<T>
): () => Promise<T> {
  let inFlight: Promise<T> | null = null;

  return () => {
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(operation)
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}
