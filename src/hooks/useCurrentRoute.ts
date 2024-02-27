import { PATHS } from "@/constants/routes"
import { matchRoutes, useLocation } from "react-router-dom"

const routes = Object.keys(PATHS).map((key: string) => {
	const value = PATHS[key];
	return {path: value};
});

const useCurrentRoute = () => {
	const location = useLocation();
	// @ts-ignore
	const [{ route }] = matchRoutes(routes, location);

	return route.path;
};

export default useCurrentRoute;