# SquashQL Codegen

This tool is inspired by [Kysely Codegen](https://github.com/RobinBlomberg/kysely-codegen)

squashql-codegen generates type definitions that represent tables and fields from your database in ts file named `tables.ts`. 
It fetches from a database the list of available tables and fields and creates a typescript file with this information. The
types can be used with the [TypeScript library](https://www.npmjs.com/package/@squashql/squashql-js) to build SQL-like queries compatible with SquashQL.

## Support

Only the following databases are supported for the time being:
- [BigQuery](#bigquery)
- [Snowflake](#snowflake)

Example:

```typescript
import {TableField} from "@squashql/squashql-js"

export interface SquashQLTable {
    _fields: TableField[]
    _name: string
}

class Product implements SquashQLTable {
    readonly _name = "product"
    readonly productId: TableField = new TableField("product.product_id")
    readonly price: TableField = new TableField("product.price")
    readonly brand: TableField = new TableField("product.brand")
    readonly categoryId: TableField = new TableField("product.category_id")
    readonly _fields: TableField[] = [this.productId, this.price, this.brand, this.categoryId]
}

class Category implements SquashQLTable {
    readonly _name = "category"
    readonly categoryId: TableField = new TableField("category.category_id")
    readonly status: TableField = new TableField("category.status")
    readonly _fields: TableField[] = [this.categoryId, this.status]
}

const product = new Product()
const category = new Category()

export {
    product, category
}
```

And then you can use it for your calculations that need to use the `Field` interface or the constant . [See the documentation](https://github.com/squashql/squashql/blob/main/documentation/QUERY.md#fields).
```typescript
import {product, category} from "./table"

const price: TableField = product.price
const status: TableField = category.status

const priceName: string = price.name // name of the field is accessible
// ...
```

## Installation & Execution

To install the CLI globally

```
npm install -g @squashql/squashql-codegen
```

To execute the CLI without installing anything

```
npx @squashql/squashql-codegen
```

## Configuration

Create an .env to define a couple of environment variables needed to connect to the database and correctly
execute the script. It is also possible
to [pass the values to the CLI](https://stackoverflow.com/questions/22312671/setting-environment-variables-for-node-to-retrieve)

In each case, a client needs to be created to connect to the DB by setting the env. variable `SQUASHQL_CLIENT`.

To choose where the file should be written, the following env. variable can be set `SQUASHQL_PATH`.

```
# .env file
SQUASHQL_CLIENT="bigquery" # mandatory
SQUASHQL_PATH="/Users/john/tmp" # optional, table.ts will be written in /Users/john/tmp directory
```

### BigQuery

The CLI uses [Application Default Credentials to authenticate](https://cloud.google.com/docs/authentication/application-default-credentials).

```
# .env file
SQUASHQL_CLIENT="bigquery" # mandatory
SQUASHQL_BIGQUERY_DATASET_ID="nameofthedataset" # mandatory
GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json" # mandatory if this authentication method is used https://cloud.google.com/docs/authentication/application-default-credentials#GAC
```

## Snowflake

```
# .env file
SQUASHQL_CLIENT="snowflake"

# Snowflake
SQUASHQL_SNOWFLAKE_ACCOUNT="abc123.north-europe.azure" # mandatory
SQUASHQL_SNOWFLAKE_USERNAME="john" # mandatory
SQUASHQL_SNOWFLAKE_PASSWORD="mypassword" # mandatory
SQUASHQL_SNOWFLAKE_DATABASE="DATABASE_NAME" # mandatory
SQUASHQL_SNOWFLAKE_SCHEMA="SCHEMA_NAME" # mandatory
```
