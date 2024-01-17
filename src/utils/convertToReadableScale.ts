export const convertToReadableScale = (val: number) => {
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
};
