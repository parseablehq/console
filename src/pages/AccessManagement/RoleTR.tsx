import { ActionIcon, Badge, Box, Button, Group, Modal, Select, Stack, Text, Tooltip, px, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTransform, IconTrash, IconX } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { useUser } from '@/hooks/useUser';
import { useRole } from '@/hooks/useRole';
import styles from './styles/AccessManagement.module.css';
import { CodeHighlight } from '@mantine/code-highlight';
import DeleteOrResetModal from '@/components/Misc/DeleteOrResetModal';

interface RoleTRProps {
	user: {
		id: string;
		method: string;
	};
	deleteUserMutation: (data: { userName: string; onSuccess?: () => void }) => void;
	updateUserPasswordIsError: boolean;
	getUserRolesIsError: boolean;
	getUserRolesIsLoading: boolean;
	updateUserPasswordMutation: (data: { userName: string }) => void;
	updateUserPasswordIsLoading: boolean;
	udpateUserPasswordData: AxiosResponse | undefined;
	resetPasswordError: string;
	getUserRefetch: () => void;
}

const RoleTR: FC<RoleTRProps> = (props) => {
	const {
		user,
		getUserRolesIsError,
		getUserRolesIsLoading,
		updateUserPasswordMutation,
		updateUserPasswordIsError,
		updateUserPasswordIsLoading,
		udpateUserPasswordData,
		resetPasswordError,
		deleteUserMutation,
	} = props;
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();
	const [openedDeleteRole, { close: closeDeleteRole, open: openDeleteRole }] = useDisclosure();
	const [openedEditModal, { close: closeEditModal, open: openEditModal }] = useDisclosure();

	const [deleteRole, setDeleteRole] = useState<string | null>(null);
	const [opened, { open, close }] = useDisclosure(false);
	const [SelectedRole, setSelectedRole] = useState<string>('');
	const [roleSearchValue, setRoleSearchValue] = useState<string>('');

	const { getUserRolesData, getUserRolesMutation, updateUserMutation, updateUserIsSuccess } = useUser();

	const { getRolesData } = useRole();

	useEffect(() => {
		getUserRolesMutation({ userName: user.id });
	}, [user]);

	useEffect(() => {
		if (updateUserIsSuccess) {
			getUserRolesMutation({ userName: user.id });
		}
	}, [updateUserIsSuccess]);

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

	const getBadges = () => {
		if (Object.keys(getUserRolesData?.data).length > 0) {
			const Badges = Object.keys(getUserRolesData?.data).map((role: any) => {
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
	};

	const handleDelete = () => {
		deleteUserMutation({ userName: user.id, onSuccess: props.getUserRefetch });
		closeDelete();
	};

	// For Delete Role
	const handleRoleDelete = () => {
		const filtered = Object.keys(getUserRolesData?.data).filter((role) => role !== deleteRole);
		updateUserMutation({ userName: user.id, roles: filtered });
		closeDeleteRole();
		setDeleteRole(null);
		getUserRolesMutation({ userName: user.id });
	};
	const handleCloseRoleDelete = () => {
		closeDeleteRole();
	};

	// For Edit Role
	const handleCloseRoleEdit = () => {
		closeEditModal();
		setSelectedRole('');
		setRoleSearchValue('');
	};

	const handleEditUserRole = () => {
		const userRoleArray: any = Object.keys(getUserRolesData?.data);
		if (userRoleArray.includes(SelectedRole) || SelectedRole === '') {
			return;
		}
		userRoleArray.push(SelectedRole);

		updateUserMutation({ userName: user.id, roles: userRoleArray });
		handleCloseRoleEdit();
	};

	// for reset password
	const handleCloseResetPassword = () => {
		close();
	};

	const handleResetPassword = (userName: string) => {
		updateUserPasswordMutation({ userName: userName });
	};

	const classes = styles;
	return (
		<tr key={user.id} className={classes.trStyle}>
			<td>{user.id}</td>
			<td>
				{getUserRolesIsError ? (
					'Error'
				) : getUserRolesIsLoading ? (
					'loading..'
				) : getUserRolesData?.data ? (
					<Stack style={{ flexDirection: 'row' }} gap={0} align="end">
						{getBadges()}
						<Tooltip
							label={'Add a Role'}
							style={{ color: 'white', backgroundColor: 'black' }}
							withArrow
							position="right">
							<Badge color="green" onClick={openEditModal} style={{ textAlign: 'center', alignItems: 'center' }}>
								<IconPlus size={'1rem'} style={{ paddingTop: 6 }} />
							</Badge>
						</Tooltip>
					</Stack>
				) : (
					<></>
				)}
			</td>
			<td>
				<Box style={{ height: '100%', width: '100%', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center' }}>
					<Tooltip label={'Delete'} style={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
						<Button
							variant="default"
							className={classes.actionBtn}
							aria-label="Delete user"
							onClick={() => {
								openDelete();
							}}>
							<IconTrash size={px('1rem')} stroke={1.5} />
						</Button>
					</Tooltip>
				</Box>
			</td>
			<td>
				<Box style={{ height: '100%', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>
					<Tooltip
						label={user.method !== 'native' ? 'Cannot reset password for this user' : 'Reset Password'}
						style={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button
							variant="default"
							className={classes.actionBtn}
							onClick={() => {
								if (user.method === 'native') {
									open();
								}
							}}>
							<IconTransform size={px('1rem')} stroke={1.5} />
						</Button>
					</Tooltip>
				</Box>
			</td>
			<DeleteOrResetModal
				type="delete"
				isOpen={openedDelete}
				onClose={handleCloseDelete}
				header="Delete user"
				content="Are you sure you want to delete this user?"
				placeholder={`Type the name of the user`}
				confirmationText={user.id}
				onConfirm={handleDelete}
			/>
			{getUserRolesData?.data && deleteRole && getUserRolesData?.data[deleteRole] ? (
				<DeleteOrResetModal
					type="delete"
					isOpen={openedDeleteRole}
					onClose={handleCloseRoleDelete}
					header="Delete user role"
					specialContent={<Text>{getBadge(deleteRole, false)}</Text>}
					content="Are you sure you want to delete this user role?"
					placeholder={`Type the name of the user`}
					confirmationText={user.id}
					onConfirm={handleRoleDelete}
				/>
			) : (
				''
			)}

			<DeleteOrResetModal
				type="reset"
				isOpen={opened}
				onClose={handleCloseResetPassword}
				header="Change user password"
				content="Are you sure you want to reset this user's password?"
				placeholder={`Type the name of the user`}
				confirmationText={user.id}
				onConfirm={() => handleResetPassword(user.id)}
				processContent={
					updateUserPasswordIsError ? (
						<Text className={classes.passwordText} mt={4} c="red">
							{resetPasswordError}
						</Text>
					) : updateUserPasswordIsLoading ? (
						<Text mt={4} className={classes.passwordText}>
							loading...
						</Text>
					) : udpateUserPasswordData?.data ? (
						<Box mt={4}>
							<Text className={classes.passwordText}>Password</Text>
							<CodeHighlight
								className={classes.passwordPrims}
								language="text"
								copyLabel="Copy password to clipboard"
								code={udpateUserPasswordData?.data}
								copiedLabel="Password copied to clipboard"
							/>
							<Text className={classes.passwordText} c="red">
								Warning this is the only time you are able to see Password
							</Text>
						</Box>
					) : (
						''
					)
				}
				isProcessing={updateUserPasswordIsLoading}
			/>
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
						nothingFoundMessage="No roles found"
						value={SelectedRole}
						searchValue={roleSearchValue}
						onSearchChange={(value) => setRoleSearchValue(value)}
						onDropdownClose={() => setRoleSearchValue(SelectedRole)}
						onDropdownOpen={() => setRoleSearchValue('')}
						data={getRolesData?.data}
						searchable
						label="Select a role to assign"
						required
					/>
				</Stack>

				<Group justify="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={handleEditUserRole}
						// if role is already assigned or no role is selected then disable the button
						disabled={
							getUserRolesData?.data &&
							(Object.keys(getUserRolesData?.data).includes(SelectedRole) || SelectedRole === '')
								? true
								: false
						}>
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
