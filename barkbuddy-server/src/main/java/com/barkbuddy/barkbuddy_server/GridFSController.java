package com.barkbuddy.barkbuddy_server;

import static org.springframework.data.mongodb.core.query.Criteria.where;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mongodb.client.gridfs.model.GridFSFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class GridFSController {

    private static final Set<String> ALLOWED = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    private final GridFsTemplate gridFsTemplate;

    // ===============================
    // UPLOAD DE IMAGEM
    // ===============================
    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body("Arquivo vazio");
            if (!ALLOWED.contains(file.getContentType())) return ResponseEntity.badRequest().body("Tipo não permitido");

            String original = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : UUID.randomUUID().toString();
            String filename = UUID.randomUUID() + "_" + original;

            gridFsTemplate.store(file.getInputStream(), filename, file.getContentType());

            return ResponseEntity.ok(Map.of(
                    "filename", filename,
                    "message", "Upload realizado com sucesso",
                    "url", "/files/download/" + filename
            ));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao salvar o arquivo");
        }
    }

    // ===============================
    // DOWNLOAD DE IMAGEM COM METADADOS
    // ===============================
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<?> downloadFile(@PathVariable("filename") String filename) {
        try {
            GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(where("filename").is(filename)));
            if (gridFsFile == null) return ResponseEntity.notFound().build();

            GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
            InputStreamResource inputStream = new InputStreamResource(resource.getInputStream());

            String contentType = resource.getContentType() != null ? resource.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + gridFsFile.getFilename() + "\"")
                    .body(inputStream);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao ler o arquivo: " + e.getMessage());
        }
    }
}
