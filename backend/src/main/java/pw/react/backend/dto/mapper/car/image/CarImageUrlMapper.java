package pw.react.backend.dto.mapper.car.image;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pw.react.backend.controller.path.PathResolver;


@Component
public class CarImageUrlMapper {
    public String mapUrl(Integer carId, Integer imageId)
    {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(PathResolver.Car.Base + "/" + carId + PathResolver.Car.Images + "/" + imageId)
                .toUriString();
    }
}
