import { Badge, Box, Button, Modal, ScrollArea, Table, Text, TextInput, Tooltip, px } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useGetUserRole } from '@/hooks/useGetUserRoles';
import { IconBook2, IconPassword, IconPencil, IconTrash, IconUserPlus } from '@tabler/icons-react';
import { useGetUsers } from '@/hooks/useGetUsers';
import { useUsersStyles } from './styles';
import { useDeleteUser } from '@/hooks/useDeleteUser';
const Users: FC = () => {
	useDocumentTitle('Parseable | Users');

	const { data: users, error: usersError, loading: usersLoading, getUsersList, resetData: usersReset } = useGetUsers();

	const [tableRows, setTableRows] = useState<any>([]);
	useEffect(() => {
		getUsersList();

		return () => {
			usersReset();
		};
	}, []);



	useEffect(() => {
		if (users) {
			const getrows = async () => {
				let rows = users.map((user: any) => {
					return (<RoleTd Username={user} />);
				});
				setTableRows(rows);
			};

			getrows();
		}
		if(usersError){
			setTableRows(<tr><td>error</td></tr>)
		}
		if(usersLoading){
			setTableRows(<tr><td>loading</td></tr>)
		}
	}, [users, usersError, usersLoading]);



	const { classes } = useUsersStyles();
	return (
		<Box className={classes.container}>
			<Box className={classes.headerContainer}>
				<Text className={classes.textContext}> Users Managemant </Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
				<Tooltip label={'Docs'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
						<Button variant="default" className={classes.actionBtn} onClick={()=>{
							window.open('https://www.parseable.io/docs/rbac', '_blank');
						}}>
							<IconBook2 size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
					<Tooltip
						label={'Create New User'}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button variant="default" className={classes.actionBtn} aria-label="create user">
							<IconUserPlus size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
					
				</Box>
			</Box>

			<ScrollArea className={classes.tableContainer} type="always">
				<Table striped highlightOnHover className={classes.tableStyle}>
					<thead className={classes.theadStyle}>
						<tr >
							<th>Username</th>
							<th>Role</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>{tableRows}</tbody>
				</Table>
			</ScrollArea>
			
		</Box>
	);
};

export default Users;












interface RoleTdProps {
	Username: string;
}

const RoleTd: FC<RoleTdProps> = (props) => {
	const { Username } = props;
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();
	const [deleteUser, setDeleteUser] = useState('');
	const {getUsersList} = useGetUsers();

	const {
		data: userRole,
		error: userRoleError,
		loading: userRoleLoading,
		getRoles,
		resetData: userRoleReset,
	} = useGetUserRole();
	const {
		data: deletedUser,
		deleteUserFun: deleteUserAction,
		resetData: deletedUserReset,
	} = useDeleteUser()


	useEffect(() => {
		if (deletedUser) {
			getUsersList();
			deletedUserReset();
		}

	}
	, [deletedUser]);


	useEffect(() => {
		getRoles(Username);

		return () => {
			userRoleReset();
		};
	}, [Username]);

	useEffect(() => {
		console.log(userRole, Username);
	}, [userRole]);

	const getBadges = (userRole: any) => {
		if (userRole.length > 0) {
			const Badges = userRole.map((role: any) => {
				if (role.privilege === 'admin' || role.privilege === 'editor') {
					return <Badge color="green">{role.privilege}</Badge>;
				}

				if (role.privilege === 'reader') {
					if (role.resource?.tag) {
						return (
							<Badge color="orange">
								{role.privilege} of {role.resource?.stream} with {role.resource?.tag}
							</Badge>
						);
					}
					return (
						<Badge color="cyan">
							{role.privilege} of {role.resource?.stream}
						</Badge>
					);
				}
				return (
					<Badge color="blue">
						{role.privilege} of {role.resource?.stream}
					</Badge>
				);
			});
			return Badges;
		} else {
			return <Badge color="red">No Role</Badge>;
		}
	};



	const handleCloseDelete = () => {
		closeDelete();
		setDeleteUser('');
		
	};
	const handleDelete = () => {
		deleteUserAction(Username);
		closeDelete();
	};

	const { classes } = useUsersStyles();


	return (
	
		<tr key={Username} className={classes.trStyle}>
		<td>{Username}</td>
		<td>
		
			{userRoleError ? (
				'Error'
			) : userRoleLoading ? (
				'loading..'
			) : userRole ? (
				getBadges(userRole)
			) : (
				<Badge color="red">No Role</Badge>
			)}

		</td>
		<td>
			<Box style={{ height: '100%', width: '100%' , whiteSpace: 'nowrap' }}>
				<Tooltip
					label={'Delete'}
					sx={{ color: 'white', backgroundColor: 'black' }}
					withArrow
					position="right">
					<Button variant="default" className={classes.actionBtn} aria-label="Delete user" 
						onClick={() => {
							openDelete();
						}}
						>
						<IconTrash size={px('1.2rem')} stroke={1.5} />
					</Button>
				</Tooltip>
				<Tooltip label={'Edit'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
					<Button variant="default" className={classes.actionBtn}>
						<IconPencil size={px('1.2rem')} stroke={1.5} />
					</Button>
				</Tooltip>
				<Tooltip
					label={'Reset Password'}
					sx={{ color: 'white', backgroundColor: 'black' }}
					withArrow
					position="right">
					<Button variant="default" className={classes.actionBtn}>
						<IconPassword size={px('1.2rem')} stroke={1.5} />
					</Button>
				</Tooltip>
			</Box>
		</td>
		<Modal withinPortal size="md" opened={openedDelete} onClose={handleCloseDelete} title={'Delete User'} centered>
				<Text>Are you sure you want to delete this User?</Text>
				<TextInput
					type="text"
					onChange={(e) => {
						setDeleteUser(e.target.value);
					}}
					placeholder={`Type the name of the  to Users. i.e: ${Username}`}
				/>

				<Box mt={10} display="flex" sx={{ justifyContent: 'end' }}>
					<Button
						variant="filled"
						color="red"
						sx={{ margin: '12px' }}
						disabled={deleteUser === Username ? false : true}
						onClick={handleDelete}
						>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant="filled" color="green" sx={{ margin: '12px' }}>
						Cancel
					</Button>
				</Box>
			</Modal>
	</tr>
	);
};
