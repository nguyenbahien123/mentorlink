import React, { useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Viết nội dung...' }) => {
    const [isLoading, setIsLoading] = useState(true);
    const editorRef = useRef(null);

    // mark loaded when TinyMCE editor init fires
    const handleInit = (evt, editor) => {
        editorRef.current = editor;
        // If parent provided initial value, set it explicitly
        if (value) {
            try {
                editor.setContent(value);
            } catch (e) {
                // ignore
            }
        }
        setIsLoading(false);
    };

    // Fallback: force hide spinner after 10s if onInit not called
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.warn('TinyMCE init timeout - forcing render');
                setIsLoading(false);
            }
        }, 10000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // sync external value -> editor
    useEffect(() => {
        const ed = editorRef.current;
        if (!ed) return;
        try {
            const current = ed.getContent({ format: 'html' }) || '';
            if ((value || '') !== current) {
                ed.setContent(value || '');
            }
        } catch (e) {
            // ignore
        }
    }, [value]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            try {
                if (editorRef.current) {
                    editorRef.current.destroy && editorRef.current.destroy();
                    editorRef.current = null;
                }
            } catch (e) {
                // ignore
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className="p-3 text-center border rounded">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Đang tải editor...</span>
            </div>
        );
    }

    return (
        <div className="border rounded" style={{ minHeight: 200 }}>
            <Editor
                initialValue={value || ''}
                onInit={handleInit}
                onEditorChange={(content) => {
                    if (onChange) onChange(content === '<p><br></p>' ? '' : content);
                }}
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                init={{
                    height: 300,
                    menubar: false,
                    placeholder,
                    promotion: false,
                    branding: false,
                    base_url: '/tinymce',
                    suffix: '.min',
                    plugins: 'lists link image code fullscreen table',
                    toolbar:
                        'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor backcolor | link image | code | fullscreen',
                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
            />
        </div>
    );
};

export default RichTextEditor;
