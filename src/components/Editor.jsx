import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark'; // Importa el tema oscuro
import { keymap } from "@codemirror/view";
import { indentMore } from "@codemirror/commands";
import './Editor.css';

const Editor = ({ value, onChange, mode, readOnly, fontSize }) => {
  const editorRef = useRef(null);
  const editorViewRef = useRef(null);

  useEffect(() => {
    // Destroy the current editor instance before creating a new one when mode changes
    if (editorViewRef.current) {
      editorViewRef.current.destroy();
      editorViewRef.current = null;
    }
    if(value) {
    const lines = value.split("\n").length; // Cuenta las líneas actuales
    const missingLines = Math.max(0, 50 - lines); // Calcula cuántas líneas faltan
    value = value + "\n".repeat(missingLines); 
    }
    else{
      value = "\n".repeat(49);
    }
    if (editorRef.current) {
      const startState = EditorState.create({
        doc: value, // Initialize the editor with the current content
        
        extensions: [
          basicSetup,
          python(),
          mode === "dark" ? oneDark : [],
          EditorView.updateListener.of((update) => {
            if (update.changes) {
              onChange(update.state.doc.toString());
            }
          }),
          EditorView.editable.of(!readOnly),
          keymap.of([
            { key: "Tab", run: indentMore } // Intercepts Tab key to indent code
          ])
        ]
      });

      editorViewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current,
      });
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy();
      }
    };
  }, [mode, readOnly]); // Re-create the editor when mode or readOnly changes

  // Handle changes in the "value" prop
  useEffect(() => {
    if (editorViewRef.current) {
      const currentDoc = editorViewRef.current.state.doc.toString();
      if (currentDoc !== value) {
        editorViewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value }
        });
      }
    }
  }, [value]);

  return (
    <div
      className={`editor ${mode}`}
      ref={editorRef}
      style={{ fontSize: `${fontSize ? fontSize : 14}px` }} // Apply dynamic fontSize here
    ></div>
  );
};

export default Editor;
