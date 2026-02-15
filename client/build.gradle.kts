plugins {
    id("application")
    id("org.openjfx.javafxplugin") version "0.1.0"
}

javafx {
    version = "23"
    modules = listOf("javafx.controls", "javafx.fxml", "javafx.web")
}

application {
    mainClass.set("com.sims.client.App")
    // Work around JavaFX WebView Prism RTTexture NPE by forcing software rendering
    applicationDefaultJvmArgs = listOf(
        "--enable-native-access=javafx.graphics,javafx.web",
        "-Djavafx.prism.order=sw",
        "-Dprism.allowhidpi=true"
    )
}

dependencies {
    implementation("io.github.mkpaz:atlantafx-base:2.0.1")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.15.2")
    implementation("org.kordamp.ikonli:ikonli-javafx:12.3.1") // Icons
    implementation("org.kordamp.ikonli:ikonli-material2-pack:12.3.1")
}

repositories {
    mavenCentral()
}

// --- Frontend build & copy into client resources ---
val frontendDir = rootProject.projectDir.resolve("frontend")

tasks.register<Exec>("npmInstallFrontend") {
    workingDir = frontendDir
    commandLine("npm", "ci")
    isIgnoreExitValue = false
}

tasks.register<Exec>("npmBuildFrontend") {
    workingDir = frontendDir
    commandLine("npm", "run", "build")
    dependsOn("npmInstallFrontend")
    isIgnoreExitValue = false
}

tasks.register<Copy>("copyFrontendDistToResources") {
    val distDir = frontendDir.resolve("dist")
    from(distDir)
    into(project.layout.projectDirectory.dir("src/main/resources/web"))
    dependsOn("npmBuildFrontend")
}

tasks.named("processResources") {
    dependsOn("copyFrontendDistToResources")
}

tasks.named("run") {
    dependsOn("copyFrontendDistToResources")
}
