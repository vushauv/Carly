package pw.react.backend.utils.files.bootstrap;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Objects;

public class MockMultipartFile implements MultipartFile {
    private final String name;          // form field name (e.g. "file")
    private final String originalName;  // filename
    private final String contentType;
    private final byte[] content;

    public MockMultipartFile (String name, String originalName, String contentType, byte[] content) {
        this.name = Objects.requireNonNullElse(name, "file");
        this.originalName = Objects.requireNonNullElse(originalName, "file.bin");
        this.contentType = contentType; // may be null
        this.content = content != null ? content : new byte[0];
    }

    @Override public String getName() { return name; }

    @Override public String getOriginalFilename() { return originalName; }

    @Override public String getContentType() { return contentType; }

    @Override public boolean isEmpty() { return content.length == 0; }

    @Override public long getSize() { return content.length; }

    @Override public byte[] getBytes() { return content; }

    @Override public InputStream getInputStream() { return new ByteArrayInputStream(content); }

    @Override
    public void transferTo(File dest) throws IOException {
        try (OutputStream out = new BufferedOutputStream(new FileOutputStream(dest))) {
            out.write(content);
        }
    }
}
