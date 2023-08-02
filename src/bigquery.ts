import {Client, TableType} from "./types";
import {BigQuery} from "@google-cloud/bigquery";

export class BigQueryClient implements Client {
    async getTablesInfo(options?: any): Promise<TableType[]> {
        const datasetId = options.datasetId
        if (!datasetId) {
            throw new Error("datasetId is missing in options object")
        }
        const bigquery = new BigQuery()
        const dataset = bigquery.dataset(datasetId)
        if (!dataset) {
            throw new Error(`Cannot find dataset with id '${datasetId}'`)
        }

        const tablesObj: TableType[] = []
        const tablesResponse = await dataset.getTables()
        const tables = tablesResponse[0]

        for (let i = 0; i < tables.length; i++) {
            const table = tables[i].id
            if (!table) {
                throw new Error("table should have an id")
            } else {
                const fields: string[] = []
                const tableObj = {table: table, fields}
                tablesObj.push(tableObj)
                const metadataResponse = await tables[i].getMetadata()
                metadataResponse[0].schema.fields.map((e: { name: string; }) => fields.push(e.name))
            }
        }
        return tablesObj
    }
}