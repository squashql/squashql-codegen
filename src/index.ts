#!/usr/bin/env node

import {BigQueryClient} from "./bigquery";
import 'dotenv/config'
import {SnowflakeClient} from "./snowflake";
import {codeGenerateTablesFile} from "./file";

function generateTablesFile() {
    const bigquery = "bigquery";
    const snowflake = "snowflake";
    const client = process.env.SQUASHQL_CLIENT;
    if (client === bigquery) {
        let bigQueryClient = new BigQueryClient();
        let options = {
            datasetId: process.env.SQUASHQL_BIGQUERY_DATASET_ID
        };
        return codeGenerateTablesFile(bigQueryClient, options)
    } else if (client === snowflake) {
        let snowflakeClient = new SnowflakeClient();
        let options = {
            account: process.env.SQUASHQL_SNOWFLAKE_ACCOUNT,
            username: process.env.SQUASHQL_SNOWFLAKE_USERNAME,
            password: process.env.SQUASHQL_SNOWFLAKE_PASSWORD,
            database: process.env.SQUASHQL_SNOWFLAKE_DATABASE,
            schema: process.env.SQUASHQL_SNOWFLAKE_SCHEMA
        };
        return codeGenerateTablesFile(snowflakeClient, options)
    } else {
        throw new Error(`Please define a environment variable SQUASHQL_CLIENT (value currently set is ${client}) with one of this value: [${bigquery}, ${snowflake}]`)
    }
}

generateTablesFile().then(() => console.log("File generated"))