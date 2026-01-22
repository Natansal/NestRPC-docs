---
title: File Uploads
description: Upload single or multiple files with built-in support. No custom middleware needed.
---

# 📤 File Uploads

NestRPC has **built-in support** for file uploads. No custom middleware needed! Just use the `file` option in the `@Route()` decorator.

## 🎯 Single File Upload

Upload a single file with `@Route({ file: 'single' })`:

```typescript
import { Router, Route } from '@nestjs-rpc/server';

@Router()
export class FilesRouter {
  @Route({ file: 'single' })
  uploadFile(
    { description }: { description?: string },
    file?: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    return {
      success: true,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      description: description || 'No description',
    };
  }
}
```

**Method signature:**
- **First parameter (index 0)**: Reserved for the **incoming request body** (can be empty `{}`). This is automatically injected.
- **Second parameter (index 1)**: Reserved for the **file** (`file?: Express.Multer.File`) when `file: 'single'` is configured. Optional, but should be checked.
- **Subsequent parameters**: Can use NestJS parameter decorators (`@Req()`, `@Res()`, etc.)

## 📚 Multiple File Upload

Upload multiple files with `@Route({ file: 'multiple' })`:

```typescript
@Router()
export class FilesRouter {
  @Route({ file: 'multiple' })
  uploadFiles(
    { category }: { category?: string },
    files?: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    return {
      success: true,
      files: files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype,
      })),
      count: files.length,
      category: category || 'uncategorized',
    };
  }
}
```

**Method signature:**
- **First parameter (index 0)**: Reserved for the **incoming request body** (can be empty `{}`). This is automatically injected.
- **Second parameter (index 1)**: Reserved for the **files array** (`files?: Express.Multer.File[]`) when `file: 'multiple'` is configured. Optional, but should be checked.
- **Subsequent parameters**: Can use NestJS parameter decorators (`@Req()`, `@Res()`, etc.)

## ⚙️ Advanced File Options

For more control, use an object configuration:

```typescript
@Route({
  file: {
    mode: 'single',
    options: {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        // Only allow images
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only images are allowed'), false);
        }
      },
    },
  },
})
async uploadWithLimits(
  { userId }: { userId: string },
  file?: Express.Multer.File
) {
  // Handle file with custom limits
  return { userId, filename: file?.originalname, size: file?.size };
}
```

### Configuration Options

```typescript
@Route({
  file: {
    mode: 'single' | 'multiple',
    options?: MulterOptions, // See multer documentation
    maxCount?: number, // For 'multiple' mode, max number of files
  },
})
```

**Available options:**
- `limits` - File size limits, field limits, etc.
- `fileFilter` - Custom file filter function
- `storage` - Custom storage engine
- `dest` - Destination directory (if using disk storage)
- And all other [Multer options](https://github.com/expressjs/multer#api)

## 📝 Complete Example

Here's a complete example with file management:

```typescript
import { Router, Route } from '@nestjs-rpc/server';

type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  description?: string;
  category?: string;
};

@Router()
export class FilesRouter {
  private uploadedFiles: Map<string, FileMetadata> = new Map();
  private fileIdCounter = 1;

  @Route({ file: 'single' })
  uploadFile(
    { description }: { description?: string },
    file?: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileId = String(this.fileIdCounter++);
    const fileInfo: FileMetadata = {
      id: fileId,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      description: description || 'No description',
      uploadedAt: new Date(),
    };

    this.uploadedFiles.set(fileId, fileInfo);

    return {
      success: true,
      file: fileInfo,
      message: `File "${file.originalname}" uploaded successfully`,
    };
  }

  @Route({ file: 'multiple' })
  uploadFiles(
    { category }: { category?: string },
    files?: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploaded = files.map((file) => {
      const fileId = String(this.fileIdCounter++);
      const fileInfo: FileMetadata = {
        id: fileId,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        category: category || 'uncategorized',
        uploadedAt: new Date(),
      };
      this.uploadedFiles.set(fileId, fileInfo);
      return fileInfo;
    });

    return {
      success: true,
      files: uploaded,
      count: uploaded.length,
      category: category || 'uncategorized',
      message: `Successfully uploaded ${uploaded.length} file(s)`,
    };
  }

  @Route()
  listFiles() {
    return Array.from(this.uploadedFiles.values());
  }

  @Route()
  getFile({ id }: { id: string }) {
    const file = this.uploadedFiles.get(id);
    if (!file) {
      return null;
    }
    return file;
  }

  @Route()
  deleteFile({ id }: { id: string }) {
    return this.uploadedFiles.delete(id);
  }
}
```

## 🔒 File Validation

Always validate files in your route handlers:

```typescript
@Route({ file: 'single' })
uploadFile(
  { userId }: { userId: string },
  file?: Express.Multer.File
) {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  // Validate file size
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new BadRequestException('File size exceeds 5MB limit');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF are allowed');
  }

  // Process file...
  return { success: true, filename: file.originalname };
}
```

## 💾 File Storage

### In-Memory Storage (Default)

By default, files are stored in memory. Access them via `file.buffer`:

```typescript
@Route({ file: 'single' })
uploadFile({}, file?: Express.Multer.File) {
  if (!file) throw new Error('No file');
  
  // Access file buffer
  const buffer = file.buffer;
  
  // Save to database, cloud storage, etc.
  return { success: true };
}
```

### Disk Storage

To save files to disk, configure Multer options:

```typescript
import * as multer from 'multer';
import * as path from 'path';

@Route({
  file: {
    mode: 'single',
    options: {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads');
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
    },
  },
})
uploadFile({}, file?: Express.Multer.File) {
  // File is saved to disk at './uploads'
  return { success: true, filename: file?.filename };
}
```

## 🎯 Best Practices

1. **Always validate files** - Check size, type, and presence
2. **Use appropriate error handling** - Throw NestJS exceptions
3. **Consider file size limits** - Set reasonable limits in options
4. **Sanitize filenames** - Prevent path traversal attacks
5. **Use cloud storage for production** - Don't store files on the server filesystem

## 📚 Related Documentation

- [Client File Uploads](/docs/client/file-uploads) - How to upload files from the client
- [Routers and Routes](/docs/server/routers-and-routes) - General route configuration
- [Error Handling](/docs/server/error-handling) - Error handling patterns
