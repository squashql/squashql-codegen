export interface TableType {
    table: string,
    fields: string[]
}

export interface Client {
    getTablesInfo(options?: any): Promise<TableType[]>
}