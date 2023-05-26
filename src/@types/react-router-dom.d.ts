import type { Path } from 'react-router-dom';

type LocationState = {
	from?: {
		pathname: string;
	};
};

export interface Location extends Path {
	state?: LocationState;
}

declare module 'react-router-dom' {
	export declare function useLocation(): Location;
}
