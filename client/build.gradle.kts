plugins {
    id("application")
    id("org.openjfx.javafxplugin") version "0.1.0"
}

javafx {
    version = "25"
    modules = listOf("javafx.controls", "javafx.fxml")
}

application {
    mainClass.set("com.sims.client.App")
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
