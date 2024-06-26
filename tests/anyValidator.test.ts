import { describe, expect, test } from "vitest"
import anyValidator from "../lib/validators/anyValidator"

describe("required", () => {
	test("undefined is accepted when value is not required", () => {
		expect(
			anyValidator(
				{
					type: "any",
					required: false,
				},
				undefined,
				new Map()
			)
		).toBe(true)
	})
})

describe("type", () => {
	test("undefined is accepted", () => {
		expect(
			anyValidator(
				{
					type: "any",
				},
				undefined,
				new Map()
			)
		).toBe(true)
	})

	test("string is accepted", () => {
		expect(
			anyValidator(
				{
					type: "any",
				},
				"",
				new Map()
			)
		).toBe(true)
	})

	test("number is accepted", () => {
		expect(
			anyValidator(
				{
					type: "any",
				},
				1,
				new Map()
			)
		).toBe(true)
	})
})
