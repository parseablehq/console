/* eslint-disable */
import type { CallContext, CallOptions } from 'nice-grpc-common';
import * as _m0 from 'protobufjs/minimal';
import { Timestamp } from './google/protobuf/timestamp';
import Long from 'long';
export const protobufPackage = 'arrow.flight.protocol';

/**
 * The result of a cancel operation.
 *
 * This is used by CancelFlightInfoResult.status.
 */
export enum CancelStatus {
	/**
	 * CANCEL_STATUS_UNSPECIFIED - The cancellation status is unknown. Servers should avoid using
	 * this value (send a NOT_FOUND error if the requested query is
	 * not known). Clients can retry the request.
	 */
	CANCEL_STATUS_UNSPECIFIED = 0,
	/**
	 * CANCEL_STATUS_CANCELLED - The cancellation request is complete. Subsequent requests with
	 * the same payload may return CANCELLED or a NOT_FOUND error.
	 */
	CANCEL_STATUS_CANCELLED = 1,
	/**
	 * CANCEL_STATUS_CANCELLING - The cancellation request is in progress. The client may retry
	 * the cancellation request.
	 */
	CANCEL_STATUS_CANCELLING = 2,
	/**
	 * CANCEL_STATUS_NOT_CANCELLABLE - The query is not cancellable. The client should not retry the
	 * cancellation request.
	 */
	CANCEL_STATUS_NOT_CANCELLABLE = 3,
	UNRECOGNIZED = -1,
}

/** The request that a client provides to a server on handshake. */
export interface HandshakeRequest {
	/** A defined protocol version */
	protocolVersion: number;
	/** Arbitrary auth/handshake info. */
	payload: Uint8Array;
}

export interface HandshakeResponse {
	/** A defined protocol version */
	protocolVersion: number;
	/** Arbitrary auth/handshake info. */
	payload: Uint8Array;
}

/** A message for doing simple auth. */
export interface BasicAuth {
	username: string;
	password: string;
}

export interface Empty {}

/**
 * Describes an available action, including both the name used for execution
 * along with a short description of the purpose of the action.
 */
export interface ActionType {
	type: string;
	description: string;
}

/**
 * A service specific expression that can be used to return a limited set
 * of available Arrow Flight streams.
 */
export interface Criteria {
	expression: Uint8Array;
}

/** An opaque action specific for the service. */
export interface Action {
	type: string;
	body: Uint8Array;
}

/**
 * The request of the CancelFlightInfo action.
 *
 * The request should be stored in Action.body.
 */
export interface CancelFlightInfoRequest {
	info: FlightInfo | undefined;
}

/**
 * The request of the RenewFlightEndpoint action.
 *
 * The request should be stored in Action.body.
 */
export interface RenewFlightEndpointRequest {
	endpoint: FlightEndpoint | undefined;
}

/** An opaque result returned after executing an action. */
export interface Result {
	body: Uint8Array;
}

/**
 * The result of the CancelFlightInfo action.
 *
 * The result should be stored in Result.body.
 */
export interface CancelFlightInfoResult {
	status: CancelStatus;
}

/** Wrap the result of a getSchema call */
export interface SchemaResult {
	/**
	 * The schema of the dataset in its IPC form:
	 *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
	 *   4 bytes - the byte length of the payload
	 *   a flatbuffer Message whose header is the Schema
	 */
	schema: Uint8Array;
}

/**
 * The name or tag for a Flight. May be used as a way to retrieve or generate
 * a flight or be used to expose a set of previously defined flights.
 */
export interface FlightDescriptor {
	type: FlightDescriptor_DescriptorType;
	/**
	 * Opaque value used to express a command. Should only be defined when
	 * type = CMD.
	 */
	cmd: Uint8Array;
	/**
	 * List of strings identifying a particular dataset. Should only be defined
	 * when type = PATH.
	 */
	path: string[];
}

/** Describes what type of descriptor is defined. */
export enum FlightDescriptor_DescriptorType {
	/** UNKNOWN - Protobuf pattern, not used. */
	UNKNOWN = 0,
	/**
	 * PATH - A named path that identifies a dataset. A path is composed of a string
	 * or list of strings describing a particular dataset. This is conceptually
	 *  similar to a path inside a filesystem.
	 */
	PATH = 1,
	/** CMD - An opaque command to generate a dataset. */
	CMD = 2,
	UNRECOGNIZED = -1,
}

/**
 * The access coordinates for retrieval of a dataset. With a FlightInfo, a
 * consumer is able to determine how to retrieve a dataset.
 */
