package com.hungtv.toeic.be;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class BeApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeApplication.class, args);
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> containerCustomizer() {
        return factory -> {
            factory.addConnectorCustomizers(connector -> {
                connector.setProperty("relaxedQueryChars", "|{}[]^\"<>\\%");
                connector.setProperty("relaxedPathChars", "|{}[]^\"<>\\%");
                connector.setProperty("allowEncodedSlash", "true");
            });
        };
    }

} 