plugins {
    id("java")
}

allprojects {
    group = "com.sims"
    version = "1.0-SNAPSHOT"

    repositories {
        mavenCentral()
    }
    
    tasks.withType<JavaCompile> {
        sourceCompatibility = "21" // User has 25, but 21 is LTS and safe baseline
        targetCompatibility = "21"
    }
}