export interface FlightInfo {
	/**
	 * The schema of the dataset in its IPC form:
	 *   4 bytes - an optional IPC_CONTINUATION_TOKEN prefix
	 *   4 bytes - the byte length of the payload
	 *   a flatbuffer Message whose header is the Schema
	 */
	schema: Uint8Array;
	/** The descriptor associated with this info. */
	flightDescriptor: FlightDescriptor | undefined;
	/**
	 * A list of endpoints associated with the flight. To consume the
	 * whole flight, all endpoints (and hence all Tickets) must be
	 * consumed. Endpoints can be consumed in any order.
	 *
	 * In other words, an application can use multiple endpoints to
	 * represent partitioned data.
	 *
	 * If the returned data has an ordering, an application can use
	 * "FlightInfo.ordered = true" or should return the all data in a
	 * single endpoint. Otherwise, there is no ordering defined on
	 * endpoints or the data within.
	 *
	 * A client can read ordered data by reading data from returned
	 * endpoints, in order, from front to back.
	 *
	 * Note that a client may ignore "FlightInfo.ordered = true". If an
	 * ordering is important for an application, an application must
	 * choose one of them:
	 *
	 * * An application requires that all clients must read data in
	 *   returned endpoints order.
	 * * An application must return the all data in a single endpoint.
	 */
	endpoint: FlightEndpoint[];
	/** Set these to -1 if unknown. */
	totalRecords: number;
	totalBytes: number;
	/** FlightEndpoints are in the same order as the data. */
	ordered: boolean;
}

/** A particular stream or split associated with a flight. */
export interface FlightEndpoint {
	/** Token used to retrieve this stream. */
	ticket: Ticket | undefined;
	/**
	 * A list of URIs where this ticket can be redeemed via DoGet().
	 *
	 * If the list is empty, the expectation is that the ticket can only
	 * be redeemed on the current service where the ticket was
	 * generated.
	 *
	 * If the list is not empty, the expectation is that the ticket can
	 * be redeemed at any of the locations, and that the data returned
	 * will be equivalent. In this case, the ticket may only be redeemed
	 * at one of the given locations, and not (necessarily) on the
	 * current service.
	 *
	 * In other words, an application can use multiple locations to
	 * represent redundant and/or load balanced services.
	 */
	location: Location[];
	/**
	 * Expiration time of this stream. If present, clients may assume
	 * they can retry DoGet requests. Otherwise, it is
	 * application-defined whether DoGet requests may be retried.
	 */
	expirationTime: Date | undefined;
}

/**
 * A location where a Flight service will accept retrieval of a particular
 * stream given a ticket.
 */
export interface Location {
	uri: string;
}

/**
 * An opaque identifier that the service can use to retrieve a particular
 * portion of a stream.
 *
 * Tickets are meant to be single use. It is an error/application-defined
 * behavior to reuse a ticket.
 */
export interface Ticket {
	ticket: Uint8Array;
}

/** A batch of Arrow data as part of a stream of batches. */
export interface FlightData {
	/**
	 * The descriptor of the data. This is only relevant when a client is
	 * starting a new DoPut stream.
	 */
	flightDescriptor: FlightDescriptor | undefined;
	/** Header for message data as described in Message.fbs::Message. */
	dataHeader: Uint8Array;
	/** Application-defined metadata. */
	appMetadata: Uint8Array;
	/**
	 * The actual batch of Arrow data. Preferably handled with minimal-copies
	 * coming last in the definition to help with sidecar patterns (it is
	 * expected that some implementations will fetch this field off the wire
	 * with specialized code to avoid extra memory copies).
	 */
	dataBody: Uint8Array;
}

/** The response message associated with the submission of a DoPut. */
export interface PutResult {
	appMetadata: Uint8Array;
}

function createBaseHandshakeRequest(): HandshakeRequest {
	return { protocolVersion: 0, payload: new Uint8Array(0) };
}

export const HandshakeRequest = {
	encode(message: HandshakeRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.protocolVersion !== 0) {
			writer.uint32(8).uint64(message.protocolVersion);
		}
		if (message.payload.length !== 0) {
			writer.uint32(18).bytes(message.payload);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): HandshakeRequest {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseHandshakeRequest();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 8) {
						break;
					}

					message.protocolVersion = longToNumber(reader.uint64() as Long);
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.payload = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<HandshakeRequest>): HandshakeRequest {
		return HandshakeRequest.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<HandshakeRequest>): HandshakeRequest {
		const message = createBaseHandshakeRequest();
		message.protocolVersion = object.protocolVersion ?? 0;
		message.payload = object.payload ?? new Uint8Array(0);
		return message;
	},
};

function createBaseHandshakeResponse(): HandshakeResponse {
	return { protocolVersion: 0, payload: new Uint8Array(0) };
}

