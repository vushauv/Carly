package pw.react.backend.services.reference;

import pw.react.backend.domain.enums.ReferenceDataType;
import pw.react.backend.dto.response.reference.ReferenceDataDto;

import java.util.List;

public interface ReferenceDataService {
    ReferenceDataDto getReferenceData(List<ReferenceDataType> include);
}
