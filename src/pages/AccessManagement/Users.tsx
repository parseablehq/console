import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useCallback, useState } from 'react';
import { useGetUser, useUser } from '@/hooks/useUser';
import RoleTR from './RoleTR';
import { IconBook2, IconUserPlus } from '@tabler/icons-react';
import { useRole } from '@/hooks/useRole';
import classes from './styles/AccessManagement.module.css';
import { heights } from '@/components/Mantine/sizing';
import { HEADER_HEIGHT } from '@/constants/theme';
import { CodeHighlight } from '@mantine/code-highlight';
import IconButton from '@/components/Button/IconButton';

const navigateToDocs = () => {
	return window.open('https://www.parseable.io/docs/rbac', '_blank');
};

const renderDocsIcon = () => <IconBook2 stroke={1.5} size="1rem" />;

const Users: FC = () => {
	useDocumentTitle('Parseable | Users');
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [createUserInput, setCreateUserInput] = useState<string>('');
	const [SelectedRole, setSelectedRole] = useState<string>('');
	const [roleSearchValue, setRoleSearchValue] = useState<string>('');

	const {
		createUserMutation,
		createUserIsError,
		createUserIsLoading,
		createUserData,
		createUserError,
		getUserRolesIsError,
		getUserRolesIsLoading,
		updateUserPasswordMutation,
		updateUserPasswordIsError,
		updateUserPasswordIsLoading,
		udpateUserPasswordData,
		resetPasswordError,
		deleteUserMutation,
		createUserReset,
	} = useUser();

	const { getUserData, getUserIsSuccess, getUserIsLoading, getUserRefetch } = useGetUser();

	const { getRolesData } = useRole();

	const rows =
		getUserIsSuccess && getUserData?.data ? (
			getUserData?.data?.map((user: any) => {
				return (
					<RoleTR
						key={user.id}
						user={user}
						deleteUserMutation={deleteUserMutation}
						updateUserPasswordIsError={updateUserPasswordIsError}
						getUserRolesIsError={getUserRolesIsError}
						getUserRolesIsLoading={getUserRolesIsLoading}
						updateUserPasswordMutation={updateUserPasswordMutation}
						updateUserPasswordIsLoading={updateUserPasswordIsLoading}
						udpateUserPasswordData={udpateUserPasswordData}
						resetPasswordError={resetPasswordError}
						getUserRefetch={getUserRefetch}
					/>
				);
			})
		) : getUserIsLoading ? (
			<tr>
				<td>loading</td>
			</tr>
		) : (
			<tr>
				<td>error</td>
			</tr>
		);
	const handleClose = () => {
		setCreateUserInput('');
		setModalOpen(false);
		setSelectedRole('');
		setRoleSearchValue('');
		createUserReset();
	};

	const handleCreateUser = () => {
		const userRole: any = [];
		if (SelectedRole !== '') {
			userRole.push(SelectedRole);
		}
		createUserMutation({ userName: createUserInput, roles: userRole, onSuccess: getUserRefetch });
	};

	const createVaildtion = useCallback(() => {
		if (getUserData?.data?.includes(createUserInput) || createUserInput.length < 3 || SelectedRole !== '') {
			if (getRolesData?.data?.includes(SelectedRole)) {
				return true;
			}
		}

		return false;
	}, [SelectedRole, createUserInput]);

	return (
		<Box
			className={classes.container}
			style={{ maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT * 2}px - ${20}px)` }}>
			<Stack className={classes.header} gap={0}>
				<Text style={{ fontWeight: 600 }}>Users</Text>
				<Stack style={{ flexDirection: 'row' }} gap={0}>
					<Button
						className={classes.createUserBtn}
						onClick={() => setModalOpen(true)}
						rightSection={<IconUserPlus size={px('1rem')} stroke={1.5} />}>
						Create User
					</Button>
					<IconButton renderIcon={renderDocsIcon} onClick={navigateToDocs} tooltipLabel="Docs" />
				</Stack>
			</Stack>
			<ScrollArea className={classes.tableContainer} type="always">
				<Table striped highlightOnHover className={classes.tableStyle}>
					<thead className={classes.theadStyle}>
						<tr>
							<th className={classes.tableHeader}>Username</th>
							<th className={classes.tableHeader}>Role</th>
							<th className={classes.tableHeader} style={{ textAlign: 'center' }}>
								Delete
							</th>
							<th className={classes.tableHeader} style={{ textAlign: 'center' }}>
								Reset Password
							</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</Table>
			</ScrollArea>
			<Modal
				opened={modalOpen}
				onClose={handleClose}
				title="Create user"
				centered
				className={classes.modalStyle}
				styles={{ title: { fontWeight: 500 } }}>
				<Stack>
					<TextInput
						type="text"
						label="Enter the name of the user"
						placeholder="Type the name of the user to create"
						onChange={(e) => {
							setCreateUserInput(e.target.value);
						}}
						value={createUserInput}
						required
					/>
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
						data={getRolesData?.data || []}
						searchable
						label="Select a role to assign"
						required
					/>

					{createUserIsError ? (
						<Text className={classes.passwordText} color="red">
							{createUserError}
						</Text>
					) : createUserIsLoading ? (
						<Text className={classes.passwordText}>loading</Text>
					) : createUserData?.data ? (
						<Box>
							<Text className={classes.passwordText}>Password</Text>
							<CodeHighlight
								className={classes.passwordPrims}
								language="text"
								copyLabel="Copy password to clipboard"
								code={createUserData?.data}
								copiedLabel="Password copied to clipboard"
							/>
							<Text className={classes.passwordText} color="red">
								Warning this is the only time you are able to see Password
							</Text>
						</Box>
					) : (
						''
					)}
				</Stack>

				<Group justify="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						onClick={handleCreateUser}
						disabled={createVaildtion() || !!createUserData?.data}>
						Create
					</Button>
					<Button onClick={handleClose} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
		</Box>
	);
};

export default Users;
