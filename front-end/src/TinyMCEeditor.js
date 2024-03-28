import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor = () => {
  const [content, setContent] = useState('');

  const handleEditorChange = (content, editor) => {
    setContent(content);
  };

  return (
    <Editor
      apiKey="YOUR_API_KEY"
      initialValue={content}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar:
          'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help'
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default TinyMCEEditor;
