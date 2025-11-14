export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatUploadSpeed = (bytesPerSecond) => {
  if (bytesPerSecond === 0) return "0 KB/s";
  
  const k = 1024;
  const sizes = ["B/s", "KB/s", "MB/s"];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};

export const getFileIcon = (filename) => {
  const extension = getFileExtension(filename);
  
  const iconMap = {
    // Documents
    pdf: "FileText",
    doc: "FileText",
    docx: "FileText",
    txt: "FileText",
    rtf: "FileText",
    
    // Spreadsheets
    xls: "Sheet",
    xlsx: "Sheet",
    csv: "Sheet",
    
    // Presentations
    ppt: "Presentation",
    pptx: "Presentation",
    
    // Images
    jpg: "Image",
    jpeg: "Image",
    png: "Image",
    gif: "Image",
    svg: "Image",
    bmp: "Image",
    webp: "Image",
    
    // Videos
    mp4: "Video",
    avi: "Video",
    mov: "Video",
    wmv: "Video",
    flv: "Video",
    mkv: "Video",
    
    // Audio
    mp3: "Music",
    wav: "Music",
    flac: "Music",
    aac: "Music",
    
    // Archives
    zip: "Archive",
    rar: "Archive",
    "7z": "Archive",
    tar: "Archive",
    gz: "Archive",
    
    // Code
    js: "Code",
    jsx: "Code",
    ts: "Code",
    tsx: "Code",
    html: "Code",
    css: "Code",
    json: "Code",
    xml: "Code",
    
    // Default
    default: "File"
  };
  
  return iconMap[extension] || iconMap.default;
};

export const isImageFile = (filename) => {
  const extension = getFileExtension(filename);
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "svg", "bmp", "webp"];
  return imageExtensions.includes(extension);
};

export const generateThumbnail = (file) => {
  return new Promise((resolve) => {
    if (!isImageFile(file.name)) {
      resolve(null);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Set thumbnail size
        const maxSize = 100;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const validateFileType = (file, allowedTypes = []) => {
  if (allowedTypes.length === 0) return { valid: true };
  
  const extension = getFileExtension(file.name);
  const mimeType = file.type;
  
  const isValidExtension = allowedTypes.some(type => 
    type.startsWith(".") ? type.slice(1).toLowerCase() === extension : false
  );
  
  const isValidMimeType = allowedTypes.some(type => 
    type.includes("/") ? file.type.match(new RegExp(type.replace("*", ".*"))) : false
  );
  
  const valid = isValidExtension || isValidMimeType;
  
  return {
    valid,
    error: valid ? null : `File type "${extension}" is not allowed`
  };
};

export const validateFileSize = (file, maxSizeMB = 100) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const valid = file.size <= maxSizeBytes;
  
  return {
    valid,
    error: valid ? null : `File size exceeds ${maxSizeMB}MB limit`
  };
};

export const generateFileId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateETA = (uploadedBytes, totalBytes, bytesPerSecond) => {
  if (bytesPerSecond === 0 || uploadedBytes === 0) return "Calculating...";
  
  const remainingBytes = totalBytes - uploadedBytes;
  const remainingSeconds = Math.ceil(remainingBytes / bytesPerSecond);
  
  if (remainingSeconds < 60) {
    return `${remainingSeconds}s remaining`;
  } else if (remainingSeconds < 3600) {
    const minutes = Math.ceil(remainingSeconds / 60);
    return `${minutes}m remaining`;
  } else {
    const hours = Math.ceil(remainingSeconds / 3600);
    return `${hours}h remaining`;
  }
};