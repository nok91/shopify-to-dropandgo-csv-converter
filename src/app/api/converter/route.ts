import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        // Check if the file is a CSV
        if (!file || !file.type.includes('csv')) {
            throw new Error("Uploaded file must be in CSV format.");
        }

        // Read the uploaded file as a text
        const fileData = await file.text();

        // Manipulate CSV data as needed
        const modifiedData: any[] = [];
        // Example manipulation: splitting lines and converting to an array of objects
        fileData.split('\n').forEach((line: string) => {
            const [buildingNumber, postcode] = line.split(','); // Assuming CSV format: Building name or number,Postcode
            const description = 'Tradition clothes';
            modifiedData.push({
                'Destination country': 'United Kingdom',
                'Service': 'Royal Mail Tracked 24',
                'Building name or number': buildingNumber,
                'Postcode': postcode,
                'Item value or cover required': '20 GBP',
                'Description': description,
                'Dangerous goods': 'No',
                'Marketplace sold on': 'Shopify'
            });
        });

        // Convert modified data back to CSV string
        const modifiedCsv = convertToCsv(modifiedData);

        // Upload the modified CSV string as a Blob and get its URL
        const modifiedBlob = new Blob([modifiedCsv], { type: 'text/csv' });
        const modifiedBlobUrl = await uploadBlob(modifiedBlob);

        // Return the modified Blob URL
        return NextResponse.json({ url: modifiedBlobUrl }, { status: 200, statusText: "OK" });

    } catch (error: any) {
        console.error('Error handling file upload:', error.message || error);
        return NextResponse.json({ error: "Something went wrong.", message: JSON.stringify(error.message || error) }, { status: 500 });
    }
}

function convertToCsv(data: any[]): string {
    // Convert array of objects back to CSV string
    // You can use a library like csv-writer or csv-stringify for more robust CSV conversion
    // For simplicity, let's assume data is already in CSV format
    return data.join('\n');
}

async function uploadBlob(blob: Blob): Promise<string> {
    // Upload Blob to storage and return its URL
    const modifiedBlob = await put(`${uuidv4()}.csv`, blob, { access: 'public', contentType: 'text/csv', addRandomSuffix: true });
    return modifiedBlob.url;
}
