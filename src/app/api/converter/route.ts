import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        // Read the uploaded file
        const data: any[] = await new Promise((resolve, reject) => {
            const results: any[] = [];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                const csvData = reader.result as string;
                csvData
                    .split(/\r?\n/)
                    .forEach(line => {
                        const row = line.split(',');
                        results.push(row);
                    });
                resolve(results);
            };
            reader.onerror = error => reject(error);
        });

        // Manipulate CSV data as needed
        const modifiedData = data.map((row: any) => {
            const buildingNumber = sanitizeAddress(row[0] || ''); // Assuming the first column contains 'Building name or number'
            const postcode = row[1] || ''; // Assuming the second column contains 'Postcode'
            const description = 'Tradition clothes';
            return {
                'Destination country': 'United Kingdom',
                'Service': 'Royal Mail Tracked 24',
                'Building name or number': buildingNumber,
                'Postcode': postcode,
                'Item value or cover required': '20 GBP',
                'Description': description,
                'Dangerous goods': 'No',
                'Marketplace sold on': 'Shopify'
            };
        });

        // Convert modified data to CSV string
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
    return data.map(row => row.join(',')).join('\n');
}

async function uploadBlob(blob: Blob): Promise<string> {
    const modifiedBlob = await put(`${uuidv4()}.csv`, blob, { access: 'public', contentType: 'text/csv', addRandomSuffix: true });
    return modifiedBlob.url;
}

const sanitizeAddress = (address: string) => {
    return address.replace(/,/g, '').replace(/\s{2,}/g, ' ').trim().replace(/^"|"$/g, ''); // Remove commas, extra spaces, leading/trailing double quotes before trimming
};
