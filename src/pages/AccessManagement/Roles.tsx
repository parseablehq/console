import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useUsersStyles } from './styles';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { useGetRoles } from '@/hooks/useGetRoles';
import PrivilegeTR from './PrivilegeTR';
import { IconPencil, IconUserPlus } from '@tabler/icons-react';
import { usePutRole } from '@/hooks/usePutRole';
import { usePutDefaultRole } from '@/hooks/usePutDefaultRole';
import { useGetDefaultRole } from '@/hooks/useGetDefaultRole';
const Roles: FC = () => {
	useDocumentTitle('Parseable | Users');
	const {
		state: { subCreateUserModalTogle, subInstanceConfig },
	} = useHeaderContext();

	useEffect(() => {
		const listener = subCreateUserModalTogle.subscribe(setModalOpen);
		return () => {
			listener();
		};
	}, [subCreateUserModalTogle.get()]);

	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [defaultRoleModalOpen, setDefaultRoleModalOpen] = useState<boolean>(false);
	const [inputDefaultRole, setInputDefaultRole] = useState<string>('');
	const [defaultRole, setDefaultRole] = useState<string| null>(null);
	const [oidcActive, setOidcActive] = useState<boolean>(subInstanceConfig.get()?.oidcActive ?? false);
	const [createRoleInput, setCreateRoleInput] = useState<string>('');
	const [tagInput, setTagInput] = useState<string>('');
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');

	const { data: streams } = useGetLogStreamList();

	const { data: defaultRoleResponse, getDefaultOidc } = useGetDefaultRole();
	const { data: putDefaultRoleResponse, setDefaultRole: putDefaultRole } = usePutDefaultRole();
	const { data: CreatedRoleResponse, putRolePrivilege, resetData: resetCreateRoleData } = usePutRole();
	const { data: roles, error: rolesError, loading: rolesLoading, getRolesList, resetData: rolesReset } = useGetRoles();

	const [tableRows, setTableRows] = useState<any>([]);
	useEffect(() => {
		getRolesList();
		getDefaultOidc();
		const listener = subInstanceConfig.subscribe((value) => {
			if (value) {
				setOidcActive(value.oidcActive);
			}
		});

		return () => {
			listener();
			rolesReset();
		};
	}, []);

	useEffect(() => {
		if (roles) {
			const getrows = async () => {
				let rows = roles.map((role: any) => {
					return <PrivilegeTR key={role} roleName={role} getRolesList={getRolesList} defaultRole={defaultRole} />;
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
	}, [roles, rolesError, rolesLoading, defaultRole]);

	useEffect(() => {
		if (CreatedRoleResponse) {
			getRolesList();
		}
	}, [CreatedRoleResponse]);

	useEffect(() => {
		if (putDefaultRoleResponse) {
			setDefaultRole(putDefaultRoleResponse.data);
		}
	}, [putDefaultRoleResponse]);

	useEffect(() => {
		if (defaultRoleResponse) {
			setDefaultRole(defaultRoleResponse);
		}
	}, [defaultRoleResponse]);

	const handleClose = () => {
		setCreateRoleInput('');
		setModalOpen(false);
		resetCreateRoleData();
		setSelectedPrivilege('');
		setSelectedStream('');
		setStreamSearchValue('');
		setTagInput('');
	};

	const handleDefaultRoleModalClose = () => {
		setDefaultRoleModalOpen(false);
		setInputDefaultRole('');
	};

	const handleCreateRole = () => {
		let userRole: any = [];
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			userRole?.push({
				privilege: selectedPrivilege,
			});
		}
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingester') {
			if (streams?.find((stream) => stream.name === SelectedStream)) {
				if (tagInput !== '' && tagInput !== undefined && selectedPrivilege === 'reader') {
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
			if (selectedPrivilege === 'writer' || selectedPrivilege === 'ingester') {
				if (streams?.find((stream) => stream.name === SelectedStream)) {
					return false;
				}
				return true;
			}
		}
		return false;
	};

	const defaultRoleVaildtion = () => {
		if (inputDefaultRole === '' && !roles?.includes(inputDefaultRole)) {
			return true;
		}
		return false;
	};

	const handleSetDefaultRole = () => {
		putDefaultRole(inputDefaultRole);
		handleDefaultRoleModalClose();
	};

	const { classes } = useUsersStyles();
	return (
		<Box className={classes.container}>
			<Box className={classes.header}>
				<Text size="xl" weight={500}>
					Roles
				</Text>
				<Box>
					

					<Button
						variant="outline"
						color="gray"
						className={classes.createBtn}
						onClick={() => {
							setModalOpen(true);
						}}
						rightIcon={<IconUserPlus size={px('1.2rem')} stroke={1.5} />}>
						Create role
					</Button>
					{oidcActive ? (
						<Button
							variant="outline"
							color="gray"
							className={classes.createBtn}
							onClick={() => {
								setDefaultRoleModalOpen(true);
							}}
							rightIcon={<IconPencil size={px('1.2rem')} stroke={1.5} />}>
							Set Default OIDC Role
						</Button>
					) : (
						''
					)}
				</Box>
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
			<Modal
				opened={defaultRoleModalOpen}
				onClose={handleDefaultRoleModalClose}
				title="Set default oidc role"
				centered
				className={classes.modalStyle}>
				<Stack>
					<Select
						placeholder="Select Role"
						label="Select a role to automatically assign to new oidc users"
						data={roles ?? []}
						onChange={(value) => {
							setInputDefaultRole(value ?? '');
						}}
						value={inputDefaultRole}
						nothingFound="No options"
						searchable
					/>
				</Stack>

				<Group position="right" mt={10}>
					<Button
						variant="filled"
						color="gray"
						className={classes.modalActionBtn}
						disabled={defaultRoleVaildtion()}
						onClick={handleSetDefaultRole}>
						Set default
					</Button>
					<Button
						onClick={handleDefaultRoleModalClose}
						variant="outline"
						color="gray"
						className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
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
						data={['admin', 'editor', 'writer', 'reader', 'ingester']}
						onChange={(value) => {
							setSelectedPrivilege(value ?? '');
						}}
						value={selectedPrivilege}
						nothingFound="No options"
					/>

					{selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingester' ? (
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
									placeholder={'Please enter the Tag.'}
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
						onClick={handleCreateRole}>
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
