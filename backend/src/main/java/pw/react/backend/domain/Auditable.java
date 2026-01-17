package pw.react.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {

    @CreatedDate
    @Column(name = "CreationTime", nullable = false, updatable = false)
    private LocalDateTime creationTime;

    @LastModifiedDate
    @Column(name = "ModificationTime", nullable = false)
    private LocalDateTime modificationTime;

    @Column(name = "IsEnabled", nullable = false)
    private boolean isEnabled = true;
}
