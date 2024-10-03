import { Box, Button, Group, Modal, ScrollArea, Select, Stack, Table, Text, TextInput, px } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC, useEffect, useState } from 'react';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import PrivilegeTR from './PrivilegeTR';
import { IconBook2, IconPencil, IconUserPlus } from '@tabler/icons-react';
import { useRole } from '@/hooks/useRole';
import classes from './styles/AccessManagement.module.css';
import IconButton from '@/components/Button/IconButton';
import { useAppStore } from '@/layouts/MainLayout/providers/AppProvider';

const navigateToDocs = () => {
	return window.open('https://www.parseable.io/docs/rbac', '_blank');
};

const renderDocsIcon = () => <IconBook2 stroke={1.5} size="1rem" />;

const Roles: FC = () => {
	useDocumentTitle('Parseable | Users');
	const [oidcActive] = useAppStore((store) => store.instanceConfig?.oidcActive);
	const [modalOpen, setModalOpen] = useState<boolean>(false);

	const [defaultRoleModalOpen, setDefaultRoleModalOpen] = useState<boolean>(false);
	const [inputDefaultRole, setInputDefaultRole] = useState<string>('');
	const [defaultRole, setDefaultRole] = useState<string | null>(null);
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
		if (updateDefaultRoleData?.status === 200) {
			getDefaultRoleMutation();
		}
	}, [updateDefaultRoleData?.status]);

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
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor') {
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
		if (createRoleInput.length <= 0 || selectedPrivilege === '') return true;

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
			if (selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor') {
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

	return (
		<Box className={classes.container}>
			<Stack className={classes.header} gap={0}>
				<Text style={{ fontWeight: 600 }}>Roles</Text>
				<Stack style={{ flexDirection: 'row' }} gap={0}>
					<Button
						className={classes.createUserBtn}
						rightSection={<IconUserPlus size={px('1rem')} stroke={1.5} />}
						onClick={() => {
							setModalOpen(true);
						}}>
						Create Role
					</Button>
					{oidcActive && (
						<Button
							className={classes.createUserBtn}
							rightSection={<IconPencil size={px('1.2rem')} stroke={1.5} />}
							onClick={() => {
								setDefaultRoleModalOpen(true);
							}}>
							Set Default OIDC Role{' '}
						</Button>
					)}
					<IconButton renderIcon={renderDocsIcon} onClick={navigateToDocs} tooltipLabel="Docs" />
				</Stack>
			</Stack>
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
						nothingFoundMessage="No options"
						searchable
					/>
				</Stack>

				<Group justify="right" mt={10}>
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
			<Modal
				opened={modalOpen}
				onClose={handleClose}
				title="Create Role"
				centered
				className={classes.modalStyle}
				styles={{ title: { fontWeight: 500 } }}>
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
						data={['admin', 'editor', 'writer', 'reader', 'ingestor']}
						onChange={(value) => {
							setSelectedPrivilege(value ?? '');
						}}
						value={selectedPrivilege}
						nothingFoundMessage="No options"
						required
					/>

					{selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor' ? (
						<>
							<Select
								placeholder="Pick one"
								nothingFoundMessage="No options"
								onChange={(value) => {
									setSelectedStream(value ?? '');
								}}
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

				<Group justify="right" mt={10}>
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
