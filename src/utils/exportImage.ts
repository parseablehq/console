import html2canvas from 'html2canvas';
import _ from 'lodash';

export const makeExportClassName = (name: string) => {
	const sanitizedName = _.replace(name, /\./g, '-');
	return `png-capture-${sanitizedName}`;
};

const onCloneCallback = (document: Document, element: HTMLElement) => {
	const containerDiv = element.querySelector('.png-export-tile-container') as HTMLElement;
	const menuIcon = element.querySelector('.png-export-menu-icon') as HTMLElement;
	const tileTitleDiv = element.querySelector('.png-export-tile-title') as HTMLElement;
	const headerDiv = element.querySelector('.png-export-tile-header') as HTMLElement;
	const tileDescriptionDiv = element.querySelector('.png-export-tile-description') as HTMLElement;
	const timeRangeText = document.querySelector('.png-export-tile-timerange') as HTMLElement;
	const logoImage = document.querySelector('.png-export-parseable-logo') as HTMLElement;
	if (headerDiv) {
		headerDiv.style.height = 'auto';
		headerDiv.style.alignItems = 'flex-start';
	}

	if (containerDiv) {
		containerDiv.style.border = 'none';
	}

	if (menuIcon) {
		menuIcon.remove();
	}

	if (tileTitleDiv) {
		tileTitleDiv.style.setProperty('--text-line-clamp', 'none');
	}

	if (tileDescriptionDiv) {
		tileDescriptionDiv.style.setProperty('--text-line-clamp', 'none');
	}

	if (element) {
		element.style.height = 'auto';
	}

	if (timeRangeText) {
		timeRangeText.style.display = 'block';
	}

	if (logoImage) {
		logoImage.style.display = 'block';
		logoImage.style.marginTop = '4px';
		logoImage.style.marginLeft = '4px';
	}
};

const handleCapture = (opts: { className: string; fileName: string }) => {
	const { className, fileName = 'png-export' } = opts;
	try {
		const element = document.querySelector(`.${className}`) as HTMLElement;
		if (element) {
			html2canvas(element, {
				scale: 3,
				backgroundColor: null,
				onclone(document, element) {
					onCloneCallback(document, element);
				},
			}).then((canvas) => {
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
