import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import PrivilegeTR from './PrivilegeTR';
import { IconPencil, IconUserPlus } from '@tabler/icons-react';
import { useRole } from '@/hooks/useRole';
import styles from './styles/AccessManagement.module.css'

const Roles: FC = () => {
	useDocumentTitle('Parseable | Users');
	const {
		state: { subInstanceConfig },
	} = useHeaderContext();

	const [modalOpen, setModalOpen] = useState<boolean>(false);

	const [defaultRoleModalOpen, setDefaultRoleModalOpen] = useState<boolean>(false);
	const [inputDefaultRole, setInputDefaultRole] = useState<string>('');
	const [defaultRole, setDefaultRole] = useState<string | null>(null);
	const [oidcActive, setOidcActive] = useState<boolean>(subInstanceConfig.get()?.oidcActive ?? false);
	const [createRoleInput, setCreateRoleInput] = useState<string>('');
	const [tagInput, setTagInput] = useState<string>('');
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');

	const { getLogStreamListData } = useGetLogStreamList();

	const {
		getDefaultRoleData,
		getDefaultRoleMutation,
		updateDefaultRoleMutation,
		updateDefaultRoleData,
		updateRoleMutation,
		getRolesData,
		getRolesIsLoading,
		getRolesIsSuccess,
		getRolesRefetch,
		deleteRoleMutation,
		getRoleIsLoading,
		getRoleIsError,
	} = useRole();

	useEffect(() => {
		getDefaultRoleMutation();
		const listener = subInstanceConfig.subscribe((value) => {
			if (value) {
				setOidcActive(value.oidcActive);
			}
		});

		return () => {
			listener();
		};
	}, []);

	const rows =
		getRolesIsSuccess && getRolesData?.data ? (
			getRolesData?.data.map((role: any) => {
				return (
					<PrivilegeTR
						key={role}
						roleName={role}
						defaultRole={defaultRole}
						refetchRoles={getRolesRefetch}
						deleteRoleMutation={deleteRoleMutation}
						getRoleIsLoading={getRoleIsLoading}
						getRoleIsError={getRoleIsError}
					/>
				);
			})
		) : getRolesIsLoading ? (
			<tr>
				<td>loading</td>
			</tr>
		) : (
			<tr>
				<td>error</td>
			</tr>
		);

	useEffect(() => {
		if (updateDefaultRoleData?.data) {
			setDefaultRole(updateDefaultRoleData?.data);
		}
	}, [updateDefaultRoleData?.data]);

	useEffect(() => {
		if (getDefaultRoleData?.data) {
			setDefaultRole(getDefaultRoleData?.data);
		}
	}, [getDefaultRoleData?.data]);

	const handleClose = () => {
		setCreateRoleInput('');
		setModalOpen(false);
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
		const userRole: any = [];
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			userRole?.push({
				privilege: selectedPrivilege,
			});
		}
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingester') {
			if (getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream)) {
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
		updateRoleMutation({ userName: createRoleInput, privilege: userRole });
		getRolesRefetch();
		handleClose();
	};

	const createVaildtion = () => {
		if (getRolesData?.data?.includes(createRoleInput) && createRoleInput.length > 0) {
			return true;
		}
		if (selectedPrivilege !== '') {
			if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
				return false;
			}
			if (selectedPrivilege === 'reader') {
				if (getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream)) {
					return false;
				}
				return true;
			}
			if (selectedPrivilege === 'writer' || selectedPrivilege === 'ingester') {
				if (getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream)) {
					return false;
				}
				return true;
			}
		}
		return false;
	};

	const defaultRoleVaildtion = () => {
		if (inputDefaultRole === '' && !getRolesData?.data?.includes(inputDefaultRole)) {
			return true;
		}
		return false;
	};

	const handleSetDefaultRole = () => {
		updateDefaultRoleMutation({ roleName: inputDefaultRole });
		handleDefaultRoleModalClose();
	};

	const classes = styles;
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
					<tbody>{rows}</tbody>
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
						data={getRolesData?.data ?? []}
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
			<Modal opened={modalOpen} onClose={handleClose} title="Create Role" centered className={classes.modalStyle}>
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
								data={getLogStreamListData?.data?.map((stream) => ({ value: stream.name, label: stream.name })) ?? []}
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
