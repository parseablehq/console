import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';

import { useUser } from '@/hooks/useUser';
// import { Prism } from '@mantine/prism';

import { useHeaderContext } from '@/layouts/MainLayout/Context';
import RoleTR from './RoleTR';
import { IconUserPlus } from '@tabler/icons-react';
import { useRole } from '@/hooks/useRole';
import styles from './styles/AccessManagement.module.css'
import { heights } from '@/components/Mantine/sizing';
import { HEADER_HEIGHT } from '@/constants/theme';
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

	return (
		<Box className={styles.container} style={{maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT*2}px - ${20}px)`}}>
			<Box className={styles.header}>
				<Text size="xl" style={{fontWeight: 500}}>
					Users
				</Text>
				<Button
					variant="outline"
					color="gray"
					className={styles.createBtn}
					onClick={() => {
						setModalOpen(true);
					}}
					rightSection={<IconUserPlus size={px('1.2rem')} stroke={1.5} />}>
					Create users
				</Button>
			</Box>
			<ScrollArea className={styles.tableContainer} type="always">
				<Table striped highlightOnHover className={styles.tableStyle}>
					<thead className={styles.theadStyle}>
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
			<Modal opened={modalOpen} onClose={handleClose} title="Create user" centered className={styles.modalStyle} styles={{title: {fontWeight: 700}}}>
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
						<Text className={styles.passwordText} color="red">
							{createUserError}
						</Text>
					) : createUserIsLoading ? (
						<Text className={styles.passwordText}>loading</Text>
					) : createUserData?.data ? (
						<Box>
							<Text className={styles.passwordText}>Password</Text>
														<CodeHighlight
								className={styles.passwordPrims}
								language="text"
								copyLabel="Copy password to clipboard"
								code={createUserData?.data}
								copiedLabel="Password copied to clipboard"
							/>
							<Text className={styles.passwordText} color="red">
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
						className={styles.modalActionBtn}
						onClick={handleCreateUser}
						disabled={createVaildtion() || !!createUserData?.data}>
						Create
					</Button>
					<Button onClick={handleClose} variant="outline" color="gray" className={styles.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
		</Box>
	);
};

export default Users;
