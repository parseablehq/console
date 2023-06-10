import { useCallback, useRef } from 'react';
import { produce } from 'immer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SubData<T = any> {
	get: () => T;
	set: (value: T | ((prevState: T) => void)) => void;
	subscribe: (callback: (data: T) => void) => () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useSubscribeState = <T = any>(initialState: T): SubData<T> => {
	const store = useRef(initialState);

	const get = useCallback<SubData['get']>(() => store.current, []);

	const subscribers = useRef(new Set<(data: T) => void>());

	const set = useCallback<SubData['set']>((value) => {
		let state: T;
		if (typeof value === 'function') {
			state = produce<T>(store.current, value);
		} else {
			state = value;
		}
		store.current = state;
		subscribers.current.forEach((callback) => callback(state));
	}, []);

	const subscribe = useCallback<SubData['subscribe']>((callback: (data: T) => void) => {
		subscribers.current.add(callback);
		return () => subscribers.current.delete(callback);
	}, []);

	return {
		get,
		set,
		subscribe,
	};
};

export default useSubscribeState;
