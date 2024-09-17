import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect, type FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import _ from 'lodash';
interface AccessSpecificRouteProps {
	accessRequired: string[];
}

const AccessSpecificRoute: FC<AccessSpecificRouteProps> = (props) => {
	const { accessRequired } = props;
	const navigate = useNavigate();

	const [streamSpecificUserAccess] = useAppStore((store) => store.streamSpecificUserAccess);

	useEffect(() => {
		if (
			streamSpecificUserAccess !== null &&
			!streamSpecificUserAccess?.some((access: string) => accessRequired.includes(access))
		) {
			navigate('/');
		}
	}, [streamSpecificUserAccess]);

	if (streamSpecificUserAccess === null) {
		return null;
	}

	return <Outlet />;
};

export default AccessSpecificRoute;
