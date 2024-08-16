import { LOGIN_ROUTE } from '@/constants/routes';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect, type FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

interface AccessSpecificRouteProps {
	accessRequired: string[];
}

const AccessSpecificRoute: FC<AccessSpecificRouteProps> = (props) => {
	const { accessRequired } = props;
	const navigate = useNavigate();

	const [streamSpecificUserAccess] = useAppStore((store) => store.streamSpecificUserAccess);

	useEffect(() => {
		if (
			streamSpecificUserAccess &&
			!streamSpecificUserAccess?.some((access: string) => accessRequired.includes(access))
		) {
			navigate(LOGIN_ROUTE);
		}
	}, [streamSpecificUserAccess]);

	return <Outlet />;
};

export default AccessSpecificRoute;
