
import { StatusCodes } from 'http-status-codes';
import useMountedState from './useMountedState';
import { deleteRole } from '@/api/roles';

export const useDeleteRole = () => {
    const [data, setData] = useMountedState<any | null>(null);
    const [error, setError] = useMountedState<string | null>(null);
    const [loading, setLoading] = useMountedState<boolean>(false);

    const deleteRoleFun = async (roleName:string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await deleteRole(roleName);

            switch (res.status) {
                case StatusCodes.OK: {
                    setData(res.data);
                    break;
                }
                default: {
                    setError('Failed to Delete Roles');
                    console.error(res);
                }
            }
        } catch(error) {
            setError('Failed to Delete Roles');
            console.error(error);	
        } finally {
            setLoading(false);
        }
    };

    const resetData = () => {
        setData(null);
    };

    return { data, error, loading, deleteRoleFun, resetData };
}