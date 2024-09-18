import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';
import { useEffect, type FC } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { getStreamsSepcificAccess } from '@/components/Navbar/rolesHandler';
interface AccessSpecificRouteProps {
	accessRequired: string[];
}

const AccessSpecificRoute: FC<AccessSpecificRouteProps> = (props) => {
	const { accessRequired } = props;
	const navigate = useNavigate();
	const { streamName } = useParams();

	const [userRoles] = useAppStore((store) => store.userRoles);
	const streamSpecificAccess = getStreamsSepcificAccess(userRoles, streamName);
	useEffect(() => {
		if (
			streamSpecificAccess !== null &&
			!streamSpecificAccess?.some((access: string) => accessRequired.includes(access))
		) {
			navigate('/');
		}
	}, [streamSpecificAccess]);

	if (streamSpecificAccess === null) {
		return null;
	}

	return <Outlet />;
};

export default AccessSpecificRoute;
