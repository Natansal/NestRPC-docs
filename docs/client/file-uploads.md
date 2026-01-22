---
title: File Uploads
description: Upload files from the client with full type safety. Single and multiple file support.
---

# 📤 Client File Uploads

NestRPC client has **built-in support** for file uploads. No FormData handling needed! Just pass files in the second parameter.

## 🎯 Single File Upload

Upload a single file by passing `{ file: File }` as the second parameter:

```typescript
import { rpc } from './rpc-client';

// Get file from input
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

// Upload single file
const { data } = await rpc.files.uploadFile(
  { description: 'My avatar' },
  { file: fileInput.files[0] }
);

console.log(data); // { success: true, filename: '...', size: ... }
```

### React Example

```typescript
import { useState } from 'react';
import { rpc } from './rpc-client';

function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { data } = await rpc.files.uploadFile(
        { description: description || undefined },
        { file }
      );
      
      console.log('Uploaded:', data);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

## 📚 Multiple File Upload

Upload multiple files by passing `{ files: File[] }` as the second parameter:

```typescript
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');

// Upload multiple files
const { data } = await rpc.files.uploadFiles(
  { category: 'documents' },
  { files: Array.from(fileInput.files || []) }
);

console.log(data); // { success: true, files: [...], count: 3 }
```

### React Example

```typescript
import { useState } from 'react';
import { rpc } from './rpc-client';

function MultipleFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const { data } = await rpc.files.uploadFiles(
        { category: category || undefined },
        { files }
      );
      
      console.log('Uploaded:', data);
      alert(`Successfully uploaded ${data.count} file(s)!`);
      setFiles([]);
      setCategory('');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))} 
      />
      <input
        type="text"
        placeholder="Category (optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <button onClick={handleUpload} disabled={files.length === 0 || uploading}>
        {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
      </button>
    </div>
  );
}
```

## 🎨 Vue 3 Example

```vue
<template>
  <div>
    <input 
      type="file" 
      @change="handleFileChange"
      :multiple="multiple"
    />
    <input
      v-if="!multiple"
      v-model="description"
      placeholder="Description (optional)"
    />
    <input
      v-if="multiple"
      v-model="category"
      placeholder="Category (optional)"
    />
    <button @click="handleUpload" :disabled="!canUpload || uploading">
      {{ uploading ? 'Uploading...' : uploadButtonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { rpc } from './rpc-client';

const props = defineProps<{ multiple?: boolean }>();

const file = ref<File | null>(null);
const files = ref<File[]>([]);
const description = ref('');
const category = ref('');
const uploading = ref(false);

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (props.multiple) {
    files.value = Array.from(target.files || []);
  } else {
    file.value = target.files?.[0] || null;
  }
};

const canUpload = computed(() => {
  return props.multiple ? files.value.length > 0 : file.value !== null;
});

const uploadButtonText = computed(() => {
  if (props.multiple) {
    return `Upload ${files.value.length} File(s)`;
  }
  return 'Upload';
});

const handleUpload = async () => {
  if (props.multiple) {
    if (files.value.length === 0) return;
    uploading.value = true;
    try {
      const { data } = await rpc.files.uploadFiles(
        { category: category.value || undefined },
        { files: files.value }
      );
      console.log('Uploaded:', data);
      files.value = [];
      category.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      uploading.value = false;
    }
  } else {
    if (!file.value) return;
    uploading.value = true;
    try {
      const { data } = await rpc.files.uploadFile(
        { description: description.value || undefined },
        { file: file.value }
      );
      console.log('Uploaded:', data);
      file.value = null;
      description.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      uploading.value = false;
    }
  }
};
</script>
```

## 🔧 Advanced Usage

### With Progress Tracking

```typescript
import { rpc } from './rpc-client';

async function uploadWithProgress(file: File, onProgress: (progress: number) => void) {
  // Note: Axios progress tracking would need to be configured
  // This is a conceptual example
  const { data } = await rpc.files.uploadFile(
    { description: 'Upload with progress' },
    { file }
  );
  return data;
}

// Usage
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
await uploadWithProgress(fileInput.files[0], (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### Error Handling

```typescript
import { rpc } from './rpc-client';
import { AxiosError } from 'axios';

async function uploadFileSafely(file: File) {
  try {
    const { data } = await rpc.files.uploadFile(
      { description: 'Safe upload' },
      { file }
    );
    return { success: true, data };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 413) {
        return { success: false, error: 'File too large' };
      }
      if (error.response?.status === 400) {
        return { success: false, error: error.response.data.message || 'Invalid file' };
      }
    }
    return { success: false, error: 'Upload failed' };
  }
}
```

### File Validation Before Upload

```typescript
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed' };
  }

  return { valid: true };
}

async function uploadValidatedFile(file: File) {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { data } = await rpc.files.uploadFile(
    { description: 'Validated file' },
    { file }
  );
  return data;
}
```

## 🎯 Best Practices

1. **Validate files client-side** - Check size and type before uploading
2. **Show upload progress** - Provide user feedback during uploads
3. **Handle errors gracefully** - Display meaningful error messages
4. **Disable upload button** - Prevent multiple simultaneous uploads
5. **Clear form after success** - Reset file inputs after successful upload

## 📚 Related Documentation

- [Server File Uploads](/docs/server/file-uploads) - Server-side file handling
- [Client Configuration](/docs/client/configuration) - Client configuration options
- [Error Handling](/docs/client/error-handling) - Error handling patterns
