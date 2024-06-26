import { describe, expect, test, it } from "@jest/globals";
import { table, customSQL } from "./template";

const VALID_CASES = [
  //commmon
  [customSQL`SELECT * FROM users`, { text: "SELECT * FROM users", values: [] }],
  [
    customSQL`SELECT * FROM users WHERE id = ${1}`,
    { text: "SELECT * FROM users WHERE id = $1", values: [1] },
  ],
  [
    customSQL`SELECT * FROM users WHERE id = ${1} AND name = ${"Alice"}`,
    {
      text: "SELECT * FROM users WHERE id = $1 AND name = $2",
      values: [1, "Alice"],
    },
  ],
  // array
  [
    customSQL`SELECT * FROM users WHERE id = ${[1, 2, 3]}`,
    {
      text: "SELECT * FROM users WHERE id = ARRAY[$1, $2, $3]",
      values: [1, 2, 3],
    },
  ],
  [
    customSQL`SELECT * FROM users WHERE id = ${[
      1, 2, 3,
    ]} AND name = ${"Alice"}`,
    {
      text: "SELECT * FROM users WHERE id = ARRAY[$1, $2, $3] AND name = $4",
      values: [1, 2, 3, "Alice"],
    },
  ],
  // table name
  [
    customSQL`SELECT * FROM ${table("users")}`,
    { text: 'SELECT * FROM "users"', values: [] },
  ],
  [
    customSQL`SELECT * FROM ${table("users where 1=1; --")} WHERE id = ${1}`,
    {
      text: 'SELECT * FROM "users where 1=1; --" WHERE id = $1',
      values: [1],
    },
  ],
  [
    customSQL`SELECT * FROM ${table('users"; --')}`,
    {
      text: 'SELECT * FROM "users""; --"',
      values: [],
    },
  ],
];

describe("Templating", () => {
  it.each(VALID_CASES)(
    "should return the correct query",
    (template, expected) => {
      expect(template).toEqual(expected);
    }
  );
});
