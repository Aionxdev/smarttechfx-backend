

// src/hooks/useLocalStorage.js
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
    // Helper to get value from localStorage or use initialValue
    const getStoredValue = useCallback(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return initialValue;
        }
    }, [key, initialValue]); // initialValue should ideally be stable (primitive or memoized)

    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState(getStoredValue);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = useCallback(
        (value) => {
            if (typeof window === 'undefined') {
                console.warn(
                    `Tried setting localStorage key “${key}” even though environment is not a client`
                );
            }
            try {
                // Allow value to be a function so we have the same API as useState
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                // Save state
                setStoredValue(valueToStore);
                // Save to local storage
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.warn(`Error setting localStorage key “${key}”:`, error);
            }
        },
        [key, storedValue] // Include storedValue in dependencies for the updater function if value is a function
    );

    // This useEffect handles changes to `key` or `initialValue` from props after initial mount
    useEffect(() => {
        setStoredValue(getStoredValue());
    }, [key, getStoredValue]); // Re-run if key changes or if getStoredValue function instance changes (due to initialValue changing)

    // This useEffect handles synchronization across tabs/windows
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === key && event.storageArea === window.localStorage) {
                try {
                    setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
                } catch (error) {
                    console.warn(`Error parsing storage change for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]); // Important: initialValue is a dependency here

    return [storedValue, setValue];
}

export default useLocalStorage;