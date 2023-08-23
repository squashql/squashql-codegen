#!/usr/bin/env node

import _ from "lodash"
import os from "os";
import * as fs from "fs"
import {BigQueryClient} from "./bigquery";
import 'dotenv/config'
import {TableType} from "./types";
import {SnowflakeClient} from "./snowflake";
import path from "path";

function indent(s: string): string {
    for (let i = 0; i < 4; i++) {
        s += " "
    }
    return s
}

function capitalizeFirstLetter(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function getTablesInfo(): () => Promise<TableType[]> {
    const bigquery = "bigquery";
    const snowflake = "snowflake";
    const client = process.env.SQUASHQL_CLIENT;
    if (client === bigquery) {
        return () => new BigQueryClient().getTablesInfo({
            datasetId: process.env.SQUASHQL_BIGQUERY_DATASET_ID
        })
    } else if (process.env.SQUASHQL_CLIENT === snowflake) {
        return () => new SnowflakeClient().getTablesInfo({
            account: process.env.SQUASHQL_SNOWFLAKE_ACCOUNT,
            username: process.env.SQUASHQL_SNOWFLAKE_USERNAME,
            password: process.env.SQUASHQL_SNOWFLAKE_PASSWORD,
            database: process.env.SQUASHQL_SNOWFLAKE_DATABASE,
            schema: process.env.SQUASHQL_SNOWFLAKE_SCHEMA
        })
    } else {
        throw new Error(`Please define a environment variable SQUASHQL_CLIENT (value currently set is ${client}) with one of this value: [${bigquery}, ${snowflake}]`)
    }
}

getTablesInfo()().then(tableTypes => {
    let s = "import {TableField} from \"@squashql/squashql-js\"" + os.EOL + os.EOL
    const tableNamesCC: string[] = []
    tableTypes.forEach(tableType => {
        const cc = _.camelCase(tableType.table)
        tableNamesCC.push(cc)
        s += "class " + capitalizeFirstLetter(cc) + " {" + os.EOL
        s = indent(s)
        s += `readonly _name: string = "${tableType.table}"` + os.EOL
        tableType.fields.forEach((field) => {
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


    let file = 'tables.ts';
    if (process.env.SQUASHQL_PATH) {
        file = path.resolve(process.env.SQUASHQL_PATH, file);
    }
    fs.writeFileSync(file, s)
    console.log("Table type definitions successfully written to " + file)
})
