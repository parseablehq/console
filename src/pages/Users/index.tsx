import { Box, Button, Modal, ScrollArea, Select, Table, Text, TextInput, Tooltip, px } from '@mantine/core';
import { useDisclosure, useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { IconBook2, IconUserPlus } from '@tabler/icons-react';
import { useGetUsers } from '@/hooks/useGetUsers';
import { useUsersStyles } from './styles';
import { usePutUser } from '@/hooks/usePutUser';
import { Prism } from '@mantine/prism';
import RoleTd from './row';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
const Users: FC = () => {
	useDocumentTitle('Parseable | Users');
	const [opened, { open, close }] = useDisclosure(false);
	const [createUserInput, setCreateUserInput] = useState<string>('');

	const [tagInput, setTagInput] = useState<string>('');
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');

	const { data: streams } = useGetLogStreamList();

	const {
		data: CreatedUserResponse,
		error: CreatedUserError,
		loading: CreatedUserLoading,
		createUser,
		resetData: resetCreateUser,
	} = usePutUser();
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
					return <RoleTd key={user} Username={user} getUsersList={getUsersList} />;
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
		close();
		resetCreateUser();
		setSelectedPrivilege('');
		setSelectedStream('');
		setStreamSearchValue('');
		setTagInput('');
	};

	const handleCreateUser = () => {
		let userRole: any = [];
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			userRole?.push({
				privilege: selectedPrivilege,
			});
		}
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer') {
			if (
				streams?.find((stream) => stream.name === SelectedStream)
			) {
				if (tagInput !== '' && tagInput !== undefined && selectedPrivilege !== 'writer') {
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
		createUser(createUserInput, userRole);
	};

	const createVaildtion = () => {
		if (users?.includes(createUserInput) || createUserInput.length <3) {
			return true;
		}
		if (selectedPrivilege !== '') {
			if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
				return false;
			}
			if (selectedPrivilege === 'reader') {
				if (streams?.find((stream) => stream.name === SelectedStream)) {
					return false;
				}
				return true;
			}
			if (selectedPrivilege === 'writer') {
				if (streams?.find((stream) => stream.name === SelectedStream)) {
					return false;
				}
				return true;
			}
		}
		return false;
	};

	const { classes } = useUsersStyles();
	return (
		<Box className={classes.container}>
			<Box className={classes.headerContainer}>
				<Text className={classes.textContext}> User Managemant </Text>
				<Box style={{ height: '100%', width: '100%', textAlign: 'right' }}>
					<Tooltip label={'Docs'} sx={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
						<Button
							variant="default"
							className={classes.actionBtn}
							onClick={() => {
								window.open('https://www.parseable.io/docs/rbac', '_blank');
							}}>
							<IconBook2 size={px('1.2rem')} stroke={1.5} />
						</Button>
					</Tooltip>
					<Tooltip
						label={'Create New User'}
						sx={{ color: 'white', backgroundColor: 'black' }}
						withArrow
						onClick={open}
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
						<tr>
							<th>Username</th>
							<th>Role</th>
							<th style={{ textAlign: 'center' }}>Delete</th>
							<th style={{ textAlign: 'center' }}>Reset Password</th>
						</tr>
					</thead>
					<tbody >{tableRows}</tbody>
				</Table>
			</ScrollArea>
			<Modal
				opened={opened}
				onClose={handleClose}
				title="Create User"
				centered
				sx={{
					'& .mantine-Paper-root ': {
						overflowY: 'inherit',
					},
				}}>
				<Text m={4}>Enter the name of the user</Text>
				<TextInput
					type="text"
					placeholder="Type the name of the User to create"
					onChange={(e) => {
						setCreateUserInput(e.target.value);
					}}
					value={createUserInput}
				/>

				<Text m={4}>Select The Privelege</Text>
				<Select
					placeholder="Select Privilege"
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
						<Text m={4}>Select Stream </Text>
						<Select
							placeholder="Pick one"
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
							<>
								<Text m={4}>Please enter the tag (optional) </Text>
								<TextInput
									type="text"
									placeholder={`Please enter the Tag.`}
									onChange={(e) => {
										setTagInput(e.target.value);
									}}
								/>
							</>
						) : (
							''
						)}
					</>
				) : (
					''
				)}

				{CreatedUserError ? (
					CreatedUserError
				) : CreatedUserLoading ? (
					'Loading'
				) : CreatedUserResponse ? (
					<>
						<Text m={4} color="red">
							Password (Warning this is the only time you are able to see Password)
						</Text>
						<Prism
							className={classes.passwordPrims}
							language="markup"
							copyLabel="Copy password to clipboard"
							copiedLabel="Password copied to clipboard">
							{CreatedUserResponse}
						</Prism>
					</>
				) : (
					''
				)}

				<Box mt={10} display="flex" sx={{ justifyContent: 'end' }}>
					<Button
						variant="filled"
						color="green"
						sx={{ margin: '12px' }}
						onClick={handleCreateUser}
						// if user already exity in list
						disabled={createVaildtion()}>
						Create
					</Button>
					<Button onClick={handleClose} variant="filled" color="red" sx={{ margin: '12px' }}>
						Cancel
					</Button>
				</Box>
			</Modal>
		</Box>
	);
};

export default Users;
