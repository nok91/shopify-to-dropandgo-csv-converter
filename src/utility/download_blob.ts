
type Opts = {
    blob: Blob,
    filename?: string,
}
export default function downloadBlob(opts: Opts) {
    const blobUrl = URL.createObjectURL(opts.blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    if (opts.filename) {
        link.download = opts.filename; 
    }
    link.click();

    // Clean up
    URL.revokeObjectURL(blobUrl);
}