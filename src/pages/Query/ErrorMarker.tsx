export var ErrorMarker: any[] = [];

// example format to generate error
// let err = {
//     message: 'unknow type',
//     line: 4,
//     column: 5,
//     length: 5
//     };

// let err = null;
// if (err) {
//   ErrorMarker.push({
//     startLineNumber: err.line,
//     endLineNumber: err.line,
//     startColumn: err.column,
//     endColumn: err.column + err.length,
//     message: err.message,
//     severity: "monaco.MarkerSeverity.Error",
//   });
// }
export function errChecker(code: string, streamName: string) {
	let arr = code.split('\r\n');
	ErrorMarker = [];
	arr.map((wordsString: string, j: any) => {
		let wordsArray = wordsString.split(' ');
		wordsArray.map((word: string, i: any) => {
			if (word.toLowerCase() === 'from' && wordsArray[i + 1]) {
				if (wordsArray[i + 1] !== streamName && wordsArray[i + 1] !== `${streamName};`) {
					ErrorMarker.push({
						startLineNumber: j + 1,
						endLineNumber: j + 1,
						startColumn: wordsString.indexOf(wordsArray[i + 1]) + 1, //i+1,
						endColumn: wordsString.indexOf(wordsArray[i + 1]) + wordsArray[i + 1].length + 1,
						message: `Schema support available for ${streamName} `,
					});
				}
			}
		});
	});
	return;

	// const blocksArray = GetCodeBlocks(code);

	// ErrorMarker = [];
	// for (var i = 0; i < blocksArray.length; ++i) {
	//     const headLineArray = blocksArray[i].blockText.split(/\r?\n/)[0].split(" ");
	//     if (keywords.indexOf(headLineArray[0]) < 0) {
	//         ErrorMarker.push({
	//             startLineNumber: blocksArray[i].blockStartLine,
	//             endLineNumber: blocksArray[i].blockStartLine,
	//             startColumn: 0,
	//             endColumn: headLineArray[0].length,
	//             message: "Expected one of GET/POST/PUT/DELETE/HEAD",
	//             severity: "monaco.MarkerSeverity.Error",
	//         });
	//     }
	// }
}
