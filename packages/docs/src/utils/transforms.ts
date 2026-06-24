/**
 * Generic editor transform/query helpers used by the toolbar and exposed for
 * consumers building custom UI. They wrap Plate's editor API so callers don't
 * depend on Slate internals directly.
 */
import type { PlateEditor } from 'platejs/react';

import type { DocElementType, DocMarkType, TElement } from '../types';

/** Whether a text mark is currently active at the selection. */
export function isMarkActive(editor: PlateEditor, key: DocMarkType): boolean {
  const marks = editor.api.marks();
  return marks ? marks[key] === true : false;
}

/** Toggle a text mark (bold, italic, …) at the selection. */
export function toggleMark(editor: PlateEditor, key: DocMarkType): void {
  editor.tf.toggleMark(key);
}

/** The type of the block currently containing the selection, if any. */
export function currentBlockType(editor: PlateEditor): string | undefined {
  const entry = editor.api.block<TElement>();
  return entry?.[0].type;
}

/** Whether the current block is of the given type. */
export function isBlockType(editor: PlateEditor, type: DocElementType): boolean {
  return currentBlockType(editor) === type;
}

/**
 * Set the type of the block at the selection (paragraph ⇄ heading ⇄
 * blockquote). Toggles back to paragraph when the block is already `type`.
 */
export function setBlockType(
  editor: PlateEditor,
  type: DocElementType,
  paragraphType: DocElementType = 'p' as DocElementType,
): void {
  const entry = editor.api.block<TElement>();
  if (!entry) return;
  const nextType = entry[0].type === type ? paragraphType : type;
  editor.tf.setNodes({ type: nextType }, { at: entry[1] });
}

/** Insert a block node at the selection and move the cursor into it. */
export function insertBlock(editor: PlateEditor, node: TElement): void {
  editor.tf.insertNodes(node, { select: true });
}
