import { PutBlobResult } from '@vercel/blob';

type Opts = {
    blob: PutBlobResult,
    filename?: string,
}
export default function downloadBlob(opts: Opts) {
    const link = document.createElement('a');
    link.href = opts.blob.url;
    link.target = '_blank';
    if (opts.filename) {
        link.download = opts.filename; 
    }
    link.click();

    // Clean up
    URL.revokeObjectURL(opts.blob.url);
}