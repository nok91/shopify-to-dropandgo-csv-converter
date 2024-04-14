// types/formidable.d.ts

export type File = {
    name: string;
    path: string;
    type: string;
    size: number;
    lastModifiedDate?: Date;
    hash?: string;
    toJSON(): object;
};

export type Files = {
    [fieldName: string]: File;
};