export const HandshakeResponse = {
	encode(message: HandshakeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.protocolVersion !== 0) {
			writer.uint32(8).uint64(message.protocolVersion);
		}
		if (message.payload.length !== 0) {
			writer.uint32(18).bytes(message.payload);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): HandshakeResponse {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseHandshakeResponse();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 8) {
						break;
					}

					message.protocolVersion = longToNumber(reader.uint64() as Long);
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.payload = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<HandshakeResponse>): HandshakeResponse {
		return HandshakeResponse.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<HandshakeResponse>): HandshakeResponse {
		const message = createBaseHandshakeResponse();
		message.protocolVersion = object.protocolVersion ?? 0;
		message.payload = object.payload ?? new Uint8Array(0);
		return message;
	},
};

function createBaseBasicAuth(): BasicAuth {
	return { username: '', password: '' };
}

export const BasicAuth = {
	encode(message: BasicAuth, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.username !== '') {
			writer.uint32(18).string(message.username);
		}
		if (message.password !== '') {
			writer.uint32(26).string(message.password);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): BasicAuth {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseBasicAuth();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 2:
					if (tag !== 18) {
						break;
					}

					message.username = reader.string();
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.password = reader.string();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<BasicAuth>): BasicAuth {
		return BasicAuth.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<BasicAuth>): BasicAuth {
		const message = createBaseBasicAuth();
		message.username = object.username ?? '';
		message.password = object.password ?? '';
		return message;
	},
};

function createBaseEmpty(): Empty {
	return {};
}

