import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';

import { useUser } from '@/hooks/useUser';
import { useUsersStyles } from './styles';
import { Prism } from '@mantine/prism';

import { useHeaderContext } from '@/layouts/MainLayout/Context';
import RoleTR from './RoleTR';
import { IconUserPlus } from '@tabler/icons-react';
import { useRole } from '@/hooks/useRole';

const Users: FC = () => {
	useDocumentTitle('Parseable | Users');
	const {
		state: { subCreateUserModalTogle },
	} = useHeaderContext();

	useEffect(() => {
		const listener = subCreateUserModalTogle.subscribe(setModalOpen);
		return () => {
			listener();
		};
	}, [subCreateUserModalTogle.get()]);

	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [createUserInput, setCreateUserInput] = useState<string>('');
	const [SelectedRole, setSelectedRole] = useState<string>('');
	const [roleSearchValue, setRoleSearchValue] = useState<string>('');

	const {
		getUserData,
		getUserIsSuccess,
		getUserIsLoading,
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

	const { getRolesData } = useRole();

	const rows =
		getUserIsSuccess && getUserData?.data ? (
			getUserData?.data.map((user: any) => {
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
		createUserMutation({ userName: createUserInput, roles: userRole });
	};

	const createVaildtion = () => {
		if (getUserData?.data?.includes(createUserInput) || createUserInput.length < 3) {
			return true;
		}

		if (SelectedRole !== '') {
			if (getRolesData?.data?.includes(SelectedRole)) {
				return false;
			}
			return true;
		}
		return false;
	};

	const { classes } = useUsersStyles();
	return (
		<Box className={classes.container}>
			<Box className={classes.header}>
				<Text size="xl" weight={500}>
					Users
				</Text>
				<Button
					variant="outline"
					color="gray"
					className={classes.createBtn}
					onClick={() => {
						setModalOpen(true);
					}}
					rightIcon={<IconUserPlus size={px('1.2rem')} stroke={1.5} />}>
					Create users
				</Button>
			</Box>
			<ScrollArea className={classes.tableContainer} type="always">
				<Table striped highlightOnHover className={classes.tableStyle}>
					<thead className={classes.theadStyle}>
						<tr>
							<th>Username</th>
							<th>Role</th>
							<th style={{ textAlign: 'center' }}>Delete</th>
							<th style={{ textAlign: 'center' }}>Reset Password</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</Table>
			</ScrollArea>
			<Modal opened={modalOpen} onClose={handleClose} title="Create user" centered className={classes.modalStyle}>
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
						nothingFound="No roles found"
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
							<Prism
								className={classes.passwordPrims}
								language="markup"
								copyLabel="Copy password to clipboard"
								copiedLabel="Password copied to clipboard">
								{createUserData?.data}
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
