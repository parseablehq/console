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
			!_.isEmpty(streamSpecificUserAccess) &&
			!streamSpecificUserAccess?.some((access: string) => accessRequired.includes(access))
		) {
			navigate('/');
		}
	}, [streamSpecificUserAccess]);

	return <Outlet />;
};

export default AccessSpecificRoute;
