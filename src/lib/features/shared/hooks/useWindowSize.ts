import { onMount } from 'svelte';
import { writable } from 'svelte/store';

export function useWindowSize() {
    const width = writable(0);

    onMount(() => {
        function handleResize() {
            width.set(window.innerWidth);
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Establecer valor inicial

        return () => window.removeEventListener('resize', handleResize);
    });

    return width;
}