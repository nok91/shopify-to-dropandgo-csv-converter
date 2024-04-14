import { put } from '@vercel/blob';
import fs from 'fs';
import { mkdir, writeFile, unlink } from 'fs/promises';
import csv from 'csv-parser';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import mime from 'mime';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

type Data = {
    'Destination country': string,
    'Service': string,
    'Building name or number': string,
    'Postcode': string,
    'Item value or cover required': string,
    'Description': string,
    'Dangerous goods': string,
    'Marketplace sold on': string
}

type FileData = {
    name: string;
    type: string;
    buffer: Buffer;
}

const REL_UPLOAD_DIR = '/uploads';
const MAX_FILE_SIZE_MB = 5; // 5MB

async function saveFile(fileData: FileData): Promise<string> {
    const uploadDir = path.join(process.cwd(), "public", REL_UPLOAD_DIR);
    await mkdir(uploadDir, { recursive: true });
    const filename = `${uuidv4()}.${mime.getExtension(fileData.type)}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, fileData.buffer);
    return filePath;
}

type FileType = File | null;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as FileType;
        if (!file) {
            throw new Error("File blob is required.");
        }

        validateUploadedFile(file)

        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = await saveFile({
            name: file.name,
            type: file.type,
            buffer,
        });

        const data: Data[] = [];
        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row: any) => {
                    const buildingNumber = sanitizeAddress(row['Shipping Street'] || row['Billing Address1'] || '');
                    const postcode = row['Shipping Zip'] || row['Billing Zip'] || '';
                    const description = 'Tradition clothes';
                    data.push({
                        'Destination country': 'United Kingdom',
                        'Service': 'Royal Mail Tracked 24',
                        'Building name or number': buildingNumber,
                        'Postcode': postcode,
                        'Item value or cover required': '20 GBP',
                        'Description': description,
                        'Dangerous goods': 'No',
                        'Marketplace sold on': 'Shopify'
                    });
                })
                .on('end', () => {
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                });
        });

        const outputPath = path.join(process.cwd(), "public", `${REL_UPLOAD_DIR}/output-${uuidv4()}.csv`);
        const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: [
                { id: 'Destination country', title: 'Destination country' },
                { id: 'Service', title: 'Service' },
                { id: 'Building name or number', title: 'Building name or number' },
                { id: 'Postcode', title: 'Postcode' },
                { id: 'Item value or cover required', title: 'Item value or cover required' },
                { id: 'Description', title: 'Description' },
                { id: 'Dangerous goods', title: 'Dangerous goods' },
                { id: 'Marketplace sold on', title: 'Marketplace sold on' }
            ],
            encoding: 'utf8' // Specify UTF-8 encoding
        });
        await csvWriter.writeRecords(data);
        const fileData = fs.readFileSync(outputPath);

        setTimeout(async () => {
            // Delete uploaded and converted files
            await unlink(filePath);
            await unlink(outputPath);
        }, 10_000)

        const headers = new Headers();

        headers.set("Content-Type", "text/csv");
        headers.set('Content-Disposition', `attachment; filename=${path.basename(outputPath)}`);
        return NextResponse.json(fileData, { status: 200, statusText: "OK", headers });
    } catch (error: any) {
        console.error('Error handling file upload:', error.message || error);
        return NextResponse.json({ error: "Something went wrong (test).", message: JSON.stringify(error.message || error) }, { status: 500 });
    }
}

const sanitizeAddress = (address: string) => {
    return address.replace(/,/g, '').replace(/\s{2,}/g, ' ').trim().replace(/^"|"$/g, ''); // Remove commas, extra spaces, leading/trailing double quotes before trimming
};

async function validateUploadedFile(file: File): Promise<void> {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
        throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`);
    }
    // Check file type
    if (!file.type.includes('csv')) {
        throw new Error("Uploaded file must be in CSV format.");
    }
}
