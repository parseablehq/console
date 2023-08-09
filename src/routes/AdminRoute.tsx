import { LOGIN_ROUTE } from '@/constants/routes';
import { useGetUserRole } from '@/hooks/useGetUserRoles';

import { useLocalStorage } from '@mantine/hooks';
import { useEffect, type FC } from 'react';
import {  Outlet, useNavigate } from 'react-router-dom';

const AdminRoute: FC = () => {
    const [username] = useLocalStorage({ key: 'username', getInitialValueInEffect: false });
    const { data, error, loading, getRoles, resetData  } = useGetUserRole();
    const navigate = useNavigate();
    

    useEffect(() => {
        if (username) {
            getRoles(username);
        }
    }, [username]);

    useEffect(() => {
        if (error) {
            resetData();
            navigate(LOGIN_ROUTE);
        }
        else if (data) {
            
        }

    },[data, error, loading])



	

	return  <Outlet />
	
};

export default AdminRoute;
