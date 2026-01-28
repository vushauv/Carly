package pw.react.backend.dto.mapper.car;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.car.CarImage;
import pw.react.backend.dto.response.car.CarImageResponseDto;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CarImageMapper {
    // OUT mappings:
    @Mapping(target = "fileUri", source = "fileName")
    CarImageResponseDto toCarImageResponseDto(CarImage image);

    List<CarImageResponseDto> toCarImageResponseDtoList(List<CarImage> images);
}
