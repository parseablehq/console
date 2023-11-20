import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';

import { useGetUsers } from '@/hooks/useGetUsers';
import classes from './AccessManagement.module.css';
import { usePostUser } from '@/hooks/usePostUser';

import { useHeaderContext } from '@/layouts/MainLayout/Context';
import RoleTR from './RoleTR';
import { IconUserPlus } from '@tabler/icons-react';
import { useGetRoles } from '@/hooks/useGetRoles';
import { CodeHighlight } from '@mantine/code-highlight';
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
	const [tableRows, setTableRows] = useState<any>([]);
	const {
		data: CreatedUserResponse,
		error: CreatedUserError,
		loading: CreatedUserLoading,
		createUser,
		resetData: resetCreateUser,
	} = usePostUser();
	const { data: users, error: usersError, loading: usersLoading, getUsersList, resetData: usersReset } = useGetUsers();
	const { data: roles, getRolesList, resetData: rolesReset } = useGetRoles();

	useEffect(() => {
		getUsersList();
		getRolesList();
		return () => {
			usersReset();
			rolesReset();
		};
	}, []);

	useEffect(() => {
		if (users) {
			const getrows = async () => {
				let rows = users.map((user: any) => {
					return <RoleTR key={user.id} user={user} getUsersList={getUsersList} />;
				});
				setTableRows(rows);
			};

			getrows();
		}
		if (usersError) {
			setTableRows(
				<tr>
					<td>error</td>
				</tr>,
			);
		}
		if (usersLoading) {
			setTableRows(
				<tr>
					<td>loading</td>
				</tr>,
			);
		}
	}, [users, usersError, usersLoading]);

	useEffect(() => {
		if (CreatedUserResponse) {
			getUsersList();
		}
	}, [CreatedUserResponse]);

	const handleClose = () => {
		setCreateUserInput('');
		setModalOpen(false);
		resetCreateUser();
		setSelectedRole('');
		setRoleSearchValue('');
	};

	const handleCreateUser = () => {
		let userRole: any = [];
		if (SelectedRole !== '') {
			userRole.push(SelectedRole);
		}
		createUser(createUserInput, userRole);
	};

	const createVaildtion = () => {
		if (users?.includes(createUserInput) || createUserInput.length < 3) {
			return true;
		}

		if (SelectedRole !== '') {
			if (roles?.includes(SelectedRole)) {
				return false;
			}
			return true;
		}
		return false;
	};

	return (
		<Box className={classes.container}>
			<Box className={classes.header}>
				<Text size="xl">Users</Text>
				<Button
					variant="filled"
					color="green.9"
					onClick={() => {
						setModalOpen(true);
					}}
					rightSection={<IconUserPlus  stroke={1.5} />}>
					Create users
				</Button>
			</Box>
			<ScrollArea className={classes.tableContainer} type="always">
				<Table striped highlightOnHover className={classes.tableStyle}>
					<thead className={classes.theadStyle}>
						<tr>
							<th>Username</th>
							<th>Role(s)</th>
							<th style={{ textAlign: 'center' }}>Reset Password</th>
							<th style={{ textAlign: 'center' }}>Delete</th>
						</tr>
					</thead>
					<tbody>{tableRows}</tbody>
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
						nothingFoundMessage="No roles found"
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

					{CreatedUserError ? (
						<Text className={classes.passwordText} color="red">
							{CreatedUserError}
						</Text>
					) : CreatedUserLoading ? (
						<Text className={classes.passwordText}>loading</Text>
					) : CreatedUserResponse ? (
						<Box>
							<Text className={classes.passwordText}>Password</Text>
							<CodeHighlight
								className={classes.passwordPrims}
								language="text"
								copyLabel="Copy password to clipboard"
								code={CreatedUserResponse}
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
						className={classes.modalActionBtn}
						color="green.9"
						onClick={handleCreateUser}
						disabled={createVaildtion()}>
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
