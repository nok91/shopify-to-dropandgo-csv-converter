import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import csv from 'csv-parser';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        // Parse the CSV data
        const csvData = await parseCsvFile(file);

        // Manipulate CSV data as needed
        const modifiedData = csvData.map((row: any) => {
            const buildingNumber = sanitizeAddress(row['Shipping Street'] || row['Billing Address1'] || '');
            const postcode = row['Shipping Zip'] || row['Billing Zip'] || '';
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

async function parseCsvFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onload = () => {
            csv({ headers: true })
                .on('data', (data: any) => results.push(data))
                .on('end', () => resolve(results))
                .write(reader.result as string);
        };
        reader.readAsText(file);
    });
}

function convertToCsv(data: any[]): string {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));
    const csvArray = [headers.join(','), ...rows.map(row => row.join(','))];
    return csvArray.join('\n');
}

async function uploadBlob(blob: Blob): Promise<string> {
    const modifiedBlob = await put(`test`, blob, { access: 'public', contentType: 'text/csv', addRandomSuffix: true });
    return modifiedBlob.url;
}

const sanitizeAddress = (address: string) => {
    return address.replace(/,/g, '').replace(/\s{2,}/g, ' ').trim().replace(/^"|"$/g, ''); // Remove commas, extra spaces, leading/trailing double quotes before trimming
};
