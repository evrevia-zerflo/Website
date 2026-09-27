import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, RemoveFormatting } from 'lucide-react';

export default function RichTextEditor({ value, onChange, label = "Description" }) {
  const editorRef = useRef(null);

  // Initialize value only once on mount to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && value !== undefined) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const ToolbarButton = ({ icon: Icon, command, arg = null, title }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        execCommand(command, arg);
      }}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--text-main)',
        cursor: 'pointer',
        padding: '6px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      
      <div style={{ 
        border: '1px solid var(--border-subtle)', 
        borderRadius: 'var(--radius-md)', 
        overflow: 'hidden',
        background: '#FFF'
      }}>
        {/* Toolbar */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          padding: '8px', 
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)'
        }}>
          <ToolbarButton icon={Bold} command="bold" title="Bold" />
          <ToolbarButton icon={Italic} command="italic" title="Italic" />
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <ToolbarButton icon={Heading1} command="formatBlock" arg="H3" title="Heading 1" />
          <ToolbarButton icon={Heading2} command="formatBlock" arg="H4" title="Heading 2" />
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
          <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <ToolbarButton icon={RemoveFormatting} command="removeFormat" title="Clear Formatting" />
        </div>
        
        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{
            padding: '1rem',
            minHeight: '200px',
            outline: 'none',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            overflowY: 'auto',
            maxHeight: '500px'
          }}
        />
      </div>
    </div>
  );
}
