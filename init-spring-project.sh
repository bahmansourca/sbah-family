#!/bin/bash

# Créer la structure du projet
mkdir -p sbah-family-spring/src/main/java/com/sbahfamily/api/{config,controller,model,repository,service,security,dto}
mkdir -p sbah-family-spring/src/main/resources
mkdir -p sbah-family-spring/.mvn/wrapper

# Télécharger le wrapper Maven
cd sbah-family-spring
wget https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.1.0/maven-wrapper-3.1.0.jar -O .mvn/wrapper/maven-wrapper.jar

# Rendre le script mvnw exécutable
chmod +x mvnw

# Initialiser Git
git init
git add .
git commit -m "Initial commit: Spring Boot project structure"

echo "Project initialized successfully!" 