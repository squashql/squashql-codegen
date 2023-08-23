import {Client, TableType} from "./types"
import snowflake, {Connection} from "snowflake-sdk"

export class SnowflakeClient implements Client {

    connection: Connection | undefined

    statementExecutor = (sqlText: string): Promise<any[]> => {
        const client: SnowflakeClient = this
        return new Promise(function (resolve, reject) {
            client.connection?.execute({
                sqlText,
                complete: function (err, stmt, rows) {
                    if (err) {
                        console.error(`Failed to execute statement ${stmt.getSqlText()} due to the following error: ` + err.message);
                        reject(err)
                    } else {
                        console.log('Successfully executed statement: ' + stmt.getSqlText());
                        // console.log('Result: ' + JSON.stringify(rows))
                        // rows?.forEach(r => console.log(JSON.stringify(r)))
                        if (rows) {
                            resolve(rows)
                        }
                    }
                }
            })
        })
    }

    async fetchTablesInfo(database: string, schema: string): Promise<TableType[]> {
        const rows = await this.statementExecutor(`SHOW TABLES IN SCHEMA ${database}.${schema}`)
        const tablesObj: TableType[] = []
        for (let i = 0; i < rows.length; i++) {
            const table = rows[i]["name"]
            if (!table) {
                throw new Error("cannot find 'name' in " + JSON.stringify(rows[0]))
            } else {
                const fields: string[] = []
                const tableObj = {table: table, fields}
                tablesObj.push(tableObj)

                const rows1 = await this.statementExecutor(`SHOW COLUMNS IN ${database}.${schema}.${table}`)
                // const metadataResponse = await tables[i].getMetadata()
                rows1.forEach(r => fields.push(r["column_name"]))
            }
        }
        return tablesObj
    }

    async getTablesInfo(options?: any): Promise<TableType[]> {
        // Create a Connection object that we can use later to connect.
        this.connection = snowflake.createConnection({
            account: options.account,
            username: options.username,
            password: options.password,
            application: "squashql-codegen",
        })
        const client: SnowflakeClient = this
        return new Promise(function (resolve, reject) {
            // Try to connect to Snowflake, and check whether the connection was successful.
            client.connection?.connect(
                function (err, conn) {
                    if (err) {
                        console.error('Unable to connect: ' + err.message);
                        reject(err)
                    } else {
                        console.log('Successfully connected to Snowflake.');
                        client
                            .fetchTablesInfo(options.database, options.schema)
                            .then(e => resolve(e))
                    }
                }
            )
        })
    }
}
