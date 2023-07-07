//TODO: Need to check if this is proper
export interface Field {
	name: string;
	data_type: DataType;
	nullable: boolean;
	dict_id: number;
	dict_is_ordered: boolean;
	metadata: { [key: string]: string };
}

export type Timestamp = { Timestamp: [TimeUnit, string | null] };
export type Time32 = { Time32: TimeUnit };
export type Time64 = { Time64: TimeUnit };
export type Duration = { Duration: TimeUnit };
export type Interval = { Interval: IntervalUnit };
export type FixedSizeBinary = { FixedSizeBinary: number };
export type List = { List: Field };
export type FixedSizeList = { FixedSizeList: [Field, number] };
export type LargeList = { LargeList: Field };
export type Struct = { Struct: Field };
export type Union = { Union: [Field[], number[], UnionMode] };
export type Dictionary = { Dictionary: [DataType, DataType] };
export type Decimal128 = { Decimal128: [number, number] };
export type Decimal256 = { Decimal256: [number, number] };
export type MAP = { Map: [Field, boolean] };
export type RunEndEncoded = { RunEndEncoded: [Field, Field] };

export type DataType =
	| 'Null'
	| 'Boolean'
	| 'Int8'
	| 'Int16'
	| 'Int32'
	| 'Int64'
	| 'UInt8'
	| 'UInt16'
	| 'UInt32'
	| 'UInt64'
	| 'Float16'
	| 'Float32'
	| 'Float64'
	| 'LargeBinary'
	| 'Utf8'
	| 'LargeUtf8'
	| 'Date32'
	| 'Date64'
	| 'Binary'
	| Timestamp
	| Time32
	| Time64
	| Duration
	| Interval
	| FixedSizeBinary
	| List
	| FixedSizeList
	| LargeList
	| Struct
	| Union
	| Dictionary
	| Decimal128
	| Decimal256
	| MAP
	| RunEndEncoded;

export type TimeUnit = 'Second' | 'Millisecond' | 'Microsecond' | 'Nanosecond';

export type IntervalUnit = 'YearMonth' | 'DayTime' | 'MonthDayNano';

export type UnionMode = 'Sparse' | 'Dense';
