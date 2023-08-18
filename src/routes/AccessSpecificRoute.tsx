import { LOGIN_ROUTE } from '@/constants/routes';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import {  useEffect, type FC } from 'react';
import {  Outlet, useNavigate } from 'react-router-dom';


interface AccessSpecificRouteProps {
    accessRequired: string[];
}

const AccessSpecificRoute: FC<AccessSpecificRouteProps> = (props) => {
    const {accessRequired} = props;
    const navigate = useNavigate();
    const {
		state: { subLogQuery },
	} = useHeaderContext();
    
    useEffect(() => {
        if(subLogQuery.get().access && !subLogQuery.get().access?.some((access: string) => accessRequired.includes(access)) ){
            navigate(LOGIN_ROUTE) 
        }
        }
    , [subLogQuery.get().access])

    return <Outlet />;
};

export default AccessSpecificRoute;
