# SquashQL Codegen

This tool is inspired by [Kysely Codegen](https://github.com/RobinBlomberg/kysely-codegen)

squashql-codegen generates type definitions that represent tables from your database in ts file named `tables.ts`. The
types can be used with the [TypeScript library](https://www.npmjs.com/package/@squashql/squashql-js) to build SQL-like queries compatible with SquashQL.

Example:

```typescript
import {TableField} from "@squashql/squashql-js"

class Product {
    readonly _name: string = "product"
    readonly productId: TableField = new TableField("product.product_id")
    readonly price: TableField = new TableField("product.price")
    readonly brand: TableField = new TableField("product.brand")
    readonly categoryId: TableField = new TableField("product.category_id")
}

class Category {
    readonly _name: string = "category"
    readonly categoryId: TableField = new TableField("category.category_id")
    readonly status: TableField = new TableField("category.status")
}

const product = new Product()
const category = new Category()

export {
    product, category
}
```

And then you can use it for your calculations that need to use the `Field` interface. [See the documentation](https://github.com/squashql/squashql/blob/main/documentation/QUERY.md#fields).
```typescript
import {product, category} from "./table"

const price = product.price
const status = category.status
// ...
```

## Installation & Execution

To install the CLI globally

```
npm install -g @squashql/squashql-codegen
```

To execute the CLI without installing anything

```
npx squashql-codegen
```

## Configuration

Create an .env to define a couple of environment variables needed to connect to the database and correctly
execute the script. It also possible
to [pass the values to the CLI](https://stackoverflow.com/questions/22312671/setting-environment-variables-for-node-to-retrieve)

In each case, a client needs to be created to connect to the DB by setting the env. variable `SQUASHQL_CLIENT`.

### BigQuery

The CLI uses [Application Default Credentials to authenticate](https://cloud.google.com/docs/authentication/application-default-credentials).

```
# .env file
SQUASHQL_CLIENT="bigquery" # mandatory
SQUASHQL_BIGQUERY_DATASET_ID="nameofthedataset" # mandatory
GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json # mandatory if this authentication method is used https://cloud.google.com/docs/authentication/application-default-credentials#GAC
```

## Snowflake

TODO

## Clickhouse

TODO