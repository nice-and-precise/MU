/* tslint:disable */
/* eslint-disable */

export class Point {
  free(): void;
  [Symbol.dispose](): void;
  constructor(x: number, y: number, z: number);
  x: number;
  y: number;
  z: number;
}

export class Projection {
  free(): void;
  [Symbol.dispose](): void;
  constructor(defn: string);
  readonly isGeocentric: boolean;
  readonly isLatlon: boolean;
  readonly isNormalizedAxis: boolean;
  readonly axis: string;
  readonly units: string;
  readonly projName: string;
  readonly to_meter: number;
}

/**
 * Read a binary NTv2 from Dataview.
 *
 * Note: only NTv2 file format are supported.
 */
export function add_nadgrid(key: string, view: DataView): void;

export function get_marking_instructions(coords: Float64Array): string;

export function get_parcel_at_point(lat: number, lon: number): Promise<string>;

export function run_app(): void;

export function set_scenario(id: number): void;

export function transform(src: Projection, dst: Projection, point: Point): void;

export function validate_polygon_compliance(coords: Float64Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_marking_instructions: (a: number, b: number) => [number, number];
  readonly get_parcel_at_point: (a: number, b: number) => any;
  readonly run_app: () => void;
  readonly set_scenario: (a: number) => void;
  readonly validate_polygon_compliance: (a: number, b: number) => [number, number];
  readonly __wbg_get_point_x: (a: number) => number;
  readonly __wbg_get_point_y: (a: number) => number;
  readonly __wbg_get_point_z: (a: number) => number;
  readonly __wbg_point_free: (a: number, b: number) => void;
  readonly __wbg_projection_free: (a: number, b: number) => void;
  readonly __wbg_set_point_x: (a: number, b: number) => void;
  readonly __wbg_set_point_y: (a: number, b: number) => void;
  readonly __wbg_set_point_z: (a: number, b: number) => void;
  readonly point_new: (a: number, b: number, c: number) => number;
  readonly projection_axis: (a: number) => [number, number];
  readonly projection_isGeocentric: (a: number) => number;
  readonly projection_isLatlon: (a: number) => number;
  readonly projection_isNormalizedAxis: (a: number) => number;
  readonly projection_new: (a: number, b: number) => [number, number, number];
  readonly projection_projName: (a: number) => [number, number];
  readonly projection_to_meter: (a: number) => number;
  readonly projection_units: (a: number) => [number, number];
  readonly transform: (a: number, b: number, c: number) => [number, number];
  readonly add_nadgrid: (a: number, b: number, c: any) => [number, number];
  readonly wgpu_render_bundle_draw: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw_indexed: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly wgpu_render_bundle_set_pipeline: (a: number, b: bigint) => void;
  readonly wgpu_render_bundle_draw_indirect: (a: number, b: bigint, c: bigint) => void;
  readonly wgpu_render_bundle_set_bind_group: (a: number, b: number, c: bigint, d: number, e: number) => void;
  readonly wgpu_render_bundle_set_vertex_buffer: (a: number, b: number, c: bigint, d: bigint, e: bigint) => void;
  readonly wgpu_render_bundle_set_push_constants: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly wgpu_render_bundle_draw_indexed_indirect: (a: number, b: bigint, c: bigint) => void;
  readonly wgpu_render_bundle_insert_debug_marker: (a: number, b: number) => void;
  readonly wgpu_render_bundle_pop_debug_group: (a: number) => void;
  readonly wgpu_render_bundle_set_index_buffer: (a: number, b: bigint, c: number, d: bigint, e: bigint) => void;
  readonly wgpu_render_bundle_push_debug_group: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h0a897c1a406c35fe: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen__closure__destroy__h259e1ee9a7647cc2: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h921fb30f99d11690: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h27404d25b2dc82c3: (a: number, b: number) => void;
  readonly wasm_bindgen__closure__destroy__hc531a8ee68b84408: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h9608f08d0b16335b: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen__closure__destroy__h330dcea91c1e6c4b: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h93aff3f20cf6806d: (a: number, b: number, c: any, d: any) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h5564194b6c912d7e: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
