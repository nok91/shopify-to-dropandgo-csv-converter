"use client";
import type { PutBlobResult } from '@vercel/blob';
import { Link, FileTrigger, DropZone, Text } from 'react-aria-components';
import type { FileDropItem } from 'react-aria';
import React, { useState } from 'react';
import styles from "./drag_and_drop.module.css";
import { Button } from '@/components';
import { downloadBlob } from '@/utility';

function DragAndDrop() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState<boolean>(false);

    const handleFileSelection = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }
        if (!file.name.endsWith('.csv')) {
            setError("Invalid file format. Please upload a CSV file.");
            return;
        }
        setError(null);
        setFile(file);
    }

    async function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!file) return
        setPending(true)
        const formData = new FormData();
        formData.append('file', file)

        try {
            const response = await fetch('/api/converter', {
                method: 'POST',
                body: formData,
            })
            const newBlob = (await response.json()) as PutBlobResult;
            downloadBlob({ blob: newBlob })
        } catch (error) {
            console.error({ error })
            setError('An unknown error occurred while trying to upload your file.')
        }
        setPending(false)
    }

    return (
        <form className={styles.form} onSubmit={onSubmitHandler}>
            <div className={styles['drag-and-drop-wrapper']}>
                <DropZone
                    className={styles['drag-and-drop']}
                    onDrop={async (e: any) => {
                        let files = e.items.filter((file: FileDropItem) =>
                            file.kind === 'file'
                        ) as FileDropItem[];
                        const file = await files[0].getFile();
                        handleFileSelection(file);
                    }}
                >
                    <div className={styles['dad-body']}>
                        <FileTrigger
                            // allowsMultiple
                            onSelect={async (e: any) => {
                                let files: File[] = Array.from(e);
                                const file = files[0];
                                handleFileSelection(file);
                            }}
                        >
                            <Link className={styles['click-to-upload']}>Click to upload &nbsp;</Link>
                        </FileTrigger>
                        <Text slot="label" style={{ display: 'block' }}>
                            {file?.name || ' or drag and drop'}
                        </Text>
                    </div>
                    <span className={styles['dad-description']}>Maximum size file 5MB.</span>
                </DropZone>
                {error && <div className={styles.error}>{error}</div>}
            </div>
            <div className={styles.footer}>
                <Button disabled={file === null} pending={pending} submit>
                    Convert
                </Button>
            </div>
        </form>
    )
}

export default DragAndDrop