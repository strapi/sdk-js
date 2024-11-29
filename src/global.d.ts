/**
 * Extracts `string` keys from the properties of a given {@link T}.
 *
 * This utility type is beneficial when dealing with mapped types or interfaces where it is necessary to
 * operate only on properties whose keys are specifically of the `string` type.
 *
 * @template T The target object type from which string keys are extracted.
 *
 * @example
 * // Define an interface with different types of keys.
 interface Example {
 name: string;
 age: number;
 [key: symbol]: boolean;
 }

 // Use `StringKeysOf` to extract only the string keys.
 type StringKeys = StringKeysOf<Example>; // Results in "name" | "age"
 *
 * @remark This type is particularly useful in scenarios involving conditional types and mapped type utilities.
 */
type StringKeysOf<T> = keyof T & string;
