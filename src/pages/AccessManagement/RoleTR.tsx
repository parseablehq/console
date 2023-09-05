import { useGetUserRole } from '@/hooks/useGetUserRoles';
import { usePutUserRole } from '@/hooks/usePutUserRole';
import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
	px,
	rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTransform, IconTrash, IconX } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useUsersStyles } from './styles';
import { Prism } from '@mantine/prism';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { usePostUserResetPassword } from '@/hooks/usePostResetPassword';
import { useGetRoles } from '@/hooks/useGetRoles';

interface RoleTRProps {
	user: {
		id: string;
		method: string;
	};
	getUsersList: () => void;
}

const RoleTR: FC<RoleTRProps> = (props) => {
	const { user, getUsersList } = props;
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();
	const [openedDeleteRole, { close: closeDeleteRole, open: openDeleteRole }] = useDisclosure();
	const [openedEditModal, { close: closeEditModal, open: openEditModal }] = useDisclosure();

	const [deleteRole, setDeleteRole] = useState<string | null>(null);
	const [opened, { open, close }] = useDisclosure(false);
	const [UserInput, setUserInput] = useState<string>('');
	const [SelectedRole, setSelectedRole] = useState<string>('');
	const [roleSearchValue, setRoleSearchValue] = useState<string>('');


	const { putRole, data: putRoleData, resetData: resetPutRoleData } = usePutUserRole();
	const {
		data: newPassword,
		error: resetPasswordError,
		loading: resetPasswordLoading,
		resetPasswordUser,
		resetData: resetNewPassword,
	} = usePostUserResetPassword();
	const {
		data: userRole,
		error: userRoleError,
		loading: userRoleLoading,
		getRoles,
		resetData: userRoleReset,
	} = useGetUserRole();
	const { data: deletedUser, deleteUserFun: deleteUserAction, resetData: deletedUserReset } = useDeleteUser();
	const { data: roles, getRolesList, resetData: rolesReset } = useGetRoles();

	useEffect(() => {
		if (deletedUser) {
			getUsersList();
			deletedUserReset();
		}
	}, [deletedUser]);

	useEffect(() => {
		getRoles(user.id);
		getRolesList();

		return () => {
			rolesReset();
			userRoleReset();
		};
	}, [user]);

	useEffect(() => {
		if (putRoleData) {
			getRoles(user.id);
		}
		return () => {
			resetPutRoleData();
		};
	}, [putRoleData]);

	const removeButton = (role: string) => (
		<ActionIcon
			size="xs"
			color="blue"
			radius="xl"
			variant="transparent"
			onClick={() => {
				openDeleteRole();
				setDeleteRole(role);
			}}>
			<IconX size={rem(10)} />
		</ActionIcon>
	);

	const getBadge = (role: any, withAction: boolean) => {
		return (
			<Badge color="orange" rightSection={withAction ? removeButton(role) : ''} variant={'light'}>
				{role}
			</Badge>
		);
	};
	const getBadges = (userRole: any) => {
		if (Object.keys(userRole).length > 0) {
			const Badges = Object.keys(userRole).map((role: any) => {
				return <span key={role}> {getBadge(role, user.method === 'native' ? true : false)}</span>;
			});
			return Badges;
		} else {
			return (
				<Badge color="red" variant={'light'}>
					No Role
				</Badge>
			);
		}
	};

	// For Delete User
	const handleCloseDelete = () => {
		closeDelete();
		setUserInput('');
	};
	const handleDelete = () => {
		deleteUserAction(user.id);
		closeDelete();
		setUserInput('');
	};

	// For Delete Role
	const handleRoleDelete = () => {
		let filtered = Object.keys(userRole).filter((role) => role !== deleteRole);
		putRole(user.id, filtered);
		closeDeleteRole();
		setDeleteRole(null);
	};
	const handleCloseRoleDelete = () => {
		closeDeleteRole();
		setUserInput('');
	};

	// For Edit Role

	const handleCloseRoleEdit = () => {
		closeEditModal();
		setSelectedRole('');
		setRoleSearchValue('');
	};

	const handleEditUserRole = () => {
		
		let userRoleArray: any = Object.keys(userRole);
		if (userRoleArray.includes(SelectedRole) || SelectedRole === '') {
			return;
		}
		userRoleArray.push(SelectedRole);
		
		putRole(user.id, userRoleArray);
		handleCloseRoleEdit();
	};



	//for reset password

	const handleCloseResetPassword = () => {
		close();
		setUserInput('');
		resetNewPassword();
	};

	const handleResetPassword = () => {
		resetPasswordUser(UserInput);
	};

	const { classes } = useUsersStyles();

	return (
		<tr key={user.id} className={classes.trStyle}>
			<td>{user.id}</td>
			<td>
				{userRoleError ? (
					'Error'
				) : userRoleLoading ? (
					'loading..'
				) : userRole ? (
					<>
						{getBadges(userRole)}
						<Tooltip label={'Add a Role'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
							<Badge color="green" onClick={openEditModal}>
								<IconPlus size={rem(10)} />
							</Badge>
						</Tooltip>
					</>
				) : (
					<Badge color="red">Error</Badge>
				)}
			</td>
			<td>
				<Box style={{ height: '100%', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>
					<Tooltip label={'Delete'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
						<Button
							variant="default"
							className={classes.actionBtn}
							aria-label="Delete user"
							onClick={() => {
								openDelete();
							}}>
							<IconTrash size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
				</Box>
			</td>
			<td>
				<Box style={{ height: '100%', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>
					<Tooltip
						label={user.method!=="native"? "Cannot reset password for this user":'Reset Password'}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
							
							<Button variant="default" className={classes.actionBtn} onClick={()=>{
								if(user.method==="native"){
									open();
								}
							}} >
							<IconTransform size={px('1.2rem')} stroke={1.5} />
						</Button>
							
					</Tooltip>
				</Box>
			</td>
			<Modal
				withinPortal
				size="md"
				opened={openedDelete}
				onClose={handleCloseDelete}
				title={'Delete user'}
				className={classes.modalStyle}
				centered>
				<TextInput
					label="Are you sure you want to delete this user?"
					type="text"
					onChange={(e) => {
						setUserInput(e.target.value);
					}}
					placeholder={`Please enter the user to confirm, i.e. ${user.id}`}
					required
				/>

				<Group position="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						disabled={UserInput === user.id ? false : true}
						onClick={handleDelete}>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
			{userRole && deleteRole && userRole[deleteRole] ? (
				<Modal
					withinPortal
					size="md"
					opened={openedDeleteRole}
					onClose={handleCloseRoleDelete}
					title={'Delete user role'}
					centered
					className={classes.modalStyle}>
					<Stack>
						<Text>{getBadge(deleteRole, false)}</Text>
						<TextInput
							label="Are you sure you want to delete this user role?"
							type="text"
							onChange={(e) => {
								setUserInput(e.target.value);
							}}
							placeholder={`Please enter the user to confirm, i.e. ${user.id}`}
							required
						/>
					</Stack>

					<Group position="right" mt={10}>
						<Button
							variant="filled"
							color="gray"
							className={classes.modalActionBtn}
							disabled={UserInput === user.id ? false : true}
							onClick={handleRoleDelete}>
							Delete
						</Button>
						<Button onClick={handleCloseRoleDelete} variant="outline" color="gray" className={classes.modalCancelBtn}>
							Cancel
						</Button>
					</Group>
				</Modal>
			) : (
				''
			)}

			<Modal
				opened={opened}
				onClose={handleCloseResetPassword}
				title="Change user password"
				centered
				className={classes.modalStyle}>
				<Stack>
					<TextInput
						label={"Are you sure you want to reset this user's password?"}
						type="text"
						placeholder={`Please enter the user to confirm, i.e. ${user.id}`}
						onChange={(e) => {
							setUserInput(e.target.value);
						}}
						required
					/>

					{resetPasswordError ? (
						<Text className={classes.passwordText} color="red">
							{resetPasswordError}
						</Text>
					) : resetPasswordLoading ? (
						<Text className={classes.passwordText}>loading</Text>
					) : newPassword ? (
						<Box>
							<Text className={classes.passwordText}>Password</Text>
							<Prism
								className={classes.passwordPrims}
								language="markup"
								copyLabel="Copy password to clipboard"
								copiedLabel="Password copied to clipboard">
								{newPassword}
							</Prism>
							<Text className={classes.passwordText} color="red">
								Warning this is the only time you are able to see Password
							</Text>
						</Box>
					) : (
						''
					)}
				</Stack>
				<Group position="right" mt={10}>
					{"native" === user.method ? (<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={handleResetPassword}
						disabled={UserInput === user.id ? false : true}>
						Reset Password
					</Button>):(
						<Text>Cannot reset password for this user</Text>
					)}
					<Button onClick={handleCloseResetPassword} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
			<Modal
				opened={openedEditModal}
				onClose={handleCloseRoleEdit}
				title="Edit user role"
				centered
				className={classes.modalStyle}>
				<Stack>
					<Select
						placeholder="Select a role to assign"
						onChange={(value) => {
							setSelectedRole(value ?? '');
						}}
						nothingFound="No roles found"
						value={SelectedRole}
						searchValue={roleSearchValue}
						onSearchChange={(value) => setRoleSearchValue(value)}
						onDropdownClose={() => setRoleSearchValue(SelectedRole)}
						onDropdownOpen={() => setRoleSearchValue('')}
						data={roles}
						searchable
						label="Select a role to assign"
						required
					/>

				</Stack>

				<Group position="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={handleEditUserRole}
						//if role is already assigned or no role is selected then disable the button
						disabled={userRole && (Object.keys(userRole).includes(SelectedRole) || SelectedRole === '') ? true : false}
						>
						Create
					</Button>
					<Button onClick={handleCloseRoleEdit} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
		</tr>
	);
};

export default RoleTR;
