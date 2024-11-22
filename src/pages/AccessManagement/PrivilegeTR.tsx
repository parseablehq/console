import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
	px,
	rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { useRole } from '@/hooks/useRole';
import styles from './styles/AccessManagement.module.css';
import DeleteOrResetModal from '@/components/Misc/DeleteOrResetModal';

interface PrivilegeTRProps {
	roleName: string;
	defaultRole: string | null;
	refetchRoles: () => void;
	deleteRoleMutation: (data: { roleName: string }) => void;
	getRoleIsLoading: boolean;
	getRoleIsError: boolean;
}

const PrivilegeTR: FC<PrivilegeTRProps> = (props) => {
	const { roleName, defaultRole, deleteRoleMutation, getRoleIsLoading, getRoleIsError } = props;

	const [UserInput, setUserInput] = useState<string>('');

	// Delete Privilege Modal Constants  : Starts
	const [deletePrivilegeIndex, setDeletePrivilegeIndex] = useState<number>(0);
	const [isDeletedPrivilegeOpen, { open: openDeletePrivilege, close: closeDeletePrivilege }] = useDisclosure();
	// Delete Privilege Modal Constants  : Ends

	// Delete Role Modal Constants  : Starts
	const [isDeletedRoleOpen, { open: openDeleteRole, close: closeDeleteRole }] = useDisclosure();
	// Delete Role Modal Constants  : Ends

	// Update Role Modal Constants  : Starts
	const [isUpdatedRoleOpen, { open: openUpdateRole, close: closeUpdateRole }] = useDisclosure();
	const [selectedPrivilege, setSelectedPrivilege] = useState<string>('');
	const [SelectedStream, setSelectedStream] = useState<string>('');
	const [streamSearchValue, setStreamSearchValue] = useState<string>('');
	const [tagInput, setTagInput] = useState<string>('');
	const { getLogStreamListData } = useGetLogStreamList();

	const { getRoleData, getRoleMutation, updateRoleMutation, updateRoleIsSuccess } = useRole();

	useEffect(() => {
		getRoleMutation({ roleName });
	}, [roleName, updateRoleIsSuccess]);

	const getBadge = (privilege: any, i: number, withAction: boolean) => {
		if (privilege.privilege === 'admin' || privilege.privilege === 'editor') {
			return (
				<Badge color="violet" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
					{privilege.privilege}
				</Badge>
			);
		}

		if (privilege.privilege === 'reader') {
			if (privilege.resource?.tag) {
				return (
					<Badge color="orange" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
						{privilege.privilege} of {privilege.resource?.stream === '*' ? 'All' : privilege.resource?.stream} with{' '}
						{privilege.resource?.tag}
					</Badge>
				);
			}
			return (
				<Badge color="orange" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
					{privilege.privilege} of {privilege.resource?.stream === '*' ? 'All' : privilege.resource?.stream}
				</Badge>
			);
		}
		return (
			<Badge color="blue" rightSection={withAction ? removeButton(i) : ''} variant={'light'}>
				{privilege.privilege} of {privilege.resource?.stream === '*' ? 'All' : privilege.resource?.stream}
			</Badge>
		);
	};

	const removeButton = (i: number) => (
		<ActionIcon
			size="xs"
			color="blue"
			radius="xl"
			variant="transparent"
			onClick={() => {
				openDeletePrivilege();
				setDeletePrivilegeIndex(i);
			}}>
			<IconX size={rem(10)} />
		</ActionIcon>
	);

	const handleClosePrivilegeDelete = () => {
		closeDeletePrivilege();
		setUserInput('');
	};

	const handlePrivilegeDelete = () => {
		const newPrivileges = getRoleData?.data?.filter((privilege: any, i: number) => {
			if (i !== deletePrivilegeIndex) {
				return privilege;
			}
		});

		updateRoleMutation({ userName: roleName, privilege: newPrivileges });
		handleClosePrivilegeDelete();
	};

	const getBadges = (userRole: any) => {
		if (userRole.length > 0) {
			const Badges = userRole.map((privilege: any, i: number) => {
				return <span key={i}> {getBadge(privilege, i, true)}</span>;
			});
			return Badges;
		} else {
			return (
				<Badge color="red" variant={'light'}>
					No Role
				</Badge>
			);
		}
	};

	const handleDelete = () => {
		deleteRoleMutation({ roleName });
		handleCloseDelete();
	};

	const handleCloseDelete = () => {
		closeDeleteRole();
	};

	const handleCloseUpdateRole = () => {
		closeUpdateRole();
		setSelectedPrivilege('');
		setSelectedStream('');
		setStreamSearchValue('');
		setTagInput('');
	};

	const handleUpadterole = () => {
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			getRoleData?.data?.push({
				privilege: selectedPrivilege,
			});
		}
		if (selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor') {
			if (getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream)) {
				if (tagInput !== '' && tagInput !== undefined && selectedPrivilege === 'reader') {
					getRoleData?.data?.push({
						privilege: selectedPrivilege,
						resource: {
							stream: SelectedStream,
							tag: tagInput,
						},
					});
				} else {
					getRoleData?.data?.push({
						privilege: selectedPrivilege,
						resource: {
							stream: SelectedStream,
						},
					});
				}
			}
		}
		updateRoleMutation({ userName: roleName, privilege: getRoleData?.data });
		handleCloseUpdateRole();
	};

	const updateRoleVaildtion = () => {
		if (selectedPrivilege === 'admin' || selectedPrivilege === 'editor') {
			if (getRoleData?.data?.find((role: any) => role.privilege === selectedPrivilege)) {
				return true;
			}
			return false;
		}
		if (selectedPrivilege === 'reader') {
			if (
				getRoleData?.data?.find(
					(role: any) =>
						role.privilege === selectedPrivilege &&
						role.resource?.stream === SelectedStream &&
						(tagInput
							? role.resource?.tag === tagInput
							: role.resource?.tag === null || role.resource?.tag === undefined),
				)
			) {
				return true;
			}
			if (
				getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream) &&
				SelectedStream !== '' &&
				SelectedStream !== undefined
			) {
				return false;
			}
			return true;
		}
		if (selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor') {
			if (
				getRoleData?.data?.find(
					(role: any) => role.privilege === selectedPrivilege && role.resource?.stream === SelectedStream,
				)
			) {
				return true;
			}
			if (
				getLogStreamListData?.data?.find((stream) => stream.name === SelectedStream) &&
				SelectedStream !== '' &&
				SelectedStream !== undefined
			) {
				return false;
			}
			return true;
		}
		return true;
	};

	const classes = styles;
	return (
		<>
			<tr className={classes.trStyle}>
				<td>
					{roleName === defaultRole ? (
						<Tooltip label={'Default role for oidc'}>
							<Text>
								{roleName}
								<span style={{ color: 'red' }}>*</span>
							</Text>
						</Tooltip>
					) : (
						roleName
					)}
				</td>
				<td>
					{getRoleIsError ? (
						'Error'
					) : getRoleIsLoading ? (
						'loading..'
					) : getRoleData?.data ? (
						<Stack style={{ flexDirection: 'row', alignItems: 'center' }} gap={8}>
							{getBadges(getRoleData?.data)}
							<Tooltip
								label={'Add a Privilege'}
								style={{ color: 'white', backgroundColor: 'black' }}
								withArrow
								position="right">
								<Badge color="green" onClick={openUpdateRole}>
									<IconPlus size={'0.7rem'} stroke={2} style={{ paddingTop: '2px' }} />
								</Badge>
							</Tooltip>
						</Stack>
					) : (
						<></>
					)}
				</td>
				<td>
					<Box style={{ height: '100%', width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>
						<Tooltip label={'Delete'} style={{ color: 'white', backgroundColor: 'black' }} withArrow position="right">
							<Button
								variant="default"
								className={classes.actionBtn}
								aria-label="Delete Role"
								onClick={() => {
									openDeleteRole();
								}}>
								<IconTrash size={px('1rem')} stroke={1.5} />
							</Button>
						</Tooltip>
					</Box>
				</td>
			</tr>

			<DeleteOrResetModal
				isOpen={isDeletedRoleOpen}
				onClose={handleCloseDelete}
				header={'Delete Role'}
				type="delete"
				content="Are you sure you want to delete this Role?"
				placeholder="Type the role name to confirm"
				onConfirm={handleDelete}
				confirmationText={roleName}
			/>
			{getRoleData?.data?.[deletePrivilegeIndex] ? (
				<DeleteOrResetModal
					isOpen={isDeletedPrivilegeOpen}
					onClose={handleClosePrivilegeDelete}
					header={'Delete Privilege'}
					specialContent={<Text>{getBadge(getRoleData?.data[deletePrivilegeIndex], deletePrivilegeIndex, false)}</Text>}
					type="delete"
					content={`Are you sure you want to delete this role privilege?`}
					placeholder={`Type name of the role to confirm.`}
					onConfirm={handlePrivilegeDelete}
					confirmationText={roleName}
				/>
			) : (
				''
			)}
			<Modal
				opened={isUpdatedRoleOpen}
				onClose={handleCloseUpdateRole}
				title="Add Privilege"
				centered
				className={classes.modalStyle}>
				<Stack>
					<Select
						placeholder="Select privilege"
						label="Select a privilege to assign"
						data={['admin', 'editor', 'writer', 'reader', 'ingestor']}
						onChange={(value) => {
							setSelectedPrivilege(value ?? '');
						}}
						value={selectedPrivilege}
						nothingFoundMessage="No options"
					/>

					{selectedPrivilege === 'reader' || selectedPrivilege === 'writer' || selectedPrivilege === 'ingestor' ? (
						<>
							<Select
								placeholder="Pick one"
								onChange={(value) => {
									setSelectedStream(value ?? '');
								}}
								nothingFoundMessage="No options"
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
						disabled={updateRoleVaildtion()}
						onClick={handleUpadterole}>
						Add privilege
					</Button>
					<Button onClick={handleCloseUpdateRole} variant="outline" color="gray" className={classes.modalCancelBtn}>
						Cancel
					</Button>
				</Group>
			</Modal>
		</>
	);
};

export default PrivilegeTR;
