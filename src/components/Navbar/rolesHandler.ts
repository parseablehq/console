const adminAccess = [
	'Ingest',
	'Query',
	'CreateStream',
	'ListStream',
	'GetSchema',
	'GetStats',
	'DeleteStream',
	'GetRetention',
	'PutRetention',
	'PutAlert',
	'GetAlert',
	'PutUser',
	'ListUser',
	'DeleteUser',
	'PutRoles',
	'GetRole',
];
const editorAccess = [
	'Ingest',
	'Query',
	'CreateStream',
	'ListStream',
	'GetSchema',
	'GetStats',
	'GetRetention',
	'PutRetention',
	'PutAlert',
	'GetAlert',
];
const writerAccess = ['Ingest', 'Query', 'ListStream', 'GetSchema', 'GetStats', 'GetRetention', 'PutAlert', 'GetAlert'];
const readerAccess = ['Query', 'ListStream', 'GetSchema', 'GetStats', 'GetRetention', 'GetAlert'];
const ingesterAccess = ['Ingest'];

const getStreamsSepcificAccess = (rolesWithRoleName: object[], stream?: string) => {
	let access: string[] = [];
	let roles: any[] = [];
	for (var prop in rolesWithRoleName) {
		roles = [...roles, ...(rolesWithRoleName[prop] as any)];
	}
	roles.forEach((role: any) => {
		if (role.privilege === 'admin') {
			adminAccess.forEach((adminAction: string) => {
				if (!access.includes(adminAction)) {
					access.push(adminAction);
				}
			});
		}
		if (role.privilege === 'editor') {
			editorAccess.forEach((editorAction: string) => {
				if (!access.includes(editorAction)) {
					access.push(editorAction);
				}
			});
		}
		if (role.privilege === 'writer' && role.resource.stream === stream) {
			writerAccess.forEach((writerAction: string) => {
				if (!access.includes(writerAction)) {
					access.push(writerAction);
				}
			});
		}
		if (role.privilege === 'reader' && role.resource.stream === stream) {
			readerAccess.forEach((readerAction: string) => {
				if (!access.includes(readerAction)) {
					access.push(readerAction);
				}
			});
		}
		if (role.privilege === 'ingester' && role.resource.stream === stream) {
			ingesterAccess.forEach((ingesterAction: string) => {
				if (!access.includes(ingesterAction)) {
					access.push(ingesterAction);
				}
			});
		}
	});

	return access;
};

const getUserSepcificStreams = (rolesWithRoleName: object[], streams: any[]) => {
	let userStreams: any[] = [];
	let roles: any[] = [];
	for (var prop in rolesWithRoleName) {
		roles = [...roles, ...(rolesWithRoleName[prop] as any)];
	}
	roles.forEach((role: any) => {
		if (role.privilege === 'admin' || role.privilege === 'editor' || role.resource.stream === '*') {
			userStreams = streams;
			return userStreams;
		}
		if (streams.find((stream: any) => stream.name === role.resource.stream)) {
			if (!userStreams.find((stream: any) => stream.name === role.resource.stream)) {
				userStreams.push({ name: role.resource.stream });
			}
		}
	});

	return userStreams;
};

export { getStreamsSepcificAccess, getUserSepcificStreams };
