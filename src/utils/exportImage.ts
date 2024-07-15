import html2canvas from 'html2canvas';

const handleCapture = () => {
    console.log("pop")
    const element = document.querySelector('.capture-class');
    console.log("kolo", element)
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