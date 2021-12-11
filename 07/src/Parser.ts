import { readFileSync } from "fs";
import {
  ArithmeticLogicalCommand,
  CommandType,
  MemoryAccessCommand,
  ParsedLine,
} from "./types";
import {
  memoryAccessCommands,
  arithmeticLogicalCommands,
  twoArgumentsCommands,
} from "./commands";
import { isWhitespace } from "./utils";

/**
 * read
 *
 * Reads the file as text and returns its lines as an array
 */
function read(filename: string): string[] {
  return readFileSync(filename)
    .toString()
    .replace(/\r\n/g, "\n") // Handle Windows line endings
    .split("\n")
    .filter((line) => !isWhitespace(line));
}

/**
 * commandType
 *
 * Returns a constant representing the type of the current command.
 * If the current command is an arithmetic-logical command, returns C_ARITHMETIC.
 */
function commandType(line: string): CommandType {
  const [command] = line.split(" ");
  if (memoryAccessCommands.includes(command as MemoryAccessCommand)) {
    switch (command) {
      case "push":
        return "C_PUSH";
      case "pop":
        return "C_POP";
    }
  } else if (
    arithmeticLogicalCommands.includes(command as ArithmeticLogicalCommand)
  )
    return "C_ARITHMETIC";
  return "C_ARITHMETIC";
}

/**
 * arg1
 *
 * Returns the first argument of the current command.
 * In the case of C_ARITHMETIC, the command itself (add, sub, etc.) is returned.
 * Should not be called if the current command is C_RETURN.
 */
function arg1(line: string, type: CommandType): string {
  const [command, arg1] = line.split(" ");
  if (type === "C_ARITHMETIC") return command;
  return arg1;
}

/**
 * arg2
 *
 * Returns the second argument of the current command.
 * Should be called only if the current command is C_PUSH, C_POP, C_FUNCTION, or C_CALL.
 */
function arg2(line: string, type: CommandType): number {
  const [command, arg1, arg2] = line.split(" ");
  return parseInt(arg2);
}

/**
 * parse
 *
 * Transforms a line into a ParsedLine.
 */
function parse(line: string): ParsedLine {
  const parsedLine: ParsedLine = {
    value: line,
    arg1: "",
    type: commandType(line),
  };

  if (parsedLine.type !== "C_RETURN")
    parsedLine.arg1 = arg1(line, parsedLine.type);
  if (twoArgumentsCommands.includes(parsedLine.type))
    parsedLine.arg2 = arg2(line, parsedLine.type);

  return parsedLine;
}

/**
 * Initializer
 *
 * Opens the input file, and gets ready to parse it.
 */
export default function (): ParsedLine[] {
  const filename = process.argv[2];
  console.log("About to parse file:", filename);
  const lines = read(filename);
  return lines.map((line) => parse(line));
}
