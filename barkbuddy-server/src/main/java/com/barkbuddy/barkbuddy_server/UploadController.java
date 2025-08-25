package com.barkbuddy.barkbuddy_server;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/upload")
public class UploadController {

  private static final Set<String> ALLOWED = Set.of(
      MediaType.IMAGE_JPEG_VALUE,
      MediaType.IMAGE_PNG_VALUE,
      "image/webp"
  );

  @Value("${barkbuddy.storage-dir}")
  private String storageDir;

  @Value("${barkbuddy.subdir}")
  private String subdir;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public Map<String, String> upload(@RequestParam("file") MultipartFile file,
                                    HttpServletRequest req) throws IOException {
    if (file.isEmpty()) throw new IllegalArgumentException("Arquivo vazio");
    String ct = file.getContentType();
    if (ct == null || !ALLOWED.contains(ct)) throw new IllegalArgumentException("Tipo não permitido");

    // tenta usar extensão do nome original; se não tiver, deduz pelo content-type
    String ext = null;
    String original = file.getOriginalFilename();
    if (StringUtils.hasText(original)) {
      int dot = original.lastIndexOf('.');
      if (dot >= 0 && dot < original.length() - 1) {
        ext = original.substring(dot + 1).toLowerCase();
      }
    }
    if (!StringUtils.hasText(ext)) {
      ext = switch (ct) {
        case MediaType.IMAGE_PNG_VALUE -> "png";
        case "image/webp" -> "webp";
        default -> "jpg";
      };
    }

    String filename = UUID.randomUUID() + "_" + Instant.now().toEpochMilli() + "." + ext;

    // uploads/pets/<filename>
    Path root = Paths.get(storageDir).toAbsolutePath().normalize();
    Path destDir = root.resolve(subdir).normalize();
    Files.createDirectories(destDir);
    Path dest = destDir.resolve(filename).normalize();
    file.transferTo(dest.toFile());

    // monta URL pública baseada no host/porta acessados
    String base = req.getScheme() + "://" + req.getServerName() + ":" + req.getServerPort();
    String path = "/files/" + subdir + "/" + filename;
    String publicUrl = base + path;

    return Map.of("publicUrl", publicUrl, "path", path, "filename", filename);
  }

  @GetMapping("/health")
  public Map<String, String> health() {
    return Map.of("status", "ok");
  }
}
