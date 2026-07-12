const { jsPDF } = require('jspdf');

function testPdf() {
    try {
        const doc = new jsPDF();
        doc.text("Hello World", 10, 10);
        const output = doc.output('arraybuffer');
        console.log("Success! ArrayBuffer byte length:", output.byteLength);
    } catch (e) {
        console.error("Failed:", e);
    }
}
testPdf();
