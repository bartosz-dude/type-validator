import {
	MatchError,
	RequiredError,
	SchemaError,
	TypeError,
	TypeValidationError,
	ValueError,
} from "../Errors"
import useVariable from "../schemaVariables/useVariable"
import { NumberSchema, SchemaVariable, TypeSchema } from "../types/schemaTypes"
import { SchemaVariables } from "../validate"

interface Options {
	targetName?: string
}

export default function numberValidator(
	schema: NumberSchema,
	target: any,
	schemaVariables: SchemaVariables,
	options: Options = {}
) {
	options.targetName ??= target
	const targetName = options.targetName as string

	if (typeof target === "undefined") {
		if (
			useVariable(
				schema.required,
				schemaVariables,
				{
					schemaProperty: "required",
					schema: JSON.stringify(schema),
					type: "number",
				},
				{
					type: "boolean",
				},
				schema.use$
			)
		) {
			throw new RequiredError({
				schema: JSON.stringify(schema),
				targetName: targetName,
				targetValue: target,
				type: "number",
			})
		}
		return true
	}

	if (typeof target !== "number") {
		throw new TypeError({
			schema: JSON.stringify(schema),
			targetName: targetName,
			targetValue: target,
			type: "number",
		})
	}

	if (typeof schema.match === "number" || typeof schema.match === "string") {
		const matchValue = useVariable(
			schema.match,
			schemaVariables,
			{
				schemaProperty: "match",
				schema: JSON.stringify(schema),
				type: "number",
			},
			{
				type: "number",
			},
			schema.use$
		)
		if (target !== matchValue) {
			throw new MatchError({
				schema: JSON.stringify(schema),
				targetName: targetName,
				targetValue: target,
				type: "number",
				details: {
					type: "number",
					value: target,
					valueSchema: schema.match,
				},
			})
		}
	}

	if (Array.isArray(schema.match)) {
		const match = schema.match.map((v) => {
			if (typeof v === "number" || typeof v === "string") {
				return useVariable(
					v,
					schemaVariables,
					{
						schemaProperty: "match[]",
						schema: JSON.stringify(schema),
						type: "number",
					},
					{
						type: "number",
					},
					schema.use$
				)
			}

			if (typeof v === "object") {
				return {
					min: useVariable(
						v.min,
						schemaVariables,
						{
							schemaProperty: "match[].min",
							schema: JSON.stringify(schema),
							type: "number",
						},
						{
							type: "number",
						},
						schema.use$
					),
					max: useVariable(
						v.max,
						schemaVariables,
						{
							schemaProperty: "match[].max",
							schema: JSON.stringify(schema),
							type: "number",
						},
						{
							type: "number",
						},
						schema.use$
					),
				}
			}

			return v
		})

		if (
			match.some((v) => typeof v === "number") &&
			match.some((v) => typeof v === "object")
		) {
			throw new SchemaError(
				`You cannot mix numbers and ranges in single number match declaration`
			)
		}

		if (
			match.every((v) => typeof v === "number") &&
			!match.includes(target)
		) {
			throw new ValueError(
				`${options.targetName} must be contained in '${JSON.stringify(
					match
				)}'`
			)
		}

		let failedMatches = 0
		if (match.every((v) => typeof v === "object")) {
			for (const matchEntry of match) {
				if (
					typeof matchEntry.min !== "undefined" &&
					target < matchEntry.min
				) {
					failedMatches++
					continue
				}

				if (
					typeof matchEntry.max !== "undefined" &&
					target > matchEntry.max
				) {
					failedMatches++
					continue
				}
			}
		}

		if (failedMatches === match.length) {
			throw new ValueError(
				`${options.targetName} must be contained in one of these ${match}`
			)
		}
	}

	if (typeof schema.match === "object" && !Array.isArray(schema.match)) {
		if (
			typeof schema.match.min !== "undefined" &&
			target <
				useVariable(
					schema.match.min,
					schemaVariables,
					{
						schemaProperty: "match.min",
						schema: JSON.stringify(schema),
						type: "number",
					},
					{
						type: "number",
					},
					schema.use$
				)
		) {
			throw new ValueError(
				`${options.targetName} must be higher or equal ${schema.match.min}`
			)
		}

		if (
			typeof schema.match.max !== "undefined" &&
			target >
				useVariable(
					schema.match.max,
					schemaVariables,
					{
						schemaProperty: "match.max",
						schema: JSON.stringify(schema),
						type: "number",
					},
					{
						type: "number",
					},
					schema.use$
				)
		) {
			throw new ValueError(
				`${options.targetName} must be lower or equal ${schema.match.max}`
			)
		}
	}

	if (typeof schema.$ === "string") {
		schemaVariables.set(("$" + schema.$) as SchemaVariable, target)
	}

	return true
}
