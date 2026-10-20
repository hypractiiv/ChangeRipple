package com.changeripple.parser;

import com.changeripple.common.BadRequestException;
import com.changeripple.component.Component;
import com.changeripple.component.ComponentRepository;
import com.changeripple.component.ComponentRequest;
import com.changeripple.component.ComponentType;
import com.changeripple.component.Criticality;
import com.changeripple.dependency.Dependency;
import com.changeripple.dependency.DependencyRepository;
import com.changeripple.dependency.DependencyRequest;
import com.changeripple.dependency.DependencyType;
import com.changeripple.project.Project;
import com.changeripple.project.ProjectRepository;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JavaSourceParserService {

    private static final Logger log = LoggerFactory.getLogger(JavaSourceParserService.class);

    private final ComponentRepository componentRepository;
    private final DependencyRepository dependencyRepository;
    private final ProjectRepository projectRepository;

    public ParsedProjectPreviewDto parseSourceCode(String fileName, String sourceCode) {
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new BadRequestException("Source code content cannot be empty.");
        }

        if (sourceCode.length() > 500_000) {
            throw new BadRequestException("Source code exceeds maximum permitted size of 500KB.");
        }

        ParsedProjectPreviewDto preview = new ParsedProjectPreviewDto();
        preview.getWarnings().add("Static import analysis does not reflect dynamic reflection, Spring bean injection, or database triggers.");

        try {
            CompilationUnit cu = StaticJavaParser.parse(sourceCode);

            String pkgName = cu.getPackageDeclaration()
                    .map(pd -> pd.getName().asString())
                    .orElse("default");
            preview.setPackageName(pkgName);

            // Extract imports
            List<String> imports = cu.getImports().stream()
                    .map(i -> i.getName().asString())
                    .toList();

            // Extract class and interface declarations
            for (TypeDeclaration<?> type : cu.getTypes()) {
                if (type instanceof ClassOrInterfaceDeclaration cid) {
                    String className = cid.getNameAsString();
                    boolean isInterface = cid.isInterface();
                    ComponentType compType = isInterface ? ComponentType.API : ComponentType.CLASS;

                    ComponentRequest compReq = ComponentRequest.builder()
                            .name(className)
                            .type(compType)
                            .criticality(Criticality.MEDIUM)
                            .description((isInterface ? "Interface: " : "Class: ") + pkgName + "." + className)
                            .sourcePath(fileName != null ? fileName : pkgName.replace('.', '/') + "/" + className + ".java")
                            .build();

                    preview.getDetectedComponents().add(compReq);

                    // Map imports that match simple class names
                    for (String imp : imports) {
                        String importedSimpleName = imp.substring(imp.lastIndexOf('.') + 1);
                        if (!importedSimpleName.equals(className)) {
                            preview.getDetectedDependencies().add(DependencyRequest.builder()
                                    .sourceComponentId(className) // placeholder for preview
                                    .targetComponentId(importedSimpleName)
                                    .dependencyType(DependencyType.RUNTIME)
                                    .description("Static import: " + imp)
                                    .build());
                        }
                    }
                }
            }

        } catch (Exception ex) {
            log.warn("JavaParser parsing error: {}", ex.getMessage());
            throw new BadRequestException("Failed to parse Java source syntax: " + ex.getMessage());
        }

        return preview;
    }

    @Transactional
    public Map<String, Object> applyImport(String projectId, ParsedProjectPreviewDto preview) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BadRequestException("Project not found: " + projectId));

        Map<String, Component> createdOrExisting = new HashMap<>();
        int componentsImported = 0;
        int dependenciesImported = 0;

        // 1. Create components if they don't already exist
        for (ComponentRequest cr : preview.getDetectedComponents()) {
            Optional<Component> existing = componentRepository.findAllByProjectId(projectId).stream()
                    .filter(c -> c.getName().equalsIgnoreCase(cr.getName()))
                    .findFirst();

            if (existing.isPresent()) {
                createdOrExisting.put(cr.getName(), existing.get());
            } else {
                Component c = Component.builder()
                        .project(project)
                        .name(cr.getName())
                        .type(cr.getType())
                        .criticality(cr.getCriticality())
                        .description(cr.getDescription())
                        .sourcePath(cr.getSourcePath())
                        .build();
                c = componentRepository.save(c);
                createdOrExisting.put(c.getName(), c);
                componentsImported++;
            }
        }

        // 2. Create dependencies between matched components
        for (DependencyRequest dr : preview.getDetectedDependencies()) {
            Component source = createdOrExisting.get(dr.getSourceComponentId());
            Component target = createdOrExisting.get(dr.getTargetComponentId());

            if (source != null && target != null && !source.getId().equals(target.getId())) {
                if (!dependencyRepository.existsByProjectIdAndSourceComponentIdAndTargetComponentIdAndDependencyType(
                        projectId, source.getId(), target.getId(), dr.getDependencyType())) {
                    Dependency d = Dependency.builder()
                            .project(project)
                            .sourceComponent(source)
                            .targetComponent(target)
                            .dependencyType(dr.getDependencyType())
                            .description(dr.getDescription())
                            .build();
                    dependencyRepository.save(d);
                    dependenciesImported++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("componentsImported", componentsImported);
        result.put("dependenciesImported", dependenciesImported);
        return result;
    }
}
