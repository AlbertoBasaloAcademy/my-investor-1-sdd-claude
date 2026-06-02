package dev.aiddbot.abjavareact;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AbJavaReactApplication {

  public static void main(String[] args) {
    ensureDataDirectory();
    SpringApplication.run(AbJavaReactApplication.class, args);
  }

  private static void ensureDataDirectory() {
    try {
      Files.createDirectories(Path.of("data"));
    } catch (IOException ex) {
      throw new UncheckedIOException("Unable to provision the SQLite data directory", ex);
    }
  }
}
