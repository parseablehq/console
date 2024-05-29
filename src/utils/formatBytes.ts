export const formatBytes = (a: number, b: number = 1) => {
	if (!+a) return '0 Bytes';
	const c = b < 0 ? 0 : b,
		d = Math.floor(Math.log(a) / Math.log(1024));
	return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
		['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'][d]
	}`;
};

export function HumanizeNumber(val: number) {
	// Thousands, millions, billions etc..
	let s = ['', ' K', ' M', ' B', ' T'];

	// Dividing the value by 3.
	let sNum = Math.floor(('' + val).length / 3);

	// Calculating the precised value.
	let sVal = parseFloat((sNum != 0 ? val / Math.pow(1000, sNum) : val).toPrecision(4));

	if (sVal % 1 != 0) {
		return sVal.toFixed(1) + s[sNum];
	}

	// Appending the letter to precised val.
	return sVal + s[sNum];
}

export const sanitizeEventsCount = (val: any) => {
	return typeof val === 'number' ? HumanizeNumber(val) : '0';
};

export const sizetoInteger = (str: string) => {
	if (!str || typeof str !== 'string') return null;

	const strChuncks = str?.split(' ');
	return Array.isArray(strChuncks) && !isNaN(Number(strChuncks[0])) ? parseInt(strChuncks[0]) : null;
};

export const sanitizeBytes = (str: any) => {
	const size = sizetoInteger(str);
	return size ? formatBytes(size) : '0 bytes';
};

export const calcCompressionRate = (storageSize: string, ingestionSize: string) => {
	const parsedStorageSize = sizetoInteger(storageSize);
	const parsedIngestionSize = sizetoInteger(ingestionSize);

	if (parsedIngestionSize === null || parsedStorageSize === null) return '–';

	if (parsedIngestionSize === 0) return '0%';

	const rate = (100 - (parsedStorageSize / parsedIngestionSize) * 100)
	
	if (rate <= 0) return '0%';

	return `${rate.toPrecision(4)}%`;
};