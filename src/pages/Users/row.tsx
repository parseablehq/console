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
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { usePostUserResetPassword } from '@/hooks/usePostResetPassword';

interface RoleTdProps {
	Username: string;
	getUsersList: () => void;
}

const RoleTd: FC<RoleTdProps> = (props) => {
	const { Username, getUsersList } = props;
	const [openedDelete, { close: closeDelete, open: openDelete }] = useDisclosure();
	const [openedDeleteRole, { close: closeDeleteRole, open: openDeleteRole }] = useDisclosure();
	const [openedEditModal, { close: closeEditModal, open: openEditModal }] = useDisclosure();

	const [deleteRoleIndex, setDeleteRoleIndex] = useState<number>(0);
	const [opened, { open, close }] = useDisclosure(false);
	const [UserInput, setUserInput] = useState<string>('');

	const [tagInput, setTagInput] = useState<string>('');
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');

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
	const { data: streams } = useGetLogStreamList();
	useEffect(() => {
		if (deletedUser) {
			getUsersList();
			deletedUserReset();
		}
	}, [deletedUser]);

	useEffect(() => {
		getRoles(Username);

		return () => {
			userRoleReset();
		};
	}, [Username]);

	useEffect(() => {
		if (putRoleData) {
			getRoles(Username);
		}
		return () => {
			resetPutRoleData();
		};
	}, [putRoleData]);

	const removeButton = (i: number) => (
		<ActionIcon
			size="xs"
			color="blue"
			radius="xl"
			variant="transparent"
			onClick={() => {
				openDeleteRole();
				setDeleteRoleIndex(i);
			}}>
			<IconX size={rem(10)} />
		</ActionIcon>
	);

	const getBadge = (role: any, i: number, withAction: boolean) => {
		if (role.privilege === 'admin' || role.privilege === 'editor') {
			return (
				<Badge color="violet" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
					{role.privilege}
				</Badge>
			);
		}

		if (role.privilege === 'reader') {
			if (role.resource?.tag) {
				return (
					<Badge color="orange" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
						{role.privilege} of {role.resource?.stream === '*' ? 'All' : role.resource?.stream} with{' '}
						{role.resource?.tag}
					</Badge>
				);
			}
			return (
				<Badge color="orange" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
					{role.privilege} of {role.resource?.stream === '*' ? 'All' : role.resource?.stream}
				</Badge>
			);
		}
		return (
			<Badge color="blue" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
				{role.privilege} of {role.resource?.stream === '*' ? 'All' : role.resource?.stream}
			</Badge>
		);
	};
	const getBadges = (userRole: any) => {
		if (userRole.length > 0) {
			const Badges = userRole.map((role: any, i: number) => {
				return <span key={i}> {getBadge(role, i, true)}</span>;
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
		deleteUserAction(Username);
		closeDelete();
		setUserInput('');
	};

	// For Delete Role
	const handleRoleDelete = () => {
		const updatedRole = userRole?.filter((role: any, i: number) => {
			if (i !== deleteRoleIndex) {
				return role;
			}
		});
		putRole(Username, updatedRole);
		closeDeleteRole();
		setDeleteRoleIndex(0);
	};
	const handleCloseRoleDelete = () => {
		closeDeleteRole();
		setUserInput('');
	};

	// For Edit Role
	const handleRoleEdit = () => {
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			userRole?.push({
				privilege: selectedPrivilege,
			});
		}
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer') {
			if (
				streams?.find((stream) => stream.name === SelectedStream) &&
				SelectedStream !== '' &&
				SelectedStream !== undefined
			) {
				if (tagInput !== '' && tagInput !== undefined && selectedPrivilege !== 'writer' && tagInput !== null) {
					userRole?.push({
						privilege: selectedPrivilege,
						resource: {
							stream: SelectedStream,
							tag: tagInput,
						},
					});
				} else {
					userRole?.push({
						privilege: selectedPrivilege,
						resource: {
							stream: SelectedStream,
						},
					});
				}
			}
		}

		putRole(Username, userRole);
		closeEditModal();
		setUserInput('');
		setSelectedPrivilege('');
		setSelectedStream('');
		setStreamSearchValue('');
		setTagInput('');
		getRoles(Username);
	};
	const handleCloseRoleEdit = () => {
		closeEditModal();
		setUserInput('');
		setSelectedPrivilege('');
		setSelectedStream('');
		setStreamSearchValue('');
	};
	const updateRoleVaildtion = () => {
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			if (userRole?.find((role: any) => role.privilege === selectedPrivilege)) {
				return true;
			}
			return false;
		}
		if (selectedPrivilege === 'reader') {
			if (
				userRole?.find(
					(role: any) =>
						role.privilege === selectedPrivilege &&
						role.resource?.stream === SelectedStream &&
						(tagInput
							? role.resource?.tag === tagInput
							: role.resource?.tag === null || role.resource?.tag === undefined),
				)
			) {
				return true;
			}
			if (
				streams?.find((stream) => stream.name === SelectedStream) &&
				SelectedStream !== '' &&
				SelectedStream !== undefined
			) {
				return false;
			}
			return true;
		}
		if (selectedPrivilege === 'writer') {
			if (
				userRole?.find((role: any) => role.privilege === selectedPrivilege && role.resource?.stream === SelectedStream)
			) {
				return true;
			}
			if (
				streams?.find((stream) => stream.name === SelectedStream) &&
				SelectedStream !== '' &&
				SelectedStream !== undefined
			) {
				return false;
			}
			return true;
		}
		return true;
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
		<tr key={Username} className={classes.trStyle}>
			<td>{Username}</td>
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
						label={'Reset Password'}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						position="right">
						<Button variant="default" className={classes.actionBtn} onClick={open}>
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
					placeholder={`Please enter the Username to confirm, i.e. ${Username}`}
					required
				/>

				<Group position="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						disabled={UserInput === Username ? false : true}
						onClick={handleDelete}>
						Delete
					</Button>
					<Button onClick={handleCloseDelete} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
			{userRole && userRole[deleteRoleIndex] ? (
				<Modal
					withinPortal
					size="md"
					opened={openedDeleteRole}
					onClose={handleCloseRoleDelete}
					title={'Delete user role'}
					centered
					className={classes.modalStyle}>
					<Stack>
						<Text>{getBadge(userRole[deleteRoleIndex], deleteRoleIndex, false)}</Text>
						<TextInput
							label="Are you sure you want to delete this user role?"
							type="text"
							onChange={(e) => {
								setUserInput(e.target.value);
							}}
							placeholder={`Please enter the Username to confirm, i.e. ${Username}`}
							required
						/>
					</Stack>

					<Group position="right" mt={10}>
						<Button
							variant="filled"
							color="gray"
							className={classes.modalActionBtn}
							disabled={UserInput === Username ? false : true}
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
						placeholder={`Please enter the username to confirm, i.e. ${Username}`}
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
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={handleResetPassword}
						disabled={UserInput === Username ? false : true}>
						Reset Password
					</Button>
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
						placeholder="Select privilege"
						label="Select a privilege to assign"
						data={['admin', 'editor', 'writer', 'reader']}
						onChange={(value) => {
							setSelectedPrivilege(value || '');
						}}
						value={selectedPrivilege}
						nothingFound="No options"
						required
					/>

					{selectedPrivilege === 'reader' || selectedPrivilege === 'writer' ? (
						<>
							<Select
								placeholder="Pick one"
								label="Select a stream"
								onChange={(value) => {
									setSelectedStream(value || '');
								}}
								nothingFound="No options"
								value={SelectedStream}
								searchValue={streamSearchValue}
								onSearchChange={(value) => setStreamSearchValue(value)}
								onDropdownClose={() => setStreamSearchValue(SelectedStream)}
								onDropdownOpen={() => setStreamSearchValue('')}
								data={streams?.map((stream) => ({ value: stream.name, label: stream.name })) ?? []}
								searchable
								required
							/>
							{selectedPrivilege === 'reader' ? (
								<TextInput
									label="Please enter the tag (optional)"
									type="text"
									placeholder={`Please enter the Tag.`}
									onChange={(e) => {
										setTagInput(e.target.value);
									}}
								/>
							) : (
								''
							)}
						</>
					) : (
						''
					)}
				</Stack>
				<Group mt={10} position="right">
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={() => {
							handleRoleEdit();
						}}
						disabled={updateRoleVaildtion()}>
						Add Role
					</Button>
					<Button onClick={handleCloseRoleEdit} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
		</tr>
	);
};

export default RoleTd;