export const Empty = {
	encode(_: Empty, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Empty {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseEmpty();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Empty>): Empty {
		return Empty.fromPartial(base ?? {});
	},
	fromPartial(_: DeepPartial<Empty>): Empty {
		const message = createBaseEmpty();
		return message;
	},
};

function createBaseActionType(): ActionType {
	return { type: '', description: '' };
}

export const ActionType = {
	encode(message: ActionType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.type !== '') {
			writer.uint32(10).string(message.type);
		}
		if (message.description !== '') {
			writer.uint32(18).string(message.description);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): ActionType {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseActionType();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.type = reader.string();
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.description = reader.string();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<ActionType>): ActionType {
		return ActionType.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<ActionType>): ActionType {
		const message = createBaseActionType();
		message.type = object.type ?? '';
		message.description = object.description ?? '';
		return message;
	},
};

function createBaseCriteria(): Criteria {
	return { expression: new Uint8Array(0) };
}

export const Criteria = {
	encode(message: Criteria, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.expression.length !== 0) {
			writer.uint32(10).bytes(message.expression);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Criteria {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseCriteria();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.expression = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Criteria>): Criteria {
		return Criteria.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<Criteria>): Criteria {
		const message = createBaseCriteria();
		message.expression = object.expression ?? new Uint8Array(0);
		return message;
	},
};

function createBaseAction(): Action {
	return { type: '', body: new Uint8Array(0) };
}

export const Action = {
	encode(message: Action, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.type !== '') {
			writer.uint32(10).string(message.type);
		}
		if (message.body.length !== 0) {
			writer.uint32(18).bytes(message.body);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Action {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseAction();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.type = reader.string();
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.body = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Action>): Action {
		return Action.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<Action>): Action {
		const message = createBaseAction();
		message.type = object.type ?? '';
		message.body = object.body ?? new Uint8Array(0);
		return message;
	},
};

function createBaseCancelFlightInfoRequest(): CancelFlightInfoRequest {
	return { info: undefined };
}

export const CancelFlightInfoRequest = {
	encode(message: CancelFlightInfoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.info !== undefined) {
			FlightInfo.encode(message.info, writer.uint32(10).fork()).ldelim();
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): CancelFlightInfoRequest {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseCancelFlightInfoRequest();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.info = FlightInfo.decode(reader, reader.uint32());
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<CancelFlightInfoRequest>): CancelFlightInfoRequest {
		return CancelFlightInfoRequest.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<CancelFlightInfoRequest>): CancelFlightInfoRequest {
		const message = createBaseCancelFlightInfoRequest();
		message.info = object.info !== undefined && object.info !== null ? FlightInfo.fromPartial(object.info) : undefined;
		return message;
	},
};

function createBaseRenewFlightEndpointRequest(): RenewFlightEndpointRequest {
	return { endpoint: undefined };
}

export const RenewFlightEndpointRequest = {
	encode(message: RenewFlightEndpointRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.endpoint !== undefined) {
			FlightEndpoint.encode(message.endpoint, writer.uint32(10).fork()).ldelim();
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): RenewFlightEndpointRequest {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseRenewFlightEndpointRequest();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.endpoint = FlightEndpoint.decode(reader, reader.uint32());
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<RenewFlightEndpointRequest>): RenewFlightEndpointRequest {
		return RenewFlightEndpointRequest.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<RenewFlightEndpointRequest>): RenewFlightEndpointRequest {
		const message = createBaseRenewFlightEndpointRequest();
		message.endpoint =
			object.endpoint !== undefined && object.endpoint !== null
				? FlightEndpoint.fromPartial(object.endpoint)
				: undefined;
		return message;
	},
};

function createBaseResult(): Result {
	return { body: new Uint8Array(0) };
}

export const Result = {
	encode(message: Result, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.body.length !== 0) {
			writer.uint32(10).bytes(message.body);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Result {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseResult();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.body = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Result>): Result {
		return Result.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<Result>): Result {
		const message = createBaseResult();
		message.body = object.body ?? new Uint8Array(0);
		return message;
	},
};

function createBaseCancelFlightInfoResult(): CancelFlightInfoResult {
	return { status: 0 };
}

export const CancelFlightInfoResult = {
	encode(message: CancelFlightInfoResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.status !== 0) {
			writer.uint32(8).int32(message.status);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): CancelFlightInfoResult {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseCancelFlightInfoResult();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 8) {
						break;
					}

					message.status = reader.int32() as any;
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<CancelFlightInfoResult>): CancelFlightInfoResult {
		return CancelFlightInfoResult.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<CancelFlightInfoResult>): CancelFlightInfoResult {
		const message = createBaseCancelFlightInfoResult();
		message.status = object.status ?? 0;
		return message;
	},
};

function createBaseSchemaResult(): SchemaResult {
	return { schema: new Uint8Array(0) };
}

export const SchemaResult = {
	encode(message: SchemaResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.schema.length !== 0) {
			writer.uint32(10).bytes(message.schema);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): SchemaResult {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseSchemaResult();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.schema = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<SchemaResult>): SchemaResult {
		return SchemaResult.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<SchemaResult>): SchemaResult {
		const message = createBaseSchemaResult();
		message.schema = object.schema ?? new Uint8Array(0);
		return message;
	},
};

function createBaseFlightDescriptor(): FlightDescriptor {
	return { type: 0, cmd: new Uint8Array(0), path: [] };
}

export const FlightDescriptor = {
	encode(message: FlightDescriptor, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.type !== 0) {
			writer.uint32(8).int32(message.type);
		}
		if (message.cmd.length !== 0) {
			writer.uint32(18).bytes(message.cmd);
		}
		for (const v of message.path) {
			writer.uint32(26).string(v!);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): FlightDescriptor {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseFlightDescriptor();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 8) {
						break;
					}

					message.type = reader.int32() as any;
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.cmd = reader.bytes();
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.path.push(reader.string());
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<FlightDescriptor>): FlightDescriptor {
		return FlightDescriptor.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<FlightDescriptor>): FlightDescriptor {
		const message = createBaseFlightDescriptor();
		message.type = object.type ?? 0;
		message.cmd = object.cmd ?? new Uint8Array(0);
		message.path = object.path?.map((e) => e) || [];
		return message;
	},
};

function createBaseFlightInfo(): FlightInfo {
	return {
		schema: new Uint8Array(0),
		flightDescriptor: undefined,
		endpoint: [],
		totalRecords: 0,
		totalBytes: 0,
		ordered: false,
	};
}

export const FlightInfo = {
	encode(message: FlightInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.schema.length !== 0) {
			writer.uint32(10).bytes(message.schema);
		}
		if (message.flightDescriptor !== undefined) {
			FlightDescriptor.encode(message.flightDescriptor, writer.uint32(18).fork()).ldelim();
		}
		for (const v of message.endpoint) {
			FlightEndpoint.encode(v!, writer.uint32(26).fork()).ldelim();
		}
		if (message.totalRecords !== 0) {
			writer.uint32(32).int64(message.totalRecords);
		}
		if (message.totalBytes !== 0) {
			writer.uint32(40).int64(message.totalBytes);
		}
		if (message.ordered === true) {
			writer.uint32(48).bool(message.ordered);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): FlightInfo {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseFlightInfo();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.schema = reader.bytes();
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.flightDescriptor = FlightDescriptor.decode(reader, reader.uint32());
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.endpoint.push(FlightEndpoint.decode(reader, reader.uint32()));
					continue;
				case 4:
					if (tag !== 32) {
						break;
					}

					message.totalRecords = longToNumber(reader.int64() as Long);
					continue;
				case 5:
					if (tag !== 40) {
						break;
					}

					message.totalBytes = longToNumber(reader.int64() as Long);
					continue;
				case 6:
					if (tag !== 48) {
						break;
					}

					message.ordered = reader.bool();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<FlightInfo>): FlightInfo {
		return FlightInfo.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<FlightInfo>): FlightInfo {
		const message = createBaseFlightInfo();
		message.schema = object.schema ?? new Uint8Array(0);
		message.flightDescriptor =
			object.flightDescriptor !== undefined && object.flightDescriptor !== null
				? FlightDescriptor.fromPartial(object.flightDescriptor)
				: undefined;
		message.endpoint = object.endpoint?.map((e) => FlightEndpoint.fromPartial(e)) || [];
		message.totalRecords = object.totalRecords ?? 0;
		message.totalBytes = object.totalBytes ?? 0;
		message.ordered = object.ordered ?? false;
		return message;
	},
};

function createBaseFlightEndpoint(): FlightEndpoint {
	return { ticket: undefined, location: [], expirationTime: undefined };
}

export const FlightEndpoint = {
	encode(message: FlightEndpoint, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.ticket !== undefined) {
			Ticket.encode(message.ticket, writer.uint32(10).fork()).ldelim();
		}
		for (const v of message.location) {
			Location.encode(v!, writer.uint32(18).fork()).ldelim();
		}
		if (message.expirationTime !== undefined) {
			Timestamp.encode(toTimestamp(message.expirationTime), writer.uint32(26).fork()).ldelim();
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): FlightEndpoint {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseFlightEndpoint();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.ticket = Ticket.decode(reader, reader.uint32());
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.location.push(Location.decode(reader, reader.uint32()));
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.expirationTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<FlightEndpoint>): FlightEndpoint {
		return FlightEndpoint.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<FlightEndpoint>): FlightEndpoint {
		const message = createBaseFlightEndpoint();
		message.ticket =
			object.ticket !== undefined && object.ticket !== null ? Ticket.fromPartial(object.ticket) : undefined;
		message.location = object.location?.map((e) => Location.fromPartial(e)) || [];
		message.expirationTime = object.expirationTime ?? undefined;
		return message;
	},
};

function createBaseLocation(): Location {
	return { uri: '' };
}

export const Location = {
	encode(message: Location, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.uri !== '') {
			writer.uint32(10).string(message.uri);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Location {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseLocation();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.uri = reader.string();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Location>): Location {
		return Location.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<Location>): Location {
		const message = createBaseLocation();
		message.uri = object.uri ?? '';
		return message;
	},
};

function createBaseTicket(): Ticket {
	return { ticket: new Uint8Array(0) };
}

export const Ticket = {
	encode(message: Ticket, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.ticket.length !== 0) {
			writer.uint32(10).bytes(message.ticket);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): Ticket {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseTicket();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.ticket = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<Ticket>): Ticket {
		return Ticket.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<Ticket>): Ticket {
		const message = createBaseTicket();
		message.ticket = object.ticket ?? new Uint8Array(0);
		return message;
	},
};

function createBaseFlightData(): FlightData {
	return {
		flightDescriptor: undefined,
		dataHeader: new Uint8Array(0),
		appMetadata: new Uint8Array(0),
		dataBody: new Uint8Array(0),
	};
}

export const FlightData = {
	encode(message: FlightData, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.flightDescriptor !== undefined) {
			FlightDescriptor.encode(message.flightDescriptor, writer.uint32(10).fork()).ldelim();
		}
		if (message.dataHeader.length !== 0) {
			writer.uint32(18).bytes(message.dataHeader);
		}
		if (message.appMetadata.length !== 0) {
			writer.uint32(26).bytes(message.appMetadata);
		}
		if (message.dataBody.length !== 0) {
			writer.uint32(8002).bytes(message.dataBody);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): FlightData {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseFlightData();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.flightDescriptor = FlightDescriptor.decode(reader, reader.uint32());
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.dataHeader = reader.bytes();
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.appMetadata = reader.bytes();
					continue;
				case 1000:
					if (tag !== 8002) {
						break;
					}

					message.dataBody = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<FlightData>): FlightData {
		return FlightData.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<FlightData>): FlightData {
		const message = createBaseFlightData();
		message.flightDescriptor =
			object.flightDescriptor !== undefined && object.flightDescriptor !== null
				? FlightDescriptor.fromPartial(object.flightDescriptor)
				: undefined;
		message.dataHeader = object.dataHeader ?? new Uint8Array(0);
		message.appMetadata = object.appMetadata ?? new Uint8Array(0);
		message.dataBody = object.dataBody ?? new Uint8Array(0);
		return message;
	},
};

function createBasePutResult(): PutResult {
	return { appMetadata: new Uint8Array(0) };
}

export const PutResult = {
	encode(message: PutResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.appMetadata.length !== 0) {
			writer.uint32(10).bytes(message.appMetadata);
		}
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): PutResult {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBasePutResult();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.appMetadata = reader.bytes();
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	create(base?: DeepPartial<PutResult>): PutResult {
		return PutResult.fromPartial(base ?? {});
	},
	fromPartial(object: DeepPartial<PutResult>): PutResult {
		const message = createBasePutResult();
		message.appMetadata = object.appMetadata ?? new Uint8Array(0);
		return message;
	},
};

/**
 * A flight service is an endpoint for retrieving or storing Arrow data. A
 * flight service can expose one or more predefined endpoints that can be
 * accessed using the Arrow Flight Protocol. Additionally, a flight service
 * can expose a set of actions that are available.
 */
export type FlightServiceDefinition = typeof FlightServiceDefinition;
export const FlightServiceDefinition = {
	name: 'FlightService',
	fullName: 'arrow.flight.protocol.FlightService',
	methods: {
		/**
		 * Handshake between client and server. Depending on the server, the
		 * handshake may be required to determine the token that should be used for
		 * future operations. Both request and response are streams to allow multiple
		 * round-trips depending on auth mechanism.
		 */
		handshake: {
			name: 'Handshake',
			requestType: HandshakeRequest,
			requestStream: true,
			responseType: HandshakeResponse,
			responseStream: true,
			options: {},
		},
		/**
		 * Get a list of available streams given a particular criteria. Most flight
		 * services will expose one or more streams that are readily available for
		 * retrieval. This api allows listing the streams available for
		 * consumption. A user can also provide a criteria. The criteria can limit
		 * the subset of streams that can be listed via this interface. Each flight
		 * service allows its own definition of how to consume criteria.
		 */
		listFlights: {
			name: 'ListFlights',
			requestType: Criteria,
			requestStream: false,
			responseType: FlightInfo,
			responseStream: true,
			options: {},
		},
		/**
		 * For a given FlightDescriptor, get information about how the flight can be
		 * consumed. This is a useful interface if the consumer of the interface
		 * already can identify the specific flight to consume. This interface can
		 * also allow a consumer to generate a flight stream through a specified
		 * descriptor. For example, a flight descriptor might be something that
		 * includes a SQL statement or a Pickled Python operation that will be
		 * executed. In those cases, the descriptor will not be previously available
		 * within the list of available streams provided by ListFlights but will be
		 * available for consumption for the duration defined by the specific flight
		 * service.
		 */
		getFlightInfo: {
			name: 'GetFlightInfo',
			requestType: FlightDescriptor,
			requestStream: false,
			responseType: FlightInfo,
			responseStream: false,
			options: {},
		},
		/**
		 * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
		 * This is used when a consumer needs the Schema of flight stream. Similar to
		 * GetFlightInfo this interface may generate a new flight that was not previously
		 * available in ListFlights.
		 */
		getSchema: {
			name: 'GetSchema',
			requestType: FlightDescriptor,
			requestStream: false,
			responseType: SchemaResult,
			responseStream: false,
			options: {},
		},
		/**
		 * Retrieve a single stream associated with a particular descriptor
		 * associated with the referenced ticket. A Flight can be composed of one or
		 * more streams where each stream can be retrieved using a separate opaque
		 * ticket that the flight service uses for managing a collection of streams.
		 */
		doGet: {
			name: 'DoGet',
			requestType: Ticket,
			requestStream: false,
			responseType: FlightData,
			responseStream: true,
			options: {},
		},
		/**
		 * Push a stream to the flight service associated with a particular
		 * flight stream. This allows a client of a flight service to upload a stream
		 * of data. Depending on the particular flight service, a client consumer
		 * could be allowed to upload a single stream per descriptor or an unlimited
		 * number. In the latter, the service might implement a 'seal' action that
		 * can be applied to a descriptor once all streams are uploaded.
		 */
		doPut: {
			name: 'DoPut',
			requestType: FlightData,
			requestStream: true,
			responseType: PutResult,
			responseStream: true,
			options: {},
		},
		/**
		 * Open a bidirectional data channel for a given descriptor. This
		 * allows clients to send and receive arbitrary Arrow data and
		 * application-specific metadata in a single logical stream. In
		 * contrast to DoGet/DoPut, this is more suited for clients
		 * offloading computation (rather than storage) to a Flight service.
		 */
		doExchange: {
			name: 'DoExchange',
			requestType: FlightData,
			requestStream: true,
			responseType: FlightData,
			responseStream: true,
			options: {},
		},
		/**
		 * Flight services can support an arbitrary number of simple actions in
		 * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
		 * operations that are potentially available. DoAction allows a flight client
		 * to do a specific action against a flight service. An action includes
		 * opaque request and response objects that are specific to the type action
		 * being undertaken.
		 */
		doAction: {
			name: 'DoAction',
			requestType: Action,
			requestStream: false,
			responseType: Result,
			responseStream: true,
			options: {},
		},
		/**
		 * A flight service exposes all of the available action types that it has
		 * along with descriptions. This allows different flight consumers to
		 * understand the capabilities of the flight service.
		 */
		listActions: {
			name: 'ListActions',
			requestType: Empty,
			requestStream: false,
			responseType: ActionType,
			responseStream: true,
			options: {},
		},
	},
} as const;

export interface FlightServiceImplementation<CallContextExt = {}> {
	/**
	 * Handshake between client and server. Depending on the server, the
	 * handshake may be required to determine the token that should be used for
	 * future operations. Both request and response are streams to allow multiple
	 * round-trips depending on auth mechanism.
	 */
	handshake(
		request: AsyncIterable<HandshakeRequest>,
		context: CallContext & CallContextExt,
	): ServerStreamingMethodResult<DeepPartial<HandshakeResponse>>;
	/**
	 * Get a list of available streams given a particular criteria. Most flight
	 * services will expose one or more streams that are readily available for
	 * retrieval. This api allows listing the streams available for
	 * consumption. A user can also provide a criteria. The criteria can limit
	 * the subset of streams that can be listed via this interface. Each flight
	 * service allows its own definition of how to consume criteria.
	 */
	listFlights(
		request: Criteria,
		context: CallContext & CallContextExt,
	): ServerStreamingMethodResult<DeepPartial<FlightInfo>>;
	/**
	 * For a given FlightDescriptor, get information about how the flight can be
	 * consumed. This is a useful interface if the consumer of the interface
	 * already can identify the specific flight to consume. This interface can
	 * also allow a consumer to generate a flight stream through a specified
	 * descriptor. For example, a flight descriptor might be something that
	 * includes a SQL statement or a Pickled Python operation that will be
	 * executed. In those cases, the descriptor will not be previously available
	 * within the list of available streams provided by ListFlights but will be
	 * available for consumption for the duration defined by the specific flight
	 * service.
	 */
	getFlightInfo(request: FlightDescriptor, context: CallContext & CallContextExt): Promise<DeepPartial<FlightInfo>>;
	/**
	 * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
	 * This is used when a consumer needs the Schema of flight stream. Similar to
	 * GetFlightInfo this interface may generate a new flight that was not previously
	 * available in ListFlights.
	 */
	getSchema(request: FlightDescriptor, context: CallContext & CallContextExt): Promise<DeepPartial<SchemaResult>>;
	/**
	 * Retrieve a single stream associated with a particular descriptor
	 * associated with the referenced ticket. A Flight can be composed of one or
	 * more streams where each stream can be retrieved using a separate opaque
	 * ticket that the flight service uses for managing a collection of streams.
	 */
	doGet(request: Ticket, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<FlightData>>;
	/**
	 * Push a stream to the flight service associated with a particular
	 * flight stream. This allows a client of a flight service to upload a stream
	 * of data. Depending on the particular flight service, a client consumer
	 * could be allowed to upload a single stream per descriptor or an unlimited
	 * number. In the latter, the service might implement a 'seal' action that
	 * can be applied to a descriptor once all streams are uploaded.
	 */
	doPut(
		request: AsyncIterable<FlightData>,
		context: CallContext & CallContextExt,
	): ServerStreamingMethodResult<DeepPartial<PutResult>>;
	/**
	 * Open a bidirectional data channel for a given descriptor. This
	 * allows clients to send and receive arbitrary Arrow data and
	 * application-specific metadata in a single logical stream. In
	 * contrast to DoGet/DoPut, this is more suited for clients
	 * offloading computation (rather than storage) to a Flight service.
	 */
	doExchange(
		request: AsyncIterable<FlightData>,
		context: CallContext & CallContextExt,
	): ServerStreamingMethodResult<DeepPartial<FlightData>>;
	/**
	 * Flight services can support an arbitrary number of simple actions in
	 * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
	 * operations that are potentially available. DoAction allows a flight client
	 * to do a specific action against a flight service. An action includes
	 * opaque request and response objects that are specific to the type action
	 * being undertaken.
	 */
	doAction(request: Action, context: CallContext & CallContextExt): ServerStreamingMethodResult<DeepPartial<Result>>;
	/**
	 * A flight service exposes all of the available action types that it has
	 * along with descriptions. This allows different flight consumers to
	 * understand the capabilities of the flight service.
	 */
	listActions(
		request: Empty,
		context: CallContext & CallContextExt,
	): ServerStreamingMethodResult<DeepPartial<ActionType>>;
}

export interface FlightServiceClient<CallOptionsExt = {}> {
	/**
	 * Handshake between client and server. Depending on the server, the
	 * handshake may be required to determine the token that should be used for
	 * future operations. Both request and response are streams to allow multiple
	 * round-trips depending on auth mechanism.
	 */
	handshake(
		request: AsyncIterable<DeepPartial<HandshakeRequest>>,
		options?: CallOptions & CallOptionsExt,
	): AsyncIterable<HandshakeResponse>;
	/**
	 * Get a list of available streams given a particular criteria. Most flight
	 * services will expose one or more streams that are readily available for
	 * retrieval. This api allows listing the streams available for
	 * consumption. A user can also provide a criteria. The criteria can limit
	 * the subset of streams that can be listed via this interface. Each flight
	 * service allows its own definition of how to consume criteria.
	 */
	listFlights(request: DeepPartial<Criteria>, options?: CallOptions & CallOptionsExt): AsyncIterable<FlightInfo>;
	/**
	 * For a given FlightDescriptor, get information about how the flight can be
	 * consumed. This is a useful interface if the consumer of the interface
	 * already can identify the specific flight to consume. This interface can
	 * also allow a consumer to generate a flight stream through a specified
	 * descriptor. For example, a flight descriptor might be something that
	 * includes a SQL statement or a Pickled Python operation that will be
	 * executed. In those cases, the descriptor will not be previously available
	 * within the list of available streams provided by ListFlights but will be
	 * available for consumption for the duration defined by the specific flight
	 * service.
	 */
	getFlightInfo(request: DeepPartial<FlightDescriptor>, options?: CallOptions & CallOptionsExt): Promise<FlightInfo>;
	/**
	 * For a given FlightDescriptor, get the Schema as described in Schema.fbs::Schema
	 * This is used when a consumer needs the Schema of flight stream. Similar to
	 * GetFlightInfo this interface may generate a new flight that was not previously
	 * available in ListFlights.
	 */
	getSchema(request: DeepPartial<FlightDescriptor>, options?: CallOptions & CallOptionsExt): Promise<SchemaResult>;
	/**
	 * Retrieve a single stream associated with a particular descriptor
	 * associated with the referenced ticket. A Flight can be composed of one or
	 * more streams where each stream can be retrieved using a separate opaque
	 * ticket that the flight service uses for managing a collection of streams.
	 */
	doGet(request: DeepPartial<Ticket>, options?: CallOptions & CallOptionsExt): AsyncIterable<FlightData>;
	/**
	 * Push a stream to the flight service associated with a particular
	 * flight stream. This allows a client of a flight service to upload a stream
	 * of data. Depending on the particular flight service, a client consumer
	 * could be allowed to upload a single stream per descriptor or an unlimited
	 * number. In the latter, the service might implement a 'seal' action that
	 * can be applied to a descriptor once all streams are uploaded.
	 */
	doPut(
		request: AsyncIterable<DeepPartial<FlightData>>,
		options?: CallOptions & CallOptionsExt,
	): AsyncIterable<PutResult>;
	/**
	 * Open a bidirectional data channel for a given descriptor. This
	 * allows clients to send and receive arbitrary Arrow data and
	 * application-specific metadata in a single logical stream. In
	 * contrast to DoGet/DoPut, this is more suited for clients
	 * offloading computation (rather than storage) to a Flight service.
	 */
	doExchange(
		request: AsyncIterable<DeepPartial<FlightData>>,
		options?: CallOptions & CallOptionsExt,
	): AsyncIterable<FlightData>;
	/**
	 * Flight services can support an arbitrary number of simple actions in
	 * addition to the possible ListFlights, GetFlightInfo, DoGet, DoPut
	 * operations that are potentially available. DoAction allows a flight client
	 * to do a specific action against a flight service. An action includes
	 * opaque request and response objects that are specific to the type action
	 * being undertaken.
	 */
	doAction(request: DeepPartial<Action>, options?: CallOptions & CallOptionsExt): AsyncIterable<Result>;
	/**
	 * A flight service exposes all of the available action types that it has
	 * along with descriptions. This allows different flight consumers to
	 * understand the capabilities of the flight service.
	 */
	listActions(request: DeepPartial<Empty>, options?: CallOptions & CallOptionsExt): AsyncIterable<ActionType>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
	? T
	: T extends globalThis.Array<infer U>
	? globalThis.Array<DeepPartial<U>>
	: T extends ReadonlyArray<infer U>
	? ReadonlyArray<DeepPartial<U>>
	: T extends {}
	? { [K in keyof T]?: DeepPartial<T[K]> }
	: Partial<T>;

function toTimestamp(date: Date): Timestamp {
	const seconds = date.getTime() / 1_000;
	const nanos = (date.getTime() % 1_000) * 1_000_000;
	return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
	let millis = (t.seconds || 0) * 1_000;
	millis += (t.nanos || 0) / 1_000_000;
	return new globalThis.Date(millis);
}

function longToNumber(long: Long): number {
	if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
		throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
	}
	return long.toNumber();
}

if (_m0.util.Long !== Long) {
	_m0.util.Long = Long as any;
	_m0.configure();
}

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
