import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useOuterClick = (callback: (event: any) => void): MutableRefObject<HTMLDivElement | null> => {
	const innerRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (innerRef.current && !(innerRef.current as any).contains(event.target)) {
				callback(event);
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [callback]);

	return innerRef;
};
