import { writable, type Writable } from 'svelte/store';
import type Graph from 'graphology';

export const GraphStore: Writable<Graph> = writable();
