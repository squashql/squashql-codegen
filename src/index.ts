import {
    BigQuery,
} from "@google-cloud/bigquery"
import {TableType} from "./types";
import _ from "lodash"
import os from "os";
import * as fs from "fs"

async function getTablesInfo(datasetId: string): Promise<TableType[]> {
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
            if (i === tables.length - 1) {
                // Last table
                console.log(tablesObj)
            }
        }
    }
    return tablesObj
}

// TODO should be a param
const datasetId = "optiprix"

function indent(s: string): string {
    for (let i = 0; i < 4; i++) {
        s += " "
    }
    return s
}

function capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

getTablesInfo(datasetId).then(tableTypes => {
    let s = "import {TableField} from \"@squashql/squashql-js\"" + os.EOL + os.EOL
    const tableNamesCC: string[] = []
    tableTypes.forEach(tableType => {
        const cc = _.camelCase(tableType.table)
        tableNamesCC.push(cc)
        s += "class " + capitalizeFirstLetter(cc) + " {" + os.EOL
        s = indent(s)
        s += `readonly _name: string = "${tableType.table}"` + os.EOL
        tableType.fields.forEach((field, index) => {
            s = indent(s)
            s += "readonly " + _.camelCase(field) + `: TableField = new TableField(\"${tableType.table}.${field}\")`
            s += os.EOL
        })
        s += "}" + os.EOL
        s += os.EOL
    })


    tableNamesCC.forEach(tableNameCC => {
        s += "const " + tableNameCC + " = new " + capitalizeFirstLetter(tableNameCC) + "()" + os.EOL
    })

    s += os.EOL
    s += "export {" + os.EOL
    s = indent(s)
    tableNamesCC.forEach((tableNameCC, index) => {
        s += tableNameCC
        if (index < tableNamesCC.length - 1) {
            s += ", "
        } else {
            s += os.EOL
        }
    })
    s += "}"
    s += os.EOL

    fs.writeFileSync('tables.ts', s)
})
