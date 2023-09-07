import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';

import { useGetUsers } from '@/hooks/useGetUsers';
import { useUsersStyles } from './styles';
import { usePostUser } from '@/hooks/usePostUser';
import { Prism } from '@mantine/prism';

import { useHeaderContext } from '@/layouts/MainLayout/Context';
import RoleTR from './RoleTR';
import { IconUserPlus } from '@tabler/icons-react';
import { useGetRoles } from '@/hooks/useGetRoles';
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
		if (usersError ) {
			setTableRows(
				<tr>
					<td>error</td>
				</tr>,
			);
		}
		if (usersLoading ) {
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
					Create Users
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

					{CreatedUserError ? (
						<Text className={classes.passwordText} color="red">
							{CreatedUserError}
						</Text>
					) : CreatedUserLoading ? (
						<Text className={classes.passwordText}>loading</Text>
					) : CreatedUserResponse ? (
						<Box>
							<Text className={classes.passwordText}>Password</Text>
							<Prism
								className={classes.passwordPrims}
								language="markup"
								copyLabel="Copy password to clipboard"
								copiedLabel="Password copied to clipboard">
								{CreatedUserResponse}
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
