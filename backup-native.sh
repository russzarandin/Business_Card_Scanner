echo "Backing up Kotlin files and build.gradle..."

mkdir -p backup-native

cp -r android/app/src/main/java/com/*/frontend/*.kt backup_native/

cp android/app/build.gradle backup_native/build.gradle.backup

echo "Backup complete! Files saved in backup_native/"