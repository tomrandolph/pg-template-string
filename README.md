# pg-template-string

SQL is all you need. Write dynamic queries without learning a new syntax.

## TODO

- make npm package
- support typed return values
- support bulk inserts?

## Usage

```typescript
import { table, customSQL } from "./template";
import { Client } from pg;

const client = new Client({...});

await client.connect();
// These parameters could be arbitrary user input
const tableName = "users";
const id = 1;
// Will return a query config with the tablename escaped to prevent injection
// and the id parameterized in a prepared statement
const query = customSql`select * from ${table(tableName)} where id = ${id}`
// Config can be used directly with the pg driver
const res = await client.query(query)


```
