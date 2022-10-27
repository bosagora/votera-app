export enum WorkerType {
    GET_LOCAL,
    SET_LOCAL,
    RESET_LOCAL,
    ENCRYPT,
    DECRYPT,
    ERROR,
}

export type WorkerData = {
    type?: WorkerType;
    id?: number;
    data1?: string;
    data2?: string;
};
