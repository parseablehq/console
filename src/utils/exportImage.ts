import html2canvas from 'html2canvas';

const handleCapture = () => {
    const element = document.querySelector('.capture-class');
    if (element) {
      html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'capture.png';
        link.click();
      });
    }
  };

export default handleCapture;