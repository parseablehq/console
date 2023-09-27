import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useUsersStyles } from './styles';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useGetRoles } from '@/hooks/useGetRoles';
import PrivilegeTR from './PrivilegeTR';
import { IconUserPlus } from '@tabler/icons-react';
import { usePutRole } from '@/hooks/usePutRole';
const Roles: FC = () => {
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
	const [createRoleInput, setCreateRoleInput] = useState<string>('');
	const [tagInput, setTagInput] = useState<string>('');
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');

	const { data: streams } = useGetLogStreamList();

	const { data: CreatedRoleResponse, putRolePrivilege, resetData: resetCreateRoleData } = usePutRole();
	const { data: roles, error: rolesError, loading: rolesLoading, getRolesList, resetData: rolesReset } = useGetRoles();

	const [tableRows, setTableRows] = useState<any>([]);
	useEffect(() => {
		getRolesList();

		return () => {
			rolesReset();
		};
	}, []);

	useEffect(() => {
		if (roles) {
			const getrows = async () => {
				let rows = roles.map((role: any) => {
					return <PrivilegeTR key={role} roleName={role} getRolesList={getRolesList} />;
				});
				setTableRows(rows);
			};

			getrows();
		}
		if (rolesError) {
			setTableRows(
				<tr>
					<td>error</td>
				</tr>,
			);
		}
		if (rolesLoading) {
			setTableRows(
				<tr>
					<td>loading</td>
				</tr>,
			);
		}
	}, [roles, rolesError, rolesLoading]);

	useEffect(() => {
		if (CreatedRoleResponse) {
			getRolesList();
		}
	}, [CreatedRoleResponse]);

	const handleClose = () => {
		setCreateRoleInput('');
		setModalOpen(false);
		resetCreateRoleData();
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
			if (streams?.find((stream) => stream.name === SelectedStream)) {
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
		putRolePrivilege(createRoleInput, userRole);
		handleClose();
	};

	const createVaildtion = () => {
		if (roles?.includes(createRoleInput) && createRoleInput.length > 0) {
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
			<Box className={classes.header}>
				<Text size="xl" weight={500}>
					Roles
				</Text>
				<Button
					variant="outline"
					color="gray"
					className={classes.createBtn}
					onClick={() => {
						setModalOpen(true);
					}}
					rightIcon={<IconUserPlus size={px('1.2rem')} stroke={1.5} />}>
					Create Role
				</Button>
			</Box>
			<ScrollArea className={classes.tableContainer} type="always">
				<Table striped highlightOnHover className={classes.tableStyle}>
					<thead className={classes.theadStyle}>
						<tr>
							<th>Role</th>
							<th>Access</th>
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
						label="Enter the name of the Role"
						placeholder="Type the name of the Role to create"
						onChange={(e) => {
							setCreateRoleInput(e.target.value);
						}}
						value={createRoleInput}
						required
					/>
					<Select
						placeholder="Select privilege"
						label="Select a privilege to assign"
						data={['admin', 'editor', 'writer', 'reader']}
						onChange={(value) => {
							setSelectedPrivilege(value ?? '');
						}}
						value={selectedPrivilege}
						nothingFound="No options"
					/>

					{selectedPrivilege === 'reader' || selectedPrivilege === 'writer' ? (
						<>
							<Select
								placeholder="Pick one"
								onChange={(value) => {
									setSelectedStream(value ?? '');
								}}
								nothingFound="No options"
								value={SelectedStream}
								searchValue={streamSearchValue}
								onSearchChange={(value) => setStreamSearchValue(value)}
								onDropdownClose={() => setStreamSearchValue(SelectedStream)}
								onDropdownOpen={() => setStreamSearchValue('')}
								data={streams?.map((stream) => ({ value: stream.name, label: stream.name })) ?? []}
								searchable
								label="Select a stream to assign"
								required
							/>
							{selectedPrivilege === 'reader' ? (
								<TextInput
									type="text"
									placeholder={"Please enter the Tag."}
									label="Tag"
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

				<Group position="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						disabled={createVaildtion()}
						onClick={handleCreateUser}>
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

export default Roles;
