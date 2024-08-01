import html2canvas from 'html2canvas';
import _ from 'lodash';

export const makeExportClassName = (name: string) => {
  const sanitizedName = _.replace(name, /\./g, '-');
  return `png-capture-${sanitizedName}`
}

const handleCapture = (opts: { className: string, fileName: string }) => {
	const { className, fileName = 'png-export' } = opts;
	try {
		const element = document.querySelector(`.${className}`);
		if (element) {
			html2canvas(element).then((canvas) => {
				const imgData = canvas.toDataURL('image/png');
				const link = document.createElement('a');
				link.href = imgData;
				link.download = fileName;
				link.click();
			});
		}
	} catch (e) {
		console.log('Unable to capture image', e);
	}
};

export default handleCapture;