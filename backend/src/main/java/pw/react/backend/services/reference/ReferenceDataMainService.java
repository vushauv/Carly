package pw.react.backend.services.reference;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pw.react.backend.domain.booking.Location;
import pw.react.backend.domain.enums.CarFeatureType;
import pw.react.backend.domain.enums.ReferenceDataType;
import pw.react.backend.dto.mapper.booking.LocationMapper;
import pw.react.backend.dto.mapper.reference.ReferenceDataMapper;
import pw.react.backend.dto.models.LookupDictionaryDto;
import pw.react.backend.dto.response.reference.ReferenceDataDto;
import pw.react.backend.repositories.LocationRepository;
import pw.react.backend.repositories.car.CarFeatureRepository;

import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
// No domain here, so I assumed returning DTOs is correct
public class ReferenceDataMainService implements  ReferenceDataService{
    private final LocationRepository locationRepository;
    private final CarFeatureRepository carFeatureRepository;
    private final LocationMapper locationMapper;
    private final ReferenceDataMapper referenceDataMapper;

    @Override
    public ReferenceDataDto getReferenceData(List<ReferenceDataType> include) {
        ReferenceDataDto dto = new ReferenceDataDto();

        List<Location> locations = null;
        if (include.contains(ReferenceDataType.PICKUP_LOCATIONS)) {
            locations = locationRepository.findAll();
            dto.setPickupLocations(locationMapper.toLocationDtoList(locations));
        }

        if (include.contains(ReferenceDataType.RETURN_LOCATIONS)) {
            if(locations == null)
                locations = locationRepository.findAll();
            dto.setReturnLocations(locationMapper.toLocationDtoList(locations));
        }

        if (include.contains(ReferenceDataType.CAR_BRANDS)) {
            var res =  carFeatureRepository.findDistinctBy(CarFeatureType.BRAND.getCode());
            referenceDataMapper.addLookupLink(dto, res);
        }

        if (include.contains(ReferenceDataType.CAR_FUEL_TYPES)) {
            var res = carFeatureRepository.findDistinctBy(CarFeatureType.FUEL_TYPE.getCode());
            referenceDataMapper.addLookupLink(dto, res);
        }

        if (include.contains(ReferenceDataType.CAR_COLORS)) {
            var res = carFeatureRepository.findDistinctBy(CarFeatureType.COLOR.getCode());
            referenceDataMapper.addLookupLink(dto, res);
        }

        if (include.contains(ReferenceDataType.CAR_MODELS)) {
            var res = carFeatureRepository.findDistinctBy(CarFeatureType.MODEL.getCode());
            referenceDataMapper.addLookupLink(dto, res);
        }

        if (include.contains(ReferenceDataType.CAR_STATUSES)) {
            var res = carFeatureRepository.findDistinctBy(CarFeatureType.STATUS.getCode());
            referenceDataMapper.addLookupLink(dto, res);
        }
        var sorted = dto.getReferenceData().stream()
                .sorted(Comparator.comparing(LookupDictionaryDto::getDictionaryId))
                .toList();

        dto.setReferenceData(sorted);
        return dto;
    }
}
