package pw.react.backend.domain.car;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pw.react.backend.domain.Auditable;

@Getter
@Setter
@Entity
@Table(name = "CarImages",
        uniqueConstraints = @UniqueConstraint(
                name="UX_CarImage_CarId_ImageId",
                columnNames={"CarId","ImageId"}
        ))
public class CarImage extends Auditable {
// TODO: think whether we need a separate id as column, or we will use a composite primary key

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CarImageId", nullable = false)
    private Integer carImageId;

    @Column(name = "FileName", nullable = false)
    private String fileName;

    @Column(name = "FileType", nullable = false)
    private String fileType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CarId", nullable = false)
    private Car car;

    // Represents an imageId for a specific car
    @Column(name = "ImageId", nullable = false)
    private Integer imageId;

    @Lob
    private byte[] data;
}
