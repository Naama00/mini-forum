import { useEffect } from 'react';

/**
 * Hook to run effect on mount
 * @param {function} callback
 */
export function useMount(callback) {
  useEffect(() => {
    callback();
  }, []);
}

export default useMount;
