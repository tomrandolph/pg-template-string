import type { QueryResult, QueryResultRow } from "pg";

function* incrementGenerator() {
  let count = 1;
  while (true) {
    yield count++;
  }
}

function* arrayIter<T>(arr: T[]) {
  for (const item of arr) {
    yield item;
  }
}

export class TableName {
  constructor(public readonly value: string) {}
  get name(): string {
    // Allow for double quotes in table names while preventing SQL injection
    // Still best to only allow known table names e.g. by checking against a whitelist
    return this.value.replace(/"/g, '""');
  }
}

export const customSQL: SqlFunction = (textFragments, ...values) => {
  const queryFragments: string[] = [];
  const variableIndex = incrementGenerator();
  const valueIterator = arrayIter(values);
  const finalValues: Primitive[] = [];
  textFragments.forEach((segment, i) => {
    queryFragments.push(segment);

    const coorespondingValue = valueIterator.next().value;

    const isLast = i === textFragments.length - 1;
    if (isLast) return;
    if (Array.isArray(coorespondingValue)) {
      const arrayContents = coorespondingValue
        .map(() => `$${variableIndex.next().value}`)
        .join(", ");
      queryFragments.push(`ARRAY[${arrayContents}]`);
      finalValues.push(...coorespondingValue);
      return;
    }
    if (coorespondingValue instanceof TableName) {
      queryFragments.push(coorespondingValue.name);

      return;
    }

    finalValues.push(coorespondingValue as Primitive);
    queryFragments.push(`$${variableIndex.next().value}`);
  });

  const query = queryFragments.join("");
  return { text: query, values: finalValues };
};
type Primitive = string | number | boolean | null;
type SqlFunction = (
  strings: TemplateStringsArray,
  ...values: Array<Primitive | Primitive[] | TableName>
) => { text: string; values: Primitive[] };
