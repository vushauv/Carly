package pw.react.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

@Profile("!batch")
public class NonBatchConfig {

    @Bean
    public CompanyService companyService(CompanyRepository companyRepository) {
        return new CompanyMainService(companyRepository);
    }

}
