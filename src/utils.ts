import parse from "date-fns/parse";

export function assertNoneNull<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error("assertNoneNull");
  }
}

export function parseAdHocDate(dateStr: string): Date {
  return parse(dateStr, "dd/MM/yyyy", 0);
}
